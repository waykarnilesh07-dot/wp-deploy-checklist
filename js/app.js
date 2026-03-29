// ============================================================
//  APP.JS — Core app logic, autosave, confetti, UI
// ============================================================

let currentPhase   = 'before';
let checkedState   = JSON.parse(localStorage.getItem('wpqa-checked') || '{}');
let customItems    = JSON.parse(localStorage.getItem('wpqa-custom')  || '{}');
let submitHistory  = JSON.parse(localStorage.getItem('wpqa-history') || '[]');
let selectedType   = 'internal';
let autosaveTimer  = null;
let projectBarOpen = true;
let confettiActive = false;

/* ── INIT ── */
function initApp() {
  document.getElementById('f-date').valueAsDate = new Date();
  loadFormData();
  loadEmailConfig();
  loadNotifConfig();
  renderSections();
  updateProgress();
  renderAdminItems();
  renderHistory();
  updateDashboard();
  showView('dashboard');
  setGreeting();
  startReminderCheck();

  // Autosave every 30 seconds
  setInterval(() => {
    saveFormData();
    showAutosaveBadge();
  }, 30000);
}

/* ── GREETING ── */
function setGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning! 👋' : h < 17 ? 'Good afternoon! ☀️' : 'Good evening! 🌙';
  document.getElementById('greeting-text').textContent = greet;
  document.getElementById('dashboard-date').textContent =
    new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

/* ── DATA HELPERS ── */
function getCurrentData() { return currentPhase === 'before' ? BEFORE_DATA : AFTER_DATA; }
function getAllItems(section) { return [...section.items, ...(customItems[section.id] || [])]; }
function getChecked(sectionId) { return checkedState[sectionId] || []; }

/* ── PERSIST ── */
function saveChecked()  { localStorage.setItem('wpqa-checked',  JSON.stringify(checkedState)); }
function saveCustom()   { localStorage.setItem('wpqa-custom',   JSON.stringify(customItems)); }
function saveHistory()  { localStorage.setItem('wpqa-history',  JSON.stringify(submitHistory)); }

function saveFormData() {
  const fields = ['f-project','f-url','f-client','f-team','f-client-email','f-internal-email','f-checked-by','f-date','f-remarks'];
  const data = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  localStorage.setItem('wpqa-formdata', JSON.stringify(data));
}

function loadFormData() {
  const data = JSON.parse(localStorage.getItem('wpqa-formdata') || '{}');
  Object.entries(data).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  });
}

/* ── AUTOSAVE ── */
function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveFormData();
    showAutosaveBadge();
  }, 2000);
}

function showAutosaveBadge() {
  const badge = document.getElementById('autosave-badge');
  badge.classList.add('visible');
  clearTimeout(badge._t);
  badge._t = setTimeout(() => badge.classList.remove('visible'), 3000);
}

/* ── RENDER SECTIONS ── */
function renderSections() {
  const container = document.getElementById('sections-container');
  container.innerHTML = '';
  getCurrentData().forEach(section => {
    const div = createSectionEl(section);
    container.appendChild(div);
  });
}

function createSectionEl(section) {
  const allItems = getAllItems(section);
  const count    = getChecked(section.id).filter(x => allItems.includes(x)).length;
  const total    = allItems.length;
  const allDone  = count === total && total > 0;
  const pct      = total ? Math.round(count/total*100) : 0;

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
    <div class="section-mini-bar"><div class="section-mini-fill" id="mini-${section.id}" style="width:${pct}%;background:${section.color};"></div></div>
    <div class="section-body open" id="body-${section.id}">
      ${allItems.map(item => renderCheckItem(section.id, item)).join('')}
    </div>`;
  return div;
}

function renderCheckItem(sectionId, item) {
  const isChecked = getChecked(sectionId).includes(item);
  const safe = item.replace(/'/g, "\\'").replace(/"/g,'&quot;');
  return `
    <div class="check-item${isChecked ? ' checked' : ''}" onclick="toggleItem('${sectionId}','${safe}',this)">
      <div class="check-box">
        <svg class="check-tick" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
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
  updateDashboard();
  scheduleAutosave();
}

