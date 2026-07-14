const WORKER_ID_STORAGE_KEY = 'auraWorkerId';
const SESSION_TOKEN_STORAGE_KEY = 'auraSessionToken';
const ACADEMY_PROGRESS_KEY = 'auraAcademyProgress';
const API_BASE_STORAGE_KEY = 'parserApiBase';
const TUNNEL_BOOTSTRAP_RETRIES = 4;
const TUNNEL_BOOTSTRAP_DELAY_MS = 1200;
const SITE_PAGE_URL = 'https://parser.auraglobal-merchants.com/site/#top';

let session = null; // { role, workerId, displayName, language } once logged in

function getAuthToken() {
  return localStorage.getItem(SESSION_TOKEN_STORAGE_KEY) || '';
}

function setAuthToken(token) {
  if (token) localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
}

function clearAuthToken() {
  localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

function normalizeWorkerIdValue(value) {
  return String(value || '').trim().slice(0, 80);
}

function getWorkerIdOverride() {
  if (session?.role !== 'admin') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeWorkerIdValue(params.get('workerId') || localStorage.getItem(WORKER_ID_STORAGE_KEY) || '');
  } catch {
    return normalizeWorkerIdValue(localStorage.getItem(WORKER_ID_STORAGE_KEY) || '');
  }
}

function getWorkerId() {
  return session?.role === 'admin' ? getWorkerIdOverride() : session?.workerId || '';
}

const modules = [
  { id: 'start', titleKey: 'academy_module_start', type: 'start' },
  { id: 'services', titleKey: 'academy_module_services', type: 'services' },
  { id: 'call-logic', titleKey: 'academy_module_call_logic', type: 'article' },
  { id: 'scripts', titleKey: 'academy_module_scripts', type: 'scenario', scenarioSet: 'scripts' },
  { id: 'objections', titleKey: 'academy_module_objections', type: 'scenario', scenarioSet: 'objections' },
  { id: 'qualification', titleKey: 'academy_module_qualification', type: 'qualification' },
  { id: 'numbers', titleKey: 'academy_module_numbers', type: 'calculator' },
  { id: 'workday', titleKey: 'academy_module_workday', type: 'workday' },
  { id: 'statuses', titleKey: 'academy_module_statuses', type: 'scenario', scenarioSet: 'statuses' },
  { id: 'final', titleKey: 'academy_module_final', type: 'final' }
];

// Sidebar/nav-facing module title, localized via the i18n dictionary (see
// each module's titleKey above and the matching academy_module_* entries).
function moduleTitle(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return tr(module.titleKey);
}

// --- Bilingual content helpers --------------------------------------------
// Deep Academy content (service lessons, scenarios, exam, scripts) is authored
// as {pl, ru} pairs. UI chrome still goes through window.AuraI18n; these helpers
// resolve a bilingual field/array to the current academy content language, which
// tracks the same language as the chrome (see AuraI18n.getLanguage()) but always
// falls back to Polish (the studio's working language) if a translation is missing.
function contentLang() {
  const lang = window.AuraI18n?.getLanguage ? window.AuraI18n.getLanguage() : 'pl';
  return lang === 'ru' ? 'ru' : 'pl';
}

function bi(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const lang = contentLang();
  return value[lang] ?? value.pl ?? value.ru ?? '';
}

function biList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const lang = contentLang();
  return value[lang] ?? value.pl ?? value.ru ?? [];
}

// --- Deep content data (loaded from ./data/*.js, see loadAcademyContentData) --
let SERVICE_LESSONS = {};
let SCENARIO_BANK = { scripts: [], objections: [], statuses: [] };
let QUALIFICATION_LEADS = [];
let SERVICE_MATCH_CASES = [];
let FINAL_EXAM = [];

let academyContentLoaded = false;

async function loadAcademyContentData() {
  if (academyContentLoaded) return;
  try {
    const [serviceLessonsMod, scenarioBankMod, qualificationMod, finalExamMod] = await Promise.all([
      import('./data/service-lessons.js'),
      import('./data/scenario-bank.js'),
      import('./data/qualification-leads.js'),
      import('./data/final-exam.js')
    ]);
    SERVICE_LESSONS = serviceLessonsMod.SERVICE_LESSONS || {};
    SCENARIO_BANK = scenarioBankMod.SCENARIO_BANK || { scripts: [], objections: [], statuses: [] };
    QUALIFICATION_LEADS = qualificationMod.QUALIFICATION_LEADS || [];
    SERVICE_MATCH_CASES = qualificationMod.SERVICE_MATCH_CASES || [];
    FINAL_EXAM = finalExamMod.FINAL_EXAM || [];
    academyContentLoaded = true;
  } catch (error) {
    console.error('Nie udalo sie zaladowac tresci Akademii', error);
  }
  if (!state.activeService || !SERVICE_LESSONS[state.activeService]) {
    state.activeService = Object.keys(SERVICE_LESSONS)[0] || state.activeService;
  }
}

const articles = {
  'call-logic': {
    title: { pl: 'Logika zimnej rozmowy', ru: 'Логика холодного звонка' },
    intro: {
      pl: 'Twoim celem nie jest sprzedać usługę przez telefon. Twoim celem jest znaleźć realny problem, wzbudzić ciekawość i umówić rozmowę z osobą decyzyjną.',
      ru: 'Твоя цель — не продать услугу по телефону. Твоя цель — найти реальную проблему, вызвать интерес и договориться о разговоре с человеком, принимающим решения.'
    },
    sections: [
      [
        { pl: 'Dlaczego dzwonimy', ru: 'Почему мы звоним' },
        {
          pl: 'Wiele firm nie widzi, że traci klientów przez słabą obecność online. Telefon jest szybkim sposobem, żeby pokazać konkretną obserwację i zaproponować krótką analizę.',
          ru: 'Многие компании не замечают, что теряют клиентов из-за слабого присутствия онлайн. Звонок — быстрый способ показать конкретное наблюдение и предложить короткий разбор ситуации.'
        }
      ],
      [
        { pl: 'Czego nie robimy', ru: 'Чего мы не делаем' },
        {
          pl: 'Nie czytamy ulotki, nie naciskamy na zakup, nie podajemy przypadkowej ceny i nie obiecujemy efektów bez audytu.',
          ru: 'Не читаем «по бумажке», не давим на покупку, не называем случайную цену и не обещаем результат без предварительного анализа.'
        }
      ],
      [
        { pl: 'Jak tworzyć ciekawość', ru: 'Как вызвать интерес' },
        {
          pl: 'Zaczynasz od obserwacji: opinie, brak strony, słaby profil Google, stara strona, brak formularza. Potem pytasz, czy właściciel chce zobaczyć, co można poprawić.',
          ru: 'Начинаешь с наблюдения: отзывы, отсутствие сайта, слабый профиль в Google, устаревший сайт, отсутствие формы заявки. Затем спрашиваешь, хочет ли владелец узнать, что можно улучшить.'
        }
      ],
      [
        { pl: 'Jak kwalifikować', ru: 'Как квалифицировать' },
        {
          pl: 'Sprawdzasz, czy firma działa aktywnie, ma telefon, przyjmuje klientów, ma wartość klienta i czy problem online faktycznie może kosztować ją pieniądze.',
          ru: 'Проверяешь, активна ли компания, есть ли телефон, принимает ли она клиентов, какова ценность одного клиента и правда ли онлайн-проблема стоит компании денег.'
        }
      ],
      [
        { pl: 'Jak kończyć', ru: 'Как заканчивать разговор' },
        {
          pl: 'Najlepszy koniec rozmowy to konkretny termin spotkania lub jasny status: oddzwonić, nie pasuje, brak decydenta, dobry lead do managera.',
          ru: 'Лучшее завершение разговора — конкретная дата встречи или чёткий статус: перезвонить, не подходит, нет лица, принимающего решение, хороший лид для менеджера.'
        }
      ]
    ]
  }
};

const ACADEMY_VIEWS = ['home', 'training', 'servicesCatalog', 'scriptsExamples', 'parserGuide', 'aiTraining'];

function readViewFromUrl() {
  const raw = new URLSearchParams(window.location.search).get('section') || 'home';
  return ACADEMY_VIEWS.includes(raw) ? raw : 'home';
}

function syncViewToUrl(view) {
  const url = new URL(window.location.href);
  url.searchParams.set('section', view);
  window.history.replaceState(null, '', url);
}

const state = {
  academyView: readViewFromUrl(),
  activeModule: 0,
  activeService: 'websites',
  serviceStep: 0,
  scenarioIndex: 0,
  feedback: '',
  feedbackOk: null,
  progress: {
    userId: getWorkerId(),
    displayName: '',
    completedModules: [],
    quizScores: {},
    serviceProgress: {},
    sectionsVisited: {},
    servicesOpened: [],
    servicesCompleted: [],
    scriptsOpened: []
  },
  finalAnswers: {},
  finalResult: null,
  finalSubmitting: false,
  finalSubmitError: '',
  serviceQuizAnswers: {},
  openAnswers: {},
  // Per-module "let me redo this quiz" override (see item 2: renderScenario/
  // renderQualification/renderFinal gate on completedSet() and show a passed
  // summary instead of the live quiz UI unless the module id is in this set).
  retakeRequested: new Set(),
  qualificationTab: 'leads',
  matchAnswers: {},
  catalogServiceId: null,
  scriptsExpandedIds: [],
  scriptsTab: 'scripts',
  aiTraining: {
    personas: [],
    sessionId: null,
    clientType: null,
    personaLabel: '',
    messages: [],
    sending: false,
    result: null,
    history: [],
    view: 'picker',
    selectedHistoryId: null,
    error: ''
  }
};

const els = {
  academyToolbar: document.querySelector('#academyToolbar'),
  moduleNav: document.querySelector('#moduleNav'),
  lessonHost: document.querySelector('#lessonHost'),
  overallProgress: document.querySelector('#overallProgress'),
  completedModules: document.querySelector('#completedModules'),
  nextLesson: document.querySelector('#nextLesson'),
  avgScore: document.querySelector('#avgScore'),
  workerName: document.querySelector('#workerName'),
  academyLogoutButton: document.querySelector('#academyLogoutButton'),
  lockToast: document.querySelector('#academyLockToast'),
  sidebarTagline: document.querySelector('#sidebarTagline'),
  workerLabel: document.querySelector('#workerLabel'),
  sidebarParserLabel: document.querySelector('#sidebarParserLabel'),
  logoutLabel: document.querySelector('#logoutLabel'),
  heroTitle: document.querySelector('#heroTitle'),
  heroCopy: document.querySelector('#heroCopy'),
  progressOrbLabel: document.querySelector('#progressOrbLabel'),
  statModulesLabel: document.querySelector('#statModulesLabel'),
  statNextLabel: document.querySelector('#statNextLabel'),
  statScoreLabel: document.querySelector('#statScoreLabel')
};

// Static shell chrome baked into index.html (sidebar tagline, hero heading/copy,
// stat card labels) never went through window.AuraI18n — it just sat in the HTML
// as Polish literals. Re-apply translations on every render() so language
// switches reach this chrome the same way they reach the toolbar/nav labels.
function applyShellChrome() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (els.sidebarTagline) els.sidebarTagline.textContent = tr('academy_tagline');
  if (els.workerLabel) els.workerLabel.textContent = tr('academy_logged_in_as');
  if (els.sidebarParserLabel) els.sidebarParserLabel.textContent = tr('nav_parser');
  if (els.logoutLabel) els.logoutLabel.textContent = tr('nav_logout');
  if (els.heroTitle) els.heroTitle.textContent = tr('academy_hero_title');
  if (els.heroCopy) els.heroCopy.textContent = tr('academy_hero_copy');
  if (els.progressOrbLabel) els.progressOrbLabel.textContent = tr('academy_completed_caption');
  if (els.statModulesLabel) els.statModulesLabel.textContent = tr('academy_stat_modules');
  if (els.statNextLabel) els.statNextLabel.textContent = tr('academy_stat_next');
  if (els.statScoreLabel) els.statScoreLabel.textContent = tr('academy_stat_score');
}

function normalizeApiBase(value) {
  if (!value) return '';
  let cleaned = String(value).trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
  return cleaned;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
let apiBootstrapPromise = null;

function getApiBase() {
  return apiBase;
}

function persistApiBase(value) {
  try {
    if (value) localStorage.setItem(API_BASE_STORAGE_KEY, value);
    else localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch {}
}

function setApiBase(value, { persist = false } = {}) {
  apiBase = normalizeApiBase(value);
  if (persist) persistApiBase(apiBase);
  return apiBase;
}

function apiUrl(path) {
  return `${getApiBase()}${path}`;
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
    setApiBase(queryBase, { persist: true });
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
          setApiBase(cleaned, { persist: true });
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
          setApiBase('', { persist: true });
          return '';
        }
      } catch {}
      try {
        if (!onPagesOrFile && isPrivateHostname(new URL(saved).hostname)) {
          setApiBase('', { persist: true });
          return '';
        }
      } catch {}
      if (await isApiBaseReachable(saved)) {
        setApiBase(saved, { persist: true });
        return saved;
      }
    }
  } catch {}

  return getApiBase();
}

