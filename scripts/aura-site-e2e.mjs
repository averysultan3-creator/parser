import { chromium } from 'playwright';

// See scripts/smoke-test.mjs for why this prefers process.env.PORT over a
// hardcoded 4317 - avoids silently pointing this Playwright session at a
// co-located live production instance on the default port.
const baseUrl = (process.env.AURA_SITE_URL || `http://127.0.0.1:${process.env.PORT || 4317}`).replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const viewports = [
  { name: 'desktop-full-hd', width: 1920, height: 1080, mobile: false },
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'laptop-1366', width: 1366, height: 768, mobile: false },
  { name: 'laptop-1280', width: 1280, height: 720, mobile: false },
  { name: 'tablet-landscape', width: 1024, height: 768, mobile: false },
  { name: 'tablet-portrait', width: 768, height: 1024, mobile: true },
  { name: 'iphone-375-short', width: 375, height: 667, mobile: true },
  { name: 'iphone-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 800, mobile: true }
];

function assert(value, message) {
  if (!value) throw new Error(message);
}

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const report = [];

try {
  const languageContext = await browser.newContext({ locale: 'en-GB', viewport: { width: 1280, height: 800 } });
  const languagePage = await languageContext.newPage();
  await languagePage.goto(`${baseUrl}/site/`, { waitUntil: 'networkidle', timeout: 60_000 });
  assert(await languagePage.evaluate(() => document.documentElement.lang) === 'en', 'browser language was not used for a first visit');
  await languagePage.locator('[data-language="ru"]').first().click();
  await languagePage.goto(`${baseUrl}/portfolio/depo-studio`, { waitUntil: 'networkidle', timeout: 60_000 });
  assert(await languagePage.evaluate(() => document.documentElement.lang) === 'ru', 'manual language choice did not persist between routes');
  await languagePage.goto(`${baseUrl}/site/?lang=pl`, { waitUntil: 'networkidle', timeout: 60_000 });
  assert(await languagePage.evaluate(() => document.documentElement.lang) === 'pl', 'URL language did not take priority over saved language');
  report.push({ language: 'browser, saved choice and URL priority verified' });
  await languageContext.close();

  for (const viewport of viewports) {
    console.log(`Testing viewport: ${viewport.name}`);
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/site/?lang=ru`, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForSelector('#siteApp .hero', { state: 'visible' });
    await page.locator('.hero-object').evaluate((image) => image.decode());
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    assert(!overflow, `${viewport.name}: horizontal overflow`);
    const sectionFlow = await page.locator('#siteApp > section').evaluateAll((sections) => sections.map((section) => {
      const box = section.getBoundingClientRect();
      return { id: section.id || section.className, top: box.top + scrollY, bottom: box.bottom + scrollY, height: box.height };
    }));
    sectionFlow.forEach((section, index) => {
      assert(section.height > 0, `${viewport.name}: empty section ${section.id}`);
      if (index) assert(section.top >= sectionFlow[index - 1].bottom - 1, `${viewport.name}: sections ${sectionFlow[index - 1].id} and ${section.id} overlap`);
    });
    const heroGeometry = await page.evaluate(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box ? { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width, height: box.height } : null;
      };
      return {
        viewport: { width: innerWidth, height: innerHeight },
        header: rect('#siteHeader'),
        hero: rect('.hero'),
        title: rect('.hero-title'),
        actions: rect('.hero-actions'),
        stage: rect('.hero-stage'),
        object: rect('.hero-object')
      };
    });
    assert(heroGeometry.title.top >= heroGeometry.header.bottom - 1, `${viewport.name}: hero title is hidden behind the header`);
    assert(heroGeometry.title.left >= -1 && heroGeometry.title.right <= heroGeometry.viewport.width + 1, `${viewport.name}: hero title leaves the viewport`);
    assert(heroGeometry.actions.bottom <= heroGeometry.hero.bottom + 1, `${viewport.name}: hero actions leave the hero`);
    assert(heroGeometry.object.width <= heroGeometry.stage.width + 2 && heroGeometry.object.height <= heroGeometry.stage.height + 2, `${viewport.name}: chameleon is clipped by its stage (${JSON.stringify({ stage: heroGeometry.stage, object: heroGeometry.object })})`);
    assert((await page.locator('.hero-title-line').count()) === 3, `${viewport.name}: hero is not composed as three controlled lines`);
    assert((await page.locator('.hero-color-wash').count()) === 1, `${viewport.name}: chameleon colour layer is missing`);
    if (!viewport.mobile) {
      assert(heroGeometry.actions.bottom <= heroGeometry.viewport.height + 1, `${viewport.name}: hero actions are below the first screen`);
      assert(heroGeometry.stage.bottom <= heroGeometry.viewport.height + 1, `${viewport.name}: chameleon stage is below the first screen`);
    }
    const projects = await page.locator('[data-project-card]').count();
    const media = await page.locator('[data-project-card] img').count();
    assert(projects === 18, `${viewport.name}: expected 18 portfolio cards, got ${projects}`);
    assert(media === 18, `${viewport.name}: expected real portfolio images, got ${media}`);
    assert((await page.locator('#portfolioCounter').count()) === 1, `${viewport.name}: portfolio counter is missing`);
    assert((await page.locator('[data-portfolio-next], [data-portfolio-prev]').count()) === 2, `${viewport.name}: portfolio arrow controls are missing`);
    assert(await page.locator('[data-portfolio-prev]').isDisabled(), `${viewport.name}: previous control must be disabled at the beginning`);
    assert((await page.locator('.portfolio-hint').count()) === 1, `${viewport.name}: carousel direction hint is missing`);
    const loadedBeforeScroll = await page.locator('[data-project-card] img[src]').count();
    assert(loadedBeforeScroll <= 3, `${viewport.name}: too many portfolio images load before the showcase is visible (${loadedBeforeScroll})`);
    if (!viewport.mobile && viewport.width >= 1180) {
      const track = page.locator('#portfolioTrack');
      const initialPortfolioLeft = await track.evaluate((node) => node.scrollLeft);
      await track.scrollIntoViewIfNeeded();
      const box = await track.boundingBox();
      await page.mouse.move(box.x + box.width * 0.45, box.y + 120);
      await page.mouse.down();
      await page.mouse.move(box.x + 30, box.y + 120, { steps: 5 });
      await page.mouse.up();
      assert(await track.evaluate((node) => node.scrollLeft > 20), `${viewport.name}: pointer drag does not move portfolio`);
      await track.evaluate((node, left) => { node.scrollLeft = left; }, initialPortfolioLeft);
      await track.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(160);
      assert(await track.evaluate((node) => node.scrollLeft > 20), `${viewport.name}: keyboard ArrowRight does not move portfolio`);
      await track.evaluate((node, left) => { node.scrollLeft = left; }, initialPortfolioLeft);
      await page.locator('[data-portfolio-next]').click();
      await page.waitForTimeout(220);
      assert(await track.evaluate((node) => node.scrollLeft > 20), `${viewport.name}: next arrow does not move portfolio`);
      await track.evaluate((node, left) => { node.scrollLeft = left; }, initialPortfolioLeft);
      await track.hover();
      const pageYBeforeWheel = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(220);
      assert(await page.evaluate(() => scrollY) > pageYBeforeWheel + 100, `${viewport.name}: vertical wheel is trapped by portfolio`);
      assert(await track.evaluate((node, left) => Math.abs(node.scrollLeft - left) < 5, initialPortfolioLeft), `${viewport.name}: vertical wheel is incorrectly converted into horizontal movement`);
      await track.scrollIntoViewIfNeeded();
      await track.evaluate((node, left) => { node.scrollLeft = left; }, initialPortfolioLeft);
      await track.hover();
      await page.mouse.wheel(900, 0);
      await page.waitForTimeout(180);
      assert(await track.evaluate((node) => node.scrollLeft > 20), `${viewport.name}: horizontal trackpad gesture does not move portfolio`);
    }
    await page.locator('.project-card-open').first().click();
    await page.waitForSelector('#quickView:not([hidden])');
    assert((await page.locator('#quickView img').count()) === 3, `${viewport.name}: quick view has no real 3-media gallery`);
    await page.keyboard.press('Escape');
    assert(await page.locator('#quickView').evaluate((node) => node.hidden), `${viewport.name}: quick view did not close on Escape`);
    for (const category of ['web', 'marketing', 'ai', 'systems']) {
      await page.locator(`[data-service-category="${category}"]`).click();
      assert((await page.locator('[data-service-card]').count()) >= 8, `${viewport.name}: category ${category} did not render`);
    }
    if (viewport.mobile) {
      await page.locator('#menuToggle').click();
      await page.waitForSelector('#mobileMenu:not([hidden])');
      const menuFocusable = await page.locator('#mobileMenu a, #mobileMenu button').count();
      assert(menuFocusable >= 5, `${viewport.name}: mobile menu is incomplete`);
      await page.keyboard.press('Escape');
      assert(await page.locator('#mobileMenu').evaluate((node) => node.hidden), `${viewport.name}: mobile menu did not close on Escape`);
      await page.evaluate(() => document.querySelector('#portfolio').scrollIntoView());
      await page.waitForTimeout(120);
      const positions = await page.evaluate(() => ({ header: document.querySelector('#siteHeader').getBoundingClientRect().bottom, target: document.querySelector('#portfolio').getBoundingClientRect().top }));
      assert(positions.target >= positions.header - 1, `${viewport.name}: sticky header overlaps anchor`);
    }
    report.push({ viewport: viewport.name, projects, media, initiallyLoadedPortfolioImages: loadedBeforeScroll, overflow });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/portfolio/depo-studio?lang=ru`, { waitUntil: 'networkidle', timeout: 60_000 });
  assert((await page.locator('.route-back').count()) === 1, 'project route has no explicit back navigation');
  assert((await page.locator('.case-gallery img').count()) === 3, 'project route must show media gallery');
  await page.goto(`${baseUrl}/services/geo-ai-visibility?lang=ru`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('.service-detail-hero');
  assert((await page.locator('.route-back').count()) === 1, 'service route has no explicit back navigation');
  assert((await page.locator('.deliverable-list li').count()) >= 3, 'service route must show deliverables');
  assert((await page.locator('.faq-item').count()) >= 4, 'service route must show FAQ');
  await page.locator('[data-lead-service="geoai"]').first().click();
  await page.waitForSelector('#leadForm');
  const contextChip = await page.locator('.context-chip').innerText();
  assert(/GEO/i.test(contextChip), 'service CTA does not preselect service context');
  await page.goto(`${baseUrl}/site/?lang=ru`, { waitUntil: 'networkidle', timeout: 60_000 });
  const projectHrefs = await page.locator('[data-project-card] .project-card-actions a').evaluateAll((nodes) => nodes.filter((node) => !node.target).map((node) => node.getAttribute('href')));
  const externalLinks = await page.locator('[data-project-card] .project-card-actions a[target="_blank"]').evaluateAll((nodes) => nodes.map((node) => ({ href: node.getAttribute('href'), target: node.getAttribute('target') })));
  assert(projectHrefs.length === 18, 'every project must expose its case page');
  assert(externalLinks.length === 18 && externalLinks.every((item) => item.target === '_blank' && /^https:\/\//.test(item.href || '')), 'every project must expose a real external website link');
  for (const href of projectHrefs) {
    await page.goto(new URL(href, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('.case-gallery img');
    assert((await page.locator('.case-gallery img').count()) === 3, `project route ${href} does not have 3 real media items`);
  }
  await page.goto(`${baseUrl}/services?lang=ru`, { waitUntil: 'networkidle', timeout: 60_000 });
  const serviceHrefs = await page.locator('[data-service-card]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  assert(serviceHrefs.length === 33, `expected 33 service cards, got ${serviceHrefs.length}`);
  for (const href of serviceHrefs) {
    await page.goto(new URL(href, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('.service-detail-hero');
    assert((await page.locator('.deliverable-list li').count()) >= 3, `service route ${href} does not have deliverables`);
  }
  report.push({ routes: { projects: projectHrefs.length, services: serviceHrefs.length } });
  await context.close();

  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(`${baseUrl}/site/?lang=ru`, { waitUntil: 'networkidle', timeout: 60_000 });
  const stage = motionPage.locator('#heroStage');
  const beforeScroll = await stage.evaluate((node) => getComputedStyle(node).getPropertyValue('--object-scroll-y'));
  await motionPage.mouse.wheel(0, 280);
  await motionPage.waitForTimeout(220);
  const afterScroll = await stage.evaluate((node) => getComputedStyle(node).getPropertyValue('--object-scroll-y'));
  assert(beforeScroll !== afterScroll, 'hero object does not react to scroll');
  const stageBox = await stage.boundingBox();
  await motionPage.mouse.move(stageBox.x + stageBox.width * 0.25, Math.max(1, stageBox.y + stageBox.height * 0.35));
  await motionPage.waitForTimeout(180);
  const pointerMotion = await motionPage.locator('.hero-object').evaluate((node) => ({ transform: getComputedStyle(node).transform, transition: getComputedStyle(node).transitionDuration }));
  assert(pointerMotion.transform !== 'none', 'hero object does not react to pointer movement');
  assert(parseFloat(pointerMotion.transition) >= 0.14, `hero pointer transition is too abrupt (${pointerMotion.transition})`);
  for (const section of await motionPage.locator('#siteApp > section').all()) {
    await section.scrollIntoViewIfNeeded();
    await motionPage.waitForTimeout(90);
  }
  assert((await motionPage.locator('.reveal:not(.is-visible)').count()) === 0, 'some reveal animations never complete while scrolling the page');
  report.push({ motion: 'pointer, scroll and all section reveals verified' });
  await motionContext.close();

  const formContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const formPage = await formContext.newPage();
  await formPage.goto(`${baseUrl}/site/?lang=ru&utm_source=e2e&utm_campaign=aura-site`, { waitUntil: 'networkidle', timeout: 60_000 });
  await formPage.locator('[data-lead-package="growth"]').click();
  await formPage.waitForSelector('#leadForm');
  await formPage.locator('[data-lead-option="task:website"]').click();
  await formPage.locator('[data-lead-next]').click();
  await formPage.locator('[data-lead-option="goal:leads"]').click();
  await formPage.locator('[data-lead-next]').click();
  await formPage.locator('[data-lead-field="context"]').fill('Нужен сайт с понятной услугой и быстрым контактом для B2B-команды.');
  await formPage.locator('[data-lead-next]').click();
  await formPage.locator('[data-lead-option="budget:growth"]').click();
  await formPage.locator('[data-lead-next]').click();
  const stamp = Date.now();
  await formPage.locator('[data-lead-field="name"]').fill(`Aura E2E ${stamp}`);
  await formPage.locator('[data-lead-field="email"]').fill(`aura-e2e-${stamp}@example.com`);
  await formPage.locator('[data-lead-next]').click();
  await formPage.waitForSelector('.lead-success', { timeout: 15_000 });
  assert(/сохранена/i.test(await formPage.locator('.lead-success h3').innerText()), 'form did not show real success state');
  report.push({ form: 'submitted with package, UTM and contact context' });
  await formContext.close();

  console.log(JSON.stringify({ ok: true, report }, null, 2));
} finally {
  await browser.close();
}
