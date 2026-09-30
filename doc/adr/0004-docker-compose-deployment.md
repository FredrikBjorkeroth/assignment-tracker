# 4. Docker Compose Deployment

Date: 2026-09-25

## Status

Accepted

## Context

Running the backend and frontend as separate local processes has no restart-on-crash, and an
awkward interruption (e.g. a killed terminal) can leave orphaned processes holding ports 8080 or
5173. A more robust way to run the full stack locally is needed.

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

## Consequences

- The frontend container runs the Vite dev server, not a production build served by e.g. nginx —
  this does not make the app deployable outside local use. Deploying it beyond local/personal
  use would first need further productionization work, such as a production frontend build,
  environment-based API URL configuration, and general hardening.
- Adds two Dockerfiles and a compose file to maintain, and Docker as an optional toolchain
  dependency for anyone using this path.
