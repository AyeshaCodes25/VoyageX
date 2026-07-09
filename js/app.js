/* ============================================================
   APP BOOTSTRAP — view routing
   ============================================================ */

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.navlink').forEach(n => n.classList.remove('active'));
  const view = document.getElementById(`view-${name}`);
  const link = document.querySelector(`.navlink[data-view="${name}"]`);
  if (view) view.classList.add('active');
  if (link) link.classList.add('active');

  // lazy-render on view entry
  if (name === 'budget') renderBudgetChart();
  if (name === 'packing') renderPacking();
  if (name === 'hotels') renderHotels();
  if (name === 'currency') initCurrencyView();
  if (name === 'map') initMap();
  if (name === 'journal') renderJournal();
  if (name === 'timeline') renderTimeline();
  if (name === 'explorer') renderExplorer();
  if (name === 'analytics') renderAnalytics();
}

function downloadBackup() {
  const blob = new Blob([VX.exportJSON()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voyagex-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function restoreBackup(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      VX.importJSON(e.target.result);
      alert('Backup restored. Reloading...');
      location.reload();
    } catch (err) {
      alert('That file could not be read as a VoyageX backup.');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function toggleMobileNav(force) {
  const nav = document.getElementById('sidenav');
  const overlay = document.getElementById('mobileOverlay');
  const open = force !== undefined ? force : !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  overlay.classList.toggle('active', open);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.navlink[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
      if (window.innerWidth <= 780) toggleMobileNav(false);
    });
  });

  document.getElementById('budgetTripSelect').addEventListener('change', renderBudgetChart);
  document.getElementById('packingTripSelect').addEventListener('change', renderPacking);
  document.getElementById('journalTripSelect').addEventListener('change', renderJournal);
  document.getElementById('timelineTripSelect').addEventListener('change', renderTimeline);

  document.getElementById('tripModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'tripModalOverlay') closeTripModal();
  });
  document.getElementById('mapPinModal').addEventListener('click', (e) => {
    if (e.target.id === 'mapPinModal') closeMapPinModal();
  });

  populateTripSelectors();
  renderTrips();
  renderDashboard();
});
