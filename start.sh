#!/usr/bin/env bash
# Starts the backend and frontend dev servers, then opens the frontend in a browser.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:5173"

pids=()
cleanup() {
  trap - EXIT INT TERM
  echo
  echo "Shutting down..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local name="$2"
  local attempts=60
  until curl -s -o /dev/null "$url"; do
    attempts=$((attempts - 1))
    if [ "$attempts" -le 0 ]; then
      echo "Timed out waiting for $name at $url" >&2
      exit 1
    fi
    sleep 1
  done
}

echo "Starting backend..."
(cd "$ROOT_DIR/backend" && ./gradlew bootRun) &
pids+=("$!")

echo "Waiting for backend at $BACKEND_URL..."
wait_for_url "$BACKEND_URL/api/assignments" "backend"

echo "Starting frontend..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
pids+=("$!")

echo "Waiting for frontend at $FRONTEND_URL..."
wait_for_url "$FRONTEND_URL" "frontend"

echo "Opening $FRONTEND_URL in browser..."
if command -v open >/dev/null 2>&1; then
  open "$FRONTEND_URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FRONTEND_URL"
else
  echo "Could not detect a command to open the browser; visit $FRONTEND_URL manually."
fi

echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "Press Ctrl+C to stop both servers."

wait
