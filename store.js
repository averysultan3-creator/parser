import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Lightweight JSON-file persistence layer. No native deps (keeps install painless
// on Windows), fine for the scale of a local lead-gen tool (thousands of companies,
// hundreds of runs). Every mutation is written to disk immediately so data survives
// server restarts.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');
const RUNS_FILE = path.join(DATA_DIR, 'runs.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`store: failed to load ${file}:`, error.message);
    return fallback;
  }
}

function saveJson(file, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`store: failed to save ${file}:`, error.message);
  }
}

const state = {
  companies: loadJson(COMPANIES_FILE, { nextId: 1, companies: {}, keyIndex: {} }),
  runs: loadJson(RUNS_FILE, { nextId: 1, runs: [] })
};

function persistCompanies() {
  saveJson(COMPANIES_FILE, state.companies);
}

function persistRuns() {
  saveJson(RUNS_FILE, state.runs);
}

function markAbandonedRuns() {
  const now = new Date().toISOString();
  let changed = false;
  for (const run of state.runs.runs) {
    if (run?.status !== 'discovering') continue;
    run.status = 'failed';
    run.finished_at = run.finished_at || now;
    run.warnings = [
      ...(Array.isArray(run.warnings) ? run.warnings : []),
      'Run was interrupted before completion (backend restart or page reload).'
    ].slice(0, 20);
    changed = true;
  }
  if (changed) persistRuns();
}

markAbandonedRuns();

// --- small standalone text helpers (kept local so this module has no dependency
// on server.js and can be safely imported from anywhere) ---
function cleanIdentifier(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '');
}

function splitPhoneValues(value) {
  const raw = String(value || '').replace(/\u00a0/g, ' ');
  const matches = raw.match(/\+?48\d{9}|\b\d{9}\b/g) || [];
  return [
    ...new Set(
      matches
        .map((match) => {
          const digits = match.replace(/\D/g, '');
          const local = digits.startsWith('48') && digits.length >= 11 ? digits.slice(2, 11) : digits.slice(0, 9);
          return local.length === 9 && !local.startsWith('0') && !/^(\d)\1{8}$/.test(local) ? `+48${local}` : '';
        })
        .filter(Boolean)
    )
  ];
}