function wireCrossAppLinks() {
  clearPrivateParserApiBase();
  const parserLink = document.querySelector('#academyParserLink');
  const adminLink = document.querySelector('#academyAdminLink');
  const brandLink = document.querySelector('.brand');

  const bind = (link, basePath) => {
    if (!link) return;
    const updateHref = () => {
      const url = new URL(basePath, window.location.href);
      if (getApiBase()) url.searchParams.set('api', getApiBase());
      link.href = url.toString();
    };
    updateHref();
    link.addEventListener('click', () => {
      clearPrivateParserApiBase();
      updateHref();
    });
  };

  bind(parserLink, '../');
  bind(adminLink, '../admin/');
  bind(brandLink, '../');

  adminLink?.classList.toggle('hidden-field', session?.role !== 'admin');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

async function api(path, options = {}) {
  if (apiBootstrapPromise) await apiBootstrapPromise;
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'content-type': 'application/json',
      'x-worker-id': state.progress.userId || getWorkerId(),
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
  return data;
}

// Persists the toolbar language toggle to the worker's server-side session
// (see /api/academy/session-language in server.js) so requestAcademyLanguage()
// - used by AI-training personas, finish-session feedback, and grade-answer -
// reflects what the trainee is actually looking at, not just the language
// captured at login. Best-effort: the UI language has already switched
// locally via AuraI18n.setLanguage() regardless of whether this call
// succeeds, and it's only attempted for a signed-in worker. See round-6 QA
// finding 3.
async function syncSessionLanguage(lang) {
  if (!session || !lang) return;
  try {
    await api('/api/academy/session-language', {
      method: 'POST',
      body: JSON.stringify({ language: lang })
    });
  } catch {
    // Non-fatal - the server will pick up the current language on next login
    // or next successful toggle.
  }
}

async function loadProgress() {
  state.progress.userId = getWorkerId();
  state.progress.displayName = session?.role === 'admin' ? state.progress.userId || session?.displayName || '' : session?.displayName || '';
  if (state.progress.userId) localStorage.setItem(WORKER_ID_STORAGE_KEY, state.progress.userId);

  const fallback = JSON.parse(localStorage.getItem(ACADEMY_PROGRESS_KEY) || 'null');
  if (fallback) {
    state.progress = {
      ...state.progress,
      ...fallback,
      userId: getWorkerId(),
      displayName: session?.role === 'admin' ? getWorkerId() || session?.displayName || '' : session?.displayName || ''
    };
  }

  try {
    const data = await api(`/api/academy/progress?workerId=${encodeURIComponent(state.progress.userId)}`);
    state.progress = {
      ...state.progress,
      ...(data.progress || {}),
      userId: state.progress.userId,
      displayName:
        data.progress?.displayName ||
        (session?.role === 'admin' ? state.progress.userId || session?.displayName || '' : session?.displayName || '')
    };
  } catch {
    // Local fallback keeps the academy usable if the backend is restarting.
  }

  if (els.workerName) els.workerName.value = state.progress.displayName || state.progress.userId;
  rehydrateFinalExamState();
}

// state.finalResult (the in-page "passed/failed" banner state read by the
// item-2 gating in renderFinal) used to be in-memory only, initialized to
// null and never restored here - so reloading the page after already passing
// the final exam showed a blank live exam instead of the passed summary.
// completedSet().has('final') (loaded from server progress above) is enough
// for the renderFinal gate on its own, but state.finalResult is reconstructed
// too so anything reading it directly (and the retake flow, which clears it)
// sees a consistent picture immediately after load rather than only after a
// fresh submit. Individual single/case final-exam answers are never persisted
// per-question (only the aggregate quizScores.final the server computes on
// submit - see /api/academy/final-exam/submit in server.js), so
// state.finalAnswers/state.matchAnswers can't be rebuilt from server data and
// are intentionally left at their fresh-state defaults. Per-question OPEN
// answers on the final exam ARE persisted individually (quizScores['final-q
// <n>'], written by gradeOpenAnswer) and are restored into state.openAnswers
// below so a reload shows "already graded" rather than a blank textarea.
function rehydrateFinalExamState() {
  const quizScores = state.progress.quizScores || {};
  const finalScore = Number(quizScores.final);
  state.finalResult = Number.isFinite(finalScore) ? { score: finalScore, passed: completedSet().has('final') } : null;

  Object.keys(quizScores).forEach((key) => {
    const match = key.match(/^final-q(\d+)$/);
    if (!match) return;
    const score = Number(quizScores[key]);
    if (!Number.isFinite(score)) return;
    state.openAnswers[key] = {
      draft: '',
      loading: false,
      result: { score, feedback: '', strengths: [], improvements: [] },
      error: '',
      gradedText: ''
    };
  });
}

async function saveProgress(extra = {}) {
  state.progress.lastActiveAt = new Date().toISOString();
  localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(state.progress));
  try {
    await api('/api/academy/progress', {
      method: 'POST',
      body: JSON.stringify({ ...state.progress, ...extra })
    });
  } catch {}
}

function completedSet() {
  return new Set(state.progress.completedModules || []);
}

function isUnlocked(index) {
  if (index === 0) return true;
  const done = completedSet();
  return done.has(modules[index - 1].id) || done.has(modules[index].id);
}

// Positive-confirmation copy for the "section complete, next section unlocked"
// toast (see completeModule below). Reuses the existing #academyLockToast
// element/showLockToast() mechanism - its dark neutral toast styling already
// works for a non-alarming confirmation message, and reusing it means the
// one-time/auto-dismiss behavior comes for free without any new CSS. Kept as
// a local {pl,ru} template (like WHAT_TO_PROPOSE_TEMPLATE etc. above) rather
// than a shared/i18n.js key, since this round only touches app.js/index.html.
const MODULE_COMPLETION_TOAST_TEMPLATE = {
  pl: (title) => `Sekcja ukończona! Otworzono kolejną sekcję: ${title}`,
  ru: (title) => `Раздел пройден! Открыт следующий раздел: ${title}`
};

function completeModule(moduleId) {
  const done = completedSet();
  done.add(moduleId);
  state.progress.completedModules = [...done];
  // A fresh completion re-enters "passed" gating (see renderScenario/
  // renderQualification/renderFinal) - drop any earlier retake request for
  // this module so it shows the passed summary again, not a stale live quiz.
  state.retakeRequested.delete(moduleId);
  saveProgress();

  const thisIndex = moduleIndexById(moduleId);
  const nextIndex = thisIndex + 1;
  const nextModule = modules[nextIndex];
  if (nextModule && isUnlocked(nextIndex)) {
    state.activeModule = nextIndex;
    showLockToast(MODULE_COMPLETION_TOAST_TEMPLATE[contentLang()](moduleTitle(nextModule)));
  }
  // If this was the last module (final), there's nothing further to unlock -
  // renderFinal already shows its own pass/fail state via state.finalResult.
  render();
}

function scoreAverage() {
  const values = Object.values(state.progress.quizScores || {}).map(Number).filter(Number.isFinite);
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function renderShellStats() {
  const done = completedSet();
  const percent = Math.round((done.size / modules.length) * 100);
  const next = modules.find((module, index) => !done.has(module.id) && isUnlocked(index)) || modules[modules.length - 1];
  els.overallProgress.textContent = `${percent}%`;
  els.completedModules.textContent = `${done.size} / ${modules.length}`;
  els.nextLesson.textContent = moduleTitle(next);
  els.avgScore.textContent = `${scoreAverage()}%`;
}

function renderNav() {
  els.moduleNav.classList.toggle('hidden-field', state.academyView !== 'training');
  if (state.academyView !== 'training') {
    els.moduleNav.innerHTML = '';
    return;
  }
  const done = completedSet();
  els.moduleNav.innerHTML = modules
    .map((module, index) => {
      const unlocked = isUnlocked(index);
      const className = ['module-button', index === state.activeModule ? 'active' : '', done.has(module.id) ? 'done' : '', !unlocked ? 'locked' : '']
        .filter(Boolean)
        .join(' ');
      return `
        <button class="${className}" data-module="${index}" ${unlocked ? '' : 'disabled'}>
          <span class="module-index">${done.has(module.id) ? '✓' : index + 1}</span>
          <span>${escapeHtml(moduleTitle(module))}</span>
        </button>
      `;
    })
    .join('');
}

// Order mirrors the guided learning path (services -> training -> scripts ->
// AI trainer). Home is always the dashboard; the parser guide is a separate,
// always-unlocked operational reference and stays last.
const TOOLBAR_TABS = [
  { view: 'home', icon: 'house', key: 'nav_home' },
  { view: 'servicesCatalog', icon: 'briefcase-business', key: 'nav_services' },
  { view: 'training', icon: 'graduation-cap', key: 'nav_training' },
  { view: 'scriptsExamples', icon: 'messages-square', key: 'nav_scripts' },
  { view: 'aiTraining', icon: 'bot', key: 'nav_ai_training' },
  { view: 'parserGuide', icon: 'radar', key: 'nav_parser_guide' }
];

function renderToolbar() {
  if (!els.academyToolbar) return;
  const tr = window.AuraI18n?.tr || ((key) => key);
  const lang = window.AuraI18n?.getLanguage ? window.AuraI18n.getLanguage() : 'pl';
  const tabsHtml = TOOLBAR_TABS.map((tab) => {
    const unlocked = isViewUnlocked(tab.view);
    const className = ['toolbar-tab', state.academyView === tab.view ? 'active' : '', unlocked ? '' : 'locked']
      .filter(Boolean)
      .join(' ');
    return `
      <button class="${className}" data-academy-view="${tab.view}">
        <i data-lucide="${unlocked ? tab.icon : 'lock'}"></i>
        <span>${escapeHtml(tr(tab.key))}</span>
      </button>
    `;
  }).join('');
  const langHtml = `
    <div class="toolbar-lang" data-lang-switch>
      ${['pl', 'ru', 'en']
        .map((code) => `<button class="lang-chip ${lang === code ? 'active' : ''}" data-set-lang="${code}">${code.toUpperCase()}</button>`)
        .join('')}
    </div>
  `;
  els.academyToolbar.innerHTML = `<div class="toolbar-tabs">${tabsHtml}</div>${langHtml}`;
}

function moduleIndexById(moduleId) {
  const index = modules.findIndex((module) => module.id === moduleId);
  return index >= 0 ? index : 0;
}

function sectionStatusLabel(percent) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (percent >= 100) return tr('status_completed');
  if (percent > 0) return tr('status_in_progress');
  return tr('status_not_started');
}

function trainingPercent() {
  return Math.round((completedSet().size / modules.length) * 100);
}

function servicesPercent() {
  const total = Array.isArray(window.AURA_SERVICES) ? window.AURA_SERVICES.length : 33;
  const done = (state.progress.servicesCompleted || []).length;
  return total ? Math.round((done / total) * 100) : 0;
}

function scriptsPercent() {
  const total = (window.AURA_SCRIPTS?.scripts?.length || 12) + (window.AURA_SCRIPTS?.examples?.length || 10);
  const opened = (state.progress.scriptsOpened || []).length;
  return total ? Math.min(100, Math.round((opened / total) * 100)) : 0;
}

function parserGuidePercent() {
  return state.progress.sectionsVisited?.parserGuide ? 100 : 0;
}

function aiTrainingPercent() {
  const sessions = state.aiTraining.history.length;
  return Math.min(100, sessions * 34);
}

// Guided learning path: services -> training -> scripts -> AI trainer. Each
// stage stays locked until the previous one has real engagement behind it, so
// a new hire can't skip straight to the fun AI roleplay without first
// learning what Aura sells and how to talk about it. Thresholds are
// deliberately well under 100% - the goal is "drag them through the material
// in order", not "block them for weeks on one section".
const STAGE_LABELS = {
  servicesCatalog: { pl: 'Katalog usług', ru: 'Каталог услуг' },
  training: { pl: 'Szkolenie', ru: 'Обучение' },
  scriptsExamples: { pl: 'Skrypty i przykłady', ru: 'Скрипты и примеры' },
  aiTraining: { pl: 'Trener AI', ru: 'AI-тренер' }
};

const STAGE_GATES = {
  servicesCatalog: null,
  training: { requires: 'servicesCatalog', percentFn: servicesPercent, threshold: 20 },
  scriptsExamples: { requires: 'training', percentFn: trainingPercent, threshold: 40 },
  aiTraining: { requires: 'scriptsExamples', percentFn: scriptsPercent, threshold: 30 }
};

function isViewUnlocked(view) {
  const gate = STAGE_GATES[view];
  if (!gate) return true;
  return gate.percentFn() >= gate.threshold;
}

function viewUnlockHint(view) {
  const gate = STAGE_GATES[view];
  if (!gate) return '';
  const tr = window.AuraI18n?.tr || ((key) => key);
  const have = gate.percentFn();
  return tr('academy_unlock_hint_template')
    .replace('{stage}', bi(STAGE_LABELS[gate.requires]))
    .replace('{have}', have)
    .replace('{threshold}', gate.threshold);
}

let lockToastTimer = null;
function showLockToast(message) {
  if (!els.lockToast || !message) return;
  els.lockToast.textContent = message;
  els.lockToast.classList.remove('hidden-field');
  clearTimeout(lockToastTimer);
  lockToastTimer = setTimeout(() => els.lockToast.classList.add('hidden-field'), 3800);
}

function portalCard({ title, body, icon, view, percent = 0 }) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const unlocked = isViewUnlocked(view);
  const className = ['portal-card', unlocked ? '' : 'locked'].filter(Boolean).join(' ');
  return `
    <a class="${className}" href="#" data-academy-view="${escapeHtml(view)}">
      <span class="portal-icon"><i data-lucide="${unlocked ? escapeHtml(icon || 'circle-dot') : 'lock'}"></i></span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      <div class="portal-card-progress">
        <div class="progress-bar"><span style="width:${percent}%"></span></div>
        <div class="portal-card-meta">
          <span>${percent}%</span>
          <span>${escapeHtml(sectionStatusLabel(percent))}</span>
        </div>
      </div>
      ${unlocked ? `<span class="portal-card-open">${escapeHtml(tr('btn_open'))}</span>` : `<p class="portal-card-lock-hint">${escapeHtml(viewUnlockHint(view))}</p>`}
    </a>
  `;
}

// The guided path in order. Used to pick "what's next" for the home CTA and
// to compute an overall funnel position, independent of the free-access
// parser guide.
const LEARNING_PATH = ['servicesCatalog', 'training', 'scriptsExamples', 'aiTraining'];
const STAGE_PERCENT_FNS = {
  servicesCatalog: servicesPercent,
  training: trainingPercent,
  scriptsExamples: scriptsPercent,
  aiTraining: aiTrainingPercent
};

function nextLearningStage() {
  for (const view of LEARNING_PATH) {
    if (STAGE_PERCENT_FNS[view]() < 100) return view;
  }
  return LEARNING_PATH[LEARNING_PATH.length - 1];
}

