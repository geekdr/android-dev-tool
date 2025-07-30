#!/usr/bin/env python3
"""
Android Dev Tool v2.0 - Backend API Server
Provides REST API for development operations
"""

import os
import sys
import json
import subprocess
import asyncio
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
import websocket
import shutil

# Configuration
@dataclass
class Config:
    project_dir: str = "/data/data/com.termux/files/home/gestao-financeira"
    port: int = 3001
    api_port: int = 3002
    allowed_origins: List[str] = None
    max_log_lines: int = 1000
    
    def __post_init__(self):
        if self.allowed_origins is None:
            self.allowed_origins = ["http://localhost:8080", "http://127.0.0.1:8080"]

config = Config()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DevToolAPI:
    def __init__(self):
        self.project_dir = Path(config.project_dir)
        self.server_process = None
        self.logs = []
        self.frameworks = {
            'react': {
                'name': 'React',
                'template': 'vite-react',
                'commands': {
                    'create': 'npm create vite@latest {name} -- --template react-ts',
                    'dev': 'npm run dev',
                    'build': 'npm run build',
                    'test': 'npm test'
                }
            },
            'vue': {
                'name': 'Vue.js',
                'template': 'vite-vue',
                'commands': {
                    'create': 'npm create vue@latest {name}',
                    'dev': 'npm run dev',
                    'build': 'npm run build',
                    'test': 'npm run test'
                }
            },
            'angular': {
                'name': 'Angular',
                'template': 'angular',
                'commands': {
                    'create': 'ng new {name}',
                    'dev': 'ng serve --host 0.0.0.0',
                    'build': 'ng build',
                    'test': 'ng test'
                }
            },
            'svelte': {
                'name': 'Svelte',
                'template': 'svelte',
                'commands': {
                    'create': 'npm create svelte@latest {name}',
                    'dev': 'npm run dev',
                    'build': 'npm run build',
                    'test': 'npm test'
                }
            },
            'nextjs': {
                'name': 'Next.js',
                'template': 'nextjs',
                'commands': {
                    'create': 'npx create-next-app@latest {name}',
                    'dev': 'npm run dev',
                    'build': 'npm run build',
                    'test': 'npm test'
                }
            }
        }

    def log(self, message: str, level: str = "info"):
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message
        }
        self.logs.append(log_entry)
        
        # Keep only last N logs
        if len(self.logs) > config.max_log_lines:
            self.logs = self.logs[-config.max_log_lines:]
        
        logger.info(f"{level.upper()}: {message}")

    async def execute_command(self, command: str, cwd: Optional[str] = None) -> Dict:
        """Execute shell command asynchronously"""
        try:
            self.log(f"Executing: {command}")
            
            if cwd is None:
                cwd = str(self.project_dir) if self.project_dir.exists() else os.getcwd()
            
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd
            )
            
            stdout, stderr = await process.communicate()
            
            result = {
                "success": process.returncode == 0,
                "returncode": process.returncode,
                "stdout": stdout.decode('utf-8'),
                "stderr": stderr.decode('utf-8'),
                "command": command
            }
            
            if result["success"]:
                self.log(f"✅ Command completed: {command}")
            else:
                self.log(f"❌ Command failed: {command} - {result['stderr']}", "error")
            
            return result
            
        except Exception as e:
            self.log(f"❌ Exception executing command: {str(e)}", "error")
            return {
                "success": False,
                "error": str(e),
                "command": command
            }

    async def get_project_info(self) -> Dict:
        """Get comprehensive project information"""
        try:
            if not self.project_dir.exists():
                return {"error": "Project directory not found"}
            
            package_json_path = self.project_dir / "package.json"
            if not package_json_path.exists():
                return {"error": "package.json not found"}
            
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Get file statistics
            file_count = sum(1 for _ in self.project_dir.rglob("*") if _.is_file())
            
            # Get dependencies info
            deps = package_data.get("dependencies", {})
            dev_deps = package_data.get("devDependencies", {})
            
            # Check if dist exists
            dist_exists = (self.project_dir / "dist").exists()
            build_exists = (self.project_dir / "build").exists()
            
            return {
                "name": package_data.get("name", "Unknown"),
                "version": package_data.get("version", "0.0.0"),
                "type": package_data.get("type", "commonjs"),
                "scripts": package_data.get("scripts", {}),
                "dependencies": len(deps),
                "devDependencies": len(dev_deps),
                "totalFiles": file_count,
                "hasNodeModules": (self.project_dir / "node_modules").exists(),
                "hasBuild": dist_exists or build_exists,
                "framework": self.detect_framework(package_data)
            }
            
        except Exception as e:
            self.log(f"❌ Error getting project info: {str(e)}", "error")
            return {"error": str(e)}

    def detect_framework(self, package_data: Dict) -> str:
        """Detect project framework from package.json"""
        deps = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
        
        if "react" in deps:
            if "next" in deps:
                return "nextjs"
            return "react"
        elif "vue" in deps:
            if "@nuxt" in str(deps):
                return "nuxt"
            return "vue"
        elif "@angular/core" in deps:
            return "angular"
        elif "svelte" in deps:
            return "svelte"
        else:
            return "unknown"

    async def install_dependencies(self) -> Dict:
        """Install project dependencies"""
        return await self.execute_command("npm install")

    async def build_project(self) -> Dict:
        """Build project for production"""
        # First check if we have a build script
        try:
            package_json = self.project_dir / "package.json"
            with open(package_json, 'r') as f:
                data = json.load(f)
            
            scripts = data.get("scripts", {})
            if "build" in scripts:
                return await self.execute_command("npm run build")
            else:
                return {"error": "No build script found in package.json"}
                
        except Exception as e:
            return {"error": f"Failed to read package.json: {str(e)}"}

    async def start_dev_server(self) -> Dict:
        """Start development server"""
        if self.server_process and self.server_process.poll() is None:
            return {"error": "Server already running"}
        
        try:
            # Check for dev script
            package_json = self.project_dir / "package.json"
            with open(package_json, 'r') as f:
                data = json.load(f)
            
            scripts = data.get("scripts", {})
            if "dev" not in scripts:
                return {"error": "No dev script found in package.json"}
            
            # Start server in background
            self.server_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=str(self.project_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.log("🚀 Development server started")
            return {
                "success": True,
                "message": "Development server started",
                "pid": self.server_process.pid,
                "url": f"http://127.0.0.1:{config.port}"
            }
            
        except Exception as e:
            self.log(f"❌ Failed to start dev server: {str(e)}", "error")
            return {"error": str(e)}

    async def stop_dev_server(self) -> Dict:
        """Stop development server"""
        if not self.server_process or self.server_process.poll() is not None:
            return {"error": "No server running"}
        
        try:
            self.server_process.terminate()
            self.server_process.wait(timeout=5)
            self.log("⏹️ Development server stopped")
            return {"success": True, "message": "Server stopped"}
            
        except subprocess.TimeoutExpired:
            self.server_process.kill()
            self.log("🔪 Development server forcefully killed")
            return {"success": True, "message": "Server forcefully stopped"}
        except Exception as e:
            return {"error": str(e)}

    async def run_tests(self) -> Dict:
        """Run project tests"""
        return await self.execute_command("npm test")

    async def run_linter(self) -> Dict:
        """Run code linter"""
        return await self.execute_command("npm run lint")

    async def analyze_bundle(self) -> Dict:
        """Analyze bundle size and performance"""
        try:
            # Check if build exists
            dist_dir = self.project_dir / "dist"
            build_dir = self.project_dir / "build"
            
            target_dir = dist_dir if dist_dir.exists() else build_dir if build_dir.exists() else None
            
            if not target_dir:
                return {"error": "No build directory found. Run build first."}
            
            # Calculate bundle size
            total_size = sum(f.stat().st_size for f in target_dir.rglob("*") if f.is_file())
            
            # Get file breakdown
            files = []
            for file_path in target_dir.rglob("*"):
                if file_path.is_file():
                    size = file_path.stat().st_size
                    files.append({
                        "name": file_path.name,
                        "path": str(file_path.relative_to(target_dir)),
                        "size": size,
                        "sizeFormatted": self.format_size(size)
                    })
            
            files.sort(key=lambda x: x["size"], reverse=True)
            
            return {
                "totalSize": total_size,
                "totalSizeFormatted": self.format_size(total_size),
                "fileCount": len(files),
                "files": files[:20],  # Top 20 largest files
                "buildDir": str(target_dir.name)
            }
            
        except Exception as e:
            self.log(f"❌ Bundle analysis failed: {str(e)}", "error")
            return {"error": str(e)}

    def format_size(self, size_bytes: int) -> str:
        """Format bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"

    async def create_project(self, name: str, framework: str) -> Dict:
        """Create new project with specified framework"""
        if framework not in self.frameworks:
            return {"error": f"Unsupported framework: {framework}"}
        
        try:
            framework_config = self.frameworks[framework]
            create_command = framework_config["commands"]["create"].format(name=name)
            
            result = await self.execute_command(create_command, cwd=str(Path.cwd()))
            
            if result["success"]:
                self.log(f"✅ Created {framework} project: {name}")
                return {
                    "success": True,
                    "message": f"Created {framework} project successfully",
                    "projectPath": str(Path.cwd() / name)
                }
            else:
                return result
                
        except Exception as e:
            return {"error": str(e)}

    async def deploy_project(self, platform: str) -> Dict:
        """Deploy project to specified platform"""
        deploy_commands = {
            "vercel": "npx vercel --prod",
            "netlify": "npx netlify deploy --prod",
            "gh-pages": "npm run deploy",
            "firebase": "firebase deploy"
        }
        
        if platform not in deploy_commands:
            return {"error": f"Unsupported platform: {platform}"}
        
        command = deploy_commands[platform]
        result = await self.execute_command(command)
        
        if result["success"]:
            self.log(f"🚀 Deployed to {platform}")
        
        return result

    def get_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent logs"""
        return self.logs[-limit:] if limit else self.logs

    async def read_file(self, file_path: str) -> Dict:
        """Read file content"""
        try:
            full_path = self.project_dir / file_path
            if not full_path.exists():
                return {"error": "File not found"}
            
            if full_path.stat().st_size > 1024 * 1024:  # 1MB limit
                return {"error": "File too large"}
            
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "success": True,
                "content": content,
                "path": file_path,
                "size": len(content)
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def write_file(self, file_path: str, content: str) -> Dict:
        """Write file content"""
        try:
            full_path = self.project_dir / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.log(f"📝 File saved: {file_path}")
            return {"success": True, "message": "File saved successfully"}
            
        except Exception as e:
            return {"error": str(e)}

class APIRequestHandler(BaseHTTPRequestHandler):
    def __init__(self, api_instance, *args, **kwargs):
        self.api = api_instance
        super().__init__(*args, **kwargs)

    def do_GET(self):
        self._handle_request()

    def do_POST(self):
        self._handle_request()

    def do_OPTIONS(self):
        self._send_cors_headers()
        self.end_headers()

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _handle_request(self):
        try:
            parsed = urlparse(self.path)
            path = parsed.path
            query = parse_qs(parsed.query)
            
            # Handle async endpoints
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            if path == '/api/project/info':
                result = loop.run_until_complete(self.api.get_project_info())
            elif path == '/api/project/install':
                result = loop.run_until_complete(self.api.install_dependencies())
            elif path == '/api/project/build':
                result = loop.run_until_complete(self.api.build_project())
            elif path == '/api/project/dev/start':
                result = loop.run_until_complete(self.api.start_dev_server())
            elif path == '/api/project/dev/stop':
                result = loop.run_until_complete(self.api.stop_dev_server())
            elif path == '/api/project/test':
                result = loop.run_until_complete(self.api.run_tests())
            elif path == '/api/project/lint':
                result = loop.run_until_complete(self.api.run_linter())
            elif path == '/api/project/analyze':
                result = loop.run_until_complete(self.api.analyze_bundle())
            elif path == '/api/logs':
                limit = int(query.get('limit', [100])[0])
                result = self.api.get_logs(limit)
            else:
                result = {"error": "Endpoint not found"}
            
            loop.close()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            
            response = json.dumps(result, indent=2)
            self.wfile.write(response.encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            
            error_response = json.dumps({"error": str(e)})
            self.wfile.write(error_response.encode())

def create_handler(api_instance):
    def handler(*args, **kwargs):
        return APIRequestHandler(api_instance, *args, **kwargs)
    return handler

def main():
    print("🔧 Starting Android Dev Tool v2.0 Backend...")
    
    api = DevToolAPI()
    handler = create_handler(api)
    
    try:
        server = HTTPServer(('localhost', config.api_port), handler)
        print(f"✅ Backend API running on http://localhost:{config.api_port}")
        print("📋 Available endpoints:")
        print("  GET  /api/project/info")
        print("  POST /api/project/install")
        print("  POST /api/project/build")
        print("  POST /api/project/dev/start")
        print("  POST /api/project/dev/stop")
        print("  POST /api/project/test")
        print("  POST /api/project/lint")
        print("  GET  /api/project/analyze")
        print("  GET  /api/logs")
        print("\n⏹️  Press Ctrl+C to stop")
        
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down backend...")
        server.shutdown()
        
        # Clean up any running processes
        if api.server_process and api.server_process.poll() is None:
            api.server_process.terminate()
        
        print("👋 Backend stopped")

if __name__ == "__main__":
    main()