/* ── SECTION BADGE ── */
function refreshSectionBadge(sectionId) {
  const section  = getCurrentData().find(s => s.id === sectionId);
  if (!section) return;
  const allItems = getAllItems(section);
  const count    = getChecked(sectionId).filter(x => allItems.includes(x)).length;
  const total    = allItems.length;
  const allDone  = count === total && total > 0;
  const pct      = total ? Math.round(count/total*100) : 0;

  const badge = document.getElementById('badge-' + sectionId);
  const mini  = document.getElementById('mini-' + sectionId);
  if (badge) {
    badge.className = 'section-badge ' + (count === 0 ? 'badge-neutral' : (allDone ? 'badge-ok' : 'badge-warn'));
    badge.textContent = allDone ? '✓ Complete' : `${count}/${total}`;
  }
  if (mini) mini.style.width = pct + '%';
}

function toggleSection(id) {
  document.getElementById('body-' + id).classList.toggle('open');
  document.getElementById('chev-' + id).classList.toggle('open');
}

/* ── PROGRESS ── */
function updateProgress() {
  const data = getCurrentData();
  let total = 0, checked = 0;
  data.forEach(s => {
    const all = getAllItems(s);
    total   += all.length;
    checked += getChecked(s.id).filter(x => all.includes(x)).length;
  });
  const pct = total === 0 ? 0 : Math.round(checked / total * 100);

  document.getElementById('pct-display').textContent  = pct + '%';
  document.getElementById('prog-fill').style.width    = pct + '%';
  document.getElementById('count-display').textContent = `${checked} of ${total}`;

  // Nav counts
  const bPct = getPhasePercent('before');
  const aPct = getPhasePercent('after');
  document.getElementById('nc-before').textContent = bPct + '%';
  document.getElementById('nc-after').textContent  = aPct + '%';

  // Submit panel
  const submitText = document.getElementById('submit-completion-text');
  if (submitText) submitText.textContent = `${pct}% Complete`;

  // Confetti at 100%
  if (pct === 100 && !confettiActive) {
    confettiActive = true;
    launchConfetti();
    setTimeout(() => { confettiActive = false; }, 5000);
  }
}

function getPhasePercent(phase) {
  const data = phase === 'before' ? BEFORE_DATA : AFTER_DATA;
  let total = 0, checked = 0;
  data.forEach(s => {
    const all = getAllItems(s);
    total   += all.length;
    checked += getChecked(s.id).filter(x => all.includes(x)).length;
  });
  return total === 0 ? 0 : Math.round(checked / total * 100);
}

/* ── CONFETTI ── */
function launchConfetti() {
  showToast('🎉', 'Section Complete!', 'All items checked! Great work!');
  const canvas = document.getElementById('confetti-canvas');
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({length:150}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 150 + 10,
    color: ['#4f7cff','#2ecc8a','#f5a623','#ff5c5c','#b467ff','#fff'][Math.floor(Math.random()*6)],
    tilt: Math.floor(Math.random()*10) - 10,
    tiltAngle: 0, tiltSpeed: Math.random()*0.1+0.05
  }));

  let angle = 0, tick = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    angle += 0.01;
    tick++;
    pieces.forEach((p,i) => {
      p.tiltAngle += p.tiltSpeed;
      p.y += (Math.cos(angle + p.d) + 1 + p.r/2) * 1.5;
      p.x += Math.sin(angle) * 2;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r*0.6, p.tiltAngle, 0, 2*Math.PI);
      ctx.fill();
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
    if (tick < 300) requestAnimationFrame(draw);
    else { ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }
  }
  draw();
}