function renderPortalHome() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const overall = Math.round(
    (trainingPercent() + servicesPercent() + scriptsPercent() + parserGuidePercent() + aiTrainingPercent()) / 5
  );
  const nextStage = nextLearningStage();
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Aura Sales Academy</p>
        <h2>${escapeHtml(tr('academy_home_greeting_prefix'))}, ${escapeHtml(state.progress.displayName || state.progress.userId)}</h2>
        <p>${escapeHtml(tr('academy_home_intro'))}</p>
        <p class="portal-overall">${escapeHtml(tr('academy_home_overall_progress_label'))} <strong>${overall}%</strong></p>
      </div>
      <div class="lesson-top-actions">
        <button class="primary" data-academy-view="${nextStage}">${escapeHtml(tr('btn_continue_learning'))}</button>
        <a class="secondary-link" href="../">${escapeHtml(tr('btn_go_to_parser'))}</a>
      </div>
    </div>
    <div class="portal-grid">
      ${portalCard({
        title: tr('nav_services'),
        body: tr('academy_card_services_body'),
        icon: 'briefcase-business',
        view: 'servicesCatalog',
        percent: servicesPercent()
      })}
      ${portalCard({
        title: tr('nav_training'),
        body: tr('academy_card_training_body'),
        icon: 'graduation-cap',
        view: 'training',
        percent: trainingPercent()
      })}
      ${portalCard({
        title: tr('nav_scripts'),
        body: tr('academy_card_scripts_body'),
        icon: 'messages-square',
        view: 'scriptsExamples',
        percent: scriptsPercent()
      })}
      ${portalCard({
        title: tr('nav_ai_training'),
        body: tr('academy_card_ai_training_body'),
        icon: 'bot',
        view: 'aiTraining',
        percent: aiTrainingPercent()
      })}
      ${portalCard({
        title: tr('nav_parser_guide'),
        body: tr('academy_card_parser_guide_body'),
        icon: 'radar',
        view: 'parserGuide',
        percent: parserGuidePercent()
      })}
    </div>
  `;
}

const PRICE_DEFLECTION_PHRASE = {
  pl: '„Dokładna cena zależy od zakresu, ale proste projekty zaczynają się od około 400–500 EUR. Najlepiej krótko sprawdzić, czego Państwo potrzebują, i wtedy przygotować konkretną propozycję.”',
  ru: '«Точная цена зависит от объёма работ, но простые проекты начинаются примерно от 400–500 EUR. Лучше всего коротко уточнить, что именно нужно, и тогда подготовить конкретное предложение.»'
};

// Fallback shown when the site catalog doesn't provide a price for a service
// (see mapSiteServiceToAcademyService priceRange/packages below).
const INDIVIDUAL_PRICE_LABEL = { pl: 'indywidualnie', ru: 'индивидуально' };

// "What to propose" sentence template (see mapSiteServiceToAcademyService below).
// `name` is already resolved to the current content language by the caller, so
// each language gets its own full sentence scaffolding around it (rather than
// gluing a Polish template onto a Russian noun).
const WHAT_TO_PROPOSE_TEMPLATE = {
  pl: (name) => `Krótka konsultacja i sprawdzenie, czy usługa „${name}” ma sens dla tej firmy.`,
  ru: (name) => `Короткая консультация и проверка, имеет ли смысл услуга «${name}» для этой компании.`
};

// preCallSignals fallback sentence scaffolding - only used when a service's
// lesson has no `problem`-step bullets (see preCallSignals below). Same
// pattern as WHAT_TO_PROPOSE_TEMPLATE: a full per-language sentence, not a
// Polish scaffold with a translated value glued in. See round-5 QA finding 3.
const PRE_CALL_SIGNAL_FOR_WHO_TEMPLATE = {
  pl: (forWho) => `Firma pasuje do grupy: ${forWho}`,
  ru: (forWho) => `Компания подходит группе: ${forWho}`
};
const PRE_CALL_SIGNAL_PRICE_FACTORS_TEMPLATE = {
  pl: (priceFactors) => `Cena zależy od: ${priceFactors}`,
  ru: (priceFactors) => `Цена зависит от: ${priceFactors}`
};

// exampleDialogue default opener - only used when a service's lesson has no
// `opener.say` (see base.exampleDialogue below, overridden further down when
// lesson.opener.say exists). Same {pl,ru} full-sentence pattern as above.
// See round-5 QA finding 3.
const EXAMPLE_DIALOGUE_DEFAULT_TEMPLATE = {
  pl: (title) =>
    `Sprzedawca: Dzień dobry, widzę że firma działa aktywnie online. Chciałem krótko sprawdzić, czy ${title.toLowerCase()} jest teraz dla Państwa tematem.\nKlient: A o co dokładnie chodzi?\nSprzedawca: Nie chcę sprzedawać przez telefon. Najpierw sprawdzamy, czy jest konkretny problem i czy warto przygotować propozycję. Możemy umówić 15 minut konsultacji?`,
  ru: (title) =>
    `Продавец: Здравствуйте, вижу, что компания активно работает онлайн. Хотел коротко узнать, актуальна ли сейчас для вас тема «${title.toLowerCase()}».\nКлиент: А о чём именно речь?\nПродавец: Не хочу продавать по телефону. Сначала проверим, есть ли конкретная проблема и стоит ли готовить предложение. Можем договориться на 15 минут консультации?`
};

// exampleDialogue WITH an authored opener - used when a service's lesson has
// a real opener.say line (see base.exampleDialogue override below). Unlike
// EXAMPLE_DIALOGUE_DEFAULT_TEMPLATE, the opener line itself is NOT translated
// here - lesson.opener.say is an authored Polish verbatim call-script line
// (same convention as scenario-bank.js/SERVICE_LESSONS objections, see the
// comment near base.objections below) and is inserted as-is into either
// language's scaffolding. Only the surrounding scaffold (speaker labels +
// the "A o co dokładnie chodzi?" / "Nie chcę sprzedawać..." lines) is
// localized. See round-6 QA finding 2.
const EXAMPLE_DIALOGUE_WITH_OPENER_TEMPLATE = {
  pl: (say) =>
    `Sprzedawca: ${say}\nKlient: A o co dokładnie chodzi?\nSprzedawca: Nie chcę sprzedawać przez telefon. Najpierw sprawdzamy, czy jest konkretny problem i czy warto przygotować propozycję. Możemy umówić 15 minut konsultacji?`,
  ru: (say) =>
    `Продавец: ${say}\nКлиент: А о чём именно речь?\nПродавец: Не хочу продавать по телефону. Сначала проверим, есть ли конкретная проблема и стоит ли готовить предложение. Можем договориться на 15 минут консультации?`
};

function mapSiteServiceToAcademyService(service, category = {}) {
  const details = service.details || {};
  const title = service.name || service.title || 'Usługa';
  const short = service.short || details.what || '';
  const problem = details.problem || 'Klient nie ma jasnego systemu pozyskiwania zapytań online.';
  const gives = details.gives || 'Więcej zaufania, lepszy kontakt i większą szansę na zapytanie.';
  const lesson = SERVICE_LESSONS[service.id];
  const lessonStep = (key) => lesson?.steps.find((step) => step.key === key);

  const base = {
    id: service.id,
    icon: service.icon || 'briefcase-business',
    title,
    whatIsIt: bi(lessonStep('what')?.body) || details.what || short,
    howWeDoIt: details.process || 'Najpierw sprawdzamy obecną sytuację firmy, potem dobieramy zakres i wdrażamy rozwiązanie krok po kroku.',
    whoItsFor: bi(lessonStep('who')?.body) || details.forWho || 'Firmy usługowe i lokalne biznesy, które chcą wyglądać profesjonalnie i zdobywać więcej zapytań.',
    problemSolved: bi(lessonStep('problem')?.body) || problem,
    whyClientNeedsIt: gives,
    howItBringsSales: gives,
    preCallSignals: (biList(lessonStep('problem')?.bullets).length
      ? biList(lessonStep('problem')?.bullets)
      : [
          problem,
          details.forWho ? PRE_CALL_SIGNAL_FOR_WHO_TEMPLATE[contentLang()](details.forWho) : '',
          details.priceFactors ? PRE_CALL_SIGNAL_PRICE_FACTORS_TEMPLATE[contentLang()](details.priceFactors) : ''
        ]
    ).filter(Boolean),
    whatToCheck: {
      website: { pl: 'Czy firma ma własną stronę i czy jasno pokazuje ofertę.', ru: 'Есть ли у компании собственный сайт и понятно ли он показывает предложение.' },
      googleBusiness: { pl: 'Czy profil Google ma aktualne dane, zdjęcia i opinie.', ru: 'Актуальны ли данные, фото и отзывы в профиле Google.' },
      leadForms: { pl: 'Czy klient ma prostą drogę do kontaktu: telefon, formularz, rezerwacja.', ru: 'Есть ли у клиента простой способ связи: телефон, форма, запись.' },
      automation: { pl: 'Czy zapytania nie giną między mailem, telefonem i wiadomościami.', ru: 'Не теряются ли заявки между почтой, телефоном и сообщениями.' }
    },
    simpleExplanation: short || `To usługa z kategorii ${category.label || 'Aura Global'}, która pomaga firmie zdobywać i obsługiwać zapytania.`,
    whatToPropose: WHAT_TO_PROPOSE_TEMPLATE[contentLang()](title),
    priceRange: service.price || INDIVIDUAL_PRICE_LABEL,
    priceDepends: [details.priceFactors || 'Zakres projektu, liczba elementów i integracje.'],
    packages: [
      { tier: 'Start', price: service.price || INDIVIDUAL_PRICE_LABEL, description: short || details.what || title },
      {
        tier: 'Growth',
        price: { pl: 'po konsultacji', ru: 'после консультации' },
        description: { pl: 'Szerszy zakres dopasowany do celu biznesowego klienta.', ru: 'Более широкий объём, подобранный под бизнес-цель клиента.' }
      }
    ],
    faq: [
      {
        question: { pl: 'Czy można podać dokładną cenę przez telefon?', ru: 'Можно ли назвать точную цену по телефону?' },
        answer: {
          pl: 'Nie. Caller podaje widełki i umawia konsultację, bo cena zależy od zakresu.',
          ru: 'Нет. Звонящий называет вилку цен и договаривается о консультации, потому что цена зависит от объёма.'
        }
      },
      {
        question: { pl: 'Co jest celem rozmowy?', ru: 'Какова цель разговора?' },
        answer: {
          pl: 'Zrozumieć sytuację klienta i umówić krótką rozmowę ze specjalistą.',
          ru: 'Понять ситуацию клиента и договориться о коротком разговоре со специалистом.'
        }
      }
    ],
    objections: [
      {
        objection: { pl: 'Proszę wysłać ofertę.', ru: 'Пришлите, пожалуйста, предложение.' },
        response: {
          pl: 'Żeby oferta miała sens, najlepiej najpierw krótko sprawdzić, czego firma realnie potrzebuje.',
          ru: 'Чтобы предложение имело смысл, лучше сначала коротко узнать, что компании реально нужно.'
        }
      },
      {
        objection: { pl: 'Ile to kosztuje?', ru: 'Сколько это стоит?' },
        response: bi(PRICE_DEFLECTION_PHRASE)
      }
    ],
    exampleDialogue: EXAMPLE_DIALOGUE_DEFAULT_TEMPLATE[contentLang()](title),
    whenNotToPitch: 'Nie proponuj, jeśli firma ma już mocne rozwiązanie w tym obszarze, dobrą widoczność, kontakt działa bez problemu i nie ma jasnego powodu do rozmowy.'
  };

  if (!lesson) return base;

  // Real authored content from SERVICE_LESSONS (see loadAcademyContentData) upgrades
  // the generic templated fields above with service-specific objections/dialogue.
  const avoidStep = lessonStep('avoid');
  if (avoidStep) base.whenNotToPitch = bi(avoidStep.body);
  if (lesson.objections?.length) {
    // item.say/item.response are authored Polish call-script lines (kept
    // Polish-only by design, same convention as scenario-bank.js). item.ru/
    // item.responseRu are separate Russian-only COACHING COMMENTARY (not a
    // translation of say/response) explaining the tactic to the trainee, and
    // item.why is {pl,ru}. All three are preserved here so the service-detail
    // "Obiekcje" card can render them (see renderServiceDetailObjection) -
    // previously this mapping silently dropped ru/responseRu/why.
    base.objections = lesson.objections.map((item) => ({
      objection: item.say,
      objectionRu: item.ru,
      response: item.response,
      responseRu: item.responseRu,
      why: item.why
    }));
  }
  if (lesson.opener?.say) {
    base.exampleDialogue = EXAMPLE_DIALOGUE_WITH_OPENER_TEMPLATE[contentLang()](lesson.opener.say);
  }
  if (lesson.crossSell) base.crossSellNote = bi(lesson.crossSell);
  return base;
}

let siteServicesModule = null;

function buildServicesCatalog() {
  if (!siteServicesModule) return;
  try {
    const categories = siteServicesModule.getServiceCategories
      ? siteServicesModule.getServiceCategories(contentLang())
      : siteServicesModule.serviceCategories || [];
    window.AURA_SERVICES = categories.flatMap((category) =>
      (category.services || []).map((service) => mapSiteServiceToAcademyService(service, category))
    );
  } catch {
    window.AURA_SERVICES = window.AURA_SERVICES || [];
  }
}

async function loadServicesCatalog() {
  if (siteServicesModule) {
    buildServicesCatalog();
    return;
  }
  try {
    siteServicesModule = await import('../site/data/services.js');
    buildServicesCatalog();
  } catch {
    window.AURA_SERVICES = [];
  }
}

function markServiceOpened(serviceId) {
  const opened = new Set(state.progress.servicesOpened || []);
  if (opened.has(serviceId)) return;
  opened.add(serviceId);
  state.progress.servicesOpened = [...opened];
  saveProgress({ servicesOpened: [serviceId] });
}

function renderServiceCard(service) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const opened = (state.progress.servicesOpened || []).includes(service.id);
  const completed = (state.progress.servicesCompleted || []).includes(service.id);
  const badge = completed ? tr('status_completed') : opened ? tr('status_in_progress') : tr('status_not_started');
  return `
    <a class="portal-card service-card ${completed ? 'done' : ''}" href="#" data-open-service="${escapeHtml(service.id)}">
      <span class="portal-icon"><i data-lucide="${escapeHtml(service.icon || 'briefcase-business')}"></i></span>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.whatIsIt || '')}</p>
      <span class="service-badge">${escapeHtml(badge)}</span>
    </a>
  `;
}

function renderServiceDetail(service) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const completed = (state.progress.servicesCompleted || []).includes(service.id);
  const checkList = service.whatToCheck || {};
  const checkLabels = {
    website: tr('academy_check_website'),
    googleBusiness: tr('academy_check_google_business'),
    ads: tr('academy_check_ads'),
    socialMedia: tr('academy_check_social_media'),
    leadForms: tr('academy_check_lead_forms'),
    siteSpeed: tr('academy_check_site_speed'),
    automation: tr('academy_check_automation')
  };
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('nav_services'))}</p>
        <h2>${escapeHtml(service.title)}</h2>
      </div>
      <div class="lesson-top-actions">
        <button class="secondary" data-back-to-services>${escapeHtml(tr('academy_service_detail_back'))}</button>
        ${completed ? '' : `<button class="primary" data-complete-service="${escapeHtml(service.id)}">${escapeHtml(tr('academy_service_detail_mark_completed'))}</button>`}
      </div>
    </div>
    <div class="service-detail">
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h1'))}</h3><p>${escapeHtml(service.whatIsIt)}</p></div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h2'))}</h3><p>${escapeHtml(service.howWeDoIt)}</p></div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h3'))}</h3><p>${escapeHtml(service.whoItsFor)}</p></div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h4'))}</h3><p>${escapeHtml(service.problemSolved)}</p></div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h5'))}</h3><p>${escapeHtml(service.whyClientNeedsIt)}</p></div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h6'))}</h3><p>${escapeHtml(service.howItBringsSales)}</p></div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h7'))}</h3>
        <ul>${(service.preCallSignals || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h8'))}</h3>
        <ul>${Object.entries(checkList)
          .map(([key, value]) => `<li><strong>${escapeHtml(checkLabels[key] || key)}:</strong> ${escapeHtml(bi(value))}</li>`)
          .join('')}</ul>
      </div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h9'))}</h3><p>${escapeHtml(service.simpleExplanation)}</p></div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h10'))}</h3><p>${escapeHtml(service.whatToPropose)}</p></div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h11_12'))}</h3>
        <p><strong>${escapeHtml(bi(service.priceRange))}</strong></p>
        <ul>${(service.priceDepends || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <p class="price-deflection">${bi(PRICE_DEFLECTION_PHRASE)}</p>
      </div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h13'))}</h3>
        <div class="package-grid">
          ${(service.packages || [])
            .map(
              (pkg) => `
                <div class="package-card">
                  <span class="package-tier">${escapeHtml(pkg.tier)}</span>
                  <strong>${escapeHtml(bi(pkg.price))}</strong>
                  <p>${escapeHtml(bi(pkg.description))}</p>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h14'))}</h3>
        ${(service.faq || []).map((item) => `<p><strong>${escapeHtml(bi(item.question))}</strong><br>${escapeHtml(bi(item.answer))}</p>`).join('')}
      </div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h15_16'))}</h3>
        ${(service.objections || []).map(renderServiceDetailObjection).join('')}
      </div>
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_service_h17'))}</h3>
        <pre class="dialogue-block">${escapeHtml(service.exampleDialogue)}</pre>
      </div>
      <div class="content-card"><h3>${escapeHtml(tr('academy_service_h18'))}</h3><p>${escapeHtml(service.whenNotToPitch)}</p></div>
      ${service.crossSellNote ? `<div class="content-card"><h3>${escapeHtml(tr('academy_service_h19'))}</h3><p>${escapeHtml(service.crossSellNote)}</p></div>` : ''}
    </div>
  `;
}

// Objection entries mapped in mapSiteServiceToAcademyService carry optional
// objectionRu/responseRu (Russian-only coaching commentary - no Polish
// equivalent field exists, so it always shows regardless of active UI
// language, same convention as renderObjectionCard/renderPhraseCard's
// "phrase-note" asides) and why ({pl,ru}, resolved via bi()).
function renderServiceDetailObjection(item) {
  return `
    <p><strong>„${escapeHtml(bi(item.objection))}”</strong>${item.objectionRu ? `<br><span class="phrase-note muted">${escapeHtml(item.objectionRu)}</span>` : ''}</p>
    <p>→ ${escapeHtml(bi(item.response))}${item.responseRu ? `<br><span class="phrase-note muted">${escapeHtml(item.responseRu)}</span>` : ''}</p>
    ${item.why ? `<p class="phrase-why">💡 ${escapeHtml(bi(item.why))}</p>` : ''}
  `;
}

function renderServicesCatalogSection() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const services = Array.isArray(window.AURA_SERVICES) ? window.AURA_SERVICES : [];
  if (state.catalogServiceId) {
    const service = services.find((item) => item.id === state.catalogServiceId);
    if (service) {
      markServiceOpened(service.id);
      return renderServiceDetail(service);
    }
  }
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_eyebrow_knowledge_base'))}</p>
        <h2>${escapeHtml(tr('academy_services_h2'))}</h2>
        <p>${escapeHtml(tr('academy_services_intro'))}</p>
        <p class="price-deflection">${bi(PRICE_DEFLECTION_PHRASE)}</p>
        <div class="action-row">
          <a class="primary" href="${escapeAttribute(SITE_PAGE_URL)}" target="_blank" rel="noreferrer">${escapeHtml(tr('academy_services_cta'))}</a>
        </div>
      </div>
    </div>
    ${
      services.length
        ? `<div class="portal-grid services-grid">${services.map(renderServiceCard).join('')}</div>`
        : `<p class="muted">${escapeHtml(tr('academy_loading_catalog'))}</p>`
    }
  `;
}

