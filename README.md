# Calendar App

A simple month-view calendar built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies.

![Calendar App](https://img.shields.io/badge/HTML%2FCSS%2FJS-vanilla-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Month grid view** — 7-column grid with prev/next month filler days
- **Add events** — click any day cell or the + button to open the event modal
- **Edit & delete events** — click an event chip to edit or remove it
- **Persistent storage** — events saved to `localStorage` as JSON, survive page refreshes
- **Validation** — title required, end time must be after start time
- **Responsive** — works on mobile (375px), tablet (768px), and desktop
- **Accessible** — keyboard navigable, focus-trapped modal, `aria-label` on all icon buttons

## Getting Started

No install or server required. Just open the file in a browser:

```bash
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or drag `index.html` into any browser window.

## Usage

| Action | How |
|---|---|
| Navigate months | ‹ / › buttons in the header |
| Jump to today | **Today** button |
| Add an event | Click any day cell, or the **+** button |
| Edit an event | Click the event chip on the calendar |
| Delete an event | Open the event → **Delete** button → confirm |
| Close modal | **Cancel**, × button, Escape key, or click the backdrop |

## Project Structure

```
calendar-app/
├── index.html      # Page structure — header, grid, modal
├── style.css       # CSS Grid layout, modal styles, responsive breakpoints
├── app.js          # All logic: render, CRUD, localStorage, validation
└── tasks/
    └── to.md       # Task checklist with acceptance criteria
```

## Security

- All user content rendered via `textContent` — no XSS vectors
- Content Security Policy meta tag blocks inline scripts and external resources
- `localStorage` data validated against a strict schema on load
- No external dependencies or network requests

## Browser Support

Any modern browser (Chrome, Firefox, Safari, Edge). Requires `localStorage` support.
