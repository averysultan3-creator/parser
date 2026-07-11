import { getServiceCategories } from './data/services.js';
import { getSiteContent } from './data/content.js';
import { getPortfolioProjects, getProjectById } from './data/portfolio.js';
import { getSiteCopy, SUPPORTED_LANGUAGES } from './data/site-copy.js';

const SITE_ORIGIN = 'https://parser.auraglobal-merchants.com';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
let heroInteractionAbort = null;
let portfolioInteractionAbort = null;
let lastRenderedRouteKey = '';
const refs = {
  header: document.getElementById('siteHeader'),
  desktopNav: document.getElementById('desktopNav'),
  desktopLanguages: document.getElementById('desktopLanguages'),
  menuToggle: document.getElementById('menuToggle'),
  mobileMenu: document.getElementById('mobileMenu'),
  mobileNav: document.getElementById('mobileNav'),
  mobileLanguages: document.getElementById('mobileLanguages'),
  app: document.getElementById('siteApp'),
  footer: document.getElementById('siteFooter'),
  quickView: document.getElementById('quickView'),
  quickViewContent: document.getElementById('quickViewContent'),
  live: document.getElementById('liveRegion'),
  metaDescription: document.getElementById('metaDescription'),
  canonical: document.getElementById('canonicalLink'),
  ogTitle: document.getElementById('ogTitle'),
  ogDescription: document.getElementById('ogDescription'),
  ogUrl: document.getElementById('ogUrl'),
  twitterTitle: document.getElementById('twitterTitle'),
  twitterDescription: document.getElementById('twitterDescription'),
  structuredData: document.getElementById('structuredData')
};

const state = {
  language: detectLanguage(),
  activeServiceCategory: 'web',
  menuOpen: false,
  quickProject: null,
  quickTrigger: null,
  menuTrigger: null,
  lead: {
    step: 0,
    answers: { tasks: [], goal: '', context: '', budget: '', name: '', phone: '', email: '', website: '', message: '', companyFax: '' },
    context: { service: '', package: '', project: '' },
    error: '',
    loading: false,
    success: false
  }
};

function detectLanguage() {
  const normalize = (value) => {
    const base = String(value || '').trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(base)) return base;
    return ['uk', 'be', 'kk'].includes(base) ? 'ru' : '';
  };
  const fromUrl = normalize(new URLSearchParams(location.search).get('lang'));
  const fromStorage = ['auraSiteLanguage', 'auraLanguage', 'parserLanguage']
    .map((key) => { try { return normalize(localStorage.getItem(key)); } catch { return ''; } })
    .find(Boolean);
  const fromBrowser = [...(navigator.languages || []), navigator.language].map(normalize).find(Boolean);
  return fromUrl || fromStorage || fromBrowser || 'pl';
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function data() {
  const content = getSiteContent(state.language);
  return {
    copy: getSiteCopy(state.language),
    content,
    projects: getPortfolioProjects(state.language),
    categories: getServiceCategories(state.language)
  };
}

function serviceHref(slug) {
  return withLanguage(`/services/${encodeURIComponent(slug)}`);
}

function projectHref(slug) {
  return withLanguage(`/portfolio/${encodeURIComponent(slug)}`);
}

function homeHref(hash = '') {
  return withLanguage('/site/', hash);
}

