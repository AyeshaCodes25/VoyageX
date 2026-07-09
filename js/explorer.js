/* ============================================================
   DESTINATION EXPLORER
   ============================================================ */

function renderExplorer(filter = '') {
  const grid = document.getElementById('explorerGrid');
  const q = filter.trim().toLowerCase();
  const list = q ? DESTINATIONS.filter(d => d.name.toLowerCase().includes(q)) : DESTINATIONS;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">🔍</div><h4>No match</h4><p>Try another country name.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(d => `
    <div class="card">
      <div class="widget-label"><span class="dot"></span>${d.flag} ${d.name}</div>
      <p style="font-size:13px; color:var(--text-secondary); margin-top:10px; line-height:1.5;">${d.blurb}</p>
      <div style="margin-top:14px; display:flex; flex-direction:column; gap:6px; font-size:12.5px;">
        <div class="bar-top"><span>Best months</span><span class="val">${d.bestMonths}</span></div>
        <div class="bar-top"><span>Est. budget</span><span class="val">${d.budget}</span></div>
        <div class="bar-top"><span>Currency</span><span class="val">${d.currency}</span></div>
      </div>
      <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:6px;">
        ${d.attractions.map(a => `<span style="font-size:11px; background:var(--bg-elevated); border:1px solid var(--border); padding:4px 8px; border-radius:var(--r-pill); color:var(--text-secondary);">${a}</span>`).join('')}
      </div>
      <button class="btn btn-sm" style="margin-top:14px; width:100%;" onclick="quickAddDestination('${d.name.replace(/'/g,"\\'")}', ${d.lat}, ${d.lon})">+ Add to wishlist</button>
    </div>
  `).join('');
}

function quickAddDestination(name, lat, lon) {
  VX.addPlace({ name, lat, lon, status: 'dream' });
  alert(`${name} added to your wishlist — check the World Map.`);
}
