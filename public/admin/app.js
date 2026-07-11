const SELECTED_WORKER_STORAGE_KEY = 'auraAdminSelectedWorker';
const WORKER_ID_STORAGE_KEY = 'auraWorkerId';
const API_BASE_STORAGE_KEY = 'parserApiBase';
const SESSION_TOKEN_STORAGE_KEY = 'auraSessionToken';

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
  archivedRuns: []
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
  workerLeadsCount: document.querySelector('#workerLeadsCount'),
  workerLeadsBody: document.querySelector('#workerLeadsBody'),
  workerFoldersList: document.querySelector('#workerFoldersList'),
  workerSavedList: document.querySelector('#workerSavedList'),
  workerSavedCount: document.querySelector('#workerSavedCount'),
  workerDetailPanel: document.querySelector('#workerDetailPanel'),
  leadsBody: document.querySelector('#leadsBody'),
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
  historyBulkReset: document.querySelector('#historyBulkReset'),
  historyBulkDelete: document.querySelector('#historyBulkDelete'),
  workersSelectAll: document.querySelector('#workersSelectAll'),
  workersSelectedCount: document.querySelector('#workersSelectedCount'),
  workersBulkActivate: document.querySelector('#workersBulkActivate'),
  workersBulkDeactivate: document.querySelector('#workersBulkDeactivate'),
  workersBulkResetLeads: document.querySelector('#workersBulkResetLeads'),
  workersBulkDelete: document.querySelector('#workersBulkDelete')
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
        <p class="eyebrow">Aura Admin</p>
        <h2>Logowanie administratora</h2>
        <p class="muted">Panel admina wymaga osobnego dostepu. Worker nie ma dostepu do danych globalnych.</p>
      </div>
      ${message ? `<div class="feedback bad">${escapeHtml(message)}</div>` : ''}
      <label>Login<input name="login" autocomplete="username" required value="admin" /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="button primary" type="submit">Zaloguj</button>
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
        <p class="eyebrow">Aura Admin</p>
        <h2>Brak dostepu</h2>
        <p class="muted">To konto nie ma uprawnien administratora. Worker nie ma dostepu do panelu admina.</p>
      </div>
      <div class="feedback bad">Zaloguj sie jako administrator albo wroc do swojej aplikacji.</div>
      <a class="button primary" href="../">Parser</a>
      <a class="button secondary" href="../academy/">Academy</a>
    </div>
  `;
}

function ensureLogoutButton() {
  if (document.querySelector('#adminLogoutButton')) return;
  const button = document.createElement('button');
  button.id = 'adminLogoutButton';
  button.className = 'button secondary';
  button.type = 'button';
  button.innerHTML = '<i data-lucide="log-out"></i> Wyloguj';
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
  return row?.[1] || status || 'new';
}

function poolLabel(poolState) {
  const row = poolStates.find(([value]) => value === poolState);
  return row?.[1] || poolState || 'available';
}

function leadName(record) {
  const data = record?.data || {};
  return data.company || data.legal_name || 'Bez nazwy';
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

function statusSelect(record) {
  const status = record.status || 'new';
  return `
    <select class="status-select" data-status-lead="${escapeAttribute(record.id)}">
      ${leadStatuses
        .filter(([value]) => value !== 'deleted')
        .map(([value, label]) => `<option value="${escapeAttribute(value)}" ${value === status ? 'selected' : ''}>${escapeHtml(label)}</option>`)
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

function ensureEnhancements() {
  if (!document.querySelector('#periodFilter')) {
    const actions = document.querySelector('.header-actions');
    const period = document.createElement('select');
    period.id = 'periodFilter';
    period.className = 'button secondary period-select';
    period.innerHTML = `
      <option value="today">Dzisiaj</option>
      <option value="7d">7 dni</option>
      <option value="30d">30 dni</option>
      <option value="all">Cały czas</option>
    `;
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
    button.innerHTML = '<i data-lucide="user-plus"></i> Stwórz worker';
    button.addEventListener('click', openWorkerDialog);
    document.querySelector('.header-actions')?.prepend(button);
  }

  if (els.statusFilter && !els.statusFilter.dataset.syncedStatuses) {
    const selected = els.statusFilter.value || '';
    els.statusFilter.innerHTML = `
      <option value="">Wszystkie statusy</option>
      ${leadStatuses
        .filter(([value]) => value !== 'deleted')
        .map(([value, label]) => `<option value="${escapeAttribute(value)}">${escapeHtml(label)}</option>`)
        .join('')}
    `;
    els.statusFilter.value = selected;
    els.statusFilter.dataset.syncedStatuses = 'true';
  }

  if (!document.querySelector('#poolFilter')) {
    const poolFilter = document.createElement('select');
    poolFilter.id = 'poolFilter';
    poolFilter.innerHTML = `
      <option value="">Wszystkie poolState</option>
      ${poolStates.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
    `;
    poolFilter.addEventListener('change', () => loadAll().catch((error) => showToast(error.message, 'warn')));
    els.statusFilter?.insertAdjacentElement('afterend', poolFilter);
  }

  if (!document.querySelector('#auditPanel')) {
    const panel = document.createElement('section');
    panel.id = 'auditPanel';
    panel.className = 'panel';
    panel.innerHTML = `
      <div class="panel-top">
        <div>
          <h2>Journal działań</h2>
          <p>Admin actions: workers, lead pool, query reset/delete, status updates.</p>
        </div>
      </div>
      <div id="auditList" class="list"></div>
    `;
    document.querySelector('.admin-shell')?.append(panel);
  }
}

async function loadAll({ keepSelection = true } = {}) {
  ensureEnhancements();
  const activeRunId = state.activeRun?.run?.id || '';
  const params = new URLSearchParams();
  if (els.searchInput.value.trim()) params.set('q', els.searchInput.value.trim());
  if (els.statusFilter.value) params.set('status', els.statusFilter.value);
  const poolFilter = document.querySelector('#poolFilter');
  if (poolFilter?.value) params.set('poolState', poolFilter.value);
  params.set('limit', '700');

  const [workersData, leadsData, summaryData, auditData] = await Promise.all([
    api('/api/admin/workers'),
    api(`/api/admin/leads?${params.toString()}`),
    api(`/api/admin/summary?period=${encodeURIComponent(state.period)}`),
    api('/api/admin/audit?limit=120')
  ]);

  state.workers = workersData.workers || [];
  state.leads = leadsData.leads || [];
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
    els.selectedWorkerTitle.textContent = 'Ładowanie profilu...';
    els.selectedWorkerMeta.textContent = workerId;
    els.workerDetailPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  try {
    state.workerDetail = await api(`/api/admin/workers/${encodeURIComponent(workerId)}`);
    if (renderAfter) {
      render();
      els.workerDetailPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    showToast(error.message || 'Nie udało się otworzyć profilu workera.', 'warn');
    throw error;
  }
}

function renderStats() {
  const stats = [
    ['Workerzy', state.stats.totalWorkers ?? state.workers.length],
    ['Aktywni w okresie', state.stats.activeWorkers ?? 0],
    ['Leady w bazie', state.stats.totalCompanies ?? 0],
    ['Leady znalezione', state.stats.leadsFound ?? 0],
    ['Zapytania parsera', state.stats.parserQueries ?? 0],
    ['AI analizy', state.stats.aiAnalyses ?? 0],
    ['Spotkania', state.stats.meetingBooked ?? 0],
    ['Wróciły do puli', state.stats.returnedToPool ?? 0],
    ['Usunięte', state.stats.deletedPermanently ?? state.stats.deletedCompanies ?? 0]
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
    els.workersBody.innerHTML = '<tr><td colspan="8" class="muted">Brak workerów dla tego filtra.</td></tr>';
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
          <td><input type="checkbox" data-select-worker="${escapeAttribute(worker.workerId)}" ${state.workersSelected.has(worker.workerId) ? 'checked' : ''} aria-label="Zaznacz workera"></td>
          <td>
            <strong>${escapeHtml(worker.displayName || worker.workerId)}</strong>
            <div class="muted mono">${escapeHtml(worker.login || worker.workerId)}</div>
            <span class="chip ${worker.active === false ? 'danger-chip' : 'ok-chip'}">${worker.active === false ? 'inactive' : 'active'}</span>
          </td>
          <td>${escapeHtml(worker.leadsAssigned || 0)}<div class="muted">opened ${escapeHtml(worker.visibleLeads || 0)}</div></td>
          <td>${escapeHtml(worker.parserRuns || 0)}<div class="muted">new ${escapeHtml(worker.newTotal || 0)} / dup ${escapeHtml(worker.duplicateTotal || 0)}</div></td>
          <td>${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)} · ${escapeHtml(academy.averageQuizScore || 0)}%</td>
          <td>${escapeHtml(worker.meetingBooked || 0)}<div class="muted">${conversion}%</div></td>
          <td>${escapeHtml(formatDate(worker.lastActiveAt))}</td>
          <td>
            <div class="inline-actions">
              <button class="button secondary" data-open-worker="${escapeAttribute(worker.workerId)}">Otwórz profil</button>
              <button class="button danger" data-worker-delete="${escapeAttribute(worker.workerId)}">Usuń</button>
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
    els.selectedWorkerTitle.textContent = 'Wybierz pracownika';
    els.selectedWorkerMeta.textContent = 'Po wyborze zobaczysz jego wyniki, statusy i historię.';
    els.workerStatusChips.innerHTML = '';
    els.workerStatsGrid.innerHTML = '';
    els.workerRunsList.innerHTML = '<div class="list-item muted">Brak danych.</div>';
    els.workerAcademyBox.innerHTML = '<div class="muted">Brak danych.</div>';
    els.workerLeadsBody.innerHTML = '<tr><td colspan="6" class="muted">Brak leadów.</td></tr>';
    return;
  }

  const worker = detail.worker;
  const academy = worker.academy || {};
  const runs = detail.runs || [];
  const companies = detail.companies || [];
  const conversion = companies.length ? Math.round(((worker.meetingBooked || 0) / companies.length) * 100) : 0;
  els.selectedWorkerTitle.textContent = worker.displayName || worker.workerId;
  els.selectedWorkerMeta.textContent = `${worker.login || worker.workerId} · ${worker.active === false ? 'inactive' : 'active'} · ${worker.language || 'ru'} · ostatnio: ${formatDate(worker.lastActiveAt)}`;
  els.workerStatusChips.innerHTML = `
    ${Object.entries(detail.statusCounts || {})
      .map(([status, count]) => `<span class="chip status ${escapeAttribute(status)}">${escapeHtml(statusLabel(status))}: ${escapeHtml(count)}</span>`)
      .join('')}
    <a class="button secondary small-button" href="../academy/?workerId=${encodeURIComponent(worker.workerId)}" target="_blank" rel="noreferrer">Konto workera</a>
    <button class="button secondary small-button" data-worker-password="${escapeAttribute(worker.workerId)}">Zmień hasło</button>
    <button class="button secondary small-button" data-worker-toggle="${escapeAttribute(worker.workerId)}">${worker.active === false ? 'Aktywuj' : 'Dezaktywuj'}</button>
    <button class="button secondary small-button" data-worker-reset="${escapeAttribute(worker.workerId)}">Wróć leady do puli</button>
    <button class="button danger small-button" data-worker-clear="${escapeAttribute(worker.workerId)}">Wyczyść historię</button>
    <button class="button danger small-button" data-worker-delete="${escapeAttribute(worker.workerId)}">Usuń workera</button>
  `;

  els.workerStatsGrid.innerHTML = [
    ['Zapytania', worker.parserRuns || runs.length],
    ['Leady', worker.leadsAssigned || companies.length],
    ['Otwarte', worker.visibleLeads || 0],
    ['AI', worker.aiAnalyses || 0],
    ['Statusy', Object.values(detail.statusCounts || {}).reduce((sum, value) => sum + Number(value || 0), 0)],
    ['Spotkania', worker.meetingBooked || 0],
    ['Konwersja', `${conversion}%`],
    ['Akademia', `${academy.completedModules || 0}/${academy.totalModules || 10}`]
  ]
    .map(([label, value]) => `
      <div class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join('');

  els.workerRunsCount.textContent = `${runs.length} zapytań`;
  els.workerRunsList.innerHTML = runs.length
    ? runs.slice(0, 30).map(renderRunItem).join('')
    : '<div class="list-item muted">Ten worker nie ma zapisanych zapytań parsera.</div>';

  els.workerAcademyBadge.textContent = `${academy.completionPercent || 0}%`;
  els.workerAcademyBox.innerHTML = `
    <div class="progress-bar"><span style="width:${Math.max(0, Math.min(100, academy.completionPercent || 0))}%"></span></div>
    <p><strong>Moduły:</strong> ${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)}</p>
    <p><strong>Średni wynik testów:</strong> ${escapeHtml(academy.averageQuizScore || 0)}%</p>
    <p class="muted">Ostatnio: ${escapeHtml(formatDate(academy.lastActiveAt))}</p>
  `;

  els.workerLeadsCount.textContent = `${companies.length} leadów`;
  els.workerLeadsBody.innerHTML = companies.length
    ? companies.slice(0, 250).map((record) => renderLeadRow(record, { selectable: false })).join('')
    : '<tr><td colspan="6" class="muted">Brak leadów przypisanych do workera.</td></tr>';

  const folders = detail.folders || [];
  const saved = detail.saved || [];
  if (els.workerSavedCount) els.workerSavedCount.textContent = `${detail.savedTotal ?? saved.length} zapisanych · ${folders.length} folderów`;
  if (els.workerFoldersList) {
    els.workerFoldersList.innerHTML = folders.length
      ? folders.map((folder) => `<span class="chip">${escapeHtml(folder.name)}</span>`).join('')
      : '<span class="muted">Worker nie utworzył jeszcze żadnego folderu.</span>';
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
            <div class="list-item">
              <strong>${escapeHtml(item.data?.company || item.data?.legal_name || 'Bez nazwy')}</strong>
              <div class="muted">${escapeHtml(folderNames.join(', ') || 'bez folderu')} · status CRM: ${escapeHtml(crmStatusAdminLabel(item.crm_status))}</div>
              ${item.last_comment ? `<div class="muted">"${escapeHtml(item.last_comment.text.slice(0, 80))}"</div>` : ''}
            </div>`;
          })
          .join('')
      : '<div class="list-item muted">Worker nie zapisał jeszcze żadnej firmy.</div>';
  }
}

