/* ============================================================
   BUDGET PLANNER
   ============================================================ */

let budgetChartInstance = null;

function currentBudgetTrip() {
  const id = document.getElementById('budgetTripSelect').value;
  return VX.getTrip(id) || VX.getTrips()[0];
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderBudgetChart() {
  const trip = currentBudgetTrip();
  const canvas = document.getElementById('budgetChart');
  if (!trip) {
    document.getElementById('budgetTotals').innerHTML = `<div class="empty-state"><div class="ic">💸</div><h4>No trip selected</h4><p>Add a trip first.</p></div>`;
    return;
  }

  const byCategory = {};
  trip.expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount); });
  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);
  const total = values.reduce((a, b) => a + b, 0);

  const palette = [cssVar('--accent-amber'), cssVar('--accent-teal'), cssVar('--accent-rose'), cssVar('--accent-blue'), cssVar('--accent-amber-dim'), '#8B7FD6', '#5C6478'];

  if (budgetChartInstance) budgetChartInstance.destroy();

  if (!labels.length) {
    document.getElementById('budgetTotals').innerHTML = `<div class="empty-state"><div class="ic">💸</div><h4>No expenses logged</h4><p>Add one below.</p></div>`;
    return;
  }

  budgetChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: palette,
        borderRadius: 6,
        barThickness: 28,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-secondary') } },
        y: { grid: { display: false }, ticks: { color: cssVar('--text-primary') } }
      }
    }
  });

  document.getElementById('budgetTotals').innerHTML = `
    <div class="bar-row">
      <div class="bar-top"><span>Total spent</span><span class="val">$${total.toLocaleString()}</span></div>
      <div class="bar-top"><span>Trip budget</span><span class="val">$${Number(trip.budget).toLocaleString()}</span></div>
      <div class="bar-top"><span>Remaining</span><span class="val" style="color:${total > trip.budget ? cssVar('--accent-rose') : cssVar('--accent-teal')}">$${(trip.budget - total).toLocaleString()}</span></div>
    </div>
    <div style="margin-top:16px;">
      ${labels.map((l, i) => `
        <div class="bar-row">
          <div class="bar-top"><span>${l}</span><span class="val">$${values[i].toLocaleString()}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(values[i]/total)*100}%; background:${palette[i]};"></div></div>
        </div>
      `).join('')}
    </div>
  `;
}

function addExpense() {
  const trip = currentBudgetTrip();
  if (!trip) { alert('Add a trip first.'); return; }
  const category = document.getElementById('expCategory').value;
  const amount = Number(document.getElementById('expAmount').value);
  if (!amount || amount <= 0) { alert('Enter a valid amount.'); return; }
  VX.addExpense(trip.id, category, amount);
  document.getElementById('expAmount').value = '';
  renderBudgetChart();
  renderDashboard();
  renderTrips();
}
