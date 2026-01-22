# Simple Todo List (React Frontend)

This repository contains the frontend for a simple web-based todo application. The current codebase is a Create React App (CRA) project that renders a minimal UI and includes a light/dark theme toggle. The intended product direction (per the work item) is a simple CRUD todo app (create, read, update, delete tasks) without authentication.

The React application lives in `simple-todo-list-203979-203988/todo_frontend`.

## What this app is

At the moment, the frontend is a minimal CRA app with:

- A single page rendered by `src/App.js`.
- A theme toggle that switches between light and dark modes by setting `data-theme` on the document root element.
- Styling managed via CSS variables in `src/App.css`.

The planned/target behavior is a todo list UI with a task input at the top and a scrollable list of tasks below, with edit and delete actions for each task.

## Repository structure

- `simple-todo-list-203979-203988/todo_frontend`: React (CRA) frontend.
- `simple-todo-list-203979-203988/README.md`: This file.

## Prerequisites

- Node.js (recommended: an active LTS version)
- npm (bundled with Node.js)

## Setup

From the repository root:

```bash
cd simple-todo-list-203979-203988/todo_frontend
npm install
```

## Running the app (development)

From `simple-todo-list-203979-203988/todo_frontend`:

```bash
npm start
```

By default, CRA serves the app at:

- http://localhost:3000

If you are running inside a hosted/dev environment, the environment may provide a forwarded URL to port 3000.

## Running tests

From `simple-todo-list-203979-203988/todo_frontend`:

```bash
npm test
```

Note: CRA’s test runner typically starts in watch mode when run locally.

## Production build

From `simple-todo-list-203979-203988/todo_frontend`:

```bash
npm run build
```

This outputs a production build to `simple-todo-list-203979-203988/todo_frontend/build`.

## Environment variables

The frontend supports the following environment variables (defined for this container). In Create React App, only variables prefixed with `REACT_APP_` are embedded into the client bundle.

Unless otherwise noted, these variables are not currently referenced by the existing UI code (`src/App.js`), but they are documented here because they are part of the container configuration and intended to support API integration and runtime configuration.

### API and URL configuration

#### `REACT_APP_API_BASE`
Base URL for HTTP API calls (for example, `https://api.example.com` or `http://localhost:8080`). Intended to be used by the todo CRUD data layer.

#### `REACT_APP_BACKEND_URL`
Alternate or additional backend base URL. Some projects separate `API_BASE` and `BACKEND_URL`; if both are present, prefer documenting and standardizing on one in the implementation plan.

#### `REACT_APP_FRONTEND_URL`
Public URL where the frontend is hosted. Useful for generating absolute links, CORS configuration (on the backend), or deep link generation.

#### `REACT_APP_WS_URL`
WebSocket URL (for example, `ws://localhost:8080/ws` or `wss://example.com/ws`). Intended for real-time updates if the todo list later supports push updates.

### Runtime / build behavior

#### `REACT_APP_NODE_ENV`
An app-level environment indicator. Note that CRA already provides `process.env.NODE_ENV`; if this variable is used, ensure it does not conflict with CRA expectations.

#### `REACT_APP_NEXT_TELEMETRY_DISABLED`
Telemetry flag. The name resembles Next.js telemetry configuration, but this is a CRA app; document it here as a general “disable telemetry” flag if present in the environment.

#### `REACT_APP_ENABLE_SOURCE_MAPS`
Enable or disable source map generation/usage. For CRA, source map generation is typically controlled at build time; if this variable is wired in later, define its behavior clearly (for example, `"true"`/`"false"`).

### Server / hosting-related (if used by tooling)

#### `REACT_APP_PORT`
Port the frontend should run on. CRA typically uses `PORT` (without the prefix) to control the dev server port; if you intend to control the port, consider using `PORT` or explicitly mapping `REACT_APP_PORT` in scripts.

#### `REACT_APP_TRUST_PROXY`
Proxy trust setting (usually used in backend/server contexts). If this is intended for hosted environments, define what values are accepted and how it affects routing.

#### `REACT_APP_LOG_LEVEL`
Client logging verbosity. Suggested values: `debug`, `info`, `warn`, `error`.

#### `REACT_APP_HEALTHCHECK_PATH`
Path for a healthcheck endpoint. Typically relevant for backend services; if used for frontend hosting checks, define the route (for example, `/healthz`) and ensure it is served.

### Feature gating / experimentation

#### `REACT_APP_FEATURE_FLAGS`
A serialized set of feature flags. Recommended formats:
- Comma-separated list: `flagA,flagB`
- JSON string: `{"flagA":true,"flagB":false}`

Pick one format and standardize it when implementing.

#### `REACT_APP_EXPERIMENTS_ENABLED`
Boolean-like flag to enable experimental features. Suggested values: `true` / `false`.

## Initial implementation plan

This plan focuses on evolving the existing CRA template into the intended todo CRUD frontend. It is written to align with what is currently present in the codebase, while outlining a straightforward path to the target behavior.

### 1) Define the todo data model and UI components

Implement a minimal todo model in the frontend such as:

- `id` (string)
- `title` (string)
- `completed` (boolean)
- `createdAt` (optional)

Create components in `src/`:

- `TodoInput`: input field + add button, with validation (non-empty, trimmed).
- `TodoList`: scrollable list container.
- `TodoItem`: renders a single task with edit and delete actions.
- `EmptyState`: shown when there are no tasks.

### 2) Implement state management and UX states

Use React hooks (`useState`, `useEffect`) for:

- The list of todos
- Loading state (when fetching from an API)
- Error state (display a user-friendly message)
- Editing state (track which item is being edited and the draft text)

Keep interactions accessible (keyboard-friendly controls, proper labels) and responsive.

### 3) Add API integration (if/when backend is available)

Create a small API client module (for example `src/api/todos.js`) that uses:

- `REACT_APP_API_BASE` (or `REACT_APP_BACKEND_URL`) as the base URL.

Implement:

- `GET /todos`
- `POST /todos`
- `PUT /todos/:id`
- `DELETE /todos/:id`

If no backend exists yet, add a temporary in-memory or `localStorage` persistence layer behind the same interface so the UI can be completed independently.

### 4) Styling and layout alignment

Update `src/App.css` (or split into component CSS files) to match the intended style:

- Light, modern theme
- Blue/cyan accents
- Single-page layout: task input at top, scrollable list below
- Buttons and controls consistent with theme variables

The existing theme-toggle behavior can remain and should apply to the todo UI as well.

### 5) Testing

Expand tests beyond the default CRA template test:

- Adding a todo
- Editing a todo
- Deleting a todo
- Validation (cannot add empty todo)
- Error state rendering (when API fails)

### 6) Operational polish

- Document the chosen `.env` formats and defaults clearly.
- Add linting and formatting conventions if needed.
- Ensure the app can be built and served in production environments.

## Notes

- The existing `todo_frontend/README.md` describes the CRA template. This root README is intended to describe the overall project and the expected evolution into the todo CRUD application.
- The current UI in `src/App.js` is still the starter template UI; implementing the plan above will replace most of the template content with the actual todo app interface.
