# 2. E2E Testing Strategy

Date: 2026-09-23

## Status

Accepted

## Context

The frontend's assignment table and add-by-link flow need an end-to-end test that drives the
real frontend and backend together, the same way a person would use the app. Testing this
manually against the real backend showed the problem: the API has no `DELETE`/reset endpoint,
so any test data written during a manual or automated run permanently pollutes
`backend/data/assignments.db` unless removed by hand, directly in the database. That's not
acceptable for data this app is meant to track durably.

The backend already has a precedent for isolating test data: `backend/src/integration` uses
`spring.jpa.hibernate.ddl-auto=create-drop` against a throwaway `build/assignments-test.db`. That
works there because MockMvc-based integration tests run in-process against the Spring context
built for that source set. An E2E test is different — it needs the backend running as a real,
separately-launched process on a real port, which a source-set resource override can't
configure (it only affects the classpath used to compile and run that source set's own test
code, not a `bootRun` process launched from `src/main`).

## Decision

- Add a Spring profile, `e2e`, via `backend/src/main/resources/application-e2e.properties`,
  pointing at its own throwaway `build/assignments-e2e.db` with `ddl-auto=create-drop` (recreated
  fresh on every server startup). Launch it with
  `./gradlew bootRun --args='--spring.profiles.active=e2e'`. This is new to the repo — no
  profiles exist elsewhere — but is standard Spring Boot practice and keeps the same
  isolation pattern as the existing integration tests, just applied to a real running process
  instead of an in-process test context. The server still runs on the default port, so
  the frontend's existing Vite dev proxy needs no changes.
- Use Playwright (`@playwright/test`) to drive the actual Vite dev server and this backend
  process together, from a new top-level `e2e/` package with its own `package.json` —
  separate from `frontend/`'s dependencies, since the tests exercise the whole system rather
  than being frontend-specific, and this repo already has each top-level directory manage its
  own dependencies (`backend/` via Gradle, `frontend/` via npm). Its `webServer` config starts
  both processes (backend via the command above with `cwd: '../backend'`, frontend via
  `npm run dev` with `cwd: '../frontend'`) before running tests, and tears both down
  afterward.
- The backend has no way to reset data between individual tests, and `create-drop` only wipes
  the database once per server lifetime (at startup), not per test. So all E2E tests in a
  single run share one continuously-growing database. Tests run serially (`workers: 1`) and
  are written to assert relative/incremental behavior (e.g. "the link I just added now
  appears", "pagination reacts correctly once a page boundary is crossed") rather than depend
  on an exact starting row count.

## Consequences

- A developer's own `./gradlew bootRun` dev backend on the default port must be stopped before 
  running `npm run test:e2e`, since the E2E run reuses the same port deliberately to avoid 
  touching frontend proxy configuration. Gradle fails loudly ("port already in use") if this 
  isn't done, rather than silently running against the wrong database.
- If a `DELETE`/reset endpoint is added later, E2E tests could be simplified to reset state
  between cases instead of relying on serial execution and incremental assertions — worth
  revisiting this ADR at that point.
- No CI exists yet for this repo, so `npm run test:e2e` is a local-only workflow for now.