/* ── VIEW SWITCH ── */
function showView(view) {
  ['dashboard','before','after','admin','history'].forEach(v => {
    const el = document.getElementById('nav-' + v);
    if (el) el.classList.remove('active');
  });
  ['panel-dashboard','panel-checklist','panel-admin','panel-history'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const breadcrumbs = {
    dashboard: 'Dashboard', before: 'Before Go-Live',
    after: 'After Go-Live', admin: 'Admin Panel', history: 'History'
  };
  document.getElementById('breadcrumb').textContent = breadcrumbs[view] || view;

  if (view === 'dashboard') {
    document.getElementById('panel-dashboard').style.display = 'block';
    document.getElementById('nav-dashboard').classList.add('active');
    updateDashboard();
  } else if (view === 'before' || view === 'after') {
    document.getElementById('panel-checklist').style.display = 'block';
    document.getElementById('nav-' + view).classList.add('active');
    if (view !== currentPhase) { currentPhase = view; renderSections(); updateProgress(); }
  } else if (view === 'admin') {
    if (!hasPermission('admin')) { showToast('🔒','Access Denied','Admin panel requires admin role.'); return; }
    document.getElementById('panel-admin').style.display = 'block';
    document.getElementById('nav-admin').classList.add('active');
    loadEmailConfig(); loadNotifConfig(); renderAdminItems();
  } else if (view === 'history') {
    document.getElementById('panel-history').style.display = 'block';
    document.getElementById('nav-history').classList.add('active');
    renderHistory();
  }
  closeSidebar();
}

/* ── THEME ── */
function toggleTheme() {
  const html  = document.documentElement;
  const dark  = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', dark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent  = dark ? '🌙' : '☀';
  document.getElementById('theme-label').textContent = dark ? 'Dark Mode' : 'Light Mode';
  localStorage.setItem('wpqa-theme', dark ? 'light' : 'dark');
  updateCharts();
}

// Load saved theme
(function() {
  const t = localStorage.getItem('wpqa-theme');
  if (t) {
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'light') {
      setTimeout(() => {
        document.getElementById('theme-icon').textContent = '🌙';
        document.getElementById('theme-label').textContent = 'Dark Mode';
      }, 100);
    }
  }
})();

/* ── SIDEBAR TOGGLE ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function closeSidebar() {
  if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
}

/* ── PROJECT BAR ── */
function toggleProjectBar() {
  projectBarOpen = !projectBarOpen;
  const fields  = document.getElementById('project-fields');
  const toggle  = document.querySelector('.project-bar-toggle');
  fields.style.display  = projectBarOpen ? 'grid' : 'none';
  toggle.textContent    = projectBarOpen ? '▾ Collapse' : '▸ Expand';
}

/* ── ADMIN TABS ── */
function switchAdminTab(tab) {
  ['emailjs','items','notifications','export'].forEach(t => {
    document.getElementById('atab-' + t).classList.remove('active');
    document.getElementById('admin-' + t).style.display = 'none';
  });
  document.getElementById('atab-' + tab).classList.add('active');
  document.getElementById('admin-' + tab).style.display = 'block';
}

