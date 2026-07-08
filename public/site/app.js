import { getServiceCategories } from './data/services.js';
import { getSiteContent } from './data/content.js';
import { getSiteTranslations, SUPPORTED_SITE_LANGUAGES } from './data/translations.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileViewport = window.matchMedia('(max-width: 900px)');
const isMobileViewport = () => mobileViewport.matches;

const API_BASE_STORAGE_KEY = 'parserApiBase';
const SITE_BASE_URL = 'https://parser.auraglobal-merchants.com/site/';

const i18nApi = window.AuraI18n || {};
const normalizeLanguage = (value) => i18nApi.normalizeLang?.(value) || 'pl';

const state = {
  language: normalizeLanguage(window.__AURA_SITE_LANG__ || i18nApi.detectInitialLanguage?.() || 'pl'),
  ui: null,
  content: null,
  serviceCategories: null,
  activeCategory: 'web',
  selectedServiceId: '',
  selectedServiceCategoryId: '',
  mobileMenuOpen: false,
  quiz: {
    step: 0,
    answers: {},
    submitting: false,
    done: false
  }
};
let internalLanguageChange = false;

const refs = {
  nav: document.getElementById('siteNav'),
  navLinks: document.getElementById('navLinks'),
  mobileNavLinks: document.getElementById('mobileNavLinks'),
  desktopLangSwitcher: document.getElementById('desktopLangSwitcher'),
  mobileLangSwitcher: document.getElementById('mobileLangSwitcher'),
  navMenuToggle: document.getElementById('navMenuToggle'),
  navMenuLabel: document.getElementById('navMenuLabel'),
  mobileMenu: document.getElementById('mobileMenu'),
  mobileMenuClose: document.getElementById('mobileMenuClose'),
  mobileLangLabel: document.getElementById('mobileLangLabel'),
  mobileMenuCta: document.getElementById('mobileMenuCta'),
  navCta: document.getElementById('navCta'),
  heroEyebrow: document.getElementById('heroEyebrow'),
  heroTitle: document.getElementById('heroTitle'),
  heroSubtitle: document.getElementById('heroSubtitle'),
  heroPrimaryCta: document.getElementById('heroPrimaryCta'),
  heroSecondaryCta: document.getElementById('heroSecondaryCta'),
  heroNote: document.getElementById('heroNote'),
  marqueeTrack: document.getElementById('marqueeTrack'),
  storyEyebrow: document.getElementById('storyEyebrow'),
  storyTitle: document.getElementById('storyTitle'),
  storySteps: document.getElementById('storySteps'),
  storyFinal: document.getElementById('storyFinal'),
  servicesEyebrow: document.getElementById('servicesEyebrow'),
  servicesTitle: document.getElementById('servicesTitle'),
  servicesSubtitle: document.getElementById('servicesSubtitle'),
  serviceTabs: document.getElementById('serviceTabs'),
  serviceGrid: document.getElementById('serviceGrid'),
  pricingEyebrow: document.getElementById('pricingEyebrow'),
  pricingTitle: document.getElementById('pricingTitle'),
  pricingGrid: document.getElementById('pricingGrid'),
  pricingNote: document.getElementById('pricingNote'),
  processEyebrow: document.getElementById('processEyebrow'),
  processTitle: document.getElementById('processTitle'),
  processTimeline: document.getElementById('processTimeline'),
  processNotes: document.getElementById('processNotes'),
  portfolioEyebrow: document.getElementById('portfolioEyebrow'),
  portfolioTitle: document.getElementById('portfolioTitle'),
  portfolioCarousel: document.getElementById('portfolioCarousel'),
  whyEyebrow: document.getElementById('whyEyebrow'),
  whyTitle: document.getElementById('whyTitle'),
  whySubtitle: document.getElementById('whySubtitle'),
  whyUsGrid: document.getElementById('whyUsGrid'),
  quizEyebrow: document.getElementById('quizEyebrow'),
  quizTitle: document.getElementById('quizTitle'),
  quizBody: document.getElementById('quizBody'),
  quizBack: document.getElementById('quizBack'),
  quizNext: document.getElementById('quizNext'),
  quizNav: document.getElementById('quizNav'),
  quizProgressBar: document.getElementById('quizProgressBar'),
  finalCtaTitle: document.getElementById('finalCtaTitle'),
  finalCtaBody: document.getElementById('finalCtaBody'),
  finalCtaButton: document.getElementById('finalCtaButton'),
  footerTagline: document.getElementById('footerTagline'),
  footerEmail: document.getElementById('footerEmail'),
  footerPhone: document.getElementById('footerPhone'),
  footerYear: document.getElementById('footerYear'),
  footerContactHeading: document.getElementById('footerContactHeading'),
  footerNavigationHeading: document.getElementById('footerNavigationHeading'),
  footerResourcesHeading: document.getElementById('footerResourcesHeading'),
  footerNavServices: document.getElementById('footerNavServices'),
  footerNavPortfolio: document.getElementById('footerNavPortfolio'),
  footerNavPricing: document.getElementById('footerNavPricing'),
  footerNavContact: document.getElementById('footerNavContact'),
  footerResourceSystem: document.getElementById('footerResourceSystem'),
  footerResourceProcess: document.getElementById('footerResourceProcess'),
  footerResourceConsultation: document.getElementById('footerResourceConsultation'),
  footerCopyright: document.getElementById('footerCopyright'),
  serviceModal: document.getElementById('serviceModal'),
  serviceModalContent: document.getElementById('serviceModalContent'),
  serviceModalClose: document.getElementById('serviceModalClose')
};

