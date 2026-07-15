const state = {
  config: null,
  results: [],
  selectedId: null,
  historyRuns: [],
  historyLoaded: false,
  historyLoadingRunId: null,
  activeHistoryRun: null,
  discoveryJobId: null,
  discoveryPollTimer: null,
  discoveryRunning: false,
  // AI company search (ai_search/combined/ai_enrich) - deliberately separate
  // from the discovery* fields above so the new /api/ai-search polling loop
  // (waitForAiSearchCompletion) can never interfere with the existing
  // standard /api/discover flow (waitForDiscoveryCompletion), even if both
  // somehow ran back to back.
  aiSearchJobId: null,
  aiSearchPollTimer: null,
  aiSearchRunning: false,
  detailTab: 'overview',
  filters: {
    text: '',
    size: 'all',
    priority: 'all'
  },
  folders: [],
  foldersLoaded: false,
  activeFolderId: '',
  savedItems: [],
  savedTotal: 0,
  savedPage: 1,
  crmStatuses: []
};

const leadStatusOptions = [
  { value: 'new', ru: 'Новый / сброшен', pl: 'Nowy / reset' },
  { value: 'seen', ru: 'Уже видели', pl: 'Juz widziany' },
  { value: 'reserved', ru: 'В работе', pl: 'W pracy' },
  { value: 'analyzed', ru: 'Проверен', pl: 'Sprawdzony' },
  { value: 'called', ru: 'Позвонили', pl: 'Dzwonione' },
  { value: 'contacted', ru: 'Контакт был', pl: 'Skontaktowano' },
  { value: 'exported', ru: 'Экспортирован', pl: 'Wyeksportowany' },
  { value: 'skipped', ru: 'Пропущен', pl: 'Pominiety' },
  { value: 'rejected', ru: 'Отклонен', pl: 'Odrzucony' },
  { value: 'meeting_booked', ru: 'Встреча назначена', pl: 'Spotkanie' },
  { value: 'not_interested', ru: 'Не интересно', pl: 'Nie zainteresowany' },
  { value: 'bad_fit', ru: 'Слабый лид', pl: 'Slaby lead' },
  { value: 'no_phone', ru: 'Нет телефона', pl: 'Brak telefonu' },
  { value: 'duplicate', ru: 'Дубль', pl: 'Duplikat' },
  { value: 'completed', ru: 'Закрыто', pl: 'Zamkniete' }
];

// CRM work status - separate from the parser pool/lead status above. Kept in
// this fixed order so the dropdown reads as a natural sales pipeline. Values
// sent to the backend always stay Polish (store.js canonical set); only the
// on-screen label follows currentLanguage.
const crmStatusOptions = [
  { value: 'nowy', pl: 'Nowy', ru: 'Новый' },
  { value: 'do_kontaktu', pl: 'Do kontaktu', ru: 'Связаться' },
  { value: 'proba_kontaktu', pl: 'Próba kontaktu', ru: 'Попытка связи' },
  { value: 'brak_odpowiedzi', pl: 'Brak odpowiedzi', ru: 'Нет ответа' },
  { value: 'oddzwonic', pl: 'Oddzwonić', ru: 'Перезвонить' },
  { value: 'zainteresowany', pl: 'Zainteresowany', ru: 'Заинтересован' },
  { value: 'oferta_wyslana', pl: 'Oferta wysłana', ru: 'Оффер отправлен' },
  { value: 'umowione_spotkanie', pl: 'Umówione spotkanie', ru: 'Встреча назначена' },
  { value: 'klient', pl: 'Klient', ru: 'Клиент' },
  { value: 'odrzucony', pl: 'Odrzucony', ru: 'Отклонён' }
];

// Small inline-translate helper for the newer worker features (Zapisane,
// comments, CRM status), which don't have entries in the big tr() dictionary.
function t2(pl, ru) {
  return currentLanguage === 'pl' ? pl : ru;
}

// Reads a key from the shared public/shared/i18n.js dictionary (loaded via
// AuraI18n global - see index.html script tags). Used only for the new AI
// company search UI (mode selector, curated criteria, stage labels, AI
// profile summary card) added alongside this feature; every other label in
// this file keeps using the existing tr()/t2() helpers untouched. Falls back
// to the key itself if the shared script failed to load for any reason, so a
// missing/blocked script never throws.
function trs(key) {
  return window.AuraI18n ? window.AuraI18n.tr(key, currentLanguage) : key;
}

function crmStatusLabel(value) {
  const option = crmStatusOptions.find((item) => item.value === value);
  if (!option) return value || (currentLanguage === 'pl' ? 'Nowy' : 'Новый');
  return currentLanguage === 'pl' ? option.pl : option.ru;
}

const API_BASE_STORAGE_KEY = 'parserApiBase';
const LANGUAGE_STORAGE_KEY = 'parserLanguage';
const WORKER_ID_STORAGE_KEY = 'auraWorkerId';
const SESSION_TOKEN_STORAGE_KEY = 'auraSessionToken';
const TUNNEL_BOOTSTRAP_RETRIES = 4;
const TUNNEL_BOOTSTRAP_DELAY_MS = 1200;
const CONFIG_BOOTSTRAP_RETRIES = 6;
const CONFIG_BOOTSTRAP_DELAY_MS = 1500;
let configBootstrapTimer = null;
let configBootstrapAttempts = 0;

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

function getWorkerId() {
  return session?.workerId || '';
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

// Lazily creates (once) the small "Leady dzisiaj / Лиды сегодня" quota line
// right after the discover-status hint. Created from JS rather than added to
// index.html so this feature stays fully contained in app.js.
function getWorkerQuotaEl() {
  let el = document.querySelector('#workerQuotaStatus');
  if (!el && els.discoverStatus?.parentNode) {
    el = document.createElement('div');
    el.id = 'workerQuotaStatus';
    // Reuse the existing small/muted hint style instead of inventing new CSS.
    el.className = 'discover-status';
    els.discoverStatus.insertAdjacentElement('afterend', el);
  }
  return el;
}

// Renders the worker's daily lead quota from whatever is currently in
// `session` (dailyLeadLimit/usedToday come from /api/auth/me). Defensive
// against undefined/missing fields - old cached sessions from before this
// feature existed, or admin sessions where quota doesn't apply, simply show
// nothing rather than a broken "undefined/undefined" line.
function renderWorkerQuotaStatus() {
  const el = getWorkerQuotaEl();
  if (!el) return;
  if (!session || session.role !== 'worker') {
    el.textContent = '';
    el.classList.add('hidden-field');
    return;
  }
  const usedRaw = Number(session.usedToday);
  const used = Number.isFinite(usedRaw) ? usedRaw : 0;
  const limitRaw = Number(session.dailyLeadLimit);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 0;
  el.classList.remove('hidden-field');
  el.textContent = limit > 0
    ? t2(`Leady dzisiaj: ${used} / ${limit}`, `Лиды сегодня: ${used} / ${limit}`)
    : t2(`Leady dzisiaj: ${used}, bez limitu`, `Лиды сегодня: ${used}, без лимита`);
}

// Re-fetches /api/auth/me to pick up a fresh usedToday count (the discover
// response itself doesn't include quota data - see server.js /api/discover -
// so a lightweight re-fetch after a search is simpler than plumbing the
// count through the discovery job payload). Safe to call for non-workers;
// it no-ops.
async function refreshWorkerQuota() {
  if (!session || session.role !== 'worker') return;
  const profile = await fetchSessionProfile();
  if (profile && profile.role === 'worker') {
    session.dailyLeadLimit = profile.dailyLeadLimit;
    session.usedToday = profile.usedToday;
  }
  renderWorkerQuotaStatus();
}

function renderLoginScreen(message = '') {
  const overlay = document.querySelector('#authOverlay');
  if (!overlay) return;
  overlay.classList.remove('hidden-field');
  document.querySelector('#appShell')?.classList.add('hidden-field');
  overlay.innerHTML = `
    <form class="auth-card" id="loginForm">
      <div>
        <p class="eyebrow">Aura Parser</p>
        <h2>${currentLanguage === 'pl' ? 'Logowanie' : 'Вход'}</h2>
        <p class="muted">${
          currentLanguage === 'pl'
            ? 'Wpisz login i haslo otrzymane od administratora.'
            : 'Введите логин и пароль, которые выдал администратор.'
        }</p>
      </div>
      ${message ? `<div class="feedback bad">${escapeHtml(message)}</div>` : ''}
      <label>Login<input name="login" autocomplete="username" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="primary-button" type="submit">${currentLanguage === 'pl' ? 'Zaloguj' : 'Войти'}</button>
    </form>
  `;
}

function hideLoginScreen() {
  document.querySelector('#authOverlay')?.classList.add('hidden-field');
  document.querySelector('#appShell')?.classList.remove('hidden-field');
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const login = form.login.value.trim();
  const password = form.password.value;
  submitButton.disabled = true;
  submitButton.textContent = currentLanguage === 'pl' ? 'Loguje...' : 'Вхожу...';
  try {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      renderLoginScreen(data.error || (currentLanguage === 'pl' ? 'Bledny login lub haslo.' : 'Неверный логин или пароль.'));
      wireLoginForm();
      return;
    }
    setAuthToken(data.token);
    session = { role: data.role, workerId: data.workerId, displayName: data.displayName, language: data.language };
    hideLoginScreen();
    await init();
  } catch {
    renderLoginScreen(currentLanguage === 'pl' ? 'Serwer nie odpowiada.' : 'Сервер не отвечает.');
    wireLoginForm();
  }
}

function wireLoginForm() {
  document.querySelector('#loginForm')?.addEventListener('submit', handleLoginSubmit);
}

async function handleLogout() {
  fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: { ...authHeaders() } }).catch(() => {});
  clearAuthToken();
  session = null;
  window.location.reload();
}

async function bootstrapSession() {
  const profile = await fetchSessionProfile();
  if (!profile) {
    clearAuthToken();
    renderLoginScreen();
    wireLoginForm();
    return false;
  }
  session = profile;
  hideLoginScreen();
  renderWorkerQuotaStatus();
  return true;
}

const copy = {
  ru: {
    sidebarTitle: 'Поиск компаний',
    categoryLocation: '1. Категория и локация',
    filtersStep: '2. Фильтры',
    category: 'Категория',
    customCategory: 'Своя категория',
    country: 'Страна',
    city: 'Город',
    radius: 'Радиус, км',
    resultLimit: 'Лимит результатов',
    dataSource: 'Источник данных',
    siteStatus: 'Статус сайта',
    minScore: 'Бизнес-score от',
    hasSocial: 'Есть соц. профили',
    hasPhone: 'Есть телефон',
    hasEmail: 'Есть email',
    discoverButton: 'Найти компании и сверить',
    analyzeButton: 'Проверить CSV / текущий список',
    importCsv: 'Импорт CSV',
    sampleData: 'Пример данных',
    csvData: 'CSV данные',
    titleSubtitle: 'Поиск компаний в разных городах и проверка наличия сайтов',
    exportCsv: 'Экспорт CSV',
    results: 'Результаты',
    history: 'История парсов',
    refresh: 'Обновить',
    totalFound: 'Всего найдено',
    companies: 'компаний',
    withSite: 'С сайтом',
    withoutSite: 'Без сайта',
    inReview: 'На проверке',
    needReview: 'Требуют проверки',
    search: 'Поиск',
    site: 'Сайт',
    size: 'Размер',
    findSites: 'Найти сайты',
    reset: 'Сброс',
    company: 'Компания',
    niche: 'Ниша',
    contacts: 'Контакты',
    lastActivity: 'Последняя активность',
    companyCard: 'Карточка компании',
    chooseResult: 'Выберите результат',
    detailEmpty: 'После анализа здесь появится статус сайта, проверки, score бизнеса, мини-аудит и текст первого контакта.',
    filtersNone: 'Фильтры не применены',
    resultsEmpty: 'Результатов пока нет',
    historyEmpty: 'История пуста. Запустите поиск компаний.',
    historyLoading: 'Загрузка истории...',
    smartSearch: 'Смарт-поиск: Google -> Amazon -> реестры -> веб',
    internetProfiles: 'Интернет и публичные профили',
    registries: 'CEIDG / госреестры (+Panorama Firm, Aleo, PKT, biznes.gov.pl, Regon24; Opendatabot/YouControl для Украины)',
    directories: 'Каталоги и сервисы',
    social: 'Соцсети',
    topCategories: 'Топ-категории для сайтов',
    allCategories: 'Все категории',
    custom: 'Своя категория',
    topGroup: 'Топ-категории',
    allGroup: 'Все категории',
    all: 'Все',
    noOwnSite: 'Нет своего сайта',
    siteFound: 'Сайт найден',
    weakSite: 'Слабый сайт',
    uncertain: 'Нужна проверка',
    small: 'Маленькая',
    medium: 'Средняя',
    large: 'Большая',
    allStatuses: 'Все статусы',
    noSite: 'Нет сайта',
    runStatus: 'Поиск компаний уже делает пред-проверку сайтов. Эта кнопка нужна для CSV-импорта и ручного повторного запуска проверки.',
    discoverStatus: 'Смарт-поиск сначала собирает компании, затем дополняет и сверяет контакты, сайт и сигналы по другим источникам.',
    searchReady: 'Поиск готов: собирает базу через публичные реестры, каталоги, интернет, Amazon/Google если ключи включены.',
    searchOff: 'Поиск выключен: backend не отвечает. Запустите локальный сервер, CSV-проверка сайтов отдельно работает.',
    sourcesReady: 'Источники готовы',
    sourcesMissing: 'Нужно подключить источники поиска',
    backendError: 'Ошибка подключения к backend',
    currentBackend: 'Текущий адрес backend',
    saveReload: 'Сохранить адрес и перезагрузить',
    openHistory: 'Открыт запуск из истории',
    found: 'найдено',
    shown: 'Показано',
    from: 'из',
    noFilterResults: 'По фильтрам ничего не найдено. Отключите фильтры соц. профилей, телефона или снизьте score.',
    overview: 'Обзор',
    sources: 'Источники',
    aiAnalysis: 'AI-анализ',
    resetTableFilters: 'Сброс фильтров таблицы'
  },
  pl: {
    sidebarTitle: 'Wyszukiwanie firm',
    categoryLocation: '1. Kategoria i lokalizacja',
    filtersStep: '2. Filtry',
    category: 'Kategoria',
    customCategory: 'Własna kategoria',
    country: 'Kraj',
    city: 'Miasto',
    radius: 'Promień, km',
    resultLimit: 'Limit wyników',
    dataSource: 'Źródło danych',
    siteStatus: 'Status strony',
    minScore: 'Business score od',
    hasSocial: 'Ma profile społecznościowe',
    hasPhone: 'Ma telefon',
    hasEmail: 'Ma email',
    discoverButton: 'Znajdź firmy i zweryfikuj',
    analyzeButton: 'Sprawdź CSV / bieżącą listę',
    importCsv: 'Import CSV',
    sampleData: 'Przykładowe dane',
    csvData: 'Dane CSV',
    titleSubtitle: 'Wyszukiwanie firm w różnych miastach i sprawdzanie stron',
    exportCsv: 'Eksport CSV',
    results: 'Wyniki',
    history: 'Historia parsowań',
    refresh: 'Odśwież',
    totalFound: 'Łącznie znaleziono',
    companies: 'firm',
    withSite: 'Ze stroną',
    withoutSite: 'Bez strony',
    inReview: 'Do sprawdzenia',
    needReview: 'Wymagają kontroli',
    search: 'Szukaj',
    site: 'Strona',
    size: 'Rozmiar',
    findSites: 'Znajdź strony',
    reset: 'Reset',
    company: 'Firma',
    niche: 'Nisza',
    contacts: 'Kontakty',
    lastActivity: 'Ostatnia aktywność',
    companyCard: 'Karta firmy',
    chooseResult: 'Wybierz wynik',
    detailEmpty: 'Po analizie pojawi się tutaj status strony, kontrole, business score, mini-audyt i tekst pierwszego kontaktu.',
    filtersNone: 'Filtry nie są zastosowane',
    resultsEmpty: 'Brak wyników',
    historyEmpty: 'Historia jest pusta. Uruchom wyszukiwanie firm.',
    historyLoading: 'Ładowanie historii...',
    smartSearch: 'Smart search: Google -> Amazon -> rejestry -> web',
    internetProfiles: 'Internet i publiczne profile',
    registries: 'CEIDG / rejestry publiczne (+Panorama Firm, Aleo, PKT, biznes.gov.pl, Regon24; Opendatabot/YouControl dla Ukrainy)',
    directories: 'Katalogi i serwisy',
    social: 'Social media',
    topCategories: 'Top kategorie dla stron',
    allCategories: 'Wszystkie kategorie',
    custom: 'Własna kategoria',
    topGroup: 'Top kategorie',
    allGroup: 'Wszystkie kategorie',
    all: 'Wszystkie',
    noOwnSite: 'Brak własnej strony',
    siteFound: 'Strona znaleziona',
    weakSite: 'Słaba strona',
    uncertain: 'Wymaga sprawdzenia',
    small: 'Mała',
    medium: 'Średnia',
    large: 'Duża',
    allStatuses: 'Wszystkie statusy',
    noSite: 'Brak strony',
    runStatus: 'Wyszukiwanie firm już wykonuje wstępną kontrolę stron. Ten przycisk służy do importu CSV i ręcznego ponownego sprawdzenia.',
    discoverStatus: 'Smart search najpierw zbiera firmy, potem uzupełnia i porównuje kontakty, stronę oraz sygnały z innych źródeł.',
    searchReady: 'Wyszukiwanie gotowe: zbiera bazę przez rejestry publiczne, katalogi, internet oraz Amazon/Google, jeśli klucze są włączone.',
    searchOff: 'Wyszukiwanie wyłączone: backend nie odpowiada. Uruchom lokalny serwer; osobne sprawdzanie CSV nadal działa.',
    sourcesReady: 'Źródła gotowe',
    sourcesMissing: 'Trzeba podłączyć źródła wyszukiwania',
    backendError: 'Błąd połączenia z backendem',
    currentBackend: 'Aktualny adres backendu',
    saveReload: 'Zapisz adres i przeładuj',
    openHistory: 'Otwarty przebieg z historii',
    found: 'znaleziono',
    shown: 'Pokazano',
    from: 'z',
    noFilterResults: 'Brak wyników dla filtrów. Wyłącz filtry profili, telefonu albo obniż score.',
    overview: 'Przegląd',
    sources: 'Źródła',
    aiAnalysis: 'AI-analiza',
    resetTableFilters: 'Wyczyść filtry tabeli'
  }
};

let currentLanguage = (() => {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'pl' ? 'pl' : 'ru';
  } catch {
    return 'ru';
  }
})();

function tr(key) {
  return copy[currentLanguage]?.[key] || copy.ru[key] || key;
}

// ngrok на бесплатном тарифе показывает HTML-заглушку для запросов из браузера.
// Заголовок ngrok-skip-browser-warning отключает её. Добавляем его во все
// fetch-запросы к ngrok-адресам через глобальную обёртку.
const nativeFetch = window.fetch.bind(window);
window.fetch = (url, options = {}) => {
  const target = String(url || '');
  if (/ngrok/i.test(target)) {
    options = {
      ...options,
      headers: { ...(options.headers || {}), 'ngrok-skip-browser-warning': '1' }
    };
  }
  return nativeFetch(url, options);
};

function normalizeApiBase(value) {
  if (!value) return '';
  let cleaned = String(value).trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
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

function isLocalDevelopmentHost() {
  return window.location.protocol === 'file:' || isPrivateHostname(window.location.hostname);
}

function isPrivateApiBase(value) {
  const cleaned = normalizeApiBase(value);
  if (!cleaned) return false;
  try {
    return isPrivateHostname(new URL(cleaned).hostname);
  } catch {
    return false;
  }
}

function getSearchingResultsText() {
  return currentLanguage === 'pl'
    ? 'Wyszukiwanie trwa. Pierwsze wyniki pojawią się tutaj automatycznie.'
    : 'Поиск идет. Первые результаты появятся здесь автоматически.';
}

function getEmptyDiscoveryMessage(payload) {
  const duplicateCount = Number(payload?.result?.meta?.duplicateCount || payload?.meta?.duplicateCount || 0);
  const requestedNewCount = Number(payload?.result?.meta?.requestedNewCount || payload?.meta?.requestedNewLeads || 0);
  const searchStatus = String(payload?.result?.meta?.searchStatus || payload?.meta?.searchStatus || '').toLowerCase();
  if (searchStatus === 'exhausted' && duplicateCount > 0) {
    return currentLanguage === 'pl'
      ? `Sprawdziliśmy wszystkie dostępne warianty. Nowych firm dla limitu ${requestedNewCount || '-'} nie znaleziono, duplikatów pominięto ${duplicateCount}.`
      : `Проверили все доступные варианты. Новых компаний под лимит ${requestedNewCount || '-'} не найдено, дублей пропущено ${duplicateCount}.`;
  }
  if (duplicateCount > 0) {
    return currentLanguage === 'pl'
      ? `Znaleziono firmy, ale wszystkie (${duplicateCount}) już są w bazie jako duplikaty. Otwórz historię albo zmień kategorię, miasto lub źródło.`
      : `Компании найдены, но все (${duplicateCount}) уже есть в базе как дубли. Откройте историю или измените категорию, город либо источник.`;
  }
  return currentLanguage === 'pl'
    ? 'Firmy nie zostały znalezione. Spróbuj innej kategorii albo źródła.'
    : 'Компании не найдены. Попробуйте другую категорию или источник.';
}

function resolveApiBase() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('api');
    if (fromQuery !== null) {
      const cleaned = normalizeApiBase(fromQuery);
      try {
        if (cleaned) localStorage.setItem(API_BASE_STORAGE_KEY, cleaned);
        else localStorage.removeItem(API_BASE_STORAGE_KEY);
      } catch {}
      if (cleaned) return cleaned;
    }
  } catch {}

  const onPages = window.location.hostname.endsWith('github.io');
  const localDev = isLocalDevelopmentHost();
  if (window.location.protocol === 'file:') {
    return 'http://localhost:4317';
  }
  if (onPages) return '';
  if (!localDev) {
    try {
      localStorage.removeItem(API_BASE_STORAGE_KEY);
    } catch {}
    return '';
  }

  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (saved) {
      try {
        if (new URL(saved).origin === window.location.origin) return '';
      } catch {}
      if (!localDev && isPrivateApiBase(saved)) {
        localStorage.removeItem(API_BASE_STORAGE_KEY);
        return '';
      }
      return saved;
    }
  } catch {}

  return '';
}

let apiBase = resolveApiBase();

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

// На GitHub Pages рядом с index.html лежит tunnel.json, который батник
// start-parser.bat обновляет при каждом запуске (в нём свежий адрес
// cloudflared-туннеля). Работнику достаточно открыть обычную ссылку на
// Pages: скрипт сам подхватит рабочий адрес backend и перезагрузит страницу.
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

