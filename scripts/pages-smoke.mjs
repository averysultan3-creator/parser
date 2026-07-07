const PAGES_URL = process.env.PARSER_PAGES_URL || 'https://parser.auraglobal-merchants.com';
const PAGES_ORIGIN = new URL(PAGES_URL).origin;

try {
  const indexHtml = await fetchText(`${PAGES_URL}/index.html`);
  assert(indexHtml.includes('patch.js?v='), 'Pages HTML must load patch.js');
  assert(indexHtml.includes('app.js?v='), 'Pages HTML must load app.js');
  assert(indexHtml.indexOf('patch.js?v=') < indexHtml.indexOf('app.js?v='), 'patch.js must load before app.js');

  const backend = await resolveBackend();
  assert(backend, 'public page must expose a backend');

  const health = await fetchJson(`${backend}/api/health`);
  assert(health.ok === true, 'backend health must return ok=true');

  const corsHeaders = await fetchHeaders(`${backend}/api/health`, {
    Origin: PAGES_ORIGIN
  });
  assert(corsHeaders['access-control-allow-origin'] === PAGES_ORIGIN, 'backend must allow Pages origin');

  const preflight = await fetchHeaders(`${backend}/api/discover`, {
    Origin: PAGES_ORIGIN,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
  }, 'OPTIONS');
  assert(preflight['access-control-allow-origin'] === PAGES_ORIGIN, 'preflight must allow Pages origin');
  assert(preflight['access-control-allow-methods']?.includes('POST'), 'preflight must allow POST');

  console.log(
    `Pages smoke OK: index.html + patch.js + app.js | backend ${backend} | health ok (${health.timestamp})`
  );
} catch (error) {
  console.error(`Pages smoke FAILED: ${error.message || error}`);
  process.exitCode = 1;
}

async function resolveBackend() {
  try {
    const sameOriginHealth = await fetchJson(`${PAGES_URL}/api/health`);
    if (sameOriginHealth.ok) return normalizeBase(PAGES_URL);
  } catch {}

  const tunnelJson = await fetchJson(`${PAGES_URL}/tunnel.json`);
  return normalizeBase(tunnelJson.api || tunnelJson.url);
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${url} failed: ${data.error || response.status}`);
  return data;
}

async function fetchHeaders(url, headers = {}, method = 'GET') {
  const response = await fetch(url, { method, headers });
  return Object.fromEntries(response.headers.entries());
}

function normalizeBase(value) {
  if (!value) return '';
  let cleaned = String(value).trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
  return cleaned;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
