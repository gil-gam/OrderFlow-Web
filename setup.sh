#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
WEB_DIR="$SCRIPT_DIR"
API_DIR="$PARENT_DIR/OrderFlow-Api"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC}  $1"; }

info "Checking prerequisites..."
command -v git    >/dev/null 2>&1 || { err "Git is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { err "Docker is required"; exit 1; }
command -v dotnet >/dev/null 2>&1 || { err ".NET 10 SDK is required"; exit 1; }
command -v node   >/dev/null 2>&1 || { err "Node.js 20+ is required"; exit 1; }

if [ ! -d "$API_DIR" ]; then
  info "Cloning OrderFlow-Api..."
  git clone https://github.com/gil-gam/OrderFlow-Api.git "$API_DIR"
else
  info "OrderFlow-Api exists. Pulling latest..."
  git -C "$API_DIR" pull --rebase
fi

info "Starting PostgreSQL..."
cd "$API_DIR"
docker compose up -d postgres

info "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  docker compose exec postgres pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 2
done

info "Applying migrations..."
dotnet ef database update \
  --project "$API_DIR/src/OrderFlow.Infrastructure" \
  --startup-project "$API_DIR/src/OrderFlow.Api"

info "Starting API on http://localhost:5220..."
dotnet run --project "$API_DIR/src/OrderFlow.Api" &
API_PID=$!
trap "kill $API_PID 2>/dev/null" EXIT
sleep 8

info "Installing frontend dependencies..."
cd "$WEB_DIR"
npm ci --legacy-peer-deps

info ""
info "  Frontend:  http://localhost:4200"
info "  API:       http://localhost:5220/swagger"
info "  Database:  localhost:5432"
info ""

npx ng serve --port 4200 --proxy-config proxy.conf.json