async function syncApiBaseFromTunnelConfig({ reloadOnChange = false } = {}) {
  const onPagesOrFile =
    window.location.protocol === 'file:' || window.location.hostname.endsWith('github.io');
  if (!onPagesOrFile) return false;
  try {
    if (new URLSearchParams(window.location.search).get('api')) return false;
  } catch {}
  for (let attempt = 0; attempt < TUNNEL_BOOTSTRAP_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`tunnel.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`tunnel.json returned ${response.status}`);
      const data = await response.json();
      const cleaned = normalizeApiBase(data.api || data.url || '');
      if (!cleaned) throw new Error('tunnel.json missing api/url');
      if (cleaned !== getApiBase()) {
        setApiBase(cleaned, { persist: true });
      } else {
        persistApiBase(cleaned);
      }
      return true;
    } catch {
      if (attempt < TUNNEL_BOOTSTRAP_RETRIES - 1) {
        await sleep(TUNNEL_BOOTSTRAP_DELAY_MS * (attempt + 1));
      }
    }
  }
  return false;
}

function apiUrl(path) {

  return `${getApiBase()}${path}`;
}

function debounce(fn, delayMs) {
  let timer = null;
  return (...args) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delayMs);
  };
}

function clearConfigBootstrapRetry() {
  if (configBootstrapTimer) {
    window.clearTimeout(configBootstrapTimer);
    configBootstrapTimer = null;
  }
  configBootstrapAttempts = 0;
}

function scheduleConfigBootstrapRetry() {
  const onPagesOrFile =
    window.location.protocol === 'file:' || window.location.hostname.endsWith('github.io');
  if (!onPagesOrFile) return;
  if (configBootstrapTimer || configBootstrapAttempts >= CONFIG_BOOTSTRAP_RETRIES) return;

  const delay = CONFIG_BOOTSTRAP_DELAY_MS * (configBootstrapAttempts + 1);
  configBootstrapTimer = window.setTimeout(async () => {
    configBootstrapTimer = null;
    configBootstrapAttempts += 1;
    try {
      if (typeof window.__parserRefreshBackendBase === 'function') {
        window.__parserRefreshBackendBase();
      }
      await loadConfig();
    } catch {}
  }, delay);
}

function saveApiBaseAndReload(value) {
  const cleaned = normalizeApiBase(value);
  try {
    const sameOrigin = new URL(cleaned).origin === window.location.origin;
    if (sameOrigin) {
      setApiBase('', { persist: true });
    } else {
      setApiBase(cleaned, { persist: true });
    }
  } catch {
    setApiBase(cleaned, { persist: true });
  }
  const url = new URL(window.location.href);
  url.searchParams.delete('api');
  window.location.href = url.toString();
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
  const localDev = isLocalDevelopmentHost();
  if (!onPagesOrFile && !localDev) {
    setApiBase('', { persist: true });
    return '';
  }
  if (onPagesOrFile) {
    const tunneled = await syncApiBaseFromTunnelConfig();
    if (tunneled) return getApiBase();
  }

  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (saved) {
      try {
        if (new URL(saved).origin === window.location.origin) return getApiBase();
      } catch {}
      if (!localDev && isPrivateApiBase(saved)) {
        setApiBase('', { persist: true });
        return getApiBase();
      }
      if (await isApiBaseReachable(saved)) {
        setApiBase(saved, { persist: true });
        return saved;
      }
    }
  } catch {}

  if (!onPagesOrFile && localDev) {
    const localBase = 'http://localhost:4317';
    if (await isApiBaseReachable(localBase)) {
      setApiBase(localBase);
      return localBase;
    }
  }

  return getApiBase();
}


const els = {
  apiStatus: document.querySelector('#apiStatus'),
  webSearchStatus: document.querySelector('#webSearchStatus'),
  registryStatus: document.querySelector('#registryStatus'),
  robotsStatus: document.querySelector('#robotsStatus'),
  configDiagnostics: document.querySelector('#configDiagnostics'),
  csvInput: document.querySelector('#csvInput'),
  fileInput: document.querySelector('#fileInput'),
  sampleButton: document.querySelector('#sampleButton'),
  discoverMode: document.querySelector('#discoverMode'),
  discoverModeLabel: document.querySelector('#discoverModeLabel'),
  discoverStepLocation: document.querySelector('#discoverStepLocation'),
  discoverLimitField: document.querySelector('#discoverLimitField'),
  discoverSourceField: document.querySelector('#discoverSourceField'),
  discoverCategoryPreset: document.querySelector('#discoverCategoryPreset'),
  customCategoryField: document.querySelector('#customCategoryField'),
  discoverNiche: document.querySelector('#discoverNiche'),
  discoverCountry: document.querySelector('#discoverCountry'),
  discoverCity: document.querySelector('#discoverCity'),
  citySuggestions: document.querySelector('#citySuggestions'),
  discoverDistrict: document.querySelector('#discoverDistrict'),
  discoverRadius: document.querySelector('#discoverRadius'),
  discoverLimit: document.querySelector('#discoverLimit'),
  discoverSource: document.querySelector('#discoverSource'),
  allSourcesButton: document.querySelector('#allSourcesButton'),
  discoverButton: document.querySelector('#discoverButton'),
  discoverStatus: document.querySelector('#discoverStatus'),
  // AI company search (ai_search/combined/ai_enrich modes) - curated criteria
  // block, ai_enrich note, and the job-cancel button. See runAiCompanySearch()/
  // waitForAiSearchCompletion() below.
  aiSearchOptions: document.querySelector('#aiSearchOptions'),
  aiSearchSectionTitle: document.querySelector('#aiSearchSectionTitle'),
  aiClientType: document.querySelector('#aiClientType'),
  aiFieldClientTypeLabel: document.querySelector('#aiFieldClientTypeLabel'),
  aiCompanySize: document.querySelector('#aiCompanySize'),
  aiFieldCompanySizeLabel: document.querySelector('#aiFieldCompanySizeLabel'),
  aiMinYears: document.querySelector('#aiMinYears'),
  aiFieldMinYearsLabel: document.querySelector('#aiFieldMinYearsLabel'),
  aiWebsitePresence: document.querySelector('#aiWebsitePresence'),
  aiFieldWebsitePresenceLabel: document.querySelector('#aiFieldWebsitePresenceLabel'),
  aiMinReviews: document.querySelector('#aiMinReviews'),
  aiFieldMinReviewsLabel: document.querySelector('#aiFieldMinReviewsLabel'),
  aiMinRating: document.querySelector('#aiMinRating'),
  aiFieldMinRatingLabel: document.querySelector('#aiFieldMinRatingLabel'),
  aiExtraKeywords: document.querySelector('#aiExtraKeywords'),
  aiFieldExtraKeywordsLabel: document.querySelector('#aiFieldExtraKeywordsLabel'),
  aiExcludeKeywords: document.querySelector('#aiExcludeKeywords'),
  aiFieldExcludeKeywordsLabel: document.querySelector('#aiFieldExcludeKeywordsLabel'),
  aiSearchCount: document.querySelector('#aiSearchCount'),
  aiFieldCountLabel: document.querySelector('#aiFieldCountLabel'),
  aiFieldQualityFlagsLabel: document.querySelector('#aiFieldQualityFlagsLabel'),
  aiFlagWeakOutdated: document.querySelector('#aiFlagWeakOutdated'),
  aiFlagWeakOutdatedLabel: document.querySelector('#aiFlagWeakOutdatedLabel'),
  aiFlagNoMobile: document.querySelector('#aiFlagNoMobile'),
  aiFlagNoMobileLabel: document.querySelector('#aiFlagNoMobileLabel'),
  aiFlagNoCta: document.querySelector('#aiFlagNoCta'),
  aiFlagNoCtaLabel: document.querySelector('#aiFlagNoCtaLabel'),
  aiFlagNoContactInfo: document.querySelector('#aiFlagNoContactInfo'),
  aiFlagNoContactInfoLabel: document.querySelector('#aiFlagNoContactInfoLabel'),
  aiEnrichNote: document.querySelector('#aiEnrichNote'),
  aiEnrichNoteText: document.querySelector('#aiEnrichNoteText'),
  aiEnrichEligible: document.querySelector('#aiEnrichEligible'),
  aiSearchCancelButton: document.querySelector('#aiSearchCancelButton'),
  aiSearchCancelButtonLabel: document.querySelector('#aiSearchCancelButtonLabel'),
  useAi: document.querySelector('#useAi'),
  useWebSearch: document.querySelector('#useWebSearch'),
  modelInput: document.querySelector('#modelInput'),
  searchModelInput: document.querySelector('#searchModelInput'),
  analyzeButton: document.querySelector('#analyzeButton'),
  runStatus: document.querySelector('#runStatus'),
  totalMetric: document.querySelector('#totalMetric'),
  aMetric: document.querySelector('#aMetric'),
  noSiteMetric: document.querySelector('#noSiteMetric'),
  reviewMetric: document.querySelector('#reviewMetric'),
  manualReviewMetric: document.querySelector('#manualReviewMetric'),
  resultFilterText: document.querySelector('#resultFilterText'),
  resultFilterSize: document.querySelector('#resultFilterSize'),
  resultFilterPriority: document.querySelector('#resultFilterPriority'),
  resetFiltersButton: document.querySelector('#resetFiltersButton'),
  filterSummary: document.querySelector('#filterSummary'),
  sidebarSiteFilter: document.querySelector('#sidebarSiteFilter'),
  sidebarMinScore: document.querySelector('#sidebarMinScore'),
  sidebarHasSocial: document.querySelector('#sidebarHasSocial'),
  sidebarHasPhone: document.querySelector('#sidebarHasPhone'),
  sidebarHasEmail: document.querySelector('#sidebarHasEmail'),
  exportCsvButton: document.querySelector('#exportCsvButton'),
  headerExportCsvButton: document.querySelector('#headerExportCsvButton'),
  parserAcademyLink: document.querySelector('#parserAcademyLink'),
  parserAdminLink: document.querySelector('#parserAdminLink'),
  parserLogoutButton: document.querySelector('#parserLogoutButton'),
  exportJsonButton: document.querySelector('#exportJsonButton'),
  languageToggle: document.querySelector('#languageToggle'),
  resultsBody: document.querySelector('#resultsBody'),
  detailTitle: document.querySelector('#detailTitle'),
  detailPriority: document.querySelector('#detailPriority'),
  detailContent: document.querySelector('#detailContent'),
  viewTabResults: document.querySelector('#viewTabResults'),
  viewTabHistory: document.querySelector('#viewTabHistory'),
  viewTabSaved: document.querySelector('#viewTabSaved'),
  resultsView: document.querySelector('#resultsView'),
  historyView: document.querySelector('#historyView'),
  historyBody: document.querySelector('#historyBody'),
  refreshHistoryButton: document.querySelector('#refreshHistoryButton'),
  savedView: document.querySelector('#savedView'),
  savedFoldersList: document.querySelector('#savedFoldersList'),
  createFolderButton: document.querySelector('#createFolderButton'),
  savedSearchInput: document.querySelector('#savedSearchInput'),
  savedStatusFilter: document.querySelector('#savedStatusFilter'),
  savedSortSelect: document.querySelector('#savedSortSelect'),
  refreshSavedButton: document.querySelector('#refreshSavedButton'),
  savedBody: document.querySelector('#savedBody'),
  savedPagination: document.querySelector('#savedPagination')
};

const sampleCsv = `company,niche,district,phone,email,website_url,source_profile,instagram,review_count,rating,last_activity,services,portfolio_available,physical_location,team_size,notes
Detailing Premium Warsaw,Auto detailing / PDR,Wola,+48500111222,detailingpremium@gmail.com,,https://booksy.com/pl-pl/demo,https://instagram.com/demo,140,4.8,2026-06-10,"powłoka ceramiczna;korekta lakieru;detailing wnętrza",true,true,2-5,"active Instagram, real photos, premium services"
Klima Expert,Klimatyzacja,Mokotow,+48500999888,kontakt@klimaexpert.pl,,https://facebook.com/demo,,32,4.6,2026-05-28,"montaż klimatyzacji;serwis klimatyzacji",true,true,3,"works across Warsaw, prices from visible in posts"
Old Site Remonty,Wykończenia wnętrz,Ursynow,+48500777777,biuro@example.com,https://example.com,,15,4.2,2026-04-01,"remont łazienki;wykończenia pod klucz",true,true,2-4,"has website but it looks like placeholder"`;

const categoryOptions = [
  { id: 'hvac', value: 'Klimatyzacja', label: 'Кондиционирование', labelPl: 'Klimatyzacja' },
  { id: 'auto_detailing', value: 'Auto detailing', label: 'Автодетейлинг', labelPl: 'Auto detailing' },
  { id: 'renovations', value: 'Remonty i wykończenia wnętrz', label: 'Ремонт и отделка интерьеров', labelPl: 'Remonty i wykończenia wnętrz' },
  { id: 'aesthetic_medicine', value: 'Medycyna estetyczna', label: 'Эстетическая медицина', labelPl: 'Medycyna estetyczna' },
  { id: 'dentistry', value: 'Stomatologia', label: 'Стоматология', labelPl: 'Stomatologia' },
  { id: 'physiotherapy', value: 'Fizjoterapia', label: 'Физиотерапия', labelPl: 'Fizjoterapia' },
  { id: 'beauty_salon', value: 'Salon kosmetyczny', label: 'Косметологический салон', labelPl: 'Salon kosmetyczny' },
  { id: 'accounting', value: 'Księgowość', label: 'Бухгалтерия', labelPl: 'Księgowość' },
  { id: 'private_kindergarten', value: 'Przedszkole prywatne', label: 'Частный детский сад', labelPl: 'Przedszkole prywatne' },
  { id: 'auto_service', value: 'Auto serwis', label: 'Автосервис', labelPl: 'Auto serwis' },
  { id: 'solar', value: 'Fotowoltaika', label: 'Солнечные панели', labelPl: 'Fotowoltaika' },
  { id: 'diet_catering', value: 'Catering dietetyczny', label: 'Диетический кейтеринг', labelPl: 'Catering dietetyczny' },
  { id: 'law_firm', value: 'Kancelaria prawna', label: 'Юридическая фирма', labelPl: 'Kancelaria prawna' },
  { id: 'accounting_office', value: 'Biuro rachunkowe', label: 'Бухгалтерское бюро', labelPl: 'Biuro rachunkowe' },
  { id: 'interior_architect', value: 'Architekt wnętrz', label: 'Дизайнер интерьеров', labelPl: 'Architekt wnętrz' },
  { id: 'garden_design', value: 'Projektowanie ogrodów', label: 'Ландшафтный дизайн', labelPl: 'Projektowanie ogrodów' },
  { id: 'electrical', value: 'Instalacje elektryczne', label: 'Электромонтаж', labelPl: 'Instalacje elektryczne' },
  { id: 'plumber', value: 'Hydraulik', label: 'Сантехник', labelPl: 'Hydraulik' },
  { id: 'heating_heat_pumps', value: 'Ogrzewanie i pompy ciepła', label: 'Отопление и тепловые насосы', labelPl: 'Ogrzewanie i pompy ciepła' },
  { id: 'appliance_service', value: 'Serwis AGD', label: 'Ремонт бытовой техники', labelPl: 'Serwis AGD' },
  { id: 'office_cleaning', value: 'Sprzątanie biur', label: 'Уборка офисов', labelPl: 'Sprzątanie biur' },
  { id: 'laundry', value: 'Pralnia', label: 'Прачечная', labelPl: 'Pralnia' },
  { id: 'hairdresser', value: 'Fryzjer', label: 'Парикмахер', labelPl: 'Fryzjer' },
  { id: 'barber', value: 'Barber', label: 'Барбершоп', labelPl: 'Barber' },
  { id: 'nails', value: 'Studio paznokci', label: 'Ногтевая студия', labelPl: 'Studio paznokci' },
  { id: 'spa_massage', value: 'Spa i masaż', label: 'Спа и массаж', labelPl: 'Spa i masaż' },
  { id: 'personal_trainer', value: 'Trener personalny', label: 'Персональный тренер', labelPl: 'Trener personalny' },
  { id: 'language_school', value: 'Szkoła językowa', label: 'Языковая школа', labelPl: 'Szkoła językowa' },
  { id: 'tutoring', value: 'Korepetycje', label: 'Репетиторы', labelPl: 'Korepetycje' },
  { id: 'dance_school', value: 'Szkoła tańca', label: 'Школа танцев', labelPl: 'Szkoła tańca' },
  { id: 'restaurant', value: 'Restauracja', label: 'Ресторан', labelPl: 'Restauracja' },
  { id: 'cafe', value: 'Kawiarnia', label: 'Кофейня', labelPl: 'Kawiarnia' },
  { id: 'hotel_apartments', value: 'Hotel / apartamenty', label: 'Отель / апартаменты', labelPl: 'Hotel / apartamenty' },
  { id: 'event_venue', value: 'Sala eventowa', label: 'Площадка для мероприятий', labelPl: 'Sala eventowa' },
  { id: 'wedding_services', value: 'Usługi ślubne', label: 'Свадебные услуги', labelPl: 'Usługi ślubne' },
  { id: 'photographer', value: 'Fotograf', label: 'Фотограф', labelPl: 'Fotograf' },
  { id: 'printing', value: 'Drukarnia', label: 'Типография', labelPl: 'Drukarnia' },
  { id: 'custom_furniture', value: 'Meble na wymiar', label: 'Мебель на заказ', labelPl: 'Meble na wymiar' },
  { id: 'blinds_windows', value: 'Rolety i okna', label: 'Роллеты и окна', labelPl: 'Rolety i okna' },
  { id: 'garage_doors', value: 'Bramy garażowe', label: 'Гаражные ворота', labelPl: 'Bramy garażowe' },
  { id: 'security', value: 'Ochrona', label: 'Охрана', labelPl: 'Ochrona' },
  { id: 'moving', value: 'Przeprowadzki', label: 'Переезды', labelPl: 'Przeprowadzki' },
  { id: 'self_storage', value: 'Magazyny self storage', label: 'Self-storage склады', labelPl: 'Magazyny self storage' },
  { id: 'veterinarian', value: 'Weterynarz', label: 'Ветеринар', labelPl: 'Weterynarz' },
  { id: 'psychologist', value: 'Gabinet psychologiczny', label: 'Психологический кабинет', labelPl: 'Gabinet psychologiczny' },
  { id: 'dietitian', value: 'Dietetyk', label: 'Диетолог', labelPl: 'Dietetyk' },
  { id: 'rehabilitation', value: 'Rehabilitacja', label: 'Реабилитация', labelPl: 'Rehabilitacja' },
  { id: 'private_clinic', value: 'Klinika prywatna', label: 'Частная клиника', labelPl: 'Klinika prywatna' },
  { id: 'specialist_shop', value: 'Sklep specjalistyczny', label: 'Специализированный магазин', labelPl: 'Sklep specjalistyczny' },
  { id: 'bike_service', value: 'Serwis rowerowy', label: 'Велосервис', labelPl: 'Serwis rowerowy' },
  { id: 'motorcycle_detailing', value: 'Detailing motocykli', label: 'Мотодетейлинг', labelPl: 'Detailing motocykli' },
  { id: 'tire_service', value: 'Wulkanizacja', label: 'Шиномонтаж', labelPl: 'Wulkanizacja' },
  { id: 'car_tuning', value: 'Tuning samochodowy', label: 'Автотюнинг', labelPl: 'Tuning samochodowy' },
  { id: 'driving_school', value: 'Szkoła jazdy', label: 'Автошкола', labelPl: 'Szkoła jazdy' },
  { id: 'real_estate', value: 'Nieruchomości', label: 'Недвижимость', labelPl: 'Nieruchomości' },
  { id: 'insurance', value: 'Ubezpieczenia', label: 'Страхование', labelPl: 'Ubezpieczenia' },
  { id: 'residential_developer', value: 'Deweloperzy mieszkaniowi', label: 'Девелоперы жилых комплексов', labelPl: 'Deweloperzy mieszkaniowi' },
  { id: 'commercial_developer', value: 'Deweloperzy nieruchomości komercyjnych', label: 'Девелоперы коммерческой недвижимости', labelPl: 'Deweloperzy nieruchomości komercyjnych' },
  { id: 'building_investor', value: 'Inwestorzy budowlani', label: 'Застройщики', labelPl: 'Inwestorzy budowlani' },
  { id: 'general_contractor', value: 'Generalni wykonawcy', label: 'Генеральные подрядчики', labelPl: 'Generalni wykonawcy' },
  { id: 'construction_company', value: 'Firmy budowlane', label: 'Строительные компании', labelPl: 'Firmy budowlane' },
  { id: 'industrial_construction', value: 'Budownictwo przemysłowe', label: 'Промышленное строительство', labelPl: 'Budownictwo przemysłowe' },
  { id: 'road_construction', value: 'Budowa dróg', label: 'Дорожное строительство', labelPl: 'Budowa dróg' },
  { id: 'bridge_construction', value: 'Budownictwo mostowe', label: 'Мостостроительные компании', labelPl: 'Budownictwo mostowe' },
  { id: 'warehouse_construction', value: 'Budowa magazynów', label: 'Строительство складов', labelPl: 'Budowa magazynów' },
  { id: 'production_facility_construction', value: 'Budowa obiektów produkcyjnych', label: 'Строительство производственных объектов', labelPl: 'Budowa obiektów produkcyjnych' },
  { id: 'logistics_center_construction', value: 'Budowa centrów logistycznych', label: 'Строительство логистических центров', labelPl: 'Budowa centrów logistycznych' },
  { id: 'hotel_construction', value: 'Budowa hoteli', label: 'Строительство гостиниц', labelPl: 'Budowa hoteli' },
  { id: 'shopping_mall_construction', value: 'Budowa centrów handlowych', label: 'Строительство торговых центров', labelPl: 'Budowa centrów handlowych' },
  { id: 'building_reconstruction', value: 'Przebudowa i modernizacja budynków', label: 'Реконструкция зданий', labelPl: 'Przebudowa i modernizacja budynków' },
  { id: 'heritage_restoration', value: 'Konserwacja i restauracja zabytków', label: 'Реставрация', labelPl: 'Konserwacja i restauracja zabytków' },
  { id: 'monolithic_works', value: 'Roboty monolityczne', label: 'Монолитные работы', labelPl: 'Roboty monolityczne' },
  { id: 'rc_structures', value: 'Konstrukcje żelbetowe', label: 'Железобетонные конструкции', labelPl: 'Konstrukcje żelbetowe' },
  { id: 'steel_structures', value: 'Konstrukcje stalowe', label: 'Металлоконструкции', labelPl: 'Konstrukcje stalowe' },
  { id: 'roofing', value: 'Firmy dekarskie', label: 'Кровельные компании', labelPl: 'Firmy dekarskie' },
  { id: 'facade', value: 'Firmy elewacyjne', label: 'Фасадные компании', labelPl: 'Firmy elewacyjne' },
  { id: 'earthworks', value: 'Roboty ziemne', label: 'Земляные работы', labelPl: 'Roboty ziemne' },
  { id: 'demolition', value: 'Rozbiórki budynków', label: 'Снос зданий', labelPl: 'Rozbiórki budynków' },
  { id: 'drilling', value: 'Usługi wiertnicze', label: 'Бурение', labelPl: 'Usługi wiertnicze' },
  { id: 'geodesy', value: 'Usługi geodezyjne', label: 'Геодезия', labelPl: 'Usługi geodezyjne' },
  { id: 'geology', value: 'Badania geologiczne', label: 'Геология', labelPl: 'Badania geologiczne' },
  { id: 'bim_design', value: 'Projektowanie BIM', label: 'BIM-проектирование', labelPl: 'Projektowanie BIM' },
  { id: 'architecture_firm', value: 'Biura architektoniczne', label: 'Архитектурные бюро', labelPl: 'Biura architektoniczne' },
  { id: 'design_bureau', value: 'Biura projektowe', label: 'Проектные бюро', labelPl: 'Biura projektowe' },
  { id: 'public_space_design', value: 'Projektowanie przestrzeni publicznych', label: 'Дизайн общественных пространств', labelPl: 'Projektowanie przestrzeni publicznych' },
  { id: 'landscape_architecture', value: 'Architektura krajobrazu', label: 'Ландшафтная архитектура', labelPl: 'Architektura krajobrazu' },
  { id: 'budowa-domow', value: 'Budowa domów', label: 'Строительство домов', labelPl: 'Budowa domów' },
  { id: 'domy-szkieletowe', value: 'Domy szkieletowe', label: 'Каркасные дома', labelPl: 'Domy szkieletowe' },
  { id: 'domy-drewniane', value: 'Domy drewniane', label: 'Деревянные дома', labelPl: 'Domy drewniane' },
  { id: 'domy-modulowe', value: 'Domy modułowe', label: 'Модульные дома', labelPl: 'Domy modułowe' },
  { id: 'domy-pasywne', value: 'Domy pasywne', label: 'Пассивные дома', labelPl: 'Domy pasywne' },
  { id: 'producenci-domow', value: 'Producenci domów', label: 'Производители домов', labelPl: 'Producenci domów' },
  { id: 'sauny-ogrodowe', value: 'Sauny ogrodowe', label: 'Производители бань', labelPl: 'Sauny ogrodowe' },
  { id: 'producenci-garazy', value: 'Producenci garaży', label: 'Производители гаражей', labelPl: 'Producenci garaży' },
  { id: 'producenci-wiat', value: 'Producenci wiat', label: 'Производители навесов', labelPl: 'Producenci wiat' },
  { id: 'sprzedaz-koparek', value: 'Sprzedaż koparek', label: 'Продажа экскаваторов', labelPl: 'Sprzedaż koparek' },
  { id: 'sprzedaz-ladowarek', value: 'Sprzedaż ładowarek', label: 'Продажа погрузчиков', labelPl: 'Sprzedaż ładowarek' },
  { id: 'sprzedaz-dzwigow', value: 'Sprzedaż dźwigów', label: 'Продажа кранов', labelPl: 'Sprzedaż dźwigów' },
  { id: 'sprzedaz-maszyn-budowlanych', value: 'Sprzedaż maszyn budowlanych', label: 'Продажа спецтехники', labelPl: 'Sprzedaż maszyn budowlanych' },
  { id: 'wynajem-maszyn-budowlanych', value: 'Wynajem maszyn budowlanych', label: 'Аренда спецтехники', labelPl: 'Wynajem maszyn budowlanych' },
  { id: 'serwis-maszyn-budowlanych', value: 'Serwis maszyn budowlanych', label: 'Сервис спецтехники', labelPl: 'Serwis maszyn budowlanych' },
  { id: 'czesci-do-maszyn-budowlanych', value: 'Części do maszyn budowlanych', label: 'Запчасти для спецтехники', labelPl: 'Części do maszyn budowlanych' },
  { id: 'leasing-maszyn-budowlanych', value: 'Leasing maszyn budowlanych', label: 'Лизинг техники', labelPl: 'Leasing maszyn budowlanych' },
  { id: 'window_manufacturer', value: 'Producenci okien', label: 'Производители окон', labelPl: 'Producenci okien' },
  { id: 'door_manufacturer', value: 'Producenci drzwi', label: 'Производители дверей', labelPl: 'Producenci drzwi' },
  { id: 'facade_manufacturer', value: 'Producenci fasad', label: 'Производители фасадов', labelPl: 'Producenci fasad' },
  { id: 'furniture_manufacturer', value: 'Producenci mebli', label: 'Производители мебели', labelPl: 'Producenci mebli' },
  { id: 'kitchen_manufacturer', value: 'Producenci kuchni', label: 'Производители кухонь', labelPl: 'Producenci kuchni' },
  { id: 'staircase_manufacturer', value: 'Producenci schodów', label: 'Производители лестниц', labelPl: 'Producenci schodów' },
  { id: 'gate_manufacturer', value: 'Producenci bram', label: 'Производители ворот', labelPl: 'Producenci bram' },
  { id: 'fencing_manufacturer', value: 'Producenci ogrodzeń', label: 'Производители ограждений', labelPl: 'Producenci ogrodzeń' },
  { id: 'aluminum_construction_manufacturer', value: 'Producenci konstrukcji aluminiowych', label: 'Производители алюминиевых конструкций', labelPl: 'Producenci konstrukcji aluminiowych' },
  { id: 'pvc_manufacturer', value: 'Producenci PVC', label: 'Производители ПВХ', labelPl: 'Producenci PVC' },
  { id: 'glass_manufacturer', value: 'Producenci szkła', label: 'Производители стекла', labelPl: 'Producenci szkła' },
  { id: 'building_materials_manufacturer', value: 'Producenci materiałów budowlanych', label: 'Производители стройматериалов', labelPl: 'Producenci materiałów budowlanych' },
  { id: 'concrete_manufacturer', value: 'Producenci betonu', label: 'Производители бетона', labelPl: 'Producenci betonu' },
  { id: 'brick_manufacturer', value: 'Producenci cegły', label: 'Производители кирпича', labelPl: 'Producenci cegły' },
  { id: 'tile_manufacturer', value: 'Producenci płytek', label: 'Производители плитки', labelPl: 'Producenci płytek' },
  { id: 'parquet_manufacturer', value: 'Producenci parkietu', label: 'Производители паркета', labelPl: 'Producenci parkietu' },
  { id: 'roofing_manufacturer', value: 'Producenci pokryć dachowych', label: 'Производители кровли', labelPl: 'Producenci pokryć dachowych' },
  { id: 'heating_systems', value: 'Ogrzewanie / instalacje grzewcze', label: 'Отопление', labelPl: 'Ogrzewanie / instalacje grzewcze' },
  { id: 'heat_pumps', value: 'Pompy ciepła', label: 'Тепловые насосы', labelPl: 'Pompy ciepła' },
  { id: 'electrical_installation', value: 'Elektryka / elektroinstalacje', label: 'Электромонтаж', labelPl: 'Elektryka / elektroinstalacje' },
  { id: 'plumbing', value: 'Hydraulika / usługi sanitarne', label: 'Сантехника', labelPl: 'Hydraulika / usługi sanitarne' },
  { id: 'building_automation', value: 'Automatyka budynkowa', label: 'Автоматизация зданий', labelPl: 'Automatyka budynkowa' },
  { id: 'smart_home', value: 'Inteligentny dom / smart home', label: 'Умный дом', labelPl: 'Inteligentny dom / smart home' },
  { id: 'fire_safety', value: 'Systemy sygnalizacji pożaru / ochrona ppoż', label: 'Пожарная безопасность', labelPl: 'Systemy sygnalizacji pożaru / ochrona ppoż' },
  { id: 'cctv', value: 'Monitoring wizyjny / CCTV', label: 'Видеонаблюдение', labelPl: 'Monitoring wizyjny / CCTV' },
  { id: 'access_control', value: 'Kontrola dostępu', label: 'Контроль доступа', labelPl: 'Kontrola dostępu' },
  { id: 'elevator_company', value: 'Firmy windowe / dźwigi osobowe', label: 'Лифтовые компании', labelPl: 'Firmy windowe / dźwigi osobowe' },
  { id: 'realestate-agencies', value: 'Agencje nieruchomości', label: 'Агентства недвижимости', labelPl: 'Agencje nieruchomości' },
  { id: 'commercial-realestate', value: 'Nieruchomości komercyjne', label: 'Коммерческая недвижимость', labelPl: 'Nieruchomości komercyjne' },
  { id: 'new-developments', value: 'Mieszkania od dewelopera', label: 'Продажа новостроек', labelPl: 'Mieszkania od dewelopera' },
  { id: 'property-management', value: 'Zarządzanie nieruchomościami', label: 'Управление недвижимостью', labelPl: 'Zarządzanie nieruchomościami' },
  { id: 'business-centers', value: 'Centra biznesowe', label: 'Бизнес-центры', labelPl: 'Centra biznesowe' },
  { id: 'logistics-parks', value: 'Parki logistyczne', label: 'Логистические парки', labelPl: 'Parki logistyczne' },
  { id: 'industrial-parks', value: 'Parki przemysłowe', label: 'Индустриальные парки', labelPl: 'Parki przemysłowe' },
  { id: 'logistics-companies', value: 'Firmy logistyczne', label: 'Логистические компании', labelPl: 'Firmy logistyczne' },
  { id: 'transport-companies', value: 'Firmy transportowe', label: 'Транспортные компании', labelPl: 'Firmy transportowe' },
  { id: 'export', value: 'Eksport', label: 'Экспорт', labelPl: 'Eksport' },
  { id: 'import', value: 'Import', label: 'Импорт', labelPl: 'Import' },
  { id: 'manufacturing', value: 'Przedsiębiorstwa produkcyjne', label: 'Производственные предприятия', labelPl: 'Przedsiębiorstwa produkcyjne' },
  { id: 'factories', value: 'Fabryki', label: 'Заводы', labelPl: 'Fabryki' },
  { id: 'wholesale-suppliers', value: 'Hurtownie', label: 'Оптовые поставщики', labelPl: 'Hurtownie' },
  { id: 'distributors', value: 'Dystrybutorzy', label: 'Дистрибьюторы', labelPl: 'Dystrybutorzy' },
  { id: 'car_dealership', value: 'Salony samochodowe', label: 'Автосалоны', labelPl: 'Salony samochodowe' },
  { id: 'car_dealers', value: 'Autoryzowani dealerzy samochodowi', label: 'Дилеры автомобилей', labelPl: 'Autoryzowani dealerzy samochodowi' },
  { id: 'premium_cars', value: 'Samochody premium i luksusowe', label: 'Премиальные автомобили', labelPl: 'Samochody premium i luksusowe' },
  { id: 'car_service', value: 'Autoserwisy i warsztaty samochodowe', label: 'Автосервисы', labelPl: 'Autoserwisy i warsztaty samochodowe' },
  { id: 'car_wrapping', value: 'Oklejanie samochodów folią', label: 'Оклейка авто плёнкой', labelPl: 'Oklejanie samochodów folią' },
  { id: 'car_tuning_workshop', value: 'Warsztat tuningowy (chip tuning)', label: 'Тюнинг автомобилей', labelPl: 'Warsztat tuningowy (chip tuning)' },
  { id: 'body_repair', value: 'Lakiernictwo i blacharstwo samochodowe', label: 'Кузовной ремонт и покраска', labelPl: 'Lakiernictwo i blacharstwo samochodowe' },
  { id: 'truck_sales', value: 'Sprzedaż ciężarówek', label: 'Продажа грузовиков', labelPl: 'Sprzedaż ciężarówek' },
  { id: 'bus_sales', value: 'Sprzedaż autobusów', label: 'Продажа автобусов', labelPl: 'Sprzedaż autobusów' },
  { id: 'farm_equipment_sales', value: 'Sprzedaż maszyn rolniczych', label: 'Продажа сельхозтехники', labelPl: 'Sprzedaż maszyn rolniczych' },
  { id: 'trailer_sales', value: 'Sprzedaż przyczep', label: 'Продажа прицепов', labelPl: 'Sprzedaż przyczep' },
  { id: 'heavy_vehicle_sales', value: 'Sprzedaż pojazdów specjalistycznych', label: 'Продажа спецтехники (коммерческий транспорт)', labelPl: 'Sprzedaż pojazdów specjalistycznych' },
  { id: 'clinics_general', value: 'Kliniki medyczne', label: 'Клиники', labelPl: 'Kliniki medyczne' },
  { id: 'medical_center', value: 'Centra medyczne', label: 'Медицинские центры', labelPl: 'Centra medyczne' },
  { id: 'private_hospital', value: 'Szpitale prywatne', label: 'Частные больницы', labelPl: 'Szpitale prywatne' },
  { id: 'dentistry_clinic', value: 'Kliniki stomatologiczne', label: 'Стоматологии', labelPl: 'Kliniki stomatologiczne' },
  { id: 'implantology', value: 'Implantologia stomatologiczna', label: 'Имплантология', labelPl: 'Implantologia stomatologiczna' },
  { id: 'orthodontics', value: 'Ortodoncja', label: 'Ортодонтия', labelPl: 'Ortodoncja' },
  { id: 'aesthetic_medicine_clinic', value: 'Medycyna estetyczna (klinika)', label: 'Эстетическая медицина', labelPl: 'Medycyna estetyczna (klinika)' },
  { id: 'plastic_surgery', value: 'Chirurgia plastyczna', label: 'Пластическая хирургия', labelPl: 'Chirurgia plastyczna' },
  { id: 'fertility_clinic', value: 'Kliniki leczenia niepłodności', label: 'Репродуктивные центры', labelPl: 'Kliniki leczenia niepłodności' },
  { id: 'ophthalmology', value: 'Okulistyka', label: 'Офтальмология', labelPl: 'Okulistyka' },
  { id: 'orthopedics', value: 'Ortopedia', label: 'Ортопедия', labelPl: 'Ortopedia' },
  { id: 'medical_rehabilitation', value: 'Rehabilitacja medyczna', label: 'Реабилитация', labelPl: 'Rehabilitacja medyczna' },
  { id: 'psychology_practice', value: 'Psychoterapia i psychologia', label: 'Психология', labelPl: 'Psychoterapia i psychologia' },
  { id: 'diagnostic_center', value: 'Centra diagnostyczne', label: 'Диагностические центры', labelPl: 'Centra diagnostyczne' },
  { id: 'veterinary_clinic', value: 'Kliniki weterynaryjne', label: 'Ветеринарные клиники', labelPl: 'Kliniki weterynaryjne' },
  { id: 'law_firm_advocate', value: 'Kancelarie adwokackie', label: 'Адвокатские бюро', labelPl: 'Kancelarie adwokackie' },
  { id: 'legal_firm', value: 'Kancelarie prawne', label: 'Юридические фирмы', labelPl: 'Kancelarie prawne' },
  { id: 'tax_advisor', value: 'Doradcy podatkowi', label: 'Налоговые консультанты', labelPl: 'Doradcy podatkowi' },
  { id: 'bankruptcy_law', value: 'Kancelarie upadłościowe', label: 'Банкротство', labelPl: 'Kancelarie upadłościowe' },
  { id: 'immigration_lawyer', value: 'Kancelarie imigracyjne', label: 'Иммиграционные юристы', labelPl: 'Kancelarie imigracyjne' },
  { id: 'business_lawyer', value: 'Obsługa prawna firm', label: 'Бизнес-юристы', labelPl: 'Obsługa prawna firm' },
  { id: 'notary', value: 'Kancelarie notarialne', label: 'Нотариусы', labelPl: 'Kancelarie notarialne' },
  { id: 'investment_company', value: 'Firmy inwestycyjne', label: 'Инвестиционные компании', labelPl: 'Firmy inwestycyjne' },
  { id: 'financial_advisor', value: 'Doradcy finansowi', label: 'Финансовые консультанты', labelPl: 'Doradcy finansowi' },
  { id: 'mortgage_broker', value: 'Brokerzy hipoteczni', label: 'Ипотечные брокеры', labelPl: 'Brokerzy hipoteczni' },
  { id: 'insurance_agency', value: 'Agencje ubezpieczeniowe', label: 'Страховые агентства', labelPl: 'Agencje ubezpieczeniowe' },
  { id: 'leasing_company', value: 'Firmy leasingowe', label: 'Лизинговые компании', labelPl: 'Firmy leasingowe' },
  { id: 'accounting_firm', value: 'Obsługa księgowa firm', label: 'Бухгалтерские фирмы', labelPl: 'Obsługa księgowa firm' },
  { id: 'hotel', value: 'Hotele', label: 'Отели', labelPl: 'Hotele' },
  { id: 'boutique_hotel', value: 'Hotele butikowe', label: 'Бутик-отели', labelPl: 'Hotele butikowe' },
  { id: 'spa_center', value: 'Salony SPA', label: 'СПА', labelPl: 'Salony SPA' },
  { id: 'resort', value: 'Resorty', label: 'Курорты', labelPl: 'Resorty' },
  { id: 'fine_dining_restaurant', value: 'Restauracje fine dining', label: 'Рестораны высокого уровня', labelPl: 'Restauracje fine dining' },
  { id: 'catering_company', value: 'Firmy cateringowe', label: 'Кейтеринг', labelPl: 'Firmy cateringowe' },
  { id: 'fitness_club', value: 'Kluby fitness', label: 'Фитнес-клубы', labelPl: 'Kluby fitness' },
  { id: 'premium_gym', value: 'Ekskluzywne siłownie', label: 'Премиальные залы', labelPl: 'Ekskluzywne siłownie' },
  { id: 'pilates_studio', value: 'Studia pilatesu', label: 'Студии пилатеса', labelPl: 'Studia pilatesu' },
  { id: 'dance_schools', value: 'Szkoły tańca', label: 'Танцевальные школы', labelPl: 'Szkoły tańca' },
  { id: 'tennis_club', value: 'Kluby tenisowe', label: 'Теннисные клубы', labelPl: 'Kluby tenisowe' },
  { id: 'golf_club', value: 'Kluby golfowe', label: 'Гольф-клубы', labelPl: 'Kluby golfowe' },
  { id: 'private_school', value: 'Szkoły prywatne', label: 'Частные школы', labelPl: 'Szkoły prywatne' },
  { id: 'language_schools', value: 'Szkoły językowe', label: 'Языковые школы', labelPl: 'Szkoły językowe' },
  { id: 'online_school', value: 'Szkoły online', label: 'Онлайн-школы', labelPl: 'Szkoły online' },
  { id: 'training_center', value: 'Centra szkoleniowe', label: 'Учебные центры', labelPl: 'Centra szkoleniowe' },
  { id: 'corporate_training', value: 'Szkolenia korporacyjne', label: 'Корпоративное обучение', labelPl: 'Szkolenia korporacyjne' },
  { id: 'jewelry_house', value: 'Domy jubilerskie', label: 'Ювелирные дома', labelPl: 'Domy jubilerskie' },
  { id: 'premium_furniture', value: 'Meble premium', label: 'Премиальная мебель', labelPl: 'Meble premium' },
  { id: 'interior_design', value: 'Projektowanie wnętrz', label: 'Дизайн интерьеров', labelPl: 'Projektowanie wnętrz' },
  { id: 'luxury_architecture_studio', value: 'Pracownie architektury rezydencjonalnej', label: 'Архитектура частных резиденций', labelPl: 'Pracownie architektury rezydencjonalnej' },
  { id: 'private_villa_developer', value: 'Budowa willi', label: 'Частные виллы (застройщики)', labelPl: 'Budowa willi' },
  { id: 'yacht_sales', value: 'Jachty - sprzedaż i czarter', label: 'Яхты', labelPl: 'Jachty - sprzedaż i czarter' },
  { id: 'private_aviation', value: 'Lotnictwo prywatne', label: 'Частная авиация', labelPl: 'Lotnictwo prywatne' },
  { id: 'landscaping_company', value: 'Firmy ogrodnicze / architektura krajobrazu', label: 'Ландшафтные компании', labelPl: 'Firmy ogrodnicze / architektura krajobrazu' },
  { id: 'greenery_planting', value: 'Nasadzenia i zieleń', label: 'Озеленение', labelPl: 'Nasadzenia i zieleń' },
  { id: 'irrigation_systems', value: 'Systemy nawadniania', label: 'Автоматический полив', labelPl: 'Systemy nawadniania' },
  { id: 'pool_construction', value: 'Baseny - budowa', label: 'Бассейны', labelPl: 'Baseny - budowa' },
  { id: 'sauna_manufacturer', value: 'Sauny - produkcja i montaż', label: 'Сауны', labelPl: 'Sauny - produkcja i montaż' },
  { id: 'terrace_construction', value: 'Tarasy - budowa', label: 'Террасы', labelPl: 'Tarasy - budowa' },
  { id: 'paving_stones', value: 'Kostka brukowa - układanie', label: 'Брусчатка', labelPl: 'Kostka brukowa - układanie' },
  { id: 'fencing_company', value: 'Ogrodzenia', label: 'Заборы', labelPl: 'Ogrodzenia' },
  { id: 'outdoor_lighting', value: 'Oświetlenie terenów zewnętrznych', label: 'Освещение участков', labelPl: 'Oświetlenie terenów zewnętrznych' },
  { id: 'mechanical_engineering', value: 'Budowa maszyn', label: 'Машиностроение', labelPl: 'Budowa maszyn' },
  { id: 'metalworking', value: 'Obróbka metali', label: 'Металлообработка', labelPl: 'Obróbka metali' },
  { id: 'laser_cutting', value: 'Cięcie laserowe', label: 'Лазерная резка', labelPl: 'Cięcie laserowe' },
  { id: 'cnc_machining', value: 'Obróbka CNC', label: 'Обработка на станках CNC', labelPl: 'Obróbka CNC' },
  { id: 'welding_services', value: 'Spawalnictwo / usługi spawalnicze', label: 'Сварка', labelPl: 'Spawalnictwo / usługi spawalnicze' },
  { id: 'robotics_automation', value: 'Robotyzacja produkcji', label: 'Роботизация', labelPl: 'Robotyzacja produkcji' },
  { id: 'production_automation', value: 'Automatyzacja produkcji', label: 'Автоматизация производства', labelPl: 'Automatyzacja produkcji' },
  { id: 'solar_power_plants', value: 'Elektrownie słoneczne / fotowoltaika', label: 'Солнечные электростанции', labelPl: 'Elektrownie słoneczne / fotowoltaika' },
  { id: 'wind_energy', value: 'Energetyka wiatrowa', label: 'Ветрогенерация', labelPl: 'Energetyka wiatrowa' },
  { id: 'ev_charging_stations', value: 'Stacje ładowania samochodów elektrycznych', label: 'Зарядные станции для электромобилей', labelPl: 'Stacje ładowania samochodów elektrycznych' },
  { id: 'energy_audit', value: 'Audyt energetyczny', label: 'Энергоаудит', labelPl: 'Audyt energetyczny' },
  { id: 'energy_service_company', value: 'Przedsiębiorstwa usług energetycznych (ESCO)', label: 'Энергосервисные компании', labelPl: 'Przedsiębiorstwa usług energetycznych (ESCO)' },
  { id: 'office_building_construction', value: 'Budowa biurowców', label: 'Строительство офисных зданий', labelPl: 'Budowa biurowców' },
  { id: 'public_building_construction', value: 'Budowa obiektów użyteczności publicznej', label: 'Строительство общественных зданий', labelPl: 'Budowa obiektów użyteczności publicznej' },
  { id: 'office_fitout', value: 'Fit-out i wykończenia biur', label: 'Фит-аут и отделка офисов', labelPl: 'Fit-out i wykończenia biur' },
  { id: 'container_manufacturer', value: 'Producenci kontenerów', label: 'Производители контейнеров', labelPl: 'Producenci kontenerów' },
  { id: 'forklift_sales', value: 'Sprzedaż wózków widłowych', label: 'Продажа вилочных погрузчиков', labelPl: 'Sprzedaż wózków widłowych' },
  { id: 'aerial_platform_sales', value: 'Sprzedaż i wynajem podnośników', label: 'Продажа и аренда подъёмников', labelPl: 'Sprzedaż i wynajem podnośników' },
  { id: 'demolition_equipment_sales', value: 'Sprzęt wyburzeniowy - sprzedaż i wynajem', label: 'Продажа и аренда оборудования для сноса', labelPl: 'Sprzęt wyburzeniowy - sprzedaż i wynajem' },
  { id: 'oversized_transport', value: 'Transport ponadgabarytowy', label: 'Негабаритные перевозки', labelPl: 'Transport ponadgabarytowy' },
  { id: 'energy_storage_systems', value: 'Magazyny energii', label: 'Системы накопления энергии', labelPl: 'Magazyny energii' },
  { id: 'serviced_apartment_operator', value: 'Operatorzy apartamentów', label: 'Операторы апарт-отелей', labelPl: 'Operatorzy apartamentów' },
  { id: 'winter_garden_pergola', value: 'Ogrody zimowe i pergole', label: 'Зимние сады и перголы', labelPl: 'Ogrody zimowe i pergole' }
];

const topCategories = categoryOptions.slice(0, 12);
const allCategories = categoryOptions;
const categoryById = new Map(categoryOptions.map((option) => [option.id, option]));
const categoryByLookup = new Map();
for (const option of categoryOptions) {
  [option.id, option.value, option.label, option.labelPl].filter(Boolean).forEach((key) => {
    const lookupKey = normalizeLookupValue(key);
    if (lookupKey) categoryByLookup.set(lookupKey, option);
  });
}

const localCitySuggestions = [
  ['Warszawa', 'Warszawa, Mazowieckie, Polska'],
  ['Kraków', 'Kraków, Małopolskie, Polska'],
  ['Łódź', 'Łódź, Łódzkie, Polska'],
  ['Wrocław', 'Wrocław, Dolnośląskie, Polska'],
  ['Poznań', 'Poznań, Wielkopolskie, Polska'],
  ['Gdańsk', 'Gdańsk, Pomorskie, Polska'],
  ['Gdynia', 'Gdynia, Pomorskie, Polska'],
  ['Sopot', 'Sopot, Pomorskie, Polska'],
  ['Szczecin', 'Szczecin, Zachodniopomorskie, Polska'],
  ['Bydgoszcz', 'Bydgoszcz, Kujawsko-pomorskie, Polska'],
  ['Lublin', 'Lublin, Lubelskie, Polska'],
  ['Katowice', 'Katowice, Śląskie, Polska'],
  ['Białystok', 'Białystok, Podlaskie, Polska'],
  ['Rzeszów', 'Rzeszów, Podkarpackie, Polska'],
  ['Toruń', 'Toruń, Kujawsko-pomorskie, Polska'],
  ['Kielce', 'Kielce, Świętokrzyskie, Polska'],
  ['Gliwice', 'Gliwice, Śląskie, Polska'],
  ['Zabrze', 'Zabrze, Śląskie, Polska'],
  ['Olsztyn', 'Olsztyn, Warmińsko-mazurskie, Polska'],
  ['Opole', 'Opole, Opolskie, Polska'],
  ['Zielona Góra', 'Zielona Góra, Lubuskie, Polska'],
  ['Radom', 'Radom, Mazowieckie, Polska'],
  ['Częstochowa', 'Częstochowa, Śląskie, Polska'],
  ['Bielsko-Biała', 'Bielsko-Biała, Śląskie, Polska'],
  ['Tychy', 'Tychy, Śląskie, Polska']
];

const inputCsvHeaders = [
  '_companyId',
  'company',
  'legal_name',
  'niche',
  'city',
  'district',
  'address',
  'phone',
  'email',
  'nip',
  'regon',
  'krs',
  'edrpou',
  'pkd',
  'status',
  'registration_date',
  'website_url',
  'source',
  'source_profile',
  'instagram',
  'facebook',
  'tiktok',
  'review_count',
  'rating',
  'last_activity',
  'activity_signal',
  'services',
  'portfolio_available',
  'physical_location',
  'team_size',
  'multiple_locations',
  'high_ticket',
  'paid_platform',
  'notes'
];

function normalizeLookupValue(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// `value` is usually input.niche - which is frequently the literal search
// phrase used to find the lead (often Polish, e.g. "montaż klimatyzacji")
// rather than a canonical category id, even when a matching category_id
// (e.g. "hvac") is present on the same record. When a categoryId is passed,
// always resolve the label through it first, so ru mode doesn't leak a raw
// Polish search phrase just because the niche string itself didn't match the
// lookup table. Only fall back to the raw stored phrase when there's truly
// no category_id and no lookup match.
function displayCategory(value, categoryId) {
  const idOption = categoryId ? categoryById.get(String(categoryId)) : null;
  const option = idOption || categoryByLookup.get(normalizeLookupValue(value));
  if (option) return currentLanguage === 'pl' ? option.labelPl || option.value : option.label || option.value;
  return String(value || '').trim() || '-';
}

function formatCategoryList(values) {
  const list = Array.isArray(values) ? values : [values];
  return list.map(displayCategory).filter(Boolean).join(', ') || '-';
}

function displaySourceLabel(value) {
  const raw = String(value || '').trim();
  if (!raw) return '-';

  const labels = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part === 'all_sources') return t2('Smart search', 'Смарт-поиск');
      if (part === 'maps_api' || part.startsWith('google_places')) return 'Google Places API';
      if (part === 'amazon_location' || part.startsWith('amazon_location')) return 'Amazon Location API';
      if (part === 'internet' || part.startsWith('public_search_')) return t2('Internet i publiczne profile', 'Интернет и публичные профили');
      if (part === 'registries' || part.startsWith('public_registry') || part.startsWith('public_catalog') || part.startsWith('ceidg')) return t2('Rejestry', 'Реестры');
      if (part === 'directories') return t2('Katalogi', 'Каталоги');
      if (part === 'booking') return t2('Booksy / zapisy', 'Booksy / запись');
      if (part === 'social') return t2('Social media', 'Соцсети');
      if (part === 'cross_verification') return t2('Weryfikacja źródeł', 'Сверка источников');
      return part;
    });

  return [...new Set(labels)].join(', ');
}

