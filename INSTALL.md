# 📥 Guia de Instalação - Android Dev Tool

## 🔧 Pré-requisitos

### 1. Termux Instalado
- Baixe do [F-Droid](https://f-droid.org/packages/com.termux/) ou [GitHub](https://github.com/termux/termux-app)
- **Importante**: Use apenas versões oficiais

### 2. Pacotes Necessários
```bash
# Atualize os repositórios
pkg update && pkg upgrade

# Instale Node.js e npm
pkg install nodejs npm

# Opcional: Instale Python para versão alternativa
pkg install python

# Opcional: Ferramentas úteis
pkg install zip unzip git
```

## 📱 Instalação da Ferramenta

### Método 1: Download e Extração
```bash
# 1. Baixe o arquivo android-dev-tool.zip
# 2. Extraia na pasta home
cd /data/data/com.termux/files/home
unzip android-dev-tool.zip

# 3. Torne executável
chmod +x android-dev-tool.sh
chmod +x android-dev-tool.py
```

### Método 2: Instalação Manual
```bash
# Copie os arquivos para sua pasta home
cp android-dev-tool.sh ~/
cp android-dev-tool.py ~/
chmod +x ~/android-dev-tool.sh
chmod +x ~/android-dev-tool.py
```

## ✅ Verificação da Instalação

```bash
# Teste a ferramenta
./android-dev-tool.sh info

# Deve mostrar informações do projeto sem erros
```

## 🎯 Primeiro Uso

### 1. Configure seu Projeto
```bash
# Navegue até seu projeto React/Vite
cd /data/data/com.termux/files/home/seu-projeto

# Ou edite o script para apontar para seu projeto
nano android-dev-tool.sh
# Altere a linha: PROJECT_DIR="/caminho/para/seu/projeto"
```

### 2. Execute o Menu
```bash
./android-dev-tool.sh
```

### 3. Instale Dependências
- Selecione opção `2` no menu
- Aguarde a instalação completa

### 4. Inicie o Servidor
- Selecione opção `4` no menu
- Acesse `http://127.0.0.1:8080` no navegador

## 🔍 Configurações Avançadas

### Alterar Porta Padrão
```bash
# Edite o script
nano android-dev-tool.sh

# Altere a linha:
PORT=8080  # Para sua porta preferida
```

### Configurar Múltiplos Projetos
```bash
# Crie cópias do script para cada projeto
cp android-dev-tool.sh projeto1-dev.sh
cp android-dev-tool.sh projeto2-dev.sh

# Edite cada um com o PROJECT_DIR correspondente
```

### Criar Alias Conveniente
```bash
# Adicione ao ~/.bashrc
echo 'alias devtool="~/android-dev-tool.sh"' >> ~/.bashrc
source ~/.bashrc

# Agora pode usar apenas:
devtool
```

## 🚨 Solução de Problemas

### "Command not found"
```bash
# Verifique se o arquivo é executável
ls -la android-dev-tool.sh
# Deve mostrar -rwxr-xr-x

# Se não for executável:
chmod +x android-dev-tool.sh
```

### "Node.js not found"
```bash
# Instale Node.js
pkg install nodejs npm

# Verifique a instalação
node --version
npm --version
```

### "Project not found"
```bash
# Verifique o caminho do projeto
ls -la /data/data/com.termux/files/home/

# Edite o PROJECT_DIR no script se necessário
nano android-dev-tool.sh
```

### "Permission denied"
```bash
# Corrija permissões do Termux
termux-setup-storage

# Reinicie o Termux se necessário
```

## 📋 Checklist de Instalação

- [ ] Termux instalado e atualizado
- [ ] Node.js e npm instalados
- [ ] Ferramenta baixada e extraída
- [ ] Permissões de execução configuradas
- [ ] Teste inicial executado com sucesso
- [ ] Projeto configurado corretamente

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** - A ferramenta mostra erros detalhados
2. **Consulte este guia** - Revise a seção de problemas
3. **Reinicie o Termux** - Às vezes resolve problemas de ambiente
4. **Verifique permissões** - Execute `termux-setup-storage`

## 🎉 Sucesso!

Após a instalação bem-sucedida, você terá:
- ✅ Ferramenta funcionando
- ✅ Servidor de desenvolvimento
- ✅ Acesso via navegador Android
- ✅ Workflow completo de desenvolvimento

**Próximos passos:** Execute `./android-dev-tool.sh` e explore as funcionalidades!