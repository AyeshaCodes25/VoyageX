/* ============================================================
   DASHBOARD — live widgets
   ============================================================ */

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.max(0, Math.round((target - today) / 86400000));
}

function flapDigits(num, minDigits = 2) {
  const str = String(num).padStart(minDigits, '0');
  return str.split('').map(d => `<div class="flap">${d}</div>`).join('');
}

function renderGreeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  document.getElementById('greetingText').innerHTML = `<span class="wave">✈️</span> ${greet}, Ayesha`;
  document.getElementById('dateSub').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function tickClock() {
  const el = document.getElementById('clockChip');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
}

async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
    const json = await res.json();
    return json.current;
  } catch (e) {
    return null;
  }
}

function weatherCodeToText(code) {
  const map = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',51:'Light drizzle',61:'Rain',63:'Rain',71:'Snow',80:'Showers',95:'Storm'};
  return map[code] ?? 'Mild';
}

function tripTotalSpent(trip) {
  return trip.expenses.reduce((s, e) => s + Number(e.amount), 0);
}

function tripPackingProgress(trip) {
  const all = trip.packing.flatMap(c => c.items);
  if (!all.length) return 0;
  return Math.round((all.filter(i => i.done).length / all.length) * 100);
}

async function renderDashboard() {
  renderGreeting();
  const grid = document.getElementById('dashboardGrid');
  const trip = VX.nextTrip();

  if (!trip) {
    grid.innerHTML = `
      <div class="card card-hero">
        <div class="widget-label"><span class="dot"></span>No upcoming trip</div>
        <div class="widget-value" style="font-size:22px;">Plan your next journey</div>
        <button class="btn btn-primary" style="width:fit-content;" onclick="switchView('trips'); openTripModal();">+ New Trip</button>
      </div>`;
    document.getElementById('upcomingTripsGrid').innerHTML = '';
    return;
  }

  const days = daysUntil(trip.start);
  const spent = tripTotalSpent(trip);
  const pack = tripPackingProgress(trip);

  grid.innerHTML = `
    <div class="card card-hero">
      <div class="widget-label"><span class="dot"></span>Upcoming Trip</div>
      <div>
        <div class="destination-name">${trip.destination}</div>
        <div class="flap-row">
          ${flapDigits(days, 2)}
          <div class="flap-unit">days<br>left</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="widget-label"><span class="dot"></span>Budget Used</div>
      <div class="widget-value">$${spent.toLocaleString()}</div>
      <div class="widget-sub">of $${Number(trip.budget).toLocaleString()}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (spent/trip.budget)*100)}%"></div></div>
    </div>

    <div class="card" id="weatherWidget">
      <div class="widget-label"><span class="dot"></span>Weather</div>
      <div class="widget-value">…</div>
      <div class="widget-sub">Loading forecast</div>
    </div>

    <div class="card">
      <div class="widget-label"><span class="dot"></span>Packing Progress</div>
      <div class="widget-value">${pack}%</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pack}%"></div></div>
    </div>
  `;

  const wx = await fetchWeather(trip.lat, trip.lon);
  const wEl = document.getElementById('weatherWidget');
  if (wx && wEl) {
    wEl.innerHTML = `
      <div class="widget-label"><span class="dot"></span>Weather · ${trip.destination.split(',')[0]}</div>
      <div class="widget-value">${Math.round(wx.temperature_2m)}°C</div>
      <div class="widget-sub">${weatherCodeToText(wx.weather_code)}</div>
    `;
  } else if (wEl) {
    wEl.innerHTML = `<div class="widget-label"><span class="dot"></span>Weather</div><div class="widget-sub" style="margin-top:10px;">Unavailable right now</div>`;
  }

  // upcoming trips strip (excluding hero trip)
  const others = VX.getTrips().filter(t => t.id !== trip.id).slice(0, 3);
  const stripEl = document.getElementById('upcomingTripsGrid');
  if (others.length) {
    stripEl.innerHTML = others.map(t => `
      <div class="card" style="cursor:pointer" onclick="switchView('trips')">
        <div class="widget-label"><span class="dot"></span>${t.status}</div>
        <div class="widget-value" style="font-size:20px;">${t.destination}</div>
        <div class="widget-sub">${t.start} → ${t.end}</div>
      </div>
    `).join('');
  } else {
    stripEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">🗺️</div><h4>Nothing else on the horizon</h4><p>Add another trip to see it here.</p></div>`;
  }
}

setInterval(tickClock, 1000);
tickClock();
