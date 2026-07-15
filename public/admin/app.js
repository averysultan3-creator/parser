// index.html hardcodes <html lang="pl"> as a static default, and
// AuraI18n.getLanguage() reads document.documentElement.lang BEFORE falling
// back to localStorage - so without this call, a fresh Admin load always
// booted in Polish regardless of a previously-saved 'ru' preference, until
// manually re-toggled in that session. Run as the very first statement (same
// place Academy's app.js calls this) so it applies before anything renders.
window.AuraI18n?.applyInitialLanguage();

const SELECTED_WORKER_STORAGE_KEY = 'auraAdminSelectedWorker';
const WORKER_ID_STORAGE_KEY = 'auraWorkerId';
const API_BASE_STORAGE_KEY = 'parserApiBase';
const SESSION_TOKEN_STORAGE_KEY = 'auraSessionToken';
// Rendering all matched leads into the DOM at once (there can be 500-2000+)
// is what made the admin panel feel slow, especially on phones - paginate
// the table client-side instead.
const LEADS_PAGE_SIZE = 50;

const leadStatuses = [
  ['new', 'Nowy / reset', 'Новый / сброшен'],
  ['seen', 'Juz widziany', 'Уже видели'],
  ['not_called', 'Nie dzwoniono', 'Не звонил'],
  ['reserved', 'Przydzielony', 'Выдан воркеру'],
  ['analyzed', 'Sprawdzony', 'Проверен'],
  ['called', 'Dzwonione', 'Позвонили'],
  ['contacted', 'Skontaktowano', 'Контакт был'],
  ['exported', 'Wyeksportowany', 'Экспортирован'],
  ['skipped', 'Pominiety', 'Пропущен'],
  ['rejected', 'Odrzucony', 'Отклонен'],
  ['no_answer', 'Nie odebrał', 'Не дозвонился'],
  ['callback_later', 'Oddzwonić później', 'Перезвонить позже'],
  ['interested', 'Zainteresowany', 'Заинтересован'],
  ['meeting_booked', 'Spotkanie', 'Встреча'],
  ['not_interested', 'Nie zainteresowany', 'Не заинтересован'],
  ['good_website', 'Ma dobrą stronę', 'Есть хороший сайт'],
  ['wrong_category', 'Zła kategoria', 'Неправильная категория'],
  ['closed_business', 'Firma zamknięta', 'Фирма закрыта'],
  ['bad_fit', 'Słaby lead', 'Слабый лид'],
  ['no_phone', 'Brak telefonu', 'Нет телефона'],
  ['wrong_number', 'Błędny numer', 'Неверный номер'],
  ['sms_email_requested', 'Prosił SMS/email', 'Попросил SMS/email'],
  ['dropped_call', 'Rozłączył się', 'Сбросил звонок'],
  ['duplicate', 'Duplikat', 'Дубль'],
  ['completed', 'Zamknięty', 'Закрыт'],
  ['deleted', 'Usunięty', 'Удален']
];

const poolStates = [
  ['available', 'Dostępny', 'Доступен'],
  ['reserved', 'Zarezerwowany', 'Выдан'],
  ['processed', 'Przetworzony', 'Обработан'],
  ['reset', 'Przywrócony do puli', 'Возвращен в пул'],
  ['deleted', 'Usunięty', 'Удален']
];

const state = {
  period: localStorage.getItem('auraAdminPeriod') || 'today',
  workers: [],
  workerDetail: null,
  selectedWorkerId:
    new URLSearchParams(window.location.search).get('workerId') ||
    localStorage.getItem(SELECTED_WORKER_STORAGE_KEY) ||
    '',
  leads: [],
  leadsPage: 1,
  runs: [],
  academyUsers: [],
  audit: [],
  activeRun: null,
  activeLead: null,
  stats: {},
  selected: new Set(),
  runsSelected: new Set(),
  workersSelected: new Set(),
  historyFilters: null,
  historyView: 'active',
  historyLoading: false,
  historyError: '',
  historyPreview: null,
  historyPreviewExcluded: new Set(),
  archivedRuns: [],
  aiUsage: null,
  aiUsagePeriod: localStorage.getItem('auraAdminAiUsagePeriod') || 'all',
  aiSearchSettings: null,
  aiSearchJobs: [],
  workerAiTrainingSessions: [],
  serviceCatalogNames: null,
  aiPersonas: null,
  // Lazy-loaded, id-keyed caches for the per-run status breakdown and the
  // per-run/per-company AI-cost badges (items 1 & 4 of the batch-fixes round).
  // undefined = not fetched yet, null = fetched but empty/failed, object = data.
  // The *Loading sets guard against firing duplicate requests while one is
  // already in flight (render() runs very often in this app).
  runStatusSummaries: new Map(),
  runStatusSummariesLoading: new Set(),
  runAiCosts: new Map(),
  runAiCostsLoading: new Set(),
  companyAiCosts: new Map(),
  companyAiCostsLoading: new Set()
};

const els = {
  statsGrid: document.querySelector('#statsGrid'),
  workersBody: document.querySelector('#workersBody'),
  workerSearchInput: document.querySelector('#workerSearchInput'),
  selectedWorkerTitle: document.querySelector('#selectedWorkerTitle'),
  selectedWorkerMeta: document.querySelector('#selectedWorkerMeta'),
  workerStatusChips: document.querySelector('#workerStatusChips'),
  workerStatsGrid: document.querySelector('#workerStatsGrid'),
  workerRunsCount: document.querySelector('#workerRunsCount'),
  workerRunsList: document.querySelector('#workerRunsList'),
  workerAcademyBadge: document.querySelector('#workerAcademyBadge'),
  workerAcademyBox: document.querySelector('#workerAcademyBox'),
  workerFoldersList: document.querySelector('#workerFoldersList'),
  workerSavedList: document.querySelector('#workerSavedList'),
  workerSavedCount: document.querySelector('#workerSavedCount'),
  workerDetailPanel: document.querySelector('#workerDetailPanel'),
  adminSectionTabs: document.querySelector('#adminSectionTabs'),
  adminTabWorkers: document.querySelector('#adminTabWorkers'),
  adminTabLeads: document.querySelector('#adminTabLeads'),
  adminTabInbox: document.querySelector('#adminTabInbox'),
  inboxList: document.querySelector('#inboxList'),
  inboxBadge: document.querySelector('#inboxBadge'),
  inboxMarkAllRead: document.querySelector('#inboxMarkAllRead'),
  adminTabHistory: document.querySelector('#adminTabHistory'),
  leadsFiltersForm: document.querySelector('#leadsFiltersForm'),
  leadsFiltersClear: document.querySelector('#leadsFiltersClear'),
  leadsPoolFilter: document.querySelector('#leadsPoolFilter'),
  leadsWorkerFilter: document.querySelector('#leadsWorkerFilter'),
  leadsCityFilter: document.querySelector('#leadsCityFilter'),
  leadsCategoryFilter: document.querySelector('#leadsCategoryFilter'),
  leadsSelectAll: document.querySelector('#leadsSelectAll'),
  leadsSelectAllMatching: document.querySelector('#leadsSelectAllMatching'),
  leadsBody: document.querySelector('#leadsBody'),
  leadsPagination: document.querySelector('#leadsPagination'),
  runsList: document.querySelector('#runsList'),
  runDetail: document.querySelector('#runDetail'),
  academyList: document.querySelector('#academyList'),
  refreshButton: document.querySelector('#refreshButton'),
  searchInput: document.querySelector('#searchInput'),
  statusFilter: document.querySelector('#statusFilter'),
  resetSelected: document.querySelector('#resetSelected'),
  selectedCount: document.querySelector('#selectedCount'),
  historyFiltersForm: document.querySelector('#historyFiltersForm'),
  historyFiltersClear: document.querySelector('#historyFiltersClear'),
  historyFiltersToggle: document.querySelector('#historyFiltersToggle'),
  historyFiltersPanel: document.querySelector('#historyFiltersPanel'),
  historyViewTabs: document.querySelector('#historyViewTabs'),
  historyPreviewByFilter: document.querySelector('#historyPreviewByFilter'),
  historyPreviewPanel: document.querySelector('#historyPreviewPanel'),
  historyStateMessage: document.querySelector('#historyStateMessage'),
  archiveList: document.querySelector('#archiveList'),
  historyBulkBar: document.querySelector('#historyBulkBar'),
  runsSelectAll: document.querySelector('#runsSelectAll'),
  runsSelectedCount: document.querySelector('#runsSelectedCount'),
  historyBulkDelete: document.querySelector('#historyBulkDelete'),
  workersSelectAll: document.querySelector('#workersSelectAll'),
  workersSelectedCount: document.querySelector('#workersSelectedCount'),
  workersBulkActivate: document.querySelector('#workersBulkActivate'),
  workersBulkDeactivate: document.querySelector('#workersBulkDeactivate'),
  workersBulkResetLeads: document.querySelector('#workersBulkResetLeads'),
  workersBulkDelete: document.querySelector('#workersBulkDelete'),
  adminTabAcademy: document.querySelector('#adminTabAcademy'),
  adminTabAudit: document.querySelector('#adminTabAudit'),
  adminTabAiSearch: document.querySelector('#adminTabAiSearch'),
  aiSearchSettingsForm: document.querySelector('#aiSearchSettingsForm'),
  aiSearchJobsBody: document.querySelector('#aiSearchJobsBody'),
  aiSearchJobsRefresh: document.querySelector('#aiSearchJobsRefresh'),
  academyOverviewBody: document.querySelector('#academyOverviewBody'),
  aiUsagePeriodSelect: document.querySelector('#aiUsagePeriodSelect'),
  aiUsageTotals: document.querySelector('#aiUsageTotals'),
  aiUsageByWorkerBody: document.querySelector('#aiUsageByWorkerBody'),
  aiUsageByFeatureBody: document.querySelector('#aiUsageByFeatureBody'),
  workerWeakSpotsBox: document.querySelector('#workerWeakSpotsBox'),
  workerAiTrainingBadge: document.querySelector('#workerAiTrainingBadge'),
  workerAiTrainingBox: document.querySelector('#workerAiTrainingBox'),
  aiTrainingDetailModal: document.querySelector('#aiTrainingDetailModal'),
  aiTrainingDetailBody: document.querySelector('#aiTrainingDetailBody'),
  aiTrainingDetailClose: document.querySelector('#aiTrainingDetailClose')
};

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

// Shared i18n (public/shared/i18n.js) lookup + tiny {placeholder} interpolation
// for the toasts/confirm/prompt strings that carry dynamic counts and IDs.
function tr(key, vars) {
  const base = window.AuraI18n?.tr ? window.AuraI18n.tr(key) : key;
  if (!vars) return base;
  return Object.entries(vars).reduce((str, [name, value]) => str.split(`{${name}}`).join(String(value)), base);
}

function currentAdminLang() {
  return window.AuraI18n?.getLanguage ? window.AuraI18n.getLanguage() : 'pl';
}

// Learning-path stage names returned by the server (see store.js's
// currentLearningStage()) are Polish literals baked into the data - map the
// known values to i18n keys client-side so the Academy overview/worker
// detail panels still translate even though the raw value itself is left
// untouched (same "leave enum values, translate the label" rule as statuses).
const STAGE_LABEL_KEYS = {
  Usługi: 'admin_stage_services',
  Szkolenie: 'admin_stage_training',
  Skrypty: 'admin_stage_scripts',
  'Trener AI': 'admin_stage_ai_trainer',
  Ukończono: 'admin_stage_completed'
};

function stageLabel(stage) {
  const key = STAGE_LABEL_KEYS[stage];
  return key ? tr(key) : stage;
}

function isPrivateHost(hostname) {
  return /^(localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})$/i.test(
    String(hostname || '')
  );
}

function clearPrivateParserApiBase() {
  if (window.location.protocol === 'file:' || isPrivateHost(window.location.hostname)) return;
  const saved = String(localStorage.getItem(API_BASE_STORAGE_KEY) || '').trim();
  if (!saved) return;
  try {
    const url = new URL(saved);
    if (isPrivateHost(url.hostname)) localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch {
    localStorage.removeItem(API_BASE_STORAGE_KEY);
  }
}

function normalizeApiBase(value) {
  if (!value) return '';
  let cleaned = String(value).trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
  return cleaned;
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
        if (!onPagesOrFile && isPrivateHost(new URL(saved).hostname)) {
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

function activeWorkerId() {
  return state.selectedWorkerId || state.workerDetail?.worker?.workerId || '';
}

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

function showAdminLogin(message = '') {
  document.body.classList.add('auth-locked');
  let modal = document.querySelector('#adminLoginDialog');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'adminLoginDialog';
    modal.className = 'modal-backdrop auth-backdrop';
    document.body.append(modal);
  }
  modal.innerHTML = `
    <form class="modal-card auth-card" id="adminLoginForm">
      <div>
        <p class="eyebrow">${escapeHtml(tr('admin_auth_eyebrow'))}</p>
        <h2>${escapeHtml(tr('admin_login_title'))}</h2>
        <p class="muted">${escapeHtml(tr('admin_login_hint'))}</p>
      </div>
      ${message ? `<div class="feedback bad">${escapeHtml(message)}</div>` : ''}
      <label>${escapeHtml(tr('admin_field_login'))}<input name="login" autocomplete="username" required value="admin" /></label>
      <label>${escapeHtml(tr('admin_field_password'))}<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="button primary" type="submit">${escapeHtml(tr('btn_login'))}</button>
    </form>
  `;
}

function showAccessDenied() {
  document.body.classList.add('auth-locked');
  let modal = document.querySelector('#adminLoginDialog');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'adminLoginDialog';
    modal.className = 'modal-backdrop auth-backdrop';
    document.body.append(modal);
  }
  modal.innerHTML = `
    <div class="modal-card auth-card">
      <div>
        <p class="eyebrow">${escapeHtml(tr('admin_auth_eyebrow'))}</p>
        <h2>${escapeHtml(tr('admin_access_denied_title'))}</h2>
        <p class="muted">${escapeHtml(tr('admin_access_denied_hint'))}</p>
      </div>
      <div class="feedback bad">${escapeHtml(tr('admin_access_denied_feedback'))}</div>
      <a class="button primary" href="../">${escapeHtml(tr('nav_parser'))}</a>
      <a class="button secondary" href="../academy/">${escapeHtml(tr('nav_academy'))}</a>
    </div>
  `;
}

function ensureLogoutButton() {
  if (document.querySelector('#adminLogoutButton')) return;
  const button = document.createElement('button');
  button.id = 'adminLogoutButton';
  button.className = 'button secondary';
  button.type = 'button';
  button.innerHTML = `<i data-lucide="log-out"></i> ${escapeHtml(tr('nav_logout'))}`;
  button.addEventListener('click', () => {
    fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: { ...authHeaders() } }).catch(() => {});
    clearAuthToken();
    window.location.reload();
  });
  document.querySelector('.header-actions')?.append(button);
}

function buildAppHref(basePath, workerId = '') {
  const url = new URL(basePath, window.location.href);
  if (workerId) url.searchParams.set('workerId', workerId);
  if (getApiBase()) url.searchParams.set('api', getApiBase());
  return url.toString();
}

function wireCrossAppLinks() {
  clearPrivateParserApiBase();
  [
    [document.querySelector('#adminParserLink'), '../'],
    [document.querySelector('#adminAcademyLink'), '../academy/']
  ].forEach(([link, basePath]) => {
    if (!link) return;
    const updateHref = () => {
      link.href = buildAppHref(basePath, activeWorkerId());
    };
    updateHref();
    link.addEventListener('click', () => {
      const workerId = activeWorkerId();
      if (workerId) localStorage.setItem(WORKER_ID_STORAGE_KEY, workerId);
      updateHref();
    });
  });
}