function withLanguage(path, hash = '') {
  const url = new URL(path, location.origin);
  url.searchParams.set('lang', state.language);
  url.hash = hash.replace(/^#/, '');
  return `${url.pathname}${url.search}${url.hash}`;
}

function route() {
  const parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const portfolioIndex = parts.lastIndexOf('portfolio');
  const serviceIndex = parts.lastIndexOf('services');
  if (portfolioIndex >= 0) return parts[portfolioIndex + 1] ? { type: 'project', slug: parts[portfolioIndex + 1] } : { type: 'portfolio' };
  if (serviceIndex >= 0) return parts[serviceIndex + 1] ? { type: 'service', slug: parts[serviceIndex + 1] } : { type: 'services' };
  return { type: 'home' };
}

function renderHeader(copy) {
  const currentRoute = route();
  const nav = [
    [homeHref('portfolio'), copy.nav.portfolio, ['portfolio', 'project']],
    [homeHref('services'), copy.nav.services, ['services', 'service']],
    [homeHref('process'), copy.nav.process, []],
    [homeHref('packages'), copy.nav.pricing, []]
  ];
  const links = nav.map(([href, label, routeTypes]) => {
    const active = routeTypes.includes(currentRoute.type);
    return `<a href="${href}" class="${active ? 'is-active' : ''}" ${active ? 'aria-current="page"' : ''}>${escapeHtml(label)}</a>`;
  }).join('');
  refs.desktopNav.innerHTML = links;
  refs.mobileNav.innerHTML = links;
  const languageButtons = SUPPORTED_LANGUAGES.map((language) => `<button type="button" data-language="${language}" aria-pressed="${language === state.language}">${language.toUpperCase()}</button>`).join('');
  refs.desktopLanguages.innerHTML = languageButtons;
  refs.mobileLanguages.innerHTML = languageButtons;
  refs.menuToggle.setAttribute('aria-label', state.menuOpen ? copy.nav.close : copy.nav.open);
  refs.menuToggle.setAttribute('aria-expanded', String(state.menuOpen));
  const headerCta = document.querySelector('.header-brief');
  if (headerCta) headerCta.textContent = copy.nav.cta;
  const menuCta = refs.mobileMenu.querySelector('[data-lead-open]');
  if (menuCta) menuCta.textContent = copy.nav.cta;
}

function renderFooter(copy, contact) {
  refs.footer.innerHTML = `
    <div class="container footer-inner">
      <div class="footer-brand">
        <a class="brand" href="${homeHref()}"><span>Aura</span><em>Global</em></a>
        <p>${escapeHtml(contact.tagline || copy.common.footer)}</p>
      </div>
      <div class="footer-column">
        <h3>${escapeHtml(copy.common.navigation)}</h3>
        <a href="${homeHref('portfolio')}">${escapeHtml(copy.common.portfolio)}</a>
        <a href="${homeHref('services')}">${escapeHtml(copy.common.services)}</a>
        <a href="${homeHref('brief')}">${escapeHtml(copy.common.brief)}</a>
      </div>
      <div class="footer-column">
        <h3>${escapeHtml(copy.common.contact)}</h3>
        <a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a>
        <a href="tel:${escapeAttr(String(contact.phone || '').replace(/\s/g, ''))}">${escapeHtml(contact.phone)}</a>
      </div>
      <div class="footer-meta"><span>© ${new Date().getFullYear()} Aura Global</span><span>${escapeHtml(copy.common.footer)}</span></div>
    </div>`;
}

function renderHome(view) {
  const { copy, projects, content } = view;
  const packageItems = packageData(content.packages, copy);
  return `
    <section class="hero" id="top">
      <div class="container hero-layout">
        <div class="hero-copy">
          <p class="eyebrow hero-intro hero-intro-eyebrow">${escapeHtml(copy.hero.eyebrow)}</p>
          <h1 class="hero-title">${heroTitle(copy.hero.title)}</h1>
          <p class="hero-subtitle hero-intro hero-intro-subtitle">${escapeHtml(copy.hero.subtitle)}</p>
          <div class="hero-actions hero-intro hero-intro-actions">
            <a class="button button-dark button-large" href="#brief" data-lead-open>${escapeHtml(copy.hero.primary)}</a>
            <a class="button button-ghost button-large" href="#portfolio">${escapeHtml(copy.hero.secondary)}</a>
          </div>
        </div>
        <div class="hero-stage" id="heroStage" aria-label="${escapeAttr(copy.hero.object)}">
          <div class="hero-geometry" aria-hidden="true"><span class="hero-geometry-circle"></span><span class="hero-geometry-diamond"></span><span class="hero-geometry-axis"></span></div>
          <div class="hero-object-shell">
            <img class="hero-object" src="/site/media/hero/aura-chameleon.webp" width="1619" height="971" alt="Aura chameleon" fetchpriority="high" decoding="async" />
            <span class="hero-color-wash" aria-hidden="true"></span>
          </div>
          <span class="hero-geometry-front" aria-hidden="true"></span>
          <span class="hero-stage-label">${escapeHtml(copy.hero.object)}</span>
        </div>
      </div>
      <div class="container hero-facts">
        <div class="hero-fact reveal"><strong>${projects.length}+</strong><span>${escapeHtml(copy.hero.facts[0])}</span></div>
        <div class="hero-fact reveal"><strong>3</strong><span>${escapeHtml(copy.hero.facts[1])}</span></div>
        <div class="hero-fact reveal"><strong>1</strong><span>${escapeHtml(copy.hero.facts[2])}</span></div>
      </div>
    </section>
    ${renderPortfolioShowcase(view)}
    ${renderTrust(copy)}
    ${renderServicesHome(view)}
    ${renderVisibility(copy)}
    ${renderProcess(copy)}
    ${renderFormats(copy)}
    ${renderPackages(copy, packageItems)}
    ${renderProof(copy, projects)}
    ${renderLead(copy, content.contactInfo)}
    ${renderFaq(copy)}
    ${renderFinal(copy, content.contactInfo)}
  `;
}

function heroTitle(title) {
  return String(title).split('\n').map((line, index, lines) => {
    const words = escapeHtml(line).split(' ');
    const target = words.findIndex((word) => /klient|customer|клиент/i.test(word));
    if (target >= 0) words[target] = `<span class="accent-word">${words[target]}</span>`;
    return `<span class="hero-title-line hero-intro" style="--intro-index:${index + 1}">${words.join(' ')}</span>`;
  }).join('');
}

function renderPortfolioShowcase(view) {
  const { copy, projects } = view;
  return `
    <section class="portfolio-section section" id="portfolio">
      <div class="container section-intro portfolio-intro">
        <div class="reveal"><p class="eyebrow">${escapeHtml(copy.portfolio.eyebrow)}</p><h2 class="section-title">${escapeHtml(copy.portfolio.title)}</h2></div>
        <p class="reveal">${escapeHtml(copy.portfolio.intro)}</p>
      </div>
      <div class="container portfolio-toolbar">
        <p class="portfolio-hint" id="portfolioHint"><span aria-hidden="true">↔</span>${escapeHtml(copy.portfolio.hint)}</p>
        <div class="portfolio-head-actions">
          <button type="button" data-portfolio-prev aria-label="${escapeAttr(copy.portfolio.previous)}">←</button>
          <p class="portfolio-counter" id="portfolioCounter"><span data-portfolio-current>01</span> / ${String(projects.length).padStart(2, '0')}</p>
          <button type="button" data-portfolio-next aria-label="${escapeAttr(copy.portfolio.next)}">→</button>
        </div>
      </div>
      <div class="container portfolio-progress" aria-hidden="true"><span data-portfolio-progress></span></div>
      <div class="portfolio-track" id="portfolioTrack" tabindex="0" aria-label="${escapeAttr(copy.portfolio.title)}">
        ${projects.map((project, index) => renderProjectCard(project, index, copy)).join('')}
      </div>
      <div class="container portfolio-footer-cta">
        <p>${escapeHtml(copy.portfolio.cta)}</p>
        <a class="button button-green" href="#brief" data-lead-open>${escapeHtml(copy.portfolio.ctaButton)}</a>
      </div>
    </section>`;
}

function renderProjectCard(project, index, copy) {
  const imageAttributes = index === 0
    ? `src="${escapeAttr(project.cover)}" loading="eager" fetchpriority="high"`
    : `data-src="${escapeAttr(project.cover)}" loading="lazy"`;
  return `<article class="project-card" data-project-card data-project-id="${escapeAttr(project.id)}">
    <button class="project-card-open project-media" type="button" data-quick-view="${escapeAttr(project.id)}" aria-label="${escapeAttr(`${copy.portfolio.quick}: ${project.title}`)}"><img data-project-image ${imageAttributes} alt="${escapeAttr(`${project.title} — ${project.category}`)}" width="1600" height="1000" decoding="async" sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1180px) 78vw, 760px" /><span class="project-media-action">${escapeHtml(copy.portfolio.projectLink)} →</span></button>
    <div class="project-card-body"><div><p class="project-kicker">${escapeHtml(project.category)}</p><h3>${escapeHtml(project.title)}</h3><p class="project-card-summary"><span>${escapeHtml(copy.portfolio.created)}:</span> ${escapeHtml(project.services.slice(0, 3).join(' · '))}</p></div>
      <div class="project-card-actions"><a href="${projectHref(project.slug)}">${escapeHtml(copy.portfolio.case)} →</a><a href="${escapeAttr(project.projectUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.portfolio.site)}</a></div>
    </div>
  </article>`;
}

function renderTrust(copy) {
  return `<section class="trust-section section" id="approach"><div class="container trust-layout"><div class="reveal"><p class="eyebrow">${escapeHtml(copy.trust.eyebrow)}</p><h2 class="trust-statement">${copy.trust.statement}</h2><p class="trust-intro">${escapeHtml(copy.trust.intro)}</p></div><div class="trust-principles reveal">${copy.trust.items.map(([number, title, text]) => `<article class="trust-principle"><span>${number}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div></article>`).join('')}</div></div></section>`;
}

function renderServicesHome(view) {
  const { copy, categories } = view;
  const category = categories.find((item) => item.id === state.activeServiceCategory) || categories[0];
  return `<section class="services-section section" id="services"><div class="container"><div class="section-intro"><div class="reveal"><p class="eyebrow">${escapeHtml(copy.services.eyebrow)}</p><h2 class="section-title">${escapeHtml(copy.services.title)}</h2></div><p class="reveal">${escapeHtml(copy.services.intro)}</p></div>
    <div class="service-tabs" role="tablist" aria-label="${escapeAttr(copy.services.eyebrow)}">${categories.map((item) => `<button class="service-tab" type="button" data-service-category="${escapeAttr(item.id)}" role="tab" aria-selected="${item.id === category.id}" tabindex="${item.id === category.id ? '0' : '-1'}">${escapeHtml(item.label)}</button>`).join('')}</div>
    <div class="service-grid" id="serviceGrid">${category.services.map((service, index) => renderServiceCard(service, index, copy)).join('')}</div>
    <div class="service-section-cta"><p>${escapeHtml(copy.services.cta)}</p><a class="button button-dark" href="#brief" data-lead-open>${escapeHtml(copy.services.ctaButton)}</a></div>
  </div></section>`;
}

function renderServiceCard(service, index, copy) {
  return `<a class="service-card" href="${serviceHref(service.slug)}" data-service-card="${escapeAttr(service.id)}"><span class="service-card-num">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.short)}</p></div><div class="service-card-meta"><span>${escapeHtml(service.price)}</span><span>${escapeHtml(copy.services.details)}</span></div></a>`;
}

function renderVisibility(copy) {
  return `<section class="visibility-section section" id="visibility"><div class="container"><div class="section-intro"><div class="reveal"><p class="eyebrow">${escapeHtml(copy.visibility.eyebrow)}</p><h2 class="section-title">${escapeHtml(copy.visibility.title)}</h2></div><p class="reveal">${escapeHtml(copy.visibility.intro)}</p></div><div class="visibility-experience reveal"><div class="visibility-search"><p class="visibility-concept">${escapeHtml(copy.visibility.preview)}</p><div class="search-query"><span>${escapeHtml(copy.visibility.query)}</span><i></i></div><div class="visibility-channels">${copy.visibility.channels.map((channel) => `<span>${escapeHtml(channel)}</span>`).join('')}</div><div class="search-result"><small>${escapeHtml(copy.visibility.resultLabel)}</small><strong>${escapeHtml(copy.visibility.resultTitle)}</strong><p>${escapeHtml(copy.visibility.resultText)}</p></div></div><div class="visibility-route">${copy.visibility.stages.map(([label, text], index) => `<article class="visibility-step"><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(label)}</h3><p>${escapeHtml(text)}</p></div></article>`).join('')}</div><aside class="visibility-offer"><p>${escapeHtml(copy.visibility.scopeTitle)}</p><ul>${copy.visibility.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></aside></div><div class="visibility-actions"><p>${escapeHtml(copy.visibility.note)}</p><a class="button button-green" href="#brief" data-lead-open data-lead-service="geoai">${escapeHtml(copy.visibility.cta)}</a></div></div></section>`;
}