function crmStatusAdminLabel(value) {
  const labels = {
    nowy: 'Nowy',
    do_kontaktu: 'Do kontaktu',
    proba_kontaktu: 'Próba kontaktu',
    brak_odpowiedzi: 'Brak odpowiedzi',
    oddzwonic: 'Oddzwonić',
    zainteresowany: 'Zainteresowany',
    oferta_wyslana: 'Oferta wysłana',
    umowione_spotkanie: 'Umówione spotkanie',
    klient: 'Klient',
    odrzucony: 'Odrzucony'
  };
  return labels[value] || 'Nowy';
}

function formatRunStatusLabel(status) {
  if (status === 'duplicates_only') return 'Только дубли / новых нет';
  if (status === 'cancelled') return 'Отменено';
  return status || '-';
}

function renderRunItem(run, { selectable = false, archived = false } = {}) {
  const title = (run.niches || []).join(', ') || 'Zapytanie';
  const badges = [
    `<span class="badge">${escapeHtml(formatRunStatusLabel(run.status))}</span>`,
    run.pool_status === 'returned_to_pool' ? '<span class="badge badge-returned">Zwrócone do puli</span>' : '',
    run.archived_at ? '<span class="badge badge-archived">Zarchiwizowane</span>' : ''
  ]
    .filter(Boolean)
    .join('');
  return `
    <div class="list-item run-item">
      ${selectable ? `<input type="checkbox" data-select-run="${escapeAttribute(run.id)}" ${state.runsSelected.has(String(run.id)) ? 'checked' : ''} aria-label="Zaznacz zapytanie" />` : ''}
      <div>
        <strong>${escapeHtml(title)}</strong>
        <div class="muted">${escapeHtml(formatDate(run.started_at))} · ${escapeHtml(run.city || '-')} · worker: ${escapeHtml(run.worker_id || '-')}</div>
        <div class="run-badges">${badges}</div>
        <div>Znaleziono: ${escapeHtml(run.found_count || 0)} · nowe: ${escapeHtml(run.new_count || 0)} · duble: ${escapeHtml(run.duplicate_count || 0)} · wrong category: ${escapeHtml(run.skipped_wrong_category || 0)}</div>
      </div>
      <div class="inline-actions">
        <button class="button secondary" data-open-run="${escapeAttribute(run.id)}">Otwórz</button>
        ${
          archived
            ? `<button class="button secondary" data-restore-run="${escapeAttribute(run.id)}">Przywróć z archiwum</button>`
            : `
          <button class="button secondary" data-reset-run="${escapeAttribute(run.id)}">Wróć leady do puli</button>
          <button class="button danger" data-delete-run="${escapeAttribute(run.id)}">Wróć query do puli i zarchiwizuj</button>
        `
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
  return `
    <tr>
      ${selectable ? `<td><input type="checkbox" data-select="${escapeAttribute(record.id)}" ${state.selected.has(record.id) ? 'checked' : ''}></td>` : ''}
      <td>
        <strong>${escapeHtml(leadName(record))}</strong>
        <div class="muted">${escapeHtml([leadCategory(record), record.data?.city, record.data?.address].filter(Boolean).join(' · ') || '-')}</div>
        ${inbound ? `<span class="chip ok-chip">Zgłoszenie ze strony</span>` : ''}
        <span class="chip">${escapeHtml(poolLabel(poolState))}</span>
        ${inboundText ? `<div class="muted">${escapeHtml(inboundText)}</div>` : ''}
      </td>
      <td>${statusSelect(record)}</td>
      ${selectable ? `<td class="mono">${escapeHtml(record.assigned_worker_id || '-')}</td>` : ''}
      <td>${leadContact(record)}</td>
      <td>${source === '-' ? '-' : `<a href="${escapeAttribute(source)}" target="_blank" rel="noreferrer">źródło</a>`}</td>
      <td>
        AI ${escapeHtml(aiScore(record))}
        <div class="muted">cat ${escapeHtml(categoryScore(record))}</div>
      </td>
      <td>
        <button class="button secondary" data-open-lead="${escapeAttribute(record.id)}">Otwórz lead</button>
        <button class="button secondary" data-reset-one="${escapeAttribute(record.id)}">Wróć do puli</button>
      </td>
    </tr>
  `;
}

function renderLeads() {
  if (!state.leads.length) {
    els.leadsBody.innerHTML = '<tr><td colspan="8" class="muted">Brak leadów dla tego filtra.</td></tr>';
    return;
  }
  els.leadsBody.innerHTML = state.leads.map((record) => renderLeadRow(record, { selectable: true })).join('');
}

function renderRuns() {
  const archived = state.historyView === 'archived';
  const target = archived ? els.archiveList : els.runsList;
  if (!target) return;
  target.innerHTML = state.runs.length
    ? state.runs.map((run) => renderRunItem(run, { selectable: !archived, archived })).join('')
    : `<div class="list-item muted">${archived ? 'Archiwum jest puste.' : 'Brak historii parsera dla tego filtra/zakładki.'}</div>`;
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
    els.runDetail.innerHTML = '<div class="muted">Otwórz zapytanie, żeby zobaczyć konkretne leady z tej historii.</div>';
    return;
  }
  const { run, companies = [] } = state.activeRun;
  const queries = Array.isArray(run.generated_search_queries) ? run.generated_search_queries : [];
  els.runDetail.innerHTML = `
    <div class="run-detail-head">
      <div>
        <h3>${escapeHtml((run.niches || []).join(', ') || 'Zapytanie')}</h3>
        <p class="muted">${escapeHtml(formatDate(run.started_at))} · worker: ${escapeHtml(run.worker_id || '-')} · ${escapeHtml(run.city || '-')} · radius ${escapeHtml(run.radiusKm || '-')} km</p>
        ${queries.length ? `<p class="muted"><strong>Search queries:</strong> ${escapeHtml(queries.slice(0, 10).join(' | '))}</p>` : ''}
      </div>
      <div class="inline-actions">
        <button class="button secondary" data-reset-run="${escapeAttribute(run.id)}">Wróć wszystkie leady tego zapytania do puli</button>
        <button class="button danger" data-delete-run="${escapeAttribute(run.id)}">Wróć zapytanie do puli i zarchiwizuj</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Firma</th>
            <th>Status</th>
            <th>Worker</th>
            <th>Kontakt</th>
            <th>Źródło</th>
            <th>Score</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          ${
            companies.length
              ? companies.map((record) => renderLeadRow(record, { selectable: true })).join('')
              : '<tr><td colspan="8" class="muted">Brak aktywnych leadów w tym zapytaniu.</td></tr>'
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
              <div class="muted mono">${escapeHtml(user.userId)} · ostatnio: ${escapeHtml(formatDate(user.lastActiveAt))}</div>
              <div>Moduły: ${completed}/10 · średni wynik: ${avg}%</div>
            </div>
          `;
        })
        .join('')
    : '<div class="list-item muted">Brak zapisanych postępów akademii.</div>';
}

function scoreValues(values) {
  const scores = values.map(Number).filter(Number.isFinite);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
}

function renderAudit() {
  const auditList = document.querySelector('#auditList');
  if (!auditList) return;
  auditList.innerHTML = state.audit.length
    ? state.audit
        .map((action) => `
          <div class="list-item audit-item">
            <div>
              <strong>${escapeHtml(action.action)}</strong>
              <div class="muted">${escapeHtml(action.targetType || '-')} · ${escapeHtml(action.targetId || '-')} · ${escapeHtml(action.adminId || 'admin')}</div>
            </div>
            <span class="muted">${escapeHtml(formatDate(action.createdAt))}</span>
          </div>
        `)
        .join('')
    : '<div class="list-item muted">Audit log jest pusty.</div>';
}

function renderSelectedCount() {
  els.selectedCount.textContent = formatSelectedCount(state.selected.size, state.leads.length);
}

function render() {
  renderStats();
  renderWorkers();
  renderWorkerDetail();
  renderLeads();
  renderRuns();
  renderRunDetail();
  renderHistoryState();
  renderAcademy();
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
  showToast(`Wrócono do puli: ${ids.length}`);
  await loadAll();
}

async function updateLeadStatus(id, status) {
  await api(`/api/leads/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, adminId: 'admin' })
  });
  showToast('Status zapisany');
  await loadAll();
}

