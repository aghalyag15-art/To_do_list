# Ledger — JavaScript To-Do List

A client-side to-do list app built with vanilla HTML, CSS, and JavaScript.
Covers full CRUD, `localStorage` persistence, DOM manipulation, filtering,
and delegated event handling — built for the "JavaScript Logic & State
Management" internship task.

## Folder structure

```
todo-app/
├── index.html          → page structure
├── css/
│   └── style.css       → all styling (theme: paper ledger)
├── js/
│   └── script.js        → all app logic
└── README.md
```

## How to set this up in VS Code

1. **Create the folders.** Open VS Code → File → Open Folder → create/select
   an empty folder named `todo-app`. Inside it, create two subfolders named
   `css` and `js` (right-click the `todo-app` folder in the Explorer sidebar →
   "New Folder").
2. **Create the files.** Right-click each folder and choose "New File":
   - `todo-app/index.html`
   - `todo-app/css/style.css`
   - `todo-app/js/script.js`
3. **Paste the code** from each file into the matching file, then save
   (`Ctrl+S` / `Cmd+S`).
4. **Run it.** Install the "Live Server" extension (by Ritwick Dey) from the
   VS Code Extensions panel, then right-click `index.html` → "Open with Live
   Server". This gives you auto-reload on save. (Opening `index.html`
   directly in a browser also works, since the app has no build step.)

## Why this satisfies the brief

| Requirement | Where it lives |
|---|---|
| Create / Read / Update / Delete | `addTask`, `renderTasks`, `editTask`, `deleteTask` in `script.js` |
| Persist automatically via `localStorage` | `saveTasks()` / `loadTasks()` — called on every mutation and on page load |
| Filtering (All / Active / Completed) | `currentFilter` state + `getFilteredTasks()` + the filter buttons |
| Dynamic DOM elements | `buildTaskElement()` uses `document.createElement` for every task — no `innerHTML` |
| Delegated event listeners | A single `click` listener on `#task-list` handles toggle, edit, and delete for every task, current and future |

## Ideas for going further (optional, for extra polish)

- Add drag-to-reorder using the native Drag and Drop API.
- Add due dates per task and sort by them.
- Export/import tasks as JSON.
- Add a dark-mode toggle that also persists to `localStorage`.
- Write a few unit tests for `addTask` / `editTask` / `deleteTask` with Jest.