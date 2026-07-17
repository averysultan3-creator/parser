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
const FOLDERS_FILE = path.join(DATA_DIR, 'saved-folders.json');
const SAVED_FILE = path.join(DATA_DIR, 'saved-companies.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'company-comments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const AI_SEARCH_JOBS_FILE = path.join(DATA_DIR, 'ai-search-jobs.json');

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, sliding
const ACADEMY_SECTIONS = ['home', 'training', 'services', 'scripts', 'parserGuide', 'aiTraining'];

// Admin-configurable knobs for the AI company search feature (round 1 of
// several - this round only wires up storage/validation, no call site reads
// these yet). 0 on aiDailyBudgetLimit means "no limit", matching the existing
// 0-means-unlimited convention used for worker dailyLeadLimit.
const DEFAULT_SETTINGS = {
  aiCompanySearchModel: process.env.OPENAI_COMPANY_SEARCH_MODEL || 'gpt-5.5',
  aiCompanyEnrichModel: process.env.OPENAI_COMPANY_ENRICH_MODEL || 'gpt-5.5',
  aiWebSearchEnabled: process.env.OPENAI_WEB_SEARCH_ENABLED !== 'false',
  aiReasoningEffort: process.env.OPENAI_REASONING_EFFORT || 'medium',
  aiMaxParallelRequests: Number(process.env.OPENAI_MAX_PARALLEL_REQUESTS) || 3,
  aiMaxCompaniesPerRequest: Number(process.env.OPENAI_MAX_COMPANIES_PER_REQUEST) || 100,
  aiDailyBudgetLimit: Number(process.env.OPENAI_DAILY_BUDGET_LIMIT) || 0,
  // Round 1 defaulted this to 60s to match a since-corrected assumption about
  // how long web_search-enabled structured-output calls take. Live smoke
  // testing of planAiSearchQueries/runAiSearchBatch/enrichCompanyProfile
  // showed real web_search + large schema (enrichCompanyProfile's
  // max_output_tokens: 8000) calls routinely exceed 60s, let alone the old
  // global 30s client default - bumped to 120s so the out-of-the-box
  // experience doesn't time out before an admin ever touches this setting.
  // Clamp stays 10-300 (see the 'aiRequestTimeoutSeconds' case below) so an
  // admin can still raise it further if needed.
  aiRequestTimeoutSeconds: Number(process.env.OPENAI_REQUEST_TIMEOUT_SECONDS) || 120
};

const SETTINGS_REASONING_EFFORTS = ['low', 'medium', 'high'];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Stale .tmp files can only be left behind by a crash mid-write (see saveJson
// below) - the rename is atomic so a clean shutdown never leaves one. Anything
// older than 5 minutes is safe to remove; fresher ones may belong to a save
// that's still in flight from another process.
const STALE_TMP_MAX_AGE_MS = 5 * 60_000;

function cleanupStaleTmpFiles() {
  ensureDataDir();
  let removed = 0;
  let entries = [];
  try {
    entries = fs.readdirSync(DATA_DIR);
  } catch (error) {
    console.error('store: failed to scan data dir for stale .tmp files:', error.message);
    return;
  }
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.endsWith('.tmp')) continue;
    const fullPath = path.join(DATA_DIR, entry);
    try {
      const stats = fs.statSync(fullPath);
      if (now - stats.mtimeMs < STALE_TMP_MAX_AGE_MS) continue;
      fs.rmSync(fullPath, { force: true });
      removed += 1;
    } catch (error) {
      console.error(`store: failed to remove stale tmp file ${entry}:`, error.message);
    }
  }
  if (removed > 0) console.log(`store: removed ${removed} stale .tmp file(s) from data/ on startup`);
}

cleanupStaleTmpFiles();

function loadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      try {
        const corruptPath = `${file}.corrupt-${Date.now()}.json`;
        fs.copyFileSync(file, corruptPath);
        console.error(
          `store: ${file} contains invalid JSON and could not be parsed. The broken file was preserved at ${corruptPath}. Falling back to an empty store - restore from backups/ if this data is needed.`,
          error.message
        );
      } catch (backupError) {
        console.error(`store: failed to back up corrupt file ${file}:`, backupError.message);
      }
    } else {
      console.error(`store: failed to load ${file}:`, error.message);
    }
    return fallback;
  }
}