async function api(path, options = {}) {
  if (apiBootstrapPromise) await apiBootstrapPromise;
  const headers = {
    'content-type': 'application/json',
    ...authHeaders(),
    ...(options.headers || {})
  };
  const response = await fetch(apiUrl(path), {
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearAuthToken();
    showAdminLogin(data.error || 'Admin authorization required.');
  }
  if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
  return data;
}

apiBootstrapPromise = bootstrapApiBase();

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function statusLabel(status) {
  const row = leadStatuses.find(([value]) => value === status);
  if (!row) return status || 'new';
  return currentAdminLang() === 'ru' ? row[2] || row[1] : row[1];
}

function poolLabel(poolState) {
  const row = poolStates.find(([value]) => value === poolState);
  if (!row) return poolState || 'available';
  return currentAdminLang() === 'ru' ? row[2] || row[1] : row[1];
}

function leadName(record) {
  const data = record?.data || {};
  return data.company || data.legal_name || tr('admin_no_name');
}

function leadCategory(record) {
  return record?.data?.niche || record?.data?.category || '-';
}

function leadContact(record) {
  const data = record?.data || {};
  return [data.phone, data.email].filter(Boolean).join('<br>') || '-';
}

function leadSource(record) {
  const data = record?.data || {};
  return data.website_url || data.source_profile || data.google_maps_url || '-';
}

function isInboundLead(record) {
  return Boolean(record?.data?.inbound || record?.stage === 'site_inbound' || record?.data?.source_label === 'Aura inbound form');
}

function inboundSummary(record) {
  const data = record?.data || {};
  const services = Array.isArray(data.services) ? data.services.join(', ') : '';
  const intake = data.intake || {};
  return [services, intake.goal, intake.budget].filter(Boolean).join(' · ');
}

function aiScore(record) {
  return record?.aiSiteAnalysis?.data?.lead_score || record?.analysis?.lead_score || record?.data?.ai_score || '-';
}

function categoryScore(record) {
  return record?.data?.category_relevance_score || record?.analysis?.category_relevance_score || '-';
}

// Mirrors the categoryMatchLabel ternary in public/app.js's renderOverviewTab
// (Parser's Overview tab) so Admin's lead modal shows the same human label
// instead of the raw stored match/partial/mismatch code.
function categoryMatchLabel(value) {
  if (value === 'mismatch') return tr('admin_category_match_mismatch');
  if (value === 'partial') return tr('admin_category_match_partial');
  return tr('admin_category_match_match');
}

function statusSelect(record) {
  const status = record.status || 'new';
  return `
    <select class="status-select" data-status-lead="${escapeAttribute(record.id)}">
      ${leadStatuses
        .filter(([value]) => value !== 'deleted')
        .map(([value]) => `<option value="${escapeAttribute(value)}" ${value === status ? 'selected' : ''}>${escapeHtml(statusLabel(value))}</option>`)
        .join('')}
    </select>
  `;
}

function showToast(message, mode = 'ok') {
  let host = document.querySelector('#adminToastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'adminToastHost';
    host.className = 'toast-host';
    document.body.append(host);
  }
  const item = document.createElement('div');
  item.className = `toast ${mode}`;
  item.textContent = message;
  host.append(item);
  window.setTimeout(() => item.remove(), 3600);
}

// Filter <select> option labels come from leadStatuses/poolStates (which
// double as statusLabel()/poolLabel() lookup tables) or from the i18n dict,
// so they need to be rebuilt - not just created once - whenever the language
// changes. ensureEnhancements() calls these on first load; applyAdminStaticChrome()
// calls them again on every language switch.
function syncStatusFilterOptions() {
  if (!els.statusFilter) return;
  const selected = els.statusFilter.value || '';
  els.statusFilter.innerHTML = `
    <option value="">${escapeHtml(tr('admin_status_all'))}</option>
    ${leadStatuses
      .filter(([value]) => value !== 'deleted')
      .map(([value]) => `<option value="${escapeAttribute(value)}">${escapeHtml(statusLabel(value))}</option>`)
      .join('')}
  `;
  els.statusFilter.value = selected;
}

function syncPoolFilterOptions() {
  if (!els.leadsPoolFilter) return;
  const selected = els.leadsPoolFilter.value || '';
  els.leadsPoolFilter.innerHTML = `
    <option value="">${escapeHtml(tr('admin_pool_all'))}</option>
    ${poolStates.map(([value]) => `<option value="${escapeAttribute(value)}">${escapeHtml(poolLabel(value))}</option>`).join('')}
  `;
  els.leadsPoolFilter.value = selected;
}

function ensureEnhancements() {
  if (!document.querySelector('#periodFilter')) {
    const actions = document.querySelector('.header-actions');
    const period = document.createElement('select');
    period.id = 'periodFilter';
    period.className = 'button secondary period-select';
    period.value = state.period;
    period.addEventListener('change', () => {
      state.period = period.value;
      localStorage.setItem('auraAdminPeriod', state.period);
      loadAll().catch((error) => showToast(error.message, 'warn'));
    });
    actions?.prepend(period);
  }

  if (!document.querySelector('#createWorkerButton')) {
    const button = document.createElement('button');
    button.id = 'createWorkerButton';
    button.className = 'button primary';
    button.type = 'button';
    button.addEventListener('click', openWorkerDialog);
    document.querySelector('.header-actions')?.prepend(button);
  }

  syncStatusFilterOptions();
  syncPoolFilterOptions();
  refreshEnhancementChrome();
}

// Text for the elements ensureEnhancements() creates once via JS (so they
// have no static HTML to hold data-i18n) - re-run on every language switch.
function refreshEnhancementChrome() {
  const periodSelect = document.querySelector('#periodFilter');
  if (periodSelect) {
    // Options must be populated BEFORE setting .value - on first render
    // ensureEnhancements() creates this <select> with no <option> elements
    // yet, so assigning .value before they exist silently no-ops and the
    // dropdown renders blank/unselected. state.period (not the DOM's own
    // stale .value) is always the source of truth here.
    periodSelect.innerHTML = `
      <option value="today">${escapeHtml(tr('admin_period_today'))}</option>
      <option value="7d">${escapeHtml(tr('admin_period_7d'))}</option>
      <option value="30d">${escapeHtml(tr('admin_period_30d'))}</option>
      <option value="all">${escapeHtml(tr('admin_period_all'))}</option>
    `;
    periodSelect.value = state.period;
  }
  const createWorkerBtn = document.querySelector('#createWorkerButton');
  if (createWorkerBtn) createWorkerBtn.innerHTML = `<i data-lucide="user-plus"></i> ${escapeHtml(tr('btn_create_worker'))}`;
  const logoutBtn = document.querySelector('#adminLogoutButton');
  if (logoutBtn) logoutBtn.innerHTML = `<i data-lucide="log-out"></i> ${escapeHtml(tr('nav_logout'))}`;
}

async function loadAll({ keepSelection = true } = {}) {
  ensureEnhancements();
  const activeRunId = state.activeRun?.run?.id || '';
  const params = new URLSearchParams();
  if (els.searchInput.value.trim()) params.set('q', els.searchInput.value.trim());
  if (els.statusFilter.value) params.set('status', els.statusFilter.value);
  if (els.leadsPoolFilter?.value) params.set('poolState', els.leadsPoolFilter.value);
  if (els.leadsWorkerFilter?.value.trim()) params.set('workerId', els.leadsWorkerFilter.value.trim());
  if (els.leadsCityFilter?.value.trim()) params.set('city', els.leadsCityFilter.value.trim());
  if (els.leadsCategoryFilter?.value.trim()) params.set('category', els.leadsCategoryFilter.value.trim());
  params.set('limit', '2000');

  const [workersData, leadsData, summaryData, auditData] = await Promise.all([
    api('/api/admin/workers'),
    api(`/api/admin/leads?${params.toString()}`),
    api(`/api/admin/summary?period=${encodeURIComponent(state.period)}`),
    api('/api/admin/audit?limit=120')
  ]);

  state.workers = workersData.workers || [];
  state.leads = leadsData.leads || [];
  state.leadsPage = 1;
  state.stats = summaryData.stats || workersData.stats || leadsData.stats || {};
  state.academyUsers = summaryData.academyUsers || [];
  state.audit = auditData.actions || [];
  state.selected.clear();
  state.runsSelected.clear();
  const knownWorkers = new Set(state.workers.map((worker) => worker.workerId));
  state.workersSelected = new Set([...state.workersSelected].filter((id) => knownWorkers.has(id)));

  await loadHistoryRuns();

  const hasSelected = state.workers.some((worker) => worker.workerId === state.selectedWorkerId);
  if (!keepSelection || !hasSelected) state.selectedWorkerId = state.workers[0]?.workerId || '';
  if (state.selectedWorkerId) await loadWorkerDetail(state.selectedWorkerId, { renderAfter: false });
  else state.workerDetail = null;

  if (activeRunId) {
    try {
      state.activeRun = await api(`/api/admin/runs/${encodeURIComponent(activeRunId)}`);
    } catch {
      state.activeRun = null;
    }
  }
  render();
}

async function loadWorkerDetail(workerId, { renderAfter = true } = {}) {
  if (!workerId) return;
  state.selectedWorkerId = workerId;
  localStorage.setItem(SELECTED_WORKER_STORAGE_KEY, workerId);
  localStorage.setItem(WORKER_ID_STORAGE_KEY, workerId);
  if (renderAfter) {
    els.selectedWorkerTitle.textContent = tr('admin_loading_profile');
    els.selectedWorkerMeta.textContent = workerId;
    els.workerDetailPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  try {
    state.workerDetail = await api(`/api/admin/workers/${encodeURIComponent(workerId)}`);
    await Promise.all([loadWorkerAiTrainingSessions(workerId), loadAiPersonas(), loadServiceCatalogNames()]);
    if (renderAfter) {
      render();
      els.workerDetailPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    showToast(error.message || tr('admin_error_worker_open_failed'), 'warn');
    throw error;
  }
}

function renderStats() {
  const stats = [
    [tr('nav_workers'), state.stats.totalWorkers ?? state.workers.length],
    [tr('admin_stat_active_in_period'), state.stats.activeWorkers ?? 0],
    [tr('admin_stat_total_leads'), state.stats.totalCompanies ?? 0],
    [tr('admin_stat_leads_found'), state.stats.leadsFound ?? 0],
    [tr('nav_parser_queries'), state.stats.parserQueries ?? 0],
    [tr('admin_stat_ai_analyses'), state.stats.aiAnalyses ?? 0],
    [tr('admin_th_meetings'), state.stats.meetingBooked ?? 0],
    [tr('admin_stat_returned_to_pool'), state.stats.returnedToPool ?? 0],
    [tr('admin_stat_deleted'), state.stats.deletedPermanently ?? state.stats.deletedCompanies ?? 0]
  ];
  els.statsGrid.innerHTML = stats
    .map(([label, value]) => `
      <div class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join('');
}

function workerMatchesSearch(worker) {
  const query = String(els.workerSearchInput.value || '').trim().toLowerCase();
  if (!query) return true;
  return [worker.workerId, worker.login, worker.displayName, ...(worker.sourceTags || [])].join(' ').toLowerCase().includes(query);
}

function renderWorkers() {
  const workers = state.workers.filter(workerMatchesSearch);
  if (!workers.length) {
    els.workersBody.innerHTML = `<tr><td colspan="8" class="muted">${escapeHtml(tr('admin_workers_empty'))}</td></tr>`;
    renderWorkersSelection();
    return;
  }

  els.workersBody.innerHTML = workers
    .map((worker) => {
      const selected = worker.workerId === state.selectedWorkerId ? 'selected-row' : '';
      const academy = worker.academy || {};
      const conversion = worker.leadsAssigned ? Math.round(((worker.meetingBooked || 0) / worker.leadsAssigned) * 100) : 0;
      return `
        <tr class="${selected}">
          <td><input type="checkbox" data-select-worker="${escapeAttribute(worker.workerId)}" ${state.workersSelected.has(worker.workerId) ? 'checked' : ''} aria-label="${escapeAttribute(tr('admin_aria_select_worker'))}"></td>
          <td>
            <strong>${escapeHtml(worker.displayName || worker.workerId)}</strong>
            <div class="muted mono">${escapeHtml(worker.login || worker.workerId)}</div>
            <span class="chip ${worker.active === false ? 'danger-chip' : 'ok-chip'}">${worker.active === false ? escapeHtml(tr('admin_status_inactive')) : escapeHtml(tr('admin_status_active'))}</span>
          </td>
          <td>${escapeHtml(worker.leadsAssigned || 0)}<div class="muted">${escapeHtml(tr('admin_label_opened'))} ${escapeHtml(worker.visibleLeads || 0)}</div></td>
          <td>${escapeHtml(worker.parserRuns || 0)}<div class="muted">${escapeHtml(tr('admin_run_new_label'))} ${escapeHtml(worker.newTotal || 0)} / ${escapeHtml(tr('admin_label_dup_short'))} ${escapeHtml(worker.duplicateTotal || 0)}</div></td>
          <td>${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)} · ${escapeHtml(academy.averageQuizScore || 0)}%</td>
          <td>${escapeHtml(worker.meetingBooked || 0)}<div class="muted">${conversion}%</div></td>
          <td>${escapeHtml(formatDate(worker.lastActiveAt))}</td>
          <td>
            <div class="inline-actions">
              <button class="button secondary" data-open-worker="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_open_profile'))}</button>
              <button class="button danger" data-worker-delete="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_delete'))}</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
  renderWorkersSelection();
}

function renderWorkerDetail() {
  const detail = state.workerDetail;
  if (!detail?.worker) {
    els.selectedWorkerTitle.textContent = tr('admin_select_worker_placeholder');
    els.selectedWorkerMeta.textContent = tr('admin_select_worker_hint');
    els.workerStatusChips.innerHTML = '';
    els.workerStatsGrid.innerHTML = '';
    els.workerRunsList.innerHTML = `<div class="list-item muted">${escapeHtml(tr('empty_no_data'))}</div>`;
    els.workerAcademyBox.innerHTML = `<div class="muted">${escapeHtml(tr('empty_no_data'))}</div>`;
    if (els.workerFoldersList) els.workerFoldersList.innerHTML = '';
    if (els.workerSavedList) els.workerSavedList.innerHTML = `<div class="list-item muted">${escapeHtml(tr('empty_no_data'))}</div>`;
    return;
  }

  const worker = detail.worker;
  const academy = worker.academy || {};
  const runs = detail.runs || [];
  const companies = detail.companies || [];
  const conversion = companies.length ? Math.round(((worker.meetingBooked || 0) / companies.length) * 100) : 0;
  els.selectedWorkerTitle.textContent = worker.displayName || worker.workerId;
  els.selectedWorkerMeta.textContent = `${worker.login || worker.workerId} · ${worker.active === false ? tr('admin_status_inactive') : tr('admin_status_active')} · ${worker.language || 'ru'} · ${tr('admin_label_last_colon')} ${formatDate(worker.lastActiveAt)}`;
  els.workerStatusChips.innerHTML = `
    ${Object.entries(detail.statusCounts || {})
      .map(([status, count]) => `<span class="chip status ${escapeAttribute(status)}">${escapeHtml(statusLabel(status))}: ${escapeHtml(count)}</span>`)
      .join('')}
    <a class="button secondary small-button" href="../academy/?workerId=${encodeURIComponent(worker.workerId)}" target="_blank" rel="noreferrer">${escapeHtml(tr('admin_worker_account_link'))}</a>
    <button class="button secondary small-button" data-worker-password="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_change_password'))}</button>
    <button class="button secondary small-button" data-worker-toggle="${escapeAttribute(worker.workerId)}">${worker.active === false ? escapeHtml(tr('admin_btn_activate')) : escapeHtml(tr('admin_btn_deactivate'))}</button>
    <button class="button secondary small-button" data-worker-reset="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_return_worker_leads'))}</button>
    <button class="button secondary small-button" data-worker-daily-limit="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_daily_lead_limit'))}: ${worker.dailyLeadLimit ? escapeHtml(worker.dailyLeadLimit) : '&#8734;'}</button>
    <button class="button danger small-button" data-worker-clear="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_clear_history'))}</button>
    <button class="button danger small-button" data-worker-delete="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_delete_worker'))}</button>
  `;

  els.workerStatsGrid.innerHTML = [
    [tr('admin_th_queries'), worker.parserRuns || runs.length],
    [tr('admin_th_leads'), worker.leadsAssigned || companies.length],
    [tr('admin_stat_open'), worker.visibleLeads || 0],
    [tr('admin_stat_ai'), worker.aiAnalyses || 0],
    [tr('admin_stat_statuses'), Object.values(detail.statusCounts || {}).reduce((sum, value) => sum + Number(value || 0), 0)],
    [tr('admin_th_meetings'), worker.meetingBooked || 0],
    [tr('admin_stat_conversion'), `${conversion}%`],
    [tr('nav_academy'), `${academy.completedModules || 0}/${academy.totalModules || 10}`]
  ]
    .map(([label, value]) => `
      <div class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join('');

  els.workerRunsCount.textContent = tr('admin_worker_runs_count_template', { n: runs.length });
  els.workerRunsList.innerHTML = runs.length
    ? runs.slice(0, 30).map((run) => renderRunItem(run, { withStatusSummary: true })).join('')
    : `<div class="list-item muted">${escapeHtml(tr('admin_worker_no_runs'))}</div>`;

  els.workerAcademyBadge.textContent = `${academy.completionPercent || 0}%`;
  els.workerAcademyBox.innerHTML = `
    <p><strong>${escapeHtml(tr('admin_label_stage_colon'))}</strong> ${escapeHtml(stageLabel(academy.currentStage || 'Usługi'))}</p>
    <div class="progress-bar"><span style="width:${Math.max(0, Math.min(100, academy.completionPercent || 0))}%"></span></div>
    <p><strong>${escapeHtml(tr('admin_label_services'))}</strong> ${escapeHtml(academy.servicesPercent || 0)}% (${escapeHtml(academy.servicesCompleted || 0)} ${escapeHtml(tr('admin_label_completed_count_suffix'))})</p>
    <p><strong>${escapeHtml(tr('admin_label_modules_colon'))}</strong> ${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)}</p>
    <p><strong>${escapeHtml(tr('admin_label_scripts_examples_colon'))}</strong> ${escapeHtml(academy.scriptsPercent || 0)}% (${escapeHtml(academy.scriptsOpened || 0)} ${escapeHtml(tr('admin_label_opened_count_suffix'))})</p>
    <p><strong>${escapeHtml(tr('admin_label_avg_test_score_colon'))}</strong> ${escapeHtml(academy.averageQuizScore || 0)}%</p>
    <p><strong>${escapeHtml(tr('admin_label_ai_usage_colon'))}</strong> ${escapeHtml(tr('admin_academy_ai_usage_template', { count: academy.aiUsageCount || 0, cost: (academy.aiUsageCost || 0).toFixed(2) }))}</p>
    <p class="muted">${escapeHtml(tr('admin_label_last_colon'))} ${escapeHtml(formatDate(academy.lastActiveAt))}</p>
  `;

  const folders = detail.folders || [];
  const saved = detail.saved || [];
  if (els.workerSavedCount) els.workerSavedCount.textContent = tr('admin_worker_saved_count_template', { n: detail.savedTotal ?? saved.length, m: folders.length });
  if (els.workerFoldersList) {
    els.workerFoldersList.innerHTML = folders.length
      ? folders.map((folder) => `<span class="chip">${escapeHtml(folder.name)}</span>`).join('')
      : `<span class="muted">${escapeHtml(tr('admin_worker_no_folders'))}</span>`;
  }
  if (els.workerSavedList) {
    els.workerSavedList.innerHTML = saved.length
      ? saved
          .slice(0, 50)
          .map((item) => {
            const folderNames = (item.saved_folder_ids || [])
              .map((id) => folders.find((folder) => folder.id === id)?.name)
              .filter(Boolean);
            return `
            <button type="button" class="list-item link-item" data-open-lead="${escapeAttribute(item.id)}">
              <strong>${escapeHtml(item.data?.company || item.data?.legal_name || tr('admin_no_name'))}</strong>
              <div class="muted">${escapeHtml(folderNames.join(', ') || tr('admin_no_folder'))} · ${escapeHtml(tr('admin_label_crm_status_colon'))} ${escapeHtml(crmStatusAdminLabel(item.crm_status))}</div>
              ${item.last_comment ? `<div class="muted">"${escapeHtml(item.last_comment.text.slice(0, 80))}"</div>` : ''}
            </button>`;
          })
          .join('')
      : `<div class="list-item muted">${escapeHtml(tr('admin_worker_no_saved'))}</div>`;
  }
}

function crmStatusAdminLabel(value) {
  const key = `admin_crm_${value || 'nowy'}`;
  const translated = tr(key);
  return translated === key ? tr('admin_crm_nowy') : translated;
}

// Falls back to the raw backend feature code for any feature not covered by
// an admin_ai_feature_* i18n key, so unknown/future codes never crash or
// render blank - same fallback pattern as auditActionLabel() below.
function aiFeatureLabel(feature) {
  const key = `admin_ai_feature_${feature}`;
  const label = tr(key);
  return label === key ? String(feature || tr('admin_value_unknown')) : label;
}

function formatRunStatusLabel(status) {
  const key = `admin_run_status_${status}`;
  const label = tr(key);
  return label === key ? String(status || '-') : label;
}

// --- Per-run status breakdown + AI-cost badges (runs & leads) ---
// These follow one shared pattern: renderX() reads from an id-keyed cache in
// `state`; on a cache miss it renders an (empty/placeholder) element tagged
// with a data-* id, fires the fetch, and once it resolves patches every
// matching element already in the DOM in place - no full re-render needed,
// and repeat calls (render() runs after almost every action) never re-fetch
// once an id is cached (success or failure).

function safeAttrSelectorValue(value) {
  const raw = String(value ?? '');
  return window.CSS?.escape ? CSS.escape(raw) : raw.replace(/(["\\])/g, '\\$1');
}

// Coarse "has anyone actually worked this lead yet" split used for the
// per-run summary - mirrors the same statuses store.js's getWorkerDetail()
// leaves untouched right after a run is created/leads are assigned.
const RUN_SUMMARY_UNTOUCHED_STATUSES = new Set(['new', 'seen', 'not_called', 'reserved']);

function computeRunStatusSummary(companies) {
  const list = Array.isArray(companies) ? companies : [];
  let notProcessed = 0;
  let processed = 0;
  let withComments = 0;
  list.forEach((company) => {
    if (RUN_SUMMARY_UNTOUCHED_STATUSES.has(company.status || 'new')) notProcessed += 1;
    else processed += 1;
    if (company.last_comment?.text) withComments += 1;
  });
  return { notProcessed, processed, withComments, total: list.length };
}

// No batched "status breakdown per run" endpoint exists on the backend - the
// run object only carries pool metrics (found_count/new_count/duplicate_count),
// not a CRM-status breakdown. GET /api/admin/runs/:id (no page/pageSize query)
// returns the run's full company list unpaginated, so we fetch that once per
// run id and derive the breakdown client-side. Acceptable per-run request for
// this admin-only, low-traffic view.
function ensureRunStatusSummary(runId) {
  const id = String(runId || '');
  if (!id || state.runStatusSummaries.has(id) || state.runStatusSummariesLoading.has(id)) return;
  state.runStatusSummariesLoading.add(id);
  api(`/api/admin/runs/${encodeURIComponent(id)}`)
    .then((data) => state.runStatusSummaries.set(id, computeRunStatusSummary(data.companies)))
    .catch(() => state.runStatusSummaries.set(id, null))
    .finally(() => {
      state.runStatusSummariesLoading.delete(id);
      patchRunStatusSummaryBadges(id);
    });
}

function runStatusSummaryText(summary) {
  return tr('admin_run_status_summary_template', {
    notProcessed: summary.notProcessed,
    processed: summary.processed,
    comments: summary.withComments
  });
}

function runStatusSummaryBadge(run) {
  const id = String(run.id);
  const summary = state.runStatusSummaries.get(id);
  if (summary === undefined) {
    ensureRunStatusSummary(id);
    return `<div class="muted run-status-summary" data-run-status-summary="${escapeAttribute(id)}"></div>`;
  }
  if (!summary) return '';
  return `<div class="muted run-status-summary" data-run-status-summary="${escapeAttribute(id)}">${escapeHtml(runStatusSummaryText(summary))}</div>`;
}

function patchRunStatusSummaryBadges(runId) {
  const id = String(runId);
  const summary = state.runStatusSummaries.get(id);
  document.querySelectorAll(`[data-run-status-summary="${safeAttrSelectorValue(id)}"]`).forEach((node) => {
    if (summary) node.textContent = runStatusSummaryText(summary);
    else node.remove();
  });
}

function formatAiCost(cost) {
  return `$${Number(cost || 0).toFixed(2)}`;
}

function ensureRunAiCost(runId) {
  const id = String(runId || '');
  if (!id || state.runAiCosts.has(id) || state.runAiCostsLoading.has(id)) return;
  state.runAiCostsLoading.add(id);
  api(`/api/admin/ai-usage/run/${encodeURIComponent(id)}`)
    .then((data) => state.runAiCosts.set(id, data))
    .catch(() => state.runAiCosts.set(id, null))
    .finally(() => {
      state.runAiCostsLoading.delete(id);
      patchRunAiCostBadges(id);
    });
}

function runAiCostBadge(run) {
  const id = String(run.id);
  const usage = state.runAiCosts.get(id);
  if (usage === undefined) {
    ensureRunAiCost(id);
    return `<span class="chip mono" data-ai-cost-run="${escapeAttribute(id)}"></span>`;
  }
  if (!usage || !usage.requestCount) return '';
  return `<span class="chip mono" data-ai-cost-run="${escapeAttribute(id)}">${escapeHtml(tr('admin_ai_cost_label'))} ${escapeHtml(formatAiCost(usage.totalCost))}</span>`;
}

// Single-item detail view (run detail header) variant of runAiCostBadge():
// always renders a labelled line (with an explicit "no AI usage" fallback)
// instead of disappearing when there's no usage yet, since a blank line in a
// detail header reads as a rendering bug while a blank chip in a dense list
// doesn't.
function runAiCostLabel(run) {
  const id = String(run.id);
  const usage = state.runAiCosts.get(id);
  if (usage === undefined) {
    ensureRunAiCost(id);
    return `<span data-ai-cost-run-text="${escapeAttribute(id)}">${escapeHtml(tr('admin_loading_generic'))}</span>`;
  }
  const text = usage && usage.requestCount ? formatAiCost(usage.totalCost) : tr('admin_value_no_ai_usage');
  return `<span data-ai-cost-run-text="${escapeAttribute(id)}">${escapeHtml(text)}</span>`;
}

function patchRunAiCostBadges(runId) {
  const id = String(runId);
  const usage = state.runAiCosts.get(id);
  document.querySelectorAll(`[data-ai-cost-run="${safeAttrSelectorValue(id)}"]`).forEach((node) => {
    if (usage && usage.requestCount) node.textContent = `${tr('admin_ai_cost_label')} ${formatAiCost(usage.totalCost)}`;
    else node.remove();
  });
  document.querySelectorAll(`[data-ai-cost-run-text="${safeAttrSelectorValue(id)}"]`).forEach((node) => {
    node.textContent = usage && usage.requestCount ? formatAiCost(usage.totalCost) : tr('admin_value_no_ai_usage');
  });
}

function ensureCompanyAiCost(companyId) {
  const id = String(companyId || '');
  if (!id || state.companyAiCosts.has(id) || state.companyAiCostsLoading.has(id)) return;
  state.companyAiCostsLoading.add(id);
  api(`/api/admin/ai-usage/company/${encodeURIComponent(id)}`)
    .then((data) => state.companyAiCosts.set(id, data))
    .catch(() => state.companyAiCosts.set(id, null))
    .finally(() => {
      state.companyAiCostsLoading.delete(id);
      patchCompanyAiCostBadges(id);
    });
}

function companyAiCostBadge(companyId) {
  const id = String(companyId || '');
  if (!id) return '';
  const usage = state.companyAiCosts.get(id);
  if (usage === undefined) {
    ensureCompanyAiCost(id);
    return `<span class="chip mono" data-ai-cost-company="${escapeAttribute(id)}"></span>`;
  }
  if (!usage || !usage.requestCount) return '';
  return `<span class="chip mono" data-ai-cost-company="${escapeAttribute(id)}">${escapeHtml(tr('admin_ai_cost_label'))} ${escapeHtml(formatAiCost(usage.totalCost))}</span>`;
}

// Single-item detail view (lead modal) variant of companyAiCostBadge() - see
// runAiCostLabel() above for why the detail view gets an explicit fallback
// instead of a badge that silently disappears.
function companyAiCostLabel(companyId) {
  const id = String(companyId || '');
  if (!id) return escapeHtml(tr('admin_value_no_ai_usage'));
  const usage = state.companyAiCosts.get(id);
  if (usage === undefined) {
    ensureCompanyAiCost(id);
    return `<span data-ai-cost-company-text="${escapeAttribute(id)}">${escapeHtml(tr('admin_loading_generic'))}</span>`;
  }
  const text = usage && usage.requestCount ? formatAiCost(usage.totalCost) : tr('admin_value_no_ai_usage');
  return `<span data-ai-cost-company-text="${escapeAttribute(id)}">${escapeHtml(text)}</span>`;
}

function patchCompanyAiCostBadges(companyId) {
  const id = String(companyId);
  const usage = state.companyAiCosts.get(id);
  document.querySelectorAll(`[data-ai-cost-company="${safeAttrSelectorValue(id)}"]`).forEach((node) => {
    if (usage && usage.requestCount) node.textContent = `${tr('admin_ai_cost_label')} ${formatAiCost(usage.totalCost)}`;
    else node.remove();
  });
  document.querySelectorAll(`[data-ai-cost-company-text="${safeAttrSelectorValue(id)}"]`).forEach((node) => {
    node.textContent = usage && usage.requestCount ? formatAiCost(usage.totalCost) : tr('admin_value_no_ai_usage');
  });
}

function renderRunItem(run, { selectable = false, archived = false, withStatusSummary = false } = {}) {
  const title = (run.niches || []).join(', ') || tr('admin_run_default_title');
  const badges = [
    `<span class="badge">${escapeHtml(formatRunStatusLabel(run.status))}</span>`,
    run.pool_status === 'returned_to_pool' ? `<span class="badge badge-returned">${escapeHtml(tr('admin_badge_returned_to_pool'))}</span>` : '',
    run.archived_at ? `<span class="badge badge-archived">${escapeHtml(tr('admin_badge_archived'))}</span>` : ''
  ]
    .filter(Boolean)
    .join('');
  return `
    <div class="list-item run-item">
      ${selectable ? `<input type="checkbox" data-select-run="${escapeAttribute(run.id)}" ${state.runsSelected.has(String(run.id)) ? 'checked' : ''} aria-label="${escapeAttribute(tr('admin_warn_select_history_entries'))}" />` : ''}
      <div>
        <strong>${escapeHtml(title)}</strong>
        <div class="muted">${escapeHtml(formatDate(run.started_at))} · ${escapeHtml(run.city || '-')} · ${escapeHtml(tr('admin_run_worker_colon'))} ${escapeHtml(run.worker_id || '-')}</div>
        <div class="run-badges">${badges}${runAiCostBadge(run)}</div>
        <div>${escapeHtml(tr('admin_run_found_label'))}: ${escapeHtml(run.found_count || 0)} · ${escapeHtml(tr('admin_run_new_label'))}: ${escapeHtml(run.new_count || 0)} · ${escapeHtml(tr('admin_run_duplicates_label'))}: ${escapeHtml(run.duplicate_count || 0)} · ${escapeHtml(tr('admin_run_wrong_category_label'))}: ${escapeHtml(run.skipped_wrong_category || 0)}</div>
        ${withStatusSummary ? runStatusSummaryBadge(run) : ''}
      </div>
      <div class="inline-actions">
        <button class="button secondary" data-open-run="${escapeAttribute(run.id)}">${escapeHtml(tr('btn_open'))}</button>
        ${
          archived
            ? `<button class="button secondary" data-restore-run="${escapeAttribute(run.id)}">${escapeHtml(tr('admin_btn_restore_from_archive'))}</button>`
            : `<button class="button danger" data-delete-run="${escapeAttribute(run.id)}">${escapeHtml(tr('btn_return_to_pool'))}</button>`
        }
      </div>
    </div>
  `;
}

function renderLeadRow(record, { selectable = true } = {}) {
  const source = leadSource(record);
  const poolState = record.pool_state || 'available';
  const inbound = isInboundLead(record);
  const inboundText = inboundSummary(record);
  const hasComment = Boolean(record.last_comment?.text);
  const folderCount = (record.saved_links || []).length;
  const crmStatus = record.crm_status || 'nowy';
  return `
    <tr class="${hasComment || folderCount ? 'lead-row-annotated' : ''}">
      ${selectable ? `<td><input type="checkbox" data-select="${escapeAttribute(record.id)}" ${state.selected.has(record.id) ? 'checked' : ''}></td>` : ''}
      <td>
        <strong>${escapeHtml(leadName(record))}</strong>
        <div class="muted">${escapeHtml([leadCategory(record), record.data?.city, record.data?.address].filter(Boolean).join(' · ') || '-')}</div>
        ${inbound ? `<span class="chip ok-chip">${escapeHtml(tr('admin_inbound_chip'))}</span>` : ''}
        <span class="chip">${escapeHtml(poolLabel(poolState))}</span>
        <span class="muted mono">AI ${escapeHtml(aiScore(record))} · ${escapeHtml(tr('admin_lead_category_score_label'))} ${escapeHtml(categoryScore(record))}</span>
        ${companyAiCostBadge(record.id)}
        ${inboundText ? `<div class="muted">${escapeHtml(inboundText)}</div>` : ''}
      </td>
      <td>${statusSelect(record)}</td>
      ${selectable ? `<td class="mono">${escapeHtml(record.assigned_worker_id || '-')}</td>` : ''}
      <td>${leadContact(record)}</td>
      <td>${source === '-' ? '-' : `<a href="${escapeAttribute(source)}" target="_blank" rel="noreferrer">${escapeHtml(tr('admin_link_source'))}</a>`}</td>
      <td>
        <span class="chip status ${escapeAttribute(crmStatus)}">${escapeHtml(crmStatusAdminLabel(crmStatus))}</span>
        ${folderCount ? `<div class="muted"><i data-lucide="folder"></i> ${folderCount}</div>` : ''}
        ${hasComment ? `<div class="muted note-preview" title="${escapeAttribute(record.last_comment.text)}"><i data-lucide="message-square"></i> ${escapeHtml(record.last_comment.text.slice(0, 40))}${record.last_comment.text.length > 40 ? '…' : ''}</div>` : ''}
      </td>
      <td>
        <button class="button secondary" data-open-lead="${escapeAttribute(record.id)}">${escapeHtml(tr('admin_btn_open_lead'))}</button>
        <button class="button secondary" data-reset-one="${escapeAttribute(record.id)}">${escapeHtml(tr('btn_return_to_pool'))}</button>
      </td>
    </tr>
  `;
}

function currentLeadsPage() {
  const pageCount = Math.max(1, Math.ceil(state.leads.length / LEADS_PAGE_SIZE));
  return Math.min(Math.max(1, state.leadsPage || 1), pageCount);
}

function leadsPageSlice() {
  const page = currentLeadsPage();
  const start = (page - 1) * LEADS_PAGE_SIZE;
  return state.leads.slice(start, start + LEADS_PAGE_SIZE);
}

function renderLeadsPagination() {
  if (!els.leadsPagination) return;
  const pageCount = Math.max(1, Math.ceil(state.leads.length / LEADS_PAGE_SIZE));
  const page = currentLeadsPage();
  if (pageCount <= 1) {
    els.leadsPagination.innerHTML = '';
    return;
  }
  els.leadsPagination.innerHTML = `
    <button class="button secondary" type="button" data-leads-page="prev" ${page <= 1 ? 'disabled' : ''}>${escapeHtml(tr('admin_pagination_prev'))}</button>
    <span class="muted">${escapeHtml(tr('admin_pagination_page_template', { page, count: pageCount }))}</span>
    <button class="button secondary" type="button" data-leads-page="next" ${page >= pageCount ? 'disabled' : ''}>${escapeHtml(tr('admin_pagination_next'))}</button>
  `;
}

function renderLeads() {
  const pageLeads = leadsPageSlice();
  if (!state.leads.length) {
    els.leadsBody.innerHTML = `<tr><td colspan="8" class="muted">${escapeHtml(tr('admin_leads_empty'))}</td></tr>`;
  } else {
    els.leadsBody.innerHTML = pageLeads.map((record) => renderLeadRow(record, { selectable: true })).join('');
  }
  if (els.leadsSelectAll) {
    els.leadsSelectAll.checked = pageLeads.length > 0 && pageLeads.every((record) => state.selected.has(record.id));
  }
  if (els.leadsSelectAllMatching) {
    els.leadsSelectAllMatching.textContent = tr('admin_select_all_matching_template', { n: state.leads.length });
  }
  renderLeadsPagination();
  window.lucide?.createIcons();
}

function inboxSubmittedAt(record) {
  return record.inbound_submitted_at || record.data?.inbound_submitted_at || record.updated_at || '';
}

function inboxIsUnread(record) {
  return record.status === 'new';
}

function inboxSubmissions() {
  return state.leads
    .filter(isInboundLead)
    .slice()
    .sort((a, b) => new Date(inboxSubmittedAt(b)).getTime() - new Date(inboxSubmittedAt(a)).getTime());
}

function inboxNeedsLine(record) {
  const data = record.data || {};
  const intake = data.intake || {};
  const services = Array.isArray(data.services) ? data.services.join(' · ') : '';
  return [services, intake.goal, intake.budget].filter(Boolean).join('  ·  ') || '-';
}

function renderInboxCard(record) {
  const data = record.data || {};
  const intake = data.intake || {};
  const unread = inboxIsUnread(record);
  const message = String(data.notes || '').trim();
  return `
    <article class="inbox-item ${unread ? 'is-unread' : ''}" data-open-lead="${escapeAttribute(record.id)}">
      <div class="inbox-item-top">
        <div class="inbox-item-who">
          ${unread ? '<span class="inbox-dot" aria-hidden="true"></span>' : ''}
          <strong>${escapeHtml(data.contact_name || leadName(record))}</strong>
          <span class="chip status ${escapeAttribute(record.crm_status || 'nowy')}">${escapeHtml(statusLabel(record.status))}</span>
        </div>
        <span class="muted mono">${escapeHtml(formatDate(inboxSubmittedAt(record)))}</span>
      </div>
      <p class="inbox-item-needs">${escapeHtml(inboxNeedsLine(record))}</p>
      ${message ? `<p class="inbox-item-message">${escapeHtml(message)}</p>` : ''}
      <div class="inbox-item-foot">
        <div class="inbox-item-contact">
          ${data.phone ? `<a href="tel:${escapeAttribute(String(data.phone).replace(/\s/g, ''))}" data-stop-open><i data-lucide="phone"></i> ${escapeHtml(data.phone)}</a>` : ''}
          ${data.email ? `<a href="mailto:${escapeAttribute(data.email)}" data-stop-open><i data-lucide="mail"></i> ${escapeHtml(data.email)}</a>` : ''}
          ${intake.hasWebsite ? `<span class="muted">${escapeHtml(intake.hasWebsite)}</span>` : ''}
        </div>
        <div class="inbox-item-actions">
          ${unread ? `<button class="button secondary small-button" type="button" data-inbox-read="${escapeAttribute(record.id)}" data-stop-open>${escapeHtml(tr('admin_btn_mark_read'))}</button>` : ''}
          <button class="button secondary small-button" type="button" data-open-lead="${escapeAttribute(record.id)}">${escapeHtml(tr('admin_btn_open_card'))}</button>
        </div>
      </div>
    </article>
  `;
}

function renderInbox() {
  if (!els.inboxList) return;
  const submissions = inboxSubmissions();
  const unreadCount = submissions.filter(inboxIsUnread).length;
  els.inboxList.innerHTML = submissions.length
    ? submissions.map(renderInboxCard).join('')
    : `<div class="list-item muted">${escapeHtml(tr('admin_inbox_empty'))}</div>`;
  if (els.inboxBadge) {
    els.inboxBadge.textContent = String(unreadCount);
    els.inboxBadge.classList.toggle('hidden-field', unreadCount === 0);
  }
  window.lucide?.createIcons();
}

function renderRuns() {
  const archived = state.historyView === 'archived';
  const target = archived ? els.archiveList : els.runsList;
  if (!target) return;
  target.innerHTML = state.runs.length
    ? state.runs.map((run) => renderRunItem(run, { selectable: !archived, archived })).join('')
    : `<div class="list-item muted">${escapeHtml(archived ? tr('admin_archive_empty') : tr('admin_history_list_empty'))}</div>`;
  renderHistorySelection();
}

function renderHistorySelection() {
  if (els.runsSelectedCount) els.runsSelectedCount.textContent = formatSelectedCount(state.runsSelected.size, state.runs.length);
  if (els.runsSelectAll) {
    els.runsSelectAll.checked = state.runs.length > 0 && state.runs.every((run) => state.runsSelected.has(String(run.id)));
  }
}

function renderWorkersSelection() {
  if (els.workersSelectedCount) els.workersSelectedCount.textContent = formatSelectedCount(state.workersSelected.size, state.workers.length);
  if (els.workersSelectAll) {
    const visible = state.workers.filter(workerMatchesSearch);
    els.workersSelectAll.checked = visible.length > 0 && visible.every((worker) => state.workersSelected.has(worker.workerId));
  }
}

function renderRunDetail() {
  if (!state.activeRun?.run) {
    els.runDetail.innerHTML = `<div class="muted">${escapeHtml(tr('admin_run_detail_placeholder'))}</div>`;
    return;
  }
  const { run, companies = [] } = state.activeRun;
  const queries = Array.isArray(run.generated_search_queries) ? run.generated_search_queries : [];
  els.runDetail.innerHTML = `
    <div class="run-detail-head">
      <div>
        <h3>${escapeHtml((run.niches || []).join(', ') || tr('admin_run_default_title'))}</h3>
        <p class="muted">${escapeHtml(formatDate(run.started_at))} · ${escapeHtml(tr('admin_run_worker_colon'))} ${escapeHtml(run.worker_id || '-')} · ${escapeHtml(run.city || '-')} · ${escapeHtml(tr('admin_run_radius_label'))} ${escapeHtml(run.radiusKm || '-')} km</p>
        ${queries.length ? `<p class="muted"><strong>${escapeHtml(tr('admin_run_search_queries_label'))}</strong> ${escapeHtml(queries.slice(0, 10).join(' | '))}</p>` : ''}
        <p><strong>${escapeHtml(tr('admin_label_ai_usage_colon'))}</strong> ${runAiCostLabel(run)}</p>
      </div>
      <div class="inline-actions">
        <button class="button danger" data-delete-run="${escapeAttribute(run.id)}">${escapeHtml(tr('btn_return_to_pool'))}</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>${escapeHtml(tr('admin_th_company'))}</th>
            <th>${escapeHtml(tr('admin_th_status'))}</th>
            <th>${escapeHtml(tr('admin_th_worker'))}</th>
            <th>${escapeHtml(tr('admin_th_contact'))}</th>
            <th>${escapeHtml(tr('admin_th_source'))}</th>
            <th>${escapeHtml(tr('admin_th_notes'))}</th>
            <th>${escapeHtml(tr('admin_th_actions'))}</th>
          </tr>
        </thead>
        <tbody>
          ${
            companies.length
              ? companies.map((record) => renderLeadRow(record, { selectable: true })).join('')
              : `<tr><td colspan="8" class="muted">${escapeHtml(tr('admin_run_no_active_leads'))}</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderAcademy() {
  els.academyList.innerHTML = state.academyUsers.length
    ? state.academyUsers
        .map((user) => {
          const completed = Array.isArray(user.completedModules) ? user.completedModules.length : 0;
          const avg = scoreValues(Object.values(user.quizScores || {}));
          return `
            <div class="list-item">
              <strong>${escapeHtml(user.displayName || user.userId)}</strong>
              <div class="muted mono">${escapeHtml(user.userId)} · ${escapeHtml(tr('admin_label_last_colon'))} ${escapeHtml(formatDate(user.lastActiveAt))}</div>
              <div>${escapeHtml(tr('admin_label_modules_colon'))} ${completed}/10 · ${escapeHtml(tr('admin_label_avg_score_colon'))} ${avg}%</div>
            </div>
          `;
        })
        .join('')
    : `<div class="list-item muted">${escapeHtml(tr('admin_academy_no_progress'))}</div>`;
}

function scoreValues(values) {
  const scores = values.map(Number).filter(Number.isFinite);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
}

// --- Academy detail: weak spots, AI-training history, AI usage/cost panel ---

const LEGACY_SERVICE_ID_ALIASES = { googleAds: 'googleads', metaAds: 'metaads', chatbot: 'aichatbot', automation: 'aiauto' };
// Values are i18n keys (see aiFeatureLabel/auditActionLabel/formatRunStatusLabel
// for the identical fallback pattern), not raw Polish text - these used to be
// hardcoded Polish strings that never routed through tr().
const ACADEMY_MODULE_LABELS = {
  scripts: 'admin_academy_module_scripts',
  objections: 'admin_academy_module_objections',
  statuses: 'admin_academy_module_statuses',
  qualification: 'admin_academy_module_qualification',
  final: 'admin_academy_module_final'
};

function academyModuleLabel(moduleKey) {
  const key = ACADEMY_MODULE_LABELS[moduleKey];
  if (!key) return moduleKey;
  const label = tr(key);
  return label === key ? moduleKey : label;
}

async function loadServiceCatalogNames() {
  if (state.serviceCatalogNames) return state.serviceCatalogNames;
  try {
    const mod = await import('../site/data/services.js');
    const map = {};
    (mod.serviceCategories || []).forEach((category) => {
      (category.services || []).forEach((service) => {
        map[service.id] = service.name;
      });
    });
    state.serviceCatalogNames = map;
  } catch {
    state.serviceCatalogNames = {};
  }
  return state.serviceCatalogNames;
}

function quizKeyLabel(key) {
  const raw = String(key || '');
  if (raw.startsWith('service-')) {
    let id = raw.slice('service-'.length);
    const questionMatch = id.match(/^(.*)-q(\d+)$/);
    const questionNumber = questionMatch ? Number(questionMatch[2]) + 1 : null;
    if (questionMatch) id = questionMatch[1];
    id = LEGACY_SERVICE_ID_ALIASES[id] || id;
    const name = (state.serviceCatalogNames && state.serviceCatalogNames[id]) || id;
    return questionNumber ? `${name} · ${tr('admin_quiz_question_word')} ${questionNumber}` : name;
  }
  const finalQuestionMatch = raw.match(/^final-q(\d+)$/);
  if (finalQuestionMatch) {
    return `${academyModuleLabel('final')} · ${tr('admin_quiz_question_word')} ${Number(finalQuestionMatch[1]) + 1}`;
  }
  if (raw.startsWith('qualification-match-')) {
    return `${tr('admin_quiz_match_service_label')} · ${tr('admin_quiz_case_word')} ${Number(raw.slice('qualification-match-'.length)) + 1}`;
  }
  return academyModuleLabel(raw);
}

function renderWorkerWeakSpots() {
  const box = els.workerWeakSpotsBox;
  if (!box) return;
  const academy = state.workerDetail?.worker?.academy;
  const weakSpots = academy?.weakSpots || [];
  if (!state.workerDetail?.worker) {
    box.innerHTML = `<div class="list-item muted">${escapeHtml(tr('empty_no_data'))}</div>`;
    return;
  }
  box.innerHTML = weakSpots.length
    ? weakSpots
        .map(
          (spot) => `
            <div class="list-item">
              <strong>${escapeHtml(quizKeyLabel(spot.key))}</strong>
              <span class="chip danger-chip">${escapeHtml(spot.score)}%</span>
            </div>
          `
        )
        .join('')
    : `<div class="list-item muted">${escapeHtml(tr('admin_worker_no_weak_spots'))}</div>`;
}

async function loadAiPersonas() {
  if (state.aiPersonas) return state.aiPersonas;
  try {
    const data = await api('/api/academy/ai-training/personas');
    state.aiPersonas = data.personas || [];
  } catch {
    state.aiPersonas = [];
  }
  return state.aiPersonas;
}

function personaLabel(clientType) {
  const persona = (state.aiPersonas || []).find((item) => item.id === clientType);
  return persona?.label || clientType || '-';
}

function aiTrainingSessionStatusText(session) {
  if (session.status !== 'completed') return tr('status_in_progress');
  const meeting = session.feedback?.meetingBooked ? tr('admin_meeting_short_yes') : tr('admin_meeting_short_no');
  return `${tr('admin_label_score')} ${session.score ?? 0}/100 · ${meeting}`;
}

function renderWorkerAiTraining() {
  const box = els.workerAiTrainingBox;
  if (!box) return;
  const sessions = state.workerAiTrainingSessions || [];
  if (els.workerAiTrainingBadge) els.workerAiTrainingBadge.textContent = sessions.length ? `${sessions.length}` : '';
  if (!state.workerDetail?.worker) {
    box.innerHTML = `<div class="list-item muted">${escapeHtml(tr('empty_no_data'))}</div>`;
    return;
  }
  box.innerHTML = sessions.length
    ? sessions
        .map(
          (session) => `
            <button type="button" class="list-item link-item" data-view-ai-session="${escapeAttribute(session.sessionId)}">
              <strong>${escapeHtml(personaLabel(session.clientType))}</strong>
              <div class="muted">${escapeHtml(formatDate(session.completedAt || session.createdAt))} · ${escapeHtml(aiTrainingSessionStatusText(session))}</div>
            </button>
          `
        )
        .join('')
    : `<div class="list-item muted">${escapeHtml(tr('admin_worker_no_ai_training'))}</div>`;
}

async function openAiTrainingDetail(sessionId) {
  if (!els.aiTrainingDetailModal) return;
  els.aiTrainingDetailBody.innerHTML = `<p class="muted">${escapeHtml(tr('admin_loading_generic'))}</p>`;
  els.aiTrainingDetailModal.classList.remove('hidden-panel');
  try {
    const data = await api(`/api/admin/ai-training/${encodeURIComponent(sessionId)}`);
    const session = data.session || {};
    const feedback = session.feedback || {};
    await loadAiPersonas();
    els.aiTrainingDetailBody.innerHTML = `
      <p><strong>${escapeHtml(tr('admin_label_client_type'))}</strong> ${escapeHtml(personaLabel(session.clientType))}</p>
      <p><strong>${escapeHtml(tr('admin_label_score'))}</strong> ${escapeHtml(session.score ?? 0)}/100 · ${feedback.meetingBooked ? escapeHtml(tr('admin_meeting_booked_yes')) : escapeHtml(tr('admin_meeting_booked_no'))}</p>
      <div class="dialogue-block">
        ${(session.messages || [])
          .map((message) => `<p><strong>${message.role === 'worker' ? escapeHtml(tr('admin_role_seller')) : escapeHtml(tr('admin_role_client'))}:</strong> ${escapeHtml(message.text)}</p>`)
          .join('')}
      </div>
      ${feedback.good?.length ? `<h4>${escapeHtml(tr('admin_feedback_good_heading'))}</h4><ul>${feedback.good.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
      ${feedback.bad?.length ? `<h4>${escapeHtml(tr('admin_feedback_bad_heading'))}</h4><ul>${feedback.bad.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
      ${feedback.improvements?.length ? `<h4>${escapeHtml(tr('admin_feedback_improve_heading'))}</h4><ul>${feedback.improvements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
    `;
  } catch (error) {
    els.aiTrainingDetailBody.innerHTML = `<p class="feedback bad">${escapeHtml(error.message || tr('admin_error_fetch_transcript'))}</p>`;
  }
}

// Learning-path stage a worker is currently on (services -> training ->
// scripts -> AI trainer), matching public/academy/app.js's STAGE_GATES and
// store.js's currentLearningStage() so this label always means the same
// thing as what actually gates the worker's navigation.
const STAGE_CHIP_CLASS = {
  Usługi: 'chip',
  Szkolenie: 'chip ok-chip',
  Skrypty: 'chip ok-chip',
  'Trener AI': 'chip ok-chip',
  Ukończono: 'chip ok-chip'
};

function renderAcademyOverview() {
  const body = els.academyOverviewBody;
  if (!body) return;
  if (!state.workers.length) {
    body.innerHTML = `<tr><td colspan="13" class="muted">${escapeHtml(tr('admin_no_workers'))}</td></tr>`;
    return;
  }
  body.innerHTML = state.workers
    .map((worker) => {
      const academy = worker.academy || {};
      const weak = academy.weakSpots || [];
      const stage = academy.currentStage || 'Usługi';
      const stageClass = STAGE_CHIP_CLASS[stage] || 'chip';
      return `
        <tr>
          <td><strong>${escapeHtml(worker.displayName || worker.workerId)}</strong><div class="muted mono">${escapeHtml(worker.workerId)}</div></td>
          <td><span class="${stageClass}">${escapeHtml(stageLabel(stage))}</span></td>
          <td>${escapeHtml(academy.servicesPercent || 0)}%</td>
          <td>${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)}</td>
          <td>${escapeHtml(academy.scriptsPercent || 0)}%</td>
          <td>${escapeHtml(academy.averageQuizScore || 0)}%</td>
          <td>${weak.length ? `<span class="chip danger-chip">${escapeHtml(tr('admin_weak_spots_count_template', { n: weak.length }))}</span>` : `<span class="chip ok-chip">${escapeHtml(tr('admin_weak_spots_none'))}</span>`}</td>
          <td>${escapeHtml(academy.aiTrainingCompleted || 0)}/${escapeHtml(academy.aiTrainingSessions || 0)}</td>
          <td>${escapeHtml(academy.averageAiTrainingScore || 0)}%</td>
          <td>${escapeHtml(academy.aiMeetingBookedRate || 0)}%</td>
          <td>${escapeHtml(tr('admin_academy_ai_usage_template', { count: academy.aiUsageCount || 0, cost: (academy.aiUsageCost || 0).toFixed(2) }))}</td>
          <td>${escapeHtml(formatDate(academy.lastActiveAt))}</td>
          <td><button class="button secondary small-button" data-open-worker-academy="${escapeAttribute(worker.workerId)}">${escapeHtml(tr('admin_btn_open_profile'))}</button></td>
        </tr>
      `;
    })
    .join('');
}

async function loadAiUsage(period = state.aiUsagePeriod) {
  try {
    state.aiUsage = await api(`/api/admin/ai-usage?period=${encodeURIComponent(period)}`);
  } catch {
    state.aiUsage = null;
  }
  renderAiUsage();
}

function renderAiUsage() {
  const usage = state.aiUsage;
  if (els.aiUsageTotals) {
    els.aiUsageTotals.innerHTML = [
      [tr('admin_stat_ai_requests'), usage?.totalRequests ?? 0],
      [tr('admin_th_tokens'), (usage?.totalTokens ?? 0).toLocaleString('pl-PL')],
      [tr('admin_stat_estimated_cost'), `$${(usage?.totalCost ?? 0).toFixed(2)}`]
    ]
      .map(([label, value]) => `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
      .join('');
  }
  if (els.aiUsageByWorkerBody) {
    const rows = usage?.byWorker || [];
    els.aiUsageByWorkerBody.innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.workerId || tr('admin_value_unknown'))}</td>
                <td>${escapeHtml(row.requests)}</td>
                <td>${escapeHtml(row.tokens.toLocaleString('pl-PL'))}</td>
                <td>$${escapeHtml(row.cost.toFixed(4))}</td>
              </tr>
            `
          )
          .join('')
      : `<tr><td colspan="4" class="muted">${escapeHtml(tr('admin_no_data_period'))}</td></tr>`;
  }
  if (els.aiUsageByFeatureBody) {
    const rows = usage?.byFeature || [];
    els.aiUsageByFeatureBody.innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(aiFeatureLabel(row.feature))}</td>
                <td>${escapeHtml(row.requests)}</td>
                <td>${escapeHtml(row.tokens.toLocaleString('pl-PL'))}</td>
                <td>$${escapeHtml(row.cost.toFixed(4))}</td>
              </tr>
            `
          )
          .join('')
      : `<tr><td colspan="4" class="muted">${escapeHtml(tr('admin_no_data_period'))}</td></tr>`;
  }
}

// --- AI Search: admin settings form + jobs monitoring table ---
// Client-side mirror of store.js's DEFAULT_SETTINGS, used only to pre-fill
// the form before the first successful GET /api/admin/settings resolves -
// the server's clamped/validated values always win once loaded.
const AI_SEARCH_DEFAULT_SETTINGS = {
  aiCompanySearchModel: '',
  aiCompanyEnrichModel: '',
  aiWebSearchEnabled: true,
  aiReasoningEffort: 'medium',
  aiMaxParallelRequests: 3,
  aiMaxCompaniesPerRequest: 20,
  aiDailyBudgetLimit: 0,
  aiRequestTimeoutSeconds: 120
};

async function loadAiSearchSettings() {
  try {
    const data = await api('/api/admin/settings');
    state.aiSearchSettings = data.settings || null;
  } catch {
    state.aiSearchSettings = null;
  }
  renderAiSearchSettingsForm();
}

// Fills the settings form from state.aiSearchSettings (or the client-side
// defaults while nothing has loaded yet). Only called on tab activation and
// right after a save resolves - NOT from the main render() loop, since that
// runs after almost every admin action and would otherwise wipe out
// in-progress edits the admin hasn't submitted yet.
function renderAiSearchSettingsForm() {
  const form = els.aiSearchSettingsForm;
  if (!form) return;
  const settings = { ...AI_SEARCH_DEFAULT_SETTINGS, ...(state.aiSearchSettings || {}) };
  if (form.elements.aiCompanySearchModel) form.elements.aiCompanySearchModel.value = settings.aiCompanySearchModel || '';
  if (form.elements.aiCompanyEnrichModel) form.elements.aiCompanyEnrichModel.value = settings.aiCompanyEnrichModel || '';
  if (form.elements.aiWebSearchEnabled) form.elements.aiWebSearchEnabled.checked = Boolean(settings.aiWebSearchEnabled);
  if (form.elements.aiReasoningEffort) form.elements.aiReasoningEffort.value = settings.aiReasoningEffort || 'medium';
  if (form.elements.aiMaxParallelRequests) form.elements.aiMaxParallelRequests.value = settings.aiMaxParallelRequests ?? 3;
  if (form.elements.aiMaxCompaniesPerRequest) form.elements.aiMaxCompaniesPerRequest.value = settings.aiMaxCompaniesPerRequest ?? 20;
  if (form.elements.aiDailyBudgetLimit) form.elements.aiDailyBudgetLimit.value = settings.aiDailyBudgetLimit ?? 0;
  if (form.elements.aiRequestTimeoutSeconds) form.elements.aiRequestTimeoutSeconds.value = settings.aiRequestTimeoutSeconds ?? 120;
}

// PATCHes only the 8 admin-configurable fields, then reloads the form from
// the response so any value the server clamped (e.g. 999 -> 10 for max
// parallel requests) is reflected back rather than trusting what was typed.
async function saveAiSearchSettingsFromForm(form) {
  const formData = new FormData(form);
  const payload = {
    aiCompanySearchModel: String(formData.get('aiCompanySearchModel') || '').trim(),
    aiCompanyEnrichModel: String(formData.get('aiCompanyEnrichModel') || '').trim(),
    aiWebSearchEnabled: formData.get('aiWebSearchEnabled') === 'on',
    aiReasoningEffort: String(formData.get('aiReasoningEffort') || 'medium'),
    aiMaxParallelRequests: Number(formData.get('aiMaxParallelRequests')),
    aiMaxCompaniesPerRequest: Number(formData.get('aiMaxCompaniesPerRequest')),
    aiDailyBudgetLimit: Number(formData.get('aiDailyBudgetLimit')),
    aiRequestTimeoutSeconds: Number(formData.get('aiRequestTimeoutSeconds'))
  };
  const data = await api('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) });
  state.aiSearchSettings = data.settings || null;
  renderAiSearchSettingsForm();
  showToast(tr('admin_toast_ai_search_settings_saved'));
}

// Stages an admin can still cancel from - mirrors the task's definition
// (intentionally includes PAUSED: an admin should be able to cancel a job
// someone paused, even though the backend's own AI_SEARCH_TERMINAL_STAGES
// set treats PAUSED as "already finished" for its own idempotency check -
// calling cancel on a paused job just returns {ok:true, alreadyFinished:true},
// which is harmless).
const AI_SEARCH_NON_TERMINAL_STAGES = new Set([
  'QUEUED', 'PLANNING', 'SEARCHING', 'VALIDATING', 'ENRICHING', 'SCORING', 'SAVING', 'PAUSED'
]);

// Same fallback pattern as formatRunStatusLabel/aiFeatureLabel: unknown/future
// stage codes fall back to the raw value instead of crashing or rendering blank.
function aiSearchJobStageLabel(stage) {
  const key = `admin_ai_search_stage_${String(stage || '').toLowerCase()}`;
  const label = tr(key);
  return label === key ? String(stage || '-') : label;
}

function aiSearchJobStageBadgeClass(stage) {
  if (stage === 'COMPLETED') return 'badge';
  if (stage === 'FAILED' || stage === 'CANCELLED') return 'badge badge-fail';
  if (stage === 'PARTIAL') return 'badge badge-archived';
  return 'badge badge-progress';
}

function aiSearchJobModeLabel(mode) {
  const key = `admin_ai_search_mode_${mode}`;
  const label = tr(key);
  return label === key ? String(mode || '-') : label;
}

function aiSearchJobProgressSummary(job) {
  const progress = job?.progress || {};
  return tr('admin_ai_search_progress_template', {
    saved: progress.saved ?? 0,
    found: progress.candidates_found ?? 0,
    rejected: progress.rejected ?? 0
  });
}

async function loadAiSearchJobs() {
  try {
    const data = await api('/api/admin/ai-search/jobs');
    state.aiSearchJobs = data.jobs || [];
  } catch {
    state.aiSearchJobs = [];
  }
  renderAiSearchJobs();
}

function renderAiSearchJobs() {
  if (!els.aiSearchJobsBody) return;
  const jobs = state.aiSearchJobs || [];
  els.aiSearchJobsBody.innerHTML = jobs.length
    ? jobs
        .map((job) => {
          const cancellable = AI_SEARCH_NON_TERMINAL_STAGES.has(job.stage);
          return `
            <tr>
              <td>${escapeHtml(formatDate(job.created_at))}</td>
              <td class="mono">${escapeHtml(job.creator_worker_id || '-')}</td>
              <td>${escapeHtml(aiSearchJobModeLabel(job.mode))}</td>
              <td><span class="${aiSearchJobStageBadgeClass(job.stage)}">${escapeHtml(aiSearchJobStageLabel(job.stage))}</span></td>
              <td>${escapeHtml(aiSearchJobProgressSummary(job))}</td>
              <td>$${(Number(job.estimated_cost) || 0).toFixed(2)}</td>
              <td>${
                cancellable
                  ? `<button class="button secondary small-button" type="button" data-cancel-ai-search-job="${escapeAttribute(job.id)}">${escapeHtml(tr('admin_btn_cancel_job'))}</button>`
                  : ''
              }</td>
            </tr>
          `;
        })
        .join('')
    : `<tr><td colspan="7" class="muted">${escapeHtml(tr('admin_ai_search_jobs_empty'))}</td></tr>`;
}

async function cancelAiSearchJob(jobId) {
  await api(`/api/ai-search/jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: 'admin_cancelled' })
  });
  showToast(tr('admin_toast_ai_search_job_cancelled'));
  await loadAiSearchJobs();
}

async function loadWorkerAiTrainingSessions(workerId) {
  if (!workerId) {
    state.workerAiTrainingSessions = [];
    return;
  }
  try {
    const data = await api(`/api/admin/workers/${encodeURIComponent(workerId)}/ai-training`);
    state.workerAiTrainingSessions = data.sessions || [];
  } catch {
    state.workerAiTrainingSessions = [];
  }
}

// Falls back to the raw backend action code for any action type not covered
// by an admin_audit_action_* i18n key, so unknown/future codes never crash
// or render blank - they just stay untranslated until a key is added.
function auditActionLabel(action) {
  const key = `admin_audit_action_${action}`;
  const label = tr(key);
  return label === key ? String(action || '-') : label;
}

function renderAudit() {
  const auditList = document.querySelector('#auditList');
  if (!auditList) return;
  auditList.innerHTML = state.audit.length
    ? state.audit
        .map((action) => `
          <div class="list-item audit-item">
            <div>
              <strong>${escapeHtml(auditActionLabel(action.action))}</strong>
              <div class="muted">${escapeHtml(action.targetType || '-')} · ${escapeHtml(action.targetId || '-')} · ${escapeHtml(action.adminId || 'admin')}</div>
            </div>
            <span class="muted">${escapeHtml(formatDate(action.createdAt))}</span>
          </div>
        `)
        .join('')
    : `<div class="list-item muted">${escapeHtml(tr('admin_audit_empty'))}</div>`;
}

function renderSelectedCount() {
  els.selectedCount.textContent = formatSelectedCount(state.selected.size, state.leads.length);
}

// Language toggle (PL/RU) shown in the header, next to Parser/Akademia/Odswiez.
// 'en' entries exist in the dict but stay best-effort/secondary - only pl/ru
// are surfaced as toggle chips, matching the rest of the app.
function renderLangSwitch() {
  const container = document.querySelector('#adminLangSwitch');
  if (!container) return;
  const lang = currentAdminLang();
  const codes = (window.AuraI18n?.supportedLanguages || ['pl', 'ru']).filter((code) => code !== 'en');
  container.innerHTML = codes
    .map((code) => `<button type="button" class="lang-chip ${lang === code ? 'active' : ''}" data-set-lang="${code}">${code.toUpperCase()}</button>`)
    .join('');
}

// Applies translated text/placeholders/titles/aria-labels to every piece of
// admin chrome that is baked into static HTML (data-i18n[-placeholder|-title|
// -aria-label] attributes in index.html) plus the handful of elements that
// ensureEnhancements() builds once via JS. Called once on load and again
// after every language switch; render() also calls it every re-render since
// it's cheap and idempotent - static chrome never conflicts with the dynamic
// content the render*() functions below write with their own tr() calls.
function applyAdminStaticChrome() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = tr(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', tr(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', tr(el.dataset.i18nTitle));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', tr(el.dataset.i18nAriaLabel));
  });
  renderLangSwitch();
  syncStatusFilterOptions();
  syncPoolFilterOptions();
  refreshEnhancementChrome();
  window.lucide?.createIcons();
}