async function openRun(runId) {
  state.activeRun = await api(`/api/admin/runs/${encodeURIComponent(runId)}`);
  renderRunDetail();
  window.lucide?.createIcons();
}

// C. "Wroc wszystkie leady tego zapytania do puli" - frees the leads, keeps
// the query entry as-is (not archived). Companies, comments, CRM statuses
// and folders are never touched.
async function resetRun(runId) {
  const companyCount = (state.activeRun?.run?.id === runId ? state.activeRun.companies?.length : null) ?? findRunCompanyCount(runId);
  if (!window.confirm(`Wrócić do puli ${companyCount != null ? companyCount + ' ' : ''}firm z tego zapytania? Komentarze, statusy i foldery zostają nietknięte.`)) return;
  const data = await api(`/api/admin/runs/${encodeURIComponent(runId)}/reset`, {
    method: 'POST',
    body: JSON.stringify({ adminId: 'admin' })
  });
  showToast(`Wrócono do puli: ${(data.resetIds || []).length} firm.`);
  await loadAll();
}

function findRunCompanyCount(runId) {
  const run = state.runs.find((item) => String(item.id) === String(runId));
  return run ? Number(run.found_count || 0) : null;
}

// A. "Wroc zapytanie do puli i zarchiwizuj" - archives the query entry AND
// frees its leads. Never a hard delete: see store.returnRunToPool.
async function deleteRun(runId) {
  const companyCount = findRunCompanyCount(runId);
  if (!window.confirm(`Wrócić zapytanie${companyCount != null ? ` (${companyCount} firm)` : ''} do puli i zarchiwizować wpis historii? Firmy, komentarze, statusy i foldery zostają nietknięte.`)) return;
  const data = await api(`/api/admin/runs/${encodeURIComponent(runId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ adminId: 'admin' })
  });
  state.activeRun = null;
  showToast(
    data.alreadyReturned
      ? 'To zapytanie już było w puli.'
      : `Zapytanie wróciło do puli i zostało zarchiwizowane. Firm zwróconych: ${data.result?.returned?.length || 0}, już w puli: ${data.result?.alreadyInPool?.length || 0}.`
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
          <p class="eyebrow">Karta leada</p>
          <h2>${escapeHtml(leadName(record))}</h2>
          <p class="muted">${escapeHtml([leadCategory(record), data.city, data.address].filter(Boolean).join(' · ') || '-')}</p>
        </div>
        <button class="button secondary" data-close-modal>Zamknij</button>
      </div>
      <div class="lead-modal-grid">
        <section class="sub-panel">
          <h3>Dane</h3>
          <p><strong>Status:</strong> ${escapeHtml(statusLabel(record.status))}</p>
          <p><strong>Pool:</strong> ${escapeHtml(poolLabel(record.pool_state))}</p>
          <p><strong>Worker:</strong> ${escapeHtml(record.assigned_worker_id || record.first_assigned_worker_id || '-')}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(data.phone || '-')}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email || '-')}</p>
          <p><strong>Site/source:</strong> ${leadSource(record) === '-' ? '-' : `<a href="${escapeAttribute(leadSource(record))}" target="_blank" rel="noreferrer">${escapeHtml(leadSource(record))}</a>`}</p>
          ${
            inbound
              ? `
                <p><strong>Typ:</strong> Zgłoszenie z formularza strony</p>
                <p><strong>Usługi:</strong> ${escapeHtml(selectedServices || '-')}</p>
                <p><strong>Cel:</strong> ${escapeHtml(intake.goal || '-')}</p>
                <p><strong>Budżet:</strong> ${escapeHtml(intake.budget || '-')}</p>
                <p><strong>Ma stronę:</strong> ${escapeHtml(intake.hasWebsite || '-')}</p>
                <p><strong>Wiadomość:</strong> ${escapeHtml(data.notes || '-')}</p>
              `
              : ''
          }
        </section>
        <section class="sub-panel">
          <h3>Category / AI</h3>
          <p><strong>Actual type:</strong> ${escapeHtml(data.actual_business_type || ai.actualBusinessType || '-')}</p>
          <p><strong>Category match:</strong> ${escapeHtml(data.category_match || ai.categoryMatch || '-')} · ${escapeHtml(categoryScore(record))}/100</p>
          <p><strong>Should call:</strong> ${data.should_call === false || ai.shouldCall === false ? 'Nie' : 'Tak / sprawdzić'}</p>
          <p><strong>AI score:</strong> ${escapeHtml(aiScore(record))}</p>
          <p><strong>Opening:</strong> ${escapeHtml(ai.personalizedCallIntro || ai.personal_argument || record.analysis?.first_message_pl || '-')}</p>
        </section>
        <section class="sub-panel">
          <h3>Historia</h3>
          ${history.length ? history.slice(-12).reverse().map((item) => `<p class="muted">${escapeHtml(formatDate(item.createdAt))} · ${escapeHtml(statusLabel(item.status))} · ${escapeHtml(item.workerId || '')} ${item.note ? `· ${escapeHtml(item.note)}` : ''}</p>`).join('') : '<p class="muted">Brak status history.</p>'}
        </section>
        <section class="sub-panel">
          <h3>Zarządzanie</h3>
          ${statusSelect(record)}
          <div class="inline-actions modal-actions">
            <button class="button secondary" data-reset-one="${escapeAttribute(record.id)}">Wróć do puli</button>
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
        <h2>Stwórz worker</h2>
        <button class="button secondary" type="button" data-close-modal>Zamknij</button>
      </div>
      <label>Display name<input name="displayName" required autocomplete="off" /></label>
      <label>Login<input name="login" required autocomplete="off" /></label>
      <label>Password<input name="password" required autocomplete="new-password" /></label>
      <label>Language
        <select name="language">
          <option value="ru">RU</option>
          <option value="pl">PL</option>
          <option value="en">EN</option>
        </select>
      </label>
      <label class="toggle-row"><input name="active" type="checkbox" checked /> active</label>
      <button class="button primary" type="submit">Stwórz konto</button>
    </form>
  `;
}

async function createWorkerFromForm(form) {
  const formData = new FormData(form);
  const worker = {
    displayName: formData.get('displayName'),
    login: formData.get('login'),
    password: formData.get('password'),
    language: formData.get('language'),
    active: formData.get('active') === 'on',
    adminId: 'admin'
  };
  await api('/api/admin/workers', {
    method: 'POST',
    body: JSON.stringify(worker)
  });
  document.querySelector('#workerDialog')?.remove();
  showToast('Worker utworzony');
  await loadAll({ keepSelection: false });
}

async function changeWorkerPassword(workerId) {
  const password = window.prompt(`Nowe hasło dla ${workerId}`);
  if (!password) return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ password, adminId: 'admin' })
  });
  showToast('Hasło zmienione');
  await loadAll();
}

