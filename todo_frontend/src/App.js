import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEYS = {
  theme: "todo_app_theme_v1",
  todos: "todo_app_todos_v1",
};

// PUBLIC_INTERFACE
function App() {
  /**
   * Todo model:
   * - id: string
   * - title: string
   * - completed: boolean
   * - createdAt: number (ms since epoch)
   */

  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
    return saved === "dark" ? "dark" : "light";
  });

  const [todos, setTodos] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.todos);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Defensive: validate minimal shape to avoid runtime errors from corrupted storage.
      return parsed
        .filter((t) => t && typeof t.id === "string" && typeof t.title === "string")
        .map((t) => ({
          id: t.id,
          title: String(t.title),
          completed: Boolean(t.completed),
          createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
        }));
    } catch {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");

  const addInputRef = useRef(null);
  const editInputRef = useRef(null);

  const remainingCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  // Effect: apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  // Effect: persist todos
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
  }, [todos]);

  // Focus edit input whenever we enter edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const normalizeTitle = (value) => value.replace(/\s+/g, " ").trim();

  const generateId = () => {
    // No external deps: use crypto when available, fallback otherwise.
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  // PUBLIC_INTERFACE
  const addTodo = () => {
    const title = normalizeTitle(newTitle);
    if (!title) return;

    const now = Date.now();
    const todo = { id: generateId(), title, completed: false, createdAt: now };
    setTodos((prev) => [todo, ...prev]);
    setNewTitle("");
    addInputRef.current?.focus();
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingDraft(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft("");
  };

  // PUBLIC_INTERFACE
  const saveEdit = () => {
    const next = normalizeTitle(editingDraft);
    if (!editingId) return;

    // If emptied out, do not save; keep the user in edit mode.
    if (!next) return;

    setTodos((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, title: next } : t))
    );
    setEditingId(null);
    setEditingDraft("");
  };

  // PUBLIC_INTERFACE
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) cancelEdit();
  };

  // PUBLIC_INTERFACE
  const toggleCompleted = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const onAddKeyDown = (e) => {
    if (e.key === "Enter") addTodo();
  };

  const onEditKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="App">
      <header className="appTopBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandTitle">Todo</div>
            <div className="brandSubtitle">Simple tasks. Fast workflow.</div>
          </div>
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </header>

      <main className="page">
        <section className="card" aria-label="Create a task">
          <div className="cardHeader">
            <h1 className="cardTitle">Your tasks</h1>
            <div className="cardMeta" aria-label="Remaining tasks">
              {remainingCount} left
            </div>
          </div>

          <div className="inputRow">
            <label className="srOnly" htmlFor="newTask">
              New task
            </label>
            <input
              id="newTask"
              ref={addInputRef}
              className="textInput"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={onAddKeyDown}
              placeholder="Add a task…"
              autoComplete="off"
            />
            <button
              className="btnPrimary"
              onClick={addTodo}
              type="button"
              disabled={!normalizeTitle(newTitle)}
            >
              Add
            </button>
          </div>

          <div className="listWrap" role="region" aria-label="Task list">
            {todos.length === 0 ? (
              <div className="emptyState">
                <div className="emptyTitle">No tasks yet</div>
                <div className="emptyDesc">
                  Add your first task above. Your list is saved in this browser.
                </div>
              </div>
            ) : (
              <ul className="todoList">
                {todos.map((todo) => {
                  const isEditing = editingId === todo.id;

                  return (
                    <li className="todoItem" key={todo.id}>
                      <div className="todoMain">
                        <label className="checkWrap">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleCompleted(todo.id)}
                            aria-label={`Mark "${todo.title}" as ${
                              todo.completed ? "incomplete" : "complete"
                            }`}
                          />
                          <span className="checkVisual" aria-hidden="true" />
                        </label>

                        <div className="todoContent">
                          {isEditing ? (
                            <>
                              <label className="srOnly" htmlFor={`edit-${todo.id}`}>
                                Edit task
                              </label>
                              <input
                                id={`edit-${todo.id}`}
                                ref={editInputRef}
                                className="textInput textInputCompact"
                                value={editingDraft}
                                onChange={(e) => setEditingDraft(e.target.value)}
                                onKeyDown={onEditKeyDown}
                                aria-invalid={!normalizeTitle(editingDraft)}
                              />
                              {!normalizeTitle(editingDraft) ? (
                                <div className="inlineHint" role="status">
                                  Title can’t be empty.
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <div
                              className={
                                todo.completed ? "todoTitle todoTitleDone" : "todoTitle"
                              }
                            >
                              {todo.title}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="todoActions">
                        {isEditing ? (
                          <>
                            <button
                              className="btnGhost"
                              onClick={cancelEdit}
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              className="btnPrimary btnSmall"
                              onClick={saveEdit}
                              type="button"
                              disabled={!normalizeTitle(editingDraft)}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btnGhost"
                              onClick={() => startEdit(todo)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="btnDanger"
                              onClick={() => deleteTodo(todo.id)}
                              type="button"
                              aria-label={`Delete "${todo.title}"`}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="footerRow">
            <div className="footerHint">
              Tip: Press <kbd>Enter</kbd> to add/save, <kbd>Esc</kbd> to cancel edit.
            </div>

            <button
              className="btnGhost"
              onClick={clearCompleted}
              type="button"
              disabled={todos.every((t) => !t.completed)}
            >
              Clear completed
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
