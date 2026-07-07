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
const ACADEMY_FILE = path.join(DATA_DIR, 'academy-progress.json');

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
  runs: loadJson(RUNS_FILE, { nextId: 1, runs: [] }),
  academy: loadJson(ACADEMY_FILE, { users: {} })
};

function persistCompanies() {
  saveJson(COMPANIES_FILE, state.companies);
}

function persistRuns() {
  saveJson(RUNS_FILE, state.runs);
}

function persistAcademy() {
  saveJson(ACADEMY_FILE, state.academy);
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

function normalizeUrlKey(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';
  try {
    const url = /^https?:\/\//i.test(value) ? new URL(value) : new URL(`https://${value}`);
    url.hash = '';
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, '').toLowerCase();
    const search = url.searchParams.get('cid') || url.searchParams.get('place_id') || '';
    return search ? `${host}${pathname}?id=${search}` : `${host}${pathname}`;
  } catch {
    return normalizeSearchText(value);
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

  const mapsUrl =
    company?.google_maps_url ||
    company?.maps_url ||
    company?.google_place_url ||
    (String(company?.source_profile || '').includes('maps.google') ? company?.source_profile : '');
  const mapsKey = normalizeUrlKey(mapsUrl);
  if (mapsKey && (mapsKey.includes('maps.google') || mapsKey.includes('google.com/maps'))) {
    keys.push(`maps:${mapsKey}`);
  }

  const addressKey = normalizeSearchText([company?.address, company?.street, company?.postal_code, company?.city].filter(Boolean).join(' '));
  if (addressKey && addressKey.length > 10) keys.push(`addr:${addressKey}`);

  const nameKey = normalizeSearchText(company?.company || company?.legal_name || '');
  if (nameKey) {
    const cityKey = normalizeSearchText(company?.city || '');
    const districtKey = normalizeSearchText(company?.district || '');
    keys.push(`name:${nameKey}|${cityKey}|${districtKey}`);
    if (addressKey) keys.push(`nameaddr:${nameKey}|${addressKey}`);
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
    record.status = normalizeLeadStatus(record.status || record.stage || 'new');
    record.stage = record.stage || stage;
    record.global_keys = [...new Set([...(record.global_keys || []), ...keys])];
    if (!Array.isArray(record.run_ids)) record.run_ids = [];
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
    status: 'new',
    assigned_worker_id: '',
    reserved_at: '',
    available_for_discovery: true,
    claimed_run_ids: [],
    global_keys: keys,
    run_ids: runId ? [runId] : []
  };
  state.companies.companies[id] = record;
  for (const key of keys) state.companies.keyIndex[key] = id;
  persistCompanies();
  return { id, isNew: true, record };
}

function normalizeWorkerId(workerId) {
  return String(workerId || 'worker-default').trim().slice(0, 80) || 'worker-default';
}

const allowedLeadStatuses = new Set([
  'new',
  'reserved',
  'analyzed',
  'called',
  'meeting_booked',
  'not_interested',
  'bad_fit',
  'no_phone',
  'duplicate',
  'completed'
]);

function normalizeLeadStatus(status) {
  const raw = String(status || '').trim();
  if (allowedLeadStatuses.has(raw)) return raw;
  if (raw === 'discovered') return 'reserved';
  if (raw === 'reset') return 'new';
  return 'new';
}

function isClaimable(record, runId) {
  if (!record) return false;
  if (runId && Array.isArray(record.claimed_run_ids) && record.claimed_run_ids.includes(runId)) return true;
  if (record.available_for_discovery) return true;
  if (!record.assigned_worker_id && ['new', 'reset'].includes(normalizeLeadStatus(record.status || 'new'))) return true;
  return false;
}

export function claimCompanyForRun(company, { runId, workerId, stage = 'reserved' } = {}) {
  const { id, isNew, record } = upsertCompany(company, { runId, stage: 'discovered' });
  const normalizedWorkerId = normalizeWorkerId(workerId);
  const alreadyClaimedByRun = runId && Array.isArray(record.claimed_run_ids) && record.claimed_run_ids.includes(runId);

  if (!alreadyClaimedByRun && !isClaimable(record, runId)) {
    return { id, isNew: false, isClaimed: false, record };
  }

  const now = new Date().toISOString();
  record.status = stage === 'analyzed' ? 'analyzed' : 'reserved';
  record.stage = stage;
  record.assigned_worker_id = record.assigned_worker_id || normalizedWorkerId;
  record.reserved_at = record.reserved_at || now;
  record.available_for_discovery = false;
  if (!Array.isArray(record.claimed_run_ids)) record.claimed_run_ids = [];
  if (runId && !record.claimed_run_ids.includes(runId)) record.claimed_run_ids.push(runId);
  if (!record.first_claimed_run_id && runId) record.first_claimed_run_id = runId;
  if (!record.first_assigned_worker_id) record.first_assigned_worker_id = normalizedWorkerId;
  persistCompanies();

  return {
    id,
    isNew,
    isClaimed: true,
    isNewForRun: Boolean(isNew || (runId && record.first_claimed_run_id === runId && record.seen_count === 1)),
    record
  };
}

export function claimCompaniesForRun(companies, { runId, workerId, limit = 100 } = {}) {
  const claimed = [];
  const claimedIds = new Set();
  let newCount = 0;
  let duplicateCount = 0;

  for (const company of companies || []) {
    if (claimed.length >= limit) break;
    const result = claimCompanyForRun(company, { runId, workerId });
    if (!result.isClaimed) {
      duplicateCount += 1;
      continue;
    }
    if (claimedIds.has(result.id)) continue;
    claimedIds.add(result.id);
    if (result.isNewForRun) newCount += 1;
    claimed.push({ ...(result.record.data || company), _companyId: result.id });
  }

  return {
    companies: claimed,
    companyIds: [...claimedIds],
    newCount,
    duplicateCount
  };
}

export function updateCompanyStatus(id, { status, workerId, note } = {}) {
  const record = state.companies.companies[String(id)];
  if (!record) return null;
  if (allowedLeadStatuses.has(status)) record.status = status;
  if (workerId) record.assigned_worker_id = normalizeWorkerId(workerId);
  if (note !== undefined) {
    record.notes = String(note || '').slice(0, 3000);
  }
  record.updated_at = new Date().toISOString();
  if (record.status !== 'new') record.available_for_discovery = false;
  persistCompanies();
  return record;
}

export function resetCompanies(ids) {
  const resetIds = [];
  const now = new Date().toISOString();
  for (const id of ids || []) {
    const record = state.companies.companies[String(id)];
    if (!record) continue;
    record.status = 'new';
    record.stage = 'reset';
    record.assigned_worker_id = '';
    record.reserved_at = '';
    record.available_for_discovery = true;
    record.reset_at = now;
    resetIds.push(String(id));
  }
  if (resetIds.length) persistCompanies();
  return resetIds;
}

export function deleteCompanies(ids) {
  const deletedIds = [];
  for (const id of ids || []) {
    const key = String(id);
    const record = state.companies.companies[key];
    if (!record) continue;
    for (const companyKey of record.global_keys || buildCompanyKeys(record.data || {})) {
      if (state.companies.keyIndex[companyKey] === key) delete state.companies.keyIndex[companyKey];
    }
    delete state.companies.companies[key];
    deletedIds.push(key);
  }
  if (deletedIds.length) persistCompanies();
  return deletedIds;
}

export function listLeadPool({ q = '', status = '', workerId = '', limit = 500 } = {}) {
  const query = normalizeSearchText(q);
  const normalizedWorkerId = workerId ? normalizeWorkerId(workerId) : '';
  return getAllCompanies()
    .filter((record) => {
      if (status && normalizeLeadStatus(record.status || record.stage) !== status) return false;
      if (normalizedWorkerId && record.assigned_worker_id !== normalizedWorkerId) return false;
      if (!query) return true;
      const haystack = normalizeSearchText(
        [
          record.data?.company,
          record.data?.legal_name,
          record.data?.phone,
          record.data?.website_url,
          record.data?.address,
          record.data?.city,
          normalizeLeadStatus(record.status || record.stage),
          record.assigned_worker_id
        ].join(' ')
      );
      return haystack.includes(query);
    })
    .slice(0, limit)
    .map((record) => ({ ...record, status: normalizeLeadStatus(record.status || record.stage) }));
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
  if (record.status === 'reserved' || record.status === 'new') record.status = 'analyzed';
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
    worker_id: normalizeWorkerId(meta.workerId || ''),
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
  const companies = Object.values(state.companies.companies);
  return {
    totalCompanies: companies.length,
    totalRuns: state.runs.runs.length,
    reservedCompanies: companies.filter((record) => normalizeLeadStatus(record.status || record.stage) === 'reserved').length,
    meetingBooked: companies.filter((record) => normalizeLeadStatus(record.status || record.stage) === 'meeting_booked').length,
    availableCompanies: companies.filter((record) => record.available_for_discovery).length
  };
}

export function getAcademyProgress(userId = 'worker-default') {
  const id = normalizeWorkerId(userId);
  if (!state.academy.users[id]) {
    state.academy.users[id] = {
      userId: id,
      displayName: id,
      completedModules: [],
      quizScores: {},
      serviceProgress: {},
      lastActiveAt: '',
      createdAt: new Date().toISOString()
    };
    persistAcademy();
  }
  return state.academy.users[id];
}

export function saveAcademyProgress(userId, patch = {}) {
  const id = normalizeWorkerId(userId);
  const current = getAcademyProgress(id);
  const next = {
    ...current,
    displayName: String(patch.displayName || current.displayName || id).slice(0, 120),
    completedModules: Array.isArray(patch.completedModules)
      ? [...new Set(patch.completedModules.map(String))]
      : current.completedModules,
    quizScores: patch.quizScores && typeof patch.quizScores === 'object' ? { ...current.quizScores, ...patch.quizScores } : current.quizScores,
    serviceProgress:
      patch.serviceProgress && typeof patch.serviceProgress === 'object'
        ? { ...current.serviceProgress, ...patch.serviceProgress }
        : current.serviceProgress,
    lastActiveAt: new Date().toISOString()
  };
  state.academy.users[id] = next;
  persistAcademy();
  return next;
}

export function listAcademyProgress() {
  return Object.values(state.academy.users).sort((a, b) => (b.lastActiveAt || '').localeCompare(a.lastActiveAt || ''));
}