/* ── SUBMIT MODAL ── */
function openSubmitModal(preset) {
  checkEmailConfig();
  document.getElementById('submit-modal').classList.add('open');
  selectSubmitType(preset || 'internal');
  initSignaturePad();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
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
  const vals = getFormValues();
  const data = getCurrentData();
  const phase = currentPhase === 'before' ? 'BEFORE GO-LIVE' : 'AFTER GO-LIVE';
  let lines = [], total = 0, checked = 0;

  if (selectedType === 'external') {
    lines.push(`<span class="r-head">━━ WP QA REPORT — ${phase} ━━</span>`);
    lines.push(`Project: ${vals.project} | Website: ${vals.url}`);
    lines.push(`Client: ${vals.client} | Date: ${vals.date}`);
    lines.push(`<span class="r-head">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
  } else {
    lines.push(`<span class="r-head">INTERNAL QA — ${phase}</span>`);
    lines.push(`${vals.project} · ${vals.date} · ${vals.checkedBy}`);
    lines.push(`<span class="r-head">────────────────────────────────</span>`);
  }

  data.forEach(section => {
    const all = getAllItems(section);
    const sChecked = getChecked(section.id);
    lines.push(`<span class="r-head">${section.icon} ${section.label.toUpperCase()}</span>`);
    all.forEach(item => {
      const done = sChecked.includes(item);
      lines.push(done ? `<span class="r-ok">  [✓] ${item}</span>` : `<span class="r-miss">  [✗] ${item}</span>`);
      if (done) checked++; total++;
    });
  });

  const pct = total ? Math.round(checked/total*100) : 0;
  lines.push(`<span class="r-head">────────────────────────────────</span>`);
  lines.push(`COMPLETION: ${checked}/${total} (${pct}%) — ${pct===100?'COMPLETE ✓':'PENDING'}`);
  if (vals.remarks) lines.push(`REMARKS: ${vals.remarks}`);

  document.getElementById('report-preview').innerHTML = lines.join('<br>');
}

/* ── FORM VALUES ── */
function getFormValues() {
  return {
    project:      document.getElementById('f-project')?.value      || '',
    url:          document.getElementById('f-url')?.value          || '',
    client:       document.getElementById('f-client')?.value       || '',
    team:         document.getElementById('f-team')?.value         || '',
    clientEmail:  document.getElementById('f-client-email')?.value || '',
    internalEmail:document.getElementById('f-internal-email')?.value|| '',
    checkedBy:    document.getElementById('f-checked-by')?.value   || '',
    date:         document.getElementById('f-date')?.value         || '',
    remarks:      document.getElementById('f-remarks')?.value      || ''
  };
}

/* ── BUILD PLAIN REPORT ── */
function buildPlainReport() {
  const v     = getFormValues();
  const phase = currentPhase === 'before' ? 'BEFORE GO-LIVE' : 'AFTER GO-LIVE';
  const data  = getCurrentData();
  let lines   = [
    `WP DEPLOYMENT QA REPORT — ${phase}`,
    '═'.repeat(44),
    `Project  : ${v.project}`,
    `Website  : ${v.url}`,
    `Client   : ${v.client}`,
    `Team     : ${v.team}`,
    `Date     : ${v.date}`,
    `Reviewed : ${v.checkedBy}`,
    '─'.repeat(44), ''
  ];
  let total = 0, checked = 0;
  data.forEach(section => {
    const all = getAllItems(section);
    const sC  = getChecked(section.id);
    lines.push(`${section.icon}  ${section.label.toUpperCase()}`);
    all.forEach(item => {
      const done = sC.includes(item);
      lines.push(`  ${done ? '[✓]' : '[ ]'} ${item}`);
      if (done) checked++; total++;
    });
    lines.push('');
  });
  const pct = total ? Math.round(checked/total*100) : 0;
  lines.push('─'.repeat(44));
  lines.push(`COMPLETION : ${checked}/${total} (${pct}%)`);
  lines.push(`STATUS     : ${pct===100 ? 'COMPLETE ✓' : 'PENDING'}`);
  lines.push(`REMARKS    : ${v.remarks || 'None'}`);
  return { text: lines.join('\n'), checked, total, pct, phase, ...v };
}

/* ── ADMIN — ITEMS ── */
function renderAdminItems() {
  const allData = [...BEFORE_DATA, ...AFTER_DATA];
  const list = document.getElementById('admin-items-list');
  const sel  = document.getElementById('new-item-section');
  if (!list || !sel) return;
  sel.innerHTML = allData.map(s => `<option value="${s.id}">${s.icon} ${s.label}</option>`).join('');
  list.innerHTML = allData.map(section => {
    const all = getAllItems(section);
    return `<div style="margin-bottom:14px;">
      <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;font-family:'JetBrains Mono',monospace;">${section.icon} ${section.label}</div>
      ${all.map((item,i) => {
        const isCustom = i >= section.items.length;
        const safe = item.replace(/'/g,"\\'");
        return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
          <span style="flex:1;color:var(--text2);">${item}</span>
          ${isCustom ? `<button onclick="deleteCustomItem('${section.id}','${safe}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:13px;padding:2px 6px;">✕</button>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function addCustomItem() {
  const text  = document.getElementById('new-item-text').value.trim();
  const secId = document.getElementById('new-item-section').value;
  if (!text) { showToast('⚠️','Empty','Please type the item text.'); return; }
  if (!customItems[secId]) customItems[secId] = [];
  customItems[secId].push(text);
  document.getElementById('new-item-text').value = '';
  saveCustom(); renderAdminItems(); renderSections(); updateProgress();
  showToast('✅','Item Added','Custom checklist item added.');
}

function deleteCustomItem(secId, item) {
  if (!customItems[secId]) return;
  customItems[secId] = customItems[secId].filter(x => x !== item);
  saveCustom(); renderAdminItems(); renderSections(); updateProgress();
  showToast('🗑️','Removed','Item deleted.');
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
      <span class="h-pill ${e.type==='internal'?'type-internal':'type-external'}">${e.type}</span>
      <span class="h-pill ${e.pct===100?'status-complete':'status-pending'}">${e.pct}%</span>
      <span style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace;">${e.date}</span>
    </div>`).join('');
}

function saveSubmission(report) {
  submitHistory.unshift({
    id: Date.now(), project: report.project,
    client: report.client, url: report.url,
    date: new Date().toLocaleDateString('en-IN'),
    type: selectedType, phase: report.phase, pct: report.pct
  });
  saveHistory();
}

/* ── EXPORT ── */
function exportCSV() {
  if (!submitHistory.length) { showToast('⚠️','No Data','No submissions to export.'); return; }
  const rows = [['Project','Client','URL','Date','Type','Phase','%']];
  submitHistory.forEach(e => rows.push([e.project,e.client,e.url,e.date,e.type,e.phase,e.pct+'%']));
  download('wp-qa-history.csv', rows.map(r=>r.join(',')).join('\n'), 'text/csv');
  showToast('📤','CSV Exported','File downloaded.');
}

function exportTextReport() {
  const { text } = buildPlainReport();
  download('wp-qa-report.txt', text, 'text/plain');
  showToast('📤','Exported','Text report downloaded.');
}

function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content],{type}));
  a.download = name; a.click();
}

/* ── RESET ── */
function resetAll() {
  if (!confirm('Reset all checked items for current phase?')) return;
  getCurrentData().forEach(s => { delete checkedState[s.id]; });
  saveChecked(); renderSections(); updateProgress(); updateDashboard();
  showToast('🔄','Reset','Checkboxes cleared.');
}

/* ── EMAIL CONFIG ── */
function saveEmailConfig() {
  const cfg = {
    serviceId:        document.getElementById('cfg-service-id').value.trim(),
    publicKey:        document.getElementById('cfg-public-key').value.trim(),
    templateInternal: document.getElementById('cfg-template-internal').value.trim(),
    templateExternal: document.getElementById('cfg-template-external').value.trim()
  };
  localStorage.setItem('wpqa-emailcfg', JSON.stringify(cfg));
  const st = document.getElementById('cfg-status');
  st.style.display = 'inline';
  setTimeout(() => st.style.display='none', 3000);
  showToast('✅','Config Saved','EmailJS credentials saved.');
}

function loadEmailConfig() {
  const cfg = JSON.parse(localStorage.getItem('wpqa-emailcfg') || '{}');
  const ids = ['cfg-service-id','cfg-public-key','cfg-template-internal','cfg-template-external'];
  const keys = ['serviceId','publicKey','templateInternal','templateExternal'];
  ids.forEach((id,i) => { const el = document.getElementById(id); if (el && cfg[keys[i]]) el.value = cfg[keys[i]]; });
}

function checkEmailConfig() {
  const cfg = JSON.parse(localStorage.getItem('wpqa-emailcfg') || '{}');
  const ok  = cfg.serviceId && cfg.publicKey && cfg.templateInternal && cfg.templateExternal;
  document.getElementById('email-warning').style.display = ok ? 'none' : 'block';
}

/* ── REMINDER CHECK ── */
function startReminderCheck() {
  setInterval(() => {
    const cfg = JSON.parse(localStorage.getItem('wpqa-notifcfg') || '{}');
    if (!cfg.reminderEnabled || !cfg.reminderHours) return;
    const lastSave = localStorage.getItem('wpqa-last-activity');
    if (!lastSave) return;
    const hoursSince = (Date.now() - parseInt(lastSave)) / 3600000;
    if (hoursSince >= cfg.reminderHours) {
      const pct = getPhasePercent(currentPhase);
      if (pct < 100) showToast('⏰','Reminder','Checklist is '+pct+'% complete. Don\'t forget to finish!');
      localStorage.setItem('wpqa-last-activity', Date.now().toString());
    }
  }, 60000);
  document.addEventListener('click', () => localStorage.setItem('wpqa-last-activity', Date.now().toString()));
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
