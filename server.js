import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import robotsParser from 'robots-parser';
import * as store from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4317);
const HOST = String(process.env.HOST || '0.0.0.0');
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const AI_TRAINING_MODEL = process.env.OPENAI_TRAINING_MODEL || 'gpt-5.4-mini';
const SEARCH_MODEL = process.env.OPENAI_SEARCH_MODEL || 'gpt-5.5';
const USER_AGENT =
  process.env.PARSER_USER_AGENT || 'AuraParser/1.0 local lead audit tool';
const ADMIN_LOGIN = String(process.env.ADMIN_LOGIN || 'admin');
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'Parol159');
const RESPECT_ROBOTS = String(process.env.RESPECT_ROBOTS_TXT || 'true') !== 'false';
const MAX_ITEMS = Number(process.env.MAX_ITEMS_PER_RUN || 100);
const MAX_DISCOVERY_ITEMS = Number(process.env.MAX_DISCOVERY_ITEMS || 150);
const MAX_HTML_BYTES = 900_000;
const FETCH_TIMEOUT_MS = 12_000;
const GOOGLE_PLACES_TIMEOUT_MS = 8_000;
const CROSS_VERIFY_TIMEOUT_MS = Number(process.env.CROSS_VERIFY_TIMEOUT_MS || 25_000);
const MAX_EXTRA_PAGES = 5;

// DuckDuckGo HTML search starts returning an "anomaly detected" interstitial
// (HTTP 202, no .result nodes, contains an img-form/captcha shell) after a
// handful of requests fired in quick succession from the same IP. That page
// is technically a 2xx response, so it used to slip through silently and the
// discovery run would just lose those results with no warning at all. We
// throttle DuckDuckGo calls proactively and back off reactively if a block
// slips through anyway, falling back to Bing for the rest of the run.
const DDG_MAX_REQUESTS_PER_WINDOW = 5;
const DDG_WINDOW_MS = 60_000;
const DDG_BLOCK_COOLDOWN_MS = 90_000;
let ddgRequestTimestamps = [];
let ddgBlockedUntil = 0;

function canUseDuckDuckGo() {
  const now = Date.now();
  if (now < ddgBlockedUntil) return false;
  ddgRequestTimestamps = ddgRequestTimestamps.filter((ts) => now - ts < DDG_WINDOW_MS);
  if (ddgRequestTimestamps.length >= DDG_MAX_REQUESTS_PER_WINDOW) return false;
  ddgRequestTimestamps.push(now);
  return true;
}

function registerDuckDuckGoBlock() {
  ddgBlockedUntil = Date.now() + DDG_BLOCK_COOLDOWN_MS;
}

function isDuckDuckGoBlockedHtml(html) {
  return typeof html === 'string' && html.includes('id="img-form"') && !html.includes('result__a');
}

const DEFAULT_WARSAW_DISTRICTS = [

  'Mokotow',
  'Wola',
  'Ursynow',
  'Srodmiescie',
  'Praga Poludnie',
  'Ochota',
  'Bemowo',
  'Bielany',
  'Wilanow',
  'Bialoleka'
];

// Known city presets so Google Places (New) Text Search can bias results with a
// location circle (lat/lng + radius) instead of relying purely on free text.
// Any other city name still works (Text Search interprets plain text fine), it
// just won't get a location bias/radius applied.
const CITY_PRESETS = {
  warszawa: { label: 'Warszawa', lat: 52.2297, lng: 21.0122, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  warsaw: { label: 'Warszawa', lat: 52.2297, lng: 21.0122, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  krakow: { label: 'Kraków', lat: 50.0647, lng: 19.945, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  'krakow,polska': { label: 'Kraków', lat: 50.0647, lng: 19.945, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  wroclaw: { label: 'Wrocław', lat: 51.1079, lng: 17.0385, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  gdansk: { label: 'Gdańsk', lat: 54.352, lng: 18.6466, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  poznan: { label: 'Poznań', lat: 52.4064, lng: 16.9252, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
  kyiv: { label: 'Kyiv', lat: 50.4501, lng: 30.5234, country: 'Ukraine', regionCode: 'UA', languageCode: 'uk' },
  kiev: { label: 'Kyiv', lat: 50.4501, lng: 30.5234, country: 'Ukraine', regionCode: 'UA', languageCode: 'uk' },
  dnipro: { label: 'Dnipro', lat: 48.4647, lng: 35.0462, country: 'Ukraine', regionCode: 'UA', languageCode: 'uk' }
};

const COUNTRY_PRESETS = {
  polska: { regionCode: 'PL', languageCode: 'pl', label: 'Polska' },
  poland: { regionCode: 'PL', languageCode: 'pl', label: 'Polska' },
  ukraine: { regionCode: 'UA', languageCode: 'uk', label: 'Ukraine' },
  ukraina: { regionCode: 'UA', languageCode: 'uk', label: 'Ukraine' },
  'украина': { regionCode: 'UA', languageCode: 'uk', label: 'Ukraine' },
  'україна': { regionCode: 'UA', languageCode: 'uk', label: 'Ukraine' }
};

const LOCATION_SUGGESTIONS = [
  { cityName: 'Warszawa', countryName: 'Polska', countryCode: 'PL', region: 'Mazowieckie', latitude: 52.2297, longitude: 21.0122 },
  { cityName: 'Kraków', countryName: 'Polska', countryCode: 'PL', region: 'Małopolskie', latitude: 50.0647, longitude: 19.945 },
  { cityName: 'Łódź', countryName: 'Polska', countryCode: 'PL', region: 'Łódzkie', latitude: 51.7592, longitude: 19.456 },
  { cityName: 'Wrocław', countryName: 'Polska', countryCode: 'PL', region: 'Dolnośląskie', latitude: 51.1079, longitude: 17.0385 },
  { cityName: 'Poznań', countryName: 'Polska', countryCode: 'PL', region: 'Wielkopolskie', latitude: 52.4064, longitude: 16.9252 },
  { cityName: 'Gdańsk', countryName: 'Polska', countryCode: 'PL', region: 'Pomorskie', latitude: 54.352, longitude: 18.6466 },
  { cityName: 'Gdynia', countryName: 'Polska', countryCode: 'PL', region: 'Pomorskie', latitude: 54.5189, longitude: 18.5305 },
  { cityName: 'Sopot', countryName: 'Polska', countryCode: 'PL', region: 'Pomorskie', latitude: 54.4416, longitude: 18.5601 },
  { cityName: 'Szczecin', countryName: 'Polska', countryCode: 'PL', region: 'Zachodniopomorskie', latitude: 53.4285, longitude: 14.5528 },
  { cityName: 'Bydgoszcz', countryName: 'Polska', countryCode: 'PL', region: 'Kujawsko-pomorskie', latitude: 53.1235, longitude: 18.0084 },
  { cityName: 'Lublin', countryName: 'Polska', countryCode: 'PL', region: 'Lubelskie', latitude: 51.2465, longitude: 22.5684 },
  { cityName: 'Katowice', countryName: 'Polska', countryCode: 'PL', region: 'Śląskie', latitude: 50.2649, longitude: 19.0238 },
  { cityName: 'Białystok', countryName: 'Polska', countryCode: 'PL', region: 'Podlaskie', latitude: 53.1325, longitude: 23.1688 },
  { cityName: 'Rzeszów', countryName: 'Polska', countryCode: 'PL', region: 'Podkarpackie', latitude: 50.0412, longitude: 21.9991 },
  { cityName: 'Toruń', countryName: 'Polska', countryCode: 'PL', region: 'Kujawsko-pomorskie', latitude: 53.0138, longitude: 18.5984 },
  { cityName: 'Kielce', countryName: 'Polska', countryCode: 'PL', region: 'Świętokrzyskie', latitude: 50.8661, longitude: 20.6286 },
  { cityName: 'Gliwice', countryName: 'Polska', countryCode: 'PL', region: 'Śląskie', latitude: 50.2945, longitude: 18.6714 },
  { cityName: 'Zabrze', countryName: 'Polska', countryCode: 'PL', region: 'Śląskie', latitude: 50.3249, longitude: 18.7857 },
  { cityName: 'Olsztyn', countryName: 'Polska', countryCode: 'PL', region: 'Warmińsko-mazurskie', latitude: 53.7784, longitude: 20.4801 },
  { cityName: 'Opole', countryName: 'Polska', countryCode: 'PL', region: 'Opolskie', latitude: 50.6751, longitude: 17.9213 },
  { cityName: 'Zielona Góra', countryName: 'Polska', countryCode: 'PL', region: 'Lubuskie', latitude: 51.9356, longitude: 15.5062 },
  { cityName: 'Radom', countryName: 'Polska', countryCode: 'PL', region: 'Mazowieckie', latitude: 51.4027, longitude: 21.1471 },
  { cityName: 'Częstochowa', countryName: 'Polska', countryCode: 'PL', region: 'Śląskie', latitude: 50.8118, longitude: 19.1203 },
  { cityName: 'Bielsko-Biała', countryName: 'Polska', countryCode: 'PL', region: 'Śląskie', latitude: 49.8224, longitude: 19.0469 },
  { cityName: 'Tychy', countryName: 'Polska', countryCode: 'PL', region: 'Śląskie', latitude: 50.1218, longitude: 19.0200 }
];

const CATEGORY_CATALOG = [
  {
    categoryId: 'hvac',
    labels: { pl: 'Klimatyzacja', ru: 'Кондиционеры', en: 'Air conditioning' },
    aliases: ['klimatyzacja', 'hvac', 'air conditioning', 'кондиционеры', 'кондиционирование'],
    positiveKeywords: {
      pl: [
        'montaż klimatyzacji',
        'serwis klimatyzacji',
        'klimatyzacja domowa',
        'klimatyzacja biurowa',
        'wentylacja',
        'rekuperacja',
        'pompy ciepła',
        'hvac',
        'instalacje klimatyzacyjne',
        'klimatyzator'
      ],
      ru: ['монтаж кондиционеров', 'сервис кондиционеров', 'вентиляция', 'тепловые насосы'],
      en: ['air conditioning installation', 'air conditioning service', 'ventilation', 'heat pumps', 'hvac']
    },
    negativeKeywords: {
      pl: [
        'klimatyzacja samochodowa',
        'mechanik samochodowy',
        'warsztat samochodowy',
        'wulkanizacja',
        'opony',
        'geometria kół',
        'układ hamulcowy',
        'naprawa samochodów',
        'auto serwis',
        'sprzedaż samochodów',
        'części samochodowe',
        'lakiernik',
        'blacharz',
        'hamulcowy',
        'wymiana oleju',
        'sprzęgła',
        'rozrząd'
      ],
      ru: ['автосервис', 'шиномонтаж', 'автокондиционер', 'ремонт авто'],
      en: ['car air conditioning', 'auto service', 'car mechanic', 'tires', 'brakes']
    },
    excludedBusinessTypes: ['car_repair', 'tire_service', 'auto_parts', 'car_dealer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: [
      'montaż klimatyzacji',
      'serwis klimatyzacji',
      'klimatyzacja do domu',
      'klimatyzacja biurowa',
      'wentylacja i klimatyzacja',
      'pompy ciepła klimatyzacja',
      'instalacje klimatyzacyjne'
    ]
  }
];

function normalizePresetKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function getCityPreset(city) {
  return CITY_PRESETS[normalizePresetKey(city)] || null;
}

function getCountryPreset(country) {
  return COUNTRY_PRESETS[normalizePresetKey(country)] || null;
}

function findCategoryDefinition(value) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return null;
  return (
    CATEGORY_CATALOG.find((category) => {
      if (normalizeSearchText(category.categoryId) === normalized) return true;
      const labels = Object.values(category.labels || {}).map(normalizeSearchText);
      const aliases = (category.aliases || []).map(normalizeSearchText);
      return [...labels, ...aliases].some((item) => item && (item === normalized || normalized.includes(item) || item.includes(normalized)));
    }) || null
  );
}

function categoryLabel(category, language = 'pl') {
  return category?.labels?.[language] || category?.labels?.pl || category?.categoryId || '';
}

function categoryKeywordList(category, key) {
  if (!category?.[key]) return [];
  return [...new Set(Object.values(category[key]).flat().map(cleanText).filter(Boolean))];
}

function buildSearchPhrasesForNiche(niche) {
  const category = findCategoryDefinition(niche);
  if (category?.searchTemplates?.length) return unique(category.searchTemplates).slice(0, 8);
  return unique([niche, `${niche} firma`, `${niche} usługi`, `montaż ${niche}`, `serwis ${niche}`]).slice(0, 5);
}

function buildGeneratedSearchQueries(niches, city) {
  return unique(
    (niches || []).flatMap((niche) => buildSearchPhrasesForNiche(niche).map((phrase) => [phrase, city].filter(Boolean).join(' ')))
  ).slice(0, 60);
}

function matchTerms(text, terms) {
  const normalized = normalizeSearchText(text);
  return terms.filter((term) => {
    const normalizedTerm = normalizeSearchText(term);
    return normalizedTerm && normalized.includes(normalizedTerm);
  });
}

function evaluateCategoryRelevance(company, selectedNiche) {
  const category = findCategoryDefinition(selectedNiche || company?.niche || '');
  if (!category) {
    return {
      categoryId: '',
      categoryMatch: 'match',
      categoryRelevanceScore: 75,
      positiveCategorySignals: [],
      negativeCategorySignals: [],
      categoryRelevanceReason: 'No strict category catalog rule; accepted by source.'
    };
  }

  const text = [
    company.company,
    company.legal_name,
    company.niche,
    company.category,
    company.address,
    company.source,
    company.source_profile,
    company.website_url,
    Array.isArray(company.services) ? company.services.join(' ') : company.services,
    company.notes
  ]
    .filter(Boolean)
    .join(' ');
  const positives = matchTerms(text, categoryKeywordList(category, 'positiveKeywords'));
  const negatives = matchTerms(text, categoryKeywordList(category, 'negativeKeywords'));

  let score = 45;
  score += Math.min(42, positives.length * 14);
  if (positives.some((term) => /montaż|serwis|instalacje|wentylacja|pompy/i.test(term))) score += 8;
  score -= Math.min(70, negatives.length * 26);
  if (negatives.some((term) => /samochod|warsztat|mechanik|opony|wulkanizacja|hamulc|rozrząd|sprzęg/i.test(normalizeSearchText(term)))) {
    score -= 20;
  }
  if (!positives.length && category.categoryId === 'hvac') score -= 18;
  score = clamp(Math.round(score), 0, 100);

  const categoryMatch = score >= 70 ? 'match' : score >= 40 ? 'partial' : 'mismatch';
  return {
    categoryId: category.categoryId,
    selectedCategoryLabel: categoryLabel(category, 'pl'),
    categoryMatch,
    categoryRelevanceScore: score,
    positiveCategorySignals: positives.slice(0, 8),
    negativeCategorySignals: negatives.slice(0, 8),
    categoryRelevanceReason:
      categoryMatch === 'mismatch'
        ? `Rejected by category rules: ${negatives.slice(0, 4).join(', ') || 'missing positive category signals'}`
        : categoryMatch === 'partial'
          ? `Needs manual check: positives=${positives.length}, negatives=${negatives.length}`
          : `Accepted: ${positives.slice(0, 4).join(', ') || categoryLabel(category, 'pl')}`
  };
}

function applyCategoryRelevance(companies, selectedNiches) {
  const strictNiche = selectedNiches?.length === 1 ? selectedNiches[0] : '';
  let skippedWrongCategory = 0;
  const normalized = [];

  for (const company of companies || []) {
    const relevance = evaluateCategoryRelevance(company, strictNiche || company.niche);
    const next = {
      ...company,
      category_id: relevance.categoryId || company.category_id || '',
      category_match: relevance.categoryMatch,
      category_relevance_score: relevance.categoryRelevanceScore,
      positive_category_signals: relevance.positiveCategorySignals,
      negative_category_signals: relevance.negativeCategorySignals,
      actual_business_type:
        relevance.categoryMatch === 'mismatch'
          ? `Probably not ${relevance.selectedCategoryLabel || strictNiche || company.niche}`
          : company.actual_business_type || '',
      should_call: relevance.categoryMatch !== 'mismatch',
      category_relevance_reason: relevance.categoryRelevanceReason
    };
    if (strictNiche && relevance.categoryMatch === 'mismatch' && relevance.categoryRelevanceScore < 40) {
      skippedWrongCategory += 1;
      continue;
    }
    normalized.push(next);
  }

  return { companies: normalized, skippedWrongCategory };
}

function isWarsawCity(city) {
  const key = normalizePresetKey(city);
  return key === 'warszawa' || key === 'warsaw' || !city;
}

function parseBasicAuth(header = '') {
  const value = String(header || '');
  if (!value.toLowerCase().startsWith('basic ')) return null;
  try {
    const decoded = Buffer.from(value.slice(6).trim(), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return {
      login: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

const SESSION_COOKIE = 'aura_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  for (const part of String(header).split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
    }
  }
  return cookies;
}

function bearerToken(req) {
  const header = String(req.headers.authorization || '');
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
}

function sessionToken(req) {
  return bearerToken(req) || parseCookies(req)[SESSION_COOKIE] || '';
}

function currentSession(req) {
  const token = sessionToken(req);
  return token ? store.getSession(token) : null;
}

function setSessionCookie(req, res, token) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`
  ];
  if (secure) attributes.push('Secure');
  res.setHeader('Set-Cookie', attributes.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function isAdminAuthorized(req) {
  const credentials = parseBasicAuth(req.headers.authorization || '');
  if (credentials && credentials.login === ADMIN_LOGIN && credentials.password === ADMIN_PASSWORD) return true;
  const session = currentSession(req);
  return Boolean(session && session.role === 'admin');
}

function requireAdmin(req, res, next) {
  if (isAdminAuthorized(req)) {
    req.adminId = ADMIN_LOGIN;
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
  return res.status(401).json({ error: 'Admin authorization required.' });
}

// Resolves the acting workerId strictly from a verified session (or, for an
// authenticated admin, an explicit override supplied in the request) instead
// of trusting a client-supplied workerId/x-worker-id at face value.
function requestWorkerId(req) {
  const session = currentSession(req);
  if (session && session.role === 'worker') return session.workerId;
  if (isAdminAuthorized(req)) {
    const raw = req.body?.workerId || req.query.workerId || req.headers['x-worker-id'] || '';
    return raw ? store.normalizeWorkerId(raw) : '';
  }
  return '';
}

function assignedWorkerId(company) {
  return store.normalizeWorkerId(company?.assigned_worker_id || company?.first_assigned_worker_id || '');
}

function requireWorkerLeadAccess(req, res, company) {
  if (isAdminAuthorized(req)) return true;
  if (!company || company.status === 'deleted' || company.pool_state === 'deleted') {
    res.status(404).json({ error: 'Lead not found.' });
    return false;
  }
  const workerId = requestWorkerId(req);
  const ownerId = assignedWorkerId(company);
  if (!workerId) {
    res.status(401).json({ error: 'Worker identity is required.' });
    return false;
  }
  if (!ownerId || ownerId !== workerId) {
    res.status(403).json({ error: 'This lead belongs to another worker.' });
    return false;
  }
  return true;
}

// Mutable per-request discovery context read by the Google Places helpers.
// This tool runs as a single-user local server (one discovery run at a time in
// practice), so a module-level context avoids threading two extra parameters
// through every function in the discovery call graph.
let discoveryContext = { country: '', radiusKm: 0 };

// In-memory discovery job registry. Discovery runs happen in the background and
// the frontend polls /api/discover/jobs/:id so results can stream in
// incrementally (per niche/per source) instead of blocking until every source
// is exhausted. Jobs are ephemeral (lost on server restart) - the durable
// record of a run lives in store.js (data/runs.json, data/companies.json).
const discoveryJobs = new Map();
let discoveryJobSeq = 1;

function createDiscoveryJob(meta) {
  const id = String(discoveryJobSeq++);
  const now = new Date().toISOString();
  const job = {
    id,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    runId: '',
    meta: {
      niches: meta.niches || [],
      city: meta.city || '',
      country: meta.country || '',
      district: meta.district || '',
      radiusKm: meta.radiusKm || 0,
      sourceFocus: meta.sourceFocus || 'internet',
      limit: meta.limit || 0,
      workerId: meta.workerId || 'worker-default'
    },
    progress: {
      message: 'Ожидание запуска...',
      currentNiche: '',
      currentSource: '',
      foundCount: 0,
      processedNiches: 0,
      totalNiches: Array.isArray(meta.niches) ? meta.niches.length : 0
    },
    partialCompanies: [],
    warnings: [],
    queries: [],
    result: null,
    error: ''
  };
  discoveryJobs.set(id, job);
  return job;
}

function getDiscoveryJob(id) {
  return discoveryJobs.get(String(id)) || null;
}

function updateDiscoveryJob(jobId, patch = {}) {
  const job = getDiscoveryJob(jobId);
  if (!job) return null;
  if (patch.status) job.status = patch.status;
  if (patch.runId !== undefined) job.runId = patch.runId;
  if (patch.error !== undefined) job.error = patch.error;
  if (patch.result !== undefined) job.result = patch.result;
  if (patch.partialCompanies) {
    job.partialCompanies = uniqueCompanies(normalizeItems(patch.partialCompanies)).slice(0, job.meta.limit || MAX_DISCOVERY_ITEMS);
  }
  if (patch.appendCompanies?.length) {
    job.partialCompanies = uniqueCompanies([...job.partialCompanies, ...normalizeItems(patch.appendCompanies)]).slice(
      0,
      job.meta.limit || MAX_DISCOVERY_ITEMS
    );
  }
  if (patch.appendWarnings?.length) {
    job.warnings = unique([...job.warnings, ...patch.appendWarnings.map(cleanText)]).slice(0, 40);
  }
  if (patch.appendQueries?.length) {
    job.queries = unique([...job.queries, ...patch.appendQueries.map(cleanText)]).slice(0, 50);
  }
  if (patch.progress) {
    job.progress = {
      ...job.progress,
      ...patch.progress,
      foundCount: patch.progress.foundCount ?? job.partialCompanies.length
    };
  } else {
    job.progress.foundCount = job.partialCompanies.length;
  }
  job.updatedAt = new Date().toISOString();
  return job;
}

function serializeDiscoveryJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    runId: job.runId,
    meta: job.meta,
    progress: {
      ...job.progress,
      foundCount: job.partialCompanies.length
    },
    companies: job.partialCompanies,
    warnings: job.warnings,
    queries: job.queries,
    result: job.result,
    error: job.error
  };
}

const CEIDG_ENDPOINT =
  process.env.CEIDG_API_ENDPOINT || 'https://dane.biznes.gov.pl/api/ceidg/v3/firmy';
const CEIDG_TOKEN = process.env.CEIDG_API_TOKEN || '';
const REGON_API_KEY = process.env.REGON_API_KEY || '';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const AWS_LOCATION_API_KEY = process.env.AWS_LOCATION_API_KEY || '';
const AWS_LOCATION_REGION = process.env.AWS_LOCATION_REGION || 'eu-north-1';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// AI roleplay training personas. Behavior prompt stays Polish-only (matches the
// rest of the Academy deep content); label is what the worker sees in the picker.
const AI_TRAINING_PERSONAS = [
  { id: 'busy_owner', label: 'Zajęty właściciel', prompt: 'Jesteś zapracowanym właścicielem małej firmy. Masz mało czasu, mówisz krótko, chcesz szybko zakończyć rozmowę, ale nie jesteś wrogi.' },
  { id: 'angry_owner', label: 'Zły właściciel', prompt: 'Jesteś rozdrażnionym właścicielem firmy, dostajesz dużo telefonów sprzedażowych i jesteś poirytowany. Mówisz szorstko, ale worker może cię udobruchać dobrym podejściem.' },
  { id: 'skeptic', label: 'Sceptyk', prompt: 'Jesteś nieufny wobec telefonicznych ofert, wątpisz w wartość usługi, zadajesz dużo pytań kontrolnych zanim uwierzysz w cokolwiek.' },
  { id: 'no_website', label: 'Klient bez strony', prompt: 'Prowadzisz firmę, nie masz własnej strony internetowej, korzystasz tylko z Facebooka. Jesteś otwarty na rozmowę o stronie, jeśli worker dobrze wyjaśni korzyść.' },
  { id: 'old_website', label: 'Klient ze starą stroną', prompt: 'Masz stronę internetową sprzed kilku lat, uważasz że działa wystarczająco dobrze, trzeba cię przekonać, że warto ją odświeżyć.' },
  { id: 'good_website', label: 'Klient z dobrą stroną', prompt: 'Masz nowoczesną, dobrze działającą stronę internetową i jesteś z niej zadowolony. Trudno cię zainteresować, chyba że worker zaproponuje coś poza samą stroną (reklama, automatyzacje, CRM).' },
  { id: 'send_offer', label: 'Klient mówi "wyślij ofertę"', prompt: 'Od razu, na początku rozmowy, prosisz aby przesłać ofertę mailem i się rozłączyć. Worker musi cię zatrzymać na rozmowie zanim się zgodzisz.' },
  { id: 'asks_price', label: 'Klient od razu pyta o cenę', prompt: 'Zanim worker cokolwiek wyjaśni, pytasz "ile to kosztuje?". Naciskasz na konkretną kwotę, worker powinien podać widełki i przejść do umówienia spotkania zamiast obiecywać dokładną cenę.' },
  { id: 'no_marketing', label: 'Klient nie rozumie marketingu', prompt: 'Nie rozumiesz pojęć typu SEO, kampanie, lejki sprzedażowe. Worker musi tłumaczyć bardzo prostymi słowami, bez żargonu.' },
  { id: 'has_agency', label: 'Klient ma już agencję', prompt: 'Współpracujesz już z inną agencją marketingową i jesteś względnie zadowolony. Trzeba dobrego argumentu, żeby w ogóle zgodzić się na rozmowę.' },
  { id: 'interested_website', label: 'Klient zainteresowany stroną', prompt: 'Jesteś realnie zainteresowany nową stroną internetową, zadajesz konkretne pytania o proces i cenę, łatwo cię przekonać do spotkania.' },
  { id: 'interested_ads', label: 'Klient zainteresowany reklamą', prompt: 'Interesuje cię głównie reklama (Google Ads / Meta Ads), pytasz o efekty i koszt kliknięcia, worker powinien skierować rozmowę do spotkania z ekspertem.' },
  { id: 'wants_callback', label: 'Klient chce, żeby oddzwonić', prompt: 'Jesteś teraz zajęty i prosisz o oddzwonienie później. Worker powinien ustalić konkretny dzień i godzinę, a nie zostawić to open-ended.' },
  { id: 'distrustful', label: 'Klient nie ufa', prompt: 'Podejrzewasz, że to oszustwo albo spam, pytasz skąd masz numer, jesteś podejrzliwy przez całą rozmowę, worker musi budować zaufanie krok po kroku.' },
  { id: 'ready_to_meet', label: 'Klient gotowy na spotkanie', prompt: 'Jesteś pozytywnie nastawiony i szybko zgadzasz się na umówienie spotkania/konsultacji, jeśli worker tylko poprawnie poprowadzi rozmowę.' }
];

// Rough per-1K-token USD rates used only for internal cost estimates in the admin
// AI-usage panel — not billing-accurate, just enough to compare relative spend.
const AI_MODEL_RATES = {
  'gpt-5.4-mini': { input: 0.00025, output: 0.001 },
  'gpt-5.5': { input: 0.0025, output: 0.01 }
};
AI_MODEL_RATES[AI_TRAINING_MODEL] = AI_MODEL_RATES[AI_TRAINING_MODEL] || AI_MODEL_RATES['gpt-5.4-mini'];

const AI_TRAINING_ROLEPLAY_RULES = [
  'To jest trening rozmowy telefonicznej dla callera Aura Global Merchants.',
  'Grasz tylko klienta, nigdy trenera ani sprzedawcy.',
  'Odpowiadasz po polsku, naturalnie, jak przez telefon: 1-3 krotkie zdania.',
  'Nie pomagaj workerowi wprost. Reaguj na jakosc jego pytan i argumentow.',
  'Jesli worker recytuje oferte, jest nachalny albo obiecuje dokladna cene, badz bardziej sceptyczny.',
  'Jesli worker pyta o realny problem, mowi konkretnie i proponuje krotka konsultacje, stopniowo sie otwieraj.',
  'Celem worker-a nie jest sprzedaz przez telefon, tylko umowienie konkretnej konsultacji/spotkania.',
  'Nie akceptuj spotkania za latwo, chyba ze persona mowi inaczej.'
].join('\n');

function estimateAiCost(model, promptTokens, completionTokens) {
  const rate = AI_MODEL_RATES[model] || AI_MODEL_RATES[DEFAULT_MODEL];
  return Number(((promptTokens / 1000) * rate.input + (completionTokens / 1000) * rate.output).toFixed(6));
}

function findAiTrainingPersona(clientType) {
  return AI_TRAINING_PERSONAS.find((persona) => persona.id === String(clientType || '')) || null;
}

const freeEmailDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'wp.pl',
  'onet.pl',
  'interia.pl',
  'o2.pl',
  'op.pl',
  'poczta.onet.pl',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'proton.me',
  'protonmail.com'
]);

const socialDomains = [
  'instagram.com',
  'facebook.com',
  'fb.com',
  'tiktok.com',
  'linkedin.com',
  'youtube.com'
];

const directoryDomains = [
  'booksy.com',
  'booksy.net',
  'znanylekarz.pl',
  'fixly.pl',
  'oferteo.pl',
  'panoramafirm.pl',
  'pkt.pl',
  'cylex-polska.pl',
  'firmy.net',
  'gowork.pl',
  'aleo.com',
  'google.com',
  'maps.google',
  'bing.com',
  'yelp.'
];
const contactDiscoveryDomains = new Set([...directoryDomains, ...socialDomains]);

const marketplaceDomains = ['allegro.pl', 'olx.pl', 'otomoto.pl', 'etsy.com'];
const freeSubdomainDomains = [
  'wixsite.com',
  'wordpress.com',
  'webnode.page',
  'webnode.com',
  'weebly.com',
  'business.site',
  'sites.google.com',
  'mystrikingly.com',
  'jimdosite.com',
  'blogspot.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = new Set([
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    'https://averysultan3-creator.github.io'
  ]);

  if (origin === 'null') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Reflect any other origin too. The backend may be exposed through a
    // public tunnel (cloudflared/ngrok) and opened from GitHub Pages on a
    // different computer; a strict allow-list would silently break fetch().
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, ngrok-skip-browser-warning, x-worker-id');
  // Chrome's Private Network Access policy requires this header on the
  // preflight response whenever a page loaded from a public address (like
  // https://averysultan3-creator.github.io) tries to fetch a private/local
  // address (http://localhost:4317). Without it the browser silently fails
  // the request with "Failed to fetch" even though CORS itself is configured
  // correctly, which is why the GitHub Pages version could not reach the
  // local backend.
  if (req.headers['access-control-request-private-network'] === 'true') {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json({ limit: '4mb' }));

const ACCESS_DENIED_HTML = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Access denied</title>
<style>body{font:15px system-ui,sans-serif;background:#0f1115;color:#f3f4f6;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
.card{max-width:420px;text-align:center;padding:32px}
a{color:#8ab4ff}</style></head>
<body><div class="card"><h1>Access denied</h1>
<p>This account does not have permission to view the admin panel.</p>
<p><a href="/">Parser</a> &middot; <a href="/academy/">Academy</a></p>
</div></body></html>`;

// Defense-in-depth for the self-hosted deployment mode (server.js serves both
// the API and these static files from the same origin, so a session cookie set
// at login is sent automatically on a plain browser navigation to /admin).
// When served instead as a static export (e.g. GitHub Pages), this middleware
// never runs - the client-side role check in public/admin/app.js is what
// covers that case. We only ever block here when we can positively confirm a
// *non-admin* session; an absent cookie still lets the shell load so the
// admin login form itself remains reachable.
app.use('/admin', (req, res, next) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) {
    const session = store.getSession(token);
    if (session && session.role !== 'admin') {
      res.status(403).type('html').send(ACCESS_DENIED_HTML);
      return;
    }
  }
  next();
});

app.get([/^\/admin$/, /^\/academy$/, /^\/site$/], (req, res) => {
  const targetPath = `${req.path}/`;
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(302, `${targetPath}${query}`);
});
app.get(/^\/site\/(pl|en|ru)\/?$/i, (req, res) => {
  const query = new URLSearchParams(req.query || {});
  query.set('lang', String(req.params[0] || '').toLowerCase());
  res.redirect(302, `/site/?${query.toString()}`);
});
app.get(/^\/parser\/?$/, (req, res) => {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(302, `/${query}`);
});
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'no-store');
    }
  })
);