function markScriptOpened(itemId) {
  const opened = new Set(state.progress.scriptsOpened || []);
  if (opened.has(itemId)) return;
  opened.add(itemId);
  state.progress.scriptsOpened = [...opened];
  saveProgress({ scriptsOpened: [itemId] });
}

function renderScriptCard(script) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const expanded = state.scriptsExpandedIds.includes(script.id);
  if (!expanded) {
    return `
      <a class="portal-card script-card" href="#" data-toggle-script="${escapeHtml(script.id)}">
        <span class="portal-icon"><i data-lucide="message-circle"></i></span>
        <h3>${escapeHtml(bi(script.title))}</h3>
        <p>${escapeHtml(bi(script.situation))}</p>
        <span class="portal-card-open">${escapeHtml(tr('btn_open'))}</span>
      </a>
    `;
  }
  return `
    <div class="content-card script-card-expanded">
      <div class="lesson-top">
        <h3>${escapeHtml(bi(script.title))}</h3>
        <button class="secondary" data-toggle-script="${escapeHtml(script.id)}">${escapeHtml(tr('btn_collapse'))}</button>
      </div>
      <p><strong>${escapeHtml(tr('academy_script_label_situation'))}</strong> ${escapeHtml(bi(script.situation))}</p>
      <p><strong>${escapeHtml(tr('academy_script_label_goal'))}</strong> ${escapeHtml(bi(script.goal))}</p>
      <p><strong>${escapeHtml(tr('academy_script_label_ready_phrase'))}</strong> „${escapeHtml(bi(script.readyPhrase))}”</p>
      <p class="feedback bad"><strong>${escapeHtml(tr('academy_script_label_bad_example'))}</strong> ${escapeHtml(bi(script.badExample))}</p>
      <p class="feedback ok"><strong>${escapeHtml(tr('academy_script_label_good_example'))}</strong> ${escapeHtml(bi(script.goodExample))}</p>
      <p><strong>${escapeHtml(tr('academy_script_label_logic'))}</strong> ${escapeHtml(bi(script.logic))}</p>
      <p><strong>${escapeHtml(tr('academy_script_label_what_not_to_say'))}</strong> ${escapeHtml(bi(script.whatNotToSay))}</p>
      <p><strong>${escapeHtml(tr('academy_script_label_how_to_transition'))}</strong> ${escapeHtml(bi(script.howToTransition))}</p>
    </div>
  `;
}

function renderExampleCard(example) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const expanded = state.scriptsExpandedIds.includes(example.id);
  if (!expanded) {
    return `
      <a class="portal-card script-card" href="#" data-toggle-script="${escapeHtml(example.id)}">
        <span class="portal-icon"><i data-lucide="scroll-text"></i></span>
        <h3>${escapeHtml(bi(example.title))}</h3>
        <p>${escapeHtml((bi(example.transcript) || '').slice(0, 90))}…</p>
        <span class="portal-card-open">${escapeHtml(tr('btn_open'))}</span>
      </a>
    `;
  }
  return `
    <div class="content-card script-card-expanded">
      <div class="lesson-top">
        <h3>${escapeHtml(bi(example.title))}</h3>
        <button class="secondary" data-toggle-script="${escapeHtml(example.id)}">${escapeHtml(tr('btn_collapse'))}</button>
      </div>
      <pre class="dialogue-block">${escapeHtml(bi(example.transcript))}</pre>
      <p class="feedback ok"><strong>${escapeHtml(tr('academy_example_label_what_good'))}</strong> ${escapeHtml(bi(example.whatWasGood))}</p>
      <p class="feedback bad"><strong>${escapeHtml(tr('academy_example_label_what_bad'))}</strong> ${escapeHtml(bi(example.whatWasBad))}</p>
      <p><strong>${escapeHtml(tr('academy_example_label_how_better'))}</strong> ${escapeHtml(bi(example.howItCouldBeBetter))}</p>
      <p><strong>${escapeHtml(tr('academy_example_label_outcome'))}</strong> ${escapeHtml(bi(example.outcome))}</p>
      <p><strong>${escapeHtml(tr('academy_example_label_status'))}</strong> ${escapeHtml(example.parserStatusToSet)}</p>
    </div>
  `;
}

function renderScriptsExamplesSection() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const data = window.AURA_SCRIPTS || { scripts: [], examples: [] };
  const tab = state.scriptsTab === 'examples' ? 'examples' : 'scripts';
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_eyebrow_knowledge_base'))}</p>
        <h2>${escapeHtml(tr('academy_scripts_h2'))}</h2>
        <p>${escapeHtml(tr('academy_scripts_intro'))}</p>
      </div>
      <div class="lesson-top-actions">
        <button class="${tab === 'scripts' ? 'primary' : 'secondary'}" data-scripts-tab="scripts">${escapeHtml(tr('academy_scripts_tab_scripts'))}</button>
        <button class="${tab === 'examples' ? 'primary' : 'secondary'}" data-scripts-tab="examples">${escapeHtml(tr('academy_scripts_tab_examples'))}</button>
      </div>
    </div>
    <div class="portal-grid scripts-grid">
      ${
        tab === 'scripts'
          ? data.scripts.map(renderScriptCard).join('')
          : data.examples.map(renderExampleCard).join('')
      }
    </div>
  `;
}

const PARSER_GUIDE_POINTS = [
  {
    title: { pl: 'Jak wybrać kategorię', ru: 'Как выбрать категорию' },
    body: {
      pl: 'Wybierz branżę zgodną z tym, co realnie sprzedajemy (np. Klimatyzacja, Auto detailing). Zła kategoria = słabe leady.',
      ru: 'Выбери отрасль, соответствующую тому, что мы реально продаём (например, Кондиционеры, Автодетейлинг). Неправильная категория = слабые лиды.'
    }
  },
  {
    title: { pl: 'Jak wybrać miasto', ru: 'Как выбрать город' },
    body: {
      pl: 'Wybierz miasto lub dzielnicę, w której szukasz firm. Im węższy obszar, tym trafniejsze wyniki.',
      ru: 'Выбери город или район, в котором ищешь компании. Чем уже область, тем точнее результаты.'
    }
  },
  {
    title: { pl: 'Jak czytać listę leadów', ru: 'Как читать список лидов' },
    body: {
      pl: 'Każdy wiersz to firma z podstawowymi danymi: nazwa, telefon, status strony, AI score. Sortuj wg score, żeby dzwonić od najlepszych.',
      ru: 'Каждая строка — это компания с основными данными: название, телефон, статус сайта, AI score. Сортируй по score, чтобы звонить сначала лучшим.'
    }
  },
  {
    title: { pl: 'Co znaczy AI score', ru: 'Что значит AI score' },
    body: {
      pl: 'Liczba 0–100 pokazująca, jak dobrym leadem jest firma (brak strony, aktywność, potencjał). Wyżej = warto zadzwonić w pierwszej kolejności.',
      ru: 'Число от 0 до 100, показывающее, насколько хорошим лидом является компания (отсутствие сайта, активность, потенциал). Чем выше — тем в первую очередь стоит звонить.'
    }
  },
  {
    title: { pl: 'Co znaczy category match', ru: 'Что значит category match' },
    body: {
      pl: 'AI potwierdza, że firma faktycznie działa w wybranej branży. Zielony = pasuje, można dzwonić bez obaw.',
      ru: 'AI подтверждает, что компания действительно работает в выбранной отрасли. Зелёный = подходит, можно звонить без опасений.'
    }
  },
  {
    title: { pl: 'Co znaczy wrong category', ru: 'Что значит wrong category' },
    body: {
      pl: 'AI podejrzewa, że firma NIE pasuje do wybranej kategorii (np. trafił się warsztat zamiast salonu kosmetycznego). Zweryfikuj przed telefonem.',
      ru: 'AI подозревает, что компания НЕ подходит к выбранной категории (например, попалась мастерская вместо салона красоты). Проверь перед звонком.'
    }
  },
  {
    title: { pl: 'Jak otworzyć kartę firmy', ru: 'Как открыть карточку компании' },
    body: {
      pl: 'Kliknij w wiersz firmy na liście — otworzy się karta ze wszystkimi danymi, historią statusów i wynikiem AI.',
      ru: 'Кликни по строке компании в списке — откроется карточка со всеми данными, историей статусов и результатом AI.'
    }
  },
  {
    title: { pl: 'Jak ocenić, czy warto dzwonić', ru: 'Как оценить, стоит ли звонить' },
    body: {
      pl: 'Sprawdź status strony, AI score i category match. Priorytet: brak strony / słaba strona + wysoki score + pasująca kategoria.',
      ru: 'Проверь статус сайта, AI score и category match. Приоритет: нет сайта / слабый сайт + высокий score + подходящая категория.'
    }
  },
  {
    title: { pl: 'Jak ustawić status', ru: 'Как установить статус' },
    body: {
      pl: 'Po rozmowie zawsze ustaw status leada (np. "Umówione spotkanie", "Nie zainteresowany") — to widzi też admin.',
      ru: 'После разговора всегда устанавливай статус лида (например, «Назначена встреча», «Не заинтересован») — это видит и админ.'
    }
  },
  {
    title: { pl: 'Jak napisać notatkę', ru: 'Как написать заметку' },
    body: {
      pl: 'W karcie firmy dodaj krótką notatkę: co ustalono, kiedy oddzwonić, na co uważać przy kolejnym kontakcie.',
      ru: 'В карточке компании добавь короткую заметку: что договорились, когда перезвонить, на что обратить внимание при следующем контакте.'
    }
  },
  {
    title: { pl: 'Co zrobić, gdy numer jest błędny', ru: 'Что делать, если номер неверный' },
    body: {
      pl: 'Ustaw status "Brak telefonu / błędny numer" i przejdź do kolejnego leada — nie trać czasu na próby.',
      ru: 'Установи статус «Нет телефона / неверный номер» и переходи к следующему лиду — не трать время на попытки.'
    }
  },
  {
    title: { pl: 'Co zrobić, gdy firma nie pasuje', ru: 'Что делать, если компания не подходит' },
    body: {
      pl: 'Ustaw status "Nie pasuje" i krótko opisz dlaczego w notatce — to pomaga poprawiać jakość przyszłych wyszukiwań.',
      ru: 'Установи статус «Не подходит» и коротко опиши причину в заметке — это помогает улучшать качество будущих поисков.'
    }
  },
  {
    title: { pl: 'Co zrobić, gdy AI ostrzega o złej kategorii', ru: 'Что делать, если AI предупреждает о неправильной категории' },
    body: {
      pl: 'Zweryfikuj firmę ręcznie (strona, Google) zanim zadzwonisz — jeśli faktycznie nie pasuje, ustaw status "Nie pasuje" bez dzwonienia.',
      ru: 'Проверь компанию вручную (сайт, Google), прежде чем звонить — если она действительно не подходит, установи статус «Не подходит» без звонка.'
    }
  }
];

function renderParserGuideSection() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_parser_guide_eyebrow'))}</p>
        <h2>${escapeHtml(tr('nav_parser_guide'))}</h2>
        <p>${escapeHtml(tr('academy_parser_guide_intro'))}</p>
      </div>
      <a class="primary-link" href="../">${escapeHtml(tr('btn_go_to_parser'))}</a>
    </div>
    <div class="guide-list">
      ${PARSER_GUIDE_POINTS.map(
        (point, index) => `
          <div class="content-card guide-item">
            <span class="guide-index">${index + 1}</span>
            <div>
              <h3>${escapeHtml(bi(point.title))}</h3>
              <p>${escapeHtml(bi(point.body))}</p>
            </div>
          </div>
        `
      ).join('')}
    </div>
  `;
}