const metaRefs = {
  title: document.querySelector('title'),
  description: document.getElementById('metaDescription'),
  ogTitle: document.getElementById('ogTitle'),
  ogDescription: document.getElementById('ogDescription'),
  ogUrl: document.getElementById('ogUrl'),
  ogImageAlt: document.getElementById('ogImageAlt'),
  twitterTitle: document.getElementById('twitterTitle'),
  twitterDescription: document.getElementById('twitterDescription'),
  canonical: document.getElementById('canonicalLink'),
  appleAppTitle: document.getElementById('appleAppTitle')
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function refreshIcons() {
  window.lucide?.createIcons();
}

function setText(node, value) {
  if (node) node.textContent = value;
}

function setSplitText(node, value) {
  if (!node) return;
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  node.innerHTML = words
    .map((word, index) => `<span class="word" style="transition-delay:${index * 40}ms">${escapeHtml(word)}</span>`)
    .join(' ');
}

function ensurePageData(language = state.language) {
  state.language = normalizeLanguage(language) || 'pl';
  state.ui = getSiteTranslations(state.language);
  state.content = getSiteContent(state.language);
  state.serviceCategories = getServiceCategories(state.language);
  if (!state.serviceCategories.some((category) => category.id === state.activeCategory)) {
    state.activeCategory = state.serviceCategories[0]?.id || '';
  }
}

function isPrivateHostname(hostname) {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^\[::1\]$/.test(host)) return true;
  return false;
}

function normalizeApiBase(value) {
  if (!value) return '';
  let cleaned = String(value).trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
  return cleaned;
}

function clearPrivateParserApiBase() {
  if (window.location.protocol === 'file:' || isPrivateHostname(window.location.hostname)) return;
  const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
  if (!saved) return;
  try {
    if (isPrivateHostname(new URL(saved).hostname)) localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch {
    localStorage.removeItem(API_BASE_STORAGE_KEY);
  }
}

function resolveApiBase() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('api');
    if (fromQuery !== null) {
      const cleaned = normalizeApiBase(fromQuery);
      if (cleaned) localStorage.setItem(API_BASE_STORAGE_KEY, cleaned);
      else localStorage.removeItem(API_BASE_STORAGE_KEY);
      return cleaned;
    }
  } catch {}

  if (window.location.protocol === 'file:') return 'http://localhost:4317';
  clearPrivateParserApiBase();

  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (!saved) return '';
    try {
      if (new URL(saved).origin === window.location.origin) return '';
    } catch {}
    return saved;
  } catch {
    return '';
  }
}

let apiBase = resolveApiBase();

function apiUrl(path) {
  return `${apiBase}${path}`;
}

async function isApiBaseReachable(base) {
  const cleaned = normalizeApiBase(base);
  if (!cleaned) return false;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${cleaned}/api/health`, { cache: 'no-store', signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function bootstrapApiBase() {
  const queryBase = (() => {
    try {
      return normalizeApiBase(new URLSearchParams(window.location.search).get('api'));
    } catch {
      return '';
    }
  })();
  if (queryBase && (await isApiBaseReachable(queryBase))) {
    apiBase = queryBase;
    localStorage.setItem(API_BASE_STORAGE_KEY, queryBase);
    return queryBase;
  }

  const onPagesOrFile = window.location.protocol === 'file:' || window.location.hostname.endsWith('github.io');
  if (onPagesOrFile) {
    try {
      const response = await fetch(`../tunnel.json?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const cleaned = normalizeApiBase(data.api || data.url || '');
        if (cleaned) {
          apiBase = cleaned;
          localStorage.setItem(API_BASE_STORAGE_KEY, cleaned);
          return cleaned;
        }
      }
    } catch {}
  }

  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (saved) {
      try {
        if (new URL(saved).origin === window.location.origin) {
          apiBase = '';
          localStorage.removeItem(API_BASE_STORAGE_KEY);
          return '';
        }
      } catch {}
      try {
        if (!onPagesOrFile && isPrivateHostname(new URL(saved).hostname)) {
          apiBase = '';
          localStorage.removeItem(API_BASE_STORAGE_KEY);
          return '';
        }
      } catch {}
      if (await isApiBaseReachable(saved)) {
        apiBase = saved;
        localStorage.setItem(API_BASE_STORAGE_KEY, saved);
        return saved;
      }
    }
  } catch {}

  return apiBase;
}

const apiBootstrapStarted = bootstrapApiBase();

function languageUrl(language) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  return url.toString();
}

function syncLanguageUrl(language) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function updateMeta() {
  const meta = state.ui.meta;
  const currentUrl = languageUrl(state.language);
  document.title = meta.title;
  metaRefs.title.textContent = meta.title;
  metaRefs.description.setAttribute('content', meta.description);
  metaRefs.ogTitle.setAttribute('content', meta.ogTitle);
  metaRefs.ogDescription.setAttribute('content', meta.ogDescription);
  metaRefs.ogUrl.setAttribute('content', currentUrl);
  metaRefs.ogImageAlt.setAttribute('content', meta.ogImageAlt);
  metaRefs.twitterTitle.setAttribute('content', meta.ogTitle);
  metaRefs.twitterDescription.setAttribute('content', meta.ogDescription);
  metaRefs.canonical.setAttribute('href', currentUrl);
  metaRefs.appleAppTitle.setAttribute('content', state.content.contactInfo.company);
  document.documentElement.lang = state.language;
}