app.get('/api/config', (_req, res) => {
  res.json({
    hasOpenAiKey: Boolean(openai),
    defaultModel: DEFAULT_MODEL,
    searchModel: SEARCH_MODEL,
    respectRobotsTxt: RESPECT_ROBOTS,
    maxItems: MAX_ITEMS,
    maxDiscoveryItems: MAX_DISCOVERY_ITEMS,
    internetSearchConfigured: true,
    registry: {
      ceidgConfigured: Boolean(CEIDG_TOKEN),
      regonConfigured: Boolean(REGON_API_KEY),
      googlePlacesConfigured: Boolean(GOOGLE_PLACES_API_KEY),
      amazonLocationConfigured: Boolean(AWS_LOCATION_API_KEY),
      amazonLocationRegion: AWS_LOCATION_REGION,
      ceidgEndpoint: CEIDG_ENDPOINT
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'aura-parser',
    port: PORT,
    hasOpenAiKey: Boolean(openai),
    discovery: {
      googlePlacesConfigured: Boolean(GOOGLE_PLACES_API_KEY),
      amazonLocationConfigured: Boolean(AWS_LOCATION_API_KEY),
      ceidgConfigured: Boolean(CEIDG_TOKEN),
      internetSearchConfigured: true
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/categories', (_req, res) => {
  res.json({ categories: CATEGORY_CATALOG });
});

app.get('/api/location/suggestions', (req, res) => {
  const q = normalizeSearchText(req.query.q || '');
  const country = normalizeSearchText(req.query.country || '');
  const suggestions = LOCATION_SUGGESTIONS.filter((item) => {
    if (country && !normalizeSearchText(`${item.countryName} ${item.countryCode}`).includes(country)) return false;
    if (!q) return true;
    return normalizeSearchText(`${item.cityName} ${item.region} ${item.countryName}`).includes(q);
  })
    .slice(0, 12)
    .map((item) => ({
      ...item,
      radiusKm: Number(req.query.radiusKm || 15) || 15,
      displayName: [item.cityName, item.region, item.countryName].filter(Boolean).join(', '),
      language: 'pl'
    }));
  res.json({ suggestions });
});

app.get('/health', (_req, res) => {
  res.redirect(302, '/api/health');
});

app.get('/api/status', (_req, res) => {
  res.json({
    ok: true,
    service: 'aura-parser',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/site-leads', (req, res) => {
  try {
    const name = cleanText(req.body?.name || req.body?.contactName || '');
    const phone = cleanText(req.body?.phone || '');
    const email = cleanText(req.body?.email || '');

    if (!name) {
      return res.status(400).json({ error: 'Podaj imie osoby kontaktowej.' });
    }
    if (!phone && !email) {
      return res.status(400).json({ error: 'Podaj telefon lub email.' });
    }

    const record = store.createSiteLead({
      ...req.body,
      name,
      phone,
      email
    });

    res.status(201).json({
      ok: true,
      leadId: record.id,
      status: record.status,
      stage: record.stage
    });
  } catch (error) {
    console.error('[site-leads] failed:', error);
    res.status(500).json({ error: error.message || 'Nie udalo sie zapisac zapytania.' });
  }
});

function buildSessionResponse(req, res, { role, workerId = '', displayName = '', language = 'ru' } = {}) {
  const session = store.createSession({ role, workerId, displayName, language });
  setSessionCookie(req, res, session.token);
  return {
    ok: true,
    token: session.token,
    role: session.role,
    workerId: session.workerId,
    displayName: session.displayName,
    language: session.language
  };
}

app.post('/api/auth/login', (req, res) => {
  const login = String(req.body?.login || '').trim();
  const password = String(req.body?.password || '');
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required.' });
  }

  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    return res.json(buildSessionResponse(req, res, { role: 'admin', displayName: 'Admin', language: 'ru' }));
  }

  const worker = store.authenticateWorker(login, password);
  if (!worker) return res.status(401).json({ error: 'Invalid login or password.' });
  return res.json(
    buildSessionResponse(req, res, {
      role: 'worker',
      workerId: worker.workerId,
      displayName: worker.displayName,
      language: worker.language
    })
  );
});

app.get('/api/auth/me', (req, res) => {
  const session = currentSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({
    role: session.role,
    workerId: session.workerId,
    displayName: session.displayName,
    language: session.language
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = sessionToken(req);
  if (token) store.destroySession(token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post('/api/workers/login', (req, res) => {
  const worker = store.authenticateWorker(req.body?.login || '', req.body?.password || '');
  if (!worker) return res.status(401).json({ error: 'Invalid login/password or inactive worker.' });
  res.json(
    buildSessionResponse(req, res, {
      role: 'worker',
      workerId: worker.workerId,
      displayName: worker.displayName,
      language: worker.language
    })
  );
});

app.post('/api/analyze', async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body?.items || req.body?.companies)
      ? req.body.items || req.body.companies
      : [];
    const items = normalizeItems(rawItems);
    // _companyId travels alongside each normalized item (added by /api/discover
    // responses and preserved by normalizeItems) so we can save analysis results
    // back onto the same persisted company record.
    const companyIds = items.map((item) => item?._companyId || '');
    const useAi = false;
    const useWebSearch = false;
    const model = String(req.body?.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
    const searchModel = String(req.body?.searchModel || SEARCH_MODEL).trim() || SEARCH_MODEL;

    if (!items.length) {
      return res.status(400).json({ error: 'Добавьте хотя бы одну компанию.' });
    }
    if (items.length > MAX_ITEMS) {
      return res.status(400).json({ error: `Максимум ${MAX_ITEMS} компаний за один запуск.` });
    }

    const startedAt = Date.now();
    const results = await mapLimit(items, 3, async (item, index) => {
      const result = await analyzeLead(item, { useAi, useWebSearch, model, searchModel });
      const companyId = companyIds[index] || store.findExistingCompanyId(item);
      if (companyId) {
        store.updateCompanyAnalysis(companyId, {
          websiteResolution: result.websiteResolution,
          parsed: result.parsed,
          heuristic: result.heuristic,
          analysis: result.analysis
        });
        result._companyId = companyId;
      }
      return result;
    });

    res.json({
      results,
      meta: {
        count: results.length,
        usedAi: useAi,
        usedWebSearch: useWebSearch,
        model: useAi ? model : null,
        searchModel: useWebSearch ? searchModel : null,
        elapsedMs: Date.now() - startedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Ошибка анализа.' });
  }
});

app.post('/api/discover', async (req, res) => {
  const runStartedAt = 0;
  const run = null;
  try {
    const requestedNiches = Array.isArray(req.body?.niches)
      ? req.body.niches.map(cleanText).filter(Boolean)
      : [];
    const niche = cleanText(req.body?.niche || req.body?.category || requestedNiches[0] || '');
    const niches = unique(requestedNiches.length ? requestedNiches : [niche]).slice(0, 40);
    const country = cleanText(req.body?.country || '');
    const city = cleanText(req.body?.city || (country ? '' : 'Warszawa'));
    const district = cleanText(req.body?.district || '');
    const requestedRadiusKm = Number.parseFloat(req.body?.radiusKm ?? req.body?.radius_km ?? req.body?.radius);
    const radiusKm = Number.isFinite(requestedRadiusKm) && requestedRadiusKm > 0 ? clamp(requestedRadiusKm, 1, 200) : 0;
    const sourceFocus = normalizeDiscoverySource(req.body?.sourceFocus);
    const requestedLimit = Number.parseInt(req.body?.limit, 10);
    const limit = clamp(Number.isFinite(requestedLimit) ? requestedLimit : 40, 1, MAX_DISCOVERY_ITEMS);
    const sessionWorkerId = requestWorkerId(req);
    const workerId = sessionWorkerId || cleanText(req.body?.workerId || req.body?.userId || req.headers['x-worker-id'] || 'worker-default');

    if (!niches.length) {
      return res.status(400).json({ error: 'Укажите категорию или нишу для поиска.' });
    }
    if (!city && !country) {
      return res.status(400).json({ error: 'Укажите город или страну для поиска.' });
    }

    const job = createDiscoveryJob({
      niches,
      city: city || country,
      country,
      district,
      radiusKm,
      sourceFocus,
      limit,
      workerId
    });

    void runDiscoveryJob(job.id, {
      niches,
      city: city || country,
      country,
      district,
      radiusKm,
      sourceFocus,
      limit,
      workerId
    });

    res.json({
      jobId: job.id,
      status: job.status,
      meta: job.meta
    });
  } catch (error) {
    console.error('[discover] failed to create discovery job:', error);
    if (run) {
      store.updateRun(run.id, {
        status: 'failed',
        finished_at: new Date().toISOString(),
        warnings: [error.message || 'Ошибка поиска компаний.']
      });
    }
    const message = error.message || 'Ошибка поиска компаний.';
    const missingDiscoverySource =
      message.includes('GOOGLE_PLACES_API_KEY') ||
      message.includes('CEIDG_API_TOKEN') ||
      message.includes('AWS_LOCATION_API_KEY');
    res.status(missingDiscoverySource ? 400 : 500).json({ error: message });
  } finally {
    discoveryContext = { country: '', radiusKm: 0 };
    void runStartedAt;
  }
});

app.get('/api/discover/jobs/:id', (req, res) => {
  const job = getDiscoveryJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Discovery job not found.' });
  if (!isAdminAuthorized(req)) {
    const workerId = requestWorkerId(req);
    const ownerId = store.normalizeWorkerId(job.meta?.workerId || '');
    if (!workerId || workerId !== ownerId) {
      return res.status(403).json({ error: 'This discovery job belongs to another worker.' });
    }
  }
  res.json(serializeDiscoveryJob(job));
});

app.get('/api/history/runs', (req, res) => {
  const admin = isAdminAuthorized(req);
  const workerId = admin ? '' : requestWorkerId(req);
  res.json({ runs: store.listRuns({ limit: 100, workerId }) });
});

app.get('/api/history/runs/:id', (req, res) => {
  const run = store.getRun(String(req.params.id));
  if (!run) return res.status(404).json({ error: 'Run not found.' });
  if (!isAdminAuthorized(req)) {
    const workerId = requestWorkerId(req);
    if (!workerId || store.normalizeWorkerId(run.worker_id || '') !== workerId) {
      return res.status(403).json({ error: 'This parser query belongs to another worker.' });
    }
  }
  res.json({ run, companies: store.getCompaniesByIds(run.company_ids) });
});

app.get('/api/companies', requireAdmin, (_req, res) => {
  res.json({ companies: store.getAllCompanies(), stats: store.getStoreStats() });
});

app.get('/api/companies/:id', requireAdmin, (req, res) => {
  const company = store.getCompany(String(req.params.id));
  if (!company) return res.status(404).json({ error: 'Company not found.' });
  res.json({ company });
});

app.use('/api/admin', requireAdmin);

app.get('/api/admin/leads', (req, res) => {
  const leads = store.listLeadPool({
    q: req.query.q || '',
    status: req.query.status || '',
    poolState: req.query.poolState || '',
    workerId: req.query.workerId || '',
    city: req.query.city || '',
    category: req.query.category || '',
    includeDeleted: req.query.includeDeleted === 'true',
    limit: Number.parseInt(req.query.limit, 10) || 500
  });
  res.json({ leads, stats: store.getStoreStats() });
});

app.get('/api/admin/leads/:id', (req, res) => {
  const company = store.getCompany(String(req.params.id));
  if (!company) return res.status(404).json({ error: 'Lead not found.' });
  const runs = store.listRuns({ limit: 1000 }).filter((run) => (run.company_ids || []).map(String).includes(String(req.params.id)));
  res.json({ company, runs });
});

app.get('/api/admin/workers', (_req, res) => {
  res.json({
    workers: store.listWorkers(),
    stats: store.getStoreStats()
  });
});

app.post('/api/admin/workers', (req, res) => {
  try {
    const worker = store.createWorkerAccount({
      displayName: cleanText(req.body?.displayName || req.body?.name || ''),
      login: cleanText(req.body?.login || ''),
      password: String(req.body?.password || ''),
      language: cleanText(req.body?.language || 'ru'),
      active: req.body?.active !== false
    });
    store.logAdminAction({
      adminId: cleanText(req.body?.adminId || 'admin'),
      action: 'create_worker',
      targetType: 'worker',
      targetId: worker.workerId,
      details: { displayName: worker.displayName, language: worker.language, active: worker.active }
    });
    res.status(201).json({ ok: true, worker });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Worker create failed.' });
  }
});

app.get('/api/admin/workers/:workerId', (req, res) => {
  res.json(store.getWorkerDetail(req.params.workerId));
});

app.patch('/api/admin/workers/:workerId', (req, res) => {
  const worker = store.updateWorkerAccount(req.params.workerId, req.body || {});
  if (!worker) return res.status(404).json({ error: 'Worker not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: req.body?.password ? 'change_worker_password' : req.body?.active === false ? 'deactivate_worker' : 'update_worker',
    targetType: 'worker',
    targetId: req.params.workerId,
    details: { active: worker.active, language: worker.language, displayName: worker.displayName }
  });
  res.json({ ok: true, worker });
});

app.post('/api/admin/workers/:workerId/reset-leads', (req, res) => {
  const resetIds = store.resetWorkerCompanies(req.params.workerId);
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'reset_worker_leads_to_pool',
    targetType: 'worker',
    targetId: req.params.workerId,
    details: { count: resetIds.length }
  });
  res.json({ ok: true, resetIds, stats: store.getStoreStats() });
});

app.delete('/api/admin/workers/:workerId', (req, res) => {
  if (req.body?.confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm worker deletion.' });
  }
  const result = store.deleteWorkerAccount(req.params.workerId);
  if (!result) return res.status(404).json({ error: 'Worker not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'delete_worker',
    targetType: 'worker',
    targetId: req.params.workerId,
    details: {
      deletedRunCount: result.deletedRunIds.length,
      resetLeadCount: result.resetLeadIds.length,
      deletedTrainingSessionCount: result.deletedTrainingSessionIds.length,
      deletedSessionCount: result.deletedSessionCount,
      deletedAiUsageCount: result.deletedAiUsageCount
    }
  });
  res.json({ ok: true, result, stats: store.getStoreStats() });
});

app.delete('/api/admin/workers/:workerId/history', (req, res) => {
  if (req.body?.confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm worker history cleanup.' });
  }
  const deletedRunIds = store.clearWorkerHistory(req.params.workerId);
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'clear_worker_history',
    targetType: 'worker',
    targetId: req.params.workerId,
    details: { runIds: deletedRunIds, count: deletedRunIds.length }
  });
  res.json({ ok: true, deletedRunIds, stats: store.getStoreStats() });
});

app.get('/api/admin/runs/:id', (req, res) => {
  const detail = store.getRunDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Run not found.' });
  res.json(detail);
});

app.post('/api/admin/runs/:id/reset', (req, res) => {
  const resetIds = store.resetRunCompanies(req.params.id);
  if (!resetIds.length && !store.getRun(req.params.id)) return res.status(404).json({ error: 'Run not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'reset_query_to_pool',
    targetType: 'run',
    targetId: req.params.id,
    details: { count: resetIds.length, leadIds: resetIds }
  });
  res.json({ ok: true, resetIds, stats: store.getStoreStats() });
});

app.delete('/api/admin/runs/:id', (req, res) => {
  if (req.body?.confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm permanent query deletion.' });
  }
  const deletedLeadIds = req.body?.deleteLeads === false ? [] : store.deleteRunCompanies(req.params.id);
  const deletedRun = store.deleteRun(req.params.id);
  if (!deletedRun) return res.status(404).json({ error: 'Run not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'delete_query_permanently',
    targetType: 'run',
    targetId: req.params.id,
    details: { deletedLeadIds, deletedLeadCount: deletedLeadIds.length }
  });
  res.json({ ok: true, deletedRun, deletedLeadIds, stats: store.getStoreStats() });
});

app.post('/api/admin/runs/:runId/leads/:leadId/reset', (req, res) => {
  const resetIds = store.resetCompanies([req.params.leadId]);
  if (!resetIds.length) return res.status(404).json({ error: 'Lead not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'reset_lead_to_pool',
    targetType: 'lead',
    targetId: req.params.leadId,
    details: { runId: req.params.runId }
  });
  res.json({ ok: true, resetIds, stats: store.getStoreStats() });
});

app.delete('/api/admin/runs/:runId/leads/:leadId', (req, res) => {
  if (req.body?.confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm permanent lead deletion.' });
  }
  const deletedIds = store.deleteCompanies([req.params.leadId]);
  if (!deletedIds.length) return res.status(404).json({ error: 'Lead not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'delete_lead_permanently',
    targetType: 'lead',
    targetId: req.params.leadId,
    details: { runId: req.params.runId }
  });
  res.json({ ok: true, deletedIds, stats: store.getStoreStats() });
});

app.post('/api/admin/leads/reset', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const resetIds = store.resetCompanies(ids);
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: resetIds.length > 1 ? 'reset_selected_leads_to_pool' : 'reset_lead_to_pool',
    targetType: 'lead',
    targetId: resetIds.length === 1 ? resetIds[0] : 'bulk',
    details: { count: resetIds.length, leadIds: resetIds }
  });
  res.json({ ok: true, resetIds, stats: store.getStoreStats() });
});

app.delete('/api/admin/leads', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (ids.length && req.body?.confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm permanent lead deletion.' });
  }
  const deletedIds = store.deleteCompanies(ids);
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: deletedIds.length > 1 ? 'delete_selected_leads_permanently' : 'delete_lead_permanently',
    targetType: 'lead',
    targetId: deletedIds.length === 1 ? deletedIds[0] : 'bulk',
    details: { count: deletedIds.length, leadIds: deletedIds }
  });
  res.json({ ok: true, deletedIds, stats: store.getStoreStats() });
});