function render() {
  applyAdminStaticChrome();
  renderStats();
  renderWorkers();
  renderWorkerDetail();
  renderLeads();
  renderInbox();
  renderRuns();
  renderRunDetail();
  renderHistoryState();
  renderAcademy();
  renderAcademyOverview();
  renderWorkerWeakSpots();
  renderWorkerAiTraining();
  // Re-renders the AI-usage "By worker"/"By feature" tables from the already
  // -loaded state.aiUsage (no re-fetch) - without this, aiFeatureLabel()'s
  // language-aware feature names go stale after a language switch, since
  // render() is what a language switch calls to refresh the whole page.
  renderAiUsage();
  // Re-renders the AI Search jobs table from the already-loaded
  // state.aiSearchJobs (no re-fetch) - same reasoning as renderAiUsage()
  // above: keeps stage/mode labels translated after a language switch.
  // The settings form is deliberately NOT re-rendered here - see
  // renderAiSearchSettingsForm()'s comment.
  renderAiSearchJobs();
  renderAudit();
  renderSelectedCount();
  wireCrossAppLinks();
  window.lucide?.createIcons();
}

async function resetIds(ids) {
  if (!ids.length) return;
  await api('/api/admin/leads/reset', {
    method: 'POST',
    body: JSON.stringify({ ids, adminId: 'admin' })
  });
  showToast(tr('admin_toast_returned_to_pool_count_template', { n: ids.length }));
  await loadAll();
}

