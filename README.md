# 🔧 Android Dev Tool

Ferramenta completa para desenvolver e testar projetos React/Vite no Android (Termux).

## 📋 Características

- ✅ **Compatível com Android/Termux** - Funciona sem dependências externas
- ✅ **Interface amigável** - Menu colorido e intuitivo
- ✅ **Servidor de desenvolvimento** - Acesso via navegador Android
- ✅ **Build e testes** - Suporte completo ao workflow de desenvolvimento
- ✅ **Multiplos formatos** - Versões em Shell Script e Python

## 🚀 Instalação

1. **Baixe e extraia** o arquivo ZIP
2. **Torne executável:**
   ```bash
   chmod +x android-dev-tool.sh
   chmod +x android-dev-tool.py
   ```

3. **Execute:**
   ```bash
   ./android-dev-tool.sh
   ```

## 📖 Como Usar

### Menu Interativo
```bash
./android-dev-tool.sh
```

### Comandos Diretos
```bash
./android-dev-tool.sh info      # Informações do projeto
./android-dev-tool.sh install   # Instalar dependências  
./android-dev-tool.sh build     # Build do projeto
./android-dev-tool.sh dev       # Servidor de desenvolvimento
./android-dev-tool.sh serve     # Servir build estático
./android-dev-tool.sh test      # Executar testes
./android-dev-tool.sh lint      # Executar linter
```

## 🎯 Funcionalidades

### 1. 📊 Informações do Projeto
- Nome, versão e tipo do projeto
- Scripts disponíveis
- Lista de dependências principais

### 2. 📦 Gerenciamento de Dependências
- Instalação automática via npm
- Verificação de node_modules
- Detecção de problemas

### 3. 🔨 Build do Projeto
- Compilação TypeScript
- Build otimizado para produção
- Verificação de erros

### 4. 🚀 Servidor de Desenvolvimento
- Hot reload automático
- Acesso via `http://127.0.0.1:8080`
- Configuração para Android

### 5. 🌐 Servidor Estático
- Serve builds de produção
- Múltiplas opções de servidor
- Cache otimizado

### 6. 🧪 Testes e Qualidade
- Execução de testes automatizados
- Linting de código
- Relatórios detalhados

## 🔧 Configuração

A ferramenta funciona automaticamente com projetos React/Vite que tenham:
- `package.json` válido
- Estrutura padrão de diretórios
- Scripts npm configurados

### Diretório Padrão
```
/data/data/com.termux/files/home/gestao-financeira/
```

Para usar com outro projeto, edite a variável `PROJECT_DIR` no script.

## 📱 Acesso no Android

1. **Inicie o servidor:**
   ```bash
   ./android-dev-tool.sh dev
   ```

2. **Abra o navegador Android**

3. **Acesse:** `http://127.0.0.1:8080`

## 🐛 Resolução de Problemas

### Node.js não encontrado
```bash
pkg install nodejs npm
```

### Projeto não encontrado
Verifique se o caminho está correto ou edite `PROJECT_DIR` no script.

### Porta em uso
Edite a variável `PORT` no script para usar outra porta.

### Permissões
```bash
chmod +x android-dev-tool.sh
```

## 📄 Estrutura dos Arquivos

```
android-dev-tool-package/
├── README.md              # Este arquivo
├── android-dev-tool.sh    # Script principal (Shell)
├── android-dev-tool.py    # Versão Python (opcional)
├── INSTALL.md            # Guia de instalação
└── CHANGELOG.md          # Histórico de versões
```

## 🆔 Versões

- **Shell Script**: Recomendado, funciona em qualquer sistema
- **Python**: Requer Python 3.x instalado

## 📝 Licença

MIT License - Use livremente!

## 🤝 Contribuições

Contribuições são bem-vindas! Abra issues ou pull requests.

---

**Desenvolvido para Android/Termux** 📱