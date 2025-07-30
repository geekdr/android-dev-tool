# 🔧 Android Dev Tool v2.0

> **Complete Development Environment for Android/Termux**

Uma ferramenta avançada e completa para desenvolvimento React/Vite (e outros frameworks) no Android usando Termux. Interface web moderna, PWA, editor integrado, deploy automático e muito mais!

## ✨ Novidades da v2.0

### 🎨 **Interface Web Moderna**
- Dashboard visual com métricas em tempo real
- Tema claro/escuro com transições suaves
- Design responsivo otimizado para mobile
- PWA instalável como app nativo

### 🚀 **Funcionalidades Avançadas**
- **Editor de código integrado** com syntax highlighting
- **Deploy automático** para Vercel, Netlify, GitHub Pages, Firebase
- **Análise de bundle** com métricas detalhadas
- **Suporte multi-framework** (React, Vue, Angular, Svelte, Next.js)
- **Servidor de desenvolvimento** com hot reload
- **Sistema de logs** em tempo real com exportação

### 📊 **Análise e Métricas**
- Análise de dependências e vulnerabilidades
- Métricas de performance (bundle size, build time)
- Lighthouse score integration
- Cobertura de testes

### 🛠️ **DevOps Integrado**
- API REST completa para automação
- Service Worker para funcionalidade offline
- Shortcuts de teclado para ações rápidas
- Notificações push (planejado)

## 📦 Instalação

### Pré-requisitos
```bash
# Atualize o Termux
pkg update && pkg upgrade

# Instale dependências
pkg install nodejs npm python git
```

### Instalação Rápida
```bash
# Clone ou baixe a ferramenta
cd /data/data/com.termux/files/home
unzip android-dev-tool-v2.zip

# Torne executável
chmod +x android-dev-tool-v2/start.sh

# Execute
./android-dev-tool-v2/start.sh
```

## 🚀 Como Usar

### Inicio Rápido
```bash
# Inicie a ferramenta
./start.sh

# Acesse no navegador
# http://127.0.0.1:8080
```

### Principais Funcionalidades

#### 📊 **Dashboard**
- Status do projeto em tempo real
- Métricas de performance
- Controles rápidos para build, test, deploy

#### 🔥 **Servidor de Desenvolvimento**
- Hot reload automático
- Proxy para APIs
- Otimizado para Android

#### 🔨 **Build e Deploy**
- Build otimizado para produção
- Deploy one-click para múltiplas plataformas
- Análise de bundle size

#### 📝 **Editor Integrado**
- Syntax highlighting
- File explorer
- Auto-save
- Integração com Git

#### 🧪 **Testes**
- Execução de testes automática
- Relatórios de cobertura
- Integração com CI/CD

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+B` | Build projeto |
| `Ctrl+S` | Start dev server |
| `Ctrl+T` | Executar testes |

## 🛠️ Frameworks Suportados

### ⚛️ **React**
```bash
# Criar novo projeto React
npm create vite@latest my-app -- --template react-ts
```

### 💚 **Vue.js**
```bash
# Criar novo projeto Vue
npm create vue@latest my-app
```

### 🅰️ **Angular**
```bash
# Criar novo projeto Angular
ng new my-app
```

### 🧡 **Svelte**
```bash
# Criar novo projeto Svelte
npm create svelte@latest my-app
```

### ▲ **Next.js**
```bash
# Criar novo projeto Next.js
npx create-next-app@latest my-app
```

## 🌐 Deploy Automático

### Plataformas Suportadas

#### ▲ **Vercel**
- Deploy automático via Git
- Edge functions
- Analytics integrado

#### 🌐 **Netlify**
- Continuous deployment
- Form handling
- Functions

#### 📚 **GitHub Pages**
- Deploy direto do repositório
- Actions automáticas
- Domínio customizado

#### 🔥 **Firebase**
- Hosting rápido
- Functions integradas
- Analytics

## 📡 API REST

A ferramenta inclui uma API REST completa para automação:

### Endpoints Principais

```bash
# Informações do projeto
GET /api/project/info

# Instalar dependências
POST /api/project/install

# Build do projeto
POST /api/project/build

# Iniciar dev server
POST /api/project/dev/start

# Parar dev server
POST /api/project/dev/stop

# Executar testes
POST /api/project/test

# Análise de bundle
GET /api/project/analyze

# Logs do sistema
GET /api/logs?limit=100
```

### Exemplo de Uso
```javascript
// Obter informações do projeto
const info = await fetch('/api/project/info').then(r => r.json());

// Iniciar build
const build = await fetch('/api/project/build', { method: 'POST' });
```

## 📱 PWA Features

### Instalação como App
- Instalável via browser
- Funciona offline
- Notificações push
- App shortcuts

### Service Worker
- Cache inteligente
- Sync em background
- Atualizações automáticas

## 🎨 Temas e Customização

### Temas Disponíveis
- 🌞 **Light Theme** - Tema claro moderno
- 🌙 **Dark Theme** - Tema escuro com contraste otimizado

### Personalização
```css
:root {
  --primary: #2563eb;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

## 🔧 Configuração Avançada

### Arquivo de Configuração
```json
{
  "projectDir": "/data/data/com.termux/files/home/meu-projeto",
  "port": 8080,
  "apiPort": 3002,
  "theme": "dark",
  "autoSave": true,
  "notifications": true
}
```

### Variáveis de Ambiente
```bash
export DEVTOOL_PROJECT_DIR="/path/to/project"
export DEVTOOL_PORT=8080
export DEVTOOL_API_PORT=3002
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Porta em uso
```bash
# Verificar processos na porta
lsof -i :8080

# Matar processo
kill -9 <PID>
```

#### Node.js não encontrado
```bash
# Instalar Node.js
pkg install nodejs npm
```

#### Python não encontrado
```bash
# Instalar Python
pkg install python
```

#### Permissões negadas
```bash
# Dar permissões
chmod +x start.sh
termux-setup-storage
```

### Logs de Debug
```bash
# Ver logs detalhados
tail -f ~/.android-dev-tool/logs/debug.log
```

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Desenvolvimento
```bash
# Clone o repositório
git clone https://github.com/geekdr/android-dev-tool.git

# Instale dependências de desenvolvimento
npm install

# Execute em modo desenvolvimento
./start.sh --dev
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- **GitHub**: https://github.com/geekdr/android-dev-tool
- **Documentação**: https://android-dev-tool.docs.dev
- **Issues**: https://github.com/geekdr/android-dev-tool/issues
- **Discussions**: https://github.com/geekdr/android-dev-tool/discussions

## 📊 Estatísticas

- ⭐ **Stars**: 0+ (novo projeto!)
- 🍴 **Forks**: 0+
- 📦 **Downloads**: 0+
- 🐛 **Issues**: 0 abertas

## 🙏 Agradecimentos

- Comunidade Termux
- Desenvolvedores React/Vite
- Todos os contributors

## 📝 Changelog

### v2.0.0 (2024-07-30)
- ✨ Interface web completa
- 🚀 Deploy automático
- 📝 Editor integrado
- 📊 Análise de projeto
- 📱 PWA support
- 🛠️ Multi-framework
- 🎨 Temas customizáveis

### v1.0.0 (2024-07-29)
- 🎉 Versão inicial
- 📱 Suporte Termux
- 🔧 Menu interativo
- 🚀 Servidor de desenvolvimento

---

**Desenvolvido com ❤️ para a comunidade Android/Termux**

*"Transformando seu Android em uma estação de desenvolvimento completa!"*