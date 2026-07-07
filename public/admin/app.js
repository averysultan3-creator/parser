const SELECTED_WORKER_STORAGE_KEY = 'auraAdminSelectedWorker';

const leadStatuses = [
  ['new', 'new / reset'],
  ['reserved', 'przydzielony'],
  ['analyzed', 'sprawdzony'],
  ['called', 'dzwonione'],
  ['meeting_booked', 'spotkanie'],
  ['not_interested', 'nie zainteresowany'],
  ['bad_fit', 'slaby fit'],
  ['no_phone', 'brak telefonu'],
  ['duplicate', 'duplikat'],
  ['completed', 'zamkniety']
];

const state = {
  workers: [],
  workerDetail: null,
  selectedWorkerId: localStorage.getItem(SELECTED_WORKER_STORAGE_KEY) || '',
  leads: [],
  runs: [],
  academyUsers: [],
  activeRun: null,
  stats: {},
  selected: new Set()
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
  leadsBody: document.querySelector('#leadsBody'),
  runsList: document.querySelector('#runsList'),
  runDetail: document.querySelector('#runDetail'),
  academyList: document.querySelector('#academyList'),
  refreshButton: document.querySelector('#refreshButton'),
  searchInput: document.querySelector('#searchInput'),
  statusFilter: document.querySelector('#statusFilter'),
  resetSelected: document.querySelector('#resetSelected'),
  deleteSelected: document.querySelector('#deleteSelected'),
  selectedCount: document.querySelector('#selectedCount')
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

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
  return data;
}

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

function leadName(record) {
  const data = record?.data || {};
  return data.company || data.legal_name || 'Bez nazwy';
}

function leadLocation(record) {
  const data = record?.data || {};
  return [data.niche, data.city, data.address].filter(Boolean).join(' · ');
}

function leadContact(record) {
  const data = record?.data || {};
  return [data.phone, data.email].filter(Boolean).join('<br>') || '-';
}

function leadSource(record) {
  const data = record?.data || {};
  return data.website_url || data.source_profile || data.google_maps_url || '-';
}

function statusLabel(status) {
  return leadStatuses.find(([value]) => value === status)?.[1] || status || 'new';
}

function statusSelect(record, extra = '') {
  const status = record.status || 'new';
  return `
    <select class="status-select" data-status-lead="${escapeAttribute(record.id)}" ${extra}>
      ${leadStatuses
        .map(([value, label]) => `<option value="${escapeAttribute(value)}" ${value === status ? 'selected' : ''}>${escapeHtml(label)}</option>`)
        .join('')}
    </select>
  `;
}

function workerMatchesSearch(worker) {
  const query = String(els.workerSearchInput.value || '').trim().toLowerCase();
  if (!query) return true;
  return [worker.workerId, worker.displayName, ...(worker.sourceTags || [])].join(' ').toLowerCase().includes(query);
}

async function loadAll({ keepSelection = true } = {}) {
  const activeRunId = state.activeRun?.run?.id || '';
  const params = new URLSearchParams();
  if (els.searchInput.value.trim()) params.set('q', els.searchInput.value.trim());
  if (els.statusFilter.value) params.set('status', els.statusFilter.value);
  params.set('limit', '500');

  const [workersData, leadsData, summaryData] = await Promise.all([
    api('/api/admin/workers'),
    api(`/api/admin/leads?${params.toString()}`),
    api('/api/admin/summary')
  ]);

  state.workers = workersData.workers || [];
  state.leads = leadsData.leads || [];
  state.stats = workersData.stats || leadsData.stats || summaryData.stats || {};
  state.runs = summaryData.runs || [];
  state.academyUsers = summaryData.academyUsers || [];
  state.selected.clear();

  const hasSelected = state.workers.some((worker) => worker.workerId === state.selectedWorkerId);
  if (!keepSelection || !hasSelected) {
    state.selectedWorkerId = state.workers[0]?.workerId || '';
  }
  if (state.selectedWorkerId) {
    await loadWorkerDetail(state.selectedWorkerId, { renderAfter: false });
  } else {
    state.workerDetail = null;
  }

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
  state.workerDetail = await api(`/api/admin/workers/${encodeURIComponent(workerId)}`);
  if (renderAfter) render();
}

