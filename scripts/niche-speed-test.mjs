import 'dotenv/config';

// Ad-hoc verification run (not part of the smoke suite) requested directly by
// the user: how fast does a standard (non-ChatGPT) search load results across
// a spread of niches/cities, does it respect the requested limit, and are
// results actually relevant to the requested niche/city. Scoped small (7
// niches x 2 cities, limit 10 each) on purpose - every discovered company
// automatically triggers a real OpenAI call (the auto-pitch analysis), and
// the account has already hit its spending cap twice this session.
const BASE_URL = `http://127.0.0.1:${process.env.PORT || 4317}`;
if (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD) {
  throw new Error('Set ADMIN_LOGIN and ADMIN_PASSWORD in the environment before running this script.');
}
const ADMIN_AUTH = `Basic ${Buffer.from(`${process.env.ADMIN_LOGIN}:${process.env.ADMIN_PASSWORD}`).toString('base64')}`;
const TEST_WORKER = `qa-speed-${Date.now()}`;
const LIMIT = 10;

const NICHES = [
  'Klimatyzacja',
  'Kliniki medyczne',
  'Kliniki stomatologiczne',
  'Kancelarie prawne',
  'Sprzedaż maszyn budowlanych',
  'Restauracje fine dining',
  'Biura architektoniczne'
];
const CITIES = ['Warszawa', 'Dnipro'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  throw new Error(`network error calling ${options?.method || 'GET'} ${path}: ${lastError?.message || lastError}`);
}

async function getJson(path, extraHeaders = {}) {
  const response = await fetchWithRetry(path, { headers: { authorization: ADMIN_AUTH, ...extraHeaders } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path} failed: ${data.error || response.status}`);
  return data;
}

async function postJson(path, body) {
  const response = await fetchWithRetry(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: ADMIN_AUTH },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path} failed: ${data.error || response.status}`);
  return data;
}

async function runOne(niche, city) {
  const t0 = Date.now();
  const start = await postJson('/api/discover', {
    niche,
    niches: [niche],
    city,
    limit: LIMIT,
    sourceFocus: 'all_sources',
    workerId: TEST_WORKER
  });
  if (!start.jobId) throw new Error('no jobId returned');

  let firstResultMs = null;
  let lastJob = null;
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    const job = await getJson(`/api/discover/jobs/${start.jobId}`, { 'x-worker-id': TEST_WORKER });
    lastJob = job;
    if (firstResultMs === null && Array.isArray(job.companies) && job.companies.length > 0) {
      firstResultMs = Date.now() - t0;
    }
    if (job.status === 'completed' || job.status === 'failed') break;
    await sleep(1000);
  }

  const totalMs = Date.now() - t0;
  const companies = Array.isArray(lastJob?.companies) ? lastJob.companies : [];
  const meta = lastJob?.result?.meta || {};
  const offNiche = companies.filter((c) => {
    const gotNiche = String(c.input?.category_id || c.input?.niche || '').toLowerCase();
    return gotNiche && meta.categories && !meta.categories.some((wanted) => gotNiche.includes(String(wanted).toLowerCase().slice(0, 5)));
  }).length;

  return {
    niche,
    city,
    status: lastJob?.status || 'timeout',
    firstResultMs,
    totalMs,
    found: companies.length,
    newCount: meta.newCount ?? '?',
    duplicateCount: meta.duplicateCount ?? '?',
    requestedLimit: LIMIT,
    overLimit: companies.length > LIMIT,
    runId: lastJob?.runId || '',
    sampleCompanies: companies.slice(0, 3).map((c) => ({
      company: c.input?.company || '',
      niche: c.input?.niche || '',
      city: c.input?.city || '',
      website: c.input?.website_url || ''
    }))
  };
}

const results = [];
for (const niche of NICHES) {
  for (const city of CITIES) {
    process.stdout.write(`Running: ${niche} / ${city} ...\n`);
    try {
      const r = await runOne(niche, city);
      results.push(r);
      process.stdout.write(
        `  -> status=${r.status} first=${r.firstResultMs}ms total=${r.totalMs}ms found=${r.found}/${r.requestedLimit} new=${r.newCount} dup=${r.duplicateCount}\n`
      );
    } catch (error) {
      results.push({ niche, city, error: error.message });
      process.stdout.write(`  -> ERROR: ${error.message}\n`);
    }
  }
}

console.log('\n=== SUMMARY ===');
console.table(
  results.map((r) => ({
    niche: r.niche,
    city: r.city,
    status: r.status || 'error',
    first_ms: r.firstResultMs ?? '-',
    total_ms: r.totalMs ?? '-',
    found: r.found ?? '-',
    new: r.newCount ?? '-',
    dup: r.duplicateCount ?? '-',
    overLimit: r.overLimit ?? '-'
  }))
);

console.log('\n=== SAMPLE COMPANIES (first 3 per run) ===');
for (const r of results) {
  if (!r.sampleCompanies?.length) continue;
  console.log(`\n${r.niche} / ${r.city}:`);
  for (const c of r.sampleCompanies) {
    console.log(`  - ${c.company || '(no name)'} | niche=${c.niche} | city=${c.city} | site=${c.website || '-'}`);
  }
}

console.log(`\nTest worker id: ${TEST_WORKER}`);
console.log('Done.');