function ensureResultsContext() {
  if (document.querySelector('#resultsContext')) return;
  const context = document.createElement('div');
  context.id = 'resultsContext';
  context.className = 'results-context hidden-field';
  els.configDiagnostics?.insertAdjacentElement('afterend', context);
}

function resultsContextElement() {
  return document.querySelector('#resultsContext');
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setPlaceholder(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('placeholder', value);
}

function setButtonHtml(selector, icon, label) {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = `<i data-lucide="${icon}"></i>${escapeHtml(label)}`;
}

function setOptionText(select, value, label) {
  const option = select?.querySelector(`option[value="${CSS.escape(value)}"]`);
  if (option) option.textContent = label;
}

function updateCrossAppLinks() {
  const apiBase = getApiBase();
  const targets = [
    [els.parserAcademyLink, './academy/'],
    [els.parserAdminLink, './admin/']
  ];

  targets.forEach(([element, href]) => {
    if (!element) return;
    const url = new URL(href, window.location.href);
    if (apiBase) url.searchParams.set('api', apiBase);
    element.setAttribute('href', url.toString());
  });

  els.parserAdminLink?.classList.toggle('hidden-field', session?.role !== 'admin');
}

function applyLanguage(lang = currentLanguage, { persist = true } = {}) {
  currentLanguage = lang === 'pl' ? 'pl' : 'ru';
  if (persist) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
      // Shared with Academy/Admin so switching language here carries over on navigation.
      localStorage.setItem('auraLanguage', currentLanguage);
    } catch {}
  }

  document.documentElement.lang = currentLanguage;
  els.languageToggle?.querySelectorAll('[data-lang-code]').forEach((item) => {
    item.classList.toggle('active', item.dataset.langCode === currentLanguage);
  });

  // Same PL/RU wording as shared/i18n.js' nav_academy/nav_logout keys, kept
  // inline (via t2) since the Parser page uses its own currentLanguage/tr()
  // mechanism rather than loading the shared AuraI18n script.
  const academyLink = document.querySelector('#parserAcademyLink');
  if (academyLink) {
    academyLink.innerHTML = `<i data-lucide="graduation-cap"></i>${escapeHtml(t2('Akademia', 'Академия'))}`;
  }
  const logoutButton = document.querySelector('#parserLogoutButton');
  if (logoutButton) {
    logoutButton.innerHTML = `<i data-lucide="log-out"></i>${escapeHtml(t2('Wyloguj', 'Выйти'))}`;
  }

  setText('.sidebar-title h2', tr('sidebarTitle'));
  // Targeted by id rather than `.discover-panel .step-title` position - the
  // AI company search mode selector and its curated-criteria block (see
  // applyAiSearchStaticCopy() below) added their own `.step-title` elements,
  // so a positional NodeList index would silently start writing the wrong
  // text into the wrong element after that change.
  setText('#discoverStepLocationTitle', tr('categoryLocation'));
  setText('#discoverStepFiltersTitle', tr('filtersStep'));
  setText('.main-header p', tr('titleSubtitle'));
  setButtonHtml('#viewTabResults', 'table', tr('results'));
  setButtonHtml('#viewTabHistory', 'history', tr('history'));
  setButtonHtml('#headerExportCsvButton', 'download', tr('exportCsv'));
  setButtonHtml('#sampleButton', 'list-plus', tr('sampleData'));
  const importLabels = document.querySelectorAll('label[for="fileInput"]');
  importLabels.forEach((label) => {
    label.innerHTML = `<i data-lucide="${label.classList.contains('file-button') ? 'file-up' : 'upload'}"></i>${escapeHtml(tr('importCsv'))}`;
  });
  setButtonHtml('.history-header .secondary-button', 'refresh-cw', tr('refresh'));
  setButtonHtml('#resetFiltersButton', 'x', tr('resetTableFilters'));
  setText('.metric-row > div:nth-child(1) .metric-label', tr('totalFound'));
  setText('.metric-row > div:nth-child(1) em', tr('companies'));
  setText('.metric-row > div:nth-child(2) .metric-label', tr('withSite'));
  setText('.metric-row > div:nth-child(3) .metric-label', tr('withoutSite'));
  setText('.metric-row > div:nth-child(4) .metric-label', tr('inReview'));
  setText('.metric-row > div:nth-child(5) .metric-label', tr('needReview'));
  setText('.results-filters label:nth-child(1) span', tr('search'));
  setText('.results-filters label:nth-child(2) span', tr('size'));
  setText('.detail-header .eyebrow', tr('companyCard'));
  setPlaceholder('#resultFilterText', currentLanguage === 'pl' ? 'Firma, nisza, dzielnica, zrodlo' : 'Компания, ниша, район, источник');
  populateCategoryPreset();

  [
    ['#discoverCategoryPreset', tr('category')],
    ['#discoverNiche', tr('customCategory')],
    ['#discoverCountry', tr('country')],
    ['#discoverCity', tr('city')],
    ['#discoverRadius', tr('radius')],
    ['#discoverLimit', tr('resultLimit')],
    ['#discoverSource', tr('dataSource')],
    ['#sidebarSiteFilter', tr('siteStatus')],
    ['#sidebarMinScore', tr('minScore')]
  ].forEach(([selector, label]) => {
    const labelElement = document.querySelector(selector)?.closest('label')?.querySelector('span');
    if (labelElement) labelElement.textContent = label;
  });

  [
    ['#sidebarHasSocial', tr('hasSocial')],
    ['#sidebarHasPhone', tr('hasPhone')],
    ['#sidebarHasEmail', tr('hasEmail')]
  ].forEach(([selector, label]) => {
    const span = document.querySelector(selector)?.closest('label')?.querySelector('span');
    if (span) span.textContent = label;
  });

  setOptionText(els.discoverCountry, '', currentLanguage === 'pl' ? 'Nie wskazano (wedlug miasta)' : 'Не указана (по городу)');
  setOptionText(els.discoverCity, '', currentLanguage === 'pl' ? 'Wlasne / bez miasta (wedlug kraju)' : 'Своя / без города (по стране)');
  setOptionText(els.sidebarSiteFilter, 'all', tr('allStatuses'));
  setOptionText(els.sidebarSiteFilter, 'no_site', tr('noSite'));
  setOptionText(els.sidebarSiteFilter, 'has_site', tr('withSite'));
  setOptionText(els.sidebarSiteFilter, 'weak_site', tr('weakSite'));
  setOptionText(els.sidebarSiteFilter, 'uncertain', tr('inReview'));
  setOptionText(els.resultFilterSize, 'all', tr('all'));
  setOptionText(els.resultFilterSize, 'small', tr('small'));
  setOptionText(els.resultFilterSize, 'medium', tr('medium'));
  setOptionText(els.resultFilterSize, 'large', tr('large'));
  setOptionText(els.resultFilterPriority, 'all', tr('all'));

  const resultsHeaders = document.querySelectorAll('#resultsView thead th');
  [null, tr('siteStatus'), tr('company'), tr('niche'), tr('size'), tr('contacts'), null, tr('lastActivity')].forEach((label, index) => {
    if (label && resultsHeaders[index]) resultsHeaders[index].textContent = label;
  });

  const historyHeaders = document.querySelectorAll('#historyView thead th');
  const historyLabels = currentLanguage === 'pl'
    ? ['Data', 'Kategorie', 'Lokalizacja', 'Zrodlo', 'Znaleziono', 'Nowe', 'Duplikaty', 'Status']
    : ['Дата', 'Категории', 'Локация', 'Источник', 'Найдено', 'Новых', 'Дублей', 'Статус'];
  historyLabels.forEach((label, index) => {
    if (historyHeaders[index]) historyHeaders[index].textContent = label;
  });

  setButtonHtml('#viewTabSaved', 'bookmark', t2('Zapisane', 'Сохранённые'));
  if (els.createFolderButton) els.createFolderButton.title = t2('Nowy folder', 'Новая папка');
  setPlaceholder('#savedSearchInput', t2('Szukaj zapisanych firm...', 'Поиск сохранённых фирм...'));
  setOptionText(els.savedSortSelect, 'newest', t2('Najpierw nowe', 'Сначала новые'));
  setOptionText(els.savedSortSelect, 'oldest', t2('Najpierw stare', 'Сначала старые'));
  setOptionText(els.savedSortSelect, 'name', t2('Nazwa A-Z', 'Название А-Я'));
  setOptionText(els.savedSortSelect, 'status', t2('Status', 'Статус'));
  setButtonHtml('#refreshSavedButton', 'refresh-cw', t2('Odśwież', 'Обновить'));
  const savedHeaders = document.querySelectorAll('#savedTable thead th');
  [t2('Firma', 'Фирма'), t2('Status CRM', 'Статус CRM'), t2('Folder', 'Папка'), t2('Ostatni komentarz', 'Последний комментарий'), t2('Zapisano', 'Сохранено')].forEach((label, index) => {
    if (savedHeaders[index]) savedHeaders[index].textContent = label;
  });

  applyStaticCopy();
  applyAiSearchStaticCopy();
  // Registry/diagnostic cards ("Zrodla gotowe" etc.) are rendered from
  // /api/config readiness flags, not re-fetched here — re-render from the
  // last known flags so the card titles/body text pick up the new language
  // without waiting for another config poll.
  if (state.configDiagnosticsFlags) renderConfigDiagnostics(state.configDiagnosticsFlags);
  // Always re-render, not just when empty/nothing-selected: an open lead card
  // (detail panel) or a populated results table used to freeze on the old
  // language after a toggle, because these guards skipped the very re-render
  // that would have refreshed their text.
  renderResults();
  renderDetail();
  if (state.historyRuns.length || state.historyLoaded) renderHistory(state.historyRuns);
  populateSavedStatusFilter();
  if (els.savedView && !els.savedView.classList.contains('hidden-field')) {
    renderFolders();
    renderSaved();
  }
  renderResultsContext();
  renderIcons();
  updateCrossAppLinks();
  renderWorkerQuotaStatus();
}

