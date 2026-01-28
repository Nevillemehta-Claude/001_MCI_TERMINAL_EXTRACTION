#!/bin/bash
#
# MCI Unified Application Launcher
# INV-002: System Lifecycle Discipline
#
# This is the AUTHORITATIVE way to start the MCI application.
# All other start methods are subordinate to this script.
#
# Usage: ./scripts/start.sh [--dev|--prod]
#
# Guarantees:
# - All required processes are started in correct order
# - No orphaned or residual processes from previous runs
# - Clean state verified before launch
# - Single point of control for all lifecycle operations
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
MODE="${1:---dev}"
PID_FILE="$APP_DIR/.mci-pids"
LOG_DIR="$APP_DIR/logs"

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
# STEP 1: FORENSIC CLEANUP - Kill any residual processes
# ==============================================================================
cleanup_residual_processes() {
    log_info "Step 1: Cleaning up residual processes..."
    
    # Kill any existing Vite dev servers
    pkill -f "vite" 2>/dev/null || true
    
    # Kill any existing Bun servers on our ports
    pkill -f "bun.*server" 2>/dev/null || true
    
    # Kill processes on our ports
    lsof -ti :5173 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
    
    # Remove stale PID file
    rm -f "$PID_FILE"
    
    # Wait for processes to terminate
    sleep 1
    
    log_success "Residual processes cleaned"
}

# ==============================================================================
# STEP 2: VERIFY CLEAN STATE
# ==============================================================================
verify_clean_state() {
    log_info "Step 2: Verifying clean state..."
    
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
        log_error "Clean state verification failed. Cannot proceed."
        exit 1
    fi
    
    log_success "Clean state verified"
}

# ==============================================================================
# STEP 3: PREPARE ENVIRONMENT
# ==============================================================================
prepare_environment() {
    log_info "Step 3: Preparing environment..."
    
    cd "$APP_DIR"
    
    # Create log directory if needed
    mkdir -p "$LOG_DIR"
    
    # Verify dependencies are installed
    if [ ! -d "node_modules" ]; then
        log_warn "Dependencies not installed. Running bun install..."
        bun install
    fi
    
    log_success "Environment prepared"
}

# ==============================================================================
# STEP 4: START BACKEND SERVER
# ==============================================================================
start_backend() {
    log_info "Step 4: Starting backend server..."
    
    cd "$APP_DIR"
    
    # Start backend server
    bun run server > "$LOG_DIR/backend.log" 2>&1 &
    local backend_pid=$!
    
    echo "BACKEND_PID=$backend_pid" >> "$PID_FILE"
    
    # Wait for backend to be ready
    local retries=0
    while ! curl -s http://localhost:3000/api/health >/dev/null 2>&1; do
        retries=$((retries + 1))
        if [ $retries -gt 30 ]; then
            log_error "Backend failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
    
    log_success "Backend server started (PID: $backend_pid)"
}

# ==============================================================================
# STEP 5: START FRONTEND SERVER
# ==============================================================================
start_frontend() {
    log_info "Step 5: Starting frontend server..."
    
    cd "$APP_DIR"
    
    if [ "$MODE" = "--dev" ]; then
        # Development mode: Vite dev server
        bun run dev > "$LOG_DIR/frontend.log" 2>&1 &
        local frontend_pid=$!
        echo "FRONTEND_PID=$frontend_pid" >> "$PID_FILE"
        
        # Wait for Vite to be ready
        local retries=0
        while ! curl -s http://localhost:5173 >/dev/null 2>&1; do
            retries=$((retries + 1))
            if [ $retries -gt 30 ]; then
                log_error "Frontend failed to start within 30 seconds"
                exit 1
            fi
            sleep 1
        done
        
        log_success "Frontend dev server started (PID: $frontend_pid)"
        log_info "Application available at: http://localhost:5173"
    else
        # Production mode: Built assets
        log_info "Production mode: Building assets..."
        bun run build
        log_success "Production build complete"
        log_info "Serve the 'dist' directory with your preferred static server"
    fi
}

# ==============================================================================
# STEP 6: DISPLAY STATUS
# ==============================================================================
display_status() {
    log_info "Step 6: Application status..."
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    MCI APPLICATION STARTED                       ║"
    echo "╠══════════════════════════════════════════════════════════════════╣"
    echo "║                                                                  ║"
    echo "║  Mode:     $(printf '%-54s' "$MODE")║"
    echo "║  Frontend: $(printf '%-54s' "http://localhost:5173")║"
    echo "║  Backend:  $(printf '%-54s' "http://localhost:3000")║"
    echo "║  Health:   $(printf '%-54s' "http://localhost:3000/api/health")║"
    echo "║                                                                  ║"
    echo "║  To stop:  ./scripts/stop.sh                                     ║"
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
    echo "║           MCI UNIFIED APPLICATION LAUNCHER (INV-002)             ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    cleanup_residual_processes
    verify_clean_state
    prepare_environment
    start_backend
    start_frontend
    display_status
    
    log_success "MCI application launched successfully"
}

main "$@"
