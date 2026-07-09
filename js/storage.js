/* ============================================================
   VOYAGEX STORAGE LAYER
   Single source of truth over localStorage. Everything else
   (trips.js, budget.js, packing.js, dashboard.js) reads/writes
   through this module only.
   ============================================================ */

const VX_KEY = 'voyagex_data_v1';

const defaultPackingTemplate = () => ([
  { id: cryptoId(), name: 'Clothes', icon: '👕', items: [
    { id: cryptoId(), name: 'T-shirts x5', done: false },
    { id: cryptoId(), name: 'Jeans x2', done: false },
    { id: cryptoId(), name: 'Jacket', done: false },
  ]},
  { id: cryptoId(), name: 'Electronics', icon: '🔌', items: [
    { id: cryptoId(), name: 'Phone charger', done: false },
    { id: cryptoId(), name: 'Power bank', done: false },
  ]},
  { id: cryptoId(), name: 'Documents', icon: '📄', items: [
    { id: cryptoId(), name: 'Passport', done: false },
    { id: cryptoId(), name: 'Boarding pass', done: false },
    { id: cryptoId(), name: 'Hotel booking', done: false },
  ]},
  { id: cryptoId(), name: 'Medicine', icon: '💊', items: [
    { id: cryptoId(), name: 'Basic first-aid', done: false },
  ]},
]);

