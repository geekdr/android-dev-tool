#!/usr/bin/env python3
"""
Ferramenta Android para visualizar e testar projetos React/Vite
Funciona no Termux sem dependências externas
"""

import os
import sys
import json
import subprocess
import http.server
import socketserver
import threading
import time
import webbrowser
from pathlib import Path

class AndroidDevTool:
    def __init__(self):
        self.project_dir = "/data/data/com.termux/files/home/gestao-financeira"
        self.port = 8080
        
    def check_project(self):
        """Verifica se o projeto existe e tem as dependências"""
        if not os.path.exists(self.project_dir):
            print("❌ Projeto não encontrado!")
            return False
            
        package_json = os.path.join(self.project_dir, "package.json")
        if not os.path.exists(package_json):
            print("❌ package.json não encontrado!")
            return False
            
        node_modules = os.path.join(self.project_dir, "node_modules")
        if not os.path.exists(node_modules):
            print("⚠️  node_modules não encontrado. Execute: npm install")
            return False
            
        print("✅ Projeto válido encontrado!")
        return True
        
    def install_dependencies(self):
        """Instala dependências do projeto"""
        print("📦 Instalando dependências...")
        try:
            os.chdir(self.project_dir)
            result = subprocess.run(["npm", "install"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Dependências instaladas com sucesso!")
                return True
            else:
                print(f"❌ Erro ao instalar dependências: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Erro: {e}")
            return False
            
    def build_project(self):
        """Faz o build do projeto"""
        print("🔨 Fazendo build do projeto...")
        try:
            os.chdir(self.project_dir)
            result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Build concluído com sucesso!")
                return True
            else:
                print(f"❌ Erro no build: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Erro: {e}")
            return False
            
    def start_dev_server(self):
        """Inicia o servidor de desenvolvimento"""
        print("🚀 Iniciando servidor de desenvolvimento...")
        try:
            os.chdir(self.project_dir)
            # Executa em background
            subprocess.Popen(["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", str(self.port)])
            print(f"✅ Servidor iniciado em http://localhost:{self.port}")
            print(f"📱 Acesse no navegador Android: http://127.0.0.1:{self.port}")
            return True
        except Exception as e:
            print(f"❌ Erro: {e}")
            return False
            
    def serve_build(self):
        """Serve o build estático"""
        dist_dir = os.path.join(self.project_dir, "dist")
        if not os.path.exists(dist_dir):
            print("❌ Diretório dist não encontrado. Execute o build primeiro.")
            return False
            
        print(f"🌐 Servindo build estático na porta {self.port}...")
        os.chdir(dist_dir)
        
        class CustomHandler(http.server.SimpleHTTPRequestHandler):
            def end_headers(self):
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                super().end_headers()
                
        try:
            with socketserver.TCPServer(("0.0.0.0", self.port), CustomHandler) as httpd:
                print(f"✅ Servidor estático rodando em http://localhost:{self.port}")
                print(f"📱 Acesse no navegador Android: http://127.0.0.1:{self.port}")
                print("⏹️  Pressione Ctrl+C para parar")
                httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor parado.")
        except Exception as e:
            print(f"❌ Erro: {e}")
            
    def run_tests(self):
        """Executa testes se existirem"""
        print("🧪 Verificando testes...")
        try:
            os.chdir(self.project_dir)
            # Verifica se há configuração de testes
            package_data = {}
            with open("package.json", "r") as f:
                package_data = json.load(f)
                
            scripts = package_data.get("scripts", {})
            if "test" in scripts:
                print("▶️  Executando testes...")
                result = subprocess.run(["npm", "test"], capture_output=True, text=True)
                if result.returncode == 0:
                    print("✅ Testes passaram!")
                    print(result.stdout)
                else:
                    print("❌ Testes falharam!")
                    print(result.stderr)
            else:
                print("⚠️  Nenhum script de teste configurado.")
        except Exception as e:
            print(f"❌ Erro: {e}")
            
    def lint_project(self):
        """Executa o linter"""
        print("🧹 Executando linter...")
        try:
            os.chdir(self.project_dir)
            result = subprocess.run(["npm", "run", "lint"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Código está limpo!")
            else:
                print("⚠️  Problemas encontrados:")
                print(result.stdout)
        except Exception as e:
            print(f"❌ Erro: {e}")
            
    def show_project_info(self):
        """Mostra informações do projeto"""
        print("\n📊 INFORMAÇÕES DO PROJETO")
        print("=" * 40)
        
        try:
            with open(os.path.join(self.project_dir, "package.json"), "r") as f:
                package_data = json.load(f)
                
            print(f"Nome: {package_data.get('name', 'N/A')}")
            print(f"Versão: {package_data.get('version', 'N/A')}")
            print(f"Tipo: {package_data.get('type', 'N/A')}")
            
            print("\n📋 Scripts disponíveis:")
            for script, command in package_data.get("scripts", {}).items():
                print(f"  • {script}: {command}")
                
            print("\n📦 Dependências principais:")
            for dep in list(package_data.get("dependencies", {}).keys())[:5]:
                print(f"  • {dep}")
                
        except Exception as e:
            print(f"❌ Erro ao ler informações: {e}")
    
    def menu(self):
        """Menu principal"""
        while True:
            print("\n" + "="*50)
            print("🔧 FERRAMENTA DE DESENVOLVIMENTO ANDROID")
            print("="*50)
            print("1. 📊 Informações do projeto")
            print("2. 📦 Instalar dependências")
            print("3. 🔨 Build do projeto")
            print("4. 🚀 Servidor de desenvolvimento")
            print("5. 🌐 Servir build estático")
            print("6. 🧪 Executar testes")
            print("7. 🧹 Executar linter")
            print("8. 🚪 Sair")
            print("-" * 50)
            
            choice = input("Escolha uma opção (1-8): ").strip()
            
            if choice == "1":
                self.show_project_info()
            elif choice == "2":
                self.install_dependencies()
            elif choice == "3":
                self.build_project()
            elif choice == "4":
                if self.check_project():
                    self.start_dev_server()
                    input("\nPressione Enter para continuar...")
            elif choice == "5":
                self.serve_build()
            elif choice == "6":
                self.run_tests()
            elif choice == "7":
                self.lint_project()
            elif choice == "8":
                print("👋 Até logo!")
                break
            else:
                print("❌ Opção inválida!")
                
if __name__ == "__main__":
    tool = AndroidDevTool()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "info":
            tool.show_project_info()
        elif command == "install":
            tool.install_dependencies()
        elif command == "build":
            tool.build_project()
        elif command == "dev":
            tool.start_dev_server()
        elif command == "serve":
            tool.serve_build()
        elif command == "test":
            tool.run_tests()
        elif command == "lint":
            tool.lint_project()
        else:
            print("Comandos: info, install, build, dev, serve, test, lint")
    else:
        tool.menu()