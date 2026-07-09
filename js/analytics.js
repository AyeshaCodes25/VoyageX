/* ============================================================
   ANALYTICS + ACHIEVEMENTS
   ============================================================ */

let analyticsChartInstance = null;

function renderAnalytics() {
  const s = VX.stats();
  const grid = document.getElementById('analyticsStats');

  grid.innerHTML = `
    <div class="card"><div class="widget-label"><span class="dot"></span>Trips</div><div class="widget-value">${s.totalTrips}</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Countries</div><div class="widget-value">${s.countries}</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Total Spend</div><div class="widget-value">$${s.totalSpend.toLocaleString()}</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Travel Days</div><div class="widget-value">${s.travelDays}</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Photos</div><div class="widget-value">${s.photos}</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Wishlist</div><div class="widget-value">${s.wishlist}</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Avg Packing</div><div class="widget-value">${s.avgPacking}%</div></div>
    <div class="card"><div class="widget-label"><span class="dot"></span>Avg Budget</div><div class="widget-value">$${s.avgBudget.toLocaleString()}</div></div>
  `;

  // spend-per-trip chart
  const canvas = document.getElementById('analyticsChart');
  if (analyticsChartInstance) analyticsChartInstance.destroy();
  if (s.trips.length) {
    analyticsChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: s.trips.map(t => t.destination.split(',')[0]),
        datasets: [{
          data: s.trips.map(t => t.expenses.reduce((a,e)=>a+Number(e.amount),0)),
          backgroundColor: cssVar('--accent-teal'),
          borderRadius: 6,
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: cssVar('--text-secondary') } },
          y: { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-secondary') } }
        }
      }
    });
  }

  renderAchievements();
}

function renderAchievements() {
  const list = VX.achievements();
  const el = document.getElementById('achievementsGrid');
  el.innerHTML = list.map(a => `
    <div class="card" style="text-align:center; opacity:${a.unlocked ? 1 : 0.4};">
      <div style="font-size:32px;">${a.icon}</div>
      <div style="font-weight:700; margin-top:8px; font-size:14px;">${a.name}</div>
      <div class="widget-sub" style="margin-top:4px;">${a.desc}</div>
      <div style="margin-top:10px; font-family:var(--font-mono); font-size:10.5px; letter-spacing:0.04em; text-transform:uppercase; color:${a.unlocked ? 'var(--accent-teal)' : 'var(--text-muted)'};">
        ${a.unlocked ? '✓ Unlocked' : 'Locked'}
      </div>
    </div>
  `).join('');
}
