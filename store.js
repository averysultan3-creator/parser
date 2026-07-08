import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
const WORKERS_FILE = path.join(DATA_DIR, 'workers.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-log.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const AI_TRAINING_FILE = path.join(DATA_DIR, 'ai-training-sessions.json');
const AI_USAGE_FILE = path.join(DATA_DIR, 'ai-usage.json');

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, sliding
const ACADEMY_SECTIONS = ['home', 'training', 'services', 'scripts', 'parserGuide', 'aiTraining'];

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
  academy: loadJson(ACADEMY_FILE, { users: {} }),
  workers: loadJson(WORKERS_FILE, { workers: {} }),
  audit: loadJson(AUDIT_FILE, { nextId: 1, actions: [] }),
  sessions: loadJson(SESSIONS_FILE, { sessions: {} }),
  aiTraining: loadJson(AI_TRAINING_FILE, { sessions: {} }),
  aiUsage: loadJson(AI_USAGE_FILE, { nextId: 1, entries: [] })
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

function persistWorkers() {
  saveJson(WORKERS_FILE, state.workers);
}

function persistAudit() {
  saveJson(AUDIT_FILE, state.audit);
}

function persistSessions() {
  saveJson(SESSIONS_FILE, state.sessions);
}

function persistAiTraining() {
  saveJson(AI_TRAINING_FILE, state.aiTraining);
}

function persistAiUsage() {
  saveJson(AI_USAGE_FILE, state.aiUsage);
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
  const phones = splitPhoneValues(value);
  if (phones.length) return phones[0];
  return String(value || '').replace(/[^\d+]/g, '');
}

function splitPhoneValues(value, context = {}) {
  const raw = String(value || '').replace(/\u00a0/g, ' ');
  const matches = raw.match(/(?:\+|00)?\d(?:[\s().-]*\d){6,14}/g) || [];
  return [
    ...new Set(
      matches
        .map((match) => normalizePhoneCandidate(match, context))
        .filter(Boolean)
    )
  ];
}

function normalizePhoneCandidate(value, context = {}) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const startsWithPlus = /^\+/.test(raw);
  const compact = raw.replace(/\s+/g, '');
  const startsWithDoubleZero = /^00/.test(compact);
  let digits = raw.replace(/\D/g, '');
  if (!digits || digits.length < 7 || digits.length > 15) return '';
  if (/^(\d)\1{6,}$/.test(digits)) return '';
  if (startsWithDoubleZero) {
    digits = digits.replace(/^00/, '');
    return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : '';
  }
  if (startsWithPlus) return `+${digits}`;
  if (digits.startsWith('48') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('380') && digits.length === 12) return `+${digits}`;

  const region = getPhoneRegionFromContext(context);
  if (region === 'PL' && digits.length === 9 && !digits.startsWith('0')) return `+48${digits}`;
  if (region === 'UA') {
    if (digits.length === 10 && digits.startsWith('0')) return `+38${digits}`;
    if (digits.length === 9 && !digits.startsWith('0')) return `+380${digits}`;
  }

  return digits.length >= 7 && digits.length <= 12 ? digits : '';
}

function getPhoneRegionFromContext(context = {}) {
  const explicit = String(context.regionCode || context.countryCode || '').trim().toUpperCase();
  if (['PL', 'UA'].includes(explicit)) return explicit;
  const text = normalizeSearchText([context.country, context.city].filter(Boolean).join(' '));
  if (/(^| )polska|poland|warszawa|warsaw|krakow|wroclaw|gdansk|poznan( |$)/.test(text)) return 'PL';
  if (/(^| )ukraine|ukraina|kyiv|kiev|dnipro|lviv|odesa|odessa( |$)/.test(text)) return 'UA';
  return '';
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

  const phoneCandidates = splitPhoneValues(company?.phone, { city: company?.city, country: company?.country });
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
  const strongKeys = keys.filter((key) => !key.startsWith('phone:'));
  const phoneKeys = keys.filter((key) => key.startsWith('phone:'));

  for (const key of strongKeys) {
    const id = state.companies.keyIndex[key];
    if (id && state.companies.companies[id]) return id;
  }

  for (const key of phoneKeys) {
    const id = state.companies.keyIndex[key];
    const record = id ? state.companies.companies[id] : null;
    if (record && isPhoneIdentityCompatible(record.data || {}, company || {})) return id;
  }

  return null;
}

function isPhoneIdentityCompatible(existing, incoming) {
  const existingCity = normalizeSearchText(existing?.city || '');
  const incomingCity = normalizeSearchText(incoming?.city || '');
  if (existingCity && incomingCity && existingCity !== incomingCity) return false;

  const existingName = normalizeSearchText(existing?.company || existing?.legal_name || '');
  const incomingName = normalizeSearchText(incoming?.company || incoming?.legal_name || '');
  if (existingName && incomingName) {
    if (existingName === incomingName) return true;
    if (existingName.includes(incomingName) || incomingName.includes(existingName)) return true;
    return tokenOverlapRatio(existingName, incomingName) >= 0.55;
  }

  const existingAddress = normalizeSearchText(existing?.address || '');
  const incomingAddress = normalizeSearchText(incoming?.address || '');
  if (existingAddress && incomingAddress) {
    return existingAddress === incomingAddress || existingAddress.includes(incomingAddress) || incomingAddress.includes(existingAddress);
  }

  return false;
}

function tokenOverlapRatio(left, right) {
  const leftTokens = new Set(String(left || '').split(/\s+/).filter((token) => token.length >= 4));
  const rightTokens = new Set(String(right || '').split(/\s+/).filter((token) => token.length >= 4));
  if (!leftTokens.size || !rightTokens.size) return 0;
  const matches = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return matches / Math.max(leftTokens.size, rightTokens.size);
}

export function getCompany(id) {
  const record = state.companies.companies[id] || null;
  return record ? serializeCompany(record) : null;
}

export function getCompaniesByIds(ids, { includeDeleted = false } = {}) {
  return (ids || [])
    .map((id) => state.companies.companies[id])
    .filter((record) => record && (includeDeleted || !isDeletedRecord(record)))
    .map(serializeCompany);
}

