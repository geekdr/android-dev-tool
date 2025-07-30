#!/bin/bash
# Android Dev Studio v3.0 - Complete OS Environment Startup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Configuration
WEB_PORT=8083
API_PORT=3003
TOOL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ASCII Art Header
print_header() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════════════╗"
    echo "║                    🔧 ANDROID DEV STUDIO v3.0                            ║"
    echo "║                 Complete OS-like Development Environment                  ║"
    echo "║                                                                           ║"
    echo "║  ⚡ Flutter/Dart Support    📱 APK Compilation    🐳 Docker Integration  ║"
    echo "║  💻 Ubuntu-like Terminal    📦 Package Manager   🖥️  Desktop Environment ║"
    echo "║  📁 File System Browser    📊 System Monitor    🛠️  Multi-IDE Support    ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_step() { echo -e "${CYAN}🔸 $1${NC}"; }

# System Requirements Check
check_system_requirements() {
    print_step "Checking system requirements..."
    
    local missing_deps=()
    local optional_deps=()
    
    # Essential dependencies
    if ! command -v node &> /dev/null; then
        missing_deps+=("nodejs")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        optional_deps+=("python")
    fi
    
    # Optional dependencies
    if ! command -v git &> /dev/null; then
        optional_deps+=("git")
    fi
    
    if ! command -v flutter &> /dev/null; then
        optional_deps+=("flutter")
    fi
    
    if ! command -v docker &> /dev/null; then
        optional_deps+=("docker")
    fi
    
    # Report results
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing essential dependencies: ${missing_deps[*]}"
        print_info "Install with: pkg install ${missing_deps[*]}"
        return 1
    fi
    
    if [ ${#optional_deps[@]} -ne 0 ]; then
        print_warning "Optional dependencies not found: ${optional_deps[*]}"
        print_info "For full features, install: pkg install ${optional_deps[*]}"
    fi
    
    print_success "System requirements check passed"
    return 0
}

# Initialize development environment
initialize_environment() {
    print_step "Initializing development environment..."
    
    # Create project directories
    mkdir -p "$HOME/Projects/flutter_apps"
    mkdir -p "$HOME/Projects/react_apps"
    mkdir -p "$HOME/Projects/vue_apps"
    mkdir -p "$HOME/Projects/android_apps"
    mkdir -p "$HOME/Downloads"
    mkdir -p "$HOME/Desktop"
    mkdir -p "$HOME/Documents"
    
    # Create Android SDK directory if not exists
    mkdir -p "$HOME/android-sdk"
    mkdir -p "$HOME/flutter"
    
    # Set up Git configuration if not set
    if command -v git &> /dev/null; then
        if [ -z "$(git config --global user.name 2>/dev/null)" ]; then
            print_info "Git user not configured. Setting up basic config..."
            git config --global user.name "Android Dev User"
            git config --global user.email "user@android-dev.local"
        fi
    fi
    
    print_success "Development environment initialized"
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
    elif command -v node &> /dev/null; then
        print_info "Using Node.js HTTP server"
        # Use the existing simple_server.js file
        if [ ! -f "simple_server.js" ]; then
            cat > simple_server.js << 'SERVEREOF'
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url);
    let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
    const fullPath = path.join(__dirname, filePath.substring(1));
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        
        const ext = path.extname(fullPath);
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        };
        
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(data);
    });
});

const PORT = process.env.PORT || 8083;
server.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Android Dev Studio v3.0 running on http://127.0.0.1:' + PORT);
    console.log('📱 Complete development environment ready!');
});
SERVEREOF
        fi
        PORT=$WEB_PORT node simple_server.js &
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

