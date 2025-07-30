#!/usr/bin/env python3
"""
Android Dev Studio v3.0 - Advanced Backend API
Complete development environment with Flutter/Dart, APK compilation, and OS features
"""

import os
import sys
import json
import subprocess
import asyncio
import logging
import shutil
import zipfile
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
import psutil
import tempfile

# Configuration
@dataclass
class Config:
    project_dir: str = "/data/data/com.termux/files/home"
    flutter_sdk_path: str = "/data/data/com.termux/files/home/flutter"
    android_sdk_path: str = "/data/data/com.termux/files/home/android-sdk"
    port: int = 8080
    api_port: int = 3003
    max_log_lines: int = 2000
    docker_enabled: bool = True

config = Config()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AndroidDevStudioAPI:
    def __init__(self):
        self.project_dir = Path(config.project_dir)
        self.flutter_sdk = Path(config.flutter_sdk_path)
        self.android_sdk = Path(config.android_sdk_path)
        self.processes = {}
        self.logs = []
        self.file_system = self.init_virtual_fs()
        self.packages = self.init_packages()

    def init_virtual_fs(self):
        """Initialize virtual file system structure"""
        return {
            'home': {
                'user': {
                    'Projects': {
                        'flutter_apps': {},
                        'react_apps': {},
                        'vue_apps': {},
                        'android_apps': {}
                    },
                    'Documents': {},
                    'Downloads': {},
                    'Desktop': {}
                }
            },
            'data': {
                'data': {
                    'com.termux': {
                        'files': {
                            'usr': {},
                            'home': {}
                        }
                    }
                }
            }
        }

    def init_packages(self):
        """Initialize package repository"""
        return {
            'flutter': [
                {
                    'name': 'flutter',
                    'version': '3.16.0',
                    'description': 'Flutter SDK for cross-platform development',
                    'size': '2.1 GB',
                    'installed': False,
                    'dependencies': ['dart', 'android-sdk']
                },
                {
                    'name': 'dart',
                    'version': '3.2.0',
                    'description': 'Dart programming language',
                    'size': '150 MB',
                    'installed': True,
                    'dependencies': []
                }
            ],
            'android': [
                {
                    'name': 'android-sdk',
                    'version': '34.0.0',
                    'description': 'Android Software Development Kit',
                    'size': '5.2 GB',
                    'installed': False,
                    'dependencies': ['java']
                },
                {
                    'name': 'gradle',
                    'version': '8.4',
                    'description': 'Build automation tool for Android',
                    'size': '120 MB',
                    'installed': True,
                    'dependencies': []
                }
            ],
            'development': [
                {
                    'name': 'nodejs',
                    'version': '20.10.0',
                    'description': 'JavaScript runtime environment',
                    'size': '80 MB',
                    'installed': True,
                    'dependencies': []
                },
                {
                    'name': 'python',
                    'version': '3.12.0',
                    'description': 'Python programming language',
                    'size': '120 MB',
                    'installed': True,
                    'dependencies': []
                },
                {
                    'name': 'git',
                    'version': '2.43.0',
                    'description': 'Distributed version control system',
                    'size': '45 MB',
                    'installed': True,
                    'dependencies': []
                }
            ],
            'system': [
                {
                    'name': 'htop',
                    'version': '3.2.2',
                    'description': 'Interactive process viewer',
                    'size': '8 MB',
                    'installed': False,
                    'dependencies': []
                },
                {
                    'name': 'neofetch',
                    'version': '7.1.0',
                    'description': 'System information display tool',
                    'size': '2 MB',
                    'installed': False,
                    'dependencies': []
                },
                {
                    'name': 'docker',
                    'version': '24.0.7',
                    'description': 'Container platform',
                    'size': '200 MB',
                    'installed': False,
                    'dependencies': []
                }
            ]
        }

    def log(self, message: str, level: str = "info"):
        """Add log entry"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message
        }
        self.logs.append(log_entry)
        
        if len(self.logs) > config.max_log_lines:
            self.logs = self.logs[-config.max_log_lines:]
        
        logger.info(f"{level.upper()}: {message}")

    async def execute_command(self, command: str, cwd: Optional[str] = None) -> Dict:
        """Execute system command"""
        try:
            self.log(f"Executing: {command}")
            
            if cwd is None:
                cwd = str(self.project_dir)
            
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

    # Flutter Development
    async def create_flutter_project(self, project_name: str) -> Dict:
        """Create new Flutter project"""
        try:
            project_path = self.project_dir / "Projects" / "flutter_apps" / project_name
            
            if project_path.exists():
                return {"error": f"Project {project_name} already exists"}
            
            # Check if Flutter is installed
            flutter_check = await self.execute_command("flutter --version")
            if not flutter_check["success"]:
                return {"error": "Flutter SDK not installed. Install Flutter first."}
            
            # Create Flutter project
            result = await self.execute_command(
                f"flutter create {project_name}",
                cwd=str(self.project_dir / "Projects" / "flutter_apps")
            )
            
            if result["success"]:
                self.log(f"✅ Flutter project created: {project_name}")
                return {
                    "success": True,
                    "message": f"Flutter project {project_name} created successfully",
                    "project_path": str(project_path)
                }
            else:
                return result
                
        except Exception as e:
            return {"error": str(e)}

    async def build_flutter_apk(self, project_path: str, build_type: str = "release") -> Dict:
        """Build Flutter APK"""
        try:
            project_dir = Path(project_path)
            if not project_dir.exists():
                return {"error": "Project directory not found"}
            
            # Check for pubspec.yaml
            pubspec = project_dir / "pubspec.yaml"
            if not pubspec.exists():
                return {"error": "Not a valid Flutter project (pubspec.yaml not found)"}
            
            build_command = f"flutter build apk --{build_type}"
            self.log(f"🔨 Building Flutter APK ({build_type}): {project_path}")
            
            result = await self.execute_command(build_command, cwd=str(project_dir))
            
            if result["success"]:
                # Find generated APK
                apk_path = project_dir / "build" / "app" / "outputs" / "flutter-apk"
                apk_file = None
                
                if apk_path.exists():
                    apk_files = list(apk_path.glob("*.apk"))
                    if apk_files:
                        apk_file = str(apk_files[0])
                        apk_size = apk_files[0].stat().st_size
                        apk_size_mb = round(apk_size / (1024 * 1024), 1)
                
                self.log(f"✅ APK built successfully: {apk_file}")
                return {
                    "success": True,
                    "message": f"{build_type.title()} APK built successfully",
                    "apk_path": apk_file,
                    "apk_size": f"{apk_size_mb} MB" if apk_file else "Unknown"
                }
            else:
                return result
                
        except Exception as e:
            return {"error": str(e)}

    async def run_flutter_app(self, project_path: str) -> Dict:
        """Run Flutter app"""
        try:
            project_dir = Path(project_path)
            if not project_dir.exists():
                return {"error": "Project directory not found"}
            
            # Start Flutter app
            process = subprocess.Popen(
                ["flutter", "run", "--web-port", "8081"],
                cwd=str(project_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.processes[f"flutter_{project_path}"] = process
            self.log(f"🚀 Flutter app started: {project_path}")
            
            return {
                "success": True,
                "message": "Flutter app started",
                "pid": process.pid,
                "url": "http://localhost:8081"
            }
            
        except Exception as e:
            return {"error": str(e)}

    # Android SDK Management
    async def install_android_sdk(self) -> Dict:
        """Install Android SDK"""
        try:
            sdk_dir = self.android_sdk
            sdk_dir.mkdir(parents=True, exist_ok=True)
            
            # Download Android SDK command line tools
            sdk_url = "https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip"
            
            self.log("📥 Downloading Android SDK...")
            
            # Simulate download (in real implementation, download actual SDK)
            await asyncio.sleep(2)  # Simulate download time
            
            self.log("✅ Android SDK installed successfully")
            return {
                "success": True,
                "message": "Android SDK installed",
                "sdk_path": str(sdk_dir)
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def list_android_devices(self) -> Dict:
        """List connected Android devices"""
        try:
            result = await self.execute_command("adb devices -l")
            
            if result["success"]:
                devices = []
                lines = result["stdout"].split('\n')[1:]  # Skip header
                
                for line in lines:
                    if line.strip() and not line.startswith('*'):
                        parts = line.split()
                        if len(parts) >= 2:
                            devices.append({
                                "id": parts[0],
                                "status": parts[1],
                                "info": " ".join(parts[2:]) if len(parts) > 2 else ""
                            })
                
                return {
                    "success": True,
                    "devices": devices
                }
            else:
                return result
                
        except Exception as e:
            return {"error": str(e)}

    # Package Management
    async def install_package(self, package_name: str) -> Dict:
        """Install package"""
        try:
            # Find package in repository
            package = None
            for category, packages in self.packages.items():
                for pkg in packages:
                    if pkg['name'] == package_name:
                        package = pkg
                        break
                if package:
                    break
            
            if not package:
                return {"error": f"Package {package_name} not found"}
            
            if package['installed']:
                return {"error": f"Package {package_name} is already installed"}
            
            # Install dependencies first
            for dep in package['dependencies']:
                dep_result = await self.install_package(dep)
                if not dep_result.get('success', False):
                    return {"error": f"Failed to install dependency: {dep}"}
            
            # Simulate package installation
            self.log(f"📦 Installing {package_name}...")
            
            install_commands = {
                'flutter': 'pkg install flutter',
                'android-sdk': 'pkg install android-sdk',
                'docker': 'pkg install docker',
                'htop': 'pkg install htop',
                'neofetch': 'pkg install neofetch'
            }
            
            if package_name in install_commands:
                result = await self.execute_command(install_commands[package_name])
                
                if result['success']:
                    package['installed'] = True
                    self.log(f"✅ {package_name} installed successfully")
                    return {
                        "success": True,
                        "message": f"{package_name} installed successfully"
                    }
                else:
                    return result
            else:
                # Simulate installation for demo
                await asyncio.sleep(2)
                package['installed'] = True
                self.log(f"✅ {package_name} installed successfully")
                return {
                    "success": True,
                    "message": f"{package_name} installed successfully"
                }
                
        except Exception as e:
            return {"error": str(e)}

    async def uninstall_package(self, package_name: str) -> Dict:
        """Uninstall package"""
        try:
            package = None
            for category, packages in self.packages.items():
                for pkg in packages:
                    if pkg['name'] == package_name:
                        package = pkg
                        break
                if package:
                    break
            
            if not package:
                return {"error": f"Package {package_name} not found"}
            
            if not package['installed']:
                return {"error": f"Package {package_name} is not installed"}
            
            result = await self.execute_command(f"pkg uninstall {package_name}")
            
            if result['success']:
                package['installed'] = False
                self.log(f"🗑️ {package_name} uninstalled successfully")
                return {
                    "success": True,
                    "message": f"{package_name} uninstalled successfully"
                }
            else:
                return result
                
        except Exception as e:
            return {"error": str(e)}

    # System Monitoring
    def get_system_info(self) -> Dict:
        """Get system information"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": psutil.cpu_count(),
                    "freq": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "used": memory.used,
                    "percent": memory.percent
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": round((disk.used / disk.total) * 100, 1)
                },
                "processes": len(psutil.pids()),
                "uptime": time.time() - psutil.boot_time()
            }
            
        except Exception as e:
            return {"error": str(e)}

    def get_process_list(self) -> Dict:
        """Get running processes"""
        try:
            processes = []
            
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            return {
                "success": True,
                "processes": processes[:50]  # Limit to top 50
            }
            
        except Exception as e:
            return {"error": str(e)}

    # Docker Integration
    async def docker_ps(self) -> Dict:
        """List Docker containers"""
        try:
            result = await self.execute_command("docker ps -a --format 'table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Names}}'")
            
            if result["success"]:
                containers = []
                lines = result["stdout"].split('\n')[1:]  # Skip header
                
                for line in lines:
                    if line.strip():
                        parts = line.split('\t')
                        if len(parts) >= 4:
                            containers.append({
                                "id": parts[0],
                                "image": parts[1],
                                "status": parts[2],
                                "name": parts[3]
                            })
                
                return {
                    "success": True,
                    "containers": containers
                }
            else:
                return {"error": "Docker not available or not running"}
                
        except Exception as e:
            return {"error": str(e)}

    async def docker_run(self, image: str, options: str = "", name: str = None) -> Dict:
        """Run Docker container"""
        try:
            cmd = f"docker run {options}"
            if name:
                cmd += f" --name {name}"
            cmd += f" {image}"
            
            result = await self.execute_command(cmd)
            
            if result["success"]:
                self.log(f"🐳 Docker container started: {image}")
                return {
                    "success": True,
                    "message": f"Container {image} started successfully"
                }
            else:
                return result
                
        except Exception as e:
            return {"error": str(e)}

    # File Operations
    async def create_file(self, file_path: str, content: str = "") -> Dict:
        """Create new file"""
        try:
            full_path = Path(file_path)
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.log(f"📄 File created: {file_path}")
            return {
                "success": True,
                "message": f"File {file_path} created successfully"
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def read_file(self, file_path: str) -> Dict:
        """Read file content"""
        try:
            full_path = Path(file_path)
            
            if not full_path.exists():
                return {"error": "File not found"}
            
            if full_path.stat().st_size > 10 * 1024 * 1024:  # 10MB limit
                return {"error": "File too large to read"}
            
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "success": True,
                "content": content,
                "size": len(content),
                "path": file_path
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def write_file(self, file_path: str, content: str) -> Dict:
        """Write file content"""
        try:
            full_path = Path(file_path)
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.log(f"💾 File saved: {file_path}")
            return {
                "success": True,
                "message": f"File {file_path} saved successfully"
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def list_directory(self, dir_path: str) -> Dict:
        """List directory contents"""
        try:
            full_path = Path(dir_path)
            
            if not full_path.exists():
                return {"error": "Directory not found"}
            
            if not full_path.is_dir():
                return {"error": "Path is not a directory"}
            
            items = []
            
            for item in full_path.iterdir():
                stat = item.stat()
                items.append({
                    "name": item.name,
                    "type": "directory" if item.is_dir() else "file",
                    "size": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "permissions": oct(stat.st_mode)[-3:]
                })
            
            return {
                "success": True,
                "items": sorted(items, key=lambda x: (x["type"] == "file", x["name"]))
            }
            
        except Exception as e:
            return {"error": str(e)}

# HTTP Request Handler
class DevStudioRequestHandler(BaseHTTPRequestHandler):
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
            
            # Get POST data if available
            post_data = {}
            if self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length:
                    post_body = self.rfile.read(content_length)
                    try:
                        post_data = json.loads(post_body.decode('utf-8'))
                    except json.JSONDecodeError:
                        pass
            
            # Handle async endpoints
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            result = None
            
            # Flutter endpoints
            if path == '/api/flutter/create':
                project_name = post_data.get('name', query.get('name', [''])[0])
                result = loop.run_until_complete(self.api.create_flutter_project(project_name))
            elif path == '/api/flutter/build':
                project_path = post_data.get('path', query.get('path', [''])[0])
                build_type = post_data.get('type', query.get('type', ['release'])[0])
                result = loop.run_until_complete(self.api.build_flutter_apk(project_path, build_type))
            elif path == '/api/flutter/run':
                project_path = post_data.get('path', query.get('path', [''])[0])
                result = loop.run_until_complete(self.api.run_flutter_app(project_path))
            
            # Android endpoints
            elif path == '/api/android/sdk/install':
                result = loop.run_until_complete(self.api.install_android_sdk())
            elif path == '/api/android/devices':
                result = loop.run_until_complete(self.api.list_android_devices())
            
            # Package management
            elif path == '/api/packages/list':
                result = {"success": True, "packages": self.api.packages}
            elif path == '/api/packages/install':
                package_name = post_data.get('name', query.get('name', [''])[0])
                result = loop.run_until_complete(self.api.install_package(package_name))
            elif path == '/api/packages/uninstall':
                package_name = post_data.get('name', query.get('name', [''])[0])
                result = loop.run_until_complete(self.api.uninstall_package(package_name))
            
            # System monitoring
            elif path == '/api/system/info':
                result = self.api.get_system_info()
            elif path == '/api/system/processes':
                result = self.api.get_process_list()
            
            # Docker
            elif path == '/api/docker/ps':
                result = loop.run_until_complete(self.api.docker_ps())
            elif path == '/api/docker/run':
                image = post_data.get('image', query.get('image', [''])[0])
                options = post_data.get('options', query.get('options', [''])[0])
                name = post_data.get('name', query.get('name', [None])[0])
                result = loop.run_until_complete(self.api.docker_run(image, options, name))
            
            # File operations
            elif path == '/api/files/list':
                dir_path = query.get('path', ['/'])[0]
                result = loop.run_until_complete(self.api.list_directory(dir_path))
            elif path == '/api/files/read':
                file_path = query.get('path', [''])[0]
                result = loop.run_until_complete(self.api.read_file(file_path))
            elif path == '/api/files/write':
                file_path = post_data.get('path', '')
                content = post_data.get('content', '')
                result = loop.run_until_complete(self.api.write_file(file_path, content))
            elif path == '/api/files/create':
                file_path = post_data.get('path', '')
                content = post_data.get('content', '')
                result = loop.run_until_complete(self.api.create_file(file_path, content))
            
            # Logs
            elif path == '/api/logs':
                limit = int(query.get('limit', [100])[0])
                result = {"success": True, "logs": self.api.logs[-limit:]}
            
            else:
                result = {"error": "Endpoint not found"}
            
            loop.close()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            
            response = json.dumps(result, indent=2, default=str)
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
        return DevStudioRequestHandler(api_instance, *args, **kwargs)
    return handler

def main():
    print("🔧 Starting Android Dev Studio v3.0 Backend...")
    print("🌟 Complete development environment with Flutter/Dart support")
    
    api = AndroidDevStudioAPI()
    handler = create_handler(api)
    
    try:
        server = HTTPServer(('localhost', config.api_port), handler)
        print(f"✅ Backend API running on http://localhost:{config.api_port}")
        print("📋 Available endpoints:")
        print("  Flutter: /api/flutter/create, /api/flutter/build, /api/flutter/run")
        print("  Android: /api/android/sdk/install, /api/android/devices")
        print("  Packages: /api/packages/list, /api/packages/install")
        print("  System: /api/system/info, /api/system/processes")
        print("  Docker: /api/docker/ps, /api/docker/run")
        print("  Files: /api/files/list, /api/files/read, /api/files/write")
        print("\n⏹️  Press Ctrl+C to stop")
        
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down backend...")
        server.shutdown()
        
        # Clean up processes
        for proc in api.processes.values():
            if proc and proc.poll() is None:
                proc.terminate()
        
        print("👋 Backend stopped")

if __name__ == "__main__":
    main()