app.post('/api/leads/:id/status', (req, res) => {
  const existing = store.getCompany(String(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });
  if (!requireWorkerLeadAccess(req, res, existing)) return;
  const workerId = isAdminAuthorized(req) ? cleanText(req.body?.workerId || '') : requestWorkerId(req);
  const company = store.updateCompanyStatus(req.params.id, {
    status: cleanText(req.body?.status || ''),
    workerId,
    note: req.body?.note
  });
  if (!company) return res.status(404).json({ error: 'Lead not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || req.headers['x-worker-id'] || 'worker'),
    action: 'update_lead_status',
    targetType: 'lead',
    targetId: req.params.id,
    details: { status: company.status, workerId: company.assigned_worker_id || '' }
  });
  res.json({ ok: true, company });
});

app.get('/api/academy/progress', (req, res) => {
  const sessionWorkerId = requestWorkerId(req);
  if (!sessionWorkerId) return res.status(401).json({ error: 'Sign in required.' });
  res.json({ progress: store.getAcademyProgress(sessionWorkerId) });
});

app.post('/api/academy/progress', (req, res) => {
  const sessionWorkerId = requestWorkerId(req);
  if (!sessionWorkerId) return res.status(401).json({ error: 'Sign in required.' });
  const progress = store.saveAcademyProgress(sessionWorkerId, req.body || {});
  res.json({ ok: true, progress });
});

app.get('/api/academy/ai-training/personas', (_req, res) => {
  res.json({ personas: AI_TRAINING_PERSONAS.map(({ id, label }) => ({ id, label })) });
});

app.get('/api/academy/ai-training/sessions', (req, res) => {
  const workerId = requestWorkerId(req);
  if (!workerId) return res.status(401).json({ error: 'Sign in required.' });
  res.json({ sessions: store.listAiTrainingSessions({ workerId }) });
});

function requireAiTrainingSession(req, res) {
  const session = store.getAiTrainingSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: 'Training session not found.' });
    return null;
  }
  if (isAdminAuthorized(req)) return session;
  const workerId = requestWorkerId(req);
  if (!workerId || workerId !== session.workerId) {
    res.status(403).json({ error: 'This training session belongs to another worker.' });
    return null;
  }
  return session;
}

app.post('/api/academy/ai-training/start', async (req, res) => {
  try {
    if (!openai) return res.status(400).json({ error: 'OPENAI_API_KEY не указан в .env.' });
    const workerId = requestWorkerId(req);
    if (!workerId) return res.status(401).json({ error: 'Sign in required.' });
    const persona = findAiTrainingPersona(req.body?.clientType);
    if (!persona) return res.status(400).json({ error: 'Nieznany typ klienta.' });

    const session = store.createAiTrainingSession(workerId, persona.id);
    const response = await openai.responses.create({
      model: AI_TRAINING_MODEL,
      input: [
        {
          role: 'system',
          content: `${AI_TRAINING_ROLEPLAY_RULES}\n\nPersona klienta:\n${persona.prompt}\n\nTo worker dzwoni pierwszy. Zacznij od krotkiej reakcji klienta, np. "Slucham?" albo "Kto mowi?", zgodnie z persona.`
        }
      ],
      max_output_tokens: 200
    });
    const openingLine = response.output_text?.trim() || 'Słucham?';
    store.appendAiTrainingMessage(session.sessionId, 'client', openingLine);

    const usage = response.usage || {};
    store.logAiUsage({
      workerId,
      feature: 'ai_training',
      model: AI_TRAINING_MODEL,
      promptTokens: usage.input_tokens || 0,
      completionTokens: usage.output_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      estimatedCost: estimateAiCost(AI_TRAINING_MODEL, usage.input_tokens || 0, usage.output_tokens || 0)
    });

    res.json({ sessionId: session.sessionId, clientType: persona.id, personaLabel: persona.label, openingLine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Błąd startu treningu AI.' });
  }
});

app.post('/api/academy/ai-training/:sessionId/message', async (req, res) => {
  try {
    if (!openai) return res.status(400).json({ error: 'OPENAI_API_KEY не указан в .env.' });
    const session = requireAiTrainingSession(req, res);
    if (!session) return;
    if (session.status !== 'active') return res.status(400).json({ error: 'Trening jest już zakończony.' });
    const text = cleanText(req.body?.text || '');
    if (!text) return res.status(400).json({ error: 'Wiadomość nie może być pusta.' });

    const persona = findAiTrainingPersona(session.clientType);
    store.appendAiTrainingMessage(session.sessionId, 'worker', text);
    const updated = store.getAiTrainingSession(session.sessionId);

    const response = await openai.responses.create({
      model: AI_TRAINING_MODEL,
      input: [
        {
          role: 'system',
          content: `${AI_TRAINING_ROLEPLAY_RULES}\n\nPersona klienta:\n${persona?.prompt || ''}\n\nKontynuuj rozmowe. Odpowiadaj tylko jako klient.`
        },
        ...updated.messages.map((message) => ({
          role: message.role === 'worker' ? 'user' : 'assistant',
          content: message.text
        }))
      ],
      max_output_tokens: 220
    });
    const reply = response.output_text?.trim() || '...';
    store.appendAiTrainingMessage(session.sessionId, 'client', reply);

    const usage = response.usage || {};
    store.logAiUsage({
      workerId: session.workerId,
      feature: 'ai_training',
      model: AI_TRAINING_MODEL,
      promptTokens: usage.input_tokens || 0,
      completionTokens: usage.output_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      estimatedCost: estimateAiCost(AI_TRAINING_MODEL, usage.input_tokens || 0, usage.output_tokens || 0)
    });

    res.json({ reply, messages: store.getAiTrainingSession(session.sessionId).messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Błąd rozmowy AI.' });
  }
});

app.post('/api/academy/ai-training/:sessionId/finish', async (req, res) => {
  try {
    if (!openai) return res.status(400).json({ error: 'OPENAI_API_KEY не указан в .env.' });
    const session = requireAiTrainingSession(req, res);
    if (!session) return;
    const persona = findAiTrainingPersona(session.clientType);

    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['score', 'meetingBooked', 'good', 'bad', 'improvements'],
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        meetingBooked: { type: 'boolean' },
        good: { type: 'array', items: { type: 'string' } },
        bad: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } }
      }
    };

    const transcriptText = session.messages
      .map((message) => `${message.role === 'worker' ? 'Sprzedawca' : 'Klient'}: ${message.text}`)
      .join('\n');

    const response = await openai.responses.create({
      model: AI_TRAINING_MODEL,
      input: [
        {
          role: 'system',
          content: `Jestes trenerem sprzedazy telefonicznej Aura Global Merchants. Ocen rozmowe worker-a z klientem: "${persona?.label || session.clientType}". Kryteria: konkretna obserwacja o firmie, pytania o problem, krotkie wyjasnienie wartosci, brak nachalnej sprzedazy, nieobiecywanie dokladnej ceny przez telefon, proba umowienia konkretnej konsultacji. Ocen 0-100, meetingBooked, good, bad, improvements. Pisz po polsku, konkretnie i krotko.`
        },
        { role: 'user', content: transcriptText || '(brak wiadomości)' }
      ],
      max_output_tokens: 700,
      text: {
        format: {
          type: 'json_schema',
          name: 'ai_training_feedback',
          strict: true,
          schema
        }
      }
    });

    const feedback = JSON.parse(response.output_text);
    const finished = store.finishAiTrainingSession(session.sessionId, { score: feedback.score, feedback });

    const usage = response.usage || {};
    store.logAiUsage({
      workerId: session.workerId,
      feature: 'ai_training',
      model: AI_TRAINING_MODEL,
      promptTokens: usage.input_tokens || 0,
      completionTokens: usage.output_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      estimatedCost: estimateAiCost(AI_TRAINING_MODEL, usage.input_tokens || 0, usage.output_tokens || 0)
    });

    res.json({ session: finished });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Błąd podsumowania treningu AI.' });
  }
});

app.get('/api/admin/academy', (_req, res) => {
  res.json({ users: store.listAcademyProgress() });
});

app.get('/api/admin/workers/:workerId/ai-training', (req, res) => {
  res.json({ sessions: store.listAiTrainingSessions({ workerId: req.params.workerId }) });
});

app.get('/api/admin/ai-training/:sessionId', (req, res) => {
  const session = store.getAiTrainingSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Training session not found.' });
  res.json({ session });
});

app.get('/api/admin/ai-usage', (req, res) => {
  res.json(store.summarizeAiUsage({ period: req.query.period || 'all' }));
});

app.get('/api/admin/audit', (req, res) => {
  res.json({ actions: store.listAuditLog({ limit: Number.parseInt(req.query.limit, 10) || 200 }) });
});

app.get('/api/admin/summary', (req, res) => {
  res.json({
    stats: store.getAdminSummary({ period: req.query.period || 'all' }),
    rawStats: store.getStoreStats(),
    runs: store.listRuns({ limit: 100 }),
    academyUsers: store.listAcademyProgress()
  });
});

