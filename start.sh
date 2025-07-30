#!/bin/bash
# Android Dev Tool v2.0 - Startup Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/data/data/com.termux/files/home/gestao-financeira"
WEB_PORT=8080
API_PORT=3002
TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print functions
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   🔧 Android Dev Tool v2.0                   ║"
    echo "║              Complete Development Environment                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔸 $1${NC}"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("nodejs")
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        missing_deps+=("python")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Install with: pkg install ${missing_deps[*]}"
        return 1
    fi
    
    print_success "All dependencies found"
    return 0
}

# Start web server
start_web_server() {
    print_step "Starting web interface..."
    
    cd "$TOOL_DIR"
    
    # Try different server options
    if command -v python3 &> /dev/null; then
        print_info "Using Python 3 HTTP server"
        python3 -m http.server $WEB_PORT --bind 0.0.0.0 &
        WEB_PID=$!
    elif command -v python &> /dev/null; then
        print_info "Using Python HTTP server"
        python -m http.server $WEB_PORT --bind 0.0.0.0 &
        WEB_PID=$!
    elif command -v npx &> /dev/null; then
        print_info "Using npx serve"
        npx serve -s . -l $WEB_PORT &
        WEB_PID=$!
    else
        print_error "No suitable web server found"
        return 1
    fi
    
    sleep 2
    
    if kill -0 $WEB_PID 2>/dev/null; then
        print_success "Web interface started on port $WEB_PORT"
        echo "WEB_PID=$WEB_PID" > .pids
        return 0
    else
        print_error "Failed to start web server"
        return 1
    fi
}

# Start API server
start_api_server() {
    print_step "Starting API backend..."
    
    cd "$TOOL_DIR"
    
    # Make backend executable
    chmod +x backend.py
    
    # Start backend server
    if command -v python3 &> /dev/null; then
        python3 backend.py &
        API_PID=$!
    elif command -v python &> /dev/null; then
        python backend.py &
        API_PID=$!
    else
        print_warning "Python not found, running without backend API"
        return 0
    fi
    
    sleep 3
    
    if kill -0 $API_PID 2>/dev/null; then
        print_success "API backend started on port $API_PORT"
        echo "API_PID=$API_PID" >> .pids
        return 0
    else
        print_warning "API backend failed to start (frontend will work in demo mode)"
        return 0
    fi
}

# Open browser
open_browser() {
    print_step "Opening browser..."
    
    local url="http://127.0.0.1:$WEB_PORT"
    
    # Try different browser opening methods
    if command -v termux-open-url &> /dev/null; then
        termux-open-url "$url"
        print_success "Opened with termux-open-url"
    elif command -v am &> /dev/null; then
        am start -a android.intent.action.VIEW -d "$url" &> /dev/null
        print_success "Opened with Android intent"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$url" &> /dev/null
        print_success "Opened with xdg-open"
    else
        print_info "Manual: Open $url in your browser"
    fi
}

# Show status
show_status() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                        🚀 STATUS                            ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 Web Interface:${NC}    http://127.0.0.1:$WEB_PORT"
    echo -e "${GREEN}📡 API Backend:${NC}      http://127.0.0.1:$API_PORT"
    echo -e "${GREEN}📂 Project Directory:${NC} $PROJECT_DIR"
    echo -e "${GREEN}🛠️  Tool Directory:${NC}   $TOOL_DIR"
    echo ""
    echo -e "${BLUE}📋 Features Available:${NC}"
    echo "   • 📊 Real-time project dashboard"
    echo "   • 🚀 One-click development server"
    echo "   • 🔨 Automated build process"
    echo "   • 🧪 Integrated testing"
    echo "   • 📝 Built-in code editor"
    echo "   • 🌐 Multi-platform deployment"
    echo "   • 🛠️  Multi-framework support"
    echo "   • 📱 Progressive Web App"
    echo "   • 🌙 Dark/Light theme"
    echo ""
    echo -e "${YELLOW}⌨️  Keyboard Shortcuts:${NC}"
    echo "   • Ctrl+B: Build project"
    echo "   • Ctrl+S: Start dev server"
    echo "   • Ctrl+T: Run tests"
    echo ""
    echo -e "${CYAN}⏹️  To stop: Press Ctrl+C or run ./stop.sh${NC}"
}

# Stop services
stop_services() {
    print_step "Stopping services..."
    
    if [ -f .pids ]; then
        source .pids
        
        if [ ! -z "$WEB_PID" ] && kill -0 $WEB_PID 2>/dev/null; then
            kill $WEB_PID
            print_success "Web server stopped"
        fi
        
        if [ ! -z "$API_PID" ] && kill -0 $API_PID 2>/dev/null; then
            kill $API_PID
            print_success "API server stopped"
        fi
        
        rm -f .pids
    fi
    
    # Kill any remaining servers on our ports
    pkill -f "python.*http.server.*$WEB_PORT" 2>/dev/null || true
    pkill -f "python.*backend.py" 2>/dev/null || true
    pkill -f "npx serve.*$WEB_PORT" 2>/dev/null || true
}

# Cleanup on exit
cleanup() {
    echo ""
    print_info "Cleaning up..."
    stop_services
    print_success "Android Dev Tool stopped"
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_header
    
    # Check if stopping
    if [ "$1" = "stop" ]; then
        stop_services
        exit 0
    fi
    
    # Check dependencies
    if ! check_dependencies; then
        exit 1
    fi
    
    # Stop any existing services
    stop_services
    
    # Start services
    if ! start_web_server; then
        exit 1
    fi
    
    start_api_server  # This can fail gracefully
    
    # Open browser
    open_browser
    
    # Show status
    show_status
    
    # Keep running
    print_info "Services running... Press Ctrl+C to stop"
    
    # Wait for interrupt
    while true; do
        sleep 1
        
        # Check if web server is still running
        if [ ! -z "$WEB_PID" ] && ! kill -0 $WEB_PID 2>/dev/null; then
            print_error "Web server stopped unexpectedly"
            exit 1
        fi
    done
}

# Run main function
main "$@"