async function updateLeadStatus(id, status) {
  await api(`/api/leads/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, adminId: 'admin' })
  });
  showToast(tr('admin_toast_status_saved'));
  await loadAll();
}

async function openRun(runId) {
  state.activeRun = await api(`/api/admin/runs/${encodeURIComponent(runId)}`);
  renderRunDetail();
  // The run-detail view lives in the Historia tab (single source of truth for
  // "open a query and see its leads/status/notes"), so opening a run from a
  // worker's profile jumps there too instead of rendering into a hidden tab.
  switchAdminTab('history');
  els.runDetail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.lucide?.createIcons();
}

function findRunCompanyCount(runId) {
  const run = state.runs.find((item) => String(item.id) === String(runId));
  return run ? Number(run.found_count || 0) : null;
}

// A. "Wroc zapytanie do puli i zarchiwizuj" - archives the query entry AND
// frees its leads. Never a hard delete: see store.returnRunToPool.
async function deleteRun(runId) {
  const companyCount = findRunCompanyCount(runId);
  const countSuffix = companyCount != null ? tr('admin_run_company_count_template', { n: companyCount }) : '';
  if (!window.confirm(tr('admin_confirm_delete_run_template', { count: countSuffix }))) return;
  const data = await api(`/api/admin/runs/${encodeURIComponent(runId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ adminId: 'admin' })
  });
  state.activeRun = null;
  showToast(
    data.alreadyReturned
      ? tr('admin_toast_already_returned')
      : tr('admin_toast_query_returned_template', { n: data.result?.returned?.length || 0, m: data.result?.alreadyInPool?.length || 0 })
  );
  await loadAll();
}