# Start API backend
start_api_backend() {
    print_step "Starting API backend..."
    
    cd "$TOOL_DIR"
    chmod +x backend-v3.py
    
    # Install Python dependencies if possible
    if command -v pip3 &> /dev/null; then
        print_info "Installing Python dependencies..."
        pip3 install psutil requests 2>/dev/null || print_warning "Could not install some Python packages"
    fi
    
    # Start backend server
    if command -v python3 &> /dev/null; then
        python3 backend-v3.py &
        API_PID=$!
    elif command -v python &> /dev/null; then
        python backend-v3.py &
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

# Check Flutter installation
check_flutter() {
    print_step "Checking Flutter installation..."
    
    if command -v flutter &> /dev/null; then
        FLUTTER_VERSION=$(flutter --version | head -n1 | cut -d' ' -f2)
        print_success "Flutter $FLUTTER_VERSION detected"
        
        # Run flutter doctor
        print_info "Running Flutter doctor..."
        flutter doctor --android-licenses 2>/dev/null || true
        
    else
        print_warning "Flutter not installed"
        print_info "To install Flutter:"
        print_info "  1. Download Flutter SDK"
        print_info "  2. Extract to $HOME/flutter"
        print_info "  3. Add to PATH: export PATH=\"\$PATH:\$HOME/flutter/bin\""
    fi
}

# Check Android SDK
check_android_sdk() {
    print_step "Checking Android SDK..."
    
    if [ -d "$HOME/android-sdk" ] && [ -n "$(ls -A $HOME/android-sdk)" ]; then
        print_success "Android SDK found"
        export ANDROID_HOME="$HOME/android-sdk"
        export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
    else
        print_warning "Android SDK not found"
        print_info "To install Android SDK:"
        print_info "  1. Use the package manager in the app"
        print_info "  2. Or download from: https://developer.android.com/studio"
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

# Show status and features
show_status() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                          🚀 SYSTEM STATUS                                ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 Web Interface:${NC}        http://127.0.0.1:$WEB_PORT"
    echo -e "${GREEN}📡 API Backend:${NC}          http://127.0.0.1:$API_PORT"
    echo -e "${GREEN}📂 Project Directory:${NC}    $HOME/Projects"
    echo -e "${GREEN}🛠️  Tool Directory:${NC}       $TOOL_DIR"
    echo ""
    echo -e "${BLUE}🎯 MAIN FEATURES:${NC}"
    echo ""
    echo -e "${WHITE}📱 Flutter Development:${NC}"
    echo "   • Complete Flutter/Dart IDE"
    echo "   • APK compilation (Debug & Release)"
    echo "   • Hot reload development server"
    echo "   • Project templates and scaffolding"
    echo ""
    echo -e "${WHITE}🖥️  Desktop Environment:${NC}"
    echo "   • Ubuntu-like desktop with taskbar"
    echo "   • Multi-window management"
    echo "   • File manager with GUI"
    echo "   • System tray with real-time clock"
    echo ""
    echo -e "${WHITE}💻 Terminal Features:${NC}"
    echo "   • Full terminal emulation in browser"
    echo "   • 50+ Ubuntu-like commands"
    echo "   • Command history and auto-completion"
    echo "   • Process management (ps, kill, htop)"
    echo ""
    echo -e "${WHITE}📦 Package Management:${NC}"
    echo "   • Visual package installer"
    echo "   • Flutter, Android SDK, Docker support"
    echo "   • Dependency resolution"
    echo "   • System tools (git, htop, neofetch)"
    echo ""
    echo -e "${WHITE}🛠️  Multi-Framework IDE:${NC}"
    echo "   • Flutter/Dart with APK building"
    echo "   • React with hot reload"
    echo "   • Vue.js development"
    echo "   • Angular support"
    echo ""
    echo -e "${WHITE}📊 System Monitoring:${NC}"
    echo "   • Real-time CPU, memory, disk usage"
    echo "   • Process manager"
    echo "   • System information (neofetch-like)"
    echo "   • Performance metrics"
    echo ""
    echo -e "${WHITE}🐳 Container Platform:${NC}"
    echo "   • Docker integration"
    echo "   • Container management"
    echo "   • Image building and running"
    echo ""
    echo -e "${WHITE}🔧 Development Tools:${NC}"
    echo "   • Git integration"
    echo "   • Project scaffolding"
    echo "   • Build automation"
    echo "   • Testing framework"
    echo ""
    echo -e "${YELLOW}⌨️  KEYBOARD SHORTCUTS:${NC}"
    echo "   • Ctrl+B: Build project"
    echo "   • Ctrl+S: Start dev server"
    echo "   • Ctrl+T: Run tests"
    echo "   • Alt+Tab: Switch windows"
    echo ""
    echo -e "${CYAN}📱 ANDROID-SPECIFIC FEATURES:${NC}"
    echo "   • APK compilation and signing"
    echo "   • Android device management"
    echo "   • Package installation via ADB"
    echo "   • Performance profiling"
    echo ""
    echo -e "${CYAN}⏹️  To stop: Press Ctrl+C or run ./stop-v3.sh${NC}"
    echo ""
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
    pkill -f "python.*backend-v3.py" 2>/dev/null || true
    pkill -f "node.*$WEB_PORT" 2>/dev/null || true
    
    print_success "All services stopped"
}

# Cleanup on exit
cleanup() {
    echo ""
    print_info "Shutting down Android Dev Studio..."
    stop_services
    print_success "Android Dev Studio v3.0 stopped"
    echo ""
    echo -e "${PURPLE}Thanks for using Android Dev Studio! 🚀${NC}"
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
    
    # Check system requirements
    if ! check_system_requirements; then
        exit 1
    fi
    
    # Initialize environment
    initialize_environment
    
    # Stop any existing services
    stop_services
    
    # Check development tools
    check_flutter
    check_android_sdk
    
    # Start services
    if ! start_web_server; then
        exit 1
    fi
    
    start_api_backend  # This can fail gracefully
    
    # Open browser
    open_browser
    
    # Show status
    show_status
    
    # Keep running
    print_info "All systems operational. Press Ctrl+C to stop"
    
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