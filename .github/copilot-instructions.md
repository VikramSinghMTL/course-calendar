# Course Calendar - Copilot Instructions

## Project Overview

A client-side course calendar generator that renders semester schedules from JSON data using Handlebars templates. Designed to be embedded in Moodle pages (see CSS overrides for `.main-inner` and `#page.drawers`).

## Architecture

- **Pure client-side**: No build process, runs entirely in the browser
- **Single HTML file** ([index.html](index.html)) with embedded Handlebars template
- **JSON data files**: Named `calendar-{term}.json` (e.g., `calendar-w26.json`, `calendar-f24.json`)
- **Current course**: Set via `currentCourse` variable in [main.js](main.js#L1) - determines which JSON file loads
- **Handlebars CDN**: Template rendering via CDN (no npm dependencies)

## JSON Data Structure

Each calendar JSON contains a `weeks` array where each week has:

- `week`: Display label (e.g., "W01 - JAN 26")
- `startDate`: ISO date string (YYYY-MM-DD) for current week detection
- `class1`, `class2`, `homework`: Arrays of activity objects

Activity object schema:

```json
{
	"type": "lesson|quiz|assignment|project|exercise|activity|cancelled",
	"title": "Activity name",
	"link": "optional URL",
	"time": "optional duration (e.g., '30m')",
	"due": "optional due date"
}
```

**Type-specific styling**: Each activity type has a corresponding CSS class `.vik-{type}` with specific colors defined in [style.css](style.css#L137-L178).

## Key Features

1. **Current week highlighting**: Uses `startDate` to auto-highlight and scroll to current week via `currentWeekId` Handlebars helper
2. **Cancelled classes**: Detected via `anyCancelled` helper - applies striped background to entire column
3. **Sticky header**: Table header remains visible during scroll (`.vik-table thead tr` position: sticky)
4. **Vertical week labels**: Week column uses `writing-mode: vertical-lr` with 180° rotation

## Handlebars Helpers

- `anyCancelled(items)`: Returns true if any item has `type: "cancelled"`
- `eq(a, b)`: Equality check for template conditionals
- `currentWeekId(startDate)`: Returns 'current-week' if date falls within today's week

## Adding a New Semester

1. Create `calendar-{term}.json` with same structure as existing files
2. Update `currentCourse` in [main.js](main.js#L1) to match new term code
3. First week's `startDate` determines auto-scroll behavior

## Styling Conventions

- All custom classes prefixed with `vik-` to avoid Moodle conflicts
- Color scheme uses CSS custom property `--accent-color` (#414559)
- Items use semantic color coding (quiz=orange, assignment=green, exercise=blue, etc.)
- Hover effects on links: `translateY(-1px)` + drop shadow

## Development Workflow

### Local Editing (with auto-save)

```bash
npm install        # One-time setup
npm start          # Starts server on localhost:3000
```

- **Editor**: [http://localhost:3000/editor.html](http://localhost:3000/editor.html) - Full CRUD interface with auto-save
- **Viewer**: [http://localhost:3000/index.html](http://localhost:3000/index.html) - Read-only preview (what students see)

**Editor features:**

- Term selector dropdown (switches between w26, f25, f24)
- Inline editing via `contenteditable` fields (title, link, time, dates)
- Activity type selector with color-coded options
- Add/delete activities and weeks
- **Auto-save**: Changes POST to server after 1-second debounce
- Save status indicator (✓ Saved / 💾 Saving... / ✗ Error)
- JSON files update on disk automatically

### Production Deployment

- Copy `index.html`, `style.css`, `main.js`, `calendar-*.json` to Moodle
- `server.js`, `editor.html`, `editor.js` stay local (students never see the editor)
- Students see read-only calendar rendered via Handlebars

## Common Tasks

- **Edit calendar**: Run `npm start` → open `editor.html` → make changes (auto-saved)
- **Change semester**: Select term from dropdown in editor
- **Add new activity type**: Add CSS for `.vik-{type}` in [style.css](style.css) and update legend in [index.html](index.html#L14)
- **Adjust current week logic**: Modify `currentWeekId` helper in [main.js](main.js#L10-L20)

## Editor Architecture

**Auto-save mechanism:**

- User edits trigger `scheduleSave()` function in [editor.js](editor.js)
- Debounced POST request (`AUTOSAVE_DELAY = 1000ms`) to `/api/calendar/:term`
- Server ([server.js](server.js)) writes JSON with `fs.writeFileSync()`
- Visual feedback via save status indicator

**Key files:**

- [server.js](server.js) - Express server with `/api/calendar/:term` GET/POST endpoints
- [editor.html](editor.html) - Editing interface with term selector and status indicator
- [editor.js](editor.js) - Auto-save logic, contenteditable handlers, CRUD operations