function renderStats() {
  const stats = [
    ['Leady razem', state.stats.totalCompanies || 0],
    ['Pracownicy', state.workers.length],
    ['Zapytania parsera', state.stats.totalRuns || state.runs.length || 0],
    ['Spotkania', state.stats.meetingBooked || 0]
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

function renderWorkers() {
  const workers = state.workers.filter(workerMatchesSearch);
  if (!workers.length) {
    els.workersBody.innerHTML = '<tr><td colspan="7" class="muted">Brak pracownikow dla tego filtra.</td></tr>';
    return;
  }

  els.workersBody.innerHTML = workers
    .map((worker) => {
      const selected = worker.workerId === state.selectedWorkerId ? 'selected-row' : '';
      const academy = worker.academy || {};
      return `
        <tr class="${selected}">
          <td>
            <strong>${escapeHtml(worker.displayName || worker.workerId)}</strong>
            <div class="muted mono">${escapeHtml(worker.workerId)}</div>
          </td>
          <td>${escapeHtml(worker.leadsAssigned || 0)}</td>
          <td>${escapeHtml(worker.parserRuns || 0)}</td>
          <td>${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)} · ${escapeHtml(academy.averageQuizScore || 0)}%</td>
          <td>${escapeHtml(worker.meetingBooked || 0)}</td>
          <td>${escapeHtml(formatDate(worker.lastActiveAt))}</td>
          <td><button class="button secondary" data-open-worker="${escapeAttribute(worker.workerId)}">Otworz profil</button></td>
        </tr>
      `;
    })
    .join('');
}

function renderWorkerDetail() {
  const detail = state.workerDetail;
  if (!detail?.worker) {
    els.selectedWorkerTitle.textContent = 'Wybierz pracownika';
    els.selectedWorkerMeta.textContent = 'Po wyborze zobaczysz jego wyniki, statusy i historie.';
    els.workerStatusChips.innerHTML = '';
    els.workerStatsGrid.innerHTML = '';
    els.workerRunsList.innerHTML = '<div class="list-item muted">Brak danych.</div>';
    els.workerAcademyBox.innerHTML = '<div class="muted">Brak danych.</div>';
    els.workerLeadsBody.innerHTML = '<tr><td colspan="6" class="muted">Brak leadow.</td></tr>';
    return;
  }

  const worker = detail.worker;
  const academy = worker.academy || {};
  const runs = detail.runs || [];
  const companies = detail.companies || [];
  els.selectedWorkerTitle.textContent = worker.displayName || worker.workerId;
  els.selectedWorkerMeta.textContent = `${worker.workerId} · ostatnio: ${formatDate(worker.lastActiveAt)}`;
  els.workerStatusChips.innerHTML = Object.entries(detail.statusCounts || {})
    .map(([status, count]) => `<span class="chip status ${escapeAttribute(status)}">${escapeHtml(statusLabel(status))}: ${escapeHtml(count)}</span>`)
    .join('');

  els.workerStatsGrid.innerHTML = [
    ['Leady', worker.leadsAssigned || companies.length],
    ['Zapytania', worker.parserRuns || runs.length],
    ['AI analizy', worker.aiAnalyses || 0],
    ['Akademia', `${academy.completedModules || 0}/${academy.totalModules || 10}`]
  ]
    .map(([label, value]) => `
      <div class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join('');

  els.workerRunsCount.textContent = `${runs.length} zapytan`;
  els.workerRunsList.innerHTML = runs.length
    ? runs.slice(0, 12).map(renderRunItem).join('')
    : '<div class="list-item muted">Ten pracownik nie ma jeszcze zapisanych zapytan parsera.</div>';

  els.workerAcademyBadge.textContent = `${academy.completionPercent || 0}%`;
  els.workerAcademyBox.innerHTML = `
    <div class="progress-bar"><span style="width:${Math.max(0, Math.min(100, academy.completionPercent || 0))}%"></span></div>
    <p><strong>Moduly:</strong> ${escapeHtml(academy.completedModules || 0)}/${escapeHtml(academy.totalModules || 10)}</p>
    <p><strong>Sredni wynik testow:</strong> ${escapeHtml(academy.averageQuizScore || 0)}%</p>
    <p class="muted">Ostatnio: ${escapeHtml(formatDate(academy.lastActiveAt))}</p>
  `;

  els.workerLeadsCount.textContent = `${companies.length} leadow`;
  els.workerLeadsBody.innerHTML = companies.length
    ? companies.slice(0, 250).map((record) => renderLeadRow(record, { selectable: false, workerScoped: true })).join('')
    : '<tr><td colspan="6" class="muted">Brak leadow przypisanych do pracownika.</td></tr>';
}

function renderRunItem(run) {
  const title = (run.niches || []).join(', ') || 'Zapytanie';
  return `
    <div class="list-item run-item">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <div class="muted">${escapeHtml(formatDate(run.started_at))} · ${escapeHtml(run.city || '-')} · ${escapeHtml(run.sourceFocus || '-')}</div>
        <div>Znaleziono: ${escapeHtml(run.found_count || 0)} · Nowe: ${escapeHtml(run.new_count || 0)} · Duble: ${escapeHtml(run.duplicate_count || 0)} · ${escapeHtml(run.status || '-')}</div>
      </div>
      <div class="inline-actions">
        <button class="button secondary" data-open-run="${escapeAttribute(run.id)}">Otworz</button>
        <button class="button secondary" data-reset-run="${escapeAttribute(run.id)}">Reset leadow</button>
        <button class="button danger" data-delete-run="${escapeAttribute(run.id)}">Usun historie</button>
      </div>
    </div>
  `;
}

function renderLeadRow(record, { selectable = true, workerScoped = false } = {}) {
  const source = leadSource(record);
  const colSpan = selectable ? 8 : 6;
  void colSpan;
  return `
    <tr>
      ${selectable ? `<td><input type="checkbox" data-select="${escapeAttribute(record.id)}" ${state.selected.has(record.id) ? 'checked' : ''}></td>` : ''}
      <td>
        <strong>${escapeHtml(leadName(record))}</strong>
        <div class="muted">${escapeHtml(leadLocation(record) || '-')}</div>
      </td>
      <td>${statusSelect(record)}</td>
      ${selectable ? `<td class="mono">${escapeHtml(record.assigned_worker_id || '-')}</td>` : ''}
      <td>${leadContact(record)}</td>
      <td>${source === '-' ? '-' : `<a href="${escapeAttribute(source)}" target="_blank" rel="noreferrer">zrodlo</a>`}</td>
      <td>${escapeHtml(record.seen_count || 1)}</td>
      <td>
        <button class="button secondary" data-reset-one="${escapeAttribute(record.id)}">Reset</button>
        <button class="button danger" data-delete-one="${escapeAttribute(record.id)}">Delete</button>
      </td>
    </tr>
  `;
}

function renderLeads() {
  if (!state.leads.length) {
    els.leadsBody.innerHTML = '<tr><td colspan="8" class="muted">Brak leadow dla tego filtra.</td></tr>';
    return;
  }
  els.leadsBody.innerHTML = state.leads.map((record) => renderLeadRow(record, { selectable: true })).join('');
}

function renderRuns() {
  els.runsList.innerHTML = state.runs.length
    ? state.runs.map(renderRunItem).join('')
    : '<div class="list-item muted">Brak historii parsera.</div>';
}

function renderRunDetail() {
  if (!state.activeRun?.run) {
    els.runDetail.innerHTML = '<div class="muted">Otworz zapytanie, zeby zobaczyc konkretne leady z tej historii.</div>';
    return;
  }
  const { run, companies = [] } = state.activeRun;
  els.runDetail.innerHTML = `
    <div class="run-detail-head">
      <div>
        <h3>${escapeHtml((run.niches || []).join(', ') || 'Zapytanie')}</h3>
        <p class="muted">${escapeHtml(formatDate(run.started_at))} · worker: ${escapeHtml(run.worker_id || '-')}</p>
      </div>
      <div class="inline-actions">
        <button class="button secondary" data-reset-run="${escapeAttribute(run.id)}">Reset leadow</button>
        <button class="button danger" data-delete-run="${escapeAttribute(run.id)}">Usun historie</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Firma</th>
            <th>Status</th>
            <th>Kontakt</th>
            <th>Zrodlo</th>
            <th>Seen</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          ${
            companies.length
              ? companies.map((record) => renderLeadRow(record, { selectable: false })).join('')
              : '<tr><td colspan="6" class="muted">Brak leadow w tym zapytaniu.</td></tr>'
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
              <div>Moduly: ${completed}/10 · sredni wynik: ${avg}%</div>
            </div>
          `;
        })
        .join('')
    : '<div class="list-item muted">Brak zapisanych postepow akademii.</div>';
}

function scoreValues(values) {
  const scores = values.map(Number).filter(Number.isFinite);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
}

function renderSelectedCount() {
  els.selectedCount.textContent = `${state.selected.size} selected`;
}

function render() {
  renderStats();
  renderWorkers();
  renderWorkerDetail();
  renderLeads();
  renderRuns();
  renderRunDetail();
  renderAcademy();
  renderSelectedCount();
  window.lucide?.createIcons();
}

async function resetIds(ids) {
  if (!ids.length) return;
  await api('/api/admin/leads/reset', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
  await loadAll();
}

async function deleteIds(ids) {
  if (!ids.length) return;
  if (!window.confirm(`Usunac ${ids.length} leadow globalnie?`)) return;
  await api('/api/admin/leads', {
    method: 'DELETE',
    body: JSON.stringify({ ids })
  });
  await loadAll();
}

async function updateLeadStatus(id, status) {
  await api(`/api/leads/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
  await loadAll();
}

async function openRun(runId) {
  state.activeRun = await api(`/api/admin/runs/${encodeURIComponent(runId)}`);
  renderRunDetail();
  window.lucide?.createIcons();
}

async function resetRun(runId) {
  if (!window.confirm('Zresetowac wszystkie leady z tego zapytania?')) return;
  await api(`/api/admin/runs/${encodeURIComponent(runId)}/reset`, { method: 'POST' });
  await loadAll();
}

async function deleteRun(runId) {
  if (!window.confirm('Usunac wpis historii zapytania? Leady zostana w globalnej bazie.')) return;
  await api(`/api/admin/runs/${encodeURIComponent(runId)}`, { method: 'DELETE' });
  state.activeRun = null;
  await loadAll();
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
    if (statusSelectEl) {
      await updateLeadStatus(statusSelectEl.dataset.statusLead, statusSelectEl.value);
    }
  });

  table.addEventListener('click', async (event) => {
    const reset = event.target.closest('[data-reset-one]');
    if (reset) await resetIds([reset.dataset.resetOne]);

    const remove = event.target.closest('[data-delete-one]');
    if (remove) await deleteIds([remove.dataset.deleteOne]);
  });
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

els.refreshButton.addEventListener('click', () => loadAll());
els.workerSearchInput.addEventListener('input', renderWorkers);
els.searchInput.addEventListener('input', () => {
  clearTimeout(els.searchInput._timer);
  els.searchInput._timer = setTimeout(() => loadAll(), 300);
});
els.statusFilter.addEventListener('change', () => loadAll());

els.workersBody.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-open-worker]');
  if (!button) return;
  await loadWorkerDetail(button.dataset.openWorker);
});

bindLeadTable(els.leadsBody);
bindLeadTable(els.workerLeadsBody);
bindLeadTable(els.runDetail);
bindRunActions(els.runsList);
bindRunActions(els.workerRunsList);
bindRunActions(els.runDetail);

els.resetSelected.addEventListener('click', () => resetIds([...state.selected]));
els.deleteSelected.addEventListener('click', () => deleteIds([...state.selected]));

loadAll().catch((error) => {
  els.workersBody.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
  els.leadsBody.innerHTML = `<tr><td colspan="8">${escapeHtml(error.message)}</td></tr>`;
});