async function openLead(leadId) {
  state.activeLead = await api(`/api/admin/leads/${encodeURIComponent(leadId)}`);
  renderLeadModal();
}

function renderLeadModal() {
  const detail = state.activeLead;
  if (!detail?.company) return;
  const record = detail.company;
  const data = record.data || {};
  const ai = record.aiSiteAnalysis?.data || record.aiSiteAnalysis || {};
  const history = Array.isArray(record.status_history) ? record.status_history : [];
  const inbound = isInboundLead(record);
  const intake = data.intake || {};
  const selectedServices = Array.isArray(data.services) ? data.services.join(', ') : '';
  const rawCategoryMatch = data.category_match || ai.categoryMatch || '';
  const categoryMatchDisplay = rawCategoryMatch ? categoryMatchLabel(rawCategoryMatch) : '-';
  let modal = document.querySelector('#leadModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'leadModal';
    modal.className = 'modal-backdrop';
    document.body.append(modal);
  }
  modal.innerHTML = `
    <div class="modal-card lead-modal-card">
      <div class="modal-head">
        <div>
          <p class="eyebrow">${escapeHtml(tr('admin_lead_card_eyebrow'))}</p>
          <h2>${escapeHtml(leadName(record))}</h2>
          <p class="muted">${escapeHtml([leadCategory(record), data.city, data.address].filter(Boolean).join(' · ') || '-')}</p>
        </div>
        <button class="button secondary" data-close-modal>${escapeHtml(tr('btn_close'))}</button>
      </div>
      <div class="lead-modal-grid">
        <section class="sub-panel">
          <h3>${escapeHtml(tr('admin_lead_data_heading'))}</h3>
          <p><strong>${escapeHtml(tr('admin_label_status'))}</strong> ${escapeHtml(statusLabel(record.status))}</p>
          <p><strong>${escapeHtml(tr('admin_label_pool'))}</strong> ${escapeHtml(poolLabel(record.pool_state))}</p>
          <p><strong>${escapeHtml(tr('admin_label_worker'))}</strong> ${escapeHtml(record.assigned_worker_id || record.first_assigned_worker_id || '-')}</p>
          <p><strong>${escapeHtml(tr('admin_label_phone'))}</strong> ${escapeHtml(data.phone || '-')}</p>
          <p><strong>${escapeHtml(tr('admin_label_email'))}</strong> ${escapeHtml(data.email || '-')}</p>
          <p><strong>${escapeHtml(tr('admin_label_site_source'))}</strong> ${leadSource(record) === '-' ? '-' : `<a href="${escapeAttribute(leadSource(record))}" target="_blank" rel="noreferrer">${escapeHtml(leadSource(record))}</a>`}</p>
          ${
            inbound
              ? `
                <p><strong>${escapeHtml(tr('admin_label_type'))}</strong> ${escapeHtml(tr('admin_value_inbound_submission'))}</p>
                <p><strong>${escapeHtml(tr('admin_label_services'))}</strong> ${escapeHtml(selectedServices || '-')}</p>
                <p><strong>${escapeHtml(tr('admin_label_goal'))}</strong> ${escapeHtml(intake.goal || '-')}</p>
                <p><strong>${escapeHtml(tr('admin_label_budget'))}</strong> ${escapeHtml(intake.budget || '-')}</p>
                <p><strong>${escapeHtml(tr('admin_label_has_website'))}</strong> ${escapeHtml(intake.hasWebsite || '-')}</p>
                <p><strong>${escapeHtml(tr('admin_label_message'))}</strong> ${escapeHtml(data.notes || '-')}</p>
              `
              : ''
          }
        </section>
        <section class="sub-panel">
          <h3>${escapeHtml(tr('admin_lead_category_ai_heading'))}</h3>
          <p><strong>${escapeHtml(tr('admin_label_actual_type'))}</strong> ${escapeHtml(data.actual_business_type || ai.actualBusinessType || '-')}</p>
          <p><strong>${escapeHtml(tr('admin_label_category_match'))}</strong> ${escapeHtml(categoryMatchDisplay)} · ${escapeHtml(categoryScore(record))}/100</p>
          <p><strong>${escapeHtml(tr('admin_label_should_call'))}</strong> ${data.should_call === false || ai.shouldCall === false ? escapeHtml(tr('admin_value_no')) : escapeHtml(tr('admin_value_yes_check'))}</p>
          <p><strong>${escapeHtml(tr('admin_label_ai_score'))}</strong> ${escapeHtml(aiScore(record))}</p>
          <p><strong>${escapeHtml(tr('admin_label_opening'))}</strong> ${escapeHtml(ai.personalizedCallIntro || ai.personal_argument || record.analysis?.first_message_pl || '-')}</p>
          <p><strong>${escapeHtml(tr('admin_label_ai_usage_colon'))}</strong> ${companyAiCostLabel(record.id)}</p>
        </section>
        <section class="sub-panel">
          <h3>${escapeHtml(tr('admin_lead_history_heading'))}</h3>
          ${history.length ? history.slice(-12).reverse().map((item) => `<p class="muted">${escapeHtml(formatDate(item.createdAt))} · ${escapeHtml(statusLabel(item.status))} · ${escapeHtml(item.workerId || '')} ${item.note ? `· ${escapeHtml(item.note)}` : ''}</p>`).join('') : `<p class="muted">${escapeHtml(tr('admin_no_status_history'))}</p>`}
        </section>
        <section class="sub-panel">
          <h3>${escapeHtml(tr('admin_lead_management_heading'))}</h3>
          ${statusSelect(record)}
          <div class="inline-actions modal-actions">
            <button class="button secondary" data-reset-one="${escapeAttribute(record.id)}">${escapeHtml(tr('btn_return_to_pool'))}</button>
          </div>
        </section>
      </div>
    </div>
  `;
}

