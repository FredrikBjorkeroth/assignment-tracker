# 4. Docker Compose Deployment

Date: 2026-09-25

## Status

Accepted

## Context

`start.sh` runs the backend and frontend as two background processes in one script, polling until
each is ready and trapping signals to kill both on exit. It works but has no restart-on-crash, and
an awkward interruption (e.g. a killed terminal) can leave orphaned processes holding ports 8080 or
5173. A more robust way to run the full stack locally is needed, without giving up the fast,
no-build-step loop `start.sh` already provides.

## Decision

Add a `docker-compose.yml` at the repo root running the backend and frontend as **two separate
containers**, rather than both processes in one container — this keeps process supervision, crash
restarts, and logs per-service, and avoids needing a custom init/signal-forwarding setup for
multiple processes sharing one PID 1.

- `backend/Dockerfile`: Java 21 base image, builds and runs the Spring Boot app, exposing port
  8080.
- `frontend/Dockerfile`: Node base image, runs the **Vite dev server** (`npm run dev`), exposing
  port 5173. This is a deliberate stopgap, not a production build — see Consequences.
- The SQLite file (`backend/data/assignments.db`) is persisted via a bind mount, so container restarts
  and rebuilds don't lose data, mirroring the existing local file layout.
- Shutdown is via `docker-compose down` (SIGTERM, not `docker kill`), so Spring Boot closes its
  connection pool and the SQLite file cleanly before exit.
- `start.sh` is kept unchanged as a lighter-weight alternative for contributors who don't want a
  Docker build step; the README documents both paths.

## Consequences

- Two run paths (`start.sh` and `docker-compose`) now exist side by side and must be kept in sync
  in the README as ports, env vars, or startup behavior change.
- The frontend container runs the Vite dev server, not a production build served by e.g. nginx —
  this does not make the app deployable outside local use. Concrete gaps (production frontend
  build, env-based API URL config, hardening, etc.) are tracked in
  `doc/notes/productionization-tasks.md` and should be revisited if this app is ever deployed
  beyond local/personal use.
- Adds two Dockerfiles and a compose file to maintain, and Docker as an optional toolchain
  dependency for anyone using this path.
