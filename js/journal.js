/* ============================================================
   TRAVEL JOURNAL
   ============================================================ */

function currentJournalTrip() {
  const id = document.getElementById('journalTripSelect').value;
  return VX.getTrip(id) || VX.getTrips()[0];
}

let pendingPhotoData = null;

function handleJournalPhoto(input) {
  const file = input.files[0];
  if (!file) { pendingPhotoData = null; return; }
  // Downscale before storing — localStorage has a ~5MB ceiling per key.
  const img = new Image();
  const reader = new FileReader();
  reader.onload = (e) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 480;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      pendingPhotoData = canvas.toDataURL('image/jpeg', 0.7);
      document.getElementById('journalPhotoPreview').innerHTML = `<img src="${pendingPhotoData}" style="max-height:80px; border-radius:6px; margin-top:8px;">`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addJournalEntry() {
  const trip = currentJournalTrip();
  if (!trip) { alert('Add a trip first.'); return; }
  const text = document.getElementById('journalText').value.trim();
  const rating = Number(document.getElementById('journalRating').value);
  const restaurant = document.getElementById('journalRestaurant').value.trim();
  if (!text) { alert('Write something about the memory first.'); return; }

  VX.addJournalEntry(trip.id, { text, rating, restaurant, photo: pendingPhotoData });

  document.getElementById('journalText').value = '';
  document.getElementById('journalRestaurant').value = '';
  document.getElementById('journalPhotoInput').value = '';
  document.getElementById('journalPhotoPreview').innerHTML = '';
  pendingPhotoData = null;

  renderJournal();
  renderDashboard();
}

function deleteJournalEntry(entryId) {
  const trip = currentJournalTrip();
  VX.deleteJournalEntry(trip.id, entryId);
  renderJournal();
}

function renderJournal() {
  const trip = currentJournalTrip();
  const list = document.getElementById('journalEntries');
  if (!trip) {
    list.innerHTML = `<div class="empty-state"><div class="ic">📔</div><h4>No trip selected</h4><p>Add a trip first to start journaling.</p></div>`;
    return;
  }

  if (!trip.journal.length) {
    list.innerHTML = `<div class="empty-state"><div class="ic">📔</div><h4>No memories yet</h4><p>Your first entry for ${trip.destination} will show up here.</p></div>`;
    return;
  }

  list.innerHTML = trip.journal.map(j => `
    <div class="card" style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="widget-label"><span class="dot"></span>${j.date} ${'★'.repeat(j.rating)}${'☆'.repeat(5 - j.rating)}</div>
        <button class="btn btn-sm btn-ghost" onclick="deleteJournalEntry('${j.id}')">✕</button>
      </div>
      ${j.photo ? `<img src="${j.photo}" style="max-width:100%; border-radius:var(--r-md); margin-top:10px;">` : ''}
      <p style="margin-top:10px; font-size:14px; line-height:1.5;">${j.text}</p>
      ${j.restaurant ? `<div class="widget-sub" style="margin-top:8px;">🍽️ ${j.restaurant}</div>` : ''}
    </div>
  `).join('');
}
