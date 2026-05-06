# Calendar App – Task Checklist

## Phase 1: Scaffold
- [x] Create `index.html` with DOCTYPE, meta viewport, linked CSS/JS
- [x] Create `style.css` with `:root` custom properties and CSS reset
- [x] Create `app.js` with `STORAGE_KEY` constant, state variables, and `DOMContentLoaded` init

**Acceptance criteria:**
- Page loads in browser with no console errors
- `<link>` and `<script>` tags resolve correctly
- Custom properties are accessible via DevTools computed styles

---

## Phase 2: Grid Rendering
- [x] Implement `getDaysInMonth`, `getFirstDayOfWeek`, `toDateString`, `isToday`
- [x] Implement `renderHeader` — updates `#month-label`
- [x] Implement `renderGrid` — prev-month fillers, current-month cells, next-month fillers
- [x] Implement `renderDayCell` with `.today` and `.other-month` class logic
- [x] Style `#calendar-grid` as a 7-column CSS Grid
- [x] Style `.day-cell`, `.day-number`, `.today` badge, `.other-month` muted text

**Acceptance criteria:**
- Grid always shows exactly 7 columns (Sun–Sat)
- Today's cell has a blue circular badge on the day number
- Prev/next-month filler days render in muted grey
- Maximum of 6 rows displayed for any month

---

## Phase 3: Navigation
- [x] Implement `goToPrevMonth`, `goToNextMonth`, `goToToday`
- [x] Wire `#btn-prev`, `#btn-next`, `#btn-today` click listeners

**Acceptance criteria:**
- `#month-label` updates correctly after every navigation action
- Clicking Previous in January moves to December of the prior year
- Clicking Next in December moves to January of the next year
- `#btn-today` always returns to the current real-world month/year

---

## Phase 4: Modal UI
- [x] Add modal HTML (`#modal-overlay`, `#event-modal`, `#event-form`) to `index.html`
- [x] Style modal overlay, modal box, form groups, and action buttons
- [x] Implement `showModal` — removes `.hidden`, focuses `#field-title`, traps Tab focus
- [x] Implement `hideModal` — adds `.hidden`, clears errors, resets `editingId`
- [x] Implement `resetForm` and `populateForm`

**Acceptance criteria:**
- Modal opens centred on an overlay; clicking backdrop closes it
- Pressing Escape closes the modal
- Tab key cycles only through focusable elements inside the modal
- Closing the modal clears all form fields and error messages

---

## Phase 5: Add Event
- [x] Implement `generateId`, `getFormData`, `validateForm`, `showErrors`, `clearErrors`
- [x] Implement `saveEvent` (add-mode branch)
- [x] Implement `loadEvents`, `saveEvents`
- [x] Implement `renderEventsForDay` and `renderEventChip`
- [x] Wire `.day-cell` click → `openAddModal(dateStr)` (date pre-filled)
- [x] Wire `#btn-add-event` → `openAddModal(todayDateString())`

**Acceptance criteria:**
- Clicking a day cell opens the modal with `#field-date` pre-filled to that day
- Submitting with an empty title shows `#error-title` inline; nothing is saved
- Submitting with end time ≤ start time shows `#error-end-time`; nothing is saved
- A valid submission closes the modal, renders an event chip on the correct cell, and writes to `localStorage`
- Refreshing the page restores all previously saved events (verified in DevTools → Application → Local Storage)

---

## Phase 6: Edit & Delete
- [x] Implement `openEditModal` — populates form, shows `#btn-delete-event`
- [x] Implement `saveEvent` (edit-mode branch — updates existing event by `editingId`)
- [x] Implement `deleteEvent` with `window.confirm` dialog
- [x] Wire `.event-chip` click → `openEditModal(event.id)` (stopPropagation)

**Acceptance criteria:**
- Clicking an event chip opens the modal with all fields pre-populated
- `#btn-delete-event` is visible in edit mode and hidden in add mode
- Saving edits updates the event in `localStorage` and re-renders the chip
- Deleting shows a confirm dialog; confirming removes the event from the grid and `localStorage`
- Cancelling the confirm dialog leaves the event intact

---

## Phase 7: Responsive Styles
- [x] Add `@media (max-width: 768px)` — reduce cell height, hide chip times
- [x] Add `@media (max-width: 480px)` — compact cells, stack form rows, smaller fonts

**Acceptance criteria:**
- At 375px viewport: grid is legible, day cells are at minimum 52px tall, modal is usable
- At 768px: event chips hide the start time, displaying only the title
- At all breakpoints: no horizontal scrollbar appears on the calendar grid itself
- Modal form rows (`Start Time` / `End Time`) stack vertically on mobile

---

## Phase 8: Polish & Edge Cases
- [ ] Verify events survive a full page refresh (localStorage round-trip)
- [ ] Verify February 2024 shows 29 days (leap year)
- [ ] Verify February 2025 shows 28 days (non-leap year)
- [ ] Verify December → Next → January navigation wraps year correctly
- [ ] Verify January → Prev → December navigation wraps year correctly
- [ ] Confirm `aria-label` attributes on all icon-only buttons (`#btn-prev`, `#btn-next`, `#btn-add-event`, `#btn-modal-close`)
- [ ] Confirm no console errors in Chrome DevTools across all interactions

**Acceptance criteria:**
- All edge-case navigations land on the correct month and year
- Screen reader can announce button purposes via `aria-label`
- Zero JavaScript errors appear in the browser console during normal use
