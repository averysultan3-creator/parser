import 'dotenv/config';
import { spawn } from 'node:child_process';

const cliBaseArgIndex = process.argv.indexOf('--base');
const cliBaseArg = cliBaseArgIndex >= 0 ? process.argv[cliBaseArgIndex + 1] : '';
// Falls back to the same PORT server.js itself resolves to (process.env.PORT,
// same as this repo's .env), not a hardcoded 4317 - on a machine that also
// runs a live pm2 instance of this app on 4317 (this repo's .env even ships
// PORT=4317 by default), a hardcoded fallback here means an unqualified
// `npm run smoke` silently fires real discovery calls at the LIVE production
// server the moment it's already healthy, instead of the disposable local
// instance the smoke suite is meant to exercise. Only 4317 remains as the
// last-resort default when nothing else is configured at all.
const BASE_URL = normalizeBaseUrl(cliBaseArg || process.env.PARSER_BASE_URL || `http://127.0.0.1:${process.env.PORT || 4317}`);
const SHOULD_BOOT = process.argv.includes('--boot');
const ADMIN_AUTH = `Basic ${Buffer.from(`${process.env.ADMIN_LOGIN || 'admin'}:${process.env.ADMIN_PASSWORD || 'Parol159'}`).toString('base64')}`;

let child = null;

try {
  const alreadyHealthy = await isHealthy();

  if (SHOULD_BOOT && !alreadyHealthy) {
    child = spawn(process.execPath, ['server.js'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      windowsHide: true
    });
  }

  await waitForHealth();
  const config = await getJson('/api/config');
  const health = await getJson('/api/health');
  assert(health.ok === true, 'Health endpoint must return ok=true');

  const results = [];
  results.push(`health ok (${health.timestamp})`);
  await assertAdminAuth();
  const smokeWorkerA = `smoke-a-${Date.now()}`;
  const smokeWorkerB = `smoke-b-${Date.now()}`;

  if (config.registry?.googlePlacesConfigured) {
    const mapsStart = await postJson('/api/discover', {
      niche: 'Klimatyzacja',
      niches: ['Klimatyzacja'],
      city: 'Warszawa',
      limit: 3,
      sourceFocus: 'maps_api',
      workerId: smokeWorkerA
    });
    const mapsRun = await waitForDiscoveryJob(mapsStart.jobId, smokeWorkerA);
    const mapsCount = (mapsRun?.companies || []).length;
    const mapsDuplicates = Number(mapsRun?.result?.meta?.duplicateCount || 0);
    assert(
      mapsCount > 0 || mapsDuplicates > 0,
      'maps_api discovery must return companies or explain that all results were duplicates'
    );
    assert(mapsRun?.runId, 'maps_api discovery must expose runId for history');
    const mapsHistoryRun = await getJson(`/api/history/runs/${mapsRun.runId}`);
    assert(Array.isArray(mapsHistoryRun?.companies), 'history run payload must include companies');
    assert(
      (mapsHistoryRun?.companies || []).length > 0 || mapsDuplicates > 0,
      'history run must contain saved companies unless the entire result set was duplicate-only'
    );
    const firstIds = new Set((mapsRun?.companies || []).map((company) => company._companyId).filter(Boolean));

    const repeatedStart = await postJson('/api/discover', {
      niche: 'Klimatyzacja',
      niches: ['Klimatyzacja'],
      city: 'Warszawa',
      limit: 3,
      sourceFocus: 'maps_api',
      workerId: smokeWorkerA
    });
    const repeatedRun = await waitForDiscoveryJob(repeatedStart.jobId, smokeWorkerA);
    const repeatedIds = new Set((repeatedRun?.companies || []).map((company) => company._companyId).filter(Boolean));
    const repeatedOverlap = [...firstIds].filter((id) => repeatedIds.has(id));
    assert(repeatedOverlap.length === 0, 'same worker rerun must not receive the same companies as new results');
    results.push(`same_worker_dedupe ok (${repeatedRun?.companies?.length || 0} new / ${Number(repeatedRun?.result?.meta?.duplicateCount || 0)} duplicate)`);

    const duplicateStart = await postJson('/api/discover', {
      niche: 'Klimatyzacja',
      niches: ['Klimatyzacja'],
      city: 'Warszawa',
      limit: 3,
      sourceFocus: 'maps_api',
      workerId: smokeWorkerB
    });
    const duplicateRun = await waitForDiscoveryJob(duplicateStart.jobId, smokeWorkerB);
    const duplicateOverlap = (duplicateRun?.companies || []).filter((company) => firstIds.has(company._companyId));
    assert(duplicateOverlap.length === 0, 'global lead pool must not return the same company ids to another worker');
    results.push(`maps_api ok (${mapsCount} new / ${mapsDuplicates} duplicate)`);
  } else {
    results.push('maps_api skipped (GOOGLE_PLACES_API_KEY missing)');
  }

  if (
    config.registry?.googlePlacesConfigured ||
    config.registry?.amazonLocationConfigured ||
    config.registry?.ceidgConfigured ||
    config.internetSearchConfigured
  ) {
    const allSourcesStart = await postJson('/api/discover', {
      niche: 'Klimatyzacja',
      niches: ['Klimatyzacja'],
      city: 'Warszawa',
      limit: 3,
      sourceFocus: 'all_sources',
      workerId: smokeWorkerA
    });
    const allSourcesRun = await waitForDiscoveryJob(allSourcesStart.jobId, smokeWorkerA);
    assert(allSourcesRun?.meta?.sourceFocus === 'all_sources', 'all_sources meta.sourceFocus must stay all_sources');
    assert(Array.isArray(allSourcesRun?.companies), 'all_sources must return a companies array');
    assert((allSourcesRun?.companies || []).length <= 3, 'all_sources must respect limit');
    assert(allSourcesRun?.runId, 'all_sources discovery must expose runId for history');
    const allSourcesHistoryRun = await getJson(`/api/history/runs/${allSourcesRun.runId}`);
    assert(allSourcesHistoryRun?.run?.sourceFocus === 'all_sources', 'history run sourceFocus must stay all_sources');
    assert(Array.isArray(allSourcesHistoryRun?.companies), 'all_sources history payload must include companies');
    const allSourcesCount = (allSourcesRun?.companies || []).length;
    const allSourcesDuplicates = Number(allSourcesRun?.result?.meta?.duplicateCount || 0);
    const allSourcesSearchStatus = allSourcesRun?.result?.meta?.searchStatus || 'completed';
    assert(
      allSourcesCount > 0 || (allSourcesDuplicates > 0 && ['exhausted', 'duplicates_only'].includes(allSourcesSearchStatus)),
      'all_sources must either return new companies or finish as exhausted/duplicates_only after skipping duplicates'
    );
    results.push(`all_sources ok (${allSourcesCount} new / ${allSourcesDuplicates} duplicate / ${allSourcesSearchStatus})`);
  } else {
    results.push('all_sources skipped (no discovery sources configured)');
  }

  const history = await getJson('/api/history/runs');
  assert(Array.isArray(history?.runs), 'history list must return runs array');
  assert(history.runs.length > 0, 'history list must not be empty after smoke discovery');
  console.log(`Smoke OK: ${results.join(' | ')} | history ok (${history.runs.length})`);
} catch (error) {
  console.error(`Smoke FAILED: ${error.message || error}`);
  process.exitCode = 1;
} finally {
  if (child && !child.killed) {
    child.kill('SIGTERM');
  }
}

