# Career Development

Tracks career development within the user's consulting job: past and potential future
assignments, with links, metadata, and personal skill-match / interest scores. See
`doc/adr/0001-service-architecture-and-tech-stack.md` for the architecture and tech stack.

- `backend/` — Spring Boot (Java 21) REST API, persisting to a local SQLite database.
- `frontend/` — React (TypeScript, Vite) single-page app.

## Environment setup

Java and Node versions are managed with [mise](https://mise.jdx.dev), pinned per-project in
`mise.toml` (not installed globally).

1. Install mise: `brew install mise`, then add its shell activation to your `~/.zshrc`
   (`eval "$(mise activate zsh)"`) if not already present.
2. From the repo root, install the pinned versions: `mise install`.
3. Verify: `java -version` and `node -v` should report the versions pinned in `mise.toml`.

## Running the backend

```bash
cd backend
./gradlew bootRun
```

Starts the API on `http://localhost:8080`, backed by `backend/data/career.db` (created on
first run). This file persists across restarts — stopping and restarting `bootRun` will not
lose your data. It's separate from the database used by tests (`backend/build/career-test.db`,
created by `./gradlew integrationTest`), which is dropped after each test run and cleared
entirely by `./gradlew clean`.

### Adding an assignment

With the backend running, create an assignment via `POST`:

```bash
curl -X POST http://localhost:8080/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "link": "https://example.com/job-posting",
    "technologies": ["Java", "React"],
    "skillMatch": 4,
    "interest": 5
  }'
```

`technologies` is a list of strings; `skillMatch` and `interest` are optional integers from 1-5.
`status` is optional and defaults to `CONSIDERING`; other values are `APPLIED`, `DROPPED`,
`ACCEPTED`, `REJECTED`, and `DECLINED`.

List all saved assignments:

```bash
curl http://localhost:8080/api/assignments
```

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Starts the dev server on `http://localhost:5173`.

## Running E2E tests

`e2e/` is a self-contained package (own `package.json`, independent of both `backend/` and
`frontend/`) that drives the real frontend and backend together with Playwright.

One-time setup: `cd e2e && npm install && npx playwright install --with-deps chromium`.

```bash
cd e2e
npm run test:e2e
```

This starts its own backend (`e2e` Spring profile, backed by the throwaway
`backend/build/career-e2e.db` — see
`doc/adr/0002-e2e-testing-strategy.md`) and its own frontend dev server, runs the tests, then
stops both. It never touches `backend/data/career.db`. Since it reuses port `8080`, stop any
backend you started manually via `./gradlew bootRun` before running this.
