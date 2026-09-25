# Career Development

Tracks prospective consulting opportunities: past and potential future
assignments, with links, metadata, and personal skill-match / interest scores.

## Folders

- `backend/` — Spring Boot (Java 21) REST API. Persists to a local SQLite database via Spring
  Data JPA / Hibernate. Source under `backend/src/main`, integration tests under
  `backend/src/integration`.
- `frontend/` — React (TypeScript, Vite) single-page app. Table view of assignments with inline
  editing, backed by the backend's REST API.
- `e2e/` — Self-contained Playwright package that drives the real frontend and backend together.
  Independent `package.json`, not a dependency of either `backend/` or `frontend/`.
- `doc/adr/` — Architecture decision records.
- `doc/notes/` — Lightweight reference notes for quick lookup, e.g. what SQL a given
  action issues.

## Tech stack

- **Backend:** Spring Boot 3.x, Java 21, Gradle (Kotlin DSL). Spring Data JPA + Hibernate,
  backed by a local SQLite file via `sqlite-jdbc` and the `hibernate-community-dialects` SQLite
  dialect.
- **Frontend:** React 19, TypeScript, Vite. No UI/state-management library beyond React itself.
- **E2E:** Playwright, run against both services started for the duration of the test run.
- **Toolchain:** Java and Node versions are pinned per-project via `mise` (`mise.toml`), not
  installed globally.
- **Deployment:** Can be deployed locally with `docker compose`.

## ADRs and plans

When creating ADRs, add the conventional sections for Context, Decision, and Consequences. 
Do not put step-by-step implementation plans in the ADR, they are meant to capture the
why rather than the how.

Keep ADRs brief. Focus on the core intent behind the decision. You do not need to mention 
options that weren't taken during the ideation process, unless the decision is explicitly 
to reverse or change an existing decision.

When creating an implementation plan, if saving it for future use, put it in the folder 
.claude/plans. Once the plan has been implemented, delete the plan file.

## Notes

- Run instructions are in `README.md`.
- Unless explicitly told to, never git commit code or push, I will do that myself.
