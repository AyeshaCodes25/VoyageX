/* ============================================================
   HOTEL WISHLIST
   ============================================================ */

let compareSelection = new Set();

function openHotelModal() {
  document.getElementById('hotelModalOverlay').classList.add('active');
}
function closeHotelModal() {
  document.getElementById('hotelModalOverlay').classList.remove('active');
}

function saveHotel() {
  const name = document.getElementById('hotelName').value.trim();
  const location = document.getElementById('hotelLocation').value.trim();
  const price = Number(document.getElementById('hotelPrice').value) || 0;
  const rating = Number(document.getElementById('hotelRating').value);
  const notes = document.getElementById('hotelNotes').value.trim();
  if (!name || !location) { alert('Name and location are required.'); return; }

  VX.addHotel({ name, location, price, rating, notes });
  ['hotelName','hotelLocation','hotelPrice','hotelNotes'].forEach(id => document.getElementById(id).value = '');
  closeHotelModal();
  renderHotels();
}

function deleteHotel(id) {
  VX.deleteHotel(id);
  compareSelection.delete(id);
  renderHotels();
}

function toggleCompare(id) {
  if (compareSelection.has(id)) compareSelection.delete(id);
  else {
    if (compareSelection.size >= 3) { alert('Compare up to 3 hotels at a time.'); return; }
    compareSelection.add(id);
  }
  renderHotels();
}

function starString(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function renderHotels() {
  const hotels = VX.getHotels();
  const grid = document.getElementById('hotelsGrid');

  if (!hotels.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">🏨</div><h4>No saved hotels yet</h4><p>Add one you're eyeing for an upcoming trip.</p></div>`;
  } else {
    grid.innerHTML = hotels.map(h => `
      <div class="trip-card">
        <div class="trip-banner" style="background:linear-gradient(120deg, var(--accent-rose), var(--accent-amber));">
          <span class="status-pill">$${h.price}/night</span>
        </div>
        <div class="trip-perf"></div>
        <div class="trip-body">
          <div class="trip-dest" style="font-size:18px;">${h.name}</div>
          <div class="trip-meta"><span>📍 ${h.location}</span></div>
          <div style="color:var(--accent-amber); font-size:14px;">${starString(h.rating)} <span style="color:var(--text-secondary); font-size:12px;">${h.rating}</span></div>
          ${h.notes ? `<div class="widget-sub">${h.notes}</div>` : ''}
          <div class="trip-actions">
            <button class="btn btn-sm ${compareSelection.has(h.id) ? 'btn-primary' : ''}" onclick="toggleCompare('${h.id}')">${compareSelection.has(h.id) ? '✓ Comparing' : 'Compare'}</button>
            <button class="btn btn-sm btn-ghost" onclick="deleteHotel('${h.id}')">Remove ❤️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderCompareTable();
}

function renderCompareTable() {
  const panel = document.getElementById('compareTable');
  if (compareSelection.size < 2) { panel.innerHTML = ''; return; }
  const hotels = VX.getHotels().filter(h => compareSelection.has(h.id));
  panel.innerHTML = `
    <div class="stub-divider"><span class="stub-label">Comparing</span><span class="stub-line"></span><span class="stub-dot"></span></div>
    <div class="card" style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tr style="text-align:left; color:var(--text-secondary);">
          <th style="padding:8px;">Hotel</th><th>Location</th><th>Price/night</th><th>Rating</th>
        </tr>
        ${hotels.map(h => `
          <tr style="border-top:1px solid var(--border);">
            <td style="padding:8px; font-weight:600;">${h.name}</td>
            <td style="padding:8px;">${h.location}</td>
            <td style="padding:8px;" class="mono">$${h.price}</td>
            <td style="padding:8px; color:var(--accent-amber);">${starString(h.rating)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}
