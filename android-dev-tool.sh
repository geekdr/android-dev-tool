#!/bin/bash
# Ferramenta Android para visualizar e testar projetos React/Vite
# Funciona no Termux sem Python

PROJECT_DIR="/data/data/com.termux/files/home/gestao-financeira"
PORT=8080

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

check_project() {
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Projeto não encontrado!"
        return 1
    fi
    
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        print_error "package.json não encontrado!"
        return 1
    fi
    
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        print_warning "node_modules não encontrado. Execute: instalar dependências"
        return 1
    fi
    
    print_success "Projeto válido encontrado!"
    return 0
}

install_dependencies() {
    print_info "Instalando dependências..."
    cd "$PROJECT_DIR" || exit 1
    
    if npm install; then
        print_success "Dependências instaladas com sucesso!"
        return 0
    else
        print_error "Erro ao instalar dependências"
        return 1
    fi
}

build_project() {
    print_info "Fazendo build do projeto..."
    cd "$PROJECT_DIR" || exit 1
    
    if npm run build; then
        print_success "Build concluído com sucesso!"
        return 0
    else
        print_error "Erro no build"
        return 1
    fi
}

start_dev_server() {
    print_info "Iniciando servidor de desenvolvimento..."
    cd "$PROJECT_DIR" || exit 1
    
    print_success "Servidor iniciado em http://localhost:$PORT"
    print_info "📱 Acesse no navegador Android: http://127.0.0.1:$PORT"
    
    npm run dev -- --host 0.0.0.0 --port $PORT
}

serve_build() {
    if [ ! -d "$PROJECT_DIR/dist" ]; then
        print_error "Diretório dist não encontrado. Execute o build primeiro."
        return 1
    fi
    
    print_info "Servindo build estático na porta $PORT..."
    cd "$PROJECT_DIR/dist" || exit 1
    
    print_success "Servidor estático rodando em http://localhost:$PORT"
    print_info "📱 Acesse no navegador Android: http://127.0.0.1:$PORT"
    print_info "⏹️  Pressione Ctrl+C para parar"
    
    # Serve usando npx se disponível, senão usa python se disponível
    if command -v npx >/dev/null 2>&1; then
        npx serve -s . -l $PORT
    elif command -v python3 >/dev/null 2>&1; then
        python3 -m http.server $PORT
    elif command -v python >/dev/null 2>&1; then
        python -m http.server $PORT
    else
        print_error "Nenhum servidor HTTP disponível"
        return 1
    fi
}

run_tests() {
    print_info "Verificando testes..."
    cd "$PROJECT_DIR" || exit 1
    
    if grep -q '"test"' package.json; then
        print_info "Executando testes..."
        npm test
    else
        print_warning "Nenhum script de teste configurado."
    fi
}

lint_project() {
    print_info "Executando linter..."
    cd "$PROJECT_DIR" || exit 1
    
    if npm run lint; then
        print_success "Código está limpo!"
    else
        print_warning "Problemas encontrados no linter"
    fi
}

show_project_info() {
    echo ""
    echo "=========================================="
    echo "📊 INFORMAÇÕES DO PROJETO"
    echo "=========================================="
    
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" || exit 1
        
        echo "Nome: $(node -p "require('./package.json').name" 2>/dev/null || echo "N/A")"
        echo "Versão: $(node -p "require('./package.json').version" 2>/dev/null || echo "N/A")"
        echo "Tipo: $(node -p "require('./package.json').type" 2>/dev/null || echo "N/A")"
        
        echo ""
        echo "📋 Scripts disponíveis:"
        if command -v jq >/dev/null 2>&1; then
            jq -r '.scripts | to_entries[] | "  • \(.key): \(.value)"' package.json 2>/dev/null
        else
            grep -A 10 '"scripts"' package.json | grep -E '    ".*":' | head -10
        fi
        
        echo ""
        echo "📦 Algumas dependências:"
        if command -v jq >/dev/null 2>&1; then
            jq -r '.dependencies | keys[] | "  • " + .' package.json 2>/dev/null | head -5
        else
            grep -A 20 '"dependencies"' package.json | grep -E '    ".*":' | head -5 | sed 's/.*"\([^"]*\)".*/  • \1/'
        fi
    else
        print_error "package.json não encontrado"
    fi
}

open_browser() {
    print_info "Tentando abrir navegador..."
    
    # Tenta abrir diferentes navegadores do Android
    for browser in "am start -a android.intent.action.VIEW -d" "termux-open-url" "xdg-open"; do
        if command -v ${browser%% *} >/dev/null 2>&1; then
            $browser "http://127.0.0.1:$PORT" 2>/dev/null && break
        fi
    done
}

show_menu() {
    while true; do
        echo ""
        echo "=================================================="
        echo "🔧 FERRAMENTA DE DESENVOLVIMENTO ANDROID"
        echo "=================================================="
        echo "1. 📊 Informações do projeto"
        echo "2. 📦 Instalar dependências"
        echo "3. 🔨 Build do projeto"
        echo "4. 🚀 Servidor de desenvolvimento"
        echo "5. 🌐 Servir build estático"
        echo "6. 🧪 Executar testes"
        echo "7. 🧹 Executar linter"
        echo "8. 🌐 Abrir navegador"
        echo "9. 🚪 Sair"
        echo "--------------------------------------------------"
        
        read -p "Escolha uma opção (1-9): " choice
        
        case $choice in
            1) show_project_info ;;
            2) install_dependencies ;;
            3) build_project ;;
            4) 
                if check_project; then
                    start_dev_server
                fi
                ;;
            5) serve_build ;;
            6) run_tests ;;
            7) lint_project ;;
            8) open_browser ;;
            9) 
                echo "👋 Até logo!"
                exit 0
                ;;
            *) print_error "Opção inválida!" ;;
        esac
        
        echo ""
        read -p "Pressione Enter para continuar..."
    done
}

# Execução principal
case "${1:-menu}" in
    "info") show_project_info ;;
    "install") install_dependencies ;;
    "build") build_project ;;
    "dev") start_dev_server ;;
    "serve") serve_build ;;
    "test") run_tests ;;
    "lint") lint_project ;;
    "browser") open_browser ;;
    "menu"|*) show_menu ;;
esac