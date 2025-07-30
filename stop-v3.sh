#!/bin/bash
# Android Dev Studio v3.0 - Stop Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }

echo -e "${YELLOW}🛑 Stopping Android Dev Studio v3.0...${NC}"

# Stop web server
pkill -f "node.*simple_server.js" 2>/dev/null || true
pkill -f "python.*http.server.*8083" 2>/dev/null || true

# Stop API backend  
pkill -f "python.*backend-v3.py" 2>/dev/null || true

# Clean up PID files
rm -f .pids 2>/dev/null || true

print_success "Android Dev Studio v3.0 stopped"
echo -e "${BLUE}👋 Thanks for using Android Dev Studio!${NC}"