async function toggleWorker(workerId) {
  const worker = state.workers.find((item) => item.workerId === workerId);
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: worker?.active === false, adminId: 'admin' })
  });
  showToast('Worker zaktualizowany');
  await loadAll();
}

async function resetWorkerLeads(workerId) {
  if (!window.confirm(`Wrócić wszystkie leady workera ${workerId} do puli?`)) return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}/reset-leads`, {
    method: 'POST',
    body: JSON.stringify({ adminId: 'admin' })
  });
  showToast('Leady workera wróciły do puli');
  await loadAll();
}

async function clearWorkerHistory(workerId) {
  const confirmation = window.prompt(`Wyczyścić historię workera ${workerId}? Wpisz DELETE.`);
  if (confirmation !== 'DELETE') return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}/history`, {
    method: 'DELETE',
    body: JSON.stringify({ adminId: 'admin', confirm: 'DELETE' })
  });
  showToast('Historia workera wyczyszczona');
  await loadAll();
}

async function deleteWorker(workerId) {
  const confirmation = window.prompt(
    `Usunąć workera ${workerId}? Konto, sesje, trening AI i historia parsera zostaną skasowane, a aktywne leady wrócą do puli. Wpisz DELETE.`
  );
  if (confirmation !== 'DELETE') return;
  await api(`/api/admin/workers/${encodeURIComponent(workerId)}`, {
    method: 'DELETE',
    body: JSON.stringify({ adminId: 'admin', confirm: 'DELETE' })
  });
  if (state.selectedWorkerId === workerId) {
    state.selectedWorkerId = '';
    state.workerDetail = null;
  }
  showToast('Worker usunięty');
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
  if (!count) return 'Nic nie zaznaczono';
  return `Zaznaczono: ${count}${total ? ` z ${total}` : ''}`;
}

