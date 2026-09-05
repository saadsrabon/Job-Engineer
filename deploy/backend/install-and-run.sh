#!/usr/bin/env bash
set -euo pipefail
# JobOS backend bootstrap — run on the VPS as root from /backend
# Safe defaults: API 3011, Postgres 5433, Redis 6380 (localhost only)

BACKEND_ROOT="/backend"
REPO_DIR="${BACKEND_ROOT}/Job-Engineer"
REPO_URL="https://github.com/saadsrabon/Job-Engineer.git"
API_PORT="${JOBOS_API_PORT:-3011}"

log() { echo "[jobos-deploy] $*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "Missing command: $1"; exit 1; }
}

port_in_use() {
  ss -tln | awk '{print $4}' | grep -q ":${1}$"
}

pick_api_port() {
  local p="$1"
  while port_in_use "$p"; do
    log "Port $p busy, trying next..."
    p=$((p + 1))
  done
  echo "$p"
}

mkdir -p "$BACKEND_ROOT"
cd "$BACKEND_ROOT"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  log "Cloning repository..."
  git clone "$REPO_URL" "$REPO_DIR"
else
  log "Updating repository..."
  cd "$REPO_DIR"
  git fetch origin
  git pull --ff-only origin main
  cd "$BACKEND_ROOT"
fi

cd "$REPO_DIR"

if [[ ! -f .env ]]; then
  log "ERROR: Missing $REPO_DIR/.env — copy deploy/backend/env.production.example and fill secrets."
  exit 1
fi

# Install Node 20 + pnpm if missing
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]]; then
  log "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pnpm >/dev/null 2>&1; then
  log "Installing pnpm..."
  npm install -g pnpm@10.15.1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  log "Installing PM2..."
  npm install -g pm2
fi

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker..."
  apt-get update -qq
  apt-get install -y docker.io docker-compose-v2 || apt-get install -y docker.io docker-compose-plugin
  systemctl enable --now docker
fi

API_PORT="$(pick_api_port "$API_PORT")"
log "Using API port $API_PORT"

if grep -q '^PORT=' .env; then
  sed -i "s/^PORT=.*/PORT=${API_PORT}/" .env
else
  echo "PORT=${API_PORT}" >> .env
fi

POSTGRES_PASSWORD="$(grep -E '^DATABASE_URL=' .env | sed -n 's#.*://jobos:\([^@]*\)@.*#\1#p')"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-jobos_prod_change_me}"
export POSTGRES_PASSWORD

log "Starting Postgres + Redis (localhost 5433 / 6380)..."
docker compose -f deploy/backend/docker-compose.prod.yml up -d

log "Waiting for Postgres..."
for i in $(seq 1 30); do
  if docker exec jobos-postgres pg_isready -U jobos -d jobos >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

mkdir -p uploads

log "Installing dependencies..."
pnpm install --no-frozen-lockfile

log "Generating Prisma client..."
pnpm db:push

log "Building API, worker, and packages..."
pnpm exec turbo run build --filter=@jobos/api --filter=@jobos/worker

log "Starting PM2 processes..."
pm2 startOrReload deploy/backend/ecosystem.config.cjs --update-env
pm2 save

API_PUBLIC="${JOBOS_PUBLIC_API_URL:-http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}'):${API_PORT}}"

log "Done."
log "API listening on 0.0.0.0:${API_PORT} (paths under /api/v1)"
log "Set Vercel NEXT_PUBLIC_API_URL=${API_PUBLIC}"
log "Health check: curl -s ${API_PUBLIC}/api/v1/health || curl -s ${API_PUBLIC}/api/docs"
