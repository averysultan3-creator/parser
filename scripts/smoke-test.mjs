import { spawn } from 'node:child_process';

const BASE_URL = process.env.PARSER_BASE_URL || 'http://localhost:4317';
const SHOULD_BOOT = process.argv.includes('--boot');

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

  if (config.registry?.googlePlacesConfigured) {
    const mapsStart = await postJson('/api/discover', {
      niche: 'Klimatyzacja',
      niches: ['Klimatyzacja'],
      city: 'Warszawa',
      limit: 3,
      sourceFocus: 'maps_api'
    });
    const mapsRun = await waitForDiscoveryJob(mapsStart.jobId);
    assert((mapsRun?.companies || []).length > 0, 'maps_api discovery must return at least one company');
    assert(mapsRun?.runId, 'maps_api discovery must expose runId for history');
    const mapsHistoryRun = await getJson(`/api/history/runs/${mapsRun.runId}`);
    assert(Array.isArray(mapsHistoryRun?.companies), 'history run payload must include companies');
    assert((mapsHistoryRun?.companies || []).length > 0, 'history run must contain saved companies');
    results.push(`maps_api ok (${mapsRun.companies.length})`);
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
      sourceFocus: 'all_sources'
    });
    const allSourcesRun = await waitForDiscoveryJob(allSourcesStart.jobId);
    assert(allSourcesRun?.meta?.sourceFocus === 'all_sources', 'all_sources meta.sourceFocus must stay all_sources');
    assert(Array.isArray(allSourcesRun?.companies), 'all_sources must return a companies array');
    assert((allSourcesRun?.companies || []).length <= 3, 'all_sources must respect limit');
    assert(allSourcesRun?.runId, 'all_sources discovery must expose runId for history');
    const allSourcesHistoryRun = await getJson(`/api/history/runs/${allSourcesRun.runId}`);
    assert(allSourcesHistoryRun?.run?.sourceFocus === 'all_sources', 'history run sourceFocus must stay all_sources');
    assert(Array.isArray(allSourcesHistoryRun?.companies), 'all_sources history payload must include companies');
    if (config.registry?.googlePlacesConfigured) {
      assert((allSourcesRun?.companies || []).length > 0, 'all_sources must return companies when Google Places is configured');
    }
    results.push(`all_sources ok (${allSourcesRun.companies.length})`);
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

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed: ${data.error || response.status}`);
  }
  return data;
}

async function postJson(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed: ${data.error || response.status}`);
  }
  return data;
}

async function waitForDiscoveryJob(jobId) {
  assert(jobId, 'discover must return a jobId');
  const deadline = Date.now() + 60_000;
  let lastStatus = 'queued';
  while (Date.now() < deadline) {
    const job = await getJson(`/api/discover/jobs/${jobId}`);
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