function renderNavLinks(target, mobile = false) {
  const links = [
    { href: '#uslugi', label: state.ui.nav.services },
    { href: '#cennik', label: state.ui.nav.pricing },
    { href: '#realizacje', label: state.ui.nav.portfolio },
    { href: '#proces', label: state.ui.nav.process }
  ];
  target.innerHTML = links
    .map(
      (link) =>
        `<a href="${link.href}" ${mobile ? 'data-mobile-nav-link' : ''}>${escapeHtml(link.label)}${mobile ? '<i data-lucide="arrow-right"></i>' : ''}</a>`
    )
    .join('');
}

function renderLanguageSwitcher(target) {
  target.innerHTML = SUPPORTED_SITE_LANGUAGES.map((language) => {
    const active = language === state.language ? 'active' : '';
    return `<button type="button" class="${active}" data-set-language="${language}" aria-pressed="${language === state.language}">${language.toUpperCase()}</button>`;
  }).join('');
}

function renderStaticSections() {
  setText(refs.navCta, state.ui.nav.cta);
  setText(refs.mobileMenuCta, state.ui.nav.cta);
  setText(refs.navMenuLabel, state.mobileMenuOpen ? state.ui.nav.closeMenu : state.ui.nav.openMenu);
  setText(refs.mobileLangLabel, state.ui.nav.languageLabel);
  refs.mobileMenuClose.setAttribute('aria-label', state.ui.nav.closeMenu);

  renderNavLinks(refs.navLinks);
  renderNavLinks(refs.mobileNavLinks, true);
  renderLanguageSwitcher(refs.desktopLangSwitcher);
  renderLanguageSwitcher(refs.mobileLangSwitcher);

  setText(refs.heroEyebrow, state.ui.hero.eyebrow);
  setSplitText(refs.heroTitle, state.ui.hero.title);
  setText(refs.heroSubtitle, state.ui.hero.subtitle);
  setText(refs.heroPrimaryCta, state.ui.hero.primary);
  setText(refs.heroSecondaryCta, state.ui.hero.secondary);
  setText(refs.heroNote, state.ui.hero.note);

  setText(refs.storyEyebrow, state.ui.story.eyebrow);
  setSplitText(refs.storyTitle, state.ui.story.title);

  setText(refs.servicesEyebrow, state.ui.services.eyebrow);
  setSplitText(refs.servicesTitle, state.ui.services.title);
  setText(refs.servicesSubtitle, state.ui.services.subtitle);

  setText(refs.pricingEyebrow, state.ui.pricing.eyebrow);
  setSplitText(refs.pricingTitle, state.ui.pricing.title);

  setText(refs.processEyebrow, state.ui.process.eyebrow);
  setSplitText(refs.processTitle, state.ui.process.title);

  setText(refs.portfolioEyebrow, state.ui.portfolio.eyebrow);
  setSplitText(refs.portfolioTitle, state.ui.portfolio.title);

  setText(refs.whyEyebrow, state.ui.whyUs.eyebrow);
  setSplitText(refs.whyTitle, state.ui.whyUs.title);
  setText(refs.whySubtitle, state.ui.whyUs.subtitle);

  setText(refs.quizEyebrow, state.ui.quiz.eyebrow);
  setSplitText(refs.quizTitle, state.ui.quiz.title);
  setText(refs.quizBack, state.ui.quiz.back);

  setSplitText(refs.finalCtaTitle, state.ui.finalCta.title);
  setText(refs.finalCtaBody, state.ui.finalCta.body);
  setText(refs.finalCtaButton, state.ui.finalCta.button);

  setText(refs.footerTagline, state.ui.footer.tagline);
  setText(refs.footerContactHeading, state.ui.footer.contact);
  setText(refs.footerNavigationHeading, state.ui.footer.navigation);
  setText(refs.footerResourcesHeading, state.ui.footer.resources);
  setText(refs.footerNavServices, state.ui.nav.services);
  setText(refs.footerNavPortfolio, state.ui.nav.portfolio);
  setText(refs.footerNavPricing, state.ui.nav.pricing);
  setText(refs.footerNavContact, state.ui.footer.contact);
  setText(refs.footerResourceSystem, state.ui.story.eyebrow);
  setText(refs.footerResourceProcess, state.ui.nav.process);
  setText(refs.footerResourceConsultation, state.ui.footer.consultation);
  setText(refs.footerCopyright, state.ui.footer.copyright);

  refs.footerEmail.textContent = state.content.contactInfo.email;
  refs.footerEmail.href = `mailto:${state.content.contactInfo.email}`;
  refs.footerPhone.textContent = state.content.contactInfo.phone;
  refs.footerPhone.href = `tel:${state.content.contactInfo.phone.replace(/\s/g, '')}`;
  refs.footerYear.textContent = new Date().getFullYear();
  refs.serviceModalClose.setAttribute('aria-label', state.ui.nav.closeMenu);
}

function renderMarquee() {
  const items = state.content.marqueeItems.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  refs.marqueeTrack.innerHTML = items + items;
}

let revealObserver = null;

