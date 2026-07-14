import 'dotenv/config';
import { chromium } from 'playwright';
import { getPortfolioProjects } from '../public/site/data/portfolio.js';

const baseUrl = normalizeBaseUrl(process.argv[2] || 'http://127.0.0.1:4317');
const timeoutMs = Number(process.env.USABILITY_TIMEOUT_MS || 180000);
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Parol159';
const TEST_WORKER_LOGIN = 'ux-test-worker';
const TEST_WORKER_PASSWORD = 'ux-test-password-1';

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function short(text, max = 220) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function ensureTestWorker(request) {
  const basicAuth = `Basic ${Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}`).toString('base64')}`;
  const response = await request.post(`${baseUrl.replace(/\/$/, '')}/api/admin/workers`, {
    headers: { authorization: basicAuth, 'content-type': 'application/json' },
    data: {
      displayName: 'UX Test Worker',
      login: TEST_WORKER_LOGIN,
      password: TEST_WORKER_PASSWORD,
      language: 'pl',
      active: true
    }
  });
  if (response.ok()) return;
  const body = await response.json().catch(() => ({}));
  if (!/already exists/i.test(body.error || '')) {
    throw new Error(`Failed to provision test worker: ${body.error || response.status()}`);
  }
}

async function loginAs(page, login, password) {
  await page.fill('#loginForm input[name="login"]', login);
  await page.fill('#loginForm input[name="password"]', password);
  await page.click('#loginForm button[type="submit"]');
  await page.waitForSelector('#appShell:not(.hidden-field)', { state: 'visible', timeout: timeoutMs });
}

async function waitForCount(page, selector, timeout = timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      return count;
    }
    await page.waitForTimeout(1000);
  }
  return 0;
}

async function waitForParserOutcome(page, timeout = timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const rowCount = await page.locator('#resultsTable tbody tr').count().catch(() => 0);
    if (rowCount > 0) return { rowCount, statusText: '' };

    const statusText = await page.evaluate(() => {
      const body = document.body?.innerText || '';
      return body.replace(/\s+/g, ' ').trim();
    });

    if (
      /duplik|Znaleziono firmy|Rezultatow brak|Brak wynikow|Wyszukiwanie trwa|Szukam firm/i.test(statusText)
    ) {
      return { rowCount: 0, statusText: short(statusText, 500) };
    }

    await page.waitForTimeout(1000);
  }

  return {
    rowCount: await page.locator('#resultsTable tbody tr').count().catch(() => 0),
    statusText: short(await page.evaluate(() => document.body?.innerText || ''), 500)
  };
}

async function getText(page, selector) {
  try {
    return short(await page.locator(selector).first().textContent());
  } catch {
    return '';
  }
}

async function count(page, selector) {
  try {
    return await page.locator(selector).count();
  } catch {
    return 0;
  }
}

async function setControlValue(page, selector, value) {
  const element = page.locator(selector);
  const tagName = await element.evaluate((node) => node.tagName.toLowerCase());
  if (tagName === 'select') {
    await page.selectOption(selector, value);
    return;
  }
  await element.fill(value);
  await element.dispatchEvent('input');
  await element.dispatchEvent('change');
}

async function runParser(page, summary) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluate(() => localStorage.setItem('parserLanguage', 'pl'));
  await page.reload({ waitUntil: 'networkidle', timeout: 120000 });

  summary.loginShown = await count(page, '#loginForm');
  assert(summary.loginShown > 0, 'Parser must show a login form for an unauthenticated visitor.');
  await loginAs(page, TEST_WORKER_LOGIN, TEST_WORKER_PASSWORD);

  summary.title = await getText(page, 'h1');
  summary.hasAcademyButton = await count(page, 'a[href*="/academy/"]:visible');
  summary.hasAdminButton = await count(page, 'a[href*="/admin/"]:visible');
  assert(summary.hasAdminButton === 0, 'Worker must not see the Admin link on the Parser page.');
  summary.runButtonText = await getText(page, '#discoverButton');

  const presetOptions = await page
    .locator('#discoverCategoryPreset option')
    .evaluateAll((list) => list.map((o) => ({ value: o.value, text: (o.textContent || '').trim() })));
  const klimOption = presetOptions.find((o) => /Klimatyzacja/i.test(o.text));
  summary.categoryOptionCount = presetOptions.length;
  if (klimOption) {
    await page.selectOption('#discoverCategoryPreset', klimOption.value);
  }

  await page.selectOption('#discoverCountry', '');
  await setControlValue(page, '#discoverCity', 'Warszawa');
  await page.selectOption('#discoverLimit', '50');
  await page.selectOption('#discoverSource', 'all_sources');
  await page.click('#discoverButton');

  const parserOutcome = await waitForParserOutcome(page, timeoutMs);
  summary.resultRowCount = parserOutcome.rowCount;
  summary.statusAfterRun = parserOutcome.statusText;
  summary.historyHintCount = await count(page, '#historyTable tbody tr');
  summary.urlAfterRun = page.url();
  summary.searchMessage = short(
    await page.evaluate(() => {
      const body = document.body?.innerText || '';
      return body.slice(0, 2500);
    }),
    500
  );

  if (summary.resultRowCount > 0) {
    const firstRow = page.locator('#resultsTable tbody tr').first();
    summary.firstResultRow = short(await firstRow.textContent());
    await firstRow.click();
    await page.waitForTimeout(2500);
    summary.detailTitle = await getText(page, '.detail-panel h2');
    summary.detailVisible = await count(page, '.detail-panel');
    summary.detailButtons = await page
      .locator('.detail-panel button')
      .evaluateAll((list) =>
        list
          .map((n) => String(n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80))
          .filter(Boolean)
          .slice(0, 12)
      );
  }

  const historyTabs = page.locator('button, [role="tab"], a').filter({ hasText: 'Historia' });
  if ((await historyTabs.count()) > 0) {
    await historyTabs.first().click();
    await page.waitForTimeout(2500);
    summary.historyRowsAfterOpen = await count(page, '#historyTable tbody tr');
  }
}

// AI training is gated behind 40% of "training" + 30% of "scripts and
// examples" progress. A fresh test worker starts at 0%, so seed just enough
// completed modules / opened scripts via the real progress API (same one the
// UI itself calls) instead of clicking through the whole learning path.
async function seedAcademyProgressForAiTrainingGate(page) {
  // 25 of the 67 total scripts+examples clears the 30% threshold with margin
  // (25/67 ≈ 37%) rather than sitting right at the rounding edge.
  const scriptIds = [
    'first-call', 'client-busy', 'not-interested', 'already-has-website', 'send-offer',
    'asks-price-immediately', 'asks-where-number-from', 'already-has-agency', 'irritated-client',
    'asks-callback', 'how-to-book-meeting', 'how-to-end-call', 'need-to-think-about-it',
    'too-expensive', 'need-partner-approval', 'comparing-offers', 'wants-to-diy',
    'distrust-scam-call', 'talking-to-gatekeeper', 'pivot-to-broader-proposal',
    'upsell-existing-client', 'inbound-warm-lead', 'asks-for-references', 'leaving-voicemail',
    'closing-hesitant-client'
  ];
  await page.request.post(`${baseUrl.replace(/\/$/, '')}/api/academy/progress`, {
    data: { completedModules: ['start', 'services', 'call-logic', 'scripts', 'objections'], scriptsOpened: scriptIds }
  });
}

async function runAcademy(page, summary) {
  await seedAcademyProgressForAiTrainingGate(page);
  await page.goto(`${baseUrl.replace(/\/$/, '')}/academy/`, { waitUntil: 'networkidle', timeout: 120000 });

  // The session token set while logging into Parser lives in the same-origin
  // localStorage, so Academy should already be authenticated - no second login.
  summary.loginShownOnReturn = await count(page, '#loginForm');
  assert(summary.loginShownOnReturn === 0, 'Academy must reuse the Parser session, not prompt to log in again.');

  summary.title = await getText(page, 'h1');
  summary.hasParserLink = await count(page, '#academyParserLink, a[href="../"], a[href="/"]');
  summary.hasAdminLink = await count(page, 'a[href*="/admin/"]:visible');
  assert(summary.hasAdminLink === 0, 'Worker must not see the Admin link in Academy.');
  summary.moduleButtons = await count(page, '.module-button');
  await page.click('[data-academy-view="servicesCatalog"]');
  await page.waitForTimeout(1200);
  summary.serviceCards = await count(page, '[data-open-service]');
  assert(summary.serviceCards > 0, 'Academy services catalog must load service cards.');
  await page.click('[data-academy-view="aiTraining"]');
  await page.waitForTimeout(1200);
  summary.aiTrainingCards = await count(page, '[data-start-training]');
  assert(summary.aiTrainingCards > 0, 'Academy AI training picker must render personas.');
  await page.click('[data-start-training="busy_owner"]');
  await page.waitForSelector('#aiTrainingForm', { state: 'visible', timeout: timeoutMs });
  await page.fill('#aiTrainingInput', 'Dzien dobry, krotko sprawdzam czy moge zadac jedno pytanie o to, jak teraz wpadaja do Panstwa zapytania.');
  await page.click('#aiTrainingForm button[type="submit"]');
  await page.waitForTimeout(4500);
  summary.aiTrainingMessages = await count(page, '.chat-bubble');
  assert(summary.aiTrainingMessages >= 3, 'Academy AI training must accept a worker message and return a client reply.');
  summary.completeButtons = await page
    .locator('button')
    .evaluateAll((list) =>
      list
        .map((n) => String(n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80))
        .filter((text) => /ukon|oznacz|complete/i.test(text))
        .slice(0, 8)
    );
}

async function runAdmin(page, summary) {
  // The browser still carries the worker session (cookie + localStorage token)
  // from runParser/runAcademy at this point. Manually visiting /admin as a
  // worker must be denied - the server-side static guard should intercept the
  // request before the admin SPA even loads (self-hosted defense-in-depth).
  await page.goto(`${baseUrl.replace(/\/$/, '')}/admin/`, { waitUntil: 'networkidle', timeout: 120000 });
  summary.workerSeesAccessDenied = await count(page, 'h1:has-text("Access denied")');
  summary.workerSeesAdminLoginForm = await count(page, '#adminLoginForm');
  assert(summary.workerSeesAccessDenied > 0, 'A logged-in worker opening /admin must see Access denied, not the login form or dashboard.');
  assert(summary.workerSeesAdminLoginForm === 0, 'A logged-in worker opening /admin must not be offered the admin login form.');

  await page.evaluate(() => localStorage.removeItem('auraSessionToken'));
  await page.context().clearCookies();
  await page.goto(`${baseUrl.replace(/\/$/, '')}/admin/`, { waitUntil: 'networkidle', timeout: 120000 });
  summary.loginShown = await count(page, '#adminLoginForm');
  if (summary.loginShown > 0) {
    await page.fill('#adminLoginForm input[name="login"]', ADMIN_LOGIN);
    await page.fill('#adminLoginForm input[name="password"]', ADMIN_PASSWORD);
    await page.click('#adminLoginForm button[type="submit"]');
    await page.waitForTimeout(2500);
  }
  await page.goto(`${baseUrl.replace(/\/$/, '')}/admin/`, { waitUntil: 'networkidle', timeout: 120000 });
  if ((await count(page, '#adminLoginForm')) > 0) {
    await page.fill('#adminLoginForm input[name="login"]', ADMIN_LOGIN);
    await page.fill('#adminLoginForm input[name="password"]', ADMIN_PASSWORD);
    await page.click('#adminLoginForm button[type="submit"]');
    await page.waitForTimeout(2500);
  }
  summary.title = await getText(page, 'h1');
  summary.workerButtons = await count(page, '[data-open-worker]');
  summary.topButtons = await page
    .locator('button')
    .evaluateAll((list) =>
      list
        .map((n) => String(n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 12)
    );

  if (summary.workerButtons > 0) {
    const openButton = page.locator('[data-open-worker]').first();
    summary.firstWorkerButton = short(await openButton.textContent());
    await openButton.click();
    await page.waitForFunction(() => {
      const title = document.querySelector('#selectedWorkerTitle')?.textContent || '';
      return title && !/Wybierz pracownika|Loading|Ładowanie/i.test(title);
    }, { timeout: 15000 });
    summary.detailPanels = await count(page, '#workerDetailPanel .panel-block, #workerDetailPanel table tbody tr');
    const fullDetailText = await page.locator('#workerDetailPanel').innerText();
    summary.detailText = short(fullDetailText, 500);
    assert(fullDetailText.includes('Historia') || fullDetailText.includes('Akademia'), 'Admin worker profile must render detail content.');

    const workerAcademyLink = page.locator('#workerDetailPanel a[href*="../academy/?workerId="]').first();
    summary.workerAcademyLinkCount = await workerAcademyLink.count();
    assert(summary.workerAcademyLinkCount > 0, 'Admin worker profile must expose a direct worker academy link.');
    const workerAcademyHref = await workerAcademyLink.getAttribute('href');
    const workerAcademyPage = await page.context().newPage();
    await workerAcademyPage.goto(new URL(workerAcademyHref, `${baseUrl.replace(/\/$/, '')}/admin/`).toString(), {
      waitUntil: 'networkidle',
      timeout: 120000
    });
    summary.workerAcademyPreviewLoginShown = await count(workerAcademyPage, '#loginForm');
    assert(summary.workerAcademyPreviewLoginShown === 0, 'Worker academy preview must reuse the admin session.');
    await workerAcademyPage.click('[data-academy-view="aiTraining"]');
    await workerAcademyPage.waitForTimeout(1200);
    await workerAcademyPage.click('[data-start-training="busy_owner"]');
    await workerAcademyPage.waitForSelector('#aiTrainingForm', { state: 'visible', timeout: timeoutMs });
    summary.workerAcademyPreviewAiForm = await count(workerAcademyPage, '#aiTrainingForm');
    assert(summary.workerAcademyPreviewAiForm > 0, 'Admin worker academy preview must start AI training for the selected worker.');
    await workerAcademyPage.close();
  }
}

async function runSite(page, summary) {
  await page.goto(`${baseUrl.replace(/\/$/, '')}/site/?lang=pl`, { waitUntil: 'networkidle', timeout: 120000 });
  summary.title = await getText(page, 'h1');
  summary.serviceCards = await count(page, '.service-card');
  summary.quizButtons = await count(page, '#quizNext');
  summary.portfolioCards = await count(page, '#portfolioTrack [data-project-card]');
  summary.portfolioTitles = await page.locator('#portfolioTrack [data-project-card] h3').evaluateAll((list) => list.map((node) => (node.textContent || '').trim()));
  summary.portfolioLinks = await page
    .locator('#portfolioTrack [data-project-card] .project-card-actions a[target="_blank"]')
    .evaluateAll((list) => list.map((node) => ({ href: node.getAttribute('href'), target: node.getAttribute('target') })));
  const expectedProjects = getPortfolioProjects('pl').map((project) => project.title);
  assert(summary.portfolioCards === expectedProjects.length, `Site portfolio must show all ${expectedProjects.length} configured project cards.`);
  for (const project of expectedProjects) {
    assert(summary.portfolioTitles.includes(project), `Site portfolio must include ${project}.`);
  }
  assert(summary.portfolioLinks.length === expectedProjects.length, 'Every portfolio card must expose its live project link.');
  assert(summary.portfolioLinks.every((item) => item.target === '_blank' && item.href), 'Every portfolio card must open the live project in a new tab.');
  summary.desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  assert(!summary.desktopOverflow, 'Site must not have horizontal overflow on desktop.');

  await page.click('[data-lead-open]');
  await page.waitForSelector('#leadForm', { state: 'visible', timeout: 12000 });
  await page.click('[data-lead-option="task:website"]');
  await page.click('[data-lead-next]');
  await page.waitForTimeout(400);
  await page.click('[data-lead-option="goal:leads"]');
  await page.click('[data-lead-next]');
  await page.waitForTimeout(400);
  await page.fill('#leadContext', 'Automated usability submission — testing the lead form end to end.');
  await page.click('[data-lead-next]');
  await page.waitForTimeout(400);
  await page.click('[data-lead-option="budget:starter"]');
  await page.click('[data-lead-next]');
  await page.waitForTimeout(400);

  const stamp = Date.now();
  await page.fill('[data-lead-field="name"]', `UX Test ${stamp}`);
  await page.fill('[data-lead-field="phone"]', `+48555${String(stamp).slice(-6)}`);
  await page.fill('[data-lead-field="email"]', `ux-${stamp}@example.com`);
  await page.fill('[data-lead-field="message"]', 'Automated usability submission');
  await page.click('[data-lead-next]');
  await page.waitForSelector('.lead-success', { state: 'visible', timeout: 12000 });
  summary.submissionText = short(await page.locator('.lead-success').innerText(), 300);
  assert(/Dzi[eę]kujemy|Thank you|Спасибо/i.test(summary.submissionText), 'Site form submission must finish with the thank-you state.');
}

function normalizeBaseUrl(value) {
  return String(value || 'http://127.0.0.1:4317').replace('://localhost', '://127.0.0.1').replace(/\/$/, '');
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

const summary = {
  baseUrl,
  parser: {},
  academy: {},
  admin: {},
  site: {},
};

try {
  await ensureTestWorker(page.request);
  await runParser(page, summary.parser);
  await runAcademy(page, summary.academy);
  await runAdmin(page, summary.admin);
  await runSite(page, summary.site);
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