export function getAllCompanies({ includeDeleted = false } = {}) {
  return Object.values(state.companies.companies)
    .filter((record) => includeDeleted || !isDeletedRecord(record))
    .sort((a, b) => (b.last_seen_at || '').localeCompare(a.last_seen_at || ''))
    .map(serializeCompany);
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
  const incomingSource = String(company?.source || '').trim();

  if (existingId) {
    const record = state.companies.companies[existingId];
    record.data = mergeCompanyData(record.data, company);
    record.last_seen_at = now;
    record.last_seen_query_id = runId || record.last_seen_query_id || '';
    record.seen_count = (record.seen_count || 1) + 1;
    record.status = normalizeLeadStatus(record.status || record.stage || 'new');
    record.pool_state = derivePoolState(record);
    record.stage = record.stage || stage;
    record.global_keys = [...new Set([...(record.global_keys || []), ...keys])];
    if (!Array.isArray(record.run_ids)) record.run_ids = [];
    if (runId && !record.run_ids.includes(runId)) record.run_ids.push(runId);
    if (!Array.isArray(record.source_history)) record.source_history = [];
    if (incomingSource && !record.source_history.includes(incomingSource)) record.source_history.push(incomingSource);
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
    first_found_query_id: runId || '',
    last_seen_query_id: runId || '',
    seen_count: 1,
    duplicate_count: 0,
    stage,
    status: 'new',
    pool_state: 'available',
    assigned_worker_id: '',
    reserved_at: '',
    available_for_discovery: true,
    claimed_run_ids: [],
    global_keys: keys,
    run_ids: runId ? [runId] : [],
    source_history: incomingSource ? [incomingSource] : []
  };
  state.companies.companies[id] = record;
  for (const key of keys) state.companies.keyIndex[key] = id;
  persistCompanies();
  return { id, isNew: true, record };
}

export function normalizeWorkerId(workerId) {
  return String(workerId || 'worker-default').trim().slice(0, 80) || 'worker-default';
}

function normalizeLanguage(value) {
  const raw = String(value || '').trim().toLowerCase();
  return ['ru', 'pl', 'en'].includes(raw) ? raw : 'ru';
}

function normalizeBool(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const raw = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'tak', 'active', 'aktywny', 'on'].includes(raw);
}

const allowedLeadStatuses = new Set([
  'new',
  'seen',
  'not_called',
  'reserved',
  'analyzed',
  'called',
  'no_answer',
  'callback_later',
  'interested',
  'meeting_booked',
  'not_interested',
  'good_website',
  'wrong_category',
  'closed_business',
  'bad_fit',
  'no_phone',
  'wrong_number',
  'sms_email_requested',
  'dropped_call',
  'contacted',
  'exported',
  'skipped',
  'rejected',
  'duplicate',
  'completed',
  'deleted'
]);

function normalizeLeadStatus(status) {
  const raw = String(status || '').trim();
  if (allowedLeadStatuses.has(raw)) return raw;
  if (raw === 'discovered') return 'reserved';
  if (raw === 'reset') return 'new';
  if (raw === 'available') return 'new';
  if (raw === 'processed') return 'completed';
  if (raw === 'bad_category') return 'wrong_category';
  if (raw === 'not_suitable') return 'bad_fit';
  if (raw === 'no_pickup') return 'no_answer';
  if (raw === 'seen') return 'seen';
  return 'new';
}

const allowedPoolStates = new Set(['available', 'reserved', 'processed', 'reset', 'deleted']);

function normalizePoolState(value) {
  const raw = String(value || '').trim().toLowerCase();
  return allowedPoolStates.has(raw) ? raw : '';
}

function isProcessedStatus(status) {
  return [
    'seen',
    'called',
    'no_answer',
    'callback_later',
    'interested',
    'meeting_booked',
    'not_interested',
    'good_website',
    'wrong_category',
    'closed_business',
    'bad_fit',
    'no_phone',
    'wrong_number',
    'sms_email_requested',
    'dropped_call',
    'contacted',
    'exported',
    'skipped',
    'rejected',
    'duplicate',
    'completed'
  ].includes(normalizeLeadStatus(status));
}

function derivePoolState(record) {
  const explicit = normalizePoolState(record?.pool_state);
  if (explicit) return explicit;
  const status = normalizeLeadStatus(record?.status || record?.stage || 'new');
  if (status === 'deleted') return 'deleted';
  if (record?.available_for_discovery) return record?.stage === 'reset' ? 'reset' : 'available';
  if (isProcessedStatus(status)) return 'processed';
  if (record?.assigned_worker_id) return 'reserved';
  if (record?.stage === 'reset') return 'reset';
  return 'available';
}

function isDeletedRecord(record) {
  return derivePoolState(record) === 'deleted' || normalizeLeadStatus(record?.status) === 'deleted';
}

function serializeCompany(record) {
  return {
    ...record,
    status: normalizeLeadStatus(record?.status || record?.stage || 'new'),
    pool_state: derivePoolState(record)
  };
}

function addStatusHistory(record, entry = {}) {
  if (!record) return;
  const history = Array.isArray(record.status_history) ? record.status_history : [];
  history.push({
    status: entry.status || normalizeLeadStatus(record.status || record.stage || 'new'),
    workerId: entry.workerId || record.assigned_worker_id || '',
    note: entry.note || '',
    source: entry.source || 'system',
    createdAt: entry.createdAt || new Date().toISOString()
  });
  record.status_history = history.slice(-100);
}

function isClaimable(record, runId, workerId) {
  if (!record) return false;
  if (isDeletedRecord(record)) return false;
  if (runId && Array.isArray(record.claimed_run_ids) && record.claimed_run_ids.includes(runId)) return true;
  const poolState = derivePoolState(record);
  if (['available', 'reset'].includes(poolState)) return true;
  if (record.available_for_discovery) return true;
  if (!record.assigned_worker_id && ['new', 'reset'].includes(normalizeLeadStatus(record.status || 'new'))) return true;
  return false;
}