function renderProcess(copy) {
  return `<section class="section" id="process"><div class="container"><p class="eyebrow reveal">${escapeHtml(copy.process.eyebrow)}</p><h2 class="section-title reveal">${escapeHtml(copy.process.title)}</h2><div class="process-list">${copy.process.steps.map(([n, title, text]) => `<article class="process-step reveal"><span>${n}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join('')}</div></div></section>`;
}

function renderFormats(copy) {
  return `<section class="formats-section section" id="formats"><div class="container"><p class="eyebrow reveal">${escapeHtml(copy.formats.eyebrow)}</p><h2 class="section-title reveal">${escapeHtml(copy.formats.title)}</h2><div class="formats-grid">${copy.formats.items.map(([n, title, text]) => `<article class="format-item reveal"><span>${n}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join('')}</div></div></section>`;
}

function packageData(packages, copy) {
  return (packages || []).map((item) => {
    const price = item.id === 'start' ? (state.language === 'ru' ? 'от 500 EUR' : state.language === 'en' ? 'from 500 EUR' : 'od 500 EUR') : item.id === 'growth' ? (state.language === 'ru' ? 'от 900 EUR' : state.language === 'en' ? 'from 900 EUR' : 'od 900 EUR') : (state.language === 'ru' ? 'индивидуальный расчёт' : state.language === 'en' ? 'custom quote' : 'wycena indywidualna');
    return { ...item, price, select: copy.packages.select };
  });
}

function renderPackages(copy, packages) {
  return `<section class="pricing-section section" id="packages"><div class="container"><div class="section-intro"><div class="reveal"><p class="eyebrow">${escapeHtml(copy.packages.eyebrow)}</p><h2 class="section-title">${escapeHtml(copy.packages.title)}</h2></div><p class="reveal">${escapeHtml(copy.packages.intro)}</p></div><div class="pricing-grid">${packages.map((item, index) => `<article class="pricing-item ${item.highlighted ? 'is-featured' : ''} reveal"><p class="pricing-item-kicker">0${index + 1} / ${escapeHtml(item.name)}</p><h3>${escapeHtml(item.name)}</h3><p class="pricing-value">${escapeHtml(item.price)}</p><p class="pricing-result">${escapeHtml(item.tagline)}</p><ul class="pricing-features">${item.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul><a class="button button-dark" href="#brief" data-lead-open data-lead-package="${escapeAttr(item.id)}">${escapeHtml(item.select)}</a></article>`).join('')}</div><p class="pricing-note">${escapeHtml(copy.packages.note)}</p></div></section>`;
}

function renderProof(copy, projects) {
  return `<section class="proof-section section"><div class="container"><div class="proof-header"><div class="reveal"><p class="eyebrow">${escapeHtml(copy.proof.eyebrow)}</p><h2 class="section-title">${escapeHtml(copy.proof.title)}</h2></div><p class="reveal">${escapeHtml(copy.proof.intro)}</p></div><div class="proof-list">${copy.proof.rows.map(([number, name, text]) => { const project = projects.find((item) => item.title.toLowerCase().includes(name.toLowerCase().split(' ')[0].toLowerCase())); return `<article class="proof-row"><span>${number}</span><strong>${escapeHtml(name)}</strong><p>${escapeHtml(text)}</p>${project ? `<a href="${escapeAttr(project.projectUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.portfolio.site)}</a>` : '<span></span>'}</article>`; }).join('')}</div></div></section>`;
}

function renderLead(copy, contact) {
  const lead = state.lead;
  const chip = renderLeadContext(copy);
  const form = lead.success ? renderLeadSuccess(copy, contact) : renderLeadForm(copy);
  return `<section class="lead-section section" id="brief"><div class="container lead-layout"><div class="lead-copy"><p class="eyebrow">${escapeHtml(copy.lead.eyebrow)}</p><h2>${escapeHtml(copy.lead.title)}</h2><p>${escapeHtml(copy.lead.body)}</p>${chip}</div><div class="lead-shell">${form}</div></div></section>`;
}

function renderLeadContext(copy) {
  const values = Object.entries(state.lead.context).filter(([, value]) => value);
  if (!values.length) return '';
  return `<div class="lead-context">${values.map(([type, value]) => `<span class="context-chip">${escapeHtml(contextLabel(type, value, copy))}<button type="button" data-lead-context-clear="${type}" aria-label="${escapeAttr(copy.common.close)}">×</button></span>`).join('')}</div>`;
}

function contextLabel(type, value, copy) {
  if (type === 'service') {
    const service = data().categories.flatMap((category) => category.services).find((item) => item.id === value || item.slug === value);
    return service?.name || value;
  }
  if (type === 'project') return data().projects.find((item) => item.id === value)?.title || value;
  if (type === 'package') return String(value).replace(/^./, (letter) => letter.toUpperCase());
  return copy.common.project;
}

function renderLeadForm(copy) {
  const { lead } = state;
  const step = lead.step;
  const progress = `${((step + 1) / 5) * 100}%`;
  return `<form id="leadForm" novalidate><div class="lead-progress-row"><p>${escapeHtml(copy.lead.progress)} ${step + 1}/5</p><div class="lead-progress" style="--progress:${progress}"><span></span></div></div>${renderLeadStep(copy, step)}${lead.error ? `<p class="lead-error" role="alert">${escapeHtml(lead.error)}</p>` : ''}<div class="lead-nav">${step > 0 ? `<button class="button button-ghost" type="button" data-lead-back>${escapeHtml(copy.lead.back)}</button>` : '<span></span>'}<button class="button button-dark" type="button" data-lead-next ${lead.loading ? 'disabled' : ''}>${escapeHtml(lead.loading ? copy.lead.loading : step === 4 ? copy.lead.send : copy.lead.next)}</button></div></form>`;
}

function renderLeadStep(copy, step) {
  const answers = state.lead.answers;
  if (step === 0) return optionStep(copy.lead.task, answers.tasks, true, 'task');
  if (step === 1) return optionStep(copy.lead.goal, answers.goal, false, 'goal');
  if (step === 2) return `<div class="lead-step"><h3>${escapeHtml(copy.lead.context[0])}</h3><p class="lead-step-intro">${escapeHtml(copy.lead.context[1])}</p><div class="field-grid"><label class="field field-full"><span>${escapeHtml(copy.lead.context[0])}</span><textarea id="leadContext" data-lead-field="context" required>${escapeHtml(answers.context)}</textarea></label><label class="field field-full"><span>${escapeHtml(copy.lead.labels.website)}</span><input data-lead-field="website" type="url" inputmode="url" value="${escapeAttr(answers.website)}" /></label></div></div>`;
  if (step === 3) return optionStep(copy.lead.budget, answers.budget, false, 'budget');
  return `<div class="lead-step"><h3>${escapeHtml(copy.lead.contact[0])}</h3><p class="lead-step-intro">${escapeHtml(copy.lead.contact[1])}</p><div class="field-grid"><label class="field"><span>${escapeHtml(copy.lead.labels.name)}</span><input data-lead-field="name" autocomplete="name" value="${escapeAttr(answers.name)}" required /></label><label class="field"><span>${escapeHtml(copy.lead.labels.phone)}</span><input data-lead-field="phone" autocomplete="tel" inputmode="tel" value="${escapeAttr(answers.phone)}" /></label><label class="field"><span>${escapeHtml(copy.lead.labels.email)}</span><input data-lead-field="email" autocomplete="email" inputmode="email" value="${escapeAttr(answers.email)}" /></label><label class="field"><span>${escapeHtml(copy.lead.labels.message)}</span><input data-lead-field="message" value="${escapeAttr(answers.message)}" /></label><label class="honeypot"><span>Fax</span><input data-lead-field="companyFax" tabindex="-1" autocomplete="off" /></label></div></div>`;
}

function optionStep(definition, selected, multi, kind) {
  const [title, intro, options] = definition;
  const selectedValues = multi ? selected : [selected];
  return `<div class="lead-step"><h3>${escapeHtml(title)}</h3>${intro ? `<p class="lead-step-intro">${escapeHtml(intro)}</p>` : ''}<div class="lead-options">${options.map(([id, label]) => `<button class="lead-option" type="button" data-lead-option="${kind}:${id}" aria-pressed="${selectedValues.includes(id)}">${escapeHtml(label)}</button>`).join('')}</div></div>`;
}

function renderLeadSuccess(copy, contact) {
  return `<div class="lead-success"><span class="lead-success-mark" aria-hidden="true"></span><h3>${escapeHtml(copy.lead.successTitle)}</h3><p>${escapeHtml(copy.lead.successBody)}</p><div class="lead-success-actions"><a class="button button-dark" href="tel:${escapeAttr(String(contact.phone || '').replace(/\s/g, ''))}">${escapeHtml(copy.lead.call)}</a><a class="button button-ghost" href="mailto:${escapeAttr(contact.email)}">${escapeHtml(copy.lead.email)}</a></div></div>`;
}

function renderFaq(copy) {
  return `<section class="faq-section section" id="faq"><div class="container faq-layout"><div class="reveal"><p class="eyebrow">${escapeHtml(copy.faq.eyebrow)}</p><h2 class="section-title">${escapeHtml(copy.faq.title)}</h2></div><div class="faq-list reveal">${copy.faq.items.map(([question, answer], index) => `<details class="faq-item" ${index === 0 ? 'open' : ''}><summary>${escapeHtml(question)}</summary><p class="faq-answer">${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>`;
}

function renderFinal(copy, contact) {
  return `<section class="final-cta section"><div class="container final-cta-layout"><h2 class="reveal">${escapeHtml(copy.final.title)}</h2><div class="final-cta-side reveal"><p>${escapeHtml(copy.final.body)}</p><a class="button button-green" href="#brief" data-lead-open>${escapeHtml(copy.final.button)}</a><div class="contact-links"><a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a><a href="tel:${escapeAttr(String(contact.phone || '').replace(/\s/g, ''))}">${escapeHtml(contact.phone)}</a></div></div></div></section>`;
}

function renderRouteBack(href, label) {
  return `<a class="route-back" href="${href}"><span aria-hidden="true">←</span>${escapeHtml(label)}</a>`;
}

function renderPortfolioIndex(view) {
  const { copy, projects, content } = view;
  return `<div class="route-shell portfolio-index"><section class="route-hero"><div class="container">${renderRouteBack(homeHref(), copy.route.backHome)}<div class="route-hero-grid"><h1 class="route-title">${escapeHtml(copy.route.portfolioTitle)}</h1><p class="route-lead">${escapeHtml(copy.route.portfolioIntro)}</p></div></div></section><section class="section-compact"><div class="container"><div class="bento-grid">${projects.map((project) => renderBentoCard(project)).join('')}</div></div></section>${renderLead(copy, content.contactInfo)}</div>`;
}

function renderBentoCard(project) {
  return `<article class="bento-card size-${escapeAttr(project.cardSize)}"><a class="stretched-link" href="${projectHref(project.slug)}" aria-label="${escapeAttr(project.title)}"></a><img src="${escapeAttr(project.cover)}" alt="${escapeAttr(`${project.title} — ${project.category}`)}" width="1200" height="800" loading="lazy" decoding="async" /><div class="bento-card-copy"><p>${escapeHtml(project.category)}</p><h2>${escapeHtml(project.title)}</h2></div></article>`;
}

function galleryMedia(media) {
  const items = media || [];
  const portraitIndex = items.findIndex((src) => /mobile/i.test(src));
  if (portraitIndex <= 0) return items;
  const reordered = items.slice();
  const [portrait] = reordered.splice(portraitIndex, 1);
  reordered.unshift(portrait);
  return reordered;
}

function renderProjectRoute(view, slug) {
  const { copy, content } = view;
  const project = getProjectById(slug, state.language);
  if (!project) return renderNotFound(copy);
  return `<div class="route-shell case-body">
    <section class="route-hero case-route-hero"><div class="container">
      ${renderRouteBack(withLanguage('/portfolio'), copy.route.backPortfolioLink)}
      <div class="route-hero-grid"><div><p class="eyebrow">${escapeHtml(project.category)}</p><h1 class="route-title">${escapeHtml(project.title)}</h1></div><div><p class="route-lead">${escapeHtml(project.summary)}</p><a class="text-link" href="${escapeAttr(project.projectUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.route.openSite)} ↗</a></div></div>
    </div></section>
    <div class="case-hero-media"><img src="${escapeAttr(project.cover)}" alt="${escapeAttr(`${project.title} preview`)}" width="1600" height="1000" fetchpriority="high" /></div>
    <section class="section-compact"><div class="container"><div class="case-summary-grid">
      <article class="case-summary-block"><small>${escapeHtml(copy.route.problem)}</small><h2>${escapeHtml(project.task)}</h2></article>
      <article class="case-summary-block"><small>${escapeHtml(copy.route.solution)}</small><h2>${escapeHtml(project.approach)}</h2></article>
      <article class="case-summary-block"><small>${escapeHtml(copy.route.effect)}</small><h2>${escapeHtml(project.summary)}</h2></article>
    </div><div class="case-gallery">${galleryMedia(project.media).map((media, index) => `<figure><img src="${escapeAttr(media)}" alt="${escapeAttr(`${project.title} — ${copy.portfolio.gallery} ${index + 1}`)}" width="${index === 0 ? 860 : 1200}" height="${index === 0 ? 1720 : 800}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" /></figure>`).join('')}</div></div></section>
    <section class="section case-conversion"><div class="container case-scope"><div><p class="eyebrow">${escapeHtml(copy.portfolio.work)}</p><div class="tag-list">${project.services.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><div class="case-scope-text"><h2>${escapeHtml(copy.route.similarTitle)}</h2><p>${escapeHtml(copy.route.similarBody)}</p><a class="button button-dark" href="#brief" data-lead-open data-lead-project="${escapeAttr(project.id)}">${escapeHtml(copy.route.discuss)}</a></div></div></section>
    ${renderLead(copy, content.contactInfo)}
  </div>`;
}

function renderServicesIndex(view) {
  const { copy, categories, content } = view;
  return `<div class="route-shell"><section class="route-hero"><div class="container">${renderRouteBack(homeHref(), copy.route.backHome)}<div class="route-hero-grid"><h1 class="route-title">${escapeHtml(copy.route.servicesTitle)}</h1><p class="route-lead">${escapeHtml(copy.route.servicesIntro)}</p></div></div></section><section class="section"><div class="container">${categories.map((category) => `<div class="service-index-category"><p class="eyebrow">${escapeHtml(category.label)}</p><div class="service-grid">${category.services.map((service, index) => renderServiceCard(service, index, copy)).join('')}</div></div>`).join('')}</div></section>${renderLead(copy, content.contactInfo)}</div>`;
}

function renderServiceRoute(view, slug) {
  const { copy, categories, projects, content } = view;
  const category = categories.find((item) => item.services.some((service) => service.slug === slug || service.id === slug));
  const service = category?.services.find((item) => item.slug === slug || item.id === slug);
  if (!service) return renderNotFound(copy);
  const related = service.relatedProjectSlugs.map((id) => projects.find((project) => project.id === id || project.slug === id || (id.includes('all-inn') && project.id === 'all-inn') || (id.includes('let-it-rip') && project.id === 'let-it-rip'))).filter(Boolean).slice(0, 3);
  return `<div class="route-shell"><section class="service-detail-hero route-hero"><div class="container">${renderRouteBack(withLanguage('/services'), copy.route.backServicesLink)}<p class="eyebrow">${escapeHtml(category.label)}</p><h1 class="route-title">${escapeHtml(service.name)}</h1><div class="route-hero-grid"><p class="route-lead">${escapeHtml(service.short)}</p><a class="button button-green" href="#brief" data-lead-open data-lead-service="${escapeAttr(service.id)}">${escapeHtml(copy.route.discuss)}</a></div><div class="service-detail-facts"><div class="service-detail-fact"><small>${escapeHtml(copy.route.result)}</small><strong>${escapeHtml(service.details.gives)}</strong></div><div class="service-detail-fact"><small>${escapeHtml(copy.route.duration)}</small><strong>${escapeHtml(service.duration)}</strong></div><div class="service-detail-fact"><small>${escapeHtml(copy.route.price)}</small><strong>${escapeHtml(service.price)}</strong></div></div></div></section><section class="service-content section"><div class="container service-content-grid"><aside class="service-aside"><p class="eyebrow">${escapeHtml(copy.route.forWho)}</p><h2>${escapeHtml(service.details.forWho)}</h2><p>${escapeHtml(service.details.problem)}</p><a class="button button-dark" href="#brief" data-lead-open data-lead-service="${escapeAttr(service.id)}">${escapeHtml(copy.route.discuss)}</a></aside><div><div class="service-content-block"><p class="eyebrow">${escapeHtml(copy.route.includes)}</p><ul class="deliverable-list">${service.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div class="service-content-block"><p class="eyebrow">${escapeHtml(copy.route.stages)}</p><ul class="stage-list">${service.stages.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>${related.length ? `<div class="service-content-block"><p class="eyebrow">${escapeHtml(copy.route.relevant)}</p><div class="related-projects">${related.map((project) => `<a class="related-project" href="${projectHref(project.slug)}"><img src="${escapeAttr(project.cover)}" alt="${escapeAttr(project.title)}" width="800" height="500" loading="lazy" /><span>${escapeHtml(project.title)}</span></a>`).join('')}</div></div>` : ''}<div class="service-content-block"><p class="eyebrow">${escapeHtml(copy.route.faq)}</p><div class="faq-list">${service.faq.map((item) => `<details class="faq-item"><summary>${escapeHtml(item.question)}</summary><p class="faq-answer">${escapeHtml(item.answer)}</p></details>`).join('')}</div></div></div></div></section>${renderLead(copy, content.contactInfo)}</div>`;
}

function renderNotFound(copy) {
  return `<section class="error-page"><div><strong>404</strong><h1>${escapeHtml(copy.route.notFound)}</h1><a class="button button-dark" href="${homeHref()}">Aura Global</a></div></section>`;
}

function renderQuickView(project) {
  const { copy } = data();
  refs.quickViewContent.innerHTML = `<div class="quick-view-media">${project.media.map((media, index) => `<figure><img src="${escapeAttr(media)}" alt="${escapeAttr(`${project.title} — ${copy.portfolio.gallery} ${index + 1}`)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} /></figure>`).join('')}</div><div class="quick-view-copy"><p class="eyebrow">${escapeHtml(project.category)}</p><h2 id="quickViewTitle">${escapeHtml(project.title)}</h2><p class="quick-view-lead">${escapeHtml(project.summary)}</p><div class="quick-view-blocks"><section class="quick-view-block"><small>${escapeHtml(copy.portfolio.task)}</small><p>${escapeHtml(project.task)}</p></section><section class="quick-view-block"><small>${escapeHtml(copy.portfolio.work)}</small><p>${escapeHtml(project.services.join(' · '))}</p></section><section class="quick-view-block"><small>${escapeHtml(copy.portfolio.format)}</small><p>${escapeHtml(project.technologies.join(' · '))}</p></section></div><div class="quick-view-actions"><a class="button button-dark" href="#brief" data-lead-open data-lead-project="${escapeAttr(project.id)}" data-quick-close>${escapeHtml(copy.portfolio.similar)}</a><a class="button button-ghost" href="${projectHref(project.slug)}">${escapeHtml(copy.portfolio.case)}</a><a class="button button-ghost" href="${escapeAttr(project.projectUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.portfolio.site)}</a></div></div>`;
}

function openQuickView(id, trigger) {
  const project = data().projects.find((item) => item.id === id);
  if (!project) return;
  state.quickProject = project;
  state.quickTrigger = trigger;
  renderQuickView(project);
  refs.quickView.hidden = false;
  refs.quickView.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  setTimeout(() => refs.quickView.querySelector('[data-quick-close]')?.focus(), 0);
}

function closeQuickView() {
  refs.quickView.hidden = true;
  refs.quickView.setAttribute('aria-hidden', 'true');
  state.quickProject = null;
  document.body.classList.toggle('is-locked', state.menuOpen);
  state.quickTrigger?.focus?.();
}

function setMenu(open) {
  state.menuOpen = Boolean(open);
  const { copy } = data();
  if (state.menuOpen) {
    state.menuTrigger = document.activeElement;
    refs.mobileMenu.hidden = false;
    refs.mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => refs.mobileMenu.querySelector('.icon-button')?.focus(), 0);
  } else {
    refs.mobileMenu.hidden = true;
    refs.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.toggle('is-locked', Boolean(state.quickProject));
    state.menuTrigger?.focus?.();
  }
  refs.menuToggle.setAttribute('aria-label', state.menuOpen ? copy.nav.close : copy.nav.open);
  refs.menuToggle.setAttribute('aria-expanded', String(state.menuOpen));
}

function openLead(context = {}) {
  if (context.service) state.lead.context.service = context.service;
  if (context.package) state.lead.context.package = context.package;
  if (context.project) state.lead.context.project = context.project;
  state.lead.error = '';
  if (state.lead.context.service && !state.lead.answers.tasks.includes('website')) state.lead.answers.tasks = [...state.lead.answers.tasks, 'website'];
  if (state.quickProject) closeQuickView();
  if (state.menuOpen) setMenu(false);
  render();
  document.getElementById('brief')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => document.querySelector('#leadForm button[data-lead-next]')?.focus(), 450);
}

function validateLead(copy) {
  const { step, answers } = state.lead;
  if (step === 0 && !answers.tasks.length) return copy.lead.errors.task;
  if (step === 1 && !answers.goal) return copy.lead.errors.goal;
  if (step === 2 && answers.context.trim().length < 8) return copy.lead.errors.context;
  if (step === 3 && !answers.budget) return copy.lead.errors.budget;
  if (step === 4) {
    if (!answers.name.trim()) return copy.lead.errors.name;
    const validEmail = !answers.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim());
    const validPhone = !answers.phone || answers.phone.replace(/\D/g, '').length >= 7;
    if ((!answers.phone && !answers.email) || !validEmail || !validPhone) return copy.lead.errors.contact;
  }
  return '';
}

async function submitLead() {
  const { copy } = data();
  const validation = validateLead(copy);
  if (validation) {
    state.lead.error = validation;
    render();
    return;
  }
  state.lead.loading = true;
  state.lead.error = '';
  render();
  const params = new URLSearchParams(location.search);
  const answers = state.lead.answers;
  const selectedService = state.lead.context.service;
  const selectedPackage = state.lead.context.package;
  const selectedProject = state.lead.context.project;
  const payload = {
    name: answers.name.trim(), phone: answers.phone.trim(), email: answers.email.trim(), website: answers.website.trim(),
    businessType: answers.context.trim(), context: answers.context.trim(), goal: answers.goal, budget: answers.budget,
    format: selectedPackage || answers.budget, selectedServices: [...new Set([...answers.tasks, selectedService].filter(Boolean))],
    selectedService, selectedPackage, selectedProject, message: answers.message.trim(), companyFax: answers.companyFax,
    landingPage: location.href, referrer: document.referrer || '', utmSource: params.get('utm_source') || '', utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '', utmContent: params.get('utm_content') || '', utmTerm: params.get('utm_term') || ''
  };
  try {
    const response = await fetch('/api/site-leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || copy.lead.errors.send);
    state.lead.success = true;
    state.lead.loading = false;
    announce(copy.lead.successTitle);
  } catch (error) {
    state.lead.loading = false;
    state.lead.error = error?.message || copy.lead.errors.send;
    announce(state.lead.error);
  }
  render();
}

function announce(message) {
  refs.live.textContent = '';
  setTimeout(() => { refs.live.textContent = message; }, 50);
}

function updateLeadField(target) {
  const key = target.dataset.leadField;
  if (!key) return;
  state.lead.answers[key] = target.value;
}

function setupPortfolioInteractions() {
  portfolioInteractionAbort?.abort();
  portfolioInteractionAbort = null;
  const track = document.getElementById('portfolioTrack');
  if (!track) return;
  const controller = new AbortController();
  portfolioInteractionAbort = controller;
  const listenerOptions = { signal: controller.signal };
  const cards = [...track.querySelectorAll('[data-project-card]')];
  const previous = document.querySelector('[data-portfolio-prev]');
  const next = document.querySelector('[data-portfolio-next]');
  const current = document.querySelector('[data-portfolio-current]');
  const progress = document.querySelector('[data-portfolio-progress]');
  const hint = document.getElementById('portfolioHint');
  const imageObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const image = entry.target.querySelector('[data-project-image]');
      if (image?.dataset.src && !image.src) image.src = image.dataset.src;
      imageObserver.unobserve(entry.target);
    });
  }, { root: null, rootMargin: '800px 65%', threshold: 0.01 }) : null;
  controller.signal.addEventListener('abort', () => imageObserver?.disconnect(), { once: true });
  cards.forEach((card, index) => {
    if (imageObserver) imageObserver.observe(card);
    else if (index < 2) { const image = card.querySelector('[data-project-image]'); if (image) image.src = image.dataset.src; }
  });

  let updateFrame = 0;
  const updateControls = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const scrollPadding = Number.parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const minScroll = Math.max(0, (cards[0]?.offsetLeft || 0) - scrollPadding);
    const usableScroll = Math.max(0, maxScroll - minScroll);
    const trackRect = track.getBoundingClientRect();
    const activeIndex = cards.reduce((closest, card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - trackRect.left);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
    if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
    if (previous) previous.disabled = track.scrollLeft <= minScroll + 2;
    if (next) next.disabled = track.scrollLeft >= maxScroll - 2;
    if (progress) progress.style.transform = `scaleX(${usableScroll ? Math.max(1 / cards.length, (track.scrollLeft - minScroll) / usableScroll) : 1})`;
    updateFrame = 0;
  };
  const scheduleControls = () => { if (!updateFrame) updateFrame = requestAnimationFrame(updateControls); };
  controller.signal.addEventListener('abort', () => { if (updateFrame) cancelAnimationFrame(updateFrame); }, { once: true });

  const hideHint = () => {
    hint?.classList.add('is-dismissed');
    try { sessionStorage.setItem('auraPortfolioHintSeen', '1'); } catch {}
  };
  const move = (direction) => { hideHint(); scrollPortfolio(track, direction); };
  previous?.addEventListener('click', () => move(-1), listenerOptions);
  next?.addEventListener('click', () => move(1), listenerOptions);
  track.addEventListener('scroll', scheduleControls, { ...listenerOptions, passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'Home') { event.preventDefault(); hideHint(); const padding = Number.parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0; track.scrollTo({ left: Math.max(0, (cards[0]?.offsetLeft || 0) - padding), behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
    if (event.key === 'End') { event.preventDefault(); hideHint(); track.scrollTo({ left: track.scrollWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
  }, listenerOptions);
  let drag = null;
  let dragFrame = 0;
  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0 || event.target.closest('a,button:not(.project-card-open)')) return;
    drag = { x: event.clientX, currentX: event.clientX, left: track.scrollLeft, moved: false, pointerId: event.pointerId };
  }, listenerOptions);
  track.addEventListener('pointermove', (event) => {
    if (!drag) return;
    drag.currentX = event.clientX;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 5 && !drag.moved) {
      drag.moved = true;
      hideHint();
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }
    if (dragFrame) return;
    dragFrame = requestAnimationFrame(() => { if (drag) track.scrollLeft = drag.left - (drag.currentX - drag.x); dragFrame = 0; });
  }, listenerOptions);
  const stop = () => {
    if (drag?.moved) {
      track.scrollLeft = drag.left - (drag.currentX - drag.x);
      track.dataset.didDrag = 'true';
      setTimeout(() => { delete track.dataset.didDrag; }, 0);
    }
    drag = null;
    track.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', stop, listenerOptions); track.addEventListener('pointercancel', stop, listenerOptions); track.addEventListener('pointerleave', stop, listenerOptions);
  track.addEventListener('click', (event) => { if (track.dataset.didDrag) { event.preventDefault(); event.stopPropagation(); delete track.dataset.didDrag; } }, { ...listenerOptions, capture: true });
  track.addEventListener('touchstart', hideHint, { ...listenerOptions, passive: true });
  let horizontalWheelFrame = 0;
  let horizontalWheelDelta = 0;
  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    hideHint();
    horizontalWheelDelta += event.deltaX;
    if (!horizontalWheelFrame) horizontalWheelFrame = requestAnimationFrame(() => {
      track.scrollLeft += horizontalWheelDelta;
      horizontalWheelDelta = 0;
      horizontalWheelFrame = 0;
    });
  }, { ...listenerOptions, passive: false });

  const timers = [];
  let hintSeen = false;
  try { hintSeen = sessionStorage.getItem('auraPortfolioHintSeen') === '1'; } catch {}
  if (!hintSeen && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const section = track.closest('.portfolio-section');
    const demoObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      demoObserver.disconnect();
      hint?.classList.add('is-visible');
      next?.classList.add('is-nudging');
      const start = track.scrollLeft;
      timers.push(setTimeout(() => track.scrollTo({ left: start + 42, behavior: 'smooth' }), 220));
      timers.push(setTimeout(() => track.scrollTo({ left: start, behavior: 'smooth' }), 760));
      timers.push(setTimeout(() => next?.classList.remove('is-nudging'), 1300));
    }, { threshold: 0.18 });
    if (section) demoObserver.observe(section);
    controller.signal.addEventListener('abort', () => demoObserver.disconnect(), { once: true });
  } else {
    hint?.classList.add('is-visible');
  }
  controller.signal.addEventListener('abort', () => {
    timers.forEach(clearTimeout);
    if (horizontalWheelFrame) cancelAnimationFrame(horizontalWheelFrame);
  }, { once: true });
  updateControls();
}