function observeReveals(root = document) {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
  }
  root.querySelectorAll('.reveal, [data-split]').forEach((element) => {
    if (element.dataset.revealObserved === 'true') return;
    element.dataset.revealObserved = 'true';
    revealObserver.observe(element);
  });
}

function getServiceById(categoryId, serviceId) {
  const category = state.serviceCategories.find((item) => item.id === categoryId);
  const service = category?.services.find((item) => item.id === serviceId) || null;
  return { category, service };
}

function renderStory() {
  refs.storySteps.innerHTML = state.content.storySteps
    .map(
      (step, index) => `
        <div class="story-step reveal">
          <div class="story-step-text">
            <p class="story-step-num accent-${escapeHtml(step.accent)}"><i data-lucide="${escapeHtml(step.icon)}"></i> ${escapeHtml(step.label)} · 0${index + 1}</p>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.text)}</p>
          </div>
          <div class="story-step-visual accent-${escapeHtml(step.accent)}">
            <span class="pulse-ring"></span><span class="pulse-ring"></span><span class="pulse-ring"></span>
            <i data-lucide="${escapeHtml(step.icon)}"></i>
          </div>
        </div>
      `
    )
    .join('');
  setText(refs.storyFinal, state.content.storyFinal);
}

function renderServiceTabs() {
  refs.serviceTabs.innerHTML = state.serviceCategories
    .map(
      (category) =>
        `<button class="service-tab ${category.id === state.activeCategory ? 'active' : ''}" data-cat="${escapeHtml(category.id)}" role="tab">${escapeHtml(category.label)}</button>`
    )
    .join('');
}

function renderServiceGrid() {
  const category = state.serviceCategories.find((item) => item.id === state.activeCategory);
  refs.serviceGrid.innerHTML = (category?.services || [])
    .map(
      (service, index) => `
        <div class="service-card" data-service="${escapeHtml(category.id)}:${escapeHtml(service.id)}" style="animation-delay:${index * 45}ms">
          <div class="service-card-icon"><i data-lucide="${escapeHtml(service.icon)}"></i></div>
          <h3>${escapeHtml(service.name)}</h3>
          <p>${escapeHtml(service.short)}</p>
          <div class="service-card-footer">
            <span class="service-price">${escapeHtml(service.price)}</span>
            <span class="service-more">${escapeHtml(state.ui.services.details)} <i data-lucide="arrow-right"></i></span>
          </div>
        </div>
      `
    )
    .join('');
}

function renderServiceModal() {
  if (!state.selectedServiceId || !state.selectedServiceCategoryId || !refs.serviceModal.classList.contains('open')) return;
  const { service } = getServiceById(state.selectedServiceCategoryId, state.selectedServiceId);
  if (!service) return;
  refs.serviceModalContent.innerHTML = `
    <h3>${escapeHtml(service.name)}</h3>
    <p class="modal-price">${escapeHtml(service.price)}</p>
    <div class="modal-row"><h4>${escapeHtml(state.ui.services.modal.what)}</h4><p>${escapeHtml(service.details.what)}</p></div>
    <div class="modal-row"><h4>${escapeHtml(state.ui.services.modal.forWho)}</h4><p>${escapeHtml(service.details.forWho)}</p></div>
    <div class="modal-row"><h4>${escapeHtml(state.ui.services.modal.problem)}</h4><p>${escapeHtml(service.details.problem)}</p></div>
    <div class="modal-row"><h4>${escapeHtml(state.ui.services.modal.gives)}</h4><p>${escapeHtml(service.details.gives)}</p></div>
    <div class="modal-row"><h4>${escapeHtml(state.ui.services.modal.priceFactors)}</h4><p>${escapeHtml(service.details.priceFactors)}</p></div>
    <div class="modal-row"><h4>${escapeHtml(state.ui.services.modal.process)}</h4><p>${escapeHtml(service.details.process)}</p></div>
    <a href="#wycena" class="btn btn-primary modal-cta" data-modal-close data-quiz-service-id="${escapeHtml(service.id)}">${escapeHtml(state.ui.services.modal.ask)}</a>
  `;
}

function renderPricing() {
  refs.pricingGrid.innerHTML = state.content.packages
    .map(
      (item) => `
        <div class="pricing-card ${item.highlighted ? 'highlighted' : ''} reveal">
          ${item.highlighted ? `<span class="pricing-badge">${escapeHtml(state.ui.pricing.badge)}</span>` : ''}
          <h3>${escapeHtml(item.name)}</h3>
          <p class="pricing-price">${escapeHtml(item.price)}</p>
          <p class="pricing-tagline">${escapeHtml(item.tagline)}</p>
          <ul class="pricing-features">
            ${(item.features || []).map((feature) => `<li><i data-lucide="check"></i>${escapeHtml(feature)}</li>`).join('')}
          </ul>
          <a href="#wycena" class="btn ${item.highlighted ? 'btn-primary' : 'btn-ghost'}" data-quiz-open>${escapeHtml(state.ui.pricing.cta)}</a>
        </div>
      `
    )
    .join('');
  setText(refs.pricingNote, state.content.pricingNote);
}