function applyStaticCopy() {
  els.discoverButton.innerHTML = `<i data-lucide="radar"></i>${escapeHtml(tr('discoverButton'))}`;
  els.analyzeButton.innerHTML = `<i data-lucide="list-checks"></i>${escapeHtml(tr('analyzeButton'))}`;
  els.runStatus.textContent = tr('runStatus');
  els.discoverStatus.textContent = tr('discoverStatus');

  if (els.allSourcesButton) {
    els.allSourcesButton.classList.add('hidden-field');
    els.allSourcesButton.setAttribute('aria-hidden', 'true');
    els.allSourcesButton.tabIndex = -1;
  }

  const sourceLabels = {
    all_sources: tr('smartSearch'),
    amazon_location: 'Amazon Location API',
    maps_api: 'Google Places API',
    internet: tr('internetProfiles'),
    registries: tr('registries'),
    directories: tr('directories'),
    booking: 'Booksy / zapisy',
    social: tr('social')
  };

  Array.from(els.discoverSource.options).forEach((option) => {
    option.textContent = sourceLabels[option.value] || option.textContent;
  });
}

// Static labels for the AI company search UI (mode selector, curated
// criteria block, ai_enrich note, cancel button). Kept as its own function
// (rather than folded into applyStaticCopy() above) so a mistake here can
// never affect the untouched standard-search labels applyStaticCopy() sets.
function applyAiSearchStaticCopy() {
  setText('#discoverModeStepTitle', trs('discover_mode_step_title'));
  setText('#discoverModeLabel', trs('discover_mode_field_label'));
  setOptionText(els.discoverMode, 'standard', trs('discover_mode_standard'));
  setOptionText(els.discoverMode, 'ai_search', trs('discover_mode_ai_search'));
  setOptionText(els.discoverMode, 'combined', trs('discover_mode_combined'));
  setOptionText(els.discoverMode, 'ai_enrich', trs('discover_mode_ai_enrich'));

  setText('#aiSearchSectionTitle', trs('ai_search_section_title'));
  setText('#aiFieldClientTypeLabel', trs('ai_field_client_type'));
  setOptionText(els.aiClientType, 'any', trs('ai_client_type_any'));
  setOptionText(els.aiClientType, 'b2b', trs('ai_client_type_b2b'));
  setOptionText(els.aiClientType, 'b2c', trs('ai_client_type_b2c'));
  setOptionText(els.aiClientType, 'both', trs('ai_client_type_both'));

  setText('#aiFieldCompanySizeLabel', trs('ai_field_company_size'));
  setOptionText(els.aiCompanySize, 'any', trs('ai_company_size_any'));

  setText('#aiFieldMinYearsLabel', trs('ai_field_min_years'));

  setText('#aiFieldWebsitePresenceLabel', trs('ai_field_website_presence'));
  setOptionText(els.aiWebsitePresence, 'any', trs('ai_website_presence_any'));
  setOptionText(els.aiWebsitePresence, 'has_website', trs('ai_website_presence_has'));
  setOptionText(els.aiWebsitePresence, 'no_website', trs('ai_website_presence_no'));

  setText('#aiFieldQualityFlagsLabel', trs('ai_field_quality_flags'));
  setText('#aiFlagWeakOutdatedLabel', trs('ai_flag_weak_outdated'));
  setText('#aiFlagNoMobileLabel', trs('ai_flag_no_mobile'));
  setText('#aiFlagNoCtaLabel', trs('ai_flag_no_cta'));
  setText('#aiFlagNoContactInfoLabel', trs('ai_flag_no_contact_info'));

  setText('#aiFieldExtraKeywordsLabel', trs('ai_field_extra_keywords'));
  setText('#aiFieldExcludeKeywordsLabel', trs('ai_field_exclude_keywords'));
  setText('#aiFieldMinReviewsLabel', trs('ai_field_min_reviews'));
  setText('#aiFieldMinRatingLabel', trs('ai_field_min_rating'));
  setText('#aiFieldCountLabel', trs('ai_field_count'));

  setText('#aiEnrichNoteText', trs('ai_enrich_note'));
  if (els.aiSearchCancelButtonLabel) els.aiSearchCancelButtonLabel.textContent = trs('ai_search_cancel');

  renderAiEnrichEligibleHint();
}

function isDiscoveryReady(config = state.config) {
  return Boolean(
    config?.registry?.amazonLocationConfigured ||
      config?.registry?.googlePlacesConfigured ||
      config?.registry?.ceidgConfigured ||
      config?.internetSearchConfigured
  );
}

async function handlePrimaryAction() {
  // Every non-standard mode branches off to the separate AI company search
  // path (see handleAiSearchPrimaryAction() below) before any of the
  // standard-flow checks/state changes below run - #discoverMode === 'standard'
  // (the default) always falls straight through unchanged.
  const discoverMode = els.discoverMode?.value || 'standard';
  if (discoverMode !== 'standard') {
    await handleAiSearchPrimaryAction(discoverMode);
    return;
  }

  if (!isDiscoveryReady()) {
    setDiscoverStatus(t2('Ponownie łączę backend i sprawdzam źródła...', 'Переподключаю backend и заново проверяю источники...'), 'work');
    try {
      await bootstrapApiBase();
      await loadConfig();
    } catch {}
  }

  if (!isDiscoveryReady()) {
    setDiscoverStatus(
      t2(
        'Backend jeszcze nie odpowiedział. Kliknij ponownie za 2-3 sekundy lub sprawdź tunnel/backend.',
        'Backend пока не ответил. Нажмите еще раз через 2-3 секунды или проверьте tunnel/backend.'
      ),
      'warn'
    );
    return;
  }

  await runDiscovery();
}

function clearHistoryContext() {
  state.activeHistoryRun = null;
  state.historyLoadingRunId = null;
  renderResultsContext();
  if (state.historyRuns.length) renderHistory(state.historyRuns);
}

function renderResultsContext() {
  const element = resultsContextElement();
  if (!element) return;
  if (!state.activeHistoryRun) {
    element.classList.add('hidden-field');
    element.innerHTML = '';
    return;
  }

  const run = state.activeHistoryRun;
  const date = run.started_at ? new Date(run.started_at).toLocaleString() : '';
  const parts = [
    date,
    formatCategoryList(run.niches || []),
    run.city || run.district || '',
    displaySourceLabel(run.sourceFocus),
    `найдено: ${run.found_count ?? state.results.length}`
  ].filter(Boolean);

  element.classList.remove('hidden-field');
  element.innerHTML = `
    <strong>${escapeHtml(tr('openHistory'))}</strong>
    <span>${escapeHtml(parts.join(' · '))}</span>
  `;
}

async function init() {
  setDiscoverStatus(t2('Łączę backend i czytam tunnel.json...', 'Подключаю backend и читаю tunnel.json...'), 'work');
  await bootstrapApiBase();
  ensureResultsContext();
  populateCitySuggestions(localCitySuggestions);
  populateCategoryPreset();
  populateSavedStatusFilter();
  els.discoverCategoryPreset.value = 'cat:hvac';
  els.sidebarHasSocial.checked = false;
  els.sidebarHasPhone.checked = true;
  els.sidebarHasEmail.checked = false;
  els.sidebarSiteFilter.value = 'no_site';
  applyLanguage(currentLanguage, { persist: false });
  await loadConfig();
  loadCitySuggestions().catch(() => {});
  bindEvents();
  els.csvInput.value = sampleCsv;
  renderResultsContext();
  renderIcons();
}