function renderHistoryState() {
  if (!els.historyStateMessage) return;
  if (state.historyLoading) {
    els.historyStateMessage.textContent = 'Ładowanie historii...';
    els.historyStateMessage.className = 'history-state-message loading';
    return;
  }
  if (state.historyError) {
    els.historyStateMessage.textContent = state.historyError;
    els.historyStateMessage.className = 'history-state-message error';
    return;
  }
  if (!state.runs.length && state.historyView !== 'archived') {
    els.historyStateMessage.textContent = 'Brak zapytań dla tego filtra/zakładki.';
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
  if (!runIds.length) return showToast('Zaznacz wpisy historii.', 'warn');
  if (!window.confirm(`Wrócić do puli ${runIds.length} zaznaczonych zapytań? Leady, komentarze, statusy i foldery zostają nietknięte.`)) return;
  const data = await api('/api/admin/history/return-to-pool', {
    method: 'POST',
    body: JSON.stringify({ runIds, adminId: 'admin' })
  });
  state.runsSelected.clear();
  if (state.activeRun?.run && runIds.includes(String(state.activeRun.run.id))) state.activeRun = null;
  showToast(
    `Wrócono do puli: ${data.returnedRunCount || 0} zapytań, ${data.result?.returned?.length || 0} unikalnych firm. ` +
      `${data.result?.alreadyInPool?.length || 0} firm już było w puli. Komentarze, statusy i foldery zachowane.`
  );
  await loadAll();
}

// Preview-first bulk return by filters. Blocked server-side (and here) when
// no filter is set, so a stray click can never touch the whole database.
async function historyPreviewByFilter() {
  const filters = readHistoryFilters();
  if (!filters) return showToast('Ustaw najpierw przynajmniej jeden filtr.', 'warn');
  try {
    const params = new URLSearchParams(filters);
    const preview = await api(`/api/admin/history/preview?${params.toString()}`);
    state.historyPreview = { filters, ...preview };
    state.historyPreviewExcluded = new Set();
    renderHistoryPreview();
  } catch (error) {
    showToast(error.message || 'Nie udało się zbudować podglądu.', 'warn');
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
      <strong>Pasujące zapytania: ${preview.matchedRunCount}</strong>
      <span>Unikalnych firm: ${preview.matchedCompanyCount}</span>
      <span>Nowych: ${preview.newCount}</span>
      <span>Dubli: ${preview.duplicateCount}</span>
      <span>Workerów: ${preview.workerCount}</span>
    </div>
    <div class="history-preview-list">
      ${preview.runs
        .map(
          (run) => `
        <label class="history-preview-item">
          <input type="checkbox" data-preview-exclude="${escapeAttribute(run.id)}" ${state.historyPreviewExcluded.has(String(run.id)) ? '' : 'checked'} />
          <span>${escapeHtml((run.niches || []).join(', ') || 'Zapytanie')} · ${escapeHtml(run.city || '-')} · worker: ${escapeHtml(run.worker_id || '-')} · ${escapeHtml(formatDate(run.started_at))}</span>
        </label>`
        )
        .join('')}
    </div>
    <div class="history-preview-actions">
      <button id="historyPreviewConfirm" class="button danger" type="button">Wróć do puli (${includedCount})</button>
      <button id="historyPreviewCancel" class="button secondary" type="button">Anuluj</button>
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
  if (!runIds.length) return showToast('Nic nie zostało wybrane do zwrotu.', 'warn');
  if (!window.confirm(`Wrócić do puli ${runIds.length} zapytań i ich unikalne firmy? Komentarze, statusy i foldery zostają nietknięte.`)) return;
  const data = await api('/api/admin/history/return-to-pool', {
    method: 'POST',
    body: JSON.stringify({ runIds, adminId: 'admin' })
  });
  state.historyPreview = null;
  renderHistoryPreview();
  showToast(
    `Wrócono do puli: ${data.returnedRunCount || 0} zapytań i ${data.result?.returned?.length || 0} unikalnych firm. ` +
      'Karty firm, komentarze i statusy zachowane.'
  );
  await loadAll();
}

async function restoreArchivedRun(runId) {
  await api(`/api/admin/history/${encodeURIComponent(runId)}/restore`, { method: 'POST', body: JSON.stringify({ adminId: 'admin' }) });
  showToast('Wpis przywrócony z archiwum do historii.');
  await loadAll();
}

async function historyBulkReset(runIds) {
  if (!runIds.length) return showToast('Zaznacz wpisy historii.', 'warn');
  if (!window.confirm(`Wrócić do puli wszystkie leady z ${runIds.length} zaznaczonych zapytań?`)) return;
  const data = await api('/api/admin/history/bulk-reset', {
    method: 'POST',
    body: JSON.stringify({ runIds, adminId: 'admin' })
  });
  showToast(`Wrócono do puli leadów: ${(data.resetIds || []).length}`);
  await loadAll();
}

async function workersBulk(action) {
  const workerIds = [...state.workersSelected];
  if (!workerIds.length) return showToast('Zaznacz workerów.', 'warn');
  const payload = { workerIds, action, adminId: 'admin' };
  if (action === 'delete') {
    const confirmation = window.prompt(
      `Usunąć ${workerIds.length} workerów? Konta i sesje zostaną skasowane, leady wrócą do puli. Wpisz DELETE.`
    );
    if (confirmation !== 'DELETE') return;
    payload.confirm = 'DELETE';
  } else if (action === 'reset-leads' && !window.confirm(`Wrócić leady ${workerIds.length} workerów do puli?`)) {
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
  showToast(`Wykonano "${action}" dla ${workerIds.length} workerów`);
  await loadAll({ keepSelection: action !== 'delete' });
}

function bindRunActions(container) {
  container.addEventListener('click', async (event) => {
    const open = event.target.closest('[data-open-run]');
    if (open) await openRun(open.dataset.openRun);

    const reset = event.target.closest('[data-reset-run]');
    if (reset) await resetRun(reset.dataset.resetRun);

    const remove = event.target.closest('[data-delete-run]');
    if (remove) await deleteRun(remove.dataset.deleteRun);
  });
}

els.refreshButton.addEventListener('click', () => loadAll().catch((error) => showToast(error.message, 'warn')));
els.workerSearchInput.addEventListener('input', renderWorkers);
els.searchInput.addEventListener('input', () => {
  clearTimeout(els.searchInput._timer);
  els.searchInput._timer = setTimeout(() => loadAll().catch((error) => showToast(error.message, 'warn')), 300);
});
els.statusFilter.addEventListener('change', () => loadAll().catch((error) => showToast(error.message, 'warn')));

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

document.addEventListener('click', async (event) => {
  if (event.target.closest('[data-close-modal]')) {
    event.target.closest('.modal-backdrop')?.remove();
    return;
  }
  const password = event.target.closest('[data-worker-password]');
  if (password) await changeWorkerPassword(password.dataset.workerPassword);

  const toggle = event.target.closest('[data-worker-toggle]');
  if (toggle) await toggleWorker(toggle.dataset.workerToggle);

  const reset = event.target.closest('[data-worker-reset]');
  if (reset) await resetWorkerLeads(reset.dataset.workerReset);

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
      showToast('Admin zalogowany');
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
bindLeadTable(els.workerLeadsBody);
bindLeadTable(els.runDetail);
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
els.historyBulkReset?.addEventListener('click', () => historyBulkReset([...state.runsSelected]).catch((error) => showToast(error.message, 'warn')));
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