function renderProcess() {
  refs.processTimeline.innerHTML = state.content.processSteps
    .map(
      (step) => `
        <div class="process-step reveal">
          <p class="process-step-num">${escapeHtml(step.n)}</p>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.text)}</p>
        </div>
      `
    )
    .join('');
  refs.processNotes.innerHTML = state.content.processNotes
    .map((note) => `<p class="reveal">${escapeHtml(note)}</p>`)
    .join('');
}

function projectBadge(item) {
  if (item.preview?.badge) return item.preview.badge;
  const words = String(item.title || '')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'AG';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length === 2 && words[1].length <= 2) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}

function renderPortfolioPreview(item) {
  const preview = item.preview || {};
  const stats = Array.isArray(preview.stats) ? preview.stats.slice(0, 3) : [];
  return `
    <div class="portfolio-preview accent-${escapeHtml(item.accent || 'green')}">
      <div class="portfolio-preview-top">
        <span class="portfolio-project-chip">
          <span class="portfolio-project-initials">${escapeHtml(projectBadge(item))}</span>
          ${escapeHtml(state.ui.portfolio.previewFallback)}
        </span>
      </div>
      <div class="portfolio-device">
        <div class="portfolio-browser">
          <span></span><span></span><span></span>
          <strong>${escapeHtml(item.domain || '')}</strong>
        </div>
        <div class="portfolio-screen">
          <div class="portfolio-screen-hero">
            <span class="portfolio-screen-eyebrow">${escapeHtml(preview.eyebrow || item.category || '')}</span>
            <h4>${escapeHtml(preview.hero || item.title || '')}</h4>
          </div>
          <div class="portfolio-screen-grid">
            ${stats
              .map(
                (stat, index) => `
                  <div class="portfolio-screen-card card-${index + 1}">
                    <span></span>
                    <strong>${escapeHtml(stat)}</strong>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      </div>
      <span class="portfolio-domain-badge">${escapeHtml(item.domain || '')}</span>
      <span class="portfolio-preview-note">${escapeHtml(item.result || '')}</span>
    </div>
  `;
}

function renderPortfolio() {
  refs.portfolioCarousel.innerHTML = state.content.portfolio
    .map((item) => {
      const ariaLabel = state.ui.portfolio.ariaLabel.replace('{title}', item.title || '');
      return `
        <a
          class="portfolio-card reveal accent-${escapeHtml(item.accent || 'green')}"
          href="${escapeHtml(item.url || '#')}"
          target="_blank"
          rel="noreferrer"
          data-portfolio-card
          aria-label="${escapeHtml(ariaLabel)}"
        >
          <span class="portfolio-card-hint">${escapeHtml(state.ui.portfolio.hint)}</span>
          ${renderPortfolioPreview(item)}
          <div class="portfolio-body">
            <div class="portfolio-meta">
              <span class="portfolio-cat">${escapeHtml(item.category || '')}</span>
              <span class="portfolio-domain">${escapeHtml(item.domain || '')}</span>
            </div>
            <h3>${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.description || '')}</p>
            <p class="portfolio-result">${escapeHtml(item.result || '')}</p>
            <div class="portfolio-tags">${(item.services || []).map((service) => `<span>${escapeHtml(service)}</span>`).join('')}</div>
            <div class="portfolio-cta">
              <span class="portfolio-open-note">${escapeHtml(state.ui.portfolio.openNote)}</span>
              <span class="portfolio-link">${escapeHtml(state.ui.portfolio.cta)} <i data-lucide="arrow-up-right"></i></span>
            </div>
          </div>
        </a>
      `;
    })
    .join('');
  enhancePortfolioCards();
}

function renderWhyUs() {
  refs.whyUsGrid.innerHTML = state.content.whyUs
    .map(
      (item) => `
        <div class="whyus-card reveal">
          <i data-lucide="${escapeHtml(item.icon)}"></i>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      `
    )
    .join('');
}

function totalQuizSteps() {
  return state.content.quizSteps.length + 1;
}

function getQuizStepDefinition(stepIndex = state.quiz.step) {
  return state.content.quizSteps[stepIndex] || null;
}

function getQuizOptionLabel(stepId, optionId) {
  const step = state.content.quizSteps.find((item) => item.id === stepId);
  const option = step?.options.find((item) => item.id === optionId);
  return option?.label || optionId;
}

function renderQuiz() {
  const quizUi = state.ui.quiz;
  refs.quizProgressBar.style.width = `${Math.round(((state.quiz.step + (state.quiz.done ? 1 : 0)) / totalQuizSteps()) * 100)}%`;
  refs.quizBack.style.visibility = state.quiz.step === 0 || state.quiz.done ? 'hidden' : 'visible';
  refs.quizNext.disabled = state.quiz.submitting;

  if (state.quiz.done) {
    refs.quizBody.innerHTML = `
      <div class="quiz-success">
        <i data-lucide="check-circle-2"></i>
        <h3>${escapeHtml(quizUi.successTitle)}</h3>
        <p>${escapeHtml(quizUi.successBody)}</p>
      </div>
    `;
    refs.quizNav.style.display = 'none';
    return;
  }

  refs.quizNav.style.display = '';

  if (state.quiz.step < state.content.quizSteps.length) {
    const step = getQuizStepDefinition();
    const selected = state.quiz.answers[step.id] || (step.multi ? [] : '');
    refs.quizBody.innerHTML = `
      <p class="quiz-question">${escapeHtml(step.question)}</p>
      <div class="quiz-options">
        ${step.options
          .map((option) => {
            const isSelected = step.multi ? selected.includes(option.id) : selected === option.id;
            return `<button type="button" class="quiz-option ${isSelected ? 'selected' : ''}" data-quiz-option="${escapeHtml(option.id)}"><i data-lucide="${escapeHtml(option.icon)}"></i>${escapeHtml(option.label)}</button>`;
          })
          .join('')}
      </div>
      <p class="quiz-error" id="quizError">${escapeHtml(quizUi.chooseOne)}</p>
    `;
    refs.quizNext.textContent = quizUi.next;
    return;
  }

  const contact = state.quiz.answers.contact || {};
  refs.quizBody.innerHTML = `
    <p class="quiz-question">${escapeHtml(quizUi.contactTitle)}</p>
    <div class="quiz-form">
      <div class="quiz-field"><label>${escapeHtml(quizUi.labels.name)}</label><input id="qName" type="text" value="${escapeHtml(contact.name || '')}" autocomplete="name" /></div>
      <div class="quiz-field"><label>${escapeHtml(quizUi.labels.phone)}</label><input id="qPhone" type="tel" value="${escapeHtml(contact.phone || '')}" autocomplete="tel" /></div>
      <div class="quiz-field"><label>${escapeHtml(quizUi.labels.email)}</label><input id="qEmail" type="email" value="${escapeHtml(contact.email || '')}" autocomplete="email" /></div>
      <div class="quiz-field"><label>${escapeHtml(quizUi.labels.website)}</label><input id="qWebsite" type="text" value="${escapeHtml(contact.website || '')}" placeholder="${escapeHtml(quizUi.placeholders.website)}" /></div>
      <div class="quiz-field full"><label>${escapeHtml(quizUi.labels.message)}</label><textarea id="qMessage" placeholder="${escapeHtml(quizUi.placeholders.message)}">${escapeHtml(contact.message || '')}</textarea></div>
    </div>
    <p class="quiz-error" id="quizError">${escapeHtml(quizUi.contactError)}</p>
  `;
  refs.quizNext.textContent = state.quiz.submitting ? quizUi.submitting : quizUi.submit;
}

function quizErrorElement() {
  return document.getElementById('quizError');
}

function showQuizError(message) {
  const node = quizErrorElement();
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
}

function hideQuizError() {
  quizErrorElement()?.classList.remove('show');
}

function collectContact() {
  return {
    name: document.getElementById('qName')?.value.trim() || '',
    phone: document.getElementById('qPhone')?.value.trim() || '',
    email: document.getElementById('qEmail')?.value.trim() || '',
    website: document.getElementById('qWebsite')?.value.trim() || '',
    message: document.getElementById('qMessage')?.value.trim() || ''
  };
}

function prefillQuizFromService(serviceId) {
  if (!serviceId) return;
  const service = state.serviceCategories.flatMap((category) => category.services).find((item) => item.id === serviceId);
  if (!service) return;
  const currentMessage = state.quiz.answers.contact?.message || '';
  if (currentMessage.toLowerCase().includes(service.name.toLowerCase())) return;
  state.quiz.answers.contact = {
    ...(state.quiz.answers.contact || {}),
    message: `${service.name}${currentMessage ? ` — ${currentMessage}` : ''}`
  };
}

async function submitLead() {
  if (state.quiz.submitting) return;
  const contact = collectContact();
  state.quiz.answers.contact = contact;

  if (!contact.name || (!contact.phone && !contact.email)) {
    showQuizError(state.ui.quiz.contactError);
    return;
  }

  hideQuizError();
  state.quiz.submitting = true;
  renderQuiz();
  refs.quizNext.innerHTML = `<span class="spinner"></span> ${escapeHtml(state.ui.quiz.submitting)}`;

  const payload = {
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    website: contact.website,
    message: contact.message,
    selectedServices: (state.quiz.answers.need || []).map((id) => getQuizOptionLabel('need', id)),
    businessType: getQuizOptionLabel('businessType', state.quiz.answers.businessType || ''),
    hasWebsite: getQuizOptionLabel('hasWebsite', state.quiz.answers.hasWebsite || ''),
    goal: getQuizOptionLabel('goal', state.quiz.answers.goal || ''),
    budget: getQuizOptionLabel('budget', state.quiz.answers.budget || ''),
    source: 'aura-global-site',
    language: state.language
  };

  try {
    await apiBootstrapStarted;
    const response = await fetch(apiUrl('/api/site-leads'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Request failed (${response.status}).`);
    }
    state.quiz.done = true;
    renderSite();
  } catch (error) {
    showQuizError(error.message || state.ui.quiz.submitError);
  } finally {
    state.quiz.submitting = false;
    if (!state.quiz.done) renderQuiz();
  }
}

