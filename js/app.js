// ============================================================
//  APP.JS — core state, rendering, UI interactions
// ============================================================

/* ── STATE ── */
let currentPhase   = 'before';
let checkedState   = JSON.parse(localStorage.getItem('wpqa-checked') || '{}');
let customItems    = JSON.parse(localStorage.getItem('wpqa-custom')  || '{}');
let submitHistory  = JSON.parse(localStorage.getItem('wpqa-history') || '[]');
let selectedType   = 'internal';

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-date').valueAsDate = new Date();
  loadEmailConfig();
  renderSections();
  updateProgress();
  renderAdminItems();
  renderHistory();
});

/* ── DATA HELPERS ── */
function getCurrentData() {
  return currentPhase === 'before' ? BEFORE_DATA : AFTER_DATA;
}

function getAllItems(section) {
  return [...section.items, ...(customItems[section.id] || [])];
}

function getChecked(sectionId) {
  return checkedState[sectionId] || [];
}

/* ── PERSIST ── */
function saveChecked()  { localStorage.setItem('wpqa-checked',  JSON.stringify(checkedState)); }
function saveCustom()   { localStorage.setItem('wpqa-custom',   JSON.stringify(customItems)); }
function saveHistory()  { localStorage.setItem('wpqa-history',  JSON.stringify(submitHistory)); }

/* ── RENDER SECTIONS ── */
function renderSections() {
  const container = document.getElementById('sections-container');
  container.innerHTML = '';
  getCurrentData().forEach(section => renderSection(section, container));
}

function renderSection(section, container) {
  const allItems = getAllItems(section);
  const count    = getChecked(section.id).filter(x => allItems.includes(x)).length;
  const total    = allItems.length;
  const allDone  = count === total && total > 0;

  const badgeClass = count === 0 ? 'badge-neutral' : (allDone ? 'badge-ok' : 'badge-warn');
  const badgeText  = allDone ? '✓ Complete' : `${count}/${total}`;

  const div = document.createElement('div');
  div.className = 'checklist-section';
  div.id = 'sec-' + section.id;

  div.innerHTML = `
    <div class="section-header" onclick="toggleSection('${section.id}')">
      <div class="section-icon" style="background:${section.color}22;">${section.icon}</div>
      <div class="section-title">${section.label}</div>
      <div class="section-badge ${badgeClass}" id="badge-${section.id}">${badgeText}</div>
      <div class="chevron open" id="chev-${section.id}">▶</div>
    </div>
    <div class="section-body open" id="body-${section.id}">
      ${allItems.map(item => renderCheckItem(section.id, item)).join('')}
    </div>
  `;
  container.appendChild(div);
}

function renderCheckItem(sectionId, item) {
  const isChecked = getChecked(sectionId).includes(item);
  const safeItem  = item.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  return `
    <div class="check-item${isChecked ? ' checked' : ''}"
         onclick="toggleItem('${sectionId}', '${safeItem}', this)">
      <div class="check-box">
        <svg class="check-tick" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2" stroke="white" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="check-text">${item}</div>
    </div>`;
}

/* ── TOGGLE ITEM ── */
function toggleItem(sectionId, itemText, el) {
  if (!checkedState[sectionId]) checkedState[sectionId] = [];
  const idx = checkedState[sectionId].indexOf(itemText);
  if (idx >= 0) {
    checkedState[sectionId].splice(idx, 1);
    el.classList.remove('checked');
  } else {
    checkedState[sectionId].push(itemText);
    el.classList.add('checked');
  }
  saveChecked();
  updateProgress();
  refreshSectionBadge(sectionId);
}

/* ── SECTION BADGE ── */
function refreshSectionBadge(sectionId) {
  const section  = getCurrentData().find(s => s.id === sectionId);
  if (!section) return;
  const allItems = getAllItems(section);
  const count    = getChecked(sectionId).filter(x => allItems.includes(x)).length;
  const total    = allItems.length;
  const allDone  = count === total && total > 0;
  const el       = document.getElementById('badge-' + sectionId);
  if (!el) return;
  el.className   = 'section-badge ' + (count === 0 ? 'badge-neutral' : (allDone ? 'badge-ok' : 'badge-warn'));
  el.textContent = allDone ? '✓ Complete' : `${count}/${total}`;
}

