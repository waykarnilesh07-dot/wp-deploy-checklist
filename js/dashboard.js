// ============================================================
//  DASHBOARD.JS — Charts & stats (fixed)
// ============================================================

let sectionChart = null;
let historyChart = null;

function updateDashboard() {
  const bPct = getPhasePercent('before');
  const aPct = getPhasePercent('after');

  const statBefore = document.getElementById('stat-before');
  const statAfter  = document.getElementById('stat-after');
  const statSubs   = document.getElementById('stat-submissions');
  const statSec    = document.getElementById('stat-sections');

  if (statBefore) statBefore.textContent = bPct + '%';
  if (statAfter)  statAfter.textContent  = aPct + '%';
  if (statSubs)   statSubs.textContent   = String(submitHistory.length);

  let completeSections = 0;
  [...BEFORE_DATA, ...AFTER_DATA].forEach(s => {
    const all   = getAllItems(s);
    const count = getChecked(s.id).filter(x => all.includes(x)).length;
    if (count === all.length && all.length > 0) completeSections++;
  });
  if (statSec) statSec.textContent = String(completeSections);

  setTimeout(() => {
    renderSectionChart();
    renderHistoryChart();
  }, 150);
}

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    text: isDark ? '#8b93aa' : '#4a5168',
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
  };
}

function renderSectionChart() {
  const canvas = document.getElementById('chart-sections');
  if (!canvas) return;

  canvas.parentElement.style.position = 'relative';
  if (!canvas.parentElement.style.height) canvas.parentElement.style.height = '220px';

  const colors  = getChartColors();
  const allData = [...BEFORE_DATA, ...AFTER_DATA];

  const labels = allData.map(s => {
    const lbl = s.label.replace(/\(if applicable\)/i, '').trim();
    return lbl.length > 11 ? lbl.substring(0, 11) + '..' : lbl;
  });

  const values = allData.map(s => {
    const all   = getAllItems(s);
    const count = getChecked(s.id).filter(x => all.includes(x)).length;
    return all.length ? Math.round(count / all.length * 100) : 0;
  });

  const bgColors = allData.map(s => s.color + 'bb');
  const borders  = allData.map(s => s.color);

  if (sectionChart) { sectionChart.destroy(); sectionChart = null; }

  sectionChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data: values,
        backgroundColor: bgColors,
        borderColor: borders,
        borderWidth: 1.5,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c) { return ' ' + c.raw + '% complete'; } } }
      },
      scales: {
        x: {
          ticks: { color: colors.text, font: { size: 9 }, maxRotation: 40, minRotation: 30 },
          grid: { color: colors.grid }
        },
        y: {
          min: 0, max: 100,
          ticks: { color: colors.text, font: { size: 10 }, callback: function(v) { return v + '%'; } },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

function renderHistoryChart() {
  const canvas = document.getElementById('chart-history');
  if (!canvas) return;

  canvas.parentElement.style.position = 'relative';
  if (!canvas.parentElement.style.height) canvas.parentElement.style.height = '220px';

  const colors = getChartColors();
  const recent = submitHistory.slice(0, 7).reverse();

  if (historyChart) { historyChart.destroy(); historyChart = null; }

  const prev = canvas.parentElement.querySelector('.empty-chart');
  if (prev) prev.remove();

  if (!recent.length) {
    canvas.style.display = 'none';
    const empty = document.createElement('div');
    empty.className = 'empty-chart';
    empty.style.cssText = 'text-align:center;color:var(--text3);font-size:13px;padding:60px 0;';
    empty.textContent = 'No submissions yet';
    canvas.parentElement.appendChild(empty);
    return;
  }

  canvas.style.display = 'block';

  const labels   = recent.map(function(e) { return (e.project || 'Project').substring(0, 12); });
  const values   = recent.map(function(e) { return e.pct; });
  const ptColors = values.map(function(v) { return v === 100 ? '#2ecc8a' : '#4f7cff'; });

  historyChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data: values,
        backgroundColor: 'rgba(79,124,255,0.08)',
        borderColor: '#4f7cff',
        borderWidth: 2,
        pointBackgroundColor: ptColors,
        pointBorderColor: ptColors,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c) { return ' ' + c.raw + '% complete'; } } }
      },
      scales: {
        x: {
          ticks: { color: colors.text, font: { size: 11 } },
          grid: { color: colors.grid }
        },
        y: {
          min: 0, max: 100,
          ticks: { color: colors.text, font: { size: 11 }, callback: function(v) { return v + '%'; } },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

function updateCharts() {
  setTimeout(function() { renderSectionChart(); renderHistoryChart(); }, 200);
}
