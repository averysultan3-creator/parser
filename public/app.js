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
  detailTab: 'overview',
  filters: {
    text: '',
    site: 'no_site',
    size: 'all',
    priority: 'all',
    minScore: 0
  }
};

const API_BASE_STORAGE_KEY = 'parserApiBase';
const TUNNEL_BOOTSTRAP_RETRIES = 4;
const TUNNEL_BOOTSTRAP_DELAY_MS = 1200;
const CONFIG_BOOTSTRAP_RETRIES = 6;
const CONFIG_BOOTSTRAP_DELAY_MS = 1500;
let configBootstrapTimer = null;
let configBootstrapAttempts = 0;

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

function resolveApiBase() {
  // 1) URL-параметр ?api=https://my-backend.example — сохраняется и используется дальше.
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
  if (window.location.protocol === 'file:') {
    return 'http://localhost:4317';
  }
  if (onPages) return '';
  // 2) Локально разрешаем сохранённый адрес backend.
  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (saved) {
      try {
        if (new URL(saved).origin === window.location.origin) return '';
      } catch {}
      return saved;
    }
  } catch {}
  // 3) По умолчанию локально пробуем localhost.
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
      if (await isApiBaseReachable(saved)) {
        setApiBase(saved, { persist: true });
        return saved;
      }
    }
  } catch {}

  if (!onPagesOrFile && window.location.protocol !== 'file:') {
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
  discoverCategoryPreset: document.querySelector('#discoverCategoryPreset'),
  customCategoryField: document.querySelector('#customCategoryField'),
  discoverNiche: document.querySelector('#discoverNiche'),
  discoverCountry: document.querySelector('#discoverCountry'),
  discoverCity: document.querySelector('#discoverCity'),
  discoverDistrict: document.querySelector('#discoverDistrict'),
  discoverRadius: document.querySelector('#discoverRadius'),
  discoverLimit: document.querySelector('#discoverLimit'),
  discoverSource: document.querySelector('#discoverSource'),
  allSourcesButton: document.querySelector('#allSourcesButton'),
  discoverButton: document.querySelector('#discoverButton'),
  discoverStatus: document.querySelector('#discoverStatus'),
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
  resultFilterSite: document.querySelector('#resultFilterSite'),
  resultFilterSize: document.querySelector('#resultFilterSize'),
  resultFilterPriority: document.querySelector('#resultFilterPriority'),
  resultFilterMinScore: document.querySelector('#resultFilterMinScore'),
  quickFindSitesButton: document.querySelector('#quickFindSitesButton'),
  resetFiltersButton: document.querySelector('#resetFiltersButton'),
  filterSummary: document.querySelector('#filterSummary'),
  sidebarSiteFilter: document.querySelector('#sidebarSiteFilter'),
  sidebarMinScore: document.querySelector('#sidebarMinScore'),
  sidebarHasSocial: document.querySelector('#sidebarHasSocial'),
  sidebarHasPhone: document.querySelector('#sidebarHasPhone'),
  sidebarHasEmail: document.querySelector('#sidebarHasEmail'),
  exportCsvButton: document.querySelector('#exportCsvButton'),
  headerExportCsvButton: document.querySelector('#headerExportCsvButton'),
  exportJsonButton: document.querySelector('#exportJsonButton'),
  resultsBody: document.querySelector('#resultsBody'),
  detailTitle: document.querySelector('#detailTitle'),
  detailPriority: document.querySelector('#detailPriority'),
  detailContent: document.querySelector('#detailContent'),
  viewTabResults: document.querySelector('#viewTabResults'),
  viewTabHistory: document.querySelector('#viewTabHistory'),
  resultsView: document.querySelector('#resultsView'),
  historyView: document.querySelector('#historyView'),
  historyBody: document.querySelector('#historyBody'),
  refreshHistoryButton: document.querySelector('#refreshHistoryButton')
};

const sampleCsv = `company,niche,district,phone,email,website_url,source_profile,instagram,review_count,rating,last_activity,services,portfolio_available,physical_location,team_size,notes
Detailing Premium Warsaw,Auto detailing / PDR,Wola,+48500111222,detailingpremium@gmail.com,,https://booksy.com/pl-pl/demo,https://instagram.com/demo,140,4.8,2026-06-10,"powłoka ceramiczna;korekta lakieru;detailing wnętrza",true,true,2-5,"active Instagram, real photos, premium services"
Klima Expert,Klimatyzacja,Mokotow,+48500999888,kontakt@klimaexpert.pl,,https://facebook.com/demo,,32,4.6,2026-05-28,"montaż klimatyzacji;serwis klimatyzacji",true,true,3,"works across Warsaw, prices from visible in posts"
Old Site Remonty,Wykończenia wnętrz,Ursynow,+48500777777,biuro@example.com,https://example.com,,15,4.2,2026-04-01,"remont łazienki;wykończenia pod klucz",true,true,2-4,"has website but it looks like placeholder"`;