function cryptoId() {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function vxLoad() {
  const raw = localStorage.getItem(VX_KEY);
  if (raw) {
    try { return vxMigrate(JSON.parse(raw)); } catch (e) { /* fall through to seed */ }
  }
  return vxSeed();
}

// Backfills fields added in later phases so old saved data (Phase 1) doesn't break.
function vxMigrate(data) {
  if (!data.places) data.places = [];
  if (!data.hotels) data.hotels = [];
  data.trips.forEach(t => {
    if (!t.journal) t.journal = [];
    if (!t.timeline) t.timeline = [];
  });
  return data;
}

function vxSave(data) {
  localStorage.setItem(VX_KEY, JSON.stringify(data));
}

function vxSeed() {
  const seeded = {
    theme: 'midnight',
    places: [
      { id: cryptoId(), name: 'Bali, Indonesia', lat: -8.3405, lon: 115.0920, status: 'dream' },
      { id: cryptoId(), name: 'Istanbul, Turkey', lat: 41.0082, lon: 28.9784, status: 'dream' },
    ],
    hotels: [
      { id: cryptoId(), name: 'Hôtel Le Marais', location: 'Paris, France', price: 180, rating: 4.5, notes: 'Boutique, walkable to the Louvre.' },
      { id: cryptoId(), name: 'Ubud Jungle Villas', location: 'Bali, Indonesia', price: 95, rating: 4.8, notes: 'Private pool, rice-terrace view.' },
    ],
    trips: [
      {
        id: cryptoId(),
        destination: 'Paris, France',
        lat: 48.8566, lon: 2.3522,
        start: addDays(15),
        end: addDays(22),
        budget: 5000,
        status: 'planned',
        notes: 'Museum day, Seine river walk, Eiffel Tower at sunset.',
        expenses: [
          { id: cryptoId(), category: 'Flights', amount: 900 },
          { id: cryptoId(), category: 'Hotels', amount: 1100 },
          { id: cryptoId(), category: 'Food', amount: 280 },
          { id: cryptoId(), category: 'Shopping', amount: 120 },
          { id: cryptoId(), category: 'Transport', amount: 50 },
        ],
        packing: defaultPackingTemplate(),
        journal: [
          { id: cryptoId(), date: addDays(-90), text: 'Booked the flights today — finally happening!', rating: 5, restaurant: '', photo: null }
        ],
        timeline: [
          { id: cryptoId(), day: 1, time: '09:00', title: 'Flight departs Lahore', icon: '✈️' },
          { id: cryptoId(), day: 1, time: '18:00', title: 'Hotel check-in', icon: '🏨' },
          { id: cryptoId(), day: 2, time: '10:00', title: 'Louvre Museum', icon: '🖼️' },
          { id: cryptoId(), day: 2, time: '20:00', title: 'Dinner near Seine', icon: '🍽️' },
        ],
      }
    ]
  };
  vxSave(seeded);
  return seeded;
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/* ---- convenience accessors ---- */
const VX = {
  get data() { return vxLoad(); },
  save(data) { vxSave(data); },

  getTrips() { return this.data.trips; },

  getTrip(id) { return this.data.trips.find(t => t.id === id); },

  addTrip(trip) {
    const d = this.data;
    trip.id = cryptoId();
    trip.expenses = trip.expenses || [];
    trip.packing = defaultPackingTemplate();
    d.trips.push(trip);
    this.save(d);
    return trip;
  },

  updateTrip(id, patch) {
    const d = this.data;
    const t = d.trips.find(t => t.id === id);
    if (!t) return;
    Object.assign(t, patch);
    this.save(d);
  },

  deleteTrip(id) {
    const d = this.data;
    d.trips = d.trips.filter(t => t.id !== id);
    this.save(d);
  },

  addExpense(tripId, category, amount) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    t.expenses.push({ id: cryptoId(), category, amount });
    this.save(d);
  },

  togglePackItem(tripId, catId, itemId) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    const cat = t.packing.find(c => c.id === catId);
    const item = cat.items.find(i => i.id === itemId);
    item.done = !item.done;
    this.save(d);
  },

  addPackItem(tripId, catId, name) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    const cat = t.packing.find(c => c.id === catId);
    cat.items.push({ id: cryptoId(), name, done: false });
    this.save(d);
  },

  getTheme() { return this.data.theme || 'midnight'; },
  setTheme(theme) {
    const d = this.data;
    d.theme = theme;
    this.save(d);
  },

  nextTrip() {
    const today = new Date().toISOString().slice(0, 10);
    return this.data.trips
      .filter(t => t.status !== 'visited' && t.start >= today)
      .sort((a, b) => a.start.localeCompare(b.start))[0];
  },

  /* ---- Map pins (quick-save places, not full trips) ---- */
  getPlaces() { return this.data.places; },

  addPlace(place) {
    const d = this.data;
    place.id = cryptoId();
    d.places.push(place);
    this.save(d);
    return place;
  },

  updatePlaceStatus(id, status) {
    const d = this.data;
    const p = d.places.find(p => p.id === id);
    if (!p) return;
    p.status = status;
    this.save(d);
  },

  deletePlace(id) {
    const d = this.data;
    d.places = d.places.filter(p => p.id !== id);
    this.save(d);
  },

  /* ---- Hotel wishlist ---- */
  getHotels() { return this.data.hotels; },

  addHotel(hotel) {
    const d = this.data;
    hotel.id = cryptoId();
    d.hotels.push(hotel);
    this.save(d);
    return hotel;
  },

  deleteHotel(id) {
    const d = this.data;
    d.hotels = d.hotels.filter(h => h.id !== id);
    this.save(d);
  },

  /* ---- Backup / restore (insurance against browser storage getting cleared) ---- */
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  },

  importJSON(jsonString) {
    const parsed = JSON.parse(jsonString);
    this.save(vxMigrate(parsed));
  },

  // Every pin the map should show: full trips (colored by status) + quick-save places.
  allMapPins() {
    const tripPins = this.data.trips.map(t => ({
      id: t.id, name: t.destination, lat: t.lat, lon: t.lon, status: t.status, kind: 'trip'
    }));
    const placePins = this.data.places.map(p => ({ ...p, kind: 'place' }));
    return [...tripPins, ...placePins];
  },

  /* ---- Journal ---- */
  addJournalEntry(tripId, entry) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    entry.id = cryptoId();
    entry.date = entry.date || new Date().toISOString().slice(0, 10);
    t.journal.unshift(entry);
    this.save(d);
  },

  deleteJournalEntry(tripId, entryId) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    t.journal = t.journal.filter(j => j.id !== entryId);
    this.save(d);
  },

  /* ---- Timeline ---- */
  addTimelineStep(tripId, step) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    step.id = cryptoId();
    t.timeline.push(step);
    this.save(d);
  },

  deleteTimelineStep(tripId, stepId) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    t.timeline = t.timeline.filter(s => s.id !== stepId);
    this.save(d);
  },

  reorderTimeline(tripId, orderedIds) {
    const d = this.data;
    const t = d.trips.find(t => t.id === tripId);
    if (!t) return;
    const byId = Object.fromEntries(t.timeline.map(s => [s.id, s]));
    t.timeline = orderedIds.map(id => byId[id]).filter(Boolean);
    this.save(d);
  },

  /* ---- Analytics ---- */
  stats() {
    const trips = this.data.trips;
    const totalSpend = trips.reduce((s, t) => s + t.expenses.reduce((a, e) => a + Number(e.amount), 0), 0);
    const travelDays = trips.reduce((s, t) => {
      const d = (new Date(t.end) - new Date(t.start)) / 86400000;
      return s + Math.max(0, Math.round(d));
    }, 0);
    const photos = trips.reduce((s, t) => s + t.journal.filter(j => j.photo).length, 0);
    const wishlist = this.data.places.filter(p => p.status === 'dream').length + trips.filter(t => t.status === 'dream').length;
    const packingAvgs = trips.map(t => {
      const all = t.packing.flatMap(c => c.items);
      return all.length ? (all.filter(i => i.done).length / all.length) * 100 : 0;
    });
    const avgPacking = packingAvgs.length ? Math.round(packingAvgs.reduce((a,b)=>a+b,0) / packingAvgs.length) : 0;
    const countries = new Set(trips.map(t => t.destination.split(',').pop().trim())).size;
    const avgBudget = trips.length ? Math.round(trips.reduce((s,t)=>s+Number(t.budget),0) / trips.length) : 0;

    return { totalTrips: trips.length, countries, totalSpend, travelDays, photos, wishlist, avgPacking, avgBudget, trips };
  },

  achievements() {
    const s = this.stats();
    const trips = s.trips;
    return [
      { id: 'first', icon: '🏅', name: 'First Trip', desc: 'Plan your first trip', unlocked: s.totalTrips >= 1 },
      { id: 'five', icon: '🌍', name: '5 Countries', desc: 'Visit or plan 5+ countries', unlocked: s.countries >= 5 },
      { id: 'budget', icon: '💰', name: 'Budget Master', desc: 'Finish a trip under budget', unlocked: trips.some(t => t.expenses.reduce((a,e)=>a+Number(e.amount),0) < t.budget) },
      { id: 'explorer', icon: '🧭', name: 'Explorer', desc: 'Plan 3+ trips', unlocked: s.totalTrips >= 3 },
      { id: 'backpacker', icon: '🎒', name: 'Backpacker', desc: 'Plan a trip under $1,000', unlocked: trips.some(t => Number(t.budget) < 1000) },
      { id: 'luxury', icon: '🥂', name: 'Luxury Traveler', desc: 'Plan a trip over $5,000', unlocked: trips.some(t => Number(t.budget) > 5000) },
    ];
  }
};
