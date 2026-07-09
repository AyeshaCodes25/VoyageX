/* ============================================================
   SMART PACKING
   ============================================================ */

function currentPackingTrip() {
  const id = document.getElementById('packingTripSelect').value;
  return VX.getTrip(id) || VX.getTrips()[0];
}

function renderPacking() {
  const trip = currentPackingTrip();
  const container = document.getElementById('packingCategories');
  if (!trip) {
    container.innerHTML = `<div class="empty-state"><div class="ic">🧳</div><h4>No trip selected</h4><p>Add a trip first to build a packing list.</p></div>`;
    return;
  }

  container.innerHTML = trip.packing.map(cat => {
    const pct = cat.items.length ? Math.round((cat.items.filter(i => i.done).length / cat.items.length) * 100) : 0;
    return `
    <div class="pack-category">
      <div class="pack-cat-head">
        <div class="name">${cat.icon} ${cat.name}</div>
        <div class="pct">${pct}%</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="pack-items">
        ${cat.items.map(item => `
          <label class="pack-item ${item.done ? 'done' : ''}">
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="togglePackItem('${trip.id}','${cat.id}','${item.id}')">
            <span>${item.name}</span>
          </label>
        `).join('')}
      </div>
      <div class="add-item-row">
        <input type="text" placeholder="Add item..." id="addItem_${cat.id}" onkeydown="if(event.key==='Enter') addPackItem('${trip.id}','${cat.id}')">
        <button class="btn btn-sm" onclick="addPackItem('${trip.id}','${cat.id}')">Add</button>
      </div>
    </div>`;
  }).join('');
}

function togglePackItem(tripId, catId, itemId) {
  VX.togglePackItem(tripId, catId, itemId);
  renderPacking();
  renderDashboard();
  renderTrips();
}

function addPackItem(tripId, catId) {
  const input = document.getElementById(`addItem_${catId}`);
  const name = input.value.trim();
  if (!name) return;
  VX.addPackItem(tripId, catId, name);
  input.value = '';
  renderPacking();
}