function goNext() {
  if (state.quiz.done) return;
  if (state.quiz.step < state.content.quizSteps.length) {
    const step = getQuizStepDefinition();
    const answer = state.quiz.answers[step.id];
    const hasAnswer = step.multi ? (answer || []).length > 0 : Boolean(answer);
    if (!hasAnswer) {
      showQuizError(state.ui.quiz.chooseOne);
      return;
    }
    state.quiz.step += 1;
    hideQuizError();
    renderSite();
    return;
  }
  submitLead();
}

function goBack() {
  if (state.quiz.step > 0) {
    if (state.quiz.step === state.content.quizSteps.length) state.quiz.answers.contact = collectContact();
    state.quiz.step -= 1;
    renderSite();
  }
}

function renderHeroOrbitCards() {
  const icons = ['monitor', 'search', 'map-pin', 'mouse-pointer-click', 'bot', 'workflow', 'database', 'users'];
  const labels = state.ui.orbit || [];
  const box = document.getElementById('heroOrbitCards');
  box.innerHTML = icons
    .map((icon, index) => `<div class="orbit-card"><i data-lucide="${icon}"></i>${escapeHtml(labels[index] || '')}</div>`)
    .join('');
}

function renderSite() {
  renderStaticSections();
  renderMarquee();
  renderStory();
  renderServiceTabs();
  renderServiceGrid();
  renderPricing();
  renderProcess();
  renderPortfolio();
  renderWhyUs();
  renderQuiz();
  renderHeroOrbitCards();
  renderServiceModal();
  updateMeta();
  observeReveals(document);
  refreshIcons();
}