function populateSavedStatusFilter() {
  if (!els.savedStatusFilter) return;
  els.savedStatusFilter.innerHTML =
    `<option value="">${escapeHtml(currentLanguage === 'pl' ? 'Wszystkie statusy CRM' : 'Все статусы CRM')}</option>` +
    crmStatusOptions.map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(crmStatusLabel(option.value))}</option>`).join('');
}

function populateCitySuggestions(items) {
  if (!els.citySuggestions) return;
  els.citySuggestions.innerHTML = (items || [])
    .map((item) => {
      const value = Array.isArray(item) ? item[0] : item.cityName || item.value || '';
      const label = Array.isArray(item) ? item[1] : item.displayName || [item.cityName, item.region, item.countryName].filter(Boolean).join(', ');
      return `<option value="${escapeAttribute(value)}">${escapeHtml(label || value)}</option>`;
    })
    .join('');
}

async function loadCitySuggestions(query = '') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (els.discoverCountry?.value) params.set('country', els.discoverCountry.value);
  const response = await fetch(apiUrl(`/api/location/suggestions?${params.toString()}`));
  if (!response.ok) return;
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.suggestions) && data.suggestions.length) populateCitySuggestions(data.suggestions);
}

function populateCategoryPreset() {
  const selectedValue = els.discoverCategoryPreset.value;
  const topOptions = topCategories
    .map((category) => `<option value="cat:${escapeAttribute(category.id)}">${escapeHtml(displayCategory(category.id))}</option>`)
    .join('');
  const allOptions = allCategories
    .filter((category) => !topCategories.some((topCategory) => topCategory.id === category.id))
    .map((category) => `<option value="cat:${escapeAttribute(category.id)}">${escapeHtml(displayCategory(category.id))}</option>`)
    .join('');

  els.discoverCategoryPreset.innerHTML = `
    <option value="top_all">${escapeHtml(tr('topCategories'))}</option>
    <option value="all_categories">${escapeHtml(tr('allCategories'))}</option>
    <option value="custom">${escapeHtml(tr('custom'))}</option>
    <optgroup label="${escapeAttribute(tr('topGroup'))}">${topOptions}</optgroup>
    <optgroup label="${escapeAttribute(tr('allGroup'))}">${allOptions}</optgroup>
  `;
  if ([...els.discoverCategoryPreset.options].some((option) => option.value === selectedValue)) {
    els.discoverCategoryPreset.value = selectedValue;
  }
}

async function loadConfig() {
  try {
    const response = await fetch(apiUrl('/api/config'));
    if (!response.ok) throw new Error(`Config API returned ${response.status}`);
    state.config = await response.json();
    clearConfigBootstrapRetry();
    els.modelInput.value = state.config.defaultModel || '';
    els.searchModelInput.value = state.config.searchModel || '';
    const openaiReady = Boolean(state.config.hasOpenAiKey);
    els.useAi.checked = false;
    els.useAi.disabled = true;
    // Unlike the still-disabled bulk-AI toggle above, the web-search toggle
    // gates on hasOpenAiKey the same way the other AI-dependent controls
    // (apiStatus pill, config diagnostics) do below - it only stays force-off
    // when no OpenAI key is configured, not unconditionally.
    els.useWebSearch.checked = false;
    els.useWebSearch.disabled = !openaiReady;
    const amazonReady = Boolean(state.config.registry?.amazonLocationConfigured);
    const googleReady = Boolean(state.config.registry?.googlePlacesConfigured);
    const ceidgReady = Boolean(state.config.registry?.ceidgConfigured);
    const internetReady = Boolean(state.config.internetSearchConfigured);
    const discoveryReady = isDiscoveryReady(state.config);
    els.discoverButton.disabled = false;
    if (els.allSourcesButton) {
      els.allSourcesButton.disabled = true;
      els.allSourcesButton.classList.add('hidden-field');
    }
    els.discoverLimit.max = String(Math.min(state.config.maxDiscoveryItems || 15, state.config.maxItems || 40));
    if (Number(els.discoverLimit.value) > Number(els.discoverLimit.max)) {
      els.discoverLimit.value = els.discoverLimit.max;
    }
    setDiscoverStatus(
      discoveryReady
        ? tr('searchReady')
        : tr('searchOff'),
      discoveryReady ? 'ok' : 'warn'
    );

    setPill(els.apiStatus, openaiReady ? 'OpenAI connected' : 'OpenAI missing', openaiReady);
    setPill(els.webSearchStatus, internetReady ? 'Internet search ready' : 'Crawler only', internetReady);
    setPill(
      els.registryStatus,
      amazonReady ? 'Amazon Location ready' : googleReady ? 'Google Places ready' : 'Location API missing',
      amazonReady || googleReady
    );
    setPill(els.robotsStatus, state.config.respectRobotsTxt ? 'robots.txt on' : 'robots.txt off', state.config.respectRobotsTxt);
    renderConfigDiagnostics({ openaiReady, amazonReady, googleReady, ceidgReady, internetReady, discoveryReady });
    await loadHistory();
  } catch (error) {
    try {
      await loadHistory();
    } catch {}
    state.config = null;
    els.discoverButton.disabled = false;
    if (els.allSourcesButton) els.allSourcesButton.disabled = true;
    setPill(els.apiStatus, 'Config API offline', false);
    setPill(els.webSearchStatus, 'Crawler unknown', false);
    setPill(els.registryStatus, 'Sources unknown', false);
    setDiscoverStatus(
      getApiBase().includes('localhost')
        ? t2(
            'Nie mogę odczytać /api/config. Otwórz http://localhost:4317/ i sprawdź, czy npm run dev jest uruchomiony. Z innego komputera podaj publiczny adres backendu poniżej.',
            'Не могу прочитать /api/config. Откройте http://localhost:4317/ и проверьте, что npm run dev запущен. С другого компьютера укажите публичный адрес backend ниже.'
          )
        : t2(
            `Backend pod adresem ${getApiBase() || window.location.origin} nie odpowiada. Sprawdź adres serwera poniżej.`,
            `Backend по адресу ${getApiBase() || window.location.origin} не отвечает. Проверьте адрес сервера ниже.`
          ),
      'warn'
    );
    renderConfigError(error);
    scheduleConfigBootstrapRetry();
  }
}

function setPill(element, text, ok) {
  element.textContent = text;
  element.className = `status-pill ${ok ? 'ok' : 'warn'}`;
}

function renderConfigDiagnostics(flags) {
  // Remember the last known readiness flags so applyLanguage() can re-render
  // these cards in the newly selected language without re-fetching /api/config.
  state.configDiagnosticsFlags = flags;
  const { openaiReady, amazonReady, googleReady, ceidgReady, internetReady, discoveryReady } = flags;
  const amazonRegion = state.config?.registry?.amazonLocationRegion || 'eu-north-1';
  const rows = [
    {
      ok: openaiReady,
      title: 'OpenAI API',
      text: openaiReady
        ? t2('połączone, analiza AI karty firmy działa', 'подключен, AI-анализ карточки работает')
        : t2('brak OPENAI_API_KEY', 'нет OPENAI_API_KEY')
    },
    {
      ok: amazonReady,
      title: 'Amazon Location API',
      text: amazonReady
        ? t2(
            `klucz znaleziony; najpierw używane jest Amazon Places SearchText (${amazonRegion})`,
            `ключ найден; сначала используется Amazon Places SearchText (${amazonRegion})`
          )
        : t2('brak AWS_LOCATION_API_KEY; wyszukiwanie Amazon Location jest wyłączone', 'нет AWS_LOCATION_API_KEY; поиск Amazon Location выключен')
    },
    {
      ok: googleReady,
      title: 'Google Places API',
      text: googleReady
        ? t2('klucz znaleziony; Google Maps jest testowany przy uruchomieniu wyszukiwania', 'ключ найден; Google Maps проверяется при запуске поиска')
        : t2('brak GOOGLE_PLACES_API_KEY; wyszukiwanie Google Maps jest wyłączone', 'нет GOOGLE_PLACES_API_KEY; поиск Google Maps выключен')
    },
    {
      ok: internetReady,
      title: t2('Wyszukiwanie w internecie', 'Интернет-поиск'),
      text: internetReady
        ? t2('publiczny fallback internetowy działa bez OpenAI i bez Google Maps', 'публичный интернет-резерв работает без OpenAI и без Google Maps')
        : t2('fallback internetowy jest wyłączony', 'интернет-резерв выключен')
    },
    {
      ok: ceidgReady || internetReady,
      title: t2('CEIDG / rejestry publiczne', 'CEIDG / публичные реестры'),
      text: ceidgReady
        ? t2('znaleziono token CEIDG API; dostępne oficjalne wyszukiwanie przez API', 'найден токен CEIDG API; доступен официальный поиск по API')
        : t2(
            'brak tokena CEIDG; używane jest publiczne wyszukiwanie w sieci CEIDG/rejestrów, a potem parsowanie kontaktów',
            'нет токена CEIDG; используется публичный веб-поиск по CEIDG/реестрам, а затем парсинг контактов'
          )
    },
    {
      ok: true,
      title: t2('Sprawdzanie stron', 'Проверка сайтов'),
      text: t2(
        'działa przez backend: parser może wchodzić na strony z CSV/Google Places i sprawdzać domeny',
        'работает через backend: парсер может заходить на сайты из CSV/Google Places и проверять домены'
      )
    }
  ];

  els.configDiagnostics.innerHTML = `
    <div class="config-diagnostics-title">${escapeHtml(discoveryReady ? tr('sourcesReady') : tr('sourcesMissing'))}</div>
    <div class="config-diagnostics-grid">
      ${rows
        .map(
          (row) => `
            <div class="config-diagnostic ${row.ok ? 'ok' : 'warn'}">
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.text)}</span>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function renderConfigError(error) {
  const message = error?.message || 'unknown config error';
  const currentBackend = getApiBase() || (window.location.hostname.endsWith('github.io') ? 'tunnel.json / auto-bootstrap' : window.location.origin);
  els.configDiagnostics.innerHTML = `
    <div class="config-diagnostics-title">${escapeHtml(tr('backendError'))}</div>
    <div class="config-diagnostic warn">
      <strong>Config API</strong>
      <span>${escapeHtml(message)}. ${escapeHtml(tr('currentBackend'))}: ${escapeHtml(currentBackend)}.</span>
      <span>${escapeHtml(
        t2(
          'Lokalnie: uruchom serwer przez npm run dev i otwórz http://localhost:4317/. Z innego komputera przez GitHub Pages potrzebny jest publiczny adres backendu (np. tunel cloudflared/ngrok): wpisz go poniżej lub otwórz stronę z parametrem ?api=https://adres.',
          'Локально: запустите сервер через npm run dev и открывайте http://localhost:4317/. С другого компьютера через GitHub Pages нужен публичный адрес backend (например, туннель cloudflared/ngrok): введите его ниже или откройте страницу с параметром ?api=https://адрес.'
        )
      )}</span>
    </div>
    <div class="api-base-form">
      <input id="apiBaseInput" type="text" placeholder="${escapeAttribute(t2('https://adres-twojego-backendu', 'https://адрес-вашего-backend'))}" value="${escapeAttribute(getApiBase())}" />
      <button id="apiBaseSaveButton" type="button">${escapeHtml(tr('saveReload'))}</button>
    </div>
  `;

  const input = els.configDiagnostics.querySelector('#apiBaseInput');
  const button = els.configDiagnostics.querySelector('#apiBaseSaveButton');
  button?.addEventListener('click', () => saveApiBaseAndReload(input?.value || ''));
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') saveApiBaseAndReload(input.value);
  });
}

function bindEvents() {
  els.fileInput.addEventListener('change', handleFile);
  els.sampleButton.addEventListener('click', () => {
    els.csvInput.value = sampleCsv;
  });
  els.discoverCategoryPreset.addEventListener('change', handleCategoryPresetChange);
  els.discoverMode?.addEventListener('change', handleDiscoverModeChange);
  els.aiSearchCancelButton?.addEventListener('click', cancelAiSearchJob);
  els.discoverCity?.addEventListener('input', () => {
    clearTimeout(els.discoverCity._suggestTimer);
    els.discoverCity._suggestTimer = setTimeout(() => loadCitySuggestions(els.discoverCity.value.trim()).catch(() => {}), 250);
  });
  els.discoverCountry?.addEventListener('change', () => loadCitySuggestions(els.discoverCity.value.trim()).catch(() => {}));
  els.discoverButton.addEventListener('click', handlePrimaryAction);
  els.analyzeButton.addEventListener('click', runAnalysis);
  els.resetFiltersButton.addEventListener('click', resetResultFilters);
  els.resultFilterText.addEventListener('input', updateResultFilters);
  els.resultFilterSize.addEventListener('change', updateResultFilters);
  els.resultFilterPriority.addEventListener('change', updateResultFilters);
  els.sidebarSiteFilter.addEventListener('change', updateResultFilters);
  els.sidebarMinScore.addEventListener('input', updateResultFilters);
  els.sidebarHasSocial.addEventListener('change', updateResultFilters);
  els.sidebarHasPhone.addEventListener('change', updateResultFilters);
  els.sidebarHasEmail.addEventListener('change', updateResultFilters);
  els.exportCsvButton.addEventListener('click', exportCsv);
  els.headerExportCsvButton.addEventListener('click', exportCsv);
  els.exportJsonButton.addEventListener('click', exportJson);
  els.viewTabResults.addEventListener('click', () => switchView('results'));
  els.viewTabHistory.addEventListener('click', () => switchView('history'));
  els.viewTabSaved?.addEventListener('click', () => switchView('saved'));
  els.refreshHistoryButton.addEventListener('click', loadHistory);
  els.createFolderButton?.addEventListener('click', handleCreateFolder);
  els.refreshSavedButton?.addEventListener('click', () => loadSaved());
  els.savedSearchInput?.addEventListener('input', debounce(() => loadSaved({ page: 1 }), 350));
  els.savedStatusFilter?.addEventListener('change', () => loadSaved({ page: 1 }));
  els.savedSortSelect?.addEventListener('change', () => loadSaved({ page: 1 }));
  els.languageToggle?.addEventListener('click', () => {
    applyLanguage(currentLanguage === 'pl' ? 'ru' : 'pl');
  });
  [els.parserAcademyLink, els.parserAdminLink].forEach((link) => {
    link?.addEventListener('click', () => {
      updateCrossAppLinks();
    });
  });
  els.parserLogoutButton?.addEventListener('click', handleLogout);
}

function switchView(view) {
  const isHistory = view === 'history';
  const isSaved = view === 'saved';
  const isResults = !isHistory && !isSaved;
  els.viewTabResults.classList.toggle('active', isResults);
  els.viewTabHistory.classList.toggle('active', isHistory);
  els.viewTabSaved?.classList.toggle('active', isSaved);
  els.resultsView.classList.toggle('hidden-field', !isResults);
  els.historyView.classList.toggle('hidden-field', !isHistory);
  els.savedView?.classList.toggle('hidden-field', !isSaved);
  if (isHistory && !state.historyLoaded) loadHistory();
  if (isSaved) {
    if (!state.foldersLoaded) loadFolders();
    loadSaved();
  }
}

async function loadHistory() {
  state.historyLoadingRunId = null;
  els.historyBody.innerHTML = `<tr class="empty-row"><td colspan="8">${escapeHtml(tr('historyLoading'))}</td></tr>`;
  try {
    const response = await fetch(apiUrl('/api/history/runs'), {
      headers: { 'x-worker-id': getWorkerId(), ...authHeaders() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Не удалось загрузить историю.');
    state.historyRuns = Array.isArray(data.runs) ? data.runs : [];
    state.historyLoaded = true;
    renderHistory(state.historyRuns);
  } catch (error) {
    state.historyLoaded = false;
    els.historyBody.innerHTML = `<tr class="empty-row"><td colspan="8">${escapeHtml(error.message || 'Ошибка загрузки истории.')}</td></tr>`;
  }
}

function formatRunStatusLabel(status) {
  const labels = {
    discovering: { pl: 'W trakcie', ru: 'В процессе' },
    running: { pl: 'W trakcie', ru: 'В процессе' },
    completed: { pl: 'Zakończone', ru: 'Завершено' },
    exhausted: { pl: 'Wyczerpane', ru: 'Исчерпано' },
    duplicates_only: { pl: 'Tylko duplikaty / brak nowych', ru: 'Только дубли / новых нет' },
    cancelled: { pl: 'Anulowano', ru: 'Отменено' },
    failed: { pl: 'Błąd', ru: 'Ошибка' },
    timeout: { pl: 'Przekroczono czas', ru: 'Превышено время ожидания' },
    completed_partial: { pl: 'Częściowe (przekroczono czas)', ru: 'Частично (тайм-аут)' }
  };
  const entry = labels[status];
  if (!entry) return status || '-';
  return t2(entry.pl, entry.ru);
}

function renderHistory(runs) {
  if (!runs.length) {
    els.historyBody.innerHTML = `<tr class="empty-row"><td colspan="8">${escapeHtml(tr('historyEmpty'))}</td></tr>`;
    return;
  }

  els.historyBody.innerHTML = runs
    .map((run) => {
      const date = run.started_at ? new Date(run.started_at).toLocaleString() : '-';
      const location = [run.city, run.district].filter(Boolean).join(' · ') || '-';
      const statusClassName = ['completed', 'failed', 'discovering'].includes(run.status)
        ? run.status
        : run.status === 'completed_partial'
          ? 'completed'
          : 'discovering';
      const rowStateClass = [
        'history-row',
        state.activeHistoryRun?.id === run.id ? 'active' : '',
        state.historyLoadingRunId === run.id ? 'loading' : ''
      ]
        .filter(Boolean)
        .join(' ');
      return `
        <tr class="${rowStateClass}" data-run-id="${escapeHtml(run.id)}">
          <td>${escapeHtml(date)}</td>
          <td>${escapeHtml(formatCategoryList(run.niches || []))}</td>
          <td>${escapeHtml(location)}</td>
          <td>${escapeHtml(displaySourceLabel(run.sourceFocus || '-'))}</td>
          <td>${escapeHtml(String(run.found_count ?? 0))}</td>
          <td>${escapeHtml(String(run.new_count ?? 0))}</td>
          <td>${escapeHtml(String(run.duplicate_count ?? 0))}</td>
          <td><span class="history-row-status ${statusClassName}">${escapeHtml(formatRunStatusLabel(run.status))}</span></td>
        </tr>
      `;
    })
    .join('');

  els.historyBody.querySelectorAll('tr[data-run-id]').forEach((row) => {
    row.addEventListener('click', () => openHistoryRun(row.dataset.runId));
  });
}

async function openHistoryRun(runId) {
  stopDiscoveryPolling();
  try {
    state.historyLoadingRunId = runId;
    renderHistory(state.historyRuns);
    const response = await fetch(apiUrl(`/api/history/runs/${runId}`), {
      headers: { 'x-worker-id': getWorkerId(), ...authHeaders() }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t2('Nie udało się otworzyć zapytania.', 'Не удалось открыть запуск.'));

    const records = Array.isArray(data.companies) ? data.companies : [];
    if (!records.length) {
      state.historyLoadingRunId = null;
      renderHistory(state.historyRuns);
      setStatus(t2('W tym zapytaniu nie ma zapisanych firm.', 'В этом запуске нет сохраненных компаний.'), 'warn');
      return;
    }

    state.activeHistoryRun = data.run || { id: runId };
    state.historyLoadingRunId = null;
    els.csvInput.value = itemsToCsv(records.map((record) => ({ ...record.data, _companyId: record.id })));
    switchView('results');
    setStatus(
      t2(
        `Otwieram zapisane zapytanie z ${new Date(data.run.started_at).toLocaleString()}...`,
        `Открываю сохраненный запуск от ${new Date(data.run.started_at).toLocaleString()}...`
      ),
      'work'
    );
    state.results = historyRecordsToResults(records);
    state.selectedId = state.results[0]?.id || null;
    state.detailTab = 'overview';
    // Reset all result filters when opening a saved history run. Otherwise the
    // sidebar's default "Есть телефон" checkbox (and any other filter left over
    // from a previous search) can silently hide every saved company, making the
    // history run look empty/broken even though it opened correctly.
    els.resultFilterText.value = '';
    els.sidebarSiteFilter.value = 'all';
    els.resultFilterSize.value = 'all';
    els.resultFilterPriority.value = 'all';
    els.sidebarMinScore.value = '0';
    els.sidebarHasPhone.checked = false;
    els.sidebarHasSocial.checked = false;
    els.sidebarHasEmail.checked = false;
    state.filters = {
      text: '',
      size: 'all',
      priority: 'all'
    };
    renderResultsContext();
    renderHistory(state.historyRuns);
    renderResults();
    renderMetrics();
    renderDetail();
    els.exportCsvButton.disabled = false;
    els.headerExportCsvButton.disabled = false;
    els.exportJsonButton.disabled = false;
    renderAiEnrichEligibleHint();
    setStatus(
      t2(`Otwarto zapytanie z historii: ${state.results.length} firm.`, `Открыт запуск из истории: ${state.results.length} компаний.`),
      'ok'
    );

  } catch (error) {
    state.historyLoadingRunId = null;
    renderHistory(state.historyRuns);
    setStatus(error.message || t2('Błąd podczas otwierania zapytania.', 'Ошибка при открытии запуска.'), 'warn');
  } finally {
    renderIcons();
  }
}

// =====================================================================
// Zapisane: folders + saved companies (worker-owned)
// =====================================================================

function savedAuthHeaders() {
  return { 'content-type': 'application/json', 'x-worker-id': getWorkerId(), ...authHeaders() };
}

async function loadFolders() {
  try {
    const response = await fetch(apiUrl('/api/saved/folders'), { headers: savedAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'load folders failed');
    state.folders = Array.isArray(data.folders) ? data.folders : [];
    state.foldersLoaded = true;
    renderFolders();
  } catch (error) {
    // Never surface error.message directly - it can be a raw untranslated
    // backend string (e.g. "Worker identity is required." for an admin-role
    // session with no workerId, see Finding 9). Log it for debugging and show
    // only the localized generic fallback.
    console.error('loadFolders failed:', error);
    setStatus(t2('Błąd ładowania folderów.', 'Ошибка загрузки папок.'), 'warn');
  }
}

function renderFolders() {
  if (!els.savedFoldersList) return;
  const items = [
    `<li class="saved-folder-item ${state.activeFolderId === '' ? 'active' : ''}" data-folder-id="">
      <span>${t2('Wszystkie zapisane', 'Все сохранённые')}</span>
    </li>`,
    `<li class="saved-folder-item ${state.activeFolderId === 'none' ? 'active' : ''}" data-folder-id="none">
      <span>${t2('Bez folderu', 'Без папки')}</span>
    </li>`,
    ...state.folders.map(
      (folder) => `
      <li class="saved-folder-item ${state.activeFolderId === folder.id ? 'active' : ''}" data-folder-id="${escapeAttribute(folder.id)}">
        <span>${escapeHtml(folder.name)}</span>
        <span class="folder-actions">
          <button type="button" data-rename-folder="${escapeAttribute(folder.id)}" title="${t2('Zmień nazwę', 'Переименовать')}"><i data-lucide="pencil"></i></button>
          <button type="button" data-delete-folder="${escapeAttribute(folder.id)}" title="${t2('Usuń folder', 'Удалить папку')}"><i data-lucide="trash-2"></i></button>
        </span>
      </li>`
    )
  ];
  els.savedFoldersList.innerHTML = items.join('');
  els.savedFoldersList.querySelectorAll('[data-folder-id]').forEach((li) => {
    li.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      state.activeFolderId = li.dataset.folderId;
      renderFolders();
      loadSaved({ page: 1 });
    });
  });
  els.savedFoldersList.querySelectorAll('[data-rename-folder]').forEach((button) => {
    button.addEventListener('click', () => handleRenameFolder(button.dataset.renameFolder));
  });
  els.savedFoldersList.querySelectorAll('[data-delete-folder]').forEach((button) => {
    button.addEventListener('click', () => handleDeleteFolder(button.dataset.deleteFolder));
  });
  renderIcons();
}

async function handleCreateFolder() {
  const name = window.prompt(t2('Nazwa nowego folderu:', 'Название новой папки:'));
  if (!name || !name.trim()) return;
  try {
    const response = await fetch(apiUrl('/api/saved/folders'), {
      method: 'POST',
      headers: savedAuthHeaders(),
      body: JSON.stringify({ name: name.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'create folder failed');
    await loadFolders();
    setStatus(t2(`Folder "${data.folder.name}" utworzony.`, `Папка "${data.folder.name}" создана.`), 'ok');
  } catch (error) {
    console.error('handleCreateFolder failed:', error);
    setStatus(t2('Błąd tworzenia folderu.', 'Ошибка создания папки.'), 'warn');
  }
}

async function handleRenameFolder(folderId) {
  const folder = state.folders.find((item) => item.id === folderId);
  const name = window.prompt(t2('Nowa nazwa folderu:', 'Новое название папки:'), folder?.name || '');
  if (!name || !name.trim()) return;
  try {
    const response = await fetch(apiUrl(`/api/saved/folders/${encodeURIComponent(folderId)}`), {
      method: 'PATCH',
      headers: savedAuthHeaders(),
      body: JSON.stringify({ name: name.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'rename folder failed');
    await loadFolders();
  } catch (error) {
    console.error('handleRenameFolder failed:', error);
    setStatus(t2('Błąd zmiany nazwy folderu.', 'Ошибка изменения названия папки.'), 'warn');
  }
}

async function handleDeleteFolder(folderId) {
  const folder = state.folders.find((item) => item.id === folderId);
  const confirmed = window.confirm(
    t2(
      `Usunąć folder "${folder?.name || ''}"? Firmy w nim zostaną, tylko stracą przypisanie do tego folderu.`,
      `Удалить папку "${folder?.name || ''}"? Компании останутся, только потеряют привязку к этой папке.`
    )
  );
  if (!confirmed) return;
  try {
    const response = await fetch(apiUrl(`/api/saved/folders/${encodeURIComponent(folderId)}`), {
      method: 'DELETE',
      headers: savedAuthHeaders(),
      body: JSON.stringify({})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'delete folder failed');
    if (state.activeFolderId === folderId) state.activeFolderId = '';
    await loadFolders();
    loadSaved({ page: 1 });
    setStatus(
      t2(`Folder usunięty. Firmy (${data.unassigned || 0}) zostały bez folderu.`, `Папка удалена. Компании (${data.unassigned || 0}) остались без папки.`),
      'ok'
    );
  } catch (error) {
    console.error('handleDeleteFolder failed:', error);
    setStatus(t2('Błąd usuwania folderu.', 'Ошибка удаления папки.'), 'warn');
  }
}

async function loadSaved({ page } = {}) {
  if (page) state.savedPage = page;
  els.savedBody.innerHTML = `<tr class="empty-row"><td colspan="6">${t2('Ładowanie...', 'Загрузка...')}</td></tr>`;
  try {
    const params = new URLSearchParams({
      folderId: state.activeFolderId || '',
      q: els.savedSearchInput?.value || '',
      crmStatus: els.savedStatusFilter?.value || '',
      sort: els.savedSortSelect?.value || 'newest',
      page: String(state.savedPage || 1),
      pageSize: '25'
    });
    const response = await fetch(apiUrl(`/api/saved?${params.toString()}`), { headers: savedAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'load saved failed');
    state.savedItems = Array.isArray(data.items) ? data.items : [];
    state.savedTotal = data.total || 0;
    state.savedPage = data.page || 1;
    renderSaved();
  } catch (error) {
    // Never surface error.message directly - see loadFolders() above (Finding 9).
    console.error('loadSaved failed:', error);
    els.savedBody.innerHTML = `<tr class="empty-row"><td colspan="6">${escapeHtml(t2('Błąd ładowania.', 'Ошибка загрузки.'))}</td></tr>`;
  }
}

function renderSaved() {
  if (!state.savedItems.length) {
    els.savedBody.innerHTML = `<tr class="empty-row"><td colspan="6">${t2('Brak zapisanych firm dla tego filtra.', 'Нет сохранённых фирм для этого фильтра.')}</td></tr>`;
    els.savedPagination.innerHTML = '';
    return;
  }
  els.savedBody.innerHTML = state.savedItems
    .map((item) => {
      const folderNames = (item.saved_folder_ids || [])
        .map((id) => state.folders.find((folder) => folder.id === id)?.name)
        .filter(Boolean);
      return `
        <tr data-saved-id="${escapeAttribute(item.id)}">
          <td>
            <strong>${escapeHtml(item.data?.company || '-')}</strong>
            <div class="muted-text">${escapeHtml([item.data?.city, item.data?.niche].filter(Boolean).join(' · '))}</div>
          </td>
          <td><span class="status-tag">${escapeHtml(crmStatusLabel(item.crm_status))}</span></td>
          <td>${folderNames.length ? folderNames.map((name) => `<span class="folder-chip">${escapeHtml(name)}</span>`).join('') : '<span class="muted-text">-</span>'}</td>
          <td class="muted-text">${escapeHtml(item.last_comment?.text?.slice(0, 60) || '-')}</td>
          <td class="muted-text">${escapeHtml(item.saved_at ? new Date(item.saved_at).toLocaleDateString() : '-')}</td>
          <td><button class="secondary-button compact-button" type="button" data-open-saved="${escapeAttribute(item.id)}">${t2('Otwórz', 'Открыть')}</button></td>
        </tr>
      `;
    })
    .join('');
  els.savedBody.querySelectorAll('[data-open-saved]').forEach((button) => {
    button.addEventListener('click', () => openSavedCompany(button.dataset.openSaved));
  });

  const totalPages = Math.max(1, Math.ceil(state.savedTotal / 25));
  els.savedPagination.innerHTML = `
    <span>${state.savedTotal} ${t2('firm', 'фирм')} · ${t2('strona', 'стр.')} ${state.savedPage}/${totalPages}</span>
    <button type="button" ${state.savedPage <= 1 ? 'disabled' : ''} data-saved-page="prev">←</button>
    <button type="button" ${state.savedPage >= totalPages ? 'disabled' : ''} data-saved-page="next">→</button>
  `;
  els.savedPagination.querySelector('[data-saved-page="prev"]')?.addEventListener('click', () => loadSaved({ page: state.savedPage - 1 }));
  els.savedPagination.querySelector('[data-saved-page="next"]')?.addEventListener('click', () => loadSaved({ page: state.savedPage + 1 }));
}

function openSavedCompany(companyId) {
  const item = state.savedItems.find((row) => row.id === companyId);
  if (!item) return;
  // `item` comes from /api/saved, which serializes the same underlying
  // company record as /api/history/runs/:id (heuristic/analysis/aiSiteAnalysis
  // included whenever they exist). Route it through historyRecordsToResults
  // so a lead that already has real analysis shows that data instead of the
  // synthetic "not yet analyzed" placeholder from buildPreviewResult.
  const [result] = historyRecordsToResults([item]);
  const existingIndex = state.results.findIndex((r) => leadCompanyId(r) === companyId);
  if (existingIndex === -1) state.results = [...state.results, result];
  else state.results = state.results.map((r, index) => (index === existingIndex ? result : r));
  state.selectedId = result.id;
  state.detailTab = 'overview';
  switchView('results');
  renderResults();
  renderDetail();
}

// =====================================================================
// Save / folder / comment / CRM-status / pool-return actions on a lead
// =====================================================================

async function toggleSaveCompany(result) {
  const companyId = leadCompanyId(result);
  if (!companyId) return;
  const saved = isCompanySaved(result);
  try {
    if (saved) {
      await fetch(apiUrl('/api/saved'), {
        method: 'DELETE',
        headers: savedAuthHeaders(),
        body: JSON.stringify({ companyIds: [companyId] })
      });
      result._savedFolderIds = [];
    } else {
      const response = await fetch(apiUrl('/api/saved'), {
        method: 'POST',
        headers: savedAuthHeaders(),
        body: JSON.stringify({ companyIds: [companyId] })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'save company failed');
      result._savedFolderIds = [null];
    }
    renderTabbedDetail();
    setStatus(saved ? t2('Firma usunięta z zapisanych.', 'Компания удалена из сохранённых.') : t2('Firma zapisana.', 'Компания сохранена.'), 'ok');
  } catch (error) {
    console.error('toggleSaveCompany failed:', error);
    setStatus(t2('Błąd zapisu.', 'Ошибка сохранения.'), 'warn');
  }
}

function isCompanySaved(result) {
  return Array.isArray(result._savedFolderIds) && result._savedFolderIds.length > 0;
}

async function addResultToFolder(result, folderId) {
  const companyId = leadCompanyId(result);
  if (!companyId) return;
  try {
    const response = await fetch(apiUrl('/api/saved'), {
      method: 'POST',
      headers: savedAuthHeaders(),
      body: JSON.stringify({ companyIds: [companyId], folderId: folderId || null })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'add to folder failed');
    result._savedFolderIds = [...new Set([...(result._savedFolderIds || []), folderId || null])];
    renderTabbedDetail();
    setStatus(t2('Dodano do folderu.', 'Добавлено в папку.'), 'ok');
  } catch (error) {
    console.error('addResultToFolder failed:', error);
    setStatus(t2('Błąd dodawania do folderu.', 'Ошибка добавления в папку.'), 'warn');
  }
}

async function updateCrmStatus(result, status) {
  const companyId = leadCompanyId(result);
  if (!companyId) return;
  try {
    const response = await fetch(apiUrl(`/api/companies/${encodeURIComponent(companyId)}/crm-status`), {
      method: 'POST',
      headers: savedAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'update crm status failed');
    result._crmStatus = data.company.crm_status;
    renderTabbedDetail();
    setStatus(`${t2('Status CRM', 'CRM-статус')}: ${crmStatusLabel(status)}`, 'ok');
  } catch (error) {
    console.error('updateCrmStatus failed:', error);
    setStatus(t2('Błąd zmiany statusu CRM.', 'Ошибка изменения CRM-статуса.'), 'warn');
  }
}

async function returnLeadToPoolAction(result) {
  const companyId = leadCompanyId(result);
  if (!companyId) return;
  const confirmed = window.confirm(
    t2(
      'Wrócić tę firmę do puli? Komentarze, status CRM i folder zostaną zachowane.',
      'Вернуть эту компанию в пул? Комментарии, CRM-статус и папка сохранятся.'
    )
  );
  if (!confirmed) return;
  try {
    const response = await fetch(apiUrl(`/api/leads/${encodeURIComponent(companyId)}/return-to-pool`), {
      method: 'POST',
      headers: savedAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'return to pool failed');
    setStatus(
      data.returned?.length ? t2('Firma wróciła do puli.', 'Компания вернулась в пул.') : t2('Firma była już w puli.', 'Компания уже была в пуле.'),
      'ok'
    );
    state.results = state.results.filter((item) => leadCompanyId(item) !== companyId);
    if (state.selectedId && leadCompanyId(result) === companyId) state.selectedId = state.results[0]?.id || null;
    renderResults();
    renderDetail();
  } catch (error) {
    console.error('returnLeadToPoolAction failed:', error);
    setStatus(t2('Błąd zwrotu do puli.', 'Ошибка возврата в пул.'), 'warn');
  }
}

async function loadCommentsForResult(result) {
  const companyId = leadCompanyId(result);
  if (!companyId) return [];
  try {
    const response = await fetch(apiUrl(`/api/companies/${encodeURIComponent(companyId)}/comments`), { headers: savedAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'load comments failed');
    result._comments = Array.isArray(data.comments) ? data.comments : [];
    return result._comments;
  } catch {
    return result._comments || [];
  }
}

async function submitComment(result, text) {
  const companyId = leadCompanyId(result);
  if (!companyId || !text.trim()) return;
  try {
    const response = await fetch(apiUrl(`/api/companies/${encodeURIComponent(companyId)}/comments`), {
      method: 'POST',
      headers: savedAuthHeaders(),
      body: JSON.stringify({ text: text.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'add comment failed');
    result._comments = [data.comment, ...(result._comments || [])];
    renderTabbedDetail();
  } catch (error) {
    console.error('submitComment failed:', error);
    setStatus(t2('Błąd dodawania komentarza.', 'Ошибка добавления комментария.'), 'warn');
  }
}

async function deleteCommentAction(result, commentId) {
  try {
    const response = await fetch(apiUrl(`/api/comments/${encodeURIComponent(commentId)}`), {
      method: 'DELETE',
      headers: savedAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'delete comment failed');
    result._comments = (result._comments || []).filter((comment) => comment.id !== commentId);
    renderTabbedDetail();
  } catch (error) {
    console.error('deleteCommentAction failed:', error);
    setStatus(t2('Błąd usuwania komentarza.', 'Ошибка удаления комментария.'), 'warn');
  }
}

function handleCategoryPresetChange() {
  els.customCategoryField.classList.toggle('hidden-field', els.discoverCategoryPreset.value !== 'custom');
}

function resetFiltersForDiscovery() {
  els.resultFilterText.value = '';
  els.resultFilterSize.value = 'all';
  els.resultFilterPriority.value = 'all';
  state.filters = {
    text: '',
    size: 'all',
    priority: 'all'
  };
}

async function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  els.csvInput.value = await file.text();
}

function stopDiscoveryPolling({ clearResults = false } = {}) {
  if (state.discoveryPollTimer) {
    clearTimeout(state.discoveryPollTimer);
    state.discoveryPollTimer = null;
  }
  state.discoveryJobId = null;
  if (clearResults) {
    state.results = [];
    state.selectedId = null;
    state.detailTab = 'overview';
  }
}

function setCurrentResults(results, { resetDetailTab = false } = {}) {
  const nextResults = Array.isArray(results) ? results : [];
  const selectedId = state.selectedId;
  state.results = nextResults;
  if (resetDetailTab) state.detailTab = 'overview';
  if (!selectedId || !nextResults.some((result) => result.id === selectedId)) {
    state.selectedId = nextResults[0]?.id || null;
    if (nextResults.length) state.detailTab = 'overview';
  }
  renderResults();
  renderMetrics();
  renderDetail();
  const hasResults = nextResults.length > 0;
  els.exportCsvButton.disabled = !hasResults;
  els.headerExportCsvButton.disabled = !hasResults;
  els.exportJsonButton.disabled = !hasResults;
  renderAiEnrichEligibleHint();
}

async function fetchDiscoveryJob(jobId) {
  const response = await fetch(apiUrl(`/api/discover/jobs/${jobId}`), {
    headers: { 'x-worker-id': getWorkerId(), ...authHeaders() }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || t2('Błąd odczytu statusu wyszukiwania.', 'Ошибка чтения статуса поиска.'));
  return data;
}

function buildDiscoveryStatusText(job) {
  const foundCount = job?.progress?.foundCount ?? job?.companies?.length ?? 0;
  const message = String(job?.progress?.message || '').trim();
  const niche = displayCategory(job?.progress?.currentNiche || '');
  const source = displaySourceLabel(job?.progress?.currentSource || job?.meta?.sourceFocus || '');
  const parts = [message || t2(`Znaleziono ${foundCount}`, `Найдено ${foundCount}`)];
  if (niche && niche !== '-') parts.push(niche);
  if (source && source !== '-') parts.push(source);
  return parts.join(' - ');
}

async function waitForDiscoveryCompletion(jobId) {
  while (state.discoveryJobId === jobId) {
    const job = await fetchDiscoveryJob(jobId);
    const companies = Array.isArray(job.companies) ? job.companies : [];

    if (companies.length) {
      // job.companies are already fully analyzed (website checked, scored,
      // AI card written) by the time they arrive here - the backend now
      // processes each candidate sequentially and appends it only once
      // complete, so every card rendered below is ready as-is; there is no
      // separate "preview" stage or follow-up bulk /api/analyze call anymore.
      els.csvInput.value = itemsToCsv(companies.map((result) => result.input || result));
      setCurrentResults(companies);
    }

    const statusText = buildDiscoveryStatusText(job);
    setDiscoverStatus(statusText, job.status === 'failed' ? 'warn' : job.status === 'completed' ? 'ok' : 'work');
    // On completion, prefer the server's specific outcome message (it already
    // distinguishes "found N new" from "everything for these filters is
    // already known" / "exhausted after N of the requested M") instead of a
    // generic "search finished" line that hid the duplicates-only/exhausted
    // case and made an empty result look like nothing happened.
    const searchStatus = job.result?.meta?.searchStatus || '';
    const completionMessage =
      searchStatus === 'duplicates_only'
        ? t2(
            'Wszystkie firmy dla tych filtrów są już w bazie. Nowych brak - spróbuj innego miasta, kategorii lub promienia.',
            'Все компании по этим фильтрам уже есть в базе. Новых нет - попробуйте другой город, категорию или радиус.'
          )
        : searchStatus === 'exhausted'
          ? t2(
              `Wyszukiwanie wyczerpane: znaleziono ${companies.length} z żądanych ${job.meta?.limit || companies.length}. Więcej nowych firm dla tych filtrów obecnie nie ma.`,
              `Поиск исчерпан: найдено ${companies.length} из запрошенных ${job.meta?.limit || companies.length}. Больше новых компаний по этим фильтрам сейчас нет.`
            )
          : t2(`Wyszukiwanie zakończone. Znaleziono ${companies.length} firm.`, `Поиск завершен. Найдено ${companies.length} компаний.`);
    setStatus(
      job.status === 'completed' ? completionMessage : `${statusText}. ${t2('Wyniki pośrednie są już dostępne.', 'Промежуточные результаты уже доступны.')}`,
      job.status === 'failed' ? 'warn' : job.status === 'completed' ? (searchStatus === 'duplicates_only' || searchStatus === 'exhausted' ? 'warn' : 'ok') : 'work'
    );

    if (job.status === 'completed') {
      stopDiscoveryPolling();
      return job;
    }
    if (job.status === 'failed') {
      stopDiscoveryPolling();
      throw new Error(job.error || t2('Błąd wyszukiwania firm.', 'Ошибка поиска компаний.'));
    }

    await new Promise((resolve) => {
      state.discoveryPollTimer = window.setTimeout(resolve, 1200);
    });
    state.discoveryPollTimer = null;
  }

  throw new Error(t2('Wyszukiwanie zostało zatrzymane.', 'Поиск был остановлен.'));
}

async function runDiscovery() {
  // Guard against overlapping discovery runs. Without this, clicking the
  // "Найти компании" button again while a previous search is still in
  // progress (a common thing to do because the smart-search pipeline can
  // take a while) spawns a second parallel job on the backend for the same
  // niche/city. The newer jobId then replaces state.discoveryJobId, so the
  // UI ends up polling a different job than the one actually doing the work,
  // which can surface a stale/empty "Компании не найдены" result even though
  // the backend is still busy finding companies (visible in server logs as
  // duplicate repeated queries).
  if (state.discoveryRunning) {
    setDiscoverStatus(t2('Wyszukiwanie już trwa, poczekaj na zakończenie bieżącego zapytania.', 'Поиск уже выполняется, дождитесь завершения текущего запроса.'), 'warn');
    return;
  }
  state.discoveryRunning = true;

  stopDiscoveryPolling();
  clearHistoryContext();
  switchView('results');
  state.historyLoaded = false;
  const discoveryReady = isDiscoveryReady();
  if (!discoveryReady) {
    setDiscoverStatus(
      t2(
        'Backend nie jest gotowy. Uruchom lokalny serwer; publiczne wyszukiwanie powinno działać nawet bez CEIDG API.',
        'Backend не готов. Запустите локальный сервер; публичный поиск должен работать даже без CEIDG API.'
      ),
      'warn'
    );
    state.discoveryRunning = false;
    return;
  }


  const niches = selectedDiscoveryNiches();
  if (!niches.length) {
    setDiscoverStatus(t2('Podaj kategorię lub wybierz zestaw kategorii.', 'Укажите категорию или выберите набор категорий.'), 'warn');
    state.discoveryRunning = false;
    return;
  }

  resetFiltersForDiscovery();
  els.discoverButton.disabled = true;
  els.analyzeButton.disabled = true;
  els.exportCsvButton.disabled = true;
  els.headerExportCsvButton.disabled = true;
  els.exportJsonButton.disabled = true;
  state.results = [];
  state.selectedId = null;
  state.detailTab = 'overview';
  renderResults();
  renderMetrics();
  renderDetail();
  setDiscoverStatus(
    t2(
      `Szukam firm: ${niches.length === 1 ? displayCategory(niches[0]) : `${niches.length} kategorii`}...`,
      `Ищу компании: ${niches.length === 1 ? displayCategory(niches[0]) : `${niches.length} категорий`}...`
    ),
    'work'
  );

  try {
    const response = await fetch(apiUrl('/api/discover'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        niche: niches[0],
        niches,
        country: els.discoverCountry.value.trim(),
        city: els.discoverCity.value.trim(),
        district: els.discoverDistrict.value.trim(),
        radiusKm: Number(els.discoverRadius.value || 0) || undefined,
        limit: Math.min(Number(els.discoverLimit.value || 8), state.config?.maxItems || 100),
        sourceFocus: els.discoverSource.value,
        workerId: getWorkerId(),
        // Single search settings panel: category/location AND site status /
        // score / social / phone / email travel together in one request, and
        // the backend now actually applies all of them (previously these
        // sidebar fields were captured but silently dropped here).
        siteStatus: els.sidebarSiteFilter.value,
        minScore: Number(els.sidebarMinScore.value || 0),
        hasSocial: els.sidebarHasSocial.checked,
        hasPhone: els.sidebarHasPhone.checked,
        hasEmail: els.sidebarHasEmail.checked,
        useAi: els.useAi.checked,
        useWebSearch: els.useWebSearch.checked,
        language: currentLanguage
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t2('Błąd wyszukiwania firm.', 'Ошибка поиска компаний.'));

    if (!data.jobId) throw new Error(t2('Backend nie zwrócił identyfikatora zadania wyszukiwania.', 'Backend не вернул идентификатор задачи поиска.'));

    state.discoveryJobId = data.jobId;
    await loadHistory().catch(() => {});
    const job = await waitForDiscoveryCompletion(data.jobId);
    const companies = Array.isArray(job.companies) ? job.companies : [];
    if (!companies.length) {
      await loadHistory();
      setDiscoverStatus(getEmptyDiscoveryMessage(job), 'warn');
      setStatus(getEmptyDiscoveryMessage(job), 'warn');
      return;
    }

    // Companies are already fully analyzed (see waitForDiscoveryCompletion) -
    // this is just the final render pass after the job reaches 'completed'.
    els.csvInput.value = itemsToCsv(companies.map((result) => result.input || result));
    setCurrentResults(companies, { resetDetailTab: true });
    const warnings = Array.isArray(job.warnings) ? job.warnings.filter(Boolean).slice(0, 2) : [];
    const warningText = warnings.length ? ` ${t2('Ostrzeżenie', 'Предупреждение')}: ${warnings.join(' ')}` : '';
    setDiscoverStatus(
      t2(
        `Gotowe: ${companies.length} kart w pełni sprawdzonych i przeanalizowanych.${warningText}`,
        `Готово: ${companies.length} карточек полностью проверено и проанализировано.${warningText}`
      ),
      warnings.length ? 'warn' : 'ok'
    );
    setStatus(t2(`Gotowe: ${companies.length} firm.`, `Готово: ${companies.length} компаний.`), 'ok');
    await loadHistory();
  } catch (error) {
    setDiscoverStatus(error.message || t2('Błąd wyszukiwania firm.', 'Ошибка поиска компаний.'), 'warn');
  } finally {
    stopDiscoveryPolling();
    state.discoveryRunning = false;
    els.discoverButton.disabled = false;
    els.analyzeButton.disabled = false;
    renderIcons();
    // Refresh the "leads today" quota line so a worker sees newly-claimed
    // leads reflected immediately, without needing a page reload.
    refreshWorkerQuota().catch(() => {});
  }
}

function selectedDiscoveryNiches() {
  const value = els.discoverCategoryPreset.value;
  if (value === 'top_all') return topCategories.map((category) => category.value);
  if (value === 'all_categories') return allCategories.map((category) => category.value);
  if (value === 'custom') return [els.discoverNiche.value.trim()].filter(Boolean);
  if (value.startsWith('cat:')) {
    const option = categoryById.get(value.slice(4)) || categoryByLookup.get(normalizeLookupValue(value.slice(4)));
    return [option?.value || value.slice(4)].filter(Boolean);
  }
  return [];
}

// ---------------------------------------------------------------------------
// AI company search (ai_search / combined / ai_enrich modes)
//
// Deliberately kept as an entirely separate code path from the standard
// /api/discover flow above (runDiscovery/waitForDiscoveryCompletion/
// buildDiscoveryStatusText): #discoverMode === 'standard' always falls
// through to the untouched original functions, so nothing here can regress
// the existing search. See handlePrimaryAction() for the branch point.
//
// "Which companies does ai_enrich operate on?" - design choice: there is no
// multi-select checkbox column in the results table (confirmed - grepped for
// any checkbox-based multi-select pattern and found none), so v1 pragmatically
// enriches every company currently visible in the results table *after* the
// existing sidebar/table filters are applied (getFilteredResults(), the same
// helper the table itself renders from) and that already has a real saved
// companyId (leadCompanyId()). This lets a worker narrow down "just these 12
// no-website leads" with the filters that already exist, then flip to
// "Wzbogacenie AI" and run it on exactly that visible set - see
// selectedAiEnrichCompanyIds()/renderAiEnrichEligibleHint().
// ---------------------------------------------------------------------------

function stopAiSearchPolling() {
  if (state.aiSearchPollTimer) {
    clearTimeout(state.aiSearchPollTimer);
    state.aiSearchPollTimer = null;
  }
  state.aiSearchJobId = null;
}

function handleDiscoverModeChange() {
  const mode = els.discoverMode?.value || 'standard';
  const isAiSearch = mode === 'ai_search' || mode === 'combined';
  const isAiEnrich = mode === 'ai_enrich';

  // Category/city/radius and the discover-only limit/source fields don't
  // apply to ai_enrich (it never runs a new search) - hide them there. The
  // site-status/score/social/phone/email filters just below stay visible in
  // every mode: for ai_enrich they double as the "which companies" picker
  // (see selectedAiEnrichCompanyIds()).
  els.discoverStepLocation?.classList.toggle('hidden-field', isAiEnrich);
  els.discoverLimitField?.classList.toggle('hidden-field', isAiEnrich);
  els.discoverSourceField?.classList.toggle('hidden-field', isAiEnrich);

  els.aiSearchOptions?.classList.toggle('hidden-field', !isAiSearch);
  els.aiEnrichNote?.classList.toggle('hidden-field', !isAiEnrich);
  els.aiEnrichEligible?.classList.toggle('hidden-field', !isAiEnrich);
  renderAiEnrichEligibleHint();
}

function collectAiSearchCriteria() {
  const parseKeywordList = (value) =>
    String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const websiteQualityFlags = [];
  if (els.aiFlagWeakOutdated?.checked) websiteQualityFlags.push('weak_outdated');
  if (els.aiFlagNoMobile?.checked) websiteQualityFlags.push('no_mobile');
  if (els.aiFlagNoCta?.checked) websiteQualityFlags.push('no_cta');
  if (els.aiFlagNoContactInfo?.checked) websiteQualityFlags.push('no_contact_info');

  return {
    clientType: els.aiClientType?.value || 'any',
    companySizeRange: els.aiCompanySize?.value || 'any',
    minYearsInBusiness: Number(els.aiMinYears?.value || 0) || undefined,
    websitePresence: els.aiWebsitePresence?.value || 'any',
    websiteQualityFlags,
    extraKeywords: parseKeywordList(els.aiExtraKeywords?.value),
    excludeKeywords: parseKeywordList(els.aiExcludeKeywords?.value),
    minReviews: Number(els.aiMinReviews?.value || 0) || undefined,
    minRating: Number(els.aiMinRating?.value || 0) || undefined
  };
}

async function fetchAiSearchJob(jobId) {
  const response = await fetch(apiUrl(`/api/ai-search/jobs/${jobId}`), {
    headers: { 'x-worker-id': getWorkerId(), ...authHeaders() }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || t2('Błąd odczytu statusu wyszukiwania AI.', 'Ошибка чтения статуса AI-поиска.'));
  return data;
}

function aiStageLabel(stage) {
  return trs(`ai_stage_${String(stage || 'queued').toLowerCase()}`);
}

// Renders the richer multi-line AI job status into the SAME #discoverStatus
// element the standard flow uses (setDiscoverStatus() above just sets
// textContent) - reuses the existing .discover-status/.muted-text/.error-text
// styling instead of inventing new CSS, per the round's scope.
function renderAiSearchStatus(job) {
  const stage = job.stage || 'QUEUED';
  const progress = job.progress || {};
  const counterKeys = ['planned_queries', 'queries_run', 'candidates_found', 'candidates_confirmed', 'duplicates_skipped', 'rejected', 'enriched', 'saved'];
  const counters = counterKeys
    .filter((key) => progress[key] !== undefined && progress[key] !== null)
    .map((key) => `${escapeHtml(trs(`ai_progress_${key}`))}: ${escapeHtml(String(progress[key]))}`)
    .join(' · ');

  const detail = job.stage_detail ? escapeHtml(String(job.stage_detail)) : '';
  const errors = Array.isArray(job.errors) ? job.errors.filter(Boolean) : [];
  const errorLine = errors.length
    ? `<div class="error-text">${escapeHtml(trs('ai_search_errors_label'))} ${escapeHtml(errors.slice(0, 2).join(' | '))}</div>`
    : '';

  els.discoverStatus.innerHTML = `
    <div><strong>${escapeHtml(aiStageLabel(stage))}</strong>${detail ? ` — ${detail}` : ''}</div>
    ${counters ? `<div class="muted-text">${counters}</div>` : ''}
    ${errorLine}
  `;
  const warnStages = new Set(['FAILED', 'CANCELLED', 'PARTIAL']);
  els.discoverStatus.style.color = warnStages.has(stage) ? '#b91c1c' : stage === 'COMPLETED' ? '#15803d' : '#64717a';
}

function buildAiSearchSummaryText(job) {
  const saved = job.progress?.saved || 0;
  const found = job.progress?.candidates_found || 0;
  if (job.stage === 'FAILED') {
    return (Array.isArray(job.errors) && job.errors[0]) || t2('Wyszukiwanie AI zakończone błędem.', 'AI-поиск завершился с ошибкой.');
  }
  if (job.stage === 'CANCELLED') {
    return t2(`Wyszukiwanie AI anulowane. Zapisano ${saved} firm.`, `AI-поиск отменён. Сохранено ${saved} компаний.`);
  }
  if (job.stage === 'PARTIAL') {
    return t2(
      `Wyszukiwanie AI zakończone częściowo: zapisano ${saved} z ${found} znalezionych.`,
      `AI-поиск завершён частично: сохранено ${saved} из ${found} найденных.`
    );
  }
  return t2(`Gotowe: AI zapisało ${saved} firm.`, `Готово: AI сохранил ${saved} компаний.`);
}

// Polls GET /api/ai-search/jobs/:jobId every ~1.5s - the analogous function to
// waitForDiscoveryCompletion() above but for the AI pipeline's richer
// stage/progress shape (no inline `companies` array on the job itself; saved
// companies are loaded back in afterwards via the normal history endpoint,
// see loadRunOnComplete below). Kept fully separate so a bug here cannot
// touch the standard discovery polling loop.
async function waitForAiSearchCompletion(jobId, { loadRunOnComplete = true } = {}) {
  els.aiSearchCancelButton?.classList.remove('hidden-field');
  const terminalStages = new Set(['COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED']);

  while (state.aiSearchJobId === jobId) {
    const job = await fetchAiSearchJob(jobId);
    renderAiSearchStatus(job);

    if (terminalStages.has(job.stage)) {
      stopAiSearchPolling();
      els.aiSearchCancelButton?.classList.add('hidden-field');

      if (job.stage === 'FAILED') {
        throw new Error((Array.isArray(job.errors) && job.errors[0]) || t2('Błąd wyszukiwania AI.', 'Ошибка AI-поиска.'));
      }

      // Once the job has a run_id it behaves exactly like a normal discovery
      // run (same task description as the backend spec for this round) - load
      // its saved companies back through the EXISTING history endpoint/render
      // path instead of re-deriving results here.
      if (loadRunOnComplete && job.run_id) {
        await openHistoryRun(job.run_id);
      }

      const summary = buildAiSearchSummaryText(job);
      setDiscoverStatus(summary, job.stage === 'COMPLETED' ? 'ok' : 'warn');
      setStatus(summary, job.stage === 'COMPLETED' ? 'ok' : 'warn');
      return job;
    }

    await new Promise((resolve) => {
      state.aiSearchPollTimer = window.setTimeout(resolve, 1500);
    });
    state.aiSearchPollTimer = null;
  }

  throw new Error(t2('Wyszukiwanie AI zostało zatrzymane.', 'AI-поиск был остановлен.'));
}

async function cancelAiSearchJob() {
  const jobId = state.aiSearchJobId;
  if (!jobId) return;
  els.aiSearchCancelButton.disabled = true;
  if (els.aiSearchCancelButtonLabel) els.aiSearchCancelButtonLabel.textContent = trs('ai_search_cancelling');
  try {
    await fetch(apiUrl(`/api/ai-search/jobs/${jobId}/cancel`), {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ reason: 'worker_cancelled' })
    });
  } catch {
    // Non-fatal: the next poll tick reflects whatever state the backend
    // actually reaches even if this particular request failed in flight.
  } finally {
    els.aiSearchCancelButton.disabled = false;
    if (els.aiSearchCancelButtonLabel) els.aiSearchCancelButtonLabel.textContent = trs('ai_search_cancel');
  }
}

async function runAiCompanySearch(mode) {
  if (state.aiSearchRunning) {
    setDiscoverStatus(t2('Wyszukiwanie AI już trwa, poczekaj na zakończenie.', 'AI-поиск уже выполняется, дождитесь завершения.'), 'warn');
    return;
  }

  const niches = selectedDiscoveryNiches();
  if (!niches.length) {
    setDiscoverStatus(t2('Podaj kategorię lub wybierz zestaw kategorii.', 'Укажите категорию или выберите набор категорий.'), 'warn');
    return;
  }

  state.aiSearchRunning = true;
  stopAiSearchPolling();
  clearHistoryContext();
  switchView('results');
  state.historyLoaded = false;
  resetFiltersForDiscovery();

  els.discoverButton.disabled = true;
  els.analyzeButton.disabled = true;
  els.exportCsvButton.disabled = true;
  els.headerExportCsvButton.disabled = true;
  els.exportJsonButton.disabled = true;
  state.results = [];
  state.selectedId = null;
  state.detailTab = 'overview';
  renderResults();
  renderMetrics();
  renderDetail();
  setDiscoverStatus(t2('Uruchamiam AI-wyszukiwanie firm...', 'Запускаю AI-поиск компаний...'), 'work');

  // Curated field count (1-100): the existing #discoverLimit select is a
  // fixed 20/50/100/150 stepper (its 150 option exceeds the backend's 1-100
  // cap for this pipeline), so this uses its own dedicated #aiSearchCount
  // number input rather than reusing #discoverLimit.
  const requestedCount = Math.min(100, Math.max(1, Number(els.aiSearchCount?.value || 20) || 20));

  try {
    const response = await fetch(apiUrl('/api/ai-search/jobs'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        mode,
        niche: niches[0],
        niches,
        city: els.discoverCity.value.trim(),
        country: els.discoverCountry.value.trim(),
        district: els.discoverDistrict.value.trim(),
        radiusKm: Number(els.discoverRadius.value || 0) || undefined,
        language: currentLanguage,
        requestedCount,
        workerId: getWorkerId(),
        ...collectAiSearchCriteria()
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t2('Błąd uruchamiania wyszukiwania AI.', 'Ошибка запуска AI-поиска.'));
    if (!data.jobId) throw new Error(t2('Backend nie zwrócił identyfikatora zadania wyszukiwania AI.', 'Backend не вернул идентификатор задачи AI-поиска.'));

    state.aiSearchJobId = data.jobId;
    await waitForAiSearchCompletion(data.jobId);
    await loadHistory().catch(() => {});
  } catch (error) {
    setDiscoverStatus(error.message || t2('Błąd wyszukiwania AI.', 'Ошибка AI-поиска.'), 'warn');
  } finally {
    stopAiSearchPolling();
    state.aiSearchRunning = false;
    els.discoverButton.disabled = false;
    els.analyzeButton.disabled = false;
    els.aiSearchCancelButton?.classList.add('hidden-field');
    renderIcons();
    refreshWorkerQuota().catch(() => {});
  }
}

function selectedAiEnrichCompanyIds() {
  return getFilteredResults()
    .map((result) => leadCompanyId(result))
    .filter(Boolean);
}

function renderAiEnrichEligibleHint() {
  if (!els.aiEnrichEligible) return;
  if ((els.discoverMode?.value || 'standard') !== 'ai_enrich') {
    els.aiEnrichEligible.classList.add('hidden-field');
    return;
  }
  const ids = selectedAiEnrichCompanyIds();
  els.aiEnrichEligible.classList.remove('hidden-field');
  els.aiEnrichEligible.textContent = ids.length
    ? `${trs('ai_enrich_count_prefix')} ${ids.length} ${trs('ai_enrich_count_suffix')}`
    : trs('ai_enrich_none_eligible');
}

// Re-fetches each just-enriched company (the same /api/leads/:id call
// ensureResultExtras() already uses for crm_status/saved_links) and merges
// its fresh aiCompanyProfile into the matching in-memory result, so the AI
// tab reflects the new profile without a full page/history reload.
async function refreshEnrichedCompanies(companyIds) {
  await Promise.all(
    companyIds.map(async (companyId) => {
      try {
        const response = await fetch(apiUrl(`/api/leads/${encodeURIComponent(companyId)}`), { headers: savedAuthHeaders() });
        if (!response.ok) return;
        const data = await response.json();
        const profile = data.company?.aiCompanyProfile;
        if (!profile) return;
        state.results = state.results.map((result) => (leadCompanyId(result) === companyId ? { ...result, aiCompanyProfile: profile } : result));
      } catch {
        // Non-fatal per company - the worker can reopen that card later to retry.
      }
    })
  );
  renderResults();
  renderDetail();
}

async function runAiEnrich() {
  if (state.aiSearchRunning) {
    setDiscoverStatus(t2('Wzbogacanie AI już trwa, poczekaj na zakończenie.', 'AI-обогащение уже выполняется, дождитесь завершения.'), 'warn');
    return;
  }

  const companyIds = selectedAiEnrichCompanyIds();
  if (!companyIds.length) {
    setDiscoverStatus(trs('ai_enrich_none_eligible'), 'warn');
    return;
  }

  state.aiSearchRunning = true;
  stopAiSearchPolling();
  els.discoverButton.disabled = true;
  setDiscoverStatus(
    t2(`Uruchamiam wzbogacanie AI dla ${companyIds.length} firm...`, `Запускаю AI-обогащение для ${companyIds.length} компаний...`),
    'work'
  );

  try {
    const response = await fetch(apiUrl('/api/ai-search/enrich'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ companyIds })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t2('Błąd uruchamiania wzbogacania AI.', 'Ошибка запуска AI-обогащения.'));
    if (!data.jobId) throw new Error(t2('Backend nie zwrócił identyfikatora zadania wzbogacania.', 'Backend не вернул идентификатор задачи обогащения.'));

    state.aiSearchJobId = data.jobId;
    const job = await waitForAiSearchCompletion(data.jobId, { loadRunOnComplete: false });
    await refreshEnrichedCompanies(companyIds);
    const summary = buildAiSearchSummaryText(job);
    setStatus(summary, job.stage === 'FAILED' || job.stage === 'CANCELLED' ? 'warn' : 'ok');
  } catch (error) {
    setDiscoverStatus(error.message || t2('Błąd wzbogacania AI.', 'Ошибка AI-обогащения.'), 'warn');
  } finally {
    stopAiSearchPolling();
    state.aiSearchRunning = false;
    els.discoverButton.disabled = false;
    els.aiSearchCancelButton?.classList.add('hidden-field');
    renderIcons();
  }
}

async function handleAiSearchPrimaryAction(mode) {
  if (!state.config) {
    setDiscoverStatus(t2('Ponownie łączę backend...', 'Переподключаю backend...'), 'work');
    try {
      await bootstrapApiBase();
      await loadConfig();
    } catch {}
  }
  if (!state.config) {
    setDiscoverStatus(
      t2('Backend jeszcze nie odpowiedział. Kliknij ponownie za 2-3 sekundy.', 'Backend пока не ответил. Нажмите еще раз через 2-3 секунды.'),
      'warn'
    );
    return;
  }

  if (mode === 'ai_enrich') {
    await runAiEnrich();
  } else {
    await runAiCompanySearch(mode);
  }
}

async function runAnalysis() {
  stopDiscoveryPolling();
  clearHistoryContext();
  const items = parseInput(els.csvInput.value);
  if (!items.length) {
    setStatus(t2('Dodaj CSV z firmami.', 'Добавьте CSV с компаниями.'), 'warn');
    return;
  }

  els.analyzeButton.disabled = true;
  els.exportCsvButton.disabled = true;
  els.headerExportCsvButton.disabled = true;
  els.exportJsonButton.disabled = true;
  setStatus(t2(`Sprawdzam ${items.length} firm...`, `Проверяю ${items.length} компаний...`), 'work');

  try {
    const response = await fetch(apiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items,
        useAi: els.useAi.checked,
        useWebSearch: els.useWebSearch.checked,
        model: els.modelInput.value.trim(),
        searchModel: els.searchModelInput.value.trim(),
        language: currentLanguage
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t2('Błąd analizy.', 'Ошибка анализа.'));

    state.results = data.results || [];
    state.selectedId = state.results[0]?.id || null;
    state.detailTab = 'overview';
    renderResults();
    renderMetrics();
    renderDetail();
    setStatus(
      t2(
        `Gotowe: ${state.results.length} firm, ${Math.round(data.meta.elapsedMs / 1000)} sek.`,
        `Готово: ${state.results.length} компаний, ${Math.round(data.meta.elapsedMs / 1000)} сек.`
      ),
      'ok'
    );
  } catch (error) {
    setStatus(error.message || t2('Błąd analizy.', 'Ошибка анализа.'), 'warn');
  } finally {
    els.analyzeButton.disabled = false;
    const hasResults = state.results.length > 0;
    els.exportCsvButton.disabled = !hasResults;
    els.headerExportCsvButton.disabled = !hasResults;
    els.exportJsonButton.disabled = !hasResults;
    renderIcons();
  }
}

function parseInput(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return [];

  const rows = parseCsv(trimmed);
  if (!rows.length) return [];

  const firstRow = rows[0].map((cell) => normalizeHeader(cell));
  const hasHeader = firstRow.some((cell) =>
    ['website_url', 'url', 'website', 'company', 'company_name', 'niche', 'phone', 'nip', 'regon'].includes(cell)
  );

  if (hasHeader) {
    return rows.slice(1).map((row) => rowToItem(firstRow, row)).filter((item) => item.company || item.website_url || item.phone || item.nip);
  }

  return rows
    .map((row) => ({
      company: row[0] || '',
      niche: row[1] || '',
      district: row[2] || '',
      phone: row[3] || '',
      email: row[4] || '',
      website_url: row[5] || '',
      source_profile: row[6] || '',
      notes: row.slice(7).join(' ')
    }))
    .filter((item) => item.company || item.website_url || item.phone);
}

function itemsToCsv(items) {
  const rows = [
    inputCsvHeaders,
    ...items.map((item) =>
      inputCsvHeaders.map((key) => {
        if (key === 'instagram') return item.social_profiles?.instagram || item.instagram || '';
        if (key === 'facebook') return item.social_profiles?.facebook || item.facebook || '';
        if (key === 'tiktok') return item.social_profiles?.tiktok || item.tiktok || '';
        const value = item[key];
        if (Array.isArray(value)) return value.join(';');
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        return value ?? '';
      })
    )
  ];

  return rows.map(csvLine).join('\n');
}

function normalizeResultInput(company = {}) {
  const socialProfiles = company.social_profiles || {};
  return {
    ...company,
    social_profiles: {
      instagram: socialProfiles.instagram || company.instagram || '',
      facebook: socialProfiles.facebook || company.facebook || '',
      tiktok: socialProfiles.tiktok || company.tiktok || ''
    },
    city: company.city || 'Warszawa',
    source: company.source || 'discovery',
    source_profile: company.source_profile || company.website_url || '',
    services: Array.isArray(company.services) ? company.services : parseList(company.services || company.niche || ''),
    physical_location: company.physical_location !== false
  };
}

function buildPreviewResult(company, index, idPrefix = 'discovery') {
  const input = normalizeResultInput(company);
  const hasWebsite = Boolean(input.website_url);
  const hasSocial = hasAnySocial(input);
  const sourceProfile = input.source_profile || input.website_url || '';
  const websiteStatus = hasWebsite ? 'UNCERTAIN' : hasSocial ? 'SOCIAL_ONLY' : 'DIRECTORY_ONLY';
  const categoryRelevanceScore = Number(input.category_relevance_score || 0);
  const categoryMatch = input.category_match || (categoryRelevanceScore >= 70 ? 'match' : categoryRelevanceScore >= 40 ? 'partial' : '');
  const score = Math.min(
    88,
    42 +
      (hasWebsite ? 10 : 0) +
      (hasSocial ? 10 : 0) +
      (input.phone ? 12 : 0) +
      (input.email ? 8 : 0) +
      (input.review_count ? 8 : 0) +
      (input.rating ? 4 : 0) +
      (categoryRelevanceScore ? Math.round((categoryRelevanceScore - 50) / 5) : 0)
  );

  return {
    id: stablePreviewResultId(input, index, idPrefix),
    input,
    parsed: {
      ok: false,
      error: '',
      normalizedUrl: input.website_url || '',
      signals: buildFallbackSignals(input)
    },
    websiteResolution: {
      selectedUrl: input.website_url || '',
      websiteStatus,
      websiteConfidence: hasWebsite ? 0.45 : 0.25,
      domainVerification: { score: 0, matched: [] },
      checks_completed: { discovery: true, website_crawl: false },
      candidates: sourceProfile ? [{ url: sourceProfile, source: input.source || 'discovery', confidence: 0.45 }] : []
    },
    analysis: {
      website_status: websiteStatus,
      website_confidence: hasWebsite ? 0.45 : 0.25,
      website_quality_score: 0,
      lead_score: score,
      lead_category: score >= 75 ? 'A' : score >= 55 ? 'B' : 'C',
      category_match: categoryMatch,
      category_relevance_score: categoryRelevanceScore || null,
      category_relevance_reason: input.category_relevance_reason || '',
      positive_category_signals: input.positive_category_signals || [],
      negative_category_signals: input.negative_category_signals || [],
      should_call: input.should_call !== false,
      actual_business_type: input.actual_business_type || '',
      priority: score >= 75 ? 'A' : score >= 55 ? 'B' : 'C',
      requires_manual_review: true,
      // Left blank rather than baked in a fixed language here: this is a
      // synthetic "not yet analyzed" placeholder (no real AI/heuristic text
      // exists yet), and the render layer (renderOverviewTab's
      // mainProblemFallback, and the recommended_website/recommended_package
      // fallbacks below) fills in a properly bilingual message from the
      // *current* UI language every render - including after a language
      // toggle, which a string baked in here at construction time cannot do.
      main_problem: '',
      recommended_website: '',
      recommended_package: '',
      business_activity: 'FOUND_BY_DISCOVERY',
      mini_audit_points: [],
      first_message_ru: '',
      first_message_pl: ''
    },
    aiSiteAnalysis: { status: 'NOT_REQUESTED' },
    // AI company search profile (aiCompanyProfile) - same NOT_REQUESTED
    // placeholder convention as aiSiteAnalysis above; renderAiCompanyProfileBlock()
    // only renders anything once a real record's status becomes 'COMPLETED'.
    aiCompanyProfile: { status: 'NOT_REQUESTED' }
  };
}

function stablePreviewResultId(input, index, idPrefix = 'discovery') {
  const base =
    input._companyId ||
    [input.company, input.address, input.phone, input.source_profile, input.website_url].filter(Boolean).join('|') ||
    String(index);
  const normalized = normalizeLookupValue(base).replace(/\s+/g, '-');
  return `${idPrefix}-${normalized || index}`;
}

function buildFallbackSignals(input = {}, summary = {}) {
  return {
    title: summary.title || input.company || '',
    pageCount: Number(summary.pageCount || 0),
    forms: Number(summary.forms || 0),
    nonSvgImages: Number(summary.nonSvgImages || 0),
    phones: [],
    emails: [],
    allTextSample: summary.textSample || '',
    importantLinks: Array.isArray(summary.importantLinks) ? summary.importantLinks : []
  };
}

function historyRecordsToResults(records) {
  return records.map((record, index) => {
    const fallback = buildPreviewResult({ ...(record.data || {}), _companyId: record.id }, index, 'history');
    const website = record.website || {};
    const resolution = website.resolution || fallback.websiteResolution;
    return {
      ...fallback,
      id: `history-${record.id || index}`,
      input: normalizeResultInput({ ...(record.data || {}), _companyId: record.id }),
      parsed: {
        ok: Boolean(website.parsedOk),
        error: website.parsedError || '',
        normalizedUrl: website.normalizedUrl || resolution.selectedUrl || fallback.parsed.normalizedUrl,
        signals: buildFallbackSignals(record.data || {}, website.summary || {})
      },
      websiteResolution: resolution,
      heuristic: record.heuristic || fallback.analysis,
      analysis: record.analysis || record.heuristic || fallback.analysis,
      aiSiteAnalysis: record.aiSiteAnalysis || fallback.aiSiteAnalysis,
      aiCompanyProfile: record.aiCompanyProfile || fallback.aiCompanyProfile
    };
  });
}

function parseList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '')
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function updateResultFilters() {
  state.filters = {
    text: els.resultFilterText.value.trim().toLowerCase(),
    size: els.resultFilterSize.value,
    priority: els.resultFilterPriority.value
  };

  const filtered = getFilteredResults();
  if (state.selectedId && !filtered.some((result) => result.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id || null;
    state.detailTab = 'overview';
  }

  renderResults();
  renderMetrics();
  renderDetail();
  renderIcons();
  // Keeps the "N companies eligible for AI enrichment" hint (ai_enrich mode)
  // in sync with the same site-status/score/social/phone/email filters that
  // getFilteredResults() above already applies - see runAiEnrich().
  renderAiEnrichEligibleHint();
}

function resetResultFilters() {
  els.resultFilterText.value = '';
  els.resultFilterSize.value = 'all';
  els.resultFilterPriority.value = 'all';
  updateResultFilters();
}

function getFilteredResults() {
  const siteStatusFilter = els.sidebarSiteFilter.value;
  const minScoreFilter = Number(els.sidebarMinScore.value || 0);
  return state.results.filter((result) => {
    const input = result.input || {};
    const analysis = result.analysis || {};
    const status = analysis.website_status || result.websiteResolution?.websiteStatus || 'UNCERTAIN';
    const size = companySize(result).key;
    const priority = analysis.lead_category === 'A+' ? 'A' : analysis.priority || analysis.lead_category || '';
    const score = Number(analysis.lead_score || 0);

    if (minScoreFilter && score < minScoreFilter) return false;
    if (state.filters.priority !== 'all' && priority !== state.filters.priority) return false;
    if (state.filters.size !== 'all' && size !== state.filters.size) return false;
    if (!siteFilterMatches(status, siteStatusFilter)) return false;
    if (els.sidebarHasSocial.checked && !hasAnySocial(input)) return false;
    if (els.sidebarHasPhone.checked && !input.phone) return false;
    if (els.sidebarHasEmail.checked && !input.email) return false;

    if (state.filters.text) {
      const haystack = [
        input.company,
        input.legal_name,
        input.niche,
        displayCategory(input.niche, input.category_id),
        input.city,
        input.district,
        input.address,
        input.source,
        displaySourceLabel(input.source),
        input.source_profile,
        input.notes,
        status,
        analysis.main_problem
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(state.filters.text)) return false;
    }

    return true;
  }).sort(compareLeadForCalling);
}

function compareLeadForCalling(a, b) {
  return leadCallingRank(b) - leadCallingRank(a);
}

function leadCallingRank(result) {
  const input = result.input || {};
  const analysis = result.analysis || {};
  const status = analysis.website_status || result.websiteResolution?.websiteStatus || 'UNCERTAIN';
  const noSiteStatuses = new Set([
    'NO_WEBSITE_CONFIRMED',
    'SOCIAL_ONLY',
    'DIRECTORY_ONLY',
    'MARKETPLACE_ONLY',
    'BROKEN_WEBSITE',
    'FREE_SUBDOMAIN',
    'ONE_PAGE_PLACEHOLDER'
  ]);
  let rank = 0;
  if (noSiteStatuses.has(status)) rank += 1000;
  if (input.phone) rank += 200;
  if (input.email) rank += 80;
  if (hasAnySocial(input)) rank += 40;
  rank += Number(analysis.lead_score || 0);
  return rank;
}

function hasAnySocial(input) {
  const social = input.social_profiles || {};
  return Boolean(social.instagram || social.facebook || social.tiktok || /instagram|facebook|tiktok/i.test(input.source_profile || ''));
}

function rowCompanyLine(result) {
  const input = result.input || {};
  const url = result.websiteResolution?.selectedUrl || input.website_url || input.source_profile || '';
  if (!url) return '-';
  return linkOrDash(url);
}

function contactIcons(input, result) {
  const social = input.social_profiles || {};
  const website = result.websiteResolution?.selectedUrl || input.website_url || '';
  const websiteHref = externalHref(website);
  const instagramHref = externalHref(social.instagram);
  const facebookHref = externalHref(social.facebook);
  const tiktokHref = externalHref(social.tiktok);
  const items = [];

  if (input.phone) items.push(`<a href="tel:${escapeAttribute(input.phone)}" title="Телефон"><i data-lucide="phone"></i></a>`);
  if (input.email) items.push(`<a href="mailto:${escapeAttribute(input.email)}" title="Email"><i data-lucide="mail"></i></a>`);
  if (websiteHref) items.push(`<a href="${escapeAttribute(websiteHref)}" target="_blank" rel="noreferrer" title="Сайт"><i data-lucide="globe"></i></a>`);
  if (instagramHref) items.push(`<a href="${escapeAttribute(instagramHref)}" target="_blank" rel="noreferrer" title="Instagram"><i data-lucide="instagram"></i></a>`);
  if (facebookHref) items.push(`<a href="${escapeAttribute(facebookHref)}" target="_blank" rel="noreferrer" title="Facebook"><i data-lucide="facebook"></i></a>`);
  if (tiktokHref) items.push(`<a href="${escapeAttribute(tiktokHref)}" target="_blank" rel="noreferrer" title="TikTok"><i data-lucide="music-2"></i></a>`);

  return items.length ? `<div class="contact-icons">${items.join('')}</div>` : '-';
}

function externalHref(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(text)) return `https://${text}`;
  return '';
}

function scoreClass(score) {
  if (score >= 75) return 'high';
  if (score >= 55) return 'mid';
  return 'low';
}

function statusLabel(status) {
  const labels = {
    WEBSITE_FOUND: { pl: 'Strona znaleziona', ru: 'Сайт найден' },
    NO_WEBSITE_CONFIRMED: { pl: 'Brak strony', ru: 'Нет сайта' },
    SOCIAL_ONLY: { pl: 'Tylko social media', ru: 'Только соцсети' },
    DIRECTORY_ONLY: { pl: 'Katalog', ru: 'Каталог' },
    MARKETPLACE_ONLY: { pl: 'Marketplace', ru: 'Маркетплейс' },
    BROKEN_WEBSITE: { pl: 'Strona uszkodzona', ru: 'Сайт сломан' },
    FREE_SUBDOMAIN: { pl: 'Darmowa domena', ru: 'Бесплатный домен' },
    ONE_PAGE_PLACEHOLDER: { pl: 'Do sprawdzenia', ru: 'На проверке' },
    UNCERTAIN: { pl: 'Do sprawdzenia', ru: 'На проверке' }
  };
  const entry = labels[status];
  if (!entry) return status || t2('Do sprawdzenia', 'На проверке');
  return t2(entry.pl, entry.ru);
}

// Human-readable labels for the raw internal `checks_completed` fact keys
// (resolveWebsite() in server.js) so the Site tab never dumps snake_case
// keys verbatim - falls back to the raw key for anything not listed here.
function checkKeyLabel(key) {
  const labels = {
    listed_website: { pl: 'Strona podana w profilu', ru: 'Сайт указан в профиле' },
    registry_website: { pl: 'Strona z rejestru firm', ru: 'Сайт из реестра компаний' },
    email_domain_found: { pl: 'Domena znaleziona po e-mailu', ru: 'Домен найден по email' },
    name_search_domain: { pl: 'Domena znaleziona po nazwie firmy', ru: 'Домен найден по названию компании' },
    phone_search_domain: { pl: 'Domena znaleziona po telefonie', ru: 'Домен найден по телефону' },
    nip_search_domain: { pl: 'Domena znaleziona po NIP', ru: 'Домен найден по NIP/ИНН' },
    address_search_domain: { pl: 'Domena znaleziona po adresie', ru: 'Домен найден по адресу' },
    social_profile_domain: { pl: 'Domena znaleziona przez social media', ru: 'Домен найден через соцсети' },
    public_search_domain: { pl: 'Domena znaleziona przez wyszukiwanie publiczne', ru: 'Домен найден через публичный поиск' },
    // Domain-candidate source keys (resolveWebsite()'s addCandidate() calls in
    // server.js) - a different vocabulary than checks_completed above, but
    // shown through this same label map on the Sources tab (see Finding 3).
    corporate_email_domain: { pl: 'Domena firmowego e-maila', ru: 'Домен корпоративного email' },
    profile_link: { pl: 'Link z profilu firmy', ru: 'Ссылка из профиля компании' },
    public_website_search: { pl: 'Wyszukiwanie publiczne strony', ru: 'Публичный поиск сайта' },
    openai_web_search: { pl: 'Wyszukiwanie AI w sieci', ru: 'AI-поиск в интернете' }
  };
  const entry = labels[key];
  if (!entry) return key;
  return t2(entry.pl, entry.ru);
}

function siteFilterMatches(status, filter) {
  if (filter === 'all') return true;
  const noSiteStatuses = new Set([
    'NO_WEBSITE_CONFIRMED',
    'SOCIAL_ONLY',
    'DIRECTORY_ONLY',
    'MARKETPLACE_ONLY',
    'BROKEN_WEBSITE',
    'FREE_SUBDOMAIN'
  ]);
  if (filter === 'no_site') return noSiteStatuses.has(status);
  if (filter === 'has_site') return status === 'WEBSITE_FOUND';
  if (filter === 'weak_site') return ['ONE_PAGE_PLACEHOLDER', 'FREE_SUBDOMAIN', 'BROKEN_WEBSITE'].includes(status);
  if (filter === 'uncertain') return status === 'UNCERTAIN';
  return true;
}

function companySize(result) {
  const input = result.input || {};
  const teamNumber = parseTeamSize(input.team_size);
  const servicesCount = (input.services || []).length;
  const reviewCount = Number(input.review_count || 0);

  if (input.multiple_locations || teamNumber >= 10 || reviewCount >= 100 || servicesCount >= 7) {
    return { key: 'large', label: tr('large') };
  }
  if (teamNumber >= 3 || reviewCount >= 20 || servicesCount >= 3 || input.physical_location) {
    return { key: 'medium', label: tr('medium') };
  }
  return { key: 'small', label: tr('small') };
}

function parseTeamSize(value) {
  const numbers = String(value || '').match(/\d+/g);
  if (!numbers) return 0;
  return Math.max(...numbers.map(Number));
}

function rowToItem(headers, row) {
  const get = (...names) => {
    for (const name of names) {
      const index = headers.indexOf(name);
      if (index >= 0) return row[index] || '';
    }
    return '';
  };

  return {
    _companyId: get('_companyid', '_companyId'),
    company: get('company', 'company_name', 'name', 'firma', 'nazwa', 'компания'),
    legal_name: get('legal_name', 'official_name', 'nazwa_pelna'),
    niche: get('niche', 'category', 'kategoria', 'nisza', 'ниша'),
    city: get('city', 'miasto', 'город'),
    district: get('district', 'area', 'dzielnica', 'район'),
    address: get('address', 'adres'),
    phone: get('phone', 'telefon', 'tel'),
    email: get('email', 'mail'),
    nip: get('nip'),
    regon: get('regon'),
    krs: get('krs'),
    edrpou: get('edrpou', 'єдрпоу', 'edrpou_code'),
    pkd: get('pkd'),
    status: get('status', 'registry_status'),
    registration_date: get('registration_date', 'start_date', 'data_rejestracji'),
    website_url: get('website_url', 'website', 'url', 'site', 'strona', 'сайт'),
    website_listed: get('website_listed'),
    source: get('source', 'source_name'),
    source_profile: get('source_profile', 'profile_url', 'source_url', 'card_url'),
    instagram: get('instagram', 'instagram_url'),
    facebook: get('facebook', 'facebook_url'),
    tiktok: get('tiktok', 'tiktok_url'),
    review_count: get('review_count', 'reviews', 'opinie'),
    rating: get('rating', 'ocena'),
    last_activity: get('last_activity', 'last_post_date', 'ostatnia_aktywnosc'),
    activity_signal: get('activity_signal', 'content_freshness'),
    services: get('services', 'uslugi'),
    portfolio_available: get('portfolio_available', 'portfolio', 'photos'),
    physical_location: get('physical_location', 'location'),
    team_size: get('team_size', 'employees', 'zespol'),
    multiple_locations: get('multiple_locations', 'branches', 'filialy'),
    high_ticket: get('high_ticket', 'expensive_services'),
    paid_platform: get('paid_platform'),
    notes: get('notes', 'note', 'uwagi', 'комментарий')
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function renderResults() {
  if (!state.results.length) {
    const emptyText = state.discoveryRunning ? getSearchingResultsText() : tr('resultsEmpty');
    els.resultsBody.innerHTML = `<tr class="empty-row"><td colspan="8">${escapeHtml(emptyText)}</td></tr>`;
    els.filterSummary.textContent = tr('filtersNone');
    return;
  }

  const results = getFilteredResults();
  els.filterSummary.textContent = `${tr('shown')} ${results.length} ${tr('from')} ${state.results.length}`;

  if (!results.length) {
    els.resultsBody.innerHTML = `<tr class="empty-row"><td colspan="8">${escapeHtml(tr('noFilterResults'))}</td></tr>`;
    return;
  }

  els.resultsBody.innerHTML = results
    .map((result, index) => {
      const a = result.analysis;
      const input = result.input;
      const selected = result.id === state.selectedId ? 'selected' : '';
      const status = a.website_status || result.websiteResolution?.websiteStatus || 'UNCERTAIN';
      const size = companySize(result);
      const score = Number(a.lead_score || 0);
      const companyLine = rowCompanyLine(result);
      return `
        <tr class="${selected}" data-id="${escapeHtml(result.id)}">
          <td class="lead-number">${index + 1}</td>
          <td><span class="status-tag ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></td>
          <td>
            <strong>${escapeHtml(input.company || result.parsed?.signals?.title || '-')}</strong>
            <span class="company-subline">${companyLine}</span>
          </td>
          <td>${escapeHtml(displayCategory(input.niche || '-', input.category_id))}</td>
          <td><span class="size-pill ${escapeHtml(size.key)}">${escapeHtml(size.label)}</span></td>
          <td>${contactIcons(input, result)}</td>
          <td><span class="score-badge ${scoreClass(score)}">${escapeHtml(String(score || '-'))}</span></td>
          <td>${escapeHtml(input.last_activity || result.analysis?.business_activity || '-')}</td>
        </tr>
      `;
    })
    .join('');

  els.resultsBody.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', () => {
      state.selectedId = row.dataset.id;
      state.detailTab = 'overview';
      renderResults();
      renderDetail();
    });
  });
}