function openWorkerDialog() {
  let modal = document.querySelector('#workerDialog');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'workerDialog';
    modal.className = 'modal-backdrop';
    document.body.append(modal);
  }
  modal.innerHTML = `
    <form class="modal-card worker-form" id="createWorkerForm">
      <div class="modal-head">
        <h2>${escapeHtml(tr('btn_create_worker'))}</h2>
        <button class="button secondary" type="button" data-close-modal>${escapeHtml(tr('btn_close'))}</button>
      </div>
      <label>${escapeHtml(tr('admin_field_display_name'))}<input name="displayName" required autocomplete="off" /></label>
      <label>${escapeHtml(tr('admin_field_login'))}<input name="login" required autocomplete="off" /></label>
      <label>${escapeHtml(tr('admin_field_password'))}<input name="password" required autocomplete="new-password" /></label>
      <label>${escapeHtml(tr('admin_field_language'))}
        <select name="language">
          <option value="ru">RU</option>
          <option value="pl">PL</option>
          <option value="en">EN</option>
        </select>
      </label>
      <label>${escapeHtml(tr('admin_field_daily_lead_limit'))}<input type="number" name="dailyLeadLimit" min="0" placeholder="0 = без лимита" /></label>
      <label class="toggle-row"><input name="active" type="checkbox" checked /> ${escapeHtml(tr('admin_field_active'))}</label>
      <button class="button primary" type="submit">${escapeHtml(tr('admin_btn_create_account'))}</button>
    </form>
  `;
}