async function waitForHealth() {
  const deadline = Date.now() + 30_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(750);
  }
  throw new Error(`Server did not become healthy on ${BASE_URL}: ${lastError?.message || 'unknown error'}`);
}

async function isHealthy() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Local requests can occasionally hit a transient network error (e.g. a
// dropped keep-alive socket on Windows loopback after many rapid polls)
// that has nothing to do with the server or the discovery logic. A bare
// `fetch failed` with no context used to abort the whole smoke run on a
// single blip. Retry a few times on network-level failures only (not on
// HTTP error responses, which are real API errors and should fail fast)
// and always report which path/method actually failed.
async function fetchWithRetry(path, options, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(`${BASE_URL}${path}`, options);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(500 * attempt);
    }
  }
  throw new Error(
    `network error calling ${options?.method || 'GET'} ${path} after ${attempts} attempts: ${lastError?.message || lastError} (base=${BASE_URL})`
  );
}

async function getJson(path, extraHeaders = {}) {
  const response = await fetchWithRetry(path, {
    headers: { ...adminHeaders(path), ...extraHeaders }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed: ${data.error || response.status}`);
  }
  return data;
}

async function postJson(path, body) {
  const response = await fetchWithRetry(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...adminHeaders(path) },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed: ${data.error || response.status}`);
  }
  return data;
}

async function deleteJson(path, body) {
  const response = await fetchWithRetry(path, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', ...adminHeaders(path) },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed: ${data.error || response.status}`);
  }
  return data;
}

function adminHeaders(path) {
  // /api/discover (and the AI analysis endpoint) now require an authenticated
  // caller - anonymous requests used to be able to trigger paid API calls and
  // assign the results to an arbitrary worker id. The smoke test authenticates
  // as admin for these too.
  return path.startsWith('/api/admin') || path.startsWith('/api/companies')
    || path.startsWith('/api/history')
    || path.startsWith('/api/discover')
    || path.startsWith('/api/ai/site-analysis')
    ? { authorization: ADMIN_AUTH }
    : {};
}

async function assertAdminAuth() {
  const blocked = await fetchWithRetry('/api/admin/workers', {});
  assert(blocked.status === 401, 'admin API must reject requests without authorization');
  const allowed = await fetchWithRetry('/api/admin/workers', {
    headers: { authorization: ADMIN_AUTH }
  });
  assert(allowed.ok, 'admin API must accept valid admin authorization');
}

async function waitForDiscoveryJob(jobId, workerId = '') {
  assert(jobId, 'discover must return a jobId');
  // Without external API keys discovery falls back to slow public-search scraping,
  // which regularly takes longer than 60s while still completing successfully.
  const jobTimeoutMs = Number(process.env.SMOKE_JOB_TIMEOUT_MS) || 240_000;
  const deadline = Date.now() + jobTimeoutMs;
  let lastStatus = 'queued';
  while (Date.now() < deadline) {
    const job = await getJson(
      `/api/discover/jobs/${jobId}`,
      workerId ? { 'x-worker-id': workerId } : {}
    );
    lastStatus = job.status;
    if (job.status === 'completed') return job;
    if (job.status === 'failed') {
      throw new Error(`discovery job ${jobId} failed: ${job.error || 'unknown error'}`);
    }
    await sleep(1_000);
  }
  throw new Error(`discovery job ${jobId} timed out in status ${lastStatus}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBaseUrl(value) {
  return String(value || 'http://127.0.0.1:4317').replace('://localhost', '://127.0.0.1').replace(/\/$/, '');
}
