#!/bin/bash
#
# MCI Application Status
# INV-002: System Lifecycle Discipline
#
# Reports the current state of all MCI application processes.
#
# Usage: ./scripts/status.sh
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$APP_DIR/.mci-pids"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    MCI APPLICATION STATUS                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check Frontend (Port 5173)
echo -n "Frontend (Vite on :5173):    "
if lsof -i :5173 >/dev/null 2>&1; then
    pid=$(lsof -ti :5173 | head -1)
    echo -e "${GREEN}RUNNING${NC} (PID: $pid)"
else
    echo -e "${RED}STOPPED${NC}"
fi

# Check Backend (Port 3000)
echo -n "Backend (Bun on :3000):      "
if lsof -i :3000 >/dev/null 2>&1; then
    pid=$(lsof -ti :3000 | head -1)
    echo -e "${GREEN}RUNNING${NC} (PID: $pid)"
else
    echo -e "${RED}STOPPED${NC}"
fi

# Check Health Endpoint
echo -n "Backend Health:              "
if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}HEALTHY${NC}"
else
    echo -e "${RED}UNHEALTHY${NC}"
fi

# Check PID File
echo -n "PID File:                    "
if [ -f "$PID_FILE" ]; then
    echo -e "${GREEN}EXISTS${NC}"
else
    echo -e "${YELLOW}NOT FOUND${NC}"
fi

# Summary
echo ""
echo "──────────────────────────────────────────────────────────────────"

frontend_up=$(lsof -i :5173 >/dev/null 2>&1 && echo "1" || echo "0")
backend_up=$(lsof -i :3000 >/dev/null 2>&1 && echo "1" || echo "0")

if [ "$frontend_up" = "1" ] && [ "$backend_up" = "1" ]; then
    echo -e "Overall Status: ${GREEN}APPLICATION RUNNING${NC}"
    echo "Access at: http://localhost:5173"
elif [ "$frontend_up" = "0" ] && [ "$backend_up" = "0" ]; then
    echo -e "Overall Status: ${RED}APPLICATION STOPPED${NC}"
    echo "Start with: ./scripts/start.sh"
else
    echo -e "Overall Status: ${YELLOW}PARTIAL (INCONSISTENT STATE)${NC}"
    echo "Stop and restart: ./scripts/stop.sh && ./scripts/start.sh"
fi

echo ""