const AI_TRAINING_FALLBACK_PERSONAS = [
  { id: 'busy_owner', label: { pl: 'Zajęty właściciel', ru: 'Занятый владелец' } },
  { id: 'angry_owner', label: { pl: 'Zły właściciel', ru: 'Злой владелец' } },
  { id: 'skeptic', label: { pl: 'Sceptyk', ru: 'Скептик' } },
  { id: 'no_website', label: { pl: 'Klient bez strony', ru: 'Клиент без сайта' } },
  { id: 'old_website', label: { pl: 'Klient ze starą stroną', ru: 'Клиент со старым сайтом' } },
  { id: 'good_website', label: { pl: 'Klient z dobrą stroną', ru: 'Клиент с хорошим сайтом' } },
  { id: 'send_offer', label: { pl: 'Klient mówi "wyślij ofertę"', ru: 'Клиент говорит: "пришлите предложение"' } },
  { id: 'asks_price', label: { pl: 'Klient od razu pyta o cenę', ru: 'Клиент сразу спрашивает цену' } },
  { id: 'no_marketing', label: { pl: 'Klient nie rozumie marketingu', ru: 'Клиент не понимает маркетинг' } },
  { id: 'has_agency', label: { pl: 'Klient ma już agencję', ru: 'У клиента уже есть агентство' } },
  { id: 'interested_website', label: { pl: 'Klient zainteresowany stroną', ru: 'Клиент заинтересован в сайте' } },
  { id: 'interested_ads', label: { pl: 'Klient zainteresowany reklamą', ru: 'Клиент заинтересован в рекламе' } },
  { id: 'wants_callback', label: { pl: 'Klient chce, żeby oddzwonić', ru: 'Клиент просит перезвонить' } },
  { id: 'distrustful', label: { pl: 'Klient nie ufa', ru: 'Клиент не доверяет' } },
  { id: 'ready_to_meet', label: { pl: 'Klient gotowy na spotkanie', ru: 'Клиент готов на встречу' } }
];

async function loadAiTrainingHistory() {
  try {
    if (!state.aiTraining.personas.length) {
      const personasData = await api('/api/academy/ai-training/personas');
      state.aiTraining.personas = personasData.personas?.length ? personasData.personas : AI_TRAINING_FALLBACK_PERSONAS;
    }
  } catch {
    state.aiTraining.personas = AI_TRAINING_FALLBACK_PERSONAS;
  }
  try {
    const data = await api('/api/academy/ai-training/sessions');
    state.aiTraining.history = data.sessions || [];
  } catch {
    state.aiTraining.history = [];
  }
  if (state.academyView === 'aiTraining') render();
}

async function startAiTraining(clientType) {
  state.aiTraining.error = '';
  state.aiTraining.sending = true;
  render();
  try {
    const data = await api('/api/academy/ai-training/start', {
      method: 'POST',
      body: JSON.stringify({ clientType })
    });
    state.aiTraining.sessionId = data.sessionId;
    state.aiTraining.clientType = data.clientType;
    state.aiTraining.personaLabel = data.personaLabel;
    state.aiTraining.messages = [{ role: 'client', text: data.openingLine }];
    state.aiTraining.result = null;
    state.aiTraining.view = 'chat';
  } catch (error) {
    // Never show the raw upstream error (e.g. a literal OpenAI API error
    // string) to the trainee - always a translated, generic fallback. The
    // real error still goes to the console for debugging. See round-5 QA
    // finding 2.
    console.error('startAiTraining failed:', error);
    const tr = window.AuraI18n?.tr || ((key) => key);
    state.aiTraining.error = tr('academy_ai_training_error_start');
  } finally {
    state.aiTraining.sending = false;
    render();
  }
}

async function sendAiTrainingMessage(text) {
  if (!text.trim() || !state.aiTraining.sessionId) return;
  state.aiTraining.messages.push({ role: 'worker', text });
  state.aiTraining.sending = true;
  render();
  try {
    const data = await api(`/api/academy/ai-training/${state.aiTraining.sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    state.aiTraining.messages.push({ role: 'client', text: data.reply });
  } catch (error) {
    console.error('sendAiTrainingMessage failed:', error);
    const tr = window.AuraI18n?.tr || ((key) => key);
    state.aiTraining.error = tr('academy_ai_training_error_message');
  } finally {
    state.aiTraining.sending = false;
    render();
  }
}

async function finishAiTraining() {
  if (!state.aiTraining.sessionId) return;
  state.aiTraining.sending = true;
  render();
  try {
    const data = await api(`/api/academy/ai-training/${state.aiTraining.sessionId}/finish`, { method: 'POST' });
    state.aiTraining.result = data.session;
    state.aiTraining.view = 'feedback';
    loadAiTrainingHistory();
  } catch (error) {
    console.error('finishAiTraining failed:', error);
    const tr = window.AuraI18n?.tr || ((key) => key);
    state.aiTraining.error = tr('academy_ai_training_error_finish');
  } finally {
    state.aiTraining.sending = false;
    render();
  }
}

function renderAiTrainingChatBubble(message) {
  const isWorker = message.role === 'worker';
  return `<div class="chat-bubble ${isWorker ? 'worker' : 'client'}"><span>${escapeHtml(message.text)}</span></div>`;
}

function renderAiTrainingFeedback(session) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const feedback = session.feedback || {};
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_ai_feedback_eyebrow'))}</p>
        <h2>${escapeHtml(session.score ?? 0)}/100</h2>
        <p>${feedback.meetingBooked ? escapeHtml(tr('academy_ai_feedback_meeting_booked')) : escapeHtml(tr('academy_ai_feedback_meeting_not_booked'))}</p>
      </div>
      <div class="lesson-top-actions">
        <button class="primary" data-ai-training-new>${escapeHtml(tr('academy_ai_feedback_new_training'))}</button>
        <button class="secondary" data-academy-view="aiTraining">${escapeHtml(tr('academy_ai_feedback_back_to_list'))}</button>
      </div>
    </div>
    <div class="content-card">
      <h3>${escapeHtml(tr('academy_ai_feedback_good_heading'))}</h3>
      <ul>${(feedback.good || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>—</li>'}</ul>
    </div>
    <div class="content-card">
      <h3>${escapeHtml(tr('academy_ai_feedback_bad_heading'))}</h3>
      <ul>${(feedback.bad || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>—</li>'}</ul>
    </div>
    <div class="content-card">
      <h3>${escapeHtml(tr('academy_ai_feedback_improve_heading'))}</h3>
      <ul>${(feedback.improvements || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>—</li>'}</ul>
    </div>
  `;
}

function renderAiTrainingHistoryItem(session) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const persona = state.aiTraining.personas.find((item) => item.id === session.clientType);
  const date = session.completedAt || session.createdAt || '';
  const dateLocale = contentLang() === 'ru' ? 'ru-RU' : 'pl-PL';
  const statusLabel =
    session.status === 'completed'
      ? tr('academy_ai_history_score_template').replace('{n}', session.score ?? 0)
      : tr('status_in_progress');
  return `
    <a class="portal-card" href="#" data-view-training-session="${escapeHtml(session.sessionId)}">
      <span class="portal-icon"><i data-lucide="bot"></i></span>
      <h3>${escapeHtml(persona ? bi(persona.label) : session.clientType)}</h3>
      <p>${date ? new Date(date).toLocaleString(dateLocale) : ''}</p>
      <span class="portal-card-open">${escapeHtml(statusLabel)}</span>
    </a>
  `;
}

const DIFFICULTY_BADGE = {
  easy: { pl: 'Łatwy', ru: 'Лёгкий' },
  medium: { pl: 'Średni', ru: 'Средний' },
  hard: { pl: 'Trudny', ru: 'Сложный' }
};

const READINESS_BADGE = {
  cold: { pl: 'Zimny', ru: 'Холодный' },
  warm: { pl: 'Ciepły', ru: 'Тёплый' },
  hot: { pl: 'Gorący', ru: 'Горячий' }
};

function renderPersonaCard(persona, tr) {
  const serviceName = persona.serviceId && SERVICE_LESSONS[persona.serviceId] ? bi(SERVICE_LESSONS[persona.serviceId].title) : '';
  const difficulty = DIFFICULTY_BADGE[persona.difficulty];
  const readiness = READINESS_BADGE[persona.readiness];
  return `
    <a class="portal-card persona-card difficulty-${escapeAttribute(persona.difficulty || '')}" href="#" data-start-training="${escapeHtml(persona.id)}">
      <span class="portal-icon"><i data-lucide="user"></i></span>
      <h3>${escapeHtml(bi(persona.label))}</h3>
      <div class="persona-badges">
        ${difficulty ? `<span class="pill difficulty-pill">${escapeHtml(bi(difficulty))}</span>` : ''}
        ${readiness ? `<span class="pill readiness-pill">${escapeHtml(bi(readiness))}</span>` : ''}
        ${serviceName ? `<span class="pill">${escapeHtml(serviceName)}</span>` : ''}
      </div>
      <span class="portal-card-open">${escapeHtml(tr('btn_start_training'))}</span>
    </a>
  `;
}

function renderAiTrainingSection() {
  const view = state.aiTraining.view;
  const tr = window.AuraI18n?.tr || ((key) => key);

  if (view === 'chat') {
    return `
      <div class="lesson-top">
        <div>
          <p class="eyebrow">${escapeHtml(tr('nav_ai_training'))}</p>
          <h2>${escapeHtml(state.aiTraining.personaLabel || '')}</h2>
        </div>
        <button class="primary" data-ai-training-finish ${state.aiTraining.sending ? 'disabled' : ''}>${escapeHtml(tr('btn_finish_training'))}</button>
      </div>
      <div class="content-card chat-panel">
        <div class="chat-log">${state.aiTraining.messages.map(renderAiTrainingChatBubble).join('')}</div>
        <form id="aiTrainingForm" class="chat-input-row">
          <input id="aiTrainingInput" type="text" autocomplete="off" placeholder="Napisz odpowiedź jako sprzedawca..." ${state.aiTraining.sending ? 'disabled' : ''} />
          <button class="primary" type="submit" ${state.aiTraining.sending ? 'disabled' : ''}>${escapeHtml(tr('btn_send'))}</button>
        </form>
        ${state.aiTraining.error ? `<p class="feedback bad">${escapeHtml(state.aiTraining.error)}</p>` : ''}
      </div>
    `;
  }

  if (view === 'feedback' && state.aiTraining.result) {
    return renderAiTrainingFeedback(state.aiTraining.result);
  }

  if (view === 'historyDetail' && state.aiTraining.selectedHistoryId) {
    const session = state.aiTraining.history.find((item) => item.sessionId === state.aiTraining.selectedHistoryId);
    if (session && session.status === 'completed') return renderAiTrainingFeedback(session);
  }

  const personas = state.aiTraining.personas.length ? state.aiTraining.personas : AI_TRAINING_FALLBACK_PERSONAS;
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('nav_ai_training'))}</p>
        <h2>${escapeHtml(tr('academy_ai_training_h2'))}</h2>
        <p>${escapeHtml(tr('academy_ai_training_intro'))}</p>
      </div>
    </div>
    <div class="portal-grid">
      ${personas.map((persona) => renderPersonaCard(persona, tr)).join('')}
    </div>
    ${state.aiTraining.error ? `<p class="feedback bad">${escapeHtml(state.aiTraining.error)}</p>` : ''}
    <h3 class="history-heading">${escapeHtml(tr('academy_ai_training_history_heading'))}</h3>
    <div class="portal-grid">
      ${
        state.aiTraining.history.length
          ? state.aiTraining.history.map(renderAiTrainingHistoryItem).join('')
          : `<p class="muted">${escapeHtml(tr('empty_no_sessions'))}</p>`
      }
    </div>
  `;
}

const START_PRINCIPLES = {
  pl: ['Patrz na fakty, nie zgaduj.', 'Mów krótko i spokojnie.', 'Pytaj o problem, nie recytuj oferty.', 'Każdy lead musi mieć status i notatkę.'],
  ru: ['Смотри на факты, не гадай.', 'Говори коротко и спокойно.', 'Спрашивай о проблеме, а не зачитывай предложение.', 'У каждого лида должен быть статус и заметка.']
};

function renderStart(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_start_eyebrow'))}</p>
        <h2>${escapeHtml(tr('academy_start_h2'))}</h2>
        <p>${escapeHtml(tr('academy_start_intro'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="lesson-body">
      <div class="content-card">
        <h3>${escapeHtml(tr('academy_start_rule_heading'))}</h3>
        <p>${escapeHtml(tr('academy_start_rule_body'))}</p>
      </div>
      <div class="card-grid">
        ${biList(START_PRINCIPLES)
          .map((text) => `<div class="content-card">${escapeHtml(text)}</div>`)
          .join('')}
      </div>
    </div>
  `;
}

