const state = {
  leads: [],
  runs: [],
  academyUsers: [],
  stats: {},
  selected: new Set()
};

const els = {
  statsGrid: document.querySelector('#statsGrid'),
  leadsBody: document.querySelector('#leadsBody'),
  runsList: document.querySelector('#runsList'),
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

async function loadAll() {
  const params = new URLSearchParams();
  if (els.searchInput.value.trim()) params.set('q', els.searchInput.value.trim());
  if (els.statusFilter.value) params.set('status', els.statusFilter.value);
  params.set('limit', '500');

  const [leadsData, summaryData] = await Promise.all([
    api(`/api/admin/leads?${params.toString()}`),
    api('/api/admin/summary')
  ]);

  state.leads = leadsData.leads || [];
  state.stats = leadsData.stats || summaryData.stats || {};
  state.runs = summaryData.runs || [];
  state.academyUsers = summaryData.academyUsers || [];
  state.selected.clear();
  render();
}

function renderStats() {
  const stats = [
    ['Leady razem', state.stats.totalCompanies || 0],
    ['Dostępne po reset', state.stats.availableCompanies || 0],
    ['Zarezerwowane', state.stats.reservedCompanies || 0],
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

function renderLeads() {
  if (!state.leads.length) {
    els.leadsBody.innerHTML = '<tr><td colspan="8" class="muted">Brak leadów dla tego filtra.</td></tr>';
    return;
  }

  els.leadsBody.innerHTML = state.leads
    .map((record) => {
      const data = record.data || {};
      const status = record.status || 'new';
      const contact = [data.phone, data.email].filter(Boolean).join('<br>') || '-';
      const source = data.website_url || data.source_profile || data.google_maps_url || '-';
      return `
        <tr>
          <td><input type="checkbox" data-select="${escapeHtml(record.id)}" ${state.selected.has(record.id) ? 'checked' : ''}></td>
          <td>
            <strong>${escapeHtml(data.company || data.legal_name || 'Bez nazwy')}</strong>
            <div class="muted">${escapeHtml([data.niche, data.city, data.address].filter(Boolean).join(' · '))}</div>
          </td>
          <td><span class="status ${escapeHtml(status)}">${escapeHtml(status)}</span></td>
          <td>${escapeHtml(record.assigned_worker_id || '-')}</td>
          <td>${contact}</td>
          <td>${source === '-' ? '-' : `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">źródło</a>`}</td>
          <td>${escapeHtml(record.seen_count || 1)}</td>
          <td>
            <button class="button secondary" data-reset-one="${escapeHtml(record.id)}">Reset</button>
            <button class="button danger" data-delete-one="${escapeHtml(record.id)}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderRuns() {
  els.runsList.innerHTML = state.runs.length
    ? state.runs
        .map((run) => `
          <div class="list-item">
            <strong>${escapeHtml((run.niches || []).join(', ') || 'Run')}</strong>
            <div class="muted">${escapeHtml(new Date(run.started_at).toLocaleString('pl-PL'))} · ${escapeHtml(run.city || '-')} · ${escapeHtml(run.sourceFocus || '-')}</div>
            <div>Znaleziono: ${escapeHtml(run.found_count || 0)} · Nowe: ${escapeHtml(run.new_count || 0)} · Duble: ${escapeHtml(run.duplicate_count || 0)} · ${escapeHtml(run.status || '-')}</div>
          </div>
        `)
        .join('')
    : '<div class="list-item muted">Brak historii parsera.</div>';
}

function renderAcademy() {
  els.academyList.innerHTML = state.academyUsers.length
    ? state.academyUsers
        .map((user) => {
          const completed = Array.isArray(user.completedModules) ? user.completedModules.length : 0;
          const scores = Object.values(user.quizScores || {}).map(Number).filter(Number.isFinite);
          const avg = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
          return `
            <div class="list-item">
              <strong>${escapeHtml(user.displayName || user.userId)}</strong>
              <div class="muted">${escapeHtml(user.userId)} · ostatnio: ${escapeHtml(user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString('pl-PL') : '-')}</div>
              <div>Moduły: ${completed}/10 · średni wynik: ${avg}%</div>
            </div>
          `;
        })
        .join('')
    : '<div class="list-item muted">Brak zapisanych postępów akademii.</div>';
}

function renderSelectedCount() {
  els.selectedCount.textContent = `${state.selected.size} selected`;
}

function render() {
  renderStats();
  renderLeads();
  renderRuns();
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
  await api('/api/admin/leads', {
    method: 'DELETE',
    body: JSON.stringify({ ids })
  });
  await loadAll();
}

els.refreshButton.addEventListener('click', loadAll);
els.searchInput.addEventListener('input', () => {
  clearTimeout(els.searchInput._timer);
  els.searchInput._timer = setTimeout(loadAll, 300);
});
els.statusFilter.addEventListener('change', loadAll);

els.leadsBody.addEventListener('change', (event) => {
  const checkbox = event.target.closest('[data-select]');
  if (!checkbox) return;
  if (checkbox.checked) state.selected.add(checkbox.dataset.select);
  else state.selected.delete(checkbox.dataset.select);
  renderSelectedCount();
});

els.leadsBody.addEventListener('click', async (event) => {
  const reset = event.target.closest('[data-reset-one]');
  if (reset) await resetIds([reset.dataset.resetOne]);

  const remove = event.target.closest('[data-delete-one]');
  if (remove) await deleteIds([remove.dataset.deleteOne]);
});

els.resetSelected.addEventListener('click', () => resetIds([...state.selected]));
els.deleteSelected.addEventListener('click', () => deleteIds([...state.selected]));

loadAll().catch((error) => {
  els.leadsBody.innerHTML = `<tr><td colspan="8">${escapeHtml(error.message)}</td></tr>`;
});