/* ── TOGGLE SECTION COLLAPSE ── */
function toggleSection(id) {
  document.getElementById('body-' + id).classList.toggle('open');
  document.getElementById('chev-' + id).classList.toggle('open');
}

/* ── PROGRESS BAR ── */
function updateProgress() {
  const data = getCurrentData();
  let total = 0, checked = 0;
  data.forEach(s => {
    const all = getAllItems(s);
    total   += all.length;
    checked += getChecked(s.id).filter(x => all.includes(x)).length;
  });
  const pct = total === 0 ? 0 : Math.round(checked / total * 100);
  document.getElementById('pct-display').innerHTML     = pct + '<span>%</span>';
  document.getElementById('prog-fill').style.width     = pct + '%';
  document.getElementById('count-display').textContent = `${checked} of ${total} checked`;
  document.getElementById('phase-display').textContent = currentPhase === 'before' ? 'Pre-live' : 'Post-live';
}

/* ── PHASE SWITCH ── */
function switchPhase(phase) {
  currentPhase = phase;
  document.getElementById('phase-before').classList.toggle('active', phase === 'before');
  document.getElementById('phase-after').classList.toggle('active',  phase === 'after');
  renderSections();
  updateProgress();
}

/* ── VIEW SWITCH ── */
function showView(view) {
  ['before','after','admin','history'].forEach(v => {
    const el = document.getElementById('nav-' + v);
    if (el) el.classList.remove('active');
  });
  document.getElementById('panel-checklist').style.display = 'none';
  document.getElementById('panel-admin').style.display     = 'none';
  document.getElementById('panel-history').style.display   = 'none';

  if (view === 'before' || view === 'after') {
    document.getElementById('panel-checklist').style.display = 'block';
    switchPhase(view);
    document.getElementById('nav-' + view).classList.add('active');
  } else {
    document.getElementById('panel-' + view).style.display = 'block';
    document.getElementById('nav-' + view).classList.add('active');
    if (view === 'history') renderHistory();
    if (view === 'admin')   { renderAdminItems(); loadEmailConfig(); }
  }
}

/* ── SUBMIT MODAL ── */
function openSubmitModal(preset) {
  checkEmailConfig();
  document.getElementById('submit-modal').classList.add('open');
  selectSubmitType(preset || 'internal');
}

function closeModal() {
  document.getElementById('submit-modal').classList.remove('open');
}

function selectSubmitType(type) {
  selectedType = type;
  document.getElementById('type-internal').classList.toggle('selected', type === 'internal');
  document.getElementById('type-external').classList.toggle('selected', type === 'external');
  document.getElementById('send-btn-text').textContent =
    type === 'internal' ? 'Send to Internal Team' : 'Send to Client & Team';
  generatePreview();
}

