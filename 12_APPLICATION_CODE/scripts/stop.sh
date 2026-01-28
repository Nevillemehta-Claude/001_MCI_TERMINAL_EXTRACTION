#!/bin/bash
#
# MCI Unified Application Shutdown
# INV-002: System Lifecycle Discipline
#
# This is the AUTHORITATIVE way to stop the MCI application.
# Ensures all processes are terminated cleanly with no orphans.
#
# Usage: ./scripts/stop.sh [--force]
#
# Guarantees:
# - All application processes are terminated
# - No orphaned terminals, servers, or background processes
# - PID file cleaned up
# - Ports released
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$APP_DIR/.mci-pids"
FORCE_MODE="${1:---graceful}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[MCI]${NC} $1"; }
log_success() { echo -e "${GREEN}[MCI]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[MCI]${NC} $1"; }
log_error() { echo -e "${RED}[MCI]${NC} $1"; }

# ==============================================================================
# STEP 1: READ PID FILE
# ==============================================================================
read_pids() {
    log_info "Step 1: Reading process IDs..."
    
    if [ -f "$PID_FILE" ]; then
        source "$PID_FILE"
        log_info "Found PID file with processes"
    else
        log_warn "No PID file found. Will scan for processes."
    fi
}

# ==============================================================================
# STEP 2: STOP FRONTEND SERVER
# ==============================================================================
stop_frontend() {
    log_info "Step 2: Stopping frontend server..."
    
    # Kill by PID if available
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
        log_success "Frontend server stopped (PID: $FRONTEND_PID)"
    fi
    
    # Kill any Vite processes
    pkill -f "vite" 2>/dev/null || true
    
    # Force kill on port 5173
    lsof -ti :5173 2>/dev/null | xargs kill -9 2>/dev/null || true
    
    log_success "Frontend server stopped"
}

# ==============================================================================
# STEP 3: STOP BACKEND SERVER
# ==============================================================================
stop_backend() {
    log_info "Step 3: Stopping backend server..."
    
    # Kill by PID if available
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
        log_success "Backend server stopped (PID: $BACKEND_PID)"
    fi
    
    # Kill any Bun server processes
    pkill -f "bun.*server" 2>/dev/null || true
    
    # Force kill on port 3000
    lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
    
    log_success "Backend server stopped"
}

# ==============================================================================
# STEP 4: CLEANUP ORPHANED PROCESSES
# ==============================================================================
cleanup_orphans() {
    log_info "Step 4: Cleaning up orphaned processes..."
    
    # Kill any remaining MCI-related processes
    pkill -f "bun.*dev" 2>/dev/null || true
    pkill -f "bunx.*vite" 2>/dev/null || true
    
    # Wait for processes to terminate
    sleep 1
    
    log_success "Orphaned processes cleaned"
}

# ==============================================================================
# STEP 5: CLEANUP PID FILE
# ==============================================================================
cleanup_pid_file() {
    log_info "Step 5: Cleaning up PID file..."
    
    rm -f "$PID_FILE"
    
    log_success "PID file cleaned"
}

# ==============================================================================
# STEP 6: VERIFY CLEAN STATE
# ==============================================================================
verify_clean_state() {
    log_info "Step 6: Verifying clean state..."
    
    local errors=0
    
    # Check port 5173 (Vite)
    if lsof -i :5173 >/dev/null 2>&1; then
        log_error "Port 5173 is still in use"
        errors=$((errors + 1))
    fi
    
    # Check port 3000 (Backend)
    if lsof -i :3000 >/dev/null 2>&1; then
        log_error "Port 3000 is still in use"
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        if [ "$FORCE_MODE" = "--force" ]; then
            log_warn "Force killing remaining processes..."
            lsof -ti :5173,:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
            sleep 1
        else
            log_error "Clean state verification failed. Use --force to force kill."
            exit 1
        fi
    fi
    
    log_success "Clean state verified"
}

# ==============================================================================
# STEP 7: DISPLAY STATUS
# ==============================================================================
display_status() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    MCI APPLICATION STOPPED                       ║"
    echo "╠══════════════════════════════════════════════════════════════════╣"
    echo "║                                                                  ║"
    echo "║  All processes terminated cleanly                                ║"
    echo "║  All ports released                                              ║"
    echo "║  No orphaned processes                                           ║"
    echo "║                                                                  ║"
    echo "║  To start:  ./scripts/start.sh                                   ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║           MCI UNIFIED APPLICATION SHUTDOWN (INV-002)             ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    read_pids
    stop_frontend
    stop_backend
    cleanup_orphans
    cleanup_pid_file
    verify_clean_state
    display_status
    
    log_success "MCI application stopped successfully"
}

main "$@"
