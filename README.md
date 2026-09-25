# Assignment Tracker

An assignment/job tracker: past and potential future assignments, with links, metadata, and personal skill-match /
interest scores. See [ADR 1](doc/adr/0001-service-architecture-and-tech-stack.md) for the architecture and tech stack.
Built in Java and React.

## Environment setup

Java and Node versions are managed with [mise](https://mise.jdx.dev), pinned per-project in `mise.toml` (not installed
globally).

1. Install mise: `brew install mise`, then add its shell activation to your `~/.zshrc`
   (`eval "$(mise activate zsh)"`) if not already present.
2. From the repo root, install the pinned versions: `mise install`.
3. Verify: `java -version` and `node -v` should report the versions pinned in `mise.toml`.

## Running the backend

```bash
cd backend
./gradlew bootRun
```

Starts the API on `http://localhost:8080`, backed by `backend/data/assignments.db` (created on
first run). This file persists across restarts — stopping and restarting `bootRun` will not
lose your data. It's separate from the database used by tests (`backend/build/assignments-test.db`,
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

## Running with Docker Compose

As an alternative to the manual steps above, `docker-compose up --build` starts both services in
containers (backend on `http://localhost:8080`, frontend on `http://localhost:5173`), with
`backend/data/assignments.db` bind-mounted so data persists across restarts. Stop with
`docker-compose down` (not `docker kill`) so the backend shuts down gracefully.

The frontend container runs the Vite dev server, not a production build — see
`doc/adr/0004-docker-compose-deployment.md` and `doc/notes/productionization-tasks.md` for why and
what's deferred. `start.sh` remains available as a lighter-weight, no-Docker alternative.

## Running E2E tests

`e2e/` is a self-contained package (own `package.json`, independent of both `backend/` and
`frontend/`) that drives the real frontend and backend together with Playwright.

One-time setup: `cd e2e && npm install && npx playwright install --with-deps chromium`.

```bash
cd e2e
npm run test:e2e
```

This starts its own backend (`e2e` Spring profile, backed by the throwaway
`backend/build/assignments-e2e.db` — see
`doc/adr/0002-e2e-testing-strategy.md`) and its own frontend dev server, runs the tests, then
stops both. It never touches `backend/data/assignments.db`. Since it reuses port `8080`, stop any
backend you started manually via `./gradlew bootRun` before running this.