function renderMetrics() {
  const counts = { withSite: 0, noSite: 0, review: 0, manualReview: 0 };
  const results = getFilteredResults();
  const noSiteStatuses = new Set([
    'NO_WEBSITE_CONFIRMED',
    'SOCIAL_ONLY',
    'DIRECTORY_ONLY',
    'MARKETPLACE_ONLY',
    'BROKEN_WEBSITE',
    'FREE_SUBDOMAIN'
  ]);

  for (const result of results) {
    const a = result.analysis || {};
    // Same fallback chain as getFilteredResults()/leadCallingRank() below -
    // without it, a result whose analysis.website_status was empty (but
    // websiteResolution.websiteStatus was set, or neither was) fell into
    // none of the three buckets while still being counted in `total`, so
    // "С сайтом" + "Без сайта" + "На проверке" silently undercounted
    // "Всего найдено" instead of always summing to it.
    const status = a.website_status || result.websiteResolution?.websiteStatus || 'UNCERTAIN';
    if (status === 'WEBSITE_FOUND') counts.withSite += 1;
    else if (noSiteStatuses.has(status)) counts.noSite += 1;
    else counts.review += 1;
    // requires_manual_review is a separate overlay flag (can be true for a
    // WEBSITE_FOUND result with a high score, or for an UNCERTAIN one) - it
    // intentionally is not part of the withSite+noSite+review partition.
    if (a.requires_manual_review) counts.manualReview += 1;
  }

  els.totalMetric.textContent = String(results.length);
  els.aMetric.textContent = String(counts.withSite);
  els.noSiteMetric.textContent = String(counts.noSite);
  els.reviewMetric.textContent = String(counts.review);
  els.manualReviewMetric.textContent = String(counts.manualReview);
}