function saveJson(file, data) {
  try {
    ensureDataDir();
    // Write to a temp file then rename over the target. rename() replaces the
    // destination atomically (same volume), so a crash or an overlapping write
    // from another process can never leave a half-written/corrupt JSON file on
    // disk - readers always see either the old or the new complete content.
    const tmpFile = `${file}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    renameOverTarget(tmpFile, file);
  } catch (error) {
    console.error(`store: failed to save ${file}:`, error.message);
    // Previously swallowed here, so every mutator reported success to its
    // Express route even when the disk write actually failed (disk full,
    // permissions) - the in-memory change looked live but a restart would
    // silently lose it with no client-visible error. Re-throw so it surfaces
    // as a 500 through the route's existing try/catch instead.
    throw error;
  }
}

// On Windows, rename-over-an-existing-file can transiently fail with EPERM/
// EBUSY/EACCES if something else (antivirus scan, a concurrent reader) has
// the destination briefly open. Retry with backoff; if it still won't budge,
// write the content directly to the target rather than silently dropping the
// update, then clean up the temp file either way.
function renameOverTarget(tmpFile, file, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      fs.renameSync(tmpFile, file);
      return;
    } catch (error) {
      const transient = error.code === 'EPERM' || error.code === 'EBUSY' || error.code === 'EACCES';
      if (!transient || attempt === attempts) {
        try {
          fs.writeFileSync(file, fs.readFileSync(tmpFile));
        } finally {
          fs.rmSync(tmpFile, { force: true });
        }
        return;
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30 * attempt);
    }
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
  aiUsage: loadJson(AI_USAGE_FILE, { nextId: 1, entries: [] }),
  folders: loadJson(FOLDERS_FILE, { nextId: 1, folders: {} }),
  saved: loadJson(SAVED_FILE, { nextId: 1, links: {} }),
  comments: loadJson(COMMENTS_FILE, { nextId: 1, comments: {} }),
  settings: loadJson(SETTINGS_FILE, { ...DEFAULT_SETTINGS }),
  aiSearchJobs: loadJson(AI_SEARCH_JOBS_FILE, { nextId: 1, jobs: {} })
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

function persistFolders() {
  saveJson(FOLDERS_FILE, state.folders);
}

function persistSaved() {
  saveJson(SAVED_FILE, state.saved);
}

function persistComments() {
  saveJson(COMMENTS_FILE, state.comments);
}

function persistSettings() {
  saveJson(SETTINGS_FILE, state.settings);
}

function persistAiSearchJobs() {
  saveJson(AI_SEARCH_JOBS_FILE, state.aiSearchJobs);
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

// One-time backfill: normalizeWorkerId used to preserve casing, so the same
// worker could end up stored under two different keys ("Kate" vs "kate") in
// different places (login, discover requests, admin panel), which made runs
// created under one casing invisible under the other ("0 zapytan" even
// though the runs existed). Re-keys every worker-id-bearing record to the
// now-lowercased canonical form exactly once per boot; safe to run every
// startup since it's a no-op once everything is already normalized.
function migrateWorkerIdCasing() {
  let workersChanged = false;
  const remappedWorkers = {};
  for (const [key, account] of Object.entries(state.workers.workers || {})) {
    const normalizedKey = normalizeWorkerId(key);
    if (normalizedKey !== key) workersChanged = true;
    const existing = remappedWorkers[normalizedKey];
    if (!existing || String(account?.updatedAt || '') > String(existing?.updatedAt || '')) {
      remappedWorkers[normalizedKey] = { ...account, workerId: normalizedKey, login: account.login || normalizedKey };
    }
  }
  if (workersChanged) {
    state.workers.workers = remappedWorkers;
    persistWorkers();
  }

  let academyChanged = false;
  const remappedAcademy = {};
  for (const [key, user] of Object.entries(state.academy.users || {})) {
    const normalizedKey = normalizeWorkerId(key);
    if (normalizedKey !== key) academyChanged = true;
    const existing = remappedAcademy[normalizedKey];
    if (!existing || String(user?.lastActiveAt || '') > String(existing?.lastActiveAt || '')) {
      remappedAcademy[normalizedKey] = { ...user, userId: normalizedKey };
    }
  }
  if (academyChanged) {
    state.academy.users = remappedAcademy;
    persistAcademy();
  }

  let runsChanged = false;
  for (const run of state.runs.runs) {
    if (run?.worker_id) {
      const normalized = normalizeWorkerId(run.worker_id);
      if (normalized !== run.worker_id) {
        run.worker_id = normalized;
        runsChanged = true;
      }
    }
  }
  if (runsChanged) persistRuns();

  let companiesChanged = false;
  for (const record of Object.values(state.companies.companies || {})) {
    if (record?.assigned_worker_id) {
      const normalized = normalizeWorkerId(record.assigned_worker_id);
      if (normalized !== record.assigned_worker_id) {
        record.assigned_worker_id = normalized;
        companiesChanged = true;
      }
    }
    if (record?.first_assigned_worker_id) {
      const normalized = normalizeWorkerId(record.first_assigned_worker_id);
      if (normalized !== record.first_assigned_worker_id) {
        record.first_assigned_worker_id = normalized;
        companiesChanged = true;
      }
    }
  }
  if (companiesChanged) persistCompanies();

  let sessionsChanged = false;
  for (const session of Object.values(state.sessions.sessions || {})) {
    if (session?.workerId) {
      const normalized = normalizeWorkerId(session.workerId);
      if (normalized !== session.workerId) {
        session.workerId = normalized;
        sessionsChanged = true;
      }
    }
  }
  if (sessionsChanged) persistSessions();
}

migrateWorkerIdCasing();

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

// Small, pragmatic set of common two-label public suffixes (ccSLDs) seen for
// businesses in this tool's target markets (Poland/Ukraine) plus a few very
// common international ones. Not a full public-suffix-list - deliberately not
// pulling in that dependency for this. Anything not listed here is assumed to
// be a normal single-label TLD (.com, .pl, .ua, .net, ...).
const TWO_PART_TLDS = new Set([
  'co.uk', 'org.uk', 'net.uk', 'ac.uk', 'gov.uk',
  'com.pl', 'net.pl', 'org.pl', 'gov.pl', 'edu.pl', 'com.ua',
  'co.il', 'com.au', 'co.nz', 'co.za', 'co.jp', 'co.kr', 'co.in',
  'com.br', 'com.tr', 'com.mx'
]);

// Best-effort resolution of a hostname down to its registrable ("root")
// domain, e.g. `sub.example.com` -> `example.com`, `sub.example.co.uk` ->
// `example.co.uk`. Used for dedup matching so subdomains of the same company
// site (www vs shop vs blog vs a regional subdomain) resolve to one identity
// key. Deliberately simple - not a full public-suffix-list implementation.
function rootDomain(hostname) {
  const host = String(hostname || '').trim().toLowerCase().replace(/^www\./, '');
  if (!host) return '';
  const labels = host.split('.').filter(Boolean);
  if (labels.length <= 2) return host;
  const lastTwo = labels.slice(-2).join('.');
  const takeLast = TWO_PART_TLDS.has(lastTwo) ? 3 : 2;
  return labels.slice(-Math.min(takeLast, labels.length)).join('.');
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
  'rejestr.io',
  'regon24.pl',
  'biznes.gov.pl',
  'opendatabot.ua',
  'youcontrol.com.ua',
  'maps.google',
  'yelp.',
  'allegro.pl',
  'olx.pl',
  'otomoto.pl',
  'prom.ua',
  'rozetka.'
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
  const placeId = String(company?.google_place_id || '').trim();
  if (placeId) keys.push(`place:${placeId}`);
  const nip = cleanIdentifier(company?.nip);
  if (nip && nip.length >= 10) keys.push(`nip:${nip}`);
  const regon = cleanIdentifier(company?.regon);
  if (regon && regon.length >= 9) keys.push(`regon:${regon}`);
  const edrpou = cleanIdentifier(company?.edrpou);
  if (edrpou && edrpou.length >= 8) keys.push(`edrpou:${edrpou}`);

  const phoneCandidates = splitPhoneValues(company?.phone, { city: company?.city, country: company?.country });
  const directPhone = normalizePhone(company?.phone || '');
  for (const phone of phoneCandidates.length ? phoneCandidates : directPhone ? [directPhone] : []) {
    if (phone) keys.push(`phone:${phone}`);
  }

  const host = safeHostname(company?.website_url || '') || safeHostname(company?.source_profile || '');
  if (host && !isKnownNonCompanyHost(host)) {
    keys.push(`host:${host}`);
    // Also add the root-domain key (e.g. `sub.example.com` -> `example.com`)
    // in ADDITION to the exact-host key above, not replacing it, so two
    // subdomains of the same company site (www vs shop vs a regional
    // subdomain) dedup together without weakening/changing existing
    // exact-host matches already relied on elsewhere.
    const root = rootDomain(host);
    if (root && root !== host) keys.push(`host:${root}`);
  }

  const mapsUrl =
    company?.google_maps_url ||
    company?.maps_url ||
    company?.google_place_url ||
    (String(company?.source_profile || '').includes('maps.google') ? company?.source_profile : '');
  const mapsKey = normalizeUrlKey(mapsUrl);
  if (mapsKey && (mapsKey.includes('maps.google') || mapsKey.includes('google.com/maps'))) {
    keys.push(`maps:${mapsKey}`);
  }

  // Address alone is deliberately NOT a strong dedup key: many unrelated
  // businesses share one physical address (virtual offices, shared business
  // parks, multi-tenant buildings), so trusting it on its own merges
  // distinct companies. It's only used combined with a name below
  // (`nameaddr:`), which is a much safer signal.
  const addressKey = normalizeSearchText([company?.address, company?.street, company?.postal_code, company?.city].filter(Boolean).join(' '));

  // A short or generic name (e.g. the inbound-form fallback "Inbound lead")
  // must not become a dedup key either - two unrelated anonymous submissions
  // would otherwise collide and silently drop one of them. Require a
  // minimum length, matching the guard already used for addressKey.
  const rawName = company?.company || company?.legal_name || '';
  const nameKey = rawName.trim() === 'Inbound lead' ? '' : normalizeSearchText(rawName);
  if (nameKey && nameKey.length > 3) {
    const cityKey = normalizeSearchText(company?.city || '');
    const districtKey = normalizeSearchText(company?.district || '');
    keys.push(`name:${nameKey}|${cityKey}|${districtKey}`);
    if (addressKey && addressKey.length > 10) keys.push(`nameaddr:${nameKey}|${addressKey}`);
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

export function getAllCompanies({ includeDeleted = false, includeHidden = false } = {}) {
  return Object.values(state.companies.companies)
    .filter((record) => (includeDeleted || !isDeletedRecord(record)) && (includeHidden || record.hidden_from_lists !== true))
    .sort((a, b) => (b.last_seen_at || '').localeCompare(a.last_seen_at || ''))
    .map(serializeCompany);
}

// Identity fields are kept first-seen-wins (changing them on a re-discovery
// match would mean the record is describing a different legal entity, which
// should never happen once matched). Everything else - contact details,
// site status, socials, ratings - is refreshable: without this, a
// mis-scraped phone/website captured on first discovery could never be
// corrected by a later, more accurate re-discovery of the same business.
const IDENTITY_COMPANY_FIELDS = new Set(['company', 'legal_name', 'nip', 'regon', 'krs', 'edrpou', 'pkd']);

function mergeCompanyData(existing, incoming) {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(incoming || {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && !value.length) continue;
    if (!merged[key] || (!IDENTITY_COMPANY_FIELDS.has(key) && merged[key] !== value)) merged[key] = value;
  }
  return merged;
}

// Registers (or updates) a company in the store. Returns { id, isNew, record }.
// isNew=false means this exact business was already known from a previous run.
// deferPersist=true skips the disk write here - the caller (a batch loop) is
// responsible for calling persistCompanies() once after all its iterations,
// so a run touching many companies doesn't do a full-state write per company.
export function upsertCompany(company, { runId, stage = 'discovered', deferPersist = false } = {}) {
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
    if (!deferPersist) persistCompanies();
    return { id: existingId, isNew: false, record };
  }

  const id = String(state.companies.nextId++);
  const record = {
    id,
    data: { ...company },
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
    source_history: incomingSource ? [incomingSource] : [],
    crm_status: 'nowy',
    crm_status_updated_at: '',
    crm_status_updated_by: '',
    crm_status_history: []
  };
  state.companies.companies[id] = record;
  for (const key of keys) state.companies.keyIndex[key] = id;
  if (!deferPersist) persistCompanies();
  return { id, isNew: true, record };
}

// Lowercased so the same worker never splits into two identities (e.g. a
// login typed/stored as "Kate" in one place and "kate" in another used to
// create two separate worker buckets - runs created under one casing would
// then be invisible under the other, which is what caused the worker-facing
// "0 zapytan" bug even though the runs existed in the shared history).
// Phone numbers pasted from WhatsApp/Telegram contact lists often carry
// invisible Unicode bidi-formatting marks (LRE/PDF/RLE/isolates, zero-width
// spaces, BOM) around the digits. Left in place, the stored login silently
// stops matching whatever the worker actually types to sign in - strip them
// before trimming/lowercasing so a pasted "U+202A797662056U+202C" and a
// typed "797662056" resolve to the same account.

// Phone numbers/passwords pasted from WhatsApp/Telegram/notes apps often
// carry invisible Unicode bidi-formatting marks (LRE/PDF/RLE/isolates,
// zero-width spaces, BOM). Left in place, a stored login or password
// silently stops matching whatever gets typed later - strip them from
// every login/password we ever store. Function declaration (not const)
// so it's fully hoisted and safe to call from this module's synchronous
// top-level migration code, which runs before any const initializer would.
function stripInvisibleFormatting(value) {
  return String(value || '').replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '');
}

export function normalizeWorkerId(workerId) {
  const cleaned = stripInvisibleFormatting(workerId).trim().toLowerCase().slice(0, 80);
  return cleaned || 'worker-default';
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

// CRM work status: a separate axis from the pool/lead `status` above. The pool
// status tracks whether a lead is available/reserved/processed in the parser
// pool machinery; crm_status tracks the worker's actual sales-pipeline stage
// for the company and must survive pool returns/reassignments untouched.
const allowedCrmStatuses = new Set([
  'nowy',
  'do_kontaktu',
  'proba_kontaktu',
  'brak_odpowiedzi',
  'oddzwonic',
  'zainteresowany',
  'oferta_wyslana',
  'umowione_spotkanie',
  'klient',
  'odrzucony'
]);

function normalizeCrmStatus(status) {
  const raw = String(status || '').trim().toLowerCase();
  return allowedCrmStatuses.has(raw) ? raw : 'nowy';
}

function addCrmStatusHistory(record, entry = {}) {
  if (!record) return;
  const history = Array.isArray(record.crm_status_history) ? record.crm_status_history : [];
  history.push({
    status: entry.status || normalizeCrmStatus(record.crm_status),
    workerId: entry.workerId || '',
    authorRole: entry.authorRole || 'worker',
    note: entry.note || '',
    createdAt: entry.createdAt || new Date().toISOString()
  });
  record.crm_status_history = history.slice(-200);
}

export function setCompanyCrmStatus(id, { status, workerId, actorRole = 'worker', note } = {}) {
  const record = state.companies.companies[String(id)];
  if (!record) return null;
  const normalized = normalizeCrmStatus(status);
  record.crm_status = normalized;
  record.crm_status_updated_at = new Date().toISOString();
  record.crm_status_updated_by = workerId ? normalizeWorkerId(workerId) : '';
  addCrmStatusHistory(record, {
    status: normalized,
    workerId: record.crm_status_updated_by,
    authorRole: actorRole,
    note: note || '',
    createdAt: record.crm_status_updated_at
  });
  persistCompanies();
  return serializeCompany(record);
}

export function listCrmStatuses() {
  return [...allowedCrmStatuses];
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
    pool_state: derivePoolState(record),
    crm_status: normalizeCrmStatus(record?.crm_status),
    saved_links: listSavedLinksForCompany(record?.id),
    last_comment: getLatestComment(record?.id)
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

export function claimCompanyForRun(company, { runId, workerId, stage = 'reserved', deferPersist = false } = {}) {
  const { id, isNew, record } = upsertCompany(company, { runId, stage: 'discovered', deferPersist });
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

  // A company already known to us is only a genuine "duplicate" if it's still
  // actively assigned to a worker or already processed. Once it's been
  // returned to the pool (available/reset - nobody currently owns it), it's
  // a legitimate find again: for whoever's search turns it up next it's just
  // a new lead, not clutter. This keeps dedupe memory meaningful (never
  // re-creates the record, never loses its history/comments/CRM status)
  // without permanently blacklisting a company just because it was seen once.
  const isReclaimablePoolLead = !isNew && !isDeletedRecord(record) && ['available', 'reset'].includes(derivePoolState(record));

  if (!isNew && !isReclaimablePoolLead) {
    record.duplicate_count = (record.duplicate_count || 0) + 1;
    record.last_duplicate_at = now;
    record.last_seen_query_id = runId || record.last_seen_query_id || '';
    if (!deferPersist) persistCompanies();
    return { id, isNew: false, isClaimed: false, record };
  }

  record.status = stage === 'analyzed' ? 'analyzed' : 'reserved';
  record.pool_state = 'reserved';
  record.stage = stage;
  record.assigned_worker_id = record.assigned_worker_id || normalizedWorkerId;
  record.reserved_at = record.reserved_at || now;
  record.available_for_discovery = false;
  // A previously returned-to-pool lead was hidden from list views; now that
  // it's live and claimed again it must become visible again, otherwise it
  // would stay invisible forever after its very first return-to-pool.
  record.hidden_from_lists = false;
  record.hidden_from_lists_at = '';
  if (!Array.isArray(record.claimed_run_ids)) record.claimed_run_ids = [];
  if (runId && !record.claimed_run_ids.includes(runId)) record.claimed_run_ids.push(runId);
  if (!record.first_claimed_run_id && runId) record.first_claimed_run_id = runId;
  if (!record.first_assigned_worker_id) record.first_assigned_worker_id = normalizedWorkerId;
  if (!deferPersist) persistCompanies();

  return {
    id,
    isNew: isNew || isReclaimablePoolLead,
    isClaimed: true,
    isNewForRun: Boolean(isNew || isReclaimablePoolLead || (runId && record.first_claimed_run_id === runId && record.seen_count === 1)),
    record
  };
}

export function claimCompaniesForRun(companies, { runId, workerId, limit = 100, includeDuplicates = false } = {}) {
  const claimed = [];
  const claimedIds = new Set();
  let newCount = 0;
  let duplicateCount = 0;

  let touched = false;
  for (const company of companies || []) {
    if (claimed.length >= limit) break;
    const result = claimCompanyForRun(company, { runId, workerId, deferPersist: true });
    touched = true;
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

  if (touched) persistCompanies();

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
  if (normalizedWorker) {
    record.assigned_worker_id = normalizedWorker;
    // Mirrors claimCompanyForRun's own reclaim handling: a company can only
    // reach here with a fresh assigned_worker_id after having been returned
    // to the pool (which sets hidden_from_lists) if this endpoint - not just
    // the discovery claim path - is what reassigns it. Without this, a lead
    // reassigned this way would stay assigned to a worker yet permanently
    // invisible in every default list view (getAllCompanies/listLeadPool),
    // which is a contradictory state: owned by someone but unfindable.
    record.hidden_from_lists = false;
    record.hidden_from_lists_at = '';
  }
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

  const attribution = {
    landingPage: String(lead.landingPage || '').trim(),
    referrer: String(lead.referrer || '').trim(),
    utmSource: String(lead.utmSource || '').trim(),
    utmMedium: String(lead.utmMedium || '').trim(),
    utmCampaign: String(lead.utmCampaign || '').trim(),
    utmContent: String(lead.utmContent || '').trim(),
    utmTerm: String(lead.utmTerm || '').trim()
  };

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
    source_profile: attribution.landingPage || '/site/',
    source_label: 'Aura inbound form',
    inbound: true,
    inbound_submitted_at: now,
    intake: {
      goal: String(lead.goal || '').trim(),
      budget: String(lead.budget || '').trim(),
      format: String(lead.format || '').trim(),
      hasWebsite: String(lead.hasWebsite || '').trim(),
      context: String(lead.context || '').trim(),
      selectedService: String(lead.selectedService || '').trim(),
      selectedPackage: String(lead.selectedPackage || '').trim(),
      selectedProject: String(lead.selectedProject || '').trim()
    },
    attribution
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

export function resetCompanies(ids, { source = 'admin_reset' } = {}) {
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
    addStatusHistory(record, { status: 'new', source, createdAt: now });
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

export function listLeadPool({ q = '', status = '', workerId = '', poolState = '', city = '', category = '', includeDeleted = false, includeHidden = false, limit = 500 } = {}) {
  const query = normalizeSearchText(q);
  const normalizedWorkerId = workerId ? normalizeWorkerId(workerId) : '';
  const normalizedPoolState = normalizePoolState(poolState);
  const normalizedCity = normalizeSearchText(city);
  const normalizedCategory = normalizeSearchText(category);
  return getAllCompanies({ includeDeleted, includeHidden })
    .filter((record) => {
      if (status && normalizeLeadStatus(record.status || record.stage) !== status) return false;
      if (normalizedPoolState && derivePoolState(record) !== normalizedPoolState) return false;
      if (normalizedWorkerId && record.assigned_worker_id !== normalizedWorkerId) return false;
      if (normalizedCity && !normalizeSearchText(record.data?.city || '').includes(normalizedCity)) return false;
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

// Quiz-score keys below this threshold are surfaced as "weak spots" in the admin
// panel (see academySummary().weakSpots) — module/service areas the worker should
// revisit, not just an overall average that can hide specific gaps.
const WEAK_SPOT_THRESHOLD = 70;

// Mirrors public/site/data/services.js (33 services) and public/academy/data/scripts.js
// (scripts + examples). Kept as constants here rather than imported/parsed at
// runtime to avoid coupling this backend module to browser-only data shapes -
// update these two numbers if the catalog or the scripts library grows.
const SERVICES_TOTAL = 33;
const SCRIPTS_TOTAL = 67;

// Guided learning path thresholds - MUST mirror STAGE_GATES in
// public/academy/app.js so the admin funnel view matches what actually gates
// navigation for the worker. See that file for the reasoning.
const LEARNING_STAGE_GATES = [
  { key: 'servicesCatalog', label: 'Usługi', threshold: 0, ownPercentKey: 'servicesPercent' },
  { key: 'training', label: 'Szkolenie', threshold: 20, requiresPercentKey: 'servicesPercent', ownPercentKey: 'completionPercent' },
  { key: 'scriptsExamples', label: 'Skrypty', threshold: 40, requiresPercentKey: 'completionPercent', ownPercentKey: 'scriptsPercent' },
  { key: 'aiTraining', label: 'Trener AI', threshold: 30, requiresPercentKey: 'scriptsPercent', ownPercentKey: 'aiTrainingStagePercent' }
];

function currentLearningStage(percents) {
  for (const stage of LEARNING_STAGE_GATES) {
    if ((percents[stage.ownPercentKey] || 0) < 100) return stage.label;
  }
  return 'Ukończono';
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
      servicesPercent: 0,
      scriptsOpened: 0,
      scriptsPercent: 0,
      aiTrainingSessions: 0,
      aiTrainingCompleted: 0,
      averageAiTrainingScore: 0,
      aiMeetingBookedRate: 0,
      aiTrainingStagePercent: 0,
      currentStage: 'Usługi',
      weakSpots: [],
      quizScores: {},
      aiUsageCount: 0,
      aiUsageCost: 0
    };
  }
  const completed = Array.isArray(user.completedModules) ? user.completedModules.length : 0;
  const total = 10;
  const sectionsVisited = user.sectionsVisited && typeof user.sectionsVisited === 'object' ? user.sectionsVisited : {};
  const quizScores = user.quizScores && typeof user.quizScores === 'object' ? user.quizScores : {};

  const sessions = listAiTrainingSessions({ workerId: user.userId });
  const completedSessions = sessions.filter((session) => session.status === 'completed');
  const averageAiTrainingScore = scoreValues(completedSessions.map((session) => session.score || 0));
  const meetingBookedCount = completedSessions.filter((session) => session.feedback?.meetingBooked).length;
  const aiMeetingBookedRate = completedSessions.length ? Math.round((meetingBookedCount / completedSessions.length) * 100) : 0;

  const servicesCompletedCount = Array.isArray(user.servicesCompleted) ? user.servicesCompleted.length : 0;
  const scriptsOpenedCount = Array.isArray(user.scriptsOpened) ? user.scriptsOpened.length : 0;
  const servicesPercent = SERVICES_TOTAL ? Math.round((servicesCompletedCount / SERVICES_TOTAL) * 100) : 0;
  const scriptsPercent = SCRIPTS_TOTAL ? Math.min(100, Math.round((scriptsOpenedCount / SCRIPTS_TOTAL) * 100)) : 0;
  const completionPercent = Math.round((completed / total) * 100);
  const aiTrainingStagePercent = Math.min(100, completedSessions.length * 34);
  const currentStage = currentLearningStage({ servicesPercent, completionPercent, scriptsPercent, aiTrainingStagePercent });

  const weakSpots = Object.entries(quizScores)
    .filter(([, score]) => Number(score) < WEAK_SPOT_THRESHOLD)
    .map(([key, score]) => ({ key, score: Number(score) || 0 }))
    .sort((a, b) => a.score - b.score);

  const normalizedUserId = normalizeWorkerId(user.userId || '');
  const aiUsageEntries = state.aiUsage.entries.filter((entry) => entry.workerId === normalizedUserId);
  const aiUsageCount = aiUsageEntries.length;
  const aiUsageCost = aiUsageEntries.reduce((sum, entry) => sum + entry.estimatedCost, 0);

  return {
    completedModules: completed,
    totalModules: total,
    completionPercent,
    averageQuizScore: scoreValues(Object.values(quizScores)),
    lastActiveAt: user.lastActiveAt || '',
    sectionsVisited,
    servicesOpened: Array.isArray(user.servicesOpened) ? user.servicesOpened.length : 0,
    servicesCompleted: servicesCompletedCount,
    servicesPercent,
    scriptsOpened: scriptsOpenedCount,
    scriptsPercent,
    aiTrainingSessions: sessions.length,
    aiTrainingCompleted: completedSessions.length,
    averageAiTrainingScore,
    aiMeetingBookedRate,
    aiTrainingStagePercent,
    currentStage,
    weakSpots,
    quizScores,
    aiUsageCount,
    aiUsageCost
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
    dailyLeadLimit: Math.max(0, Number.parseInt(seed.dailyLeadLimit, 10) || 0),
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

export function createWorkerAccount({ displayName = '', login = '', password = '', language = 'ru', active = true, dailyLeadLimit = 0 } = {}) {
  const normalizedLogin = normalizeWorkerId(login || displayName);
  if (!normalizedLogin) throw new Error('Worker login is required.');
  if (!password) throw new Error('Worker password is required.');
  if (state.workers.workers[normalizedLogin]) throw new Error('Worker with this login already exists.');

  const now = new Date().toISOString();
  const account = {
    workerId: normalizedLogin,
    login: normalizedLogin,
    displayName: String(displayName || normalizedLogin).trim().slice(0, 120),
    password: hashPassword(stripInvisibleFormatting(password).slice(0, 200)),
    language: normalizeLanguage(language),
    active: normalizeBool(active, true),
    dailyLeadLimit: Math.max(0, Number.parseInt(dailyLeadLimit, 10) || 0),
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
    current.password = hashPassword(stripInvisibleFormatting(patch.password).slice(0, 200));
  }
  if (patch.language !== undefined) current.language = normalizeLanguage(patch.language);
  if (patch.active !== undefined) current.active = normalizeBool(patch.active, true);
  if (patch.dailyLeadLimit !== undefined) current.dailyLeadLimit = Math.max(0, Number.parseInt(patch.dailyLeadLimit, 10) || 0);
  current.updatedAt = new Date().toISOString();
  persistWorkers();
  return current;
}

// Simple single-account accessor used where callers need the raw stored
// worker account (e.g. dailyLeadLimit) without the aggregated listWorkers()
// scan across runs/companies/academy.
export function getWorkerAccount(workerId) {
  const id = normalizeWorkerId(workerId);
  return state.workers.workers[id] || null;
}

export function authenticateWorker(login, password) {
  const id = normalizeWorkerId(login);
  const cleanPassword = stripInvisibleFormatting(password);
  const account = state.workers.workers[id];
  if (!account || account.active === false) return null;
  if (!verifyPassword(cleanPassword, account.password)) return null;
  if (!String(account.password || '').startsWith('scrypt$')) {
    // Upgrade a legacy plaintext password to a hash now that we know it's correct.
    account.password = hashPassword(cleanPassword);
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
    if (seed.dailyLeadLimit !== undefined) worker.dailyLeadLimit = Math.max(0, Number.parseInt(seed.dailyLeadLimit, 10) || 0);
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
      dailyLeadLimit: account.dailyLeadLimit,
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

  // AI usage log entries are intentionally NOT deleted here: they are cost
  // history independent of whether the worker account still exists, and
  // erasing them on account deletion is what previously hid evidence of
  // past cost spikes from the admin usage panel.

  return {
    workerId: id,
    deletedRunIds,
    resetLeadIds,
    deletedTrainingSessionIds,
    deletedSessionCount
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

// Round 4: analogous to updateCompanyAiAnalysis() above, but targets a new,
// separate top-level field (record.aiCompanyProfile) for the much richer AI
// Company Search enrichment envelope produced by enrichCompanyProfile() in
// server.js - does not touch the existing record.aiSiteAnalysis field.
export function updateAiCompanyProfile(id, aiCompanyProfile) {
  const record = state.companies.companies[id];
  if (!record) return null;
  record.aiCompanyProfile = aiCompanyProfile;
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
    company_ids: [],
    // Companies this run encountered again but did NOT claim (already known,
    // owned/processed elsewhere) - tracked separately from company_ids so the
    // History tab can offer a "show duplicates" view per search without
    // conflating them with leads this run actually found/owns.
    duplicate_company_ids: [],
    // Archive/pool lifecycle for this history entry. 'active' means it still
    // reflects a live worker assignment; 'returned_to_pool' means the whole
    // query and its leads were sent back to the pool (see returnRunToPool);
    // archived_at marks it as hidden from the default history view without
    // ever deleting the record itself.
    pool_status: 'active',
    archived_at: '',
    archived_by: '',
    archived_reason: '',
    returned_to_pool_at: '',
    returned_to_pool_by: '',
    previous_worker_id: '',
    return_reason: ''
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

export function addDuplicateCompanyIdsToRun(runId, ids) {
  const run = state.runs.runs.find((item) => item.id === runId);
  if (!run) return null;
  if (!Array.isArray(run.duplicate_company_ids)) run.duplicate_company_ids = [];
  for (const id of ids || []) {
    if (id && !run.duplicate_company_ids.includes(id)) run.duplicate_company_ids.push(id);
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

// Parses a dateFrom/dateTo filter value as a LOCAL calendar-day boundary when
// given a bare "YYYY-MM-DD" string (consistent with periodStart()'s local
// midnight below), instead of the UTC midnight `new Date(str)` would give.
// endOfDay=true returns 23:59:59.999 local time on that date instead of 00:00.
function parseDateBoundaryMs(value, endOfDay) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  const bareDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (bareDateMatch) {
    const [, year, month, day] = bareDateMatch.map(Number);
    const date = endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

// Filtered view over query history. Never touches companies — history and the
// master leads database are separate concerns.
export function listRunsFiltered({
  country = '',
  city = '',
  category = '',
  workerId = '',
  status = '',
  source = '',
  dateFrom = '',
  dateTo = '',
  only = '',
  view = 'active',
  limit = 100,
  sort = 'newest'
} = {}) {
  const normCountry = normalizeSearchText(country);
  const normCity = normalizeSearchText(city);
  const normCategory = normalizeSearchText(category);
  const normWorker = workerId ? normalizeWorkerId(workerId) : '';
  const normStatus = String(status || '').trim().toLowerCase();
  const normSource = String(source || '').trim().toLowerCase();
  const normOnly = String(only || '').trim().toLowerCase();

  // A bare "YYYY-MM-DD" string parses as UTC midnight per the Date spec,
  // while periodStart() below (used by the admin summary dashboard's "today"
  // filter) builds local midnight. In Warsaw (UTC+1/+2) that mismatch shifts
  // the day boundary by 1-2 hours, so the two "today" filters can disagree
  // near midnight. Parse bare date-only strings as local midnight here too so
  // both filters agree on what "today" means.
  const fromTime = parseDateBoundaryMs(dateFrom, false);
  let toTime = parseDateBoundaryMs(dateTo, true);

  const filtered = state.runs.runs.filter((run) => {
    if (normCountry && !normalizeSearchText(run.country || '').includes(normCountry)) return false;
    if (normCity && !normalizeSearchText(run.city || '').includes(normCity)) return false;
    if (normCategory && !normalizeSearchText((run.niches || []).join(' ')).includes(normCategory)) return false;
    if (normWorker && normalizeWorkerId(run.worker_id || '') !== normWorker) return false;
    if (normStatus && String(run.status || '').toLowerCase() !== normStatus) return false;
    if (normSource && String(run.sourceFocus || '').toLowerCase() !== normSource) return false;
    if (fromTime !== null || toTime !== null) {
      const startedAt = new Date(run.started_at || run.finished_at || '').getTime();
      if (Number.isNaN(startedAt)) return false;
      if (fromTime !== null && startedAt < fromTime) return false;
      if (toTime !== null && startedAt > toTime) return false;
    }
    if (normOnly === 'duplicates' && !(Number(run.duplicate_count || 0) > 0)) return false;
    if (normOnly === 'new' && !(Number(run.new_count || 0) > 0)) return false;
    if (normOnly === 'exhausted' && !['exhausted', 'duplicates_only'].includes(String(run.status || ''))) return false;
    if (normOnly === 'completed' && String(run.status || '') !== 'completed') return false;
    if (normOnly === 'empty' && !(Number(run.new_count || 0) === 0 && Number(run.found_count || 0) === 0)) return false;
    if (normOnly === 'errors' && !(Array.isArray(run.warnings) && run.warnings.length > 0)) return false;

    // Archive/pool lifecycle view bucket. Every run starts 'active'; a return
    // to pool (single or bulk) auto-archives it, and a manual archive action
    // can archive it without touching the pool. Defaulting to 'active' keeps
    // the default history list free of clutter without ever deleting anything.
    const normView = String(view || 'active').trim().toLowerCase();
    if (normView === 'archived') {
      if (!run.archived_at) return false;
    } else if (normView === 'returned') {
      if (run.pool_status !== 'returned_to_pool') return false;
    } else if (normView === 'completed_active') {
      if (run.archived_at || String(run.status || '') !== 'completed') return false;
    } else if (normView === 'all') {
      // no additional filter
    } else {
      if (run.archived_at) return false;
    }
    return true;
  });

  // state.runs.runs is stored newest-first (unshift on create).
  const sorted = String(sort || 'newest').toLowerCase() === 'oldest' ? [...filtered].reverse() : filtered;
  const cappedLimit = Math.max(1, Math.min(100000, Number(limit) || 100));
  return sorted.slice(0, cappedLimit);
}

// Deletes query-history entries ONLY. Companies, their statuses, pool state and
// dedupe memory (keyIndex) are never touched here — we only unlink run references.
export function deleteRunsBulk(runIds) {
  const idSet = new Set((runIds || []).map(String).filter(Boolean));
  if (!idSet.size) return [];
  const deletedIds = [];
  state.runs.runs = state.runs.runs.filter((run) => {
    if (!idSet.has(String(run.id))) return true;
    deletedIds.push(String(run.id));
    return false;
  });
  if (!deletedIds.length) return [];
  for (const record of Object.values(state.companies.companies)) {
    if (Array.isArray(record.run_ids)) record.run_ids = record.run_ids.filter((value) => !idSet.has(String(value)));
    if (Array.isArray(record.claimed_run_ids)) {
      record.claimed_run_ids = record.claimed_run_ids.filter((value) => !idSet.has(String(value)));
    }
    if (record.first_claimed_run_id && idSet.has(String(record.first_claimed_run_id))) delete record.first_claimed_run_id;
  }
  persistRuns();
  persistCompanies();
  return deletedIds;
}

// Returns all leads referenced by the given runs back to the worker pool.
// resetCompanies keeps dedupe memory intact, so these companies stay known
// duplicates for future parser runs.
export function resetRunsCompanies(runIds) {
  const companyIds = new Set();
  for (const runId of runIds || []) {
    const run = getRun(String(runId));
    for (const id of run?.company_ids || []) companyIds.add(String(id));
  }
  return resetCompanies([...companyIds]);
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

// Counts leads claimed by this worker since local midnight, for daily lead
// quota enforcement. A lead "counts" once it's reserved (assigned_worker_id
// set + reserved_at stamped), matching how discovery assigns leads to a
// worker. No caching/index - a plain scan matching the scale of the other
// scans in this file (e.g. inside listWorkers()).
export function getWorkerLeadsClaimedToday(workerId) {
  const id = normalizeWorkerId(workerId);
  const start = periodStart('today');
  let count = 0;
  for (const record of Object.values(state.companies.companies)) {
    if (normalizeWorkerId(record.assigned_worker_id || '') !== id) continue;
    if (!record.reserved_at) continue;
    if (!isAfterPeriod(record.reserved_at, start)) continue;
    count += 1;
  }
  return count;
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

// Admin-configurable settings for the AI company search pipeline (models,
// web-search toggle, concurrency/budget/timeout knobs). Merge over
// DEFAULT_SETTINGS so any key added to the default set later is always
// present in the response even if an older settings.json on disk predates it.
export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...state.settings };
}

function clampInt(value, { min, max, fallback }) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function updateSettings(patch = {}) {
  const allowedKeys = Object.keys(DEFAULT_SETTINGS);
  for (const key of allowedKeys) {
    if (patch[key] === undefined) continue;
    const value = patch[key];
    switch (key) {
      case 'aiWebSearchEnabled':
        state.settings[key] = normalizeBool(value, DEFAULT_SETTINGS[key]);
        break;
      case 'aiReasoningEffort': {
        const raw = String(value || '').trim().toLowerCase();
        state.settings[key] = SETTINGS_REASONING_EFFORTS.includes(raw) ? raw : (state.settings[key] || DEFAULT_SETTINGS[key]);
        break;
      }
      case 'aiMaxParallelRequests':
        state.settings[key] = clampInt(value, { min: 1, max: 10, fallback: state.settings[key] ?? DEFAULT_SETTINGS[key] });
        break;
      case 'aiMaxCompaniesPerRequest':
        state.settings[key] = clampInt(value, { min: 1, max: 100, fallback: state.settings[key] ?? DEFAULT_SETTINGS[key] });
        break;
      case 'aiRequestTimeoutSeconds':
        state.settings[key] = clampInt(value, { min: 10, max: 300, fallback: state.settings[key] ?? DEFAULT_SETTINGS[key] });
        break;
      case 'aiDailyBudgetLimit': {
        // 0 means "no limit" - same convention as worker dailyLeadLimit.
        const parsed = Number(value);
        state.settings[key] = Number.isFinite(parsed) ? Math.max(0, parsed) : (state.settings[key] ?? DEFAULT_SETTINGS[key]);
        break;
      }
      case 'aiCompanySearchModel':
      case 'aiCompanyEnrichModel': {
        const trimmed = String(value || '').trim().slice(0, 120);
        if (trimmed) state.settings[key] = trimmed;
        break;
      }
      default:
        break;
    }
  }
  state.settings.updatedAt = new Date().toISOString();
  persistSettings();
  return getSettings();
}

// Cap on how many AI Search Job records we keep in memory/on disk - mirrors
// the aiUsage.entries cap (5000) elsewhere in this file, just applied to this
// id-keyed map instead of an array. Jobs are small but unbounded growth from
// a long-running feature would otherwise bloat ai-search-jobs.json forever.
const MAX_AI_SEARCH_JOBS = 500;

function capAiSearchJobs() {
  const ids = Object.keys(state.aiSearchJobs.jobs);
  if (ids.length <= MAX_AI_SEARCH_JOBS) return;
  const sorted = ids
    .map((id) => ({ id, createdAt: state.aiSearchJobs.jobs[id]?.created_at || '' }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const excess = sorted.slice(0, sorted.length - MAX_AI_SEARCH_JOBS);
  for (const { id } of excess) delete state.aiSearchJobs.jobs[id];
}

// Durable "AI Search Job" store - a NEW entity separate from the existing
// `run` store (state.runs), which stays untouched and keeps serving normal
// discovery. An AI Search Job tracks the lifecycle of an AI-driven company
// search/enrichment operation (queued -> running -> done/failed/cancelled)
// so progress, token usage, and cost survive a server restart and can be
// polled from the admin panel.
export function createAiSearchJob({ creatorWorkerId, mode, params, modelSearch, modelEnrich }) {
  const id = String(state.aiSearchJobs.nextId++);
  const now = new Date().toISOString();
  const job = {
    id,
    creator_worker_id: normalizeWorkerId(creatorWorkerId || ''),
    mode: ['ai_search', 'combined', 'ai_enrich'].includes(mode) ? mode : 'ai_search',
    params: params || {},
    model_search: String(modelSearch || ''),
    model_enrich: String(modelEnrich || ''),
    created_at: now,
    started_at: '',
    finished_at: '',
    stage: 'QUEUED',
    stage_detail: '',
    progress: {
      planned_queries: 0, queries_run: 0, candidates_found: 0, candidates_confirmed: 0,
      duplicates_skipped: 0, rejected: 0, enriched: 0, saved: 0
    },
    token_usage: { prompt: 0, completion: 0, total: 0 },
    web_search_calls: 0,
    estimated_cost: 0,
    errors: [],
    cancel_reason: '',
    cancel_requested: false,
    pause_requested: false,
    run_id: ''
  };
  state.aiSearchJobs.jobs[id] = job;
  capAiSearchJobs();
  persistAiSearchJobs();
  return job;
}

export function getAiSearchJob(id) {
  return state.aiSearchJobs.jobs[String(id)] || null;
}

export function updateAiSearchJob(id, patch = {}) {
  const job = state.aiSearchJobs.jobs[String(id)];
  if (!job) return null;
  // shallow-merge top-level fields; for `progress` and `token_usage`, merge nested keys rather than replacing the whole sub-object
  if (patch.progress) job.progress = { ...job.progress, ...patch.progress };
  if (patch.token_usage) job.token_usage = { ...job.token_usage, ...patch.token_usage };
  if (patch.errors) job.errors = [...job.errors, ...(Array.isArray(patch.errors) ? patch.errors : [patch.errors])].slice(-50);
  const { progress, token_usage, errors, ...rest } = patch;
  Object.assign(job, rest);
  persistAiSearchJobs();
  return job;
}

export function listAiSearchJobs({ workerId, limit = 50 } = {}) {
  let jobs = Object.values(state.aiSearchJobs.jobs);
  if (workerId) jobs = jobs.filter((j) => j.creator_worker_id === normalizeWorkerId(workerId));
  return jobs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, limit);
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

// Persists a client-side language toggle (e.g. the Academy toolbar
// [data-set-lang] chips) back onto the worker's active session, so
// requestAcademyLanguage() in server.js (used by AI-training personas,
// finish-session feedback, and grade-answer) reflects what the trainee is
// actually looking at right now instead of only the language captured at
// login. See round-6 QA finding 3.
export function setSessionLanguage(token, language) {
  if (!token || !state.sessions.sessions[String(token)]) return null;
  const session = state.sessions.sessions[String(token)];
  session.language = normalizeLanguage(language);
  persistSessions();
  return session;
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
  estimatedCost = 0,
  companyId = '',
  runId = ''
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
    companyId: companyId ? String(companyId).slice(0, 80) : '',
    runId: runId ? String(runId).slice(0, 80) : '',
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

export function getAiUsageForRun(runId) {
  const id = String(runId || '');
  const entries = state.aiUsage.entries.filter((entry) => entry.runId === id);
  return {
    totalCost: entries.reduce((sum, entry) => sum + entry.estimatedCost, 0),
    totalTokens: entries.reduce((sum, entry) => sum + entry.totalTokens, 0),
    requestCount: entries.length
  };
}

export function getAiUsageForCompany(companyId) {
  const id = String(companyId || '');
  const entries = state.aiUsage.entries.filter((entry) => entry.companyId === id);
  return {
    totalCost: entries.reduce((sum, entry) => sum + entry.estimatedCost, 0),
    totalTokens: entries.reduce((sum, entry) => sum + entry.totalTokens, 0),
    requestCount: entries.length
  };
}

// =====================================================================
// SAVED FOLDERS (worker_saved_folders)
// =====================================================================

export function listFolders(workerId) {
  const id = normalizeWorkerId(workerId);
  return Object.values(state.folders.folders)
    .filter((folder) => folder.workerId === id && !folder.deletedAt)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export function getFolder(workerId, folderId) {
  const folder = state.folders.folders[String(folderId)];
  if (!folder || folder.deletedAt) return null;
  if (workerId && folder.workerId !== normalizeWorkerId(workerId)) return null;
  return folder;
}

// Folders reported deleted/missing by a worker that turn out to still exist
// (soft-deleted) - used to recover a folder without having to guess its id.
export function listDeletedFolders({ workerId = '' } = {}) {
  const id = workerId ? normalizeWorkerId(workerId) : '';
  return Object.values(state.folders.folders)
    .filter((folder) => Boolean(folder.deletedAt) && (!id || folder.workerId === id))
    .sort((a, b) => String(b.deletedAt).localeCompare(String(a.deletedAt)));
}

export function restoreFolder(folderId) {
  const folder = state.folders.folders[String(folderId)];
  if (!folder || !folder.deletedAt) return null;
  delete folder.deletedAt;
  folder.updatedAt = new Date().toISOString();
  persistFolders();
  return folder;
}

export function createFolder(workerId, name) {
  const id = normalizeWorkerId(workerId);
  const cleanName = String(name || '').trim().slice(0, 120);
  if (!cleanName) throw new Error('Folder name is required.');
  const duplicate = Object.values(state.folders.folders).find(
    (folder) => folder.workerId === id && !folder.deletedAt && folder.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (duplicate) return duplicate;
  const folderId = String(state.folders.nextId++);
  const now = new Date().toISOString();
  const folder = { id: folderId, workerId: id, name: cleanName, createdAt: now, updatedAt: now };
  state.folders.folders[folderId] = folder;
  persistFolders();
  return folder;
}

export function renameFolder(workerId, folderId, name) {
  const folder = getFolder(workerId, folderId);
  if (!folder) return null;
  const cleanName = String(name || '').trim().slice(0, 120);
  if (!cleanName) throw new Error('Folder name is required.');
  folder.name = cleanName;
  folder.updatedAt = new Date().toISOString();
  persistFolders();
  return folder;
}

// Deletes only the folder (and its links). moveToFolderId re-homes its saved
// companies into another folder; omitting it just unassigns them (folderId
// null = "saved, no folder"). Companies themselves are never touched.
// Soft delete: the folder is hidden from listFolders()/getFolder() but never
// physically removed, and (when no moveToFolderId is given) its companies
// keep their folderId untouched instead of being unassigned - so a later
// restoreFolder() puts everything back exactly as it was. Two workers
// reported a "Перезвонить" folder disappearing with no reproducible cause
// found in the delete path itself; this makes any future disappearance
// (accidental delete, misclick, or a cause not yet found) recoverable
// instead of permanent. moveToFolderId is a deliberate merge/reorganize
// action, not a "trash this" - that one still actually moves the links.
export function deleteFolder(workerId, folderId, { moveToFolderId = null } = {}) {
  const folder = getFolder(workerId, folderId);
  if (!folder) return null;
  const id = normalizeWorkerId(workerId);
  const targetFolderId = moveToFolderId ? String(moveToFolderId) : null;
  if (targetFolderId && !getFolder(id, targetFolderId)) throw new Error('Target folder not found.');

  let moved = 0;
  let unassigned = 0;
  if (targetFolderId) {
    for (const link of Object.values(state.saved.links)) {
      if (link.workerId !== id || link.folderId !== String(folderId)) continue;
      const conflict = Object.values(state.saved.links).some(
        (other) => other.id !== link.id && other.workerId === id && other.companyId === link.companyId && other.folderId === targetFolderId
      );
      if (conflict) {
        delete state.saved.links[link.id];
      } else {
        link.folderId = targetFolderId;
        moved += 1;
      }
    }
    persistSaved();
  } else {
    unassigned = Object.values(state.saved.links).filter(
      (link) => link.workerId === id && link.folderId === String(folderId)
    ).length;
  }
  folder.deletedAt = new Date().toISOString();
  persistFolders();
  return { deletedFolderId: String(folderId), moved, unassigned };
}

// =====================================================================
// SAVED COMPANIES (worker_saved_companies)
// =====================================================================

export function saveCompaniesForWorker(workerId, companyIds, folderId = null) {
  const id = normalizeWorkerId(workerId);
  const targetFolder = folderId ? String(folderId) : null;
  if (targetFolder && !getFolder(id, targetFolder)) throw new Error('Folder not found.');
  const saved = [];
  const alreadySaved = [];
  const now = new Date().toISOString();
  for (const companyId of companyIds || []) {
    const cid = String(companyId);
    if (!state.companies.companies[cid]) continue;
    const existing = Object.values(state.saved.links).find(
      (link) => link.workerId === id && link.companyId === cid && (link.folderId || null) === targetFolder
    );
    if (existing) {
      alreadySaved.push(cid);
      continue;
    }
    const linkId = String(state.saved.nextId++);
    state.saved.links[linkId] = { id: linkId, workerId: id, companyId: cid, folderId: targetFolder, createdAt: now };
    saved.push(cid);
  }
  if (saved.length) persistSaved();
  return { saved, alreadySaved };
}

export function removeCompaniesFromFolderForWorker(workerId, companyIds, folderId = null) {
  const id = normalizeWorkerId(workerId);
  const targetFolder = folderId ? String(folderId) : null;
  const idSet = new Set((companyIds || []).map(String));
  const removed = [];
  for (const [linkId, link] of Object.entries(state.saved.links)) {
    if (link.workerId !== id) continue;
    if ((link.folderId || null) !== targetFolder) continue;
    if (!idSet.has(link.companyId)) continue;
    delete state.saved.links[linkId];
    removed.push(link.companyId);
  }
  if (removed.length) persistSaved();
  return removed;
}

// Unsaves entirely: removes every folder link and the unfoldered "saved" link
// for this worker/company pair. Does not touch the company record itself.
export function unsaveCompaniesForWorker(workerId, companyIds) {
  const id = normalizeWorkerId(workerId);
  const idSet = new Set((companyIds || []).map(String));
  const removed = [];
  for (const [linkId, link] of Object.entries(state.saved.links)) {
    if (link.workerId !== id) continue;
    if (!idSet.has(link.companyId)) continue;
    delete state.saved.links[linkId];
    removed.push(link.companyId);
  }
  if (removed.length) persistSaved();
  return [...new Set(removed)];
}

export function moveCompaniesBetweenFolders(workerId, companyIds, fromFolderId, toFolderId) {
  const id = normalizeWorkerId(workerId);
  const from = fromFolderId ? String(fromFolderId) : null;
  const to = toFolderId ? String(toFolderId) : null;
  if (to && !getFolder(id, to)) throw new Error('Target folder not found.');
  const idSet = new Set((companyIds || []).map(String));
  const moved = [];
  for (const link of Object.values(state.saved.links)) {
    if (link.workerId !== id) continue;
    if ((link.folderId || null) !== from) continue;
    if (!idSet.has(link.companyId)) continue;
    const conflict = Object.values(state.saved.links).some(
      (other) => other.id !== link.id && other.workerId === id && other.companyId === link.companyId && (other.folderId || null) === to
    );
    if (conflict) continue;
    link.folderId = to;
    moved.push(link.companyId);
  }
  if (moved.length) persistSaved();
  return moved;
}

function listSavedLinksForCompany(companyId) {
  if (!companyId) return [];
  return Object.values(state.saved.links)
    .filter((link) => link.companyId === String(companyId))
    .map((link) => ({ linkId: link.id, workerId: link.workerId, folderId: link.folderId || null }));
}

export function isCompanySavedByWorker(workerId, companyId) {
  const id = normalizeWorkerId(workerId);
  const cid = String(companyId);
  return Object.values(state.saved.links).some((link) => link.workerId === id && link.companyId === cid);
}

export function listSavedCompaniesForWorker(
  workerId,
  { folderId = '', q = '', status = '', crmStatus = '', city = '', country = '', category = '', sort = 'newest', page = 1, pageSize = 50 } = {}
) {
  const id = normalizeWorkerId(workerId);
  // folderId: '' = any folder (all saved), 'none' = unfoldered only, else a specific folder id.
  const targetFolder = folderId === '' ? undefined : folderId === 'none' ? null : String(folderId);
  const query = normalizeSearchText(q);
  const normalizedCity = normalizeSearchText(city);
  const normalizedCountry = normalizeSearchText(country);
  const normalizedCategory = normalizeSearchText(category);

  let links = Object.values(state.saved.links).filter((link) => link.workerId === id);
  if (targetFolder !== undefined) links = links.filter((link) => (link.folderId || null) === targetFolder);

  // A company can live in multiple folders; collapse to one row with the full
  // folder-id list rather than one row per folder membership.
  const byCompany = new Map();
  for (const link of links) {
    if (!byCompany.has(link.companyId)) {
      byCompany.set(link.companyId, { companyId: link.companyId, createdAt: link.createdAt, folderIds: [] });
    }
    const entry = byCompany.get(link.companyId);
    if (link.folderId) entry.folderIds.push(link.folderId);
    if (link.createdAt < entry.createdAt) entry.createdAt = link.createdAt;
  }

  let rows = [...byCompany.values()]
    .map((entry) => {
      const record = state.companies.companies[entry.companyId];
      return record ? { entry, record: serializeCompany(record) } : null;
    })
    .filter(Boolean)
    .filter(({ record }) => !isDeletedRecord(record));

  if (status) rows = rows.filter(({ record }) => record.status === status);
  if (crmStatus) rows = rows.filter(({ record }) => record.crm_status === crmStatus);
  if (normalizedCity) rows = rows.filter(({ record }) => normalizeSearchText(record.data?.city || '').includes(normalizedCity));
  if (normalizedCountry) rows = rows.filter(({ record }) => normalizeSearchText(record.data?.country || '').includes(normalizedCountry));
  if (normalizedCategory) rows = rows.filter(({ record }) => normalizeSearchText(record.data?.niche || '').includes(normalizedCategory));
  if (query) {
    rows = rows.filter(({ record }) =>
      normalizeSearchText(
        [record.data?.company, record.data?.legal_name, record.data?.phone, record.data?.email, record.data?.city].join(' ')
      ).includes(query)
    );
  }

  const sortKey = String(sort || 'newest').toLowerCase();
  rows.sort((a, b) => {
    if (sortKey === 'name') return String(a.record.data?.company || '').localeCompare(String(b.record.data?.company || ''));
    if (sortKey === 'status') return String(a.record.crm_status || '').localeCompare(String(b.record.crm_status || ''));
    if (sortKey === 'oldest') return a.entry.createdAt.localeCompare(b.entry.createdAt);
    return b.entry.createdAt.localeCompare(a.entry.createdAt);
  });

  const total = rows.length;
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(200, Number(pageSize) || 50));
  const start = (safePage - 1) * safePageSize;
  const pageRows = rows.slice(start, start + safePageSize);

  return {
    total,
    page: safePage,
    pageSize: safePageSize,
    items: pageRows.map(({ entry, record }) => ({ ...record, saved_at: entry.createdAt, saved_folder_ids: entry.folderIds }))
  };
}

// =====================================================================
// COMMENTS (company_comments)
// =====================================================================

export function addComment(companyId, { authorId = '', authorRole = 'worker', text = '', source = '', parserQueryId = '' } = {}) {
  const cid = String(companyId);
  if (!state.companies.companies[cid]) return null;
  const cleanCommentText = String(text || '').trim().slice(0, 3000);
  if (!cleanCommentText) throw new Error('Comment text is required.');
  const id = String(state.comments.nextId++);
  const now = new Date().toISOString();
  const isAdmin = authorRole === 'admin';
  const comment = {
    id,
    companyId: cid,
    authorId: isAdmin ? String(authorId || 'admin').slice(0, 120) : normalizeWorkerId(authorId),
    authorRole: isAdmin ? 'admin' : 'worker',
    text: cleanCommentText,
    createdAt: now,
    updatedAt: now,
    archivedAt: '',
    source: String(source || '').slice(0, 60),
    parserQueryId: parserQueryId ? String(parserQueryId) : ''
  };
  state.comments.comments[id] = comment;
  persistComments();
  return comment;
}

export function editComment(commentId, { authorId = '', authorRole = 'worker', text = '' } = {}) {
  const comment = state.comments.comments[String(commentId)];
  if (!comment || comment.archivedAt) return null;
  if (authorRole !== 'admin') {
    const normalizedAuthor = normalizeWorkerId(authorId);
    if (comment.authorRole !== 'worker' || comment.authorId !== normalizedAuthor) {
      throw new Error('You can only edit your own comment.');
    }
  }
  const cleanCommentText = String(text || '').trim().slice(0, 3000);
  if (!cleanCommentText) throw new Error('Comment text is required.');
  comment.text = cleanCommentText;
  comment.updatedAt = new Date().toISOString();
  persistComments();
  return comment;
}

export function softDeleteComment(commentId, { authorId = '', authorRole = 'worker' } = {}) {
  const comment = state.comments.comments[String(commentId)];
  if (!comment || comment.archivedAt) return null;
  if (authorRole !== 'admin') {
    const normalizedAuthor = normalizeWorkerId(authorId);
    if (comment.authorRole !== 'worker' || comment.authorId !== normalizedAuthor) {
      throw new Error('You can only delete your own comment.');
    }
  }
  comment.archivedAt = new Date().toISOString();
  persistComments();
  return comment;
}

export function listComments(companyId, { includeArchived = false } = {}) {
  return Object.values(state.comments.comments)
    .filter((comment) => comment.companyId === String(companyId) && (includeArchived || !comment.archivedAt))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getLatestComment(companyId) {
  if (!companyId) return null;
  return listComments(companyId)[0] || null;
}

// =====================================================================
// POOL RETURN (pool_action_logs behaviour lives in logAdminAction)
// =====================================================================

// Returns a set of companies to the pool. Idempotent per-company: a company
// already available/unassigned is reported in alreadyInPool instead of being
// touched again, so calling this twice never double-logs or creates dupes.
// Comments, CRM status, folders and contact data are never modified here.
export function returnLeadsToPool(companyIds, { actorId = '', actorRole = 'worker', reason = '' } = {}) {
  const returned = [];
  const alreadyInPool = [];
  const skipped = [];
  const now = new Date().toISOString();
  for (const rawId of companyIds || []) {
    const id = String(rawId);
    const record = state.companies.companies[id];
    if (!record) {
      skipped.push({ id, reason: 'not_found' });
      continue;
    }
    if (isDeletedRecord(record)) {
      skipped.push({ id, reason: 'deleted' });
      continue;
    }
    const poolState = derivePoolState(record);
    if (['available', 'reset'].includes(poolState) && !record.assigned_worker_id) {
      alreadyInPool.push(id);
      continue;
    }
    const previousWorkerId = record.assigned_worker_id || '';
    record.status = 'new';
    record.pool_state = 'reset';
    record.stage = 'reset';
    record.assigned_worker_id = '';
    record.reserved_at = '';
    record.available_for_discovery = true;
    record.reset_at = now;
    record.previous_worker_id = previousWorkerId;
    record.returned_to_pool_at = now;
    record.returned_to_pool_by = actorId || '';
    // Visibility-only flag: hides the reset lead from list/query surfaces
    // (getAllCompanies/listLeadPool/paginateCompanyList) without affecting
    // reclaimability - claimCompanyForRun's isClaimable/isReclaimablePoolLead
    // logic keys off pool_state alone and never looks at this field.
    record.hidden_from_lists = true;
    record.hidden_from_lists_at = now;
    addStatusHistory(record, {
      status: 'new',
      workerId: previousWorkerId,
      note: reason || 'returned_to_pool',
      source: `${actorRole}_return_to_pool`,
      createdAt: now
    });
    returned.push(id);
  }
  if (returned.length) persistCompanies();
  return { returned, alreadyInPool, skipped };
}

// A. "Wroc query do puli" - returns the whole run + all of its leads, and
// archives the old run entry (history is kept, never deleted). Idempotent:
// calling twice on an already-returned run is a no-op that reports it.
export function returnRunToPool(runId, { actorId = '', actorRole = 'admin', reason = '' } = {}) {
  const run = getRun(String(runId));
  if (!run) return null;
  if (run.pool_status === 'returned_to_pool') {
    return { run, alreadyReturned: true, result: { returned: [], alreadyInPool: [], skipped: [] } };
  }
  const result = returnLeadsToPool(run.company_ids || [], { actorId, actorRole, reason: reason || 'run_returned_to_pool' });
  const now = new Date().toISOString();
  run.pool_status = 'returned_to_pool';
  run.previous_worker_id = run.worker_id || '';
  run.returned_to_pool_at = now;
  run.returned_to_pool_by = actorId || '';
  run.return_reason = reason || '';
  run.archived_at = run.archived_at || now;
  run.archived_by = run.archived_by || actorId || '';
  run.archived_reason = run.archived_reason || 'returned_to_pool';
  persistRuns();
  return { run, alreadyReturned: false, result };
}

// C. "Wroc wszystkie leady tego zapytania do puli" - frees the leads without
// forcing the query itself into the archived/returned bucket.
export function returnRunLeadsToPool(runId, { actorId = '', actorRole = 'admin', reason = '' } = {}) {
  const run = getRun(String(runId));
  if (!run) return null;
  const result = returnLeadsToPool(run.company_ids || [], { actorId, actorRole, reason: reason || 'run_leads_returned_to_pool' });
  return { run, result };
}

export function previewBulkReturn(filters = {}) {
  const runs = listRunsFiltered({ ...filters, view: filters.view || 'all', limit: 100000 });
  const companyIds = new Set();
  let newCount = 0;
  let duplicateCount = 0;
  const workerIds = new Set();
  for (const run of runs) {
    for (const id of run.company_ids || []) companyIds.add(String(id));
    newCount += Number(run.new_count || 0);
    duplicateCount += Number(run.duplicate_count || 0);
    if (run.worker_id) workerIds.add(run.worker_id);
  }
  return {
    matchedRunCount: runs.length,
    matchedCompanyCount: companyIds.size,
    newCount,
    duplicateCount,
    workerCount: workerIds.size,
    runs: runs.slice(0, 500)
  };
}

// Guards against an accidental return-everything: caller must supply either
// explicit runIds or at least one non-empty filter (enforced here, not just
// in the UI, since worker_id/filters must never be trusted blindly).
export function bulkReturnRunsToPool({ runIds = [], filters = null, actorId = '', actorRole = 'admin', reason = '' } = {}) {
  let targetRunIds = [...new Set((runIds || []).map(String).filter(Boolean))];
  if (!targetRunIds.length) {
    if (!filters) throw new Error('Provide runIds or filters.');
    const hasAnyFilter = ['country', 'city', 'category', 'workerId', 'status', 'source', 'dateFrom', 'dateTo', 'only'].some((key) =>
      String(filters[key] || '').trim()
    );
    if (!hasAnyFilter) throw new Error('Set at least one filter before a bulk return.');
    targetRunIds = listRunsFiltered({ ...filters, view: filters.view || 'all', limit: 100000 }).map((run) => String(run.id));
  }
  if (!targetRunIds.length) throw new Error('No history entries matched.');

  const companyIdSet = new Set();
  const touchedRuns = [];
  const now = new Date().toISOString();
  for (const runId of targetRunIds) {
    const run = getRun(runId);
    if (!run) continue;
    touchedRuns.push(run);
    if (run.pool_status !== 'returned_to_pool') {
      for (const id of run.company_ids || []) companyIdSet.add(String(id));
    }
  }

  const result = returnLeadsToPool([...companyIdSet], { actorId, actorRole, reason: reason || 'bulk_return_to_pool' });

  let alreadyReturnedRunCount = 0;
  for (const run of touchedRuns) {
    if (run.pool_status === 'returned_to_pool') {
      alreadyReturnedRunCount += 1;
      continue;
    }
    run.pool_status = 'returned_to_pool';
    run.previous_worker_id = run.worker_id || '';
    run.returned_to_pool_at = now;
    run.returned_to_pool_by = actorId || '';
    run.return_reason = reason || '';
    run.archived_at = run.archived_at || now;
    run.archived_by = run.archived_by || actorId || '';
    run.archived_reason = run.archived_reason || 'bulk_returned_to_pool';
  }
  if (touchedRuns.length) persistRuns();

  return {
    matchedRunCount: touchedRuns.length,
    alreadyReturnedRunCount,
    returnedRunCount: touchedRuns.length - alreadyReturnedRunCount,
    uniqueCompanyCount: companyIdSet.size,
    result
  };
}

// =====================================================================
// ARCHIVE / RESTORE (parser_query_archive)
// =====================================================================

export function archiveRun(runId, { actorId = '', reason = '' } = {}) {
  const run = getRun(String(runId));
  if (!run) return null;
  if (run.archived_at) return run;
  run.archived_at = new Date().toISOString();
  run.archived_by = actorId || '';
  run.archived_reason = reason || 'manual_archive';
  persistRuns();
  return run;
}

// Restoring only un-hides the history entry from the archive view; it never
// re-creates a pool assignment or re-assigns leads to a worker.
export function restoreRun(runId) {
  const run = getRun(String(runId));
  if (!run) return null;
  run.archived_at = '';
  run.archived_by = '';
  run.archived_reason = '';
  persistRuns();
  return run;
}

export function listArchivedRuns({ workerId = '', limit = 200 } = {}) {
  const normalizedWorkerId = workerId ? normalizeWorkerId(workerId) : '';
  return state.runs.runs
    .filter((run) => Boolean(run.archived_at) && (!normalizedWorkerId || normalizeWorkerId(run.worker_id || '') === normalizedWorkerId))
    .slice(0, limit);
}

// =====================================================================
// FILTER AUTOCOMPLETE ("facets") - distinct known values across the FULL
// history (every run ever recorded, active or archived, plus every company
// ever seen), never just the currently-loaded/paginated slice. This is what
// powers the admin's "suggest as you type" filter inputs, so a worker id,
// city, country or category typed anywhere in history is always findable.
// =====================================================================

function collectDistinct(values, query, limit) {
  const q = normalizeSearchText(query);
  const seen = new Map();
  for (const raw of values) {
    const value = String(raw || '').trim();
    if (!value) continue;
    const key = normalizeSearchText(value);
    if (!key) continue;
    if (q && !key.includes(q)) continue;
    if (!seen.has(key)) seen.set(key, value);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b)).slice(0, limit);
}

export function getFilterFacets({ field = '', q = '', limit = 20 } = {}) {
  const cappedLimit = Math.max(1, Math.min(50, Number(limit) || 20));
  if (field === 'city') {
    const cities = [...state.runs.runs.map((run) => run.city), ...Object.values(state.companies.companies).map((record) => record.data?.city)];
    return collectDistinct(cities, q, cappedLimit);
  }
  if (field === 'country') {
    const countries = [
      ...state.runs.runs.map((run) => run.country),
      ...Object.values(state.companies.companies).map((record) => record.data?.country)
    ];
    return collectDistinct(countries, q, cappedLimit);
  }
  if (field === 'category') {
    const categories = [
      ...state.runs.runs.flatMap((run) => run.niches || []),
      ...Object.values(state.companies.companies).map((record) => record.data?.niche)
    ];
    return collectDistinct(categories, q, cappedLimit);
  }
  if (field === 'workerId') {
    const workers = [
      ...state.runs.runs.map((run) => run.worker_id),
      ...Object.values(state.workers.workers).map((account) => account.workerId),
      ...Object.values(state.companies.companies).map((record) => record.assigned_worker_id || record.first_assigned_worker_id)
    ];
    return collectDistinct(workers, q, cappedLimit);
  }
  return [];
}
