'use strict';

const STORAGE_KEY = 'calendar_events';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

let currentYear  = 0;
let currentMonth = 0;
let events       = [];
let editingId    = null;

// ── Storage ───────────────────────────────────────────────────────────────────

function isValidEvent(e) {
  return e !== null &&
    typeof e === 'object' &&
    typeof e.id === 'string' && e.id.length > 0 &&
    typeof e.title === 'string' &&
    typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    (e.startTime === '' || (typeof e.startTime === 'string' && /^\d{2}:\d{2}$/.test(e.startTime))) &&
    (e.endTime   === '' || (typeof e.endTime   === 'string' && /^\d{2}:\d{2}$/.test(e.endTime)));
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    events = Array.isArray(parsed) ? parsed.filter(isValidEvent) : [];
  } catch {
    events = [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Date Utilities ────────────────────────────────────────────────────────────

function toDateString(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function isToday(dateStr) {
  const now = new Date();
  return dateStr === toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

function todayDateString() {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderCalendar() {
  renderHeader();
  renderGrid();
}

function renderHeader() {
  document.getElementById('month-label').textContent =
    `${MONTH_NAMES[currentMonth]} ${currentYear}`;
}

function renderGrid() {
  const grid = document.getElementById('calendar-grid');
  // Remove only day cells (keep the 7 .day-header elements)
  const cells = grid.querySelectorAll('.day-cell');
  cells.forEach(c => c.remove());

  const firstDay    = getFirstDayOfWeek(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  // Prev-month filler cells
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear  = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrev = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    grid.appendChild(renderDayCell(prevYear, prevMonth, day, false));
  }

  // Current-month cells
  for (let day = 1; day <= daysInMonth; day++) {
    grid.appendChild(renderDayCell(currentYear, currentMonth, day, true));
  }

  // Next-month filler cells
  const totalCells = firstDay + daysInMonth;
  const remainder  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonth  = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear   = currentMonth === 11 ? currentYear + 1 : currentYear;

  for (let day = 1; day <= remainder; day++) {
    grid.appendChild(renderDayCell(nextYear, nextMonth, day, false));
  }
}

function renderDayCell(year, month, day, isCurrentMonth) {
  const dateStr = toDateString(year, month, day);
  const cell    = document.createElement('div');

  cell.className = 'day-cell' +
    (isCurrentMonth ? '' : ' other-month') +
    (isToday(dateStr) ? ' today' : '');
  cell.dataset.date = dateStr;

  const numEl = document.createElement('span');
  numEl.className   = 'day-number';
  numEl.textContent = day;
  cell.appendChild(numEl);

  const evtContainer = document.createElement('div');
  evtContainer.className = 'events-container';
  cell.appendChild(evtContainer);

  renderEventsForDay(dateStr, evtContainer);

  cell.addEventListener('click', () => openAddModal(dateStr));

  return cell;
}

function renderEventsForDay(dateStr, container) {
  const dayEvents = events
    .filter(e => e.date === dateStr)
    .sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });

  dayEvents.forEach(ev => container.appendChild(renderEventChip(ev)));
}

function renderEventChip(event) {
  const chip = document.createElement('div');
  chip.className = 'event-chip';
  chip.dataset.eventId = event.id;

  if (event.startTime) {
    const timeEl = document.createElement('span');
    timeEl.className   = 'event-time';
    timeEl.textContent = formatDisplayTime(event.startTime);
    chip.appendChild(timeEl);
  }

  const titleEl = document.createElement('span');
  titleEl.className   = 'event-title';
  titleEl.textContent = event.title;
  chip.appendChild(titleEl);

  chip.addEventListener('click', e => {
    e.stopPropagation();
    openEditModal(event.id);
  });

  return chip;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openAddModal(dateStr) {
  document.getElementById('modal-title').textContent = 'Add Event';
  resetForm();
  document.getElementById('field-date').value = dateStr;
  document.getElementById('btn-delete-event').classList.add('hidden');
  editingId = null;
  showModal();
}

function openEditModal(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  document.getElementById('modal-title').textContent = 'Edit Event';
  populateForm(event);
  document.getElementById('btn-delete-event').classList.remove('hidden');
  editingId = eventId;
  showModal();
}

function showModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  // Delay focus so the modal is rendered first
  setTimeout(() => document.getElementById('field-title').focus(), 50);
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  clearErrors();
  editingId = null;
}

function resetForm() {
  document.getElementById('event-form').reset();
  document.getElementById('field-event-id').value = '';
  clearErrors();
}

function populateForm(event) {
  document.getElementById('field-event-id').value     = event.id;
  document.getElementById('field-title').value        = event.title;
  document.getElementById('field-date').value         = event.date;
  document.getElementById('field-start-time').value   = event.startTime || '';
  document.getElementById('field-end-time').value     = event.endTime   || '';
  document.getElementById('field-description').value  = event.description || '';
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateForm() {
  const title     = document.getElementById('field-title').value.trim();
  const date      = document.getElementById('field-date').value;
  const startTime = document.getElementById('field-start-time').value;
  const endTime   = document.getElementById('field-end-time').value;
  const errors    = {};

  if (!title) errors.title = 'Title is required';
  if (!date)  errors.date  = 'Date is required';
  if (startTime && endTime && endTime <= startTime) {
    errors.endTime = 'End time must be after start time';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function showErrors(errors) {
  if (errors.title) {
    const el = document.getElementById('error-title');
    el.textContent = errors.title;
    el.classList.add('visible');
    document.getElementById('field-title').classList.add('input-error');
  }
  if (errors.date) {
    const el = document.getElementById('error-date');
    el.textContent = errors.date;
    el.classList.add('visible');
    document.getElementById('field-date').classList.add('input-error');
  }
  if (errors.endTime) {
    const el = document.getElementById('error-end-time');
    el.textContent = errors.endTime;
    el.classList.add('visible');
    document.getElementById('field-end-time').classList.add('input-error');
  }
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.querySelectorAll('.input-error').forEach(el => {
    el.classList.remove('input-error');
  });
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

function getFormData() {
  return {
    title:       document.getElementById('field-title').value.trim(),
    date:        document.getElementById('field-date').value,
    startTime:   document.getElementById('field-start-time').value,
    endTime:     document.getElementById('field-end-time').value,
    description: document.getElementById('field-description').value.trim(),
  };
}

function saveEvent(e) {
  e.preventDefault();
  clearErrors();

  const { valid, errors } = validateForm();
  if (!valid) {
    showErrors(errors);
    return;
  }

  const data = getFormData();

  if (editingId !== null) {
    const idx = events.findIndex(ev => ev.id === editingId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...data };
    }
  } else {
    events.push({ id: generateId(), ...data });
  }

  saveEvents();
  renderCalendar();
  hideModal();
}

function deleteEvent() {
  if (!window.confirm('Delete this event?')) return;
  events = events.filter(ev => ev.id !== editingId);
  saveEvents();
  renderCalendar();
  hideModal();
}

// ── Navigation ────────────────────────────────────────────────────────────────

function goToPrevMonth() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear -= 1;
  } else {
    currentMonth -= 1;
  }
  renderCalendar();
}

function goToNextMonth() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear += 1;
  } else {
    currentMonth += 1;
  }
  renderCalendar();
}

function goToToday() {
  const now    = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();
  renderCalendar();
}

// ── Focus Trap ────────────────────────────────────────────────────────────────

function trapFocus(e) {
  if (e.key !== 'Tab') return;

  const modal    = document.getElementById('event-modal');
  const focusable = Array.from(
    modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.closest('.hidden') && !el.classList.contains('hidden'));

  if (!focusable.length) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ── Event Listeners & Init ────────────────────────────────────────────────────

function attachEventListeners() {
  document.getElementById('btn-prev').addEventListener('click', goToPrevMonth);
  document.getElementById('btn-next').addEventListener('click', goToNextMonth);
  document.getElementById('btn-today').addEventListener('click', goToToday);

  document.getElementById('btn-add-event').addEventListener('click', () =>
    openAddModal(todayDateString())
  );

  document.getElementById('event-form').addEventListener('submit', saveEvent);
  document.getElementById('btn-delete-event').addEventListener('click', deleteEvent);
  document.getElementById('btn-cancel').addEventListener('click', hideModal);
  document.getElementById('btn-modal-close').addEventListener('click', hideModal);

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) hideModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' &&
        !document.getElementById('modal-overlay').classList.contains('hidden')) {
      hideModal();
    }
  });

  document.getElementById('event-modal').addEventListener('keydown', trapFocus);
}

function init() {
  loadEvents();
  const now    = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();
  attachEventListeners();
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', init);