function renderDetail() {
  return renderTabbedDetail();

  const result = state.results.find((item) => item.id === state.selectedId);
  if (!result) {
    els.detailTitle.textContent = tr('chooseResult');
    els.detailPriority.textContent = '-';
    els.detailPriority.className = 'priority-badge muted';
    els.detailContent.innerHTML =
      '<p class="muted-text">После анализа здесь появится статус сайта, проверки, score бизнеса, мини-аудит и текст первого контакта.</p>';
    return;
  }

  const a = result.analysis;
  const input = result.input;
  const resolution = result.websiteResolution || {};
  const signals = result.parsed?.signals || {};
  const title = input.company || signals.title || shortUrl(resolution.selectedUrl || input.website_url);
  const status = a.website_status || resolution.websiteStatus || 'UNCERTAIN';
  els.detailTitle.textContent = title;
  els.detailPriority.textContent = a.lead_category || a.priority || '-';
  els.detailPriority.className = `priority-badge ${String(a.priority || '').toLowerCase()}`;

  els.detailContent.innerHTML = `
    <section class="detail-section">
      <h3>Статус сайта</h3>
      <p><span class="status-tag ${statusClass(status)}">${escapeHtml(status)}</span></p>
      <p><strong>Уверенность:</strong> ${escapeHtml(formatPercent(a.website_confidence ?? resolution.websiteConfidence))}</p>
      <p><strong>Найденный домен:</strong> ${escapeHtml(resolution.selectedUrl || '-')}</p>
      <p><strong>Подтверждение домена:</strong> ${escapeHtml(String(resolution.domainVerification?.score ?? 0))}/100 (${escapeHtml((resolution.domainVerification?.matched || []).join(', ') || 'no matches')})</p>
    </section>

    <section class="detail-section">
      <h3>Lead score</h3>
      <p><strong>${escapeHtml(String(a.lead_score ?? '-'))}/100</strong> · ${escapeHtml(a.lead_category || '-')} · ${escapeHtml(a.priority || '-')}</p>
      <p><strong>Business activity:</strong> ${escapeHtml(a.business_activity || '-')}</p>
      <p><strong>Manual review:</strong> ${a.requires_manual_review ? 'yes' : 'no'}</p>
      <p><strong>Package:</strong> ${escapeHtml(a.recommended_package || '-')} · ${escapeHtml(a.recommended_website || '-')}</p>
    </section>

    <section class="detail-section">
      <h3>Проблема</h3>
      <p>${escapeHtml(a.main_problem || '-')}</p>
      <p class="muted-text">${escapeHtml(a.why_it_matters || '')}</p>
    </section>

    <section class="detail-section">
      <h3>Проверки</h3>
      <ul>${Object.entries(resolution.checks_completed || {}).map(([key, value]) => `<li>${escapeHtml(key)}: ${value ? 'yes' : 'no'}</li>`).join('')}</ul>
    </section>

    <section class="detail-section">
      <h3>Мини-аудит</h3>
      <ul>${(a.mini_audit_points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
    </section>

    <section class="detail-section">
      <h3>Оффер</h3>
      <p>${escapeHtml(a.proposed_solution || '-')}</p>
    </section>

    <section class="detail-section">
      <h3>Сообщение RU</h3>
      <div class="message-box">
        <p>${escapeHtml(a.first_message_ru || '-')}</p>
        <button class="copy-button" type="button" data-copy="${escapeAttribute(a.first_message_ru || '')}">
          <i data-lucide="copy"></i>
          Копировать
        </button>
      </div>
    </section>

    <section class="detail-section">
      <h3>Сообщение PL</h3>
      <div class="message-box">
        <p>${escapeHtml(a.first_message_pl || '-')}</p>
        <button class="copy-button" type="button" data-copy="${escapeAttribute(a.first_message_pl || '')}">
          <i data-lucide="copy"></i>
          Копировать
        </button>
      </div>
    </section>

    <section class="detail-section">
      <h3>Raw signals</h3>
      <p class="muted-text">
        reviews: ${escapeHtml(String(input.review_count || 0))};
        phone: ${escapeHtml(input.phone || '-')};
        email: ${escapeHtml(input.email || '-')};
        forms: ${escapeHtml(String(signals.forms || 0))};
        photos: ${escapeHtml(String(signals.nonSvgImages || 0))};
        prices: ${signals.hasPriceKeywords ? 'yes' : 'no'}.
      </p>
    </section>
  `;

  els.detailContent.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.copy || '');
      button.textContent = 'Скопировано';
      setTimeout(() => {
        button.innerHTML = '<i data-lucide="copy"></i>Копировать';
        renderIcons();
      }, 1200);
    });
  });

  renderIcons();
}

function renderTabbedDetail() {
  const result = state.results.find((item) => item.id === state.selectedId);
  if (!result) {
    els.detailTitle.textContent = tr('chooseResult');
    els.detailPriority.textContent = '-';
    els.detailPriority.className = 'priority-badge muted';
    els.detailContent.innerHTML =
      `<p class="muted-text">${escapeHtml(tr('detailEmpty'))}</p>`;
    return;
  }

  const a = result.analysis || {};
  const input = result.input || {};
  const resolution = result.websiteResolution || {};
  const signals = result.parsed?.signals || {};
  const title = input.company || signals.title || shortUrl(resolution.selectedUrl || input.website_url);
  const tabs = ['overview', 'sources', 'site', 'ai', 'history'];
  if (!tabs.includes(state.detailTab)) state.detailTab = 'overview';

  els.detailTitle.textContent = title || tr('company');
  els.detailPriority.textContent = a.lead_category || a.priority || '-';
  els.detailPriority.className = `priority-badge ${String(a.priority || '').toLowerCase()}`;

  els.detailContent.innerHTML = `
    <div class="detail-tabs">
      ${detailTabButton('overview', tr('overview'), 'layout-dashboard')}
      ${detailTabButton('sources', tr('sources'), 'link')}
      ${detailTabButton('site', tr('site'), 'globe')}
      ${detailTabButton('ai', tr('aiAnalysis'), 'bot')}
      ${detailTabButton('history', tr('history'), 'history')}
    </div>
    ${renderActiveDetailTab(result)}
  `;

  bindDetailActions(result);
  renderIcons();
  ensureResultExtras(result);
}

// Lazily fetches the live company record (CRM status, saved-folder links,
// comments) the first time a lead with a real companyId is opened, then
// re-renders once. Avoids refetching on every tab switch.
async function ensureResultExtras(result) {
  const companyId = leadCompanyId(result);
  if (!companyId || result._extrasLoaded || result._extrasLoading) return;
  result._extrasLoading = true;
  try {
    const [companyResponse] = await Promise.all([
      fetch(apiUrl(`/api/leads/${encodeURIComponent(companyId)}`), { headers: savedAuthHeaders() }),
      loadCommentsForResult(result)
    ]);
    if (companyResponse.ok) {
      const data = await companyResponse.json();
      result._crmStatus = data.company?.crm_status || 'nowy';
      result._savedFolderIds = (data.company?.saved_links || [])
        .filter((link) => link.workerId === getWorkerId())
        .map((link) => link.folderId);
      // Defensive merge: fills in aiCompanyProfile here too in case a given
      // listing/history payload didn't already carry it inline (see
      // historyRecordsToResults()) - never overwrites a profile the result
      // already has.
      if (!result.aiCompanyProfile && data.company?.aiCompanyProfile) {
        result.aiCompanyProfile = data.company.aiCompanyProfile;
      }
    }
    result._extrasLoaded = true;
  } catch {
    // Non-fatal: workflow card falls back to defaults (Nowy, not saved).
  } finally {
    result._extrasLoading = false;
  }
  if (state.selectedId === result.id) renderTabbedDetail();
}

function detailTabButton(id, label, icon) {
  return `<button class="detail-tab ${state.detailTab === id ? 'active' : ''}" type="button" data-detail-tab="${id}"><i data-lucide="${icon}"></i>${escapeHtml(label)}</button>`;
}

function leadCompanyId(result) {
  return result?._companyId || result?.input?._companyId || '';
}

function currentLeadStatus(result) {
  if (result?._duplicate) return 'duplicate';
  return result?.input?.lead_status || result?.lead_status || (result?.analysis ? 'analyzed' : 'reserved');
}

function leadStatusLabel(value) {
  const option = leadStatusOptions.find((item) => item.value === value);
  if (!option) return value || 'new';
  return currentLanguage === 'pl' ? option.pl : option.ru;
}

function renderLeadWorkflowCard(result) {
  const companyId = leadCompanyId(result);
  const status = currentLeadStatus(result);
  const helper =
    currentLanguage === 'pl'
      ? 'Ten status zapisuje sie w backendzie i jest widoczny w panelu admina.'
      : 'Этот статус сохраняется в backend и сразу виден в админке.';
  const missing =
    currentLanguage === 'pl'
      ? 'Status mozna zapisac dla leadow z parsera/historii. Dla czystego CSV najpierw uruchom sprawdzenie.'
      : 'Статус можно сохранить для лидов из парсера/истории. Для чистого CSV сначала запустите проверку.';
  const crmStatus = result._crmStatus || 'nowy';
  const saved = isCompanySaved(result);

  return `
    <section class="detail-card lead-workflow-card">
      <h3>${currentLanguage === 'pl' ? 'Status pracy' : 'Статус обработки'}</h3>
      <select id="leadWorkflowStatus" ${companyId ? '' : 'disabled'}>
        ${leadStatusOptions
          .map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === status ? 'selected' : ''}>${escapeHtml(currentLanguage === 'pl' ? option.pl : option.ru)}</option>`)
          .join('')}
      </select>
      <p class="muted-text">${escapeHtml(companyId ? helper : missing)}</p>

      <h3 style="margin-top:14px">${currentLanguage === 'pl' ? 'Status CRM' : 'Статус CRM'}</h3>
      <select id="leadCrmStatus" ${companyId ? '' : 'disabled'}>
        ${crmStatusOptions.map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === crmStatus ? 'selected' : ''}>${escapeHtml(crmStatusLabel(option.value))}</option>`).join('')}
      </select>

      <div class="lead-workflow-actions">
        <button id="leadSaveToggle" class="secondary-button compact-button save-toggle ${saved ? 'saved-active' : ''}" type="button" ${companyId ? '' : 'disabled'}>
          <i data-lucide="${saved ? 'bookmark-check' : 'bookmark-plus'}"></i>
          ${saved ? (currentLanguage === 'pl' ? 'Zapisano' : 'Сохранено') : (currentLanguage === 'pl' ? 'Zapisz' : 'Сохранить')}
        </button>
        <button id="leadAddToFolder" class="secondary-button compact-button" type="button" ${companyId ? '' : 'disabled'}>
          <i data-lucide="folder-plus"></i>
          ${currentLanguage === 'pl' ? 'Dodaj do folderu' : 'В папку'}
        </button>
        <button id="leadReturnToPool" class="secondary-button compact-button" type="button" ${companyId ? '' : 'disabled'}>
          <i data-lucide="undo-2"></i>
          ${currentLanguage === 'pl' ? 'Wróć do puli' : 'Вернуть в пул'}
        </button>
      </div>
      ${
        saved
          ? `<div class="folder-chip-list">${
              (result._savedFolderIds || []).filter(Boolean).map((id) => `<span class="folder-chip">${escapeHtml(state.folders.find((f) => f.id === id)?.name || id)}</span>`).join('') ||
              `<span class="folder-chip">${currentLanguage === 'pl' ? 'Bez folderu' : 'Без папки'}</span>`
            }</div>`
          : ''
      }
    </section>

    <section class="detail-card comments-card">
      <h3>${currentLanguage === 'pl' ? 'Komentarze' : 'Комментарии'}</h3>
      <div class="comment-form">
        <textarea id="leadCommentInput" placeholder="${escapeAttribute(currentLanguage === 'pl' ? 'np. dodzwonić się jutro, właściciel zainteresowany...' : 'напр. дозвониться завтра, владелец заинтересован...')}" ${companyId ? '' : 'disabled'}></textarea>
        <button id="leadCommentSubmit" class="secondary-button compact-button" type="button" ${companyId ? '' : 'disabled'}>${currentLanguage === 'pl' ? 'Dodaj komentarz' : 'Добавить комментарий'}</button>
      </div>
      <div class="comment-list">
        ${
          (result._comments || [])
            .map(
              (comment) => `
          <div class="comment-item" data-comment-id="${escapeAttribute(comment.id)}">
            <div class="comment-item-head">
              <span>${escapeHtml(comment.authorRole === 'admin' ? `admin (${comment.authorId})` : comment.authorId)}</span>
              <span>${escapeHtml(new Date(comment.createdAt).toLocaleString())}</span>
            </div>
            <p>${escapeHtml(comment.text)}</p>
            ${
              comment.authorRole === 'worker' && comment.authorId === getWorkerId()
                ? `<div class="comment-item-actions"><button type="button" data-delete-comment="${escapeAttribute(comment.id)}">${currentLanguage === 'pl' ? 'Usuń' : 'Удалить'}</button></div>`
                : ''
            }
          </div>`
            )
            .join('') ||
          `<p class="muted-text">${
            companyId
              ? currentLanguage === 'pl' ? 'Brak komentarzy.' : 'Комментариев пока нет.'
              : currentLanguage === 'pl' ? 'Komentarze dostępne po zapisaniu firmy z parsera/historii.' : 'Комментарии доступны после сохранения фирмы из парсера/истории.'
          }</p>`
        }
      </div>
    </section>
  `;
}

function renderActiveDetailTab(result) {
  if (state.detailTab === 'overview') return renderOverviewTab(result);
  if (state.detailTab === 'sources') return renderSourcesTab(result);
  if (state.detailTab === 'ai') return renderAiTab(result);
  if (state.detailTab === 'history') return renderHistoryTab(result);
  return renderSiteTab(result);
}

