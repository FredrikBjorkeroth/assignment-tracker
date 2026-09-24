# Career Development

Tracks career development within the user's consulting job: past and potential future
assignments, with links, metadata, and personal skill-match / interest scores. See
`doc/adr/` for architecture decisions and `doc/notes/` for lightweight implementation reference.

## Folders

- `backend/` — Spring Boot (Java 21) REST API. Persists to a local SQLite database via Spring
  Data JPA / Hibernate. Source under `backend/src/main`, integration tests under
  `backend/src/integration`.
- `frontend/` — React (TypeScript, Vite) single-page app. Table view of assignments with inline
  editing, backed by the backend's REST API.
- `e2e/` — Self-contained Playwright package that drives the real frontend and backend together.
  Independent `package.json`, not a dependency of either `backend/` or `frontend/`.
- `doc/adr/` — Architecture decision records.
- `doc/notes/` — Lightweight reference notes (not ADRs) for quick lookup, e.g. what SQL a given
  action issues.

## Tech stack

- **Backend:** Spring Boot 3.x, Java 21, Gradle (Kotlin DSL). Spring Data JPA + Hibernate,
  backed by a local SQLite file via `sqlite-jdbc` and the `hibernate-community-dialects` SQLite
  dialect.
- **Frontend:** React 19, TypeScript, Vite. No UI/state-management library beyond React itself.
- **E2E:** Playwright, run against both services started for the duration of the test run.
- **Toolchain:** Java and Node versions are pinned per-project via `mise` (`mise.toml`), not
  installed globally.

Run instructions are in `README.md`.
