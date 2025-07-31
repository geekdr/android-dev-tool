#!/bin/bash

echo "🔥 Android Dev Studio v4.0 - Inicializando Preview & Hot Reload"
echo "================================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    pkg install nodejs npm -y
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install express socket.io chokidar
fi

# Parar processos anteriores
echo "🛑 Parando processos anteriores..."
pkill -f "simple_server.js" 2>/dev/null || true
pkill -f "preview-server.js" 2>/dev/null || true

# Iniciar servidor principal
echo "🚀 Iniciando servidor principal na porta 8083..."
nohup node simple_server.js > server.log 2>&1 &
MAIN_PID=$!

# Aguardar um pouco
sleep 2

# Iniciar servidor de preview
echo "🔥 Iniciando servidor de preview na porta 8084..."
nohup node preview-server.js > preview.log 2>&1 &
PREVIEW_PID=$!

# Aguardar inicialização
sleep 3

# Verificar se os servidores estão rodando
if ps -p $MAIN_PID > /dev/null 2>&1; then
    echo "✅ Servidor principal rodando (PID: $MAIN_PID)"
else
    echo "❌ Falha ao iniciar servidor principal"
fi

if ps -p $PREVIEW_PID > /dev/null 2>&1; then
    echo "✅ Servidor de preview rodando (PID: $PREVIEW_PID)"
else
    echo "❌ Falha ao iniciar servidor de preview"
fi

# Salvar PIDs
echo $MAIN_PID > .main_server.pid
echo $PREVIEW_PID > .preview_server.pid

echo ""
echo "🌟 Android Dev Studio v4.0 com Hot Reload iniciado!"
echo ""
echo "📱 URLs de Acesso:"
echo "   • IDE Principal: http://127.0.0.1:8083"
echo "   • Preview Mobile: http://127.0.0.1:8084/preview"
echo "   • Preview de Rede: http://[SEU-IP]:8084/preview"
echo ""
echo "🔥 Hot Reload ativo - salve qualquer arquivo para atualizar automaticamente!"
echo ""
echo "📊 Para ver logs:"
echo "   • Servidor Principal: tail -f server.log"
echo "   • Servidor Preview: tail -f preview.log"
echo ""

# Tentar abrir navegador
if command -v termux-open-url &> /dev/null; then
    echo "🌐 Abrindo navegador..."
    termux-open-url "http://127.0.0.1:8083" 2>/dev/null &
elif command -v am &> /dev/null; then
    echo "🤖 Abrindo com Activity Manager..."
    am start -a android.intent.action.VIEW -d "http://127.0.0.1:8083" 2>/dev/null &
fi

echo "🎯 Android Dev Studio v4.0 com Hot Reload pronto para uso!"