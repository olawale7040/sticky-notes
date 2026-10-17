# Sticky Notes

A single-page sticky notes board built with React and TypeScript, without UI or drag-and-drop libraries.

## Approach

User actions dispatch typed actions to a pure reducer, the new state renders through memoised components, and a persistence hook syncs it to an asynchronous API.

- **Logic first:** the note model, geometry and reducer are plain TypeScript with no React, so they're easy to test and the UI could be replaced without touching them.
- **One drag primitive:** moving, resizing, drawing and deleting all build on a single pointer-drag hook.
- **Storage behind an interface:** the app only knows a small repository interface, so replacing the mock API with a real backend is a one-line change in `App.tsx`.
- **Verified** with unit and user-flow tests, plus manual checks in Chrome, Firefox and Edge at 1024×768.

## Running locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev     # then open the URL Vite prints, usually http://localhost:5173
npm test        # also: npm run typecheck, npm run lint, npm run build
```

## Features

All four required features and all five optional ones are implemented.

| | Feature | How |
|---|---|---|
| 1 | Create a note of a specified size and position | Drag on empty board space to draw it. Double-click for a default-size note. |
| 2 | Resize | Drag the handle in a note's bottom-right corner. |
| 3 | Move | Drag a note by its header. |
| 4 | Delete via trash zone | Drop the note on the trash (bottom right). It highlights when a drop will delete. |
| I | Edit text | Type in the note. |
| II | Bring to front | Click or focus a note. |
| III | Local storage | Notes are restored on page load. |
| IV | Colours | Swatches appear in a note's header on hover. |
| V | REST API | Saved through a REST client to an asynchronous mock server. |

Also: Escape cancels a drag, notes can be moved, resized and deleted from the keyboard, and notes are kept on screen when the window shrinks.

## Architecture

**State.** All note data lives in one reducer, and every change, from moving a note to editing its text, goes through it as a typed action. The reducer and the rules it uses (minimum size, keeping notes on the board, which note is on top) are plain TypeScript with no React, which makes them easy to test. If an action doesn't actually change anything, the reducer returns the same state, so nothing re-renders.

**Dragging.** Moving, resizing, drawing a new note and dropping one in the trash all use the same drag hook, built on Pointer Events. While you move or resize a note, only that note updates on screen; the rest of the board isn't touched until you let go, and then a single action records the result. Pressing Escape cancels a drag.

**Saving.** The app talks to storage through a small repository interface, so components never deal with storage directly. Here it's backed by a REST client and an asynchronous mock server that keeps data in localStorage. Changes are saved shortly after you stop editing, one save at a time so an older save can't overwrite a newer one, and if loading fails the app won't save over your existing notes.

## Assumptions

- Desktop only, latest Chrome, Firefox and Edge, minimum 1024×768, as specified.
- A single user in a single tab, so there's no conflict handling between tabs or devices.
- Saving the whole collection with one `PUT` is acceptable at sticky-note scale.

## Known limitations and next steps

- Per-note endpoints (`POST`/`PATCH`/`DELETE`) would scale better than replacing the collection.
- Browser-based tests (e.g. Playwright) would cover the drag gestures that jsdom can't.