function safeHostname(rawUrl) {
  try {
    const url = /^https?:\/\//i.test(rawUrl) ? new URL(rawUrl) : new URL(`https://${rawUrl}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const nonCompanyHostFragments = [
  'google.',
  'bing.',
  'duckduckgo.',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'linkedin.com',
  'twitter.com',
  'x.com',
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
  'maps.google',
  'yelp.',
  'allegro.pl',
  'olx.pl',
  'otomoto.pl'
];

function isKnownNonCompanyHost(host) {
  if (!host) return true;
  return nonCompanyHostFragments.some((fragment) => host.includes(fragment));
}

// Computes every reasonably unique identity signal for a company so that the same
// real-world business found through different sources/queries resolves to a single
// stored record (NIP/REGON > phone > own website host > normalized name+location).
export function buildCompanyKeys(company) {
  const keys = [];
  const nip = cleanIdentifier(company?.nip);
  if (nip && nip.length >= 10) keys.push(`nip:${nip}`);
  const regon = cleanIdentifier(company?.regon);
  if (regon && regon.length >= 9) keys.push(`regon:${regon}`);

  const phoneCandidates = splitPhoneValues(company?.phone);
  const directPhone = normalizePhone(company?.phone || '');
  for (const phone of phoneCandidates.length ? phoneCandidates : directPhone ? [directPhone] : []) {
    if (phone) keys.push(`phone:${phone}`);
  }

  const host = safeHostname(company?.website_url || '') || safeHostname(company?.source_profile || '');
  if (host && !isKnownNonCompanyHost(host)) keys.push(`host:${host}`);

  const nameKey = normalizeSearchText(company?.company || company?.legal_name || '');
  if (nameKey) {
    const cityKey = normalizeSearchText(company?.city || '');
    const districtKey = normalizeSearchText(company?.district || '');
    keys.push(`name:${nameKey}|${cityKey}|${districtKey}`);
  }

  return [...new Set(keys)];
}

export function findExistingCompanyId(company) {
  const keys = buildCompanyKeys(company);
  for (const key of keys) {
    const id = state.companies.keyIndex[key];
    if (id && state.companies.companies[id]) return id;
  }
  return null;
}

export function getCompany(id) {
  return state.companies.companies[id] || null;
}

export function getCompaniesByIds(ids) {
  return (ids || []).map((id) => state.companies.companies[id]).filter(Boolean);
}

export function getAllCompanies() {
  return Object.values(state.companies.companies).sort((a, b) =>
    (b.last_seen_at || '').localeCompare(a.last_seen_at || '')
  );
}

function mergeCompanyData(existing, incoming) {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(incoming || {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && !value.length) continue;
    if (!merged[key]) merged[key] = value;
  }
  return merged;
}

// Registers (or updates) a company in the store. Returns { id, isNew, record }.
// isNew=false means this exact business was already known from a previous run.
export function upsertCompany(company, { runId, stage = 'discovered' } = {}) {
  const now = new Date().toISOString();
  const existingId = findExistingCompanyId(company);
  const keys = buildCompanyKeys(company);

  if (existingId) {
    const record = state.companies.companies[existingId];
    record.data = mergeCompanyData(record.data, company);
    record.last_seen_at = now;
    record.seen_count = (record.seen_count || 1) + 1;
    if (runId && !record.run_ids.includes(runId)) record.run_ids.push(runId);
    for (const key of keys) state.companies.keyIndex[key] = existingId;
    persistCompanies();
    return { id: existingId, isNew: false, record };
  }

  const id = String(state.companies.nextId++);
  const record = {
    id,
    data: company,
    website: null,
    heuristic: null,
    analysis: null,
    aiSiteAnalysis: null,
    first_seen_at: now,
    last_seen_at: now,
    seen_count: 1,
    stage,
    run_ids: runId ? [runId] : []
  };
  state.companies.companies[id] = record;
  for (const key of keys) state.companies.keyIndex[key] = id;
  persistCompanies();
  return { id, isNew: true, record };
}

// Cheap update used when the caller already knows the company id (e.g. it came
// straight from a /api/discover response) and just needs to link it to a new run
// without re-running key matching.
export function touchCompanyRun(id, runId) {
  const record = state.companies.companies[id];
  if (!record) return null;
  record.last_seen_at = new Date().toISOString();
  record.seen_count = (record.seen_count || 1) + 1;
  if (runId && !record.run_ids.includes(runId)) record.run_ids.push(runId);
  persistCompanies();
  return record;
}

export function updateCompanyAnalysis(id, { websiteResolution, parsed, parsedSummary, heuristic, analysis }) {
  const record = state.companies.companies[id];
  if (!record) return null;
  record.website = {
    resolution: websiteResolution || record.website?.resolution || null,
    parsedOk: Boolean(parsed?.ok),
    parsedError: parsed?.error || '',
    normalizedUrl: parsed?.normalizedUrl || '',
    summary: parsedSummary || record.website?.summary || null
  };
  record.heuristic = heuristic || record.heuristic;
  record.analysis = analysis || record.analysis;
  record.stage = 'analyzed';
  record.last_analyzed_at = new Date().toISOString();
  persistCompanies();
  return record;
}

export function updateCompanyAiAnalysis(id, aiSiteAnalysis) {
  const record = state.companies.companies[id];
  if (!record) return null;
  record.aiSiteAnalysis = aiSiteAnalysis;
  persistCompanies();
  return record;
}

export function createRun(meta) {
  const id = String(state.runs.nextId++);
  const run = {
    id,
    started_at: new Date().toISOString(),
    finished_at: '',
    status: 'discovering',
    niches: meta.niches || [],
    city: meta.city || '',
    district: meta.district || '',
    sourceFocus: meta.sourceFocus || '',
    requested_limit: meta.requestedLimit || 0,
    found_count: 0,
    new_count: 0,
    duplicate_count: 0,
    analyzed_count: 0,
    warnings: [],
    company_ids: []
  };
  state.runs.runs.unshift(run);
  persistRuns();
  return run;
}

export function updateRun(runId, patch) {
  const run = state.runs.runs.find((item) => item.id === runId);
  if (!run) return null;
  Object.assign(run, patch);
  persistRuns();
  return run;
}

export function addCompanyIdsToRun(runId, ids) {
  const run = state.runs.runs.find((item) => item.id === runId);
  if (!run) return null;
  for (const id of ids || []) {
    if (id && !run.company_ids.includes(id)) run.company_ids.push(id);
  }
  persistRuns();
  return run;
}

export function listRuns({ limit = 50 } = {}) {
  return state.runs.runs.slice(0, limit);
}

export function getRun(runId) {
  return state.runs.runs.find((item) => item.id === runId) || null;
}

export function getStoreStats() {
  return {
    totalCompanies: Object.keys(state.companies.companies).length,
    totalRuns: state.runs.runs.length
  };
}