// Phone numbers/passwords pasted from WhatsApp/Telegram contact lists or
// notes apps often carry invisible Unicode bidi-formatting marks around the
// visible text. Left in, the stored login/password silently stops matching
// whatever the worker actually types to sign in - strip them before this
// ever reaches the server, so the admin sees (and sends) the clean value.
function stripInvisibleFormatting(value) {
  return String(value || '').replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '');
}

async function createWorkerFromForm(form) {
  const formData = new FormData(form);
  const worker = {
    displayName: formData.get('displayName'),
    login: stripInvisibleFormatting(formData.get('login')),
    password: stripInvisibleFormatting(formData.get('password')),
    language: formData.get('language'),
    active: formData.get('active') === 'on',
    dailyLeadLimit: Number(formData.get('dailyLeadLimit')) || 0,
    adminId: 'admin'
  };
  await api('/api/admin/workers', {
    method: 'POST',
    body: JSON.stringify(worker)
  });
  document.querySelector('#workerDialog')?.remove();
  showToast(tr('toast_worker_created'));
  await loadAll({ keepSelection: false });
}

async function changeWorkerPassword(workerId) {
  const password = stripInvisibleFormatting(window.prompt(tr('admin_prompt_new_password_template', { workerId })));
  if (!password) return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ password, adminId: 'admin' })
  });
  showToast(tr('admin_toast_password_changed'));
  await loadAll();
}

async function changeWorkerDailyLimit(workerId) {
  const worker = state.workers.find((item) => item.workerId === workerId);
  const current = worker?.dailyLeadLimit || 0;
  const input = window.prompt(tr('admin_prompt_daily_lead_limit_template', { workerId }), String(current));
  if (input === null) return;
  const dailyLeadLimit = Number(input) > 0 ? Math.floor(Number(input)) : 0;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ dailyLeadLimit, adminId: 'admin' })
  });
  showToast(tr('admin_toast_daily_lead_limit_updated'));
  await loadAll();
}

async function toggleWorker(workerId) {
  const worker = state.workers.find((item) => item.workerId === workerId);
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: worker?.active === false, adminId: 'admin' })
  });
  showToast(tr('admin_toast_worker_updated'));
  await loadAll();
}

async function resetWorkerLeads(workerId) {
  if (!window.confirm(tr('admin_confirm_reset_worker_leads_template', { workerId }))) return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}/reset-leads`, {
    method: 'POST',
    body: JSON.stringify({ adminId: 'admin' })
  });
  showToast(tr('admin_toast_worker_leads_returned'));
  await loadAll();
}

async function clearWorkerHistory(workerId) {
  const confirmation = window.prompt(tr('admin_prompt_clear_history_template', { workerId }));
  if (confirmation !== 'DELETE') return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}/history`, {
    method: 'DELETE',
    body: JSON.stringify({ adminId: 'admin', confirm: 'DELETE' })
  });
  showToast(tr('admin_toast_worker_history_cleared'));
  await loadAll();
}

async function deleteWorker(workerId) {
  const confirmation = window.prompt(tr('admin_prompt_delete_worker_template', { workerId }));
  if (confirmation !== 'DELETE') return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ adminId: 'admin', confirm: 'DELETE' })
  });
  if (state.selectedWorkerId === workerId) {
    state.selectedWorkerId = '';
    state.workerDetail = null;
  }
  showToast(tr('admin_toast_worker_deleted'));
  await loadAll({ keepSelection: false });
}

function bindLeadTable(table) {
  table.addEventListener('change', async (event) => {
    const checkbox = event.target.closest('[data-select]');
    if (checkbox) {
      if (checkbox.checked) state.selected.add(checkbox.dataset.select);
      else state.selected.delete(checkbox.dataset.select);
      renderSelectedCount();
      return;
    }

    const statusSelectEl = event.target.closest('[data-status-lead]');
    if (statusSelectEl) await updateLeadStatus(statusSelectEl.dataset.statusLead, statusSelectEl.value);
  });

  table.addEventListener('click', async (event) => {
    const open = event.target.closest('[data-open-lead]');
    if (open) await openLead(open.dataset.openLead);

    const reset = event.target.closest('[data-reset-one]');
    if (reset) await resetIds([reset.dataset.resetOne]);
  });
}

function readHistoryFilters() {
  if (!els.historyFiltersForm) return null;
  const formData = new FormData(els.historyFiltersForm);
  const filters = {
    country: String(formData.get('country') || '').trim(),
    city: String(formData.get('city') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    workerId: String(formData.get('workerId') || '').trim(),
    status: String(formData.get('status') || '').trim(),
    dateFrom: String(formData.get('dateFrom') || '').trim(),
    dateTo: String(formData.get('dateTo') || '').trim()
  };
  return Object.values(filters).some(Boolean) ? filters : null;
}

// Central loader for the Historia panel. Always goes through
// /api/admin/history so the Aktywne/Zakończone/Zwrócone do puli/Archiwum
// tabs and the country/city/category/worker/date filters stay in sync -
// nothing here can ever delete a run, only change which bucket it's shown in.
async function loadHistoryRuns() {
  state.historyLoading = true;
  state.historyError = '';
  renderHistoryState();
  try {
    const filters = readHistoryFilters() || {};
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (String(value || '').trim()) params.set(key, String(value).trim());
    }
    params.set('view', state.historyView);
    params.set('limit', '300');
    const data = await api(`/api/admin/history?${params.toString()}`);
    state.runs = data.runs || [];
  } catch (error) {
    state.historyError = error.message || 'Nie udało się załadować historii.';
    state.runs = [];
  } finally {
    state.historyLoading = false;
  }
  renderRuns();
  renderHistoryState();
}

function formatSelectedCount(count, total) {
  if (!count) return tr('admin_bulk_none_selected');
  return total ? tr('admin_bulk_selected_template', { n: count, total }) : tr('admin_bulk_selected_bare_template', { n: count });
}

function renderHistoryState() {
  if (!els.historyStateMessage) return;
  if (state.historyLoading) {
    els.historyStateMessage.textContent = tr('admin_history_loading');
    els.historyStateMessage.className = 'history-state-message loading';
    return;
  }
  if (state.historyError) {
    els.historyStateMessage.textContent = state.historyError;
    els.historyStateMessage.className = 'history-state-message error';
    return;
  }
  if (!state.runs.length && state.historyView !== 'archived') {
    els.historyStateMessage.textContent = tr('admin_history_empty');
    els.historyStateMessage.className = 'history-state-message empty';
    return;
  }
  els.historyStateMessage.className = 'history-state-message hidden-panel';
}

function switchHistoryView(view) {
  state.historyView = view;
  state.runsSelected.clear();
  els.historyViewTabs?.querySelectorAll('[data-history-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.historyView === view);
  });
  els.runsList?.classList.toggle('hidden-panel', view === 'archived');
  els.archiveList?.classList.toggle('hidden-panel', view !== 'archived');
  els.historyBulkBar?.classList.toggle('hidden-panel', view === 'archived');
  loadHistoryRuns();
}

// "Wroc zaznaczone zapytania do puli" - explicit selection, no filters
// involved, so it's allowed even with nothing else set.
async function historyBulkReturnSelected(runIds) {
  if (!runIds.length) return showToast(tr('admin_warn_select_history_entries'), 'warn');
  if (!window.confirm(tr('admin_confirm_return_selected_runs_template', { n: runIds.length }))) return;
  const data = await api('/api/admin/history/return-to-pool', {
    method: 'POST',
    body: JSON.stringify({ runIds, adminId: 'admin' })
  });
  state.runsSelected.clear();
  if (state.activeRun?.run && runIds.includes(String(state.activeRun.run.id))) state.activeRun = null;
  showToast(
    tr('admin_toast_history_returned_template', {
      n: data.returnedRunCount || 0,
      m: data.result?.returned?.length || 0,
      k: data.result?.alreadyInPool?.length || 0
    })
  );
  await loadAll();
}

// Preview-first bulk return by filters. Blocked server-side (and here) when
// no filter is set, so a stray click can never touch the whole database.
async function historyPreviewByFilter() {
  const filters = readHistoryFilters();
  if (!filters) return showToast(tr('admin_warn_set_filter_first'), 'warn');
  try {
    const params = new URLSearchParams(filters);
    const preview = await api(`/api/admin/history/preview?${params.toString()}`);
    state.historyPreview = { filters, ...preview };
    state.historyPreviewExcluded = new Set();
    renderHistoryPreview();
  } catch (error) {
    showToast(error.message || tr('admin_warn_preview_build_failed'), 'warn');
  }
}

function renderHistoryPreview() {
  if (!els.historyPreviewPanel) return;
  const preview = state.historyPreview;
  if (!preview) {
    els.historyPreviewPanel.className = 'history-preview-panel hidden-panel';
    els.historyPreviewPanel.innerHTML = '';
    return;
  }
  const includedCount = preview.matchedRunCount - state.historyPreviewExcluded.size;
  els.historyPreviewPanel.className = 'history-preview-panel';
  els.historyPreviewPanel.innerHTML = `
    <div class="history-preview-summary">
      <strong>${escapeHtml(tr('admin_preview_matching_queries'))} ${preview.matchedRunCount}</strong>
      <span>${escapeHtml(tr('admin_preview_unique_companies'))} ${preview.matchedCompanyCount}</span>
      <span>${escapeHtml(tr('admin_preview_new'))} ${preview.newCount}</span>
      <span>${escapeHtml(tr('admin_preview_duplicates'))} ${preview.duplicateCount}</span>
      <span>${escapeHtml(tr('admin_preview_workers'))} ${preview.workerCount}</span>
    </div>
    <div class="history-preview-list">
      ${preview.runs
        .map(
          (run) => `
        <label class="history-preview-item">
          <input type="checkbox" data-preview-exclude="${escapeAttribute(run.id)}" ${state.historyPreviewExcluded.has(String(run.id)) ? '' : 'checked'} />
          <span>${escapeHtml((run.niches || []).join(', ') || tr('admin_run_default_title'))} · ${escapeHtml(run.city || '-')} · ${escapeHtml(tr('admin_run_worker_colon'))} ${escapeHtml(run.worker_id || '-')} · ${escapeHtml(formatDate(run.started_at))}</span>
        </label>`
        )
        .join('')}
    </div>
    <div class="history-preview-actions">
      <button id="historyPreviewConfirm" class="button danger" type="button">${escapeHtml(tr('admin_preview_confirm_template', { n: includedCount }))}</button>
      <button id="historyPreviewCancel" class="button secondary" type="button">${escapeHtml(tr('btn_cancel'))}</button>
    </div>
  `;
  els.historyPreviewPanel.querySelectorAll('[data-preview-exclude]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = String(checkbox.dataset.previewExclude);
      if (checkbox.checked) state.historyPreviewExcluded.delete(id);
      else state.historyPreviewExcluded.add(id);
      renderHistoryPreview();
    });
  });
  els.historyPreviewPanel.querySelector('#historyPreviewCancel')?.addEventListener('click', () => {
    state.historyPreview = null;
    renderHistoryPreview();
  });
  els.historyPreviewPanel.querySelector('#historyPreviewConfirm')?.addEventListener('click', historyConfirmPreviewReturn);
}

async function historyConfirmPreviewReturn() {
  const preview = state.historyPreview;
  if (!preview) return;
  const runIds = preview.runs.map((run) => String(run.id)).filter((id) => !state.historyPreviewExcluded.has(id));
  if (!runIds.length) return showToast(tr('admin_warn_nothing_selected_return'), 'warn');
  if (!window.confirm(tr('admin_confirm_return_preview_template', { n: runIds.length }))) return;
  const data = await api('/api/admin/history/return-to-pool', {
    method: 'POST',
    body: JSON.stringify({ runIds, adminId: 'admin' })
  });
  state.historyPreview = null;
  renderHistoryPreview();
  showToast(
    tr('admin_toast_history_preview_returned_template', { n: data.returnedRunCount || 0, m: data.result?.returned?.length || 0 })
  );
  await loadAll();
}

async function restoreArchivedRun(runId) {
  await api(`/api/admin/history/${encodeURIComponent(runId)}/restore`, { method: 'POST', body: JSON.stringify({ adminId: 'admin' }) });
  showToast(tr('admin_toast_run_restored'));
  await loadAll();
}

async function workersBulk(action) {
  const workerIds = [...state.workersSelected];
  if (!workerIds.length) return showToast(tr('admin_warn_select_workers'), 'warn');
  const payload = { workerIds, action, adminId: 'admin' };
  if (action === 'delete') {
    const confirmation = window.prompt(tr('admin_confirm_delete_workers_template', { n: workerIds.length }));
    if (confirmation !== 'DELETE') return;
    payload.confirm = 'DELETE';
  } else if (action === 'reset-leads' && !window.confirm(tr('admin_confirm_reset_workers_leads_template', { n: workerIds.length }))) {
    return;
  }
  await api('/api/admin/workers/bulk', { method: 'POST', body: JSON.stringify(payload) });
  if (action === 'delete') {
    state.workersSelected.clear();
    if (workerIds.includes(state.selectedWorkerId)) {
      state.selectedWorkerId = '';
      state.workerDetail = null;
    }
  }
  showToast(tr('admin_toast_bulk_action_template', { action, n: workerIds.length }));
  await loadAll({ keepSelection: action !== 'delete' });
}

function bindRunActions(container) {
  container.addEventListener('click', async (event) => {
    const open = event.target.closest('[data-open-run]');
    if (open) await openRun(open.dataset.openRun);

    const remove = event.target.closest('[data-delete-run]');
    if (remove) await deleteRun(remove.dataset.deleteRun);
  });
}

document.addEventListener('click', (event) => {
  const langChip = event.target.closest('[data-set-lang]');
  if (!langChip) return;
  event.preventDefault();
  window.AuraI18n?.setLanguage(langChip.dataset.setLang);
  applyAdminStaticChrome();
  render();
  if (document.querySelector('#leadModal')) renderLeadModal();
  if (state.historyPreview) renderHistoryPreview();
});

