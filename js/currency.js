/* ============================================================
   CURRENCY CONVERTER
   Live rates via Frankfurter (frankfurter.app) — free, no API key.
   ============================================================ */

let currencyList = [];
let rateCache = {}; // "FROM_TO" -> { rate, ts }

async function loadCurrencyList() {
  if (currencyList.length) return currencyList;
  try {
    const res = await fetch('https://api.frankfurter.app/currencies');
    const json = await res.json();
    currencyList = Object.entries(json).map(([code, name]) => ({ code, name }));
  } catch (e) {
    // fallback to a small static list if the API is unreachable
    currencyList = [
      { code: 'USD', name: 'US Dollar' }, { code: 'EUR', name: 'Euro' }, { code: 'GBP', name: 'British Pound' },
      { code: 'PKR', name: 'Pakistani Rupee' }, { code: 'JPY', name: 'Japanese Yen' }, { code: 'AED', name: 'UAE Dirham' },
      { code: 'TRY', name: 'Turkish Lira' }, { code: 'THB', name: 'Thai Baht' }, { code: 'IDR', name: 'Indonesian Rupiah' },
    ];
  }
  return currencyList;
}

function populateCurrencySelects() {
  const opts = currencyList.map(c => `<option value="${c.code}">${c.code} — ${c.name}</option>`).join('');
  const fromSel = document.getElementById('curFrom');
  const toSel = document.getElementById('curTo');
  fromSel.innerHTML = opts;
  toSel.innerHTML = opts;
  fromSel.value = 'USD';
  toSel.value = currencyList.some(c => c.code === 'PKR') ? 'PKR' : 'EUR';
}

async function getRate(from, to) {
  if (from === to) return 1;
  const key = `${from}_${to}`;
  const cached = rateCache[key];
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.rate; // 10 min cache

  const res = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${from}&to=${to}`);
  const json = await res.json();
  const rate = json.rates[to];
  rateCache[key] = { rate, ts: Date.now() };
  return rate;
}

async function runConversion() {
  const amount = Number(document.getElementById('curAmount').value) || 0;
  const from = document.getElementById('curFrom').value;
  const to = document.getElementById('curTo').value;
  const resultEl = document.getElementById('curResult');
  const rateEl = document.getElementById('curRateLine');

  resultEl.textContent = '…';
  try {
    const rate = await getRate(from, to);
    resultEl.textContent = (amount * rate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    rateEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
  } catch (e) {
    resultEl.textContent = '—';
    rateEl.textContent = 'Live rates unavailable right now — check your connection.';
  }
}

function swapCurrencies() {
  const fromSel = document.getElementById('curFrom');
  const toSel = document.getElementById('curTo');
  const tmp = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value = tmp;
  runConversion();
}

// Matches a trip's destination against the curated DESTINATIONS dataset to
// find its local currency, so we can show quick PKR -> local conversions.
function currencyForDestination(destination) {
  const key = destination.toLowerCase();
  const match = DESTINATIONS.find(d => key.includes(d.name.toLowerCase()));
  return match ? match.currency : null;
}

async function renderTripCurrencyCards() {
  const container = document.getElementById('tripCurrencyGrid');
  const trips = VX.getTrips();
  const withCurrency = trips.map(t => ({ trip: t, currency: currencyForDestination(t.destination) })).filter(x => x.currency);

  if (!withCurrency.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">💱</div><h4>No matched trips</h4><p>Add a trip to a recognized destination to see a quick conversion here.</p></div>`;
    return;
  }

  container.innerHTML = withCurrency.map(({ trip, currency }) => `
    <div class="card" id="tripCur_${trip.id}">
      <div class="widget-label"><span class="dot"></span>${trip.destination}</div>
      <div class="widget-value" style="font-size:22px;">…</div>
      <div class="widget-sub">1,000 PKR in ${currency}</div>
    </div>
  `).join('');

  for (const { trip, currency } of withCurrency) {
    try {
      const rate = await getRate('PKR', currency);
      const el = document.querySelector(`#tripCur_${trip.id} .widget-value`);
      if (el) el.textContent = `${(1000 * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
    } catch (e) { /* leave as … on failure */ }
  }
}

async function initCurrencyView() {
  await loadCurrencyList();
  if (!document.getElementById('curFrom').options.length) populateCurrencySelects();
  runConversion();
  renderTripCurrencyCards();
}
