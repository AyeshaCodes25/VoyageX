/* ============================================================
   TRIP PLANNER
   ============================================================ */

// Small lookup so newly-added destinations still get a weather pin.
// Falls back to a neutral default if the city isn't in the table.
const CITY_COORDS = {
  'paris': [48.8566, 2.3522], 'tokyo': [35.6762, 139.6503], 'dubai': [25.2048, 55.2708],
  'istanbul': [41.0082, 28.9784], 'rome': [41.9028, 12.4964], 'london': [51.5074, -0.1278],
  'new york': [40.7128, -74.0060], 'bali': [-8.3405, 115.0920], 'lahore': [31.5497, 74.3436],
  'karachi': [24.8607, 67.0011], 'islamabad': [33.6844, 73.0479], 'sialkot': [32.4945, 74.5229],
  'bangkok': [13.7563, 100.5018], 'singapore': [1.3521, 103.8198], 'barcelona': [41.3851, 2.1734],
};

function guessCoords(destination) {
  const key = destination.toLowerCase();
  for (const city in CITY_COORDS) {
    if (key.includes(city)) return CITY_COORDS[city];
  }
  return [20.0, 0.0]; // neutral fallback
}

function openTripModal(tripId) {
  document.getElementById('tripModalOverlay').classList.add('active');
  const editing = tripId ? VX.getTrip(tripId) : null;
  document.getElementById('tripModalTitle').textContent = editing ? 'Edit Trip' : 'New Trip';
  document.getElementById('tripEditId').value = tripId || '';
  document.getElementById('tripDestination').value = editing?.destination || '';
  document.getElementById('tripStart').value = editing?.start || '';
  document.getElementById('tripEnd').value = editing?.end || '';
  document.getElementById('tripBudget').value = editing?.budget || '';
  document.getElementById('tripStatus').value = editing?.status || 'planned';
  document.getElementById('tripNotes').value = editing?.notes || '';
}

function closeTripModal() {
  document.getElementById('tripModalOverlay').classList.remove('active');
}

function saveTrip() {
  const id = document.getElementById('tripEditId').value;
  const destination = document.getElementById('tripDestination').value.trim();
  const start = document.getElementById('tripStart').value;
  const end = document.getElementById('tripEnd').value;
  const budget = Number(document.getElementById('tripBudget').value) || 0;
  const status = document.getElementById('tripStatus').value;
  const notes = document.getElementById('tripNotes').value.trim();

  if (!destination || !start || !end) {
    alert('Destination, start date, and end date are required.');
    return;
  }

  if (id) {
    VX.updateTrip(id, { destination, start, end, budget, status, notes });
  } else {
    const [lat, lon] = guessCoords(destination);
    VX.addTrip({ destination, start, end, budget, status, notes, lat, lon });
  }

  closeTripModal();
  renderTrips();
  renderDashboard();
  populateTripSelectors();
}

function deleteTrip(id) {
  if (!confirm('Delete this trip? This cannot be undone.')) return;
  VX.deleteTrip(id);
  renderTrips();
  renderDashboard();
  populateTripSelectors();
}

function renderTrips() {
  const grid = document.getElementById('tripsGrid');
  const trips = VX.getTrips();

  if (!trips.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">🧭</div><h4>No trips yet</h4><p>Start planning your first journey.</p></div>`;
    return;
  }

  grid.innerHTML = trips.map(t => {
    const spent = tripTotalSpent(t);
    const pack = tripPackingProgress(t);
    return `
    <div class="trip-card">
      <div class="trip-banner">
        <span class="status-pill">${t.status}</span>
      </div>
      <div class="trip-perf"></div>
      <div class="trip-body">
        <div class="trip-dest">${t.destination}</div>
        <div class="trip-meta">
          <span>📅 ${t.start} → ${t.end}</span>
        </div>
        <div class="bar-row" style="margin-top:2px;">
          <div class="bar-top"><span>Budget</span><span class="val">$${spent.toLocaleString()} / $${Number(t.budget).toLocaleString()}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,(spent/(t.budget||1))*100)}%"></div></div>
        </div>
        <div class="bar-row">
          <div class="bar-top"><span>Packing</span><span class="val">${pack}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pack}%"></div></div>
        </div>
        <div class="trip-actions">
          <button class="btn btn-sm" onclick="openTripModal('${t.id}')">Edit</button>
          <button class="btn btn-sm btn-ghost" onclick="deleteTrip('${t.id}')">Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function populateTripSelectors() {
  const trips = VX.getTrips();
  const opts = trips.map(t => `<option value="${t.id}">${t.destination}</option>`).join('');
  ['budgetTripSelect', 'packingTripSelect', 'journalTripSelect', 'timelineTripSelect'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = opts;
    if (trips.some(t => t.id === prev)) sel.value = prev;
  });
}