els.refreshButton.addEventListener('click', () => loadAll().catch((error) => showToast(error.message, 'warn')));
els.workerSearchInput.addEventListener('input', renderWorkers);
els.searchInput.addEventListener('input', () => {
  clearTimeout(els.searchInput._timer);
  els.searchInput._timer = setTimeout(() => loadAll().catch((error) => showToast(error.message, 'warn')), 300);
});
els.statusFilter.addEventListener('change', () => loadAll().catch((error) => showToast(error.message, 'warn')));
els.leadsPoolFilter?.addEventListener('change', () => loadAll().catch((error) => showToast(error.message, 'warn')));
els.leadsFiltersForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  loadAll().catch((error) => showToast(error.message, 'warn'));
});
[els.leadsWorkerFilter, els.leadsCityFilter, els.leadsCategoryFilter].forEach((input) => {
  input?.addEventListener('input', () => {
    clearTimeout(input._timer);
    input._timer = setTimeout(() => loadAll().catch((error) => showToast(error.message, 'warn')), 350);
  });
});
els.leadsFiltersClear?.addEventListener('click', () => {
  els.leadsFiltersForm?.reset();
  loadAll().catch((error) => showToast(error.message, 'warn'));
});
els.leadsSelectAll?.addEventListener('change', () => {
  const pageLeads = leadsPageSlice();
  if (els.leadsSelectAll.checked) pageLeads.forEach((record) => state.selected.add(record.id));
  else pageLeads.forEach((record) => state.selected.delete(record.id));
  renderLeads();
  renderSelectedCount();
});
els.leadsSelectAllMatching?.addEventListener('click', () => {
  state.leads.forEach((record) => state.selected.add(record.id));
  renderLeads();
  renderSelectedCount();
  showToast(tr('admin_toast_selected_all_matching_template', { n: state.leads.length }));
});
els.leadsPagination?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-leads-page]');
  if (!button) return;
  const pageCount = Math.max(1, Math.ceil(state.leads.length / LEADS_PAGE_SIZE));
  const page = currentLeadsPage();
  state.leadsPage = button.dataset.leadsPage === 'prev' ? Math.max(1, page - 1) : Math.min(pageCount, page + 1);
  renderLeads();
});

// "Suggest as you type" for the free-text filter inputs (city/country/
// category/worker id). Always queries the full permanent history via
// /api/admin/filters/suggestions, not just whatever happens to be loaded on
// screen, so anything ever recorded is findable from the first keystroke.
function wireFilterAutocomplete(input, datalist, field) {
  if (!input || !datalist) return;
  input.addEventListener('input', () => {
    clearTimeout(input._suggestTimer);
    const query = input.value.trim();
    input._suggestTimer = setTimeout(async () => {
      try {
        const data = await api(`/api/admin/filters/suggestions?field=${encodeURIComponent(field)}&q=${encodeURIComponent(query)}`);
        datalist.innerHTML = (data.suggestions || []).map((value) => `<option value="${escapeAttribute(value)}"></option>`).join('');
      } catch {
        // Non-fatal: the input keeps working as free text even if suggestions fail to load.
      }
    }, 200);
  });
}

wireFilterAutocomplete(els.leadsWorkerFilter, document.querySelector('#leadsWorkerSuggestions'), 'workerId');
wireFilterAutocomplete(els.leadsCityFilter, document.querySelector('#leadsCitySuggestions'), 'city');
wireFilterAutocomplete(els.leadsCategoryFilter, document.querySelector('#leadsCategorySuggestions'), 'category');
wireFilterAutocomplete(els.historyFiltersForm?.elements.country, document.querySelector('#historyCountrySuggestions'), 'country');
wireFilterAutocomplete(els.historyFiltersForm?.elements.city, document.querySelector('#historyCitySuggestions'), 'city');
wireFilterAutocomplete(els.historyFiltersForm?.elements.category, document.querySelector('#historyCategorySuggestions'), 'category');
wireFilterAutocomplete(els.historyFiltersForm?.elements.workerId, document.querySelector('#historyWorkerSuggestions'), 'workerId');

els.workersBody.addEventListener('click', async (event) => {
  const removeWorker = event.target.closest('[data-worker-delete]');
  if (removeWorker) {
    event.preventDefault();
    event.stopPropagation();
    await deleteWorker(removeWorker.dataset.workerDelete);
    return;
  }
  const button = event.target.closest('[data-open-worker]');
  if (!button) return;
  button.disabled = true;
  try {
    await loadWorkerDetail(button.dataset.openWorker);
  } catch {
    // loadWorkerDetail already shows a toast.
  } finally {
    button.disabled = false;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelector('.modal-backdrop:not(.auth-backdrop)')?.remove();
});

document.addEventListener('click', async (event) => {
  if (event.target.closest('[data-close-modal]')) {
    event.target.closest('.modal-backdrop')?.remove();
    return;
  }
  // Tapping the dimmed backdrop (outside the card) also dismisses the modal -
  // on mobile there's no Escape key, and hunting for the small "Zamknij"
  // button is fiddly, so this is the expected way to back out of a dialog.
  // auth-backdrop (login / access-denied) is excluded - those are mandatory
  // gates, not optional dialogs.
  if (event.target.classList.contains('modal-backdrop') && !event.target.classList.contains('auth-backdrop')) {
    event.target.remove();
    return;
  }
  const password = event.target.closest('[data-worker-password]');
  if (password) await changeWorkerPassword(password.dataset.workerPassword);

  const toggle = event.target.closest('[data-worker-toggle]');
  if (toggle) await toggleWorker(toggle.dataset.workerToggle);

  const reset = event.target.closest('[data-worker-reset]');
  if (reset) await resetWorkerLeads(reset.dataset.workerReset);

  const dailyLimit = event.target.closest('[data-worker-daily-limit]');
  if (dailyLimit) await changeWorkerDailyLimit(dailyLimit.dataset.workerDailyLimit);

  const clear = event.target.closest('[data-worker-clear]');
  if (clear) await clearWorkerHistory(clear.dataset.workerClear);

  const removeWorker = event.target.closest('[data-worker-delete]');
  if (removeWorker) await deleteWorker(removeWorker.dataset.workerDelete);

  const modalReset = event.target.closest('#leadModal [data-reset-one]');
  if (modalReset) await resetIds([modalReset.dataset.resetOne]);
});

document.addEventListener('change', async (event) => {
  const statusSelectEl = event.target.closest('#leadModal [data-status-lead]');
  if (statusSelectEl) await updateLeadStatus(statusSelectEl.dataset.statusLead, statusSelectEl.value);
});

document.addEventListener('submit', async (event) => {
  if (event.target.id === 'adminLoginForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const login = String(formData.get('login') || '').trim();
    const password = String(formData.get('password') || '');
    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password })
      });
      setAuthToken(data.token);
      if (data.role !== 'admin') {
        showAccessDenied();
        return;
      }
      document.querySelector('#adminLoginDialog')?.remove();
      document.body.classList.remove('auth-locked');
      await loadAll({ keepSelection: false });
      showToast(tr('admin_toast_admin_logged_in'));
    } catch (error) {
      showAdminLogin(error.message || 'Bledny login lub haslo.');
    }
    return;
  }

  if (event.target.id !== 'createWorkerForm') return;
  event.preventDefault();
  try {
    await createWorkerFromForm(event.target);
  } catch (error) {
    showToast(error.message, 'warn');
  }
});

bindLeadTable(els.leadsBody);
bindLeadTable(els.runDetail);
if (els.workerSavedList) bindLeadTable(els.workerSavedList);

async function markAllInboxRead() {
  const unread = inboxSubmissions().filter(inboxIsUnread);
  if (!unread.length) return;
  await Promise.all(unread.map((record) => api(`/api/leads/${encodeURIComponent(record.id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: 'seen', adminId: 'admin' })
  })));
  showToast(tr('admin_toast_inbox_marked_read_template', { n: unread.length }));
  await loadAll();
}

els.inboxList?.addEventListener('click', async (event) => {
  const markRead = event.target.closest('[data-inbox-read]');
  if (markRead) {
    event.preventDefault();
    event.stopPropagation();
    await updateLeadStatus(markRead.dataset.inboxRead, 'seen');
    return;
  }
  const stopper = event.target.closest('[data-stop-open]');
  if (stopper) {
    event.stopPropagation();
    return;
  }
  const open = event.target.closest('[data-open-lead]');
  if (open) await openLead(open.dataset.openLead);
});

els.inboxMarkAllRead?.addEventListener('click', () => markAllInboxRead().catch((error) => showToast(error.message, 'warn')));
bindRunActions(els.runsList);
bindRunActions(els.workerRunsList);
bindRunActions(els.runDetail);

els.resetSelected.addEventListener('click', () => resetIds([...state.selected]).catch((error) => showToast(error.message, 'warn')));

// History view tabs (Aktywne / Zakończone / Zwrócone do puli / Archiwum).
els.historyViewTabs?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-history-view]');
  if (!button) return;
  switchHistoryView(button.dataset.historyView);
});

// Mobile: filters + bulk-action panel collapses behind one toggle button.
els.historyFiltersToggle?.addEventListener('click', () => {
  els.historyFiltersPanel?.classList.toggle('open');
});

// History filters + bulk actions. Nothing here can ever permanently delete a
// run - "return to pool" always archives the entry and frees its leads.
els.historyFiltersForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  state.runsSelected.clear();
  state.historyPreview = null;
  renderHistoryPreview();
  loadHistoryRuns().catch((error) => showToast(error.message, 'warn'));
});
els.historyFiltersClear?.addEventListener('click', () => {
  els.historyFiltersForm?.reset();
  state.runsSelected.clear();
  state.historyPreview = null;
  renderHistoryPreview();
  loadHistoryRuns().catch((error) => showToast(error.message, 'warn'));
});
els.historyPreviewByFilter?.addEventListener('click', () => historyPreviewByFilter().catch((error) => showToast(error.message, 'warn')));
els.runsList?.addEventListener('change', (event) => {
  const checkbox = event.target.closest('[data-select-run]');
  if (!checkbox) return;
  if (checkbox.checked) state.runsSelected.add(String(checkbox.dataset.selectRun));
  else state.runsSelected.delete(String(checkbox.dataset.selectRun));
  renderHistorySelection();
});
els.runsSelectAll?.addEventListener('change', () => {
  if (els.runsSelectAll.checked) state.runs.forEach((run) => state.runsSelected.add(String(run.id)));
  else state.runsSelected.clear();
  renderRuns();
});
els.historyBulkDelete?.addEventListener('click', () => historyBulkReturnSelected([...state.runsSelected]).catch((error) => showToast(error.message, 'warn')));
els.archiveList?.addEventListener('click', (event) => {
  const restore = event.target.closest('[data-restore-run]');
  if (restore) restoreArchivedRun(restore.dataset.restoreRun).catch((error) => showToast(error.message, 'warn'));
});

// Workers bulk selection + mass actions.
els.workersBody.addEventListener('change', (event) => {
  const checkbox = event.target.closest('[data-select-worker]');
  if (!checkbox) return;
  if (checkbox.checked) state.workersSelected.add(checkbox.dataset.selectWorker);
  else state.workersSelected.delete(checkbox.dataset.selectWorker);
  renderWorkersSelection();
});
els.workersSelectAll?.addEventListener('change', () => {
  const visible = state.workers.filter(workerMatchesSearch);
  if (els.workersSelectAll.checked) visible.forEach((worker) => state.workersSelected.add(worker.workerId));
  else visible.forEach((worker) => state.workersSelected.delete(worker.workerId));
  renderWorkers();
});
els.workersBulkActivate?.addEventListener('click', () => workersBulk('activate').catch((error) => showToast(error.message, 'warn')));
els.workersBulkDeactivate?.addEventListener('click', () => workersBulk('deactivate').catch((error) => showToast(error.message, 'warn')));
els.workersBulkResetLeads?.addEventListener('click', () => workersBulk('reset-leads').catch((error) => showToast(error.message, 'warn')));
els.workersBulkDelete?.addEventListener('click', () => workersBulk('delete').catch((error) => showToast(error.message, 'warn')));

els.academyOverviewBody?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-open-worker-academy]');
  if (!button) return;
  switchAdminTab('workers');
  try {
    await loadWorkerDetail(button.dataset.openWorkerAcademy);
  } catch {
    // loadWorkerDetail already shows a toast.
  }
});

els.workerAiTrainingBox?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-view-ai-session]');
  if (!button) return;
  openAiTrainingDetail(button.dataset.viewAiSession);
});

els.aiUsagePeriodSelect?.addEventListener('change', () => {
  state.aiUsagePeriod = els.aiUsagePeriodSelect.value;
  try {
    localStorage.setItem('auraAdminAiUsagePeriod', state.aiUsagePeriod);
  } catch {}
  loadAiUsage(state.aiUsagePeriod).catch(() => {});
});

els.aiTrainingDetailClose?.addEventListener('click', () => {
  els.aiTrainingDetailModal?.classList.add('hidden-panel');
});

els.aiTrainingDetailModal?.addEventListener('click', (event) => {
  if (event.target === els.aiTrainingDetailModal) els.aiTrainingDetailModal.classList.add('hidden-panel');
});

if (els.aiUsagePeriodSelect) els.aiUsagePeriodSelect.value = state.aiUsagePeriod;

els.aiSearchSettingsForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await saveAiSearchSettingsFromForm(event.target);
  } catch (error) {
    showToast(error.message, 'warn');
  }
});

els.aiSearchJobsRefresh?.addEventListener('click', () => {
  loadAiSearchJobs().catch((error) => showToast(error.message, 'warn'));
});

els.aiSearchJobsBody?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cancel-ai-search-job]');
  if (!button) return;
  cancelAiSearchJob(button.dataset.cancelAiSearchJob).catch((error) => showToast(error.message, 'warn'));
});

const ADMIN_TAB_STORAGE_KEY = 'auraAdminTab';

function switchAdminTab(tab) {
  const target = ['workers', 'leads', 'inbox', 'history', 'audit', 'academy', 'ai-search'].includes(tab) ? tab : 'workers';
  els.adminSectionTabs?.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminTab === target);
  });
  els.adminTabWorkers?.classList.toggle('hidden-panel', target !== 'workers');
  els.adminTabLeads?.classList.toggle('hidden-panel', target !== 'leads');
  els.adminTabInbox?.classList.toggle('hidden-panel', target !== 'inbox');
  els.adminTabHistory?.classList.toggle('hidden-panel', target !== 'history');
  els.adminTabAudit?.classList.toggle('hidden-panel', target !== 'audit');
  els.adminTabAcademy?.classList.toggle('hidden-panel', target !== 'academy');
  els.adminTabAiSearch?.classList.toggle('hidden-panel', target !== 'ai-search');
  try {
    localStorage.setItem(ADMIN_TAB_STORAGE_KEY, target);
  } catch {}
  if (target === 'academy') {
    loadServiceCatalogNames().then(renderAcademyOverview);
    loadAiUsage().catch(() => {});
  }
  if (target === 'ai-search') {
    loadAiSearchSettings().catch(() => {});
    loadAiSearchJobs().catch(() => {});
  }
  window.lucide?.createIcons();
}

els.adminSectionTabs?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-admin-tab]');
  if (button) switchAdminTab(button.dataset.adminTab);
});

let initialAdminTab = 'workers';
try {
  initialAdminTab = localStorage.getItem(ADMIN_TAB_STORAGE_KEY) || 'workers';
} catch {}
switchAdminTab(initialAdminTab);

ensureEnhancements();
ensureLogoutButton();

async function bootstrapAdmin() {
  if (!getAuthToken()) {
    showAdminLogin();
    return;
  }
  try {
    const profile = await api('/api/auth/me');
    if (profile.role !== 'admin') {
      showAccessDenied();
      return;
    }
    await loadAll();
  } catch (error) {
    showAdminLogin(error.message);
  }
}

bootstrapAdmin().catch((error) => {
  showToast(error.message, 'warn');
  els.workersBody.innerHTML = `<tr><td colspan="8">${escapeHtml(error.message)}</td></tr>`;
  els.leadsBody.innerHTML = `<tr><td colspan="8">${escapeHtml(error.message)}</td></tr>`;
});