/* ── REPORT PREVIEW ── */
function generatePreview() {
  const project   = document.getElementById('f-project').value     || '[Project Name]';
  const url       = document.getElementById('f-url').value         || '[URL]';
  const client    = document.getElementById('f-client').value      || '[Client]';
  const checkedBy = document.getElementById('f-checked-by').value  || '[Checked By]';
  const date      = document.getElementById('f-date').value        || '—';
  const remarks   = document.getElementById('f-remarks').value;
  const phase     = currentPhase === 'before' ? 'BEFORE GO-LIVE' : 'AFTER GO-LIVE';
  const data      = getCurrentData();

  let lines = [];
  if (selectedType === 'external') {
    lines.push(`<span class="r-head">━━ WP DEPLOYMENT QA REPORT — ${phase} ━━</span>`);
    lines.push(`Project  : ${project}`);
    lines.push(`Website  : ${url}`);
    lines.push(`Client   : ${client}`);
    lines.push(`Date     : ${date}`);
    lines.push(`Reviewed : ${checkedBy}`);
    lines.push(`<span class="r-head">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
  } else {
    lines.push(`<span class="r-head">INTERNAL QA — ${phase}</span>`);
    lines.push(`${project} · ${date} · By: ${checkedBy}`);
    lines.push(`<span class="r-head">────────────────────────────────────</span>`);
  }

  let total = 0, checked = 0;
  data.forEach(section => {
    const all      = getAllItems(section);
    const sChecked = getChecked(section.id);
    lines.push(`<span class="r-head">${section.icon} ${section.label.toUpperCase()}</span>`);
    all.forEach(item => {
      const done = sChecked.includes(item);
      lines.push(done
        ? `<span class="r-ok">  [✓] ${item}</span>`
        : `<span class="r-miss">  [✗] ${item}</span>`);
      if (done) checked++;
      total++;
    });
  });

  const pct = total ? Math.round(checked / total * 100) : 0;
  lines.push(`<span class="r-head">────────────────────────────────────</span>`);
  lines.push(`COMPLETION: ${checked}/${total} (${pct}%) — ${pct === 100 ? 'COMPLETE ✓' : 'PENDING'}`);
  if (remarks) lines.push(`REMARKS: ${remarks}`);

  document.getElementById('report-preview').innerHTML = lines.join('<br>');
}

/* ── BUILD PLAIN TEXT REPORT (for email body) ── */
function buildPlainReport() {
  const project   = document.getElementById('f-project').value    || '[Project]';
  const url       = document.getElementById('f-url').value        || '—';
  const client    = document.getElementById('f-client').value     || '—';
  const team      = document.getElementById('f-team').value       || '—';
  const checkedBy = document.getElementById('f-checked-by').value || '—';
  const date      = document.getElementById('f-date').value       || '—';
  const remarks   = document.getElementById('f-remarks').value    || 'None';
  const phase     = currentPhase === 'before' ? 'BEFORE GO-LIVE' : 'AFTER GO-LIVE';
  const data      = getCurrentData();

  let lines = [
    `WP DEPLOYMENT QA REPORT — ${phase}`,
    `${'═'.repeat(45)}`,
    `Project  : ${project}`,
    `Website  : ${url}`,
    `Client   : ${client}`,
    `Team     : ${team}`,
    `Date     : ${date}`,
    `Reviewed : ${checkedBy}`,
    `${'─'.repeat(45)}`, ''
  ];

  let total = 0, checked = 0;
  data.forEach(section => {
    const all      = getAllItems(section);
    const sChecked = getChecked(section.id);
    lines.push(`${section.icon}  ${section.label.toUpperCase()}`);
    all.forEach(item => {
      const done = sChecked.includes(item);
      lines.push(`  ${done ? '[✓]' : '[ ]'} ${item}`);
      if (done) checked++;
      total++;
    });
    lines.push('');
  });

  const pct = total ? Math.round(checked / total * 100) : 0;
  lines.push(`${'─'.repeat(45)}`);
  lines.push(`COMPLETION : ${checked}/${total} items (${pct}%)`);
  lines.push(`STATUS     : ${pct === 100 ? 'COMPLETE ✓' : 'PENDING'}`);
  lines.push(`REMARKS    : ${remarks}`);

  return { text: lines.join('\n'), checked, total, pct, project, url, client, team, checkedBy, date, remarks, phase };
}

/* ── ADMIN — ITEMS ── */
function renderAdminItems() {
  const allData = [...BEFORE_DATA, ...AFTER_DATA];
  const list    = document.getElementById('admin-items-list');
  const sel     = document.getElementById('new-item-section');
  if (!list || !sel) return;

  sel.innerHTML = allData.map(s => `<option value="${s.id}">${s.icon} ${s.label}</option>`).join('');

  list.innerHTML = allData.map(section => {
    const all = getAllItems(section);
    return `
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;font-family:var(--mono);">
          ${section.icon} ${section.label}
        </div>
        ${all.map((item, i) => {
          const isCustom = i >= section.items.length;
          const safe = item.replace(/'/g, "\\'");
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
            <span style="flex:1;color:var(--text2);">${item}</span>
            ${isCustom ? `<button onclick="deleteCustomItem('${section.id}','${safe}')"
              style="background:none;border:none;color:var(--red);cursor:pointer;font-size:13px;padding:2px 6px;">✕</button>` : ''}
          </div>`;
        }).join('')}
      </div>`;
  }).join('');
}

function addCustomItem() {
  const text    = document.getElementById('new-item-text').value.trim();
  const secId   = document.getElementById('new-item-section').value;
  if (!text) { showToast('⚠️', 'Empty item', 'Please type the item text first.'); return; }
  if (!customItems[secId]) customItems[secId] = [];
  customItems[secId].push(text);
  document.getElementById('new-item-text').value = '';
  saveCustom();
  renderAdminItems();
  renderSections();
  updateProgress();
  showToast('✅', 'Item Added', `Added to section.`);
}

function deleteCustomItem(secId, item) {
  if (!customItems[secId]) return;
  customItems[secId] = customItems[secId].filter(x => x !== item);
  saveCustom();
  renderAdminItems();
  renderSections();
  updateProgress();
  showToast('🗑️', 'Removed', 'Custom item deleted.');
}

/* ── HISTORY ── */
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;
  if (!submitHistory.length) {
    list.innerHTML = '<p style="font-size:13px;color:var(--text3);padding:8px 0;">No submissions yet.</p>';
    return;
  }
  list.innerHTML = submitHistory.map(e => `
    <div class="history-item">
      <div style="flex:1;">
        <div class="history-project">${e.project}</div>
        <div class="history-meta">${e.client} · ${e.url}</div>
      </div>
      <span class="h-pill ${e.type === 'internal' ? 'type-internal' : 'type-external'}">${e.type}</span>
      <span class="h-pill ${e.pct === 100 ? 'status-complete' : 'status-pending'}">${e.pct}%</span>
      <span style="font-size:11px;color:var(--text3);font-family:var(--mono);">${e.date}</span>
    </div>`).join('');
}

/* ── EXPORT ── */
function exportCSV() {
  if (!submitHistory.length) { showToast('⚠️', 'No data', 'No submissions to export.'); return; }
  const rows = [['Project','Client','URL','Date','Type','Phase','Completion%']];
  submitHistory.forEach(e => rows.push([e.project,e.client,e.url,e.date,e.type,e.phase,e.pct+'%']));
  download('wp-qa-history.csv', rows.map(r => r.join(',')).join('\n'), 'text/csv');
  showToast('📤', 'CSV Exported', 'File downloaded.');
}

function exportTextReport() {
  const { text } = buildPlainReport();
  download('wp-qa-report.txt', text, 'text/plain');
  showToast('📤', 'Report Exported', 'Text file downloaded.');
}

function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
}

/* ── RESET / DRAFT ── */
function resetAll() {
  if (!confirm('Reset all checked items for the current phase? Project details are kept.')) return;
  const data = getCurrentData();
  data.forEach(s => { delete checkedState[s.id]; });
  saveChecked();
  renderSections();
  updateProgress();
  showToast('🔄', 'Reset', 'Checkboxes cleared.');
}

function saveDraft() {
  saveChecked();
  showToast('💾', 'Draft Saved', 'Progress saved in this browser.');
}

/* ── TOAST ── */
function showToast(icon, title, body) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent  = icon;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-body').textContent  = body;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ── EMAIL CONFIG UI ── */
function saveEmailConfig() {
  const cfg = {
    serviceId:        document.getElementById('cfg-service-id').value.trim(),
    publicKey:        document.getElementById('cfg-public-key').value.trim(),
    templateInternal: document.getElementById('cfg-template-internal').value.trim(),
    templateExternal: document.getElementById('cfg-template-external').value.trim()
  };
  localStorage.setItem('wpqa-emailcfg', JSON.stringify(cfg));
  document.getElementById('cfg-status').style.display = 'inline';
  setTimeout(() => document.getElementById('cfg-status').style.display = 'none', 3000);
  showToast('✅', 'Config Saved', 'EmailJS credentials saved locally.');
}

function loadEmailConfig() {
  const cfg = JSON.parse(localStorage.getItem('wpqa-emailcfg') || '{}');
  if (document.getElementById('cfg-service-id')) {
    document.getElementById('cfg-service-id').value        = cfg.serviceId        || '';
    document.getElementById('cfg-public-key').value        = cfg.publicKey        || '';
    document.getElementById('cfg-template-internal').value = cfg.templateInternal || '';
    document.getElementById('cfg-template-external').value = cfg.templateExternal || '';
  }
}

function checkEmailConfig() {
  const cfg = JSON.parse(localStorage.getItem('wpqa-emailcfg') || '{}');
  const ok  = cfg.serviceId && cfg.publicKey && cfg.templateInternal && cfg.templateExternal;
  document.getElementById('email-warning').style.display = ok ? 'none' : 'block';
}