function scrollPortfolio(track, direction) {
  const card = track.querySelector('[data-project-card]');
  track.scrollBy({ left: direction * ((card?.getBoundingClientRect().width || 400) + 24), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

function setupHeroInteraction() {
  const stage = document.getElementById('heroStage');
  heroInteractionAbort?.abort();
  heroInteractionAbort = null;
  if (!stage || prefersReducedMotion) return;
  const controller = new AbortController();
  heroInteractionAbort = controller;
  const options = { signal: controller.signal };
  let frame = 0;
  let pointer = { x: 0, y: 0 };
  let inView = true;
  const paint = () => {
    const rect = stage.getBoundingClientRect();
    const viewportProgress = isCoarsePointer ? 0 : Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight));
    stage.style.setProperty('--object-scroll-y', `${(-viewportProgress * 8).toFixed(1)}px`);
    stage.style.setProperty('--object-rx', `${(-pointer.y * 4).toFixed(2)}deg`);
    stage.style.setProperty('--object-ry', `${(pointer.x * 5).toFixed(2)}deg`);
    stage.style.setProperty('--object-x', `${(pointer.x * 12).toFixed(1)}px`);
    stage.style.setProperty('--object-y', `${(pointer.y * 10).toFixed(1)}px`);
    stage.style.setProperty('--geometry-x', `${(pointer.x * 6).toFixed(1)}px`);
    stage.style.setProperty('--geometry-y', `${(pointer.y * 5).toFixed(1)}px`);
    stage.style.setProperty('--hero-hue', `${(-28 + (pointer.x + 0.5) * 250).toFixed(0)}deg`);
    stage.style.setProperty('--glow-x', `${((pointer.x + 0.5) * 100).toFixed(1)}%`);
    stage.style.setProperty('--glow-y', `${((pointer.y + 0.5) * 100).toFixed(1)}%`);
    frame = 0;
  };
  const schedulePaint = () => { if (inView && !frame) frame = requestAnimationFrame(paint); };
  if (!isCoarsePointer) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      pointer = {
        x: Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5)),
        y: Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5))
      };
      stage.classList.add('is-active');
      schedulePaint();
    }, options);
    stage.addEventListener('pointerleave', () => {
      pointer = { x: 0, y: 0 };
      stage.classList.remove('is-active');
      schedulePaint();
    }, options);
  }
  if (!isCoarsePointer) window.addEventListener('scroll', schedulePaint, { ...options, passive: true });
  window.addEventListener('resize', schedulePaint, options);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      stage.classList.toggle('is-in-view', inView);
      if (inView) schedulePaint();
    }, { rootMargin: '15% 0px', threshold: 0.01 });
    observer.observe(stage);
    controller.signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  } else stage.classList.add('is-in-view');
  paint();
}