function renderOverviewTab(result) {
  const input = result.input || {};
  const a = result.analysis || {};
  const status = a.website_status || result.websiteResolution?.websiteStatus || 'UNCERTAIN';
  const size = companySize(result);
  const social = input.social_profiles || {};
  const services = Array.isArray(input.services) ? input.services : [];
  const positiveSignals = Array.isArray(a.positive_category_signals) ? a.positive_category_signals : parseList(a.positive_category_signals || '');
  const negativeSignals = Array.isArray(a.negative_category_signals) ? a.negative_category_signals : parseList(a.negative_category_signals || '');
  const categoryMatchLabel =
    a.category_match === 'mismatch'
      ? currentLanguage === 'pl' ? 'Nie pasuje' : 'Не подходит'
      : a.category_match === 'partial'
        ? currentLanguage === 'pl' ? 'Sprawdzić ręcznie' : 'Проверить вручную'
        : currentLanguage === 'pl' ? 'Pasuje' : 'Подходит';
  // Not-yet-analyzed leads (buildPreviewResult's synthetic placeholder) leave
  // main_problem empty rather than baking in a fixed-language string, so this
  // fallback is recomputed on every render (and therefore stays correct after
  // a language toggle, unlike a string baked in at result-construction time).
  const mainProblemFallback =
    a.category_match === 'partial'
      ? t2(
          'Firma znaleziona, ale kategoria wymaga ręcznej weryfikacji przed telefonem.',
          'Компания найдена, но категория требует ручной проверки перед звонком.'
        )
      : t2(
          'Firma znaleziona. Kliknij "Znajdź strony", aby sprawdzić stronę, kontakty i jakość strony.',
          'Компания найдена. Нажмите "Найти сайты", чтобы проверить сайт, контакты и качество страницы.'
        );
  return `
    <div class="detail-card-grid">
      ${renderLeadWorkflowCard(result)}

      <section class="detail-card">
        <h3>${t2('Dopasowanie kategorii', 'Соответствие категории')}</h3>
        <p><strong>${escapeHtml(categoryMatchLabel)}</strong> · ${escapeHtml(String(a.category_relevance_score ?? '-'))}/100</p>
        <p class="muted-text">${escapeHtml(a.category_relevance_reason || t2('Kategoria sprawdzona na podstawie słów kluczowych i sygnałów źródła.', 'Категория проверена по ключевым словам и сигналам источников.'))}</p>
        ${negativeSignals.length ? `<p><strong>Negative:</strong> ${escapeHtml(negativeSignals.join(', '))}</p>` : ''}
        ${positiveSignals.length ? `<p><strong>Positive:</strong> ${escapeHtml(positiveSignals.join(', '))}</p>` : ''}
        <p><strong>${t2('Zadzwonić:', 'Звонить:')}</strong> ${a.should_call === false ? t2('Nie', 'Нет') : t2('Tak', 'Да')}</p>
      </section>

      <section class="detail-card">
        <h3>${t2('Podsumowanie', 'Краткая информация')}</h3>
        <p>${escapeHtml(a.main_problem || mainProblemFallback)}</p>
        <p class="muted-text">${escapeHtml([displayCategory(input.niche, input.category_id), input.city, input.district].filter(Boolean).join(' · ') || '-')}</p>
      </section>

      <section class="detail-card">
        <h3>${t2('Status strony', 'Статус сайта')}</h3>
        <p><span class="status-tag ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></p>
        <p class="muted-text">${escapeHtml(a.main_problem || t2('Status obliczony bez AI na podstawie znalezionych stron, social mediów i publicznych profili.', 'Статус рассчитан без AI по найденным сайтам, соцсетям и публичным профилям.'))}</p>
      </section>

      <section class="detail-card">
        <h3>${t2('Kontakty', 'Контакты')}</h3>
        <p><i data-lucide="phone"></i>${escapeHtml(input.phone || '-')}</p>
        <p><i data-lucide="mail"></i>${escapeHtml(input.email || '-')}</p>
        <p><i data-lucide="map-pin"></i>${escapeHtml(input.address || [input.city, input.district].filter(Boolean).join(', ') || '-')}</p>
        <p>${linkOrDash(social.instagram || social.facebook || social.tiktok || input.source_profile)}</p>
      </section>

      <section class="detail-card">
        <h3>${t2('Usługi', 'Услуги')}</h3>
        ${services.length ? `<ul>${services.slice(0, 6).map((service) => `<li>${escapeHtml(service)}</li>`).join('')}</ul>` : `<p class="muted-text">${t2('Usługi nie są podane w źródle.', 'Услуги не указаны в источнике.')}</p>`}
      </section>

      <section class="detail-card">
        <h3>${t2('Sygnały aktywności', 'Сигналы активности')}</h3>
        <p><strong>${t2('Ostatnia aktywność:', 'Последняя активность:')}</strong> ${escapeHtml(input.last_activity || 'UNKNOWN')}</p>
        <p><strong>${t2('Opinie:', 'Отзывы:')}</strong> ${escapeHtml(String(input.review_count || 0))}; rating: ${escapeHtml(String(input.rating || 0))}</p>
        <p><strong>${t2('Rozmiar:', 'Размер:')}</strong> ${escapeHtml(size.label)} · ${escapeHtml(input.team_size || 'UNKNOWN')}</p>
      </section>

      <section class="detail-card">
        <h3>${t2('Rekomendowany typ strony', 'Рекомендованный тип сайта')}</h3>
        <p><strong>${escapeHtml(a.recommended_website || t2('Landing / Wizytówka', 'Лендинг / Визитка'))}</strong></p>
        <p class="muted-text">${escapeHtml(a.recommended_package || t2('Szybka strona pod usługi, kontakty, portfolio i zgłoszenia.', 'Быстрый сайт под услуги, контакты, портфолио и заявки.'))}</p>
      </section>
    </div>
  `;
}

function renderGeneralTab(result) {
  const input = result.input || {};
  const a = result.analysis || {};
  const size = companySize(result);
  return `
    <section class="detail-section">
      <h3>Общее</h3>
      <p><strong>Компания:</strong> ${escapeHtml(input.company || '-')}</p>
      <p><strong>Категория:</strong> ${escapeHtml(displayCategory(input.niche || '-'))}</p>
      <p><strong>Размер:</strong> ${escapeHtml(size.label)}</p>
      <p><strong>Локация:</strong> ${escapeHtml([input.city, input.district, input.address].filter(Boolean).join(', ') || '-')}</p>
      <p><strong>Статус:</strong> ${escapeHtml(input.status || 'UNKNOWN')}</p>
      <p><strong>Источник:</strong> ${escapeHtml(displaySourceLabel(input.source || 'CSV/import'))} ${input.source_profile ? `· ${linkOrDash(input.source_profile)}` : ''}</p>
      <p><strong>Возраст/дата старта:</strong> ${escapeHtml(input.registration_date || 'UNKNOWN')}</p>
      <p><strong>Business score:</strong> ${escapeHtml(String(a.lead_score ?? '-'))}/100 · ${escapeHtml(a.lead_category || '-')}</p>
      <p><strong>Priority:</strong> ${escapeHtml(a.priority || '-')} · manual review: ${a.requires_manual_review ? 'yes' : 'no'}</p>
    </section>
  `;
}

function renderActivityTab(result) {
  const input = result.input || {};
  const a = result.analysis || {};
  return `
    <section class="detail-section">
      <h3>Активность</h3>
      <p><strong>Уровень:</strong> ${escapeHtml(a.business_activity || 'UNKNOWN')}</p>
      <p><strong>Последняя активность:</strong> ${escapeHtml(input.last_activity || 'UNKNOWN')}</p>
      <p><strong>Сигнал активности:</strong> ${escapeHtml(input.activity_signal || 'UNKNOWN')}</p>
      <p><strong>Отзывы:</strong> ${escapeHtml(String(input.review_count || 0))}; rating: ${escapeHtml(String(input.rating || 0))}</p>
      <p><strong>Портфолио:</strong> ${yesNo(input.portfolio_available)} · physical location: ${yesNo(input.physical_location)}</p>
      <p><strong>Команда:</strong> ${escapeHtml(input.team_size || 'UNKNOWN')} · branches: ${yesNo(input.multiple_locations)}</p>
      <p><strong>Услуги:</strong> ${escapeHtml((input.services || []).join(', ') || '-')}</p>
    </section>
  `;
}

function renderContactsTab(result) {
  const input = result.input || {};
  const social = input.social_profiles || {};
  return `
    <section class="detail-section">
      <h3>Контакты</h3>
      <p><strong>Телефон:</strong> ${escapeHtml(input.phone || '-')}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(input.email || '-')}</p>
      <p><strong>Адрес:</strong> ${escapeHtml(input.address || '-')}</p>
      <p><strong>Instagram:</strong> ${linkOrDash(social.instagram)}</p>
      <p><strong>Facebook:</strong> ${linkOrDash(social.facebook)}</p>
      <p><strong>TikTok:</strong> ${linkOrDash(social.tiktok)}</p>
      <p><strong>Source profile:</strong> ${linkOrDash(input.source_profile)}</p>
    </section>
  `;
}

function renderSiteTab(result) {
  const input = result.input || {};
  const a = result.analysis || {};
  const resolution = result.websiteResolution || {};
  const signals = result.parsed?.signals || {};
  const status = a.website_status || resolution.websiteStatus || 'UNCERTAIN';

  return `
    <section class="detail-section">
      <h3>${t2('Fakty o stronie', 'Факты о сайте')}</h3>
      <p><span class="status-tag ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></p>
      <p><strong>${t2('Pewność:', 'Уверенность:')}</strong> ${escapeHtml(formatPercent(a.website_confidence ?? resolution.websiteConfidence))}</p>
      <p><strong>${t2('Znaleziona domena:', 'Найденный домен:')}</strong> ${linkOrDash(resolution.selectedUrl || input.website_url)}</p>
      <p><strong>${t2('Potwierdzenie domeny:', 'Подтверждение домена:')}</strong> ${escapeHtml(String(resolution.domainVerification?.score ?? 0))}/100 (${escapeHtml((resolution.domainVerification?.matched || []).join(', ') || t2('brak dopasowań', 'нет совпадений'))})</p>
      <p><strong>${t2('Stron:', 'Страниц:')}</strong> ${escapeHtml(String(signals.pageCount || 0))}; HTTPS: ${resolution.selectedUrl?.startsWith('https://') ? t2('tak', 'да') : 'UNKNOWN'}; forms: ${escapeHtml(String(signals.forms || 0))}; photos: ${escapeHtml(String(signals.nonSvgImages || 0))}</p>
    </section>

    <section class="detail-section">
      <h3>${t2('Kontrole bez AI', 'Проверки без AI')}</h3>
      <ul>${Object.entries(resolution.checks_completed || {}).map(([key, value]) => `<li>${escapeHtml(checkKeyLabel(key))}: ${value ? t2('tak', 'да') : t2('nie', 'нет')}</li>`).join('')}</ul>
    </section>

    <section class="detail-section">
      <h3>${t2('Wniosek automatyczny', 'Автоматический вывод')}</h3>
      <p>${escapeHtml(a.main_problem || '-')}</p>
      <p class="muted-text">${escapeHtml(a.why_it_matters || '')}</p>
      <ul>${(a.mini_audit_points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
    </section>
  `;
}

function renderAiTab(result) {
  const ai = result.aiSiteAnalysis || { status: 'NOT_REQUESTED' };
  const aiData = ai.data || (ai.ai_analysis_status ? ai : null);
  const aiStatusText = ai.status || ai.ai_analysis_status || 'NOT_REQUESTED';
  const aiReady = Boolean(state.config?.hasOpenAiKey);
  const aiButtonText = aiData ? t2('Zregeneruj AI-analizę', 'Перегенерировать AI-анализ') : t2('Uruchom AI-analizę', 'Запустить AI-анализ');

  return `
    <section class="detail-section ai-panel">
      <h3>${t2('AI-analiza i rekomendacje', 'AI-анализ и рекомендации')}</h3>
      <p><strong>${t2('Status:', 'Статус:')}</strong> ${escapeHtml(aiStatusText)}</p>
      <p class="muted-text">${t2('OpenAI jest używane tylko tutaj, wewnątrz karty firmy. Nie łączy się z internetem: na wejściu dostaje już zebrane fakty, źródła, kontakty i wynik sprawdzenia strony.', 'OpenAI используется только здесь, внутри карточки компании. В интернет он не ходит: на вход получает уже собранные факты, источники, контакты и результат проверки сайта.')}</p>
      <button id="siteAiButton" class="copy-button ai-action-button" type="button" ${aiReady && aiStatusText !== 'PROCESSING' ? '' : 'disabled'}>
        <i data-lucide="sparkles"></i>
        ${escapeHtml(aiReady ? aiButtonText : t2('Potrzebny OPENAI_API_KEY', 'Нужен OPENAI_API_KEY'))}
      </button>
      ${ai.error ? `<p class="error-text">${escapeHtml(ai.error)}</p>` : ''}
      ${aiData ? renderAiAnalysisBlock(aiData) : ''}
      ${renderAiCompanyProfileBlock(result)}
    </section>
  `;
}

// Compact summary of the AI company search profile (result.aiCompanyProfile,
// a separate pipeline from the aiSiteAnalysis block above) - renders nothing
// at all unless the profile actually finished (status === 'COMPLETED'), so a
// lead that was never run through AI search/enrich shows no extra section.
// Reuses the existing priority-badge/score-badge/muted-text/ai-result classes
// (see renderAiAnalysisBlock() above and scoreClass()) rather than new CSS.
function renderAiCompanyProfileBlock(result) {
  const profile = result?.aiCompanyProfile;
  if (!profile || profile.status !== 'COMPLETED') return '';
  const data = profile.data || {};
  const scores = data.scores || {};
  const priority = String(scores.recommended_priority || '').toUpperCase();
  const overallScore = Number(scores.overall_priority_score ?? 0);
  const services = Array.isArray(data.services) ? data.services : [];
  const topServiceNames = services
    .map((service) => (typeof service === 'string' ? service : service?.name))
    .filter(Boolean)
    .slice(0, 5);
  const outreach = data.cold_outreach || {};

  return `
    <div class="ai-result ai-company-profile">
      <h4>${escapeHtml(trs('ai_profile_title'))}</h4>
      <p>
        <span class="priority-badge ${escapeAttribute(priority.toLowerCase().replace('+', ''))}">${escapeHtml(priority || '-')}</span>
        <span class="score-badge ${scoreClass(overallScore)}">${escapeHtml(String(overallScore || '-'))}</span>
      </p>
      ${scores.analyst_summary ? `<p>${escapeHtml(scores.analyst_summary)}</p>` : ''}
      ${topServiceNames.length ? `<h4>${escapeHtml(trs('ai_profile_top_services'))}</h4>${listItems(topServiceNames)}` : ''}
      ${outreach.suggested_opening ? `<p><strong>${escapeHtml(trs('ai_profile_opening'))}:</strong> ${escapeHtml(outreach.suggested_opening)}</p>` : ''}
      ${outreach.proposed_offer ? `<p><strong>${escapeHtml(trs('ai_profile_offer'))}:</strong> ${escapeHtml(outreach.proposed_offer)}</p>` : ''}
      ${data.verification_status ? `<p class="muted-text"><strong>${escapeHtml(trs('ai_profile_verification'))}:</strong> ${escapeHtml(data.verification_status)}</p>` : ''}
    </div>
  `;
}

function renderAiAnalysisBlock(ai) {
  return `
    <div class="ai-result">
      <p><strong>${t2('Potencjał:', 'Потенциал:')}</strong> ${escapeHtml(ai.commercial_potential || 'UNKNOWN')} · <strong>${t2('Typ:', 'Тип:')}</strong> ${escapeHtml(ai.recommended_site_type || '-')} · <strong>${t2('Rozmiar:', 'Размер:')}</strong> ${escapeHtml(ai.recommended_page_count || '-')}</p>
      <p><strong>${t2('Krótko:', 'Кратко:')}</strong> ${escapeHtml(ai.company_summary || '-')}</p>
      <p><strong>${t2('Główny problem:', 'Главная проблема:')}</strong> ${escapeHtml(ai.main_problem || '-')}</p>
      <h4>${t2('Dlaczego potrzebna jest strona', 'Почему нужен сайт')}</h4>
      ${listItems(ai.why_website_needed)}
      <h4>${t2('Co rozwiąże strona', 'Что решит сайт')}</h4>
      ${listItems(ai.problems_solved_by_site)}
      <h4>${t2('Struktura', 'Структура')}</h4>
      ${listItems(ai.recommended_structure)}
      <h4>${t2('Materiały już są', 'Материалы уже есть')}</h4>
      ${listItems(ai.existing_materials)}
      <h4>${t2('Czego brakuje', 'Чего не хватает')}</h4>
      ${listItems(ai.missing_materials)}
      <p><strong>${t2('Oferta:', 'Оффер:')}</strong> ${escapeHtml(ai.recommended_offer || '-')}</p>
      <div class="message-box">
        <p>${escapeHtml(ai.personal_argument || '-')}</p>
        <button class="copy-button" type="button" data-copy="${escapeAttribute(ai.personal_argument || '')}">
          <i data-lucide="copy"></i>
          ${t2('Kopiuj argument', 'Копировать аргумент')}
        </button>
      </div>
    </div>
  `;
}

function renderSourcesTab(result) {
  const input = result.input || {};
  const resolution = result.websiteResolution || {};
  const candidates = resolution.candidates || [];
  return `
    <section class="detail-section">
      <h3>${t2('Źródła', 'Источники')}</h3>
      <p><strong>${t2('Źródło:', 'Источник:')}</strong> ${escapeHtml(displaySourceLabel(input.source || '-'))}</p>
      <p><strong>${t2('Profil:', 'Профиль:')}</strong> ${linkOrDash(input.source_profile)}</p>
      <p><strong>${t2('Kandydaci domeny:', 'Кандидаты домена:')}</strong></p>
      <ul>${candidates.length ? candidates.map((candidate) => `<li>${linkOrDash(candidate.url)} · ${escapeHtml(checkKeyLabel(candidate.source || ''))} · ${escapeHtml(String(candidate.confidence || 0))}</li>`).join('') : `<li>${t2('Brak kandydatów', 'Нет кандидатов')}</li>`}</ul>
    </section>
  `;
}

function renderHistoryTab(result) {
  const ai = result.aiSiteAnalysis || { status: 'NOT_REQUESTED' };
  const aiData = ai.data || (ai.ai_analysis_status ? ai : null);
  return `
    <section class="detail-section">
      <h3>${t2('Historia', 'История')}</h3>
      <p><strong>${t2('Status AI:', 'AI-статус:')}</strong> ${escapeHtml(ai.status || ai.ai_analysis_status || 'NOT_REQUESTED')}</p>
      <p><strong>${t2('Wersja AI:', 'Версия AI:')}</strong> ${escapeHtml(String(ai.version || aiData?.ai_analysis_version || 1))}</p>
      <p><strong>${t2('Przeanalizowano:', 'Проанализировано:')}</strong> ${escapeHtml(ai.analyzed_at || aiData?.ai_analyzed_at || '-')}</p>
      <p><strong>${t2('Wersja danych firmy:', 'Версия данных компании:')}</strong> ${escapeHtml(String(ai.company_data_version || aiData?.company_data_version || 1))}</p>
    </section>
  `;
}

function bindDetailActions(result) {
  els.detailContent.querySelectorAll('[data-detail-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.detailTab = button.dataset.detailTab;
      renderTabbedDetail();
    });
  });

  els.detailContent.querySelector('#siteAiButton')?.addEventListener('click', () => runSiteAiAnalysis(result.id));
  els.detailContent.querySelector('#leadWorkflowStatus')?.addEventListener('change', (event) => {
    updateLeadWorkflowStatus(result, event.target.value);
  });
  els.detailContent.querySelector('#leadCrmStatus')?.addEventListener('change', (event) => {
    updateCrmStatus(result, event.target.value);
  });
  els.detailContent.querySelector('#leadSaveToggle')?.addEventListener('click', () => toggleSaveCompany(result));
  els.detailContent.querySelector('#leadAddToFolder')?.addEventListener('click', async () => {
    if (!state.foldersLoaded) await loadFolders();
    const names = state.folders.map((folder) => `${folder.name} [${folder.id}]`).join('\n');
    const prompt =
      currentLanguage === 'pl'
        ? `Wpisz ID folderu (zostaw puste dla "bez folderu"):\n${names || '(brak folderów - utwórz w zakładce Zapisane)'}`
        : `Введите ID папки (пусто = без папки):\n${names || '(папок пока нет - создайте их во вкладке Zapisane)'}`;
    const folderId = window.prompt(prompt, '');
    if (folderId === null) return;
    addResultToFolder(result, folderId.trim());
  });
  els.detailContent.querySelector('#leadReturnToPool')?.addEventListener('click', () => returnLeadToPoolAction(result));
  els.detailContent.querySelector('#leadCommentSubmit')?.addEventListener('click', () => {
    const input = els.detailContent.querySelector('#leadCommentInput');
    if (!input) return;
    const text = input.value;
    input.value = '';
    submitComment(result, text);
  });
  els.detailContent.querySelectorAll('[data-delete-comment]').forEach((button) => {
    button.addEventListener('click', () => deleteCommentAction(result, button.dataset.deleteComment));
  });

  els.detailContent.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.copy || '');
      button.textContent = t2('Skopiowano', 'Скопировано');
      setTimeout(() => {
        button.innerHTML = `<i data-lucide="copy"></i>${t2('Kopiuj', 'Копировать')}`;
        renderIcons();
      }, 1200);
    });
  });
}

async function updateLeadWorkflowStatus(result, status) {
  const companyId = leadCompanyId(result);
  if (!companyId) return;
  const response = await fetch(apiUrl(`/api/leads/${encodeURIComponent(companyId)}/status`), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-worker-id': getWorkerId(),
      ...authHeaders()
    },
    body: JSON.stringify({ status, workerId: getWorkerId() })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Never surface data.error directly - it can be a raw untranslated
    // backend string (e.g. "Worker identity is required." for an admin-role
    // session with no workerId, see Finding 9). Log it for debugging and show
    // only the localized generic fallback, same as the Saved/folders actions.
    console.error('updateLeadWorkflowStatus failed:', data.error);
    setStatus(t2('Nie udało się zapisać statusu leada.', 'Не удалось сохранить статус лида.'), 'warn');
    return;
  }
  result.lead_status = data.company?.status || status;
  if (result.input) result.input.lead_status = data.company?.status || status;
  renderResults();
  renderTabbedDetail();
  setStatus(`${t2('Status zapisany', 'Статус сохранен')}: ${leadStatusLabel(status)}`, 'ok');
}

async function runSiteAiAnalysis(resultId) {
  const result = state.results.find((item) => item.id === resultId);
  if (!result) return;
  if (!state.config?.hasOpenAiKey) {
    result.aiSiteAnalysis = { status: 'FAILED', error: 'OPENAI_API_KEY не указан в .env.' };
    renderTabbedDetail();
    return;
  }

  result.aiSiteAnalysis = {
    status: 'PROCESSING',
    version: result.aiSiteAnalysis?.version || 1,
    analyzed_at: result.aiSiteAnalysis?.analyzed_at || '',
    company_data_version: 1
  };
  renderTabbedDetail();

  try {
    const response = await fetch(apiUrl('/api/ai/site-analysis'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-worker-id': getWorkerId(),
        ...authHeaders()
      },
      body: JSON.stringify({
        result: compactResultForAiRequest(result),
        model: els.modelInput.value.trim(),
        language: currentLanguage
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка AI-анализа.');

    result.aiSiteAnalysis = {
      status: 'COMPLETED',
      version: data.aiAnalysis?.ai_analysis_version || 1,
      analyzed_at: data.aiAnalysis?.ai_analyzed_at || new Date().toISOString(),
      company_data_version: data.aiAnalysis?.company_data_version || 1,
      data: data.aiAnalysis
    };
  } catch (error) {
    result.aiSiteAnalysis = {
      status: 'FAILED',
      version: 1,
      analyzed_at: '',
      company_data_version: 1,
      error: error.message || 'Ошибка AI-анализа.'
    };
  }

  renderTabbedDetail();
}

function compactResultForAiRequest(result) {
  return {
    input: result.input,
    websiteResolution: result.websiteResolution,
    heuristic: result.heuristic,
    analysis: result.analysis,
    parsed: {
      ok: Boolean(result.parsed?.ok),
      error: result.parsed?.error || '',
      normalizedUrl: result.parsed?.normalizedUrl || '',
      signals: result.parsed?.signals || {}
    }
  };
}

function listItems(items) {
  const values = Array.isArray(items) && items.length ? items : ['UNKNOWN'];
  return `<ul>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function linkOrDash(value) {
  if (!value) return '-';
  const url = String(value);
  if (!/^https?:\/\//i.test(url)) return escapeHtml(url);
  return `<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(shortUrl(url))}</a>`;
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function exportCsv() {
  const results = getFilteredResults();
  const rows = [
    [
      'company',
      'niche',
      'district',
      'phone',
      'email',
      'website_status',
      'website_confidence',
      'found_website_url',
      'domain_verification_score',
      'lead_score',
      'lead_category',
      'category_relevance_score',
      'category_match',
      'should_call',
      'priority',
      'recommended_package',
      'main_problem',
      'proposed_solution',
      'requires_manual_review',
      'first_message_ru',
      'first_message_pl'
    ],
    ...results.map((result) => [
      result.input.company,
      result.input.niche,
      result.input.district,
      result.input.phone,
      result.input.email,
      result.analysis.website_status,
      result.analysis.website_confidence,
      result.websiteResolution?.selectedUrl || '',
      result.websiteResolution?.domainVerification?.score || 0,
      result.analysis.lead_score,
      result.analysis.lead_category,
      result.analysis.category_relevance_score || '',
      result.analysis.category_match || '',
      result.analysis.should_call === false ? 'false' : 'true',
      result.analysis.priority,
      result.analysis.recommended_package,
      result.analysis.main_problem,
      result.analysis.proposed_solution,
      result.analysis.requires_manual_review,
      result.analysis.first_message_ru,
      result.analysis.first_message_pl
    ])
  ];

  downloadText('aura-parser-results.csv', rows.map(csvLine).join('\n'), 'text/csv');
}

function exportJson() {
  downloadText('aura-parser-results.json', JSON.stringify(getFilteredResults(), null, 2), 'application/json');
}

function csvLine(row) {
  return row
    .map((cell) => {
      const value = String(cell ?? '');
      return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    })
    .join(',');
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function statusClass(status) {
  if (['NO_WEBSITE_CONFIRMED', 'SOCIAL_ONLY', 'DIRECTORY_ONLY', 'BROKEN_WEBSITE', 'FREE_SUBDOMAIN'].includes(status)) {
    return 'target';
  }
  if (status === 'WEBSITE_FOUND') return 'found';
  if (status === 'ONE_PAGE_PLACEHOLDER') return 'weak';
  return 'uncertain';
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return `${Math.round(number * 100)}%`;
}

function setStatus(text, mode) {
  els.runStatus.textContent = text;
  els.runStatus.style.color = mode === 'warn' ? '#b91c1c' : mode === 'ok' ? '#15803d' : '#64717a';
}

function setDiscoverStatus(text, mode) {
  els.discoverStatus.textContent = text;
  els.discoverStatus.style.color = mode === 'warn' ? '#b91c1c' : mode === 'ok' ? '#15803d' : '#64717a';
}

function shortUrl(value) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`;
  } catch {
    return value || '-';
  }
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

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// Invoked at the bottom of the file (not at the top) so that every value it
// transitively depends on — apiBase/getApiBase/apiUrl in particular — has
// already been declared and initialized by the time this runs. Calling this
// before `let apiBase = resolveApiBase();` executes throws a temporal-dead-zone
// ReferenceError inside fetchSessionProfile()'s try/catch, which used to be
// silently swallowed and made every returning worker with a valid token look
// logged-out on each page load.
bootstrapSession().then((ok) => {
  if (ok) init();
});
