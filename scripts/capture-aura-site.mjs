import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const item of [
  { name: 'aura-redesign-desktop.png', viewport: { width: 1440, height: 900 }, mobile: false },
  { name: 'aura-redesign-mobile.png', viewport: { width: 390, height: 844 }, mobile: true }
]) {
  const context = await browser.newContext({ viewport: item.viewport, isMobile: item.mobile, hasTouch: item.mobile, reducedMotion: 'reduce' });
  const page = await context.newPage();
  // See scripts/smoke-test.mjs for why this prefers process.env.PORT over a
  // hardcoded 4317 - avoids pointing this capture at a co-located production instance.
  await page.goto(`http://127.0.0.1:${process.env.PORT || 4317}/site/?lang=ru`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `tmp/${item.name}`, fullPage: true });
  await context.close();
}
await browser.close();