function observeReveals() {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('motion-enabled');
  const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function updateMeta(view, currentRoute) {
  const { copy, projects, categories } = view;
  let title = copy.meta.title;
  let description = copy.meta.description;
  let canonicalPath = '/site/';
  let schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Aura Global', url: `${SITE_ORIGIN}/site/`, email: view.content.contactInfo.email, telephone: view.content.contactInfo.phone };
  if (currentRoute.type === 'portfolio') { title = `${copy.route.portfolioTitle} — Aura Global`; description = copy.route.portfolioIntro; canonicalPath = '/portfolio'; schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: `${SITE_ORIGIN}${canonicalPath}`, hasPart: projects.map((project) => ({ '@type': 'CreativeWork', name: project.title, url: `${SITE_ORIGIN}/portfolio/${project.slug}`, image: `${SITE_ORIGIN}${project.cover}` })) }; }
  if (currentRoute.type === 'project') { const project = getProjectById(currentRoute.slug, state.language); if (project) { title = `${project.title} — Aura Global`; description = project.summary; canonicalPath = `/portfolio/${project.slug}`; schema = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: project.summary, url: `${SITE_ORIGIN}${canonicalPath}`, image: project.media.map((media) => `${SITE_ORIGIN}${media}`), sameAs: project.projectUrl }; } }
  if (currentRoute.type === 'service') { const service = categories.flatMap((category) => category.services).find((item) => item.slug === currentRoute.slug || item.id === currentRoute.slug); if (service) { title = `${service.name} — Aura Global`; description = service.short; canonicalPath = `/services/${service.slug}`; schema = { '@context': 'https://schema.org', '@type': 'Service', name: service.name, description: service.short, provider: { '@type': 'Organization', name: 'Aura Global', url: `${SITE_ORIGIN}/site/` }, offers: { '@type': 'Offer', priceCurrency: 'EUR', description: service.price } }; } }
  document.title = title; document.documentElement.lang = state.language;
  refs.metaDescription.setAttribute('content', description); refs.ogTitle.setAttribute('content', title); refs.ogDescription.setAttribute('content', description); refs.twitterTitle.setAttribute('content', title); refs.twitterDescription.setAttribute('content', description);
  const canonical = `${SITE_ORIGIN}${canonicalPath}`; refs.canonical.setAttribute('href', canonical); refs.ogUrl.setAttribute('content', canonical); refs.structuredData.textContent = JSON.stringify(schema);
}

