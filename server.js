import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { AsyncLocalStorage } from 'node:async_hooks';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import robotsParser from 'robots-parser';
import * as store from './store.js';
import { getPortfolioProjects } from './public/site/data/portfolio.js';
import { getServiceCategories } from './public/site/data/services.js';
import { FINAL_EXAM } from './public/academy/data/final-exam.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crash safety net: this single process serves the parser, academy and admin
// panel to every worker/admin at once (and now runs behind a public Cloudflare
// tunnel with concurrent users). Without these handlers, one unhandled promise
// rejection anywhere - a flaky Google Places/CEIDG/OpenAI call, a malformed
// response - kills the whole Node process and takes the site down for everyone
// until a human notices and restarts it by hand. Log and keep serving instead.
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[unhandledRejection] ${new Date().toISOString()}:`, reason instanceof Error ? reason.stack || reason.message : reason);
});
// Recognizes a specific, known-benign undici defect: an internal
// AssertionError thrown from client-h1.js's socket-teardown handler
// (Parser.finish -> assert(!this.paused)) when a third-party HTTP server
// closes its connection while undici's HTTP/1.1 parser happens to be
// mid-pause. This is documented upstream as an "uncatchable assertion
// error" (see nodejs/undici issues on the topic) because it's thrown from a
// raw socket event callback (TLSSocket 'end'/'close'), not from the
// fetch()/request promise chain - so no try/catch around any individual
// outbound request (including the ones this app already wraps per-company
// in enrichPrimaryCompaniesSmart/crossVerifyPrimaryCompany/fetchPage) can
// ever catch it locally. It only ever surfaces here. It does not indicate
// request-handling state corruption in this app - it's a lower-level
// Node/undici defect triggered by ordinary flaky third-party servers under
// concurrent outbound traffic (more likely at higher fetch concurrency,
// which is why CROSS_VERIFY_MAX_COMPANIES above bounds how much of that
// traffic a single discovery job can generate).
function isKnownBenignUndiciParserAssertion(error) {
  return (
    error?.code === 'ERR_ASSERTION' &&
    typeof error?.stack === 'string' &&
    error.stack.includes(`${path.sep}undici${path.sep}`) &&
    /Parser\.finish|onHttpSocketEnd|onHttpSocketClose/.test(error.stack)
  );
}

process.on('uncaughtException', (error) => {
  if (isKnownBenignUndiciParserAssertion(error)) {
    console.error(
      `[uncaughtException] ${new Date().toISOString()}: known-benign undici HTTP/1.1 parser assertion ` +
        `(third-party connection closed mid-parse under concurrent outbound fetches) - not a crash, no request state was corrupted, continuing normally. ${error.message}`
    );
    return;
  }
  console.error(`[uncaughtException] ${new Date().toISOString()}:`, error?.stack || error);
  // Do NOT process.exit() here: an uncaughtException means some in-flight
  // request is now in an unknown state, but the HTTP server and every other
  // in-flight request are still healthy. Exiting would turn one bad request
  // into a full outage for every concurrent user; logging and continuing
  // trades a theoretical "the process could be in a corrupted state" risk
  // (real crash-worthy corruption is astronomically rare in an Express app
  // like this one) for actual uptime under real concurrent load.
});

// Graceful shutdown: pm2 restart/stop (and Ctrl+C locally) send SIGTERM/SIGINT.
// Without handling them, Node's default behavior kills the process immediately,
// abruptly cutting off any HTTP request that happens to be mid-flight at that
// exact instant. Session/progress state itself is fine either way - it's
// file-persisted in store.js and reloads at boot - but in-flight requests
// deserve to finish. httpServer.close() stops accepting new connections while
// letting existing keep-alive connections and in-flight requests drain, then
// fires its callback once everything is done.
function gracefulShutdown(signal) {
  console.log(`[shutdown] ${new Date().toISOString()}: ${signal} received, closing HTTP server gracefully...`);
  httpServer.close(() => {
    console.log(`[shutdown] ${new Date().toISOString()}: HTTP server closed, exiting.`);
    process.exit(0);
  });
  // Fallback in case a stuck/leaked connection never lets close() finish -
  // pm2's own kill_timeout would eventually SIGKILL us anyway, but exiting
  // ourselves first logs a clean reason instead of a silent hard kill.
  // unref() so this timer never itself keeps the process alive if close()
  // finishes first.
  setTimeout(() => {
    console.error(`[shutdown] ${new Date().toISOString()}: graceful close timed out, forcing exit.`);
    process.exit(1);
  }, 9000).unref();
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const app = express();
const PORT = Number(process.env.PORT || 4317);
const HOST = String(process.env.HOST || '0.0.0.0');
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const AI_TRAINING_MODEL = process.env.OPENAI_TRAINING_MODEL || 'gpt-5.4-mini';
const SEARCH_MODEL = process.env.OPENAI_SEARCH_MODEL || 'gpt-5.5';
const USER_AGENT =
  process.env.PARSER_USER_AGENT || 'AuraParser/1.0 local lead audit tool';
const ADMIN_LOGIN = String(process.env.ADMIN_LOGIN || 'admin');
// No hardcoded default password: this admin panel is reachable over the
// public Cloudflare Tunnel, so a well-known fallback would be a real account
// takeover risk. If ADMIN_PASSWORD is missing, generate a random one once
// and persist it to .env so it survives restarts instead of rotating every
// boot and locking the operator out.
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || ensureAdminPassword());

function ensureAdminPassword() {
  const generated = crypto.randomBytes(18).toString('base64url');
  const envPath = path.join(__dirname, '.env');
  try {
    const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const withoutAdminPassword = existing
      .split('\n')
      .filter((line) => !/^ADMIN_PASSWORD=/.test(line))
      .join('\n');
    const separator = withoutAdminPassword && !withoutAdminPassword.endsWith('\n') ? '\n' : '';
    fs.writeFileSync(envPath, `${withoutAdminPassword}${separator}ADMIN_PASSWORD=${generated}\n`);
  } catch (error) {
    console.error(`Could not persist a generated ADMIN_PASSWORD to .env: ${error.message}`);
  }
  console.log('='.repeat(72));
  console.log('No ADMIN_PASSWORD was set in .env - generated one and saved it there.');
  console.log(`Admin login:    ${ADMIN_LOGIN}`);
  console.log(`Admin password: ${generated}`);
  console.log('='.repeat(72));
  return generated;
}
const RESPECT_ROBOTS = String(process.env.RESPECT_ROBOTS_TXT || 'true') !== 'false';
const MAX_ITEMS = Number(process.env.MAX_ITEMS_PER_RUN || 100);
const MAX_DISCOVERY_ITEMS = Number(process.env.MAX_DISCOVERY_ITEMS || 150);
const MAX_HTML_BYTES = 900_000;
const FETCH_TIMEOUT_MS = 12_000;
const GOOGLE_PLACES_TIMEOUT_MS = 8_000;
const CROSS_VERIFY_TIMEOUT_MS = Number(process.env.CROSS_VERIFY_TIMEOUT_MS || 25_000);
// Cap on how many merged candidates get the network-heavy cross-verification
// pass (crossVerifyPrimaryCompany: up to 3 extra outbound lookups per company
// - Amazon Location, public registries, public search - each of which may
// itself fetch a company website). Before the `all_sources` merge fix, a
// single-source result set rarely exceeded this size, so the pre-existing
// concurrency here (mapLimit 3) was mostly a formality. Once `all_sources`
// started actually merging google_places_api + amazon_location +
// public_search_all_sources, merged batches of 90+ companies became routine,
// multiplying the number of concurrent outbound HTTP/1.1 requests to
// uncontrolled third-party sites by several times over. That volume increase
// is what exposed a known-uncatchable Node/undici defect (an internal
// AssertionError thrown from client-h1.js's socket-teardown handler when a
// third-party server closes its connection while undici's parser happens to
// be mid-pause - see nodejs/undici issues about "uncatchable assertion
// errors"; it fires from a raw socket event callback, not from the fetch()
// promise chain, so no amount of try/catch around an individual company's
// request can catch it - only the process-level uncaughtException handler
// can, and it already logs-and-continues without crashing). Capping the
// number of companies that go through this step keeps concurrent
// third-party-fetch volume bounded regardless of how many companies a merge
// produces, without weakening any single company's own timeout. Companies
// past the cap are returned as-is (same graceful-degradation pattern already
// used by enrichDiscoveredCompanyContacts's own cap below).
const CROSS_VERIFY_MAX_COMPANIES = Number(process.env.CROSS_VERIFY_MAX_COMPANIES || 30);
const MAX_EXTRA_PAGES = 5;
const REGISTRY_TIMEOUT_MS = Number(process.env.REGISTRY_TIMEOUT_MS || 10_000);
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 30_000);
// Per-call timeout override (milliseconds) for the AI-search feature's three
// OpenAI call sites (planAiSearchQueries, runAiSearchBatch,
// enrichCompanyProfile - including their repair-retry calls). Real
// web_search-enabled calls plus large structured-output schemas routinely
// exceed the global client's OPENAI_TIMEOUT_MS default above, so those three
// functions read this admin-configurable setting fresh on every call instead
// of relying on the client default. store.js already clamps
// aiRequestTimeoutSeconds to 10-300 on save; this just guards against a
// missing/non-numeric value defensively and converts to milliseconds.
function clampAiRequestTimeoutMs(seconds) {
  const parsed = Number(seconds);
  const safeSeconds = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.max(parsed, 10), 300) : 120;
  return safeSeconds * 1000;
}
// If a source keeps returning only companies we already know about this many
// times in a row, further attempts are extremely unlikely to find anything
// new - stop early instead of burning through every remaining district/niche
// combination.
const MAX_DUPLICATE_STREAK = Number(process.env.MAX_DUPLICATE_STREAK || 3);
// "Maximum reach" mode: discovery jobs (crawling multiple niches/districts
// across several sources) legitimately need more than 5 minutes to cover
// everything. Give them real headroom before we cut the search short - a
// timeout now returns whatever was already found (see the DISCOVERY_TIMEOUT
// handling in runDiscoveryJob's catch block) instead of discarding the run.
const MAX_DISCOVERY_JOB_MS = Number(process.env.MAX_DISCOVERY_JOB_MS || 10 * 60_000);

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
  krakowpolska: { label: 'Kraków', lat: 50.0647, lng: 19.945, country: 'Polska', regionCode: 'PL', languageCode: 'pl' },
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
  },
  {
    categoryId: 'residential_developer',
    labels: { pl: 'Deweloperzy mieszkaniowi', ru: 'Девелоперы жилых комплексов', en: 'Residential developers' },
    aliases: ['deweloper mieszkaniowy', 'deweloperzy mieszkaniowi', 'девелоперы жилых комплексов', 'residential developer'],
    positiveKeywords: { pl: ['deweloper mieszkaniowy', 'budowa osiedla mieszkaniowego', 'inwestycja mieszkaniowa', 'mieszkania na sprzedaż od dewelopera', 'nowa inwestycja mieszkaniowa', 'apartamentowiec deweloperski', 'osiedle deweloperskie', 'sprzedaż mieszkań deweloperskich'], ru: ['девелопер жилой недвижимости', 'жилой комплекс застройка', 'застройка жилого района'], en: ['residential developer', 'housing development', 'apartment complex developer'] },
    negativeKeywords: { pl: ['biuro nieruchomości', 'pośrednictwo w obrocie nieruchomościami', 'wynajem mieszkań', 'zarządzanie nieruchomościami'], ru: ['агентство недвижимости', 'аренда квартир'], en: ['real estate agency', 'property management'] },
    excludedBusinessTypes: ['real_estate_agency', 'property_management'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['deweloper mieszkaniowy inwestycje', 'budowa osiedla mieszkaniowego', 'nowa inwestycja mieszkaniowa deweloper', 'mieszkania od dewelopera sprzedaż', 'firma deweloperska mieszkania']
  },
  {
    categoryId: 'commercial_developer',
    labels: { pl: 'Deweloperzy nieruchomości komercyjnych', ru: 'Девелоперы коммерческой недвижимости', en: 'Commercial real estate developers' },
    aliases: ['deweloper komercyjny', 'deweloperzy komercyjni', 'nieruchomości komercyjne deweloper'],
    positiveKeywords: { pl: ['deweloper komercyjny', 'inwestycje komercyjne', 'budowa biurowców', 'deweloper powierzchni biurowych', 'nieruchomości komercyjne inwestycja', 'park biznesowy budowa', 'centrum biurowe inwestycja', 'deweloper powierzchni magazynowych'], ru: ['девелопер коммерческой недвижимости', 'бизнес-парк застройщик', 'офисная недвижимость девелопер'], en: ['commercial real estate developer', 'office development', 'business park developer'] },
    negativeKeywords: { pl: ['pośrednictwo nieruchomości komercyjnych', 'wynajem powierzchni biurowych'], ru: ['аренда офисов', 'посредничество в недвижимости'], en: ['office leasing agency', 'real estate brokerage'] },
    excludedBusinessTypes: ['real_estate_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['deweloper nieruchomości komercyjnych', 'inwestor biurowiec budowa', 'deweloper powierzchni biurowych', 'inwestycja komercyjna deweloper', 'budowa parku biznesowego']
  },
  {
    categoryId: 'building_investor',
    labels: { pl: 'Inwestorzy budowlani', ru: 'Застройщики', en: 'Building developers / investors' },
    aliases: ['inwestor budowlany', 'firma deweloperska', 'zabudowa deweloperska', 'застройщики'],
    positiveKeywords: { pl: ['inwestor budowlany', 'firma deweloperska', 'proces inwestycyjny budowlany', 'pozwolenie na budowę inwestor', 'realizacja inwestycji budowlanej', 'generalny inwestor', 'zabudowa terenu inwestycyjnego'], ru: ['застройщик', 'генеральный застройщик', 'инвестиционно-строительная компания'], en: ['property developer', 'construction investor'] },
    negativeKeywords: { pl: ['pośrednictwo w obrocie nieruchomościami'], ru: ['агентство недвижимости'], en: ['real estate agency'] },
    excludedBusinessTypes: ['real_estate_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['inwestor budowlany firma', 'firma deweloperska realizacja inwestycji', 'generalny inwestor budowlany', 'proces inwestycyjny budowa', 'zabudowa terenu inwestycyjnego firma']
  },
  {
    categoryId: 'general_contractor',
    labels: { pl: 'Generalni wykonawcy', ru: 'Генеральные подрядчики', en: 'General contractors' },
    aliases: ['generalny wykonawca', 'generalni wykonawcy budowy', 'generalne wykonawstwo'],
    positiveKeywords: { pl: ['generalny wykonawca', 'generalne wykonawstwo', 'kompleksowa realizacja budowy', 'budowa pod klucz', 'generalny wykonawca robót budowlanych', 'zarządzanie budową', 'generalny wykonawca inwestycji'], ru: ['генеральный подрядчик', 'строительство под ключ'], en: ['general contractor', 'turnkey construction'] },
    negativeKeywords: { pl: ['podwykonawca drobnych prac wykończeniowych'], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['generalny wykonawca budowa', 'firma budowlana generalny wykonawca', 'generalne wykonawstwo inwestycji', 'budowa pod klucz generalny wykonawca', 'generalny wykonawca robót budowlanych']
  },
  {
    categoryId: 'construction_company',
    labels: { pl: 'Firmy budowlane', ru: 'Строительные компании', en: 'Construction companies' },
    aliases: ['firma budowlana', 'przedsiębiorstwo budowlane', 'firmy budowlane'],
    positiveKeywords: { pl: ['firma budowlana', 'usługi budowlane', 'roboty budowlane', 'budowa domów i budynków', 'firma budowlano-remontowa', 'kompleksowe usługi budowlane', 'wykonawstwo budowlane'], ru: ['строительная компания', 'строительные услуги'], en: ['construction company', 'building contractor'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma budowlana usługi', 'firma budowlana budowa domów', 'przedsiębiorstwo budowlane oferta', 'usługi budowlane firma budowlana']
  },
  {
    categoryId: 'industrial_construction',
    labels: { pl: 'Budownictwo przemysłowe', ru: 'Промышленное строительство', en: 'Industrial construction' },
    aliases: ['budowa obiektów przemysłowych', 'budownictwo przemysłowe', 'hale przemysłowe budowa'],
    positiveKeywords: { pl: ['budownictwo przemysłowe', 'budowa hal przemysłowych', 'budowa zakładów przemysłowych', 'obiekty przemysłowe realizacja', 'inwestycje przemysłowe budowa', 'hale przemysłowe generalny wykonawca'], ru: ['промышленное строительство', 'строительство промышленных объектов'], en: ['industrial construction', 'industrial facility builder'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budownictwo przemysłowe firma', 'budowa hal przemysłowych wykonawca', 'budowa zakładu przemysłowego wykonawca', 'firma budowlana obiekty przemysłowe']
  },
  {
    categoryId: 'road_construction',
    labels: { pl: 'Budowa dróg', ru: 'Дорожное строительство', en: 'Road construction' },
    aliases: ['budownictwo drogowe', 'firma drogowa', 'roboty drogowe'],
    positiveKeywords: { pl: ['budowa dróg', 'roboty drogowe', 'budownictwo drogowe', 'nawierzchnie asfaltowe', 'budowa dróg i autostrad', 'infrastruktura drogowa', 'przebudowa dróg'], ru: ['дорожное строительство', 'строительство автодорог'], en: ['road construction', 'highway construction'] },
    negativeKeywords: { pl: ['drobne naprawy nawierzchni parkingowych'], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa dróg firma', 'roboty drogowe wykonawca', 'firma drogowa budowa autostrad', 'budownictwo drogowe przetargi']
  },
  {
    categoryId: 'bridge_construction',
    labels: { pl: 'Budownictwo mostowe', ru: 'Мостостроительные компании', en: 'Bridge construction companies' },
    aliases: ['budowa mostów', 'firma mostowa', 'mostostroje'],
    positiveKeywords: { pl: ['budowa mostów', 'budownictwo mostowe', 'konstrukcje mostowe', 'budowa wiaduktów', 'przebudowa mostów', 'inżynieria mostowa'], ru: ['мостостроение', 'строительство мостов'], en: ['bridge construction', 'bridge engineering'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa mostów firma', 'budownictwo mostowe wykonawca', 'firma mostowa konstrukcje', 'budowa wiaduktów przetarg']
  },
  {
    categoryId: 'warehouse_construction',
    labels: { pl: 'Budowa magazynów', ru: 'Строительство складов', en: 'Warehouse construction' },
    aliases: ['budowa hal magazynowych', 'firma budująca magazyny'],
    positiveKeywords: { pl: ['budowa magazynów', 'hale magazynowe', 'budowa hal magazynowych', 'centra magazynowe realizacja', 'generalny wykonawca hal magazynowych', 'magazyny wysokiego składowania'], ru: ['строительство складов', 'складские комплексы'], en: ['warehouse construction', 'warehouse builder'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa magazynów firma', 'budowa hal magazynowych wykonawca', 'generalny wykonawca hal magazynowych', 'budowa centrum magazynowego']
  },
  {
    categoryId: 'production_facility_construction',
    labels: { pl: 'Budowa obiektów produkcyjnych', ru: 'Строительство производственных объектов', en: 'Production facility construction' },
    aliases: ['budowa hal produkcyjnych', 'obiekty produkcyjne budowa'],
    positiveKeywords: { pl: ['budowa hal produkcyjnych', 'obiekty produkcyjne realizacja', 'budowa zakładów produkcyjnych', 'hale produkcyjne pod klucz', 'generalny wykonawca hal produkcyjnych'], ru: ['строительство производственных зданий', 'производственные комплексы'], en: ['production facility construction', 'manufacturing plant construction'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa hal produkcyjnych firma', 'budowa zakładu produkcyjnego wykonawca', 'hale produkcyjne pod klucz', 'generalny wykonawca hal produkcyjnych']
  },
  {
    categoryId: 'logistics_center_construction',
    labels: { pl: 'Budowa centrów logistycznych', ru: 'Строительство логистических центров', en: 'Logistics center construction' },
    aliases: ['budowa centrum logistycznego', 'obiekty logistyczne budowa'],
    positiveKeywords: { pl: ['budowa centrów logistycznych', 'centrum logistyczne realizacja', 'park logistyczny budowa', 'obiekty logistyczne generalny wykonawca', 'hala logistyczna budowa'], ru: ['строительство логистических центров', 'логистический комплекс'], en: ['logistics center construction', 'logistics park developer'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa centrum logistycznego firma', 'park logistyczny budowa wykonawca', 'generalny wykonawca centrum logistycznego', 'budowa hali logistycznej']
  },
  {
    categoryId: 'hotel_construction',
    labels: { pl: 'Budowa hoteli', ru: 'Строительство гостиниц', en: 'Hotel construction' },
    aliases: ['budowa obiektów hotelowych', 'generalny wykonawca hoteli'],
    positiveKeywords: { pl: ['budowa hoteli', 'realizacja obiektów hotelowych', 'generalny wykonawca hoteli', 'budowa hotelu pod klucz', 'inwestycja hotelowa budowa'], ru: ['строительство гостиниц', 'строительство отелей'], en: ['hotel construction', 'hospitality construction'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa hotelu firma', 'generalny wykonawca hoteli', 'budowa obiektu hotelowego wykonawca', 'realizacja inwestycji hotelowej']
  },
  {
    categoryId: 'shopping_mall_construction',
    labels: { pl: 'Budowa centrów handlowych', ru: 'Строительство торговых центров', en: 'Shopping mall construction' },
    aliases: ['budowa galerii handlowych', 'generalny wykonawca centrów handlowych'],
    positiveKeywords: { pl: ['budowa centrów handlowych', 'galeria handlowa budowa', 'generalny wykonawca centrum handlowego', 'realizacja obiektów handlowych', 'budowa parku handlowego'], ru: ['строительство торговых центров', 'строительство торговых комплексов'], en: ['shopping mall construction', 'retail center construction'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa centrum handlowego firma', 'generalny wykonawca galerii handlowej', 'budowa parku handlowego wykonawca', 'realizacja inwestycji handlowej']
  },
  {
    categoryId: 'building_reconstruction',
    labels: { pl: 'Przebudowa i modernizacja budynków', ru: 'Реконструкция зданий', en: 'Building reconstruction and modernization' },
    aliases: ['przebudowa budynków', 'modernizacja budynków', 'rekonstrukcja budynków'],
    positiveKeywords: { pl: ['przebudowa budynków', 'modernizacja budynków', 'generalny remont budynku', 'termomodernizacja budynków', 'przebudowa obiektów budowlanych', 'rewitalizacja budynków', 'adaptacja budynków'], ru: ['реконструкция зданий', 'модернизация зданий', 'капитальный ремонт зданий'], en: ['building reconstruction', 'building renovation', 'building modernization'] },
    negativeKeywords: { pl: ['remont mieszkania', 'remont łazienki', 'malowanie mieszkań'], ru: ['ремонт квартиры'], en: ['apartment renovation'] },
    excludedBusinessTypes: ['apartment_renovation', 'interior_finishing'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['przebudowa budynku firma', 'modernizacja budynków wykonawca', 'generalny remont budynku firma budowlana', 'termomodernizacja budynków wykonawca', 'rewitalizacja obiektów budowlanych']
  },
  {
    categoryId: 'heritage_restoration',
    labels: { pl: 'Konserwacja i restauracja zabytków', ru: 'Реставрация', en: 'Heritage restoration' },
    aliases: ['restauracja zabytków', 'konserwacja zabytków', 'renowacja zabytków'],
    positiveKeywords: { pl: ['restauracja zabytków', 'konserwacja zabytków', 'renowacja obiektów zabytkowych', 'prace konserwatorskie', 'rewaloryzacja zabytków', 'dokumentacja konserwatorska', 'renowacja elewacji zabytkowych'], ru: ['реставрация памятников', 'реставрационные работы'], en: ['heritage restoration', 'monument conservation'] },
    negativeKeywords: { pl: ['renowacja mebli', 'czyszczenie dywanów'], ru: ['реставрация мебели'], en: ['furniture restoration'] },
    excludedBusinessTypes: ['furniture_restoration'],
    relatedServices: ['strona portfolio', 'Google Business Profile', 'Google Ads B2B', 'formularz zapytania o projekt'],
    searchTemplates: ['restauracja zabytków firma', 'konserwacja zabytków wykonawca', 'renowacja obiektów zabytkowych firma', 'prace konserwatorskie zabytki']
  },
  {
    categoryId: 'monolithic_works',
    labels: { pl: 'Roboty monolityczne', ru: 'Монолитные работы', en: 'Monolithic (cast-in-place) works' },
    aliases: ['roboty monolityczne', 'beton monolityczny', 'konstrukcje monolityczne'],
    positiveKeywords: { pl: ['roboty monolityczne', 'beton monolityczny', 'wykonawstwo konstrukcji monolitycznych', 'szalunki i zbrojenie', 'stan zerowy budynku', 'konstrukcje żelbetowe monolityczne', 'betonowanie konstrukcji'], ru: ['монолитные работы', 'монолитное строительство', 'заливка бетона'], en: ['monolithic concrete works', 'cast-in-place concrete'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['roboty monolityczne firma', 'wykonawca konstrukcji monolitycznych', 'firma betoniarska stan zerowy', 'podwykonawca roboty żelbetowe monolityczne']
  },
  {
    categoryId: 'rc_structures',
    labels: { pl: 'Konstrukcje żelbetowe', ru: 'Железобетонные конструкции', en: 'Reinforced concrete structures' },
    aliases: ['konstrukcje żelbetowe', 'prefabrykaty żelbetowe', 'elementy żelbetowe'],
    positiveKeywords: { pl: ['konstrukcje żelbetowe', 'prefabrykaty betonowe', 'elementy żelbetowe prefabrykowane', 'produkcja prefabrykatów żelbetowych', 'stropy żelbetowe', 'słupy i belki żelbetowe', 'wytwórnia prefabrykatów'], ru: ['железобетонные конструкции', 'производство жби', 'сборный железобетон'], en: ['reinforced concrete structures', 'precast concrete elements'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['konstrukcje żelbetowe producent', 'prefabrykaty żelbetowe firma', 'wytwórnia prefabrykatów betonowych', 'producent elementów żelbetowych']
  },
  {
    categoryId: 'steel_structures',
    labels: { pl: 'Konstrukcje stalowe', ru: 'Металлоконструкции', en: 'Steel structures' },
    aliases: ['konstrukcje stalowe', 'hale stalowe', 'producent konstrukcji stalowych'],
    positiveKeywords: { pl: ['konstrukcje stalowe', 'produkcja konstrukcji stalowych', 'hale stalowe', 'montaż konstrukcji stalowych', 'wytwórnia konstrukcji stalowych', 'stalowe hale przemysłowe', 'spawanie konstrukcji stalowych'], ru: ['металлоконструкции', 'производство металлоконструкций', 'стальные конструкции'], en: ['steel structures', 'structural steel fabrication'] },
    negativeKeywords: { pl: ['kowalstwo artystyczne', 'ogrodzenia metalowe'], ru: ['художественная ковка'], en: ['decorative metalwork'] },
    excludedBusinessTypes: ['ornamental_metalwork'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['konstrukcje stalowe producent', 'firma montaż konstrukcji stalowych', 'wytwórnia konstrukcji stalowych', 'hale stalowe producent']
  },
  {
    categoryId: 'roofing',
    labels: { pl: 'Firmy dekarskie', ru: 'Кровельные компании', en: 'Roofing companies' },
    aliases: ['dekarstwo', 'pokrycia dachowe', 'firma dekarska'],
    positiveKeywords: { pl: ['firma dekarska', 'pokrycia dachowe', 'krycie dachów', 'naprawa dachów', 'montaż dachów', 'dachy płaskie i skośne', 'membrany dachowe', 'blachodachówka montaż'], ru: ['кровельные работы', 'кровельная компания', 'монтаж кровли'], en: ['roofing company', 'roof installation'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma dekarska usługi', 'pokrycia dachowe firma', 'montaż dachów wykonawca', 'krycie dachów firma dekarska']
  },
  {
    categoryId: 'facade',
    labels: { pl: 'Firmy elewacyjne', ru: 'Фасадные компании', en: 'Facade companies' },
    aliases: ['elewacje budynków', 'firma elewacyjna', 'ocieplenia elewacji'],
    positiveKeywords: { pl: ['firma elewacyjna', 'wykonawstwo elewacji', 'elewacje wentylowane', 'ocieplenie budynków elewacja', 'montaż elewacji', 'elewacje aluminiowo-szklane', 'fasady budynków'], ru: ['фасадные работы', 'фасадная компания', 'вентилируемые фасады'], en: ['facade company', 'building facade contractor'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma elewacyjna wykonawca', 'montaż elewacji budynków', 'elewacje wentylowane firma', 'ocieplenie elewacji firma budowlana']
  },
  {
    categoryId: 'earthworks',
    labels: { pl: 'Roboty ziemne', ru: 'Земляные работы', en: 'Earthworks' },
    aliases: ['roboty ziemne', 'prace ziemne', 'wykopy budowlane'],
    positiveKeywords: { pl: ['roboty ziemne', 'wykopy fundamentowe', 'niwelacja terenu', 'prace ziemne koparką', 'usługi koparko-ładowarką', 'transport ziemi', 'roboty ziemne budowlane'], ru: ['земляные работы', 'выемка грунта', 'планировка территории'], en: ['earthworks', 'excavation services'] },
    negativeKeywords: { pl: ['prace ziemne przydomowe ogrodnicze'], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['roboty ziemne firma', 'usługi koparką wykopy', 'prace ziemne budowlane wykonawca', 'niwelacja terenu firma']
  },
  {
    categoryId: 'demolition',
    labels: { pl: 'Rozbiórki budynków', ru: 'Снос зданий', en: 'Building demolition' },
    aliases: ['rozbiórka budynków', 'wyburzenia', 'firma rozbiórkowa'],
    positiveKeywords: { pl: ['rozbiórki budynków', 'wyburzenia obiektów', 'firma rozbiórkowa', 'rozbiórka konstrukcji budowlanych', 'wyburzanie budynków', 'demontaż obiektów budowlanych'], ru: ['снос зданий', 'демонтаж зданий', 'снос конструкций'], en: ['building demolition', 'structure demolition'] },
    negativeKeywords: { pl: ['wywóz gruzu drobny', 'demontaż mebli'], ru: ['вывоз мусора'], en: ['waste removal'] },
    excludedBusinessTypes: ['waste_removal'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['rozbiórki budynków firma', 'firma rozbiórkowa wyburzenia', 'wyburzanie obiektów budowlanych', 'rozbiórka konstrukcji firma']
  },
  {
    categoryId: 'drilling',
    labels: { pl: 'Usługi wiertnicze', ru: 'Бурение', en: 'Drilling services' },
    aliases: ['wiercenia', 'firma wiertnicza', 'usługi wiertnicze'],
    positiveKeywords: { pl: ['usługi wiertnicze', 'wiercenia geotechniczne', 'wiercenia pod fundamenty', 'palowanie fundamentów', 'wiercenia otworów badawczych', 'przewierty horyzontalne', 'wiercenia studni głębinowych przemysłowych'], ru: ['буровые работы', 'бурение скважин промышленное', 'геотехническое бурение'], en: ['drilling services', 'geotechnical drilling', 'foundation piling'] },
    negativeKeywords: { pl: ['wiercenie studni przydomowej', 'studnia dla domu', 'ujęcie wody dla ogrodu'], ru: ['бурение скважины для дома'], en: ['residential well drilling'] },
    excludedBusinessTypes: ['residential_well_drilling'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['usługi wiertnicze firma', 'wiercenia geotechniczne wykonawca', 'firma wiertnicza fundamenty', 'palowanie fundamentów wiercenia', 'przewierty horyzontalne firma']
  },
  {
    categoryId: 'geodesy',
    labels: { pl: 'Usługi geodezyjne', ru: 'Геодезия', en: 'Geodesic surveying services' },
    aliases: ['geodeta', 'biuro geodezyjne', 'pomiary geodezyjne'],
    positiveKeywords: { pl: ['usługi geodezyjne', 'biuro geodezyjne', 'pomiary geodezyjne', 'geodeta uprawniony', 'mapy do celów projektowych', 'tyczenie budynków', 'inwentaryzacja geodezyjna powykonawcza', 'podziały nieruchomości geodezja'], ru: ['геодезические услуги', 'геодезия'], en: ['geodetic surveying', 'land surveying'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['usługi geodezyjne firma', 'biuro geodezyjne pomiary', 'geodeta mapy do celów projektowych', 'tyczenie budynku geodeta']
  },
  {
    categoryId: 'geology',
    labels: { pl: 'Badania geologiczne', ru: 'Геология', en: 'Geological survey services' },
    aliases: ['geologia inżynierska', 'badania geotechniczne', 'firma geologiczna'],
    positiveKeywords: { pl: ['badania geologiczne', 'geologia inżynierska', 'badania geotechniczne gruntu', 'dokumentacja geologiczno-inżynierska', 'opinie geotechniczne', 'wiercenia badawcze geologiczne', 'analiza gruntu pod fundamenty'], ru: ['инженерная геология', 'геологические изыскания'], en: ['geological survey', 'geotechnical investigation'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['badania geologiczne firma', 'geologia inżynierska usługi', 'dokumentacja geologiczno-inżynierska firma', 'badania geotechniczne gruntu wykonawca']
  },
  {
    categoryId: 'bim_design',
    labels: { pl: 'Projektowanie BIM', ru: 'BIM-проектирование', en: 'BIM design' },
    aliases: ['bim', 'modelowanie bim', 'projektowanie bim'],
    positiveKeywords: { pl: ['projektowanie bim', 'modelowanie bim', 'koordynacja bim', 'model bim budynku', 'projektowanie w technologii bim', 'usługi bim dla budownictwa', 'bim manager'], ru: ['bim проектирование', 'bim моделирование'], en: ['bim design', 'building information modeling'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona portfolio', 'Google Business Profile', 'Google Ads B2B', 'formularz zapytania o projekt'],
    searchTemplates: ['projektowanie bim firma', 'modelowanie bim budownictwo', 'koordynacja bim usługi', 'firma bim projektowanie budynków']
  },
  {
    categoryId: 'architecture_firm',
    labels: { pl: 'Biura architektoniczne', ru: 'Архитектурные бюро', en: 'Architecture firms' },
    aliases: ['biuro architektoniczne', 'pracownia architektoniczna', 'architekt'],
    positiveKeywords: { pl: ['biuro architektoniczne', 'pracownia architektoniczna', 'projekty architektoniczne', 'architekt budynków', 'projekt domu architekt', 'koncepcja architektoniczna', 'projekty budowlane i architektoniczne'], ru: ['архитектурное бюро', 'архитектурная студия'], en: ['architecture firm', 'architectural design studio'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona portfolio', 'Google Business Profile', 'Google Ads B2B', 'formularz zapytania o projekt'],
    searchTemplates: ['biuro architektoniczne projekty', 'pracownia architektoniczna usługi', 'architekt projekt budynku', 'biuro architektoniczne budownictwo']
  },
  {
    categoryId: 'design_bureau',
    labels: { pl: 'Biura projektowe', ru: 'Проектные бюро', en: 'Design / engineering bureaus' },
    aliases: ['biuro projektowe', 'pracownia projektowa', 'projektowanie budowlane'],
    positiveKeywords: { pl: ['biuro projektowe', 'projekty budowlane', 'projektowanie konstrukcyjne', 'projekt instalacji sanitarnych', 'projektowanie branżowe budownictwo', 'kompleksowa dokumentacja projektowa', 'projekty wykonawcze budowlane'], ru: ['проектное бюро', 'проектная организация'], en: ['design bureau', 'engineering design firm'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona portfolio', 'Google Business Profile', 'Google Ads B2B', 'formularz zapytania o projekt'],
    searchTemplates: ['biuro projektowe budownictwo', 'projekty budowlane firma', 'biuro projektowe konstrukcyjne', 'dokumentacja projektowa budowlana firma']
  },
  {
    categoryId: 'public_space_design',
    labels: { pl: 'Projektowanie przestrzeni publicznych', ru: 'Дизайн общественных пространств', en: 'Public space design' },
    aliases: ['przestrzenie publiczne projekt', 'projektowanie urbanistyczne', 'urban design'],
    positiveKeywords: { pl: ['projektowanie przestrzeni publicznych', 'zagospodarowanie przestrzeni miejskiej', 'projekt placu miejskiego', 'urbanistyka i architektura', 'rewitalizacja przestrzeni publicznej', 'projektowanie małej architektury', 'koncepcja zagospodarowania terenu'], ru: ['дизайн общественных пространств', 'урбанистика'], en: ['public space design', 'urban design'] },
    negativeKeywords: { pl: [], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona portfolio', 'Google Business Profile', 'Google Ads B2B', 'formularz zapytania o projekt'],
    searchTemplates: ['projektowanie przestrzeni publicznych pracownia', 'zagospodarowanie przestrzeni miejskiej projekt', 'rewitalizacja przestrzeni publicznej firma', 'pracownia urbanistyczna projekt']
  },
  {
    categoryId: 'landscape_architecture',
    labels: { pl: 'Architektura krajobrazu', ru: 'Ландшафтная архитектура', en: 'Landscape architecture' },
    aliases: ['architekt krajobrazu', 'projektowanie ogrodów', 'architektura krajobrazu'],
    positiveKeywords: { pl: ['architektura krajobrazu', 'projektowanie ogrodów', 'architekt krajobrazu', 'projekt zieleni miejskiej', 'aranżacja terenów zielonych', 'projektowanie parków i skwerów', 'pracownia architektury krajobrazu'], ru: ['ландшафтная архитектура', 'ландшафтный дизайн'], en: ['landscape architecture', 'landscape design'] },
    negativeKeywords: { pl: ['ogrodnik przydomowy koszenie trawy', 'pielęgnacja ogrodów usługi'], ru: ['уход за садом'], en: ['garden maintenance service'] },
    excludedBusinessTypes: ['gardening_service'],
    relatedServices: ['strona portfolio', 'Google Business Profile', 'Google Ads B2B', 'formularz zapytania o projekt'],
    searchTemplates: ['architektura krajobrazu pracownia', 'projektowanie ogrodów architekt', 'architekt krajobrazu projekt zieleni', 'projekt terenów zielonych firma']
  },
  {
    categoryId: 'budowa-domow',
    labels: { pl: 'Budowa domów', ru: 'Строительство домов', en: 'House construction' },
    aliases: ['budowa domów', 'firma budowlana', 'budownictwo jednorodzinne', 'generalny wykonawca'],
    positiveKeywords: { pl: ['budowa domów jednorodzinnych', 'generalne wykonawstwo', 'budowa domu pod klucz', 'stan surowy zamknięty', 'stan surowy otwarty', 'projekty domów', 'budowa domu na zamówienie', 'wykończenie domów pod klucz', 'firma budowlana', 'budownictwo indywidualne'], ru: ['строительство домов', 'строительство под ключ', 'индивидуальное строительство', 'генеральный подрядчик'], en: ['house construction', 'turnkey home building', 'general contractor', 'custom home builder'] },
    negativeKeywords: { pl: ['remonty mieszkań', 'wykończenia wnętrz', 'firma sprzątająca', 'ogrodzenia', 'brukarstwo'], ru: ['ремонт квартир', 'клининговая компания'], en: ['apartment renovation', 'cleaning company'] },
    excludedBusinessTypes: ['real_estate_agency', 'interior_designer', 'cleaning_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa domów pod klucz', 'firma budowlana domy jednorodzinne', 'generalny wykonawca budowa domu', 'budowa domu na zamówienie', 'stan surowy zamknięty budowa domu']
  },
  {
    categoryId: 'domy-szkieletowe',
    labels: { pl: 'Domy szkieletowe', ru: 'Каркасные дома', en: 'Timber frame houses' },
    aliases: ['domy szkieletowe', 'technologia szkieletowa', 'dom kanadyjski', 'domy prefabrykowane szkieletowe'],
    positiveKeywords: { pl: ['domy szkieletowe', 'technologia szkieletowa drewniana', 'dom kanadyjski', 'dom w technologii szkieletowej', 'domy szkieletowe całoroczne', 'prefabrykacja domów szkieletowych', 'domy szkieletowe pod klucz', 'panele szkieletowe'], ru: ['каркасные дома', 'каркасное домостроение', 'канадская технология', 'дома по каркасной технологии'], en: ['timber frame house', 'wood frame construction', 'prefab frame house'] },
    negativeKeywords: { pl: ['domy murowane', 'domy z bali', 'wiaty drewniane', 'stolarnia meblowa'], ru: ['мебельная мастерская'], en: ['furniture workshop'] },
    excludedBusinessTypes: ['furniture_manufacturer', 'carpentry_workshop'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['domy szkieletowe pod klucz', 'budowa domów szkieletowych', 'domy w technologii kanadyjskiej', 'producent domów szkieletowych', 'domy szkieletowe całoroczne cena']
  },
  {
    categoryId: 'domy-drewniane',
    labels: { pl: 'Domy drewniane', ru: 'Деревянные дома', en: 'Wooden houses' },
    aliases: ['domy drewniane', 'domy z bali', 'domy zrębowe', 'domy z bali drewnianych'],
    positiveKeywords: { pl: ['domy drewniane', 'domy z bali', 'domy zrębowe', 'domy z bali okrągłych', 'domy z drewna klejonego', 'całoroczne domy drewniane', 'domki drewniane pod klucz', 'budowa domów z drewna'], ru: ['деревянные дома', 'дома из бруса', 'дома из бревна', 'срубы'], en: ['wooden houses', 'log houses', 'timber houses'] },
    negativeKeywords: { pl: ['altany ogrodowe', 'wiaty drewniane', 'domki letniskowe rekreacyjne małe', 'tartak', 'sklep z drewnem'], ru: ['лесопилка', 'магазин пиломатериалов'], en: ['sawmill', 'timber shop'] },
    excludedBusinessTypes: ['sawmill', 'garden_shed_seller'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['domy drewniane pod klucz', 'producent domów z bali', 'domy zrębowe całoroczne', 'budowa domu drewnianego cena', 'domy z drewna klejonego']
  },
  {
    categoryId: 'domy-modulowe',
    labels: { pl: 'Domy modułowe', ru: 'Модульные дома', en: 'Modular houses' },
    aliases: ['domy modułowe', 'domy kontenerowe', 'moduły mieszkalne', 'domy prefabrykowane modułowe'],
    positiveKeywords: { pl: ['domy modułowe', 'domy modułowe całoroczne', 'domy z kontenerów', 'moduły mieszkalne', 'domy modułowe pod klucz', 'domy modułowe szkieletowe', 'szybki montaż domu modułowego', 'domy modułowe piętrowe'], ru: ['модульные дома', 'дома из модулей', 'контейнерные дома', 'быстровозводимые дома'], en: ['modular houses', 'prefab modular homes', 'container homes'] },
    negativeKeywords: { pl: ['kontenery biurowe', 'kontenery magazynowe', 'toalety przenośne', 'kontenery budowlane socjalne'], ru: ['офисные контейнеры', 'биотуалеты'], en: ['office containers', 'portable toilets'] },
    excludedBusinessTypes: ['office_container_rental', 'portable_toilet_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['domy modułowe cena', 'producent domów modułowych', 'domy modułowe całoroczne pod klucz', 'szybki montaż domu modułowego', 'domy modułowe na działkę']
  },
  {
    categoryId: 'domy-pasywne',
    labels: { pl: 'Domy pasywne', ru: 'Пассивные дома', en: 'Passive houses' },
    aliases: ['domy pasywne', 'domy energooszczędne', 'budownictwo pasywne', 'dom zeroenergetyczny'],
    positiveKeywords: { pl: ['domy pasywne', 'budowa domów pasywnych', 'domy energooszczędne', 'certyfikat domu pasywnego', 'dom niskoenergetyczny', 'wentylacja mechaniczna z rekuperacją', 'izolacja termiczna domu pasywnego', 'dom zeroenergetyczny'], ru: ['пассивные дома', 'энергоэффективные дома', 'дом с нулевым потреблением энергии'], en: ['passive house', 'energy efficient home', 'net zero house'] },
    negativeKeywords: { pl: ['fotowoltaika sprzedaż', 'pompy ciepła sklep', 'termomodernizacja bloków'], ru: ['продажа фотовольтаики', 'магазин тепловых насосов'], en: ['solar panel retailer'] },
    excludedBusinessTypes: ['solar_panel_retailer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa domów pasywnych', 'projekt domu pasywnego', 'dom energooszczędny pod klucz', 'certyfikowany dom pasywny cena', 'domy pasywne z rekuperacją']
  },
  {
    categoryId: 'producenci-domow',
    labels: { pl: 'Producenci domów', ru: 'Производители домов', en: 'House manufacturers' },
    aliases: ['producent domów', 'domy katalogowe', 'domy gotowe', 'fabryka domów'],
    positiveKeywords: { pl: ['producent domów', 'domy katalogowe', 'gotowe projekty domów', 'fabryka domów', 'domy jednorodzinne pod klucz', 'systemy budowy domów', 'elementy prefabrykowane domów', 'domy z prefabrykatów'], ru: ['производитель домов', 'дома по каталогу', 'готовые проекты домов', 'фабрика домов'], en: ['house manufacturer', 'catalog homes', 'prefab home producer'] },
    negativeKeywords: { pl: ['biuro architektoniczne projekty indywidualne', 'sklep meblowy', 'producent okien'], ru: ['архитектурное бюро', 'мебельный магазин'], en: ['architecture office', 'furniture store'] },
    excludedBusinessTypes: ['architecture_office', 'window_manufacturer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['producent domów jednorodzinnych', 'domy katalogowe pod klucz', 'fabryka domów cena', 'gotowe projekty domów jednorodzinnych', 'domy z prefabrykatów producent']
  },
  {
    categoryId: 'sauny-ogrodowe',
    labels: { pl: 'Sauny ogrodowe', ru: 'Производители бань', en: 'Garden saunas' },
    aliases: ['sauny ogrodowe', 'banie', 'sauna zewnętrzna', 'bania rosyjska'],
    positiveKeywords: { pl: ['sauny ogrodowe', 'producent saun ogrodowych', 'banie fińskie', 'sauna zewnętrzna drewniana', 'sauna beczka', 'domki saunowe', 'sauna na taras ogrodowy', 'banie drewniane producent'], ru: ['производство бань', 'бани под ключ', 'бани из бревна', 'финские сауны для дачи'], en: ['garden sauna manufacturer', 'outdoor sauna', 'barrel sauna'] },
    negativeKeywords: { pl: ['salon spa', 'siłownia z sauną', 'basen kryty publiczny', 'centrum wellness'], ru: ['спа-салон', 'фитнес-клуб'], en: ['spa center', 'gym'] },
    excludedBusinessTypes: ['spa_center', 'gym', 'public_pool'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['producent saun ogrodowych', 'sauna beczka na zamówienie', 'banie fińskie producent', 'sauna ogrodowa drewniana cena', 'domek saunowy pod klucz']
  },
  {
    categoryId: 'producenci-garazy',
    labels: { pl: 'Producenci garaży', ru: 'Производители гаражей', en: 'Garage manufacturers' },
    aliases: ['producent garaży', 'garaże blaszane', 'garaże murowane', 'garaże drewniane'],
    positiveKeywords: { pl: ['producent garaży', 'garaże blaszane', 'garaże murowane', 'garaże drewniane', 'garaże wolnostojące', 'garaże na wymiar', 'garaże z podjazdem', 'garaże blaszane producent'], ru: ['производство гаражей', 'гаражи металлические', 'гаражи кирпичные', 'гаражи на заказ'], en: ['garage manufacturer', 'steel garages', 'prefab garages'] },
    negativeKeywords: { pl: ['warsztat samochodowy', 'myjnia samochodowa', 'parking podziemny', 'wynajem garaży'], ru: ['автосервис', 'подземная парковка'], en: ['car repair shop', 'parking garage rental'] },
    excludedBusinessTypes: ['car_repair', 'parking_facility'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['producent garaży blaszanych', 'garaże murowane na wymiar', 'garaże wolnostojące cena', 'garaże drewniane producent', 'garaż na zamówienie']
  },
  {
    categoryId: 'producenci-wiat',
    labels: { pl: 'Producenci wiat', ru: 'Производители навесов', en: 'Canopy manufacturers' },
    aliases: ['producent wiat', 'wiaty garażowe', 'wiaty carportowe', 'zadaszenia'],
    positiveKeywords: { pl: ['producent wiat', 'wiaty garażowe', 'wiaty carportowe', 'wiaty na samochód', 'wiaty drewniane', 'wiaty stalowe', 'zadaszenia tarasów', 'wiaty na wymiar'], ru: ['производство навесов', 'навесы для авто', 'карпорты', 'навесы на заказ'], en: ['carport manufacturer', 'canopy manufacturer', 'garage canopy'] },
    negativeKeywords: { pl: ['parasole ogrodowe', 'markizy okienne', 'namioty eventowe'], ru: ['садовые зонты', 'шатры для мероприятий'], en: ['event tent rental'] },
    excludedBusinessTypes: ['event_tent_rental', 'awning_retailer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['producent wiat garażowych', 'wiaty carportowe na wymiar', 'wiaty drewniane cena', 'zadaszenia tarasów producent', 'wiaty stalowe na samochody']
  },
  {
    categoryId: 'sprzedaz-koparek',
    labels: { pl: 'Sprzedaż koparek', ru: 'Продажа экскаваторов', en: 'Excavator sales' },
    aliases: ['sprzedaż koparek', 'koparki używane', 'koparki gąsienicowe', 'koparko-ładowarki sprzedaż'],
    positiveKeywords: { pl: ['sprzedaż koparek', 'koparki gąsienicowe', 'koparki kołowe', 'koparko-ładowarki', 'koparki używane', 'koparki nowe i używane', 'minikoparki sprzedaż', 'dealer koparek'], ru: ['продажа экскаваторов', 'экскаваторы гусеничные', 'экскаваторы б/у', 'мини-экскаваторы'], en: ['excavator sales', 'used excavators', 'mini excavators for sale'] },
    negativeKeywords: { pl: ['sklep z narzędziami ogrodowymi', 'wypożyczalnia sprzętu ogrodowego', 'sklep hydrauliczny'], ru: ['магазин садового инструмента'], en: ['garden tool shop'] },
    excludedBusinessTypes: ['hardware_store', 'garden_tool_shop'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['sprzedaż koparek używanych', 'koparki gąsienicowe na sprzedaż', 'dealer koparek Polska', 'minikoparki sprzedaż cena', 'koparko-ładowarki używane sprzedaż']
  },
  {
    categoryId: 'sprzedaz-ladowarek',
    labels: { pl: 'Sprzedaż ładowarek', ru: 'Продажа погрузчиков', en: 'Loader sales' },
    aliases: ['sprzedaż ładowarek', 'ładowarki teleskopowe', 'ładowarki kołowe', 'ładowarki czołowe'],
    positiveKeywords: { pl: ['sprzedaż ładowarek', 'ładowarki teleskopowe', 'ładowarki kołowe', 'ładowarki czołowe', 'ładowarki używane', 'ładowarki kompaktowe', 'dealer ładowarek', 'ładowarki do gospodarstwa'], ru: ['продажа погрузчиков', 'телескопические погрузчики', 'фронтальные погрузчики', 'погрузчики б/у'], en: ['loader sales', 'telehandler for sale', 'wheel loader dealer'] },
    negativeKeywords: { pl: ['wózki widłowe magazynowe', 'sklep z paletami', 'wynajem rusztowań'], ru: ['складские вилочные погрузчики'], en: ['warehouse forklift shop'] },
    excludedBusinessTypes: ['warehouse_equipment_shop'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['sprzedaż ładowarek teleskopowych', 'ładowarki kołowe używane sprzedaż', 'dealer ładowarek Polska', 'ładowarki czołowe na sprzedaż', 'ładowarki kompaktowe cena']
  },
  {
    categoryId: 'sprzedaz-dzwigow',
    labels: { pl: 'Sprzedaż dźwigów', ru: 'Продажа кранов', en: 'Crane sales' },
    aliases: ['sprzedaż dźwigów', 'żurawie wieżowe', 'dźwigi budowlane', 'HDS sprzedaż'],
    positiveKeywords: { pl: ['sprzedaż dźwigów', 'żurawie wieżowe', 'żurawie samojezdne', 'dźwigi budowlane', 'HDS hydrauliczny dźwig samochodowy', 'dźwigi używane', 'żurawie gąsienicowe', 'dealer żurawi'], ru: ['продажа кранов', 'башенные краны', 'автокраны', 'краны б/у'], en: ['crane sales', 'tower crane dealer', 'mobile crane for sale'] },
    negativeKeywords: { pl: ['windy osobowe', 'platformy przeładunkowe magazynowe', 'wynajem żurawi'], ru: ['пассажирские лифты', 'аренда кранов'], en: ['passenger elevators', 'crane rental'] },
    excludedBusinessTypes: ['elevator_installer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['sprzedaż żurawi wieżowych', 'dźwigi budowlane używane sprzedaż', 'HDS na sprzedaż', 'żurawie samojezdne dealer', 'sprzedaż dźwigów budowlanych']
  },
  {
    categoryId: 'sprzedaz-maszyn-budowlanych',
    labels: { pl: 'Sprzedaż maszyn budowlanych', ru: 'Продажа спецтехники', en: 'Construction equipment sales' },
    aliases: ['sprzedaż maszyn budowlanych', 'sprzęt budowlany sprzedaż', 'maszyny drogowe sprzedaż', 'dealer maszyn budowlanych'],
    positiveKeywords: { pl: ['sprzedaż maszyn budowlanych', 'maszyny budowlane używane', 'sprzęt budowlany na sprzedaż', 'maszyny drogowe', 'walce drogowe sprzedaż', 'równiarki sprzedaż', 'dealer maszyn budowlanych', 'ciężki sprzęt budowlany'], ru: ['продажа спецтехники', 'строительная техника б/у', 'дорожная техника', 'дилер спецтехники'], en: ['construction equipment sales', 'heavy machinery dealer', 'used heavy equipment'] },
    negativeKeywords: { pl: ['narzędzia ręczne sklep', 'wynajem rusztowań', 'sklep budowlany materiały'], ru: ['магазин ручного инструмента'], en: ['hand tools store'] },
    excludedBusinessTypes: ['hardware_store', 'building_materials_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['sprzedaż maszyn budowlanych', 'dealer maszyn budowlanych Polska', 'sprzęt budowlany używany sprzedaż', 'maszyny drogowe na sprzedaż', 'ciężki sprzęt budowlany sprzedaż']
  },
  {
    categoryId: 'wynajem-maszyn-budowlanych',
    labels: { pl: 'Wynajem maszyn budowlanych', ru: 'Аренда спецтехники', en: 'Construction equipment rental' },
    aliases: ['wynajem maszyn budowlanych', 'wypożyczalnia sprzętu budowlanego', 'wynajem koparek', 'wynajem sprzętu ciężkiego'],
    positiveKeywords: { pl: ['wynajem maszyn budowlanych', 'wypożyczalnia sprzętu budowlanego', 'wynajem koparek', 'wynajem koparko-ładowarek', 'wynajem zagęszczarek', 'wynajem sprzętu budowlanego z operatorem', 'wynajem minikoparek', 'wynajem walców'], ru: ['аренда спецтехники', 'прокат строительной техники', 'аренда экскаватора', 'аренда техники с оператором'], en: ['construction equipment rental', 'excavator rental', 'heavy machinery rental'] },
    negativeKeywords: { pl: ['wynajem samochodów osobowych', 'wypożyczalnia narzędzi ręcznych', 'wynajem rusztowań elewacyjnych'], ru: ['прокат легковых автомобилей'], en: ['car rental'] },
    excludedBusinessTypes: ['car_rental', 'tool_rental_small'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['wynajem koparek z operatorem', 'wypożyczalnia sprzętu budowlanego', 'wynajem maszyn budowlanych cennik', 'wynajem minikoparki', 'wynajem koparko-ładowarki']
  },
  {
    categoryId: 'serwis-maszyn-budowlanych',
    labels: { pl: 'Serwis maszyn budowlanych', ru: 'Сервис спецтехники', en: 'Construction equipment service' },
    aliases: ['serwis maszyn budowlanych', 'serwis koparek', 'naprawa sprzętu budowlanego', 'serwis hydrauliki siłowej'],
    positiveKeywords: { pl: ['serwis maszyn budowlanych', 'serwis koparek', 'naprawa sprzętu budowlanego', 'serwis hydrauliki siłowej', 'przeglądy maszyn budowlanych', 'serwis mobilny maszyn budowlanych', 'naprawa koparko-ładowarek', 'diagnostyka maszyn budowlanych'], ru: ['сервис спецтехники', 'ремонт экскаваторов', 'ремонт гидравлики', 'выездной сервис техники'], en: ['heavy equipment service', 'excavator repair', 'hydraulic repair service'] },
    negativeKeywords: { pl: ['warsztat samochodowy osobowy', 'wulkanizacja', 'myjnia samochodowa'], ru: ['автосервис легковых авто', 'шиномонтаж'], en: ['car repair shop', 'tire shop'] },
    excludedBusinessTypes: ['car_repair', 'tire_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['serwis maszyn budowlanych', 'naprawa koparek serwis', 'serwis hydrauliki siłowej maszyny budowlane', 'przegląd techniczny maszyn budowlanych', 'serwis mobilny koparek']
  },
  {
    categoryId: 'czesci-do-maszyn-budowlanych',
    labels: { pl: 'Części do maszyn budowlanych', ru: 'Запчасти для спецтехники', en: 'Construction equipment parts' },
    aliases: ['części do maszyn budowlanych', 'części zamienne koparki', 'części do koparek', 'zęby do koparek'],
    positiveKeywords: { pl: ['części do maszyn budowlanych', 'części zamienne do koparek', 'zęby do łyżek koparkowych', 'łyżki koparkowe', 'filtry do maszyn budowlanych', 'gąsienice do koparek', 'części hydrauliczne do maszyn budowlanych', 'sklep z częściami do koparek'], ru: ['запчасти для спецтехники', 'запчасти для экскаваторов', 'зубья ковша', 'гусеницы для экскаваторов'], en: ['heavy equipment parts', 'excavator parts', 'undercarriage parts'] },
    negativeKeywords: { pl: ['części samochodowe osobowe', 'sklep motoryzacyjny', 'części do motocykli'], ru: ['автозапчасти для легковых авто'], en: ['car parts store'] },
    excludedBusinessTypes: ['auto_parts', 'car_dealer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['części do maszyn budowlanych sklep', 'części zamienne do koparek', 'łyżki koparkowe na sprzedaż', 'zęby do łyżek koparkowych', 'gąsienice do koparek sklep']
  },
  {
    categoryId: 'leasing-maszyn-budowlanych',
    labels: { pl: 'Leasing maszyn budowlanych', ru: 'Лизинг техники', en: 'Construction equipment leasing' },
    aliases: ['leasing maszyn budowlanych', 'leasing sprzętu budowlanego', 'leasing koparek', 'leasing maszyn rolniczych i budowlanych'],
    positiveKeywords: { pl: ['leasing maszyn budowlanych', 'leasing sprzętu budowlanego', 'leasing koparek', 'leasing maszyn używanych', 'finansowanie maszyn budowlanych', 'leasing operacyjny maszyn', 'leasing sprzętu ciężkiego', 'leasing dla firm budowlanych'], ru: ['лизинг спецтехники', 'лизинг строительной техники', 'лизинг экскаваторов', 'финансирование техники'], en: ['construction equipment leasing', 'heavy equipment financing', 'excavator leasing'] },
    negativeKeywords: { pl: ['leasing samochodów osobowych', 'leasing mieszkań', 'kredyt hipoteczny'], ru: ['лизинг легковых автомобилей', 'ипотечный кредит'], en: ['car leasing', 'mortgage broker'] },
    excludedBusinessTypes: ['car_leasing', 'mortgage_broker'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['leasing maszyn budowlanych oferta', 'leasing koparek dla firm', 'finansowanie sprzętu budowlanego', 'leasing sprzętu ciężkiego warunki', 'leasing maszyn używanych budowlanych']
  },
  {
    categoryId: 'window_manufacturer',
    labels: { pl: 'Producenci okien', ru: 'Производители окон', en: 'Window manufacturers' },
    aliases: ['producenci okien', 'okna producent', 'window manufacturers', 'производители окон'],
    positiveKeywords: { pl: ['producent okien', 'produkcja okien', 'okna PVC producent', 'okna drewniane producent', 'okna aluminiowe producent', 'stolarka okienna produkcja', 'fabryka okien', 'okna na wymiar produkcja', 'profile okienne producent'], ru: ['производитель окон', 'производство окон', 'завод окон'], en: ['window manufacturer', 'window production', 'window factory'] },
    negativeKeywords: { pl: ['montaż okien', 'serwis okien', 'naprawa okien', 'mycie okien', 'sklep z oknami', 'okna używane'], ru: ['установка окон', 'ремонт окон'], en: ['window installation', 'window repair'] },
    excludedBusinessTypes: ['installation_service', 'retail_store', 'repair_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent okien', 'fabryka okien PVC', 'produkcja okien drewnianych', 'producent okien aluminiowych', 'stolarka okienna producent', 'okna na wymiar producent']
  },
  {
    categoryId: 'door_manufacturer',
    labels: { pl: 'Producenci drzwi', ru: 'Производители дверей', en: 'Door manufacturers' },
    aliases: ['producenci drzwi', 'drzwi producent', 'door manufacturers'],
    positiveKeywords: { pl: ['producent drzwi', 'produkcja drzwi', 'drzwi wewnętrzne producent', 'drzwi zewnętrzne producent', 'drzwi wejściowe producent', 'fabryka drzwi', 'drzwi drewniane produkcja', 'drzwi stalowe producent', 'drzwi przeciwpożarowe producent'], ru: ['производитель дверей', 'производство дверей', 'завод дверей'], en: ['door manufacturer', 'door production', 'door factory'] },
    negativeKeywords: { pl: ['montaż drzwi', 'serwis drzwi', 'naprawa drzwi', 'sklep z drzwiami', 'ślusarz'], ru: ['установка дверей', 'ремонт дверей'], en: ['door installation', 'door repair'] },
    excludedBusinessTypes: ['installation_service', 'retail_store', 'repair_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent drzwi', 'fabryka drzwi wewnętrznych', 'produkcja drzwi zewnętrznych', 'producent drzwi wejściowych', 'drzwi stalowe producent', 'producent drzwi przeciwpożarowych']
  },
  {
    categoryId: 'facade_manufacturer',
    labels: { pl: 'Producenci fasad', ru: 'Производители фасадов', en: 'Facade manufacturers' },
    aliases: ['producenci fasad', 'producenci elewacji', 'facade manufacturers'],
    positiveKeywords: { pl: ['producent fasad', 'produkcja fasad', 'fasady aluminiowe producent', 'fasady szklane producent', 'systemy fasadowe', 'elewacje wentylowane producent', 'fasady słupowo-ryglowe', 'konstrukcje fasadowe'], ru: ['производитель фасадов', 'производство фасадных систем'], en: ['facade manufacturer', 'curtain wall systems producer'] },
    negativeKeywords: { pl: ['montaż elewacji', 'docieplenie budynków', 'elewacje tynkowanie', 'firma remontowa'], ru: ['монтаж фасадов', 'утепление фасадов'], en: ['facade installation'] },
    excludedBusinessTypes: ['installation_service', 'renovation_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent fasad aluminiowych', 'producent systemów fasadowych', 'produkcja fasad szklanych', 'producent elewacji wentylowanych', 'konstrukcje fasadowe producent']
  },
  {
    categoryId: 'furniture_manufacturer',
    labels: { pl: 'Producenci mebli', ru: 'Производители мебели', en: 'Furniture manufacturers' },
    aliases: ['producenci mebli', 'meble producent', 'furniture manufacturers', 'фабрика мебели'],
    positiveKeywords: { pl: ['producent mebli', 'fabryka mebli', 'produkcja mebli na zamówienie', 'meble tapicerowane producent', 'meble biurowe producent', 'meble na wymiar produkcja', 'stolarnia meblowa', 'meble drewniane producent'], ru: ['производитель мебели', 'фабрика мебели', 'производство мебели на заказ'], en: ['furniture manufacturer', 'furniture factory'] },
    negativeKeywords: { pl: ['sklep meblowy', 'salon meblowy', 'meble używane', 'wypożyczalnia mebli', 'naprawa mebli', 'tapicer serwis'], ru: ['магазин мебели', 'мебельный салон'], en: ['furniture store', 'furniture showroom'] },
    excludedBusinessTypes: ['retail_store', 'showroom'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent mebli na zamówienie', 'fabryka mebli tapicerowanych', 'producent mebli biurowych', 'produkcja mebli drewnianych', 'stolarnia meblowa producent']
  },
  {
    categoryId: 'kitchen_manufacturer',
    labels: { pl: 'Producenci kuchni', ru: 'Производители кухонь', en: 'Kitchen manufacturers' },
    aliases: ['producenci kuchni', 'kuchnie na wymiar producent', 'kitchen manufacturers'],
    positiveKeywords: { pl: ['producent kuchni', 'kuchnie na wymiar produkcja', 'meble kuchenne producent', 'zabudowa kuchenna producent', 'fronty kuchenne producent', 'kuchnie na zamówienie fabryka'], ru: ['производитель кухонь', 'кухни на заказ производство'], en: ['kitchen manufacturer', 'custom kitchen production'] },
    negativeKeywords: { pl: ['salon kuchenny', 'sklep meblowy kuchnie', 'montaż kuchni'], ru: ['салон кухонь', 'магазин кухонь'], en: ['kitchen showroom'] },
    excludedBusinessTypes: ['retail_store', 'showroom'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent kuchni na wymiar', 'produkcja mebli kuchennych', 'fabryka kuchni na zamówienie', 'producent frontów kuchennych', 'kuchnie na wymiar producent']
  },
  {
    categoryId: 'staircase_manufacturer',
    labels: { pl: 'Producenci schodów', ru: 'Производители лестниц', en: 'Staircase manufacturers' },
    aliases: ['producenci schodów', 'schody producent', 'staircase manufacturers'],
    positiveKeywords: { pl: ['producent schodów', 'produkcja schodów drewnianych', 'schody na wymiar producent', 'schody metalowe producent', 'schody kręcone produkcja', 'balustrady schodowe producent', 'schody dywanowe producent'], ru: ['производитель лестниц', 'производство лестниц на заказ'], en: ['staircase manufacturer', 'custom stairs production'] },
    negativeKeywords: { pl: ['montaż schodów', 'renowacja schodów', 'schody używane'], ru: ['монтаж лестниц'], en: ['staircase installation'] },
    excludedBusinessTypes: ['installation_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent schodów drewnianych', 'schody na wymiar producent', 'producent schodów metalowych', 'produkcja schodów kręconych', 'producent balustrad schodowych']
  },
  {
    categoryId: 'gate_manufacturer',
    labels: { pl: 'Producenci bram', ru: 'Производители ворот', en: 'Gate manufacturers' },
    aliases: ['producenci bram', 'bramy producent', 'gate manufacturers'],
    positiveKeywords: { pl: ['producent bram', 'produkcja bram garażowych', 'bramy przemysłowe producent', 'bramy segmentowe producent', 'bramy przesuwne produkcja', 'bramy wjazdowe producent', 'napędy do bram producent'], ru: ['производитель ворот', 'производство ворот', 'гаражные ворота производитель'], en: ['gate manufacturer', 'garage door manufacturer'] },
    negativeKeywords: { pl: ['montaż bram', 'serwis bram', 'naprawa bram', 'automatyka do bram serwis'], ru: ['установка ворот', 'ремонт ворот'], en: ['gate installation', 'gate repair'] },
    excludedBusinessTypes: ['installation_service', 'repair_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent bram garażowych', 'producent bram przemysłowych', 'produkcja bram segmentowych', 'producent bram przesuwnych', 'producent bram wjazdowych']
  },
  {
    categoryId: 'fencing_manufacturer',
    labels: { pl: 'Producenci ogrodzeń', ru: 'Производители ограждений', en: 'Fencing manufacturers' },
    aliases: ['producenci ogrodzeń', 'ogrodzenia producent', 'fencing manufacturers'],
    positiveKeywords: { pl: ['producent ogrodzeń', 'produkcja ogrodzeń panelowych', 'ogrodzenia metalowe producent', 'ogrodzenia betonowe producent', 'siatka ogrodzeniowa producent', 'panele ogrodzeniowe producent', 'ogrodzenia kute produkcja'], ru: ['производитель ограждений', 'производство заборов'], en: ['fencing manufacturer', 'fence production'] },
    negativeKeywords: { pl: ['montaż ogrodzeń', 'naprawa ogrodzeń', 'sklep z ogrodzeniami'], ru: ['установка заборов'], en: ['fence installation'] },
    excludedBusinessTypes: ['installation_service', 'retail_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent ogrodzeń panelowych', 'produkcja ogrodzeń betonowych', 'producent siatki ogrodzeniowej', 'producent ogrodzeń metalowych', 'producent ogrodzeń kutych']
  },
  {
    categoryId: 'aluminum_construction_manufacturer',
    labels: { pl: 'Producenci konstrukcji aluminiowych', ru: 'Производители алюминиевых конструкций', en: 'Aluminum construction manufacturers' },
    aliases: ['producenci konstrukcji aluminiowych', 'konstrukcje aluminiowe producent', 'aluminum construction manufacturers'],
    positiveKeywords: { pl: ['producent konstrukcji aluminiowych', 'produkcja profili aluminiowych', 'systemy aluminiowe producent', 'obróbka aluminium produkcja', 'konstrukcje aluminiowo-szklane producent', 'aluminium na zamówienie produkcja'], ru: ['производитель алюминиевых конструкций', 'производство алюминиевых профилей'], en: ['aluminum construction manufacturer', 'aluminum profile production'] },
    negativeKeywords: { pl: ['montaż konstrukcji aluminiowych', 'skup aluminium', 'złomowanie aluminium'], ru: ['монтаж алюминиевых конструкций'], en: ['aluminum installation'] },
    excludedBusinessTypes: ['installation_service', 'scrap_dealer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent konstrukcji aluminiowych', 'produkcja profili aluminiowych', 'producent systemów aluminiowych', 'konstrukcje aluminiowo-szklane producent', 'obróbka aluminium na zamówienie']
  },
  {
    categoryId: 'pvc_manufacturer',
    labels: { pl: 'Producenci PVC', ru: 'Производители ПВХ', en: 'PVC manufacturers' },
    aliases: ['producenci PVC', 'wyroby PVC producent', 'PVC manufacturers'],
    positiveKeywords: { pl: ['producent wyrobów PVC', 'produkcja profili PVC', 'stolarka PVC producent', 'przetwórstwo PVC', 'folia PVC producent', 'panele PVC produkcja', 'rury PVC producent'], ru: ['производитель ПВХ изделий', 'производство ПВХ профилей'], en: ['PVC manufacturer', 'PVC profile production'] },
    negativeKeywords: { pl: ['montaż okien PVC', 'sklep z artykułami PVC'], ru: ['установка ПВХ окон'], en: ['PVC installation'] },
    excludedBusinessTypes: ['installation_service', 'retail_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent profili PVC', 'produkcja wyrobów PVC', 'producent paneli PVC', 'przetwórstwo tworzyw PVC', 'producent rur PVC']
  },
  {
    categoryId: 'glass_manufacturer',
    labels: { pl: 'Producenci szkła', ru: 'Производители стекла', en: 'Glass manufacturers' },
    aliases: ['producenci szkła', 'szkło producent', 'glass manufacturers', 'huta szkła'],
    positiveKeywords: { pl: ['producent szkła', 'huta szkła', 'produkcja szyb zespolonych', 'szkło hartowane producent', 'szkło hartowane produkcja', 'szklenie konstrukcyjne producent', 'obróbka szkła zakład', 'szkło laminowane producent'], ru: ['производитель стекла', 'стекольный завод', 'производство стеклопакетов'], en: ['glass manufacturer', 'glass factory', 'tempered glass production'] },
    negativeKeywords: { pl: ['szklarz naprawa', 'wymiana szyb serwis', 'sklep ze szkłem'], ru: ['ремонт стекол', 'замена стекол'], en: ['glass repair'] },
    excludedBusinessTypes: ['repair_service', 'retail_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent szyb zespolonych', 'huta szkła producent', 'producent szkła hartowanego', 'zakład obróbki szkła', 'producent szkła laminowanego']
  },
  {
    categoryId: 'building_materials_manufacturer',
    labels: { pl: 'Producenci materiałów budowlanych', ru: 'Производители стройматериалов', en: 'Building materials manufacturers' },
    aliases: ['producenci materiałów budowlanych', 'materiały budowlane producent', 'building materials manufacturers'],
    positiveKeywords: { pl: ['producent materiałów budowlanych', 'zakład produkcyjny materiały budowlane', 'produkcja wyrobów budowlanych', 'hurtownia materiałów budowlanych producent', 'materiały izolacyjne producent', 'chemia budowlana producent', 'wyroby betonowe producent'], ru: ['производитель строительных материалов', 'завод строительных материалов'], en: ['building materials manufacturer', 'construction materials producer'] },
    negativeKeywords: { pl: ['sklep budowlany', 'skład budowlany detaliczny', 'market budowlany'], ru: ['магазин стройматериалов'], en: ['building materials store'] },
    excludedBusinessTypes: ['retail_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent materiałów budowlanych', 'zakład produkcji materiałów budowlanych', 'producent wyrobów budowlanych', 'producent materiałów izolacyjnych', 'producent chemii budowlanej']
  },
  {
    categoryId: 'concrete_manufacturer',
    labels: { pl: 'Producenci betonu', ru: 'Производители бетона', en: 'Concrete manufacturers' },
    aliases: ['producenci betonu', 'beton producent', 'concrete manufacturers', 'wytwórnia betonu'],
    positiveKeywords: { pl: ['producent betonu', 'wytwórnia betonu', 'betoniarnia', 'beton towarowy producent', 'prefabrykaty betonowe producent', 'kostka brukowa producent', 'beton komórkowy producent', 'płyty betonowe producent'], ru: ['производитель бетона', 'бетонный завод', 'производство бетона'], en: ['concrete manufacturer', 'concrete plant', 'precast concrete producer'] },
    negativeKeywords: { pl: ['transport betonu usługi', 'wynajem betoniarki'], ru: ['доставка бетона услуги'], en: ['concrete delivery service'] },
    excludedBusinessTypes: ['transport_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent betonu towarowego', 'wytwórnia betonu', 'producent prefabrykatów betonowych', 'producent kostki brukowej', 'producent betonu komórkowego']
  },
  {
    categoryId: 'brick_manufacturer',
    labels: { pl: 'Producenci cegły', ru: 'Производители кирпича', en: 'Brick manufacturers' },
    aliases: ['producenci cegły', 'cegielnia', 'brick manufacturers'],
    positiveKeywords: { pl: ['producent cegły', 'cegielnia', 'produkcja cegły klinkierowej', 'pustaki ceramiczne producent', 'cegła ręcznie formowana producent', 'wyroby ceramiczne budowlane producent'], ru: ['производитель кирпича', 'кирпичный завод'], en: ['brick manufacturer', 'brick factory'] },
    negativeKeywords: { pl: ['sklep z cegłą', 'skład materiałów budowlanych'], ru: ['магазин кирпича'], en: ['brick retailer'] },
    excludedBusinessTypes: ['retail_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent cegły klinkierowej', 'cegielnia produkcja', 'producent pustaków ceramicznych', 'producent cegły ręcznie formowanej', 'producent wyrobów ceramicznych budowlanych']
  },
  {
    categoryId: 'tile_manufacturer',
    labels: { pl: 'Producenci płytek', ru: 'Производители плитки', en: 'Tile manufacturers' },
    aliases: ['producenci płytek', 'płytki ceramiczne producent', 'tile manufacturers'],
    positiveKeywords: { pl: ['producent płytek ceramicznych', 'fabryka płytek', 'produkcja glazury i terakoty', 'płytki gresowe producent', 'płytki elewacyjne producent', 'zakład ceramiki budowlanej'], ru: ['производитель плитки', 'завод керамической плитки'], en: ['tile manufacturer', 'ceramic tile factory'] },
    negativeKeywords: { pl: ['sklep z płytkami', 'układanie płytek usługi', 'glazurnik'], ru: ['магазин плитки', 'укладка плитки'], en: ['tile installation', 'tile store'] },
    excludedBusinessTypes: ['retail_store', 'installation_service'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent płytek ceramicznych', 'fabryka płytek gresowych', 'producent glazury i terakoty', 'producent płytek elewacyjnych', 'zakład ceramiki budowlanej producent']
  },
  {
    categoryId: 'parquet_manufacturer',
    labels: { pl: 'Producenci parkietu', ru: 'Производители паркета', en: 'Parquet manufacturers' },
    aliases: ['producenci parkietu', 'parkiet producent', 'parquet manufacturers'],
    positiveKeywords: { pl: ['producent parkietu', 'produkcja deski podłogowej', 'parkiet dębowy producent', 'deska barlinecka producent', 'podłogi drewniane producent', 'tartak parkieciarnia'], ru: ['производитель паркета', 'производство паркетной доски'], en: ['parquet manufacturer', 'wood flooring producer'] },
    negativeKeywords: { pl: ['cyklinowanie parkietu', 'układanie parkietu usługi', 'sklep z podłogami'], ru: ['укладка паркета', 'циклевка паркета'], en: ['parquet installation', 'floor sanding'] },
    excludedBusinessTypes: ['installation_service', 'retail_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent parkietu dębowego', 'produkcja deski podłogowej', 'producent podłóg drewnianych', 'parkieciarnia produkcja', 'producent deski barlineckiej']
  },
  {
    categoryId: 'roofing_manufacturer',
    labels: { pl: 'Producenci pokryć dachowych', ru: 'Производители кровли', en: 'Roofing manufacturers' },
    aliases: ['producenci pokryć dachowych', 'producenci dachówki', 'roofing manufacturers'],
    positiveKeywords: { pl: ['producent pokryć dachowych', 'produkcja blachodachówki', 'dachówka ceramiczna producent', 'membrany dachowe producent', 'systemy rynnowe producent', 'blacha dachowa produkcja', 'gonty bitumiczne producent'], ru: ['производитель кровельных материалов', 'производство кровли'], en: ['roofing manufacturer', 'roofing materials producer'] },
    negativeKeywords: { pl: ['montaż dachów', 'krycie dachów usługi', 'dekarz', 'naprawa dachu'], ru: ['монтаж крыш', 'кровельные работы'], en: ['roofing installation', 'roofing contractor'] },
    excludedBusinessTypes: ['installation_service', 'contractor'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent blachodachówki', 'producent dachówki ceramicznej', 'produkcja pokryć dachowych', 'producent membran dachowych', 'producent systemów rynnowych']
  },
  {
    categoryId: 'heating_systems',
    labels: { pl: 'Ogrzewanie / instalacje grzewcze', ru: 'Отопление', en: 'Heating systems' },
    aliases: ['ogrzewanie', 'instalacje grzewcze', 'heating', 'отопление'],
    positiveKeywords: { pl: ['ogrzewanie', 'instalacje grzewcze', 'kotłownia', 'kocioł gazowy', 'kocioł na pellet', 'ogrzewanie podłogowe', 'piece c.o.', 'instalacje centralnego ogrzewania', 'serwis kotłów'], ru: ['отопление', 'котельная', 'газовый котел', 'система отопления'], en: ['heating', 'boiler', 'central heating', 'heating installation'] },
    negativeKeywords: { pl: ['skład opału', 'sprzedaż węgla', 'kominiarz', 'kominki ozdobne', 'sklep AGD'], ru: ['продажа угля'], en: ['fuel supplier'] },
    excludedBusinessTypes: ['fuel_supplier'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż ogrzewania', 'instalacje centralnego ogrzewania', 'serwis kotłów gazowych', 'ogrzewanie podłogowe montaż', 'kotłownie na pellet', 'modernizacja instalacji grzewczej']
  },
  {
    categoryId: 'heat_pumps',
    labels: { pl: 'Pompy ciepła', ru: 'Тепловые насосы', en: 'Heat pumps' },
    aliases: ['pompy ciepła', 'heat pumps', 'тепловые насосы', 'pompa ciepła'],
    positiveKeywords: { pl: ['pompa ciepła', 'pompy ciepła', 'montaż pompy ciepła', 'pompa ciepła powietrze woda', 'pompa ciepła gruntowa', 'dofinansowanie pompa ciepła', 'serwis pomp ciepła', 'instalator pomp ciepła'], ru: ['тепловой насос', 'установка теплового насоса', 'воздух-вода насос'], en: ['heat pump', 'heat pump installation', 'air source heat pump', 'ground source heat pump'] },
    negativeKeywords: { pl: ['klimatyzacja samochodowa', 'pompa wodna', 'pompa studzienna', 'hydrofor'], ru: ['водяной насос'], en: ['water pump'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż pomp ciepła', 'pompy ciepła do domu', 'pompa ciepła powietrze woda montaż', 'instalator pomp ciepła', 'pompy ciepła dofinansowanie NFOŚ', 'serwis pomp ciepła']
  },
  {
    categoryId: 'electrical_installation',
    labels: { pl: 'Elektryka / elektroinstalacje', ru: 'Электромонтаж', en: 'Electrical installation' },
    aliases: ['elektryk', 'elektroinstalacje', 'electrical', 'электрик'],
    positiveKeywords: { pl: ['elektryk', 'elektroinstalacje', 'instalacje elektryczne', 'usługi elektryczne', 'pomiary elektryczne', 'rozdzielnice elektryczne', 'instalacje fotowoltaiczne', 'modernizacja instalacji elektrycznej', 'awarie elektryczne'], ru: ['электрик', 'электромонтаж', 'электроинсталляции', 'электроустановки'], en: ['electrician', 'electrical installation', 'wiring', 'electrical contractor'] },
    negativeKeywords: { pl: ['sklep elektryczny', 'hurtownia elektryczna', 'serwis AGD', 'elektronika użytkowa'], ru: ['магазин электротоваров'], en: ['electronics store'] },
    excludedBusinessTypes: ['electronics_store', 'hardware_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['usługi elektryczne', 'elektryk instalacje', 'modernizacja instalacji elektrycznej', 'pomiary elektryczne ochronne', 'montaż rozdzielnic', 'elektryk awarie 24h']
  },
  {
    categoryId: 'plumbing',
    labels: { pl: 'Hydraulika / usługi sanitarne', ru: 'Сантехника', en: 'Plumbing' },
    aliases: ['hydraulik', 'santechnika', 'plumbing', 'сантехник'],
    positiveKeywords: { pl: ['hydraulik', 'usługi hydrauliczne', 'instalacje sanitarne', 'udrażnianie rur', 'naprawa awarii wodnych', 'instalacje wodno-kanalizacyjne', 'montaż łazienek', 'serwis hydrauliczny'], ru: ['сантехник', 'сантехнические работы', 'устранение засоров', 'водопровод'], en: ['plumber', 'plumbing services', 'pipe installation', 'drain cleaning'] },
    negativeKeywords: { pl: ['sklep sanitarny', 'hurtownia armatury', 'salon łazienek', 'sklep z płytkami'], ru: ['магазин сантехники'], en: ['bathroom showroom'] },
    excludedBusinessTypes: ['hardware_store', 'home_goods_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['usługi hydrauliczne', 'hydraulik awaryjny', 'udrażnianie rur kanalizacyjnych', 'montaż instalacji wodno-kanalizacyjnej', 'hydraulik 24h', 'naprawa awarii hydraulicznych']
  },
  {
    categoryId: 'building_automation',
    labels: { pl: 'Automatyka budynkowa', ru: 'Автоматизация зданий', en: 'Building automation' },
    aliases: ['automatyka budynkowa', 'BMS', 'building automation', 'автоматизация зданий'],
    positiveKeywords: { pl: ['automatyka budynkowa', 'systemy BMS', 'zarządzanie budynkiem', 'automatyka budynków', 'integracja systemów budynkowych', 'sterowanie wentylacją i klimatyzacją', 'systemy zarządzania energią', 'automatyka HVAC'], ru: ['автоматизация зданий', 'BMS системы', 'диспетчеризация зданий'], en: ['building automation', 'BMS', 'building management system'] },
    negativeKeywords: { pl: ['automatyka przemysłowa maszyn', 'automatyka bram i szlabanów', 'sterowniki PLC produkcja'], ru: ['промышленная автоматизация станков'], en: ['industrial machine automation'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['automatyka budynkowa firmy', 'systemy BMS montaż', 'integracja systemów budynkowych', 'zarządzanie budynkiem automatyka', 'systemy zarządzania energią budynku', 'automatyka HVAC dla budynków']
  },
  {
    categoryId: 'smart_home',
    labels: { pl: 'Inteligentny dom / smart home', ru: 'Умный дом', en: 'Smart home' },
    aliases: ['inteligentny dom', 'smart home', 'умный дом', 'automatyka domowa'],
    positiveKeywords: { pl: ['inteligentny dom', 'smart home', 'automatyka domowa', 'montaż smart home', 'sterowanie oświetleniem', 'system KNX', 'integracja smart home', 'instalacje inteligentne'], ru: ['умный дом', 'домашняя автоматизация', 'система умный дом'], en: ['smart home', 'home automation', 'KNX system'] },
    negativeKeywords: { pl: ['sklep RTV AGD', 'elektronika użytkowa sklep', 'sprzedaż gadżetów'], ru: ['магазин электроники'], en: ['consumer electronics store'] },
    excludedBusinessTypes: ['electronics_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż inteligentnego domu', 'smart home instalacje', 'system KNX montaż', 'automatyka domowa firmy', 'integracja smart home', 'sterowanie oświetleniem i roletami']
  },
  {
    categoryId: 'fire_safety',
    labels: { pl: 'Systemy sygnalizacji pożaru / ochrona ppoż', ru: 'Пожарная безопасность', en: 'Fire safety systems' },
    aliases: ['ochrona przeciwpożarowa', 'sygnalizacja pożaru', 'fire safety', 'пожарная безопасность'],
    positiveKeywords: { pl: ['systemy sygnalizacji pożaru', 'ochrona przeciwpożarowa', 'instalacje ppoż', 'przegląd gaśnic', 'system oddymiania', 'przegląd hydrantów', 'SSP montaż', 'systemy przeciwpożarowe'], ru: ['пожарная сигнализация', 'противопожарная защита', 'системы пожаротушения'], en: ['fire alarm systems', 'fire safety', 'fire protection', 'smoke detection'] },
    negativeKeywords: { pl: ['sklep z gaśnicami', 'jednostka straży pożarnej', 'szkolenia bhp ogólne'], ru: ['продажа огнетушителей'], en: ['fire extinguisher retailer'] },
    excludedBusinessTypes: ['government_office'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż systemów sygnalizacji pożaru', 'instalacje ppoż dla firm', 'przegląd gaśnic i hydrantów', 'systemy oddymiania montaż', 'ochrona przeciwpożarowa budynków', 'serwis systemów SSP']
  },
  {
    categoryId: 'cctv',
    labels: { pl: 'Monitoring wizyjny / CCTV', ru: 'Видеонаблюдение', en: 'CCTV / video surveillance' },
    aliases: ['monitoring wizyjny', 'kamery przemysłowe', 'CCTV', 'видеонаблюдение'],
    positiveKeywords: { pl: ['monitoring wizyjny', 'montaż kamer', 'systemy CCTV', 'kamery przemysłowe', 'monitoring dla firm', 'instalacja monitoringu', 'systemy dozoru wizyjnego', 'kamery IP montaż'], ru: ['видеонаблюдение', 'установка камер', 'системы CCTV'], en: ['CCTV installation', 'video surveillance', 'IP cameras'] },
    negativeKeywords: { pl: ['sklep RTV AGD', 'wideofilmowanie ślubne', 'fotografia okolicznościowa', 'sklep elektroniczny'], ru: ['видеосъемка свадеб'], en: ['wedding videography'] },
    excludedBusinessTypes: ['electronics_store', 'photography_studio'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż monitoringu wizyjnego', 'instalacja kamer CCTV', 'systemy dozoru wizyjnego dla firm', 'monitoring dla firm montaż', 'kamery IP instalacja', 'serwis systemów monitoringu']
  },
  {
    categoryId: 'access_control',
    labels: { pl: 'Kontrola dostępu', ru: 'Контроль доступа', en: 'Access control' },
    aliases: ['kontrola dostępu', 'systemy dostępowe', 'access control', 'контроль доступа'],
    positiveKeywords: { pl: ['kontrola dostępu', 'systemy kontroli dostępu', 'montaż domofonów', 'wideodomofony montaż', 'systemy identyfikacji pracowników', 'czytniki kart montaż', 'elektrozaczepy montaż'], ru: ['контроль доступа', 'системы контроля доступа', 'установка домофонов'], en: ['access control systems', 'intercom installation', 'card readers'] },
    negativeKeywords: { pl: ['ślusarz dorabianie kluczy', 'sklep z zamkami', 'pogotowie ślusarskie'], ru: ['изготовление ключей'], en: ['locksmith key cutting'] },
    excludedBusinessTypes: ['locksmith'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż systemów kontroli dostępu', 'instalacja domofonów i wideodomofonów', 'systemy kontroli dostępu dla firm', 'montaż czytników kart dostępu', 'elektrozaczepy montaż', 'systemy identyfikacji pracowników']
  },
  {
    categoryId: 'elevator_company',
    labels: { pl: 'Firmy windowe / dźwigi osobowe', ru: 'Лифтовые компании', en: 'Elevator companies' },
    aliases: ['firmy windowe', 'dźwigi osobowe', 'windy', 'лифтовые компании'],
    positiveKeywords: { pl: ['montaż wind', 'serwis wind', 'konserwacja dźwigów', 'modernizacja wind', 'naprawa wind', 'dźwigi osobowe', 'windy dla niepełnosprawnych', 'przeglądy UDT wind'], ru: ['монтаж лифтов', 'обслуживание лифтов', 'модернизация лифтов'], en: ['elevator installation', 'elevator maintenance', 'lift servicing'] },
    negativeKeywords: { pl: ['wypożyczalnia wózków widłowych', 'transport towarowy', 'sklep z częściami zamiennymi'], ru: ['аренда погрузчиков'], en: ['forklift rental'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz wyceny'],
    searchTemplates: ['montaż wind firmy', 'serwis i konserwacja dźwigów osobowych', 'modernizacja wind w budynkach', 'naprawa wind awaryjna', 'przeglądy UDT wind', 'windy dla osób niepełnosprawnych montaż']
  },
  {
    categoryId: 'realestate-agencies',
    labels: { pl: 'Agencje nieruchomości', ru: 'Агентства недвижимости', en: 'Real estate agencies' },
    aliases: ['agencja nieruchomości', 'biuro nieruchomości', 'pośrednictwo nieruchomości', 'real estate agency'],
    positiveKeywords: { pl: ['agencja nieruchomości', 'biuro nieruchomości', 'pośrednictwo w obrocie nieruchomościami', 'sprzedaż mieszkań', 'sprzedaż domów', 'wynajem nieruchomości', 'pośrednik nieruchomości', 'doradca ds. nieruchomości'], ru: ['агентство недвижимости', 'риэлтор', 'продажа квартир', 'аренда недвижимости'], en: ['real estate agency', 'realtor', 'property sales', 'property rental'] },
    negativeKeywords: { pl: ['zarządzanie nieruchomościami', 'administrowanie nieruchomościami', 'wspólnota mieszkaniowa'], ru: ['управление недвижимостью'], en: ['property management'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['agencja nieruchomości', 'biuro nieruchomości', 'pośrednictwo w sprzedaży mieszkań', 'pośrednik nieruchomości', 'wynajem i sprzedaż nieruchomości']
  },
  {
    categoryId: 'commercial-realestate',
    labels: { pl: 'Nieruchomości komercyjne', ru: 'Коммерческая недвижимость', en: 'Commercial real estate' },
    aliases: ['nieruchomości komercyjne', 'commercial real estate', 'powierzchnie komercyjne', 'nieruchomości biznesowe'],
    positiveKeywords: { pl: ['nieruchomości komercyjne', 'wynajem powierzchni biurowej', 'wynajem lokali handlowych', 'powierzchnie biurowe', 'powierzchnie handlowe', 'inwestycje komercyjne', 'obsługa nieruchomości komercyjnych', 'doradztwo nieruchomości komercyjnych'], ru: ['коммерческая недвижимость', 'аренда офисов', 'торговые площади', 'инвестиции в недвижимость'], en: ['commercial real estate', 'office space for rent', 'retail space', 'commercial property investment'] },
    negativeKeywords: { pl: ['mieszkania na sprzedaż', 'nieruchomości mieszkaniowe', 'domy jednorodzinne'], ru: ['жилая недвижимость'], en: ['residential real estate'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['nieruchomości komercyjne', 'wynajem powierzchni biurowej', 'wynajem lokali handlowych', 'doradztwo nieruchomości komercyjnych', 'inwestycje w nieruchomości komercyjne']
  },
  {
    categoryId: 'new-developments',
    labels: { pl: 'Mieszkania od dewelopera', ru: 'Продажа новостроек', en: 'New development sales' },
    aliases: ['deweloper', 'nowe mieszkania', 'nowe inwestycje mieszkaniowe', 'new developments'],
    positiveKeywords: { pl: ['mieszkania od dewelopera', 'deweloper mieszkaniowy', 'nowe inwestycje mieszkaniowe', 'sprzedaż mieszkań od dewelopera', 'nowe osiedle mieszkaniowe', 'apartamenty na sprzedaż', 'inwestycja deweloperska', 'biuro sprzedaży mieszkań'], ru: ['новостройки', 'застройщик', 'продажа квартир от застройщика', 'жилой комплекс'], en: ['new development', 'property developer', 'off-plan apartments', 'residential project'] },
    negativeKeywords: { pl: ['nieruchomości z drugiej ręki', 'rynek wtórny', 'pośrednictwo nieruchomości'], ru: ['вторичный рынок недвижимости'], en: ['resale property'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['mieszkania od dewelopera', 'nowe inwestycje mieszkaniowe', 'deweloper mieszkaniowy', 'nowe osiedle na sprzedaż', 'biuro sprzedaży mieszkań deweloper']
  },
  {
    categoryId: 'property-management',
    labels: { pl: 'Zarządzanie nieruchomościami', ru: 'Управление недвижимостью', en: 'Property management' },
    aliases: ['zarządzanie nieruchomościami', 'administrowanie nieruchomościami', 'property management', 'zarządca nieruchomości'],
    positiveKeywords: { pl: ['zarządzanie nieruchomościami', 'administrowanie nieruchomościami', 'zarządca nieruchomości', 'zarządzanie wspólnotą mieszkaniową', 'obsługa nieruchomości', 'facility management', 'zarządzanie budynkami komercyjnymi', 'obsługa techniczna nieruchomości'], ru: ['управление недвижимостью', 'управляющая компания', 'обслуживание зданий', 'эксплуатация недвижимости'], en: ['property management', 'facility management', 'building administration'] },
    negativeKeywords: { pl: ['sprzedaż mieszkań', 'agencja nieruchomości', 'pośrednictwo w sprzedaży nieruchomości'], ru: ['продажа недвижимости', 'агентство недвижимости'], en: ['real estate sales', 'real estate agency'] },
    excludedBusinessTypes: ['real_estate_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['zarządzanie nieruchomościami', 'zarządca nieruchomości', 'administrowanie wspólnotami mieszkaniowymi', 'obsługa techniczna budynków', 'facility management nieruchomości']
  },
  {
    categoryId: 'business-centers',
    labels: { pl: 'Centra biznesowe', ru: 'Бизнес-центры', en: 'Business centers' },
    aliases: ['centrum biznesowe', 'biurowiec', 'business center', 'centrum biurowe'],
    positiveKeywords: { pl: ['centrum biznesowe', 'biurowiec', 'wynajem biur', 'przestrzeń biurowa', 'centrum biurowe', 'powierzchnie biurowe do wynajęcia', 'biura serwisowane', 'coworking'], ru: ['бизнес-центр', 'аренда офисов', 'офисное здание', 'коворкинг'], en: ['business center', 'office building', 'serviced offices', 'coworking space'] },
    negativeKeywords: { pl: ['centrum handlowe', 'galeria handlowa'], ru: ['торговый центр'], en: ['shopping mall'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['centrum biznesowe wynajem biur', 'biurowiec wynajem powierzchni', 'centrum biurowe', 'biura serwisowane wynajem', 'przestrzeń coworkingowa dla firm']
  },
  {
    categoryId: 'logistics-parks',
    labels: { pl: 'Parki logistyczne', ru: 'Логистические парки', en: 'Logistics parks' },
    aliases: ['park logistyczny', 'centrum logistyczne', 'logistics park', 'kompleks magazynowy'],
    positiveKeywords: { pl: ['park logistyczny', 'centrum logistyczne', 'magazyn do wynajęcia', 'powierzchnia magazynowa', 'hala magazynowa na wynajem', 'kompleks magazynowo-logistyczny', 'centrum dystrybucyjne', 'magazyn wysokiego składowania'], ru: ['логистический парк', 'складской комплекс', 'аренда склада', 'распределительный центр'], en: ['logistics park', 'warehouse complex', 'distribution center', 'warehouse for rent'] },
    negativeKeywords: { pl: ['park przemysłowy', 'hala produkcyjna'], ru: ['промышленный парк'], en: ['industrial park'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['park logistyczny wynajem magazynu', 'centrum logistyczne powierzchnia magazynowa', 'hala magazynowa do wynajęcia', 'kompleks magazynowo-logistyczny', 'centrum dystrybucyjne wynajem']
  },
  {
    categoryId: 'industrial-parks',
    labels: { pl: 'Parki przemysłowe', ru: 'Индустриальные парки', en: 'Industrial parks' },
    aliases: ['park przemysłowy', 'strefa przemysłowa', 'industrial park', 'park inwestycyjny'],
    positiveKeywords: { pl: ['park przemysłowy', 'strefa ekonomiczna', 'teren inwestycyjny przemysłowy', 'hala produkcyjna do wynajęcia', 'park inwestycyjny', 'nieruchomości przemysłowe', 'specjalna strefa ekonomiczna', 'grunty inwestycyjne przemysłowe'], ru: ['индустриальный парк', 'промышленная зона', 'особая экономическая зона', 'производственные площади в аренду'], en: ['industrial park', 'industrial zone', 'special economic zone', 'manufacturing space for lease'] },
    negativeKeywords: { pl: ['park logistyczny', 'magazyn do wynajęcia'], ru: ['логистический парк'], en: ['logistics park'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['park przemysłowy', 'strefa ekonomiczna tereny inwestycyjne', 'hala produkcyjna do wynajęcia', 'park inwestycyjny przemysłowy', 'nieruchomości przemysłowe na sprzedaż']
  },
  {
    categoryId: 'logistics-companies',
    labels: { pl: 'Firmy logistyczne', ru: 'Логистические компании', en: 'Logistics companies' },
    aliases: ['firma logistyczna', 'logistyka', 'logistics company', 'operator logistyczny'],
    positiveKeywords: { pl: ['firma logistyczna', 'usługi logistyczne', 'operator logistyczny', 'logistyka kontraktowa', 'magazynowanie i dystrybucja', 'spedycja i logistyka', 'zarządzanie łańcuchem dostaw', 'centrum logistyczne obsługa'], ru: ['логистическая компания', 'логистические услуги', 'управление цепочками поставок', 'складская логистика'], en: ['logistics company', 'logistics services', 'supply chain management', 'contract logistics'] },
    negativeKeywords: { pl: ['firma transportowa', 'przewóz osób'], ru: ['транспортная компания'], en: ['transport company'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma logistyczna', 'usługi logistyczne dla firm', 'operator logistyczny', 'logistyka kontraktowa', 'magazynowanie i dystrybucja towarów']
  },
  {
    categoryId: 'transport-companies',
    labels: { pl: 'Firmy transportowe', ru: 'Транспортные компании', en: 'Transport companies' },
    aliases: ['firma transportowa', 'transport drogowy', 'transport company', 'przewoźnik'],
    positiveKeywords: { pl: ['firma transportowa', 'transport drogowy towarów', 'przewóz towarów', 'transport międzynarodowy', 'transport krajowy i międzynarodowy', 'flota transportowa', 'przewoźnik towarów', 'usługi transportowe'], ru: ['транспортная компания', 'грузоперевозки', 'международные перевозки', 'автомобильные перевозки'], en: ['transport company', 'freight transport', 'trucking company', 'international haulage'] },
    negativeKeywords: { pl: ['przewóz osób', 'transport pasażerski', 'taxi', 'wypożyczalnia samochodów'], ru: ['пассажирские перевозки', 'такси'], en: ['passenger transport', 'taxi'] },
    excludedBusinessTypes: ['taxi_stand', 'car_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma transportowa towarów', 'transport drogowy krajowy i międzynarodowy', 'przewóz towarów ciężarówką', 'usługi transportowe dla firm', 'transport międzynarodowy towarów']
  },
  {
    categoryId: 'export',
    labels: { pl: 'Eksport', ru: 'Экспорт', en: 'Export' },
    aliases: ['eksporter', 'firma eksportowa', 'export company', 'handel zagraniczny eksport'],
    positiveKeywords: { pl: ['firma handlowa eksport import', 'eksporter', 'firma eksportowa', 'handel zagraniczny', 'eksport towarów', 'obsługa eksportu', 'dział eksportu', 'agencja handlu zagranicznego'], ru: ['экспортёр', 'экспортная компания', 'внешнеторговая компания', 'экспорт товаров'], en: ['exporter', 'export company', 'foreign trade company', 'export trading house'] },
    negativeKeywords: { pl: ['sklep internetowy', 'sprzedaż detaliczna', 'usługi lokalne'], ru: ['розничная торговля'], en: ['retail store'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma eksportowa', 'eksporter towarów', 'firma handlowa eksport import', 'obsługa eksportu dla firm', 'handel zagraniczny eksport']
  },
  {
    categoryId: 'import',
    labels: { pl: 'Import', ru: 'Импорт', en: 'Import' },
    aliases: ['importer', 'firma importowa', 'import company', 'handel zagraniczny import'],
    positiveKeywords: { pl: ['firma handlowa eksport import', 'importer', 'firma importowa', 'import towarów', 'obsługa importu', 'dział importu', 'hurtownia importowa', 'agencja handlu zagranicznego'], ru: ['импортёр', 'импортная компания', 'внешнеторговая компания', 'импорт товаров'], en: ['importer', 'import company', 'foreign trade company', 'import trading house'] },
    negativeKeywords: { pl: ['sklep internetowy', 'sprzedaż detaliczna', 'usługi lokalne'], ru: ['розничная торговля'], en: ['retail store'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['firma importowa', 'importer towarów', 'firma handlowa eksport import', 'obsługa importu dla firm', 'handel zagraniczny import']
  },
  {
    categoryId: 'manufacturing',
    labels: { pl: 'Przedsiębiorstwa produkcyjne', ru: 'Производственные предприятия', en: 'Manufacturing enterprises' },
    aliases: ['przedsiębiorstwo produkcyjne', 'producent', 'manufacturing company', 'firma produkcyjna'],
    positiveKeywords: { pl: ['przedsiębiorstwo produkcyjne', 'firma produkcyjna', 'producent', 'produkcja przemysłowa', 'wytwórnia', 'zakład wytwórczy', 'produkcja na zamówienie', 'produkcja kontraktowa'], ru: ['производственное предприятие', 'производитель', 'промышленное производство', 'контрактное производство'], en: ['manufacturing enterprise', 'manufacturer', 'contract manufacturing', 'industrial production'] },
    negativeKeywords: { pl: ['sklep', 'hurtownia', 'dystrybutor'], ru: ['оптовый склад'], en: ['wholesale warehouse'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['przedsiębiorstwo produkcyjne', 'firma produkcyjna poszukuje', 'producent kontraktowy', 'produkcja na zamówienie dla firm', 'zakład wytwórczy']
  },
  {
    categoryId: 'factories',
    labels: { pl: 'Fabryki', ru: 'Заводы', en: 'Factories' },
    aliases: ['fabryka', 'zakład produkcyjny', 'factory', 'hala produkcyjna'],
    positiveKeywords: { pl: ['fabryka', 'zakład produkcyjny', 'hala produkcyjna', 'linia produkcyjna', 'produkcja przemysłowa na dużą skalę', 'przemysł ciężki', 'zakład przemysłowy', 'produkcja seryjna'], ru: ['завод', 'фабрика', 'производственный цех', 'тяжёлая промышленность'], en: ['factory', 'industrial plant', 'production line', 'heavy industry'] },
    negativeKeywords: { pl: ['warsztat rzemieślniczy', 'manufaktura ręczna'], ru: ['ремесленная мастерская'], en: ['artisan workshop'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['fabryka produkcja przemysłowa', 'zakład produkcyjny poszukuje', 'hala produkcyjna firma', 'linia produkcyjna przedsiębiorstwo', 'zakład przemysłowy produkcja seryjna']
  },
  {
    categoryId: 'wholesale-suppliers',
    labels: { pl: 'Hurtownie', ru: 'Оптовые поставщики', en: 'Wholesale suppliers' },
    aliases: ['hurtownia', 'dostawca hurtowy', 'wholesale supplier', 'sprzedaż hurtowa'],
    positiveKeywords: { pl: ['hurtownia', 'sprzedaż hurtowa', 'dostawca hurtowy', 'zaopatrzenie hurtowe dla firm', 'hurt', 'magazyn hurtowy', 'dostawy hurtowe dla sklepów', 'ceny hurtowe'], ru: ['оптовый поставщик', 'оптовая торговля', 'оптовый склад', 'оптовые цены'], en: ['wholesale supplier', 'wholesale distributor', 'bulk supply', 'wholesale prices'] },
    negativeKeywords: { pl: ['sklep detaliczny', 'sprzedaż detaliczna', 'sklep internetowy dla klientów indywidualnych'], ru: ['розничный магазин'], en: ['retail store'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['hurtownia dla firm', 'sprzedaż hurtowa towarów', 'dostawca hurtowy', 'zaopatrzenie hurtowe dla sklepów', 'hurtownia ceny hurtowe']
  },
  {
    categoryId: 'distributors',
    labels: { pl: 'Dystrybutorzy', ru: 'Дистрибьюторы', en: 'Distributors' },
    aliases: ['dystrybutor', 'sieć dystrybucji', 'distributor', 'autoryzowany dystrybutor'],
    positiveKeywords: { pl: ['dystrybutor', 'autoryzowany dystrybutor', 'sieć dystrybucji', 'dystrybucja produktów', 'przedstawiciel handlowy producenta', 'dystrybucja krajowa', 'wyłączny dystrybutor', 'dystrybucja hurtowa marek'], ru: ['дистрибьютор', 'официальный дистрибьютор', 'сеть дистрибуции', 'дистрибуция товаров'], en: ['distributor', 'authorized distributor', 'distribution network', 'exclusive distributor'] },
    negativeKeywords: { pl: ['sklep detaliczny', 'sklep internetowy'], ru: ['розничный магазин'], en: ['retail store'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['dystrybutor produktów', 'autoryzowany dystrybutor marki', 'sieć dystrybucji dla firm', 'wyłączny dystrybutor producenta', 'dystrybucja hurtowa produktów']
  },
  {
    categoryId: 'car_dealership',
    labels: { pl: 'Salony samochodowe', ru: 'Автосалоны', en: 'Car dealerships' },
    aliases: ['salon samochodowy', 'autosalon', 'car dealership', 'автосалон'],
    positiveKeywords: { pl: ['salon samochodowy', 'sprzedaż samochodów', 'samochody nowe i używane', 'komis samochodowy', 'auto salon', 'sprzedaż aut', 'samochody na zamówienie', 'giełda samochodowa'], ru: ['автосалон', 'продажа автомобилей', 'продажа авто'], en: ['car dealership', 'car showroom', 'used cars', 'new cars'] },
    negativeKeywords: { pl: ['wypożyczalnia samochodów', 'warsztat samochodowy', 'auto serwis', 'części samochodowe', 'lombard samochodowy', 'sprzedaż prywatna'], ru: ['прокат автомобилей', 'автосервис'], en: ['car rental', 'car repair'] },
    excludedBusinessTypes: ['car_rental', 'car_repair', 'auto_parts_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['salon samochodowy', 'sprzedaż samochodów używanych', 'komis samochodowy', 'salon aut nowych i używanych', 'giełda samochodowa', 'auto salon sprzedaż']
  },
  {
    categoryId: 'car_dealers',
    labels: { pl: 'Autoryzowani dealerzy samochodowi', ru: 'Дилеры автомобилей', en: 'Authorized car dealers' },
    aliases: ['dealer samochodowy', 'autoryzowany dealer', 'car dealer', 'официальный дилер'],
    positiveKeywords: { pl: ['autoryzowany dealer', 'dealer samochodowy', 'oficjalny dealer', 'salon dealerski', 'punkt dealerski', 'autoryzowany serwis i sprzedaż', 'dealer marki', 'przedstawiciel marki'], ru: ['официальный дилер', 'дилерский центр', 'автодилер'], en: ['authorized dealer', 'official dealer', 'car dealership network'] },
    negativeKeywords: { pl: ['komis samochodowy', 'giełda samochodowa', 'sprzedaż prywatna', 'auto skup', 'wypożyczalnia samochodów'], ru: ['перекупщик', 'частная продажа'], en: ['used car lot', 'private seller'] },
    excludedBusinessTypes: ['car_rental', 'used_car_lot'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['autoryzowany dealer samochodowy', 'dealer samochodowy', 'oficjalny salon dealerski', 'punkt dealerski samochody', 'przedstawicielstwo marki samochodowej']
  },
  {
    categoryId: 'premium_cars',
    labels: { pl: 'Samochody premium i luksusowe', ru: 'Премиальные автомобили', en: 'Premium and luxury cars' },
    aliases: ['auta premium', 'samochody luksusowe', 'luxury cars', 'премиум авто'],
    positiveKeywords: { pl: ['salon samochodów premium', 'samochody luksusowe', 'auta klasy premium', 'salon Mercedes-Benz', 'salon BMW', 'salon Audi', 'centrum Porsche', 'salon Bentley', 'salon Lexus', 'samochody sportowe luksusowe'], ru: ['премиум автомобили', 'элитные автомобили', 'люксовые авто', 'спорткары'], en: ['luxury car dealership', 'premium car showroom', 'exotic cars'] },
    negativeKeywords: { pl: ['tani samochód', 'samochody używane budżetowe', 'komis samochodowy', 'salon samochodowy popularne marki', 'auto skup', 'samochody dostawcze'], ru: ['бюджетные автомобили', 'подержанные авто'], en: ['budget cars', 'economy cars'] },
    excludedBusinessTypes: ['used_car_lot', 'car_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['salon samochodów premium', 'samochody luksusowe salon', 'dealer Mercedes-Benz', 'dealer BMW', 'dealer Porsche', 'salon aut sportowych']
  },
  {
    categoryId: 'car_service',
    labels: { pl: 'Autoserwisy i warsztaty samochodowe', ru: 'Автосервисы', en: 'Car repair shops' },
    aliases: ['autoserwis', 'warsztat samochodowy', 'car service', 'car repair'],
    positiveKeywords: { pl: ['autoserwis', 'warsztat samochodowy', 'mechanik samochodowy', 'naprawa samochodów', 'serwis samochodowy', 'wymiana oleju', 'diagnostyka komputerowa samochodów', 'serwis klimatyzacji samochodowej', 'wulkanizacja'], ru: ['автосервис', 'ремонт автомобилей', 'автомеханик'], en: ['car repair shop', 'auto mechanic', 'car service'] },
    negativeKeywords: { pl: ['salon samochodowy', 'komis samochodowy', 'lakiernictwo blacharstwo', 'myjnia samochodowa', 'dealer samochodowy'], ru: ['автосалон', 'кузовной ремонт'], en: ['car dealership', 'body shop'] },
    excludedBusinessTypes: ['car_dealer', 'car_wash'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['autoserwis', 'warsztat samochodowy', 'mechanik samochodowy', 'naprawa samochodów', 'serwis samochodowy całodobowy', 'diagnostyka samochodowa']
  },
  {
    categoryId: 'car_wrapping',
    labels: { pl: 'Oklejanie samochodów folią', ru: 'Оклейка авто плёнкой', en: 'Car wrapping' },
    aliases: ['oklejanie aut', 'folia samochodowa', 'car wrapping', 'car wrap'],
    positiveKeywords: { pl: ['oklejanie samochodów', 'folia samochodowa', 'zmiana koloru auta folią', 'oklejanie folią ochronną', 'folia ppf', 'oklejanie reklamowe samochodów', 'car wrapping', 'folia matowa na auto', 'oklejanie lakieru'], ru: ['оклейка авто плёнкой', 'антигравийная плёнка', 'изменение цвета авто'], en: ['car wrapping', 'vinyl wrap', 'paint protection film'] },
    negativeKeywords: { pl: ['lakiernictwo samochodowe', 'malowanie samochodu', 'tuning mechaniczny', 'blacharstwo'], ru: ['покраска авто', 'кузовной ремонт'], en: ['car painting', 'body repair'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['oklejanie samochodów folią', 'folia ochronna na samochód', 'zmiana koloru auta folią', 'oklejanie samochodów reklamowe', 'folia ppf na samochód', 'car wrapping cennik']
  },
  {
    categoryId: 'car_tuning_workshop',
    labels: { pl: 'Tuning samochodowy', ru: 'Тюнинг автомобилей', en: 'Car tuning' },
    aliases: ['tuning aut', 'chip tuning', 'car tuning', 'тюнинг авто'],
    positiveKeywords: { pl: ['tuning samochodowy', 'chip tuning', 'modyfikacja silnika', 'tuning zawieszenia', 'sportowy układ wydechowy', 'tuning mechaniczny', 'remapping ecu', 'tuning optyczny', 'lifting samochodu'], ru: ['тюнинг автомобилей', 'чип-тюнинг', 'доработка двигателя'], en: ['car tuning', 'chip tuning', 'ecu remapping'] },
    negativeKeywords: { pl: ['oklejanie samochodów', 'lakiernictwo', 'autoserwis ogólny', 'myjnia samochodowa'], ru: ['автомойка', 'общий автосервис'], en: ['car wash', 'general repair'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['tuning samochodowy', 'chip tuning', 'remapping ecu', 'tuning zawieszenia sportowego', 'modyfikacja silnika samochodowego', 'warsztat tuningowy']
  },
  {
    categoryId: 'body_repair',
    labels: { pl: 'Lakiernictwo i blacharstwo samochodowe', ru: 'Кузовной ремонт и покраска', en: 'Auto body and paint repair' },
    aliases: ['blacharstwo samochodowe', 'lakiernictwo samochodowe', 'body shop', 'кузовной ремонт'],
    positiveKeywords: { pl: ['blacharstwo samochodowe', 'lakiernictwo samochodowe', 'naprawa powypadkowa', 'usuwanie wgnieceń', 'malowanie samochodu', 'naprawa zderzaków', 'prostowanie karoserii', 'polerowanie lakieru', 'naprawa powypadkowa aut'], ru: ['кузовной ремонт', 'покраска авто', 'ремонт после дтп', 'рихтовка кузова'], en: ['auto body shop', 'car paint repair', 'dent removal', 'collision repair'] },
    negativeKeywords: { pl: ['mechanika samochodowa', 'wulkanizacja', 'wymiana opon', 'myjnia samochodowa', 'oklejanie samochodów folią', 'diagnostyka komputerowa'], ru: ['шиномонтаж', 'автомойка'], en: ['tire shop', 'car wash'] },
    excludedBusinessTypes: ['tire_service', 'car_wash'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['blacharstwo i lakiernictwo samochodowe', 'naprawa powypadkowa samochodów', 'usuwanie wgnieceń bez lakierowania', 'malowanie samochodu cennik', 'warsztat blacharski', 'prostowanie karoserii']
  },
  {
    categoryId: 'truck_sales',
    labels: { pl: 'Sprzedaż ciężarówek', ru: 'Продажа грузовиков', en: 'Truck sales' },
    aliases: ['sprzedaż samochodów ciężarowych', 'truck sales', 'дилер грузовиков'],
    positiveKeywords: { pl: ['sprzedaż ciężarówek', 'samochody ciężarowe', 'sprzedaż samochodów ciężarowych', 'dealer ciężarówek', 'ciągniki siodłowe sprzedaż', 'naczepy i ciężarówki', 'salon pojazdów użytkowych', 'ciężarówki używane'], ru: ['продажа грузовиков', 'грузовые автомобили', 'дилер грузовых авто', 'седельные тягачи'], en: ['truck sales', 'commercial trucks', 'semi trucks for sale'] },
    negativeKeywords: { pl: ['wynajem ciężarówek', 'transport i spedycja', 'części do ciężarówek', 'serwis ciężarówek', 'lawety pomoc drogowa'], ru: ['аренда грузовиков', 'грузоперевозки', 'запчасти для грузовиков'], en: ['truck rental', 'freight transport', 'truck parts'] },
    excludedBusinessTypes: ['truck_rental', 'logistics_company', 'auto_parts'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['sprzedaż ciężarówek', 'dealer samochodów ciężarowych', 'salon pojazdów użytkowych', 'ciągniki siodłowe sprzedaż', 'ciężarówki używane sprzedaż', 'sprzedaż naczep i ciężarówek']
  },
  {
    categoryId: 'bus_sales',
    labels: { pl: 'Sprzedaż autobusów', ru: 'Продажа автобусов', en: 'Bus sales' },
    aliases: ['dealer autobusów', 'bus sales', 'дилер автобусов'],
    positiveKeywords: { pl: ['sprzedaż autobusów', 'autobusy używane sprzedaż', 'dealer autobusów', 'autobusy miejskie sprzedaż', 'autokary sprzedaż', 'busy i minibusy sprzedaż', 'salon autobusów'], ru: ['продажа автобусов', 'дилер автобусов', 'автобусы б/у', 'туристические автобусы'], en: ['bus sales', 'coach sales', 'used buses for sale'] },
    negativeKeywords: { pl: ['wynajem autokarów', 'przewozy autokarowe', 'serwis autobusów', 'części do autobusów'], ru: ['аренда автобусов', 'пассажирские перевозки'], en: ['bus rental', 'coach hire', 'passenger transport'] },
    excludedBusinessTypes: ['bus_rental', 'transport_company'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['sprzedaż autobusów', 'dealer autobusów', 'autokary sprzedaż', 'autobusy używane sprzedaż', 'salon autobusów miejskich', 'sprzedaż busów i minibusów']
  },
  {
    categoryId: 'farm_equipment_sales',
    labels: { pl: 'Sprzedaż maszyn rolniczych', ru: 'Продажа сельхозтехники', en: 'Farm equipment sales' },
    aliases: ['maszyny rolnicze sprzedaż', 'sprzęt rolniczy', 'farm equipment', 'сельхозтехника'],
    positiveKeywords: { pl: ['sprzedaż maszyn rolniczych', 'ciągniki rolnicze sprzedaż', 'kombajny sprzedaż', 'maszyny rolnicze używane', 'dealer maszyn rolniczych', 'sprzęt rolniczy sprzedaż', 'traktory rolnicze salon', 'przyczepy rolnicze sprzedaż'], ru: ['продажа сельхозтехники', 'сельскохозяйственные машины', 'тракторы продажа', 'комбайны продажа'], en: ['farm equipment sales', 'agricultural machinery', 'tractors for sale'] },
    negativeKeywords: { pl: ['wynajem maszyn rolniczych', 'serwis maszyn rolniczych', 'części do maszyn rolniczych', 'maszyny budowlane sprzedaż'], ru: ['аренда сельхозтехники', 'запчасти для сельхозтехники', 'строительная техника'], en: ['farm equipment rental', 'construction machinery'] },
    excludedBusinessTypes: ['equipment_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['sprzedaż maszyn rolniczych', 'dealer ciągników rolniczych', 'kombajny sprzedaż', 'maszyny rolnicze używane sprzedaż', 'salon maszyn rolniczych', 'sprzedaż sprzętu rolniczego']
  },
  {
    categoryId: 'trailer_sales',
    labels: { pl: 'Sprzedaż przyczep', ru: 'Продажа прицепов', en: 'Trailer sales' },
    aliases: ['przyczepy sprzedaż', 'naczepy sprzedaż', 'trailer sales', 'прицепы продажа'],
    positiveKeywords: { pl: ['sprzedaż przyczep', 'przyczepy samochodowe sprzedaż', 'naczepy sprzedaż', 'przyczepy ciężarowe', 'przyczepy laweta sprzedaż', 'przyczepy kempingowe sprzedaż', 'dealer przyczep', 'przyczepy do przewozu'], ru: ['продажа прицепов', 'прицепы для автомобилей', 'полуприцепы продажа', 'прицепы для перевозки'], en: ['trailer sales', 'semi-trailer sales', 'car trailers for sale'] },
    negativeKeywords: { pl: ['wynajem przyczep', 'naprawa przyczep', 'części do przyczep'], ru: ['аренда прицепов', 'ремонт прицепов'], en: ['trailer rental', 'trailer repair'] },
    excludedBusinessTypes: ['trailer_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['sprzedaż przyczep', 'przyczepy samochodowe sprzedaż', 'naczepy sprzedaż', 'dealer przyczep ciężarowych', 'przyczepy kempingowe sprzedaż', 'przyczepy laweta sprzedaż']
  },
  {
    categoryId: 'heavy_vehicle_sales',
    labels: { pl: 'Sprzedaż pojazdów specjalistycznych', ru: 'Продажа спецтехники (коммерческий транспорт)', en: 'Specialty commercial vehicle sales' },
    aliases: ['pojazdy specjalne sprzedaż', 'auta specjalistyczne', 'special purpose vehicles', 'спецтранспорт'],
    positiveKeywords: { pl: ['sprzedaż pojazdów specjalistycznych', 'samochody specjalne sprzedaż', 'wozy strażackie sprzedaż', 'śmieciarki sprzedaż', 'pojazdy komunalne sprzedaż', 'lawety pomoc drogowa sprzedaż', 'cysterny sprzedaż', 'ambulanse sprzedaż', 'pojazdy do przewozu wartości'], ru: ['продажа спецтехники', 'коммунальная техника продажа', 'мусоровозы продажа', 'пожарные машины продажа'], en: ['specialty vehicle sales', 'municipal vehicles for sale', 'commercial special-purpose vehicles'] },
    negativeKeywords: { pl: ['maszyny budowlane sprzedaż', 'koparki sprzedaż', 'sprzęt budowlany', 'wynajem pojazdów specjalistycznych'], ru: ['строительная техника', 'экскаваторы продажа', 'аренда спецтехники'], en: ['construction equipment', 'excavators for sale', 'equipment rental'] },
    excludedBusinessTypes: ['construction_equipment_dealer', 'equipment_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz kontaktowy'],
    searchTemplates: ['sprzedaż pojazdów specjalistycznych', 'samochody specjalne sprzedaż', 'pojazdy komunalne sprzedaż', 'wozy strażackie i ambulanse sprzedaż', 'cysterny i śmieciarki sprzedaż', 'lawety pomoc drogowa sprzedaż']
  },
  {
    categoryId: 'clinics_general',
    labels: { pl: 'Kliniki medyczne', ru: 'Клиники', en: 'Medical clinics' },
    aliases: ['kliniki medyczne', 'clinics', 'клиники', 'медицинские клиники'],
    positiveKeywords: { pl: ['klinika medyczna', 'przychodnia prywatna', 'gabinet lekarski', 'poradnia specjalistyczna', 'wizyta u lekarza', 'konsultacja lekarska', 'lekarz specjalista', 'usługi medyczne'], ru: ['медицинская клиника', 'частная клиника', 'прием врача', 'консультация врача'], en: ['medical clinic', 'private clinic', 'doctor appointment', 'specialist consultation'] },
    negativeKeywords: { pl: ['apteka', 'sklep medyczny', 'salon kosmetyczny', 'spa i wellness', 'sklep zielarski', 'gabinet weterynaryjny'], ru: ['аптека', 'ветеринарная клиника'], en: ['pharmacy', 'veterinary clinic'] },
    excludedBusinessTypes: ['pharmacy', 'veterinary_care', 'beauty_salon'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['klinika medyczna', 'przychodnia prywatna', 'poradnia specjalistyczna', 'gabinet lekarski prywatny', 'konsultacje lekarskie']
  },
  {
    categoryId: 'medical_center',
    labels: { pl: 'Centra medyczne', ru: 'Медицинские центры', en: 'Medical centers' },
    aliases: ['centrum medyczne', 'medical center', 'медицинский центр'],
    positiveKeywords: { pl: ['centrum medyczne', 'wielospecjalistyczne centrum medyczne', 'centrum zdrowia', 'opieka medyczna dla firm', 'pakiety medyczne', 'abonament medyczny', 'badania profilaktyczne', 'medycyna pracy'], ru: ['медицинский центр', 'многопрофильный медицинский центр', 'корпоративная медицина', 'медицинские пакеты'], en: ['medical center', 'multi-specialty clinic', 'corporate healthcare', 'health packages'] },
    negativeKeywords: { pl: ['apteka', 'sanatorium', 'dom opieki', 'hospicjum'], ru: ['аптека', 'дом престарелых'], en: ['pharmacy', 'nursing home'] },
    excludedBusinessTypes: ['pharmacy', 'nursing_home'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['centrum medyczne', 'wielospecjalistyczne centrum medyczne', 'pakiety medyczne dla firm', 'badania profilaktyczne', 'medycyna pracy centrum', 'abonament medyczny']
  },
  {
    categoryId: 'private_hospital',
    labels: { pl: 'Szpitale prywatne', ru: 'Частные больницы', en: 'Private hospitals' },
    aliases: ['szpital prywatny', 'private hospital', 'частная больница'],
    positiveKeywords: { pl: ['szpital prywatny', 'oddział szpitalny prywatny', 'chirurgia szpitalna', 'izba przyjęć prywatna', 'planowe zabiegi szpitalne', 'hospitalizacja prywatna', 'blok operacyjny'], ru: ['частная больница', 'частный стационар', 'плановая госпитализация'], en: ['private hospital', 'private inpatient care', 'elective surgery hospital'] },
    negativeKeywords: { pl: ['przychodnia', 'poradnia', 'gabinet lekarski', 'szpital publiczny', 'NFZ'], ru: ['поликлиника', 'государственная больница'], en: ['public hospital', 'clinic'] },
    excludedBusinessTypes: ['public_hospital'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['szpital prywatny', 'prywatny szpital chirurgiczny', 'hospitalizacja prywatna', 'planowe zabiegi operacyjne', 'prywatny oddział szpitalny', 'blok operacyjny prywatny']
  },
  {
    categoryId: 'dentistry_clinic',
    labels: { pl: 'Kliniki stomatologiczne', ru: 'Стоматологии', en: 'Dental clinics' },
    aliases: ['stomatologia', 'dentysta', 'dental clinic', 'стоматология'],
    positiveKeywords: { pl: ['stomatologia', 'gabinet stomatologiczny', 'dentysta', 'leczenie kanałowe', 'higiena jamy ustnej', 'wybielanie zębów', 'protetyka stomatologiczna', 'stomatologia estetyczna', 'przegląd stomatologiczny'], ru: ['стоматология', 'стоматологическая клиника', 'лечение зубов', 'отбеливание зубов'], en: ['dental clinic', 'dentist', 'root canal treatment', 'teeth whitening'] },
    negativeKeywords: { pl: ['laboratorium protetyczne', 'hurtownia stomatologiczna', 'sklep dentystyczny', 'szkolenia stomatologiczne'], ru: ['стоматологическая лаборатория', 'магазин стоматологических материалов'], en: ['dental lab supplier', 'dental wholesale'] },
    excludedBusinessTypes: ['dental_lab', 'medical_supply_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['stomatologia', 'gabinet stomatologiczny', 'dentysta prywatny', 'leczenie zębów', 'przegląd stomatologiczny', 'stomatologia estetyczna']
  },
  {
    categoryId: 'implantology',
    labels: { pl: 'Implantologia stomatologiczna', ru: 'Имплантология', en: 'Dental implantology' },
    aliases: ['implanty zębowe', 'implantologia', 'dental implants', 'имплантация зубов'],
    positiveKeywords: { pl: ['implanty zębowe', 'implantologia stomatologiczna', 'wszczepienie implantu', 'all-on-4', 'all-on-6', 'odbudowa zęba na implancie', 'konsultacja implantologiczna'], ru: ['имплантация зубов', 'зубные имплантаты', 'имплантология'], en: ['dental implants', 'implantology', 'tooth implant'] },
    negativeKeywords: { pl: ['implanty piersi', 'implanty ortopedyczne', 'chirurgia plastyczna'], ru: ['имплантация груди', 'ортопедические имплантаты'], en: ['breast implants', 'orthopedic implants'] },
    excludedBusinessTypes: ['plastic_surgery_clinic'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['implanty zębowe', 'implantologia stomatologiczna', 'wszczepienie implantu zęba', 'all-on-4 implanty', 'konsultacja implantologiczna', 'odbudowa zęba na implancie']
  },
  {
    categoryId: 'orthodontics',
    labels: { pl: 'Ortodoncja', ru: 'Ортодонтия', en: 'Orthodontics' },
    aliases: ['ortodoncja', 'aparat ortodontyczny', 'orthodontics', 'ортодонтия'],
    positiveKeywords: { pl: ['ortodoncja', 'aparat ortodontyczny', 'aparat na zęby', 'nakładki ortodontyczne', 'invisalign', 'wyrównywanie zębów', 'proteza ortodontyczna', 'konsultacja ortodontyczna'], ru: ['ортодонтия', 'брекеты', 'выравнивание зубов', 'элайнеры'], en: ['orthodontics', 'braces', 'invisalign', 'teeth straightening'] },
    negativeKeywords: { pl: ['protetyka ogólna', 'chirurgia szczękowa', 'stomatologia dziecięca ogólna'], ru: ['общее протезирование', 'челюстная хирургия'], en: ['general dentistry', 'jaw surgery'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['ortodoncja', 'aparat na zęby', 'nakładki ortodontyczne invisalign', 'wyrównywanie zębów', 'konsultacja ortodontyczna', 'aparat ortodontyczny cena']
  },
  {
    categoryId: 'aesthetic_medicine_clinic',
    labels: { pl: 'Medycyna estetyczna', ru: 'Эстетическая медицина', en: 'Aesthetic medicine' },
    aliases: ['medycyna estetyczna', 'aesthetic medicine', 'эстетическая медицина', 'kosmetologia lekarska'],
    positiveKeywords: { pl: ['medycyna estetyczna', 'botoks', 'kwas hialuronowy', 'mezoterapia', 'wypełniacze', 'lifting twarzy zabiegi', 'modelowanie ust', 'konsultacja lekarza medycyny estetycznej'], ru: ['эстетическая медицина', 'ботокс', 'гиалуроновая кислота', 'мезотерапия'], en: ['aesthetic medicine', 'botox', 'dermal fillers', 'mesotherapy'] },
    negativeKeywords: { pl: ['salon kosmetyczny', 'salon fryzjerski', 'studio urody bez lekarza', 'manicure pedicure', 'solarium'], ru: ['косметический салон', 'парикмахерская'], en: ['beauty salon', 'hair salon'] },
    excludedBusinessTypes: ['beauty_salon', 'hair_salon', 'nail_salon'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['medycyna estetyczna', 'gabinet medycyny estetycznej', 'botoks zabiegi', 'kwas hialuronowy zabiegi', 'mezoterapia twarzy', 'konsultacja medycyna estetyczna']
  },
  {
    categoryId: 'plastic_surgery',
    labels: { pl: 'Chirurgia plastyczna', ru: 'Пластическая хирургия', en: 'Plastic surgery' },
    aliases: ['chirurgia plastyczna', 'plastic surgery', 'пластическая хирургия', 'chirurgia estetyczna'],
    positiveKeywords: { pl: ['chirurgia plastyczna', 'operacja plastyczna', 'powiększanie piersi', 'liposukcja', 'plastyka powiek', 'korekta nosa', 'lifting twarzy chirurgiczny', 'konsultacja chirurga plastycznego'], ru: ['пластическая хирургия', 'увеличение груди', 'липосакция', 'ринопластика'], en: ['plastic surgery', 'breast augmentation', 'liposuction', 'rhinoplasty'] },
    negativeKeywords: { pl: ['medycyna estetyczna bez chirurgii', 'salon kosmetyczny', 'gabinet kosmetologiczny'], ru: ['косметология без операций'], en: ['non-surgical aesthetic clinic'] },
    excludedBusinessTypes: ['beauty_salon'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['chirurgia plastyczna', 'klinika chirurgii plastycznej', 'operacja plastyczna cena', 'powiększanie piersi', 'liposukcja zabieg', 'korekta nosa chirurgia']
  },
  {
    categoryId: 'fertility_clinic',
    labels: { pl: 'Kliniki leczenia niepłodności', ru: 'Репродуктивные центры', en: 'Fertility clinics' },
    aliases: ['klinika leczenia niepłodności', 'in vitro', 'fertility clinic', 'репродуктивная медицина'],
    positiveKeywords: { pl: ['leczenie niepłodności', 'klinika in vitro', 'zapłodnienie in vitro', 'diagnostyka niepłodności', 'bank komórek jajowych', 'mrożenie komórek jajowych', 'andrologia', 'konsultacja specjalisty niepłodności'], ru: ['лечение бесплодия', 'клиника эко', 'экстракорпоральное оплодотворение'], en: ['fertility clinic', 'ivf clinic', 'in vitro fertilization'] },
    negativeKeywords: { pl: ['ginekologia ogólna', 'położnictwo ogólne', 'poradnia rodzinna'], ru: ['общая гинекология'], en: ['general gynecology'] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['klinika leczenia niepłodności', 'klinika in vitro', 'zapłodnienie in vitro', 'diagnostyka niepłodności', 'mrożenie komórek jajowych', 'konsultacja niepłodność']
  },
  {
    categoryId: 'ophthalmology',
    labels: { pl: 'Okulistyka', ru: 'Офтальмология', en: 'Ophthalmology' },
    aliases: ['okulistyka', 'gabinet okulistyczny', 'ophthalmology', 'офтальмология'],
    positiveKeywords: { pl: ['okulistyka', 'gabinet okulistyczny', 'badanie wzroku', 'operacja zaćmy', 'korekcja wzroku laserowa', 'laserowa korekcja wad wzroku', 'dobór okularów', 'soczewki kontaktowe konsultacja'], ru: ['офтальмология', 'проверка зрения', 'операция катаракты', 'лазерная коррекция зрения'], en: ['ophthalmology', 'eye exam', 'cataract surgery', 'laser eye surgery'] },
    negativeKeywords: { pl: ['salon optyczny bez lekarza', 'sklep z okularami'], ru: ['оптика магазин очков'], en: ['optical store'] },
    excludedBusinessTypes: ['optical_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['okulistyka gabinet', 'badanie wzroku okulista', 'operacja zaćmy', 'laserowa korekcja wzroku', 'okulista prywatnie', 'klinika okulistyczna']
  },
  {
    categoryId: 'orthopedics',
    labels: { pl: 'Ortopedia', ru: 'Ортопедия', en: 'Orthopedics' },
    aliases: ['ortopedia', 'gabinet ortopedyczny', 'orthopedics', 'ортопедия'],
    positiveKeywords: { pl: ['ortopeda', 'gabinet ortopedyczny', 'leczenie kręgosłupa', 'endoprotezoplastyka stawu', 'artroskopia kolana', 'leczenie urazów sportowych', 'konsultacja ortopedyczna'], ru: ['ортопед', 'лечение суставов', 'эндопротезирование', 'артроскопия'], en: ['orthopedic surgeon', 'joint replacement', 'arthroscopy'] },
    negativeKeywords: { pl: ['sklep ortopedyczny', 'obuwie ortopedyczne sklep', 'sklep medyczny zaopatrzenie'], ru: ['ортопедический магазин'], en: ['orthopedic supply store'] },
    excludedBusinessTypes: ['medical_supply_store'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['ortopeda prywatnie', 'gabinet ortopedyczny', 'endoprotezoplastyka stawu', 'artroskopia kolana', 'leczenie urazów sportowych', 'konsultacja ortopedyczna']
  },
  {
    categoryId: 'medical_rehabilitation',
    labels: { pl: 'Rehabilitacja medyczna', ru: 'Реабилитация', en: 'Medical rehabilitation' },
    aliases: ['rehabilitacja', 'fizjoterapia', 'medical rehabilitation', 'реабилитация'],
    positiveKeywords: { pl: ['rehabilitacja medyczna', 'fizjoterapia', 'gabinet rehabilitacji', 'terapia manualna', 'rehabilitacja po urazach', 'rehabilitacja neurologiczna', 'masaż leczniczy', 'ćwiczenia rehabilitacyjne'], ru: ['медицинская реабилитация', 'физиотерапия', 'лечебный массаж'], en: ['physiotherapy', 'medical rehabilitation', 'physical therapy'] },
    negativeKeywords: { pl: ['siłownia', 'studio treningu personalnego', 'spa i wellness', 'masaż relaksacyjny salon'], ru: ['фитнес зал', 'спа салон'], en: ['gym', 'spa wellness'] },
    excludedBusinessTypes: ['gym', 'spa'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['rehabilitacja medyczna', 'gabinet fizjoterapii', 'rehabilitacja po urazach', 'terapia manualna', 'rehabilitacja neurologiczna', 'fizjoterapeuta prywatnie']
  },
  {
    categoryId: 'psychology_practice',
    labels: { pl: 'Psychoterapia i psychologia', ru: 'Психология', en: 'Psychology practice' },
    aliases: ['psycholog', 'psychoterapia', 'psychology practice', 'психолог'],
    positiveKeywords: { pl: ['psycholog', 'psychoterapia', 'gabinet psychologiczny', 'konsultacja psychologiczna', 'terapia par', 'terapia poznawczo-behawioralna', 'wsparcie psychologiczne', 'psychoterapeuta prywatnie'], ru: ['психолог', 'психотерапия', 'консультация психолога'], en: ['psychologist', 'psychotherapy', 'counseling'] },
    negativeKeywords: { pl: ['szpital psychiatryczny', 'oddział psychiatryczny', 'coaching życiowy', 'trener rozwoju osobistego', 'wróżka', 'ośrodek odwykowy'], ru: ['психиатрическая больница', 'коучинг'], en: ['psychiatric hospital', 'life coaching'] },
    excludedBusinessTypes: ['psychiatric_hospital'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['psycholog prywatnie', 'gabinet psychologiczny', 'psychoterapia indywidualna', 'terapia par', 'konsultacja psychologiczna', 'psychoterapeuta']
  },
  {
    categoryId: 'diagnostic_center',
    labels: { pl: 'Centra diagnostyczne', ru: 'Диагностические центры', en: 'Diagnostic centers' },
    aliases: ['centrum diagnostyczne', 'diagnostyka obrazowa', 'diagnostic center', 'диагностический центр'],
    positiveKeywords: { pl: ['centrum diagnostyczne', 'diagnostyka obrazowa', 'rezonans magnetyczny', 'tomografia komputerowa', 'badania laboratoryjne', 'usg diagnostyczne', 'rtg prywatnie', 'punkt pobrań'], ru: ['диагностический центр', 'мрт', 'компьютерная томография', 'лабораторные анализы'], en: ['diagnostic center', 'mri scan', 'ct scan', 'lab tests'] },
    negativeKeywords: { pl: ['apteka', 'sklep medyczny'], ru: ['аптека'], en: ['pharmacy'] },
    excludedBusinessTypes: ['pharmacy'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['centrum diagnostyczne', 'rezonans magnetyczny prywatnie', 'tomografia komputerowa prywatnie', 'badania laboratoryjne', 'usg diagnostyczne', 'punkt pobrań krwi']
  },
  {
    categoryId: 'veterinary_clinic',
    labels: { pl: 'Kliniki weterynaryjne', ru: 'Ветеринарные клиники', en: 'Veterinary clinics' },
    aliases: ['klinika weterynaryjna', 'lecznica dla zwierząt', 'veterinary clinic', 'ветеринарная клиника'],
    positiveKeywords: { pl: ['klinika weterynaryjna', 'lecznica dla zwierząt', 'weterynarz', 'szczepienia dla psów i kotów', 'chirurgia weterynaryjna', 'gabinet weterynaryjny', 'całodobowa klinika weterynaryjna', 'kastracja sterylizacja zwierząt'], ru: ['ветеринарная клиника', 'ветеринар', 'прививки для животных'], en: ['veterinary clinic', 'vet', 'pet vaccinations'] },
    negativeKeywords: { pl: ['sklep zoologiczny', 'salon groomingu', 'hotel dla zwierząt', 'schronisko dla zwierząt'], ru: ['зоомагазин', 'груминг салон'], en: ['pet shop', 'pet grooming salon'] },
    excludedBusinessTypes: ['pet_store', 'pet_grooming', 'animal_shelter'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'formularz rejestracji wizyty'],
    searchTemplates: ['klinika weterynaryjna', 'lecznica dla zwierząt', 'weterynarz całodobowo', 'szczepienia dla psów i kotów', 'chirurgia weterynaryjna', 'gabinet weterynaryjny']
  },
  {
    categoryId: 'law_firm_advocate',
    labels: { pl: 'Kancelarie adwokackie', ru: 'Адвокатские бюро', en: 'Advocate law offices' },
    aliases: ['adwokat', 'kancelaria adwokacka', 'адвокат', 'law firm advocate'],
    positiveKeywords: { pl: ['kancelaria adwokacka', 'adwokat', 'usługi adwokackie', 'obrona karna', 'porady prawne', 'reprezentacja przed sądem', 'adwokat rozwodowy', 'adwokat sprawy karne'], ru: ['адвокат', 'адвокатское бюро', 'юридическая защита', 'представительство в суде'], en: ['law firm', 'advocate', 'legal defense', 'court representation'] },
    negativeKeywords: { pl: ['sąd rejonowy', 'sąd okręgowy', 'prokuratura', 'komornik sądowy', 'darmowa pomoc prawna'], ru: ['суд', 'прокуратура'], en: ['courthouse', 'public defender office'] },
    excludedBusinessTypes: ['court', 'government_office', 'police'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['kancelaria adwokacka', 'adwokat sprawy karne', 'adwokat rozwodowy', 'adwokat odszkodowania', 'pomoc prawna dla firm i osób prywatnych']
  },
  {
    categoryId: 'legal_firm',
    labels: { pl: 'Kancelarie prawne', ru: 'Юридические фирмы', en: 'Legal firms' },
    aliases: ['kancelaria prawna', 'firma prawnicza', 'юридическая фирма', 'legal firm'],
    positiveKeywords: { pl: ['kancelaria prawna', 'usługi prawne', 'porady prawne', 'prawo cywilne', 'prawo rodzinne', 'prawo pracy', 'sporządzanie umów', 'reprezentacja prawna'], ru: ['юридическая фирма', 'юридические услуги', 'гражданское право', 'составление договоров'], en: ['law firm', 'legal services', 'civil law', 'contract drafting'] },
    negativeKeywords: { pl: ['sąd', 'urząd gminy', 'blog prawny', 'darmowe wzory pism'], ru: ['юридический форум', 'бесплатная консультация форум'], en: ['legal blog', 'free legal templates'] },
    excludedBusinessTypes: ['government_office', 'court'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['kancelaria prawna', 'usługi prawne dla firm i klientów indywidualnych', 'porady prawne cywilne i rodzinne', 'sporządzanie umów prawnych', 'kancelaria prawna prawo pracy']
  },
  {
    categoryId: 'tax_advisor',
    labels: { pl: 'Doradcy podatkowi', ru: 'Налоговые консультанты', en: 'Tax advisors' },
    aliases: ['doradca podatkowy', 'doradztwo podatkowe', 'налоговый консультант', 'tax advisor'],
    positiveKeywords: { pl: ['doradca podatkowy', 'doradztwo podatkowe', 'optymalizacja podatkowa', 'rozliczenia podatkowe firm', 'kontrola skarbowa', 'interpretacje podatkowe', 'doradztwo VAT', 'planowanie podatkowe'], ru: ['налоговый консультант', 'налоговое консультирование', 'оптимизация налогов', 'налоговое планирование'], en: ['tax advisor', 'tax consulting', 'tax optimization', 'tax planning'] },
    negativeKeywords: { pl: ['urząd skarbowy', 'biuro rachunkowe', 'PIT za darmo', 'kalkulator podatkowy online'], ru: ['налоговая инспекция', 'бесплатный калькулятор налогов'], en: ['tax office', 'free tax calculator'] },
    excludedBusinessTypes: ['government_office'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['doradca podatkowy', 'doradztwo podatkowe dla firm', 'optymalizacja podatkowa dla przedsiębiorców', 'planowanie podatkowe', 'doradca podatkowy VAT', 'pomoc przy kontroli podatkowej']
  },
  {
    categoryId: 'bankruptcy_law',
    labels: { pl: 'Kancelarie upadłościowe', ru: 'Банкротство', en: 'Bankruptcy law' },
    aliases: ['upadłość konsumencka', 'prawo upadłościowe', 'банкротство', 'bankruptcy law'],
    positiveKeywords: { pl: ['upadłość konsumencka', 'ogłoszenie upadłości', 'oddłużanie', 'restrukturyzacja firmy', 'syndyk masy upadłościowej', 'prawo upadłościowe', 'pomoc w oddłużeniu', 'układ z wierzycielami'], ru: ['банкротство физических лиц', 'списание долгов', 'реструктуризация долга', 'процедура банкротства'], en: ['consumer bankruptcy', 'debt relief', 'debt restructuring', 'insolvency law'] },
    negativeKeywords: { pl: ['sąd upadłościowy', 'krajowy rejestr długów', 'firma windykacyjna', 'pożyczki chwilówki'], ru: ['коллекторское агентство', 'займы'], en: ['debt collection agency', 'payday loans'] },
    excludedBusinessTypes: ['debt_collection_agency', 'payday_loan', 'court'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['upadłość konsumencka kancelaria', 'oddłużanie pomoc prawna', 'ogłoszenie upadłości firmy', 'restrukturyzacja zadłużenia', 'prawnik upadłość konsumencka', 'pomoc prawna syndyk']
  },
  {
    categoryId: 'immigration_lawyer',
    labels: { pl: 'Kancelarie imigracyjne', ru: 'Иммиграционные юристы', en: 'Immigration lawyers' },
    aliases: ['prawnik imigracyjny', 'legalizacja pobytu', 'иммиграционный юрист', 'immigration lawyer'],
    positiveKeywords: { pl: ['legalizacja pobytu', 'karta pobytu pomoc prawna', 'prawo imigracyjne', 'wiza pracownicza', 'zezwolenie na pracę cudzoziemca', 'kancelaria imigracyjna', 'procedura o obywatelstwo polskie', 'karta pobytu czasowego'], ru: ['иммиграционный юрист', 'легализация пребывания', 'вид на жительство помощь', 'разрешение на работу'], en: ['immigration lawyer', 'residence permit', 'work visa', 'legalization of stay'] },
    negativeKeywords: { pl: ['urząd do spraw cudzoziemców', 'straż graniczna', 'biuro tłumaczeń', 'agencja pracy tymczasowej'], ru: ['миграционная служба', 'бюро переводов', 'агентство по трудоустройству'], en: ['immigration office', 'translation agency', 'staffing agency'] },
    excludedBusinessTypes: ['government_office', 'translation_agency', 'travel_agency', 'staffing_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['kancelaria imigracyjna', 'prawnik od legalizacji pobytu', 'pomoc prawna karta pobytu', 'zezwolenie na pracę dla cudzoziemca', 'prawnik imigracyjny dla firm', 'legalizacja pobytu cudzoziemca']
  },
  {
    categoryId: 'business_lawyer',
    labels: { pl: 'Obsługa prawna firm', ru: 'Бизнес-юристы', en: 'Business lawyers' },
    aliases: ['obsługa prawna firm', 'prawnik dla firm', 'бизнес-юрист', 'business lawyer'],
    positiveKeywords: { pl: ['obsługa prawna firm', 'prawnik korporacyjny', 'prawo spółek', 'umowy handlowe', 'compliance dla firm', 'rejestracja spółki', 'fuzje i przejęcia', 'stały nadzór prawny'], ru: ['юрист для бизнеса', 'корпоративное право', 'юридическое сопровождение сделок', 'регистрация компании'], en: ['corporate lawyer', 'business legal services', 'company registration', 'mergers and acquisitions'] },
    negativeKeywords: { pl: ['kancelaria notarialna', 'urząd skarbowy', 'krajowy rejestr sądowy', 'doradca podatkowy'], ru: ['нотариус', 'налоговый консультант'], en: ['notary office', 'tax office'] },
    excludedBusinessTypes: ['government_office', 'notary_public'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['obsługa prawna firm', 'prawnik korporacyjny', 'stała obsługa prawna przedsiębiorstw', 'prawnik do umów handlowych', 'kancelaria prawna dla biznesu', 'rejestracja spółki prawnik']
  },
  {
    categoryId: 'notary',
    labels: { pl: 'Kancelarie notarialne', ru: 'Нотариусы', en: 'Notaries' },
    aliases: ['notariusz', 'kancelaria notarialna', 'нотариус', 'notary public'],
    positiveKeywords: { pl: ['kancelaria notarialna', 'notariusz', 'akt notarialny', 'poświadczenie notarialne', 'notariusz umowa sprzedaży nieruchomości', 'testament notarialny', 'pełnomocnictwo notarialne'], ru: ['нотариус', 'нотариальная контора', 'нотариальное заверение', 'нотариальная доверенность'], en: ['notary public', 'notarial deed', 'notarization', 'notarized power of attorney'] },
    negativeKeywords: { pl: ['sąd wieczystoksięgowy', 'urząd stanu cywilnego', 'tłumacz przysięgły', 'biuro tłumaczeń'], ru: ['загс', 'присяжный переводчик'], en: ['civil registry office', 'sworn translator'] },
    excludedBusinessTypes: ['government_office', 'translation_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['kancelaria notarialna', 'notariusz akty notarialne', 'notariusz umowa sprzedaży nieruchomości', 'notariusz pełnomocnictwo', 'notariusz testament', 'poświadczenie notarialne dokumentów']
  },
  {
    categoryId: 'investment_company',
    labels: { pl: 'Firmy inwestycyjne', ru: 'Инвестиционные компании', en: 'Investment companies' },
    aliases: ['firma inwestycyjna', 'fundusz inwestycyjny', 'инвестиционная компания', 'investment company'],
    positiveKeywords: { pl: ['firma inwestycyjna', 'fundusz inwestycyjny', 'zarządzanie aktywami', 'inwestycje kapitałowe', 'dom maklerski', 'inwestycje dla firm', 'zarządzanie portfelem inwestycyjnym', 'private equity'], ru: ['инвестиционная компания', 'управление активами', 'инвестиционный фонд', 'управление портфелем'], en: ['investment company', 'asset management', 'investment fund', 'portfolio management'] },
    negativeKeywords: { pl: ['bank komercyjny', 'giełda papierów wartościowych urząd', 'doradca finansowy dla klienta indywidualnego', 'kantor wymiany walut'], ru: ['коммерческий банк', 'обменный пункт'], en: ['commercial bank', 'currency exchange'] },
    excludedBusinessTypes: ['bank', 'currency_exchange', 'government_office'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['firma inwestycyjna', 'fundusz inwestycyjny dla firm', 'zarządzanie aktywami', 'dom maklerski', 'inwestycje kapitałowe dla przedsiębiorstw', 'usługi private equity']
  },
  {
    categoryId: 'financial_advisor',
    labels: { pl: 'Doradcy finansowi', ru: 'Финансовые консультанты', en: 'Financial advisors' },
    aliases: ['doradca finansowy', 'doradztwo finansowe', 'финансовый консультант', 'financial advisor'],
    positiveKeywords: { pl: ['doradca finansowy', 'doradztwo finansowe', 'planowanie finansowe', 'niezależny doradca finansowy', 'doradztwo emerytalne', 'analiza finansowa dla firm', 'doradca ds. finansów osobistych'], ru: ['финансовый консультант', 'финансовое планирование', 'независимый финансовый советник', 'пенсионное консультирование'], en: ['financial advisor', 'financial planning', 'independent financial consultant', 'retirement planning'] },
    negativeKeywords: { pl: ['bank detaliczny', 'doradca kredytowy chwilówki', 'parabank', 'kantor wymiany walut'], ru: ['банк', 'микрозаймы'], en: ['retail bank', 'payday loans'] },
    excludedBusinessTypes: ['bank', 'payday_loan'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['doradca finansowy', 'doradztwo finansowe dla firm', 'niezależny doradca finansowy', 'planowanie finansowe osobiste', 'doradca emerytalny', 'doradztwo finansowe dla przedsiębiorców']
  },
  {
    categoryId: 'mortgage_broker',
    labels: { pl: 'Brokerzy hipoteczni', ru: 'Ипотечные брокеры', en: 'Mortgage brokers' },
    aliases: ['broker hipoteczny', 'doradca kredytu hipotecznego', 'ипотечный брокер', 'mortgage broker'],
    positiveKeywords: { pl: ['broker hipoteczny', 'kredyt hipoteczny doradztwo', 'doradca kredytu hipotecznego', 'porównanie kredytów hipotecznych', 'pośrednik kredytowy', 'kredyt hipoteczny dla firm', 'refinansowanie kredytu hipotecznego'], ru: ['ипотечный брокер', 'ипотечный кредит консультация', 'подбор ипотеки', 'рефинансирование ипотеки'], en: ['mortgage broker', 'mortgage advisor', 'home loan consultant', 'mortgage refinancing'] },
    negativeKeywords: { pl: ['bank hipoteczny', 'deweloper mieszkaniowy', 'agencja nieruchomości', 'biuro nieruchomości'], ru: ['банк', 'агентство недвижимости'], en: ['mortgage bank', 'real estate agency'] },
    excludedBusinessTypes: ['bank', 'real_estate_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['broker hipoteczny', 'doradca kredytu hipotecznego', 'pośrednik kredytowy hipoteczny', 'porównanie ofert kredytów hipotecznych', 'kredyt hipoteczny doradztwo', 'refinansowanie hipoteki']
  },
  {
    categoryId: 'insurance_agency',
    labels: { pl: 'Agencje ubezpieczeniowe', ru: 'Страховые агентства', en: 'Insurance agencies' },
    aliases: ['agencja ubezpieczeniowa', 'broker ubezpieczeniowy', 'страховое агентство', 'insurance agency'],
    positiveKeywords: { pl: ['agencja ubezpieczeniowa', 'broker ubezpieczeniowy', 'multiagencja ubezpieczeniowa', 'pośrednictwo ubezpieczeniowe', 'porównanie ofert ubezpieczeń', 'ubezpieczenia dla firm agencja', 'agent ubezpieczeniowy'], ru: ['страховое агентство', 'страховой брокер', 'посредничество в страховании', 'подбор страховки'], en: ['insurance agency', 'insurance broker', 'insurance brokerage', 'insurance intermediary'] },
    negativeKeywords: { pl: ['towarzystwo ubezpieczeniowe', 'zakład ubezpieczeń', 'kalkulator ubezpieczenia samochodu online', 'oddział ubezpieczyciela'], ru: ['страховая компания', 'калькулятор страховки онлайн'], en: ['insurance carrier', 'insurance company direct'] },
    excludedBusinessTypes: ['insurance_company'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['agencja ubezpieczeniowa', 'broker ubezpieczeniowy', 'multiagencja ubezpieczeniowa dla firm', 'pośrednictwo ubezpieczeniowe', 'agent ubezpieczeniowy dla przedsiębiorstw', 'porównanie ofert ubezpieczeniowych']
  },
  {
    categoryId: 'leasing_company',
    labels: { pl: 'Firmy leasingowe', ru: 'Лизинговые компании', en: 'Leasing companies' },
    aliases: ['firma leasingowa', 'leasing dla firm', 'лизинговая компания', 'leasing company'],
    positiveKeywords: { pl: ['firma leasingowa', 'leasing samochodów dla firm', 'leasing maszyn', 'leasing operacyjny', 'leasing finansowy', 'leasing sprzętu firmowego', 'leasing floty pojazdów'], ru: ['лизинговая компания', 'лизинг автомобилей для бизнеса', 'лизинг оборудования', 'финансовый лизинг'], en: ['leasing company', 'equipment leasing', 'fleet leasing', 'operating lease'] },
    negativeKeywords: { pl: ['wypożyczalnia samochodów', 'salon samochodowy', 'komis samochodowy', 'wynajem długoterminowy prywatny'], ru: ['прокат автомобилей', 'автосалон'], en: ['car rental', 'car dealership'] },
    excludedBusinessTypes: ['car_rental', 'car_dealer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['firma leasingowa', 'leasing samochodów dla firm', 'leasing maszyn i urządzeń', 'leasing operacyjny dla przedsiębiorstw', 'leasing floty pojazdów', 'leasing finansowy sprzętu']
  },
  {
    categoryId: 'accounting_firm',
    labels: { pl: 'Obsługa księgowa firm', ru: 'Бухгалтерские фирмы', en: 'Accounting firms' },
    aliases: ['obsługa księgowa firm', 'biuro rachunkowe dla firm', 'бухгалтерская фирма', 'accounting firm'],
    positiveKeywords: { pl: ['obsługa księgowa firm', 'biuro rachunkowe dla spółek', 'pełna księgowość dla firm', 'outsourcing księgowy', 'kadry i płace dla firm', 'sprawozdania finansowe', 'audyt księgowy', 'księgowość dla spółek z o.o.'], ru: ['бухгалтерская фирма', 'бухгалтерское обслуживание компаний', 'аутсорсинг бухгалтерии', 'финансовая отчетность'], en: ['accounting firm', 'corporate accounting services', 'accounting outsourcing', 'financial statements'] },
    negativeKeywords: { pl: ['urząd skarbowy', 'PIT roczny dla osoby fizycznej', 'program do faktur online', 'darmowy kalkulator wynagrodzeń'], ru: ['налоговая инспекция', 'бесплатный калькулятор зарплаты'], en: ['tax office', 'free payroll calculator'] },
    excludedBusinessTypes: ['government_office'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz kontaktowy'],
    searchTemplates: ['obsługa księgowa firm', 'biuro rachunkowe dla spółek', 'pełna księgowość dla przedsiębiorstw', 'outsourcing księgowy dla firm', 'kadry i płace obsługa firm', 'audyt i sprawozdania finansowe']
  },
  {
    categoryId: 'hotel',
    labels: { pl: 'Hotele', ru: 'Отели', en: 'Hotels' },
    aliases: ['hotel', 'hotele', 'отель', 'hotels'],
    positiveKeywords: { pl: ['hotel', 'nocleg', 'pokoje hotelowe', 'hotel biznesowy', 'hotel butikowy', 'apartamenty hotelowe', 'rezerwacja hotelu', 'hotel spa', 'hotel konferencyjny', 'hotel 4 gwiazdki'], ru: ['отель', 'гостиница', 'номера', 'бронирование отеля'], en: ['hotel', 'accommodation', 'hotel booking', 'boutique hotel'] },
    negativeKeywords: { pl: ['hostel', 'pokoje gościnne', 'kwatery pracownicze', 'motel przy trasie', 'noclegownia'], ru: ['хостел', 'общежитие'], en: ['hostel', 'motel'] },
    excludedBusinessTypes: ['hostel', 'motel', 'workers_dormitory'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['hotel w centrum', 'hotel biznesowy', 'hotel z basenem', 'hotel dla par', 'hotel z restauracją', 'hotel na weekend']
  },
  {
    categoryId: 'boutique_hotel',
    labels: { pl: 'Hotele butikowe', ru: 'Бутик-отели', en: 'Boutique hotels' },
    aliases: ['hotel butikowy', 'boutique hotel', 'бутик-отель'],
    positiveKeywords: { pl: ['hotel butikowy', 'kameralny hotel', 'ekskluzywny hotel', 'design hotel', 'hotel z charakterem', 'unikalny hotel', 'butikowy nocleg', 'hotel premium'], ru: ['бутик-отель', 'дизайн-отель', 'камерный отель'], en: ['boutique hotel', 'design hotel', 'small luxury hotel'] },
    negativeKeywords: { pl: ['hotel sieciowy', 'hotel przy autostradzie', 'hostel', 'apartamenty na dobę'], ru: ['сетевой отель', 'хостел'], en: ['chain hotel', 'budget hotel'] },
    excludedBusinessTypes: ['chain_hotel', 'hostel', 'budget_motel'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['hotel butikowy', 'kameralny hotel z klimatem', 'hotel butikowy w centrum', 'design hotel', 'ekskluzywny hotel butikowy', 'hotel butikowy na romantyczny weekend']
  },
  {
    categoryId: 'spa_center',
    labels: { pl: 'Salony SPA', ru: 'СПА', en: 'Spa centers' },
    aliases: ['spa', 'salon spa', 'centrum spa', 'спа-салон'],
    positiveKeywords: { pl: ['salon spa', 'centrum spa', 'masaż relaksacyjny', 'zabiegi spa', 'dzień spa', 'rytuały spa', 'spa dla dwojga', 'spa i wellness', 'luksusowy spa'], ru: ['спа-салон', 'массаж', 'спа-процедуры', 'спа для двоих'], en: ['spa', 'spa treatments', 'wellness spa', 'day spa'] },
    negativeKeywords: { pl: ['salon fryzjerski', 'salon paznokci', 'solarium', 'gabinet kosmetyczny podstawowy'], ru: ['парикмахерская', 'маникюр'], en: ['nail salon', 'barber shop'] },
    excludedBusinessTypes: ['hair_salon', 'nail_salon', 'tanning_salon'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['salon spa', 'centrum spa i wellness', 'dzień spa dla dwojga', 'masaże i zabiegi spa', 'luksusowe spa', 'spa z basenem']
  },
  {
    categoryId: 'resort',
    labels: { pl: 'Resorty', ru: 'Курорты', en: 'Resorts' },
    aliases: ['resort', 'ośrodek wypoczynkowy', 'kurort', 'курорт'],
    positiveKeywords: { pl: ['resort', 'ośrodek wypoczynkowy', 'all inclusive', 'resort spa', 'resort nad morzem', 'resort w górach', 'kurort wypoczynkowy', 'ekskluzywny resort'], ru: ['курорт', 'курортный отель', 'все включено'], en: ['resort', 'all inclusive resort', 'holiday resort'] },
    negativeKeywords: { pl: ['pole namiotowe', 'camping', 'domki campingowe', 'schronisko młodzieżowe'], ru: ['кемпинг'], en: ['campsite', 'hostel'] },
    excludedBusinessTypes: ['campsite', 'hostel', 'youth_hostel'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['resort nad morzem', 'resort w górach', 'resort all inclusive', 'ekskluzywny resort wypoczynkowy', 'resort spa', 'resort rodzinny premium']
  },
  {
    categoryId: 'fine_dining_restaurant',
    labels: { pl: 'Restauracje fine dining', ru: 'Рестораны высокого уровня', en: 'Fine dining restaurants' },
    aliases: ['fine dining', 'restauracja premium', 'restauracja wykwintna', 'ресторан высокой кухни'],
    positiveKeywords: { pl: ['restauracja fine dining', 'kuchnia autorska', 'restauracja z gwiazdką', 'szef kuchni', 'restauracja premium', 'wykwintna kuchnia', 'degustacyjne menu', 'restauracja na specjalne okazje'], ru: ['ресторан высокой кухни', 'фаин дайнинг', 'авторская кухня'], en: ['fine dining', 'tasting menu', 'chef restaurant'] },
    negativeKeywords: { pl: ['fast food', 'bar szybkiej obsługi', 'restauracja sieciowa', 'pizzeria', 'kebab', 'stołówka', 'bar mleczny'], ru: ['фастфуд', 'сетевой ресторан'], en: ['fast food', 'chain restaurant'] },
    excludedBusinessTypes: ['fast_food', 'food_court', 'cafeteria', 'pizzeria_chain'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['restauracja fine dining', 'restauracja z autorską kuchnią', 'wykwintna restauracja na kolację', 'restauracja premium w centrum', 'restauracja na romantyczną kolację', 'najlepsza restauracja w mieście']
  },
  {
    categoryId: 'catering_company',
    labels: { pl: 'Firmy cateringowe', ru: 'Кейтеринг', en: 'Catering companies' },
    aliases: ['catering', 'firma cateringowa', 'кейтеринг'],
    positiveKeywords: { pl: ['catering', 'catering firmowy', 'catering na wesele', 'catering premium', 'organizacja przyjęć', 'catering eventowy', 'catering dietetyczny', 'obsługa gastronomiczna eventów'], ru: ['кейтеринг', 'выездное обслуживание', 'кейтеринг на свадьбу'], en: ['catering', 'event catering', 'wedding catering'] },
    negativeKeywords: { pl: ['stołówka pracownicza', 'bar szybkiej obsługi', 'dowóz pizzy'], ru: ['доставка еды'], en: ['food delivery'] },
    excludedBusinessTypes: ['cafeteria', 'fast_food', 'food_delivery'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['catering na wesele', 'catering firmowy', 'catering na eventy', 'catering premium', 'obsługa cateringowa imprez', 'catering dietetyczny dla firm']
  },
  {
    categoryId: 'fitness_club',
    labels: { pl: 'Kluby fitness', ru: 'Фитнес-клубы', en: 'Fitness clubs' },
    aliases: ['fitness club', 'klub fitness', 'siłownia', 'фитнес-клуб'],
    positiveKeywords: { pl: ['klub fitness', 'siłownia', 'zajęcia fitness', 'trening personalny', 'karnet fitness', 'klub sportowy', 'zajęcia grupowe fitness', 'fitness club'], ru: ['фитнес-клуб', 'тренажерный зал', 'групповые тренировки'], en: ['fitness club', 'gym', 'personal training'] },
    negativeKeywords: { pl: ['siłownia plenerowa', 'siłownia zewnętrzna', 'plac zabaw sportowy'], ru: ['уличные тренажеры'], en: ['outdoor gym'] },
    excludedBusinessTypes: ['outdoor_gym', 'playground'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['klub fitness', 'siłownia z trenerem personalnym', 'karnet na siłownię', 'zajęcia fitness grupowe', 'klub fitness premium', 'siłownia i fitness club']
  },
  {
    categoryId: 'premium_gym',
    labels: { pl: 'Ekskluzywne siłownie', ru: 'Премиальные залы', en: 'Premium gyms' },
    aliases: ['siłownia premium', 'ekskluzywna siłownia', 'boutique gym', 'премиальный зал'],
    positiveKeywords: { pl: ['ekskluzywna siłownia', 'siłownia premium', 'butikowa siłownia', 'prywatny trening', 'siłownia z osobistym trenerem', 'elitarny klub sportowy', 'siłownia 5 gwiazdek', 'luksusowy klub fitness'], ru: ['премиальный фитнес-клуб', 'элитный тренажерный зал', 'бутик-фитнес'], en: ['premium gym', 'boutique fitness', 'luxury gym'] },
    negativeKeywords: { pl: ['siłownia osiedlowa', 'tania siłownia', 'siłownia 24h budżetowa', 'klub fitness sieciowy tani'], ru: ['бюджетный зал'], en: ['budget gym'] },
    excludedBusinessTypes: ['budget_gym', 'chain_low_cost_gym'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['ekskluzywna siłownia', 'siłownia premium z trenerem', 'butikowa siłownia', 'elitarny klub fitness', 'prywatna siłownia vip', 'luksusowy klub sportowy']
  },
  {
    categoryId: 'pilates_studio',
    labels: { pl: 'Studia pilatesu', ru: 'Студии пилатеса', en: 'Pilates studios' },
    aliases: ['pilates', 'studio pilates', 'студия пилатеса'],
    positiveKeywords: { pl: ['studio pilatesu', 'zajęcia pilates', 'pilates reformer', 'pilates dla początkujących', 'trening pilates', 'pilates i joga', 'pilates butikowe studio'], ru: ['студия пилатеса', 'пилатес реформер', 'занятия пилатесом'], en: ['pilates studio', 'reformer pilates'] },
    negativeKeywords: { pl: ['siłownia ogólna', 'klub fitness z pilatesem jako dodatek'], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['studio pilatesu', 'zajęcia pilates reformer', 'pilates dla początkujących', 'studio pilates i jogi', 'trening pilates w studio', 'butikowe studio pilates']
  },
  {
    categoryId: 'dance_schools',
    labels: { pl: 'Szkoły tańca', ru: 'Танцевальные школы', en: 'Dance schools' },
    aliases: ['szkoła tańca', 'szkoła taneczna', 'dance school', 'танцевальная школа'],
    positiveKeywords: { pl: ['szkoła tańca', 'nauka tańca', 'kurs tańca', 'zajęcia taneczne', 'szkoła tańca towarzyskiego', 'lekcje tańca dla par', 'taniec dla dzieci', 'pierwszy taniec'], ru: ['школа танцев', 'уроки танцев', 'первый танец'], en: ['dance school', 'dance lessons'] },
    negativeKeywords: { pl: ['klub nocny', 'dyskoteka', 'sala weselna'], ru: ['ночной клуб'], en: ['nightclub'] },
    excludedBusinessTypes: ['nightclub', 'event_hall'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['szkoła tańca', 'kurs tańca dla par', 'nauka pierwszego tańca', 'zajęcia taneczne dla dzieci', 'szkoła tańca towarzyskiego', 'lekcje tańca dla dorosłych']
  },
  {
    categoryId: 'tennis_club',
    labels: { pl: 'Kluby tenisowe', ru: 'Теннисные клубы', en: 'Tennis clubs' },
    aliases: ['klub tenisowy', 'kort tenisowy', 'tennis club', 'теннисный клуб'],
    positiveKeywords: { pl: ['klub tenisowy', 'korty tenisowe', 'nauka tenisa', 'trener tenisa', 'wynajem kortu', 'akademia tenisa', 'kort tenisowy kryty'], ru: ['теннисный клуб', 'теннисные корты', 'тренер по теннису'], en: ['tennis club', 'tennis courts', 'tennis academy'] },
    negativeKeywords: { pl: ['boisko wielofunkcyjne osiedlowe', 'squash klub'], ru: [], en: ['squash club'] },
    excludedBusinessTypes: ['squash_club', 'public_playground'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['klub tenisowy', 'korty tenisowe kryte', 'nauka tenisa dla dzieci', 'wynajem kortu tenisowego', 'akademia tenisa ziemnego', 'trener tenisa prywatny']
  },
  {
    categoryId: 'golf_club',
    labels: { pl: 'Kluby golfowe', ru: 'Гольф-клубы', en: 'Golf clubs' },
    aliases: ['klub golfowy', 'pole golfowe', 'golf club', 'гольф-клуб'],
    positiveKeywords: { pl: ['klub golfowy', 'pole golfowe', 'nauka golfa', 'akademia golfa', 'driving range', 'trener golfa', 'ekskluzywny klub golfowy', 'członkostwo klubu golfowego'], ru: ['гольф-клуб', 'поле для гольфа', 'академия гольфа'], en: ['golf club', 'golf course', 'golf academy'] },
    negativeKeywords: { pl: ['minigolf', 'mini golf dla dzieci', 'park rozrywki'], ru: ['мини-гольф'], en: ['mini golf'] },
    excludedBusinessTypes: ['mini_golf', 'amusement_park'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['klub golfowy', 'pole golfowe premium', 'nauka golfa dla początkujących', 'akademia golfa', 'driving range golf', 'ekskluzywny klub golfowy']
  },
  {
    categoryId: 'private_school',
    labels: { pl: 'Szkoły prywatne', ru: 'Частные школы', en: 'Private schools' },
    aliases: ['szkoła prywatna', 'szkoła niepubliczna', 'private school', 'частная школа'],
    positiveKeywords: { pl: ['szkoła prywatna', 'szkoła niepubliczna', 'liceum prywatne', 'szkoła podstawowa prywatna', 'edukacja spersonalizowana', 'kameralne klasy', 'szkoła z międzynarodową maturą', 'ekskluzywna szkoła'], ru: ['частная школа', 'негосударственная школа', 'международный бакалавриат'], en: ['private school', 'independent school', 'international school'] },
    negativeKeywords: { pl: ['szkoła publiczna', 'szkoła państwowa', 'zespół szkół publicznych'], ru: ['государственная школа'], en: ['public school'] },
    excludedBusinessTypes: ['public_school', 'state_school'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['szkoła prywatna', 'liceum prywatne', 'szkoła podstawowa niepubliczna', 'prywatna szkoła z maturą międzynarodową', 'ekskluzywna szkoła prywatna', 'szkoła prywatna dla dzieci']
  },
  {
    categoryId: 'language_schools',
    labels: { pl: 'Szkoły językowe', ru: 'Языковые школы', en: 'Language schools' },
    aliases: ['szkoła językowa', 'kurs językowy', 'language school', 'языковая школа'],
    positiveKeywords: { pl: ['szkoła językowa', 'kurs angielskiego', 'nauka języków obcych', 'lekcje języka angielskiego', 'kurs języka dla firm', 'szkoła językowa dla dzieci', 'przygotowanie do certyfikatu językowego', 'korepetycje językowe'], ru: ['языковая школа', 'курсы английского', 'изучение иностранных языков'], en: ['language school', 'english courses', 'language learning'] },
    negativeKeywords: { pl: ['korepetytor prywatny freelancer', 'nauczyciel indywidualny bez firmy'], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['szkoła językowa', 'kurs angielskiego dla dorosłych', 'szkoła językowa dla dzieci', 'kursy językowe dla firm', 'nauka języka obcego online i stacjonarnie', 'przygotowanie do egzaminu językowego']
  },
  {
    categoryId: 'online_school',
    labels: { pl: 'Szkoły online', ru: 'Онлайн-школы', en: 'Online schools' },
    aliases: ['szkoła online', 'kursy online', 'e-learning', 'онлайн-школа'],
    positiveKeywords: { pl: ['szkoła online', 'kursy online', 'platforma edukacyjna', 'nauka zdalna', 'szkolenia online', 'kurs e-learning', 'edukacja przez internet', 'szkoła internetowa'], ru: ['онлайн-школа', 'онлайн-курсы', 'дистанционное обучение'], en: ['online school', 'online courses', 'e-learning platform'] },
    negativeKeywords: { pl: ['szkoła stacjonarna', 'kurs jednorazowy webinar bezpłatny'], ru: [], en: [] },
    excludedBusinessTypes: [],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['szkoła online', 'kursy online z certyfikatem', 'platforma e-learningowa', 'szkolenia online dla firm', 'nauka zdalna online', 'kurs online z instruktorem']
  },
  {
    categoryId: 'training_center',
    labels: { pl: 'Centra szkoleniowe', ru: 'Учебные центры', en: 'Training centers' },
    aliases: ['centrum szkoleniowe', 'ośrodek szkoleniowy', 'training center', 'учебный центр'],
    positiveKeywords: { pl: ['centrum szkoleniowe', 'ośrodek szkoleniowy', 'szkolenia zawodowe', 'kursy kwalifikacyjne', 'szkolenia branżowe', 'centrum edukacyjne dla dorosłych', 'kursy certyfikowane'], ru: ['учебный центр', 'профессиональное обучение', 'сертифицированные курсы'], en: ['training center', 'professional training', 'certified courses'] },
    negativeKeywords: { pl: ['szkoła podstawowa', 'przedszkole'], ru: [], en: [] },
    excludedBusinessTypes: ['kindergarten', 'primary_school'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['centrum szkoleniowe', 'ośrodek szkoleń zawodowych', 'kursy kwalifikacyjne dla dorosłych', 'centrum edukacyjne z certyfikatami', 'szkolenia branżowe dla specjalistów', 'kursy zawodowe stacjonarne']
  },
  {
    categoryId: 'corporate_training',
    labels: { pl: 'Szkolenia korporacyjne', ru: 'Корпоративное обучение', en: 'Corporate training' },
    aliases: ['szkolenia dla firm', 'szkolenia biznesowe', 'corporate training', 'корпоративное обучение'],
    positiveKeywords: { pl: ['szkolenia korporacyjne', 'szkolenia dla firm', 'szkolenia biznesowe', 'rozwój kompetencji pracowników', 'warsztaty dla firm', 'szkolenia menedżerskie', 'szkolenia z zakresu przywództwa', 'firma szkoleniowa b2b'], ru: ['корпоративное обучение', 'бизнес-тренинги', 'обучение персонала'], en: ['corporate training', 'business training', 'employee development'] },
    negativeKeywords: { pl: ['szkolenie bhp podstawowe', 'kurs prawa jazdy'], ru: [], en: [] },
    excludedBusinessTypes: ['driving_school'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads lokalne', 'system rezerwacji online'],
    searchTemplates: ['szkolenia korporacyjne', 'szkolenia dla firm z zakresu zarządzania', 'warsztaty biznesowe dla pracowników', 'firma szkoleniowa b2b', 'szkolenia menedżerskie dla kadry', 'rozwój kompetencji miękkich w firmie']
  },
  {
    categoryId: 'jewelry_house',
    labels: { pl: 'Domy jubilerskie', ru: 'Ювелирные дома', en: 'Jewelry houses' },
    aliases: ['jubiler', 'biżuteria luksusowa', 'dom jubilerski', 'jewelry house'],
    positiveKeywords: { pl: ['dom jubilerski', 'biżuteria luksusowa', 'jubiler', 'pracownia jubilerska', 'biżuteria na zamówienie', 'kamienie szlachetne', 'obrączki na zamówienie', 'wycena biżuterii', 'antyczna biżuteria', 'zegarki luksusowe'], ru: ['ювелирный дом', 'элитные украшения', 'ювелир', 'украшения на заказ'], en: ['jewelry house', 'luxury jewelry', 'bespoke jewelry', 'fine jewelry'] },
    negativeKeywords: { pl: ['lombard', 'skup złota i biżuterii', 'biżuteria sztuczna', 'sieć sklepów z biżuterią', 'biżuteria kostiumowa'], ru: ['ломбард', 'скупка золота', 'бижутерия'], en: ['pawn shop', 'costume jewelry', 'gold buyer'] },
    excludedBusinessTypes: ['pawn_shop'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['dom jubilerski', 'biżuteria luksusowa na zamówienie', 'pracownia jubilerska', 'ekskluzywna biżuteria autorska', 'zegarki i biżuteria premium']
  },
  {
    categoryId: 'premium_furniture',
    labels: { pl: 'Meble premium', ru: 'Премиальная мебель', en: 'Premium furniture' },
    aliases: ['meble luksusowe', 'meble na zamówienie premium', 'premium furniture'],
    positiveKeywords: { pl: ['meble premium', 'meble luksusowe', 'meble na zamówienie', 'meble designerskie', 'salon mebli ekskluzywnych', 'meble włoskie', 'meble tapicerowane na wymiar', 'stolarnia meblowa artystyczna'], ru: ['премиальная мебель', 'элитная мебель', 'мебель на заказ', 'дизайнерская мебель'], en: ['premium furniture', 'luxury furniture', 'bespoke furniture', 'designer furniture'] },
    negativeKeywords: { pl: ['meble sieciowe', 'meble ogrodowe plastikowe', 'market meblowy', 'meble tanie', 'sklep meblowy dyskontowy'], ru: ['мебельный магазин эконом', 'сетевая мебель'], en: ['budget furniture store', 'flat-pack furniture'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['meble premium na zamówienie', 'salon mebli luksusowych', 'meble designerskie do wnętrz', 'stolarnia meblowa ekskluzywna', 'meble włoskie na wymiar']
  },
  {
    categoryId: 'interior_design',
    labels: { pl: 'Projektowanie wnętrz', ru: 'Дизайн интерьеров', en: 'Interior design' },
    aliases: ['architekt wnętrz', 'projektant wnętrz', 'interior design'],
    positiveKeywords: { pl: ['projektowanie wnętrz', 'architekt wnętrz', 'aranżacja wnętrz', 'projekt wnętrz mieszkania', 'pracownia projektowania wnętrz', 'design wnętrz', 'wykończenie wnętrz pod klucz'], ru: ['дизайн интерьера', 'дизайнер интерьеров', 'проектирование интерьера'], en: ['interior design', 'interior designer', 'interior architecture'] },
    negativeKeywords: { pl: ['sklep z dekoracjami', 'hurtownia wykończeniowa', 'firma sprzątająca'], ru: ['магазин декора'], en: ['home decor store'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['pracownia projektowania wnętrz', 'architekt wnętrz mieszkania', 'aranżacja wnętrz pod klucz', 'projekt wnętrz biura', 'design wnętrz apartamentu']
  },
  {
    categoryId: 'luxury_architecture_studio',
    labels: { pl: 'Pracownie architektury rezydencjonalnej', ru: 'Архитектура частных резиденций', en: 'Luxury residential architecture studios' },
    aliases: ['architekt rezydencji', 'architektura luksusowych domów', 'private residence architect'],
    positiveKeywords: { pl: ['architektura rezydencjonalna', 'projekt domu jednorodzinnego luksusowego', 'architekt rezydencji', 'pracownia architektoniczna willi', 'projektowanie domów ekskluzywnych', 'architekt domów pod klucz'], ru: ['архитектура резиденций', 'архитектор частных домов', 'проект элитного дома'], en: ['residential architecture', 'private residence architect', 'luxury home architect'] },
    negativeKeywords: { pl: ['biuro architektoniczne osiedla', 'architektura komercyjna', 'architektura biurowa', 'projektowanie budynków wielorodzinnych', 'architekt wnętrz'], ru: ['коммерческая архитектура', 'архитектура жилых комплексов'], en: ['commercial architecture firm', 'multifamily housing architect'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['pracownia architektoniczna rezydencji', 'architekt domów jednorodzinnych luksusowych', 'projekt willi na zamówienie', 'architektura ekskluzywnych domów', 'pracownia architektury willowej']
  },
  {
    categoryId: 'private_villa_developer',
    labels: { pl: 'Budowa willi', ru: 'Частные виллы (застройщики)', en: 'Private villa developers' },
    aliases: ['deweloper willi', 'budowa domów luksusowych', 'villa developer'],
    positiveKeywords: { pl: ['budowa willi', 'generalny wykonawca willi', 'firma budująca domy luksusowe', 'budowa rezydencji', 'domy pod klucz premium', 'deweloper domów jednorodzinnych ekskluzywnych'], ru: ['строительство вилл', 'застройщик частных вилл', 'генподрядчик элитных домов'], en: ['villa construction', 'luxury home builder', 'private villa developer'] },
    negativeKeywords: { pl: ['deweloper mieszkaniowy blokowy', 'budowa bloków', 'osiedle domów szeregowych budżetowych', 'firma remontowa mała'], ru: ['застройщик многоквартирных домов', 'бюджетное жилье'], en: ['apartment block developer', 'budget housing developer'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['generalny wykonawca willi', 'budowa domów luksusowych pod klucz', 'firma budująca rezydencje', 'deweloper domów jednorodzinnych premium', 'budowa willi na indywidualny projekt']
  },
  {
    categoryId: 'yacht_sales',
    labels: { pl: 'Jachty - sprzedaż i czarter', ru: 'Яхты', en: 'Yachts - sales & charter' },
    aliases: ['broker jachtowy', 'sprzedaż jachtów', 'yacht brokerage'],
    positiveKeywords: { pl: ['sprzedaż jachtów', 'broker jachtowy', 'czarter jachtów luksusowych', 'jachty motorowe premium', 'jachty na zamówienie', 'agencja jachtowa', 'jachty żaglowe ekskluzywne'], ru: ['продажа яхт', 'брокер яхт', 'чартер яхт', 'яхтенный брокер'], en: ['yacht sales', 'yacht broker', 'yacht charter', 'superyacht'] },
    negativeKeywords: { pl: ['wypożyczalnia kajaków', 'wypożyczalnia łódek rekreacyjnych', 'szkoła żeglarska podstawowa', 'sklep wędkarski'], ru: ['прокат лодок', 'прокат байдарок'], en: ['kayak rental', 'boat rental basic', 'fishing shop'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['broker jachtowy', 'sprzedaż jachtów luksusowych', 'czarter jachtów premium', 'agencja sprzedaży jachtów', 'jachty motorowe na zamówienie']
  },
  {
    categoryId: 'private_aviation',
    labels: { pl: 'Lotnictwo prywatne', ru: 'Частная авиация', en: 'Private aviation' },
    aliases: ['czarter samolotów prywatnych', 'private jet charter', 'loty prywatne'],
    positiveKeywords: { pl: ['czarter samolotów prywatnych', 'wynajem samolotu prywatnego', 'loty czarterowe biznesowe', 'zarządzanie samolotem prywatnym', 'broker lotów prywatnych', 'jet prywatny'], ru: ['чартер частных самолетов', 'аренда частного самолета', 'бизнес-авиация', 'брокер частных перелетов'], en: ['private jet charter', 'private aviation', 'business jet', 'jet management'] },
    negativeKeywords: { pl: ['tanie linie lotnicze', 'szkoła lotnicza rekreacyjna', 'aeroklub amatorski', 'wycieczki balonem'], ru: ['бюджетные авиалинии', 'авиашкола любительская'], en: ['budget airline', 'flight school hobby', 'hot air balloon rides'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['czarter samolotów prywatnych', 'wynajem jetu prywatnego', 'broker lotów biznesowych', 'zarządzanie flotą samolotów prywatnych', 'loty czarterowe VIP']
  },
  {
    categoryId: 'landscaping_company',
    labels: { pl: 'Firmy ogrodnicze / architektura krajobrazu', ru: 'Ландшафтные компании', en: 'Landscaping companies' },
    aliases: ['architektura krajobrazu', 'firma ogrodnicza', 'landscaping'],
    positiveKeywords: { pl: ['architektura krajobrazu', 'projektowanie ogrodów', 'firma ogrodnicza', 'zakładanie ogrodów', 'pielęgnacja ogrodów', 'projekt zieleni działki', 'ogrody przydomowe pod klucz'], ru: ['ландшафтный дизайн', 'ландшафтная компания', 'озеленение участка', 'проектирование сада'], en: ['landscaping company', 'landscape architecture', 'garden design'] },
    negativeKeywords: { pl: ['koszenie trawy usługa jednorazowa', 'sklep ogrodniczy', 'hurtownia nasion', 'wycinka drzew tylko'], ru: ['магазин садовых товаров'], en: ['garden supply store', 'lawn mowing only'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['architektura krajobrazu firma', 'projektowanie i zakładanie ogrodów', 'firma ogrodnicza kompleksowa', 'ogrody przydomowe pod klucz', 'projekt zieleni wokół domu']
  },
  {
    categoryId: 'greenery_planting',
    labels: { pl: 'Nasadzenia i zieleń', ru: 'Озеленение', en: 'Greenery planting' },
    aliases: ['zieleń miejska', 'nasadzenia roślin', 'ozelenienie'],
    positiveKeywords: { pl: ['nasadzenia roślin', 'zieleń miejska', 'usługi ogrodnicze nasadzenia', 'projektowanie zieleni', 'żywopłoty nasadzenia', 'trawniki zakładanie', 'pielęgnacja terenów zielonych'], ru: ['озеленение территории', 'посадка растений', 'благоустройство зелени'], en: ['greenery planting', 'planting services', 'green area maintenance'] },
    negativeKeywords: { pl: ['leśnictwo przemysłowe', 'gospodarstwo rolne', 'szkółka hurtowa sprzedaż detaliczna'], ru: ['лесное хозяйство', 'питомник розничный'], en: ['forestry', 'retail plant nursery'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['nasadzenia roślin i zieleni', 'firma zajmująca się zielenią miejską', 'zakładanie trawników i żywopłotów', 'pielęgnacja terenów zielonych', 'projektowanie i nasadzenia zieleni']
  },
  {
    categoryId: 'irrigation_systems',
    labels: { pl: 'Systemy nawadniania', ru: 'Автоматический полив', en: 'Irrigation systems' },
    aliases: ['nawadnianie automatyczne', 'systemy irygacyjne', 'irrigation'],
    positiveKeywords: { pl: ['automatyczne nawadnianie', 'systemy nawadniania ogrodu', 'instalacja nawadniania', 'montaż zraszaczy', 'nawadnianie trawnika automatyczne', 'systemy irygacyjne'], ru: ['автоматический полив', 'системы орошения', 'установка полива'], en: ['irrigation systems', 'automatic watering', 'sprinkler installation'] },
    negativeKeywords: { pl: ['nawadnianie rolnicze pola', 'hurtownia węży ogrodowych'], ru: ['сельскохозяйственное орошение'], en: ['agricultural irrigation'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['montaż systemów nawadniania', 'automatyczne nawadnianie ogrodu', 'instalacja zraszaczy', 'systemy irygacyjne do ogrodu', 'nawadnianie trawników automatyczne']
  },
  {
    categoryId: 'pool_construction',
    labels: { pl: 'Baseny - budowa', ru: 'Бассейны', en: 'Pool construction' },
    aliases: ['budowa basenów', 'baseny ogrodowe', 'pool construction'],
    positiveKeywords: { pl: ['budowa basenów', 'baseny ogrodowe', 'baseny skimmerowe', 'basen przydomowy pod klucz', 'firma budująca baseny', 'baseny betonowe', 'niecki basenowe'], ru: ['строительство бассейнов', 'бассейны для дома', 'частный бассейн под ключ'], en: ['pool construction', 'private pool builder', 'swimming pool contractor'] },
    negativeKeywords: { pl: ['basen publiczny', 'kryta pływalnia miejska', 'aquapark', 'basen hotelowy zarządzanie'], ru: ['общественный бассейн', 'аквапарк'], en: ['public swimming pool', 'municipal pool', 'aquapark'] },
    excludedBusinessTypes: ['public_pool', 'water_park'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['budowa basenów przydomowych', 'firma budująca baseny ogrodowe', 'basen skimmerowy pod klucz', 'baseny betonowe na zamówienie', 'budowa niecki basenowej']
  },
  {
    categoryId: 'sauna_manufacturer',
    labels: { pl: 'Sauny - produkcja i montaż', ru: 'Сауны', en: 'Sauna manufacturers' },
    aliases: ['budowa saun', 'producent saun', 'sauna manufacturer'],
    positiveKeywords: { pl: ['produkcja saun', 'budowa saun ogrodowych', 'montaż sauny', 'sauny na wymiar', 'sauny fińskie producent', 'sauny beczki ogrodowe', 'sauny do domu'], ru: ['производство саун', 'строительство бань', 'сауна на заказ'], en: ['sauna manufacturer', 'sauna construction', 'custom sauna builder'] },
    negativeKeywords: { pl: ['salon spa publiczny', 'sauna miejska basen', 'siłownia z sauną'], ru: ['общественная сауна', 'спа-салон'], en: ['public spa', 'gym sauna facility'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['producent saun na wymiar', 'budowa saun ogrodowych', 'montaż sauny fińskiej', 'sauny do ogrodu producent', 'sauny beczkowe na zamówienie']
  },
  {
    categoryId: 'terrace_construction',
    labels: { pl: 'Tarasy - budowa', ru: 'Террасы', en: 'Terrace construction' },
    aliases: ['budowa tarasów', 'tarasy drewniane', 'terrace builder'],
    positiveKeywords: { pl: ['budowa tarasów', 'tarasy drewniane', 'tarasy kompozytowe', 'montaż desek tarasowych', 'zadaszenia tarasów', 'tarasy ogrodowe pod klucz'], ru: ['строительство террас', 'террасная доска монтаж', 'терраса под ключ'], en: ['terrace construction', 'deck building', 'composite decking installation'] },
    negativeKeywords: { pl: ['taras restauracyjny wyposażenie', 'meble tarasowe sklep'], ru: [], en: [] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['budowa tarasów drewnianych', 'montaż tarasów kompozytowych', 'firma budująca tarasy ogrodowe', 'zadaszenia i tarasy na zamówienie', 'tarasy przy domu pod klucz']
  },
  {
    categoryId: 'paving_stones',
    labels: { pl: 'Kostka brukowa - układanie', ru: 'Брусчатка', en: 'Paving stones' },
    aliases: ['brukarstwo', 'układanie kostki brukowej', 'paving contractor'],
    positiveKeywords: { pl: ['układanie kostki brukowej', 'brukarstwo', 'firma brukarska', 'kostka brukowa podjazdy', 'brukowanie działki', 'układanie płyt tarasowych brukarz'], ru: ['укладка брусчатки', 'мощение', 'брусчатка для двора'], en: ['paving stone installation', 'driveway paving', 'block paving contractor'] },
    negativeKeywords: { pl: ['hurtownia kostki brukowej sprzedaż', 'producent kostki brukowej'], ru: ['продажа брусчатки оптом'], en: ['paving stone wholesaler'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['firma brukarska układanie kostki', 'brukowanie podjazdów i tarasów', 'układanie kostki brukowej działka', 'brukarz kompleksowe usługi', 'kostka brukowa montaż ogród']
  },
  {
    categoryId: 'fencing_company',
    labels: { pl: 'Ogrodzenia', ru: 'Заборы', en: 'Fencing companies' },
    aliases: ['montaż ogrodzeń', 'firma ogrodzeniowa', 'fencing contractor'],
    positiveKeywords: { pl: ['montaż ogrodzeń', 'firma ogrodzeniowa', 'ogrodzenia panelowe', 'ogrodzenia kute', 'bramy i ogrodzenia', 'ogrodzenia posesji', 'producent ogrodzeń na zamówienie'], ru: ['установка заборов', 'изготовление ограждений', 'заборы на заказ'], en: ['fence installation', 'fencing company', 'custom fencing'] },
    negativeKeywords: { pl: ['ogrodzenia tymczasowe budowlane wynajem', 'siatka ogrodzeniowa hurt sklep'], ru: ['аренда временных заборов'], en: ['temporary fence rental'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['montaż ogrodzeń posesji', 'firma ogrodzeniowa panele i brama', 'ogrodzenia kute na zamówienie', 'producent ogrodzeń metalowych', 'bramy wjazdowe i ogrodzenia']
  },
  {
    categoryId: 'outdoor_lighting',
    labels: { pl: 'Oświetlenie terenów zewnętrznych', ru: 'Освещение участков', en: 'Outdoor lighting' },
    aliases: ['oświetlenie ogrodowe', 'iluminacja terenu', 'landscape lighting'],
    positiveKeywords: { pl: ['oświetlenie ogrodowe', 'oświetlenie terenów zewnętrznych', 'iluminacja ogrodu', 'montaż oświetlenia elewacji', 'oświetlenie architektury krajobrazu', 'lampy solarne montaż ogród'], ru: ['освещение участка', 'ландшафтное освещение', 'подсветка сада'], en: ['outdoor lighting', 'landscape lighting', 'garden lighting installation'] },
    negativeKeywords: { pl: ['oświetlenie uliczne miejskie przetarg', 'sklep z lampami'], ru: ['уличное освещение муниципальное'], en: ['municipal street lighting', 'lighting retail store'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['montaż oświetlenia ogrodowego', 'iluminacja terenu posesji', 'oświetlenie elewacji i ogrodu', 'projekt oświetlenia krajobrazu', 'oświetlenie ścieżek i tarasu']
  },
  {
    categoryId: 'mechanical_engineering',
    labels: { pl: 'Budowa maszyn', ru: 'Машиностроение', en: 'Mechanical engineering' },
    aliases: ['konstrukcje maszyn', 'przemysł maszynowy', 'machine building'],
    positiveKeywords: { pl: ['budowa maszyn', 'konstruowanie maszyn przemysłowych', 'projektowanie maszyn', 'producent maszyn na zamówienie', 'maszyny specjalistyczne', 'inżynieria mechaniczna przemysłowa'], ru: ['машиностроение', 'производство машин на заказ', 'проектирование промышленных машин'], en: ['mechanical engineering', 'custom machine building', 'industrial machinery manufacturer'] },
    negativeKeywords: { pl: ['serwis maszyn rolniczych mały warsztat', 'sklep z narzędziami', 'wypożyczalnia sprzętu budowlanego'], ru: ['ремонт бытовой техники'], en: ['tool retail shop', 'equipment rental'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['budowa maszyn przemysłowych na zamówienie', 'producent maszyn specjalistycznych', 'projektowanie i konstrukcja maszyn', 'inżynieria mechaniczna dla przemysłu', 'maszyny na zamówienie dla fabryk']
  },
  {
    categoryId: 'metalworking',
    labels: { pl: 'Obróbka metali', ru: 'Металлообработка', en: 'Metalworking' },
    aliases: ['obróbka metalu', 'usługi ślusarskie przemysłowe', 'metal fabrication'],
    positiveKeywords: { pl: ['obróbka metali', 'obróbka skrawaniem', 'toczenie i frezowanie', 'usługi ślusarskie przemysłowe', 'produkcja elementów metalowych', 'gięcie blach', 'konstrukcje stalowe na zamówienie'], ru: ['металлообработка', 'токарные и фрезерные работы', 'изготовление металлоконструкций'], en: ['metalworking', 'metal fabrication', 'CNC turning and milling', 'steel structures'] },
    negativeKeywords: { pl: ['kowalstwo artystyczne hobby', 'ślusarz kluczy usługi domowe'], ru: ['художественная ковка хобби'], en: ['hobby blacksmithing', 'locksmith residential'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['firma zajmująca się obróbką metali', 'usługi toczenia i frezowania metalu', 'produkcja elementów metalowych na zamówienie', 'gięcie i cięcie blach przemysłowe', 'konstrukcje stalowe producent']
  },
  {
    categoryId: 'laser_cutting',
    labels: { pl: 'Cięcie laserowe', ru: 'Лазерная резка', en: 'Laser cutting' },
    aliases: ['wycinanie laserowe', 'usługi cięcia laserem', 'laser cutting service'],
    positiveKeywords: { pl: ['cięcie laserowe metalu', 'wycinanie laserowe blach', 'usługi cięcia laserem przemysłowe', 'laser fiber cięcie', 'cięcie laserowe na zamówienie', 'grawerowanie i cięcie laserowe'], ru: ['лазерная резка металла', 'услуги лазерной резки', 'резка листового металла лазером'], en: ['laser cutting service', 'metal laser cutting', 'industrial laser cutting'] },
    negativeKeywords: { pl: ['grawerowanie pamiątek hobby', 'makerspace amatorski', 'plotter laserowy domowy'], ru: ['хобби гравировка', 'домашний лазерный станок'], en: ['hobbyist laser engraving', 'makerspace', 'desktop laser cutter'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['usługi cięcia laserowego metalu', 'wycinanie laserowe blach na zamówienie', 'firma zajmująca się cięciem laserowym', 'cięcie laserowe stali i aluminium', 'laser przemysłowy usługi produkcyjne']
  },
  {
    categoryId: 'cnc_machining',
    labels: { pl: 'Obróbka CNC', ru: 'Обработка на станках CNC', en: 'CNC machining' },
    aliases: ['frezowanie CNC', 'toczenie CNC', 'CNC machining service'],
    positiveKeywords: { pl: ['obróbka CNC', 'frezowanie CNC', 'toczenie CNC', 'usługi CNC na zamówienie', 'obrabiarki CNC produkcja', 'prototypowanie CNC', 'obróbka mechaniczna precyzyjna'], ru: ['ЧПУ обработка', 'фрезерование с ЧПУ', 'токарные работы ЧПУ'], en: ['CNC machining', 'CNC milling', 'CNC turning service'] },
    negativeKeywords: { pl: ['frezarka domowa hobby', 'makerspace amatorski CNC', 'szkoła programowania CNC kurs'], ru: ['хобби ЧПУ станок'], en: ['hobbyist CNC router', 'makerspace CNC'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['usługi obróbki CNC na zamówienie', 'frezowanie i toczenie CNC', 'firma świadcząca usługi CNC', 'precyzyjna obróbka mechaniczna CNC', 'prototypowanie i produkcja CNC']
  },
  {
    categoryId: 'welding_services',
    labels: { pl: 'Spawalnictwo / usługi spawalnicze', ru: 'Сварка', en: 'Welding services' },
    aliases: ['usługi spawalnicze', 'spawanie konstrukcji', 'welding contractor'],
    positiveKeywords: { pl: ['usługi spawalnicze', 'spawanie konstrukcji stalowych', 'spawanie MIG MAG TIG', 'firma spawalnicza', 'spawanie aluminium przemysłowe', 'produkcja konstrukcji spawanych'], ru: ['сварочные работы', 'сварка металлоконструкций', 'услуги сварщика'], en: ['welding services', 'industrial welding', 'welded steel structures'] },
    negativeKeywords: { pl: ['kurs spawania szkolenie', 'spawanie drobne naprawy domowe'], ru: ['курсы сварки обучение'], en: ['welding training course'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['firma spawalnicza usługi przemysłowe', 'spawanie konstrukcji stalowych na zamówienie', 'usługi spawalnicze MIG MAG TIG', 'produkcja konstrukcji spawanych', 'spawanie aluminium i stali nierdzewnej']
  },
  {
    categoryId: 'robotics_automation',
    labels: { pl: 'Robotyzacja produkcji', ru: 'Роботизация', en: 'Robotics automation' },
    aliases: ['integrator robotów przemysłowych', 'automatyzacja robotyczna', 'robotic integration'],
    positiveKeywords: { pl: ['robotyzacja produkcji', 'integrator robotów przemysłowych', 'wdrażanie robotów w produkcji', 'roboty spawalnicze przemysłowe', 'cele zrobotyzowane', 'automatyzacja linii produkcyjnej robotami'], ru: ['роботизация производства', 'интеграция промышленных роботов', 'внедрение роботов на производстве'], en: ['industrial robotics integration', 'production robotization', 'robotic automation systems'] },
    negativeKeywords: { pl: ['roboty edukacyjne dla dzieci', 'sklep z zabawkami robotycznymi'], ru: ['образовательные роботы для детей'], en: ['educational robotics kits', 'toy robots'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['integrator robotów przemysłowych', 'robotyzacja linii produkcyjnej', 'wdrożenia zrobotyzowane w fabryce', 'firma zajmująca się robotyzacją produkcji', 'automatyzacja produkcji za pomocą robotów']
  },
  {
    categoryId: 'production_automation',
    labels: { pl: 'Automatyzacja produkcji', ru: 'Автоматизация производства', en: 'Production automation' },
    aliases: ['automatyka przemysłowa', 'systemy sterowania produkcją', 'industrial automation'],
    positiveKeywords: { pl: ['automatyzacja produkcji', 'automatyka przemysłowa', 'systemy sterowania PLC', 'integracja systemów SCADA', 'projektowanie linii produkcyjnych', 'modernizacja linii produkcyjnych automatyka'], ru: ['автоматизация производства', 'промышленная автоматика', 'системы управления ПЛК'], en: ['production automation', 'industrial automation', 'PLC control systems'] },
    negativeKeywords: { pl: ['automatyka domowa smart home', 'automatyka bram garażowych'], ru: ['умный дом автоматика'], en: ['smart home automation', 'garage door automation'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['firma zajmująca się automatyzacją produkcji', 'automatyka przemysłowa dla fabryk', 'projektowanie systemów sterowania PLC', 'integracja SCADA w produkcji', 'modernizacja linii produkcyjnych automatyka']
  },
  {
    categoryId: 'solar_power_plants',
    labels: { pl: 'Elektrownie słoneczne / fotowoltaika', ru: 'Солнечные электростанции', en: 'Solar power plants' },
    aliases: ['instalacje fotowoltaiczne', 'farmy fotowoltaiczne', 'solar power plants'],
    positiveKeywords: { pl: ['elektrownie słoneczne', 'instalacje fotowoltaiczne', 'farmy fotowoltaiczne', 'montaż paneli słonecznych przemysłowych', 'fotowoltaika dla biznesu', 'budowa elektrowni fotowoltaicznej'], ru: ['солнечные электростанции', 'фотовольтаические установки', 'солнечные панели для бизнеса'], en: ['solar power plants', 'photovoltaic installations', 'solar farms'] },
    negativeKeywords: { pl: ['panele słoneczne do ogrzewania wody domowe małe', 'sklep z bateriami słonecznymi kalkulator'], ru: ['солнечные батареи для дома розница'], en: ['residential solar panel retail'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['budowa elektrowni fotowoltaicznych', 'firma instalująca panele fotowoltaiczne przemysłowe', 'farmy fotowoltaiczne pod klucz', 'instalacje solarne dla biznesu', 'fotowoltaika komercyjna i przemysłowa']
  },
  {
    categoryId: 'wind_energy',
    labels: { pl: 'Energetyka wiatrowa', ru: 'Ветрогенерация', en: 'Wind energy' },
    aliases: ['elektrownie wiatrowe', 'farmy wiatrowe', 'wind power'],
    positiveKeywords: { pl: ['energetyka wiatrowa', 'elektrownie wiatrowe', 'farmy wiatrowe budowa', 'turbiny wiatrowe montaż', 'projektowanie elektrowni wiatrowych', 'serwis turbin wiatrowych'], ru: ['ветроэнергетика', 'ветряные электростанции', 'ветропарки строительство'], en: ['wind energy', 'wind farms', 'wind turbine installation'] },
    negativeKeywords: { pl: ['małe turbiny wiatrowe hobby', 'wiatraki dekoracyjne ogrodowe'], ru: ['декоративные ветряки для сада'], en: ['decorative garden windmill'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['budowa elektrowni wiatrowych', 'firma zajmująca się energetyką wiatrową', 'montaż i serwis turbin wiatrowych', 'projektowanie farm wiatrowych', 'elektrownie wiatrowe dla przemysłu']
  },
  {
    categoryId: 'ev_charging_stations',
    labels: { pl: 'Stacje ładowania samochodów elektrycznych', ru: 'Зарядные станции для электромобилей', en: 'EV charging stations' },
    aliases: ['ładowarki EV', 'infrastruktura ładowania elektromobilność', 'EV charging'],
    positiveKeywords: { pl: ['stacje ładowania samochodów elektrycznych', 'montaż ładowarek EV', 'infrastruktura ładowania pojazdów elektrycznych', 'wallbox montaż firma', 'ładowarki dla flot elektrycznych', 'punkty ładowania EV instalacja'], ru: ['зарядные станции для электромобилей', 'установка зарядных станций', 'инфраструктура зарядки электромобилей'], en: ['EV charging stations', 'EV charger installation', 'charging infrastructure'] },
    negativeKeywords: { pl: ['sklep z ładowarkami do telefonów', 'ładowarki przenośne akcesoria detal'], ru: ['зарядки для телефонов магазин'], en: ['phone charger retail'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['montaż stacji ładowania samochodów elektrycznych', 'firma instalująca ładowarki EV', 'infrastruktura ładowania dla firm', 'wallboxy montaż dla biznesu', 'punkty ładowania pojazdów elektrycznych instalacja']
  },
  {
    categoryId: 'energy_audit',
    labels: { pl: 'Audyt energetyczny', ru: 'Энергоаудит', en: 'Energy audit' },
    aliases: ['audyt energetyczny budynku', 'audyt efektywności energetycznej', 'energy audit'],
    positiveKeywords: { pl: ['audyt energetyczny', 'audyt efektywności energetycznej przedsiębiorstwa', 'audyt energetyczny budynku', 'świadectwo charakterystyki energetycznej', 'analiza zużycia energii firma', 'certyfikacja energetyczna budynków'], ru: ['энергоаудит', 'аудит энергоэффективности', 'энергетическое обследование'], en: ['energy audit', 'energy efficiency audit', 'energy performance certification'] },
    negativeKeywords: { pl: ['sprzedaż liczników energii sklep', 'kontrola liczników gazowych odczyt'], ru: ['продажа счетчиков магазин'], en: ['energy meter retail'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['firma wykonująca audyty energetyczne', 'audyt efektywności energetycznej przedsiębiorstwa', 'świadectwa charakterystyki energetycznej budynków', 'audyt energetyczny budynków przemysłowych', 'analiza i optymalizacja zużycia energii']
  },
  {
    categoryId: 'energy_service_company',
    labels: { pl: 'Przedsiębiorstwa usług energetycznych (ESCO)', ru: 'Энергосервисные компании', en: 'Energy service companies (ESCO)' },
    aliases: ['ESCO', 'firma ESCO', 'kontrakty efektywności energetycznej', 'energy service company'],
    positiveKeywords: { pl: ['przedsiębiorstwo usług energetycznych', 'firma ESCO', 'kontrakty efektywności energetycznej', 'finansowanie modernizacji energetycznej', 'usługi energetyczne dla przemysłu', 'zarządzanie energią w przedsiębiorstwie'], ru: ['энергосервисная компания', 'ЭСКО', 'энергосервисный контракт'], en: ['energy service company', 'ESCO', 'energy performance contracting'] },
    negativeKeywords: { pl: ['dostawca prądu sprzedawca energii', 'zakład energetyczny dystrybucja'], ru: ['поставщик электроэнергии сбыт'], en: ['electricity retailer', 'utility distribution company'] },
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['firma ESCO usługi energetyczne', 'kontrakty efektywności energetycznej dla firm', 'przedsiębiorstwo usług energetycznych', 'modernizacja energetyczna finansowanie ESCO', 'zarządzanie energią w przedsiębiorstwie usługi']
  },
  {
    categoryId: 'office_building_construction',
    labels: { pl: 'Budowa biurowców', ru: 'Строительство офисных зданий', en: 'Office building construction' },
    aliases: ['budowa biurowców', 'budownictwo biurowe', 'generalny wykonawca biurowców'],
    positiveKeywords: { pl: ['budowa biurowców', 'budowa centrów biurowych', 'generalny wykonawca biurowca', 'budowa biurowca klasy A', 'wykonawca budynków biurowych', 'realizacja biurowca pod klucz', 'budowa parku biurowego'], ru: ['строительство офисных зданий', 'строительство бизнес-центров', 'генподрядчик офисного здания'], en: ['office building construction', 'office tower construction', 'business center construction'] },
    negativeKeywords: { pl: ['wynajem powierzchni biurowych', 'sprzedaż biura', 'pośrednictwo nieruchomości biurowych'], ru: ['аренда офисов'], en: ['office space rental', 'office leasing agency'] },
    excludedBusinessTypes: ['real_estate_agency', 'office_leasing_agency'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa biurowca generalny wykonawca', 'wykonawca budynków biurowych', 'budowa centrum biurowego pod klucz', 'realizacja biurowca klasy A', 'generalny wykonawca parku biurowego']
  },
  {
    categoryId: 'public_building_construction',
    labels: { pl: 'Budowa obiektów użyteczności publicznej', ru: 'Строительство общественных зданий', en: 'Public building construction' },
    aliases: ['budowa obiektów publicznych', 'budowa obiektów użyteczności publicznej', 'wykonawca obiektów publicznych'],
    positiveKeywords: { pl: ['budowa obiektów użyteczności publicznej', 'budowa szkół i przedszkoli', 'budowa szpitali', 'wykonawca budynków użyteczności publicznej', 'budowa urzędów', 'realizacja inwestycji publicznych', 'generalny wykonawca obiektów publicznych'], ru: ['строительство общественных зданий', 'строительство школ и больниц', 'генподрядчик общественных объектов'], en: ['public building construction', 'school and hospital construction', 'government building contractor'] },
    negativeKeywords: { pl: ['przetargi publiczne doradztwo', 'zamówienia publiczne konsulting'], ru: ['консалтинг госзакупок'], en: ['public procurement consulting'] },
    excludedBusinessTypes: ['consulting_firm', 'government_office'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['budowa obiektów użyteczności publicznej wykonawca', 'generalny wykonawca szkół i szpitali', 'budowa urzędu przetarg', 'wykonawca inwestycji publicznych', 'budowa obiektu publicznego pod klucz']
  },
  {
    categoryId: 'office_fitout',
    labels: { pl: 'Fit-out i wykończenia biur', ru: 'Фит-аут и отделка офисов', en: 'Office fit-out' },
    aliases: ['fit-out', 'fit out biur', 'wykończenie biur pod klucz', 'workplace design'],
    positiveKeywords: { pl: ['fit-out biur', 'wykończenie biur pod klucz', 'aranżacja przestrzeni biurowej', 'projektowanie miejsc pracy', 'adaptacja powierzchni biurowej', 'wykonawca fit-out', 'zabudowa biur', 'workplace design'], ru: ['фит-аут офисов', 'отделка офисов под ключ', 'дизайн рабочего пространства'], en: ['office fit-out', 'workplace design', 'office interior build-out', 'turnkey office fit-out'] },
    negativeKeywords: { pl: ['projektowanie wnętrz mieszkań', 'aranżacja wnętrz domowych'], ru: ['дизайн квартир'], en: ['residential interior design'] },
    excludedBusinessTypes: ['residential_interior_design'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'portfolio realizacji'],
    searchTemplates: ['fit-out biur wykonawca', 'wykończenie biur pod klucz firma', 'aranżacja przestrzeni biurowej', 'projektowanie miejsc pracy workplace design', 'zabudowa i adaptacja biur']
  },
  {
    categoryId: 'container_manufacturer',
    labels: { pl: 'Producenci kontenerów', ru: 'Производители контейнеров', en: 'Container manufacturers' },
    aliases: ['producenci kontenerów', 'kontenery na zamówienie', 'container manufacturers'],
    positiveKeywords: { pl: ['producent kontenerów', 'kontenery biurowe produkcja', 'kontenery magazynowe produkcja', 'kontenery budowlane socjalne producent', 'kontenery na zamówienie', 'zabudowa kontenerowa producent', 'kontenery modułowe przemysłowe'], ru: ['производитель контейнеров', 'производство бытовок', 'модульные контейнеры производство'], en: ['container manufacturer', 'site container producer', 'modular container fabrication'] },
    negativeKeywords: { pl: ['domy modułowe całoroczne', 'domy z kontenerów mieszkalne'], ru: ['модульные дома'], en: ['modular homes'] },
    excludedBusinessTypes: ['modular_home_manufacturer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['producent kontenerów budowlanych', 'kontenery biurowe na zamówienie', 'kontenery magazynowe producent', 'zabudowa kontenerowa firma', 'kontenery socjalne produkcja']
  },
  {
    categoryId: 'forklift_sales',
    labels: { pl: 'Sprzedaż wózków widłowych', ru: 'Продажа вилочных погрузчиков', en: 'Forklift sales' },
    aliases: ['sprzedaż wózków widłowych', 'wózki widłowe dealer', 'forklift sales'],
    positiveKeywords: { pl: ['sprzedaż wózków widłowych', 'wózki widłowe używane', 'wózki widłowe magazynowe', 'dealer wózków widłowych', 'wózki widłowe elektryczne sprzedaż', 'wózki wysokiego składowania', 'wynajem wózków widłowych'], ru: ['продажа вилочных погрузчиков', 'вилочные погрузчики б/у', 'дилер погрузчиков'], en: ['forklift sales', 'forklift dealer', 'used forklifts'] },
    negativeKeywords: { pl: ['ładowarki teleskopowe', 'ładowarki kołowe budowlane'], ru: ['телескопические погрузчики'], en: ['telehandler sales'] },
    excludedBusinessTypes: ['construction_loader_dealer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['sprzedaż wózków widłowych', 'dealer wózków widłowych Polska', 'wózki widłowe używane sprzedaż', 'wynajem i sprzedaż wózków widłowych', 'wózki widłowe elektryczne cena']
  },
  {
    categoryId: 'aerial_platform_sales',
    labels: { pl: 'Sprzedaż i wynajem podnośników', ru: 'Продажа и аренда подъёмников', en: 'Aerial work platform sales & rental' },
    aliases: ['podnośniki koszowe', 'wynajem podnośników', 'aerial platform sales'],
    positiveKeywords: { pl: ['sprzedaż podnośników koszowych', 'wynajem podnośników nożycowych', 'podnośniki teleskopowe sprzedaż', 'platformy robocze wynajem', 'podesty ruchome przejezdne', 'dealer podnośników', 'podnośniki montażowe wynajem'], ru: ['продажа автовышек', 'аренда подъёмников', 'ножничные подъёмники'], en: ['aerial platform sales', 'boom lift rental', 'scissor lift rental'] },
    negativeKeywords: { pl: ['wynajem rusztowań elewacyjnych', 'drabiny sklep'], ru: ['аренда лесов'], en: ['scaffolding rental'] },
    excludedBusinessTypes: ['scaffolding_rental'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['wynajem podnośników koszowych', 'sprzedaż podnośników teleskopowych', 'dealer podnośników nożycowych', 'wynajem platform roboczych', 'podnośniki montażowe wypożyczalnia']
  },
  {
    categoryId: 'demolition_equipment_sales',
    labels: { pl: 'Sprzęt wyburzeniowy - sprzedaż i wynajem', ru: 'Продажа и аренда оборудования для сноса', en: 'Demolition equipment sales & rental' },
    aliases: ['sprzęt wyburzeniowy', 'młoty hydrauliczne sprzedaż', 'demolition equipment'],
    positiveKeywords: { pl: ['sprzęt wyburzeniowy sprzedaż', 'młoty hydrauliczne do koparek', 'nożyce do rozbiórki', 'kruszarki do gruzu sprzedaż', 'chwytaki wyburzeniowe', 'osprzęt wyburzeniowy koparki', 'wynajem sprzętu wyburzeniowego'], ru: ['оборудование для сноса продажа', 'гидромолоты для экскаваторов', 'ножницы для сноса'], en: ['demolition equipment sales', 'hydraulic breaker', 'demolition attachments'] },
    negativeKeywords: { pl: ['firma rozbiórkowa usługi', 'wyburzenia budynków wykonawca'], ru: ['снос зданий услуги'], en: ['demolition contractor services'] },
    excludedBusinessTypes: ['demolition_contractor'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['sprzedaż młotów hydraulicznych do koparek', 'osprzęt wyburzeniowy sprzedaż', 'nożyce do rozbiórki sprzedaż', 'kruszarki do gruzu dealer', 'wynajem sprzętu wyburzeniowego']
  },
  {
    categoryId: 'oversized_transport',
    labels: { pl: 'Transport ponadgabarytowy', ru: 'Негабаритные перевозки', en: 'Oversized cargo transport' },
    aliases: ['transport ponadgabarytowy', 'przewóz ładunków ponadnormatywnych', 'oversized transport'],
    positiveKeywords: { pl: ['transport ponadgabarytowy', 'przewóz ładunków ponadnormatywnych', 'transport maszyn budowlanych', 'transport elementów wielkogabarytowych', 'pilotaż transportu ponadgabarytowego', 'zezwolenia na przejazd nienormatywny', 'transport konstrukcji stalowych'], ru: ['негабаритные перевозки', 'перевозка крупногабаритных грузов', 'транспортировка спецтехники'], en: ['oversized cargo transport', 'heavy haulage', 'abnormal load transport'] },
    negativeKeywords: { pl: ['przewóz osób', 'kurier paczki', 'transport międzynarodowy towarów standardowych'], ru: ['пассажирские перевозки'], en: ['parcel courier'] },
    excludedBusinessTypes: ['courier_service', 'passenger_transport'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['transport ponadgabarytowy firma', 'przewóz ładunków ponadnormatywnych', 'transport maszyn budowlanych ciężki', 'pilotaż i zezwolenia transport nienormatywny', 'firma transportu wielkogabarytowego']
  },
  {
    categoryId: 'energy_storage_systems',
    labels: { pl: 'Magazyny energii', ru: 'Системы накопления энергии', en: 'Energy storage systems' },
    aliases: ['magazyny energii', 'baterie magazynujące energię', 'energy storage systems'],
    positiveKeywords: { pl: ['magazyny energii', 'magazynowanie energii dla firm', 'systemy magazynowania energii', 'baterie do fotowoltaiki', 'magazyn energii przemysłowy', 'montaż magazynów energii', 'akumulatory energii słonecznej'], ru: ['системы накопления энергии', 'аккумуляторы для солнечных панелей', 'промышленные накопители энергии'], en: ['energy storage system', 'battery energy storage', 'solar battery storage'] },
    negativeKeywords: { pl: ['fotowoltaika montaż paneli', 'elektrownia słoneczna budowa'], ru: ['монтаж солнечных панелей'], en: ['solar panel installation'] },
    excludedBusinessTypes: ['solar_installer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['magazyny energii dla firm', 'systemy magazynowania energii przemysłowe', 'montaż magazynu energii z fotowoltaiką', 'baterie magazynujące energię sprzedaż', 'magazyn energii dla biznesu']
  },
  {
    categoryId: 'serviced_apartment_operator',
    labels: { pl: 'Operatorzy apartamentów', ru: 'Операторы апарт-отелей', en: 'Serviced apartment operators' },
    aliases: ['operator apartamentów', 'apartamenty serwisowane', 'serviced apartment operator', 'aparthotel'],
    positiveKeywords: { pl: ['operator apartamentów', 'apartamenty serwisowane', 'zarządzanie najmem apartamentów', 'aparthotel', 'apartamenty na wynajem krótkoterminowy zarządzanie', 'condohotel operator', 'najem instytucjonalny apartamentów'], ru: ['оператор апарт-отелей', 'сервисные апартаменты', 'управление арендой апартаментов'], en: ['serviced apartment operator', 'aparthotel operator', 'short-term rental management'] },
    negativeKeywords: { pl: ['hotel klasyczny rezerwacja', 'agencja nieruchomości sprzedaż mieszkań'], ru: ['продажа квартир'], en: ['classic hotel booking'] },
    excludedBusinessTypes: ['real_estate_agency', 'traditional_hotel'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'formularz ofertowy'],
    searchTemplates: ['operator apartamentów serwisowanych', 'zarządzanie najmem krótkoterminowym apartamentów', 'aparthotel operator Warszawa', 'condohotel zarządzanie najmem', 'apartamenty serwisowane dla firm']
  },
  {
    categoryId: 'winter_garden_pergola',
    labels: { pl: 'Ogrody zimowe i pergole', ru: 'Зимние сады и перголы', en: 'Winter gardens and pergolas' },
    aliases: ['ogrody zimowe', 'pergole aluminiowe', 'winter gardens', 'pergolas'],
    positiveKeywords: { pl: ['ogrody zimowe producent', 'zabudowa ogrodu zimowego', 'pergole aluminiowe produkcja', 'pergole tarasowe montaż', 'werandy szklane producent', 'zadaszenia tarasów aluminiowe', 'konstrukcje szklane ogrodowe'], ru: ['зимние сады производство', 'перголы алюминиевые', 'веранды застекленные'], en: ['winter garden manufacturer', 'aluminum pergola', 'glass veranda'] },
    negativeKeywords: { pl: ['wiaty garażowe producent', 'altany drewniane ogrodowe'], ru: ['деревянные беседки'], en: ['garden gazebo'] },
    excludedBusinessTypes: ['garden_gazebo_manufacturer'],
    relatedServices: ['strona usługowa', 'Google Business Profile', 'Google Ads B2B', 'katalog produktów'],
    searchTemplates: ['ogrody zimowe producent', 'pergole aluminiowe na taras', 'zabudowa ogrodu zimowego cena', 'werandy szklane montaż', 'pergole tarasowe producent']
  }
];

function normalizePresetKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Keep Latin (after diacritic-stripping) and Cyrillic letters - a plain
    // [^a-z] filter used to silently drop Cyrillic entirely, so country
    // presets keyed by their Cyrillic name (e.g. "\u0423\u043a\u0440\u0430\u0438\u043d\u0430") could never match.
    .replace(/[^a-z\u0400-\u04ff]/g, '');
}

function getCityPreset(city) {
  return CITY_PRESETS[normalizePresetKey(city)] || null;
}

function getCountryPreset(country) {
  return COUNTRY_PRESETS[normalizePresetKey(country)] || null;
}

// CEIDG is the Polish sole-trader registry API - calling it for a Ukraine
// search just wastes a request/returns nothing useful, so every CEIDG call
// site is gated on this instead of firing regardless of country.
function isPolandDiscoveryRegion(city) {
  const cityPreset = getCityPreset(city);
  const countryPreset = getCountryPreset(getDiscoveryContext().country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
  const regionCode = cityPreset?.regionCode || countryPreset?.regionCode || 'PL';
  return regionCode !== 'UA';
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
  score = clamp(Math.round(score), 0, 100);

  // "Maximum reach" mode: only very clearly negative-signal companies should
  // be classified as a mismatch. Lack of an explicit positive keyword match is
  // no longer treated as strong evidence of a wrong category on its own.
  const categoryMatch = score >= 70 ? 'match' : score >= 25 ? 'partial' : 'mismatch';
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
    if (strictNiche && relevance.categoryMatch === 'mismatch' && relevance.categoryRelevanceScore < 25) {
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

// Wider than requireWorkerLeadAccess: covers the case where a worker's own
// saved company/comments/CRM status must stay reachable even after the lead
// has been returned to the pool (assigned_worker_id cleared) or reassigned to
// someone else - a pool return must never lock the original worker out of
// their own notes and folder on that company. Used by comments/crm-status/
// lead-detail read-and-write endpoints instead of the stricter ownership
// check that pool-return actions use.
function requireWorkerCompanyRelation(req, res, company) {
  if (isAdminAuthorized(req)) return true;
  if (!company || company.status === 'deleted' || company.pool_state === 'deleted') {
    res.status(404).json({ error: 'Lead not found.' });
    return false;
  }
  const workerId = requestWorkerId(req);
  if (!workerId) {
    res.status(401).json({ error: 'Worker identity is required.' });
    return false;
  }
  const isCurrentOwner = assignedWorkerId(company) === workerId;
  const hasSaved = store.isCompanySavedByWorker(workerId, company.id);
  const hasCrmHistory = store.normalizeWorkerId(company.crm_status_updated_by || '') === workerId;
  if (!isCurrentOwner && !hasSaved && !hasCrmHistory) {
    res.status(403).json({ error: 'This lead belongs to another worker.' });
    return false;
  }
  return true;
}

function requireWorkerRunAccess(req, res, run) {
  if (isAdminAuthorized(req)) return true;
  if (!run) {
    res.status(404).json({ error: 'Run not found.' });
    return false;
  }
  const workerId = requestWorkerId(req);
  if (!workerId) {
    res.status(401).json({ error: 'Worker identity is required.' });
    return false;
  }
  if (store.normalizeWorkerId(run.worker_id || '') !== workerId) {
    res.status(403).json({ error: 'This parser query belongs to another worker.' });
    return false;
  }
  return true;
}

// Resolves who is actually performing an action, for audit logs and comment/
// status authorship. Never trusts a client-supplied identity for the worker
// case - only an admin (verified via requireAdmin/isAdminAuthorized) may act
// as a different actor by supplying an explicit id.
function resolveActor(req) {
  if (isAdminAuthorized(req)) {
    return { actorRole: 'admin', actorId: req.adminId || ADMIN_LOGIN, workerId: requestWorkerId(req) };
  }
  const workerId = requestWorkerId(req);
  return { actorRole: 'worker', actorId: workerId, workerId };
}

// Ownership gate for the /api/saved, /api/companies/:id/comments etc. family:
// a worker may only ever act on their own resources; an admin may act on
// behalf of any worker by passing an explicit workerId.
function requireActingWorkerId(req, res) {
  const { workerId } = resolveActor(req);
  if (!workerId) {
    res.status(401).json({ error: 'Worker identity is required.' });
    return '';
  }
  return workerId;
}

// Applies search/status/website/category filters and pagination to an
// in-memory list of serialized company records. Shared by the run-detail and
// admin-run-detail endpoints so opening a saved query never has to load the
// whole database - only this run's own companies are ever in scope.
function paginateCompanyList(records, query = {}, { savedByWorkerId = '' } = {}) {
  const q = String(query.q || '').trim().toLowerCase();
  const status = String(query.status || '').trim();
  const hasWebsite = String(query.hasWebsite || 'all').trim().toLowerCase();
  const category = String(query.category || '').trim().toLowerCase();
  const savedOnly = String(query.savedOnly || '') === 'true';
  const sort = String(query.sort || 'newest').trim().toLowerCase();
  const includeHidden = String(query.includeHidden || '') === 'true';

  let rows = records;
  if (!includeHidden) rows = rows.filter((record) => record.hidden_from_lists !== true);
  if (status) rows = rows.filter((record) => record.status === status);
  if (hasWebsite === 'yes') rows = rows.filter((record) => Boolean(String(record.data?.website_url || '').trim()));
  if (hasWebsite === 'no') rows = rows.filter((record) => !String(record.data?.website_url || '').trim());
  if (category) rows = rows.filter((record) => String(record.data?.niche || '').toLowerCase().includes(category));
  if (savedOnly && savedByWorkerId) {
    rows = rows.filter((record) => store.isCompanySavedByWorker(savedByWorkerId, record.id));
  }
  if (q) {
    rows = rows.filter((record) =>
      [record.data?.company, record.data?.legal_name, record.data?.phone, record.data?.email, record.data?.city, record.data?.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  rows = [...rows].sort((a, b) => {
    if (sort === 'name') return String(a.data?.company || '').localeCompare(String(b.data?.company || ''));
    if (sort === 'status') return String(a.status || '').localeCompare(String(b.status || ''));
    if (sort === 'oldest') return String(a.first_seen_at || '').localeCompare(String(b.first_seen_at || ''));
    return String(b.last_seen_at || b.first_seen_at || '').localeCompare(String(a.last_seen_at || a.first_seen_at || ''));
  });

  const total = rows.length;
  const hasPagination = query.page !== undefined || query.pageSize !== undefined;
  if (!hasPagination) return { items: rows, total, page: 1, pageSize: total, paginated: false };

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.max(1, Math.min(500, Number.parseInt(query.pageSize, 10) || 50));
  const start = (page - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), total, page, pageSize, paginated: true };
}

// Per-discovery-job context (country/city/radiusKm) read by the Google Places /
// Amazon Location / phone-normalization helpers deep in the discovery call
// graph. This used to be a single mutable module-level object that every
// concurrent discovery job (and even the HTTP route handler's own `finally`
// block) wrote to and reset - which meant two jobs running at the same time
// (e.g. one for Warszawa, one for Kraków) could clobber each other's
// city/country/radius mid-request, and the route handler could even wipe the
// context of a job it had just fired off in the background before that job's
// first await ran. AsyncLocalStorage gives every discovery job (and every
// nested async call it makes, including cross-source enrichment) its own
// isolated context automatically, with no shared mutable state and no manual
// reset/cleanup required.
const discoveryContextStorage = new AsyncLocalStorage();
function getDiscoveryContext() {
  return discoveryContextStorage.getStore() || { country: '', radiusKm: 0, city: '' };
}

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
      workerId: meta.workerId || 'worker-default',
      siteStatus: meta.siteStatus || 'all',
      minScore: meta.minScore || 0,
      hasSocial: Boolean(meta.hasSocial),
      hasPhone: Boolean(meta.hasPhone),
      hasEmail: Boolean(meta.hasEmail),
      useAi: Boolean(meta.useAi),
      useWebSearch: Boolean(meta.useWebSearch)
    },
    progress: {
      message: 'Ожидание запуска...',
      currentNiche: '',
      currentSource: '',
      foundCount: 0,
      analyzedCount: 0,
      analysisTarget: 0,
      processedNiches: 0,
      totalNiches: Array.isArray(meta.niches) ? meta.niches.length : 0
    },
    partialCompanies: [],
    warnings: [],
    queries: [],
    result: null,
    error: '',
    // Set by runDiscoveryJob once discovery starts; the cancel endpoint flips
    // guard.stopped on this same object so the running discovery loop (which
    // only checks between HTTP calls, not mid-request) notices and unwinds.
    guard: null
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
  if (patch.analyzedCompanies) {
    // Already-analyzed analyzeLead()-shaped results ({id, input,
    // websiteResolution, analysis, ...}), already deduped upstream via
    // store.claimCompaniesForRun (one record per company id). Must NOT go
    // through normalizeItems()/uniqueCompanies() above - those expect flat
    // raw company records (item.company/item.niche/...) and silently drop
    // anything else (empty dedup key), which previously made a fully
    // analyzed, non-empty batch show up as 0 companies in the job.
    job.partialCompanies = patch.analyzedCompanies.slice(0, job.meta.limit || MAX_DISCOVERY_ITEMS);
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
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: OPENAI_TIMEOUT_MS, maxRetries: 2 })
  : null;

// AI roleplay training personas. Behavior prompt stays Polish-only (matches the
// rest of the Academy deep content); label is what the worker sees in the picker.
// serviceId ties a persona to a specific catalog service (public/site/data/services.js)
// so trainees can practice a client type relevant to the service they're studying;
// null means the persona is generic / not tied to one service.
// difficulty: 'easy' | 'medium' | 'hard' — how much the persona resists before opening up.
// readiness: 'cold' | 'warm' | 'hot' — how close the persona already is to booking a meeting.
const AI_TRAINING_PERSONAS = [
  { id: 'busy_owner', label: { pl: 'Zajęty właściciel', ru: 'Занятый владелец' }, serviceId: null, difficulty: 'easy', readiness: 'cold', prompt: 'Jesteś zapracowanym właścicielem małej firmy. Masz mało czasu, mówisz krótko, chcesz szybko zakończyć rozmowę, ale nie jesteś wrogi.' },
  { id: 'angry_owner', label: { pl: 'Zły właściciel', ru: 'Злой владелец' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Jesteś rozdrażnionym właścicielem firmy, dostajesz dużo telefonów sprzedażowych i jesteś poirytowany. Mówisz szorstko, ale worker może cię udobruchać dobrym podejściem.' },
  { id: 'skeptic', label: { pl: 'Sceptyk', ru: 'Скептик' }, serviceId: null, difficulty: 'medium', readiness: 'cold', prompt: 'Jesteś nieufny wobec telefonicznych ofert, wątpisz w wartość usługi, zadajesz dużo pytań kontrolnych zanim uwierzysz w cokolwiek.' },
  { id: 'no_website', label: { pl: 'Klient bez strony', ru: 'Клиент без сайта' }, serviceId: 'websites', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz firmę, nie masz własnej strony internetowej, korzystasz tylko z Facebooka. Jesteś otwarty na rozmowę o stronie, jeśli worker dobrze wyjaśni korzyść.' },
  { id: 'old_website', label: { pl: 'Klient ze starą stroną', ru: 'Клиент со старым сайтом' }, serviceId: 'websites', difficulty: 'medium', readiness: 'cold', prompt: 'Masz stronę internetową sprzed kilku lat, uważasz że działa wystarczająco dobrze, trzeba cię przekonać, że warto ją odświeżyć.' },
  { id: 'good_website', label: { pl: 'Klient z dobrą stroną', ru: 'Клиент с хорошим сайтом' }, serviceId: 'websites', difficulty: 'hard', readiness: 'cold', prompt: 'Masz nowoczesną, dobrze działającą stronę internetową i jesteś z niej zadowolony. Trudno cię zainteresować, chyba że worker zaproponuje coś poza samą stroną (reklama, automatyzacje, CRM).' },
  { id: 'send_offer', label: { pl: 'Klient mówi "wyślij ofertę"', ru: 'Клиент говорит: "пришлите предложение"' }, serviceId: null, difficulty: 'medium', readiness: 'cold', prompt: 'Od razu, na początku rozmowy, prosisz aby przesłać ofertę mailem i się rozłączyć. Worker musi cię zatrzymać na rozmowie zanim się zgodzisz.' },
  { id: 'asks_price', label: { pl: 'Klient od razu pyta o cenę', ru: 'Клиент сразу спрашивает цену' }, serviceId: null, difficulty: 'medium', readiness: 'warm', prompt: 'Zanim worker cokolwiek wyjaśni, pytasz "ile to kosztuje?". Naciskasz na konkretną kwotę, worker powinien podać widełki i przejść do umówienia spotkania zamiast obiecywać dokładną cenę.' },
  { id: 'no_marketing', label: { pl: 'Klient nie rozumie marketingu', ru: 'Клиент не понимает маркетинг' }, serviceId: null, difficulty: 'easy', readiness: 'cold', prompt: 'Nie rozumiesz pojęć typu SEO, kampanie, lejki sprzedażowe. Worker musi tłumaczyć bardzo prostymi słowami, bez żargonu.' },
  { id: 'has_agency', label: { pl: 'Klient ma już agencję', ru: 'У клиента уже есть агентство' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Współpracujesz już z inną agencją marketingową i jesteś względnie zadowolony. Trzeba dobrego argumentu, żeby w ogóle zgodzić się na rozmowę.' },
  { id: 'interested_website', label: { pl: 'Klient zainteresowany stroną', ru: 'Клиент заинтересован в сайте' }, serviceId: 'websites', difficulty: 'easy', readiness: 'hot', prompt: 'Jesteś realnie zainteresowany nową stroną internetową, zadajesz konkretne pytania o proces i cenę, łatwo cię przekonać do spotkania.' },
  { id: 'interested_ads', label: { pl: 'Klient zainteresowany reklamą', ru: 'Клиент заинтересован в рекламе' }, serviceId: 'googleads', difficulty: 'easy', readiness: 'hot', prompt: 'Interesuje cię głównie reklama (Google Ads / Meta Ads), pytasz o efekty i koszt kliknięcia, worker powinien skierować rozmowę do spotkania z ekspertem.' },
  { id: 'wants_callback', label: { pl: 'Klient chce, żeby oddzwonić', ru: 'Клиент просит перезвонить' }, serviceId: null, difficulty: 'easy', readiness: 'warm', prompt: 'Jesteś teraz zajęty i prosisz o oddzwonienie później. Worker powinien ustalić konkretny dzień i godzinę, a nie zostawić to open-ended.' },
  { id: 'distrustful', label: { pl: 'Klient nie ufa', ru: 'Клиент не доверяет' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Podejrzewasz, że to oszustwo albo spam, pytasz skąd masz numer, jesteś podejrzliwy przez całą rozmowę, worker musi budować zaufanie krok po kroku.' },
  { id: 'ready_to_meet', label: { pl: 'Klient gotowy na spotkanie', ru: 'Клиент готов на встречу' }, serviceId: null, difficulty: 'easy', readiness: 'hot', prompt: 'Jesteś pozytywnie nastawiony i szybko zgadzasz się na umówienie spotkania/konsultacji, jeśli worker tylko poprawnie poprowadzi rozmowę.' },

  // --- Extended roster: service-specific and character-variety personas ---
  { id: 'ecommerce_migration_fear', label: { pl: 'Sklep boi się migracji z Allegro', ru: 'Магазин боится переезда с Allegro' }, serviceId: 'ecommerce', difficulty: 'medium', readiness: 'warm', prompt: 'Sprzedajesz produkty głównie przez Allegro i Facebook Marketplace. Boisz się, że własny sklep internetowy to duży koszt i ryzyko, że nikt nie wejdzie. Musisz usłyszeć konkretny argument o przewadze własnego kanału sprzedaży, zanim zaczniesz się otwierać.' },
  { id: 'restaurant_booking_resist', label: { pl: 'Restauracja: "rezerwacje telefoniczne zawsze działały"', ru: 'Ресторан: «телефонные брони всегда работали»' }, serviceId: 'booking', difficulty: 'medium', readiness: 'cold', prompt: 'Prowadzisz restaurację. Rezerwacje przyjmujecie telefonicznie od lat i uważasz, że to wystarcza. Jesteś nieco defensywny wobec sugestii, że system rezerwacji online coś zmieni, ale otworzysz się, jeśli worker pokaże konkretny problem (np. zgubione rezerwacje w godzinach szczytu).' },
  { id: 'clinic_reviews_skeptic', label: { pl: 'Klinika stomatologiczna, sceptyczna wobec GBP', ru: 'Стоматологическая клиника, скептически настроена к профилю в Google' }, serviceId: 'gbp', difficulty: 'medium', readiness: 'cold', prompt: 'Prowadzisz małą klinikę stomatologiczną. Masz Google Business Profile, ale nikt się nim nie zajmuje. Wątpisz, czy "wizytówka w Google" naprawdę przekłada się na nowych pacjentów. Potrzebujesz konkretów, nie ogólników.' },
  { id: 'law_firm_formal', label: { pl: 'Kancelaria prawna, formalny ton', ru: 'Юридическая фирма, формальный тон' }, serviceId: 'websites', difficulty: 'medium', readiness: 'cold', prompt: 'Jesteś wspólnikiem małej kancelarii prawnej. Mówisz formalnie, oczekujesz precyzji i konkretów, nie tolerujesz potocznego języka sprzedażowego ani nachalności. Cenisz wiarygodność i referencje.' },
  { id: 'construction_calculator_interested', label: { pl: 'Budowlanka, zainteresowana kalkulatorem wyceny', ru: 'Стройфирма, заинтересована калькулятором стоимости' }, serviceId: 'calculators', difficulty: 'easy', readiness: 'hot', prompt: 'Prowadzisz firmę remontowo-budowlaną. Codziennie dostajesz pytania "ile to będzie kosztować" i tracisz na nie czas. Jesteś od razu zainteresowany pomysłem kalkulatora wyceny na stronie, zadajesz praktyczne pytania o to, jak to działa.' },
  { id: 'beauty_salon_social', label: { pl: 'Salon kosmetyczny, aktywny Instagram', ru: 'Салон красоты, активный Instagram' }, serviceId: 'metaads', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz salon kosmetyczny, masz aktywny, ładny Instagram, ale mało nowych klientek z social mediów. Jesteś otwarta na rozmowę o reklamie na Meta, jeśli worker doceni to, co już masz, zamiast zaczynać od krytyki.' },
  { id: 'auto_workshop_grumpy', label: { pl: 'Warsztat samochodowy, starszy właściciel, "po co mi internet"', ru: 'Автосервис, пожилой владелец, «зачем мне интернет»' }, serviceId: 'gbp', difficulty: 'hard', readiness: 'cold', prompt: 'Prowadzisz warsztat samochodowy od 20 lat, klienci przychodzą z polecenia. Nie widzisz sensu w "internetach", mówisz krótko i szorstko, potrzebujesz bardzo prostego, konkretnego argumentu związanego z pieniędzmi, żeby w ogóle słuchać dalej.' },
  { id: 'gym_crm_chaos', label: { pl: 'Siłownia, chaos w zapisach i karnetach', ru: 'Спортзал, хаос с записями и абонементами' }, serviceId: 'crmauto', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz siłownię/klub fitness. Zapisy na zajęcia i karnety ogarniacie w Excelu i grupie na WhatsApp, robi się chaos. Sfrustrowany, ale nie do końca wiesz, jakie rozwiązanie by pomogło — worker musi to nazwać za ciebie.' },
  { id: 'dentist_chatbot_worried', label: { pl: 'Dentysta, boi się że chatbot źle odpowie pacjentowi', ru: 'Стоматолог, боится, что чат-бот даст пациенту неверный ответ' }, serviceId: 'aichatbot', difficulty: 'hard', readiness: 'cold', prompt: 'Prowadzisz gabinet stomatologiczny. Obawiasz się, że automatyczny chatbot udzieli pacjentowi złej informacji medycznej albo zabrzmi bezosobowo. Potrzebujesz usłyszeć, że masz pełną kontrolę nad tym, co bot mówi, zanim się zainteresujesz.' },
  { id: 'cleaning_company_leadforms', label: { pl: 'Firma sprzątająca, mnóstwo pytań "ile to kosztuje"', ru: 'Клининговая компания, море вопросов «сколько это стоит»' }, serviceId: 'leadforms', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz firmę sprzątającą. Formularz kontaktowy na stronie jest krótki i ludzie piszą niejasne zapytania, na które trudno szybko odpowiedzieć. Chętnie posłuchasz o czymś, co zbierze więcej konkretnych informacji od razu.' },
  { id: 'real_estate_dashboards', label: { pl: 'Agencja nieruchomości, potrzebuje dashboardu', ru: 'Агентство недвижимости, нужна аналитическая панель' }, serviceId: 'dashboards', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz małą agencję nieruchomości z kilkoma pracownikami. Dane o ofertach i leadach są rozrzucone po arkuszach i mailach, trudno ci ocenić, co działa. Jesteś zainteresowany, ale sceptyczny co do kosztu wdrożenia.' },
  { id: 'language_school_email', label: { pl: 'Szkoła językowa, chce automatyzacji maili', ru: 'Языковая школа, хочет автоматизацию email-рассылок' }, serviceId: 'emailint', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz szkołę językową. Masz sporą bazę byłych i obecnych kursantów, ale nie wysyłacie do nich regularnie żadnych wiadomości. Jesteś otwarty na pomysł automatycznych maili, jeśli to nie wymaga dużo twojej pracy.' },
  { id: 'photographer_portfolio', label: { pl: 'Fotograf, mały budżet, potrzebuje portfolio', ru: 'Фотограф, маленький бюджет, нужно портфолио' }, serviceId: 'branding', difficulty: 'medium', readiness: 'cold', prompt: 'Jesteś fotografem na jednoosobowej działalności. Masz bardzo ograniczony budżet i jesteś wrażliwy na cenę. Potrzebujesz usłyszeć, że inwestycja w markę/portfolio realnie pomoże ci zdobywać droższe zlecenia, zanim zaczniesz brać to na poważnie.' },
  { id: 'furniture_store_ecommerce', label: { pl: 'Sklep meblowy, rozważa e-commerce', ru: 'Мебельный магазин, рассматривает интернет-магазин' }, serviceId: 'ecommerce', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz stacjonarny sklep meblowy. Klienci pytają, czy można zamówić online, ale nie masz sklepu internetowego. Zastanawiasz się nad tym od jakiegoś czasu, ale nie wiesz, od czego zacząć.' },
  { id: 'hvac_seasonal_urgent', label: { pl: 'Klimatyzacja, pełnia sezonu, mało czasu', ru: 'Кондиционеры, разгар сезона, мало времени' }, serviceId: 'googleads', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz firmę montującą klimatyzację, jest pełnia sezonu, masz mnóstwo pracy i mało czasu na rozmowę. Jeśli worker szybko pokaże, że chodzi o więcej zleceń w sezonie, jesteś zainteresowany, ale nie zniesiesz przegadanej rozmowy.' },
  { id: 'tiktok_young_brand', label: { pl: 'Młoda marka odzieżowa, chce TikToka', ru: 'Молодой бренд одежды, хочет продвижение в TikTok' }, serviceId: 'tiktokads', difficulty: 'easy', readiness: 'hot', prompt: 'Prowadzisz młodą markę odzieżową skierowaną do nastolatków i młodych dorosłych. Sami już nagrywacie trochę wideo, ale nie umiecie tego skalować w reklamę. Jesteś entuzjastycznie nastawiony do TikToka, zadajesz konkretne pytania o budżet i format.' },
  { id: 'b2b_manufacturer_geoai', label: { pl: 'Producent B2B, obecność w kilku krajach', ru: 'B2B-производитель, присутствие в нескольких странах' }, serviceId: 'geoai', difficulty: 'hard', readiness: 'cold', prompt: 'Zarządzasz marketingiem w firmie produkcyjnej B2B działającej w kilku krajach. Nie rozumiesz pojęcia "widoczność w AI/wyszukiwarkach" i podchodzisz do tego nieufnie jako do modnego hasła bez pokrycia. Worker musi to wytłumaczyć bardzo konkretnie i bez hype-u.' },
  { id: 'telegram_messenger_fan', label: { pl: 'Firma, która żyje w Telegramie', ru: 'Компания, которая живёт в Telegram' }, serviceId: 'messengers', difficulty: 'easy', readiness: 'warm', prompt: 'Twój zespół komunikuje się głównie przez Telegram, mail sprawdzacie rzadko. Zapytania z formularza na stronie giną, bo nikt nie zagląda do skrzynki na czas. Szybko rozumiesz wartość integracji z komunikatorem.' },
  { id: 'multi_location_franchise', label: { pl: 'Sieć salonów, potrzebuje widoku multi-lokalizacyjnego', ru: 'Сеть салонов, нужен обзор по всем точкам сразу' }, serviceId: 'dashboards', difficulty: 'hard', readiness: 'cold', prompt: 'Zarządzasz siecią kilku salonów/punktów w różnych miastach. Masz sporo doświadczenia z dostawcami IT, którzy nie dowieźli obietnic, więc jesteś wymagający i zadajesz szczegółowe pytania o wdrożenie i utrzymanie.' },
  { id: 'distrustful_after_scam', label: { pl: 'Klient oszukany kiedyś przez agencję', ru: 'Клиент, которого когда-то обмануло агентство' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Kilka lat temu zapłaciłeś agencji marketingowej z góry i nic nie dostałeś. Jesteś bardzo nieufny wobec każdej telefonicznej oferty, prosisz o referencje i dowody, zanim w ogóle rozważysz dalszą rozmowę.' },
  { id: 'price_shopper_compares', label: { pl: 'Porównuje oferty kilku agencji naraz', ru: 'Сравнивает предложения нескольких агентств одновременно' }, serviceId: null, difficulty: 'hard', readiness: 'warm', prompt: 'Rozmawiasz teraz z trzecią agencją w tym tygodniu i otwarcie o tym mówisz. Naciskasz na to, żeby worker "od razu powiedział, czym różnicie się od innych" i porównujesz każdą odpowiedź do konkurencji.' },
  { id: 'non_decision_maker', label: { pl: 'Recepcjonistka, nie jest decydentem', ru: 'Администратор на ресепшене, не принимает решений' }, serviceId: null, difficulty: 'medium', readiness: 'cold', prompt: 'Odbierasz telefon w recepcji/biurze, ale to nie ty podejmujesz decyzje zakupowe — właściciel jest zajęty. Worker musi sprawnie wydobyć od ciebie dane kontaktowe do decydenta i umówić kontakt z nim, zamiast tracić czas na próbę przekonania ciebie.' },
  { id: 'tech_savvy_founder', label: { pl: 'Techniczny founder startupu, trudne pytania o integracje', ru: 'Технический основатель стартапа, сложные вопросы об интеграциях' }, serviceId: 'apiint', difficulty: 'hard', readiness: 'warm', prompt: 'Jesteś współzałożycielem małego startupu, sam trochę programujesz. Zadajesz precyzyjne, techniczne pytania o integracje, API i architekturę, i szybko wyczuwasz, kiedy worker recytuje ogólniki zamiast konkretów.' },
  { id: 'old_school_no_computer', label: { pl: 'Starszy właściciel, "nie znam się na komputerach"', ru: 'Пожилой владелец, «я не разбираюсь в компьютерах»' }, serviceId: null, difficulty: 'medium', readiness: 'cold', prompt: 'Jesteś starszym właścicielem lokalnego biznesu, nie czujesz się pewnie z technologią i boisz się, że coś "skomplikowanego" będzie dla ciebie za trudne w obsłudze. Potrzebujesz uspokojenia, że to będzie proste, zanim zaczniesz słuchać dalej.' },
  { id: 'multitasking_solo_owner', label: { pl: 'Jednoosobowa działalność, robi wszystko sam', ru: 'Индивидуальный предприниматель, делает всё сам' }, serviceId: 'aiauto', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz jednoosobową działalność usługową i robisz dosłownie wszystko sam: obsługę klienta, księgowość, wykonanie usługi. Jesteś ciągle zapracowany i podejrzliwy wobec czegokolwiek, co brzmi jak "kolejna rzecz do ogarnięcia", ale otwierasz się, jeśli usłyszysz, że to realnie odciąży cię z pracy.' },
  { id: 'warm_referral_client', label: { pl: 'Klient z polecenia, już ciepły', ru: 'Клиент по рекомендации, уже тёплый' }, serviceId: null, difficulty: 'easy', readiness: 'hot', prompt: 'Dostałeś namiar na Aura Global Merchants od znajomego, który był zadowolony ze współpracy. Jesteś już dość ciepły i pozytywnie nastawiony, ale worker wciąż powinien profesjonalnie zdiagnozować twoją sytuację, zanim od razu zaproponuje termin spotkania.' },
  { id: 'angry_after_bad_agency', label: { pl: 'Zły po współpracy z poprzednią agencją', ru: 'Зол после работы с предыдущим агентством' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Poprzednia agencja marketingowa zawaliła terminy i komunikację, jesteś sfrustrowany i od razu to zaznaczasz w rozmowie. Testujesz, czy worker będzie się bronił nachalnie, czy poważnie potraktuje twoje obawy.' },
  { id: 'wants_full_package', label: { pl: 'Chce "wszystko naraz"', ru: 'Хочет «всё и сразу»' }, serviceId: null, difficulty: 'medium', readiness: 'hot', prompt: 'Chcesz od razu "stronę, reklamę, SEO i automatyzacje razem, i to szybko". Worker powinien to uporządkować, zapytać o priorytety i realny budżet, zamiast obiecywać wszystko naraz bez planu.' },
  { id: 'silent_thinker', label: { pl: 'Mało mówi, trudno wyciągnąć informacje', ru: 'Немногословный, трудно вытянуть информацию' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Odpowiadasz bardzo krótko, monosylabami, nie rozwijasz myśli sam z siebie. Worker musi zadawać dobre, otwarte pytania, żeby w ogóle coś się dowiedzieć o twojej firmie i potrzebach.' },
  { id: 'objection_chain', label: { pl: 'Seria obiekcji jedna po drugiej (trudny finał)', ru: 'Серия возражений одно за другим (сложный финал)' }, serviceId: null, difficulty: 'hard', readiness: 'cold', prompt: 'Rzucasz obiekcje jedna po drugiej: najpierw cena, potem że masz już kogoś, potem że nie masz czasu, potem że musisz to przemyśleć. Nie poddawaj się po jednej dobrej odpowiedzi — worker musi konsekwentnie i spokojnie poprowadzić całą sekwencję, zanim rozważysz zgodę na krótką konsultację.' },
  { id: 'driving_school_landing', label: { pl: 'Szkoła jazdy, promocja kursu wakacyjnego', ru: 'Автошкола, продвижение летнего курса' }, serviceId: 'landing', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz szkołę jazdy i chcesz zrobić promocję "kurs wakacyjny", ale wszystko kierujesz na stronę główną, gdzie oferta się gubi wśród innych informacji. Jesteś otwarty na pomysł osobnej strony pod tę kampanię, jeśli worker wytłumaczy, że to realnie zwiększy liczbę zapisów.' },
  { id: 'transport_company_copy', label: { pl: 'Firma transportowa, słabe teksty na stronie', ru: 'Транспортная компания, слабые тексты на сайте' }, serviceId: 'copywriting', difficulty: 'medium', readiness: 'cold', prompt: 'Prowadzisz firmę transportową, macie stronę, ale teksty pisał kierowca "na szybko" i brzmią sucho, nikogo nie przekonują do kontaktu. Uważasz, że "teksty to nie priorytet" — worker musi pokazać konkretny związek między słabym tekstem a utraconymi zapytaniami, zanim się zainteresujesz.' },
  { id: 'boutique_hotel_uiux', label: { pl: 'Hotel butikowy, chaotyczna ścieżka rezerwacji na stronie', ru: 'Бутик-отель, запутанный путь бронирования на сайте' }, serviceId: 'uiux', difficulty: 'hard', readiness: 'cold', prompt: 'Prowadzisz kameralny hotel butikowy, macie stronę z ładnymi zdjęciami, ale sam proces rezerwacji jest zagmatwany i klienci się gubią. Jesteś dumny z estetyki strony i bronisz jej, uważając problem za przesadzony — worker musi konkretnie pokazać, w którym momencie tracisz rezerwacje, zanim rozważysz redesign.' },
  { id: 'custom_furniture_anim3d', label: { pl: 'Producent mebli na wymiar, chce wyróżnić produkty animacją 3D', ru: 'Производитель мебели на заказ, хочет выделить товары 3D-анимацией' }, serviceId: 'anim3d', difficulty: 'easy', readiness: 'hot', prompt: 'Produkujesz meble na wymiar i widziałeś u konkurencji efektowne animacje 3D produktów na stronie. Jesteś od razu zainteresowany, bo wiesz, że twoje realizacje wyglądają lepiej "na żywo" niż na zwykłych zdjęciach, i pytasz workera o proces oraz czas realizacji.' },
  { id: 'premium_realestate_cro', label: { pl: 'Agencja nieruchomości premium, duży ruch, mało zapytań', ru: 'Премиальное агентство недвижимости, много трафика, мало заявок' }, serviceId: 'cro', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz agencję nieruchomości premium, strona ma sporo odwiedzin z reklam, ale mało osób zostawia zapytanie o ofertę. Podejrzewasz, że coś jest nie tak, ale nie wiesz co — worker musi zdiagnozować konkretne miejsce w ścieżce, gdzie tracisz klientów, zanim zgodzisz się na audyt.' },
  { id: 'accounting_office_seo', label: { pl: 'Biuro rachunkowe, sceptyczne wobec długoterminowego SEO', ru: 'Бухгалтерская контора, скептически настроена к долгосрочному SEO' }, serviceId: 'seo', difficulty: 'medium', readiness: 'cold', prompt: 'Prowadzisz biuro rachunkowe i słyszałeś, że "SEO trzeba płacić miesiącami, zanim cokolwiek się stanie". Jesteś sceptyczny wobec inwestycji bez natychmiastowego efektu — worker musi jasno wytłumaczyć, dlaczego pozycjonowanie opłaca się w dłuższej perspektywie, i podać realistyczny harmonogram działań.' },
  { id: 'catering_remarketing', label: { pl: 'Firma cateringowa, odwiedzający stronę nie zostawiają kontaktu', ru: 'Кейтеринговая компания, посетители сайта не оставляют контакты' }, serviceId: 'remarketing', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz firmę cateringową na wesela i eventy. Widzisz w statystykach, że dużo osób ogląda ofertę, ale mało kto pisze zapytanie. Jesteś otwarty na pomysł przypominania się reklamą osobom, które już były na stronie, jeśli worker prosto wyjaśni, jak to działa.' },
  { id: 'sports_club_analytics', label: { pl: 'Klub sportowy, wydaje na marketing bez wiedzy co działa', ru: 'Спортивный клуб, тратит на маркетинг, не зная, что работает' }, serviceId: 'analytics', difficulty: 'hard', readiness: 'cold', prompt: 'Zarządzasz klubem sportowym i wydajesz co miesiąc pieniądze na różne reklamy, ale nie masz pojęcia, która z nich faktycznie przyprowadza nowych członków. Jesteś zniechęcony wcześniejszymi "raportami" od agencji, które nic nie wnosiły — worker musi pokazać, że dane mogą być zrozumiałe i praktyczne, a nie tylko tabelką liczb.' },
  { id: 'saas_startup_funnels', label: { pl: 'Startup SaaS, potrzebuje całej ścieżki klienta od reklamy po follow-up', ru: 'SaaS-стартап, нужен весь путь клиента от рекламы до follow-up' }, serviceId: 'funnels', difficulty: 'hard', readiness: 'warm', prompt: 'Jesteś współzałożycielem startupu SaaS. Macie osobno reklamy, osobno stronę i osobno maile do leadów, ale nic ze sobą nie gra i tracicie klientów po drodze. Rozumiesz wagę spójnego lejka, ale jesteś wymagający i chcesz usłyszeć konkretną strukturę projektu, zanim zaangażujesz zespół w dalsze rozmowy.' },
  { id: 'event_agency_aiqualify', label: { pl: 'Agencja eventowa, zalewana słabymi zapytaniami', ru: 'Ивент-агентство, завалено слабыми заявками' }, serviceId: 'aiqualify', difficulty: 'medium', readiness: 'warm', prompt: 'Prowadzisz agencję eventową i codziennie dostajesz mnóstwo zapytań z formularza, z czego większość to osoby bez realnego budżetu albo "tylko pytają". Tracisz czas na rozmowy, które donikąd nie prowadzą. Jesteś zainteresowany pomysłem automatycznej wstępnej kwalifikacji leadów, jeśli worker przekona cię, że AI nie odsieje przy okazji też dobrych klientów.' },
  { id: 'dance_school_aifollowup', label: { pl: 'Szkoła tańca, zapytania stygną bez odpowiedzi', ru: 'Школа танцев, заявки остывают без ответа' }, serviceId: 'aifollowup', difficulty: 'easy', readiness: 'hot', prompt: 'Prowadzisz szkołę tańca. Ludzie zapisują się na "pierwsze bezpłatne zajęcia" przez stronę, ale nikt w zespole nie ma czasu, żeby do nich wracać po kilku dniach ciszy, więc większość nigdy nie przychodzi. Jesteś od razu zainteresowany pomysłem automatycznego przypominania się takim osobom i pytasz workera, jak szybko można to uruchomić.' },
  { id: 'security_company_aireports', label: { pl: 'Firma ochroniarska, właściciel nie ma czasu czytać raportów', ru: 'Охранная компания, у владельца нет времени читать отчёты' }, serviceId: 'aireports', difficulty: 'medium', readiness: 'cold', prompt: 'Prowadzisz firmę ochroniarską i dostajesz od czasu do czasu długie, nieczytelne raporty marketingowe w PDF, których nigdy nie doczytujesz do końca. Jesteś sceptyczny, że "automatyczny raport od AI" będzie czymkolwiek lepszy — worker musi pokazać ci konkretnie, jak krótki i praktyczny może być taki raport, zanim się przekonasz.' },
  { id: 'cosmetics_producer_automsg', label: { pl: 'Producent kosmetyków, brak automatycznych powiadomień do klientów', ru: 'Производитель косметики, нет автоматических уведомлений для клиентов' }, serviceId: 'automsg', difficulty: 'easy', readiness: 'warm', prompt: 'Prowadzisz małą markę kosmetyków naturalnych ze sklepem internetowym. Klienci piszą do ciebie, bo nie wiedzą, czy zamówienie zostało przyjęte, albo zapominają dokończyć porzucony koszyk. Jesteś otwarty na pomysł automatycznych wiadomości SMS lub mail wysyłanych w takich momentach, jeśli worker pokaże, że to nie wymaga twojej stałej pracy.' },
  { id: 'consulting_firm_adminpanels', label: { pl: 'Firma consultingowa, zarządzanie klientami rozjechane po arkuszach', ru: 'Консалтинговая компания, управление клиентами разбросано по таблицам' }, serviceId: 'adminpanels', difficulty: 'hard', readiness: 'cold', prompt: 'Prowadzisz firmę consultingową i zarządzasz kilkunastoma projektami klientów jednocześnie, każdy w innym arkuszu albo notatniku. Uważasz, że "jakoś to działa" i nie widzisz sensu inwestować w dedykowany panel — worker musi pokazać ci konkretny scenariusz, w którym brak takiego panelu realnie cię kosztuje, zanim zaczniesz słuchać dalej.' },
  { id: 'wholesale_builder_customtools', label: { pl: 'Hurtownia materiałów budowlanych, unikalny proces zamówień', ru: 'Оптовый склад стройматериалов, нестандартный процесс заказов' }, serviceId: 'customtools', difficulty: 'hard', readiness: 'warm', prompt: 'Prowadzisz hurtownię materiałów budowlanych z nietypowym systemem rezerwacji towaru i rabatów zależnych od stałych klientów. Próbowałeś już kilku gotowych programów, ale żaden nie pasował do twojego sposobu pracy i zrezygnowałeś. Jesteś ostrożnie zainteresowany, jeśli worker udowodni, że rozumie twój konkretny proces, a nie proponuje kolejne uniwersalne narzędzie.' }
];

// Rough per-1K-token USD rates used only for internal cost estimates in the admin
// AI-usage panel — not billing-accurate, just enough to compare relative spend.
const AI_MODEL_RATES = {
  'gpt-5.4-mini': { input: 0.00025, output: 0.001 },
  'gpt-5.5': { input: 0.0025, output: 0.01 }
};
AI_MODEL_RATES[AI_TRAINING_MODEL] = AI_MODEL_RATES[AI_TRAINING_MODEL] || AI_MODEL_RATES['gpt-5.4-mini'];

const AI_TRAINING_ROLEPLAY_RULES = [
  'Trening rozmowy telefonicznej dla callera Aura Global Merchants (strony, e-commerce, marketing, AI-automatyzacje, CRM, systemy biznesowe).',
  'Grasz tylko klienta (nigdy trenera/sprzedawcy), po polsku, naturalnie, 1-3 krotkie zdania jak przez telefon.',
  'Nie pomagaj workerowi - reaguj na jakosc jego pytan i argumentow.',
  'Recytowana oferta, nachalnosc lub dokladna cena -> badz bardziej sceptyczny.',
  'Konkret + realny problem + propozycja krotkiej konsultacji -> stopniowo sie otwieraj.',
  'Cel workera: umowic konsultacje, nie sprzedac przez telefon - nie zgadzaj sie zbyt latwo, chyba ze persona mowi inaczej.'
].join('\n');

// Extra runtime instruction layered on top of a persona's base prompt, tuned by
// difficulty — makes "hard" personas genuinely harder to close, not just flavor text.
const AI_TRAINING_DIFFICULTY_INSTRUCTIONS = {
  easy: 'Poziom trudnosci: latwy. Otwierasz sie stosunkowo szybko na dobre pytania, nie stawiaj wielu barier.',
  medium: 'Poziom trudnosci: sredni. Wymagaj od workera co najmniej jednego sensownego argumentu lub pytania o Twoj realny problem, zanim zaczniesz sie otwierac.',
  hard: 'Poziom trudnosci: trudny. Stawiaj realny opor: rzucaj kolejne obiekcje, nie poddawaj sie po pierwszej dobrej odpowiedzi, wymagaj co najmniej dwoch-trzech mocnych argumentow zanim rozwazysz zgode na cokolwiek.'
};

function estimateAiCost(model, promptTokens, completionTokens) {
  const rate = AI_MODEL_RATES[model] || AI_MODEL_RATES[DEFAULT_MODEL];
  return Number(((promptTokens / 1000) * rate.input + (completionTokens / 1000) * rate.output).toFixed(6));
}

function personaSystemPrompt(persona) {
  const difficultyLine = AI_TRAINING_DIFFICULTY_INSTRUCTIONS[persona?.difficulty] || AI_TRAINING_DIFFICULTY_INSTRUCTIONS.medium;
  return `${persona?.prompt || ''}\n${difficultyLine}`;
}

function findAiTrainingPersona(clientType) {
  return AI_TRAINING_PERSONAS.find((persona) => persona.id === String(clientType || '')) || null;
}

// Persona.label is either a plain (Polish) string or a { pl, ru } pair — mirrors
// the client's bi() helper (public/academy/app.js) so a persona without a Russian
// translation yet just falls back to Polish instead of breaking.
function localizedPersonaLabel(label, language) {
  if (typeof label === 'string') return label;
  if (!label) return '';
  return label[language] ?? label.pl ?? label.ru ?? '';
}

// Same session-language pattern used by /api/auth/me and /api/auth/login
// (session.language, set at worker login/registration) — reused here so the
// AI-training API responds in the worker's chosen language.
function requestAcademyLanguage(req) {
  const session = currentSession(req);
  return session?.language === 'ru' ? 'ru' : 'pl';
}

// Bilingual heuristic-analysis string helper — same { pl, ru } pattern as
// localizedPersonaLabel above, used by the non-AI heuristic analysis
// generator (buildHeuristicAnalysis and everything it calls) so main_problem /
// why_it_matters / mini_audit_points actually respect the discover request's
// `language` field instead of being hardcoded Russian. Falls back to 'ru' to
// match the rest of this generator's historical default.
function heuristicText(pair, language) {
  if (typeof pair === 'string') return pair;
  if (!pair) return '';
  return pair[language] ?? pair.ru ?? pair.pl ?? '';
}

// Normalizes any incoming language value (discover request body, options
// object, etc.) down to the two languages the heuristic generator supports.
function normalizeAnalysisLanguage(language) {
  return language === 'pl' ? 'pl' : 'ru';
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
  'rejestr.io',
  'regon24.pl',
  'biznes.gov.pl',
  'opendatabot.ua',
  'youcontrol.com.ua',
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

// Global platforms that are never themselves a B2B company page - crowdfunding,
// wikis, forums, code/design hosting, content aggregators, etc. Unlike
// social/directory/marketplace above, classifyUrlType used to default any
// domain not on one of those specific lists to 'official_candidate' (a real
// company website), which let unrelated pages like patreon.com or a random
// Chinese content-aggregator through as if they were discovered businesses.
const nonBusinessPlatformDomains = [
  'patreon.com',
  'kickstarter.com',
  'gofundme.com',
  'indiegogo.com',
  'wikipedia.org',
  'wikimedia.org',
  'reddit.com',
  'quora.com',
  'pinterest.com',
  'twitter.com',
  'x.com',
  't.me',
  'telegram.me',
  'medium.com',
  'substack.com',
  'tumblr.com',
  'github.com',
  'github.io',
  'gitlab.com',
  'tinkercad.com',
  'thingiverse.com',
  'sketchfab.com',
  'behance.net',
  'dribbble.com',
  'notion.site',
  'canva.com',
  'figma.com',
  'airtable.com',
  'trello.com',
  'slideshare.net',
  'scribd.com',
  'academia.edu',
  'researchgate.net',
  'archive.org',
  'baidu.com',
  'zhihu.com',
  'douban.com'
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

const AURA_SITE_ORIGIN = String(process.env.AURA_SITE_ORIGIN || 'https://parser.auraglobal-merchants.com').replace(/\/$/, '');
const AURA_SITE_TEMPLATE = path.join(__dirname, 'public', 'site', 'index.html');

function auraLanguage(req) {
  const supported = ['pl', 'en', 'ru'];
  const fromQuery = String(req.query?.lang || '').toLowerCase();
  if (supported.includes(fromQuery)) return fromQuery;
  // No explicit choice — follow the browser's Accept-Language instead of
  // defaulting every first visit to Polish.
  const header = String(req.headers['accept-language'] || '');
  for (const part of header.split(',')) {
    const base = part.split(';')[0].trim().toLowerCase().split('-')[0];
    if (supported.includes(base)) return base;
    if (['uk', 'be', 'kk'].includes(base)) return 'ru';
  }
  return 'pl';
}

function auraServiceBySlug(slug, language) {
  return getServiceCategories(language)
    .flatMap((category) => category.services.map((service) => ({ ...service, category: category.label })))
    .find((service) => service.slug === slug || service.id === slug) || null;
}

// Shared fallback OG image used by every page that has no image of its own
// (list pages, service detail pages - services only carry an icon name, not
// a real photo). Real dimensions of public/site/og-image.png, verified on disk.
const AURA_DEFAULT_OG_IMAGE = {
  url: `${AURA_SITE_ORIGIN}/site/og-image.png`,
  type: 'image/png',
  width: 1200,
  height: 630
};

function auraPageMeta(req) {
  const language = auraLanguage(req);
  const routePath = String(req.path || '').replace(/\/$/, '') || '/site';
  const projectMatch = routePath.match(/(?:^|\/)portfolio\/([^/]+)$/);
  const serviceMatch = routePath.match(/(?:^|\/)services\/([^/]+)$/);
  const portfolio = getPortfolioProjects(language);
  let title = 'Aura Global — websites and digital systems built around a real business task';
  let description = 'Strategy, design, development, marketing and AI automation. Aura Global starts with the real business task.';
  let schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Aura Global', url: `${AURA_SITE_ORIGIN}/site/` };
  let canonicalPath = routePath.startsWith('/site') ? routePath : routePath;
  // Per-item og:image/twitter:image. Falls back to the shared site-wide
  // og-image.png for list pages and any item without its own real image
  // (all current services only carry a lucide icon name, not a photo).
  let image = { ...AURA_DEFAULT_OG_IMAGE };

  if (routePath === '/portfolio' || routePath === '/site/portfolio') {
    title = 'Portfolio — Aura Global';
    description = 'Published digital projects with real media, project context and direct links.';
    schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: `${AURA_SITE_ORIGIN}${routePath}`, hasPart: portfolio.map((project) => ({ '@type': 'CreativeWork', name: project.title, url: `${AURA_SITE_ORIGIN}/portfolio/${project.slug}`, image: `${AURA_SITE_ORIGIN}${project.cover}` })) };
  } else if (projectMatch) {
    const project = portfolio.find((item) => item.slug === projectMatch[1] || item.id === projectMatch[1]);
    if (project) {
      title = `${project.title} — Aura Global`;
      description = project.summary;
      schema = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: project.summary, url: `${AURA_SITE_ORIGIN}${routePath}`, image: project.media.map((item) => `${AURA_SITE_ORIGIN}${item}`), sameAs: project.projectUrl };
      // Portfolio covers are captured screenshots, all verified 1440x900 jpg
      // on disk (see public/site/media/portfolio/*/cover.jpg|detail.jpg) -
      // real dimensions, not a guess, so it's safe to report them.
      if (project.cover) {
        image = { url: `${AURA_SITE_ORIGIN}${project.cover}`, type: 'image/jpeg', width: 1440, height: 900 };
      }
    }
  } else if (serviceMatch) {
    const service = auraServiceBySlug(serviceMatch[1], language);
    if (service) {
      title = `${service.name} — Aura Global`;
      description = service.short;
      schema = { '@context': 'https://schema.org', '@type': 'Service', name: service.name, description: service.short, provider: { '@type': 'Organization', name: 'Aura Global', url: `${AURA_SITE_ORIGIN}/site/` }, offers: { '@type': 'Offer', priceCurrency: 'EUR', description: service.price } };
      // Services have no per-item photo (icon is a lucide glyph name, not a
      // real image file) - keep the shared fallback set above.
    }
  } else if (routePath === '/services' || routePath === '/site/services') {
    title = 'Services — Aura Global';
    description = 'Website, marketing, AI automation and business-system services with scope, timing and a clear next step.';
  }

  return { language, title, description, schema, image, canonical: `${AURA_SITE_ORIGIN}${canonicalPath || '/site/'}` };
}

function renderAuraSite(req, res) {
  try {
    const meta = auraPageMeta(req);
    const page = cheerio.load(fs.readFileSync(AURA_SITE_TEMPLATE, 'utf8'));
    page('html').attr('lang', meta.language);
    page('title').text(meta.title);
    page('#metaDescription').attr('content', meta.description);
    page('#ogTitle, #twitterTitle').attr('content', meta.title);
    page('#ogDescription, #twitterDescription').attr('content', meta.description);
    page('#ogUrl').attr('content', meta.canonical);
    page('#ogImage').attr('content', meta.image.url);
    page('meta[property="og:image:type"]').attr('content', meta.image.type);
    page('meta[name="twitter:image"]').attr('content', meta.image.url);
    if (meta.image.width && meta.image.height) {
      page('meta[property="og:image:width"]').attr('content', String(meta.image.width));
      page('meta[property="og:image:height"]').attr('content', String(meta.image.height));
    } else {
      // No verified real dimensions for this image - don't lie with a
      // hardcoded 1200x630, just omit the size hint entirely.
      page('meta[property="og:image:width"]').remove();
      page('meta[property="og:image:height"]').remove();
    }
    page('#canonicalLink').attr('href', meta.canonical);
    page('#structuredData').text(JSON.stringify(meta.schema));
    page('head').append(`<script>window.__AURA_SITE_LANG__=${JSON.stringify(meta.language)};</script>`);
    res.type('html').send(page.html());
  } catch (error) {
    console.error('[aura-site] render failed', error);
    res.status(500).send('Aura Global site is temporarily unavailable.');
  }
}

const auraSiteRoutes = [
  '/portfolio', '/portfolio/', '/site/portfolio', '/site/portfolio/',
  '/services', '/services/', '/site/services', '/site/services/'
];
app.get(auraSiteRoutes, renderAuraSite);
app.get(['/portfolio/:slug', '/portfolio/:slug/', '/site/portfolio/:slug', '/site/portfolio/:slug/', '/services/:slug', '/services/:slug/', '/site/services/:slug', '/site/services/:slug/'], renderAuraSite);

app.get(['/sitemap.xml', '/site/sitemap.xml'], (_req, res) => {
  const projects = getPortfolioProjects('pl');
  const services = getServiceCategories('pl').flatMap((category) => category.services);
  const routes = ['/site/', '/portfolio', '/services', ...projects.map((project) => `/portfolio/${project.slug}`), ...services.map((service) => `/services/${service.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${AURA_SITE_ORIGIN}${route}</loc></url>`).join('')}</urlset>`;
  res.type('application/xml').send(xml);
});

app.get(['/robots.txt', '/site/robots.txt'], (_req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${AURA_SITE_ORIGIN}/sitemap.xml\n`);
});

app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders(res, filePath) {
      // Images and fonts are immutable enough to cache for a day; HTML/JS/CSS
      // stay no-store so site updates are visible immediately.
      if (/\.(webp|png|jpe?g|gif|svg|ico|woff2?|mp4)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      } else {
        res.setHeader('Cache-Control', 'no-store');
      }
    }
  })
);

// ---- CLACK (dance studio landing page), mounted at /clack ----
// Lives in its own folder outside this repo. It rides on this process only
// because the Cloudflare tunnel for parser.auraglobal-merchants.com forwards
// the whole hostname to this one local port - there is no separate ingress
// rule available to point /clack at an isolated process.
const CLACK_DIR = 'C:\\Users\\Sasha\\Desktop\\clack';
const CLACK_ENV = (() => {
  try {
    const raw = fs.readFileSync(path.join(CLACK_DIR, '.env'), 'utf8');
    const env = {};
    raw.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    });
    return env;
  } catch {
    return {};
  }
})();
const CLACK_BOT_TOKEN = CLACK_ENV.TELEGRAM_BOT_TOKEN || '';
const CLACK_CHAT_ID = CLACK_ENV.TELEGRAM_CHAT_ID || '';
if (!CLACK_BOT_TOKEN || !CLACK_CHAT_ID) {
  console.warn('[clack] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing in clack/.env - /clack/api/zapis will only log submissions, not notify Telegram.');
}

// Mutable admin-editable settings (pixel IDs, WhatsApp number, referral copy)
// live here, NOT in .env - clack/bot.js writes to this file from the Telegram
// admin panel, and every request below re-reads it, so changes made through
// the bot apply immediately with no server restart.
const CLACK_CONFIG_PATH = path.join(CLACK_DIR, 'config.json');
const CLACK_DEFAULT_CONFIG = {
  ga4MeasurementId: '',
  metaPixelId: '',
  tiktokPixelId: '',
  clarityProjectId: '',
  whatsappNumber: '',
  googleReviewLink: '',
  referralRewardText: '',
  remindersEnabled: true
};
function loadClackConfig() {
  try {
    return { ...CLACK_DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CLACK_CONFIG_PATH, 'utf8')) };
  } catch {
    return { ...CLACK_DEFAULT_CONFIG };
  }
}

const CLACK_DATA_DIR = path.join(CLACK_DIR, 'data');
const CLACK_LEADS_PATH = path.join(CLACK_DATA_DIR, 'leads.json');
const CLACK_EVENTS_PATH = path.join(CLACK_DATA_DIR, 'events.jsonl');
function loadClackLeads() {
  try {
    return JSON.parse(fs.readFileSync(CLACK_LEADS_PATH, 'utf8'));
  } catch {
    return [];
  }
}
function saveClackLeads(leads) {
  fs.mkdirSync(CLACK_DATA_DIR, { recursive: true });
  fs.writeFileSync(CLACK_LEADS_PATH, JSON.stringify(leads, null, 2), 'utf8');
}
function appendClackEvent(evt) {
  try {
    fs.mkdirSync(CLACK_DATA_DIR, { recursive: true });
    fs.appendFileSync(CLACK_EVENTS_PATH, JSON.stringify(evt) + '\n', 'utf8');
  } catch (error) {
    console.error('[clack] failed to append event:', error.message);
  }
}
function generateClackReferralCode(name) {
  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${initials || 'CL'}${random}`;
}
function sanitizeClackRefCode(raw) {
  return String(raw || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12).toUpperCase();
}

const clackHits = new Map();
function isClackRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (clackHits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  clackHits.set(ip, recent);
  return recent.length > 5;
}

function escapeHtmlClack(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function sendClackTelegramMessage(text) {
  const response = await fetch(`https://api.telegram.org/bot${CLACK_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: CLACK_CHAT_ID, text, parse_mode: 'HTML' })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(`Telegram sendMessage failed: ${response.status} ${JSON.stringify(data)}`);
  }
}

// Whitelisted public assets only (og:image etc.) - never the whole CLACK_DIR,
// which also holds .env (bot token), subscribers.json and server source.
app.use(
  '/clack/assets',
  express.static(path.join(CLACK_DIR, 'assets'), {
    setHeaders(res, filePath) {
      res.setHeader('Cache-Control', /\.(png|jpe?g|webp|mp4|svg)$/i.test(filePath) ? 'public, max-age=86400' : 'no-store');
    }
  })
);

app.get('/clack/api/config', (_req, res) => {
  const cfg = loadClackConfig();
  res.json({
    ga4MeasurementId: cfg.ga4MeasurementId,
    metaPixelId: cfg.metaPixelId,
    tiktokPixelId: cfg.tiktokPixelId,
    clarityProjectId: cfg.clarityProjectId,
    whatsappNumber: cfg.whatsappNumber,
    referralRewardText: cfg.referralRewardText
  });
});

// ---- rich behavioural analytics ingest (clack-analytics.js) ----
// Same privacy posture as /clack/api/track below: first-party, no cookies,
// no PII (client only ever sends event names + technical params). Raw events
// land in clack/data/analytics/raw/events-YYYY-MM-DD.jsonl; the Telegram bot
// aggregates them into daily/weekly digests.
const CLACK_ANALYTICS_RAW_DIR = path.join(CLACK_DATA_DIR, 'analytics', 'raw');
const CLACK_EVENT_NAME_RE = /^[a-z0-9_]{2,48}$/;
const CLACK_EVENT_PARAM_KEYS = new Set([
  'page', 'element', 'section', 'device', 'traffic_source', 'campaign', 'direction',
  'session_id', 'visit_type', 'lang', 'ref', 'duration_s', 'max_scroll_pct',
  'form_state', 'ttfb_ms', 'dom_ms', 'load_ms'
]);
const clackEventHits = new Map();
function isClackEventsRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (clackEventHits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  clackEventHits.set(ip, recent);
  return recent.length > 120; // 120 batchy / 10 min z jednego IP wystarcza z zapasem
}

app.post('/clack/api/events', (req, res) => {
  const ip = req.socket.remoteAddress || 'unknown';
  if (isClackEventsRateLimited(ip)) {
    return res.status(429).json({ ok: false });
  }
  const events = Array.isArray(req.body?.events) ? req.body.events.slice(0, 25) : [];
  if (!events.length) return res.status(400).json({ ok: false });

  let accepted = 0;
  const lines = [];
  for (const raw of events) {
    const name = String(raw?.event || '');
    if (!CLACK_EVENT_NAME_RE.test(name)) continue;
    const ts = typeof raw.ts === 'string' && !Number.isNaN(Date.parse(raw.ts)) ? raw.ts : new Date().toISOString();
    const record = { event: name, ts };
    const rawParams = raw.params && typeof raw.params === 'object' ? raw.params : {};
    for (const [key, value] of Object.entries(rawParams)) {
      if (!CLACK_EVENT_PARAM_KEYS.has(key)) continue;
      record[key] = String(value).slice(0, 120);
    }
    lines.push(JSON.stringify(record));
    accepted += 1;
    // legacy dual-write, żeby stary ekran statystyk w bocie dalej liczył odsłony
    if (name === 'page_view') {
      appendClackEvent({
        type: 'view',
        utm_source: record.traffic_source && !record.traffic_source.startsWith('ref:') && record.traffic_source !== 'direct' ? record.traffic_source : '',
        utm_medium: '',
        utm_campaign: record.campaign || '',
        ref: record.ref || '',
        ts
      });
    }
  }
  if (lines.length) {
    try {
      fs.mkdirSync(CLACK_ANALYTICS_RAW_DIR, { recursive: true });
      const day = new Date().toISOString().slice(0, 10);
      fs.appendFileSync(path.join(CLACK_ANALYTICS_RAW_DIR, `events-${day}.jsonl`), lines.join('\n') + '\n', 'utf8');
    } catch (error) {
      console.error('[clack] analytics append failed:', error.message);
    }
  }
  res.json({ ok: true, accepted });
});

// Anonymous, no-PII aggregate counters (page views vs form submits) so the
// bot's "Статистика" screen can show a real conversion rate. Not gated behind
// cookie consent: no cookie, no persistent identifier, first-party only -
// unlike GA4/Meta/TikTok this carries none of the cross-site tracking
// properties that make consent a GDPR requirement.
app.post('/clack/api/track', (req, res) => {
  const body = req.body || {};
  const type = body.type === 'submit' ? 'submit' : body.type === 'view' ? 'view' : null;
  if (!type) {
    return res.status(400).json({ ok: false, error: 'invalid type' });
  }
  appendClackEvent({
    type,
    utm_source: String(body.utm_source || '').slice(0, 60),
    utm_medium: String(body.utm_medium || '').slice(0, 60),
    utm_campaign: String(body.utm_campaign || '').slice(0, 60),
    ref: sanitizeClackRefCode(body.ref),
    ts: new Date().toISOString()
  });
  res.json({ ok: true });
});

app.get('/clack/api/stats-public', (_req, res) => {
  const leads = loadClackLeads();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const signupsLast7d = leads.filter((lead) => new Date(lead.createdAt).getTime() > weekAgo).length;
  res.json({ signupsLast7d });
});

app.get(['/clack', '/clack/'], (_req, res) => {
  res.sendFile(path.join(CLACK_DIR, 'index.html'));
});

app.post('/clack/api/zapis', async (req, res) => {
  const ip = req.socket.remoteAddress || 'unknown';
  if (isClackRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Zbyt wiele prob. Sprobuj ponownie za kilka minut.' });
  }

  try {
    const payload = req.body || {};

    // honeypot - spambots fill hidden fields, real users never see them
    if (payload.website) {
      return res.json({ ok: true });
    }

    const name = String(payload.name || '').trim().slice(0, 200);
    const contact = String(payload.contact || '').trim().slice(0, 200);
    const format = String(payload.format || '').trim().slice(0, 100);
    const daysArr = Array.isArray(payload.preferredDays) ? payload.preferredDays.slice(0, 10) : [];
    const days = daysArr.join(', ');
    const comment = String(payload.comment || '').trim().slice(0, 1000);
    const utmFields = {
      utm_source: String(payload.utm_source || '').slice(0, 60),
      utm_medium: String(payload.utm_medium || '').slice(0, 60),
      utm_campaign: String(payload.utm_campaign || '').slice(0, 60)
    };
    const utm = Object.entries(utmFields)
      .map(([k, v]) => (v ? `${k}=${v}` : null))
      .filter(Boolean)
      .join(' ');
    const referredByCode = sanitizeClackRefCode(payload.ref);
    const lang = ['pl', 'ru', 'uk'].includes(payload.lang) ? payload.lang : 'pl';

    if (!name || !contact || !format) {
      return res.status(400).json({ ok: false, error: 'Brakuje wymaganych pol (imie, kontakt, format).' });
    }

    const leads = loadClackLeads();
    const leadId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const referralCode = generateClackReferralCode(name);
    const lead = {
      id: leadId,
      name,
      contact,
      format,
      preferredDays: daysArr,
      comment,
      ...utmFields,
      referralCode,
      referredByCode: referredByCode || null,
      referralCount: 0,
      lang,
      chatId: null,
      createdAt: new Date().toISOString(),
      remindersSentForClassDate: null,
      reviewRequestSent: false
    };
    leads.push(lead);

    if (referredByCode) {
      const referrer = leads.find((l) => l.referralCode === referredByCode);
      if (referrer) referrer.referralCount = (referrer.referralCount || 0) + 1;
    }
    saveClackLeads(leads);
    appendClackEvent({ type: 'submit', ...utmFields, ref: referredByCode, ts: lead.createdAt });

    const lines = [
      'CLACK - nowe zgloszenie',
      `Imie: ${escapeHtmlClack(name)}`,
      `Kontakt: ${escapeHtmlClack(contact)}`,
      `Format: ${escapeHtmlClack(format)}`,
      days ? `Dogodne dni: ${escapeHtmlClack(days)}` : null,
      comment ? `Komentarz: ${escapeHtmlClack(comment)}` : null,
      utm ? `UTM: ${escapeHtmlClack(utm)}` : null,
      lang !== 'pl' ? `Jezyk strony: ${lang}` : null,
      referredByCode ? `Polecone przez kod: ${escapeHtmlClack(referredByCode)}` : null,
      `Kod polecajacy tej osoby: ${referralCode}`
    ].filter(Boolean);

    if (CLACK_BOT_TOKEN && CLACK_CHAT_ID) {
      await sendClackTelegramMessage(lines.join('\n'));
    } else {
      console.log('[clack] (DEV, Telegram not configured):\n' + lines.join('\n'));
    }

    res.json({
      ok: true,
      referralCode,
      telegramDeepLink: `https://t.me/clak_res_bot?start=lead_${leadId}`
    });
  } catch (error) {
    console.error('[clack] zapis failed:', error);
    res.status(500).json({ ok: false, error: 'Blad serwera. Sprobuj ponownie pozniej.' });
  }
});

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

// Real-world city/region autocomplete via Google Places Autocomplete (New).
// The local LOCATION_SUGGESTIONS list only covers ~24 Polish cities, so
// typing anything else (a Ukrainian city, a district, a smaller town) used
// to return nothing and silently leave the old suggestions on screen. This
// queries Google directly so any city/country worldwide can be found while
// typing, with the static list only as an offline/no-API-key fallback.
async function fetchGooglePlaceAutocomplete(input, { country = '', languageCode = 'pl' } = {}) {
  if (!GOOGLE_PLACES_API_KEY || !input) return [];
  const body = {
    input,
    languageCode,
    includedPrimaryTypes: ['locality', 'administrative_area_level_2', 'administrative_area_level_1']
  };
  const preset = COUNTRY_PRESETS[normalizeSearchText(country)];
  if (preset?.regionCode) body.includedRegionCodes = [preset.regionCode];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GOOGLE_PLACES_TIMEOUT_MS);
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY, 'user-agent': USER_AGENT },
      body: JSON.stringify(body)
    });
    if (!response.ok) return [];
    const data = await response.json().catch(() => ({}));
    return (data.suggestions || [])
      .map((item) => item.placePrediction)
      .filter(Boolean)
      .map((prediction) => {
        const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text || '';
        const secondaryText = prediction.structuredFormat?.secondaryText?.text || '';
        const parts = secondaryText.split(',').map((part) => part.trim()).filter(Boolean);
        return {
          cityName: mainText,
          region: parts[0] || '',
          countryName: parts[parts.length - 1] || country || '',
          countryCode: preset?.regionCode || '',
          displayName: prediction.text?.text || [mainText, secondaryText].filter(Boolean).join(', '),
          placeId: prediction.placeId || ''
        };
      });
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/location/suggestions', async (req, res) => {
  const rawQuery = cleanText(req.query.q || '');
  const q = normalizeSearchText(rawQuery);
  const country = normalizeSearchText(req.query.country || '');
  const radiusKm = Number(req.query.radiusKm || 15) || 15;

  if (rawQuery.length >= 2 && GOOGLE_PLACES_API_KEY) {
    const googleSuggestions = await fetchGooglePlaceAutocomplete(rawQuery, { country: req.query.country || '' });
    if (googleSuggestions.length) {
      return res.json({
        suggestions: googleSuggestions.slice(0, 12).map((item) => ({ ...item, radiusKm, language: 'pl' })),
        source: 'google'
      });
    }
  }

  const suggestions = LOCATION_SUGGESTIONS.filter((item) => {
    if (country && !normalizeSearchText(`${item.countryName} ${item.countryCode}`).includes(country)) return false;
    if (!q) return true;
    return normalizeSearchText(`${item.cityName} ${item.region} ${item.countryName}`).includes(q);
  })
    .slice(0, 12)
    .map((item) => ({
      ...item,
      radiusKm,
      displayName: [item.cityName, item.region, item.countryName].filter(Boolean).join(', '),
      language: 'pl'
    }));
  res.json({ suggestions, source: 'static' });
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

    if (cleanText(req.body?.companyFax || '')) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Podaj imie osoby kontaktowej.' });
    }
    if (!phone && !email) {
      return res.status(400).json({ error: 'Podaj telefon lub email.' });
    }
    if (name.length > 120) {
      return res.status(400).json({ error: 'Imie jest zbyt dlugie.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Podaj poprawny adres email.' });
    }
    if (phone && phone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({ error: 'Podaj poprawny numer telefonu.' });
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
  const payload = {
    role: session.role,
    workerId: session.workerId,
    displayName: session.displayName,
    language: session.language
  };
  // Let the worker frontend show "leads today: X/Y" before even attempting a
  // search - resolve the same way POST /api/discover does (requestWorkerId),
  // and treat a missing account or 0/unset limit as unlimited.
  if (session.role === 'worker') {
    const workerId = requestWorkerId(req);
    const workerAccount = workerId ? store.getWorkerAccount(workerId) : null;
    const dailyLeadLimit = workerAccount ? Number(workerAccount.dailyLeadLimit) || 0 : 0;
    payload.dailyLeadLimit = dailyLeadLimit;
    payload.usedToday = workerId ? store.getWorkerLeadsClaimedToday(workerId) : 0;
  }
  res.json(payload);
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
    const useAi = Boolean(req.body?.useAi);
    const useWebSearch = Boolean(req.body?.useWebSearch);
    const model = String(req.body?.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
    const searchModel = String(req.body?.searchModel || SEARCH_MODEL).trim() || SEARCH_MODEL;
    const language = cleanText(req.body?.language || req.body?.uiLanguage || 'ru');

    if (!items.length) {
      return res.status(400).json({ error: 'Добавьте хотя бы одну компанию.' });
    }
    if (items.length > MAX_ITEMS) {
      return res.status(400).json({ error: `Максимум ${MAX_ITEMS} компаний за один запуск.` });
    }

    const startedAt = Date.now();
    // Sequential (concurrency 1), not Promise.all/mapLimit(3): companies are
    // processed one at a time in order, and a single item's failure (network
    // blip, hung fetch) is caught per-item so it can't reject the whole
    // mapLimit Promise.all and silently drop every already-finished result.
    const results = await mapLimit(items, 1, async (item, index) => {
      const companyId = companyIds[index] || store.findExistingCompanyId(item);
      try {
        const result = await analyzeLead(item, { useAi, useWebSearch, model, searchModel, language });
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
      } catch (error) {
        console.error(`[analyze] item failed for "${item.company || companyId}":`, error);
        return {
          id: cryptoRandomId(),
          input: item,
          _companyId: companyId,
          error: error.message || 'Ошибка анализа компании.',
          websiteResolution: { websiteStatus: 'UNCERTAIN', websiteConfidence: 0, candidates: [] },
          parsed: { ok: false, error: error.message || 'Ошибка анализа', pages: [], signals: emptySignals() },
          heuristic: {},
          analysis: { website_status: 'UNCERTAIN', lead_score: 0 },
          aiSiteAnalysis: { status: 'NOT_REQUESTED', version: 1, analyzed_at: '', company_data_version: 1 }
        };
      }
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
    const session = currentSession(req);
    if (!isAdminAuthorized(req) && !(session && session.role === 'worker')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
      return res.status(401).json({ error: 'Login required to run discovery.' });
    }
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
    const limit = clamp(Number.isFinite(requestedLimit) ? requestedLimit : 20, 1, MAX_DISCOVERY_ITEMS);
    // requestWorkerId already resolves an admin-supplied override safely; an
    // anonymous caller is rejected above, so no further client-supplied
    // workerId/x-worker-id should be trusted here.
    const workerId = requestWorkerId(req) || 'worker-default';
    // These come from the single search settings panel on the frontend
    // (site status / score / social / phone / email) and, unlike before, are
    // no longer dropped - they gate which analyzed companies count toward
    // `limit` inside runDiscoveryJob's sequential analysis loop.
    const siteStatus = normalizeSiteStatusFilter(req.body?.siteStatus);
    const requestedMinScore = Number.parseInt(req.body?.minScore, 10);
    const minScore = Number.isFinite(requestedMinScore) ? clamp(requestedMinScore, 0, 100) : 0;
    const hasSocial = Boolean(req.body?.hasSocial);
    const hasPhone = Boolean(req.body?.hasPhone);
    const hasEmail = Boolean(req.body?.hasEmail);
    const language = cleanText(req.body?.language || req.body?.uiLanguage || 'ru');
    const useAi = Boolean(req.body?.useAi);
    const useWebSearch = Boolean(req.body?.useWebSearch);

    if (!niches.length) {
      return res.status(400).json({ error: 'Укажите категорию или нишу для поиска.' });
    }
    if (!city && !country) {
      return res.status(400).json({ error: 'Укажите город или страну для поиска.' });
    }

    // Per-worker daily lead quota: block the search entirely, before any
    // job/run record is created. Admins acting as themselves (no worker
    // session) are never subject to this - same bypass pattern already used
    // by requireWorkerLeadAccess/requireWorkerRunAccess etc. in this file.
    // A missing account (e.g. workerId === 'worker-default' for anonymous/
    // admin-initiated calls) or dailyLeadLimit of 0/unset means unlimited.
    if (!isAdminAuthorized(req)) {
      const workerAccount = store.getWorkerAccount(workerId);
      const dailyLeadLimit = workerAccount ? Number(workerAccount.dailyLeadLimit) || 0 : 0;
      if (dailyLeadLimit > 0) {
        const usedToday = store.getWorkerLeadsClaimedToday(workerId);
        if (usedToday >= dailyLeadLimit) {
          return res.status(429).json({
            error: `Дневной лимит лидов исчерпан (${usedToday}/${dailyLeadLimit}). Новые лиды будут доступны с полуночи.`
          });
        }
      }
    }

    const job = createDiscoveryJob({
      niches,
      city: city || country,
      country,
      district,
      radiusKm,
      sourceFocus,
      limit,
      workerId,
      siteStatus,
      minScore,
      hasSocial,
      hasPhone,
      hasEmail,
      useAi,
      useWebSearch
    });

    void runDiscoveryJob(job.id, {
      niches,
      city: city || country,
      country,
      district,
      radiusKm,
      sourceFocus,
      limit,
      workerId,
      siteStatus,
      minScore,
      hasSocial,
      hasPhone,
      hasEmail,
      language,
      useAi,
      useWebSearch
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

app.post('/api/discover/jobs/:id/cancel', (req, res) => {
  const job = getDiscoveryJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Discovery job not found.' });
  const admin = isAdminAuthorized(req);
  if (!admin) {
    const workerId = requestWorkerId(req);
    const ownerId = store.normalizeWorkerId(job.meta?.workerId || '');
    if (!workerId || workerId !== ownerId) {
      return res.status(403).json({ error: 'This discovery job belongs to another worker.' });
    }
  }
  if (['completed', 'failed', 'cancelled'].includes(job.status)) {
    return res.json({ ok: true, alreadyFinished: true, status: job.status });
  }
  if (job.guard) {
    job.guard.stopped = true;
    job.guard.reason = 'cancelled';
  }
  updateDiscoveryJob(job.id, { progress: { message: 'Отмена поиска...' } });
  res.json({ ok: true, status: job.status });
});

// --- Round 5: AI Search Job API (mirrors /api/discover + /api/discover/jobs/:id
// above in request/response shape, so the frontend can reuse similar polling
// logic) --------------------------------------------------------------------
const AI_SEARCH_TERMINAL_STAGES = new Set(['COMPLETED', 'PARTIAL', 'CANCELLED', 'PAUSED', 'FAILED']);

function requireAiSearchJobAccess(req, res, job) {
  if (!job) {
    res.status(404).json({ error: 'AI search job not found.' });
    return false;
  }
  if (isAdminAuthorized(req)) return true;
  const workerId = requestWorkerId(req);
  if (!workerId || workerId !== job.creator_worker_id) {
    res.status(403).json({ error: 'This AI search job belongs to another worker.' });
    return false;
  }
  return true;
}

app.post('/api/ai-search/jobs', async (req, res) => {
  try {
    const session = currentSession(req);
    if (!isAdminAuthorized(req) && !(session && session.role === 'worker')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
      return res.status(401).json({ error: 'Login required to run AI search.' });
    }
    const workerId = requestWorkerId(req) || 'worker-default';
    const body = req.body || {};
    const mode = body.mode === 'combined' ? 'combined' : 'ai_search';

    const requestedNichesRaw = Array.isArray(body.niches) ? body.niches.map(cleanText).filter(Boolean) : [];
    const niche = cleanText(body.niche || body.category || requestedNichesRaw[0] || '');
    const niches = unique(requestedNichesRaw.length ? requestedNichesRaw : [niche]).filter(Boolean).slice(0, 40);
    const country = cleanText(body.country || '');
    const city = cleanText(body.city || (country ? '' : 'Warszawa'));

    if (!niches.length) {
      return res.status(400).json({ error: 'Укажите категорию или нишу для поиска.' });
    }
    if (!city && !country) {
      return res.status(400).json({ error: 'Укажите город или страну для поиска.' });
    }

    const requestedCount = clamp(Number.parseInt(body.requestedCount, 10) || 10, 1, 100);
    const params = {
      niche,
      niches,
      city,
      country,
      district: cleanText(body.district || ''),
      radiusKm: Number.parseFloat(body.radiusKm) || 0,
      language: cleanText(body.language || body.uiLanguage || 'ru'),
      requestedCount,
      sourceFocus: cleanText(body.sourceFocus || ''),
      excludeLists: {
        domains: Array.isArray(body.excludeLists?.domains) ? body.excludeLists.domains.map(cleanText).filter(Boolean) : [],
        nips: Array.isArray(body.excludeLists?.nips) ? body.excludeLists.nips.map(cleanText).filter(Boolean) : [],
        phones: Array.isArray(body.excludeLists?.phones) ? body.excludeLists.phones.map(cleanText).filter(Boolean) : []
      },
      // Curated extra-criteria fields a later frontend round is expected to
      // send - accepted and stored on the job even where not all of them are
      // used yet in filtering logic (see passesAiSearchExtraCriteria above).
      clientType: cleanText(body.clientType || ''),
      companySizeRange: cleanText(body.companySizeRange || ''),
      minYearsInBusiness: Number(body.minYearsInBusiness) || 0,
      websitePresence: cleanText(body.websitePresence || ''),
      websiteQualityFlags: Array.isArray(body.websiteQualityFlags) ? body.websiteQualityFlags.map(cleanText).filter(Boolean) : [],
      extraKeywords: Array.isArray(body.extraKeywords) ? body.extraKeywords.map(cleanText).filter(Boolean) : [],
      excludeKeywords: Array.isArray(body.excludeKeywords) ? body.excludeKeywords.map(cleanText).filter(Boolean) : [],
      minReviews: Number(body.minReviews) || 0,
      minRating: Number(body.minRating) || 0
    };

    const settings = store.getSettings();
    const job = store.createAiSearchJob({
      creatorWorkerId: workerId,
      mode,
      params,
      modelSearch: settings.aiCompanySearchModel,
      modelEnrich: settings.aiCompanyEnrichModel
    });

    void runAiSearchJob(job.id);

    res.json({ jobId: job.id, stage: job.stage });
  } catch (error) {
    console.error('[ai-search] failed to create AI search job:', error);
    res.status(500).json({ error: error.message || 'Ошибка запуска AI-поиска.' });
  }
});

app.get('/api/ai-search/jobs/:jobId', (req, res) => {
  const job = store.getAiSearchJob(req.params.jobId);
  if (!requireAiSearchJobAccess(req, res, job)) return;
  res.json(job);
});

app.post('/api/ai-search/jobs/:jobId/cancel', (req, res) => {
  const job = store.getAiSearchJob(req.params.jobId);
  if (!requireAiSearchJobAccess(req, res, job)) return;
  if (AI_SEARCH_TERMINAL_STAGES.has(job.stage)) {
    return res.json({ ok: true, alreadyFinished: true, stage: job.stage });
  }
  const updated = store.updateAiSearchJob(job.id, {
    cancel_requested: true,
    cancel_reason: cleanText(req.body?.reason || '') || 'user_cancelled'
  });
  res.json({ ok: true, stage: updated.stage });
});

app.post('/api/ai-search/jobs/:jobId/pause', (req, res) => {
  const job = store.getAiSearchJob(req.params.jobId);
  if (!requireAiSearchJobAccess(req, res, job)) return;
  if (AI_SEARCH_TERMINAL_STAGES.has(job.stage)) {
    return res.json({ ok: true, alreadyFinished: true, stage: job.stage });
  }
  const updated = store.updateAiSearchJob(job.id, { pause_requested: true });
  res.json({ ok: true, stage: updated.stage });
});

// Resume strategy: re-invokes runAiSearchJob/runAiEnrichOnlyJob from scratch
// (re-plan + re-search) rather than resuming mid-pipeline - see the
// "Resume strategy" note above runAiSearchJob's definition for why.
app.post('/api/ai-search/jobs/:jobId/resume', (req, res) => {
  const job = store.getAiSearchJob(req.params.jobId);
  if (!requireAiSearchJobAccess(req, res, job)) return;
  if (job.stage !== 'PAUSED') {
    return res.status(400).json({ error: 'Only a paused job can be resumed.' });
  }
  store.updateAiSearchJob(job.id, {
    pause_requested: false,
    cancel_requested: false,
    stage: 'QUEUED',
    stage_detail: 'Resuming...'
  });
  if (job.mode === 'ai_enrich') {
    void runAiEnrichOnlyJob(job.id);
  } else {
    void runAiSearchJob(job.id);
  }
  res.json({ ok: true, jobId: job.id });
});

app.post('/api/ai-search/enrich', async (req, res) => {
  try {
    const session = currentSession(req);
    if (!isAdminAuthorized(req) && !(session && session.role === 'worker')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
      return res.status(401).json({ error: 'Login required to run AI enrichment.' });
    }
    const workerId = requestWorkerId(req) || 'worker-default';
    const companyIds = Array.isArray(req.body?.companyIds)
      ? unique(req.body.companyIds.map((id) => String(id || '')).filter(Boolean))
      : [];
    if (!companyIds.length) {
      return res.status(400).json({ error: 'Укажите companyIds для обогащения.' });
    }
    const settings = store.getSettings();
    const job = store.createAiSearchJob({
      creatorWorkerId: workerId,
      mode: 'ai_enrich',
      params: { companyIds, language: cleanText(req.body?.language || req.body?.uiLanguage || 'ru') },
      modelSearch: settings.aiCompanySearchModel,
      modelEnrich: settings.aiCompanyEnrichModel
    });
    void runAiEnrichOnlyJob(job.id);
    res.json({ jobId: job.id, stage: job.stage });
  } catch (error) {
    console.error('[ai-search] failed to create AI enrich job:', error);
    res.status(500).json({ error: error.message || 'Ошибка запуска AI-обогащения.' });
  }
});

app.get('/api/history/runs', (req, res) => {
  const admin = isAdminAuthorized(req);
  if (!admin) {
    const workerId = requestWorkerId(req);
    if (!workerId) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
      return res.status(401).json({ error: 'Login required.' });
    }
    return res.json({ runs: store.listRuns({ limit: 100, workerId }) });
  }
  res.json({ runs: store.listRuns({ limit: 100, workerId: '' }) });
});

app.get('/api/history/runs/:id', (req, res) => {
  const run = store.getRun(String(req.params.id));
  if (!run) return res.status(404).json({ error: 'Run not found.' });
  if (!requireWorkerRunAccess(req, res, run)) return;
  const { workerId } = resolveActor(req);
  const page = paginateCompanyList(store.getCompaniesByIds(run.company_ids), req.query, { savedByWorkerId: workerId });
  res.json({ run, companies: page.items, total: page.total, page: page.page, pageSize: page.pageSize, paginated: page.paginated });
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
      active: req.body?.active !== false,
      dailyLeadLimit: req.body?.dailyLeadLimit
    });
    store.logAdminAction({
      adminId: cleanText(req.body?.adminId || 'admin'),
      action: 'create_worker',
      targetType: 'worker',
      targetId: worker.workerId,
      details: { displayName: worker.displayName, language: worker.language, active: worker.active, dailyLeadLimit: worker.dailyLeadLimit }
    });
    res.status(201).json({ ok: true, worker });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Worker create failed.' });
  }
});

app.get('/api/admin/workers/:workerId', (req, res) => {
  const detail = store.getWorkerDetail(req.params.workerId);
  const folders = store.listFolders(req.params.workerId);
  const saved = store.listSavedCompaniesForWorker(req.params.workerId, { pageSize: 500 });
  res.json({ ...detail, folders, saved: saved.items, savedTotal: saved.total });
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
      deletedSessionCount: result.deletedSessionCount
    }
  });
  res.json({ ok: true, result, stats: store.getStoreStats() });
});

// Historically this physically removed the worker's run history. Per project
// policy nothing found by the parser may ever be destroyed through the UI, so
// this now archives the worker's history and returns their leads to the pool
// instead - same button, honest behaviour.
app.delete('/api/admin/workers/:workerId/history', (req, res) => {
  let outcome;
  try {
    outcome = store.bulkReturnRunsToPool({
      filters: { workerId: req.params.workerId },
      actorId: req.adminId,
      actorRole: 'admin',
      reason: 'worker_history_cleared'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No history to clear for this worker.' });
  }
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'return_worker_history_to_pool',
    targetType: 'worker',
    targetId: req.params.workerId,
    details: outcome
  });
  res.json({ ok: true, ...outcome, stats: store.getStoreStats() });
});

app.post('/api/admin/workers/bulk', (req, res) => {
  const workerIds = [...new Set((Array.isArray(req.body?.workerIds) ? req.body.workerIds : []).map((value) => store.normalizeWorkerId(value)).filter(Boolean))];
  const action = String(req.body?.action || '').trim();
  if (!workerIds.length) return res.status(400).json({ error: 'workerIds is required.' });
  if (!['delete', 'deactivate', 'activate', 'reset-leads'].includes(action)) {
    return res.status(400).json({ error: 'Unknown bulk action.' });
  }
  if (action === 'delete' && req.body?.confirm !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm bulk worker deletion.' });
  }

  const results = [];
  for (const workerId of workerIds) {
    if (action === 'delete') {
      // deleteWorkerAccount returns leads to the pool and keeps dedupe memory.
      results.push({ workerId, deleted: Boolean(store.deleteWorkerAccount(workerId)) });
    } else if (action === 'reset-leads') {
      results.push({ workerId, resetIds: store.resetWorkerCompanies(workerId) });
    } else {
      results.push({ workerId, updated: Boolean(store.updateWorkerAccount(workerId, { active: action === 'activate' })) });
    }
  }

  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: `workers_bulk_${action.replace(/-/g, '_')}`,
    targetType: 'worker',
    targetId: 'bulk',
    details: { workerIds, count: workerIds.length }
  });
  res.json({ ok: true, action, results, stats: store.getStoreStats() });
});

app.get('/api/admin/history', (req, res) => {
  res.json({
    runs: store.listRunsFiltered({
      country: req.query.country || '',
      city: req.query.city || '',
      category: req.query.category || '',
      workerId: req.query.workerId || '',
      status: req.query.status || '',
      source: req.query.source || '',
      dateFrom: req.query.dateFrom || '',
      dateTo: req.query.dateTo || '',
      only: req.query.only || '',
      view: req.query.view || 'active',
      limit: Number.parseInt(req.query.limit, 10) || 100,
      sort: req.query.sort || 'newest'
    })
  });
});

// Preview for the filtered bulk return-to-pool tool: shows exactly what
// "Wroc zapytania do puli wedlug filtrow" would touch before anything moves,
// so an admin can deselect individual runs before committing.
app.get('/api/admin/history/preview', (req, res) => {
  const filters = {
    country: req.query.country || '',
    city: req.query.city || '',
    category: req.query.category || '',
    workerId: req.query.workerId || '',
    status: req.query.status || '',
    source: req.query.source || '',
    dateFrom: req.query.dateFrom || '',
    dateTo: req.query.dateTo || '',
    only: req.query.only || ''
  };
  res.json(store.previewBulkReturn(filters));
});

// Archive views. These never delete anything - archived_at is set on return
// (single, bulk, or manual archive) and restore only clears it.
app.get('/api/admin/history/archive', (req, res) => {
  res.json({
    runs: store.listRunsFiltered({
      country: req.query.country || '',
      city: req.query.city || '',
      category: req.query.category || '',
      workerId: req.query.workerId || '',
      status: req.query.status || '',
      dateFrom: req.query.dateFrom || '',
      dateTo: req.query.dateTo || '',
      view: 'archived',
      limit: Number.parseInt(req.query.limit, 10) || 200,
      sort: req.query.sort || 'newest'
    })
  });
});

app.post('/api/admin/history/:id/archive', (req, res) => {
  const run = store.archiveRun(req.params.id, { actorId: req.adminId, reason: cleanText(req.body?.reason || '') });
  if (!run) return res.status(404).json({ error: 'Run not found.' });
  store.logAdminAction({ adminId: req.adminId, action: 'archive_history', targetType: 'run', targetId: req.params.id, details: {} });
  res.json({ ok: true, run });
});

app.post('/api/admin/history/:id/restore', (req, res) => {
  const run = store.restoreRun(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found.' });
  store.logAdminAction({ adminId: req.adminId, action: 'restore_history', targetType: 'run', targetId: req.params.id, details: {} });
  res.json({ ok: true, run });
});

// Honest, non-destructive replacements for the old physical-delete flow.
// "Wroc query do puli" (single) and "Wroc zapytania do puli wedlug filtrow"
// (bulk) - leads/companies/comments/statuses/folders are never touched
// except to snap the pool assignment back to available; the run itself is
// archived, never removed.
app.post('/api/admin/history/:id/return-to-pool', (req, res) => {
  const outcome = store.returnRunToPool(req.params.id, {
    actorId: req.adminId,
    actorRole: 'admin',
    reason: cleanText(req.body?.reason || '')
  });
  if (!outcome) return res.status(404).json({ error: 'Run not found.' });
  store.logAdminAction({
    adminId: req.adminId,
    action: 'return_query_to_pool',
    targetType: 'run',
    targetId: req.params.id,
    details: { alreadyReturned: outcome.alreadyReturned, ...outcome.result }
  });
  res.json({ ok: true, ...outcome, stats: store.getStoreStats() });
});

app.post('/api/admin/history/return-to-pool', (req, res) => {
  const runIds = Array.isArray(req.body?.runIds) ? req.body.runIds : [];
  const filters = req.body?.filters && typeof req.body.filters === 'object' ? req.body.filters : null;
  try {
    const outcome = store.bulkReturnRunsToPool({
      runIds,
      filters,
      actorId: req.adminId,
      actorRole: 'admin',
      reason: cleanText(req.body?.reason || '')
    });
    store.logAdminAction({
      adminId: req.adminId,
      action: 'bulk_return_history_to_pool',
      targetType: 'run',
      targetId: 'bulk',
      details: { runIds: runIds.slice(0, 200), filters: filters || null, ...outcome }
    });
    res.json({ ok: true, ...outcome, stats: store.getStoreStats() });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Bulk return failed.' });
  }
});

// Historically a hard delete of history entries. Kept at the same path for
// backward compatibility but now archives + returns leads to the pool -
// identical outcome to POST /api/admin/history/return-to-pool.
app.post('/api/admin/history/bulk-delete', (req, res) => {
  const runIds = Array.isArray(req.body?.runIds) ? req.body.runIds : [];
  const filters = req.body?.filters && typeof req.body.filters === 'object' ? req.body.filters : null;
  try {
    const outcome = store.bulkReturnRunsToPool({
      runIds,
      filters,
      actorId: req.adminId,
      actorRole: 'admin',
      reason: 'legacy_bulk_delete_redirect'
    });
    store.logAdminAction({
      adminId: cleanText(req.body?.adminId || 'admin'),
      action: 'bulk_return_history_to_pool',
      targetType: 'run',
      targetId: 'bulk',
      details: { runIds: runIds.slice(0, 200), filters: filters || null, ...outcome }
    });
    res.json({ ok: true, ...outcome, stats: store.getStoreStats() });
  } catch (error) {
    res.status(400).json({ error: error.message || 'No history entries matched.' });
  }
});

app.post('/api/admin/history/bulk-reset', (req, res) => {
  const runIds = [...new Set((Array.isArray(req.body?.runIds) ? req.body.runIds : []).map(String).filter(Boolean))];
  if (!runIds.length) return res.status(400).json({ error: 'runIds is required.' });
  const resetIds = store.resetRunsCompanies(runIds);
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'reset_history_leads_to_pool',
    targetType: 'run',
    targetId: 'bulk',
    details: { runIds, count: resetIds.length }
  });
  res.json({ ok: true, resetIds, stats: store.getStoreStats() });
});

app.get('/api/admin/runs/:id', (req, res) => {
  const detail = store.getRunDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Run not found.' });
  const page = paginateCompanyList(detail.companies, req.query);
  res.json({ run: detail.run, companies: page.items, total: page.total, page: page.page, pageSize: page.pageSize, paginated: page.paginated });
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

// Historically a hard delete of the run and its leads. Now redirects to the
// same archive + return-to-pool flow as the honestly-named endpoint - no
// company, comment, folder or CRM status is ever destroyed by this route.
app.delete('/api/admin/runs/:id', (req, res) => {
  const outcome = store.returnRunToPool(req.params.id, {
    actorId: req.adminId,
    actorRole: 'admin',
    reason: 'legacy_delete_redirect'
  });
  if (!outcome) return res.status(404).json({ error: 'Run not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'return_query_to_pool',
    targetType: 'run',
    targetId: req.params.id,
    details: { alreadyReturned: outcome.alreadyReturned, ...outcome.result }
  });
  res.json({ ok: true, ...outcome, stats: store.getStoreStats() });
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

// Historically a hard delete of a single lead. Now returns it to the pool -
// contacts, comments, CRM status and folders are preserved.
app.delete('/api/admin/runs/:runId/leads/:leadId', (req, res) => {
  const result = store.returnLeadsToPool([req.params.leadId], {
    actorId: req.adminId,
    actorRole: 'admin',
    reason: 'legacy_delete_redirect'
  });
  if (!result.returned.length && !result.alreadyInPool.length) return res.status(404).json({ error: 'Lead not found.' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: 'return_lead_to_pool',
    targetType: 'lead',
    targetId: req.params.leadId,
    details: { runId: req.params.runId, ...result }
  });
  res.json({ ok: true, ...result, stats: store.getStoreStats() });
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

// Historically a hard delete of the selected leads. Now returns them to the
// pool in one transaction-like batch (see store.returnLeadsToPool).
app.delete('/api/admin/leads', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const result = store.returnLeadsToPool(ids, { actorId: req.adminId, actorRole: 'admin', reason: 'legacy_delete_redirect' });
  store.logAdminAction({
    adminId: cleanText(req.body?.adminId || 'admin'),
    action: result.returned.length > 1 ? 'return_selected_leads_to_pool' : 'return_lead_to_pool',
    targetType: 'lead',
    targetId: result.returned.length === 1 ? result.returned[0] : 'bulk',
    details: result
  });
  res.json({ ok: true, ...result, stats: store.getStoreStats() });
});

app.get('/api/leads/:id', (req, res) => {
  const company = store.getCompany(String(req.params.id));
  if (!company) return res.status(404).json({ error: 'Lead not found.' });
  if (!requireWorkerCompanyRelation(req, res, company)) return;
  res.json({ company });
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

// =====================================================================
// POOL RETURN - worker + admin. A worker may only return their own leads/
// runs; an admin may act on any. Every action is idempotent and reports a
// precise breakdown instead of a blind "ok".
// =====================================================================

// B. Single lead / selected leads ("Wroc lead do puli" / "Wroc zaznaczone leady do puli").
app.post('/api/leads/:id/return-to-pool', (req, res) => {
  const existing = store.getCompany(String(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });
  if (!requireWorkerLeadAccess(req, res, existing)) return;
  const actor = resolveActor(req);
  const result = store.returnLeadsToPool([req.params.id], { actorId: actor.actorId, actorRole: actor.actorRole });
  store.logAdminAction({
    adminId: actor.actorId || actor.actorRole,
    action: 'return_lead_to_pool',
    targetType: 'lead',
    targetId: req.params.id,
    details: result
  });
  res.json({ ok: true, ...result });
});

app.post('/api/leads/return-to-pool', (req, res) => {
  const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : []).map(String).filter(Boolean))];
  if (!ids.length) return res.status(400).json({ error: 'ids is required.' });
  const actor = resolveActor(req);
  let allowedIds = ids;
  if (actor.actorRole !== 'admin') {
    if (!actor.workerId) return res.status(401).json({ error: 'Worker identity is required.' });
    allowedIds = ids.filter((id) => assignedWorkerId(store.getCompany(id)) === actor.workerId);
  }
  const result = store.returnLeadsToPool(allowedIds, { actorId: actor.actorId, actorRole: actor.actorRole });
  const forbiddenIds = ids.filter((id) => !allowedIds.includes(id));
  for (const id of forbiddenIds) result.skipped.push({ id, reason: 'not_owned_by_requester' });
  store.logAdminAction({
    adminId: actor.actorId || actor.actorRole,
    action: 'return_selected_leads_to_pool',
    targetType: 'lead',
    targetId: 'bulk',
    details: result
  });
  res.json({ ok: true, ...result });
});

// A. Whole query back to the pool ("Wroc query do puli").
app.post('/api/runs/:id/return-to-pool', (req, res) => {
  const run = store.getRun(String(req.params.id));
  if (!run) return res.status(404).json({ error: 'Run not found.' });
  if (!requireWorkerRunAccess(req, res, run)) return;
  const actor = resolveActor(req);
  const outcome = store.returnRunToPool(req.params.id, { actorId: actor.actorId, actorRole: actor.actorRole });
  store.logAdminAction({
    adminId: actor.actorId || actor.actorRole,
    action: 'return_query_to_pool',
    targetType: 'run',
    targetId: req.params.id,
    details: { alreadyReturned: outcome.alreadyReturned, ...outcome.result }
  });
  res.json({ ok: true, ...outcome });
});

// C. All leads of one query back to the pool, without archiving the query
// itself ("Wroc wszystkie leady tego zapytania do puli").
app.post('/api/runs/:id/leads/return-to-pool', (req, res) => {
  const run = store.getRun(String(req.params.id));
  if (!run) return res.status(404).json({ error: 'Run not found.' });
  if (!requireWorkerRunAccess(req, res, run)) return;
  const actor = resolveActor(req);
  const outcome = store.returnRunLeadsToPool(req.params.id, { actorId: actor.actorId, actorRole: actor.actorRole });
  store.logAdminAction({
    adminId: actor.actorId || actor.actorRole,
    action: 'return_query_leads_to_pool',
    targetType: 'run',
    targetId: req.params.id,
    details: outcome.result
  });
  res.json({ ok: true, ...outcome });
});

// =====================================================================
// CRM STATUS - separate axis from the pool/lead status above; survives pool
// returns and reassignment untouched.
// =====================================================================

app.get('/api/crm-statuses', (_req, res) => {
  res.json({ statuses: store.listCrmStatuses() });
});

app.post('/api/companies/:id/crm-status', (req, res) => {
  const existing = store.getCompany(String(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Company not found.' });
  if (!requireWorkerCompanyRelation(req, res, existing)) return;
  const actor = resolveActor(req);
  const company = store.setCompanyCrmStatus(req.params.id, {
    status: cleanText(req.body?.status || ''),
    workerId: actor.workerId || actor.actorId,
    actorRole: actor.actorRole,
    note: req.body?.note
  });
  if (!company) return res.status(404).json({ error: 'Company not found.' });
  store.logAdminAction({
    adminId: actor.actorId || actor.actorRole,
    action: 'update_crm_status',
    targetType: 'lead',
    targetId: req.params.id,
    details: { status: company.crm_status }
  });
  res.json({ ok: true, company });
});

// =====================================================================
// COMMENTS - separate entity from status; soft-deletable, own-comment-only
// edit/delete for workers, full access for admin.
// =====================================================================

app.get('/api/companies/:id/comments', (req, res) => {
  const existing = store.getCompany(String(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Company not found.' });
  if (!requireWorkerCompanyRelation(req, res, existing)) return;
  res.json({ comments: store.listComments(req.params.id, { includeArchived: isAdminAuthorized(req) }) });
});

app.post('/api/companies/:id/comments', (req, res) => {
  const existing = store.getCompany(String(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Company not found.' });
  if (!requireWorkerCompanyRelation(req, res, existing)) return;
  const actor = resolveActor(req);
  if (actor.actorRole === 'worker' && !actor.workerId) return res.status(401).json({ error: 'Worker identity is required.' });
  try {
    const comment = store.addComment(req.params.id, {
      authorId: actor.actorId,
      authorRole: actor.actorRole,
      text: req.body?.text || '',
      source: cleanText(req.body?.source || ''),
      parserQueryId: cleanText(req.body?.parserQueryId || '')
    });
    if (!comment) return res.status(404).json({ error: 'Company not found.' });
    res.status(201).json({ ok: true, comment });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid comment.' });
  }
});

app.patch('/api/comments/:commentId', (req, res) => {
  const actor = resolveActor(req);
  if (actor.actorRole === 'worker' && !actor.workerId) return res.status(401).json({ error: 'Worker identity is required.' });
  try {
    const comment = store.editComment(req.params.commentId, {
      authorId: actor.actorId,
      authorRole: actor.actorRole,
      text: req.body?.text || ''
    });
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    res.json({ ok: true, comment });
  } catch (error) {
    res.status(403).json({ error: error.message || 'You can only edit your own comment.' });
  }
});

app.delete('/api/comments/:commentId', (req, res) => {
  const actor = resolveActor(req);
  if (actor.actorRole === 'worker' && !actor.workerId) return res.status(401).json({ error: 'Worker identity is required.' });
  try {
    const comment = store.softDeleteComment(req.params.commentId, { authorId: actor.actorId, authorRole: actor.actorRole });
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    res.json({ ok: true, comment });
  } catch (error) {
    res.status(403).json({ error: error.message || 'You can only delete your own comment.' });
  }
});

// =====================================================================
// SAVED FOLDERS + SAVED COMPANIES ("Zapisane"). Worker-owned; admin can view
// or manage on behalf of a worker by passing workerId explicitly.
// =====================================================================

app.get('/api/saved/folders', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  res.json({ folders: store.listFolders(workerId) });
});

app.post('/api/saved/folders', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  try {
    const folder = store.createFolder(workerId, req.body?.name || '');
    res.status(201).json({ ok: true, folder });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid folder name.' });
  }
});

app.patch('/api/saved/folders/:folderId', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  try {
    const folder = store.renameFolder(workerId, req.params.folderId, req.body?.name || '');
    if (!folder) return res.status(404).json({ error: 'Folder not found.' });
    res.json({ ok: true, folder });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid folder name.' });
  }
});

app.delete('/api/saved/folders/:folderId', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  try {
    const result = store.deleteFolder(workerId, req.params.folderId, { moveToFolderId: req.body?.moveToFolderId || null });
    if (!result) return res.status(404).json({ error: 'Folder not found.' });
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not delete folder.' });
  }
});

app.get('/api/saved', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  const page = store.listSavedCompaniesForWorker(workerId, {
    folderId: req.query.folderId ?? '',
    q: req.query.q || '',
    status: req.query.status || '',
    crmStatus: req.query.crmStatus || '',
    city: req.query.city || '',
    country: req.query.country || '',
    category: req.query.category || '',
    sort: req.query.sort || 'newest',
    page: req.query.page,
    pageSize: req.query.pageSize
  });
  res.json(page);
});

app.post('/api/saved', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  const companyIds = Array.isArray(req.body?.companyIds) ? req.body.companyIds : req.body?.companyId ? [req.body.companyId] : [];
  if (!companyIds.length) return res.status(400).json({ error: 'companyIds is required.' });
  try {
    const result = store.saveCompaniesForWorker(workerId, companyIds, req.body?.folderId || null);
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not save companies.' });
  }
});

app.post('/api/saved/move', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  const companyIds = Array.isArray(req.body?.companyIds) ? req.body.companyIds : [];
  if (!companyIds.length) return res.status(400).json({ error: 'companyIds is required.' });
  try {
    const moved = store.moveCompaniesBetweenFolders(workerId, companyIds, req.body?.fromFolderId || null, req.body?.toFolderId || null);
    res.json({ ok: true, moved });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not move companies.' });
  }
});

app.delete('/api/saved', (req, res) => {
  const workerId = requireActingWorkerId(req, res);
  if (!workerId) return;
  const companyIds = Array.isArray(req.body?.companyIds) ? req.body.companyIds : [];
  if (!companyIds.length) return res.status(400).json({ error: 'companyIds is required.' });
  const removed =
    req.body?.folderId !== undefined
      ? store.removeCompaniesFromFolderForWorker(workerId, companyIds, req.body.folderId || null)
      : store.unsaveCompaniesForWorker(workerId, companyIds);
  res.json({ ok: true, removed });
});

app.get('/api/academy/progress', (req, res) => {
  const sessionWorkerId = requestWorkerId(req);
  if (!sessionWorkerId) return res.status(401).json({ error: 'Sign in required.' });
  res.json({ progress: store.getAcademyProgress(sessionWorkerId) });
});

// Persists the Academy toolbar language toggle onto the current session, so
// requestAcademyLanguage() (used by AI-training personas/finish-session
// feedback/grade-answer) reflects the trainee's actually-selected UI
// language instead of only the language captured once at login. Called from
// the [data-set-lang] click handler in public/academy/app.js. See round-6 QA
// finding 3.
app.post('/api/academy/session-language', (req, res) => {
  const token = sessionToken(req);
  const session = token ? store.getSession(token) : null;
  if (!session) return res.status(401).json({ error: 'Sign in required.' });
  const requested = String(req.body?.language || '').toLowerCase();
  if (!['pl', 'ru', 'en'].includes(requested)) {
    return res.status(400).json({ error: 'language must be "pl", "ru" or "en".' });
  }
  const updated = store.setSessionLanguage(token, requested);
  if (!updated) return res.status(401).json({ error: 'Sign in required.' });
  res.json({ ok: true, language: updated.language });
});

app.post('/api/academy/progress', (req, res) => {
  const sessionWorkerId = requestWorkerId(req);
  if (!sessionWorkerId) return res.status(401).json({ error: 'Sign in required.' });
  const progress = store.saveAcademyProgress(sessionWorkerId, req.body || {});
  res.json({ ok: true, progress });
});

app.get('/api/academy/ai-training/personas', (req, res) => {
  const language = requestAcademyLanguage(req);
  res.json({
    personas: AI_TRAINING_PERSONAS.map(({ id, label, serviceId, difficulty, readiness }) => ({
      id,
      label: localizedPersonaLabel(label, language),
      serviceId,
      difficulty,
      readiness
    }))
  });
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
          content: `${AI_TRAINING_ROLEPLAY_RULES}\n\nPersona klienta:\n${personaSystemPrompt(persona)}\n\nTo worker dzwoni pierwszy. Zacznij od krotkiej reakcji klienta, np. "Slucham?" albo "Kto mowi?", zgodnie z persona.`
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

    res.json({
      sessionId: session.sessionId,
      clientType: persona.id,
      personaLabel: localizedPersonaLabel(persona.label, requestAcademyLanguage(req)),
      openingLine
    });
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
          content: `${AI_TRAINING_ROLEPLAY_RULES}\n\nPersona klienta:\n${personaSystemPrompt(persona)}\n\nKontynuuj rozmowe. Odpowiadaj tylko jako klient.`
        },
        // Only the recent tail is resent to the API each turn (full history
        // stays persisted in the session) - the model needs local context,
        // not the entire transcript replayed and re-billed on every message.
        ...updated.messages.slice(-14).map((message) => ({
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

    // Feedback CONTENT (coaching analysis) follows the trainee's UI language,
    // unlike the roleplay persona above which is a deliberately Polish
    // verbatim call-script. See requestAcademyLanguage/localizedPersonaLabel.
    const feedbackLanguage = requestAcademyLanguage(req);
    const finishLanguageInstruction =
      feedbackLanguage === 'ru' ? 'Пиши по-русски, конкретно и кратко.' : 'Pisz po polsku, konkretnie i krotko.';

    const response = await openai.responses.create({
      model: AI_TRAINING_MODEL,
      input: [
        {
          role: 'system',
          content: `Jestes trenerem sprzedazy telefonicznej Aura Global Merchants. Ocen rozmowe worker-a z klientem: "${localizedPersonaLabel(persona?.label, 'pl') || session.clientType}". Kryteria: konkretna obserwacja o firmie, pytania o problem, krotkie wyjasnienie wartosci, brak nachalnej sprzedazy, nieobiecywanie dokladnej ceny przez telefon, proba umowienia konkretnej konsultacji. Ocen 0-100, meetingBooked, good, bad, improvements. ${finishLanguageInstruction}`
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

// Grades a free-text ("open") Academy quiz/exam answer with AI — used by both
// per-service quizzes and the open-ended final-exam questions. Score comes back
// already vetted by the model (not a raw client-supplied number), which is the
// closest we can get to server-side validation for free-text answers.
app.post('/api/academy/grade-answer', async (req, res) => {
  try {
    if (!openai) return res.status(400).json({ error: 'OPENAI_API_KEY не указан в .env.' });
    const workerId = requestWorkerId(req);
    if (!workerId) return res.status(401).json({ error: 'Sign in required.' });
    const question = cleanText(req.body?.question || '').slice(0, 2000);
    const gradingNotes = cleanText(req.body?.gradingNotes || '').slice(0, 2000);
    const answer = cleanText(req.body?.answer || '').slice(0, 4000);
    if (!question || !answer) return res.status(400).json({ error: 'Pytanie i odpowiedź są wymagane.' });

    // Same convention as the finish-session feedback prompt above: the
    // question/gradingNotes text is verbatim authored Polish, but the
    // FEEDBACK the model writes back should match the trainee's UI language.
    const gradeLanguage = requestAcademyLanguage(req);
    const gradeLanguageInstruction =
      gradeLanguage === 'ru'
        ? 'Напиши краткий фидбэк по-русски'
        : 'napisz krotki feedback po polsku';

    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['score', 'feedback', 'strengths', 'improvements'],
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        feedback: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } }
      }
    };

    const response = await openai.responses.create({
      model: AI_TRAINING_MODEL,
      input: [
        {
          role: 'system',
          content: `Jestes trenerem sprzedazy telefonicznej Aura Global Merchants oceniajacym pisemna odpowiedz stazysty na pytanie treningowe z Akademii sprzedazy. Pytanie: "${question}". Kryteria dobrej odpowiedzi: ${gradingNotes || 'trafna diagnoza potrzeby klienta, konkretny i zywy jezyk sprzedazowy (nie ksiazkowy), brak nachalnosci, nieobiecywanie dokladnej ceny ani gwarantowanego efektu, dazenie do konkretnego nastepnego kroku (spotkanie/konsultacja).'} Ocen odpowiedz od 0 do 100, ${gradeLanguageInstruction}, liste mocnych stron i liste rzeczy do poprawy. Badz konkretny i rzeczowy, nie ogolnikowy.`
        },
        { role: 'user', content: answer }
      ],
      max_output_tokens: 500,
      text: {
        format: {
          type: 'json_schema',
          name: 'academy_answer_feedback',
          strict: true,
          schema
        }
      }
    });

    const feedback = JSON.parse(response.output_text);
    const usage = response.usage || {};
    store.logAiUsage({
      workerId,
      feature: 'academy_grading',
      model: AI_TRAINING_MODEL,
      promptTokens: usage.input_tokens || 0,
      completionTokens: usage.output_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      estimatedCost: estimateAiCost(AI_TRAINING_MODEL, usage.input_tokens || 0, usage.output_tokens || 0)
    });

    res.json({ result: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Błąd oceny odpowiedzi.' });
  }
});

// Server-side recompute of the final exam score for single/case questions (can't be
// spoofed by a crafted POST body like the generic /api/academy/progress endpoint can).
// Open-ended questions are pre-graded per-question via /api/academy/grade-answer and
// their scores are passed in as openScores — already vetted by the model, just not
// re-verified against the transcript here.
app.post('/api/academy/final-exam/submit', (req, res) => {
  try {
    const workerId = requestWorkerId(req);
    if (!workerId) return res.status(401).json({ error: 'Sign in required.' });
    const answers = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
    const openScores = req.body?.openScores && typeof req.body.openScores === 'object' ? req.body.openScores : {};

    let earned = 0;
    let scored = 0;
    FINAL_EXAM.forEach((question, index) => {
      if (question.type === 'open') {
        const value = Number(openScores[index]);
        if (Number.isFinite(value)) {
          earned += Math.max(0, Math.min(100, value)) / 100;
          scored += 1;
        }
        return;
      }
      scored += 1;
      if (Number(answers[index]) === question.correct) earned += 1;
    });

    const score = scored ? Math.round((earned / scored) * 100) : 0;
    const passed = score >= 80;
    let progress = store.saveAcademyProgress(workerId, { quizScores: { final: score } });
    if (passed) {
      const completed = new Set(progress.completedModules || []);
      completed.add('final');
      progress = store.saveAcademyProgress(workerId, { completedModules: [...completed] });
    }
    res.json({ score, passed, progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Błąd sprawdzania testu.' });
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

app.get('/api/admin/ai-usage/run/:runId', (req, res) => {
  res.json(store.getAiUsageForRun(req.params.runId));
});

app.get('/api/admin/ai-usage/company/:companyId', (req, res) => {
  res.json(store.getAiUsageForCompany(req.params.companyId));
});

app.get('/api/admin/audit', (req, res) => {
  res.json({ actions: store.listAuditLog({ limit: Number.parseInt(req.query.limit, 10) || 200 }) });
});

app.get('/api/admin/settings', (req, res) => {
  res.json({ settings: store.getSettings() });
});

app.patch('/api/admin/settings', (req, res) => {
  const settings = store.updateSettings(req.body || {});
  store.logAdminAction({ adminId: cleanText(req.body?.adminId || 'admin'), action: 'update_settings', targetType: 'settings', targetId: 'global', details: settings });
  res.json({ ok: true, settings });
});

// Round 5: admin-only visibility over every AI Search Job (any worker's),
// for the admin panel's AI-search monitoring view.
app.get('/api/admin/ai-search/jobs', (req, res) => {
  res.json({ jobs: store.listAiSearchJobs({ limit: Number.parseInt(req.query.limit, 10) || 100 }) });
});

// Powers "suggest as you type" for the city/country/category/worker filter
// inputs across History, Leads and worker search - always scans the full,
// permanently-kept history (never a paginated slice), so anything ever
// recorded is findable from the very first keystroke.
app.get('/api/admin/filters/suggestions', (req, res) => {
  const field = cleanText(req.query.field || '');
  if (!['city', 'country', 'category', 'workerId'].includes(field)) {
    return res.status(400).json({ error: 'field must be one of city, country, category, workerId.' });
  }
  res.json({ suggestions: store.getFilterFacets({ field, q: req.query.q || '', limit: Number.parseInt(req.query.limit, 10) || 20 }) });
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
    const session = currentSession(req);
    if (!isAdminAuthorized(req) && !(session && session.role === 'worker')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
      return res.status(401).json({ error: 'Login required for AI analysis.' });
    }
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
      workerId: requestWorkerId(req),
      companyId
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

// Registry APIs (CEIDG, KRS) are external government services with no SLA -
// without a timeout a slow/hanging response leaves the request (and the
// worker waiting on it) stuck indefinitely.
async function fetchWithTimeout(url, options = {}, timeoutMs = REGISTRY_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Registry request timed out after ${Math.round(timeoutMs / 1000)}s: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/registry/ceidg/search', async (req, res) => {
  const session = currentSession(req);
  if (!isAdminAuthorized(req) && !(session && session.role === 'worker')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
    return res.status(401).json({ error: 'Login required.' });
  }
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
    const response = await fetchWithTimeout(url, {
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
  const session = currentSession(req);
  if (!isAdminAuthorized(req) && !(session && session.role === 'worker')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Aura Admin"');
    return res.status(401).json({ error: 'Login required.' });
  }
  const krs = cleanIdentifier(req.params.krs);
  if (!krs) return res.status(400).json({ error: 'KRS is required.' });

  try {
    const url = `https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/${krs}`;
    const response = await fetchWithTimeout(url, {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT }
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Final safety net: catches errors passed to next(err) or thrown synchronously
// inside a route handler, so a single bad request returns a clean 500 instead
// of an unhandled exception that could otherwise crash the process.
app.use((err, req, res, _next) => {
  console.error(`[express error] ${req.method} ${req.originalUrl}:`, err?.stack || err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error.' });
});

const httpServer = app.listen(PORT, HOST, () => {
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
      const country = cleanText(item.country || item.kraj || getDiscoveryContext().country || '');
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

function normalizeSiteStatusFilter(value) {
  const raw = String(value || '').trim().toLowerCase();
  return ['no_site', 'has_site', 'weak_site', 'uncertain'].includes(raw) ? raw : 'all';
}

// Mirrors the client-side siteFilterMatches()/hasAnySocial() in public/app.js so
// the single search panel's "site status / score / social / phone / email"
// controls genuinely gate which analyzed companies count toward the requested
// limit, instead of being decorative fields that never reach the backend.
const NO_SITE_STATUSES = new Set([
  'NO_WEBSITE_CONFIRMED',
  'SOCIAL_ONLY',
  'DIRECTORY_ONLY',
  'MARKETPLACE_ONLY',
  'BROKEN_WEBSITE',
  'FREE_SUBDOMAIN'
]);

function siteStatusMatchesFilter(status, filter) {
  if (!filter || filter === 'all') return true;
  if (filter === 'no_site') return NO_SITE_STATUSES.has(status);
  if (filter === 'has_site') return status === 'WEBSITE_FOUND';
  if (filter === 'weak_site') return ['ONE_PAGE_PLACEHOLDER', 'FREE_SUBDOMAIN', 'BROKEN_WEBSITE'].includes(status);
  if (filter === 'uncertain') return status === 'UNCERTAIN';
  return true;
}

function hasAnySocialInput(input = {}) {
  const social = input.social_profiles || {};
  return Boolean(social.instagram || social.facebook || social.tiktok || /instagram|facebook|tiktok/i.test(input.source_profile || ''));
}

function matchesDiscoveryFilters(analyzedResult, filters) {
  const input = analyzedResult.input || {};
  const analysis = analyzedResult.analysis || {};
  const status = analysis.website_status || analyzedResult.websiteResolution?.websiteStatus || 'UNCERTAIN';
  if (filters.minScore && Number(analysis.lead_score || 0) < filters.minScore) return false;
  if (!siteStatusMatchesFilter(status, filters.siteStatus)) return false;
  if (filters.hasSocial && !hasAnySocialInput(input)) return false;
  if (filters.hasPhone && !input.phone) return false;
  if (filters.hasEmail && !input.email) return false;
  return true;
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
  let progressNewCount = 0;
  let progressDuplicateCount = 0;
  const progressCompanyIds = [];

  // Every discovery job (and every nested async call it makes - Google Places,
  // Amazon Location, cross-source enrichment, phone normalization, etc.) runs
  // inside this AsyncLocalStorage context, so params.country/city/radiusKm
  // stay isolated per job even when multiple discovery jobs run concurrently.
  await discoveryContextStorage.run(
    { country: params.country, radiusKm: params.radiusKm, city: params.city },
    async () => {
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

    // `guard.stopped` is a true job-wide stop (user cancel via the /cancel
    // endpoint, or the whole-job timeout below) and must keep aborting every
    // remaining niche/source. Per-niche duplicate exhaustion is a *much*
    // weaker signal - it only means THIS niche/source combo has stopped
    // turning up new companies, not that the whole search is done - so it is
    // tracked separately in `guard.stoppedNiches` (a Set of niche names) and
    // only that specific niche's remaining district/query-variant loops
    // check it (see discoverCompaniesFromAmazonLocationExpanded/
    // discoverCompaniesFromGooglePlacesExpanded/
    // discoverCompaniesFromPublicSearchExpanded below). This replaces the old
    // single job-wide `duplicateStreak` counter, which used to abort every
    // other, never-yet-searched niche the moment any one niche/source ran
    // dry.
    const guard = { stopped: false, reason: '', stoppedNiches: new Set() };
    const jobRef = getDiscoveryJob(jobId);
    if (jobRef) jobRef.guard = guard;
    const duplicateStreakByNiche = new Map();
    let progressAttempts = 0;

    const discovery = await Promise.race([
      discoverCompaniesBatchWithoutAI({
        niches: params.niches,
        city: params.city,
        district: params.district,
        limit: candidateLimit,
        sourceFocus: params.sourceFocus,
        workerId: params.workerId,
        runId: run.id,
        guard,
        onProgress(event) {
          progressAttempts += 1;
          const progressRelevance = applyCategoryRelevance(normalizeItems(event.companies || []), params.niches);
          const claimedPreview = store.claimCompaniesForRun(progressRelevance.companies, {
            runId: run.id,
            workerId: params.workerId,
            limit: params.limit
          });
          progressCompanyIds.push(...(claimedPreview.companyIds || []));
          progressNewCount += claimedPreview.newCount;
          progressDuplicateCount += claimedPreview.duplicateCount;

          // Scope the duplicate streak to the niche this particular progress
          // event came from, not to the job as a whole - a niche whose
          // sources have run dry should stop wasting time on itself, but
          // must never abort niches that have not been searched yet.
          const nicheKey = event.niche || '';
          const previousStreak = duplicateStreakByNiche.get(nicheKey) || 0;
          const nextStreak =
            claimedPreview.newCount === 0 && claimedPreview.duplicateCount > 0
              ? previousStreak + 1
              : claimedPreview.newCount > 0
                ? 0
                : previousStreak;
          duplicateStreakByNiche.set(nicheKey, nextStreak);
          const nicheJustExhausted = nextStreak >= MAX_DUPLICATE_STREAK && !guard.stoppedNiches.has(nicheKey);
          if (nicheJustExhausted) {
            guard.stoppedNiches.add(nicheKey);
          }

          updateDiscoveryJob(jobId, {
            appendCompanies: claimedPreview.companies,
            appendQueries: event.queries || [],
            appendWarnings: event.warnings || [],
            progress: {
              message: guard.stoppedNiches.has(nicheKey)
                ? `Источник исчерпан для категории "${nicheKey}": несколько подряд результатов оказались уже известными компаниями. Продолжаю с другими категориями.`
                : event.message || 'Ищу компании...',
              currentNiche: event.niche || '',
              currentSource: event.source || '',
              processedNiches: event.processedNiches ?? 0,
              totalNiches: params.niches.length,
              foundCount: claimedPreview.companies.length || event.foundSoFar || event.count || 0,
              newCount: progressNewCount,
              duplicateCount: progressDuplicateCount,
              attempts: progressAttempts
            }
          });
        }
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          guard.stopped = true;
          guard.reason = 'timeout';
          reject(Object.assign(new Error('Поиск прерван по тайм-ауту.'), { code: 'DISCOVERY_TIMEOUT' }));
        }, MAX_DISCOVERY_JOB_MS);
      })
    ]);

    const relevance = applyCategoryRelevance(normalizeItems(discovery.companies || []), params.niches);
    const rawCompanies = relevance.companies.slice(0, candidateLimit);
    // Claim the whole over-fetched candidate buffer (not just `params.limit`),
    // because the site-status/score/social/phone/email filters below only
    // resolve once each candidate is analyzed - some candidates will not match
    // and must not consume the requested slot count.
    const claimedFinal = store.claimCompaniesForRun(rawCompanies, {
      runId: run.id,
      workerId: params.workerId,
      limit: candidateLimit
    });
    const candidates = claimedFinal.companies;
    const rawFoundCount = rawCompanies.length;
    const newCount = claimedFinal.newCount;
    const duplicateCount = claimedFinal.duplicateCount;
    const companyIds = claimedFinal.companyIds;
    store.addCompanyIdsToRun(run.id, companyIds);

    const discoveryFilters = {
      siteStatus: params.siteStatus || 'all',
      minScore: Number(params.minScore || 0),
      hasSocial: Boolean(params.hasSocial),
      hasPhone: Boolean(params.hasPhone),
      hasEmail: Boolean(params.hasEmail)
    };

    // ---- Sequential per-company pipeline -------------------------------
    // Companies are analyzed ONE AT A TIME, in discovery order (not
    // Promise.all'd), so each finished card can stream to the dashboard the
    // moment it is fully ready (website checked, scored, AI-analyzed) -
    // instead of the previous two-phase flow where /api/discover only
    // returned raw, unanalyzed rows and the frontend had to fire a second,
    // whole-batch-blocking /api/analyze call before anything useful appeared.
    const matchedCompanies = [];
    const warningsFromAnalysis = [];
    let analyzedCount = 0;
    const analysisTarget = Math.min(candidates.length, params.limit);
    const analysisDeadline = runStartedAt + MAX_DISCOVERY_JOB_MS - 5000;

    updateDiscoveryJob(jobId, {
      analyzedCompanies: [],
      progress: {
        message: `Найдено ${candidates.length} кандидатов. Проверяю сайты по одному...`,
        currentNiche: '',
        currentSource: discovery.source || params.sourceFocus,
        processedNiches: params.niches.length,
        totalNiches: params.niches.length,
        foundCount: 0,
        analyzedCount: 0,
        analysisTarget
      }
    });

    for (const candidate of candidates) {
      if (guard.stopped || matchedCompanies.length >= params.limit) break;
      if (performance.now() > analysisDeadline) {
        warningsFromAnalysis.push('Проверка сайтов прервана по тайм-ауту, часть кандидатов не была проверена.');
        break;
      }

      analyzedCount += 1;
      const companyId = candidate._companyId;
      let analyzed;
      try {
        analyzed = await analyzeLead(candidate, {
          useAi: Boolean(params.useAi),
          useWebSearch: Boolean(params.useWebSearch),
          model: DEFAULT_MODEL,
          searchModel: SEARCH_MODEL,
          language: params.language
        });
      } catch (error) {
        // One company's failure (a network blip, a hung fetch, a malformed
        // page) must never sink the rest of the batch - log it, tell the
        // user, and move on to the next candidate in order.
        console.error(`[discover-job] id=${jobId} analyzeLead failed for "${candidate.company || companyId}":`, error);
        warningsFromAnalysis.push(`Не удалось проверить "${candidate.company || 'компанию'}": ${error.message || 'ошибка проверки сайта'}.`);
        continue;
      }

      analyzed._companyId = companyId;
      analyzed.input = { ...analyzed.input, _companyId: companyId };

      if (companyId) {
        store.updateCompanyAnalysis(companyId, {
          websiteResolution: analyzed.websiteResolution,
          parsed: analyzed.parsed,
          heuristic: analyzed.heuristic,
          analysis: analyzed.analysis
        });
      }

      // Reuse guard: a company returned to the pool (hidden_from_lists) can
      // resurface in a later discovery run and reach this exact point again.
      // If it already has a completed AI analysis for the same resolved
      // website, reuse that result instead of paying for another OpenAI
      // call - this closes the gap that let a re-discovered lead trigger a
      // second full paid analysis despite already having a good stored one.
      const existingCompanyForReuse = companyId ? store.getCompany(companyId) : null;
      const existingAiAnalysis = existingCompanyForReuse?.aiSiteAnalysis;
      const existingAiCompleted = Boolean(existingAiAnalysis?.status === 'COMPLETED' && existingAiAnalysis?.data);
      const existingAnalyzedUrl =
        existingCompanyForReuse?.website?.resolution?.selectedUrl || existingCompanyForReuse?.website?.normalizedUrl || '';
      const currentAnalyzedUrl = analyzed.websiteResolution?.selectedUrl || analyzed.parsed?.normalizedUrl || '';
      const canReuseAiAnalysis = Boolean(
        existingAiCompleted && existingAnalyzedUrl && currentAnalyzedUrl && existingAnalyzedUrl === currentAnalyzedUrl
      );

      // Automatic per-card AI write-up, generated right here from this one
      // company's own freshly-collected facts (never from a shared/global
      // variable - see analyzeSiteCardWithOpenAI's explicit argument list),
      // so the card is already complete with its personalized analysis the
      // moment it reaches the dashboard, with no separate manual AI click.
      if (canReuseAiAnalysis) {
        analyzed.aiSiteAnalysis = existingAiAnalysis;
      } else {
        try {
          const aiAnalysis = await analyzeSiteCardWithOpenAI({
            item: analyzed.input,
            parsed: analyzed.parsed,
            websiteResolution: analyzed.websiteResolution,
            heuristic: analyzed.analysis,
            model: DEFAULT_MODEL,
            language: params.language || 'ru',
            workerId: params.workerId,
            companyId,
            runId: run.id
          });
          if (aiAnalysis) {
            analyzed.aiSiteAnalysis = {
              status: 'COMPLETED',
              version: aiAnalysis.ai_analysis_version || 1,
              analyzed_at: aiAnalysis.ai_analyzed_at || new Date().toISOString(),
              company_data_version: aiAnalysis.company_data_version || 1,
              data: aiAnalysis
            };
            if (companyId) store.updateCompanyAiAnalysis(companyId, analyzed.aiSiteAnalysis);
          }
        } catch (error) {
          console.error(`[discover-job] id=${jobId} AI card analysis failed for "${candidate.company || companyId}":`, error);
          analyzed.aiSiteAnalysis = {
            status: 'FAILED',
            version: 1,
            analyzed_at: new Date().toISOString(),
            company_data_version: 1,
            error: error.message || 'AI analysis failed'
          };
        }
      }

      if (matchesDiscoveryFilters(analyzed, discoveryFilters)) {
        matchedCompanies.push(analyzed);
      }

      updateDiscoveryJob(jobId, {
        analyzedCompanies: matchedCompanies,
        appendWarnings: warningsFromAnalysis.splice(0, warningsFromAnalysis.length),
        progress: {
          message: `Проверено ${analyzedCount} из ${candidates.length}, подходит под фильтры: ${matchedCompanies.length} из ${params.limit}`,
          currentNiche: '',
          currentSource: discovery.source || params.sourceFocus,
          processedNiches: params.niches.length,
          totalNiches: params.niches.length,
          foundCount: matchedCompanies.length,
          analyzedCount,
          analysisTarget
        }
      });
    }

    const companies = matchedCompanies;
    const foundCount = companies.length;
    const finalStatus =
      guard.reason === 'cancelled'
        ? 'cancelled'
        : foundCount >= params.limit
          ? 'completed'
          : newCount === 0 && duplicateCount > 0 && foundCount === 0
            ? 'duplicates_only'
            : 'exhausted';
    const progressMessage =
      finalStatus === 'cancelled'
        ? `Поиск отменен. Готово ${foundCount} карточек до отмены.`
        : finalStatus === 'completed'
          ? `Готово: ${foundCount} карточек, полностью проверенных и проанализированных.`
          : finalStatus === 'duplicates_only'
            ? `Все найденные компании уже есть в базе (дублей: ${duplicateCount}). Новых нет.`
            : `Проверено ${analyzedCount} кандидатов, под фильтры подошло ${foundCount} из запрошенных ${params.limit}. Больше подходящих компаний по этим фильтрам сейчас нет.`;

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
      status: finalStatus === 'cancelled' ? 'cancelled' : 'completed',
      analyzedCompanies: companies,
      appendQueries: discovery.queries || [],
      appendWarnings: [...(discovery.warnings || []), ...warningsFromAnalysis],
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
          analyzedCount,
          skippedWrongCategory: relevance.skippedWrongCategory,
          usedAi: true,
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
        foundCount: companies.length,
        analyzedCount,
        analysisTarget
      }
    });
  } catch (error) {
    console.error(`[discover-job] id=${jobId} run=${run?.id || 'n/a'} failed:`, error);

    let message = error.message || 'Ошибка поиска компаний.';
    let runStatus = 'failed';
    // "Maximum reach": a timeout is not a failure - the job already found
    // and persisted some real companies (progressively, via
    // store.addCompanyIdsToRun below, as they streamed in through
    // onProgress). Finish the job as a partial success and surface
    // whatever was accumulated instead of discarding it behind a bare
    // error status.
    const isTimeout = error?.code === 'DISCOVERY_TIMEOUT' || error?.name === 'AbortError';
    if (isTimeout) {
      message = 'Поиск прерван по тайм-ауту, показаны частичные результаты.';
      runStatus = 'completed_partial';
    } else if (error?.code === 'ECONNRESET' || error?.cause?.code === 'ECONNRESET' || /ECONNRESET|network/i.test(message)) {
      message = 'Сетевая ошибка: соединение с внешним источником прервано. Попробуйте запустить поиск еще раз.';
    } else if (/GOOGLE_PLACES_API_KEY|CEIDG_API_TOKEN|AWS_LOCATION_API_KEY|OPENAI_API_KEY/.test(message)) {
      message = `Не настроен API-ключ для источника поиска: ${message}`;
    }

    if (run) {
      if (progressCompanyIds.length) store.addCompanyIdsToRun(run.id, progressCompanyIds);
      store.updateRun(run.id, {
        status: runStatus,
        finished_at: new Date().toISOString(),
        found_count: progressCompanyIds.length,
        new_count: progressNewCount,
        duplicate_count: progressDuplicateCount,
        warnings: [message]
      });
    }
    // job.status only drives the frontend's live poll loop, which recognizes
    // 'completed'/'failed'/'cancelled' as terminal - it has no notion of a
    // finer-grained 'completed_partial' state. So on timeout we still finish
    // the job as 'completed' (matching the same fields the success path sets,
    // see ~server.js:3799-3838) so the UI stops polling and renders the
    // partial companies already sitting in job.partialCompanies; the
    // distinct "partial" outcome is carried in result.meta.searchStatus and
    // in the run's own status/warnings above, same as how 'exhausted' and
    // 'duplicates_only' are surfaced on the success path.
    updateDiscoveryJob(jobId, {
      status: isTimeout ? 'completed' : 'failed',
      error: isTimeout ? '' : message,
      appendWarnings: [message],
      result: isTimeout
        ? {
            runId: run?.id || '',
            queries: [],
            warnings: [message],
            meta: {
              count: progressCompanyIds.length,
              requestedNewCount: params.limit,
              rawFoundCount: progressCompanyIds.length,
              newCount: progressNewCount,
              duplicateCount: progressDuplicateCount,
              analyzedCount: 0,
              skippedWrongCategory: 0,
              usedAi: false,
              sourceFocus: params.sourceFocus,
              searchStatus: 'completed_partial',
              workerId: params.workerId,
              categories: params.niches,
              city: params.city,
              country: params.country,
              radiusKm: params.radiusKm,
              elapsedMs: Math.round(performance.now() - runStartedAt)
            }
          }
        : undefined,
      progress: {
        message,
        foundCount: progressCompanyIds.length
      }
    });
  }
    }
  );
}

async function discoverCompaniesBatchWithoutAI({ niches, city, district, limit, sourceFocus, onProgress, guard, workerId, runId }) {
  if (sourceFocus === 'amazon_location') {
    if (!AWS_LOCATION_API_KEY) {
      throw new Error('Для Amazon Location нужен AWS_LOCATION_API_KEY в .env.');
    }

    const amazonDiscoveries = [];
    const amazonWarnings = [];
    const perNicheLimit = Math.max(5, Math.ceil(limit / Math.max(1, niches.length)));
    for (const niche of niches) {
      if (guard?.stopped) break;
      if (uniqueCompanies(amazonDiscoveries.flatMap((item) => item.companies || [])).length >= limit) break;
      let discovery;
      try {
        discovery = await discoverCompaniesFromAmazonLocationExpanded({
          niche,
          city,
          district,
          limit: perNicheLimit,
          sourceFocus,
          onProgress,
          guard
        });
      } catch (error) {
        amazonWarnings.push(`Category "${niche}" skipped: ${error.message || 'unknown error'}`);
        continue;
      }
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

    const amazonMerged = mergeDiscoveries(amazonDiscoveries, limit);
    return { ...amazonMerged, warnings: unique([...(amazonMerged.warnings || []), ...amazonWarnings]).slice(0, 30) };
  }

  if (sourceFocus === 'maps_api') {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Для Google Places нужен GOOGLE_PLACES_API_KEY в .env.');
    }

    const googleDiscoveries = [];
    const googleWarnings = [];
    const perNicheLimit = Math.max(5, Math.ceil(limit / Math.max(1, niches.length)));
    for (const niche of niches) {
      if (guard?.stopped) break;
      if (uniqueCompanies(googleDiscoveries.flatMap((item) => item.companies || [])).length >= limit) break;
      let discovery;
      try {
        discovery = await discoverCompaniesFromGooglePlacesExpanded({
          niche,
          city,
          district,
          limit: perNicheLimit,
          sourceFocus,
          onProgress,
          guard
        });
      } catch (error) {
        googleWarnings.push(`Category "${niche}" skipped: ${error.message || 'unknown error'}`);
        continue;
      }
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

    const googleMerged = mergeDiscoveries(googleDiscoveries, limit);
    return { ...googleMerged, warnings: unique([...(googleMerged.warnings || []), ...googleWarnings]).slice(0, 30) };
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
    if (guard?.stopped) break;
    const remaining = limit - uniqueCompanies(collected).length;
    if (remaining <= 0) break;
    try {
      const discovery = await discoverCompaniesWithoutAI({
        niche,
        city,
        district,
        limit: Math.max(perNicheLimit, remaining),
        sourceFocus,
        workerId,
        runId,
        guard,
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
  if (source.includes('public_registry') || source.includes('public_catalog') || source.includes('public_contact_fallback')) return 1;
  if (source.includes('public_search')) return 2;
  if (source.includes('amazon_location')) return 3;
  if (source.includes('google_places')) return 4;
  return 9;
}

async function discoverCompaniesWithoutAI({ niche, city, district, limit, sourceFocus, onProgress, guard, workerId, runId }) {
  if (sourceFocus === 'all_sources') {
    // "Maximum reach" pipeline: query every configured/available source for
    // this niche - Google Places, Amazon Location, CEIDG, public search - and
    // MERGE all of their raw candidate lists together, instead of stopping at
    // the first source that returned any results at all. The previous
    // behaviour treated the first non-empty source as "the" primary list and
    // only used the remaining sources to cross-check/enrich those same
    // companies, which meant a source that returned just 1-2 low-quality
    // matches silently starved every other (possibly much richer) source of
    // a chance to contribute its own companies. The merged list still goes
    // through the existing enrichment/cross-verification step below, and
    // duplicate companies across sources are still handled by the existing
    // uniqueCompanies()/findExistingCompanyId()/upsertCompany() dedup - no
    // new dedup logic needed here.
    const warnings = [];
    const discoveries = [];

    if (GOOGLE_PLACES_API_KEY && !guard?.stopped && !guard?.stoppedNiches?.has(niche)) {
      try {
        const googleDiscovery = await discoverCompaniesFromGooglePlacesExpanded({ niche, city, district, limit, sourceFocus, onProgress, guard });
        discoveries.push(googleDiscovery);
        if (typeof onProgress === 'function') {
          onProgress({
            niche,
            source: 'google_places_api',
            companies: googleDiscovery.companies || [],
            queries: googleDiscovery.queries || [],
            warnings: googleDiscovery.warnings || [],
            foundSoFar: googleDiscovery.companies.length,
            count: googleDiscovery.companies.length,
            message: `Google Places: найдено ${googleDiscovery.companies.length}`
          });
        }
      } catch (error) {
        warnings.push(`Google Places skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (AWS_LOCATION_API_KEY && !guard?.stopped && !guard?.stoppedNiches?.has(niche)) {
      try {
        const amazonDiscovery = await discoverCompaniesFromAmazonLocationExpanded({ niche, city, district, limit, sourceFocus, onProgress, guard });
        discoveries.push(amazonDiscovery);
        if (typeof onProgress === 'function') {
          onProgress({
            niche,
            source: 'amazon_location',
            companies: amazonDiscovery.companies || [],
            queries: amazonDiscovery.queries || [],
            warnings: amazonDiscovery.warnings || [],
            foundSoFar: amazonDiscovery.companies.length,
            count: amazonDiscovery.companies.length,
            message: `Amazon Location: найдено ${amazonDiscovery.companies.length}`
          });
        }
      } catch (error) {
        warnings.push(`Amazon Location skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (CEIDG_TOKEN && isPolandDiscoveryRegion(city) && !guard?.stopped && !guard?.stoppedNiches?.has(niche)) {
      try {
        const ceidgDiscovery = await discoverCompaniesFromCeidg({ niche, city, district, limit });
        discoveries.push(ceidgDiscovery);
        if (typeof onProgress === 'function') {
          onProgress({
            niche,
            source: 'ceidg_registry',
            companies: ceidgDiscovery.companies || [],
            queries: ceidgDiscovery.queries || [],
            warnings: ceidgDiscovery.warnings || [],
            foundSoFar: ceidgDiscovery.companies.length,
            count: ceidgDiscovery.companies.length,
            message: `CEIDG: найдено ${ceidgDiscovery.companies.length}`
          });
        }
      } catch (error) {
        warnings.push(`CEIDG skipped: ${error.message || 'unknown error'}`);
      }
    }

    if (!guard?.stopped && !guard?.stoppedNiches?.has(niche)) {
      try {
        const publicDiscovery = await discoverCompaniesFromPublicSearchExpanded({ niche, city, district, limit, sourceFocus, onProgress, guard });
        discoveries.push(publicDiscovery);
        if (typeof onProgress === 'function') {
          onProgress({
            niche,
            source: publicDiscovery.source || 'public_search',
            companies: publicDiscovery.companies || [],
            queries: publicDiscovery.queries || [],
            warnings: publicDiscovery.warnings || [],
            foundSoFar: publicDiscovery.companies.length,
            count: publicDiscovery.companies.length,
            message: `Публичный поиск: найдено ${publicDiscovery.companies.length}`
          });
        }
      } catch (error) {
        warnings.push(`Public search skipped: ${error.message || 'unknown error'}`);
      }
    }

    const primary = mergeDiscoveries(discoveries, Math.max(limit, discoveries.reduce((sum, d) => sum + (d.companies?.length || 0), 0)));

    if (!primary?.companies?.length) {
      throw new Error(`No companies found in configured non-AI sources. ${warnings.join(' ')}`);
    }

    console.log(
      `[all_sources] niche="${niche}" merged_sources=${primary.source} merged_count=${primary.companies.length}; running cross-source verification/enrichment on the merged candidate list...`
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
    // For the "internet" focus, the real OpenAI web-search discovery
    // (Responses API + built-in web_search tool) is the primary source: it
    // asks a live model to find real, active companies straight from the
    // public internet instead of scraping Bing/DuckDuckGo result pages. The
    // scraping-based discoverCompaniesFromPublicSearchExpanded is kept as a
    // graceful fallback only - used when the OpenAI client isn't configured,
    // when the AI search throws (quota, network, schema errors), or when it
    // comes back with zero usable companies.
    if (sourceFocus === 'internet' && openai) {
      try {
        const aiDiscovery = await discoverCompaniesFromOpenAIInternet({ niche, city, district, limit, sourceFocus, workerId, runId });
        if (aiDiscovery?.companies?.length) {
          return aiDiscovery;
        }
        console.warn(`[internet] discoverCompaniesFromOpenAIInternet found no usable companies for niche="${niche}"; falling back to public search scraping.`);
      } catch (error) {
        console.error(`[internet] discoverCompaniesFromOpenAIInternet failed for niche="${niche}": ${error.message || error}; falling back to public search scraping.`);
      }
    }
    const shouldExpandPublicSearch = ['internet'].includes(sourceFocus);
    const publicDiscovery = shouldExpandPublicSearch
      ? await discoverCompaniesFromPublicSearchExpanded({ niche, city, district, limit, sourceFocus, guard })
      : await discoverCompaniesFromPublicSearch({ niche, city, district, limit, sourceFocus });
    return publicDiscovery;
  }

  if (sourceFocus === 'registries') {
    if (!CEIDG_TOKEN || !isPolandDiscoveryRegion(city)) {
      return discoverCompaniesFromPublicRegistries({ niche, city, district, limit });
    }
    return discoverCompaniesFromCeidg({ niche, city, district, limit });
  }

  if (sourceFocus === 'amazon_location' && AWS_LOCATION_API_KEY) {
    return discoverCompaniesFromAmazonLocationExpanded({ niche, city, district, limit, sourceFocus, guard });
  }

  if (sourceFocus === 'amazon_location') {
    throw new Error('Для Amazon Location нужен AWS_LOCATION_API_KEY в .env.');
  }

  if (sourceFocus === 'maps_api' && GOOGLE_PLACES_API_KEY) {
    return discoverCompaniesFromGooglePlacesExpanded({ niche, city, district, limit, sourceFocus, guard });
  }

  if (sourceFocus === 'maps_api') {
    throw new Error('Для поиска Google Maps нужен GOOGLE_PLACES_API_KEY в .env.');
  }

  if (CEIDG_TOKEN && isPolandDiscoveryRegion(city)) {
    return discoverCompaniesFromCeidg({ niche, city, district, limit });
  }

  if (!isPolandDiscoveryRegion(city)) {
    return discoverCompaniesFromPublicRegistries({ niche, city, district, limit });
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
      cleanText(company.nip || company.regon || company.edrpou || ''),
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

async function discoverCompaniesFromAmazonLocationExpanded({ niche, city, district, limit, sourceFocus, onProgress, guard }) {
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
    // Global stop (cancel/timeout) always applies; a per-niche duplicate
    // streak only stops searching further districts/variants for THIS niche.
    if (guard?.stopped || guard?.stoppedNiches?.has(niche)) break;
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
  const countryPreset = getCountryPreset(getDiscoveryContext().country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
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
  const country = cleanText(address.Country || address.CountryCode || getDiscoveryContext().country || '');
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

async function discoverCompaniesFromGooglePlacesExpanded({ niche, city, district, limit, sourceFocus, onProgress, guard }) {
  const cityIsWarsaw = isWarsawCity(city);
  const districts = district ? [district] : cityIsWarsaw ? ['', ...DEFAULT_WARSAW_DISTRICTS] : [''];
  const queryNiches = district ? [niche] : buildSearchPhrasesForNiche(niche);
  const queryPlans = queryNiches.flatMap((queryNiche) => districts.map((districtName) => ({ queryNiche, districtName })));
  const perQueryLimit = Math.min(20, Math.max(5, Math.ceil(limit / Math.min(queryPlans.length, 8))));
  const discoveries = [];
  const warnings = [];

  for (const { queryNiche, districtName } of queryPlans) {
    // Global stop (cancel/timeout) always applies; a per-niche duplicate
    // streak only stops searching further districts/variants for THIS niche.
    if (guard?.stopped || guard?.stoppedNiches?.has(niche)) break;
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
      warnings.push(`Google Places skipped ${districtName || city}: ${error.message || 'unknown error'}`);
      if (!districtName) break;
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
  const countryPreset = getCountryPreset(getDiscoveryContext().country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
  const regionCode = cityPreset?.regionCode || countryPreset?.regionCode || 'PL';
  const languageCode = cityPreset?.languageCode || countryPreset?.languageCode || 'pl';
  // If searching by country only (no specific city), let Google Places interpret the
  // free-text query without a location bias circle.
  const textQuery = [niche, district, city || getDiscoveryContext().country].filter(Boolean).join(' ');
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
            radius: clamp(Math.round((getDiscoveryContext().radiusKm || 15) * 1000), 1000, 50000)
          }
        }
      : undefined;

  console.log(
    `[google_places] query="${textQuery}" city=${city || '(country-wide)'} regionCode=${regionCode} radiusKm=${getDiscoveryContext().radiusKm || '(default)'} bias=${Boolean(locationBias)}`
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
        const country = countryPreset?.label || getDiscoveryContext().country || '';
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
          google_place_id: cleanText(place.id || ''),
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

async function discoverCompaniesFromPublicSearchExpanded({ niche, city, district, limit, sourceFocus, onProgress, guard }) {
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
    // Global stop (cancel/timeout) always applies; a per-niche duplicate
    // streak only stops searching further districts/variants for THIS niche.
    if (guard?.stopped || guard?.stoppedNiches?.has(niche)) break;
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
  // "Maximum reach": the old 20-result ceiling cut off real candidates well
  // before the caller's actual requested `limit` (which can be much higher,
  // see MAX_DISCOVERY_ITEMS/computeDiscoveryCandidateLimit upstream). Raise
  // it substantially so public search can contribute as many candidates as
  // the rest of the pipeline is prepared to handle.
  const maxResults = Math.min(limit, 50);
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
  const queryVariants = unique(
    isPolandDiscoveryRegion(city)
      ? [
          query,
          ['site:panoramafirm.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
          ['site:oferteo.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
          ['site:fixly.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
          [niche, district, city, 'usługi firma kontakt telefon'].filter(Boolean).join(' '),
          [niche, district, city, 'montaż serwis kontakt'].filter(Boolean).join(' '),
          ['site:.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' ')
        ]
      : [
          query,
          ['site:opendatabot.ua', niche, district, city, 'контакти'].filter(Boolean).join(' '),
          ['site:youcontrol.com.ua', niche, district, city, 'контакти'].filter(Boolean).join(' '),
          [niche, district, city, 'послуги компанія контакти телефон'].filter(Boolean).join(' '),
          [niche, district, city, 'каталог компаній контакти сайт'].filter(Boolean).join(' '),
          ['site:.ua', niche, district, city, 'контакти'].filter(Boolean).join(' ')
        ]
  ).slice(0, sourceFocus === 'all_sources' || sourceFocus === 'internet' ? 7 : 5);
  const ddgUrl = `https://duckduckgo.com/html/?${new URLSearchParams({ q: queryVariants[0] })}`;
  const bingUrls = queryVariants.map((variant) => buildBingSearchUrl(variant, { count: maxResults, city }));
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
      const html = await fetchText(searchUrl, 8_000, isDuckDuckGo ? {} : { acceptLanguage: bingMarketFor(city).acceptLanguage });

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
        // "Maximum reach": a company explicitly tied to a different city is a
        // real negative signal and stays a hard exclusion. But requiring the
        // city name to be spelled out literally in the snippet/title (on top
        // of that) rejected plenty of genuine local businesses whose page
        // just didn't happen to repeat the city - so that no longer blocks a
        // result on its own; only an actual conflicting-city signal does.
        if (hasConflictingCityEvidence(`${evidence} ${href}`, city)) continue;
        const company = inferCompanyNameFromSearchTitle(title, niche, city, href);
        if (!company) continue;

        const host = safeHostname(href);
        companies.push({
          company,
          niche: inferNicheFromSearchResult(evidence, niche),
          city: city || 'Warszawa',
          district: district || '',
          phone: extractPhones(evidence, { city, country: getDiscoveryContext().country }).join('; '),
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

// Dispatches to the country-appropriate public-registry/catalog search. Both
// branches only ever issue normal search-engine queries (Bing "site:" search)
// and, via enrichDiscoveredCompanyContacts, open the specific pages that came
// back in those results - there is no bulk crawl of any registry.
async function discoverCompaniesFromPublicRegistries({ niche, city, district, limit }) {
  const cityPreset = getCityPreset(city);
  const countryPreset = getCountryPreset(getDiscoveryContext().country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
  const regionCode = cityPreset?.regionCode || countryPreset?.regionCode || 'PL';
  if (regionCode === 'UA') {
    return discoverCompaniesFromPublicRegistriesUkraine({ niche, city, district, limit });
  }
  return discoverCompaniesFromPublicRegistriesPoland({ niche, city, district, limit });
}

async function discoverCompaniesFromPublicRegistriesPoland({ niche, city, district, limit }) {
  const registryQueries = unique([
    ['site:aplikacja.ceidg.gov.pl/CEIDG/CEIDG.Public.UI', niche, district, city].filter(Boolean).join(' '),
    ['site:aplikacja.ceidg.gov.pl', niche, district, city, 'CEIDG firma'].filter(Boolean).join(' '),
    ['site:biznes.gov.pl', niche, district, city, 'wyszukiwarka firm'].filter(Boolean).join(' '),
    ['site:rejestr.io', niche, district, city, 'firma'].filter(Boolean).join(' '),
    ['site:aleo.com/pl/firmy', niche, district, city].filter(Boolean).join(' '),
    ['site:panoramafirm.pl', niche, district, city, 'NIP REGON'].filter(Boolean).join(' '),
    ['site:pkt.pl', niche, district, city, 'kontakt'].filter(Boolean).join(' '),
    ['site:regon24.pl', niche, district, city].filter(Boolean).join(' '),
    [niche, district, city, 'CEIDG NIP REGON firma kontakt'].filter(Boolean).join(' ')
  ]);
  const searchUrls = registryQueries.flatMap((query) => [buildBingSearchUrl(query, { count: Math.min(limit, 12), city })]);
  const warnings = [];
  const companies = [];

  for (const searchUrl of searchUrls) {
    if (companies.length >= limit) break;
    try {
      const html = await fetchText(searchUrl, 8_000, { acceptLanguage: bingMarketFor(city).acceptLanguage });
      const $ = cheerio.load(html);
      for (const element of $('.b_algo').toArray()) {
        if (companies.length >= limit) break;
        const title = cleanText($(element).find('h2').first().text());
        const href = normalizeSearchResultUrl($(element).find('h2 a').first().attr('href') || '');
        if (!title || !href) continue;
        const host = safeHostname(href);
        if (!host) continue;
        if (!/(ceidg|biznes\.gov|rejestr|aleo|panoramafirm|pkt|cylex|oferteo|regon24)/i.test(host)) continue;
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
          phone: extractPhones(evidence, { city, country: getDiscoveryContext().country }).join('; '),
          email: extractEmails(evidence).join('; '),
          nip: (evidence.match(/\b\d{10}\b/) || [''])[0],
          regon: (evidence.match(/\b\d{9}\b/) || [''])[0],
          krs: (evidence.match(/KRS[:\s]*?(\d{6,10})/i) || [, ''])[1] || '',
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

// Ukraine: never queries the official EDR registry directly and never bulk-crawls
// opendatabot.ua / youcontrol.com.ua. It only runs normal search-engine "site:"
// queries and opens the specific already-indexed company pages that come back,
// plus a generic local-catalog search analogous to the Poland Panorama Firm query.
async function discoverCompaniesFromPublicRegistriesUkraine({ niche, city, district, limit }) {
  const registryQueries = unique([
    ['site:opendatabot.ua', niche, district, city, 'контакти'].filter(Boolean).join(' '),
    ['site:youcontrol.com.ua', niche, district, city, 'контакти'].filter(Boolean).join(' '),
    [niche, district, city, 'каталог компаній контакти сайт телефон'].filter(Boolean).join(' '),
    [niche, district, city, 'ЄДРПОУ контакти телефон -prom.ua -olx -rozetka'].filter(Boolean).join(' ')
  ]);
  const searchUrls = registryQueries.flatMap((query) => [buildBingSearchUrl(query, { count: Math.min(limit, 12), city })]);
  const warnings = [
    'UA: используется только точечный веб-поиск по уже проиндексированным страницам Opendatabot/YouControl и открытым бизнес-каталогам, без прямого обращения к реестру ЄДР и без массового обхода. Для большего объёма и точности данных по Украине в будущем стоит рассмотреть платный API Opendatabot или YouControl (легальная агрегация данных ЄДР по соглашению с Минюстом) - сейчас это не реализовано, так как нет API-ключа.'
  ];
  const companies = [];

  for (const searchUrl of searchUrls) {
    if (companies.length >= limit) break;
    try {
      const html = await fetchText(searchUrl, 8_000, { acceptLanguage: bingMarketFor(city).acceptLanguage });
      const $ = cheerio.load(html);
      for (const element of $('.b_algo').toArray()) {
        if (companies.length >= limit) break;
        const title = cleanText($(element).find('h2').first().text());
        const href = normalizeSearchResultUrl($(element).find('h2 a').first().attr('href') || '');
        if (!title || !href) continue;
        const host = safeHostname(href);
        if (!host) continue;
        const isNamedRegistry = /(opendatabot\.ua|youcontrol\.com\.ua)/i.test(host);
        const type = classifyUrlType(href);
        if (!isNamedRegistry) {
          if (!isAllowedPublicSearchResult(href, title, 'internet', type)) continue;
          if (type !== 'directory' && !host.endsWith('.ua')) continue;
        }
        const snippet = cleanText($(element).find('.b_caption p, .b_snippet').first().text());
        const evidence = cleanText(`${title} ${snippet} ${href}`);
        if (!isSearchEvidenceLocalToCity(evidence, city)) continue;
        const company = inferCompanyNameFromSearchTitle(title, niche, city, href) || companyNameFromHost(href);
        if (!company) continue;
        companies.push({
          company,
          niche: inferNicheFromSearchResult(evidence, niche),
          city: city || '',
          district: district || '',
          phone: extractPhones(evidence, { city, country: getDiscoveryContext().country }).join('; '),
          email: extractEmails(evidence).join('; '),
          edrpou: extractEdrpou(evidence),
          website_url: isNamedRegistry ? '' : type === 'official_candidate' ? href : '',
          source: isNamedRegistry ? 'public_registry_search_ua' : 'public_catalog_search_ua',
          source_profile: href,
          services: parseList(String(niche || '').replace(/,\s*/g, ';')),
          physical_location: true,
          notes: snippet || `Public registry/catalog result from ${host}`
        });
      }
    } catch (error) {
      warnings.push(`UA public registry/catalog search skipped: ${error.message || 'unknown error'}`);
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
          source: 'public_registry_search_ua',
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
      source: 'public_registry_search_ua,public_contact_fallback',
      warnings: unique([
        ...warnings,
        'Public Opendatabot/YouControl pages were not accessible/indexed for this query; used public contact fallback.',
        ...(merged.warnings || [])
      ])
    };
  }
  return {
    source: 'public_registry_search_ua',
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

  // See CROSS_VERIFY_MAX_COMPANIES above: bound how many companies enter the
  // network-heavy cross-verification pass so a large merged batch (e.g.
  // sourceFocus=all_sources merging multiple sources) can't multiply
  // concurrent outbound third-party HTTP requests without limit.
  const verifyCount = Math.min(baseCompanies.length, CROSS_VERIFY_MAX_COMPANIES);
  const toVerify = baseCompanies.slice(0, verifyCount);
  const passThrough = baseCompanies.slice(verifyCount);

  const verified = await mapLimit(toVerify, 3, async (company) => {
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

  return [...verified, ...passThrough];
}

async function crossVerifyPrimaryCompany(company, warnings) {
  let current = { ...company };
  const needsRegistry = !current.nip && !current.regon && !current.edrpou;
  const needsContacts = !current.phone || !current.email || !current.website_url;

  if (!needsRegistry && !needsContacts) {
    return current;
  }

  const city = current.city || getDiscoveryContext().city || 'Warszawa';
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
  if (!merged.edrpou && evidenceCompany.edrpou) merged.edrpou = evidenceCompany.edrpou;
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
  const phoneContext = { city: company.city, country: company.country || getDiscoveryContext().country };
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

async function fetchText(url, timeoutMs, { acceptLanguage } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 AuraParser/1.0',
        accept: 'text/html,application/xhtml+xml',
        ...(acceptLanguage ? { 'accept-language': acceptLanguage } : {})
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

// Without a market/language hint, Bing ignores the actual query intent and
// serves generic (observed: UK/US) results instead of Polish/Ukrainian local
// businesses - e.g. a "Restauracja Krakow" query came back with London job
// listings. `mkt`/`setlang`/`cc` plus a matching Accept-Language header fixes
// this; it's what made the `registries`/public-search discovery sources
// silently return zero usable companies even though Bing itself was healthy.
function bingMarketFor(city) {
  return isPolandDiscoveryRegion(city)
    ? { mkt: 'pl-PL', setlang: 'pl', cc: 'PL', acceptLanguage: 'pl-PL,pl;q=0.9' }
    : { mkt: 'uk-UA', setlang: 'uk', cc: 'UA', acceptLanguage: 'uk-UA,uk;q=0.9' };
}

function buildBingSearchUrl(query, { count, city } = {}) {
  const market = bingMarketFor(city);
  const params = new URLSearchParams({ q: query, mkt: market.mkt, setlang: market.setlang, cc: market.cc });
  if (count) params.set('count', String(count));
  return `https://www.bing.com/search?${params.toString()}`;
}

async function fetchBingSearch(query, { count, city, timeoutMs = 8_000 } = {}) {
  return fetchText(buildBingSearchUrl(query, { count, city }), timeoutMs, {
    acceptLanguage: bingMarketFor(city).acceptLanguage
  });
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
  if (type === 'marketplace' || type === 'non_business_platform') return false;
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
      'microsoft.com',
      'prom.ua',
      'rozetka',
      'kabanchik',
      'izi.ua',
      'work.ua',
      'rabota.ua'
    ].some((part) => host.includes(part))
  ) {
    return false;
  }
  if (/ranking|najlepsz|top\s*\d+|cennik|praca|forum|youtube|wikipedia|blog|poradnik|rodzaje|kategoria|sprawdź|samochody osobowe|oferty|używane|sprzedam|praktyczna|wydział|uniwersytet|\btv\b/i.test(title)) return false;
  // "Maximum reach": the old bare-substring check (cena/koszt/produkty/
  // sklep/hurtownia) rejected completely ordinary local-business titles like
  // "Cennik usług klimatyzacji" or "Serwis i sklep AGD Kowalski" just for
  // mentioning a price or having "sklep"/"hurtownia" in the name. Only
  // reject titles that read as actual large-retail/price-comparison pages -
  // explicit price-comparison phrasing, or e-commerce-catalog language
  // combined with a shop/wholesale term - not any small business page that
  // happens to touch on price or stock.
  const looksLikePriceComparison = /porównanie cen|porownanie cen|ranking cen|zestawienie cen|najtaniej w polsce/i.test(title);
  const looksLikeRetailCatalog =
    /sklep internetowy|hurtownia internetowa|hurtownia online/i.test(title) &&
    /produkt|katalog|kategori|koszyk|asortyment/i.test(title);
  if (looksLikePriceComparison || looksLikeRetailCatalog) return false;
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

// Other Polish/Ukrainian cities we know by name, used to detect a search
// result that is clearly anchored to a different city than the one being
// searched for. Excludes the target city itself (and its aliases, e.g.
// warszawa/warsaw) so it never conflicts with itself.
function otherKnownCityNames(city) {
  const cityKey = normalizePresetKey(city) || 'warszawa';
  const isWarsawTarget = cityKey === 'warszawa' || cityKey === 'warsaw';
  const names = new Set();

  Object.entries(CITY_PRESETS).forEach(([key, preset]) => {
    if (key === cityKey) return;
    if (isWarsawTarget && (key === 'warszawa' || key === 'warsaw')) return;
    names.add(normalizeSearchText(preset.label));
  });

  LOCATION_SUGGESTIONS.forEach((loc) => {
    const key = normalizePresetKey(loc.cityName);
    if (key === cityKey) return;
    if (isWarsawTarget && key === 'warszawa') return;
    names.add(normalizeSearchText(loc.cityName));
  });

  return [...names].filter(Boolean);
}

// Country-code TLDs of nearby European countries - a result whose only link
// resolves to one of these (and not the target country's own ccTLD or a
// neutral generic TLD) is a strong signal the business is actually based
// abroad, not just a spelling/formatting quirk worth ignoring.
const FOREIGN_EUROPEAN_TLDS = new Set([
  'it', 'de', 'fr', 'es', 'cz', 'sk', 'lt', 'lv', 'ee', 'ru', 'by', 'uk',
  'at', 'nl', 'be', 'ch', 'se', 'no', 'dk', 'fi', 'pt', 'gr', 'hu', 'ro',
  'bg', 'hr', 'si', 'rs', 'ie', 'is', 'lu'
]);

function hasConflictingCountryEvidence(text, city) {
  const cityPreset = getCityPreset(city);
  const countryPreset = getCountryPreset(getDiscoveryContext().country) || (cityPreset ? getCountryPreset(cityPreset.country) : null);
  const ownTld = (cityPreset?.regionCode || countryPreset?.regionCode || 'PL').toLowerCase();
  const urls = String(text || '').match(/https?:\/\/[^\s"'<>]+/g) || [];
  return urls.some((url) => {
    const host = safeHostname(url);
    const tld = host.split('.').pop() || '';
    return tld && tld !== ownTld && FOREIGN_EUROPEAN_TLDS.has(tld);
  });
}

function hasConflictingCityEvidence(text, city) {
  const value = normalizeSearchText(text);
  const cityKey = normalizePresetKey(city) || 'warszawa';
  const targetNames =
    cityKey === 'warszawa' || cityKey === 'warsaw'
      ? ['warszawa', 'warsaw']
      : [normalizeSearchText(getCityPreset(city)?.label || city)];
  if (targetNames.some((name) => name && value.includes(name))) return false;

  if (otherKnownCityNames(city).some((name) => name && value.includes(name))) return true;
  return hasConflictingCountryEvidence(text, city);
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

function extractEdrpou(evidence) {
  const labeled = evidence.match(/(?:ЄДРПОУ|ОКПО|EDRPOU)[:\s]*?(\d{8})/i);
  if (labeled) return labeled[1];
  const bare = evidence.match(/\b\d{8}\b/);
  return bare ? bare[0] : '';
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

async function discoverCompaniesFromOpenAIInternet({ niche, city, district, limit, sourceFocus, workerId = '', runId = '' }) {
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

  const usage = response.usage || {};
  store.logAiUsage({
    workerId,
    feature: 'web_search_discovery',
    model: SEARCH_MODEL,
    promptTokens: usage.input_tokens || 0,
    completionTokens: usage.output_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    estimatedCost: estimateAiCost(SEARCH_MODEL, usage.input_tokens || 0, usage.output_tokens || 0),
    runId
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
    const repairedUsage = repaired.usage || {};
    store.logAiUsage({
      workerId,
      feature: 'web_search_discovery_repair',
      model: DEFAULT_MODEL,
      promptTokens: repairedUsage.input_tokens || 0,
      completionTokens: repairedUsage.output_tokens || 0,
      totalTokens: repairedUsage.total_tokens || 0,
      estimatedCost: estimateAiCost(DEFAULT_MODEL, repairedUsage.input_tokens || 0, repairedUsage.output_tokens || 0),
      runId
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
      phone: normalizePhoneField(row.phone || '', { city: cleanText(row.city || city || 'Warszawa'), country: getDiscoveryContext().country }),
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

// ---------------------------------------------------------------------------
// AI company search: round 3 - Search Planner + batched AI web-search.
//
// planAiSearchQueries() is pure query PLANNING (no web_search tool): it asks
// the model to draft a diverse list of search-engine phrases for a niche/
// city/district, seeded by the matching CATEGORY_CATALOG entry's
// searchTemplates/aliases (if any) as inspiration only - the model is told to
// build genuinely new variations, not reorder the seed phrases.
//
// runAiSearchBatch() is the actual per-query candidate search (mirrors
// discoverCompaniesFromOpenAIInternet above almost field-for-field), but it
// takes ONE already-planned query string instead of building its own, and
// caps the per-call company limit much lower (10-20 vs up to 100) since the
// round-5 orchestrator is expected to fan this out across many queries via
// runWithConcurrencyLimit() further below.
//
// Together: planAiSearchQueries({ niche, city, ... }) -> queries[] ->
// runWithConcurrencyLimit(queries, settings.aiMaxParallelRequests, (query) =>
// runAiSearchBatch({ query, ... })) -> merged candidate companies. The
// orchestrator that actually wires this fan-out together is round 5's job.

// Scales the planner's requested query-count window to the number of
// companies the caller ultimately wants, so a 5-company job doesn't burn
// tokens planning 12 queries and a 100-company job isn't starved with 5.
function planQueryCountBounds(count) {
  const minItems = Math.min(10, Math.max(5, Math.ceil((Number(count) || 0) / 8) || 5));
  const maxItems = Math.min(12, Math.max(minItems, minItems + 3));
  return { minItems, maxItems };
}

async function planAiSearchQueries({
  niche,
  city,
  district,
  country,
  language,
  count,
  workerId = '',
  jobId = ''
}) {
  if (!openai) {
    throw new Error('OPENAI_API_KEY не настроен.');
  }

  const settings = store.getSettings();
  const model = settings.aiCompanySearchModel;
  // Per-call timeout override (read fresh so an admin change takes effect on
  // the next call without a restart) - the global `openai` client keeps its
  // OPENAI_TIMEOUT_MS default for every other call site in this file; only
  // the three AI-search functions (this one, runAiSearchBatch,
  // enrichCompanyProfile) use this admin-configurable, much longer timeout
  // since real web_search calls routinely blow past the 30s client default.
  const requestTimeoutMs = clampAiRequestTimeoutMs(settings.aiRequestTimeoutSeconds);
  const { minItems, maxItems } = planQueryCountBounds(count);

  // Seed with the matching category's proven templates/aliases (if any) -
  // inspiration only. The prompt below explicitly forbids returning these
  // verbatim/reordered; they exist so the model has a concrete starting
  // vocabulary for this niche instead of guessing blind.
  const category = findCategoryDefinition(niche);
  const seedLanguage = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'pl';
  const categorySeed = category
    ? {
        matchedCategoryLabel: categoryLabel(category, seedLanguage),
        exampleTemplates: (category.searchTemplates || []).slice(0, 8),
        aliases: (category.aliases || []).slice(0, 8)
      }
    : null;

  const input = [
    {
      role: 'system',
      content:
        'You are a search-query strategist for a local-business lead-generation tool. Generate a diverse list of search-engine query phrases a real person would type to find companies in the given niche/city. Return only valid JSON matching the schema. Every query must differ meaningfully in wording and angle from every other query in the list - never submit the same query with words merely reordered or a trivial synonym swap. If example templates are provided, treat them only as inspiration for vocabulary and build new, genuinely different phrasings on top of them - do not return them verbatim.'
    },
    {
      role: 'user',
      content: JSON.stringify(
        {
          task: 'Plan a diverse set of web-search queries to discover real local companies for this niche.',
          niche,
          city: city || null,
          district: district || null,
          country: country || null,
          language: language || seedLanguage,
          target_company_count: count || null,
          desired_query_count: { min: minItems, max: maxItems },
          category_seed: categorySeed,
          coverage_guidance: [
            'Include the direct niche name on its own.',
            'Include niche + city combos, and niche + district combos if a district is given.',
            'Include local business-language variants (e.g. Polish "firma", "usługi", "serwis" style phrasing, or the equivalent local term for the target country/language).',
            'Include related sub-niches, close synonyms and adjacent services.',
            'Include neighboring districts/cities if the given city/district implies nearby ones worth covering.',
            'Include at least one query with an industry-directory/registry angle (catalog, business registry, rating/review directory).',
            'Write mainly in the local language(s) of the target country (Polish for Poland); include a couple of variants in English and/or Russian if that mirrors how this app already phrases multi-language search content.'
          ]
        },
        null,
        2
      )
    }
  ];

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['queries'],
    properties: {
      queries: {
        type: 'array',
        minItems,
        maxItems,
        items: { type: 'string' }
      }
    }
  };

  const response = await openai.responses.create(
    {
      model,
      input,
      max_output_tokens: 1000,
      text: {
        format: {
          type: 'json_schema',
          name: 'ai_search_query_plan',
          strict: true,
          schema
        }
      }
    },
    { timeout: requestTimeoutMs }
  );

  const usage = response.usage || {};
  let promptTokens = usage.input_tokens || 0;
  let completionTokens = usage.output_tokens || 0;
  let totalTokens = usage.total_tokens || 0;
  let estimatedCost = estimateAiCost(model, promptTokens, completionTokens);
  store.logAiUsage({
    workerId,
    feature: 'ai_search_planning',
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost,
    // logAiUsage() has no dedicated jobId field yet (round 1/2 didn't add
    // one) - reusing the existing runId slot to carry it, same convention
    // used by runAiSearchBatch() below. See the round-3 report for a flag
    // recommending a real jobId param in a later round.
    runId: jobId
  });

  let parsed;
  try {
    parsed = parseLooseJson(response.output_text);
  } catch {
    const repaired = await openai.responses.create(
      {
        model: DEFAULT_MODEL,
        input: [
          {
            role: 'system',
            content: 'Repair the user content into valid JSON matching the provided schema. Do not invent new content.'
          },
          {
            role: 'user',
            content: response.output_text || ''
          }
        ],
        max_output_tokens: 1000,
        text: {
          format: {
            type: 'json_schema',
            name: 'ai_search_query_plan_repaired',
            strict: true,
            schema
          }
        }
      },
      { timeout: requestTimeoutMs }
    );
    const repairedUsage = repaired.usage || {};
    const repairPromptTokens = repairedUsage.input_tokens || 0;
    const repairCompletionTokens = repairedUsage.output_tokens || 0;
    const repairCost = estimateAiCost(DEFAULT_MODEL, repairPromptTokens, repairCompletionTokens);
    store.logAiUsage({
      workerId,
      feature: 'ai_search_planning_repair',
      model: DEFAULT_MODEL,
      promptTokens: repairPromptTokens,
      completionTokens: repairCompletionTokens,
      totalTokens: repairedUsage.total_tokens || 0,
      estimatedCost: repairCost,
      runId: jobId
    });
    promptTokens += repairPromptTokens;
    completionTokens += repairCompletionTokens;
    totalTokens += repairedUsage.total_tokens || 0;
    estimatedCost += repairCost;
    parsed = parseLooseJson(repaired.output_text);
  }

  const queries = unique((Array.isArray(parsed.queries) ? parsed.queries : []).map(cleanText).filter(Boolean)).slice(0, maxItems);

  return {
    queries,
    model,
    tokenUsage: { promptTokens, completionTokens, totalTokens },
    estimatedCost: Number(estimatedCost.toFixed(6))
  };
}

// Round 4: computeVerificationStatus() cross-checks a raw AI-search
// candidate's self-reported `independent_signals_found` against the actual
// raw fields on the candidate - the model can claim it verified a signal
// without that field ever showing up in the structured output, so this never
// trusts the self-report alone. Pure logic, no AI call. Attached to every
// candidate inside runAiSearchBatch() below, before dedup/save, so round 5's
// orchestrator can filter/store `verification_status`/`signals_detected`.
const VERIFICATION_SIGNAL_ALIASES = {
  official_website: ['official_website', 'website'],
  registry_record: ['registry_record', 'business_registry_entry', 'registry'],
  google_maps_profile: ['google_maps_profile', 'google_maps', 'maps_profile', 'gmb', 'google_business_profile'],
  social_profile: ['social_profile', 'social_media_profile', 'instagram', 'facebook', 'social'],
  industry_directory: ['industry_directory', 'public_directory_listing', 'directory', 'catalog'],
  verified_phone: ['verified_phone', 'phone_number', 'phone'],
  verified_address: ['verified_address', 'address']
};

// "Strong" signals per the round-4 spec: at least one of these among 2+
// genuinely-present signals upgrades PARTIALLY_VERIFIED to VERIFIED.
const STRONG_VERIFICATION_SIGNALS = new Set(['official_website', 'registry_record', 'google_maps_profile']);

function normalizeSignalToken(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// A claimed signal token counts toward a signal type if either string
// contains the other, so "business_registry_entry" matches alias "registry"
// and "phone_number" matches alias "phone" without needing an exhaustive list.
function candidateClaimsSignal(claimedSignals, signalType) {
  const aliases = VERIFICATION_SIGNAL_ALIASES[signalType] || [signalType];
  return claimedSignals.some((claim) => aliases.some((alias) => claim.includes(alias) || alias.includes(claim)));
}

function isRegistryLikeSource(text) {
  return /registr|rejestr|ceidg|\bkrs\b|regon|biznes\.gov|opendatabot|youcontrol/i.test(String(text || ''));
}

function isGoogleMapsSource(text) {
  return /google\.com\/maps|maps\.google|g\.page|google_places|google\s*business\s*profile/i.test(String(text || ''));
}

function isSocialSourceUrl(text) {
  const host = safeHostname(text);
  return Boolean(host) && socialDomains.some((domain) => host.includes(domain));
}

// directoryDomains (defined earlier in this file) mixes plain business
// directories with registry-flavored ones (rejestr.io, regon24.pl,
// biznes.gov.pl) - registry-like hosts are excluded here so they land in the
// registry_record bucket instead of being double-counted as a directory too.
function isDirectorySourceUrl(text) {
  if (isRegistryLikeSource(text) || isGoogleMapsSource(text)) return false;
  const host = safeHostname(text);
  if (host && directoryDomains.some((domain) => host.includes(domain))) return true;
  return /\bdirectory\b|\bcatalog(ue)?\b/i.test(String(text || ''));
}

function computeVerificationStatus(candidate = {}) {
  const claimedSignals = (Array.isArray(candidate.independent_signals_found) ? candidate.independent_signals_found : [])
    .map(normalizeSignalToken)
    .filter(Boolean);
  const sourceText = [candidate.source, candidate.source_profile].filter(Boolean).join(' ');
  const websiteUrl = String(candidate.website_url || '').trim();

  // contact_page is deliberately NOT gated on a separate model claim: the
  // spec describes it as "part of website", i.e. the same evidence as
  // official_website rather than an independently-claimable signal (the
  // independent_signals_found exemplar list given to the model never
  // includes a "contact_page" option), so it simply follows website_url
  // being genuinely present.
  const signalChecks = {
    official_website: Boolean(websiteUrl) && candidateClaimsSignal(claimedSignals, 'official_website'),
    contact_page: Boolean(websiteUrl),
    registry_record: isRegistryLikeSource(sourceText) && candidateClaimsSignal(claimedSignals, 'registry_record'),
    google_maps_profile: isGoogleMapsSource(sourceText) && candidateClaimsSignal(claimedSignals, 'google_maps_profile'),
    social_profile:
      (Boolean(String(candidate.instagram || '').trim()) ||
        Boolean(String(candidate.facebook || '').trim()) ||
        isSocialSourceUrl(candidate.source_profile)) &&
      candidateClaimsSignal(claimedSignals, 'social_profile'),
    industry_directory: isDirectorySourceUrl(candidate.source_profile) && candidateClaimsSignal(claimedSignals, 'industry_directory'),
    verified_phone: Boolean(String(candidate.phone || '').trim()) && candidateClaimsSignal(claimedSignals, 'verified_phone'),
    verified_address: Boolean(String(candidate.address || '').trim()) && candidateClaimsSignal(claimedSignals, 'verified_address')
  };

  const signalsDetected = Object.keys(signalChecks).filter((signalType) => signalChecks[signalType]);
  const count = signalsDetected.length;
  const hasStrongSignal = signalsDetected.some((signalType) => STRONG_VERIFICATION_SIGNALS.has(signalType));

  let verificationStatus;
  if (count >= 2) {
    verificationStatus = hasStrongSignal ? 'VERIFIED' : 'PARTIALLY_VERIFIED';
  } else {
    // 0 or exactly 1 signal (weak or strong): not enough independent
    // cross-verification yet per the round-4 spec.
    verificationStatus = 'UNVERIFIED';
  }

  return { verification_status: verificationStatus, signals_detected: signalsDetected };
}

async function runAiSearchBatch({
  query,
  niche,
  city,
  district,
  country,
  limit,
  model,
  webSearchEnabled = true,
  jobId = '',
  workerId = ''
}) {
  if (!openai) {
    throw new Error('OPENAI_API_KEY не настроен.');
  }

  const settings = store.getSettings();
  const resolvedModel = model || settings.aiCompanySearchModel;
  // See clampAiRequestTimeoutMs() near OPENAI_TIMEOUT_MS above - per-call
  // override for this feature's OpenAI calls, read fresh each invocation.
  const requestTimeoutMs = clampAiRequestTimeoutMs(settings.aiRequestTimeoutSeconds);
  const maxCompanies = Math.min(Math.max(Number(limit) || 15, 1), 20);
  const warnings = [];
  if (!webSearchEnabled) {
    warnings.push(
      "Web search is disabled in settings for this request - results rely on the model's own background knowledge only and may be stale or incomplete."
    );
  }

  const independentSignalExamples = [
    'official_website',
    'google_maps_profile',
    'phone_number',
    'email_address',
    'public_directory_listing',
    'social_media_profile',
    'customer_reviews',
    'business_registry_entry'
  ];

  const input = [
    {
      role: 'system',
      content:
        'Find real, active local companies matching the given search query in the requested city/district/country. Return only valid JSON matching the schema. Do not invent companies - only return companies you have genuine evidence for (an official website, a public directory/profile listing, a phone number, an email, or a verifiable address). If fewer than the requested max can be found with real evidence, return fewer rather than padding the list. Mark any field you could not verify as an empty string rather than guessing. For each company, enumerate in independent_signals_found exactly which signal types you actually verified - do not just copy the example list.'
    },
    {
      role: 'user',
      content: JSON.stringify(
        {
          task: 'Run this single search query and return structured candidate company data, but only for companies you can verify are real.',
          search_query: query,
          niche,
          city,
          district,
          country,
          max_companies: maxCompanies,
          independent_signal_examples: independentSignalExamples,
          required_output_shape: {
            companies: [
              {
                company: 'name',
                niche: niche || 'category',
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
                notes: 'short evidence and why this is a real active company',
                independent_signals_found: ['e.g. official_website, phone_number - only the ones actually verified']
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
            'notes',
            'independent_signals_found'
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
            notes: { type: 'string' },
            independent_signals_found: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  };

  const response = await openai.responses.create(
    {
      model: resolvedModel,
      tools: webSearchEnabled ? [{ type: 'web_search' }] : [],
      input,
      max_output_tokens: 6000,
      text: {
        format: {
          type: 'json_schema',
          name: 'ai_search_batch_discovery',
          strict: true,
          schema
        }
      }
    },
    { timeout: requestTimeoutMs }
  );

  const usage = response.usage || {};
  let promptTokens = usage.input_tokens || 0;
  let completionTokens = usage.output_tokens || 0;
  let totalTokens = usage.total_tokens || 0;
  let estimatedCost = estimateAiCost(resolvedModel, promptTokens, completionTokens);
  store.logAiUsage({
    workerId,
    feature: 'ai_search_discovery',
    model: resolvedModel,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost,
    // Reusing the existing runId slot to carry the AI Search Job id, per the
    // round-3 spec - avoids touching logAiUsage()'s signature this round.
    runId: jobId
  });

  let parsed;
  try {
    parsed = parseLooseJson(response.output_text);
  } catch {
    const repaired = await openai.responses.create(
      {
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
            name: 'ai_search_batch_discovery_repaired',
            strict: true,
            schema
          }
        }
      },
      { timeout: requestTimeoutMs }
    );
    const repairedUsage = repaired.usage || {};
    const repairPromptTokens = repairedUsage.input_tokens || 0;
    const repairCompletionTokens = repairedUsage.output_tokens || 0;
    const repairCost = estimateAiCost(DEFAULT_MODEL, repairPromptTokens, repairCompletionTokens);
    store.logAiUsage({
      workerId,
      feature: 'ai_search_discovery_repair',
      model: DEFAULT_MODEL,
      promptTokens: repairPromptTokens,
      completionTokens: repairCompletionTokens,
      totalTokens: repairedUsage.total_tokens || 0,
      estimatedCost: repairCost,
      runId: jobId
    });
    promptTokens += repairPromptTokens;
    completionTokens += repairCompletionTokens;
    totalTokens += repairedUsage.total_tokens || 0;
    estimatedCost += repairCost;
    parsed = parseLooseJson(repaired.output_text);
  }

  const rows = Array.isArray(parsed.companies) ? parsed.companies : [];
  const companies = rows
    .map((row) => {
      const candidate = {
        company: cleanText(row.company || row.company_name || row.name || row.title || ''),
        niche: cleanText(row.niche || row.category || niche),
        city: cleanText(row.city || city || ''),
        district: cleanText(row.district || district || ''),
        address: cleanText(row.address || ''),
        phone: normalizePhoneField(row.phone || '', { city: cleanText(row.city || city || ''), country: country || getDiscoveryContext().country }),
        email: cleanText(row.email || '').toLowerCase(),
        website_url: cleanText(row.website_url || row.website || ''),
        source: 'ai_search_batch',
        source_profile: cleanText(row.source_profile || row.source_url || row.url || ''),
        instagram: cleanText(row.instagram || ''),
        facebook: cleanText(row.facebook || ''),
        review_count: parseNumber(row.review_count || row.reviews),
        rating: parseNumber(row.rating),
        last_activity: cleanText(row.last_activity || ''),
        services: parseList(row.services || niche),
        independent_signals_found: parseList(row.independent_signals_found),
        notes: cleanText(row.notes || `AI search batch query: ${query}`)
      };
      // Attach the pre-computed, cross-checked verification status BEFORE
      // dedup/save (round 4) so round 5's orchestrator can filter/store it
      // without recomputing it later from a possibly-already-deduped shape.
      const { verification_status, signals_detected } = computeVerificationStatus(candidate);
      candidate.verification_status = verification_status;
      candidate.signals_detected = signals_detected;
      return candidate;
    })
    .filter((company) => company.company && (company.source_profile || company.website_url || company.phone || company.email));

  if (rows.length && !companies.length) {
    warnings.push('AI search batch returned rows, but none had enough source data to keep.');
  }

  return {
    query,
    companies: uniqueCompanies(companies).slice(0, maxCompanies),
    warnings,
    tokenUsage: { promptTokens, completionTokens, totalTokens },
    estimatedCost: Number(estimatedCost.toFixed(6)),
    webSearchUsed: Boolean(webSearchEnabled)
  };
}

// Generic bounded-concurrency runner: processes `items` through `workerFn`
// with at most `limit` in flight at once. NOTE: an equivalent worker-pool
// helper (mapLimit(), defined further below in this file and already used by
// the enrichment/analysis pipelines) already existed before this round - this
// is a thin named alias over it so call sites reasoning about "AI search
// batch concurrency" can spell it in domain terms, without duplicating the
// pooling logic. Round 5's orchestrator is expected to call this like:
//
//   const settings = store.getSettings();
//   const batches = await runWithConcurrencyLimit(
//     plannedQueries,
//     settings.aiMaxParallelRequests,
//     (query) => runAiSearchBatch({ query, niche, city, district, country, limit, model, webSearchEnabled, jobId, workerId })
//   );
//   const allCompanies = batches.flatMap((batch) => batch.companies);
//
// Not wired into any live dispatch path yet - that is round 5's job.
async function runWithConcurrencyLimit(items, limit, workerFn) {
  return mapLimit(items, limit, workerFn);
}

async function discoverCompaniesFromCeidg({ niche, city, district, limit }) {
  const params = new URLSearchParams();
  if (city) params.set('miasto', city);
  if (niche) params.set('nazwa', niche);
  params.set('status', 'AKTYWNY');

  const response = await fetchWithTimeout(`${CEIDG_ENDPOINT}?${params.toString()}`, {
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

  const heuristic = buildHeuristicAnalysis(item, parsed, websiteResolution, options.language);
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

  const city = cleanText(item.city || getDiscoveryContext().city || 'Warszawa');
  const country = cleanText(item.country || getDiscoveryContext().country || '');
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
    const searchUrl = buildBingSearchUrl(query, { count: 10, city });
    try {
      const html = await fetchText(searchUrl, 7_000, { acceptLanguage: bingMarketFor(city).acceptLanguage });
      const $ = cheerio.load(html);
      for (const element of $('.b_algo').toArray()) {
        const title = cleanText($(element).find('h2').first().text());
        const href = normalizeSearchResultUrl($(element).find('h2 a').first().attr('href') || '');
        if (!title || !href) continue;

        const type = classifyUrlType(href);
        if (!isAllowedPublicSearchResult(href, title, 'internet', type)) continue;
        if (['social', 'directory', 'marketplace', 'non_business_platform'].includes(type)) continue;

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

// Every issue the heuristic scanner can flag, as a { pl, ru } pair plus the
// score penalty and the "why it matters" category it belongs to (see
// buildWhyItMatters). Keyed by a stable id instead of matching regexes
// against already-translated text, which is what let this whole generator
// silently stay Russian-only regardless of the request's language.
const HEURISTIC_ISSUE_DEFS = {
  no_viewport: { penalty: 14, category: 'mobile', pl: 'Brak wyraźnego dostosowania do smartfonów', ru: 'Нет явного адаптива под смартфоны' },
  no_tel_link: { penalty: 8, category: 'mobile', pl: 'Brak klikalnego przycisku do połączenia', ru: 'Нет кликабельной кнопки звонка' },
  no_form: { penalty: 10, category: 'default', pl: 'Brak formularza zgłoszenia lub zapisu', ru: 'Нет формы заявки или записи' },
  services_not_split: { penalty: 14, category: 'default', pl: 'Usługi nie są podzielone na czytelne podstrony', ru: 'Услуги не разделены на понятные страницы' },
  weak_portfolio: { penalty: 10, category: 'portfolio', pl: 'Słabo pokazane realizacje, case\'y lub galeria', ru: 'Слабо показаны работы, кейсы или галерея' },
  no_prices: { penalty: 8, category: 'price', pl: 'Nie widać cen ani orientacyjnych kosztów', ru: 'Не видно цен или ориентиров стоимости' },
  low_trust: { penalty: 8, category: 'trust', pl: 'Mało sygnałów zaufania: zespół, NIP, doświadczenie, proces', ru: 'Мало сигналов доверия: команда, NIP, опыт, процесс' },
  few_photos: { penalty: 6, category: 'default', pl: 'Mało realnych zdjęć firmy', ru: 'Мало реальных фотографий бизнеса' },
  thin_text: { penalty: 8, category: 'default', pl: 'Na stronie jest mało treści', ru: 'На сайте мало содержательного текста' },
  outdated: { penalty: 5, category: 'default', pl: 'Strona wygląda na dawno nieaktualizowaną', ru: 'Сайт выглядит давно не обновлявшимся' },
  slow_load: { penalty: 4, category: 'default', pl: 'Strona ładuje się wolno', ru: 'Сайт загружается медленно' },
  placeholder: { penalty: 14, category: 'default', pl: 'Strona wygląda jak zaślepka', ru: 'Сайт выглядит как страница-заглушка' },
  free_subdomain: { penalty: 10, category: 'default', pl: 'Strona znajduje się na darmowej subdomenie', ru: 'Сайт находится на бесплатном поддомене' }
};

function buildHeuristicAnalysis(item, parsed, resolution, language) {
  const lang = normalizeAnalysisLanguage(language);
  if (resolution.websiteStatus !== 'WEBSITE_FOUND' && resolution.websiteStatus !== 'UNCERTAIN') {
    return buildNoWebsiteAnalysis(item, resolution, parsed, lang);
  }
  return buildWebsiteAnalysis(item, parsed, resolution, lang);
}

function buildNoWebsiteAnalysis(item, resolution, parsed, language) {
  const lang = normalizeAnalysisLanguage(language);
  const business = scoreBusinessWithoutWebsite(item, resolution);
  const packageName = business.score >= 80 ? 'Business Website' : 'Landing Page';
  const priority = business.score >= 70 ? 'A' : business.score >= 55 ? 'B' : 'C';
  const mainProblem = noWebsiteProblem(item, resolution, lang);
  // first_message_ru/pl are two independently-generated outreach drafts (not
  // tied to the UI language), and noWebsiteMessagePl translates FROM Russian
  // source text via translateProblemForPl - so always feed them the Russian
  // problem string regardless of which language main_problem itself uses.
  const ruProblem = lang === 'ru' ? mainProblem : noWebsiteProblem(item, resolution, 'ru');

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
    why_it_matters: buildNoWebsiteWhy(resolution.websiteStatus, lang),
    proposed_solution: buildNicheSolution(item.niche, lang),
    mini_audit_points: [
      websiteStatusLabel(resolution.websiteStatus, lang),
      mainProblem,
      buildNicheSolution(item.niche, lang)
    ],
    first_message_ru: noWebsiteMessageRu(item, ruProblem),
    first_message_pl: noWebsiteMessagePl(item, ruProblem)
  };
}

function buildWebsiteAnalysis(item, parsed, resolution, language) {
  const lang = normalizeAnalysisLanguage(language);
  if (!parsed.ok) {
    const openFailedProblem = parsed.error || heuristicText({ pl: 'Strona się nie otworzyła', ru: 'Сайт не открылся' }, lang);
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
      main_problem: openFailedProblem,
      why_it_matters: heuristicText(
        {
          pl: 'Jeśli strona się nie otwiera lub działa niestabilnie, klient nie może normalnie sprawdzić firmy przed kontaktem.',
          ru: 'Если сайт не открывается или работает нестабильно, клиент не может нормально проверить компанию перед обращением.'
        },
        lang
      ),
      proposed_solution: buildNicheSolution(item.niche, lang),
      mini_audit_points: [
        parsed.error ||
          heuristicText(
            { pl: 'Strona nie otworzyła się podczas szybkiego sprawdzenia.', ru: 'Сайт не открылся при быстрой проверке.' },
            lang
          ),
        heuristicText(
          { pl: 'Trzeba sprawdzić domenę i zrobić działającą wersję strony.', ru: 'Нужно проверить домен и сделать рабочую версию сайта.' },
          lang
        ),
        buildNicheSolution(item.niche, lang)
      ],
      first_message_ru: fallbackMessageRu(item, parsed.error),
      first_message_pl: fallbackMessagePl(item, parsed.error)
    };
  }

  const s = parsed.signals;
  const issues = [];
  let quality = 100;

  if (!s.hasViewport) addIssue('no_viewport');
  if (!s.hasTelLink) addIssue('no_tel_link');
  if (!s.forms) addIssue('no_form');
  if (!s.hasServiceKeywords || !hasLikelyServicePages(s)) addIssue('services_not_split');
  if (!s.hasPortfolioKeywords) addIssue('weak_portfolio');
  if (!s.hasPriceKeywords) addIssue('no_prices');
  if (!s.hasAboutKeywords && !s.hasNipOrRegon) addIssue('low_trust');
  if (s.nonSvgImages < 4) addIssue('few_photos');
  if (s.textLength < 1200) addIssue('thin_text');
  if (s.outdatedCopyright) addIssue('outdated');
  if (s.avgElapsedMs > 3500) addIssue('slow_load');
  if (resolution.websiteStatus === 'ONE_PAGE_PLACEHOLDER') addIssue('placeholder');
  if (resolution.websiteStatus === 'FREE_SUBDOMAIN') addIssue('free_subdomain');

  quality = clamp(quality, 0, 100);
  const weakness = 100 - quality;
  const nicheFit = scoreNicheFit(item.niche, s.allTextSample);
  const leadScore = clamp(Math.round(weakness * 0.72 + nicheFit + (s.phones.length || s.emails.length ? 8 : 0)), 0, 100);
  const priority = leadScore >= 70 ? 'A' : leadScore >= 45 ? 'B' : 'C';
  const packageName = pickPackage(item.niche, s, issues);
  const topIssue = issues[0] || null;
  const defaultMainProblemPair = {
    pl: 'Stronę można zrobić bardziej zrozumiałą i mocniejszą dla klienta z telefonu',
    ru: 'Сайт можно сделать понятнее и сильнее для клиента с телефона'
  };
  const mainProblem = topIssue ? heuristicText(topIssue, lang) : heuristicText(defaultMainProblemPair, lang);
  // Same reasoning as buildNoWebsiteAnalysis: first_message_ru/pl are two
  // independent outreach drafts, and fallbackMessagePl translates FROM
  // Russian via translateProblemForPl - always feed them Russian text.
  const ruProblem = topIssue ? heuristicText(topIssue, 'ru') : heuristicText(defaultMainProblemPair, 'ru');

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
    why_it_matters: buildWhyItMatters(topIssue?.category || 'default', lang),
    proposed_solution: buildNicheSolution(item.niche, lang),
    mini_audit_points: buildMiniAuditPoints(issues, item.niche, lang),
    first_message_ru: fallbackMessageRu(item, ruProblem),
    first_message_pl: fallbackMessagePl(item, ruProblem)
  };

  function addIssue(key) {
    const def = HEURISTIC_ISSUE_DEFS[key];
    if (!def) return;
    issues.push({ key, category: def.category, penalty: def.penalty, pl: def.pl, ru: def.ru });
    quality -= def.penalty;
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
  // domainFromEmail() already returns '' for free-mail domains, so a truthy
  // result here means the email is on a real corporate/business domain.
  if (item.email && domainFromEmail(item.email)) parts.contact += 5;
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

function noWebsiteProblem(item, resolution, language) {
  const lang = normalizeAnalysisLanguage(language);
  if (resolution.websiteStatus === 'SOCIAL_ONLY') {
    return heuristicText(
      {
        pl: 'Wszystkie informacje są w social mediach, więc klientowi trudno szybko sprawdzić usługi, ceny, realizacje i kontakt w jednym miejscu.',
        ru: 'Вся информация находится в соцсетях, поэтому клиенту сложно быстро посмотреть услуги, цены, примеры и контакты в одном месте.'
      },
      lang
    );
  }
  if (resolution.websiteStatus === 'DIRECTORY_ONLY') {
    return heuristicText(
      {
        pl: 'Klient porównuje firmę obok dziesiątek konkurentów na cudzej platformie, a firma nie ma własnej prezentacji.',
        ru: 'Клиент сравнивает компанию рядом с десятками конкурентов внутри чужой платформы, а у бизнеса нет собственной презентации.'
      },
      lang
    );
  }
  if (resolution.websiteStatus === 'MARKETPLACE_ONLY') {
    return heuristicText(
      {
        pl: 'Firma zależy od marketplace\'u lub platformy, a nie od własnej strony z usługami i zaufaniem.',
        ru: 'Компания зависит от маркетплейса или платформы, а не от собственной страницы с услугами и доверием.'
      },
      lang
    );
  }
  if (resolution.websiteStatus === 'BROKEN_WEBSITE') {
    return heuristicText(
      {
        pl: 'Domena istnieje, ale strona się nie otwiera, więc klient nie może normalnie sprawdzić firmy przed kontaktem.',
        ru: 'Домен есть, но сайт не открывается, поэтому клиент не может нормально проверить компанию перед обращением.'
      },
      lang
    );
  }
  if (resolution.websiteStatus === 'FREE_SUBDOMAIN') {
    return heuristicText(
      {
        pl: 'Firma ma tylko prostą stronę na darmowej subdomenie, która wygląda słabiej niż realny biznes.',
        ru: 'У компании есть только простая страница на бесплатном поддомене, которая выглядит слабее реального бизнеса.'
      },
      lang
    );
  }
  return heuristicText(
    {
      pl: 'Aktywna firma nie ma własnej strony, na której klient zobaczy usługi, przykłady prac, zaufanie i następny krok.',
      ru: 'У активной компании нет собственного сайта, где клиент может увидеть услуги, примеры работ, доверие и следующий шаг.'
    },
    lang
  );
}

function buildNoWebsiteWhy(status, language) {
  const lang = normalizeAnalysisLanguage(language);
  if (status === 'SOCIAL_ONLY') {
    return heuristicText(
      {
        pl: 'Social media dobrze pokazują aktywność, ale słabo zastępują uporządkowaną stronę z usługami, cenami, portfolio i kontaktem.',
        ru: 'Соцсети хорошо показывают активность, но плохо заменяют структурированный сайт с услугами, ценами, портфолио и контактами.'
      },
      lang
    );
  }
  if (status === 'DIRECTORY_ONLY' || status === 'MARKETPLACE_ONLY') {
    return heuristicText(
      {
        pl: 'Na cudzej platformie firma stoi obok konkurencji i nie kontroluje własnej prezentacji.',
        ru: 'На чужой платформе бизнес стоит рядом с конкурентами и не контролирует собственную презентацию.'
      },
      lang
    );
  }
  if (status === 'BROKEN_WEBSITE') {
    return heuristicText(
      {
        pl: 'Niedziałająca strona obniża zaufanie mocniej niż całkowity brak strony.',
        ru: 'Неработающий сайт снижает доверие сильнее, чем полное отсутствие сайта.'
      },
      lang
    );
  }
  return heuristicText(
    {
      pl: 'Jeśli firma jest już aktywna i wypłacalna, strona staje się naturalnym punktem zaufania i wyjaśnia usługi bez ręcznych powtórek.',
      ru: 'Если бизнес уже активный и платежеспособный, сайт становится нормальной точкой доверия и объясняет услуги без ручных повторов.'
    },
    lang
  );
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

async function analyzeSiteCardWithOpenAI({ item, parsed, websiteResolution, heuristic, model, language = 'ru', workerId = '', companyId = '', runId = '' }) {
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
        `You create a fact-checked, personalized website-opportunity analysis for exactly ONE local company card, identified by company.name + company.category + company.city in this payload. This payload is the complete and only source of truth for this single company - it contains no data from any other company, niche or request. Ignore any general knowledge you may have about the category.category from elsewhere; treat company.category as the definitive niche and never substitute, broaden or "correct" it based on assumptions. Use only the provided parser facts; do not invent missing facts, services, owners, prices, years, team size, locations, awards or problems. If evidence is weak, say UNKNOWN and lower confidence. Base personalization on exact evidence: company name, category, city/district, address, phone/email, reviews/rating, services, source profile, website status, selected URL, parsed pages and domain verification.

Website status branches (website.status field) - follow the matching one exactly:
- NO_WEBSITE_CONFIRMED, SOCIAL_ONLY, DIRECTORY_ONLY or MARKETPLACE_ONLY: the company has NO official website. Do not describe, imply or reference any website content, design or pages - none exist. Build the whole analysis strictly around the fact that there is no website yet; existing_materials must be an empty array; frame the offer as building a first website from scratch, using only social/contact/registry facts present in the payload.
- BROKEN_WEBSITE: a domain exists but does not load or resolve. Do not describe page content, since none was retrievable; frame the offer as an urgent rebuild.
- WEBSITE_FOUND, FREE_SUBDOMAIN or ONE_PAGE_PLACEHOLDER: a website was reached and parsed. Explain the exact status using parser_summary.parsed_summary and recommend redesign/improvement only when justified by that evidence.
- UNCERTAIN: evidence is inconclusive. Say so plainly, lower confidence, and avoid asserting either that a website exists or that it does not.

If there is category/company/site mismatch risk, put it in risks_or_skip_reasons and evidence_used. Write user-facing analysis fields in ${outputLanguageName}. first_message_pl must sound natural in Polish and mention at least two verified facts; first_message_ru must do the same in Russian. Return only JSON matching the schema.`
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
        minItems: 0,
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
    estimatedCost: estimateAiCost(model, usage.input_tokens || 0, usage.output_tokens || 0),
    companyId,
    runId
  });
  return {
    ...result,
    ai_analysis_status: 'COMPLETED',
    ai_analysis_version: 1,
    ai_analyzed_at: new Date().toISOString(),
    company_data_version: 1
  };
}

// --- Round 4: enrichCompanyProfile() -----------------------------------
//
// Deep, multi-source AI company enrichment - one openai.responses.create()
// call per company against a much larger structured-output schema than
// analyzeSiteCardWithOpenAI's, covering identification/location/contacts/
// web presence/industry/services/products/projects/clients/reputation/
// business scale/decision makers/website+marketing analysis/sales
// opportunities/demo concept/cold outreach/scores/sources/verification/
// conflicts. Every leaf is nullable (`type: [X, "null"]`) because the system
// prompt forbids inventing facts - "I don't know" must always be
// representable. The schema is built once at module load with small helper
// functions purely to avoid ~500 lines of copy-pasted boilerplate; the
// resulting AI_COMPANY_PROFILE_SCHEMA object itself is a complete, concrete
// JSON schema (verified structurally - see the round-4 report).
function nullableString() {
  return { type: ['string', 'null'] };
}
function nullableNumber() {
  return { type: ['number', 'null'] };
}
function nullableBoolean() {
  return { type: ['boolean', 'null'] };
}
function nullableEnum(values) {
  return { type: ['string', 'null'], enum: [...values, null] };
}
function stringArraySchema(maxItems) {
  return { type: 'array', maxItems, items: { type: 'string' } };
}
// additionalProperties:false is set on every nested object below (required
// by OpenAI strict mode at every nesting level, not just the top level) -
// this helper always includes it and always requires every property it
// defines, since strict mode requires every listed property be present
// (nullable, not omittable).
function nullableObjectArraySchema(maxItems, properties) {
  return {
    type: 'array',
    maxItems,
    items: {
      type: 'object',
      additionalProperties: false,
      required: Object.keys(properties),
      properties
    }
  };
}

const AI_COMPANY_PROFILE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'identification',
    'location',
    'contacts',
    'web_presence',
    'industry',
    'services',
    'products',
    'projects',
    'clients_partners',
    'reputation',
    'business_scale',
    'decision_makers',
    'website_analysis',
    'marketing_analysis',
    'sales_opportunities',
    'demo_site_concept',
    'cold_outreach',
    'scores',
    'sources',
    'verification_status',
    'conflicts'
  ],
  properties: {
    identification: {
      type: 'object',
      additionalProperties: false,
      required: [
        'display_name',
        'legal_name',
        'former_names',
        'brand_names',
        'short_description',
        'company_type',
        'legal_form',
        'current_status',
        'founding_year',
        'activity_start_year',
        'years_in_business',
        'nip',
        'krs',
        'regon',
        'pkd_codes',
        'owners',
        'founders',
        'board_members'
      ],
      properties: {
        display_name: nullableString(),
        legal_name: nullableString(),
        former_names: stringArraySchema(10),
        brand_names: stringArraySchema(10),
        short_description: nullableString(),
        company_type: nullableString(),
        legal_form: nullableString(),
        current_status: nullableString(),
        founding_year: nullableNumber(),
        activity_start_year: nullableNumber(),
        years_in_business: nullableNumber(),
        nip: nullableString(),
        krs: nullableString(),
        regon: nullableString(),
        pkd_codes: stringArraySchema(10),
        owners: stringArraySchema(10),
        founders: stringArraySchema(10),
        board_members: stringArraySchema(10)
      }
    },
    location: {
      type: 'object',
      additionalProperties: false,
      required: ['country', 'region', 'city', 'district', 'address', 'postal_code', 'service_areas', 'google_maps_url'],
      properties: {
        country: nullableString(),
        region: nullableString(),
        city: nullableString(),
        district: nullableString(),
        address: nullableString(),
        postal_code: nullableString(),
        service_areas: stringArraySchema(10),
        google_maps_url: nullableString()
      }
    },
    contacts: {
      type: 'object',
      additionalProperties: false,
      required: [
        'main_phone',
        'alternate_phones',
        'main_email',
        'sales_email',
        'contact_form_url',
        'opening_hours',
        'preferred_contact_method'
      ],
      properties: {
        main_phone: nullableString(),
        alternate_phones: stringArraySchema(10),
        main_email: nullableString(),
        sales_email: nullableString(),
        contact_form_url: nullableString(),
        opening_hours: nullableString(),
        preferred_contact_method: nullableString()
      }
    },
    web_presence: {
      type: 'object',
      additionalProperties: false,
      required: [
        'primary_website',
        'additional_websites',
        'facebook',
        'instagram',
        'linkedin',
        'youtube',
        'google_business_profile',
        'industry_profiles',
        'review_profiles'
      ],
      properties: {
        primary_website: nullableString(),
        additional_websites: stringArraySchema(10),
        facebook: nullableString(),
        instagram: nullableString(),
        linkedin: nullableString(),
        youtube: nullableString(),
        google_business_profile: nullableString(),
        industry_profiles: stringArraySchema(10),
        review_profiles: stringArraySchema(10)
      }
    },
    industry: {
      type: 'object',
      additionalProperties: false,
      required: ['main_industry', 'primary_niche', 'subniches', 'business_model', 'target_audiences', 'geographic_markets'],
      properties: {
        main_industry: nullableString(),
        primary_niche: nullableString(),
        subniches: stringArraySchema(10),
        business_model: nullableEnum(['B2B', 'B2C', 'B2B_B2C', 'UNKNOWN']),
        target_audiences: stringArraySchema(10),
        geographic_markets: stringArraySchema(10)
      }
    },
    services: nullableObjectArraySchema(20, {
      service_name: nullableString(),
      normalized_category: nullableString(),
      description: nullableString(),
      target_client: nullableString(),
      source_url: nullableString(),
      confidence: nullableEnum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'])
    }),
    products: nullableObjectArraySchema(15, {
      name: nullableString(),
      category: nullableString(),
      description: nullableString(),
      source_url: nullableString(),
      confidence: nullableEnum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'])
    }),
    projects: nullableObjectArraySchema(15, {
      project_name: nullableString(),
      city: nullableString(),
      project_type: nullableString(),
      client: nullableString(),
      scope_of_work: nullableString(),
      year: nullableNumber(),
      source_url: nullableString(),
      verified: nullableBoolean()
    }),
    clients_partners: {
      type: 'object',
      additionalProperties: false,
      required: ['named_clients', 'general_contractors', 'technology_partners', 'suppliers'],
      properties: {
        named_clients: stringArraySchema(15),
        general_contractors: stringArraySchema(15),
        technology_partners: stringArraySchema(15),
        suppliers: stringArraySchema(15)
      }
    },
    reputation: {
      type: 'object',
      additionalProperties: false,
      required: ['google_rating', 'google_review_count', 'positive_themes', 'negative_themes', 'awards'],
      properties: {
        google_rating: nullableNumber(),
        google_review_count: nullableNumber(),
        positive_themes: stringArraySchema(10),
        negative_themes: stringArraySchema(10),
        awards: stringArraySchema(10)
      }
    },
    business_scale: {
      type: 'object',
      additionalProperties: false,
      required: ['estimated_employee_range', 'revenue_estimate', 'revenue_year', 'growth_signals'],
      properties: {
        estimated_employee_range: nullableEnum(['1-5', '6-10', '11-20', '21-50', '51-100', '101-250', '250+', 'UNKNOWN']),
        revenue_estimate: nullableString(),
        revenue_year: nullableNumber(),
        growth_signals: stringArraySchema(10)
      }
    },
    decision_makers: nullableObjectArraySchema(10, {
      role: nullableString(),
      name: nullableString(),
      public_linkedin: nullableString(),
      public_email: nullableString(),
      public_phone: nullableString()
    }),
    website_analysis: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'mobile_friendly', 'languages', 'overall_weaknesses', 'strengths'],
      properties: {
        status: nullableString(),
        mobile_friendly: nullableBoolean(),
        languages: stringArraySchema(10),
        overall_weaknesses: stringArraySchema(10),
        strengths: stringArraySchema(10)
      }
    },
    marketing_analysis: {
      type: 'object',
      additionalProperties: false,
      required: ['current_positioning', 'unique_selling_points', 'trust_barriers', 'content_gaps'],
      properties: {
        current_positioning: nullableString(),
        unique_selling_points: stringArraySchema(10),
        trust_barriers: stringArraySchema(10),
        content_gaps: stringArraySchema(10)
      }
    },
    sales_opportunities: nullableObjectArraySchema(10, {
      opportunity: nullableString(),
      why_it_matters: nullableString(),
      priority: nullableEnum(['HIGH', 'MEDIUM', 'LOW']),
      type: nullableEnum(['fact', 'inference'])
    }),
    demo_site_concept: {
      type: 'object',
      additionalProperties: false,
      required: ['recommended_concept', 'hero_idea', 'primary_headline', 'recommended_sections'],
      properties: {
        recommended_concept: nullableString(),
        hero_idea: nullableString(),
        primary_headline: nullableString(),
        recommended_sections: stringArraySchema(10)
      }
    },
    cold_outreach: {
      type: 'object',
      additionalProperties: false,
      required: ['best_contact_role', 'suggested_opening', 'identified_website_problem', 'proposed_offer', 'next_step'],
      properties: {
        best_contact_role: nullableString(),
        suggested_opening: nullableString(),
        identified_website_problem: nullableString(),
        proposed_offer: nullableString(),
        next_step: nullableString()
      }
    },
    scores: {
      type: 'object',
      additionalProperties: false,
      required: [
        'lead_fit_score',
        'website_need_score',
        'budget_probability_score',
        'owner_access_score',
        'data_confidence_score',
        'overall_priority_score',
        'recommended_priority',
        'rejection_reasons',
        'analyst_summary'
      ],
      properties: {
        lead_fit_score: nullableNumber(),
        website_need_score: nullableNumber(),
        budget_probability_score: nullableNumber(),
        owner_access_score: nullableNumber(),
        data_confidence_score: nullableNumber(),
        overall_priority_score: nullableNumber(),
        recommended_priority: nullableEnum(['HIGH', 'MEDIUM', 'LOW', 'REJECT']),
        rejection_reasons: stringArraySchema(10),
        analyst_summary: nullableString()
      }
    },
    sources: nullableObjectArraySchema(20, {
      source_url: nullableString(),
      source_title: nullableString(),
      source_type: nullableString(),
      supports_fields: stringArraySchema(15),
      confidence: nullableEnum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'])
    }),
    verification_status: nullableEnum(['VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'CONFLICTING_DATA']),
    conflicts: nullableObjectArraySchema(10, {
      field_name: nullableString(),
      values: {
        type: 'array',
        maxItems: 10,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['value', 'source_url'],
          properties: {
            value: nullableString(),
            source_url: nullableString()
          }
        }
      }
    })
  }
};

async function enrichCompanyProfile({
  item,
  existingProfile,
  model,
  language = 'ru',
  workerId = '',
  companyId = '',
  jobId = '',
  webSearchEnabled = true
}) {
  if (!openai) {
    return { status: 'FAILED', error: 'OPENAI_API_KEY не настроен.' };
  }

  // See clampAiRequestTimeoutMs() near OPENAI_TIMEOUT_MS above - per-call
  // override for this feature's OpenAI calls, read fresh each invocation.
  // This function's schema is the largest of the three (max_output_tokens:
  // 8000) and its web_search calls were the slowest to time out during live
  // smoke testing, so getting this override right here matters most.
  const requestTimeoutMs = clampAiRequestTimeoutMs(store.getSettings().aiRequestTimeoutSeconds);

  // Reuse guard - mirrors analyzeSiteCardWithOpenAI's caller-side reuse guard
  // in the /api/discover pipeline above ("a company returned to the pool can
  // resurface... if it already has a completed AI analysis for the same
  // resolved website, reuse that result instead of paying for another OpenAI
  // call"). Here the equivalent identity check is the primary website: if
  // this company already carries a COMPLETED profile built from the same
  // primary_website, skip the call and hand back the existing envelope
  // unchanged rather than re-running an 8000-token enrichment pass.
  const existingCompleted = Boolean(existingProfile?.status === 'COMPLETED' && existingProfile?.data);
  const existingWebsite = cleanText(existingProfile?.data?.web_presence?.primary_website || '');
  const currentWebsite = cleanText(item?.website_url || item?.primary_website || '');
  const canReuseProfile = Boolean(existingCompleted && existingWebsite && currentWebsite && existingWebsite === currentWebsite);
  if (canReuseProfile) {
    return existingProfile;
  }

  const outputLanguage = ['ru', 'pl', 'en'].includes(String(language || '').toLowerCase()) ? String(language).toLowerCase() : 'ru';
  const outputLanguageName = { ru: 'Russian', pl: 'Polish', en: 'English' }[outputLanguage];

  const payload = {
    output_language: outputLanguage,
    company: {
      name: item?.company || 'UNKNOWN',
      niche: item?.niche || 'UNKNOWN',
      city: item?.city || 'UNKNOWN',
      district: item?.district || 'UNKNOWN',
      address: item?.address || 'UNKNOWN'
    },
    contacts: {
      phone: item?.phone || 'UNKNOWN',
      email: item?.email || 'UNKNOWN',
      instagram: item?.instagram || 'UNKNOWN',
      facebook: item?.facebook || 'UNKNOWN',
      source_profile: item?.source_profile || 'UNKNOWN'
    },
    business_signals: {
      review_count: item?.review_count || 0,
      rating: item?.rating || 0,
      last_activity: item?.last_activity || 'UNKNOWN',
      services: item?.services?.length ? item.services : ['UNKNOWN'],
      notes: item?.notes || '',
      independent_signals_found: item?.independent_signals_found || [],
      verification_status: item?.verification_status || 'UNVERIFIED',
      signals_detected: item?.signals_detected || []
    },
    website: {
      url: item?.website_url || 'UNKNOWN'
    },
    existing_profile: existingProfile?.data || null,
    rules: [
      'Use web search (when available) to verify and expand facts about this exact company - its own website, official registries, Google Maps/Business profile, social profiles, review platforms, directories and news.',
      'Never invent facts. If a field cannot be verified from real evidence, return null for it exactly as the schema requires - every field in the schema is nullable for this reason.',
      'Base every claim on real, findable evidence for THIS company, identified by company.name + company.city (+ district) in this payload - never substitute a different, similarly-named company.',
      'decision_makers must contain only public, professional contact details (e.g. a LinkedIn profile URL, a company-listed work email or phone) - never private, personal or unverified personal data.',
      'In sales_opportunities, set type to "fact" only when directly evidenced by a source, and "inference" when it is your own reasoned inference from the evidence - never present an inference as a fact.',
      'When sources disagree on a fact (e.g. differing production capacity numbers), do not silently pick one - record it in conflicts with every value and its source_url, and set the top-level verification_status to CONFLICTING_DATA.',
      `Write every user-facing text field in ${outputLanguageName}.`,
      'Return only JSON matching the schema.'
    ]
  };

  const input = [
    {
      role: 'system',
      content:
        `You perform deep, fact-checked company enrichment research for exactly ONE company, identified by company.name + company.city (+ district) in this payload. This payload is the complete and only source of truth about which company this is - it contains no data from any other company or request. Research this exact company using every signal available (its own website, official registries such as CEIDG/KRS/REGON, Google Maps/Business profile, social profiles, review platforms, industry directories, news) and fill in the schema with what you can genuinely verify. Never invent owners, revenue, employee counts, projects, clients, awards or contacts - if you cannot verify a field, return null. Distinguish confirmed facts from your own inferences explicitly (see sales_opportunities[].type). The public-professional-contact rule applies strictly to decision_makers. Output all analysis fields in ${outputLanguageName}. Return only JSON matching the schema.`
    },
    {
      role: 'user',
      content: JSON.stringify(payload, null, 2)
    }
  ];

  // No repair-retry here, matching analyzeSiteCardWithOpenAI's precedent (it
  // doesn't have one either). The request itself is allowed to throw up to
  // the caller - round 5's per-company try/catch is expected to wrap this
  // call the same way the existing discover-job pipeline already wraps
  // analyzeSiteCardWithOpenAI. Only the JSON.parse below gets its own
  // try/catch, so a single malformed response can't crash the whole
  // enrichment job.
  const response = await openai.responses.create(
    {
      model,
      tools: webSearchEnabled ? [{ type: 'web_search' }] : [],
      input,
      max_output_tokens: 8000,
      text: {
        format: {
          type: 'json_schema',
          name: 'ai_company_profile_enrichment',
          strict: true,
          schema: AI_COMPANY_PROFILE_SCHEMA
        }
      }
    },
    { timeout: requestTimeoutMs }
  );

  const usage = response.usage || {};
  store.logAiUsage({
    workerId,
    feature: 'ai_search_enrichment',
    model,
    promptTokens: usage.input_tokens || 0,
    completionTokens: usage.output_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    estimatedCost: estimateAiCost(model, usage.input_tokens || 0, usage.output_tokens || 0),
    companyId,
    runId: jobId
  });

  let data;
  try {
    data = JSON.parse(response.output_text);
  } catch (error) {
    return { status: 'FAILED', error: `Failed to parse AI company profile response as JSON: ${error.message || error}` };
  }

  return {
    status: 'COMPLETED',
    version: 1,
    analyzed_at: new Date().toISOString(),
    company_data_version: 1,
    data
  };
}

// --- Round 5: runAiSearchJob() orchestrator -----------------------------
//
// Ties every round 1-4 building block (AI Search Job store, planAiSearchQueries,
// runAiSearchBatch + its attached verification-status, enrichCompanyProfile,
// runWithConcurrencyLimit) together with the EXISTING normal-discovery
// machinery (discoverCompaniesBatchWithoutAI, store.upsertCompany/
// claimCompanyForRun/createRun/updateRun, store.findExistingCompanyId) into a
// single stage machine:
//
//   QUEUED -> PLANNING -> SEARCHING -> VALIDATING -> ENRICHING -> SCORING ->
//   SAVING -> COMPLETED / PARTIAL / CANCELLED / PAUSED / FAILED
//
// Resume strategy (per the round-5 spec, "use your judgment, document which
// you chose"): resume re-invokes runAiSearchJob(jobId) from scratch
// (re-plan + re-search) rather than trying to persist "already found
// candidates" mid-job. Candidates only exist in this function's local
// variables, not on the durable job record, so there is nothing cheap to
// resume from - re-running is simpler and safe (planAiSearchQueries/
// runAiSearchBatch are idempotent reads, not mutations) at the cost of some
// duplicate token spend if a job is paused and resumed later.
const AI_SEARCH_DUPLICATE_STREAK = MAX_DUPLICATE_STREAK;

// Statuses/pool-states that mean "this existing company must never be
// resurfaced as a fresh AI-search result": either it is actively owned by
// someone else right now (pool_state 'reserved' - not yet returned to the
// pool) or it carries a do-not-call-equivalent outcome from a previous call
// (rejected/wrong number/closed/duplicate), or was administratively removed.
const AI_SEARCH_DO_NOT_RESURFACE_STATUSES = new Set(['rejected', 'wrong_number', 'closed_business', 'duplicate', 'deleted']);
const AI_SEARCH_DO_NOT_RESURFACE_CRM_STATUSES = new Set(['odrzucony']);

function isExistingCompanyExcludedForAiSearch(existing) {
  if (!existing) return false;
  if (existing.pool_state === 'deleted') return true;
  if (existing.pool_state === 'reserved') return true;
  if (AI_SEARCH_DO_NOT_RESURFACE_STATUSES.has(existing.status)) return true;
  if (AI_SEARCH_DO_NOT_RESURFACE_CRM_STATUSES.has(existing.crm_status)) return true;
  return false;
}

// job.params.excludeLists = { domains: [], nips: [], phones: [] } - a caller
// (e.g. "never show me this competitor again") can blacklist a candidate by
// any of these identity signals regardless of whether it already exists in
// the store.
function matchesAiSearchExcludeLists(candidate, excludeLists = {}) {
  const domains = (Array.isArray(excludeLists.domains) ? excludeLists.domains : [])
    .map((value) => String(value || '').toLowerCase().trim())
    .filter(Boolean);
  if (domains.length) {
    const host = safeHostname(candidate.website_url || candidate.source_profile || '');
    if (host && domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return true;
  }
  const nips = (Array.isArray(excludeLists.nips) ? excludeLists.nips : []).map(cleanIdentifier).filter(Boolean);
  if (nips.length) {
    const candidateNip = cleanIdentifier(candidate.nip || '');
    if (candidateNip && nips.includes(candidateNip)) return true;
  }
  const phones = (Array.isArray(excludeLists.phones ? excludeLists.phones : []) ? excludeLists.phones : [])
    .map((value) => normalizePhone(value))
    .filter(Boolean);
  if (phones.length) {
    const candidatePhone = normalizePhone(candidate.phone || '');
    if (candidatePhone && phones.includes(candidatePhone)) return true;
  }
  return false;
}

// Applies the "curated extra criteria" fields a later frontend round is
// expected to send (minReviews, minRating, websitePresence, excludeKeywords).
// Fields we cannot yet meaningfully filter on pre-enrichment (clientType,
// companySizeRange, minYearsInBusiness, websiteQualityFlags) are simply left
// stored on job.params untouched - see the round-5 report.
function passesAiSearchExtraCriteria(candidate, params = {}) {
  const minReviews = Number(params.minReviews) || 0;
  if (minReviews > 0 && Number(candidate.review_count || 0) < minReviews) return false;
  const minRating = Number(params.minRating) || 0;
  if (minRating > 0 && Number(candidate.rating || 0) > 0 && Number(candidate.rating) < minRating) return false;
  const websitePresence = String(params.websitePresence || '').trim().toLowerCase();
  if (websitePresence === 'has_website' && !cleanText(candidate.website_url || '')) return false;
  if (websitePresence === 'no_website' && cleanText(candidate.website_url || '')) return false;
  const excludeKeywords = (Array.isArray(params.excludeKeywords) ? params.excludeKeywords : [])
    .map((value) => String(value || '').toLowerCase().trim())
    .filter(Boolean);
  if (excludeKeywords.length) {
    const haystack = [candidate.company, candidate.notes, (candidate.services || []).join(' ')]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (excludeKeywords.some((keyword) => haystack.includes(keyword))) return false;
  }
  return true;
}

// Maps a raw AI-search (or combined-mode) candidate into the same flat shape
// discoverCompaniesBatchWithoutAI's own candidates go through before
// store.upsertCompany/claimCompanyForRun (normalizeItems), while preserving
// the AI-search-specific verification fields normalizeItems doesn't know
// about (it builds a fresh object literal and would otherwise drop them).
function mapAiCandidateToCompanyRow(candidate) {
  const [normalized] = normalizeItems([candidate]);
  if (!normalized) return null;
  return {
    ...normalized,
    verification_status: candidate.verification_status || 'VERIFIED',
    signals_detected: candidate.signals_detected || [],
    independent_signals_found: candidate.independent_signals_found || []
  };
}

// Rough per-unit cost estimate used only for the "would the NEXT call blow
// the budget" pre-check - based on this job's own running average cost per
// completed unit so far (falls back to a conservative flat guess before any
// real data exists for this job yet).
function estimateNextAiSearchUnitCost(estimatedCostSoFar, unitsDoneSoFar, fallback) {
  if (unitsDoneSoFar > 0) return estimatedCostSoFar / unitsDoneSoFar;
  return fallback;
}

function aiSearchBudgetWouldExceed(estimatedCostSoFar, unitsDoneSoFar, settings, fallback) {
  const limit = Number(settings.aiDailyBudgetLimit) || 0;
  if (limit <= 0) return false;
  const nextUnitEstimate = estimateNextAiSearchUnitCost(estimatedCostSoFar, unitsDoneSoFar, fallback);
  return estimatedCostSoFar + nextUnitEstimate > limit;
}

async function runAiSearchJob(jobId) {
  try {
    const initialJob = store.getAiSearchJob(jobId);
    if (!initialJob) return;

    const params = initialJob.params || {};
    const requestedNiches = unique((Array.isArray(params.niches) ? params.niches : []).map(cleanText).filter(Boolean));
    const niche = cleanText(params.niche || requestedNiches[0] || '');
    const niches = requestedNiches.length ? requestedNiches : niche ? [niche] : [];
    const city = cleanText(params.city || '');
    const country = cleanText(params.country || '');
    const district = cleanText(params.district || '');
    const radiusKm = Number(params.radiusKm) || 0;
    const language = cleanText(params.language || 'ru');
    const requestedCount = clamp(Number(params.requestedCount) || 10, 1, 100);
    const excludeLists = params.excludeLists || {};
    const mode = initialJob.mode === 'combined' ? 'combined' : 'ai_search';
    const modelSearch = initialJob.model_search;
    const modelEnrich = initialJob.model_enrich;
    const workerId = initialJob.creator_worker_id;

    // Settings are read ONCE here (concurrency cap / web-search toggle) so a
    // mid-job admin settings change never destabilizes a running job - model
    // choices themselves were already snapshotted onto the job at creation
    // time (job.model_search/job.model_enrich) and are used as-is above.
    const settings = store.getSettings();
    const concurrency = Math.max(1, Number(settings.aiMaxParallelRequests) || 3);
    const webSearchEnabled = Boolean(settings.aiWebSearchEnabled);

    if (!niches.length || (!city && !country)) {
      store.updateAiSearchJob(jobId, {
        stage: 'FAILED',
        stage_detail: 'Missing niche or city/country.',
        finished_at: new Date().toISOString(),
        errors: [{ stage: 'QUEUED', message: 'Missing niche or city/country.', at: new Date().toISOString() }]
      });
      return;
    }

    let localWebSearchCalls = 0;
    // Ground truth for cost/tokens is store.getAiUsageForRun(jobId): every AI
    // call this job makes (planning, search batches, enrichment, and their
    // repair-retries) already logs through store.logAiUsage with runId set
    // to this jobId (round 3/4 convention - see planAiSearchQueries/
    // runAiSearchBatch/enrichCompanyProfile above), so re-reading it here
    // after each unit of work is more reliable than manually re-summing
    // partial return values (enrichCompanyProfile in particular doesn't
    // return a token/cost figure to its caller at all).
    function syncJobUsageFromLedger(extraProgress) {
      const usage = store.getAiUsageForRun(jobId);
      store.updateAiSearchJob(jobId, {
        estimated_cost: Number((usage.totalCost || 0).toFixed(6)),
        token_usage: { total: usage.totalTokens || 0 },
        web_search_calls: localWebSearchCalls,
        ...(extraProgress ? { progress: extraProgress } : {})
      });
      return usage;
    }

    await discoveryContextStorage.run({ country, radiusKm, city }, async () => {
      // ---- PLANNING --------------------------------------------------
      store.updateAiSearchJob(jobId, {
        stage: 'PLANNING',
        stage_detail: 'Planning search queries...',
        started_at: new Date().toISOString()
      });

      const extraKeywords = (Array.isArray(params.extraKeywords) ? params.extraKeywords : []).map(cleanText).filter(Boolean);
      const nicheForPlanner = extraKeywords.length ? `${niche} ${extraKeywords.join(' ')}` : niche;

      let planResult;
      try {
        planResult = await planAiSearchQueries({
          niche: nicheForPlanner,
          city,
          district,
          country,
          language,
          count: requestedCount,
          workerId,
          jobId
        });
      } catch (error) {
        store.updateAiSearchJob(jobId, {
          stage: 'FAILED',
          stage_detail: `Planning failed: ${error.message || error}`,
          finished_at: new Date().toISOString(),
          errors: [{ stage: 'PLANNING', message: error.message || String(error), at: new Date().toISOString() }]
        });
        return;
      }

      const queries = planResult.queries || [];
      syncJobUsageFromLedger({ planned_queries: queries.length });

      if (!queries.length) {
        store.updateAiSearchJob(jobId, {
          stage: 'FAILED',
          stage_detail: 'Planner produced zero queries.',
          finished_at: new Date().toISOString(),
          errors: [{ stage: 'PLANNING', message: 'Planner returned no usable queries.', at: new Date().toISOString() }]
        });
        return;
      }

      // ---- SEARCHING ---------------------------------------------------
      store.updateAiSearchJob(jobId, { stage: 'SEARCHING', stage_detail: 'Running planned search queries...' });

      let allCandidates = [];
      let zeroNewStreak = 0;
      const searchState = { stopped: false, reason: '' };

      // combined mode: fan out the EXISTING non-AI discovery pipeline
      // alongside the AI query batches, merged into the same candidate pool
      // before VALIDATING (below) dedups everything uniformly.
      let combinedDiscoveryPromise = null;
      if (mode === 'combined') {
        combinedDiscoveryPromise = discoverCompaniesBatchWithoutAI({
          niches,
          city,
          district,
          limit: Math.max(requestedCount * 3, 30),
          sourceFocus: cleanText(params.sourceFocus) || 'internet',
          workerId
        }).catch((error) => {
          store.updateAiSearchJob(jobId, {
            errors: [
              {
                stage: 'SEARCHING',
                message: `Combined-mode normal discovery failed: ${error.message || error}`,
                at: new Date().toISOString()
              }
            ]
          });
          return { companies: [] };
        });
      }

      async function searchWorker(query) {
        if (searchState.stopped) return null;
        const freshJob = store.getAiSearchJob(jobId);
        if (freshJob?.cancel_requested) {
          searchState.stopped = true;
          searchState.reason = 'cancelled';
          return null;
        }
        if (freshJob?.pause_requested) {
          searchState.stopped = true;
          searchState.reason = 'paused';
          return null;
        }
        const queriesRunSoFar = freshJob?.progress?.queries_run || 0;
        if (aiSearchBudgetWouldExceed(freshJob?.estimated_cost || 0, queriesRunSoFar, settings, 0.05)) {
          searchState.stopped = true;
          searchState.reason = 'budget';
          return null;
        }

        let batch;
        try {
          batch = await runAiSearchBatch({
            query,
            niche,
            city,
            district,
            country,
            limit: 15,
            model: modelSearch,
            webSearchEnabled,
            jobId,
            workerId
          });
        } catch (error) {
          store.updateAiSearchJob(jobId, {
            errors: [{ stage: 'SEARCHING', message: `Query "${query}" failed: ${error.message || error}`, at: new Date().toISOString() }]
          });
          return null;
        }

        if (webSearchEnabled && batch.webSearchUsed) localWebSearchCalls += 1;
        for (const company of batch.companies) company.source = 'ai_search';

        const beforeCount = uniqueCompanies(allCandidates).length;
        allCandidates = uniqueCompanies([...allCandidates, ...batch.companies]);
        const afterCount = allCandidates.length;
        const newFromThisBatch = afterCount - beforeCount;
        zeroNewStreak = newFromThisBatch === 0 ? zeroNewStreak + 1 : 0;

        const latestJob = store.getAiSearchJob(jobId);
        syncJobUsageFromLedger({
          queries_run: (latestJob?.progress?.queries_run || 0) + 1,
          candidates_found: afterCount
        });

        if (afterCount >= requestedCount) {
          searchState.stopped = true;
          searchState.reason = 'target_reached';
        } else if (zeroNewStreak >= AI_SEARCH_DUPLICATE_STREAK) {
          searchState.stopped = true;
          searchState.reason = 'duplicate_streak';
        }
        return batch;
      }

      await runWithConcurrencyLimit(queries, concurrency, searchWorker);

      if (searchState.reason === 'cancelled') {
        store.updateAiSearchJob(jobId, {
          stage: 'CANCELLED',
          stage_detail: 'Cancelled during search.',
          finished_at: new Date().toISOString(),
          cancel_reason: store.getAiSearchJob(jobId)?.cancel_reason || 'user_cancelled'
        });
        return;
      }
      if (searchState.reason === 'paused') {
        store.updateAiSearchJob(jobId, { stage: 'PAUSED', stage_detail: 'Paused during search.' });
        return;
      }

      if (combinedDiscoveryPromise) {
        const normalDiscovery = await combinedDiscoveryPromise;
        allCandidates = uniqueCompanies([...allCandidates, ...(normalDiscovery.companies || [])]);
        syncJobUsageFromLedger({ candidates_found: allCandidates.length });
      }

      // ---- VALIDATING ----------------------------------------------------
      store.updateAiSearchJob(jobId, { stage: 'VALIDATING', stage_detail: 'Deduplicating and validating candidates...' });

      const jobAfterSearch = store.getAiSearchJob(jobId);
      if (jobAfterSearch?.cancel_requested) {
        store.updateAiSearchJob(jobId, {
          stage: 'CANCELLED',
          stage_detail: 'Cancelled before validation.',
          finished_at: new Date().toISOString(),
          cancel_reason: jobAfterSearch.cancel_reason || 'user_cancelled'
        });
        return;
      }
      if (jobAfterSearch?.pause_requested) {
        store.updateAiSearchJob(jobId, { stage: 'PAUSED', stage_detail: 'Paused before validation.' });
        return;
      }

      let rejected = 0;
      let duplicatesSkipped = 0;
      const confirmed = [];
      for (const candidate of allCandidates) {
        if (matchesAiSearchExcludeLists(candidate, excludeLists)) {
          rejected += 1;
          continue;
        }
        const existingId = store.findExistingCompanyId(candidate);
        const existing = existingId ? store.getCompany(existingId) : null;
        if (existing && isExistingCompanyExcludedForAiSearch(existing)) {
          rejected += 1;
          continue;
        }
        if (!passesAiSearchExtraCriteria(candidate, params)) {
          rejected += 1;
          continue;
        }
        if (existing) duplicatesSkipped += 1;
        confirmed.push({ candidate, existingId });
      }

      // Prefer verified candidates, but never starve the result to zero: fill
      // any remaining slots from UNVERIFIED candidates only if there aren't
      // enough verified/partially-verified ones to meet requestedCount.
      const verifiedFirst = confirmed.filter((entry) => entry.candidate.verification_status !== 'UNVERIFIED');
      const unverifiedOnly = confirmed.filter((entry) => entry.candidate.verification_status === 'UNVERIFIED');
      let finalCandidates = verifiedFirst.slice(0, requestedCount);
      if (finalCandidates.length < requestedCount) {
        finalCandidates = finalCandidates.concat(unverifiedOnly.slice(0, requestedCount - finalCandidates.length));
      }
      rejected += confirmed.length - finalCandidates.length;

      store.updateAiSearchJob(jobId, {
        progress: {
          candidates_confirmed: finalCandidates.length,
          duplicates_skipped: duplicatesSkipped,
          rejected
        }
      });

      // ---- ENRICHING -----------------------------------------------------
      store.updateAiSearchJob(jobId, { stage: 'ENRICHING', stage_detail: 'Enriching confirmed candidates...' });

      // A lightweight, informational company-by-company view so the worker
      // sees candidates appear as they're checked, instead of only the final
      // saved list once SAVING completes at the very end of the job. These
      // entries are NOT yet saved/claimed - that only happens in SAVING below -
      // so this array is for progress display only.
      const previewCompanies = finalCandidates.map((entry) => ({
        company: entry.candidate.company || entry.candidate.legal_name || '',
        niche: entry.candidate.niche || niche,
        city: entry.candidate.city || city,
        verification_status: entry.candidate.verification_status || 'UNVERIFIED',
        review_status: 'pending'
      }));
      store.updateAiSearchJob(jobId, { preview_companies: previewCompanies });

      const enrichState = { stopped: false, reason: '' };

      function markPreview(index, review_status) {
        if (!previewCompanies[index]) return;
        previewCompanies[index] = { ...previewCompanies[index], review_status };
        store.updateAiSearchJob(jobId, { preview_companies: previewCompanies });
      }

      async function enrichWorker(entry, index) {
        if (enrichState.stopped) return { ...entry, outcome: 'skipped' };
        const freshJob = store.getAiSearchJob(jobId);
        if (freshJob?.cancel_requested) {
          enrichState.stopped = true;
          enrichState.reason = 'cancelled';
          return { ...entry, outcome: 'skipped' };
        }
        if (freshJob?.pause_requested) {
          enrichState.stopped = true;
          enrichState.reason = 'paused';
          return { ...entry, outcome: 'skipped' };
        }
        const enrichedSoFar = freshJob?.progress?.enriched || 0;
        if (aiSearchBudgetWouldExceed(freshJob?.estimated_cost || 0, enrichedSoFar, settings, 0.15)) {
          enrichState.stopped = true;
          enrichState.reason = 'budget';
          return { ...entry, outcome: 'skipped' };
        }

        markPreview(index, 'checking');
        const existingCompanyRecord = entry.existingId ? store.getCompany(entry.existingId) : null;
        const existingProfile = existingCompanyRecord?.aiCompanyProfile || null;
        let result;
        try {
          result = await enrichCompanyProfile({
            item: entry.candidate,
            existingProfile,
            model: modelEnrich,
            language,
            workerId,
            companyId: entry.existingId || '',
            jobId,
            webSearchEnabled
          });
        } catch (error) {
          result = { status: 'FAILED', error: error.message || String(error) };
        }
        if (webSearchEnabled) localWebSearchCalls += 1;

        if (result.status === 'COMPLETED') {
          const latestJob = store.getAiSearchJob(jobId);
          syncJobUsageFromLedger({ enriched: (latestJob?.progress?.enriched || 0) + 1 });
          markPreview(index, 'enriched');
          return { ...entry, outcome: 'enriched', profile: result };
        }

        syncJobUsageFromLedger();
        store.updateAiSearchJob(jobId, {
          errors: [
            {
              stage: 'ENRICHING',
              message: `Enrichment failed for "${entry.candidate.company || entry.existingId}": ${result.error || 'unknown error'}`,
              at: new Date().toISOString()
            }
          ]
        });
        markPreview(index, 'failed');
        return { ...entry, outcome: 'enrich_failed', profile: result };
      }

      const enrichOutcomes = await runWithConcurrencyLimit(finalCandidates, concurrency, enrichWorker);

      if (enrichState.reason === 'cancelled') {
        store.updateAiSearchJob(jobId, {
          stage: 'CANCELLED',
          stage_detail: 'Cancelled during enrichment.',
          finished_at: new Date().toISOString(),
          cancel_reason: store.getAiSearchJob(jobId)?.cancel_reason || 'user_cancelled'
        });
        return;
      }
      if (enrichState.reason === 'paused') {
        store.updateAiSearchJob(jobId, { stage: 'PAUSED', stage_detail: 'Paused during enrichment.' });
        return;
      }

      // ---- SCORING ---------------------------------------------------
      // Trivial by design: the `scores` group already lives inside each
      // enrichCompanyProfile() result. A REJECT recommendation never causes a
      // confirmed real company to be discarded - it's just tallied here for
      // visibility.
      store.updateAiSearchJob(jobId, { stage: 'SCORING', stage_detail: 'Reviewing recommendation scores...' });
      let rejectedByScore = 0;
      for (const outcome of enrichOutcomes) {
        if (outcome?.outcome === 'enriched' && outcome.profile?.data?.scores?.recommended_priority === 'REJECT') {
          rejectedByScore += 1;
        }
      }
      if (rejectedByScore) {
        store.updateAiSearchJob(jobId, { progress: { rejected_by_score: rejectedByScore } });
      }

      // ---- SAVING ----------------------------------------------------
      store.updateAiSearchJob(jobId, { stage: 'SAVING', stage_detail: 'Saving companies to the shared pool...' });

      const run = store.createRun({
        niches,
        city,
        country,
        district,
        radiusKm,
        language,
        workerId,
        sourceFocus: mode === 'combined' ? 'ai_search_combined' : 'ai_search',
        requestedLimit: requestedCount
      });
      store.updateAiSearchJob(jobId, { run_id: run.id });

      const savedCompanyIds = [];
      let savedCount = 0;
      let newCount = 0;
      let duplicateCount = 0;
      let rejectedAtSave = 0;
      let attemptedCount = 0;
      for (const [index, outcome] of enrichOutcomes.entries()) {
        // 'skipped' means cancel/pause/budget stopped the pipeline before
        // this candidate was even attempted - it was never processed, so it
        // is left out of this run entirely (a future job can rediscover it).
        if (!outcome || outcome.outcome === 'skipped') continue;
        attemptedCount += 1;
        const row = mapAiCandidateToCompanyRow(outcome.candidate);
        if (!row) {
          rejectedAtSave += 1;
          markPreview(index, 'rejected');
          continue;
        }
        const claim = store.claimCompanyForRun(row, { runId: run.id, workerId, stage: 'analyzed' });
        // Defensive re-check: claimCompanyForRun itself is the final source of
        // truth on whether this candidate is actually claimable right now (it
        // re-derives pool_state fresh, catching anything the VALIDATING
        // stage's own exclusion check above might have missed) - a rejected
        // claim (still actively owned/processed elsewhere) must not be
        // counted as saved.
        if (!claim.isClaimed) {
          rejectedAtSave += 1;
          markPreview(index, 'rejected');
          continue;
        }
        if (claim.isNew || claim.isNewForRun) newCount += 1;
        else duplicateCount += 1;
        savedCompanyIds.push(claim.id);
        savedCount += 1;
        if (outcome.profile) store.updateAiCompanyProfile(claim.id, outcome.profile);
        markPreview(index, 'saved');
      }
      store.addCompanyIdsToRun(run.id, savedCompanyIds);

      // ---- COMPLETED / PARTIAL --------------------------------------
      const naturallyExhausted = searchState.reason === 'duplicate_streak' && enrichState.reason !== 'budget';
      const finalStage = savedCount >= requestedCount || naturallyExhausted ? 'COMPLETED' : 'PARTIAL';

      // Finalize the durable run record the same way the existing discovery
      // pipeline's runDiscoveryJob does (status/finished_at/found_count/
      // new_count/duplicate_count) - company_ids is intentionally omitted
      // here since store.addCompanyIdsToRun above already populated it,
      // matching the existing pipeline's own precedent.
      store.updateRun(run.id, {
        status: finalStage === 'COMPLETED' ? 'completed' : 'completed_partial',
        finished_at: new Date().toISOString(),
        found_count: attemptedCount,
        new_count: newCount,
        duplicate_count: duplicateCount,
        analyzed_count: savedCount
      });

      const currentRejected = store.getAiSearchJob(jobId)?.progress?.rejected || 0;
      store.updateAiSearchJob(jobId, {
        progress: { saved: savedCount, rejected: currentRejected + rejectedAtSave },
        stage: finalStage,
        stage_detail:
          finalStage === 'COMPLETED'
            ? `Saved ${savedCount} companies.`
            : `Saved ${savedCount} of ${requestedCount} requested (stopped: ${searchState.reason || enrichState.reason || 'exhausted candidates'}).`,
        finished_at: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error(`[ai-search-job] id=${jobId} failed:`, error);
    store.updateAiSearchJob(jobId, {
      stage: 'FAILED',
      stage_detail: error.message || 'Unexpected error.',
      finished_at: new Date().toISOString(),
      errors: [{ stage: store.getAiSearchJob(jobId)?.stage || 'UNKNOWN', message: error.message || String(error), at: new Date().toISOString() }]
    });
  }
}

// --- Round 5: runAiEnrichOnlyJob() -------------------------------------
//
// Separate, much simpler orchestrator for mode==='ai_enrich': job.params
// carries companyIds (already-existing companies) instead of search
// criteria. Stage goes straight QUEUED -> ENRICHING -> SCORING ->
// COMPLETED/PARTIAL, with no planning/searching/validating/saving-as-new -
// every target company already exists, so only enrichCompanyProfile() +
// store.updateAiCompanyProfile() run per id.
async function runAiEnrichOnlyJob(jobId) {
  try {
    const job = store.getAiSearchJob(jobId);
    if (!job) return;

    const params = job.params || {};
    const companyIds = unique((Array.isArray(params.companyIds) ? params.companyIds : []).map((id) => String(id || '')).filter(Boolean));
    const language = cleanText(params.language || 'ru');
    const workerId = job.creator_worker_id;
    const modelEnrich = job.model_enrich;
    const settings = store.getSettings();
    const concurrency = Math.max(1, Number(settings.aiMaxParallelRequests) || 3);
    const webSearchEnabled = Boolean(settings.aiWebSearchEnabled);

    if (!companyIds.length) {
      store.updateAiSearchJob(jobId, {
        stage: 'FAILED',
        stage_detail: 'No companyIds provided.',
        finished_at: new Date().toISOString(),
        errors: [{ stage: 'QUEUED', message: 'No companyIds provided.', at: new Date().toISOString() }]
      });
      return;
    }

    store.updateAiSearchJob(jobId, {
      stage: 'ENRICHING',
      stage_detail: 'Enriching selected companies...',
      started_at: new Date().toISOString()
    });

    const enrichState = { stopped: false, reason: '' };
    let enrichedCount = 0;

    async function worker(companyId) {
      if (enrichState.stopped) return;
      const freshJob = store.getAiSearchJob(jobId);
      if (freshJob?.cancel_requested) {
        enrichState.stopped = true;
        enrichState.reason = 'cancelled';
        return;
      }
      if (freshJob?.pause_requested) {
        enrichState.stopped = true;
        enrichState.reason = 'paused';
        return;
      }
      const enrichedSoFar = freshJob?.progress?.enriched || 0;
      if (aiSearchBudgetWouldExceed(freshJob?.estimated_cost || 0, enrichedSoFar, settings, 0.15)) {
        enrichState.stopped = true;
        enrichState.reason = 'budget';
        return;
      }

      const existing = store.getCompany(companyId);
      if (!existing) {
        store.updateAiSearchJob(jobId, {
          errors: [{ stage: 'ENRICHING', message: `Company ${companyId} not found.`, at: new Date().toISOString() }]
        });
        return;
      }
      const data = existing.data || {};
      const item = {
        company: data.company || '',
        niche: data.niche || '',
        city: data.city || '',
        district: data.district || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website_url: data.website_url || '',
        instagram: data.social_profiles?.instagram || data.instagram || '',
        facebook: data.social_profiles?.facebook || data.facebook || '',
        source_profile: data.source_profile || '',
        review_count: data.review_count || 0,
        rating: data.rating || 0,
        last_activity: data.last_activity || '',
        services: data.services || [],
        notes: data.notes || '',
        independent_signals_found: data.independent_signals_found || [],
        verification_status: data.verification_status || 'UNVERIFIED',
        signals_detected: data.signals_detected || []
      };

      let result;
      try {
        result = await enrichCompanyProfile({
          item,
          existingProfile: existing.aiCompanyProfile,
          model: modelEnrich,
          language,
          workerId,
          companyId,
          jobId,
          webSearchEnabled
        });
      } catch (error) {
        result = { status: 'FAILED', error: error.message || String(error) };
      }

      const usage = store.getAiUsageForRun(jobId);
      store.updateAiSearchJob(jobId, {
        estimated_cost: Number((usage.totalCost || 0).toFixed(6)),
        token_usage: { total: usage.totalTokens || 0 }
      });

      if (result.status === 'COMPLETED') {
        store.updateAiCompanyProfile(companyId, result);
        enrichedCount += 1;
        store.updateAiSearchJob(jobId, { progress: { enriched: enrichedCount, saved: enrichedCount } });
      } else {
        // Still record the FAILED envelope on the company (visible proof an
        // enrichment attempt happened and what went wrong), then move on -
        // one bad company must never kill the rest of the batch.
        store.updateAiCompanyProfile(companyId, result);
        store.updateAiSearchJob(jobId, {
          errors: [
            {
              stage: 'ENRICHING',
              message: `Enrichment failed for company ${companyId}: ${result.error || 'unknown error'}`,
              at: new Date().toISOString()
            }
          ]
        });
      }
    }

    await runWithConcurrencyLimit(companyIds, concurrency, worker);

    if (enrichState.reason === 'cancelled') {
      store.updateAiSearchJob(jobId, {
        stage: 'CANCELLED',
        stage_detail: 'Cancelled by user.',
        finished_at: new Date().toISOString(),
        cancel_reason: store.getAiSearchJob(jobId)?.cancel_reason || 'user_cancelled'
      });
      return;
    }
    if (enrichState.reason === 'paused') {
      store.updateAiSearchJob(jobId, { stage: 'PAUSED', stage_detail: 'Paused by user.' });
      return;
    }

    store.updateAiSearchJob(jobId, { stage: 'SCORING', stage_detail: 'Reviewing recommendation scores...' });
    store.updateAiSearchJob(jobId, {
      stage: enrichedCount >= companyIds.length ? 'COMPLETED' : 'PARTIAL',
      stage_detail: `Enriched ${enrichedCount} of ${companyIds.length} companies.`,
      finished_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[ai-enrich-job] id=${jobId} failed:`, error);
    store.updateAiSearchJob(jobId, {
      stage: 'FAILED',
      stage_detail: error.message || 'Unexpected error.',
      finished_at: new Date().toISOString(),
      errors: [{ stage: 'ENRICHING', message: error.message || String(error), at: new Date().toISOString() }]
    });
  }
}

function buildUrlCandidates(inputUrl) {
  const raw = String(inputUrl || '').trim();
  if (!raw) return [];
  if (/^https?:\/\//i.test(raw)) return [safeUrl(raw)].filter(Boolean);
  return [`https://${raw}`, `http://${raw}`].map(safeUrl).filter(Boolean);
}

// Blocks obvious SSRF targets (loopback, link-local, RFC1918 private ranges,
// cloud metadata endpoints) before this server's own network fetches a
// "company website" URL that ultimately comes from search results / CSV
// import - i.e. attacker-influenced input. This is a hostname/IP-literal
// check, not full DNS-rebinding protection (the resolved IP at actual fetch
// time isn't re-checked), but it stops the realistic case of a discovered or
// imported URL pointing at an internal address.
function isBlockedHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host === '::1' || host === '0.0.0.0') return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // RFC1918
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata (169.254.169.254)
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    if (a === 0) return true;
  }
  if (/^(fe80|fc00|fd00|::)/i.test(host)) return true; // IPv6 link-local/unique-local
  return false;
}

function safeUrl(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (isBlockedHost(url.hostname)) return null;
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

// Keyed by the issue "category" set in HEURISTIC_ISSUE_DEFS (see
// buildWebsiteAnalysis) rather than by regex-matching the already-translated
// problem text, which is what silently pinned this to Russian before.
const WHY_IT_MATTERS_BY_CATEGORY = {
  mobile: {
    pl: 'Lokalny klient częściej porównuje firmy z telefonu. Jeśli strona jest niewygodna, szybciej przechodzi do konkurencji.',
    ru: 'Локальный клиент чаще сравнивает компании с телефона. Если сайт неудобен, он быстрее уходит к конкуренту.'
  },
  portfolio: {
    pl: 'W wizualnych branżach klient kupuje zaufanie poprzez przykłady prac. Jeśli nie są dobrze zebrane, realny poziom firmy nie jest widoczny.',
    ru: 'В визуальных нишах клиент покупает доверие через примеры работ. Если они не собраны нормально, реальный уровень бизнеса не виден.'
  },
  price: {
    pl: 'Orientacyjne ceny zmniejszają liczbę zbędnych pytań i pomagają klientowi zrozumieć, czy firma pasuje do jego potrzeb.',
    ru: 'Ориентиры стоимости снижают лишние вопросы и помогают клиенту понять, подходит ли компания под его задачу.'
  },
  trust: {
    pl: 'Dla lokalnego biznesu strona musi szybko udowodnić, że firma jest prawdziwa, aktywna i można jej zaufać.',
    ru: 'Для локального бизнеса сайт должен быстро доказать, что компания настоящая, активная и ей можно доверять.'
  },
  default: {
    pl: 'Strona powinna szybko wyjaśnić usługi, zaufanie i następny krok. Jeśli nie widać tego od razu, część klientów odchodzi do konkurencji.',
    ru: 'Сайт должен быстро объяснить услуги, доверие и следующий шаг. Если это не видно сразу, часть клиентов уходит к конкурентам.'
  }
};

function buildWhyItMatters(category, language) {
  const lang = normalizeAnalysisLanguage(language);
  const pair = WHY_IT_MATTERS_BY_CATEGORY[category] || WHY_IT_MATTERS_BY_CATEGORY.default;
  return heuristicText(pair, lang);
}

function buildNicheSolution(niche, language) {
  const lang = normalizeAnalysisLanguage(language);
  const normalized = String(niche || '').toLowerCase();
  if (/klimatyz|wentyl/.test(normalized)) {
    return heuristicText(
      {
        pl: 'Nowa strona z osobnymi podstronami montaż, serwis, naprawa, przykładami montaży, cenami "od", obsługiwanymi dzielnicami i formularzem wyceny.',
        ru: 'Новый сайт с отдельными страницами montaż, serwis, naprawa, примерами монтажей, ценами "от", районами обслуживания и формой расчета.'
      },
      lang
    );
  }
  if (/remont|wyko|wnętr|wnetr/.test(normalized)) {
    return heuristicText(
      {
        pl: 'Nowa strona z portfolio, case\'ami wg metrażu/terminu/budżetu, etapami pracy i formularzem, w którym można dołączyć plan i zdjęcia.',
        ru: 'Новый сайт с портфолио, кейсами по площади/сроку/бюджету, этапами работы и формой, куда можно прикрепить план и фото.'
      },
      lang
    );
  }
  if (/detailing|pdr|wrapping/.test(normalized)) {
    return heuristicText(
      {
        pl: 'Nowa strona z pakietami usług, cennikiem, galerią przed/po i formularzem z marką samochodu i zdjęciami.',
        ru: 'Новый сайт с пакетами услуг, прайсом, галереей до/после и формой с маркой автомобиля и фотографиями.'
      },
      lang
    );
  }
  if (/stomat|implant|ortod/.test(normalized)) {
    return heuristicText(
      {
        pl: 'Nowa strona z osobnymi podstronami zabiegów, profilami lekarzy, cenami, FAQ, zdjęciami kliniki i wygodnym zapisem.',
        ru: 'Новый сайт с отдельными страницами процедур, профилями врачей, ценами, FAQ, фотографиями клиники и удобной записью.'
      },
      lang
    );
  }
  if (/fizj|rehabil/.test(normalized)) {
    return heuristicText(
      {
        pl: 'Nowa strona ze stronami pod konkretne problemy, specjalistami, metodami, cenami i zapisem.',
        ru: 'Новый сайт со страницами под конкретные проблемы, специалистами, методами, ценами и записью.'
      },
      lang
    );
  }
  if (/księg|ksieg|rachunk/.test(normalized)) {
    return heuristicText(
      {
        pl: 'Nowa strona z usługami dla JDG, sp. z o.o., e-commerce, cennikiem, FAQ i przejrzystym formularzem konsultacji.',
        ru: 'Новый сайт с услугами для JDG, sp. z o.o., e-commerce, тарифами, FAQ и понятной формой консультации.'
      },
      lang
    );
  }
  return heuristicText(
    {
      pl: 'Nowa strona z jasnymi usługami, portfolio, opiniami, cenami lub orientacyjnymi kosztami, kontaktem i wygodnym formularzem.',
      ru: 'Новый сайт с понятными услугами, портфолио, отзывами, ценами или ориентирами стоимости, контактами и удобной формой.'
    },
    lang
  );
}

function buildMiniAuditPoints(issues, niche, language) {
  const lang = normalizeAnalysisLanguage(language);
  const points = issues.slice(0, 3).map((issue) => heuristicText(issue, lang));
  while (points.length < 3) points.push(buildNicheSolution(niche, lang));
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

function websiteStatusLabel(status, language) {
  const lang = normalizeAnalysisLanguage(language);
  const labels = {
    NO_WEBSITE_CONFIRMED: { pl: 'Nie znaleziono własnej strony po weryfikacji.', ru: 'Собственный сайт не найден после проверки.' },
    SOCIAL_ONLY: { pl: 'Znaleziono tylko media społecznościowe.', ru: 'Найдены только социальные сети.' },
    DIRECTORY_ONLY: { pl: 'Znaleziono tylko katalogi lub serwisy do zapisów.', ru: 'Найдены только каталоги или сервисы записи.' },
    MARKETPLACE_ONLY: { pl: 'Znaleziono tylko marketplace\'y lub platformy.', ru: 'Найдены только маркетплейсы или платформы.' },
    BROKEN_WEBSITE: { pl: 'Domena istnieje, ale strona się nie otwiera.', ru: 'Домен есть, но сайт не открывается.' },
    FREE_SUBDOMAIN: { pl: 'Jest tylko strona na darmowej subdomenie.', ru: 'Есть только страница на бесплатном поддомене.' },
    ONE_PAGE_PLACEHOLDER: { pl: 'Jest tylko prosta strona-zaślepka.', ru: 'Есть только простая страница-заглушка.' },
    WEBSITE_FOUND: { pl: 'Znaleziono pełnoprawną stronę.', ru: 'Найден полноценный сайт.' },
    UNCERTAIN: { pl: 'Wymagana ręczna weryfikacja strony.', ru: 'Нужна ручная проверка сайта.' }
  };
  return heuristicText(labels[status] || labels.UNCERTAIN, lang);
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
  if (nonBusinessPlatformDomains.some((domain) => host.includes(domain))) return 'non_business_platform';
  if (freeSubdomainDomains.some((domain) => host.includes(domain))) return 'free_subdomain';
  return 'official_candidate';
}

function addCandidate(candidates, rawUrl, source, confidence, reason = '') {
  const url = safeUrl(rawUrl) || safeUrl(`https://${rawUrl}`);
  if (!url) return;
  const type = classifyUrlType(url);
  if (['social', 'directory', 'marketplace', 'non_business_platform'].includes(type)) return;
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
