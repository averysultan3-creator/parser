const PAGES_URL = process.env.PARSER_PAGES_URL || 'https://parser.auraglobal-merchants.com';

try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();

  await page.goto(`${PAGES_URL}/index.html`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1500);

  const layout = await page.evaluate(() => ({
    viewportH: window.innerHeight,
    discover: document.querySelector('#discoverButton')?.getBoundingClientRect(),
    analyze: document.querySelector('#analyzeButton')?.getBoundingClientRect(),
    analyzeDisplay: getComputedStyle(document.querySelector('#analyzeButton')).display,
    sidebarActions: getComputedStyle(document.querySelector('.sidebar-actions')).display,
    csvDrawer: getComputedStyle(document.querySelector('.csv-drawer')).display,
    aiNote: getComputedStyle(document.querySelector('.ai-note')).display,
    settingsGrid: getComputedStyle(document.querySelector('.settings-grid')).display,
    hasSettingsButton: !!document.querySelector('button[title="Настройки"]')
  }));

  assert(layout.discover && layout.discover.bottom <= layout.viewportH, 'discover button must be visible on mobile');
  assert(layout.analyzeDisplay === 'none', 'analyze button must stay hidden on mobile');
  assert(layout.sidebarActions === 'none', 'mobile should hide sidebar action block');
  assert(layout.csvDrawer === 'none', 'mobile should hide csv drawer');
  assert(layout.aiNote === 'none', 'mobile should hide ai note');
  assert(layout.settingsGrid === 'none', 'mobile should hide settings block');
  assert(!layout.hasSettingsButton, 'settings button should not be rendered');

  await page.selectOption('#discoverCategoryPreset', 'cat:hvac');
  await page.click('#discoverButton');
  await page.waitForTimeout(4000);

  const result = await page.evaluate(() => ({
    status: document.querySelector('#discoverStatus')?.textContent || '',
    rows: document.querySelectorAll('#resultsBody tr').length
  }));

  assert(result.rows > 0, 'mobile discovery must populate results');
  assert(/найдено|Google Places|Amazon|РџРѕРёСЃРє/.test(result.status), 'mobile discovery status must update');

  await browser.close();
  console.log('Pages mobile smoke OK');
} catch (error) {
  console.error(`Pages mobile smoke FAILED: ${error.message || error}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