app.post('/api/ai/site-analysis', async (req, res) => {
  try {
    if (!openai) {
      return res.status(400).json({
        error: 'OPENAI_API_KEY не указан в .env. Вставьте ключ и перезапустите сервер.'
      });
    }

    const result = req.body?.result || req.body?.company || {};
    const input = result.input;
    const parsed = result.parsed;
    const websiteResolution = result.websiteResolution;
    const heuristic = result.analysis || result.heuristic;
    const model = String(req.body?.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

    if (!input || !websiteResolution || !heuristic) {
      return res.status(400).json({ error: 'Для AI-анализа нужна готовая карточка компании.' });
    }

    const companyId = result._companyId || store.findExistingCompanyId(input);
    if (companyId) {
      const existing = store.getCompany(companyId);
      if (!existing) return res.status(404).json({ error: 'Lead not found.' });
      if (!requireWorkerLeadAccess(req, res, existing)) return;
    }

    const startedAt = performance.now();
    const aiAnalysis = await analyzeSiteCardWithOpenAI({
      item: input,
      parsed: parsed || { ok: false, error: '', signals: emptySignals() },
      websiteResolution,
      heuristic,
      model,
      language: cleanText(req.body?.language || req.body?.uiLanguage || 'ru'),
      workerId: requestWorkerId(req)
    });

    if (companyId) {
      store.updateCompanyAiAnalysis(companyId, {
        status: 'COMPLETED',
        version: aiAnalysis?.ai_analysis_version || 1,
        analyzed_at: aiAnalysis?.ai_analyzed_at || new Date().toISOString(),
        company_data_version: aiAnalysis?.company_data_version || 1,
        data: aiAnalysis
      });
    }

    res.json({
      aiAnalysis,
      meta: {
        model,
        elapsedMs: Math.round(performance.now() - startedAt)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Ошибка AI-анализа карточки.' });
  }
});

app.get('/api/registry/ceidg/search', async (req, res) => {
  if (!CEIDG_TOKEN) {
    return res.status(400).json({
      error: 'CEIDG_API_TOKEN не указан в .env. Импортируйте CSV или добавьте токен.'
    });
  }

  try {
    const params = new URLSearchParams();
    for (const key of ['nip', 'regon', 'nazwa', 'miasto', 'pkd', 'status']) {
      if (req.query[key]) params.set(key, String(req.query[key]));
    }
    const url = `${CEIDG_ENDPOINT}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${CEIDG_TOKEN}`,
        accept: 'application/json',
        'user-agent': USER_AGENT
      }
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/registry/krs/:krs', async (req, res) => {
  const krs = cleanIdentifier(req.params.krs);
  if (!krs) return res.status(400).json({ error: 'KRS is required.' });

  try {
    const url = `https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/${krs}`;
    const response = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT }
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`Aura Parser running at http://${displayHost}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`LAN access enabled on port ${PORT}`);
  }
});

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const sourceProfile = cleanText(item.source_profile || item.profile_url || item.source_url || '');
      const city = cleanText(item.city || item.miasto || 'Warszawa');
      const country = cleanText(item.country || item.kraj || discoveryContext.country || '');
      const socialProfiles = {
        instagram: cleanText(item.instagram || item.instagram_url || ''),
        facebook: cleanText(item.facebook || item.facebook_url || ''),
        tiktok: cleanText(item.tiktok || item.tiktok_url || '')
      };

      return {
        company: cleanText(item.company || item.company_name || item.name || item.firma || ''),
        legal_name: cleanText(item.legal_name || item.official_name || ''),
        niche: cleanText(item.niche || item.category || item.kategoria || ''),
        city,
        country,
        district: cleanText(item.district || item.area || item.dzielnica || ''),
        address: cleanText(item.address || item.adres || ''),
        phone: normalizePhoneField(item.phone || item.telefon || '', { city, country }),
        email: cleanText(item.email || item.mail || '').toLowerCase(),
        nip: cleanIdentifier(item.nip || item.NIP || ''),
        regon: cleanIdentifier(item.regon || item.REGON || ''),
        krs: cleanIdentifier(item.krs || item.KRS || ''),
        pkd: cleanText(item.pkd || item.PKD || ''),
        status: cleanText(item.status || item.registry_status || ''),
        registration_date: cleanText(item.registration_date || item.start_date || item.data_rejestracji || ''),
        website_url: cleanText(
          item.website_url || item.website || item.url || item.strona || item.registry_website || ''
        ),
        website_listed: parseBool(item.website_listed),
        source: cleanText(item.source || item.source_name || ''),
        source_profile: sourceProfile,
        social_profiles: socialProfiles,
        review_count: parseNumber(item.review_count || item.reviews || item.opinie),
        rating: parseNumber(item.rating || item.ocena),
        last_activity: cleanText(item.last_activity || item.last_post_date || item.ostatnia_aktywnosc || ''),
        activity_signal: cleanText(item.activity_signal || item.content_freshness || ''),
        services: parseList(item.services || item.uslugi),
        portfolio_available: parseBool(item.portfolio_available || item.portfolio || item.photos),
        physical_location: parseBool(item.physical_location || item.location || item.address),
        team_size: cleanText(item.team_size || item.employees || item.zespol || ''),
        multiple_locations: parseBool(item.multiple_locations || item.branches || item.filialy),
        high_ticket: parseBool(item.high_ticket || item.expensive_services),
        paid_platform: parseBool(item.paid_platform || item.marketplace_paid),
        notes: cleanText(item.notes || item.note || item.uwagi || ''),
        category_id: cleanText(item.category_id || item.categoryId || ''),
        category_match: cleanText(item.category_match || item.categoryMatch || ''),
        category_relevance_score: parseNumber(item.category_relevance_score || item.categoryRelevanceScore),
        category_relevance_reason: cleanText(item.category_relevance_reason || item.categoryRelevanceReason || ''),
        positive_category_signals: Array.isArray(item.positive_category_signals || item.positiveCategorySignals)
          ? item.positive_category_signals || item.positiveCategorySignals
          : parseList(item.positive_category_signals || item.positiveCategorySignals),
        negative_category_signals: Array.isArray(item.negative_category_signals || item.negativeCategorySignals)
          ? item.negative_category_signals || item.negativeCategorySignals
          : parseList(item.negative_category_signals || item.negativeCategorySignals),
        actual_business_type: cleanText(item.actual_business_type || item.actualBusinessType || ''),
        should_call: item.should_call === undefined && item.shouldCall === undefined ? true : parseBool(item.should_call ?? item.shouldCall),
        _companyId: item._companyId || ''
      };
    })
    .filter((item) => item.company || item.website_url || item.phone || item.nip || item.source_profile);
}

function normalizeDiscoverySource(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (['all_sources', 'directories', 'booking', 'social', 'registries', 'amazon_location', 'maps_api', 'maps_check'].includes(raw)) {
    return raw === 'maps_check' ? 'maps_api' : raw;
  }
  return 'internet';
}

function computeDiscoveryCandidateLimit(requestedLimit, sourceFocus = 'internet') {
  const base = clamp(Number(requestedLimit || 0) || 40, 1, MAX_DISCOVERY_ITEMS);
  const multiplier =
    sourceFocus === 'all_sources' ? 5
      : ['maps_api', 'amazon_location', 'internet'].includes(sourceFocus) ? 4
        : 3;
  return clamp(Math.max(base + 20, base * multiplier), base, MAX_DISCOVERY_ITEMS);
}

async function runDiscoveryJob(jobId, params) {
  const runStartedAt = performance.now();
  let run = null;

  try {
    updateDiscoveryJob(jobId, {
      status: 'running',
      progress: {
        message: 'Запускаю поиск...',
        currentNiche: params.niches[0] || '',
        currentSource: params.sourceFocus,
        processedNiches: 0,
        totalNiches: params.niches.length
      }
    });

    discoveryContext = { country: params.country, radiusKm: params.radiusKm, city: params.city };
    const candidateLimit = computeDiscoveryCandidateLimit(params.limit, params.sourceFocus);
    run = store.createRun({
      niches: params.niches,
      city: params.city,
      country: params.country,
      district: params.district,
      radiusKm: params.radiusKm,
      workerId: params.workerId,
      sourceFocus: params.sourceFocus,
      requestedLimit: params.limit,
      generatedSearchQueries: buildGeneratedSearchQueries(params.niches, params.city)
    });
    updateDiscoveryJob(jobId, { runId: run.id });

    const discovery = await discoverCompaniesBatchWithoutAI({
      niches: params.niches,
      city: params.city,
      district: params.district,
      limit: candidateLimit,
      sourceFocus: params.sourceFocus,
      onProgress(event) {
        const progressRelevance = applyCategoryRelevance(normalizeItems(event.companies || []), params.niches);
        const claimedPreview = store.claimCompaniesForRun(progressRelevance.companies, {
          runId: run.id,
          workerId: params.workerId,
          limit: params.limit
        });
        updateDiscoveryJob(jobId, {
          appendCompanies: claimedPreview.companies,
          appendQueries: event.queries || [],
          appendWarnings: event.warnings || [],
          progress: {
            message: event.message || 'Ищу компании...',
            currentNiche: event.niche || '',
            currentSource: event.source || '',
            processedNiches: event.processedNiches ?? 0,
            totalNiches: params.niches.length,
            foundCount: claimedPreview.companies.length || event.foundSoFar || event.count || 0
          }
        });
      }
    });

    const relevance = applyCategoryRelevance(normalizeItems(discovery.companies || []), params.niches);
    const rawCompanies = relevance.companies.slice(0, candidateLimit);
    const claimedFinal = store.claimCompaniesForRun(rawCompanies, {
      runId: run.id,
      workerId: params.workerId,
      limit: params.limit
    });
    const companies = claimedFinal.companies;
    const foundCount = companies.length;
    const rawFoundCount = rawCompanies.length;
    const newCount = claimedFinal.newCount;
    const duplicateCount = claimedFinal.duplicateCount;
    const companyIds = claimedFinal.companyIds;
    const finalStatus = foundCount >= params.limit ? 'completed' : 'exhausted';
    const progressMessage =
      finalStatus === 'completed'
        ? `Найдено ${foundCount} новых компаний. Поиск завершен.`
        : `Поиск исчерпан: найдено ${foundCount} новых компаний из ${params.limit}, дублей пропущено ${duplicateCount}.`;

    store.addCompanyIdsToRun(run.id, companyIds);
    store.updateRun(run.id, {
      status: finalStatus,
      finished_at: new Date().toISOString(),
      found_count: rawFoundCount,
      new_count: newCount,
      duplicate_count: duplicateCount,
      raw_found_count: rawFoundCount,
      search_status: finalStatus,
      skipped_wrong_category: relevance.skippedWrongCategory,
      generated_search_queries: buildGeneratedSearchQueries(params.niches, params.city),
      warnings: Array.isArray(discovery.warnings) ? discovery.warnings.slice(0, 20) : []
    });

    updateDiscoveryJob(jobId, {
      status: 'completed',
      partialCompanies: companies.map((company, index) => ({ ...company, _companyId: company._companyId || companyIds[index] })),
      appendQueries: discovery.queries || [],
      appendWarnings: discovery.warnings || [],
      result: {
        runId: run.id,
        queries: Array.isArray(discovery.queries) ? discovery.queries.slice(0, 10) : [],
        warnings: Array.isArray(discovery.warnings) ? discovery.warnings.slice(0, 10) : [],
        meta: {
          count: companies.length,
          requestedNewCount: params.limit,
          rawFoundCount,
          newCount,
          duplicateCount,
          skippedWrongCategory: relevance.skippedWrongCategory,
          usedAi: false,
          source: discovery.source,
          sourceFocus: params.sourceFocus,
          searchStatus: finalStatus,
          workerId: params.workerId,
          categories: params.niches,
          city: params.city,
          country: params.country,
          radiusKm: params.radiusKm,
          elapsedMs: Math.round(performance.now() - runStartedAt)
        }
      },
      progress: {
        message: progressMessage,
        currentNiche: '',
        currentSource: discovery.source || params.sourceFocus,
        processedNiches: params.niches.length,
        totalNiches: params.niches.length,
        foundCount: companies.length
      }
    });
  } catch (error) {
    console.error(`[discover-job] id=${jobId} run=${run?.id || 'n/a'} failed:`, error);
    if (run) {
      store.updateRun(run.id, {
        status: 'failed',
        finished_at: new Date().toISOString(),
        warnings: [error.message || 'Ошибка поиска компаний.']
      });
    }
    updateDiscoveryJob(jobId, {
      status: 'failed',
      error: error.message || 'Ошибка поиска компаний.',
      appendWarnings: [error.message || 'Ошибка поиска компаний.'],
      progress: {
        message: error.message || 'Ошибка поиска компаний.'
      }
    });
  } finally {
    discoveryContext = { country: '', radiusKm: 0, city: '' };
  }
}

async function discoverCompaniesBatchWithoutAI({ niches, city, district, limit, sourceFocus, onProgress }) {
  if (sourceFocus === 'amazon_location') {
    if (!AWS_LOCATION_API_KEY) {
      throw new Error('Для Amazon Location нужен AWS_LOCATION_API_KEY в .env.');
    }

    const amazonDiscoveries = [];
    const perNicheLimit = Math.max(5, Math.ceil(limit / Math.max(1, niches.length)));
    for (const niche of niches) {
      if (uniqueCompanies(amazonDiscoveries.flatMap((item) => item.companies || [])).length >= limit) break;
      const discovery = await discoverCompaniesFromAmazonLocationExpanded({
        niche,
        city,
        district,
        limit: perNicheLimit,
        sourceFocus,
        onProgress
      });
      amazonDiscoveries.push(discovery);
      if (typeof onProgress === 'function') {
        onProgress({
          niche,
          source: discovery.source,
          companies: discovery.companies || [],
          queries: discovery.queries || [],
          warnings: discovery.warnings || [],
          foundSoFar: uniqueCompanies(amazonDiscoveries.flatMap((item) => item.companies || [])).length,
          processedNiches: amazonDiscoveries.length,
          message: `Найдено ${uniqueCompanies(amazonDiscoveries.flatMap((item) => item.companies || [])).length} компаний...`
        });
      }
    }

    return mergeDiscoveries(amazonDiscoveries, limit);
  }

  if (sourceFocus === 'maps_api') {
    const googleDiscoveries = [];
    const perNicheLimit = Math.max(5, Math.ceil(limit / Math.max(1, niches.length)));
    for (const niche of niches) {
      if (uniqueCompanies(googleDiscoveries.flatMap((item) => item.companies || [])).length >= limit) break;
      const discovery = await discoverCompaniesFromGooglePlacesExpanded({
        niche,
        city,
        district,
        limit: perNicheLimit,
        sourceFocus,
        onProgress
      });
      googleDiscoveries.push(discovery);
      if (typeof onProgress === 'function') {
        onProgress({
          niche,
          source: discovery.source,
          companies: discovery.companies || [],
          queries: discovery.queries || [],
          warnings: discovery.warnings || [],
          foundSoFar: uniqueCompanies(googleDiscoveries.flatMap((item) => item.companies || [])).length,
          processedNiches: googleDiscoveries.length,
          message: `Найдено ${uniqueCompanies(googleDiscoveries.flatMap((item) => item.companies || [])).length} компаний...`
        });
      }
    }

    return mergeDiscoveries(googleDiscoveries, limit);
  }

  // For multiple categories, iterate every niche (no artificial 12-category cap)
  // and keep every source running per niche until the overall limit is filled.
  // Each niche gets its own fair share of the limit, but if earlier niches under-
  // deliver, later niches can still contribute more since we stop only once the
  // combined total reaches the requested limit.
  const collected = [];
  const queries = [];
  const warnings = [];
  const sources = new Set();
  const perNicheLimit = Math.max(3, Math.ceil(limit / Math.max(1, niches.length)));

  for (const niche of niches) {
    const remaining = limit - uniqueCompanies(collected).length;
    if (remaining <= 0) break;
    try {
      const discovery = await discoverCompaniesWithoutAI({
        niche,
        city,
        district,
        limit: Math.max(perNicheLimit, remaining),
        sourceFocus,
        onProgress: (event) => {
          if (typeof onProgress !== 'function') return;
          onProgress({
            ...event,
            processedNiches: Math.min(niches.indexOf(niche) + 1, niches.length)
          });
        }
      });
      sources.add(discovery.source);
      queries.push(...(discovery.queries || []));
      warnings.push(...(discovery.warnings || []));
      collected.push(...(discovery.companies || []));
      if (typeof onProgress === 'function') {
        onProgress({
          niche,
          source: discovery.source,
          companies: discovery.companies || [],
          queries: discovery.queries || [],
          warnings: discovery.warnings || [],
          foundSoFar: uniqueCompanies(collected).length,
          processedNiches: Math.min(niches.indexOf(niche) + 1, niches.length),
          message: `Найдено ${uniqueCompanies(collected).length} компаний...`
        });
      }
    } catch (error) {
      warnings.push(`Category "${niche}" skipped: ${error.message || 'unknown error'}`);
    }
  }

  return {
    source: [...sources].join(',') || 'unknown',
    queries: unique(queries).slice(0, 40),
    warnings: unique(warnings).slice(0, 30),
    companies: uniqueCompanies(collected).slice(0, limit)
  };
}

function mergeDiscoveries(discoveries, limit) {
  return {
    source: unique(discoveries.map((item) => item.source).filter(Boolean)).join(',') || 'unknown',
    queries: unique(discoveries.flatMap((item) => item.queries || [])).slice(0, 40),
    warnings: unique(discoveries.flatMap((item) => item.warnings || [])).slice(0, 30),
    companies: uniqueCompanies(discoveries.flatMap((item) => item.companies || [])).slice(0, limit)
  };
}

function discoveryPriority(discovery) {
  const source = String(discovery?.source || '');
  if (source.includes('public_registry') || source.includes('public_contact_fallback')) return 1;
  if (source.includes('public_search')) return 2;
  if (source.includes('amazon_location')) return 3;
  if (source.includes('google_places')) return 4;
  return 9;
}

async function discoverCompaniesWithoutAI({ niche, city, district, limit, sourceFocus, onProgress }) {
  if (sourceFocus === 'all_sources') {
    // Smart pipeline: one source finds the primary list of companies (up to
    // the requested limit), then every other configured source is used only
    // to CONFIRM and FILL IN missing data (phone, email, website, NIP/REGON)
    // on those same companies - matched by name/address similarity - instead
    // of blindly adding more "new" companies from each source in parallel.
    // This keeps the list accurate: Google Places (or Amazon Location as a
    // fallback) decides which companies exist, the other sources cross-check
    // and enrich them.
    const warnings = [];
    let primary = null;

    if (GOOGLE_PLACES_API_KEY) {
      try {
        primary = await discoverCompaniesFromGooglePlacesExpanded({ niche, city, district, limit, sourceFocus, onProgress });
        if (typeof onProgress === 'function') {
          onProgress({
            niche,
            source: 'google_places_api',
            companies: primary.companies || [],
            queries: primary.queries || [],
            warnings: primary.warnings || [],
            foundSoFar: primary.companies.length,
            count: primary.companies.length,
            message: `Google Places: найдено ${primary.companies.length}`
          });
        }
      } catch (error) {
        warnings.push(`Google Places skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (!primary?.companies?.length && AWS_LOCATION_API_KEY) {
      try {
        primary = await discoverCompaniesFromAmazonLocationExpanded({ niche, city, district, limit, sourceFocus, onProgress });
        if (typeof onProgress === 'function') {
          onProgress({
            niche,
            source: 'amazon_location',
            companies: primary.companies || [],
            queries: primary.queries || [],
            warnings: primary.warnings || [],
            foundSoFar: primary.companies.length,
            count: primary.companies.length,
            message: `Amazon Location: найдено ${primary.companies.length}`
          });
        }
      } catch (error) {
        warnings.push(`Amazon Location skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (!primary?.companies?.length && CEIDG_TOKEN) {
      try {
        primary = await discoverCompaniesFromCeidg({ niche, city, district, limit });
      } catch (error) {
        warnings.push(`CEIDG skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (!primary?.companies?.length) {
      try {
        primary = await discoverCompaniesFromPublicSearchExpanded({ niche, city, district, limit, sourceFocus, onProgress });
      } catch (error) {
        warnings.push(`Public search skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (!primary?.companies?.length) {
      throw new Error(`No companies found in configured non-AI sources. ${warnings.join(' ')}`);
    }

    console.log(
      `[all_sources] niche="${niche}" primary_source=${primary.source} primary_count=${primary.companies.length}; running cross-source verification (Amazon Location / CEIDG / public search) to fill missing contact data on the same companies...`
    );

    const enrichedCompanies = await enrichPrimaryCompaniesSmart(primary.companies, { warnings });
    if (typeof onProgress === 'function') {
      onProgress({
        niche,
        source: 'cross_verification',
        companies: enrichedCompanies,
        foundSoFar: enrichedCompanies.length,
        count: enrichedCompanies.length,
        message: `Сверяю и дополняю ${enrichedCompanies.length} компаний...`
      });
    }

    return {
      source: primary.source,
      queries: primary.queries || [],
      warnings: unique([...(primary.warnings || []), ...warnings]).slice(0, 30),
      companies: enrichedCompanies.slice(0, limit)
    };
  }

  if (['internet', 'directories', 'booking', 'social'].includes(sourceFocus)) {
    const shouldExpandPublicSearch = ['internet'].includes(sourceFocus);
    const publicDiscovery = shouldExpandPublicSearch
      ? await discoverCompaniesFromPublicSearchExpanded({ niche, city, district, limit, sourceFocus })
      : await discoverCompaniesFromPublicSearch({ niche, city, district, limit, sourceFocus });
    return publicDiscovery;
  }

  if (sourceFocus === 'registries') {
    if (!CEIDG_TOKEN) {
      return discoverCompaniesFromPublicRegistries({ niche, city, district, limit });
    }
    return discoverCompaniesFromCeidg({ niche, city, district, limit });
  }

  if (sourceFocus === 'amazon_location' && AWS_LOCATION_API_KEY) {
    return discoverCompaniesFromAmazonLocationExpanded({ niche, city, district, limit, sourceFocus });
  }

  if (sourceFocus === 'amazon_location') {
    throw new Error('Для Amazon Location нужен AWS_LOCATION_API_KEY в .env.');
  }

  if (sourceFocus === 'maps_api' && GOOGLE_PLACES_API_KEY) {
    return discoverCompaniesFromGooglePlacesExpanded({ niche, city, district, limit, sourceFocus });
  }

  if (sourceFocus === 'maps_api') {
    throw new Error('Для поиска Google Maps нужен GOOGLE_PLACES_API_KEY в .env.');
  }

  if (CEIDG_TOKEN) {
    return discoverCompaniesFromCeidg({ niche, city, district, limit });
  }

  throw new Error(
    'Для поиска компаний без ChatGPT настройте GOOGLE_PLACES_API_KEY или CEIDG_API_TOKEN в .env. Без ключей используйте CSV-импорт.'
  );
}

function uniqueCompanies(companies) {
  const seen = new Set();
  const result = [];
  for (const company of companies) {
    const key = [
      cleanText(company.nip || company.regon || ''),
      splitPhoneValues(company.phone || '', { city: company.city, country: company.country }).join(',') || normalizePhone(company.phone || ''),
      cleanText(company.source_profile || '').toLowerCase(),
      cleanText(company.company || '').toLowerCase(),
      cleanText(company.address || '').toLowerCase()
    ]
      .filter(Boolean)
      .join('|');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(company);
  }
  return result;
}

async function discoverCompaniesFromAmazonLocationExpanded({ niche, city, district, limit, sourceFocus, onProgress }) {
  const cityIsWarsaw = isWarsawCity(city);
  const districts = district ? [district] : cityIsWarsaw ? ['', ...DEFAULT_WARSAW_DISTRICTS.slice(0, 8)] : [''];
  const queryNiches = district ? [niche] : buildSearchPhrasesForNiche(niche);
  const queryPlans = district
    ? queryNiches.map((queryNiche) => ({ queryNiche, districtName: district }))
    : [
        ...queryNiches.map((queryNiche) => ({ queryNiche, districtName: '' })),
        ...(cityIsWarsaw ? DEFAULT_WARSAW_DISTRICTS.slice(0, 6) : []).map((districtName) => ({ queryNiche: niche, districtName }))
      ];
  const perQueryLimit = Math.min(25, Math.max(5, Math.ceil(limit / Math.min(queryPlans.length, 5))));
  const discoveries = [];
  const warnings = [];

  for (const { queryNiche, districtName } of queryPlans) {
    const collectedCount = uniqueCompanies(discoveries.flatMap((item) => item.companies || [])).length;
    if (collectedCount >= limit) break;

    try {
      discoveries.push(
        await discoverCompaniesFromAmazonLocation({
          niche: queryNiche,
          city,
          district: districtName,
          limit: perQueryLimit,
          sourceFocus
        })
      );
      if (typeof onProgress === 'function') {
        const partial = mergeDiscoveries(discoveries, limit);
        onProgress({
          niche,
          source: 'amazon_location',
          companies: partial.companies || [],
          queries: partial.queries || [],
          warnings: partial.warnings || [],
          foundSoFar: partial.companies?.length || 0,
          count: partial.companies?.length || 0,
          message: `Amazon Location: найдено ${partial.companies?.length || 0}`
        });
      }
    } catch (error) {
      warnings.push(`Amazon Location skipped ${districtName || city}: ${error.message || 'unknown error'}`);
      if (!districtName) break;
    }
  }

  const merged = mergeDiscoveries(discoveries, limit);
  return {
    ...merged,
    source: merged.source || 'amazon_location',
    warnings: unique([...warnings, ...(merged.warnings || [])]).slice(0, 20)
  };
}

async function discoverCompaniesFromAmazonLocation({ niche, city, district, limit, sourceFocus }) {
  if (!AWS_LOCATION_API_KEY) {
    throw new Error('AWS_LOCATION_API_KEY is not configured.');
  }

  const cityPreset = getCityPreset(city);
  const countryPreset = getCountryPreset(discoveryContext.country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
  const includeCountry = countryPreset?.regionCode === 'UA' ? 'UKR' : 'POL';
  const queryText = [niche, district, city].filter(Boolean).join(' ').slice(0, 200);
  const url = `https://places.geo.${AWS_LOCATION_REGION}.amazonaws.com/v2/search-text?${new URLSearchParams({
    key: AWS_LOCATION_API_KEY
  })}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GOOGLE_PLACES_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': USER_AGENT
      },
      body: JSON.stringify({
        QueryText: queryText,
        MaxResults: Math.min(100, Math.max(1, limit)),
        Language: 'pl',
        IntendedUse: 'SingleUse',
        AdditionalFeatures: ['Contact'],
        BiasPosition: cityPreset ? [cityPreset.lng, cityPreset.lat] : [21.0122, 52.2297],
        Filter: {
          IncludeCountries: [includeCountry]
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.Message || data.message || data.__type || `Amazon Location API error ${response.status}`);
    }

    const companies = (data.ResultItems || [])
      .filter((item) => isRelevantAmazonPlace(item, niche))
      .map((item) => amazonLocationItemToCompany(item, { niche, city, district, sourceFocus }))
      .filter((company) => company.company || company.address || company.phone || company.website_url);

    const enriched = await enrichDiscoveredCompanyContacts(uniqueCompanies(companies).slice(0, limit), {
      limit: Math.min(limit, 20),
      warnings: []
    });

    return {
      source: 'amazon_location',
      queries: [queryText],
      warnings: data.NextToken ? ['Amazon Location returned more results; current run used first page.'] : [],
      companies: enriched.slice(0, limit)
    };
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Amazon Location timeout');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function isRelevantAmazonPlace(item, niche) {
  if (item.PlaceType && item.PlaceType !== 'PointOfInterest') return false;

  const contacts = item.Contacts || {};
  const hasContact = Boolean(
    (contacts.Phones || []).length ||
      (contacts.Emails || []).length ||
      (contacts.Websites || []).length
  );
  if (!hasContact) return false;

  const categories = (item.Categories || []).map((category) => category.LocalizedName || category.Name).join(' ');
  const websites = (contacts.Websites || []).map((entry) => entry.Value || entry.Label || '').join(' ');
  const evidence = normalizeSearchText([item.Title, item.Name, item.Address?.Label, categories, websites].filter(Boolean).join(' '));
  const nicheText = normalizeSearchText(niche || '');
  const tokens = unique(
    nicheText
      .split(/\s+/)
      .map((token) => token.replace(/[^a-z0-9ąćęłńóśźż]/gi, ''))
      .filter((token) => token.length >= 5)
  );

  if (!tokens.length) return true;
  return tokens.some((token) => evidence.includes(token.slice(0, Math.min(token.length, 8))));
}

function amazonLocationItemToCompany(item, { niche, city, district, sourceFocus }) {
  const contacts = item.Contacts || {};
  const emails = unique((contacts.Emails || []).map((entry) => cleanText(entry.Value || entry.Label || '').toLowerCase()).filter(Boolean));
  const websites = unique((contacts.Websites || []).map((entry) => safeUrl(entry.Value || entry.Label || '')).filter(Boolean));
  const address = item.Address || {};
  const categories = (item.Categories || []).map((category) => category.LocalizedName || category.Name).filter(Boolean);
  const title = cleanText(item.Title || item.Name || '');
  const label = cleanText(address.Label || '');
  const locality = cleanText(address.Locality || city || 'Warszawa');
  const country = cleanText(address.Country || address.CountryCode || discoveryContext.country || '');
  const phones = unique(
    (contacts.Phones || [])
      .map((entry) => normalizePhoneField(entry.Value || entry.Label || '', { city: locality, country }))
      .filter(Boolean)
  );
  const districtName = cleanText(address.District || address.SubDistrict || district || '');
  const position = Array.isArray(item.Position) ? item.Position.join(',') : '';

  return {
    company: title,
    niche: categories[0] || niche,
    city: locality || city || 'Warszawa',
    district: districtName,
    address: label,
    phone: phones.slice(0, 3).join('; '),
    email: emails.slice(0, 3).join('; '),
    website_url: websites[0] || '',
    source: `amazon_location_${sourceFocus}`,
    source_profile: item.PlaceId ? `amazon-location:${item.PlaceId}` : '',
    services: unique([niche, ...categories]).slice(0, 8),
    physical_location: true,
    rating: '',
    review_count: '',
    notes: [
      `Amazon Location place_type=${item.PlaceType || 'UNKNOWN'}`,
      position ? `position=${position}` : '',
      label
    ]
      .filter(Boolean)
      .join(' | ')
  };
}

async function discoverCompaniesFromGooglePlacesExpanded({ niche, city, district, limit, sourceFocus, onProgress }) {
  const cityIsWarsaw = isWarsawCity(city);
  const districts = district ? [district] : cityIsWarsaw ? ['', ...DEFAULT_WARSAW_DISTRICTS] : [''];
  const queryNiches = district ? [niche] : buildSearchPhrasesForNiche(niche);
  const queryPlans = queryNiches.flatMap((queryNiche) => districts.map((districtName) => ({ queryNiche, districtName })));
  const perQueryLimit = Math.min(20, Math.max(5, Math.ceil(limit / Math.min(queryPlans.length, 8))));
  const discoveries = [];
  const warnings = [];

  for (const { queryNiche, districtName } of queryPlans) {
    const collectedCount = uniqueCompanies(discoveries.flatMap((item) => item.companies || [])).length;
    if (collectedCount >= limit) break;

    try {
      discoveries.push(
        await discoverCompaniesFromGooglePlaces({
          niche: queryNiche,
          city,
          district: districtName,
          limit: perQueryLimit,
          sourceFocus
        })
      );
      if (typeof onProgress === 'function') {
        const partial = mergeDiscoveries(discoveries, limit);
        onProgress({
          niche,
          source: 'google_places_api',
          companies: partial.companies || [],
          queries: partial.queries || [],
          warnings: partial.warnings || [],
          foundSoFar: partial.companies?.length || 0,
          count: partial.companies?.length || 0,
          message: `Google Places: найдено ${partial.companies?.length || 0}`
        });
      }
    } catch (error) {
      warnings.push(error.message || 'Google Places API error');
      break;
    }
  }

  const merged = mergeDiscoveries(discoveries, limit);
  if (!merged.companies.length && warnings.length) {
    throw new Error(warnings[0]);
  }
  return {
    ...merged,
    source: merged.source === 'unknown' ? 'google_places_api' : merged.source,
    warnings: unique([...warnings, ...(merged.warnings || [])]).slice(0, 30)
  };
}

async function discoverCompaniesFromGooglePlaces({ niche, city, district, limit, sourceFocus }) {
  const cityPreset = getCityPreset(city);
  const countryPreset = getCountryPreset(discoveryContext.country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
  const regionCode = cityPreset?.regionCode || countryPreset?.regionCode || 'PL';
  const languageCode = cityPreset?.languageCode || countryPreset?.languageCode || 'pl';
  // If searching by country only (no specific city), let Google Places interpret the
  // free-text query without a location bias circle.
  const textQuery = [niche, district, city || discoveryContext.country].filter(Boolean).join(' ');
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.nationalPhoneNumber',
    'places.internationalPhoneNumber',
    'places.websiteUri',
    'places.googleMapsUri',
    'places.businessStatus',
    'places.rating',
    'places.userRatingCount',
    'places.types',
    'nextPageToken'
  ].join(',');

  const locationBias =
    cityPreset && !district
      ? {
          circle: {
            center: { latitude: cityPreset.lat, longitude: cityPreset.lng },
            radius: clamp(Math.round((discoveryContext.radiusKm || 15) * 1000), 1000, 50000)
          }
        }
      : undefined;

  console.log(
    `[google_places] query="${textQuery}" city=${city || '(country-wide)'} regionCode=${regionCode} radiusKm=${discoveryContext.radiusKm || '(default)'} bias=${Boolean(locationBias)}`
  );

  // Google Places (New) Text Search paginates with nextPageToken (max 20 per
  // page, up to ~60 results total across 3 pages). Loop through pages until
  // we hit the requested limit or run out of pages, instead of only reading
  // the first page and discarding the rest.
  const collected = [];
  let pageToken = '';
  let pageCount = 0;
  let lastError = null;

  while (collected.length < limit && pageCount < 3) {
    const requestBody = {
      textQuery,
      languageCode,
      regionCode,
      pageSize: Math.min(limit - collected.length, 20)
    };
    if (locationBias) requestBody.locationBias = locationBias;
    if (pageToken) requestBody.pageToken = pageToken;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GOOGLE_PLACES_TIMEOUT_MS);
    let response;
    try {
      response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': fieldMask,
          'user-agent': USER_AGENT
        },
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      lastError = error?.name === 'AbortError' ? new Error('Google Places API timeout') : error;
      break;
    } finally {
      clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.log(`[google_places] query="${textQuery}" page=${pageCount + 1} error=${response.status} ${data.error?.message || ''}`);
      lastError = new Error(data.error?.message || `Google Places API error ${response.status}`);
      break;
    }

    const rawCount = (data.places || []).length;
    const pageCompanies = (data.places || [])
      .filter((place) => !place.businessStatus || place.businessStatus === 'OPERATIONAL')
      .map((place) => {
        const placeCity = city || cleanText(place.formattedAddress || '').split(',').slice(-2, -1)[0]?.trim() || city;
        const country = countryPreset?.label || discoveryContext.country || '';
        return {
          company: cleanText(place.displayName?.text || ''),
          niche,
          city: placeCity,
          country,
          district,
          address: cleanText(place.formattedAddress || ''),
          phone: normalizePhoneField(place.internationalPhoneNumber || place.nationalPhoneNumber || '', {
            city: placeCity,
            country,
            regionCode
          }),
          website_url: cleanText(place.websiteUri || ''),
          source: 'google_places_api',
          source_profile: cleanText(place.googleMapsUri || ''),
          review_count: parseNumber(place.userRatingCount),
          rating: parseNumber(place.rating),
          status: place.businessStatus === 'OPERATIONAL' ? 'active' : cleanText(place.businessStatus || ''),
          services: [niche],
          physical_location: true,
          notes: cleanText(
            `Non-AI discovery from Google Places Text Search; source_focus=${sourceFocus}; types=${(place.types || [])
              .slice(0, 6)
              .join(';')}`
          )
        };
      })
      .filter((company) => company.company);

    collected.push(...pageCompanies);
    pageCount += 1;
    console.log(
      `[google_places] query="${textQuery}" page=${pageCount} returned=${rawCount} after_operational_filter=${pageCompanies.length} total_collected=${collected.length}`
    );

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
    // Google requires a short delay before a pageToken becomes valid.
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const dedupedCompanies = uniqueCompanies(collected).slice(0, limit);
  if (!dedupedCompanies.length && lastError) throw lastError;

  return {
    source: 'google_places_api',
    queries: [textQuery],
    warnings: pageToken && dedupedCompanies.length >= limit ? ['Google Places has more results than the requested limit; increase limit to fetch more.'] : [],
    companies: dedupedCompanies
  };
}

async function discoverCompaniesFromPublicSearchExpanded({ niche, city, district, limit, sourceFocus, onProgress }) {
  if (district) {
    return discoverCompaniesFromPublicSearch({ niche, city, district, limit, sourceFocus });
  }

  const districtQueries = isWarsawCity(city) ? ['', ...DEFAULT_WARSAW_DISTRICTS.slice(0, 8)] : [''];
  const queryNiches = buildSearchPhrasesForNiche(niche);
  const queryPlans = queryNiches.flatMap((queryNiche) => districtQueries.map((districtName) => ({ queryNiche, districtName })));
  const discoveries = [];
  const warnings = [];
  const perDistrictLimit = Math.min(24, Math.max(8, Math.ceil(limit / Math.min(queryPlans.length, 8))));

  for (const { queryNiche, districtName } of queryPlans) {
    const collectedCount = uniqueCompanies(discoveries.flatMap((item) => item.companies || [])).length;
    if (collectedCount >= limit) break;

    try {
      discoveries.push(
        await discoverCompaniesFromPublicSearch({
          niche: queryNiche,
          city,
          district: districtName,
          limit: perDistrictLimit,
          sourceFocus
        })
      );
      if (typeof onProgress === 'function') {
        const partial = mergeDiscoveries(discoveries, limit);
        onProgress({
          niche,
          source: `public_search_${sourceFocus}`,
          companies: partial.companies || [],
          queries: partial.queries || [],
          warnings: partial.warnings || [],
          foundSoFar: partial.companies?.length || 0,
          count: partial.companies?.length || 0,
          message: `Публичный поиск: найдено ${partial.companies?.length || 0}`
        });
      }
    } catch (error) {
      warnings.push(`Public search skipped ${districtName || city}: ${error.message || 'unknown error'}`);
    }
  }

  const merged = mergeDiscoveries(discoveries, limit);
  return {
    ...merged,
    source: merged.source || `public_search_${sourceFocus}`,
    warnings: unique([...warnings, ...(merged.warnings || [])]).slice(0, 30)
  };
}

async function discoverCompaniesFromPublicSearch({ niche, city, district, limit, sourceFocus }) {
  const maxResults = Math.min(limit, 20);
  const focusTerms = {
    internet: 'firma kontakt strona telefon email -allegro -olx -castorama -mediaexpert -obi -blog',
    all_sources: 'firma kontakt strona telefon email opinie -allegro -olx -castorama -mediaexpert -obi -blog',
    directories: 'katalog firm profil kontakt',
    booking: 'Booksy Fixly Oferteo ZnanyLekarz profil',
    social: 'Instagram Facebook profil kontakt'
  };
  const query = [niche, district, city, focusTerms[sourceFocus] || focusTerms.internet]
    .filter(Boolean)
    .join(' ');
  const queryVariants = unique([
    query,
    ['site:panoramafirm.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
    ['site:oferteo.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
    ['site:fixly.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
    [niche, district, city, 'usługi firma kontakt telefon'].filter(Boolean).join(' '),
    [niche, district, city, 'montaż serwis kontakt'].filter(Boolean).join(' '),
    ['site:.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' ')
  ]).slice(0, sourceFocus === 'all_sources' || sourceFocus === 'internet' ? 7 : 2);
  const ddgUrl = `https://duckduckgo.com/html/?${new URLSearchParams({ q: queryVariants[0] })}`;
  const bingUrls = queryVariants.map(
    (variant) => `https://www.bing.com/search?${new URLSearchParams({ q: variant, count: String(maxResults) })}`
  );
  const searchUrls = unique([ddgUrl, ...bingUrls]);
  const warnings = [];
  const companies = [];

  for (const searchUrl of searchUrls) {
    if (companies.length >= maxResults) break;
    const isDuckDuckGo = searchUrl.includes('duckduckgo.com');

    if (isDuckDuckGo && !canUseDuckDuckGo()) {
      warnings.push('DuckDuckGo skipped: request budget/cooldown active after previous rate-limit; using Bing instead.');
      continue;
    }

    try {
      const html = await fetchText(searchUrl, 8_000);

      if (isDuckDuckGo && isDuckDuckGoBlockedHtml(html)) {
        registerDuckDuckGoBlock();
        warnings.push('DuckDuckGo blocked this run (anomaly/rate-limit page detected); falling back to Bing for remaining queries.');
        continue;
      }

      const $ = cheerio.load(html);
      const elements = $(isDuckDuckGo ? '.result' : '.b_algo').toArray();
      for (const element of elements) {
        if (companies.length >= maxResults) break;
        const title = cleanText(
          isDuckDuckGo ? $(element).find('.result__a').first().text() : $(element).find('h2').first().text()
        );
        const href = normalizeSearchResultUrl(
          isDuckDuckGo
            ? $(element).find('.result__a').first().attr('href') || ''
            : $(element).find('h2 a').first().attr('href') || ''
        );
        if (!title || !href) continue;

        const type = classifyUrlType(href);
        if (!isAllowedPublicSearchResult(href, title, sourceFocus, type)) continue;

        const snippet = cleanText(
          isDuckDuckGo
            ? $(element).find('.result__snippet').first().text()
            : $(element).find('.b_caption p, .b_snippet').first().text()
        );
        const evidence = cleanText(`${title} ${snippet}`);
        const hasExplicitCityEvidence = isSearchEvidenceLocalToCity(`${evidence} ${href}`, city);
        if (hasConflictingCityEvidence(`${evidence} ${href}`, city)) continue;
        if (!hasExplicitCityEvidence && !['directory', 'social'].includes(type)) continue;
        const company = inferCompanyNameFromSearchTitle(title, niche, city, href);
        if (!company) continue;

        const host = safeHostname(href);
        companies.push({
          company,
          niche: inferNicheFromSearchResult(evidence, niche),
          city: city || 'Warszawa',
          district: district || '',
          phone: extractPhones(evidence, { city, country: discoveryContext.country }).join('; '),
          email: extractEmails(evidence).join('; '),
          website_url: ['official_candidate', 'free_subdomain'].includes(type) ? href : '',
          source: `public_search_${sourceFocus}`,
          source_profile: href,
          instagram: host.includes('instagram.com') ? href : '',
          facebook: host.includes('facebook.com') || host.includes('fb.com') ? href : '',
          services: parseList(String(niche || '').replace(/,\s*/g, ';')),
          physical_location: true,
          notes: snippet || `Public search result from ${host}`
        });
      }
    } catch (error) {
      warnings.push(`Public search skipped ${isDuckDuckGo ? 'DuckDuckGo' : 'Bing'}: ${error.message || 'unknown error'}`);
    }
  }


  const uniqueFoundCompanies = uniqueCompanies(companies).slice(0, limit);
  const enriched = await enrichDiscoveredCompanyContacts(uniqueFoundCompanies, { limit: Math.min(limit, 24), warnings });

  const usableCompanies = enriched.filter(
    (company) =>
      company.phone ||
      company.email ||
      company.website_url ||
      company.instagram ||
      company.facebook
  );

  return {
    source: `public_search_${sourceFocus}`,
    queries: searchUrls,
    warnings,
    companies: usableCompanies.slice(0, limit)
  };
}

async function discoverCompaniesFromPublicRegistries({ niche, city, district, limit }) {
  const registryQueries = unique([
    ['site:aplikacja.ceidg.gov.pl/CEIDG/CEIDG.Public.UI', niche, district, city].filter(Boolean).join(' '),
    ['site:aplikacja.ceidg.gov.pl', niche, district, city, 'CEIDG firma'].filter(Boolean).join(' '),
    ['site:rejestr.io', niche, district, city, 'firma'].filter(Boolean).join(' '),
    ['site:aleo.com/pl/firmy', niche, district, city].filter(Boolean).join(' '),
    ['site:panoramafirm.pl', niche, district, city, 'NIP REGON'].filter(Boolean).join(' '),
    [niche, district, city, 'CEIDG NIP REGON firma kontakt'].filter(Boolean).join(' ')
  ]);
  const searchUrls = registryQueries.flatMap((query) => [
    `https://www.bing.com/search?${new URLSearchParams({ q: query, count: String(Math.min(limit, 12)) })}`
  ]);
  const warnings = [];
  const companies = [];

  for (const searchUrl of searchUrls) {
    if (companies.length >= limit) break;
    try {
      const html = await fetchText(searchUrl, 8_000);
      const $ = cheerio.load(html);
      for (const element of $('.b_algo').toArray()) {
        if (companies.length >= limit) break;
        const title = cleanText($(element).find('h2').first().text());
        const href = normalizeSearchResultUrl($(element).find('h2 a').first().attr('href') || '');
        if (!title || !href) continue;
        const host = safeHostname(href);
        if (!host) continue;
        if (!/(ceidg|rejestr|aleo|panoramafirm|pkt|cylex|oferteo)/i.test(host)) continue;
        const snippet = cleanText($(element).find('.b_caption p, .b_snippet').first().text());
        const evidence = cleanText(`${title} ${snippet} ${href}`);
        if (!isSearchEvidenceLocalToCity(evidence, city)) continue;
        const company = inferCompanyNameFromSearchTitle(title, niche, city, href) || companyNameFromHost(href);
        if (!company) continue;
        companies.push({
          company,
          niche: inferNicheFromSearchResult(evidence, niche),
          city: city || 'Warszawa',
          district: district || '',
          phone: extractPhones(evidence, { city, country: discoveryContext.country }).join('; '),
          email: extractEmails(evidence).join('; '),
          nip: (evidence.match(/\b\d{10}\b/) || [''])[0],
          regon: (evidence.match(/\b\d{9}\b/) || [''])[0],
          website_url: '',
          source: 'public_registry_search',
          source_profile: href,
          services: parseList(String(niche || '').replace(/,\s*/g, ';')),
          physical_location: true,
          notes: snippet || `Public registry result from ${host}`
        });
      }
    } catch (error) {
      warnings.push(`Public registry search skipped: ${error.message || 'unknown error'}`);
    }
  }

  const uniqueFoundCompanies = uniqueCompanies(companies).slice(0, limit);
  const enriched = await enrichDiscoveredCompanyContacts(uniqueFoundCompanies, { limit: Math.min(limit, 20), warnings });
  if (enriched.length < Math.min(5, limit)) {
    const fallback = await discoverCompaniesFromPublicSearchExpanded({
      niche,
      city,
      district,
      limit,
      sourceFocus: 'all_sources'
    });
    const merged = mergeDiscoveries(
      [
        {
          source: 'public_registry_search',
          queries: searchUrls,
          warnings,
          companies: enriched
        },
        fallback
      ],
      limit
    );
    return {
      ...merged,
      source: 'public_registry_search,public_contact_fallback',
      warnings: unique([
        ...warnings,
        'Public CEIDG pages were not accessible/indexed for this query; used public contact fallback.',
        ...(merged.warnings || [])
      ])
    };
  }
  return {
    source: 'public_registry_search',
    queries: searchUrls,
    warnings,
    companies: enriched.slice(0, limit)
  };
}

async function enrichPrimaryCompaniesSmart(primaryCompanies, { warnings = [] } = {}) {
  const baseCompanies = await enrichDiscoveredCompanyContacts(uniqueCompanies(primaryCompanies), {
    limit: Math.min(primaryCompanies.length, 30),
    warnings
  });

  return mapLimit(baseCompanies, 3, async (company) => {
    try {
      return await withTimeout(
        crossVerifyPrimaryCompany(company, warnings),
        CROSS_VERIFY_TIMEOUT_MS,
        `Cross-check timeout after ${Math.round(CROSS_VERIFY_TIMEOUT_MS / 1000)}s`
      );
    } catch (error) {
      warnings.push(`Cross-check skipped ${company.company || company.source_profile || 'company'}: ${error.message || 'unknown error'}`);
      return company;
    }
  });
}

async function crossVerifyPrimaryCompany(company, warnings) {
  let current = { ...company };
  const needsRegistry = !current.nip && !current.regon;
  const needsContacts = !current.phone || !current.email || !current.website_url;

  if (!needsRegistry && !needsContacts) {
    return current;
  }

  const city = current.city || discoveryContext.city || 'Warszawa';
  const district = current.district || '';
  const candidates = [];

  if (needsContacts && AWS_LOCATION_API_KEY) {
    try {
      const amazonMatches = await discoverCompaniesFromAmazonLocation({
        niche: current.company,
        city,
        district,
        limit: 5,
        sourceFocus: 'all_sources'
      });
      candidates.push(...(amazonMatches.companies || []));
    } catch (error) {
      warnings.push(`Amazon cross-check skipped ${current.company || city}: ${error.message || 'unknown error'}`);
    }
  }

  if (needsRegistry) {
    try {
      const registryMatches = await discoverCompaniesFromPublicRegistries({
        niche: current.company,
        city,
        district,
        limit: 5
      });
      candidates.push(...(registryMatches.companies || []));
    } catch (error) {
      warnings.push(`Registry cross-check skipped ${current.company || city}: ${error.message || 'unknown error'}`);
    }
  }

  if (needsContacts) {
    try {
      const publicMatches = await discoverCompaniesFromPublicSearch({
        niche: current.company,
        city,
        district,
        limit: 5,
        sourceFocus: 'internet'
      });
      candidates.push(...(publicMatches.companies || []));
    } catch (error) {
      warnings.push(`Public search cross-check skipped ${current.company || city}: ${error.message || 'unknown error'}`);
    }
  }

  const bestMatch = pickBestCompanyMatch(current, candidates);
  if (!bestMatch) {
    return current;
  }

  current = mergeCompanyEvidence(current, bestMatch);
  if (needsContacts && (current.source_profile || current.website_url)) {
    try {
      current = await enrichOneDiscoveredCompany(current);
    } catch (error) {
      warnings.push(`Final site crawl skipped ${current.company || city}: ${error.message || 'unknown error'}`);
    }
  }

  return current;
}

function pickBestCompanyMatch(targetCompany, candidates) {
  let best = null;
  let bestScore = 0;

  for (const candidate of candidates || []) {
    const score = scoreCompanyMatch(targetCompany, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return bestScore >= 45 ? best : null;
}

function scoreCompanyMatch(targetCompany, candidate) {
  if (!candidate) return 0;

  let score = 0;
  const targetName = normalizeSearchText(targetCompany.company || targetCompany.legal_name || '');
  const candidateName = normalizeSearchText(candidate.company || candidate.legal_name || '');
  const targetAddress = normalizeSearchText(targetCompany.address || '');
  const candidateAddress = normalizeSearchText(candidate.address || '');
  const targetWebsiteHost = safeHostname(targetCompany.website_url || targetCompany.source_profile || '');
  const candidateWebsiteHost = safeHostname(candidate.website_url || candidate.source_profile || '');
  const targetCity = normalizeSearchText(targetCompany.city || '');
  const candidateCity = normalizeSearchText(candidate.city || '');

  if (targetName && candidateName) {
    if (targetName === candidateName) score += 50;
    else if (targetName.includes(candidateName) || candidateName.includes(targetName)) score += 35;
    else {
      const overlap = tokenOverlapRatio(targetName, candidateName);
      score += Math.round(overlap * 30);
    }
  }

  if (targetCompany.phone && candidate.phone && phoneMatches(splitPhoneValues(candidate.phone), targetCompany.phone)) {
    score += 35;
  }

  if (targetAddress && candidateAddress) {
    if (targetAddress === candidateAddress) score += 25;
    else if (addressMatches(targetCompany.address, candidateAddress)) score += 12;
  }

  if (targetWebsiteHost && candidateWebsiteHost && targetWebsiteHost === candidateWebsiteHost) {
    score += 30;
  }

  if (targetCity && candidateCity && targetCity === candidateCity) {
    score += 5;
  }

  return score;
}

function tokenOverlapRatio(left, right) {
  const leftTokens = new Set(String(left || '').split(/\s+/).filter((token) => token.length >= 4));
  const rightTokens = new Set(String(right || '').split(/\s+/).filter((token) => token.length >= 4));
  if (!leftTokens.size || !rightTokens.size) return 0;
  const matches = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return matches / Math.max(leftTokens.size, rightTokens.size);
}

function mergeCompanyEvidence(targetCompany, evidenceCompany) {
  const merged = { ...targetCompany };

  if (!merged.phone && evidenceCompany.phone) merged.phone = evidenceCompany.phone;
  if (!merged.email && evidenceCompany.email) merged.email = evidenceCompany.email;
  if ((!merged.website_url || isKnownNonCompanyHost(safeHostname(merged.website_url))) && evidenceCompany.website_url) {
    merged.website_url = evidenceCompany.website_url;
  }
  if (!merged.nip && evidenceCompany.nip) merged.nip = evidenceCompany.nip;
  if (!merged.regon && evidenceCompany.regon) merged.regon = evidenceCompany.regon;
  if (!merged.krs && evidenceCompany.krs) merged.krs = evidenceCompany.krs;
  if (!merged.source_profile && evidenceCompany.source_profile) merged.source_profile = evidenceCompany.source_profile;

  const socialProfiles = {
    instagram: merged.instagram || merged.social_profiles?.instagram || evidenceCompany.instagram || evidenceCompany.social_profiles?.instagram || '',
    facebook: merged.facebook || merged.social_profiles?.facebook || evidenceCompany.facebook || evidenceCompany.social_profiles?.facebook || '',
    tiktok: merged.tiktok || merged.social_profiles?.tiktok || evidenceCompany.tiktok || evidenceCompany.social_profiles?.tiktok || ''
  };

  merged.instagram = socialProfiles.instagram;
  merged.facebook = socialProfiles.facebook;
  merged.tiktok = socialProfiles.tiktok;
  merged.social_profiles = socialProfiles;
  merged.notes = unique([
    cleanText(targetCompany.notes || ''),
    cleanText(evidenceCompany.notes || ''),
    evidenceCompany.source ? `cross-check: ${evidenceCompany.source}` : ''
  ]).join(' | ');

  return merged;
}

async function enrichDiscoveredCompanyContacts(companies, { limit, warnings }) {
  const targetCount = Math.min(limit || companies.length, companies.length);
  const enriched = await mapLimit(companies.slice(0, targetCount), 4, async (company) => {
    try {
      return await enrichOneDiscoveredCompany(company);
    } catch (error) {
      warnings.push(`Contact enrichment skipped ${company.company || company.source_profile || 'company'}: ${error.message || 'unknown error'}`);
      return company;
    }
  });
  return [...enriched, ...companies.slice(targetCount)];
}

async function enrichOneDiscoveredCompany(company) {
  const urls = unique([company.website_url, company.source_profile].map(safeUrl).filter(Boolean)).slice(0, 2);
  if (!urls.length) return company;

  const pages = [];
  for (const url of urls) {
    const page = await fetchPage(url);
    if (!page.ok) continue;
    pages.push(extractPage(page.finalUrl || page.url, page.html, page.elapsedMs || 0));
  }
  if (!pages.length) return company;

  const signals = combineSignals(pages);
  const initialWebsite = isKnownNonCompanyHost(safeHostname(company.website_url)) ? '' : company.website_url;
  const officialWebsite =
    initialWebsite ||
    pickOfficialWebsiteFromSourcePages(pages, {
      sourceUrl: company.source_profile,
      companyName: company.company,
      niche: company.niche
    });
  const phoneContext = { city: company.city, country: company.country || discoveryContext.country };
  const phones = unique(
    [company.phone, ...(signals.phones || []), ...(signals.telLinks || [])].flatMap((value) =>
      splitPhoneValues(value, phoneContext)
    )
  );
  const emails = unique([company.email, ...(signals.emails || []), ...(signals.mailLinks || [])].flatMap((value) => String(value || '').split(/[;,|]/)).map((value) => cleanText(value).toLowerCase()).filter(Boolean));
  const notes = [
    company.notes,
    signals.hasTelLink ? 'tel link found' : '',
    signals.hasMailLink ? 'mail link found' : '',
    officialWebsite && officialWebsite !== company.website_url ? `official website candidate: ${officialWebsite}` : ''
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    ...company,
    phone: phones.slice(0, 3).join('; '),
    email: emails.slice(0, 3).join('; '),
    website_url: officialWebsite || initialWebsite || '',
    contact_enriched: true,
    notes
  };
}

function pickOfficialWebsiteFromSourcePages(pages, { sourceUrl, companyName, niche }) {
  const sourceHost = safeHostname(sourceUrl);
  const links = pages.flatMap((page) => page.links || []);
  const candidates = [];
  for (const link of links) {
    const href = safeUrl(link.href);
    if (!href) continue;
    const host = safeHostname(href);
    if (!host || host === sourceHost) continue;
    if (isKnownNonCompanyHost(host)) continue;
    const type = classifyUrlType(href);
    if (type === 'marketplace' || type === 'social' || type === 'directory') continue;
    const text = normalizeSearchText(`${link.text} ${href}`);
    const companyScore = scoreNicheFit(companyName || '', text);
    const nicheScore = scoreNicheFit(niche || '', text);
    const contactHint = /www|strona|website|site|kontakt|contact|firma/i.test(`${link.text} ${href}`) ? 10 : 0;
    candidates.push({ href, score: companyScore + nicheScore + contactHint });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.score >= 10 ? candidates[0].href : '';
}

function isKnownNonCompanyHost(host) {
  if (!host) return true;
  if (host.includes('google.') || host.includes('bing.') || host.includes('duckduckgo.')) return true;
  if (contactDiscoveryDomains.has(host)) return true;
  if ([...contactDiscoveryDomains].some((domain) => host.includes(domain))) return true;
  return [
    'youtube.com',
    'youtu.be',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'instagram.com',
    'facebook.com',
    'maps.google',
    'trustpilot',
    'apps.apple.com',
    'play.google.com',
    'schema.org'
  ].some((domain) => host.includes(domain));
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 AuraParser/1.0',
        accept: 'text/html,application/xhtml+xml'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('timeout');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeSearchResultUrl(rawHref) {
  const direct = safeUrl(String(rawHref || '').startsWith('//') ? `https:${rawHref}` : rawHref);
  if (!direct) return '';
  try {
    const url = new URL(direct);
    const redirected = url.searchParams.get('uddg') || url.searchParams.get('u') || url.searchParams.get('url');
    return safeUrl(decodeBingRedirectUrl(redirected)) || safeUrl(redirected) || direct;
  } catch {
    return direct;
  }
}

function decodeBingRedirectUrl(value) {
  const raw = String(value || '');
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const candidate = raw.startsWith('a1') ? raw.slice(2) : raw;
  try {
    const decoded = Buffer.from(candidate, 'base64').toString('utf8');
    return /^https?:\/\//i.test(decoded) ? decoded : '';
  } catch {
    return '';
  }
}

function isAllowedPublicSearchResult(url, title, sourceFocus, type) {
  const host = safeHostname(url);
  if (!host || host.includes('bing.com') || host.includes('google.com/search')) return false;
  if (type === 'marketplace') return false;
  if (host.endsWith('.edu.pl') || host.includes('.uw.edu.pl')) return false;
  if (
    [
      'mediaexpert',
      'euro.com.pl',
      'mediamarkt',
      'allegro',
      'castorama',
      'obi.',
      'ceneo',
      'empik',
      'amazon',
      'olx',
      'autocentrum',
      'autotrader',
      'autoscout24',
      'auto.pl',
      'bazos',
      'mgprojekt',
      'mp.pl',
      'remontytv',
      'zleca.pl',
      'budujemydom.pl',
      'komputerswiat.pl',
      'leroymerlin.pl',
      'tauron.pl',
      'murator',
      'homebook.pl',
      'wyborcza.pl',
      'onet.pl',
      'wp.pl',
      'interia.pl',
      'money.pl',
      'businessinsider',
      'rankomat',
      'trustpilot',
      'apps.apple.com',
      'play.google.com',
      'icloud.com',
      'apple.com',
      'poki.com',
      'crazygames.com',
      'playhop.com',
      'ttt4.com',
      'plix.gg',
      'microsoft.com'
    ].some((part) => host.includes(part))
  ) {
    return false;
  }
  if (/ranking|najlepsz|top\s*\d+|cennik|praca|forum|youtube|wikipedia|blog|poradnik|rodzaje|kategoria|sprawdź|samochody osobowe|oferty|używane|sprzedam|praktyczna|wydział|uniwersytet|\btv\b/i.test(title)) return false;
  if (/cena|koszt|ile kosztuje|produkty|sklep|hurtownia/i.test(title)) return false;
  if (sourceFocus === 'social') return type === 'social';
  if (sourceFocus === 'directories') return type === 'directory';
  if (sourceFocus === 'booking') {
    return ['booksy', 'fixly', 'oferteo', 'znanylekarz'].some((part) => host.includes(part));
  }
  return true;
}

function isSearchEvidenceLocalToCity(text, city) {
  const normalizedCity = normalizeSearchText(city || '');
  if (!normalizedCity || normalizedCity === 'warszawa') {
    const value = normalizeSearchText(text);
    return value.includes('warszaw') || value.includes('warsaw');
  }
  return normalizeSearchText(text).includes(normalizedCity);
}

function hasConflictingCityEvidence(text, city) {
  const value = normalizeSearchText(text);
  const normalizedCity = normalizeSearchText(city || '');
  if (!normalizedCity || normalizedCity === 'warszawa') {
    if (value.includes('warszaw') || value.includes('warsaw')) return false;
    return [
      'poznan',
      'krakow',
      'wroclaw',
      'gdansk',
      'lodz',
      'lublin',
      'katowice',
      'tychy',
      'bialystok',
      'szczecin',
      'rzeszow',
      'bydgoszcz',
      'torun'
    ].some((name) => value.includes(name));
  }
  return false;
}

function inferCompanyNameFromSearchTitle(title, niche, city, href = '') {
  const cleaned = cleanText(title)
    .replace(/^["'„”]+|["'„”,]+$/g, '')
    .replace(/\s*\|\s*.*$/g, '')
    .replace(/\s+-\s+(Strona główna|Facebook|Instagram|Kontakt).*$/i, '')
    .replace(/\s+-\s+(Warszawa|Mokotów|firmy|opinie).*$/i, '')
    .trim();
  const firstPart = cleaned.split(/\s+[–—-]\s+|\s+:\s+/).map(cleanText).find(Boolean) || cleaned;
  if (!firstPart || firstPart.length < 2) return '';
  const generic = normalizeSearchText(`${niche} ${city} firma kontakt strona najlepsze`);
  const candidate = firstPart
    .replace(/\b(Warszawa|Mokotów|kontakt|strona|firma)\b/gi, '')
    .replace(/["'„”]/g, '')
    .replace(/^["'„”]+|["'„”,]+$/g, '')
    .trim();
  if (!candidate) return '';
  if (generic.includes(normalizeSearchText(candidate))) return companyNameFromHost(href);
  if (/montaż|serwis|klimatyzator|od \d|internetowa|wydział|uniwersytet/i.test(candidate)) {
    return companyNameFromHost(href);
  }
  return candidate.replace(/[,\s.:-]+$/g, '').slice(0, 90);
}

function companyNameFromHost(href) {
  const host = safeHostname(href);
  const base = host.split('.')[0] || '';
  if (!base || base.length < 3) return '';
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, 90);
}

function inferNicheFromSearchResult(text, fallback) {
  const normalized = normalizeSearchText(text);
  const hints = [
    ['klimatyz', 'Klimatyzacja'],
    ['detailing', 'Auto detailing'],
    ['stomatolog', 'Stomatologia'],
    ['fizjoter', 'Fizjoterapia'],
    ['kosmet', 'Salon kosmetyczny'],
    ['remont', 'Remonty i wykończenia wnętrz'],
    ['ksiegow', 'Księgowość'],
    ['serwis auto', 'Auto serwis']
  ];
  return hints.find(([needle]) => normalized.includes(needle))?.[1] || String(fallback || '').split(',')[0].trim();
}

async function discoverCompaniesFromOpenAIInternet({ niche, city, district, limit, sourceFocus }) {
  if (!openai) {
    throw new Error('OPENAI_API_KEY не настроен.');
  }

  const maxCompanies = Math.min(limit, 10);
  const query = [niche, district, city, 'firmy kontakt strona instagram'].filter(Boolean).join(' ');
  const focusHints = {
    internet: 'Use public websites, company pages, directories, booking pages and social profiles as discovery sources.',
    directories: 'Prioritize public directories and company catalog pages.',
    booking: 'Prioritize booking/service platforms such as Booksy, Fixly, ZnanyLekarz, Oferteo where relevant.',
    social: 'Prioritize Instagram, Facebook, TikTok and other public social profiles.',
    all_sources: 'Use broad public internet sources. Google Places may be unavailable, so use non-Google public results too.'
  };

  const input = [
    {
      role: 'system',
      content:
        'Find real, active local companies in the requested city and category from public internet sources. Return only valid JSON. Do not invent companies. Each company must have at least one source URL, official website, public profile, phone, email or address.'
    },
    {
      role: 'user',
      content: JSON.stringify(
        {
          task: 'Find companies that may need a website or website audit, then return structured lead data.',
          category: niche,
          city,
          district,
          source_focus: sourceFocus,
          source_hint: focusHints[sourceFocus] || focusHints.internet,
          max_companies: maxCompanies,
          required_output_shape: {
            companies: [
              {
                company: 'name',
                niche: 'category',
                city: city || 'city',
                district: 'district if known',
                address: 'address if known',
                phone: 'phone if public',
                email: 'email if public',
                website_url: 'official website if found',
                source_profile: 'public source URL used',
                instagram: 'instagram URL if found',
                facebook: 'facebook URL if found',
                review_count: 'number if known',
                rating: 'number if known',
                last_activity: 'date or signal if known',
                services: ['service 1', 'service 2'],
                notes: 'short evidence and why this is a real active company'
              }
            ]
          }
        },
        null,
        2
      )
    }
  ];
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['companies'],
    properties: {
      companies: {
        type: 'array',
        maxItems: maxCompanies,
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'company',
            'niche',
            'city',
            'district',
            'address',
            'phone',
            'email',
            'website_url',
            'source_profile',
            'instagram',
            'facebook',
            'review_count',
            'rating',
            'last_activity',
            'services',
            'notes'
          ],
          properties: {
            company: { type: 'string' },
            niche: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website_url: { type: 'string' },
            source_profile: { type: 'string' },
            instagram: { type: 'string' },
            facebook: { type: 'string' },
            review_count: { type: 'string' },
            rating: { type: 'string' },
            last_activity: { type: 'string' },
            services: {
              type: 'array',
              items: { type: 'string' }
            },
            notes: { type: 'string' }
          }
        }
      }
    }
  };

  const response = await openai.responses.create({
    model: SEARCH_MODEL,
    tools: [{ type: 'web_search' }],
    input,
    max_output_tokens: 6000,
    text: {
      format: {
        type: 'json_schema',
        name: 'internet_company_discovery',
        strict: true,
        schema
      }
    }
  });

  let parsed;
  try {
    parsed = parseLooseJson(response.output_text);
  } catch {
    const repaired = await openai.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: 'system',
          content: 'Repair the user content into valid JSON matching the provided schema. Do not add new companies.'
        },
        {
          role: 'user',
          content: response.output_text || ''
        }
      ],
      max_output_tokens: 6000,
      text: {
        format: {
          type: 'json_schema',
          name: 'internet_company_discovery_repaired',
          strict: true,
          schema
        }
      }
    });
    parsed = parseLooseJson(repaired.output_text);
  }
  const rows = Array.isArray(parsed.companies) ? parsed.companies : [];
  const companies = rows
    .map((row) => ({
      company: cleanText(row.company || row.company_name || row.name || row.title || ''),
      niche: cleanText(row.niche || row.category || niche),
      city: cleanText(row.city || city || 'Warszawa'),
      district: cleanText(row.district || district || ''),
      address: cleanText(row.address || ''),
      phone: normalizePhoneField(row.phone || '', { city: cleanText(row.city || city || 'Warszawa'), country: discoveryContext.country }),
      email: cleanText(row.email || '').toLowerCase(),
      website_url: cleanText(row.website_url || row.website || ''),
      source: `openai_web_search_${sourceFocus}`,
      source_profile: cleanText(row.source_profile || row.source_url || row.url || ''),
      instagram: cleanText(row.instagram || ''),
      facebook: cleanText(row.facebook || ''),
      review_count: parseNumber(row.review_count || row.reviews),
      rating: parseNumber(row.rating),
      last_activity: cleanText(row.last_activity || ''),
      services: parseList(row.services || niche),
      physical_location: true,
      notes: cleanText(row.notes || `Internet discovery query: ${query}`)
    }))
    .filter((company) => company.company && (company.source_profile || company.website_url || company.phone || company.email));

  return {
    source: `openai_web_search_${sourceFocus}`,
    queries: [query],
    warnings: rows.length && !companies.length ? ['OpenAI web search returned rows, but none had enough source data.'] : [],
    companies: uniqueCompanies(companies).slice(0, limit)
  };
}

async function discoverCompaniesFromCeidg({ niche, city, district, limit }) {
  const params = new URLSearchParams();
  if (city) params.set('miasto', city);
  if (niche) params.set('nazwa', niche);
  params.set('status', 'AKTYWNY');

  const response = await fetch(`${CEIDG_ENDPOINT}?${params.toString()}`, {
    headers: {
      authorization: `Bearer ${CEIDG_TOKEN}`,
      accept: 'application/json',
      'user-agent': USER_AGENT
    }
  });
  const text = await response.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `CEIDG API error ${response.status}`);
  }

  const rows = extractArrayFromApiResponse(data).slice(0, limit);
  const companies = rows
    .map((row) => ({
      company: cleanText(firstValue(row, ['nazwa', 'nazwaFirmy', 'firma.nazwa', 'name', 'company'])),
      legal_name: cleanText(firstValue(row, ['nazwa', 'nazwaFirmy', 'firma.nazwa'])),
      niche,
      city: cleanText(firstValue(row, ['adresDzialalnosci.miasto', 'adres.miasto', 'miasto'])) || city,
      district,
      address: cleanText(
        firstValue(row, [
          'adresDzialalnosci.adres',
          'adresDzialalnosci.ulica',
          'adres.ulica',
          'adres',
          'address'
        ])
      ),
      nip: cleanIdentifier(firstValue(row, ['nip', 'wlasciciel.nip'])),
      regon: cleanIdentifier(firstValue(row, ['regon'])),
      status: cleanText(firstValue(row, ['status', 'statusWpisu'])) || 'active',
      registration_date: cleanText(firstValue(row, ['dataRozpoczecia', 'dataRozpoczeciaDzialalnosci'])),
      source: 'ceidg_api',
      source_profile: '',
      services: [niche],
      notes: 'Non-AI discovery from CEIDG API. Add Google Places or CSV enrichment for phone, reviews and website.'
    }))
    .filter((company) => company.company || company.nip || company.regon);

  return {
    source: 'ceidg_api',
    queries: [`${CEIDG_ENDPOINT}?${params.toString()}`],
    warnings: [
      'CEIDG обычно дает юридические данные, но не всегда телефон, отзывы или сайт. Для карты и отзывов подключите GOOGLE_PLACES_API_KEY.'
    ],
    companies
  };
}

function extractArrayFromApiResponse(data) {
  if (Array.isArray(data)) return data;
  for (const key of ['firmy', 'items', 'results', 'data', 'content']) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  for (const value of Object.values(data || {})) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function firstValue(object, paths) {
  for (const pathName of paths) {
    const value = pathName.split('.').reduce((current, key) => current?.[key], object);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

async function analyzeLead(item, options) {
  const websiteResolution = await resolveWebsite(item, options);
  const parsed = websiteResolution.selectedUrl
    ? await parseWebsite(websiteResolution.selectedUrl)
    : {
        ok: false,
        error: websiteResolution.websiteStatus === 'BROKEN_WEBSITE' ? 'Домен есть, но сайт не открывается' : 'Сайт не найден',
        normalizedUrl: websiteResolution.selectedUrl || '',
        pages: [],
        signals: emptySignals()
      };

  if (parsed.ok) {
    websiteResolution.domainVerification = verifyDomain(item, parsed, websiteResolution.selectedUrl);
    websiteResolution.websiteStatus = classifyFoundWebsite(item, parsed, websiteResolution);
    websiteResolution.websiteConfidence = Math.max(
      websiteResolution.websiteConfidence,
      websiteResolution.domainVerification.confidence
    );
  }

  const heuristic = buildHeuristicAnalysis(item, parsed, websiteResolution);
  let ai = null;
  let aiError = null;

  if (options.useAi) {
    try {
      ai = await analyzeWithOpenAI(item, parsed, heuristic, websiteResolution, options.model);
    } catch (error) {
      aiError = error.message || 'OpenAI analysis failed';
      console.error('OpenAI analysis failed:', aiError);
    }
  }

  const analysis = mergeAnalysis(heuristic, ai);

  return {
    id: cryptoRandomId(),
    input: item,
    websiteResolution,
    parsed,
    heuristic,
    ai,
    aiError,
    aiSiteAnalysis: {
      status: 'NOT_REQUESTED',
      version: 1,
      analyzed_at: '',
      company_data_version: 1
    },
    analysis
  };
}

async function resolveWebsite(item, options) {
  const checks = {
    listed_website: false,
    registry_website: false,
    email_domain_found: false,
    name_search_domain: false,
    phone_search_domain: false,
    nip_search_domain: false,
    social_profile_domain: false,
    public_search_domain: false
  };
  const candidates = [];
  const socialLinks = collectSocialLinks(item);
  const profileLinks = collectProfileLinks(item);

  if (item.website_url) {
    checks.listed_website = true;
    addCandidate(candidates, item.website_url, 'listed_website', 0.78);
  }

  const emailDomain = domainFromEmail(item.email);
  if (emailDomain) {
    checks.email_domain_found = true;
    addCandidate(candidates, `https://${emailDomain}`, 'corporate_email_domain', 0.68);
  }

  for (const link of [...socialLinks, ...profileLinks]) {
    const type = classifyUrlType(link);
    if (type === 'official_candidate') {
      addCandidate(candidates, link, 'profile_link', 0.54);
    }
  }

  let webSearch = null;
  let publicWebSearch = null;
  if (!candidates.length) {
    publicWebSearch = await discoverWebsiteFromPublicSearch(item);
    for (const candidate of publicWebSearch.candidates || []) {
      addCandidate(candidates, candidate.url, 'public_website_search', candidate.confidence || 0.56, candidate.reason);
    }
    checks.name_search_domain = checks.name_search_domain || Boolean(publicWebSearch.checks?.name_search_domain);
    checks.phone_search_domain = checks.phone_search_domain || Boolean(publicWebSearch.checks?.phone_search_domain);
    checks.nip_search_domain = checks.nip_search_domain || Boolean(publicWebSearch.checks?.nip_search_domain);
    checks.public_search_domain = Boolean(publicWebSearch.candidates?.length);
  }

  if (!candidates.length && options.useWebSearch) {
    webSearch = await discoverWebsiteWithOpenAI(item, options.searchModel);
    for (const candidate of webSearch.candidates || []) {
      addCandidate(candidates, candidate.url, 'openai_web_search', 0.5, candidate.reason);
    }
    checks.name_search_domain = Boolean(webSearch.checks?.name_search_domain);
    checks.phone_search_domain = Boolean(webSearch.checks?.phone_search_domain);
    checks.nip_search_domain = Boolean(webSearch.checks?.nip_search_domain);
    checks.social_profile_domain = Boolean(webSearch.checks?.social_profile_domain);
  }

  const normalizedCandidates = uniqueCandidates(candidates);
  let selectedUrl = '';
  let selectedSource = '';
  let brokenCandidate = false;

  for (const candidate of normalizedCandidates) {
    const parsed = await parseWebsite(candidate.url, { shallow: true });
    if (parsed.ok) {
      selectedUrl = parsed.normalizedUrl || candidate.url;
      selectedSource = candidate.source;
      break;
    }
    brokenCandidate = true;
  }

  const sourceOnlyStatus = classifySourceOnly(item, socialLinks, profileLinks);
  let websiteStatus = 'UNCERTAIN';
  let websiteConfidence = 0.45;

  if (selectedUrl) {
    websiteStatus = 'WEBSITE_FOUND';
    websiteConfidence = normalizedCandidates.find((c) => c.url === selectedUrl)?.confidence || 0.62;
  } else if (brokenCandidate && normalizedCandidates.length) {
    websiteStatus = 'BROKEN_WEBSITE';
    websiteConfidence = 0.82;
  } else if (sourceOnlyStatus) {
    websiteStatus = sourceOnlyStatus;
    websiteConfidence = sourceOnlyStatus === 'SOCIAL_ONLY' ? 0.76 : 0.72;
  } else if (hasEnoughNoWebsiteChecks(item, options, webSearch)) {
    websiteStatus = 'NO_WEBSITE_CONFIRMED';
    websiteConfidence = options.useWebSearch ? 0.9 : 0.68;
  }

  return {
    selectedUrl,
    selectedSource,
    candidates: normalizedCandidates,
    publicWebSearch,
    webSearch,
    websiteStatus,
    websiteConfidence,
    checks_completed: checks,
    domainVerification: {
      score: 0,
      confidence: selectedUrl ? 0.5 : 0,
      matched: [],
      manual_review: !selectedUrl
    }
  };
}

async function discoverWebsiteFromPublicSearch(item) {
  const company = cleanText(item.company || item.legal_name || '');
  if (!company) {
    return { candidates: [], checks: {}, warnings: [], queries: [] };
  }

  const city = cleanText(item.city || discoveryContext.city || 'Warszawa');
  const country = cleanText(item.country || discoveryContext.country || '');
  const phoneTail = (splitPhoneValues(item.phone, { city, country })[0] || normalizePhone(item.phone || '')).slice(-9);
  const queryParts = [
    [`"${company}"`, city, 'strona kontakt'],
    [company, item.niche, city, 'oficjalna strona kontakt'],
    phoneTail ? [company, phoneTail, city, 'kontakt'] : [],
    item.nip ? [company, item.nip, 'strona'] : [],
    item.address ? [company, item.address, city] : []
  ];
  const queries = unique(queryParts.map((parts) => parts.filter(Boolean).join(' ').trim()).filter(Boolean)).slice(0, 4);
  const candidates = [];
  const warnings = [];
  const checks = {
    name_search_domain: false,
    phone_search_domain: false,
    nip_search_domain: false,
    address_search_domain: false
  };

  for (const query of queries) {
    const searchUrl = `https://www.bing.com/search?${new URLSearchParams({ q: query, count: '10' })}`;
    try {
      const html = await fetchText(searchUrl, 7_000);
      const $ = cheerio.load(html);
      for (const element of $('.b_algo').toArray()) {
        const title = cleanText($(element).find('h2').first().text());
        const href = normalizeSearchResultUrl($(element).find('h2 a').first().attr('href') || '');
        if (!title || !href) continue;

        const type = classifyUrlType(href);
        if (!isAllowedPublicSearchResult(href, title, 'internet', type)) continue;
        if (['social', 'directory', 'marketplace'].includes(type)) continue;

        const snippet = cleanText($(element).find('.b_caption p, .b_snippet').first().text());
        const evidence = cleanText(`${title} ${snippet} ${href}`);
        if (hasConflictingCityEvidence(evidence, city)) continue;

        const host = safeHostname(href);
        const normalizedEvidence = normalizeSearchText(evidence);
        let score = 0;
        const matched = [];

        if (domainFromEmail(item.email) && host.includes(domainFromEmail(item.email))) add('email_domain', 50);
        if (companyNameMatches(item, normalizedEvidence, host)) add('name', 42);
        if (item.phone && phoneMatches(extractPhones(evidence, { city, country }), item.phone)) add('phone', 28);
        if (item.nip && normalizedEvidence.includes(item.nip)) add('nip', 32);
        if (item.address && addressMatches(item.address, normalizedEvidence)) add('address', 18);
        if (nicheMatches(item.niche, normalizedEvidence)) add('niche', 10);
        if (isSearchEvidenceLocalToCity(evidence, city)) add('city', 8);

        if (score < 34) continue;
        checks.name_search_domain = checks.name_search_domain || matched.includes('name') || matched.includes('email_domain');
        checks.phone_search_domain = checks.phone_search_domain || matched.includes('phone');
        checks.nip_search_domain = checks.nip_search_domain || matched.includes('nip');
        checks.address_search_domain = checks.address_search_domain || matched.includes('address');
        candidates.push({
          url: href,
          confidence: clamp(0.5 + score / 180, 0.54, 0.88),
          score,
          reason: `public search: ${matched.join(', ')}; ${title}`.slice(0, 220)
        });

        function add(label, value) {
          matched.push(label);
          score += value;
        }
      }
    } catch (error) {
      warnings.push(`Website public search skipped: ${error.message || 'unknown error'}`);
    }
  }

  const byHost = new Map();
  for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
    const host = safeHostname(candidate.url);
    if (!host || byHost.has(host)) continue;
    byHost.set(host, candidate);
  }

  return {
    candidates: [...byHost.values()].slice(0, 5),
    checks,
    warnings: warnings.slice(0, 5),
    queries
  };
}

async function discoverWebsiteWithOpenAI(item, model) {
  if (!openai) return { candidates: [], checks: {} };

  const input = [
    {
      role: 'system',
      content:
        'Find whether this local business has its own official website. Use the declared city, address, phone and identifiers. Exclude directories, maps, social networks, marketplaces and booking platforms unless they are the only presence. Return only JSON.'
    },
    {
      role: 'user',
      content: JSON.stringify(
        {
          company: item.company,
          legal_name: item.legal_name,
          niche: item.niche,
          city: item.city,
          district: item.district,
          address: item.address,
          phone: item.phone,
          email: item.email,
          nip: item.nip,
          regon: item.regon,
          source_profile: item.source_profile,
          social_profiles: item.social_profiles,
          task:
            'Search by exact company name, phone, NIP/REGON and social profiles. Return official website candidates only when likely connected to this company.'
        },
        null,
        2
      )
    }
  ];

  const response = await openai.responses.create({
    model,
    tools: [{ type: 'web_search' }],
    input,
    max_output_tokens: 1300
  });

  const parsed = parseLooseJson(response.output_text);
  return {
    candidates: Array.isArray(parsed.candidates) ? parsed.candidates.slice(0, 5) : [],
    checks: parsed.checks || {},
    status_hint: parsed.status_hint || 'UNCERTAIN',
    notes: parsed.notes || ''
  };
}

async function parseWebsite(inputUrl, options = {}) {
  const candidates = buildUrlCandidates(inputUrl);
  if (!candidates.length) {
    return {
      ok: false,
      error: 'URL не указан',
      pages: [],
      signals: emptySignals()
    };
  }

  let homeResult = null;
  for (const url of candidates) {
    homeResult = await fetchPage(url);
    if (homeResult.ok) break;
  }

  if (!homeResult?.ok) {
    return {
      ok: false,
      error: homeResult?.error || 'Не удалось открыть сайт',
      normalizedUrl: candidates[0],
      pages: [],
      signals: emptySignals()
    };
  }

  const homePage = extractPage(homeResult.url, homeResult.html, homeResult.elapsedMs);
  const extraPages = [];

  if (!options.shallow) {
    const extraUrls = pickImportantLinks(homePage, homeResult.url).slice(0, MAX_EXTRA_PAGES);
    for (const url of extraUrls) {
      const result = await fetchPage(url);
      if (result.ok) extraPages.push(extractPage(result.url, result.html, result.elapsedMs));
    }
  }

  const pages = [homePage, ...extraPages];
  return {
    ok: true,
    normalizedUrl: homeResult.url,
    finalUrl: homeResult.finalUrl || homeResult.url,
    pages,
    signals: combineSignals(pages)
  };
}

function classifyFoundWebsite(item, parsed, resolution) {
  const url = resolution.selectedUrl || parsed.normalizedUrl;
  if (isFreeSubdomain(url)) return 'FREE_SUBDOMAIN';
  if (!parsed.ok) return 'BROKEN_WEBSITE';

  const s = parsed.signals;
  if (s.pageCount <= 1 && s.textLength < 900 && !s.forms && s.nonSvgImages < 2) {
    return 'ONE_PAGE_PLACEHOLDER';
  }

  const verification = resolution.domainVerification;
  if (verification.score >= 35 || resolution.selectedSource === 'listed_website') return 'WEBSITE_FOUND';
  return 'UNCERTAIN';
}

function verifyDomain(item, parsed, url) {
  const text = normalizeSearchText(parsed.signals.allTextSample);
  const host = safeHostname(url);
  const matched = [];
  let score = 0;

  if (item.nip && text.includes(item.nip)) add('NIP', 40);
  if (item.regon && text.includes(item.regon)) add('REGON', 35);
  if (item.phone && phoneMatches(parsed.signals.phones, item.phone)) add('phone', 30);
  if (companyNameMatches(item, text, host)) add('name', 20);
  if (item.address && addressMatches(item.address, text)) add('address', 12);
  if (nicheMatches(item.niche, text)) add('niche', 10);
  if (domainFromEmail(item.email) && host.includes(domainFromEmail(item.email))) add('email_domain', 18);

  const confidence = clamp(score / 100, 0, 1);
  return {
    score,
    confidence,
    matched,
    manual_review: score < 35
  };

  function add(label, value) {
    matched.push(label);
    score += value;
  }
}

function buildHeuristicAnalysis(item, parsed, resolution) {
  if (resolution.websiteStatus !== 'WEBSITE_FOUND' && resolution.websiteStatus !== 'UNCERTAIN') {
    return buildNoWebsiteAnalysis(item, resolution, parsed);
  }
  return buildWebsiteAnalysis(item, parsed, resolution);
}

function buildNoWebsiteAnalysis(item, resolution, parsed) {
  const business = scoreBusinessWithoutWebsite(item, resolution);
  const packageName = business.score >= 80 ? 'Business Website' : business.score >= 55 ? 'Landing Page' : 'Landing Page';
  const priority = business.score >= 70 ? 'A' : business.score >= 55 ? 'B' : 'C';
  const mainProblem = noWebsiteProblem(item, resolution);

  return {
    priority,
    website_status: resolution.websiteStatus,
    website_confidence: resolution.websiteConfidence,
    website_quality_score: parsed.ok ? 35 : 0,
    lead_score: business.score,
    lead_category: business.category,
    business_activity: business.activity,
    recommended_package: packageName,
    recommended_website: packageName === 'Business Website' ? 'Business website, 5-8 pages' : 'Landing page or compact business website',
    confidence: resolution.websiteConfidence >= 0.8 ? 'high' : 'medium',
    requires_manual_review: business.score >= 80 || resolution.websiteStatus === 'UNCERTAIN',
    main_problem: mainProblem,
    why_it_matters: buildNoWebsiteWhy(resolution.websiteStatus),
    proposed_solution: buildNicheSolution(item.niche),
    mini_audit_points: [
      websiteStatusLabel(resolution.websiteStatus),
      mainProblem,
      buildNicheSolution(item.niche)
    ],
    first_message_ru: noWebsiteMessageRu(item, mainProblem),
    first_message_pl: noWebsiteMessagePl(item, mainProblem)
  };
}

function buildWebsiteAnalysis(item, parsed, resolution) {
  if (!parsed.ok) {
    return {
      priority: item.niche ? 'B' : 'C',
      website_status: resolution.websiteStatus,
      website_confidence: resolution.websiteConfidence,
      website_quality_score: 15,
      lead_score: item.niche ? 58 : 35,
      lead_category: item.niche ? 'B' : 'C',
      business_activity: 'UNKNOWN',
      recommended_package: item.niche ? 'Business Website' : 'Landing Page',
      recommended_website: 'New business website',
      confidence: 'low',
      requires_manual_review: true,
      main_problem: parsed.error || 'Сайт не открылся',
      why_it_matters:
        'Если сайт не открывается или работает нестабильно, клиент не может нормально проверить компанию перед обращением.',
      proposed_solution: buildNicheSolution(item.niche),
      mini_audit_points: [
        parsed.error || 'Сайт не открылся при быстрой проверке.',
        'Нужно проверить домен и сделать рабочую версию сайта.',
        buildNicheSolution(item.niche)
      ],
      first_message_ru: fallbackMessageRu(item, parsed.error),
      first_message_pl: fallbackMessagePl(item, parsed.error)
    };
  }

  const s = parsed.signals;
  const issues = [];
  let quality = 100;

  if (!s.hasViewport) addIssue('Нет явного адаптива под смартфоны', 14);
  if (!s.hasTelLink) addIssue('Нет кликабельной кнопки звонка', 8);
  if (!s.forms) addIssue('Нет формы заявки или записи', 10);
  if (!s.hasServiceKeywords || !hasLikelyServicePages(s)) addIssue('Услуги не разделены на понятные страницы', 14);
  if (!s.hasPortfolioKeywords) addIssue('Слабо показаны работы, кейсы или галерея', 10);
  if (!s.hasPriceKeywords) addIssue('Не видно цен или ориентиров стоимости', 8);
  if (!s.hasAboutKeywords && !s.hasNipOrRegon) addIssue('Мало сигналов доверия: команда, NIP, опыт, процесс', 8);
  if (s.nonSvgImages < 4) addIssue('Мало реальных фотографий бизнеса', 6);
  if (s.textLength < 1200) addIssue('На сайте мало содержательного текста', 8);
  if (s.outdatedCopyright) addIssue('Сайт выглядит давно не обновлявшимся', 5);
  if (s.avgElapsedMs > 3500) addIssue('Сайт загружается медленно', 4);
  if (resolution.websiteStatus === 'ONE_PAGE_PLACEHOLDER') addIssue('Сайт выглядит как страница-заглушка', 14);
  if (resolution.websiteStatus === 'FREE_SUBDOMAIN') addIssue('Сайт находится на бесплатном поддомене', 10);

  quality = clamp(quality, 0, 100);
  const weakness = 100 - quality;
  const nicheFit = scoreNicheFit(item.niche, s.allTextSample);
  const leadScore = clamp(Math.round(weakness * 0.72 + nicheFit + (s.phones.length || s.emails.length ? 8 : 0)), 0, 100);
  const priority = leadScore >= 70 ? 'A' : leadScore >= 45 ? 'B' : 'C';
  const packageName = pickPackage(item.niche, s, issues);
  const mainProblem = issues[0]?.text || 'Сайт можно сделать понятнее и сильнее для клиента с телефона';

  return {
    priority,
    website_status: resolution.websiteStatus,
    website_confidence: resolution.websiteConfidence,
    website_quality_score: Math.round(quality),
    lead_score: leadScore,
    lead_category: leadScore >= 80 ? 'A+' : priority,
    business_activity: 'UNKNOWN',
    recommended_package: packageName,
    recommended_website: packageName,
    confidence: issues.length >= 3 ? 'high' : 'medium',
    requires_manual_review: resolution.domainVerification?.manual_review || false,
    main_problem: mainProblem,
    why_it_matters: buildWhyItMatters(mainProblem),
    proposed_solution: buildNicheSolution(item.niche),
    mini_audit_points: buildMiniAuditPoints(issues, item.niche),
    first_message_ru: fallbackMessageRu(item, mainProblem),
    first_message_pl: fallbackMessagePl(item, mainProblem)
  };

  function addIssue(text, penalty) {
    issues.push({ text, penalty });
    quality -= penalty;
  }
}

function scoreBusinessWithoutWebsite(item, resolution) {
  let score = 0;
  const parts = {};

  parts.activity = 0;
  if (isFreshActivity(item.last_activity) || /active|fresh|high|актив/i.test(item.activity_signal)) parts.activity += 5;
  if (item.portfolio_available || /photo|work|realiz|portfolio|instagram/i.test(item.notes)) parts.activity += 5;
  if (item.phone) parts.activity += 5;
  if (/price|cennik|cena|oferta|прайс|цена/i.test(item.notes)) parts.activity += 5;
  if (/reply|respond|odpowiada|комментар/i.test(item.notes)) parts.activity += 5;

  parts.scale = 0;
  if (teamLooksBiggerThanOne(item.team_size)) parts.scale += 5;
  if (item.services.length >= 2 || /,|;/.test(item.niche)) parts.scale += 5;
  if (item.physical_location || item.address) parts.scale += 5;
  if (item.multiple_locations || /warszawa|cała warszawa|30 km|kilka/i.test(item.notes)) parts.scale += 5;

  parts.reputation = 0;
  if (item.review_count >= 10) parts.reputation += 5;
  if (item.rating >= 4) parts.reputation += 5;
  if (item.portfolio_available || /zdję|zdje|photo|realiz|before|after/i.test(item.notes)) parts.reputation += 5;
  if (/regular|fresh|monthly|co tydzień|aktywn/i.test(item.notes)) parts.reputation += 5;

  parts.sitePotential = 0;
  if (item.services.length >= 2 || nicheSupportsServicePages(item.niche)) parts.sitePotential += 5;
  if (item.portfolio_available || nicheNeedsPortfolio(item.niche)) parts.sitePotential += 5;
  if (nicheNeedsTrust(item.niche)) parts.sitePotential += 5;
  if (item.high_ticket || nicheIsHighTicket(item.niche)) parts.sitePotential += 5;
  if (nicheIsComparedBeforeBuying(item.niche)) parts.sitePotential += 5;

  parts.contact = 0;
  if (item.phone) parts.contact += 5;
  if (item.email && !freeEmailDomains.has(domainFromEmail(item.email) || '')) parts.contact += 5;
  else if (item.email) parts.contact += 2;

  score = parts.activity + parts.scale + parts.reputation + parts.sitePotential + parts.contact;
  if (resolution.websiteStatus === 'NO_WEBSITE_CONFIRMED') score += 5;
  if (resolution.websiteStatus === 'SOCIAL_ONLY' || resolution.websiteStatus === 'DIRECTORY_ONLY') score += 3;
  score = clamp(score, 0, 100);

  return {
    score,
    category: score >= 80 ? 'A+' : score >= 70 ? 'A' : score >= 55 ? 'B' : score >= 40 ? 'C' : 'D',
    activity: parts.activity >= 18 ? 'HIGH' : parts.activity >= 10 ? 'MEDIUM' : 'LOW',
    parts
  };
}

function noWebsiteProblem(item, resolution) {
  if (resolution.websiteStatus === 'SOCIAL_ONLY') {
    return 'Вся информация находится в соцсетях, поэтому клиенту сложно быстро посмотреть услуги, цены, примеры и контакты в одном месте.';
  }
  if (resolution.websiteStatus === 'DIRECTORY_ONLY') {
    return 'Клиент сравнивает компанию рядом с десятками конкурентов внутри чужой платформы, а у бизнеса нет собственной презентации.';
  }
  if (resolution.websiteStatus === 'MARKETPLACE_ONLY') {
    return 'Компания зависит от маркетплейса или платформы, а не от собственной страницы с услугами и доверием.';
  }
  if (resolution.websiteStatus === 'BROKEN_WEBSITE') {
    return 'Домен есть, но сайт не открывается, поэтому клиент не может нормально проверить компанию перед обращением.';
  }
  if (resolution.websiteStatus === 'FREE_SUBDOMAIN') {
    return 'У компании есть только простая страница на бесплатном поддомене, которая выглядит слабее реального бизнеса.';
  }
  return 'У активной компании нет собственного сайта, где клиент может увидеть услуги, примеры работ, доверие и следующий шаг.';
}

function buildNoWebsiteWhy(status) {
  if (status === 'SOCIAL_ONLY') {
    return 'Соцсети хорошо показывают активность, но плохо заменяют структурированный сайт с услугами, ценами, портфолио и контактами.';
  }
  if (status === 'DIRECTORY_ONLY' || status === 'MARKETPLACE_ONLY') {
    return 'На чужой платформе бизнес стоит рядом с конкурентами и не контролирует собственную презентацию.';
  }
  if (status === 'BROKEN_WEBSITE') {
    return 'Неработающий сайт снижает доверие сильнее, чем полное отсутствие сайта.';
  }
  return 'Если бизнес уже активный и платежеспособный, сайт становится нормальной точкой доверия и объясняет услуги без ручных повторов.';
}

async function analyzeWithOpenAI(item, parsed, heuristic, resolution, model) {
  if (!openai) return null;

  const payload = {
    lead: item,
    website_resolution: {
      status: resolution.websiteStatus,
      confidence: resolution.websiteConfidence,
      checks_completed: resolution.checks_completed,
      domain_verification: resolution.domainVerification,
      candidates: resolution.candidates
    },
    parsed_summary: compactParsedForAi(parsed),
    heuristic
  };

  const input = [
    {
      role: 'system',
      content:
        'Ты анализируешь локальные компании Варшавы для продажи только услуги создания сайта. Главная цель - найти активные компании без полноценного собственного сайта. Не предлагай рекламу, CRM, автоматизацию или маркетинг под ключ. Отвечай строго по JSON schema.'
    },
    {
      role: 'user',
      content: JSON.stringify(payload, null, 2)
    }
  ];

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: [
      'priority',
      'website_status',
      'website_confidence',
      'website_quality_score',
      'lead_score',
      'lead_category',
      'recommended_package',
      'recommended_website',
      'confidence',
      'requires_manual_review',
      'main_problem',
      'why_it_matters',
      'proposed_solution',
      'mini_audit_points',
      'first_message_ru',
      'first_message_pl'
    ],
    properties: {
      priority: { type: 'string', enum: ['A', 'B', 'C'] },
      website_status: {
        type: 'string',
        enum: [
          'NO_WEBSITE_CONFIRMED',
          'SOCIAL_ONLY',
          'DIRECTORY_ONLY',
          'MARKETPLACE_ONLY',
          'BROKEN_WEBSITE',
          'FREE_SUBDOMAIN',
          'ONE_PAGE_PLACEHOLDER',
          'WEBSITE_FOUND',
          'UNCERTAIN'
        ]
      },
      website_confidence: { type: 'number', minimum: 0, maximum: 1 },
      website_quality_score: { type: 'number', minimum: 0, maximum: 100 },
      lead_score: { type: 'number', minimum: 0, maximum: 100 },
      lead_category: { type: 'string' },
      recommended_package: {
        type: 'string',
        enum: ['Landing Page', 'Business Website', 'Premium Website']
      },
      recommended_website: { type: 'string' },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      requires_manual_review: { type: 'boolean' },
      main_problem: { type: 'string' },
      why_it_matters: { type: 'string' },
      proposed_solution: { type: 'string' },
      mini_audit_points: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: { type: 'string' }
      },
      first_message_ru: { type: 'string' },
      first_message_pl: { type: 'string' }
    }
  };

  try {
    const response = await openai.responses.create({
      model,
      input,
      max_output_tokens: 1600,
      text: {
        format: {
          type: 'json_schema',
          name: 'lead_site_analysis',
          strict: true,
          schema
        }
      }
    });
    return JSON.parse(response.output_text);
  } catch {
    const retry = await openai.responses.create({
      model,
      input: [
        ...input,
        {
          role: 'user',
          content:
            'Верни только валидный JSON без markdown. Поля: priority, website_status, website_confidence, website_quality_score, lead_score, lead_category, recommended_package, recommended_website, confidence, requires_manual_review, main_problem, why_it_matters, proposed_solution, mini_audit_points, first_message_ru, first_message_pl.'
        }
      ],
      max_output_tokens: 1600
    });
    return parseLooseJson(retry.output_text);
  }
}

async function analyzeSiteCardWithOpenAI({ item, parsed, websiteResolution, heuristic, model, language = 'ru', workerId = '' }) {
  if (!openai) return null;
  const outputLanguage = ['ru', 'pl', 'en'].includes(String(language || '').toLowerCase()) ? String(language).toLowerCase() : 'ru';
  const outputLanguageName = { ru: 'Russian', pl: 'Polish', en: 'English' }[outputLanguage];

  const payload = {
    output_language: outputLanguage,
    company: {
      name: item.company || 'UNKNOWN',
      legal_name: item.legal_name || 'UNKNOWN',
      category: item.niche || 'UNKNOWN',
      city: item.city || 'UNKNOWN',
      district: item.district || 'UNKNOWN',
      address: item.address || 'UNKNOWN',
      status: item.status || 'UNKNOWN',
      registration_date: item.registration_date || 'UNKNOWN'
    },
    contacts: {
      phone: item.phone || 'UNKNOWN',
      email: item.email || 'UNKNOWN',
      social_profiles: item.social_profiles || {},
      source_profile: item.source_profile || 'UNKNOWN'
    },
    business_signals: {
      review_count: item.review_count || 0,
      rating: item.rating || 0,
      last_activity: item.last_activity || 'UNKNOWN',
      activity_signal: item.activity_signal || 'UNKNOWN',
      services: item.services?.length ? item.services : ['UNKNOWN'],
      portfolio_available: Boolean(item.portfolio_available),
      physical_location: Boolean(item.physical_location || item.address),
      team_size: item.team_size || 'UNKNOWN',
      multiple_locations: Boolean(item.multiple_locations),
      high_ticket: Boolean(item.high_ticket),
      paid_platform: Boolean(item.paid_platform),
      notes: item.notes || ''
    },
    website: {
      status: websiteResolution.websiteStatus || heuristic.website_status || 'UNCERTAIN',
      confidence: websiteResolution.websiteConfidence || heuristic.website_confidence || 0,
      selected_url: websiteResolution.selectedUrl || '',
      checks_completed: websiteResolution.checks_completed || {},
      domain_verification: websiteResolution.domainVerification || {},
      candidates: websiteResolution.candidates || []
    },
    parser_summary: {
      heuristic,
      parsed_summary: compactParsedForAi(parsed)
    },
    rules: [
      'Use only the facts in this payload.',
      'Do not search the internet.',
      'If data is missing, write UNKNOWN.',
      'Every personalized claim must be supported by company name, category, city, website status, reviews/rating, services, address, contacts or parsed website evidence from this payload.',
      'If the official website is found but weak, frame the offer as redesign/improvement, not as no-website.',
      'If company/category/site match is uncertain, mention manual verification in risks_or_skip_reasons.',
      'Offer only website creation or website redesign. Do not offer ads, CRM, automation, SEO packages or marketing under key.',
      `Write all user-facing analysis fields in ${outputLanguageName}. Keep first_message_ru in Russian and first_message_pl in Polish for compatibility.`
    ]
  };

  const input = [
    {
      role: 'system',
      content:
        `You create a fact-checked, personalized website-opportunity analysis for one local company card. Use only the provided parser facts; do not invent missing facts, services, owners, prices, years, team size, locations, awards or problems. If evidence is weak, say UNKNOWN and lower confidence. Base personalization on exact evidence: company name, category, city/district, address, phone/email, reviews/rating, services, source profile, website status, selected URL, parsed pages and domain verification. If website_status is WEBSITE_FOUND, FREE_SUBDOMAIN, ONE_PAGE_PLACEHOLDER or UNCERTAIN, explain the exact status and recommend redesign/improvement only when justified. If there is category/company/site mismatch risk, put it in risks_or_skip_reasons and evidence_used. Write user-facing analysis fields in ${outputLanguageName}. first_message_pl must sound natural in Polish and mention at least two verified facts; first_message_ru must do the same in Russian. Return only JSON matching the schema.`
    },
    {
      role: 'user',
      content: JSON.stringify(payload, null, 2)
    }
  ];

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: [
      'ai_analysis_status',
      'ai_analysis_version',
      'ai_analyzed_at',
      'company_data_version',
      'company_summary',
      'main_problem',
      'why_website_needed',
      'problems_solved_by_site',
      'recommended_site_type',
      'recommended_page_count',
      'recommended_structure',
      'required_features',
      'existing_materials',
      'missing_materials',
      'commercial_potential',
      'personal_argument',
      'recommended_offer',
      'risks_or_skip_reasons',
      'first_message_ru',
      'first_message_pl',
      'evidence_used',
      'confidence'
    ],
    properties: {
      ai_analysis_status: { type: 'string', enum: ['COMPLETED'] },
      ai_analysis_version: { type: 'number' },
      ai_analyzed_at: { type: 'string' },
      company_data_version: { type: 'number' },
      company_summary: { type: 'string' },
      main_problem: { type: 'string' },
      why_website_needed: {
        type: 'array',
        minItems: 3,
        maxItems: 8,
        items: { type: 'string' }
      },
      problems_solved_by_site: {
        type: 'array',
        minItems: 3,
        maxItems: 10,
        items: { type: 'string' }
      },
      recommended_site_type: {
        type: 'string',
        enum: ['Landing Page', 'Business Website', 'Premium Website', 'Redesign Existing Website']
      },
      recommended_page_count: { type: 'string' },
      recommended_structure: {
        type: 'array',
        minItems: 4,
        maxItems: 12,
        items: { type: 'string' }
      },
      required_features: {
        type: 'array',
        minItems: 2,
        maxItems: 10,
        items: { type: 'string' }
      },
      existing_materials: {
        type: 'array',
        minItems: 1,
        maxItems: 10,
        items: { type: 'string' }
      },
      missing_materials: {
        type: 'array',
        minItems: 1,
        maxItems: 10,
        items: { type: 'string' }
      },
      commercial_potential: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNKNOWN']
      },
      personal_argument: { type: 'string' },
      recommended_offer: { type: 'string' },
      risks_or_skip_reasons: {
        type: 'array',
        minItems: 0,
        maxItems: 8,
        items: { type: 'string' }
      },
      first_message_ru: { type: 'string' },
      first_message_pl: { type: 'string' },
      evidence_used: {
        type: 'array',
        minItems: 3,
        maxItems: 12,
        items: { type: 'string' }
      },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] }
    }
  };

  const response = await openai.responses.create({
    model,
    input,
    max_output_tokens: 2800,
    text: {
      format: {
        type: 'json_schema',
        name: 'company_card_site_ai_analysis',
        strict: true,
        schema
      }
    }
  });

  const result = JSON.parse(response.output_text);
  const usage = response.usage || {};
  store.logAiUsage({
    workerId,
    feature: 'lead_analysis',
    model,
    promptTokens: usage.input_tokens || 0,
    completionTokens: usage.output_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    estimatedCost: estimateAiCost(model, usage.input_tokens || 0, usage.output_tokens || 0)
  });
  return {
    ...result,
    ai_analysis_status: 'COMPLETED',
    ai_analysis_version: 1,
    ai_analyzed_at: new Date().toISOString(),
    company_data_version: 1
  };
}

function buildUrlCandidates(inputUrl) {
  const raw = String(inputUrl || '').trim();
  if (!raw) return [];
  if (/^https?:\/\//i.test(raw)) return [safeUrl(raw)].filter(Boolean);
  return [`https://${raw}`, `http://${raw}`].map(safeUrl).filter(Boolean);
}

function safeUrl(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchPage(url) {
  const allowed = await isAllowedByRobots(url);
  if (!allowed.ok) return { ok: false, url, error: allowed.error };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml'
      }
    });

    const contentType = response.headers.get('content-type') || '';
    const contentLength = Number(response.headers.get('content-length') || 0);

    if (!response.ok) return { ok: false, url, error: `HTTP ${response.status}` };
    if (contentLength && contentLength > MAX_HTML_BYTES) {
      return { ok: false, url, error: 'HTML слишком большой для быстрого анализа' };
    }
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      return { ok: false, url, error: `Не HTML: ${contentType || 'unknown'}` };
    }

    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
      return { ok: false, url, error: 'HTML слишком большой для быстрого анализа' };
    }

    return {
      ok: true,
      url,
      finalUrl: response.url,
      html,
      elapsedMs: Math.round(performance.now() - startedAt)
    };
  } catch (error) {
    const errorMessage = error?.name === 'AbortError' ? 'Таймаут загрузки' : error.message;
    return { ok: false, url, error: errorMessage };
  } finally {
    clearTimeout(timer);
  }
}

async function isAllowedByRobots(targetUrl) {
  if (!RESPECT_ROBOTS) return { ok: true };

  try {
    const url = new URL(targetUrl);
    const robotsUrl = `${url.origin}/robots.txt`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4_000);

    try {
      const response = await fetch(robotsUrl, {
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT }
      });

      if (!response.ok) return { ok: true };
      const body = await response.text();
      const parser = robotsParser(robotsUrl, body);
      return parser.isAllowed(targetUrl, USER_AGENT)
        ? { ok: true }
        : { ok: false, error: 'Закрыто robots.txt' };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return { ok: true };
  }
}

function extractPage(url, html, elapsedMs) {
  const $ = cheerio.load(html);
  $('script, style, noscript, template, svg').remove();

  const title = cleanText($('title').first().text());
  const metaDescription = cleanText(
    $('meta[name="description"], meta[property="og:description"]').first().attr('content') || ''
  );
  const lang = cleanText($('html').attr('lang') || '');
  const viewport = cleanText($('meta[name="viewport"]').attr('content') || '');
  const canonical = safeUrl($('link[rel="canonical"]').attr('href') || '') || '';
  const headings = $('h1,h2,h3')
    .map((_i, el) => cleanText($(el).text()))
    .get()
    .filter(Boolean)
    .slice(0, 40);
  const links = $('a[href]')
    .map((_i, el) => {
      const href = $(el).attr('href') || '';
      return {
        href: absoluteUrl(href, url),
        rawHref: href,
        text: cleanText($(el).text())
      };
    })
    .get()
    .filter((link) => link.href || /^tel:|^mailto:/i.test(link.rawHref));
  const images = $('img')
    .map((_i, el) => ({
      src: $(el).attr('src') || '',
      alt: cleanText($(el).attr('alt') || '')
    }))
    .get();
  const forms = $('form').length;
  const bodyText = cleanText($('body').text()).slice(0, 25_000);
  const hrefText = links.map((link) => `${link.text} ${link.rawHref}`).join(' ');
  const combined = `${title} ${metaDescription} ${headings.join(' ')} ${bodyText} ${hrefText}`;

  return {
    url,
    title,
    metaDescription,
    lang,
    viewport,
    canonical,
    headings,
    textSample: bodyText.slice(0, 9000),
    textLength: bodyText.length,
    links,
    imageCount: images.length,
    imagesWithAlt: images.filter((image) => image.alt).length,
    nonSvgImages: images.filter((image) => !/\.svg(\?|$)/i.test(image.src)).length,
    forms,
    telLinks: unique(
      links
        .filter((link) => /^tel:/i.test(link.rawHref))
        .map((link) => link.rawHref.replace(/^tel:/i, '').trim())
    ),
    mailLinks: unique(
      links
        .filter((link) => /^mailto:/i.test(link.rawHref))
        .map((link) => link.rawHref.replace(/^mailto:/i, '').split('?')[0].trim())
    ),
    phones: extractPhones(combined),
    emails: extractEmails(combined),
    flags: extractFlags(combined, links),
    elapsedMs
  };
}

function absoluteUrl(href, baseUrl) {
  if (!href) return '';
  if (/^tel:|^mailto:|^whatsapp:/i.test(href)) return '';
  try {
    const url = new URL(href, baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function pickImportantLinks(homePage, homeUrl) {
  const origin = new URL(homeUrl).origin;
  const patterns = [
    /uslug|usług|ofert|service|klimatyz|remont|detailing|pdr|wrapping|stomatolog|fizjoterap|cennik|price|realizac|portfolio|galeri|kontakt|contact|o-nas|about|zespol|zespół/i
  ];

  return unique(
    homePage.links
      .filter((link) => link.href && link.href.startsWith(origin))
      .filter((link) => patterns.some((pattern) => pattern.test(`${link.href} ${link.text}`)))
      .map((link) => link.href)
  );
}

function extractFlags(text, links) {
  const linkBlob = links.map((link) => `${link.text} ${link.rawHref} ${link.href}`).join(' ');
  const blob = `${text} ${linkBlob}`;

  return {
    hasServiceKeywords: /usług|uslugi|usługi|oferta|services|montaż|montaz|serwis|naprawa|remont|detailing|implant|fizjoterapia/i.test(blob),
    hasPortfolioKeywords: /realizacje|portfolio|galeria|gallery|before|after|przed|po|case stud|projekty/i.test(blob),
    hasPriceKeywords: /cennik|cena|ceny|price|prices|koszt|od \d|pln|zł/i.test(blob),
    hasContactKeywords: /kontakt|contact|zadzwoń|napisz|telefon|e-mail|email/i.test(blob),
    hasAboutKeywords: /o nas|about|firma|zespół|zespol|team|specjaliści|specjalisci|lekarz|doświadczenie|doswiadczenie/i.test(blob),
    hasFaqKeywords: /faq|pytania|często|czesto|questions|odpowiedzi/i.test(blob),
    hasNipOrRegon: /\b(NIP|REGON|KRS)\b/i.test(blob),
    hasAddressSignal: /Warszawa|Mokotów|Wola|Ursynów|Praga|Bemowo|Bielany|Ochota|Śródmieście|Srodmiescie|Targówek|Wilanów|Białołęka|Mazowieckie/i.test(blob),
    hasWhatsapp: /wa\.me|whatsapp/i.test(blob),
    hasBookingSignal: /rezerw|umów|umow|wizyta|termin|book|booking|zapis|kalendarz/i.test(blob),
    hasUploadSignal: /upload|załącz|zalacz|dodaj zdję|dodaj zdje|prześlij|przeslij|plik/i.test(blob),
    outdatedCopyright: detectOutdatedCopyright(blob)
  };
}

function combineSignals(pages) {
  const allText = pages.map((page) => page.textSample).join('\n\n').slice(0, 30_000);
  const allLinks = pages.flatMap((page) => page.links || []);
  const allFlags = pages.reduce((acc, page) => {
    for (const [key, value] of Object.entries(page.flags || {})) {
      acc[key] = Boolean(acc[key] || value);
    }
    return acc;
  }, {});

  return {
    pageCount: pages.length,
    urls: pages.map((page) => page.url),
    title: pages[0]?.title || '',
    metaDescription: pages[0]?.metaDescription || '',
    languages: unique(pages.map((page) => page.lang).filter(Boolean)),
    hasViewport: pages.some((page) => Boolean(page.viewport)),
    hasTelLink: pages.some((page) => page.telLinks.length > 0),
    hasMailLink: pages.some((page) => page.mailLinks.length > 0),
    phones: unique(pages.flatMap((page) => page.phones || page.telLinks || [])).slice(0, 8),
    emails: unique(pages.flatMap((page) => page.emails || page.mailLinks || [])).slice(0, 8),
    forms: pages.reduce((sum, page) => sum + page.forms, 0),
    imageCount: pages.reduce((sum, page) => sum + page.imageCount, 0),
    nonSvgImages: pages.reduce((sum, page) => sum + page.nonSvgImages, 0),
    imagesWithAlt: pages.reduce((sum, page) => sum + page.imagesWithAlt, 0),
    textLength: pages.reduce((sum, page) => sum + page.textLength, 0),
    avgElapsedMs: Math.round(pages.reduce((sum, page) => sum + page.elapsedMs, 0) / pages.length),
    importantLinks: unique(allLinks.map((link) => link.href).filter(Boolean)).slice(0, 40),
    allTextSample: allText,
    ...allFlags
  };
}

function emptySignals() {
  return {
    pageCount: 0,
    urls: [],
    title: '',
    metaDescription: '',
    languages: [],
    hasViewport: false,
    hasTelLink: false,
    hasMailLink: false,
    phones: [],
    emails: [],
    forms: 0,
    imageCount: 0,
    nonSvgImages: 0,
    imagesWithAlt: 0,
    textLength: 0,
    avgElapsedMs: 0,
    importantLinks: [],
    allTextSample: ''
  };
}

function compactParsedForAi(parsed) {
  const signals = parsed?.signals || emptySignals();
  return {
    ok: Boolean(parsed?.ok),
    error: parsed?.error || '',
    normalizedUrl: parsed?.normalizedUrl || '',
    pageCount: signals.pageCount,
    title: signals.title,
    metaDescription: signals.metaDescription,
    languages: signals.languages,
    hasViewport: signals.hasViewport,
    hasTelLink: signals.hasTelLink,
    hasMailLink: signals.hasMailLink,
    phonesFound: signals.phones.length,
    emailsFound: signals.emails.length,
    forms: signals.forms,
    imageCount: signals.imageCount,
    nonSvgImages: signals.nonSvgImages,
    hasServiceKeywords: signals.hasServiceKeywords,
    hasPortfolioKeywords: signals.hasPortfolioKeywords,
    hasPriceKeywords: signals.hasPriceKeywords,
    hasAboutKeywords: signals.hasAboutKeywords,
    hasFaqKeywords: signals.hasFaqKeywords,
    hasNipOrRegon: signals.hasNipOrRegon,
    hasAddressSignal: signals.hasAddressSignal,
    hasWhatsapp: signals.hasWhatsapp,
    textSample: signals.allTextSample.slice(0, 6000),
    importantLinks: signals.importantLinks.slice(0, 20)
  };
}

function hasLikelyServicePages(signals) {
  return signals.importantLinks.some((url) =>
    /uslug|usług|ofert|service|klimatyz|remont|detailing|pdr|wrapping|stomatolog|fizjoterap/i.test(url)
  );
}

function scoreNicheFit(niche, text) {
  const blob = `${niche || ''} ${text || ''}`;
  const topNichePatterns = [
    /klimatyz|wentylac/i,
    /wykończenia|wykonczenia|remont/i,
    /detailing|pdr|wrapping/i,
    /stomatolog|implant|ortodonc/i,
    /medycyna estetyczna|kosmetolog/i,
    /fizjoterap|rehabilit/i,
    /księg|ksieg|rachunk/i,
    /przedszk|szkoł|szkol/i
  ];
  return topNichePatterns.some((pattern) => pattern.test(blob)) ? 24 : 10;
}

function pickPackage(niche, signals, issues) {
  const blob = `${niche || ''} ${signals.allTextSample || ''}`;
  if (/stomatolog|medycyna estetyczna|przedszk|szkoł|szkol/i.test(blob)) return 'Premium Website';
  if (issues.length >= 5 || signals.pageCount >= 3) return 'Business Website';
  return 'Landing Page';
}

function buildWhyItMatters(problem) {
  if (/telefon|смартфон|адаптив/i.test(problem)) {
    return 'Локальный клиент чаще сравнивает компании с телефона. Если сайт неудобен, он быстрее уходит к конкуренту.';
  }
  if (/работ|портфолио|галере/i.test(problem)) {
    return 'В визуальных нишах клиент покупает доверие через примеры работ. Если они не собраны нормально, реальный уровень бизнеса не виден.';
  }
  if (/цен|стоим/i.test(problem)) {
    return 'Ориентиры стоимости снижают лишние вопросы и помогают клиенту понять, подходит ли компания под его задачу.';
  }
  if (/довер/i.test(problem)) {
    return 'Для локального бизнеса сайт должен быстро доказать, что компания настоящая, активная и ей можно доверять.';
  }
  return 'Сайт должен быстро объяснить услуги, доверие и следующий шаг. Если это не видно сразу, часть клиентов уходит к конкурентам.';
}

function buildNicheSolution(niche) {
  const normalized = String(niche || '').toLowerCase();
  if (/klimatyz|wentyl/.test(normalized)) {
    return 'Новый сайт с отдельными страницами montaż, serwis, naprawa, примерами монтажей, ценами "от", районами обслуживания и формой расчета.';
  }
  if (/remont|wyko|wnętr|wnetr/.test(normalized)) {
    return 'Новый сайт с портфолио, кейсами по площади/сроку/бюджету, этапами работы и формой, куда можно прикрепить план и фото.';
  }
  if (/detailing|pdr|wrapping/.test(normalized)) {
    return 'Новый сайт с пакетами услуг, прайсом, галереей до/после и формой с маркой автомобиля и фотографиями.';
  }
  if (/stomat|implant|ortod/.test(normalized)) {
    return 'Новый сайт с отдельными страницами процедур, профилями врачей, ценами, FAQ, фотографиями клиники и удобной записью.';
  }
  if (/fizj|rehabil/.test(normalized)) {
    return 'Новый сайт со страницами под конкретные проблемы, специалистами, методами, ценами и записью.';
  }
  if (/księg|ksieg|rachunk/.test(normalized)) {
    return 'Новый сайт с услугами для JDG, sp. z o.o., e-commerce, тарифами, FAQ и понятной формой консультации.';
  }
  return 'Новый сайт с понятными услугами, портфолио, отзывами, ценами или ориентирами стоимости, контактами и удобной формой.';
}

function buildMiniAuditPoints(issues, niche) {
  const points = issues.slice(0, 3).map((issue) => issue.text);
  while (points.length < 3) points.push(buildNicheSolution(niche));
  return points.slice(0, 3);
}

function fallbackMessageRu(item, problem) {
  const company = item.company ? ` компании ${item.company}` : '';
  return `Добрый день. Я посмотрел сайт${company}. Главная вещь: ${lowerFirst(
    problem || 'сайт можно сделать понятнее'
  )}. Мы делаем сайты для локальных компаний в Варшаве, чтобы клиент быстро понял услуги, доверие и следующий шаг. Могу отправить короткие 3 пункта, что можно улучшить именно у вас?`;
}

function fallbackMessagePl(item, problem) {
  const company = item.company ? ` firmy ${item.company}` : '';
  return `Dzień dobry. Sprawdziłem stronę${company}. Najważniejsza rzecz: ${translateProblemForPl(
    problem
  )}. Tworzymy strony dla lokalnych firm w Warszawie, żeby klient szybko rozumiał ofertę, zaufanie i następny krok. Czy mogę wysłać krótkie 3 punkty, co można poprawić?`;
}

function noWebsiteMessageRu(item, problem) {
  const company = item.company ? ` компании ${item.company}` : '';
  return `Добрый день. Я посмотрел публичную информацию${company}. Вижу, что бизнес выглядит активным, но не нашел полноценный собственный сайт. ${problem} Мы делаем сайты для локальных компаний в Варшаве: услуги, работы, цены/ориентиры и контакты в одном месте. Могу отправить короткую структуру сайта именно для вашей ниши?`;
}

function noWebsiteMessagePl(item, problem) {
  const company = item.company ? ` firmy ${item.company}` : '';
  return `Dzień dobry. Sprawdziłem publiczne informacje${company}. Firma wygląda aktywnie, ale nie znalazłem pełnej własnej strony internetowej. ${translateProblemForPl(
    problem
  )}. Tworzymy strony dla lokalnych firm w Warszawie: usługi, realizacje, orientacyjne ceny i kontakt w jednym miejscu. Czy mogę wysłać krótką propozycję struktury strony dla Państwa branży?`;
}

function translateProblemForPl(problem) {
  const value = String(problem || '').toLowerCase();
  if (value.includes('нет собственного сайта') || value.includes('собственного сайта') || value.includes('не нашел полноценный')) {
    return 'firma nie ma pełnej własnej strony, która pokazuje usługi, zaufanie i następny krok';
  }
  if (value.includes('соц')) return 'informacje są rozproszone w social mediach';
  if (value.includes('каталог') || value.includes('платформ')) return 'firma jest porównywana z konkurencją na cudzej platformie';
  if (value.includes('телефон') || value.includes('смартфон') || value.includes('адаптив')) {
    return 'strona na telefonie nie prowadzi klienta wystarczająco szybko do kontaktu';
  }
  if (value.includes('работ') || value.includes('портфолио') || value.includes('галере')) {
    return 'realizacje i przykłady prac nie są pokazane wystarczająco mocno';
  }
  if (value.includes('цен') || value.includes('стоим')) {
    return 'klient nie widzi jasnych informacji o cenach lub zakresie usług';
  }
  if (value.includes('довер')) return 'strona nie pokazuje wystarczająco dużo sygnałów zaufania';
  if (value.includes('открыл')) return 'strona nie otworzyła się poprawnie podczas szybkiego sprawdzenia';
  return 'firma może lepiej pokazywać poziom usług i ułatwiać kontakt';
}

function websiteStatusLabel(status) {
  const labels = {
    NO_WEBSITE_CONFIRMED: 'Собственный сайт не найден после проверки.',
    SOCIAL_ONLY: 'Найдены только социальные сети.',
    DIRECTORY_ONLY: 'Найдены только каталоги или сервисы записи.',
    MARKETPLACE_ONLY: 'Найдены только маркетплейсы или платформы.',
    BROKEN_WEBSITE: 'Домен есть, но сайт не открывается.',
    FREE_SUBDOMAIN: 'Есть только страница на бесплатном поддомене.',
    ONE_PAGE_PLACEHOLDER: 'Есть только простая страница-заглушка.',
    WEBSITE_FOUND: 'Найден полноценный сайт.',
    UNCERTAIN: 'Нужна ручная проверка сайта.'
  };
  return labels[status] || labels.UNCERTAIN;
}

function mergeAnalysis(heuristic, ai) {
  if (!ai) return heuristic;
  return {
    ...heuristic,
    ...ai,
    website_confidence: clamp(Number(ai.website_confidence), 0, 1),
    website_quality_score: clamp(Math.round(ai.website_quality_score), 0, 100),
    lead_score: clamp(Math.round(ai.lead_score), 0, 100),
    mini_audit_points: Array.isArray(ai.mini_audit_points)
      ? ai.mini_audit_points.slice(0, 3)
      : heuristic.mini_audit_points
  };
}

function parseLooseJson(text) {
  const raw = String(text || '').trim();
  const withoutFence = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const match = withoutFence.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('OpenAI вернул не JSON');
    return JSON.parse(match[0]);
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function withTimeout(promise, timeoutMs, message) {
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message || 'Timeout')), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function collectSocialLinks(item) {
  return unique(Object.values(item.social_profiles || {}).filter(Boolean));
}

function collectProfileLinks(item) {
  return unique([item.source_profile].filter(Boolean));
}

function classifySourceOnly(item, socialLinks, profileLinks) {
  const all = [...socialLinks, ...profileLinks].filter(Boolean);
  if (!all.length) return '';
  if (all.every((link) => classifyUrlType(link) === 'social')) return 'SOCIAL_ONLY';
  if (all.every((link) => classifyUrlType(link) === 'marketplace')) return 'MARKETPLACE_ONLY';
  if (all.every((link) => ['directory', 'marketplace', 'social'].includes(classifyUrlType(link)))) {
    if (all.some((link) => classifyUrlType(link) === 'marketplace')) return 'MARKETPLACE_ONLY';
    if (all.some((link) => classifyUrlType(link) === 'directory')) return 'DIRECTORY_ONLY';
    return 'SOCIAL_ONLY';
  }
  return '';
}

function classifyUrlType(rawUrl) {
  const host = safeHostname(rawUrl);
  if (!host) return 'unknown';
  if (socialDomains.some((domain) => host.includes(domain))) return 'social';
  if (marketplaceDomains.some((domain) => host.includes(domain))) return 'marketplace';
  if (directoryDomains.some((domain) => host.includes(domain))) return 'directory';
  if (freeSubdomainDomains.some((domain) => host.includes(domain))) return 'free_subdomain';
  return 'official_candidate';
}

function addCandidate(candidates, rawUrl, source, confidence, reason = '') {
  const url = safeUrl(rawUrl) || safeUrl(`https://${rawUrl}`);
  if (!url) return;
  const type = classifyUrlType(url);
  if (['social', 'directory', 'marketplace'].includes(type)) return;
  candidates.push({ url, source, confidence, reason, type });
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  const result = [];
  for (const candidate of candidates) {
    const host = safeHostname(candidate.url);
    if (!host || seen.has(host)) continue;
    seen.add(host);
    result.push(candidate);
  }
  return result.sort((a, b) => b.confidence - a.confidence);
}

function hasEnoughNoWebsiteChecks(item, options, webSearch) {
  if (options.useWebSearch && webSearch) return true;
  return Boolean(item.nip || item.regon || item.phone || item.source_profile || item.email);
}

function domainFromEmail(email) {
  const match = String(email || '').toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (!match) return '';
  const domain = match[1].replace(/^www\./, '');
  return freeEmailDomains.has(domain) ? '' : domain;
}

function safeHostname(rawUrl) {
  try {
    const url = /^https?:\/\//i.test(rawUrl) ? new URL(rawUrl) : new URL(`https://${rawUrl}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isFreeSubdomain(rawUrl) {
  const host = safeHostname(rawUrl);
  return freeSubdomainDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function companyNameMatches(item, text, host) {
  const names = [item.company, item.legal_name].filter(Boolean);
  for (const name of names) {
    const tokens = normalizeSearchText(name)
      .split(' ')
      .filter((token) => token.length >= 4 && !['firma', 'spol', 'zoo', 'warszawa'].includes(token));
    if (tokens.length && tokens.filter((token) => text.includes(token) || host.includes(token)).length >= Math.min(2, tokens.length)) {
      return true;
    }
  }
  return false;
}

function phoneMatches(foundPhones, inputPhone) {
  const targets = (splitPhoneValues(inputPhone).length ? splitPhoneValues(inputPhone) : [normalizePhone(inputPhone)])
    .map((phone) => normalizePhone(phone))
    .filter((phone) => phone.length >= 7);
  if (!targets.length) return false;
  const found = (Array.isArray(foundPhones) ? foundPhones : [foundPhones])
    .flatMap((phone) => splitPhoneValues(phone).length ? splitPhoneValues(phone) : [normalizePhone(phone)])
    .map((phone) => normalizePhone(phone))
    .filter((phone) => phone.length >= 7);
  return targets.some((target) => {
    const shortTarget = target.slice(-9);
    return found.some((phone) => phone.endsWith(shortTarget));
  });
}

function addressMatches(address, text) {
  const tokens = normalizeSearchText(address)
    .split(' ')
    .filter((token) => token.length >= 4);
  return tokens.length > 0 && tokens.some((token) => text.includes(token));
}

function nicheMatches(niche, text) {
  return scoreNicheFit(niche, text) >= 20;
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function extractPhones(text, context = {}) {
  const normalizedText = String(text || '').replace(/\u00a0/g, ' ');
  const matches = normalizedText.match(/(?:\+|00)?\d(?:[\s().-]*\d){6,14}/g) || [];
  return unique(
    matches
      .map((match) => normalizePhoneCandidate(match, context, { fromText: true }))
      .filter(Boolean)
  ).slice(0, 8);
}

function splitPhoneValues(value, context = {}) {
  const raw = String(value || '').replace(/\u00a0/g, ' ');
  const matches = raw.match(/(?:\+|00)?\d(?:[\s().-]*\d){6,14}/g) || [];
  return unique(
    matches
      .map((match) => normalizePhoneCandidate(match, context))
      .filter(Boolean)
  );
}

function extractEmails(text) {
  const decoded = String(text || '')
    .replace(/%20/gi, ' ')
    .replace(/\s*\[at\]\s*/gi, '@')
    .replace(/\s*\(at\)\s*/gi, '@');
  const matches =
    decoded.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.(?:pl|com|eu|net|org|info|biz|co|io|de|uk)\b/gi) || [];
  return unique(
    matches
      .map((value) => value.toLowerCase().replace(/[.,;:]+$/g, ''))
      .map((value) => value.replace(/^e-?mail/i, '').replace(/^email/i, ''))
      .map((value) => value.replace(/^\d+/, ''))
      .filter((value) => value.includes('@'))
  ).slice(0, 8);
}

function detectOutdatedCopyright(text) {
  const copyrightArea = String(text || '').match(/copyright|©|all rights|wszelkie prawa/i)
    ? String(text || '')
    : '';
  const years = (copyrightArea.match(/\b20\d{2}\b/g) || []).map(Number);
  if (!years.length) return false;
  return Math.max(...years) <= new Date().getFullYear() - 3;
}

function isFreshActivity(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  if (/today|week|month|active|fresh|dzis|tydzie|mies|актив|свеж/i.test(raw)) return true;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;
  const days = (Date.now() - date.getTime()) / 86_400_000;
  return days <= 120;
}

function teamLooksBiggerThanOne(value) {
  const raw = String(value || '').toLowerCase();
  if (!raw) return false;
  if (/2|3|4|5|team|zesp|команд|employees|pracownik/.test(raw)) return true;
  return false;
}

function nicheSupportsServicePages(niche) {
  return /klimatyz|remont|detailing|pdr|wrapping|stomat|fizj|kosmet|księg|ksieg|przedszk/i.test(niche);
}

function nicheNeedsPortfolio(niche) {
  return /remont|detailing|pdr|wrapping|klimatyz|kosmet|przedszk/i.test(niche);
}

function nicheNeedsTrust(niche) {
  return /stomat|fizj|kosmet|księg|ksieg|przedszk|remont/i.test(niche);
}

function nicheIsHighTicket(niche) {
  return /klimatyz|remont|detailing|pdr|wrapping|stomat|implant|kosmet/i.test(niche);
}

function nicheIsComparedBeforeBuying(niche) {
  return /klimatyz|remont|detailing|stomat|fizj|kosmet|księg|ksieg|przedszk/i.test(niche);
}

function getPhoneRegionFromContext(context = {}) {
  const explicit = String(context.regionCode || context.countryCode || '').trim().toUpperCase();
  if (['PL', 'UA'].includes(explicit)) return explicit;

  const countryPreset = getCountryPreset(context.country || '');
  if (countryPreset?.regionCode) return countryPreset.regionCode;

  const cityPreset = getCityPreset(context.city || '');
  if (cityPreset?.regionCode) return cityPreset.regionCode;

  const text = normalizeSearchText([context.country, context.city].filter(Boolean).join(' '));
  if (/(^| )polska|poland|warszawa|warsaw|krakow|wroclaw|gdansk|poznan( |$)/.test(text)) return 'PL';
  if (/(^| )ukraine|ukraina|kyiv|kiev|dnipro|lviv|odesa|odessa( |$)/.test(text)) return 'UA';
  return '';
}

function normalizePhoneCandidate(value, context = {}, options = {}) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const startsWithPlus = /^\+/.test(raw);
  const startsWithDoubleZero = /^00/.test(raw.replace(/\s+/g, ''));
  let digits = raw.replace(/\D/g, '');
  if (!digits || digits.length < 7 || digits.length > 15) return '';
  if (/^(\d)\1{6,}$/.test(digits)) return '';

  if (startsWithDoubleZero) {
    digits = digits.replace(/^00/, '');
    return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : '';
  }

  if (startsWithPlus) {
    return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : '';
  }

  if (digits.startsWith('48') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('380') && digits.length === 12) return `+${digits}`;

  const region = getPhoneRegionFromContext(context);
  if (region === 'PL') {
    if (digits.length === 9 && !digits.startsWith('0')) return `+48${digits}`;
  }

  if (region === 'UA') {
    if (digits.length === 10 && digits.startsWith('0')) return `+38${digits}`;
    if (digits.length === 9 && !digits.startsWith('0')) return `+380${digits}`;
  }

  // Without country context keep plausible local numbers local, not fake +48.
  if (options.fromText && digits.length === 9 && !digits.startsWith('0')) return digits;
  if (!options.fromText && digits.length >= 7 && digits.length <= 12) return digits;
  return '';
}

function normalizePhone(value) {
  const phones = splitPhoneValues(value);
  if (phones.length) return phones[0];
  return String(value || '').replace(/[^\d+]/g, '');
}

function normalizePhoneField(value, context = {}) {
  const phones = splitPhoneValues(value, context);
  if (phones.length) return phones.slice(0, 4).join('; ');
  return normalizePhoneCandidate(value, context) || String(value || '').replace(/[^\d+]/g, '');
}

function cleanIdentifier(value) {
  return String(value || '').replace(/\D/g, '');
}

function parseList(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  return String(value || '')
    .split(/[;,|]/)
    .map(cleanText)
    .filter(Boolean);
}

function parseBool(value) {
  if (typeof value === 'boolean') return value;
  const raw = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'tak', 'да', 'y'].includes(raw);
}

function parseNumber(value) {
  const number = Number(String(value || '').replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(number) ? number : 0;
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function lowerFirst(value) {
  const text = String(value || '');
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10);
}
