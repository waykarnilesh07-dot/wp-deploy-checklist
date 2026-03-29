// ============================================================
//  DASHBOARD.JS — Charts & stats
// ============================================================

let sectionChart = null;
let historyChart = null;

function updateDashboard() {
  const bPct = getPhasePercent('before');
  const aPct = getPhasePercent('after');

  document.getElementById('stat-before').textContent      = bPct + '%';
  document.getElementById('stat-after').textContent       = aPct + '%';
  document.getElementById('stat-submissions').textContent = submitHistory.length;

  // Count complete sections across both phases
  let completeSections = 0;
  [...BEFORE_DATA, ...AFTER_DATA].forEach(s => {
    const all = getAllItems(s);
    const count = getChecked(s.id).filter(x => all.includes(x)).length;
    if (count === all.length && all.length > 0) completeSections++;
  });
  document.getElementById('stat-sections').textContent = completeSections;

  setTimeout(() => {
    renderSectionChart();
    renderHistoryChart();
  }, 100);
}

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    text:   isDark ? '#8b93aa' : '#4a5168',
    grid:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    bg:     isDark ? '#181d28' : '#ffffff',
  };
}

function renderSectionChart() {
  const ctx = document.getElementById('chart-sections');
  if (!ctx) return;
  const colors = getChartColors();

  const allData = [...BEFORE_DATA, ...AFTER_DATA];
  const labels  = allData.map(s => s.icon + ' ' + s.label.substring(0,10));
  const values  = allData.map(s => {
    const all   = getAllItems(s);
    const count = getChecked(s.id).filter(x => all.includes(x)).length;
    return all.length ? Math.round(count/all.length*100) : 0;
  });
  const bgColors = allData.map(s => s.color + '99');
  const borders  = allData.map(s => s.color);

  if (sectionChart) sectionChart.destroy();
  sectionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data: values,
        backgroundColor: bgColors,
        borderColor: borders,
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.raw}% complete` }
        }
      },
      scales: {
        x: {
          ticks: { color: colors.text, font: { size: 10, family: 'JetBrains Mono' }, maxRotation: 45 },
          grid: { color: colors.grid }
        },
        y: {
          min: 0, max: 100,
          ticks: { color: colors.text, font: { size: 10 }, callback: v => v + '%' },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

function renderHistoryChart() {
  const ctx = document.getElementById('chart-history');
  if (!ctx) return;
  const colors = getChartColors();

  // Last 7 submissions
  const recent = submitHistory.slice(0, 7).reverse();
  const labels = recent.map(e => e.project.substring(0,12));
  const values = recent.map(e => e.pct);
  const bgColors = values.map(v => v === 100 ? 'rgba(46,204,138,0.7)' : 'rgba(79,124,255,0.7)');

  if (historyChart) historyChart.destroy();

  if (!recent.length) {
    if (historyChart) historyChart.destroy();
    const parent = ctx.parentElement;
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;color:var(--text3);font-size:13px;padding:40px 0;';
    empty.textContent = 'No submissions yet';
    if (!parent.querySelector('.empty-chart')) {
      empty.className = 'empty-chart';
      parent.appendChild(empty);
    }
    return;
  }

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data: values,
        backgroundColor: 'rgba(79,124,255,0.1)',
        borderColor: '#4f7cff',
        borderWidth: 2,
        pointBackgroundColor: bgColors,
        pointRadius: 5,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw}% complete` } }
      },
      scales: {
        x: { ticks: { color: colors.text, font: { size: 11 } }, grid: { color: colors.grid } },
        y: {
          min: 0, max: 100,
          ticks: { color: colors.text, font: { size: 11 }, callback: v => v + '%' },
          grid: { color: colors.grid }
        }
      }
    }
  });
}

function updateCharts() {
  setTimeout(() => { renderSectionChart(); renderHistoryChart(); }, 200);
}
