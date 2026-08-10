#!/usr/bin/env bash
set -euo pipefail

# Sleekblue Media Houz — rollback to most recent backup
# Restores site-data.json, runtime/, and uploads/ from the latest dated
# directory in backups/, then restarts the app via PM2 if available.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -d "$ROOT/backups" ]; then
  echo "[rollback] no backups directory found at $ROOT/backups"
  exit 1
fi

LATEST_DIR=$(ls -1dt "$ROOT/backups"/*/ 2>/dev/null | head -n1 || true)
if [ -z "$LATEST_DIR" ]; then
  echo "[rollback] no dated backups found in $ROOT/backups"
  exit 1
fi

echo "[rollback] restoring from $LATEST_DIR"

# Restore top-level site-data.json
if [ -f "$LATEST_DIR/site-data.json" ]; then
  cp "$LATEST_DIR/site-data.json" "$ROOT/site-data.json"
  echo "[rollback] restored site-data.json"
else
  echo "[rollback] no site-data.json in backup (skipped)"
fi

# Restore runtime directory
if [ -d "$LATEST_DIR/runtime" ]; then
  rm -rf "$ROOT/runtime" || true
  cp -r "$LATEST_DIR/runtime" "$ROOT/runtime"
  echo "[rollback] restored runtime/"
else
  echo "[rollback] no runtime/ in backup (skipped)"
fi

# Restore uploads directory
if [ -d "$LATEST_DIR/uploads" ]; then
  rm -rf "$ROOT/uploads" || true
  cp -r "$LATEST_DIR/uploads" "$ROOT/uploads"
  echo "[rollback] restored uploads/"
else
  echo "[rollback] no uploads/ in backup (skipped)"
fi

# Restart the app with PM2 if available
if command -v pm2 >/dev/null 2>&1; then
  echo "[rollback] restarting app via pm2"
  if pm2 describe sleekblue >/dev/null 2>&1; then
    pm2 restart sleekblue --update-env || true
  elif [ -f "$ROOT/ecosystem.config.cjs" ]; then
    pm2 start "$ROOT/ecosystem.config.cjs" || true
  else
    pm2 start server.js --name sleekblue || true
  fi
  pm2 save || true
else
  echo "[rollback] pm2 not installed — please restart the app manually"
fi

echo "[rollback] completed"
