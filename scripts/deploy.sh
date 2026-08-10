#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Sleekblue Media Houz — deploy from GitHub main
# Pulls latest code, installs deps, builds frontend, restarts PM2.
#
# Usage:
#   bash scripts/deploy.sh
# Optional:
#   SKIP_BACKUP=1 bash scripts/deploy.sh   # skip pre-deploy backup
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p logs
echo "[deploy] $(date -Iseconds) starting in $ROOT"

# 1) Safety backup (unless skipped)
if [ "${SKIP_BACKUP:-0}" != "1" ] && [ -f "$ROOT/scripts/backup.sh" ]; then
  echo "[deploy] running pre-deploy backup…"
  bash "$ROOT/scripts/backup.sh" || echo "[deploy] backup warned (continuing)"
fi

# 2) Latest code
BRANCH="${BRANCH:-main}"
echo "[deploy] git pull origin ${BRANCH}…"
git fetch origin "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

# 3) Dependencies
echo "[deploy] npm install…"
if [ -f package-lock.json ]; then
  npm ci --omit=dev || npm install --omit=dev
else
  npm install --omit=dev
fi

# 4) Frontend build
echo "[deploy] npm run build…"
npm run build

# 5) Ensure dirs exist
mkdir -p logs runtime uploads

# 6) Restart app (PM2)
echo "[deploy] restarting PM2…"
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe sleekblue >/dev/null 2>&1; then
    pm2 restart sleekblue --update-env
  elif [ -f "$ROOT/ecosystem.config.cjs" ]; then
    pm2 start "$ROOT/ecosystem.config.cjs"
  else
    pm2 start server.js --name sleekblue
  fi
  pm2 save || true
else
  echo "[deploy] WARNING: pm2 not found — start the app manually (npm start)"
fi

echo "[deploy] $(date -Iseconds) finished OK"

# ─── Post-deploy smoke test ─────────────────────────────────────────────────
# Verify the app is responding on the configured port. If the smoke test fails
# attempt an automatic rollback (if `scripts/rollback.sh` exists) and exit with
# a non-zero status so remote deploys are marked as failed.
PORT_TO_CHECK="${PORT:-3000}"
HEALTH_URL="http://127.0.0.1:${PORT_TO_CHECK}/api/health"
echo "[deploy] running post-deploy smoke test against ${HEALTH_URL}"
sleep 2
if curl -sSf --max-time 5 "${HEALTH_URL}" >/dev/null 2>&1; then
  echo "[deploy] smoke test passed"
else
  echo "[deploy] smoke test FAILED"
  if [ -x "$ROOT/scripts/rollback.sh" ] || [ -f "$ROOT/scripts/rollback.sh" ]; then
    echo "[deploy] attempting rollback using scripts/rollback.sh"
    bash "$ROOT/scripts/rollback.sh" || echo "[deploy] rollback script failed"
  else
    echo "[deploy] no rollback script found at $ROOT/scripts/rollback.sh"
  fi
  echo "[deploy] exiting with error due to failing smoke test"
  exit 1
fi
