#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-qa-gate.sh — 4-stage local QA gate (fail-fast)
# Usage: bash run-qa-gate.sh
# Runs: ESLint → Playwright E2E → Lighthouse CI → k6 Load Test
# Stops at the first failure and kills the background server.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SERVER_PID=""
STAGE=""
START_TIME=$(date +%s)
STAGE_TIMES=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo -e "\n${YELLOW}⏹  Stopping background server (PID $SERVER_PID)...${NC}"
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

log_stage() {
  STAGE="$1"
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  Stage: $STAGE${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

record_time() {
  local end=$(date +%s)
  local elapsed=$((end - STAGE_START))
  STAGE_TIMES+=("$STAGE: ${elapsed}s")
}

fail() {
  record_time
  echo ""
  echo -e "${RED}✗ FAILED at stage: $STAGE${NC}"
  print_summary "FAIL"
  exit 1
}

print_summary() {
  local result=$1
  local total_end=$(date +%s)
  local total=$((total_end - START_TIME))
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  if [ "$result" = "PASS" ]; then
    echo -e "${GREEN}  ✓ QA GATE: ALL STAGES PASSED${NC}"
  else
    echo -e "${RED}  ✗ QA GATE: FAILED${NC}"
  fi
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "  Stage Timings:"
  for t in "${STAGE_TIMES[@]}"; do
    echo "    → $t"
  done
  echo "    ─────────────────"
  echo "    Total: ${total}s"
  echo ""
}

# ─── Stage 1: ESLint ─────────────────────────────────────────────────────────
log_stage "1/4 — ESLint Static Analysis"
STAGE_START=$(date +%s)
npx eslint . || fail
record_time
echo -e "${GREEN}✓ ESLint passed${NC}"

# ─── Start background server for E2E, Lighthouse, and k6 ─────────────────────
echo ""
echo -e "${YELLOW}▶  Starting background server on port 3001...${NC}"

# Set JWT_SECRET for the server if not already set
export JWT_SECRET="${JWT_SECRET:-qa-test-secret-$(date +%s)}"

node server.js &
SERVER_PID=$!

# Wait for server to be ready (poll /api/settings or just check the port)
echo -n "   Waiting for server"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/settings > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}   ✓ Server ready (PID $SERVER_PID)${NC}"
    break
  fi
  echo -n "."
  sleep 1
  if [ "$i" -eq 30 ]; then
    echo ""
    echo -e "${RED}   ✗ Server failed to start within 30s${NC}"
    exit 1
  fi
done

# ─── Stage 2: Playwright E2E ─────────────────────────────────────────────────
log_stage "2/4 — Playwright E2E (Mobile Touch)"
STAGE_START=$(date +%s)
npx playwright test tests/checkout-mobile.spec.ts || fail
record_time
echo -e "${GREEN}✓ Playwright E2E passed${NC}"

# ─── Stage 3: Lighthouse CI ──────────────────────────────────────────────────
log_stage "3/4 — Lighthouse CI (Performance ≥ 0.90)"
STAGE_START=$(date +%s)
npx lhci autorun || fail
record_time
echo -e "${GREEN}✓ Lighthouse CI passed${NC}"

# ─── Stage 4: k6 Load Test ───────────────────────────────────────────────────
log_stage "4/4 — k6 Load Test (/api/cart)"
STAGE_START=$(date +%s)
k6 run load-test.js || fail
record_time
echo -e "${GREEN}✓ k6 Load Test passed${NC}"

# ─── All passed ──────────────────────────────────────────────────────────────
print_summary "PASS"
