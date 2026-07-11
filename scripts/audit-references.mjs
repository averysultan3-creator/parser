import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_INPUT = 'C:/Users/Sasha/Downloads/1 (2).txt';
const INPUT = process.argv[2] || DEFAULT_INPUT;
const OUTPUT = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : 'references-audit.json';
const VISUAL_LIMIT = Number(process.env.REFERENCE_VISUAL_LIMIT || 15);
const SCREENSHOT_DIR = 'tmp/reference-screenshots';
const TIMEOUT_MS = 15_000;

const PARKED_PATTERNS = [
  /domain\s+for\s+sale/i,
  /buy\s+this\s+domain/i,
  /parked\s+domain/i,
  /sedo\.com/i,
  /afternic/i,
  /hugedomains/i,
  /this\s+domain\s+is\s+available/i
];

const BROKEN_PATTERNS = [
  /404\s+not\s+found/i,
  /page\s+not\s+found/i,
  /site\s+not\s+found/i,
  /internal\s+server\s+error/i,
  /service\s+unavailable/i
];

function parseRows(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const cells = line.split('\t').map((cell) => cell.trim());
      if (cells.length === 1 && /^https?:\/\//i.test(cells[0])) {
        const url = normalizeUrl(cells[0]);
        return {
          index,
          priority: 'A',
          country: '',
          projectName: hostnameName(url),
          niche: 'Digital studio',
          originalUrl: url,
          description: 'Added as a standalone URL in the source list.',
          sector: '',
          source: ''
        };
      }

      return {
        index,
        priority: cells[1] || '',
        country: cells[2] || '',
        projectName: cells[3] || hostnameName(cells[5]) || `Reference ${index}`,
        niche: cells[4] || '',
        originalUrl: normalizeUrl(cells[5] || ''),
        description: cells[6] || '',
        sector: cells[7] || '',
        source: cells.slice(8).filter(Boolean).join(' | ')
      };
    })
    .filter((row) => row.originalUrl);
}

function normalizeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function hostnameName(value) {
  try {
    const host = new URL(normalizeUrl(value)).hostname.replace(/^www\./, '');
    return host
      .split('.')
      .slice(0, -1)
      .join(' ')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  } catch {
    return '';
  }
}

function createAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function checkHttp(row) {
  const { signal, clear } = createAbortSignal(TIMEOUT_MS);
  try {
    const response = await fetch(row.originalUrl, {
      redirect: 'follow',
      signal,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'AuraGlobalReferenceAudit/1.0'
      }
    });
    const finalUrl = response.url || row.originalUrl;
    const contentType = response.headers.get('content-type') || '';
    const html = contentType.includes('text/html') ? await response.text().catch(() => '') : '';
    const parked = PARKED_PATTERNS.some((pattern) => pattern.test(html));
    const brokenText = BROKEN_PATTERNS.some((pattern) => pattern.test(html));
    const reachable = response.ok && !parked && !brokenText && (!html || html.replace(/<[^>]*>/g, ' ').trim().length > 180);
    return {
      ...row,
      finalUrl,
      status: response.status,
      reachable,
      desktopChecked: false,
      mobileChecked: false,
      visualQuality: reachable ? qualityFromPriority(row.priority) : 'unusable',
      usefulPatterns: row.description || '',
      avoidPatterns: parked ? 'Parked/domain-for-sale pattern detected' : brokenText ? 'Broken/error page text detected' : '',
      notes: [
        row.niche ? `Niche: ${row.niche}` : '',
        row.sector ? `Sector: ${row.sector}` : '',
        row.source ? `Source: ${row.source}` : '',
        contentType ? `Content-Type: ${contentType}` : ''
      ]
        .filter(Boolean)
        .join(' | ')
    };
  } catch (error) {
    return {
      ...row,
      finalUrl: '',
      status: 'network_error',
      reachable: false,
      desktopChecked: false,
      mobileChecked: false,
      visualQuality: 'unusable',
      usefulPatterns: row.description || '',
      avoidPatterns: '',
      notes: `Network check failed: ${error?.name === 'AbortError' ? 'timeout' : error?.message || error}`
    };
  } finally {
    clear();
  }
}

function qualityFromPriority(priority) {
  if (String(priority).toUpperCase() === 'A') return 'high';
  if (String(priority).toUpperCase() === 'B') return 'medium';
  return 'unchecked';
}

async function runVisualAudit(items) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (error) {
    console.warn(`Playwright visual audit skipped: ${error.message || error}`);
    return items;
  }

  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  let browser;
  try {
    const executablePath = await findSystemBrowser();
    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {})
    });
  } catch (error) {
    console.warn(`Playwright visual audit skipped: ${error.message || error}`);
    return items;
  }
  const selected = items
    .filter((item) => item.reachable)
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
    .slice(0, VISUAL_LIMIT);

  try {
    for (const item of selected) {
      const slug = `${String(item.index).padStart(2, '0')}-${slugify(item.projectName)}`;
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      try {
        await page.goto(item.finalUrl || item.originalUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
        await page.waitForLoadState('networkidle', { timeout: 6_000 }).catch(() => {});
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${slug}-desktop.png`), fullPage: false });
        item.desktopChecked = true;

        await page.setViewportSize({ width: 390, height: 844 });
        await page.reload({ waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
        await page.waitForLoadState('networkidle', { timeout: 6_000 }).catch(() => {});
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${slug}-mobile.png`), fullPage: false });
        item.mobileChecked = true;
        item.notes = appendNote(item.notes, `Screenshots: ${SCREENSHOT_DIR}/${slug}-desktop.png, ${SCREENSHOT_DIR}/${slug}-mobile.png`);
      } catch (error) {
        item.notes = appendNote(item.notes, `Browser check failed: ${error?.message || error}`);
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return items;
}

async function findSystemBrowser() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }

  return '';
}

function priorityWeight(priority) {
  if (String(priority).toUpperCase() === 'A') return 2;
  if (String(priority).toUpperCase() === 'B') return 1;
  return 0;
}

function slugify(value) {
  return String(value || 'reference')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48) || 'reference';
}

function appendNote(current, next) {
  return [current, next].filter(Boolean).join(' | ');
}

const raw = await fs.readFile(INPUT, 'utf8');
const rows = parseRows(raw);
const checked = [];

for (let index = 0; index < rows.length; index += 1) {
  const result = await checkHttp(rows[index]);
  checked.push(result);
  process.stdout.write(`\rChecked ${index + 1}/${rows.length}`);
}
process.stdout.write('\n');

const audited = await runVisualAudit(checked);
await fs.writeFile(OUTPUT, `${JSON.stringify(audited, null, 2)}\n`, 'utf8');

const reachable = audited.filter((item) => item.reachable).length;
const visuallyChecked = audited.filter((item) => item.desktopChecked || item.mobileChecked).length;
console.log(`Reference audit saved to ${OUTPUT}: ${reachable}/${audited.length} reachable, ${visuallyChecked} browser-checked.`);