function renderServices(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const serviceIds = Object.keys(SERVICE_LESSONS);
  if (!serviceIds.length) {
    return `
      <div class="lesson-top">
        <div>
          <p class="eyebrow">${escapeHtml(tr('academy_services_eyebrow'))}</p>
          <h2>${escapeHtml(tr('academy_services_h2'))}</h2>
          <p class="muted">Ładowanie treści usług...</p>
        </div>
        ${completionButton(module.id)}
      </div>
    `;
  }
  const activeId = SERVICE_LESSONS[state.activeService] ? state.activeService : serviceIds[0];
  const service = SERVICE_LESSONS[activeId];
  const step = service.steps[state.serviceStep] || service.steps[0];
  const stepPercent = Math.round(((state.serviceStep + 1) / service.steps.length) * 100);
  const isLastStep = state.serviceStep === service.steps.length - 1;
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_services_eyebrow'))}</p>
        <h2>${escapeHtml(tr('academy_services_h2'))}</h2>
        <div class="action-row">
          <a class="secondary" href="${SITE_PAGE_URL}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> ${escapeHtml(tr('academy_services_site_link'))}</a>
        </div>
        <p>${escapeHtml(tr('academy_services_module_intro'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="service-grid">
      ${serviceIds
        .map((key) => {
          const item = SERVICE_LESSONS[key];
          return `
            <button class="service-card ${key === activeId ? 'active' : ''}" data-service="${escapeAttribute(key)}">
              <span class="pill">${escapeHtml(bi(item.badge))}</span>
              <h3>${escapeHtml(bi(item.title))}</h3>
            </button>
          `;
        })
        .join('')}
    </div>
    <div class="content-card">
      <div class="lesson-top">
        <div>
          <p class="mini-label">${escapeHtml(bi(service.title))} · ${escapeHtml(tr('academy_step_word'))} ${state.serviceStep + 1}/${service.steps.length}</p>
          <h3>${escapeHtml(bi(step.title))}</h3>
        </div>
        <span class="pill">${stepPercent}%</span>
      </div>
      <div class="progress-line"><span style="width:${stepPercent}%"></span></div>
      <p>${escapeHtml(bi(step.body))}</p>
      <ul>${biList(step.bullets).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      ${isLastStep ? renderServiceQuiz(service, activeId) : ''}
      ${isLastStep ? renderServiceExtras(service) : ''}
      <div class="action-row">
        <button class="secondary" data-service-prev ${state.serviceStep === 0 ? 'disabled' : ''}>${escapeHtml(tr('academy_btn_back'))}</button>
        <button class="primary" data-service-next>${isLastStep ? escapeHtml(tr('academy_btn_finish_service')) : escapeHtml(tr('academy_btn_next_step'))}</button>
      </div>
    </div>
  `;
}

function renderServiceQuiz(service, serviceId) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const questions = Array.isArray(service.quiz) ? service.quiz : [];
  if (!questions.length) return '';
  return `
    <div class="scenario-card">
      <h3>${escapeHtml(tr('academy_quiz_heading'))}</h3>
      ${questions.map((question, qIndex) => renderServiceQuizQuestion(question, `service-${serviceId}-q${qIndex}`)).join('')}
    </div>
  `;
}

function renderServiceQuizQuestion(question, key) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (question.type === 'open') return renderOpenQuestion(question, key);
  const answered = state.serviceQuizAnswers[key];
  const answers = biList(question.answers);
  return `
    <div class="quiz-question">
      <p class="quiz-question-text">${question.type === 'case' ? `<span class="pill">${escapeHtml(tr('academy_pill_situation'))}</span> ` : ''}${escapeHtml(bi(question.question))}</p>
      <div class="choice-grid">
        ${answers
          .map(
            (answer, index) => `
              <button
                class="choice ${answered ? (index === question.correct ? 'correct' : answered.selected === index ? 'wrong' : '') : ''}"
                data-quiz-choice="${escapeAttribute(key)}" data-quiz-index="${index}" ${answered ? 'disabled' : ''}
              >${escapeHtml(answer)}</button>
            `
          )
          .join('')}
      </div>
      ${
        answered
          ? `<div class="feedback ${answered.selected === question.correct ? 'ok' : 'bad'}">${escapeHtml(
              answered.selected === question.correct ? tr('academy_feedback_correct') : tr('academy_feedback_partial')
            )} ${question.explain ? escapeHtml(bi(question.explain)) : ''}</div>`
          : ''
      }
    </div>
  `;
}

function renderOpenQuestion(question, key) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const entry = state.openAnswers[key] || { draft: '', loading: false, result: null, error: '', gradedText: null };
  // Same guard as gradeOpenAnswer's short-circuit: once a result exists for
  // the exact draft text on screen, the button goes idle-disabled instead of
  // allowing an identical repeat click; editing the draft re-enables it.
  const isUnchangedSinceGrade = Boolean(entry.result && entry.gradedText === entry.draft);
  return `
    <div class="quiz-question open-question">
      <p class="quiz-question-text"><span class="pill">${escapeHtml(tr('academy_open_question_pill'))}</span> ${escapeHtml(bi(question.question))}</p>
      <textarea class="open-answer-input" data-open-answer="${escapeAttribute(key)}" rows="4" placeholder="${escapeAttribute(tr('academy_open_answer_placeholder'))}" ${
        entry.loading ? 'disabled' : ''
      }>${escapeHtml(entry.draft || '')}</textarea>
      <div class="action-row">
        <button class="secondary" data-grade-answer="${escapeAttribute(key)}" ${
          entry.loading || !(entry.draft || '').trim() || isUnchangedSinceGrade ? 'disabled' : ''
        }>
          ${escapeHtml(entry.loading ? tr('academy_open_checking') : tr('academy_open_check_ai'))}
        </button>
        ${entry.result ? `<span class="pill">${escapeHtml(entry.result.score)}/100</span>` : ''}
      </div>
      ${entry.error ? `<div class="feedback bad">${escapeHtml(entry.error)}</div>` : ''}
      ${
        entry.result
          ? `
            <div class="feedback ${entry.result.score >= 70 ? 'ok' : 'bad'}">${escapeHtml(entry.result.feedback || '')}</div>
            ${
              entry.result.strengths?.length
                ? `<p><strong>${escapeHtml(tr('academy_open_strengths_label'))}</strong> ${entry.result.strengths.map((item) => escapeHtml(item)).join('; ')}</p>`
                : ''
            }
            ${
              entry.result.improvements?.length
                ? `<p><strong>${escapeHtml(tr('academy_open_improvements_label'))}</strong> ${entry.result.improvements.map((item) => escapeHtml(item)).join('; ')}</p>`
                : ''
            }
          `
          : ''
      }
    </div>
  `;
}

function renderPhraseCard(phrase) {
  if (!phrase?.say) return '';
  return `
    <div class="phrase-card">
      <p class="phrase-say">„${escapeHtml(phrase.say)}”</p>
      ${phrase.ru ? `<p class="phrase-note muted">${escapeHtml(phrase.ru)}</p>` : ''}
    </div>
  `;
}

function renderObjectionCard(item) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <div class="phrase-card">
      <p class="phrase-client">${escapeHtml(tr('academy_label_client'))} „${escapeHtml(item.say)}”</p>
      ${item.ru ? `<p class="phrase-note muted">${escapeHtml(item.ru)}</p>` : ''}
      <p class="phrase-say">${escapeHtml(tr('academy_label_you'))} „${escapeHtml(item.response)}”</p>
      ${item.responseRu ? `<p class="phrase-note muted">${escapeHtml(item.responseRu)}</p>` : ''}
      ${item.why ? `<p class="phrase-why">${escapeHtml(bi(item.why))}</p>` : ''}
    </div>
  `;
}

function renderServiceExtras(service) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const objections = service.objections || [];
  const hasOpener = !!service.opener?.say;
  const hasCrossSell = !!service.crossSell;
  if (!objections.length && !hasOpener && !hasCrossSell) return '';
  return `
    ${hasOpener ? `<div class="content-card"><h3>${escapeHtml(tr('academy_service_opener_heading'))}</h3>${renderPhraseCard(service.opener)}</div>` : ''}
    ${
      objections.length
        ? `<div class="content-card"><h3>${escapeHtml(tr('academy_service_objections_heading'))}</h3>${objections.map(renderObjectionCard).join('')}</div>`
        : ''
    }
    ${hasCrossSell ? `<div class="content-card"><h3>${escapeHtml(tr('academy_service_crosssell_heading'))}</h3><p>${escapeHtml(bi(service.crossSell))}</p></div>` : ''}
  `;
}

function renderArticle(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const article = articles[module.id];
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_article_eyebrow'))}</p>
        <h2>${escapeHtml(bi(article.title))}</h2>
        <p>${escapeHtml(bi(article.intro))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="lesson-body">
      ${article.sections
        .map(([title, body]) => `
          <div class="content-card">
            <h3>${escapeHtml(bi(title))}</h3>
            <p>${escapeHtml(bi(body))}</p>
          </div>
        `)
        .join('')}
    </div>
  `;
}

// Shown by renderScenario/renderQualification/renderFinal instead of the live
// quiz body once a module is already completed, unless the trainee explicitly
// asked to redo it (state.retakeRequested - see the data-retake-module click
// handler). Compact confirmation + a retake button is the ONLY way back into
// a completed quiz; plain navigation never silently re-enters a live quiz.
const QUIZ_PASSED_LABEL = { pl: 'Test ukończony ✓', ru: 'Тест пройден ✓' };
const QUIZ_RETAKE_BUTTON_LABEL = { pl: 'Powtórz test', ru: 'Пройти заново' };

function renderQuizPassedSummary(module, { eyebrowKey, heading, score } = {}) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const hasScore = Number.isFinite(score);
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr(eyebrowKey || 'academy_scenario_eyebrow'))}</p>
        <h2>${escapeHtml(heading || moduleTitle(module))}</h2>
      </div>
    </div>
    <div class="content-card quiz-passed-summary">
      <p class="feedback ok">${escapeHtml(bi(QUIZ_PASSED_LABEL))}${hasScore ? ` — ${score}%` : ''}</p>
      <div class="action-row">
        <button class="secondary" data-retake-module="${escapeAttribute(module.id)}">${escapeHtml(bi(QUIZ_RETAKE_BUTTON_LABEL))}</button>
      </div>
    </div>
  `;
}

function renderScenario(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (completedSet().has(module.id) && !state.retakeRequested.has(module.id)) {
    const rawScore = Number(state.progress.quizScores?.[module.id]);
    return renderQuizPassedSummary(module, {
      eyebrowKey: 'academy_scenario_eyebrow',
      heading: moduleTitle(module),
      score: Number.isFinite(rawScore) ? rawScore : NaN
    });
  }
  const set = SCENARIO_BANK[module.scenarioSet] || [];
  if (!set.length) {
    return `
      <div class="lesson-top">
        <div>
          <p class="eyebrow">${escapeHtml(tr('academy_scenario_eyebrow'))}</p>
          <h2>${escapeHtml(moduleTitle(module))}</h2>
          <p class="muted">Ładowanie treści...</p>
        </div>
        ${completionButton(module.id)}
      </div>
    `;
  }
  const scenario = set[state.scenarioIndex % set.length];
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_scenario_eyebrow'))}</p>
        <h2>${escapeHtml(moduleTitle(module))}</h2>
        <p>${escapeHtml(tr('academy_scenario_instruction'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="scenario-card">
      <span class="pill">${escapeHtml(tr('academy_scenario_client_pill'))}</span>
      <h3>${escapeHtml(scenario.client)}</h3>
      <div class="choice-grid">
        ${scenario.choices
          .map(([text, ok], index) => `<button class="choice" data-scenario-choice="${index}" data-correct="${ok}">${escapeHtml(text)}</button>`)
          .join('')}
      </div>
      ${state.feedback ? `<div class="feedback ${state.feedbackOk === false ? 'bad' : 'ok'}">${escapeHtml(state.feedback)}</div>` : ''}
      <div class="action-row">
        <button class="secondary" data-next-scenario>${escapeHtml(tr('btn_next_example'))}</button>
      </div>
    </div>
  `;
}

// 'qualification' completion writes two families of quizScores keys: the
// plain 'qualification' key (leads tab, overwritten per-answer - see the
// data-lead click handler) and 'qualification-match-<index>' (match tab, one
// per case - see the data-match-service click handler). Average whatever of
// those exist for the passed-summary score; completion itself is still
// tracked the same way as every other module, via completedSet().
function qualificationScore() {
  const values = Object.entries(state.progress.quizScores || {})
    .filter(([key]) => key === 'qualification' || key.startsWith('qualification-match-'))
    .map(([, value]) => Number(value))
    .filter(Number.isFinite);
  if (!values.length) return NaN;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function renderQualification(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (completedSet().has(module.id) && !state.retakeRequested.has(module.id)) {
    return renderQuizPassedSummary(module, {
      eyebrowKey: 'academy_qualification_eyebrow',
      heading: tr('academy_qualification_h2'),
      score: qualificationScore()
    });
  }
  const tab = state.qualificationTab === 'match' ? 'match' : 'leads';
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_qualification_eyebrow'))}</p>
        <h2>${escapeHtml(tr('academy_qualification_h2'))}</h2>
        <p>${escapeHtml(tr('academy_qualification_intro'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="lesson-top-actions">
      <button class="${tab === 'leads' ? 'primary' : 'secondary'}" data-qualification-tab="leads">${escapeHtml(tr('academy_qualification_tab_leads'))}</button>
      <button class="${tab === 'match' ? 'primary' : 'secondary'}" data-qualification-tab="match">${escapeHtml(tr('academy_qualification_tab_match'))}</button>
    </div>
    ${tab === 'leads' ? renderQualificationLeads() : renderServiceMatchCases()}
    ${state.feedback ? `<div class="feedback ok">${escapeHtml(state.feedback)}</div>` : ''}
  `;
}

function renderQualificationLeads() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <div class="card-grid">
      ${QUALIFICATION_LEADS.map(
        (lead, leadIndex) => `
          <div class="lead-card">
            <h3>${escapeHtml(lead.name)}</h3>
            <ul>${biList(lead.facts).map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>
            <div class="choice-grid">
              <button class="choice" data-lead="${leadIndex}" data-answer="good">${escapeHtml(tr('academy_qualification_btn_good'))}</button>
              <button class="choice" data-lead="${leadIndex}" data-answer="weak">${escapeHtml(tr('academy_qualification_btn_weak'))}</button>
              <button class="choice" data-lead="${leadIndex}" data-answer="skip">${escapeHtml(tr('academy_qualification_btn_skip'))}</button>
            </div>
          </div>
        `
      ).join('')}
    </div>
  `;
}

function renderServiceMatchCases() {
  if (!SERVICE_MATCH_CASES.length) return '<p class="muted">Ładowanie przypadków...</p>';
  return `
    <div class="card-grid">
      ${SERVICE_MATCH_CASES.map((item, caseIndex) => {
        const options = [...new Set([...(item.bestServices || []), ...(item.distractorServices || [])])];
        const answered = state.matchAnswers[caseIndex];
        const wasGood = answered && (item.bestServices || []).includes(answered.selected);
        return `
          <div class="lead-card">
            <p>${escapeHtml(bi(item.situation))}</p>
            <div class="choice-grid">
              ${options
                .map((serviceId) => {
                  const label = SERVICE_LESSONS[serviceId] ? bi(SERVICE_LESSONS[serviceId].title) : serviceId;
                  const isBest = (item.bestServices || []).includes(serviceId);
                  const cls = answered ? (isBest ? 'correct' : answered.selected === serviceId ? 'wrong' : '') : '';
                  return `<button class="choice ${cls}" data-match-case="${caseIndex}" data-match-service="${escapeAttribute(serviceId)}" ${
                    answered ? 'disabled' : ''
                  }>${escapeHtml(label)}</button>`;
                })
                .join('')}
            </div>
            ${
              answered
                ? `<div class="feedback ${wasGood ? 'ok' : 'bad'}">${escapeHtml(bi(wasGood ? item.why : item.distractorWhy) || '')}</div>`
                : ''
            }
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCalculator(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_calculator_eyebrow'))}</p>
        <h2>${escapeHtml(tr('academy_calculator_h2'))}</h2>
        <p>${escapeHtml(tr('academy_calculator_intro'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="calculator">
      <label><span class="mini-label">${escapeHtml(tr('academy_calc_label_calls_per_day'))}</span><input id="callsPerDay" type="number" value="80" min="1" /></label>
      <label><span class="mini-label">${escapeHtml(tr('academy_calc_label_answer_rate'))}</span><input id="answerRate" type="number" value="35" min="1" max="100" /></label>
      <label><span class="mini-label">${escapeHtml(tr('academy_calc_label_interest_rate'))}</span><input id="interestRate" type="number" value="18" min="1" max="100" /></label>
      <label><span class="mini-label">${escapeHtml(tr('academy_calc_label_meeting_rate'))}</span><input id="meetingRate" type="number" value="35" min="1" max="100" /></label>
    </div>
    <div id="calculatorResult" class="income-card"></div>
  `;
}

function renderWorkday(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const routine = [
    ['09:00', { pl: 'Start, sprawdzenie systemu i priorytetów', ru: 'Старт, проверка системы и приоритетов' }],
    ['09:15', { pl: 'Wybór kategorii i miasta w parserze', ru: 'Выбор категории и города в парсере' }],
    ['09:30', { pl: 'Sprawdzenie pierwszych firm i rozpoczęcie telefonów', ru: 'Проверка первых компаний и начало звонков' }],
    ['11:30', { pl: 'Krótki przegląd statusów i notatek', ru: 'Короткий обзор статусов и заметок' }],
    ['13:00', { pl: 'Druga seria telefonów, powroty do “oddzwonić później”', ru: 'Вторая серия звонков, возврат к «перезвонить позже»' }],
    ['16:30', { pl: 'Porządkowanie statusów, przekazanie spotkań managerowi', ru: 'Наведение порядка в статусах, передача встреч менеджеру' }],
    ['17:00', { pl: 'Podsumowanie dnia: telefony, rozmowy, spotkania, blokery', ru: 'Итоги дня: звонки, разговоры, встречи, блокеры' }]
  ];
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_workday_eyebrow'))}</p>
        <h2>${escapeHtml(tr('academy_workday_h2'))}</h2>
        <p>${escapeHtml(tr('academy_workday_intro'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="routine-list">
      ${routine
        .map(([time, text]) => `
          <div class="routine-item">
            <span class="routine-time">${escapeHtml(time)}</span>
            <strong>${escapeHtml(bi(text))}</strong>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderFinalExamQuestion(question, qIndex) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const key = `final-q${qIndex}`;
  if (question.type === 'open') return renderOpenQuestion(question, key);
  const answers = biList(question.answers);
  return `
    <div class="content-card">
      <h3>${qIndex + 1}. ${question.type === 'case' ? `<span class="pill">${escapeHtml(tr('academy_pill_situation'))}</span> ` : ''}${escapeHtml(bi(question.question))}</h3>
      <div class="choice-grid">
        ${answers
          .map(
            (answer, answerIndex) => `
              <button class="choice ${state.finalAnswers[qIndex] === answerIndex ? 'correct' : ''}" data-final-q="${qIndex}" data-final-a="${answerIndex}">
                ${escapeHtml(answer)}
              </button>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderFinal(module) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (completedSet().has('final') && !state.retakeRequested.has('final')) {
    const rawScore = Number(state.progress.quizScores?.final);
    return renderQuizPassedSummary(module, {
      eyebrowKey: 'academy_final_eyebrow',
      heading: tr('academy_final_h2'),
      score: Number.isFinite(rawScore) ? rawScore : NaN
    });
  }
  const total = FINAL_EXAM.length;
  const singleCaseIndexes = FINAL_EXAM.map((q, i) => ({ q, i })).filter(({ q }) => q.type !== 'open');
  const openIndexes = FINAL_EXAM.map((q, i) => ({ q, i })).filter(({ q }) => q.type === 'open');
  const answeredSingleCase = singleCaseIndexes.filter(({ i }) => state.finalAnswers[i] !== undefined).length;
  const gradedOpen = openIndexes.filter(({ i }) => state.openAnswers[`final-q${i}`]?.result).length;
  const answered = answeredSingleCase + gradedOpen;
  const allAnswered = total > 0 && answeredSingleCase >= singleCaseIndexes.length && gradedOpen >= openIndexes.length;
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('academy_final_eyebrow'))}</p>
        <h2>${escapeHtml(tr('academy_final_h2'))}</h2>
        <p>${escapeHtml(tr('academy_final_intro'))}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="progress-line"><span style="width:${total ? Math.round((answered / total) * 100) : 0}%"></span></div>
    <div class="lesson-body">
      ${total ? FINAL_EXAM.map((question, qIndex) => renderFinalExamQuestion(question, qIndex)).join('') : `<p class="muted">${escapeHtml(tr('academy_loading_questions'))}</p>`}
    </div>
    <div class="action-row">
      <button class="primary" data-submit-final ${allAnswered && !state.finalSubmitting ? '' : 'disabled'}>
        ${state.finalSubmitting ? escapeHtml(tr('academy_final_checking')) : escapeHtml(tr('academy_final_submit'))}
      </button>
      <span class="pill">${answered}/${total} ${escapeHtml(tr('academy_final_answers_count'))}</span>
    </div>
    ${state.finalSubmitError ? `<div class="feedback bad">${escapeHtml(state.finalSubmitError)}</div>` : ''}
    ${
      state.finalResult
        ? `<div class="feedback ${state.finalResult.passed ? 'ok' : 'bad'}">${
            state.finalResult.passed
              ? `${escapeHtml(tr('academy_final_passed_prefix'))} ${state.finalResult.score}%. ${escapeHtml(tr('academy_final_passed_suffix'))}`
              : `${escapeHtml(tr('academy_final_failed_prefix'))} ${state.finalResult.score}%. ${escapeHtml(tr('academy_final_failed_suffix'))}`
          }</div>`
        : ''
    }
  `;
}

function completionButton(moduleId) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const done = completedSet().has(moduleId);
  return `<button class="${done ? 'secondary' : 'primary'}" data-complete="${moduleId}">${done ? escapeHtml(tr('academy_btn_completed')) : escapeHtml(tr('academy_btn_mark_completed'))}</button>`;
}

function renderLesson() {
  if (state.academyView === 'home') {
    els.lessonHost.innerHTML = renderPortalHome();
    return;
  }
  if (state.academyView === 'servicesCatalog') {
    els.lessonHost.innerHTML = renderServicesCatalogSection();
    return;
  }
  if (state.academyView === 'scriptsExamples') {
    els.lessonHost.innerHTML = renderScriptsExamplesSection();
    return;
  }
  if (state.academyView === 'parserGuide') {
    els.lessonHost.innerHTML = renderParserGuideSection();
    return;
  }
  if (state.academyView === 'aiTraining') {
    els.lessonHost.innerHTML = renderAiTrainingSection();
    return;
  }
  const module = modules[state.activeModule];
  state.feedback = state.feedback || '';
  if (module.type === 'start') els.lessonHost.innerHTML = renderStart(module);
  if (module.type === 'services') els.lessonHost.innerHTML = renderServices(module);
  if (module.type === 'article') els.lessonHost.innerHTML = renderArticle(module);
  if (module.type === 'scenario') els.lessonHost.innerHTML = renderScenario(module);
  if (module.type === 'qualification') els.lessonHost.innerHTML = renderQualification(module);
  if (module.type === 'calculator') els.lessonHost.innerHTML = renderCalculator(module);
  if (module.type === 'workday') els.lessonHost.innerHTML = renderWorkday(module);
  if (module.type === 'final') els.lessonHost.innerHTML = renderFinal(module);
  if (module.type === 'calculator') updateCalculator();
}

function render() {
  applyShellChrome();
  renderShellStats();
  renderToolbar();
  renderNav();
  renderLesson();
  wireCrossAppLinks();
  window.lucide?.createIcons();
}

function switchAcademyView(view) {
  if (!ACADEMY_VIEWS.includes(view)) view = 'home';
  state.academyView = view;
  state.feedback = '';
  state.feedbackOk = null;
  syncViewToUrl(view);
  render();
  markSectionVisited(view);
  if (view === 'aiTraining') loadAiTrainingHistory();
}

function markSectionVisited(view) {
  if (!state.progress.sectionsVisited) state.progress.sectionsVisited = {};
  if (state.progress.sectionsVisited[view]) return;
  state.progress.sectionsVisited[view] = new Date().toISOString();
  saveProgress({ section: view });
}

function updateCalculator() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const calls = Number(document.querySelector('#callsPerDay')?.value || 80);
  const answerRate = Number(document.querySelector('#answerRate')?.value || 35) / 100;
  const interestRate = Number(document.querySelector('#interestRate')?.value || 18) / 100;
  const meetingRate = Number(document.querySelector('#meetingRate')?.value || 35) / 100;
  const days = 22;
  const monthlyMeetings = Math.round(calls * answerRate * interestRate * meetingRate * days);
  const income = 4500 + monthlyMeetings * 100;
  const result = document.querySelector('#calculatorResult');
  if (result) {
    const numberLocale = contentLang() === 'ru' ? 'ru-RU' : 'pl-PL';
    const resultSentence = tr('academy_calc_result_template').replace('{n}', monthlyMeetings);
    result.innerHTML = `
      <span>${escapeHtml(tr('academy_calc_estimated_month'))}</span>
      <strong>${income.toLocaleString(numberLocale)} PLN</strong>
      <p>${escapeHtml(resultSentence)}</p>
    `;
  }
}

document.addEventListener('click', (event) => {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const langChip = event.target.closest('[data-set-lang]');
  if (langChip) {
    event.preventDefault();
    const nextLang = window.AuraI18n?.setLanguage(langChip.dataset.setLang) || langChip.dataset.setLang;
    syncSessionLanguage(nextLang);
    buildServicesCatalog();
    render();
    return;
  }

  const moduleButton = event.target.closest('[data-module]');
  if (moduleButton) {
    state.academyView = 'training';
    state.activeModule = Number(moduleButton.dataset.module);
    state.feedback = '';
  state.feedbackOk = null;
    render();
    return;
  }

  const academyViewButton = event.target.closest('[data-academy-view]');
  if (academyViewButton) {
    event.preventDefault();
    const targetView = academyViewButton.dataset.academyView || 'home';
    if (!isViewUnlocked(targetView)) {
      showLockToast(viewUnlockHint(targetView));
      return;
    }
    switchAcademyView(targetView);
    return;
  }

  const openModuleButton = event.target.closest('[data-open-module]');
  if (openModuleButton) {
    event.preventDefault();
    state.academyView = 'training';
    state.activeModule = moduleIndexById(openModuleButton.dataset.openModule);
    state.feedback = '';
  state.feedbackOk = null;
    render();
    return;
  }

  const openServiceButton = event.target.closest('[data-open-service]');
  if (openServiceButton) {
    event.preventDefault();
    state.catalogServiceId = openServiceButton.dataset.openService;
    render();
    return;
  }

  if (event.target.closest('[data-back-to-services]')) {
    state.catalogServiceId = null;
    render();
    return;
  }

  const completeServiceButton = event.target.closest('[data-complete-service]');
  if (completeServiceButton) {
    const serviceId = completeServiceButton.dataset.completeService;
    const done = new Set(state.progress.servicesCompleted || []);
    done.add(serviceId);
    state.progress.servicesCompleted = [...done];
    saveProgress({ servicesCompleted: [serviceId] });
    render();
    return;
  }

  const scriptsTabButton = event.target.closest('[data-scripts-tab]');
  if (scriptsTabButton) {
    state.scriptsTab = scriptsTabButton.dataset.scriptsTab;
    state.scriptsExpandedIds = [];
    render();
    return;
  }

  const toggleScriptButton = event.target.closest('[data-toggle-script]');
  if (toggleScriptButton) {
    const itemId = toggleScriptButton.dataset.toggleScript;
    const expanded = new Set(state.scriptsExpandedIds);
    if (expanded.has(itemId)) expanded.delete(itemId);
    else {
      expanded.add(itemId);
      markScriptOpened(itemId);
    }
    state.scriptsExpandedIds = [...expanded];
    render();
    return;
  }

  const startTrainingButton = event.target.closest('[data-start-training]');
  if (startTrainingButton) {
    state.aiTraining.error = '';
    startAiTraining(startTrainingButton.dataset.startTraining);
    return;
  }

  if (event.target.closest('[data-ai-training-finish]')) {
    finishAiTraining();
    return;
  }

  if (event.target.closest('[data-ai-training-new]')) {
    state.aiTraining.view = 'picker';
    state.aiTraining.sessionId = null;
    state.aiTraining.messages = [];
    state.aiTraining.result = null;
    render();
    return;
  }

  const viewTrainingSessionButton = event.target.closest('[data-view-training-session]');
  if (viewTrainingSessionButton) {
    state.aiTraining.selectedHistoryId = viewTrainingSessionButton.dataset.viewTrainingSession;
    state.aiTraining.view = 'historyDetail';
    render();
    return;
  }

  const serviceButton = event.target.closest('[data-service]');
  if (serviceButton) {
    state.activeService = serviceButton.dataset.service;
    state.serviceStep = 0;
    state.feedback = '';
  state.feedbackOk = null;
    render();
    return;
  }

  if (event.target.closest('[data-service-prev]')) {
    state.serviceStep = Math.max(0, state.serviceStep - 1);
    state.feedback = '';
  state.feedbackOk = null;
    render();
    return;
  }

  if (event.target.closest('[data-service-next]')) {
    const max = (SERVICE_LESSONS[state.activeService]?.steps.length || 1) - 1;
    if (state.serviceStep < max) state.serviceStep += 1;
    else {
      state.progress.serviceProgress[state.activeService] = true;
      saveProgress();
    }
    render();
    return;
  }

  const quizChoice = event.target.closest('[data-quiz-choice]');
  if (quizChoice) {
    const key = quizChoice.dataset.quizChoice;
    const selected = Number(quizChoice.dataset.quizIndex);
    const resolved = resolveQuizQuestionByKey(key);
    if (resolved?.question) {
      state.serviceQuizAnswers[key] = { selected };
      const correct = selected === resolved.question.correct;
      state.progress.quizScores[key] = correct ? 100 : 0;
      saveProgress();
    }
    render();
    return;
  }

  const gradeButton = event.target.closest('[data-grade-answer]');
  if (gradeButton) {
    const key = gradeButton.dataset.gradeAnswer;
    const resolved = resolveQuizQuestionByKey(key);
    if (resolved?.question) gradeOpenAnswer(key, resolved.question);
    return;
  }

  const scenarioChoice = event.target.closest('[data-scenario-choice]');
  if (scenarioChoice) {
    const module = modules[state.activeModule];
    const set = SCENARIO_BANK[module.scenarioSet] || [];
    const scenario = set[state.scenarioIndex % set.length];
    const choice = scenario.choices[Number(scenarioChoice.dataset.scenarioChoice)];
    state.feedback = `${choice[1] ? tr('academy_feedback_correct') : tr('academy_feedback_incorrect')} ${bi(choice[2])}`;
    state.feedbackOk = !!choice[1];
    state.progress.quizScores[module.id] = choice[1] ? 100 : 50;
    saveProgress();
    render();
    return;
  }

  if (event.target.closest('[data-next-scenario]')) {
    state.scenarioIndex += 1;
    state.feedback = '';
  state.feedbackOk = null;
    render();
    return;
  }

  const qualTabButton = event.target.closest('[data-qualification-tab]');
  if (qualTabButton) {
    state.qualificationTab = qualTabButton.dataset.qualificationTab === 'match' ? 'match' : 'leads';
    state.feedback = '';
  state.feedbackOk = null;
    render();
    return;
  }

  const matchButton = event.target.closest('[data-match-service]');
  if (matchButton) {
    const caseIndex = Number(matchButton.dataset.matchCase);
    const serviceId = matchButton.dataset.matchService;
    const item = SERVICE_MATCH_CASES[caseIndex];
    if (item && !state.matchAnswers[caseIndex]) {
      state.matchAnswers[caseIndex] = { selected: serviceId };
      const ok = (item.bestServices || []).includes(serviceId);
      state.progress.quizScores[`qualification-match-${caseIndex}`] = ok ? 100 : 0;
      saveProgress();
    }
    render();
    return;
  }

  const leadChoice = event.target.closest('[data-lead]');
  if (leadChoice) {
    const lead = QUALIFICATION_LEADS[Number(leadChoice.dataset.lead)];
    const ok = leadChoice.dataset.answer === lead.answer;
    state.feedback = `${ok ? tr('academy_feedback_correct') : tr('academy_feedback_partial')} ${bi(lead.why)}`;
    state.feedbackOk = ok;
    state.progress.quizScores.qualification = ok ? 100 : 50;
    saveProgress();
    render();
    return;
  }

  const finalAnswer = event.target.closest('[data-final-q]');
  if (finalAnswer) {
    state.finalAnswers[finalAnswer.dataset.finalQ] = Number(finalAnswer.dataset.finalA);
    render();
    return;
  }

  if (event.target.closest('[data-submit-final]')) {
    submitFinalExam();
    return;
  }

  const complete = event.target.closest('[data-complete]');
  if (complete) {
    completeModule(complete.dataset.complete);
    return;
  }

  // "Powtórz test" / "Пройти заново" - the only way back into an
  // already-completed quiz (see renderQuizPassedSummary / item 2 gating).
  const retakeButton = event.target.closest('[data-retake-module]');
  if (retakeButton) {
    const moduleId = retakeButton.dataset.retakeModule;
    state.retakeRequested.add(moduleId);
    state.feedback = '';
    state.feedbackOk = null;
    if (moduleId === 'final') {
      // Clear the stale pass/fail banner so the reopened live quiz doesn't
      // show last attempt's verdict alongside fresh answer inputs.
      state.finalResult = null;
      state.finalSubmitError = '';
    }
    render();
  }
});

function resolveQuizQuestionByKey(key) {
  if (key.startsWith('service-')) {
    const match = key.match(/^service-(.+)-q(\d+)$/);
    if (!match) return null;
    const [, serviceId, qIndexStr] = match;
    const question = SERVICE_LESSONS[serviceId]?.quiz?.[Number(qIndexStr)];
    return question ? { question, serviceId } : null;
  }
  if (key.startsWith('final-q')) {
    const qIndex = Number(key.slice('final-q'.length));
    const question = FINAL_EXAM[qIndex];
    return question ? { question, qIndex } : null;
  }
  return null;
}

async function gradeOpenAnswer(key, question) {
  const tr = window.AuraI18n?.tr || ((k) => k);
  const entry = state.openAnswers[key] || (state.openAnswers[key] = { draft: '', loading: false, result: null, error: '', gradedText: null });
  if (!entry.draft?.trim() || entry.loading) return;
  // Dedupe guard: if the currently displayed result was already produced
  // from this exact draft text, don't re-fire the paid grading call - only
  // an actual edit (draft !== gradedText) should re-enable grading.
  if (entry.result && entry.gradedText === entry.draft) return;
  entry.loading = true;
  entry.error = '';
  render();
  try {
    const data = await api('/api/academy/grade-answer', {
      method: 'POST',
      body: JSON.stringify({ question: bi(question.question), gradingNotes: bi(question.gradingNotes), answer: entry.draft })
    });
    entry.result = data.result;
    entry.error = '';
    entry.gradedText = entry.draft;
    state.progress.quizScores[key] = data.result.score;
    saveProgress();
  } catch (error) {
    // See round-6 QA finding 4: renderFinal()/renderServices() (the only two
    // templates that host renderOpenQuestion) never rendered state.feedback,
    // so a grading failure used to revert the button to idle with zero
    // feedback in either language. entry.error is rendered right in
    // renderOpenQuestion instead, next to the question it actually belongs to.
    entry.error = tr('academy_open_grade_error');
  } finally {
    entry.loading = false;
    render();
  }
}

async function submitFinalExam() {
  const tr = window.AuraI18n?.tr || ((k) => k);
  state.finalSubmitting = true;
  state.finalSubmitError = '';
  render();
  const openScores = {};
  FINAL_EXAM.forEach((question, index) => {
    if (question.type === 'open') {
      const result = state.openAnswers[`final-q${index}`]?.result;
      if (result) openScores[index] = result.score;
    }
  });
  try {
    const data = await api('/api/academy/final-exam/submit', {
      method: 'POST',
      body: JSON.stringify({ answers: state.finalAnswers, openScores })
    });
    state.finalResult = { score: data.score, passed: data.passed };
    state.finalSubmitError = '';
    if (data.progress) {
      state.progress = { ...state.progress, ...data.progress };
      localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(state.progress));
    }
    // Passing clears any earlier retake request so the next visit shows the
    // passed summary (item 2 gating) instead of re-entering the live quiz.
    if (data.passed) state.retakeRequested.delete('final');
  } catch (error) {
    // See round-6 QA finding 4: this used to fake a "0%, failed" result on a
    // plain API/network failure, which reads as "you failed the exam" rather
    // than "the check itself broke" - and the old state.feedback message was
    // never rendered by renderFinal() anyway. state.finalSubmitError is
    // rendered explicitly below instead of a fabricated finalResult.
    state.finalResult = null;
    state.finalSubmitError = tr('academy_final_submit_error');
  } finally {
    state.finalSubmitting = false;
    render();
  }
}

document.addEventListener('input', (event) => {
  if (event.target.closest('.calculator')) updateCalculator();

  const openAnswerField = event.target.closest('[data-open-answer]');
  if (openAnswerField) {
    const key = openAnswerField.dataset.openAnswer;
    if (!state.openAnswers[key]) state.openAnswers[key] = { draft: '', loading: false, result: null, error: '', gradedText: null };
    const entry = state.openAnswers[key];
    entry.draft = openAnswerField.value;
    const container = openAnswerField.closest('.open-question');
    const gradeButtonEl = container?.querySelector('[data-grade-answer]');
    const isUnchangedSinceGrade = Boolean(entry.result && entry.gradedText === entry.draft);
    if (gradeButtonEl) gradeButtonEl.disabled = !openAnswerField.value.trim() || entry.loading || isUnchangedSinceGrade;
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'aiTrainingForm') {
    event.preventDefault();
    const input = document.querySelector('#aiTrainingInput');
    const text = input?.value || '';
    if (input) input.value = '';
    sendAiTrainingMessage(text);
  }
});

let workerSaveTimer = null;

function renderLoginScreen(message = '') {
  const overlay = document.querySelector('#authOverlay');
  if (!overlay) return;
  const tr = window.AuraI18n?.tr || ((key) => key);
  overlay.classList.remove('hidden-field');
  document.querySelector('#appShell')?.classList.add('hidden-field');
  overlay.innerHTML = `
    <form class="auth-card" id="loginForm">
      <div>
        <p class="eyebrow">Aura Sales Academy</p>
        <h2>${escapeHtml(tr('auth_login_title'))}</h2>
        <p class="muted">${escapeHtml(tr('auth_login_hint'))}</p>
      </div>
      ${message ? `<div class="feedback bad">${escapeHtml(message)}</div>` : ''}
      <label>Login<input name="login" autocomplete="username" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="auth-submit" type="submit">${escapeHtml(tr('btn_login'))}</button>
    </form>
  `;
  document.querySelector('#loginForm')?.addEventListener('submit', handleLoginSubmit);
}

function hideLoginScreen() {
  document.querySelector('#authOverlay')?.classList.add('hidden-field');
  document.querySelector('#appShell')?.classList.remove('hidden-field');
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const tr = window.AuraI18n?.tr || ((key) => key);
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const login = form.login.value.trim();
  const password = form.password.value;
  submitButton.disabled = true;
  submitButton.textContent = tr('auth_logging_in');
  try {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      renderLoginScreen(data.error || tr('auth_invalid_credentials'));
      return;
    }
    setAuthToken(data.token);
    session = { role: data.role, workerId: data.workerId, displayName: data.displayName, language: data.language };
    hideLoginScreen();
    await bootAcademy();
  } catch {
    renderLoginScreen(tr('auth_server_unavailable'));
  }
}

async function handleLogout() {
  fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: { ...authHeaders() } }).catch(() => {});
  clearAuthToken();
  session = null;
  window.location.reload();
}

async function fetchSessionProfile() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const response = await fetch(apiUrl('/api/auth/me'), { headers: { ...authHeaders() } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function bootstrapSession() {
  const profile = await fetchSessionProfile();
  if (!profile) {
    clearAuthToken();
    renderLoginScreen();
    return false;
  }
  session = profile;
  hideLoginScreen();
  return true;
}

async function bootAcademy() {
  apiBootstrapPromise = bootstrapApiBase();
  wireCrossAppLinks();
  els.academyLogoutButton?.addEventListener('click', handleLogout);
  await loadProgress();
  await Promise.all([loadServicesCatalog(), loadAcademyContentData()]);
  render();
  markSectionVisited(state.academyView);
  if (state.academyView === 'aiTraining') loadAiTrainingHistory();
}

// Nothing identifies the worker's language before login (no switcher is shown
// on the auth screen — the worker record with their saved language only loads
// after a successful login). Fall back to the same stored/browser-language
// detection AuraI18n already uses elsewhere, so the login screen and the first
// post-login render aren't hardcoded to Polish.
window.AuraI18n?.applyInitialLanguage();

bootstrapSession().then((ok) => {
  if (ok) bootAcademy();
});
