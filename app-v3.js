// Android Dev Studio v3.0 - Complete OS Environment
// Advanced JavaScript with Flutter/Dart support and terminal emulation

class AndroidDevStudio {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.openWindows = new Set();
        this.terminalHistory = [];
        this.terminalHistoryIndex = -1;
        this.currentDirectory = '/home/user';
        this.fileSystem = this.initializeFileSystem();
        this.packages = this.initializePackages();
        this.processes = new Map();
        this.init();
    }

    init() {
        this.applyTheme();
        this.updateSystemTime();
        this.setupEventListeners();
        this.initializeTerminal();
        this.startSystemMonitoring();
        setInterval(() => this.updateSystemTime(), 1000);
    }

    // File System Simulation
    initializeFileSystem() {
        return {
            '/home/user': {
                type: 'directory',
                children: {
                    'Documents': { type: 'directory', children: {} },
                    'Downloads': { type: 'directory', children: {} },
                    'Projects': { 
                        type: 'directory', 
                        children: {
                            'flutter_app': {
                                type: 'directory',
                                children: {
                                    'lib': {
                                        type: 'directory',
                                        children: {
                                            'main.dart': { 
                                                type: 'file', 
                                                content: `import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}`
                                            }
                                        }
                                    },
                                    'pubspec.yaml': {
                                        type: 'file',
                                        content: `name: flutter_app
description: A new Flutter application.
version: 1.0.0+1

environment:
  sdk: ">=2.17.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0`
                                    }
                                }
                            },
                            'react_app': { type: 'directory', children: {} },
                            'vue_app': { type: 'directory', children: {} }
                        }
                    }
                }
            },
            '/data/data/com.termux/files': {
                type: 'directory',
                children: {
                    'usr': { type: 'directory', children: {} },
                    'home': { type: 'directory', children: {} }
                }
            }
        };
    }

    // Package System
    initializePackages() {
        return {
            flutter: [
                {
                    name: 'flutter',
                    description: 'Flutter SDK for mobile development',
                    version: '3.16.0',
                    installed: false,
                    size: '2.1 GB'
                },
                {
                    name: 'dart',
                    description: 'Dart programming language',
                    version: '3.2.0',
                    installed: true,
                    size: '150 MB'
                },
                {
                    name: 'android-sdk',
                    description: 'Android Software Development Kit',
                    version: '34.0.0',
                    installed: false,
                    size: '5.2 GB'
                }
            ],
            android: [
                {
                    name: 'gradle',
                    description: 'Build automation tool',
                    version: '8.4',
                    installed: true,
                    size: '120 MB'
                },
                {
                    name: 'android-studio',
                    description: 'Official Android IDE',
                    version: '2023.3.1',
                    installed: false,
                    size: '1.8 GB'
                }
            ],
            development: [
                {
                    name: 'git',
                    description: 'Version control system',
                    version: '2.43.0',
                    installed: true,
                    size: '45 MB'
                },
                {
                    name: 'nodejs',
                    description: 'JavaScript runtime',
                    version: '20.10.0',
                    installed: true,
                    size: '80 MB'
                },
                {
                    name: 'python',
                    description: 'Python programming language',
                    version: '3.12.0',
                    installed: true,
                    size: '120 MB'
                }
            ],
            system: [
                {
                    name: 'htop',
                    description: 'Interactive process viewer',
                    version: '3.2.2',
                    installed: false,
                    size: '8 MB'
                },
                {
                    name: 'neofetch',
                    description: 'System information tool',
                    version: '7.1.0',
                    installed: false,
                    size: '2 MB'
                }
            ]
        };
    }

    // Terminal Emulation
    initializeTerminal() {
        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.focus();
        }
    }

    handleTerminalInput(event) {
        if (event.key === 'Enter') {
            const input = event.target.value.trim();
            if (input) {
                this.terminalHistory.push(input);
                this.terminalHistoryIndex = this.terminalHistory.length;
                this.executeCommand(input);
            }
            event.target.value = '';
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.terminalHistoryIndex > 0) {
                this.terminalHistoryIndex--;
                event.target.value = this.terminalHistory[this.terminalHistoryIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.terminalHistoryIndex < this.terminalHistory.length - 1) {
                this.terminalHistoryIndex++;
                event.target.value = this.terminalHistory[this.terminalHistoryIndex];
            } else {
                this.terminalHistoryIndex = this.terminalHistory.length;
                event.target.value = '';
            }
        }
    }

    executeCommand(command) {
        const terminal = document.getElementById('terminalContent');
        const [cmd, ...args] = command.split(' ');
        
        // Add command to terminal
        this.addToTerminal(`user@android-dev:${this.currentDirectory}$ ${command}`);
        
        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'ls':
                this.listDirectory(args[0] || '.');
                break;
            case 'cd':
                this.changeDirectory(args[0] || '/home/user');
                break;
            case 'pwd':
                this.addToTerminal(this.currentDirectory);
                break;
            case 'mkdir':
                this.createDirectory(args[0]);
                break;
            case 'touch':
                this.createFile(args[0]);
                break;
            case 'cat':
                this.displayFile(args[0]);
                break;
            case 'nano':
            case 'vim':
                this.editFile(args[0]);
                break;
            case 'flutter':
                this.handleFlutterCommand(args);
                break;
            case 'dart':
                this.handleDartCommand(args);
                break;
            case 'git':
                this.handleGitCommand(args);
                break;
            case 'npm':
                this.handleNpmCommand(args);
                break;
            case 'pkg':
                this.handlePkgCommand(args);
                break;
            case 'ps':
                this.showProcesses();
                break;
            case 'kill':
                this.killProcess(args[0]);
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'neofetch':
                this.showSystemInfo();
                break;
            case 'htop':
                this.addToTerminal('Opening system monitor...');
                this.openWindow('systemMonitor');
                break;
            case 'docker':
                this.handleDockerCommand(args);
                break;
            default:
                this.addToTerminal(`Command not found: ${cmd}`);
                this.addToTerminal('Type "help" for available commands');
        }
        
        this.addTerminalPrompt();
    }

    showHelp() {
        const help = `
Available Commands:

📁 File System:
  ls [dir]          List directory contents
  cd [dir]          Change directory
  pwd               Print working directory
  mkdir <name>      Create directory
  touch <file>      Create file
  cat <file>        Display file content
  nano/vim <file>   Edit file

⚡ Flutter Development:
  flutter create <name>    Create Flutter project
  flutter run              Run Flutter app
  flutter build apk        Build APK
  flutter doctor           Check Flutter installation

🛠️ Development Tools:
  git <command>     Git version control
  npm <command>     Node package manager
  dart <file>       Run Dart file
  pkg <command>     Package manager

🖥️ System:
  ps                Show processes
  kill <pid>        Kill process
  htop              System monitor
  neofetch          System information
  clear             Clear terminal

🐳 Docker:
  docker ps         List containers
  docker run        Run container
  docker build      Build image

Type 'help <command>' for detailed help on specific commands.
        `;
        this.addToTerminal(help);
    }

    handleFlutterCommand(args) {
        const subCommand = args[0];
        
        switch (subCommand) {
            case 'create':
                const projectName = args[1];
                if (projectName) {
                    this.addToTerminal(`Creating Flutter project: ${projectName}`);
                    this.addToTerminal('Running "flutter create ${projectName}"...');
                    setTimeout(() => {
                        this.addToTerminal('✅ Flutter project created successfully!');
                        this.addToTerminal(`cd ${projectName} && flutter run`);
                    }, 2000);
                } else {
                    this.addToTerminal('Usage: flutter create <project_name>');
                }
                break;
            case 'run':
                this.addToTerminal('🚀 Running Flutter app...');
                this.addToTerminal('Launching lib/main.dart on Android device...');
                setTimeout(() => {
                    this.addToTerminal('✅ App launched successfully!');
                    this.addToTerminal('Hot reload available. Press "r" to reload.');
                }, 3000);
                break;
            case 'build':
                if (args[1] === 'apk') {
                    this.buildFlutterAPK();
                } else {
                    this.addToTerminal('Usage: flutter build apk');
                }
                break;
            case 'doctor':
                this.showFlutterDoctor();
                break;
            default:
                this.addToTerminal('Unknown Flutter command. Try: create, run, build, doctor');
        }
    }

    buildFlutterAPK() {
        this.addToTerminal('🔨 Building APK...');
        this.addToTerminal('Running Gradle task :app:assembleRelease...');
        
        const progress = ['▱▱▱▱▱▱▱▱▱▱', '█▱▱▱▱▱▱▱▱▱', '██▱▱▱▱▱▱▱▱', '███▱▱▱▱▱▱▱', '████▱▱▱▱▱▱', '█████▱▱▱▱▱', '██████▱▱▱▱', '███████▱▱▱', '████████▱▱', '█████████▱', '██████████'];
        let i = 0;
        
        const interval = setInterval(() => {
            this.updateLastTerminalLine(`Building APK... ${progress[i]} ${Math.round(i * 10)}%`);
            i++;
            if (i >= progress.length) {
                clearInterval(interval);
                this.addToTerminal('');
                this.addToTerminal('✅ APK built successfully!');
                this.addToTerminal('📱 APK location: build/app/outputs/flutter-apk/app-release.apk');
                this.addToTerminal('Size: 18.2 MB');
            }
        }, 300);
    }

    showFlutterDoctor() {
        this.addToTerminal('Flutter Doctor - Checking Flutter installation...');
        this.addToTerminal('');
        this.addToTerminal('✅ Flutter (Channel stable, 3.16.0)');
        this.addToTerminal('✅ Android toolchain - develop for Android devices');
        this.addToTerminal('⚠️  Android Studio (not installed)');
        this.addToTerminal('✅ VS Code (version 1.84.0)');
        this.addToTerminal('✅ Connected device (1 available)');
        this.addToTerminal('');
        this.addToTerminal('No issues found! Flutter is ready for development.');
    }

    handleDartCommand(args) {
        const fileName = args[0];
        if (fileName) {
            this.addToTerminal(`Running Dart file: ${fileName}`);
            if (fileName.endsWith('.dart')) {
                this.addToTerminal('Hello from Dart!');
            } else {
                this.addToTerminal('Please provide a .dart file');
            }
        } else {
            this.addToTerminal('Usage: dart <file.dart>');
        }
    }

    handleGitCommand(args) {
        const subCommand = args[0];
        switch (subCommand) {
            case 'status':
                this.addToTerminal('On branch main');
                this.addToTerminal('Your branch is up to date with origin/main');
                this.addToTerminal('nothing to commit, working tree clean');
                break;
            case 'clone':
                const repo = args[1];
                if (repo) {
                    this.addToTerminal(`Cloning ${repo}...`);
                    setTimeout(() => this.addToTerminal('✅ Repository cloned successfully!'), 2000);
                } else {
                    this.addToTerminal('Usage: git clone <repository_url>');
                }
                break;
            default:
                this.addToTerminal(`Git command: ${subCommand}`);
        }
    }

    handleDockerCommand(args) {
        const subCommand = args[0];
        switch (subCommand) {
            case 'ps':
                this.addToTerminal('CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS   NAMES');
                this.addToTerminal('No containers running');
                break;
            case 'run':
                this.addToTerminal('🐳 Docker containers coming soon!');
                break;
            default:
                this.addToTerminal('Docker: The container platform');
        }
    }

    listDirectory(path) {
        const fullPath = this.resolvePath(path);
        const dir = this.getDirectoryContents(fullPath);
        
        if (dir && dir.type === 'directory') {
            this.addToTerminal(`Contents of ${fullPath}:`);
            Object.keys(dir.children).forEach(name => {
                const item = dir.children[name];
                const prefix = item.type === 'directory' ? '📁' : '📄';
                this.addToTerminal(`${prefix} ${name}`);
            });
        } else {
            this.addToTerminal(`ls: cannot access '${path}': No such file or directory`);
        }
    }

    changeDirectory(path) {
        const fullPath = this.resolvePath(path);
        const dir = this.getDirectoryContents(fullPath);
        
        if (dir && dir.type === 'directory') {
            this.currentDirectory = fullPath;
        } else {
            this.addToTerminal(`cd: no such file or directory: ${path}`);
        }
    }

    displayFile(fileName) {
        const fullPath = this.resolvePath(fileName);
        const file = this.getDirectoryContents(fullPath);
        
        if (file && file.type === 'file') {
            this.addToTerminal(file.content || `Content of ${fileName}`);
        } else {
            this.addToTerminal(`cat: ${fileName}: No such file or directory`);
        }
    }

    showSystemInfo() {
        const info = `
                   -\`                    user@android-dev 
                  .o+\`                   ----------------- 
                 \`ooo/                   OS: Android Dev Studio v3.0
                \`+oooo:                  Host: Android Device
               \`+oooooo:                 Kernel: Linux 5.10.226-android
               -+oooooo+:                Uptime: 2 hours, 34 mins
             \`/:-:++oooo+:               Packages: 1247 (pkg)
            \`/++++/+++++++:              Shell: bash 5.2.15
           \`/++++++++++++++:             Resolution: 1080x2400
          \`/+++ooooooooooooo/\`           DE: Android Dev Studio
         ./ooosssso++osssssso+\`          WM: Custom Window Manager
        .oossssso-\`\`\`\`/ossssss+\`         Theme: Dark/Light [GTK3]
       -osssssso.      :ssssssso.        Icons: Material Design
      :osssssss/        osssso+++.       Terminal: Web Terminal
     /ossssssss/        +ssssooo/-       CPU: ARM64 8-core
   \`/ossssso+/:-        -:/+osssso+-     Memory: 2156MiB / 3072MiB
  \`+sso+:-\`                 \`.-/+oso:    
 \`++:.                           \`-/+/   
 .\`                                 \`/
        `;
        this.addToTerminal(info);
    }

    // Window Management
    openWindow(windowId) {
        const window = document.getElementById(`${windowId}Window`);
        if (window) {
            window.classList.add('active');
            window.classList.add('window-appear');
            this.openWindows.add(windowId);
            this.updateTaskbar();
            this.populateWindowContent(windowId);
        }
    }

    closeWindow(windowId) {
        const window = document.getElementById(`${windowId}Window`);
        if (window) {
            window.classList.remove('active');
            this.openWindows.delete(windowId);
            this.updateTaskbar();
        }
    }

    populateWindowContent(windowId) {
        switch (windowId) {
            case 'fileManager':
                this.populateFileManager();
                break;
            case 'packageManager':
                this.showPackages('flutter');
                break;
        }
    }

    populateFileManager() {
        const fileGrid = document.getElementById('fileGrid');
        const currentDir = this.getDirectoryContents(this.currentDirectory);
        
        if (currentDir && currentDir.children) {
            fileGrid.innerHTML = '';
            Object.keys(currentDir.children).forEach(name => {
                const item = currentDir.children[name];
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <div class="file-icon">${item.type === 'directory' ? '📁' : '📄'}</div>
                    <div class="file-name">${name}</div>
                `;
                fileGrid.appendChild(fileItem);
            });
        }
    }

    showPackages(category) {
        const packageList = document.getElementById('packageList');
        const packages = this.packages[category] || [];
        
        packageList.innerHTML = `<h4>📦 ${category.charAt(0).toUpperCase() + category.slice(1)} Packages</h4>`;
        
        packages.forEach(pkg => {
            const packageItem = document.createElement('div');
            packageItem.className = 'package-item';
            packageItem.innerHTML = `
                <div class="package-info">
                    <h4>${pkg.name}</h4>
                    <p>${pkg.description}</p>
                    <small>Version: ${pkg.version} | Size: ${pkg.size}</small>
                </div>
                <button class="install-btn" onclick="installPackage('${pkg.name}')" 
                        ${pkg.installed ? 'disabled' : ''}>
                    ${pkg.installed ? '✅ Installed' : '📥 Install'}
                </button>
            `;
            packageList.appendChild(packageItem);
        });
    }

    installPackage(packageName) {
        this.addToTerminal(`Installing ${packageName}...`);
        setTimeout(() => {
            this.addToTerminal(`✅ ${packageName} installed successfully!`);
        }, 2000);
    }

    // Build APK Function
    buildAPK() {
        const console = document.getElementById('ideConsole');
        const compilerOutput = document.getElementById('compilerOutput');
        
        if (compilerOutput) {
            compilerOutput.innerHTML = '🔨 Building APK...\nRunning: flutter build apk --release\n';
            
            setTimeout(() => {
                compilerOutput.innerHTML += 'Gradle task :app:assembleRelease\n';
            }, 1000);
            
            setTimeout(() => {
                compilerOutput.innerHTML += '✅ APK built successfully!\n📱 Output: build/app/outputs/flutter-apk/app-release.apk\n';
            }, 3000);
        }
        
        if (console) {
            console.innerHTML += '<div>🔨 Starting APK build process...</div>';
        }
    }

    buildDebugAPK() {
        const output = document.getElementById('compilerOutput');
        output.innerHTML = '🐛 Building Debug APK...\n';
        
        setTimeout(() => {
            output.innerHTML += 'Running: flutter build apk --debug\n';
            output.innerHTML += '✅ Debug APK built!\n📱 Size: 22.1 MB\n';
        }, 2000);
    }

    buildReleaseAPK() {
        const output = document.getElementById('compilerOutput');
        output.innerHTML = '🚀 Building Release APK...\n';
        
        setTimeout(() => {
            output.innerHTML += 'Running: flutter build apk --release\n';
            output.innerHTML += 'Optimizing code...\n';
            output.innerHTML += '✅ Release APK built!\n📱 Size: 18.2 MB\n';
        }, 3000);
    }

    // Utility Functions
    addToTerminal(text) {
        const terminal = document.getElementById('terminalContent');
        const div = document.createElement('div');
        div.textContent = text;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    }

    addTerminalPrompt() {
        const terminal = document.getElementById('terminalContent');
        const promptDiv = document.createElement('div');
        promptDiv.className = 'terminal-input';
        promptDiv.innerHTML = `
            <span class="terminal-prompt">user@android-dev:${this.currentDirectory}$ </span>
            <input type="text" onkeypress="app.handleTerminalInput(event)">
        `;
        terminal.appendChild(promptDiv);
        terminal.scrollTop = terminal.scrollHeight;
        
        // Focus on new input
        const newInput = promptDiv.querySelector('input');
        newInput.focus();
    }

    resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        }
        if (path === '.') {
            return this.currentDirectory;
        }
        if (path === '..') {
            const parts = this.currentDirectory.split('/').filter(p => p);
            parts.pop();
            return '/' + parts.join('/');
        }
        return this.currentDirectory + '/' + path;
    }

    getDirectoryContents(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem;
        
        for (const part of parts) {
            if (current[part]) {
                current = current[part];
            } else {
                return null;
            }
        }
        
        return current;
    }

    updateTaskbar() {
        const taskbarApps = document.getElementById('taskbarApps');
        taskbarApps.innerHTML = '';
        
        this.openWindows.forEach(windowId => {
            const app = document.createElement('div');
            app.className = 'taskbar-app active';
            app.textContent = this.getWindowTitle(windowId);
            app.onclick = () => this.focusWindow(windowId);
            taskbarApps.appendChild(app);
        });
    }

    getWindowTitle(windowId) {
        const titles = {
            terminal: '💻 Terminal',
            fileManager: '📁 Files',
            ide: '⚡ Flutter IDE',
            packageManager: '📦 Packages',
            systemMonitor: '📊 System',
            compiler: '🔨 APK Builder'
        };
        return titles[windowId] || windowId;
    }

    updateSystemTime() {
        const timeElement = document.getElementById('systemTime');
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    startSystemMonitoring() {
        // Simulate system monitoring
        setInterval(() => {
            // Update system metrics
        }, 5000);
    }

    toggleStartMenu() {
        const startMenu = document.getElementById('startMenuPanel');
        startMenu.classList.toggle('active');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeButton = document.querySelector('[onclick="toggleTheme()"]');
        if (themeButton) {
            themeButton.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    setupEventListeners() {
        // Close start menu when clicking outside
        document.addEventListener('click', (e) => {
            const startMenu = document.getElementById('startMenuPanel');
            const startButton = document.querySelector('.start-menu');
            
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.classList.remove('active');
            }
        });

        // Framework tabs
        document.querySelectorAll('.framework-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.framework-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const framework = tab.dataset.framework;
                this.switchFramework(framework);
            });
        });
    }

    switchFramework(framework) {
        const editor = document.getElementById('codeEditor');
        const templates = {
            flutter: `import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter App',
      home: HomePage(),
    );
  }
}`,
            react: `import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Hello React!</h1>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
            vue: `<template>
  <div id="app">
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      message: 'Hello Vue!'
    }
  }
}
</script>`,
            angular: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h1>{{title}}</h1>
  \`
})
export class AppComponent {
  title = 'Hello Angular!';
}`
        };
        
        if (editor && templates[framework]) {
            editor.value = templates[framework];
        }
    }

    clearTerminal() {
        const terminal = document.getElementById('terminalContent');
        terminal.innerHTML = `
            <div>🔧 Android Dev Studio Terminal v3.0</div>
            <div>📱 Ubuntu-like environment for Android development</div>
            <div>Type 'help' for available commands</div>
            <div></div>
        `;
        this.addTerminalPrompt();
    }

    updateLastTerminalLine(text) {
        const terminal = document.getElementById('terminalContent');
        const lastDiv = terminal.lastElementChild;
        if (lastDiv) {
            lastDiv.textContent = text;
        }
    }
}

// Global functions for HTML events
let app;

window.addEventListener('DOMContentLoaded', () => {
    app = new AndroidDevStudio();
});

function openWindow(windowId) {
    app.openWindow(windowId);
}

function closeWindow(windowId) {
    app.closeWindow(windowId);
}

function toggleStartMenu() {
    app.toggleStartMenu();
}

function toggleTheme() {
    app.toggleTheme();
}

function buildAPK() {
    app.buildAPK();
}

function buildDebugAPK() {
    app.buildDebugAPK();
}

function buildReleaseAPK() {
    app.buildReleaseAPK();
}

function showPackages(category) {
    app.showPackages(category);
}

function installPackage(packageName) {
    app.installPackage(packageName);
}

function navigateToFolder(folder) {
    app.changeDirectory(`/home/user/${folder}`);
    app.populateFileManager();
}

function openFile(fileName) {
    const editor = document.getElementById('codeEditor');
    const file = app.getDirectoryContents(`${app.currentDirectory}/${fileName}`);
    if (file && file.content && editor) {
        editor.value = file.content;
    }
}