function findServiceByCompositeKey(value) {
  const [categoryId, serviceId] = String(value || '').split(':');
  return getServiceById(categoryId, serviceId);
}

function openServiceModal(categoryId, serviceId) {
  state.selectedServiceCategoryId = categoryId;
  state.selectedServiceId = serviceId;
  renderServiceModal();
  refs.serviceModal.classList.add('open');
  refs.serviceModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  refreshIcons();
}

function closeServiceModal() {
  refs.serviceModal.classList.remove('open');
  refs.serviceModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
}

function enhancePortfolioCards() {
  const cards = [...document.querySelectorAll('[data-portfolio-card]')];
  for (const card of cards) {
    const clearCardState = () => {
      card.style.removeProperty('transform');
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
      card.classList.remove('is-pressed');
    };

    card.addEventListener('pointerdown', () => card.classList.add('is-pressed'));
    card.addEventListener('pointerup', () => card.classList.remove('is-pressed'));
    card.addEventListener('pointercancel', clearCardState);
    card.addEventListener('pointerleave', clearCardState);

    if (prefersReducedMotion) continue;

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - py) * 8;
      const rotateY = (px - 0.5) * 12;
      card.style.setProperty('--glow-x', `${Math.round(px * 100)}%`);
      card.style.setProperty('--glow-y', `${Math.round(py * 100)}%`);
      card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
    });
  }
}

function updateLanguage(language, options = {}) {
  const next = normalizeLanguage(language) || 'pl';
  if (next === state.language && !options.force) return;
  internalLanguageChange = true;
  i18nApi.setLanguage?.(next, { persist: options.persist !== false });
  internalLanguageChange = false;
  syncLanguageUrl(next);
  ensurePageData(next);
  renderSite();
}

function setMobileMenuOpen(open) {
  state.mobileMenuOpen = Boolean(open);
  refs.mobileMenu.hidden = !state.mobileMenuOpen;
  refs.navMenuToggle.setAttribute('aria-expanded', state.mobileMenuOpen ? 'true' : 'false');
  document.body.classList.toggle('menu-open', state.mobileMenuOpen);
  if (!refs.serviceModal.classList.contains('open')) {
    document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
  }
  setText(refs.navMenuLabel, state.mobileMenuOpen ? state.ui.nav.closeMenu : state.ui.nav.openMenu);
  refreshIcons();
}

function initNavigation() {
  window.addEventListener(
    'scroll',
    () => {
      refs.nav.classList.toggle('scrolled', window.scrollY > 30);
    },
    { passive: true }
  );

  refs.navMenuToggle.addEventListener('click', () => setMobileMenuOpen(!state.mobileMenuOpen));
  refs.mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('[data-mobile-menu-close]') || event.target.closest('#mobileMenuClose') || event.target.closest('[data-mobile-nav-link]')) {
      setMobileMenuOpen(false);
    }
  });
}

function initLanguageControls() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-set-language]');
    if (!button) return;
    updateLanguage(button.dataset.setLanguage, { persist: true });
  });
}

function initServices() {
  refs.serviceTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cat]');
    if (!button) return;
    state.activeCategory = button.dataset.cat;
    renderSite();
  });

  refs.serviceGrid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-service]');
    if (!card) return;
    const [categoryId, serviceId] = String(card.dataset.service || '').split(':');
    openServiceModal(categoryId, serviceId);
  });

  refs.serviceModal.addEventListener('click', (event) => {
    if (event.target.closest('[data-modal-close]')) closeServiceModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (refs.serviceModal.classList.contains('open')) closeServiceModal();
      if (state.mobileMenuOpen) setMobileMenuOpen(false);
    }
  });
}

function initQuiz() {
  refs.quizBody.addEventListener('click', (event) => {
    const optionButton = event.target.closest('[data-quiz-option]');
    if (!optionButton) return;
    const step = getQuizStepDefinition();
    if (!step) return;
    const value = optionButton.dataset.quizOption;
    if (step.multi) {
      const current = state.quiz.answers[step.id] || [];
      state.quiz.answers[step.id] = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      renderSite();
      return;
    }
    state.quiz.answers[step.id] = value;
    renderSite();
    window.setTimeout(goNext, 180);
  });

  refs.quizNext.addEventListener('click', goNext);
  refs.quizBack.addEventListener('click', goBack);

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-quiz-open], [data-quiz-service-id]');
    if (!trigger) return;
    const serviceId = trigger.dataset.quizServiceId || '';
    if (serviceId) prefillQuizFromService(serviceId);
  });
}