const categoryOptions = [
  { value: 'Klimatyzacja', label: 'Кондиционирование' },
  { value: 'Auto detailing', label: 'Автодетейлинг' },
  { value: 'Remonty i wykończenia wnętrz', label: 'Ремонт и отделка интерьеров' },
  { value: 'Medycyna estetyczna', label: 'Эстетическая медицина' },
  { value: 'Stomatologia', label: 'Стоматология' },
  { value: 'Fizjoterapia', label: 'Физиотерапия' },
  { value: 'Salon kosmetyczny', label: 'Косметологический салон' },
  { value: 'Księgowość', label: 'Бухгалтерия' },
  { value: 'Przedszkole prywatne', label: 'Частный детский сад' },
  { value: 'Auto serwis', label: 'Автосервис' },
  { value: 'Fotowoltaika', label: 'Солнечные панели' },
  { value: 'Catering dietetyczny', label: 'Диетический кейтеринг' },
  { value: 'Law firm / kancelaria prawna', label: 'Юридическая фирма' },
  { value: 'Biuro rachunkowe', label: 'Бухгалтерское бюро' },
  { value: 'Architekt wnętrz', label: 'Дизайнер интерьеров' },
  { value: 'Projektowanie ogrodów', label: 'Ландшафтный дизайн' },
  { value: 'Instalacje elektryczne', label: 'Электромонтаж' },
  { value: 'Hydraulik', label: 'Сантехник' },
  { value: 'Ogrzewanie i pompy ciepła', label: 'Отопление и тепловые насосы' },
  { value: 'Serwis AGD', label: 'Ремонт бытовой техники' },
  { value: 'Sprzątanie biur', label: 'Уборка офисов' },
  { value: 'Pralnia', label: 'Прачечная' },
  { value: 'Fryzjer', label: 'Парикмахер' },
  { value: 'Barber', label: 'Барбершоп' },
  { value: 'Studio paznokci', label: 'Ногтевая студия' },
  { value: 'Spa i masaż', label: 'Спа и массаж' },
  { value: 'Trener personalny', label: 'Персональный тренер' },
  { value: 'Szkoła językowa', label: 'Языковая школа' },
  { value: 'Korepetycje', label: 'Репетиторы' },
  { value: 'Szkoła tańca', label: 'Школа танцев' },
  { value: 'Restauracja', label: 'Ресторан' },
  { value: 'Kawiarnia', label: 'Кофейня' },
  { value: 'Hotel / apartamenty', label: 'Отель / апартаменты' },
  { value: 'Event venue', label: 'Площадка для мероприятий' },
  { value: 'Wedding services', label: 'Свадебные услуги' },
  { value: 'Fotograf', label: 'Фотограф' },
  { value: 'Drukarnia', label: 'Типография' },
  { value: 'Meble na wymiar', label: 'Мебель на заказ' },
  { value: 'Rolety i okna', label: 'Роллеты и окна' },
  { value: 'Bramy garażowe', label: 'Гаражные ворота' },
  { value: 'Ochrona', label: 'Охрана' },
  { value: 'Przeprowadzki', label: 'Переезды' },
  { value: 'Magazyny self storage', label: 'Self-storage склады' },
  { value: 'Weterynarz', label: 'Ветеринар' },
  { value: 'Gabinet psychologiczny', label: 'Психологический кабинет' },
  { value: 'Dietetyk', label: 'Диетолог' },
  { value: 'Rehabilitacja', label: 'Реабилитация' },
  { value: 'Klinika prywatna', label: 'Частная клиника' },
  { value: 'Sklep specjalistyczny', label: 'Специализированный магазин' },
  { value: 'Serwis rowerowy', label: 'Велосервис' },
  { value: 'Detailing motocykli', label: 'Мотодетейлинг' },
  { value: 'Wulkanizacja', label: 'Шиномонтаж' },
  { value: 'Tuning samochodowy', label: 'Автотюнинг' },
  { value: 'Szkoła jazdy', label: 'Автошкола' },
  { value: 'Nieruchomości', label: 'Недвижимость' },
  { value: 'Ubezpieczenia', label: 'Страхование' }
];

const topCategories = categoryOptions.slice(0, 12);
const allCategories = categoryOptions;
const categoryLabelMap = new Map(
  categoryOptions.map((option) => [normalizeLookupValue(option.value), option.label])
);

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

