/* ============================================================
   TIMELINE — drag-and-drop itinerary builder
   ============================================================ */

let draggedStepId = null;

function currentTimelineTrip() {
  const id = document.getElementById('timelineTripSelect').value;
  return VX.getTrip(id) || VX.getTrips()[0];
}

function addTimelineStep() {
  const trip = currentTimelineTrip();
  if (!trip) { alert('Add a trip first.'); return; }
  const day = Number(document.getElementById('stepDay').value) || 1;
  const time = document.getElementById('stepTime').value || '09:00';
  const title = document.getElementById('stepTitle').value.trim();
  const icon = document.getElementById('stepIcon').value || '📍';
  if (!title) { alert('Give the step a title.'); return; }

  VX.addTimelineStep(trip.id, { day, time, title, icon });
  document.getElementById('stepTitle').value = '';
  renderTimeline();
}

function deleteTimelineStep(stepId) {
  const trip = currentTimelineTrip();
  VX.deleteTimelineStep(trip.id, stepId);
  renderTimeline();
}

function renderTimeline() {
  const trip = currentTimelineTrip();
  const container = document.getElementById('timelineDays');
  if (!trip) {
    container.innerHTML = `<div class="empty-state"><div class="ic">🕒</div><h4>No trip selected</h4><p>Add a trip first to build an itinerary.</p></div>`;
    return;
  }

  if (!trip.timeline.length) {
    container.innerHTML = `<div class="empty-state"><div class="ic">🕒</div><h4>No steps yet</h4><p>Add your first step below — flight, hotel, activity.</p></div>`;
    return;
  }

  const sorted = [...trip.timeline].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const byDay = {};
  sorted.forEach(s => { (byDay[s.day] = byDay[s.day] || []).push(s); });

  container.innerHTML = Object.keys(byDay).sort((a,b)=>a-b).map(day => `
    <div class="stub-divider" style="margin-top:28px;">
      <span class="stub-label">Day ${day}</span><span class="stub-line"></span><span class="stub-dot"></span>
    </div>
    <div class="timeline-track" data-day="${day}">
      ${byDay[day].map((s, idx) => `
        <div class="timeline-step" draggable="true"
             ondragstart="draggedStepId='${s.id}'"
             ondragover="event.preventDefault()"
             ondrop="handleStepDrop(event, '${s.id}')">
          <div class="timeline-node">${s.icon}</div>
          ${idx < byDay[day].length - 1 ? '<div class="timeline-connector"></div>' : ''}
          <div class="timeline-content">
            <div class="timeline-time">${s.time}</div>
            <div class="timeline-title">${s.title}</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="deleteTimelineStep('${s.id}')">✕</button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function handleStepDrop(e, targetId) {
  e.preventDefault();
  if (!draggedStepId || draggedStepId === targetId) return;
  const trip = currentTimelineTrip();
  const ids = trip.timeline.map(s => s.id);
  const from = ids.indexOf(draggedStepId);
  const to = ids.indexOf(targetId);
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  VX.reorderTimeline(trip.id, ids);
  draggedStepId = null;
  renderTimeline();
}
