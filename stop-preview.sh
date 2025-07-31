#!/bin/bash

echo "🛑 Parando Android Dev Studio v4.0 com Preview..."

# Parar processos usando PIDs salvos
if [ -f ".main_server.pid" ]; then
    MAIN_PID=$(cat .main_server.pid)
    if ps -p $MAIN_PID > /dev/null 2>&1; then
        kill $MAIN_PID
        echo "✅ Servidor principal parado (PID: $MAIN_PID)"
    fi
    rm -f .main_server.pid
fi

if [ -f ".preview_server.pid" ]; then
    PREVIEW_PID=$(cat .preview_server.pid)
    if ps -p $PREVIEW_PID > /dev/null 2>&1; then
        kill $PREVIEW_PID
        echo "✅ Servidor de preview parado (PID: $PREVIEW_PID)"
    fi
    rm -f .preview_server.pid
fi

# Parar qualquer processo relacionado (fallback)
pkill -f "simple_server.js" 2>/dev/null && echo "🔧 Processo simple_server.js parado"
pkill -f "preview-server.js" 2>/dev/null && echo "🔥 Processo preview-server.js parado"
pkill -f "flutter run" 2>/dev/null && echo "📱 Processo Flutter parado"

echo "✅ Todos os serviços foram parados"