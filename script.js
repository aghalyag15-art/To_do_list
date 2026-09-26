/**
 * Ledger — a client-side to-do list.
 *
 * Concepts demonstrated (mapped to the assignment brief):
 *  - Full CRUD: addTask, renderTasks (read), editTask, deleteTask
 *  - Persistence: saveTasks() / loadTasks() via window.localStorage
 *  - Filtering: All / Active / Completed
 *  - Dynamic DOM: every task <li> is built with document.createElement,
 *    never with innerHTML, to avoid injection and to practice DOM APIs
 *  - Delegated events: ONE click listener on the <ul>, instead of one
 *    listener per task, so newly-added tasks work automatically
 */

(() => {
  "use strict";

  // ---------- Constants ----------
  const STORAGE_KEY = "ledger.tasks.v1";

  // ---------- DOM references ----------
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const taskCountEl = document.getElementById("task-count");
  const taskStatusEl = document.getElementById("task-status");

  // ---------- State ----------
  /** @type {{id: string, text: string, completed: boolean, createdAt: number}[]} */
  let tasks = [];
  let currentFilter = "all"; // "all" | "active" | "completed"

  // ---------- Persistence (localStorage) ----------
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Could not read saved tasks, starting fresh.", err);
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStatus("saved locally in this browser");
    } catch (err) {
      console.error("Could not save tasks.", err);
      setStatus("couldn't save — storage may be full");
    }
  }

  function setStatus(message) {
    taskStatusEl.textContent = message;
  }

  // ---------- ID helper ----------
  function createId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    );
  }

  // ---------- CRUD operations ----------
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    tasks.unshift({
      id: createId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    });

    saveTasks();
    renderTasks();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }

  function editTask(id, newText) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const trimmed = newText.trim();
    if (!trimmed) {
      deleteTask(id); // clearing the text deletes the entry
      return;
    }
    task.text = trimmed;
    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    renderTasks();
  }

  // ---------- Filtering ----------
  function getFilteredTasks() {
    switch (currentFilter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    renderTasks();
  }

  // ---------- Rendering (dynamic DOM creation) ----------
  function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function buildTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " is-completed" : "");
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-item__check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as complete`);
    // data-action lets the delegated listener know what to do
    checkbox.dataset.action = "toggle";

    // Body (text + timestamp)
    const body = document.createElement("div");
    body.className = "task-item__body";

    const textEl = document.createElement("span");
    textEl.className = "task-item__text";
    textEl.textContent = task.text; // textContent, never innerHTML
    textEl.tabIndex = 0;
    textEl.dataset.action = "start-edit";
    textEl.title = "Click to edit";

    const meta = document.createElement("span");
    meta.className = "task-item__meta";
    meta.textContent = `added ${formatTimestamp(task.createdAt)}`;

    body.append(textEl, meta);

    // Actions
    const actions = document.createElement("div");
    actions.className = "task-item__actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "task-item__action";
    editBtn.dataset.action = "start-edit";
    editBtn.setAttribute("aria-label", "Edit task");
    editBtn.textContent = "✎";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "task-item__action task-item__action--delete";
    deleteBtn.dataset.action = "delete";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.textContent = "✕";

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, body, actions);

    return li;
  }

  function renderTasks() {
    const filtered = getFilteredTasks();

    // Clear list, then rebuild from state (state is the single source of truth)
    list.innerHTML = "";
    const fragment = document.createDocumentFragment();
    filtered.forEach((task) => fragment.appendChild(buildTaskElement(task)));
    list.appendChild(fragment);

    emptyState.hidden = tasks.length !== 0;
    if (tasks.length === 0) {
      emptyState.textContent =
        "Nothing here yet — the page is blank. Add your first entry above.";
    } else if (filtered.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent = `No ${currentFilter} entries.`;
    }

    updateCount();
  }

  function updateCount() {
    const activeCount = tasks.filter((t) => !t.completed).length;
    const label = activeCount === 1 ? "item" : "items";
    taskCountEl.textContent = `${activeCount} ${label} left`;
  }

  // ---------- Inline editing ----------
  function startEdit(li, task) {
    const body = li.querySelector(".task-item__body");
    const textEl = body.querySelector(".task-item__text");

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-item__edit-input";
    editInput.value = task.text;
    editInput.maxLength = 120;

    body.replaceChild(editInput, textEl);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    const commit = () => editTask(task.id, editInput.value);
    const cancel = () => renderTasks();

    editInput.addEventListener("blur", commit, { once: true });
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editInput.blur(); // triggers commit via the blur listener above
      } else if (e.key === "Escape") {
        editInput.removeEventListener("blur", commit);
        cancel();
      }
    });
  }

  // ---------- Event delegation ----------
  // One listener handles clicks for every task, present or future.
  list.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    const li = event.target.closest(".task-item");
    if (!li) return;

    const id = li.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    switch (actionEl.dataset.action) {
      case "toggle":
        toggleTask(id);
        break;
      case "start-edit":
        startEdit(li, task);
        break;
      case "delete":
        deleteTask(id);
        break;
    }
  });

  // Checkbox "change" also needs delegation (click fires before checked updates
  // consistently across browsers, so we listen for change too and no-op toggle
  // is idempotent-safe since toggle just flips state once per user action)
  list.addEventListener(
    "change",
    (event) => {
      if (event.target.matches('[data-action="toggle"]')) {
        // handled by the click listener above via label/input click;
        // this guard prevents double toggling on some touch browsers
      }
    },
    { passive: true }
  );

  // ---------- Form + toolbar events ----------
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(input.value);
    input.value = "";
    input.focus();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  // ---------- Init ----------
  function init() {
    loadTasks();
    renderTasks();
  }

  document.addEventListener("DOMContentLoaded", init);
})();