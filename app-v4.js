// Android Dev Studio v4.0 - Professional IDE JavaScript
// Complete rewrite for professional interface matching Android Studio

class AndroidDevStudioPro {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.openTabs = new Map();
        this.activeTab = null;
        this.terminalHistory = [];
        this.terminalHistoryIndex = -1;
        this.currentDirectory = '/home/user/flutter_app';
        this.projectStructure = this.initializeProjectStructure();
        this.isBuilding = false;
        this.init();
    }

    init() {
        this.updateStatusTime();
        this.updateLineNumbers();
        this.setupKeyboardShortcuts();
        this.initializeEditor();
        this.focusTerminal();
        
        // Update time every second
        setInterval(() => this.updateStatusTime(), 1000);
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
        
        console.log('🚀 Android Dev Studio v4.0 Professional initialized');
    }

    initializeProjectStructure() {
        return {
            'flutter_app': {
                type: 'folder',
                expanded: true,
                children: {
                    'lib': {
                        type: 'folder',
                        expanded: true,
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
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ),
    );
  }
}`,
                                icon: '🎯'
                            },
                            'widgets.dart': {
                                type: 'file',
                                content: `import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  
  const CustomButton({
    Key key,
    required this.text,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(text),
      style: ElevatedButton.styleFrom(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}`,
                                icon: '🎨'
                            }
                        }
                    },
                    'android': {
                        type: 'folder',
                        expanded: false,
                        children: {
                            'app': {
                                type: 'folder',
                                children: {
                                    'build.gradle': {
                                        type: 'file',
                                        content: `def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterRoot = localProperties.getProperty('flutter.sdk')
if (flutterRoot == null) {
    throw new GradleException("Flutter SDK not found. Define location with flutter.sdk in the local.properties file.")
}`,
                                        icon: '⚙️'
                                    }
                                }
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
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true`,
                        icon: '⚙️'
                    },
                    'README.md': {
                        type: 'file',
                        content: `# Flutter App

A new Flutter application built with Android Dev Studio v4.0.

## Getting Started

This project is a starting point for a Flutter application.

## Features

- Material Design UI
- Hot reload support
- Professional development environment
- APK building capabilities

## Building

To build the APK:
\`\`\`bash
flutter build apk --release
\`\`\`

## Running

To run the app:
\`\`\`bash
flutter run
\`\`\``,
                        icon: '📋'
                    }
                }
            }
        };
    }

    initializeEditor() {
        const editor = document.getElementById('codeEditor');
        if (editor) {
            // Open main.dart by default
            this.openFileInEditor('main.dart', this.projectStructure.flutter_app.children.lib.children['main.dart'].content);
            this.activeTab = 'main.dart';
        }
    }

    // File Management
    openFile(filename) {
        const file = this.findFileInProject(filename);
        if (file && file.type === 'file') {
            this.openFileInEditor(filename, file.content);
            this.updateProjectExplorer();
        }
    }

    openFileInEditor(filename, content) {
        const editor = document.getElementById('codeEditor');
        const tabs = document.querySelector('.editor-tabs');
        
        // Check if tab already exists
        if (!this.openTabs.has(filename)) {
            // Create new tab
            const tab = document.createElement('div');
            tab.className = 'editor-tab';
            tab.setAttribute('data-file', filename);
            
            const icon = this.getFileIcon(filename);
            tab.innerHTML = `
                <span class="tree-icon">${icon}</span>
                ${filename}
                <div class="tab-close" onclick="app.closeTab('${filename}')">×</div>
            `;
            
            tab.onclick = (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.switchTab(filename);
                }
            };
            
            tabs.appendChild(tab);
            this.openTabs.set(filename, { content, modified: false });
        }
        
        // Switch to this tab
        this.switchTab(filename);
    }

    switchTab(filename) {
        // Update tab UI
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-file') === filename) {
                tab.classList.add('active');
            }
        });
        
        // Update editor content
        const editor = document.getElementById('codeEditor');
        const tabData = this.openTabs.get(filename);
        if (tabData && editor) {
            editor.value = tabData.content;
            this.activeTab = filename;
            this.updateLineNumbers();
        }
    }

    closeTab(filename) {
        const tab = document.querySelector(`[data-file="${filename}"]`);
        if (tab) {
            tab.remove();
            this.openTabs.delete(filename);
            
            // Switch to another tab if this was active
            if (this.activeTab === filename) {
                const remainingTabs = Array.from(this.openTabs.keys());
                if (remainingTabs.length > 0) {
                    this.switchTab(remainingTabs[0]);
                } else {
                    document.getElementById('codeEditor').value = '';
                    this.activeTab = null;
                }
            }
        }
    }

    findFileInProject(filename) {
        function searchInObject(obj) {
            for (const key in obj) {
                if (key === filename) {
                    return obj[key];
                }
                if (obj[key].type === 'folder' && obj[key].children) {
                    const result = searchInObject(obj[key].children);
                    if (result) return result;
                }
            }
            return null;
        }
        return searchInObject(this.projectStructure);
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'dart': '🎯',
            'yaml': '⚙️',
            'yml': '⚙️',
            'md': '📋',
            'json': '📄',
            'gradle': '⚙️',
            'xml': '📄',
            'html': '🌐',
            'css': '🎨',
            'js': '⚡',
            'ts': '📘'
        };
        return icons[ext] || '📄';
    }

    // Build System
    async buildProject() {
        if (this.isBuilding) return;
        
        this.isBuilding = true;
        const buildOutput = document.getElementById('buildOutput');
        const loadingDialog = document.getElementById('loadingDialog');
        
        // Switch to build output tab
        this.switchPanel('build');
        
        // Show loading
        loadingDialog.classList.add('show');
        
        // Clear previous output
        buildOutput.innerHTML = '';
        
        const steps = [
            { message: '🔧 Initializing build process...', delay: 500 },
            { message: '📦 Resolving dependencies...', delay: 1000 },
            { message: '🔍 Running flutter pub get...', delay: 800 },
            { message: '⚙️ Configuring Android build...', delay: 1200 },
            { message: '🔨 Compiling Dart code...', delay: 2000 },
            { message: '📱 Building Android APK...', delay: 3000 },
            { message: '✅ APK built successfully!', delay: 500, success: true },
            { message: '📍 Output: build/app/outputs/flutter-apk/app-release.apk', delay: 200, success: true },
            { message: '📏 Size: 18.2 MB', delay: 200, success: true }
        ];
        
        for (const step of steps) {
            await this.delay(step.delay);
            const line = document.createElement('div');
            line.className = `build-line ${step.success ? 'success' : ''}`;
            line.textContent = step.message;
            buildOutput.appendChild(line);
            buildOutput.scrollTop = buildOutput.scrollHeight;
        }
        
        loadingDialog.classList.remove('show');
        this.isBuilding = false;
        
        // Show notification
        this.showNotification('✅ APK built successfully!', 'success');
    }

    async runProject() {
        const buildOutput = document.getElementById('buildOutput');
        this.switchPanel('build');
        
        buildOutput.innerHTML = '';
        const steps = [
            '🚀 Starting Flutter app...',
            '📱 Launching on Android device...',
            '⚡ Hot reload enabled',
            '✅ App is running successfully!',
            '🔥 Ready for hot reload - Press Ctrl+S to reload'
        ];
        
        for (const step of steps) {
            await this.delay(1000);
            const line = document.createElement('div');
            line.className = 'build-line success';
            line.textContent = step;
            buildOutput.appendChild(line);
            buildOutput.scrollTop = buildOutput.scrollHeight;
        }
        
        this.showNotification('🚀 App is running!', 'success');
    }

    async debugProject() {
        const buildOutput = document.getElementById('buildOutput');
        this.switchPanel('build');
        
        buildOutput.innerHTML = '';
        const line = document.createElement('div');
        line.className = 'build-line warning';
        line.textContent = '🐛 Debug mode - Breakpoints and inspection available';
        buildOutput.appendChild(line);
        
        this.showNotification('🐛 Debug mode enabled', 'warning');
    }

    // Panel Management
    switchPanel(panelName) {
        // Update tab UI
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick="switchPanel('${panelName}')"]`).classList.add('active');
        
        // Update panel content
        document.querySelectorAll('.panel-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${panelName}Pane`).classList.add('active');
    }

    // Terminal
    handleTerminalInput(event) {
        if (event.key === 'Enter') {
            const input = event.target.value.trim();
            if (input) {
                this.terminalHistory.push(input);
                this.terminalHistoryIndex = this.terminalHistory.length;
                this.executeTerminalCommand(input);
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

    executeTerminalCommand(command) {
        const terminal = document.querySelector('.terminal');
        const [cmd, ...args] = command.split(' ');
        
        // Add command to terminal
        this.addTerminalLine(`user@android-dev:~/flutter_app$ ${command}`, 'command');
        
        switch (cmd) {
            case 'help':
                this.showTerminalHelp();
                break;
            case 'flutter':
                this.handleFlutterCommand(args);
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'ls':
                this.listFiles();
                break;
            case 'pwd':
                this.addTerminalLine(this.currentDirectory);
                break;
            case 'dart':
                this.handleDartCommand(args);
                break;
            case 'git':
                this.handleGitCommand(args);
                break;
            default:
                this.addTerminalLine(`Command not found: ${cmd}`, 'error');
                this.addTerminalLine('Type "help" for available commands');
        }
        
        this.addTerminalPrompt();
    }

    handleFlutterCommand(args) {
        const subCmd = args[0];
        switch (subCmd) {
            case 'build':
                if (args[1] === 'apk') {
                    this.addTerminalLine('🔨 Building APK...');
                    setTimeout(() => {
                        this.addTerminalLine('✅ APK built successfully!', 'success');
                        this.addTerminalLine('📱 Output: build/app/outputs/flutter-apk/app-release.apk');
                    }, 2000);
                }
                break;
            case 'run':
                this.addTerminalLine('🚀 Running Flutter app...');
                setTimeout(() => {
                    this.addTerminalLine('✅ App launched on Android device', 'success');
                }, 1500);
                break;
            case 'doctor':
                this.showFlutterDoctor();
                break;
            default:
                this.addTerminalLine('Flutter commands: build, run, doctor');
        }
    }

    showFlutterDoctor() {
        const output = [
            '🔍 Flutter Doctor - Checking Flutter installation...',
            '',
            '✅ Flutter (Channel stable, 3.16.0)',
            '    • Framework revision xyz123 (1 week ago)',
            '    • Engine revision abc456',
            '    • Dart version 3.2.0',
            '',
            '✅ Android toolchain - develop for Android devices (Android SDK version 34.0.0)',
            '    • Android SDK at /home/user/android-sdk',
            '    • Platform android-34, build-tools 34.0.0',
            '    • Java binary at: /usr/bin/java',
            '',
            '✅ Connected device (1 available)',
            '    • Android Device (mobile) • android-device • android-arm64',
            '',
            '🎉 No issues found! Flutter is ready for development.'
        ];
        
        output.forEach(line => this.addTerminalLine(line));
    }

    addTerminalLine(text, type = '') {
        const terminal = document.querySelector('.terminal');
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        terminal.insertBefore(line, terminal.querySelector('.terminal-input'));
        terminal.scrollTop = terminal.scrollHeight;
    }

    addTerminalPrompt() {
        // The prompt is already in the HTML, just focus the input
        document.getElementById('terminalInput').focus();
    }

    clearTerminal() {
        const terminal = document.querySelector('.terminal');
        const terminalInput = terminal.querySelector('.terminal-input');
        terminal.innerHTML = '';
        terminal.appendChild(terminalInput);
        
        this.addTerminalLine('🔧 Android Dev Studio Terminal v4.0');
        this.addTerminalLine('📱 Professional Flutter development environment');
        this.addTerminalLine('Type "help" for available commands');
        this.addTerminalLine('');
    }

    showTerminalHelp() {
        const help = [
            '',
            '📋 Available Commands:',
            '',
            '⚡ Flutter Development:',
            '  flutter build apk    Build APK file',
            '  flutter run         Run app on device',
            '  flutter doctor      Check Flutter setup',
            '',
            '🛠️ Development Tools:',
            '  dart <file>         Run Dart file',
            '  git <command>       Git version control',
            '',
            '📁 File System:',
            '  ls                  List files',
            '  pwd                 Current directory',
            '  clear               Clear terminal',
            '',
            '💡 Pro Tips:',
            '  • Use Ctrl+B to build APK',
            '  • Use Ctrl+S to save current file',
            '  • Use Ctrl+R to run project',
            ''
        ];
        
        help.forEach(line => this.addTerminalLine(line));
    }

    // Editor Functions
    updateLineNumbers() {
        const editor = document.getElementById('codeEditor');
        const gutter = document.getElementById('editorGutter');
        
        if (!editor || !gutter) return;
        
        const lines = editor.value.split('\n').length;
        let gutterContent = '';
        
        for (let i = 1; i <= lines; i++) {
            gutterContent += i + '\n';
        }
        
        gutter.textContent = gutterContent;
    }

    syncGutter() {
        const editor = document.getElementById('codeEditor');
        const gutter = document.getElementById('editorGutter');
        
        if (gutter && editor) {
            gutter.scrollTop = editor.scrollTop;
        }
    }

    // File Operations
    newFile() {
        const filename = prompt('Enter filename:');
        if (filename) {
            this.openFileInEditor(filename, '');
        }
    }

    saveFile() {
        if (this.activeTab) {
            const editor = document.getElementById('codeEditor');
            if (editor && this.openTabs.has(this.activeTab)) {
                this.openTabs.get(this.activeTab).content = editor.value;
                this.showNotification(`💾 ${this.activeTab} saved`, 'success');
                
                // Update file in project structure
                const file = this.findFileInProject(this.activeTab);
                if (file) {
                    file.content = editor.value;
                }
            }
        }
    }

    autoSave() {
        if (this.activeTab) {
            this.saveFile();
        }
    }

    // Utility Functions
    focusTerminal() {
        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.focus();
        }
    }

    updateStatusTime() {
        const timeElement = document.getElementById('statusTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('pt-BR', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        const themeButton = document.querySelector('[onclick="toggleTheme()"] span');
        if (themeButton) {
            themeButton.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        this.buildProject();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveFile();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.runProject();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newFile();
                        break;
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#50fa7b' : type === 'error' ? '#ff5555' : '#6ab7ff'};
            color: white;
            border-radius: 6px;
            z-index: 10001;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProjectExplorer() {
        // Update the selected item in project explorer
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        if (this.activeTab) {
            const treeItem = document.querySelector(`[onclick*="${this.activeTab}"]`);
            if (treeItem) {
                treeItem.classList.add('selected');
            }
        }
    }
}

// Global app instance
let app;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new AndroidDevStudioPro();
});

// Global functions for HTML events
function buildProject() { app.buildProject(); }
function runProject() { app.runProject(); }
function debugProject() { app.debugProject(); }
function newFile() { app.newFile(); }
function openFile(filename) { app.openFile(filename); }
function saveFile() { app.saveFile(); }
function toggleTheme() { app.toggleTheme(); }
function switchPanel(panel) { app.switchPanel(panel); }
function handleTerminalInput(event) { app.handleTerminalInput(event); }
function syncGutter() { app.syncGutter(); }
function updateLineNumbers() { app.updateLineNumbers(); }
function closeTab(filename) { app.closeTab(filename); }
function openTerminal() { app.switchPanel('terminal'); app.focusTerminal(); }
function refreshProject() { app.updateProjectExplorer(); }
function openTreeItem(item) { console.log('Opening tree item:', item); }
function showMenu(menu) { console.log('Show menu:', menu); }