function initMagneticButtons() {
  if (isMobileViewport() || prefersReducedMotion) return;
  document.addEventListener('mousemove', (event) => {
    const button = event.target.closest('.magnetic');
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });
  document.addEventListener(
    'mouseleave',
    (event) => {
      const button = event.target.closest?.('.magnetic');
      if (button) button.style.transform = '';
    },
    true
  );
}

function initExternalLanguageChanges() {
  document.addEventListener('aura-language-changed', (event) => {
    if (internalLanguageChange) return;
    const next = normalizeLanguage(event.detail?.language);
    if (!next || next === state.language) return;
    ensurePageData(next);
    renderSite();
  });
}

function initHeroEngine() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let rotation = 0;
  let rafId = 0;
  let visible = true;

  const pointCount = isMobileViewport() ? 90 : 220;
  const radiusFactor = isMobileViewport() ? 0.3 : 0.24;
  const points = [];
  for (let index = 0; index < pointCount; index += 1) {
    const phi = Math.acos(1 - (2 * (index + 0.5)) / pointCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    points.push({
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi),
      tw: Math.random() * Math.PI * 2
    });
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height * 0.42;
    const radius = Math.min(width, height) * radiusFactor;

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    rotation += 0.0022;

    const tiltX = mouseY * 0.35;
    const rotY = rotation + mouseX * 0.4;

    ctx.save();
    ctx.translate(cx, cy);
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.save();
      ctx.rotate((ring * Math.PI) / 5 + rotation * (ring % 2 ? -0.6 : 0.8));
      ctx.scale(1, 0.32 + ring * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (1.35 + ring * 0.22), 0, Math.PI * 2);
      ctx.strokeStyle = ring === 1 ? 'rgba(68,215,255,0.10)' : 'rgba(64,255,156,0.10)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    const projected = [];
    for (const point of points) {
      let x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
      let z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
      let y = point.y;
      const y2 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
      const z2 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
      const scale = 1 / (1.7 - z2 * 0.55);
      projected.push({
        sx: cx + x * radius * scale,
        sy: cy + y2 * radius * scale,
        depth: z2,
        tw: point.tw
      });
    }

    ctx.lineWidth = 0.6;
    const step = isMobileViewport() ? 4 : 3;
    for (let index = 0; index < projected.length; index += step) {
      const a = projected[index];
      if (a.depth < 0) continue;
      for (let inner = index + step; inner < Math.min(index + step * 6, projected.length); inner += step) {
        const b = projected[inner];
        if (b.depth < 0) continue;
        const dx = a.sx - b.sx;
        const dy = a.sy - b.sy;
        const distance = dx * dx + dy * dy;
        const maxDistance = radius * radius * 0.32;
        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.22;
          ctx.strokeStyle = `rgba(64,255,156,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }
    }

    for (const point of projected) {
      const front = point.depth > 0;
      const twinkle = 0.6 + 0.4 * Math.sin(time * 0.001 + point.tw);
      const size = front ? 1.9 * twinkle : 1.1;
      const alpha = front ? 0.75 * twinkle : 0.18;
      ctx.beginPath();
      ctx.arc(point.sx, point.sy, size, 0, Math.PI * 2);
      ctx.fillStyle = front
        ? `rgba(64,255,156,${alpha.toFixed(3)})`
        : `rgba(68,215,255,${alpha.toFixed(3)})`;
      ctx.fill();
    }

    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.55);
    coreGradient.addColorStop(0, 'rgba(64,255,156,0.16)');
    coreGradient.addColorStop(0.55, 'rgba(64,255,156,0.05)');
    coreGradient.addColorStop(1, 'rgba(64,255,156,0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop(time = 0) {
    if (!visible) {
      rafId = 0;
      return;
    }
    draw(time);
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  if (!isMobileViewport()) {
    window.addEventListener(
      'mousemove',
      (event) => {
        targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !rafId && !prefersReducedMotion) loop();
    },
    { threshold: 0.02 }
  ).observe(canvas);

  if (prefersReducedMotion) draw(0);
  else loop();
}

function initOrbitAnimation() {
  if (prefersReducedMotion) return;
  const container = document.getElementById('heroOrbitCards');
  let angle = 0;

  function place() {
    const cards = [...container.children];
    const total = cards.length || 1;
    angle += 0.0032;
    const rect = container.getBoundingClientRect();
    const rx = Math.min(rect.width, 1100) * 0.36;
    const ry = rx * 0.36;
    cards.forEach((card, index) => {
      const currentAngle = angle + (index / total) * Math.PI * 2;
      const x = Math.cos(currentAngle) * rx;
      const y = Math.sin(currentAngle) * ry;
      const depth = (Math.sin(currentAngle) + 1) / 2;
      card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${0.8 + depth * 0.3})`;
      card.style.opacity = (0.35 + depth * 0.65).toFixed(2);
      card.style.zIndex = depth > 0.5 ? 3 : 1;
    });
    requestAnimationFrame(place);
  }

  place();
}

ensurePageData(state.language);
renderSite();
initNavigation();
initLanguageControls();
initServices();
initQuiz();
initMagneticButtons();
initExternalLanguageChanges();
initHeroEngine();
initOrbitAnimation();

window.addEventListener('load', refreshIcons);
