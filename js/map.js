/* ============================================================
   WORLD MAP — Leaflet.js
   🟢 visited  🟡 planned  🔵 dream
   ============================================================ */

let vxMap = null;
let vxMapLayer = null;
let pendingPinCoords = null;

const STATUS_COLOR = { visited: '#3FBF5F', planned: '#E2A83D', dream: '#4E9FE0' };

function initMap() {
  if (vxMap) { vxMap.invalidateSize(); renderMapPins(); return; }

  vxMap = L.map('worldMap', { worldCopyJump: true }).setView([20, 10], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 18,
  }).addTo(vxMap);

  vxMapLayer = L.layerGroup().addTo(vxMap);

  vxMap.on('click', (e) => {
    pendingPinCoords = e.latlng;
    document.getElementById('mapPinName').value = '';
    document.getElementById('mapPinModal').classList.add('active');
    reverseGeocode(e.latlng.lat, e.latlng.lng);
  });

  renderMapPins();
}

async function reverseGeocode(lat, lon) {
  const nameField = document.getElementById('mapPinName');
  nameField.placeholder = 'Looking up place name…';
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const json = await res.json();
    const city = json.address?.city || json.address?.town || json.address?.state || '';
    const country = json.address?.country || '';
    nameField.value = [city, country].filter(Boolean).join(', ');
  } catch (e) {
    nameField.placeholder = 'Name this place';
  }
}

function renderMapPins() {
  if (!vxMapLayer) return;
  vxMapLayer.clearLayers();
  const pins = VX.allMapPins();

  pins.forEach(pin => {
    if (pin.lat == null || pin.lon == null) return;
    const color = STATUS_COLOR[pin.status] || STATUS_COLOR.dream;
    const marker = L.circleMarker([pin.lat, pin.lon], {
      radius: 8,
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.55,
    }).addTo(vxMapLayer);

    const deleteBtn = pin.kind === 'place'
      ? `<button class="btn btn-sm btn-ghost" onclick="deletePlace('${pin.id}'); renderMapPins();">Remove</button>` : '';

    marker.bindPopup(`
      <div style="font-family:sans-serif; min-width:150px;">
        <strong>${pin.name}</strong><br>
        <span style="text-transform:capitalize; color:${color};">${pin.status}</span>
        <div style="margin-top:6px;">${deleteBtn}</div>
      </div>
    `);
  });

  updateMapLegendCounts(pins);
}

function updateMapLegendCounts(pins) {
  const counts = { visited: 0, planned: 0, dream: 0 };
  pins.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
  const el = document.getElementById('mapLegendCounts');
  if (el) {
    el.innerHTML = `
      <span><i style="background:${STATUS_COLOR.visited}"></i>Visited (${counts.visited})</span>
      <span><i style="background:${STATUS_COLOR.planned}"></i>Planned (${counts.planned})</span>
      <span><i style="background:${STATUS_COLOR.dream}"></i>Dream (${counts.dream})</span>
    `;
  }
}

function closeMapPinModal() {
  document.getElementById('mapPinModal').classList.remove('active');
  pendingPinCoords = null;
}

function saveMapPin() {
  const name = document.getElementById('mapPinName').value.trim();
  const status = document.getElementById('mapPinStatus').value;
  if (!name || !pendingPinCoords) return;
  VX.addPlace({ name, lat: pendingPinCoords.lat, lon: pendingPinCoords.lng, status });
  closeMapPinModal();
  renderMapPins();
}