function render() {
  const view = data();
  const currentRoute = route();
  const routeKey = `${location.pathname}:${currentRoute.type}:${currentRoute.slug || ''}`;
  const routeChanged = Boolean(lastRenderedRouteKey && lastRenderedRouteKey !== routeKey);
  lastRenderedRouteKey = routeKey;
  renderHeader(view.copy);
  refs.app.innerHTML = currentRoute.type === 'home' ? renderHome(view) : currentRoute.type === 'portfolio' ? renderPortfolioIndex(view) : currentRoute.type === 'project' ? renderProjectRoute(view, currentRoute.slug) : currentRoute.type === 'services' ? renderServicesIndex(view) : currentRoute.type === 'service' ? renderServiceRoute(view, currentRoute.slug) : renderNotFound(view.copy);
  renderFooter(view.copy, view.content.contactInfo);
  updateMeta(view, currentRoute);
  setupPortfolioInteractions(); setupHeroInteraction(); observeReveals();
  if (routeChanged) requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
}

function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) return;
  state.language = language; localStorage.setItem('auraSiteLanguage', language); window.AuraI18n?.setLanguage?.(language, { persist: true });
  const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`); render();
}

function trapFocus(event, container) {
  if (event.key !== 'Tab' || !container || container.hidden) return;
  const items = [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((item) => item.offsetParent !== null);
  if (!items.length) return; const first = items[0]; const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest?.('button,a');
  if (!target) return;
  if (state.menuOpen && target.closest('#mobileNav')) setMenu(false);
  if (target.matches('[data-language]')) { event.preventDefault(); setLanguage(target.dataset.language); return; }
  if (target.matches('#menuToggle')) { event.preventDefault(); setMenu(!state.menuOpen); return; }
  if (target.matches('[data-service-category]')) { event.preventDefault(); state.activeServiceCategory = target.dataset.serviceCategory; render(); return; }
  if (target.matches('[data-quick-view]')) { event.preventDefault(); openQuickView(target.dataset.quickView, target); return; }
  if (target.matches('[data-lead-context-clear]')) { event.preventDefault(); state.lead.context[target.dataset.leadContextClear] = ''; render(); return; }
  if (target.matches('[data-lead-open]')) { event.preventDefault(); openLead({ service: target.dataset.leadService || '', package: target.dataset.leadPackage || '', project: target.dataset.leadProject || '' }); return; }
  if (target.matches('[data-quick-close]')) { event.preventDefault(); closeQuickView(); return; }
  if (target.matches('[data-menu-close]')) { setMenu(false); return; }
  if (target.matches('[data-lead-option]')) { const [kind, value] = target.dataset.leadOption.split(':'); if (kind === 'task') { state.lead.answers.tasks = state.lead.answers.tasks.includes(value) ? state.lead.answers.tasks.filter((item) => item !== value) : [...state.lead.answers.tasks, value]; } else state.lead.answers[`${kind === 'budget' ? 'budget' : kind}`] = value; state.lead.error = ''; render(); return; }
  if (target.matches('[data-lead-back]')) { state.lead.step = Math.max(0, state.lead.step - 1); state.lead.error = ''; render(); return; }
  if (target.matches('[data-lead-next]')) { const validation = validateLead(data().copy); if (validation) { state.lead.error = validation; render(); return; } if (state.lead.step === 4) submitLead(); else { state.lead.step += 1; state.lead.error = ''; render(); } }
});

document.addEventListener('input', (event) => { if (event.target.matches?.('[data-lead-field]')) updateLeadField(event.target); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (state.quickProject) closeQuickView(); else if (state.menuOpen) setMenu(false); } if (state.quickProject) trapFocus(event, refs.quickView); else if (state.menuOpen) trapFocus(event, refs.mobileMenu); });
window.addEventListener('scroll', () => refs.header.classList.toggle('is-scrolled', window.scrollY > 12), { passive: true });
window.addEventListener('popstate', render);

render();
