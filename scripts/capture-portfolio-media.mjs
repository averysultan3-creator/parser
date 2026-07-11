import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const projects = [
  ['depo-studio', 'https://www.depo.studio/'],
  ['flowty', 'https://flowty.co/'],
  ['agentura', 'https://agentura.framer.website/'],
  ['unabyss', 'https://unabyss.com/'],
  ['polanki', 'https://kameralnie.com/'],
  ['mily-group', 'https://milygroup.com/'],
  ['climatech', 'https://climatech.ua/'],
  ['mont-fort', 'https://mont-fort.com/'],
  ['evanlite', 'https://evanlite.com/'],
  ['montone-studio', 'https://montone.studio/'],
  ['rabenrifaie', 'https://www.rabenrifaie.com/'],
  ['all-inn', 'https://allinnhomeofstudents.com/'],
  ['let-it-rip', 'https://letitrippictures.com/'],
  ['oknoplast', 'https://oknoplast.com.pl/'],
  ['mukko', 'https://mukko.studio/'],
  ['polar-signals', 'https://www.polarsignals.com/'],
  ['langbase', 'https://langbase.com/'],
  ['exa-ai', 'https://exa.ai/']
];

const outputRoot = path.resolve('public/site/media/portfolio');
await fs.mkdir(outputRoot, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});
const results = [];

for (const [slug, url] of projects) {
  const projectDir = path.join(outputRoot, slug);
  await fs.mkdir(projectDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  let status = 'ok';
  let title = '';

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    status = String(response?.status() || 'loaded');
    await page.waitForTimeout(2_200);
    await dismissConsent(page);
    await warmLazyMedia(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);
    title = await page.title();
    await page.screenshot({
      path: path.join(projectDir, 'cover.jpg'),
      type: 'jpeg',
      quality: 78,
      animations: 'disabled'
    });

    const maxScroll = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
    const secondStop = Math.min(maxScroll, Math.max(620, Math.round(maxScroll * 0.32)));
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), secondStop);
    await page.waitForTimeout(900);
    await page.screenshot({
      path: path.join(projectDir, 'detail.jpg'),
      type: 'jpeg',
      quality: 76,
      animations: 'disabled'
    });

    await page.setViewportSize({ width: 430, height: 860 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(900);
    await dismissConsent(page);
    await page.screenshot({
      path: path.join(projectDir, 'mobile.jpg'),
      type: 'jpeg',
      quality: 76,
      animations: 'disabled'
    });
  } catch (error) {
    status = `error: ${error.message}`;
    console.error(`${slug}: ${status}`);
  } finally {
    results.push({ slug, url, status, title });
    await context.close();
    console.log(`${slug}: ${status}`);
  }
}

await browser.close();
await fs.writeFile(path.join(outputRoot, 'capture-report.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');

async function dismissConsent(page) {
  const labels = [/accept all/i, /accept cookies/i, /allow all/i, /agree/i, /zaakceptuj/i, /akceptuj/i, /zgadzam/i, /принять/i];
  for (const label of labels) {
    const candidate = page.getByRole('button', { name: label }).first();
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
      return;
    }
  }
}

async function warmLazyMedia(page) {
  await page.evaluate(async () => {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const stops = [0, 0.25, 0.5, 0.75, 1].map((part) => Math.round(max * part));
    for (const top of stops) {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 260));
    }
  });
}