export function claimCompanyForRun(company, { runId, workerId, stage = 'reserved' } = {}) {
  const { id, isNew, record } = upsertCompany(company, { runId, stage: 'discovered' });
  const normalizedWorkerId = normalizeWorkerId(workerId);
  const alreadyClaimedByRun = runId && Array.isArray(record.claimed_run_ids) && record.claimed_run_ids.includes(runId);
  const now = new Date().toISOString();

  if (alreadyClaimedByRun) {
    return {
      id,
      isNew: false,
      isClaimed: true,
      isNewForRun: record.first_claimed_run_id === runId,
      record
    };
  }

  // Parser discovery is a "new companies only" pipeline. Returning a lead to the
  // worker pool must not erase dedupe memory: an already known company is still a
  // duplicate for future parser runs, even if it becomes available for manual
  // processing again in admin.
  if (!isNew) {
    record.duplicate_count = (record.duplicate_count || 0) + 1;
    record.last_duplicate_at = now;
    record.last_seen_query_id = runId || record.last_seen_query_id || '';
    persistCompanies();
    return { id, isNew: false, isClaimed: false, record };
  }

  record.status = stage === 'analyzed' ? 'analyzed' : 'reserved';
  record.pool_state = 'reserved';
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

export function claimCompaniesForRun(companies, { runId, workerId, limit = 100, includeDuplicates = false } = {}) {
  const claimed = [];
  const claimedIds = new Set();
  let newCount = 0;
  let duplicateCount = 0;

  for (const company of companies || []) {
    if (claimed.length >= limit) break;
    const result = claimCompanyForRun(company, { runId, workerId });
    if (!result.isClaimed) {
      duplicateCount += 1;
      if (includeDuplicates && result.id && !claimedIds.has(result.id)) {
        claimedIds.add(result.id);
        claimed.push({
          ...(result.record.data || company),
          _companyId: result.id,
          _duplicate: true,
          lead_status: normalizeLeadStatus(result.record.status || result.record.stage || 'new'),
          pool_state: derivePoolState(result.record),
          assigned_worker_id: result.record.assigned_worker_id || ''
        });
      }
      continue;
    }
    if (claimedIds.has(result.id)) continue;
    claimedIds.add(result.id);
    if (result.isNewForRun) newCount += 1;
    claimed.push({
      ...(result.record.data || company),
      _companyId: result.id,
      lead_status: normalizeLeadStatus(result.record.status || result.record.stage || 'new'),
      pool_state: derivePoolState(result.record),
      assigned_worker_id: result.record.assigned_worker_id || ''
    });
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
  const normalizedStatus = normalizeLeadStatus(status);
  const normalizedWorker = workerId ? normalizeWorkerId(workerId) : '';
  if (allowedLeadStatuses.has(normalizedStatus)) record.status = normalizedStatus;
  if (normalizedWorker) record.assigned_worker_id = normalizedWorker;
  if (note !== undefined) {
    record.notes = String(note || '').slice(0, 3000);
  }
  record.updated_at = new Date().toISOString();
  if (record.status === 'new' || record.status === 'not_called') {
    record.pool_state = record.assigned_worker_id ? 'reserved' : 'available';
  } else if (record.status === 'deleted') {
    record.pool_state = 'deleted';
    record.available_for_discovery = false;
  } else {
    record.pool_state = isProcessedStatus(record.status) ? 'processed' : 'reserved';
    record.available_for_discovery = false;
  }
  addStatusHistory(record, {
    status: record.status,
    workerId: normalizedWorker || record.assigned_worker_id || '',
    note: note === undefined ? '' : String(note || ''),
    source: 'status_update',
    createdAt: record.updated_at
  });
  persistCompanies();
  return serializeCompany(record);
}

function deriveInboundLeadName(lead = {}) {
  const explicitCompany = String(lead.companyName || lead.businessName || '').trim();
  if (explicitCompany) return explicitCompany;
  const websiteHost = safeHostname(lead.website || lead.website_url || '');
  if (websiteHost) return websiteHost;
  const contactName = String(lead.name || lead.contactName || '').trim();
  if (contactName) return `Inbound lead: ${contactName}`;
  return 'Inbound lead';
}

export function createSiteLead(lead = {}, { source = 'aura-global-site' } = {}) {
  const now = new Date().toISOString();
  const selectedServices = Array.isArray(lead.selectedServices)
    ? [...new Set(lead.selectedServices.map((item) => String(item || '').trim()).filter(Boolean))]
    : [];

  const company = {
    company: deriveInboundLeadName(lead),
    legal_name: String(lead.businessName || lead.companyName || '').trim(),
    contact_name: String(lead.name || lead.contactName || '').trim(),
    phone: String(lead.phone || '').trim(),
    email: String(lead.email || '').trim(),
    website_url: String(lead.website || lead.website_url || '').trim(),
    niche: String(lead.businessType || '').trim(),
    services: selectedServices,
    notes: String(lead.message || '').trim(),
    source,
    source_profile: '/site/',
    source_label: 'Aura inbound form',
    inbound: true,
    inbound_submitted_at: now,
    intake: {
      goal: String(lead.goal || '').trim(),
      budget: String(lead.budget || '').trim(),
      hasWebsite: String(lead.hasWebsite || '').trim()
    }
  };

  const { id, record } = upsertCompany(company, { stage: 'site_inbound' });
  record.data = {
    ...(record.data || {}),
    ...company,
    inbound_updates: (record.data?.inbound_updates || 0) + 1
  };
  record.status = 'new';
  record.stage = 'site_inbound';
  record.available_for_discovery = false;
  record.inbound_submitted_at = now;
  record.updated_at = now;
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
    record.pool_state = 'reset';
    record.stage = 'reset';
    record.assigned_worker_id = '';
    record.reserved_at = '';
    record.available_for_discovery = true;
    record.reset_at = now;
    addStatusHistory(record, { status: 'new', source: 'admin_reset', createdAt: now });
    resetIds.push(String(id));
  }
  if (resetIds.length) persistCompanies();
  return resetIds;
}

export function deleteCompanies(ids) {
  const deletedIds = [];
  const now = new Date().toISOString();
  for (const id of ids || []) {
    const key = String(id);
    const record = state.companies.companies[key];
    if (!record) continue;
    record.status = 'deleted';
    record.pool_state = 'deleted';
    record.stage = 'deleted';
    record.assigned_worker_id = '';
    record.available_for_discovery = false;
    record.deleted_at = now;
    addStatusHistory(record, { status: 'deleted', source: 'admin_delete', createdAt: now });
    deletedIds.push(key);
  }
  if (deletedIds.length) persistCompanies();
  return deletedIds;
}

export function listLeadPool({ q = '', status = '', workerId = '', poolState = '', city = '', category = '', includeDeleted = false, limit = 500 } = {}) {
  const query = normalizeSearchText(q);
  const normalizedWorkerId = workerId ? normalizeWorkerId(workerId) : '';
  const normalizedPoolState = normalizePoolState(poolState);
  const normalizedCity = normalizeSearchText(city);
  const normalizedCategory = normalizeSearchText(category);
  return getAllCompanies({ includeDeleted })
    .filter((record) => {
      if (status && normalizeLeadStatus(record.status || record.stage) !== status) return false;
      if (normalizedPoolState && derivePoolState(record) !== normalizedPoolState) return false;
      if (normalizedWorkerId && record.assigned_worker_id !== normalizedWorkerId) return false;
      if (normalizedCity && normalizeSearchText(record.data?.city || '') !== normalizedCity) return false;
      if (normalizedCategory && !normalizeSearchText(record.data?.niche || '').includes(normalizedCategory)) return false;
      if (!query) return true;
      const haystack = normalizeSearchText(
        [
          record.data?.company,
          record.data?.legal_name,
          record.data?.contact_name,
          record.data?.niche,
          Array.isArray(record.data?.services) ? record.data.services.join(' ') : record.data?.services,
          record.data?.phone,
          record.data?.email,
          record.data?.website_url,
          record.data?.source,
          record.data?.source_label,
          record.data?.source_profile,
          record.data?.address,
          record.data?.city,
          record.data?.notes,
          record.data?.intake?.goal,
          record.data?.intake?.budget,
          record.data?.intake?.hasWebsite,
          normalizeLeadStatus(record.status || record.stage),
          derivePoolState(record),
          record.assigned_worker_id
        ].join(' ')
      );
      return haystack.includes(query);
    })
    .slice(0, limit)
    .map(serializeCompany);
}

function workerActivityAt(record) {
  return record?.updated_at || record?.last_analyzed_at || record?.reserved_at || record?.last_seen_at || record?.first_seen_at || '';
}

function scoreValues(values) {
  const scores = values.map(Number).filter(Number.isFinite);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
}

function academySummary(user) {
  if (!user) {
    return {
      completedModules: 0,
      totalModules: 10,
      completionPercent: 0,
      averageQuizScore: 0,
      lastActiveAt: '',
      sectionsVisited: {},
      servicesOpened: 0,
      servicesCompleted: 0,
      scriptsOpened: 0,
      aiTrainingSessions: 0
    };
  }
  const completed = Array.isArray(user.completedModules) ? user.completedModules.length : 0;
  const total = 10;
  const sectionsVisited = user.sectionsVisited && typeof user.sectionsVisited === 'object' ? user.sectionsVisited : {};
  return {
    completedModules: completed,
    totalModules: total,
    completionPercent: Math.round((completed / total) * 100),
    averageQuizScore: scoreValues(Object.values(user.quizScores || {})),
    lastActiveAt: user.lastActiveAt || '',
    sectionsVisited,
    servicesOpened: Array.isArray(user.servicesOpened) ? user.servicesOpened.length : 0,
    servicesCompleted: Array.isArray(user.servicesCompleted) ? user.servicesCompleted.length : 0,
    scriptsOpened: Array.isArray(user.scriptsOpened) ? user.scriptsOpened.length : 0,
    aiTrainingSessions: listAiTrainingSessions({ workerId: user.userId }).length
  };
}

function buildWorkerRecord(workerId, seed = {}) {
  const id = normalizeWorkerId(workerId);
  return {
    workerId: id,
    displayName: seed.displayName || id,
    login: seed.login || id,
    active: seed.active !== undefined ? Boolean(seed.active) : true,
    language: normalizeLanguage(seed.language || 'ru'),
    createdAt: seed.createdAt || '',
    leadsAssigned: 0,
    visibleLeads: 0,
    availableAfterReset: 0,
    parserRuns: 0,
    foundTotal: 0,
    newTotal: 0,
    duplicateTotal: 0,
    analyzedLeads: 0,
    aiAnalyses: 0,
    meetingBooked: 0,
    completed: 0,
    statusCounts: {},
    academy: academySummary(seed.academy),
    lastActiveAt: seed.lastActiveAt || '',
    sourceTags: new Set(seed.sourceTags || [])
  };
}

function bumpWorkerDate(worker, dateValue) {
  if (dateValue && (!worker.lastActiveAt || String(dateValue).localeCompare(worker.lastActiveAt) > 0)) {
    worker.lastActiveAt = String(dateValue);
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const value = String(stored || '');
  if (!value) return false;
  if (value.startsWith('scrypt$')) {
    const [, salt, hash] = value.split('$');
    if (!salt || !hash) return false;
    try {
      const check = crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
      const hashBuf = Buffer.from(hash, 'hex');
      const checkBuf = Buffer.from(check, 'hex');
      return hashBuf.length === checkBuf.length && crypto.timingSafeEqual(hashBuf, checkBuf);
    } catch {
      return false;
    }
  }
  // Legacy plaintext password from before hashing was added — the caller
  // re-hashes and persists on a successful match so this branch stops being hit.
  return value === String(password || '');
}

export function createWorkerAccount({ displayName = '', login = '', password = '', language = 'ru', active = true } = {}) {
  const normalizedLogin = normalizeWorkerId(login || displayName);
  if (!normalizedLogin) throw new Error('Worker login is required.');
  if (!password) throw new Error('Worker password is required.');
  if (state.workers.workers[normalizedLogin]) throw new Error('Worker with this login already exists.');

  const now = new Date().toISOString();
  const account = {
    workerId: normalizedLogin,
    login: normalizedLogin,
    displayName: String(displayName || normalizedLogin).trim().slice(0, 120),
    password: hashPassword(String(password).slice(0, 200)),
    language: normalizeLanguage(language),
    active: normalizeBool(active, true),
    createdAt: now,
    updatedAt: now,
    lastActiveAt: ''
  };
  state.workers.workers[normalizedLogin] = account;

  if (!state.academy.users[normalizedLogin]) {
    state.academy.users[normalizedLogin] = {
      userId: normalizedLogin,
      displayName: account.displayName,
      completedModules: [],
      quizScores: {},
      serviceProgress: {},
      lastActiveAt: '',
      createdAt: now
    };
    persistAcademy();
  }

  persistWorkers();
  return account;
}

export function updateWorkerAccount(workerId, patch = {}) {
  const id = normalizeWorkerId(workerId);
  const current = state.workers.workers[id];
  if (!current) return null;
  if (patch.displayName !== undefined) current.displayName = String(patch.displayName || id).trim().slice(0, 120);
  if (patch.password !== undefined && String(patch.password || '').trim()) {
    current.password = hashPassword(String(patch.password).slice(0, 200));
  }
  if (patch.language !== undefined) current.language = normalizeLanguage(patch.language);
  if (patch.active !== undefined) current.active = normalizeBool(patch.active, true);
  current.updatedAt = new Date().toISOString();
  persistWorkers();
  return current;
}

export function authenticateWorker(login, password) {
  const id = normalizeWorkerId(login);
  const account = state.workers.workers[id];
  if (!account || account.active === false) return null;
  if (!verifyPassword(password, account.password)) return null;
  if (!String(account.password || '').startsWith('scrypt$')) {
    // Upgrade a legacy plaintext password to a hash now that we know it's correct.
    account.password = hashPassword(String(password));
  }
  account.lastActiveAt = new Date().toISOString();
  persistWorkers();
  return account;
}

export function listWorkers() {
  const workers = new Map();
  const ensureWorker = (workerId, seed = {}) => {
    const id = normalizeWorkerId(workerId);
    if (!workers.has(id)) workers.set(id, buildWorkerRecord(id, seed));
    const worker = workers.get(id);
    if (seed.displayName && (!worker.displayName || worker.displayName === worker.workerId)) worker.displayName = seed.displayName;
    if (seed.login) worker.login = seed.login;
    if (seed.active !== undefined) worker.active = Boolean(seed.active);
    if (seed.language) worker.language = normalizeLanguage(seed.language);
    if (seed.createdAt && !worker.createdAt) worker.createdAt = seed.createdAt;
    if (seed.academy) worker.academy = academySummary(seed.academy);
    if (seed.sourceTags?.length) seed.sourceTags.forEach((tag) => worker.sourceTags.add(tag));
    bumpWorkerDate(worker, seed.lastActiveAt);
    return worker;
  };

  for (const account of Object.values(state.workers.workers || {})) {
    ensureWorker(account.workerId || account.login, {
      displayName: account.displayName || account.login,
      login: account.login,
      active: account.active !== false,
      language: account.language,
      createdAt: account.createdAt || '',
      lastActiveAt: account.lastActiveAt || account.createdAt || '',
      sourceTags: ['account']
    });
  }

  for (const user of Object.values(state.academy.users || {})) {
    ensureWorker(user.userId || user.displayName, {
      displayName: user.displayName || user.userId,
      academy: user,
      lastActiveAt: user.lastActiveAt || user.createdAt || '',
      sourceTags: ['academy']
    });
  }

  for (const run of state.runs.runs) {
    const worker = ensureWorker(run.worker_id || 'worker-default', {
      lastActiveAt: run.finished_at || run.started_at || '',
      sourceTags: ['parser']
    });
    worker.parserRuns += 1;
    worker.foundTotal += Number(run.found_count || 0);
    worker.newTotal += Number(run.new_count || 0);
    worker.duplicateTotal += Number(run.duplicate_count || 0);
    bumpWorkerDate(worker, run.finished_at || run.started_at || '');
  }

  for (const record of Object.values(state.companies.companies)) {
    if (isDeletedRecord(record)) continue;
    const workerId = record.assigned_worker_id || record.first_assigned_worker_id || '';
    if (!workerId) continue;
    const worker = ensureWorker(workerId, { sourceTags: ['leads'] });
    const status = normalizeLeadStatus(record.status || record.stage);
    worker.leadsAssigned += 1;
    worker.visibleLeads += record.available_for_discovery ? 0 : 1;
    worker.availableAfterReset += record.available_for_discovery ? 1 : 0;
    worker.statusCounts[status] = (worker.statusCounts[status] || 0) + 1;
    if (record.analysis) worker.analyzedLeads += 1;
    if (record.aiSiteAnalysis?.ai_analysis_status === 'COMPLETED' || record.aiSiteAnalysis?.status === 'COMPLETED') worker.aiAnalyses += 1;
    if (status === 'meeting_booked') worker.meetingBooked += 1;
    if (status === 'completed') worker.completed += 1;
    bumpWorkerDate(worker, workerActivityAt(record));
  }

  return [...workers.values()]
    .map((worker) => ({
      ...worker,
      sourceTags: [...worker.sourceTags],
      statusCounts: Object.fromEntries(Object.entries(worker.statusCounts).sort(([a], [b]) => a.localeCompare(b)))
    }))
    .sort((a, b) => (b.lastActiveAt || '').localeCompare(a.lastActiveAt || ''));
}

export function getWorkerDetail(workerId) {
  const id = normalizeWorkerId(workerId);
  const worker = listWorkers().find((item) => item.workerId === id) || buildWorkerRecord(id);
  const account = state.workers.workers[id] || null;
  const runs = state.runs.runs.filter((run) => normalizeWorkerId(run.worker_id || '') === id);
  const runIds = new Set(runs.map((run) => run.id));
  const companies = getAllCompanies().filter((record) => {
    const assignedWorkerId = record.assigned_worker_id || record.first_assigned_worker_id || '';
    if (assignedWorkerId && normalizeWorkerId(assignedWorkerId) === id) return true;
    return (record.claimed_run_ids || record.run_ids || []).some((runId) => runIds.has(runId));
  });
  const statusCounts = {};
  for (const record of companies) {
    const status = normalizeLeadStatus(record.status || record.stage);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  return {
    worker,
    account,
    runs,
    companies: companies.map(serializeCompany),
    academy: state.academy.users[id] || null,
    statusCounts
  };
}

export function getRunDetail(runId) {
  const run = getRun(runId);
  if (!run) return null;
  return { run, companies: getCompaniesByIds(run.company_ids).map(serializeCompany) };
}

export function resetRunCompanies(runId) {
  const run = getRun(runId);
  if (!run) return [];
  return resetCompanies(run.company_ids || []);
}

export function deleteRunCompanies(runId) {
  const run = getRun(runId);
  if (!run) return [];
  return deleteCompanies(run.company_ids || []);
}

export function resetWorkerCompanies(workerId) {
  const id = normalizeWorkerId(workerId);
  const ids = Object.values(state.companies.companies)
    .filter((record) => {
      if (isDeletedRecord(record)) return false;
      const assigned = record.assigned_worker_id || record.first_assigned_worker_id || '';
      return assigned && normalizeWorkerId(assigned) === id;
    })
    .map((record) => record.id);
  return resetCompanies(ids);
}

export function clearWorkerHistory(workerId) {
  const id = normalizeWorkerId(workerId);
  const deletedRunIds = [];
  state.runs.runs = state.runs.runs.filter((run) => {
    if (normalizeWorkerId(run.worker_id || '') !== id) return true;
    deletedRunIds.push(run.id);
    return false;
  });

  for (const record of Object.values(state.companies.companies)) {
    if (Array.isArray(record.run_ids)) record.run_ids = record.run_ids.filter((value) => !deletedRunIds.includes(value));
    if (Array.isArray(record.claimed_run_ids)) {
      record.claimed_run_ids = record.claimed_run_ids.filter((value) => !deletedRunIds.includes(value));
    }
    if (deletedRunIds.includes(record.first_claimed_run_id)) delete record.first_claimed_run_id;
  }

  if (deletedRunIds.length) {
    persistRuns();
    persistCompanies();
  }
  return deletedRunIds;
}

export function deleteWorkerAccount(workerId) {
  const id = normalizeWorkerId(workerId);
  const hasAccount = Boolean(state.workers.workers[id]);
  const hasAcademy = Boolean(state.academy.users[id]);
  const hasAiTraining = Object.values(state.aiTraining.sessions || {}).some((session) => session.workerId === id);
  const hasAiUsage = (state.aiUsage.entries || []).some((entry) => normalizeWorkerId(entry.workerId || '') === id);
  const hasSessions = Object.values(state.sessions.sessions || {}).some((session) => session.role === 'worker' && session.workerId === id);
  const hasAssignedCompanies = Object.values(state.companies.companies || {}).some((record) => normalizeWorkerId(record.assigned_worker_id || '') === id);
  const hasRuns = state.runs.runs.some((run) => normalizeWorkerId(run.worker_id || '') === id);

  if (!hasAccount && !hasAcademy && !hasAiTraining && !hasAiUsage && !hasSessions && !hasAssignedCompanies && !hasRuns) {
    return null;
  }

  const now = new Date().toISOString();
  const deletedRunIds = clearWorkerHistory(id);
  const resetLeadIds = [];
  let companiesChanged = false;

  for (const record of Object.values(state.companies.companies || {})) {
    if (!record) continue;

    const assignedMatches = normalizeWorkerId(record.assigned_worker_id || '') === id;
    const firstAssignedMatches = normalizeWorkerId(record.first_assigned_worker_id || '') === id;

    if (assignedMatches) {
      record.status = 'new';
      record.pool_state = 'reset';
      record.stage = 'reset';
      record.assigned_worker_id = '';
      record.reserved_at = '';
      record.available_for_discovery = true;
      record.reset_at = now;
      addStatusHistory(record, { status: 'new', source: 'worker_delete', createdAt: now });
      resetLeadIds.push(String(record.id));
      companiesChanged = true;
    }

    if (firstAssignedMatches) {
      delete record.first_assigned_worker_id;
      companiesChanged = true;
    }

    if (Array.isArray(record.status_history)) {
      const filteredHistory = record.status_history.filter((entry) => normalizeWorkerId(entry.workerId || '') !== id);
      if (filteredHistory.length !== record.status_history.length) {
        record.status_history = filteredHistory;
        companiesChanged = true;
      }
    }
  }

  if (companiesChanged) persistCompanies();

  if (hasAcademy) {
    delete state.academy.users[id];
    persistAcademy();
  }

  if (hasAccount) {
    delete state.workers.workers[id];
    persistWorkers();
  }

  let deletedSessionCount = 0;
  for (const [token, session] of Object.entries(state.sessions.sessions || {})) {
    if (session.role === 'worker' && session.workerId === id) {
      delete state.sessions.sessions[token];
      deletedSessionCount += 1;
    }
  }
  if (deletedSessionCount) persistSessions();

  const deletedTrainingSessionIds = [];
  for (const [sessionId, session] of Object.entries(state.aiTraining.sessions || {})) {
    if (session.workerId === id) {
      delete state.aiTraining.sessions[sessionId];
      deletedTrainingSessionIds.push(sessionId);
    }
  }
  if (deletedTrainingSessionIds.length) persistAiTraining();

  const beforeAiUsage = state.aiUsage.entries.length;
  state.aiUsage.entries = state.aiUsage.entries.filter((entry) => normalizeWorkerId(entry.workerId || '') !== id);
  const deletedAiUsageCount = beforeAiUsage - state.aiUsage.entries.length;
  if (deletedAiUsageCount > 0) persistAiUsage();

  return {
    workerId: id,
    deletedRunIds,
    resetLeadIds,
    deletedTrainingSessionIds,
    deletedSessionCount,
    deletedAiUsageCount
  };
}

export function deleteRun(runId) {
  const id = String(runId);
  const index = state.runs.runs.findIndex((run) => run.id === id);
  if (index === -1) return null;
  const [deleted] = state.runs.runs.splice(index, 1);
  for (const record of Object.values(state.companies.companies)) {
    if (Array.isArray(record.run_ids)) record.run_ids = record.run_ids.filter((value) => value !== id);
    if (Array.isArray(record.claimed_run_ids)) record.claimed_run_ids = record.claimed_run_ids.filter((value) => value !== id);
    if (record.first_claimed_run_id === id) delete record.first_claimed_run_id;
  }
  persistRuns();
  persistCompanies();
  return deleted;
}

export function removeCompanyFromRun(runId, companyId) {
  const run = getRun(runId);
  const record = state.companies.companies[String(companyId)];
  if (!run || !record) return null;
  const id = String(companyId);
  run.company_ids = (run.company_ids || []).filter((value) => String(value) !== id);
  record.run_ids = (record.run_ids || []).filter((value) => String(value) !== String(runId));
  record.claimed_run_ids = (record.claimed_run_ids || []).filter((value) => String(value) !== String(runId));
  if (record.first_claimed_run_id === String(runId)) delete record.first_claimed_run_id;
  run.found_count = Math.max(0, Number(run.found_count || 0) - 1);
  persistRuns();
  persistCompanies();
  return { run, record };
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
  if (derivePoolState(record) !== 'deleted') record.pool_state = record.assigned_worker_id ? 'reserved' : derivePoolState(record);
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
    country: meta.country || '',
    district: meta.district || '',
    radiusKm: Number(meta.radiusKm || 0),
    language: meta.language || '',
    generated_search_queries: Array.isArray(meta.generatedSearchQueries) ? meta.generatedSearchQueries : [],
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

export function listRuns({ limit = 50, workerId = '' } = {}) {
  const normalizedWorkerId = workerId ? normalizeWorkerId(workerId) : '';
  const runs = normalizedWorkerId
    ? state.runs.runs.filter((run) => normalizeWorkerId(run.worker_id || '') === normalizedWorkerId)
    : state.runs.runs;
  return runs.slice(0, limit);
}

export function getRun(runId) {
  return state.runs.runs.find((item) => item.id === runId) || null;
}

export function getStoreStats() {
  const companies = Object.values(state.companies.companies).filter((record) => !isDeletedRecord(record));
  const deletedCompanies = Object.values(state.companies.companies).filter(isDeletedRecord);
  return {
    totalCompanies: companies.length,
    totalRuns: state.runs.runs.length,
    reservedCompanies: companies.filter((record) => normalizeLeadStatus(record.status || record.stage) === 'reserved').length,
    meetingBooked: companies.filter((record) => normalizeLeadStatus(record.status || record.stage) === 'meeting_booked').length,
    availableCompanies: companies.filter((record) => ['available', 'reset'].includes(derivePoolState(record))).length,
    resetCompanies: companies.filter((record) => derivePoolState(record) === 'reset').length,
    deletedCompanies: deletedCompanies.length
  };
}

function periodStart(period = 'all') {
  const now = new Date();
  const key = String(period || 'all').toLowerCase();
  if (key === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === '7d' || key === '7days' || key === 'week') return new Date(now.getTime() - 7 * 86_400_000);
  if (key === '30d' || key === '30days' || key === 'month') return new Date(now.getTime() - 30 * 86_400_000);
  return null;
}

function isAfterPeriod(value, start) {
  if (!start) return true;
  const date = new Date(value || '');
  return !Number.isNaN(date.getTime()) && date >= start;
}

export function getAdminSummary({ period = 'all' } = {}) {
  const start = periodStart(period);
  const activeCompanies = Object.values(state.companies.companies).filter((record) => !isDeletedRecord(record));
  const allCompanies = Object.values(state.companies.companies);
  const runs = state.runs.runs.filter((run) => isAfterPeriod(run.started_at || run.finished_at, start));
  const workers = listWorkers();
  const activeWorkers = workers.filter((worker) => isAfterPeriod(worker.lastActiveAt, start));
  const periodCompanies = activeCompanies.filter((record) => isAfterPeriod(record.first_seen_at || record.last_seen_at, start));
  const periodAi = activeCompanies.filter((record) => isAfterPeriod(record.last_analyzed_at || record.aiSiteAnalysis?.analyzed_at, start));
  const resetActions = state.audit.actions.filter((action) => action.action.includes('reset') && isAfterPeriod(action.createdAt, start));
  const deleteActions = state.audit.actions.filter((action) => action.action.includes('delete') && isAfterPeriod(action.createdAt, start));

  return {
    period,
    totalWorkers: workers.length,
    activeWorkers: activeWorkers.length,
    totalCompanies: activeCompanies.length,
    totalCompaniesIncludingDeleted: allCompanies.length,
    leadsFound: periodCompanies.length,
    parserQueries: runs.length,
    aiAnalyses: periodAi.length,
    meetingBooked: activeCompanies.filter((record) => normalizeLeadStatus(record.status || record.stage) === 'meeting_booked').length,
    returnedToPool: resetActions.length,
    deletedPermanently: deleteActions.length,
    availableCompanies: activeCompanies.filter((record) => ['available', 'reset'].includes(derivePoolState(record))).length,
    deletedCompanies: allCompanies.filter(isDeletedRecord).length
  };
}

export function logAdminAction({ adminId = 'admin', action = '', targetType = '', targetId = '', details = {} } = {}) {
  const actionRecord = {
    actionId: String(state.audit.nextId++),
    adminId: String(adminId || 'admin').slice(0, 120),
    action: String(action || 'unknown').slice(0, 120),
    targetType: String(targetType || '').slice(0, 80),
    targetId: String(targetId || '').slice(0, 200),
    details,
    createdAt: new Date().toISOString()
  };
  state.audit.actions.unshift(actionRecord);
  state.audit.actions = state.audit.actions.slice(0, 2000);
  persistAudit();
  return actionRecord;
}

export function listAuditLog({ limit = 200 } = {}) {
  return state.audit.actions.slice(0, Math.max(1, Math.min(1000, Number(limit) || 200)));
}

function purgeExpiredSessions() {
  const now = Date.now();
  let changed = false;
  for (const [token, session] of Object.entries(state.sessions.sessions)) {
    if (!session.expiresAt || new Date(session.expiresAt).getTime() <= now) {
      delete state.sessions.sessions[token];
      changed = true;
    }
  }
  if (changed) persistSessions();
}

export function createSession({ role = 'worker', workerId = '', displayName = '', language = 'ru' } = {}) {
  purgeExpiredSessions();
  const token = crypto.randomBytes(24).toString('hex');
  const now = new Date();
  const session = {
    token,
    role: role === 'admin' ? 'admin' : 'worker',
    workerId: role === 'admin' ? '' : normalizeWorkerId(workerId),
    displayName: String(displayName || '').trim().slice(0, 120),
    language: normalizeLanguage(language),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString()
  };
  state.sessions.sessions[token] = session;
  persistSessions();
  return session;
}

export function getSession(token) {
  if (!token) return null;
  const session = state.sessions.sessions[String(token)];
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    delete state.sessions.sessions[String(token)];
    persistSessions();
    return null;
  }
  // Sliding expiry: extend on every use so an active session never expires mid-day.
  session.expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  persistSessions();
  return session;
}

export function destroySession(token) {
  if (!token || !state.sessions.sessions[String(token)]) return false;
  delete state.sessions.sessions[String(token)];
  persistSessions();
  return true;
}

export function getAcademyProgress(userId = 'worker-default') {
  const id = normalizeWorkerId(userId);
  if (!state.academy.users[id]) {
    const account = state.workers.workers[id] || {};
    state.academy.users[id] = {
      userId: id,
      displayName: account.displayName || id,
      completedModules: [],
      quizScores: {},
      serviceProgress: {},
      sectionsVisited: {},
      servicesOpened: [],
      servicesCompleted: [],
      scriptsOpened: [],
      lastActiveAt: '',
      createdAt: new Date().toISOString()
    };
    persistAcademy();
  }
  const record = state.academy.users[id];
  if (!record.sectionsVisited) record.sectionsVisited = {};
  if (!Array.isArray(record.servicesOpened)) record.servicesOpened = [];
  if (!Array.isArray(record.servicesCompleted)) record.servicesCompleted = [];
  if (!Array.isArray(record.scriptsOpened)) record.scriptsOpened = [];
  return record;
}

export function saveAcademyProgress(userId, patch = {}) {
  const id = normalizeWorkerId(userId);
  const current = getAcademyProgress(id);
  const nextSectionsVisited = { ...current.sectionsVisited };
  if (patch.section && ACADEMY_SECTIONS.includes(String(patch.section))) {
    nextSectionsVisited[patch.section] = new Date().toISOString();
  }
  if (patch.sectionsVisited && typeof patch.sectionsVisited === 'object') {
    for (const key of Object.keys(patch.sectionsVisited)) {
      if (ACADEMY_SECTIONS.includes(key)) nextSectionsVisited[key] = patch.sectionsVisited[key];
    }
  }
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
    sectionsVisited: nextSectionsVisited,
    servicesOpened: Array.isArray(patch.servicesOpened)
      ? [...new Set([...current.servicesOpened, ...patch.servicesOpened.map(String)])]
      : current.servicesOpened,
    servicesCompleted: Array.isArray(patch.servicesCompleted)
      ? [...new Set([...current.servicesCompleted, ...patch.servicesCompleted.map(String)])]
      : current.servicesCompleted,
    scriptsOpened: Array.isArray(patch.scriptsOpened)
      ? [...new Set([...current.scriptsOpened, ...patch.scriptsOpened.map(String)])]
      : current.scriptsOpened,
    lastActiveAt: new Date().toISOString()
  };
  state.academy.users[id] = next;
  persistAcademy();
  return next;
}

export function listAcademyProgress() {
  return Object.values(state.academy.users).sort((a, b) => (b.lastActiveAt || '').localeCompare(a.lastActiveAt || ''));
}

export function createAiTrainingSession(workerId, clientType) {
  const id = normalizeWorkerId(workerId);
  const sessionId = `ait-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const session = {
    sessionId,
    workerId: id,
    clientType: String(clientType || '').slice(0, 80),
    messages: [],
    status: 'active',
    score: null,
    feedback: null,
    createdAt: now,
    completedAt: ''
  };
  state.aiTraining.sessions[sessionId] = session;
  persistAiTraining();
  return session;
}

export function getAiTrainingSession(sessionId) {
  return state.aiTraining.sessions[String(sessionId)] || null;
}

export function appendAiTrainingMessage(sessionId, role, text) {
  const session = getAiTrainingSession(sessionId);
  if (!session) return null;
  session.messages.push({
    role: role === 'worker' ? 'worker' : 'client',
    text: String(text || '').slice(0, 4000),
    at: new Date().toISOString()
  });
  session.messages = session.messages.slice(0, 200);
  persistAiTraining();
  return session;
}

export function finishAiTrainingSession(sessionId, { score = 0, feedback = null } = {}) {
  const session = getAiTrainingSession(sessionId);
  if (!session) return null;
  session.status = 'completed';
  session.score = Math.max(0, Math.min(100, Number(score) || 0));
  session.feedback = feedback && typeof feedback === 'object' ? feedback : null;
  session.completedAt = new Date().toISOString();
  persistAiTraining();
  return session;
}

export function listAiTrainingSessions({ workerId = '' } = {}) {
  const id = workerId ? normalizeWorkerId(workerId) : '';
  return Object.values(state.aiTraining.sessions)
    .filter((session) => !id || session.workerId === id)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function logAiUsage({
  requestId = '',
  workerId = '',
  feature = '',
  model = '',
  promptTokens = 0,
  completionTokens = 0,
  totalTokens = 0,
  estimatedCost = 0
} = {}) {
  const entry = {
    requestId: String(requestId || `ai-${state.aiUsage.nextId++}`).slice(0, 120),
    workerId: workerId ? normalizeWorkerId(workerId) : '',
    feature: String(feature || 'unknown').slice(0, 60),
    model: String(model || '').slice(0, 80),
    promptTokens: Number(promptTokens) || 0,
    completionTokens: Number(completionTokens) || 0,
    totalTokens: Number(totalTokens) || 0,
    estimatedCost: Number(estimatedCost) || 0,
    createdAt: new Date().toISOString()
  };
  state.aiUsage.entries.unshift(entry);
  state.aiUsage.entries = state.aiUsage.entries.slice(0, 5000);
  persistAiUsage();
  return entry;
}

export function summarizeAiUsage({ period = 'all' } = {}) {
  const start = periodStart(period);
  const entries = state.aiUsage.entries.filter((entry) => isAfterPeriod(entry.createdAt, start));
  const totalCost = entries.reduce((sum, entry) => sum + entry.estimatedCost, 0);
  const totalTokens = entries.reduce((sum, entry) => sum + entry.totalTokens, 0);
  const byWorker = {};
  const byFeature = {};
  for (const entry of entries) {
    const workerKey = entry.workerId || 'unknown';
    byWorker[workerKey] = byWorker[workerKey] || { workerId: workerKey, cost: 0, tokens: 0, requests: 0 };
    byWorker[workerKey].cost += entry.estimatedCost;
    byWorker[workerKey].tokens += entry.totalTokens;
    byWorker[workerKey].requests += 1;

    byFeature[entry.feature] = byFeature[entry.feature] || { feature: entry.feature, cost: 0, tokens: 0, requests: 0 };
    byFeature[entry.feature].cost += entry.estimatedCost;
    byFeature[entry.feature].tokens += entry.totalTokens;
    byFeature[entry.feature].requests += 1;
  }
  return {
    period,
    totalCost,
    totalTokens,
    totalRequests: entries.length,
    byWorker: Object.values(byWorker).sort((a, b) => b.cost - a.cost),
    byFeature: Object.values(byFeature).sort((a, b) => b.cost - a.cost)
  };
}