function displayCategory(value) {
  return categoryLabelMap.get(normalizeLookupValue(value)) || String(value || '').trim() || '-';
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
      if (part === 'all_sources') return 'Смарт-поиск';
      if (part === 'maps_api' || part.startsWith('google_places')) return 'Google Places API';
      if (part === 'amazon_location' || part.startsWith('amazon_location')) return 'Amazon Location API';
      if (part === 'internet' || part.startsWith('public_search_')) return 'Интернет и публичные профили';
      if (part === 'registries' || part.startsWith('public_registry') || part.startsWith('ceidg')) return 'Реестры';
      if (part === 'directories') return 'Каталоги';
      if (part === 'booking') return 'Booksy / запись';
      if (part === 'social') return 'Соцсети';
      if (part === 'cross_verification') return 'Сверка источников';
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

function applyStaticCopy() {
  els.discoverButton.innerHTML = '<i data-lucide="radar"></i>Найти компании и сверить';
  els.analyzeButton.innerHTML = '<i data-lucide="list-checks"></i>Проверить CSV / текущий список';
  els.runStatus.textContent =
    'Поиск компаний уже делает пред-проверку сайтов. Эта кнопка нужна для CSV-импорта и ручного повторного запуска проверки.';
  els.discoverStatus.textContent =
    'Смарт-поиск сначала собирает компании, затем дополняет и сверяет контакты, сайт и сигналы по другим источникам.';

  if (els.allSourcesButton) {
    els.allSourcesButton.classList.add('hidden-field');
    els.allSourcesButton.setAttribute('aria-hidden', 'true');
    els.allSourcesButton.tabIndex = -1;
  }

  const sourceLabels = {
    all_sources: 'Смарт-поиск: Google -> Amazon -> реестры -> веб',
    amazon_location: 'Amazon Location API',
    maps_api: 'Google Places API',
    internet: 'Интернет и публичные профили',
    registries: 'CEIDG / госреестры',
    directories: 'Каталоги и сервисы',
    booking: 'Booksy / запись',
    social: 'Соцсети'
  };

  Array.from(els.discoverSource.options).forEach((option) => {
    option.textContent = sourceLabels[option.value] || option.textContent;
  });
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
    <strong>Открыт запуск из истории</strong>
    <span>${escapeHtml(parts.join(' · '))}</span>
  `;
}

init();

async function init() {
  setDiscoverStatus('Подключаю backend и читаю tunnel.json...', 'work');
  await bootstrapApiBase();
  ensureResultsContext();
  populateCategoryPreset();
  els.discoverCategoryPreset.value = 'cat:Klimatyzacja';
  els.sidebarHasSocial.checked = false;
  els.sidebarHasPhone.checked = true;
  els.sidebarHasEmail.checked = false;
  els.sidebarSiteFilter.value = 'no_site';
  els.resultFilterSite.value = 'no_site';
  applyStaticCopy();
  await loadConfig();
  bindEvents();
  els.csvInput.value = sampleCsv;
  renderResultsContext();
  renderIcons();
}

function populateCategoryPreset() {
  const topOptions = topCategories
    .map((category) => `<option value="cat:${escapeAttribute(category.value)}">${escapeHtml(category.label)}</option>`)
    .join('');
  const allOptions = allCategories
    .filter((category) => !topCategories.some((topCategory) => topCategory.value === category.value))
    .map((category) => `<option value="cat:${escapeAttribute(category.value)}">${escapeHtml(category.label)}</option>`)
    .join('');

  els.discoverCategoryPreset.innerHTML = `
    <option value="top_all">Топ-категории для сайтов</option>
    <option value="all_categories">Все категории</option>
    <option value="custom">Своя категория</option>
    <optgroup label="Топ-категории">${topOptions}</optgroup>
    <optgroup label="Все категории">${allOptions}</optgroup>
  `;
}

async function loadConfig() {
  try {
    const response = await fetch(apiUrl('/api/config'));
    if (!response.ok) throw new Error(`Config API returned ${response.status}`);
    state.config = await response.json();
    clearConfigBootstrapRetry();
    els.modelInput.value = state.config.defaultModel || '';
    els.searchModelInput.value = state.config.searchModel || '';
    els.useAi.checked = false;
    els.useWebSearch.checked = false;
    els.useAi.disabled = true;
    els.useWebSearch.disabled = true;
    const openaiReady = Boolean(state.config.hasOpenAiKey);
    const amazonReady = Boolean(state.config.registry?.amazonLocationConfigured);
    const googleReady = Boolean(state.config.registry?.googlePlacesConfigured);
    const ceidgReady = Boolean(state.config.registry?.ceidgConfigured);
    const internetReady = Boolean(state.config.internetSearchConfigured);
    const discoveryReady = amazonReady || googleReady || ceidgReady || internetReady;
    els.discoverButton.disabled = !discoveryReady;
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
        ? 'Поиск готов: собирает базу для прозвона через публичные реестры, каталоги, интернет, Amazon/Google если ключи включены.'
        : 'Поиск выключен: backend не отвечает. Запустите локальный сервер, CSV-проверка сайтов отдельно работает.',
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
    els.discoverButton.disabled = true;
    if (els.allSourcesButton) els.allSourcesButton.disabled = true;
    setPill(els.apiStatus, 'Config API offline', false);
    setPill(els.webSearchStatus, 'Crawler unknown', false);
    setPill(els.registryStatus, 'Sources unknown', false);
    setDiscoverStatus(
      getApiBase().includes('localhost')
        ? 'Не могу прочитать /api/config. Откройте http://localhost:4317/ и проверьте, что npm run dev запущен. С другого компьютера укажите публичный адрес backend ниже.'
        : `Backend по адресу ${getApiBase() || window.location.origin} не отвечает. Проверьте адрес сервера ниже.`,
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

function renderConfigDiagnostics({ openaiReady, amazonReady, googleReady, ceidgReady, internetReady, discoveryReady }) {
  const rows = [
    {
      ok: openaiReady,
      title: 'OpenAI API',
      text: openaiReady ? 'подключен, AI-анализ карточки работает' : 'нет OPENAI_API_KEY'
    },
    {
      ok: amazonReady,
      title: 'Amazon Location API',
      text: amazonReady
        ? `key found; Amazon Places SearchText is used first (${state.config.registry?.amazonLocationRegion || 'eu-north-1'})`
        : 'no AWS_LOCATION_API_KEY; Amazon Location search is off'
    },
    {
      ok: googleReady,
      title: 'Google Places API',
      text: googleReady ? 'подключен, поиск компаний в Google Maps работает' : 'нет GOOGLE_PLACES_API_KEY, поиск из Google Maps выключен'
    },
    {
      ok: internetReady,
      title: 'Интернет-поиск',
      text: internetReady ? 'работает через OpenAI web search без Google Maps API' : 'нет OPENAI_API_KEY, интернет-поиск выключен'
    },
    {
      ok: ceidgReady,
      title: 'CEIDG / реестры',
      text: ceidgReady ? 'подключен, поиск по реестрам доступен' : 'нет CEIDG_API_TOKEN, реестры выключены'
    },
    {
      ok: true,
      title: 'Проверка сайтов',
      text: 'работает через backend: парсер может заходить на сайты из CSV/Google Places и проверять домены'
    }
  ];

  rows[2].text = googleReady ? 'key found; Google Maps is tested on search run' : 'no GOOGLE_PLACES_API_KEY; Google Maps search is off';
  rows[3].title = 'Internet search';
  rows[3].text = internetReady ? 'public internet fallback works without OpenAI and without Google Maps' : 'internet fallback is off';
  rows[4].title = 'CEIDG / public registries';
  rows[4].ok = ceidgReady || internetReady;
  rows[4].text = ceidgReady
    ? 'CEIDG API token found; official API search is available'
    : 'no CEIDG token; uses public CEIDG/registry web search and then parses contacts';

  els.configDiagnostics.innerHTML = `
    <div class="config-diagnostics-title">${discoveryReady ? 'Источники готовы' : 'Нужно подключить источники поиска'}</div>
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
    <div class="config-diagnostics-title">Ошибка подключения к backend</div>
    <div class="config-diagnostic warn">
      <strong>Config API</strong>
      <span>${escapeHtml(message)}. Текущий адрес backend: ${escapeHtml(currentBackend)}.</span>
      <span>Локально: запустите сервер через npm run dev и открывайте http://localhost:4317/. С другого компьютера через GitHub Pages нужен публичный адрес backend (например, туннель cloudflared/ngrok): введите его ниже или откройте страницу с параметром ?api=https://адрес.</span>
    </div>
    <div class="api-base-form">
      <input id="apiBaseInput" type="text" placeholder="https://адрес-вашего-backend" value="${escapeAttribute(getApiBase())}" />
      <button id="apiBaseSaveButton" type="button">Сохранить адрес и перезагрузить</button>
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
  els.discoverButton.addEventListener('click', runDiscovery);
  els.analyzeButton.addEventListener('click', runAnalysis);
  els.quickFindSitesButton.addEventListener('click', runAnalysis);
  els.resetFiltersButton.addEventListener('click', resetResultFilters);
  els.resultFilterText.addEventListener('input', updateResultFilters);
  els.resultFilterSite.addEventListener('change', updateResultFilters);
  els.resultFilterSize.addEventListener('change', updateResultFilters);
  els.resultFilterPriority.addEventListener('change', updateResultFilters);
  els.resultFilterMinScore.addEventListener('input', updateResultFilters);
  els.sidebarSiteFilter.addEventListener('change', syncSidebarFilters);
  els.sidebarMinScore.addEventListener('input', syncSidebarFilters);
  els.sidebarHasSocial.addEventListener('change', updateResultFilters);
  els.sidebarHasPhone.addEventListener('change', updateResultFilters);
  els.sidebarHasEmail.addEventListener('change', updateResultFilters);
  els.exportCsvButton.addEventListener('click', exportCsv);
  els.headerExportCsvButton.addEventListener('click', exportCsv);
  els.exportJsonButton.addEventListener('click', exportJson);
  els.viewTabResults.addEventListener('click', () => switchView('results'));
  els.viewTabHistory.addEventListener('click', () => switchView('history'));
  els.refreshHistoryButton.addEventListener('click', loadHistory);
}

function switchView(view) {
  const isHistory = view === 'history';
  els.viewTabResults.classList.toggle('active', !isHistory);
  els.viewTabHistory.classList.toggle('active', isHistory);
  els.resultsView.classList.toggle('hidden-field', isHistory);
  els.historyView.classList.toggle('hidden-field', !isHistory);
  if (isHistory && !state.historyLoaded) loadHistory();
}

async function loadHistory() {
  state.historyLoadingRunId = null;
  els.historyBody.innerHTML = '<tr class="empty-row"><td colspan="8">Загрузка истории...</td></tr>';
  try {
    const response = await fetch(apiUrl('/api/history/runs'));
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

function renderHistory(runs) {
  if (!runs.length) {
    els.historyBody.innerHTML = '<tr class="empty-row"><td colspan="8">История пуста. Запустите поиск компаний.</td></tr>';
    return;
  }

  els.historyBody.innerHTML = runs
    .map((run) => {
      const date = run.started_at ? new Date(run.started_at).toLocaleString() : '-';
      const location = [run.city, run.district].filter(Boolean).join(' · ') || '-';
      const statusClassName = ['completed', 'failed', 'discovering'].includes(run.status) ? run.status : 'discovering';
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
          <td><span class="history-row-status ${statusClassName}">${escapeHtml(run.status || '-')}</span></td>
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
    const response = await fetch(apiUrl(`/api/history/runs/${runId}`));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Не удалось открыть запуск.');

    const records = Array.isArray(data.companies) ? data.companies : [];
    if (!records.length) {
      state.historyLoadingRunId = null;
      renderHistory(state.historyRuns);
      setStatus('В этом запуске нет сохраненных компаний.', 'warn');
      return;
    }

    state.activeHistoryRun = data.run || { id: runId };
    state.historyLoadingRunId = null;
    els.csvInput.value = itemsToCsv(records.map((record) => ({ ...record.data, _companyId: record.id })));
    switchView('results');
    setStatus(`Открываю сохраненный запуск от ${new Date(data.run.started_at).toLocaleString()}...`, 'work');
    state.results = historyRecordsToResults(records);
    state.selectedId = state.results[0]?.id || null;
    state.detailTab = 'overview';
    // Reset all result filters when opening a saved history run. Otherwise the
    // sidebar's default "Есть телефон" checkbox (and any other filter left over
    // from a previous search) can silently hide every saved company, making the
    // history run look empty/broken even though it opened correctly.
    els.resultFilterText.value = '';
    els.resultFilterSite.value = 'all';
    els.sidebarSiteFilter.value = 'all';
    els.resultFilterSize.value = 'all';
    els.resultFilterPriority.value = 'all';
    els.resultFilterMinScore.value = '0';
    els.sidebarMinScore.value = '0';
    els.sidebarHasPhone.checked = false;
    els.sidebarHasSocial.checked = false;
    els.sidebarHasEmail.checked = false;
    state.filters = {
      text: '',
      site: 'all',
      size: 'all',
      priority: 'all',
      minScore: 0
    };
    renderResultsContext();
    renderHistory(state.historyRuns);
    renderResults();
    renderMetrics();
    renderDetail();
    els.exportCsvButton.disabled = false;
    els.headerExportCsvButton.disabled = false;
    els.exportJsonButton.disabled = false;
    setStatus(`Открыт запуск из истории: ${state.results.length} компаний.`, 'ok');

  } catch (error) {
    state.historyLoadingRunId = null;
    renderHistory(state.historyRuns);
    setStatus(error.message || 'Ошибка при открытии запуска.', 'warn');
  } finally {
    renderIcons();
  }
}

function handleCategoryPresetChange() {
  els.customCategoryField.classList.toggle('hidden-field', els.discoverCategoryPreset.value !== 'custom');
}

function syncSidebarFilters() {
  els.resultFilterSite.value = els.sidebarSiteFilter.value;
  els.resultFilterMinScore.value = els.sidebarMinScore.value;
  updateResultFilters();
}

function resetFiltersForDiscovery() {
  els.resultFilterText.value = '';
  els.resultFilterSite.value = 'all';
  els.sidebarSiteFilter.value = 'all';
  els.resultFilterSize.value = 'all';
  els.resultFilterPriority.value = 'all';
  els.resultFilterMinScore.value = '0';
  els.sidebarMinScore.value = '0';
  els.sidebarHasPhone.checked = false;
  els.sidebarHasSocial.checked = false;
  els.sidebarHasEmail.checked = false;
  state.filters = {
    text: '',
    site: 'all',
    size: 'all',
    priority: 'all',
    minScore: 0
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
}

function applyDiscoveryPreview(companies) {
  const previewResults = companiesToPreviewResults(companies);
  setCurrentResults(previewResults);
}

async function fetchDiscoveryJob(jobId) {
  const response = await fetch(apiUrl(`/api/discover/jobs/${jobId}`));
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка чтения статуса поиска.');
  return data;
}

function buildDiscoveryStatusText(job) {
  const foundCount = job?.progress?.foundCount ?? job?.companies?.length ?? 0;
  const message = String(job?.progress?.message || '').trim();
  const niche = displayCategory(job?.progress?.currentNiche || '');
  const source = displaySourceLabel(job?.progress?.currentSource || job?.meta?.sourceFocus || '');
  const parts = [message || `Найдено ${foundCount}`];
  if (niche && niche !== '-') parts.push(niche);
  if (source && source !== '-') parts.push(source);
  return parts.join(' - ');
}

async function waitForDiscoveryCompletion(jobId) {
  while (state.discoveryJobId === jobId) {
    const job = await fetchDiscoveryJob(jobId);
    const companies = Array.isArray(job.companies) ? job.companies : [];

    if (companies.length) {
      els.csvInput.value = itemsToCsv(companies);
      applyDiscoveryPreview(companies);
    }

    const statusText = buildDiscoveryStatusText(job);
    setDiscoverStatus(statusText, job.status === 'failed' ? 'warn' : job.status === 'completed' ? 'ok' : 'work');
    setStatus(
      job.status === 'completed'
        ? `Поиск завершен. Найдено ${companies.length} компаний.`
        : `${statusText}. Промежуточные результаты уже доступны.`,
      job.status === 'failed' ? 'warn' : job.status === 'completed' ? 'ok' : 'work'
    );

    if (job.status === 'completed') {
      stopDiscoveryPolling();
      return job;
    }
    if (job.status === 'failed') {
      stopDiscoveryPolling();
      throw new Error(job.error || 'Ошибка поиска компаний.');
    }

    await new Promise((resolve) => {
      state.discoveryPollTimer = window.setTimeout(resolve, 1200);
    });
    state.discoveryPollTimer = null;
  }

  throw new Error('Поиск был остановлен.');
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
    setDiscoverStatus('Поиск уже выполняется, дождитесь завершения текущего запроса.', 'warn');
    return;
  }
  state.discoveryRunning = true;

  stopDiscoveryPolling();
  clearHistoryContext();
  switchView('results');
  state.historyLoaded = false;
  const discoveryReady = Boolean(
    state.config?.registry?.amazonLocationConfigured ||
      state.config?.registry?.googlePlacesConfigured ||
      state.config?.registry?.ceidgConfigured ||
      state.config?.internetSearchConfigured
  );
  if (!discoveryReady) {
    setDiscoverStatus('Backend не готов. Запустите локальный сервер; публичный поиск должен работать даже без CEIDG API.', 'warn');
    state.discoveryRunning = false;
    return;
  }


  const niches = selectedDiscoveryNiches();
  if (!niches.length) {
    setDiscoverStatus('Укажите категорию или выберите набор категорий.', 'warn');
    state.discoveryRunning = false;
    return;
  }

  resetFiltersForDiscovery();
  els.discoverButton.disabled = true;
  els.analyzeButton.disabled = true;
  els.quickFindSitesButton.disabled = true;
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
    `Ищу компании: ${niches.length === 1 ? displayCategory(niches[0]) : `${niches.length} категорий`}...`,
    'work'
  );

  try {
    const response = await fetch(apiUrl('/api/discover'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        niche: niches[0],
        niches,
        country: els.discoverCountry.value.trim(),
        city: els.discoverCity.value.trim(),
        district: els.discoverDistrict.value.trim(),
        radiusKm: Number(els.discoverRadius.value || 0) || undefined,
        limit: Math.min(Number(els.discoverLimit.value || 8), state.config?.maxItems || 100),
        sourceFocus: els.discoverSource.value
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка поиска компаний.');

    if (data.jobId) {
      state.discoveryJobId = data.jobId;
      const job = await waitForDiscoveryCompletion(data.jobId);
      const companies = Array.isArray(job.companies) ? job.companies : [];
      if (!companies.length) {
        await loadHistory();
        setDiscoverStatus('Компании не найдены. Попробуйте другую категорию или источник.', 'warn');
        setStatus('Поиск завершился без результатов.', 'warn');
        return;
      }

      els.csvInput.value = itemsToCsv(companies);
      setDiscoverStatus(`Найдено ${companies.length}. Проверяю сайты и готовлю карточки...`, 'work');
      setStatus(`Проверяю сайты у ${companies.length} компаний...`, 'work');
      const analyzed = await analyzeCompanies(companies);
      setCurrentResults(analyzed.results || companiesToPreviewResults(companies), { resetDetailTab: true });
      const warnings = Array.isArray(job.warnings) ? job.warnings.filter(Boolean).slice(0, 2) : [];
      const warningText = warnings.length ? ` Предупреждение: ${warnings.join(' ')}` : '';
      const withPhone = companies.filter((company) => company.phone).length;
      const withEmail = companies.filter((company) => company.email).length;
      const withSite = companies.filter((company) => company.website_url).length;
      setDiscoverStatus(
        `Найдено ${companies.length}: телефоны ${withPhone}, email ${withEmail}, сайты ${withSite}. CSV заполнен, можно запускать проверку сайтов.${warningText}`,
        warnings.length ? 'warn' : 'ok'
      );
      setStatus('Список компаний готов к анализу.', 'ok');
      await loadHistory();
      return;
    }

    const companies = data.companies || [];
    if (!companies.length) {
      await loadHistory();
      setDiscoverStatus('Компании не найдены. Попробуйте другую категорию или источник.', 'warn');
      return;
    }

    els.csvInput.value = itemsToCsv(companies);
    setDiscoverStatus(`Найдено ${companies.length}. Проверяю сайты и готовлю карточки...`, 'work');
    setStatus(`Проверяю сайты у ${companies.length} компаний...`, 'work');
    const analyzed = await analyzeCompanies(companies);
    state.results = analyzed.results || companiesToPreviewResults(companies);
    state.selectedId = state.results[0]?.id || null;
    state.detailTab = 'overview';
    renderResults();
    renderMetrics();
    renderDetail();
    els.exportCsvButton.disabled = false;
    els.headerExportCsvButton.disabled = false;
    els.exportJsonButton.disabled = false;
    const warnings = Array.isArray(data.warnings) ? data.warnings.filter(Boolean).slice(0, 2) : [];
    const warningText = warnings.length ? ` Предупреждение: ${warnings.join(' ')}` : '';
    const withPhone = companies.filter((company) => company.phone).length;
    const withEmail = companies.filter((company) => company.email).length;
    const withSite = companies.filter((company) => company.website_url).length;
    setDiscoverStatus(
      `Найдено ${companies.length}: телефоны ${withPhone}, email ${withEmail}, сайты ${withSite}. CSV заполнен, можно запускать проверку сайтов.${warningText}`,
      warnings.length ? 'warn' : 'ok'
    );
    setStatus('Список компаний готов к анализу.', 'ok');
  } catch (error) {
    setDiscoverStatus(error.message || 'Ошибка поиска компаний.', 'warn');
  } finally {
    stopDiscoveryPolling();
    state.discoveryRunning = false;
    els.discoverButton.disabled = !discoveryReady;
    els.analyzeButton.disabled = false;
    els.quickFindSitesButton.disabled = false;
    renderIcons();
  }
}

function selectedDiscoveryNiches() {
  const value = els.discoverCategoryPreset.value;
  if (value === 'top_all') return topCategories.map((category) => category.value);
  if (value === 'all_categories') return allCategories.map((category) => category.value);
  if (value === 'custom') return [els.discoverNiche.value.trim()].filter(Boolean);
  if (value.startsWith('cat:')) return [value.slice(4)];
  return [];
}

async function analyzeCompanies(items) {
  const response = await fetch(apiUrl('/api/analyze'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items,
      useAi: false,
      useWebSearch: false,
      model: els.modelInput.value.trim(),
      searchModel: els.searchModelInput.value.trim()
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Ошибка проверки сайтов.');
  return data;
}

async function runAnalysis() {
  stopDiscoveryPolling();
  clearHistoryContext();
  const items = parseInput(els.csvInput.value);
  if (!items.length) {
    setStatus('Добавьте CSV с компаниями.', 'warn');
    return;
  }

  els.analyzeButton.disabled = true;
  els.quickFindSitesButton.disabled = true;
  els.exportCsvButton.disabled = true;
  els.headerExportCsvButton.disabled = true;
  els.exportJsonButton.disabled = true;
  setStatus(`Проверяю ${items.length} компаний...`, 'work');

  try {
    const response = await fetch(apiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items,
        useAi: false,
        useWebSearch: false,
        model: els.modelInput.value.trim(),
        searchModel: els.searchModelInput.value.trim()
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка анализа.');

    state.results = data.results || [];
    state.selectedId = state.results[0]?.id || null;
    state.detailTab = 'overview';
    renderResults();
    renderMetrics();
    renderDetail();
    setStatus(`Готово: ${state.results.length} компаний, ${Math.round(data.meta.elapsedMs / 1000)} сек.`, 'ok');
  } catch (error) {
    setStatus(error.message || 'Ошибка анализа.', 'warn');
  } finally {
    els.analyzeButton.disabled = false;
    els.quickFindSitesButton.disabled = false;
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
  const score = Math.min(
    88,
    42 +
      (hasWebsite ? 10 : 0) +
      (hasSocial ? 10 : 0) +
      (input.phone ? 12 : 0) +
      (input.email ? 8 : 0) +
      (input.review_count ? 8 : 0) +
      (input.rating ? 4 : 0)
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
      priority: score >= 75 ? 'A' : score >= 55 ? 'B' : 'C',
      requires_manual_review: true,
      main_problem: 'Компания найдена. Нажмите "Найти сайты", чтобы проверить сайт, контакты и качество страницы.',
      recommended_website: 'Лендинг / Визитка',
      recommended_package: 'Проверить сайт, контакты, услуги, доверие и форму заявки.',
      business_activity: 'FOUND_BY_DISCOVERY',
      mini_audit_points: [],
      first_message_ru: '',
      first_message_pl: ''
    },
    aiSiteAnalysis: { status: 'NOT_REQUESTED' }
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

function companiesToPreviewResults(companies) {
  return companies.map((company, index) => buildPreviewResult(company, index));
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
      aiSiteAnalysis: record.aiSiteAnalysis || fallback.aiSiteAnalysis
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
    site: els.resultFilterSite.value,
    size: els.resultFilterSize.value,
    priority: els.resultFilterPriority.value,
    minScore: Number(els.resultFilterMinScore.value || 0)
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
}

function resetResultFilters() {
  els.resultFilterText.value = '';
  els.resultFilterSite.value = 'no_site';
  els.sidebarSiteFilter.value = 'no_site';
  els.resultFilterSize.value = 'all';
  els.resultFilterPriority.value = 'all';
  els.resultFilterMinScore.value = '0';
  els.sidebarMinScore.value = '0';
  els.sidebarHasPhone.checked = true;
  els.sidebarHasSocial.checked = false;
  els.sidebarHasEmail.checked = false;
  updateResultFilters();
}

function getFilteredResults() {
  return state.results.filter((result) => {
    const input = result.input || {};
    const analysis = result.analysis || {};
    const status = analysis.website_status || result.websiteResolution?.websiteStatus || 'UNCERTAIN';
    const size = companySize(result).key;
    const priority = analysis.lead_category === 'A+' ? 'A' : analysis.priority || analysis.lead_category || '';
    const score = Number(analysis.lead_score || 0);

    if (state.filters.minScore && score < state.filters.minScore) return false;
    if (state.filters.priority !== 'all' && priority !== state.filters.priority) return false;
    if (state.filters.size !== 'all' && size !== state.filters.size) return false;
    if (!siteFilterMatches(status, state.filters.site)) return false;
    if (els.sidebarHasSocial.checked && !hasAnySocial(input)) return false;
    if (els.sidebarHasPhone.checked && !input.phone) return false;
    if (els.sidebarHasEmail.checked && !input.email) return false;

    if (state.filters.text) {
      const haystack = [
        input.company,
        input.legal_name,
        input.niche,
        displayCategory(input.niche),
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
    WEBSITE_FOUND: 'Сайт найден',
    NO_WEBSITE_CONFIRMED: 'Нет сайта',
    SOCIAL_ONLY: 'Только соцсети',
    DIRECTORY_ONLY: 'Каталог',
    MARKETPLACE_ONLY: 'Маркетплейс',
    BROKEN_WEBSITE: 'Сайт сломан',
    FREE_SUBDOMAIN: 'Бесплатный домен',
    ONE_PAGE_PLACEHOLDER: 'На проверке',
    UNCERTAIN: 'На проверке'
  };
  return labels[status] || status || 'На проверке';
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
    return { key: 'large', label: 'Большая' };
  }
  if (teamNumber >= 3 || reviewCount >= 20 || servicesCount >= 3 || input.physical_location) {
    return { key: 'medium', label: 'Средняя' };
  }
  return { key: 'small', label: 'Маленькая' };
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
    els.resultsBody.innerHTML = '<tr class="empty-row"><td colspan="8">Результатов пока нет</td></tr>';
    els.filterSummary.textContent = 'Фильтры не применены';
    return;
  }

  const results = getFilteredResults();
  els.filterSummary.textContent = `Показано ${results.length} из ${state.results.length}`;

  if (!results.length) {
    els.resultsBody.innerHTML =
      '<tr class="empty-row"><td colspan="8">По фильтрам ничего не найдено. Отключите фильтры "Есть соц. профили", "Есть телефон" или снизьте score.</td></tr>';
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
          <td>${escapeHtml(displayCategory(input.niche || '-'))}</td>
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
    if (a.website_status === 'WEBSITE_FOUND') counts.withSite += 1;
    if (noSiteStatuses.has(a.website_status)) counts.noSite += 1;
    if (['UNCERTAIN', 'ONE_PAGE_PLACEHOLDER'].includes(a.website_status)) counts.review += 1;
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
    els.detailTitle.textContent = 'Выберите результат';
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
    els.detailTitle.textContent = 'Выберите результат';
    els.detailPriority.textContent = '-';
    els.detailPriority.className = 'priority-badge muted';
    els.detailContent.innerHTML =
      '<p class="muted-text">После массового парсинга здесь появится карточка компании. AI не запускается, пока вы не нажмете кнопку во вкладке "AI-анализ".</p>';
    return;
  }

  const a = result.analysis || {};
  const input = result.input || {};
  const resolution = result.websiteResolution || {};
  const signals = result.parsed?.signals || {};
  const title = input.company || signals.title || shortUrl(resolution.selectedUrl || input.website_url);
  const tabs = ['overview', 'sources', 'site', 'ai', 'history'];
  if (!tabs.includes(state.detailTab)) state.detailTab = 'overview';

  els.detailTitle.textContent = title || 'Компания';
  els.detailPriority.textContent = a.lead_category || a.priority || '-';
  els.detailPriority.className = `priority-badge ${String(a.priority || '').toLowerCase()}`;

  els.detailContent.innerHTML = `
    <div class="detail-tabs">
      ${detailTabButton('overview', 'Обзор')}
      ${detailTabButton('sources', 'Источники')}
      ${detailTabButton('site', 'Сайт')}
      ${detailTabButton('ai', 'AI-анализ')}
      ${detailTabButton('history', 'История')}
    </div>
    ${renderActiveDetailTab(result)}
  `;

  bindDetailActions(result);
  renderIcons();
}

function detailTabButton(id, label) {
  return `<button class="detail-tab ${state.detailTab === id ? 'active' : ''}" type="button" data-detail-tab="${id}">${escapeHtml(label)}</button>`;
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
  return `
    <div class="detail-card-grid">
      <section class="detail-card">
        <h3>Краткая информация</h3>
        <p>${escapeHtml(input.notes || a.main_problem || 'Локальная компания. Данные собраны из импорта, публичного профиля или подключенного источника.')}</p>
        <p class="muted-text">${escapeHtml([displayCategory(input.niche), input.city, input.district].filter(Boolean).join(' · ') || '-')}</p>
      </section>

      <section class="detail-card">
        <h3>Статус сайта</h3>
        <p><span class="status-tag ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></p>
        <p class="muted-text">${escapeHtml(a.main_problem || 'Статус рассчитан без AI по найденным сайтам, соцсетям и публичным профилям.')}</p>
      </section>

      <section class="detail-card">
        <h3>Контакты</h3>
        <p><i data-lucide="phone"></i>${escapeHtml(input.phone || '-')}</p>
        <p><i data-lucide="mail"></i>${escapeHtml(input.email || '-')}</p>
        <p><i data-lucide="map-pin"></i>${escapeHtml(input.address || [input.city, input.district].filter(Boolean).join(', ') || '-')}</p>
        <p>${linkOrDash(social.instagram || social.facebook || social.tiktok || input.source_profile)}</p>
      </section>

      <section class="detail-card">
        <h3>Услуги</h3>
        ${services.length ? `<ul>${services.slice(0, 6).map((service) => `<li>${escapeHtml(service)}</li>`).join('')}</ul>` : '<p class="muted-text">Услуги не указаны в источнике.</p>'}
      </section>

      <section class="detail-card">
        <h3>Сигналы активности</h3>
        <p><strong>Последняя активность:</strong> ${escapeHtml(input.last_activity || 'UNKNOWN')}</p>
        <p><strong>Отзывы:</strong> ${escapeHtml(String(input.review_count || 0))}; rating: ${escapeHtml(String(input.rating || 0))}</p>
        <p><strong>Размер:</strong> ${escapeHtml(size.label)} · ${escapeHtml(input.team_size || 'UNKNOWN')}</p>
      </section>

      <section class="detail-card">
        <h3>Рекомендованный тип сайта</h3>
        <p><strong>${escapeHtml(a.recommended_website || 'Лендинг / Визитка')}</strong></p>
        <p class="muted-text">${escapeHtml(a.recommended_package || 'Быстрый сайт под услуги, контакты, портфолио и заявки.')}</p>
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
      <h3>Факты о сайте</h3>
      <p><span class="status-tag ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></p>
      <p><strong>Уверенность:</strong> ${escapeHtml(formatPercent(a.website_confidence ?? resolution.websiteConfidence))}</p>
      <p><strong>Найденный домен:</strong> ${linkOrDash(resolution.selectedUrl || input.website_url)}</p>
      <p><strong>Подтверждение домена:</strong> ${escapeHtml(String(resolution.domainVerification?.score ?? 0))}/100 (${escapeHtml((resolution.domainVerification?.matched || []).join(', ') || 'no matches')})</p>
      <p><strong>Страниц:</strong> ${escapeHtml(String(signals.pageCount || 0))}; HTTPS: ${resolution.selectedUrl?.startsWith('https://') ? 'yes' : 'UNKNOWN'}; forms: ${escapeHtml(String(signals.forms || 0))}; photos: ${escapeHtml(String(signals.nonSvgImages || 0))}</p>
    </section>

    <section class="detail-section">
      <h3>Проверки без AI</h3>
      <ul>${Object.entries(resolution.checks_completed || {}).map(([key, value]) => `<li>${escapeHtml(key)}: ${value ? 'yes' : 'no'}</li>`).join('')}</ul>
    </section>

    <section class="detail-section">
      <h3>Автоматический вывод</h3>
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
  const aiButtonText = aiData ? 'Перегенерировать AI-анализ' : 'Запустить AI-анализ';

  return `
    <section class="detail-section ai-panel">
      <h3>AI-анализ и рекомендации</h3>
      <p><strong>Статус:</strong> ${escapeHtml(aiStatusText)}</p>
      <p class="muted-text">OpenAI используется только здесь, внутри карточки компании. В интернет он не ходит: на вход получает уже собранные факты, источники, контакты и результат проверки сайта.</p>
      <button id="siteAiButton" class="copy-button ai-action-button" type="button" ${aiReady && aiStatusText !== 'PROCESSING' ? '' : 'disabled'}>
        <i data-lucide="sparkles"></i>
        ${escapeHtml(aiReady ? aiButtonText : 'Нужен OPENAI_API_KEY')}
      </button>
      ${ai.error ? `<p class="error-text">${escapeHtml(ai.error)}</p>` : ''}
      ${aiData ? renderAiAnalysisBlock(aiData) : ''}
    </section>
  `;
}

function renderAiAnalysisBlock(ai) {
  return `
    <div class="ai-result">
      <p><strong>Потенциал:</strong> ${escapeHtml(ai.commercial_potential || 'UNKNOWN')} · <strong>Тип:</strong> ${escapeHtml(ai.recommended_site_type || '-')} · <strong>Размер:</strong> ${escapeHtml(ai.recommended_page_count || '-')}</p>
      <p><strong>Кратко:</strong> ${escapeHtml(ai.company_summary || '-')}</p>
      <p><strong>Главная проблема:</strong> ${escapeHtml(ai.main_problem || '-')}</p>
      <h4>Почему нужен сайт</h4>
      ${listItems(ai.why_website_needed)}
      <h4>Что решит сайт</h4>
      ${listItems(ai.problems_solved_by_site)}
      <h4>Структура</h4>
      ${listItems(ai.recommended_structure)}
      <h4>Материалы уже есть</h4>
      ${listItems(ai.existing_materials)}
      <h4>Чего не хватает</h4>
      ${listItems(ai.missing_materials)}
      <p><strong>Оффер:</strong> ${escapeHtml(ai.recommended_offer || '-')}</p>
      <div class="message-box">
        <p>${escapeHtml(ai.personal_argument || '-')}</p>
        <button class="copy-button" type="button" data-copy="${escapeAttribute(ai.personal_argument || '')}">
          <i data-lucide="copy"></i>
          Копировать аргумент
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
      <h3>Источники</h3>
      <p><strong>Источник:</strong> ${escapeHtml(displaySourceLabel(input.source || '-'))}</p>
      <p><strong>Профиль:</strong> ${linkOrDash(input.source_profile)}</p>
      <p><strong>Кандидаты домена:</strong></p>
      <ul>${candidates.length ? candidates.map((candidate) => `<li>${linkOrDash(candidate.url)} · ${escapeHtml(candidate.source || '')} · ${escapeHtml(String(candidate.confidence || 0))}</li>`).join('') : '<li>Нет кандидатов</li>'}</ul>
      <p class="muted-text">${escapeHtml(input.notes || '')}</p>
    </section>
  `;
}

function renderHistoryTab(result) {
  const ai = result.aiSiteAnalysis || { status: 'NOT_REQUESTED' };
  const aiData = ai.data || (ai.ai_analysis_status ? ai : null);
  return `
    <section class="detail-section">
      <h3>История</h3>
      <p><strong>AI status:</strong> ${escapeHtml(ai.status || ai.ai_analysis_status || 'NOT_REQUESTED')}</p>
      <p><strong>AI version:</strong> ${escapeHtml(String(ai.version || aiData?.ai_analysis_version || 1))}</p>
      <p><strong>Analyzed at:</strong> ${escapeHtml(ai.analyzed_at || aiData?.ai_analyzed_at || '-')}</p>
      <p><strong>Company data version:</strong> ${escapeHtml(String(ai.company_data_version || aiData?.company_data_version || 1))}</p>
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
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        result: compactResultForAiRequest(result),
        model: els.modelInput.value.trim()
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
      result.analysis.priority,
      result.analysis.recommended_package,
      result.analysis.main_problem,
      result.analysis.proposed_solution,
      result.analysis.requires_manual_review,
      result.analysis.first_message_ru,
      result.analysis.first_message_pl
    ])
  ];

  downloadText('warsaw-site-parser-results.csv', rows.map(csvLine).join('\n'), 'text/csv');
}

function exportJson() {
  downloadText('warsaw-site-parser-results.json', JSON.stringify(getFilteredResults(), null, 2), 'application/json');
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
