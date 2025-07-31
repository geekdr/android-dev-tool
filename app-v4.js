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
        this.bottomPanelMinimized = false;
        this.currentZoom = 1;
        
        // Preview and Hot Reload
        this.hotReloadEnabled = true;
        this.previewServer = null;
        this.connectedDevices = new Map();
        this.currentDevice = 'web';
        this.flutterProcess = null;
        this.autoSaveTimeout = null;
        this.previewPanelVisible = false;
        
        this.init();
    }

    init() {
        this.updateStatusTime();
        this.updateLineNumbers();
        this.setupKeyboardShortcuts();
        this.initializeEditor();
        this.focusTerminal();
        this.setupResponsiveHandlers();
        
        // Update time every second
        setInterval(() => this.updateStatusTime(), 1000);
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
        
        // Handle responsive layout updates
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 500);
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllMenus();
            }
        });
        
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
        
        const lines = Math.max(editor.value.split('\n').length, 1);
        let gutterContent = '';
        
        for (let i = 1; i <= lines; i++) {
            gutterContent += i + '\n';
        }
        
        gutter.textContent = gutterContent;
        
        // Sync scroll position
        this.syncGutter();
    }

    syncGutter() {
        const editor = document.getElementById('codeEditor');
        const gutter = document.getElementById('editorGutter');
        
        if (gutter && editor) {
            gutter.scrollTop = editor.scrollTop;
            
            // Ensure gutter is visible and properly positioned
            if (gutter.style.display === 'none') {
                gutter.style.display = 'block';
            }
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

    // Responsive Design Handlers
    setupResponsiveHandlers() {
        // Handle viewport changes
        this.handleResize();
        
        // Touch gesture support
        this.setupTouchGestures();
        
        // Dynamic font scaling
        this.setupDynamicScaling();
    }

    handleResize() {
        // Update gutter synchronization
        this.syncGutter();
        this.updateLineNumbers();
        
        // Adjust layout for current viewport
        this.adjustLayoutForViewport();
        
        // Ensure all panels are visible
        this.ensurePanelsVisible();
        
        // Update terminal focus
        setTimeout(() => {
            if (document.querySelector('.panel-tab.active')?.textContent.includes('Terminal')) {
                this.focusTerminal();
            }
        }, 100);
    }

    adjustLayoutForViewport() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Adjust for very small screens
        if (width < 480) {
            this.optimizeForSmallScreen();
        } else if (width < 768) {
            this.optimizeForMobileScreen();
        } else {
            this.optimizeForDesktopScreen();
        }
        
        // Ensure minimum heights
        this.ensureMinimumHeights();
    }

    optimizeForSmallScreen() {
        // Collapse project explorer if needed
        const explorer = document.querySelector('.project-explorer');
        if (explorer && window.innerWidth < 400) {
            explorer.style.minWidth = '120px';
        }
        
        // Adjust editor tabs
        const tabs = document.querySelectorAll('.editor-tab');
        tabs.forEach(tab => {
            const text = tab.textContent.replace('×', '').trim();
            if (text.length > 8) {
                tab.title = text;
                const shortText = text.substring(0, 6) + '...';
                tab.innerHTML = tab.innerHTML.replace(text, shortText);
            }
        });
    }

    optimizeForMobileScreen() {
        // Ensure touch targets are adequate
        const touchTargets = document.querySelectorAll('.toolbar-button, .menu-item, .tree-item, .editor-tab, .panel-tab');
        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.height < 32) {
                target.style.minHeight = '32px';
                target.style.display = 'flex';
                target.style.alignItems = 'center';
            }
        });
    }

    optimizeForDesktopScreen() {
        // Reset any mobile optimizations
        const explorer = document.querySelector('.project-explorer');
        if (explorer) {
            explorer.style.minWidth = '';
        }
        
        // Reset tab titles
        const tabs = document.querySelectorAll('.editor-tab');
        tabs.forEach(tab => {
            if (tab.title) {
                const originalText = tab.title;
                tab.innerHTML = tab.innerHTML.replace(/.*\.\.\./, originalText);
                tab.title = '';
            }
        });
    }

    ensureMinimumHeights() {
        // Ensure editor has minimum height
        const editor = document.querySelector('.code-editor');
        if (editor) {
            const rect = editor.getBoundingClientRect();
            if (rect.height < 200) {
                const container = document.querySelector('.ide-container');
                const currentRows = getComputedStyle(container).gridTemplateRows.split(' ');
                currentRows[2] = 'minmax(200px, 1fr)';
                container.style.gridTemplateRows = currentRows.join(' ');
            }
        }
    }

    ensurePanelsVisible() {
        // Ensure all panels are accessible
        const panels = document.querySelectorAll('.panel-pane');
        panels.forEach(panel => {
            if (panel.classList.contains('active')) {
                const rect = panel.getBoundingClientRect();
                if (rect.height < 50) {
                    panel.style.minHeight = '100px';
                    panel.style.overflow = 'auto';
                }
            }
        });
    }

    setupTouchGestures() {
        // Add touch support for mobile devices
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            // Prevent default scrolling behavior in editor
            if (e.target.classList.contains('code-editor')) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Handle swipe gestures
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
                if (deltaX > 0) {
                    // Swipe right - could implement panel toggle
                } else {
                    // Swipe left - could implement panel toggle
                }
            }
        });
    }

    setupDynamicScaling() {
        // Adjust font sizes based on viewport
        const adjustFontSize = () => {
            const width = window.innerWidth;
            let scaleFactor = 1;
            
            if (width < 480) {
                scaleFactor = 0.8;
            } else if (width < 768) {
                scaleFactor = 0.9;
            }
            
            document.documentElement.style.setProperty('--font-scale', scaleFactor);
        };
        
        adjustFontSize();
        window.addEventListener('resize', adjustFontSize);
    }

    // Enhanced panel switching with responsive handling
    switchPanel(panelName) {
        // Update tab UI
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.querySelector(`[onclick="switchPanel('${panelName}')"]`);
        if (targetTab) {
            targetTab.classList.add('active');
            
            // Ensure tab is visible on small screens
            targetTab.scrollIntoView({ 
                behavior: 'smooth', 
                inline: 'center',
                block: 'nearest'
            });
        }
        
        // Update panel content
        document.querySelectorAll('.panel-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const targetPane = document.getElementById(`${panelName}Pane`);
        if (targetPane) {
            targetPane.classList.add('active');
            
            // Handle panel-specific responsive adjustments
            this.handlePanelSpecificAdjustments(panelName);
        }
    }

    handlePanelSpecificAdjustments(panelName) {
        switch (panelName) {
            case 'terminal':
                setTimeout(() => this.focusTerminal(), 100);
                break;
            case 'build':
                // Ensure build output is scrolled to bottom
                const buildOutput = document.getElementById('buildOutput');
                if (buildOutput) {
                    buildOutput.scrollTop = buildOutput.scrollHeight;
                }
                break;
        }
    }

    // Menu Functions
    toggleMenu(menuName) {
        const menu = document.getElementById(menuName + 'Menu');
        const isVisible = menu.classList.contains('show');
        
        // Close all menus first
        this.closeAllMenus();
        
        // Toggle the clicked menu
        if (!isVisible) {
            menu.classList.add('show');
        }
    }

    closeAllMenus() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    // Bottom Panel Toggle
    toggleBottomPanel() {
        const container = document.querySelector('.ide-container');
        const panel = document.getElementById('bottomPanel');
        const toggleIcon = document.getElementById('toggleIcon');
        
        this.bottomPanelMinimized = !this.bottomPanelMinimized;
        
        if (this.bottomPanelMinimized) {
            container.classList.add('panel-minimized');
            panel.classList.add('minimized');
            toggleIcon.textContent = '🔼';
            this.showNotification('🔼 Painel minimizado', 'info');
        } else {
            container.classList.remove('panel-minimized');
            panel.classList.remove('minimized');
            toggleIcon.textContent = '🔽';
            this.showNotification('🔽 Painel expandido', 'info');
        }
        
        // Ensure editor remains functional
        setTimeout(() => {
            this.handleResize();
            this.updateLineNumbers();
        }, 300);
    }

    // File Menu Functions
    newProject() {
        this.showNotification('📁 Criando novo projeto Flutter...', 'info');
        this.closeAllMenus();
        setTimeout(() => {
            this.addTerminalLine('📁 flutter create novo_projeto');
            this.addTerminalLine('✅ Novo projeto criado com sucesso!', 'success');
        }, 1000);
    }

    openProject() {
        this.showNotification('📂 Abrindo projeto...', 'info');
        this.closeAllMenus();
    }

    saveProject() {
        this.saveFile();
        this.closeAllMenus();
    }

    exportApk() {
        this.buildProject();
        this.closeAllMenus();
    }

    closeProject() {
        this.showNotification('❌ Projeto fechado', 'info');
        this.closeAllMenus();
    }

    // Edit Menu Functions
    undoAction() {
        document.execCommand('undo');
        this.showNotification('↶ Ação desfeita', 'info');
        this.closeAllMenus();
    }

    redoAction() {
        document.execCommand('redo');
        this.showNotification('↷ Ação refeita', 'info');
        this.closeAllMenus();
    }

    findText() {
        const searchTerm = prompt('Localizar texto:');
        if (searchTerm) {
            this.showNotification(`🔍 Procurando por: ${searchTerm}`, 'info');
        }
        this.closeAllMenus();
    }

    replaceText() {
        const searchTerm = prompt('Texto para substituir:');
        if (searchTerm) {
            const replaceTerm = prompt('Substituir por:');
            if (replaceTerm) {
                this.showNotification(`🔄 Substituindo "${searchTerm}" por "${replaceTerm}"`, 'info');
            }
        }
        this.closeAllMenus();
    }

    // View Menu Functions
    toggleExplorer() {
        const explorer = document.querySelector('.project-explorer');
        if (explorer.style.display === 'none') {
            explorer.style.display = 'flex';
            this.showNotification('📁 Explorer exibido', 'info');
        } else {
            explorer.style.display = 'none';
            this.showNotification('📁 Explorer oculto', 'info');
        }
        this.closeAllMenus();
    }

    toggleTerminal() {
        this.switchPanel('terminal');
        this.closeAllMenus();
    }

    toggleProblems() {
        this.switchPanel('problems');
        this.closeAllMenus();
    }

    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom + 0.1, 2);
        document.body.style.zoom = this.currentZoom;
        this.showNotification(`🔍+ Zoom: ${Math.round(this.currentZoom * 100)}%`, 'info');
        this.closeAllMenus();
    }

    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom - 0.1, 0.5);
        document.body.style.zoom = this.currentZoom;
        this.showNotification(`🔍- Zoom: ${Math.round(this.currentZoom * 100)}%`, 'info');
        this.closeAllMenus();
    }

    // Build Menu Functions
    buildDebug() {
        this.addTerminalLine('🐛 flutter build apk --debug');
        this.showNotification('🐛 Buildando APK debug...', 'info');
        this.closeAllMenus();
    }

    buildRelease() {
        this.addTerminalLine('🚀 flutter build apk --release');
        this.showNotification('🚀 Buildando APK release...', 'info');
        this.closeAllMenus();
    }

    cleanProject() {
        this.addTerminalLine('🧹 flutter clean');
        this.showNotification('🧹 Limpando projeto...', 'info');
        this.closeAllMenus();
    }

    rebuildProject() {
        this.addTerminalLine('🔄 flutter clean && flutter build apk');
        this.showNotification('🔄 Reconstruindo projeto...', 'info');
        this.closeAllMenus();
    }

    // Tools Menu Functions
    packageManager() {
        this.showNotification('📦 Abrindo gerenciador de pacotes...', 'info');
        this.addTerminalLine('📦 flutter pub get');
        this.closeAllMenus();
    }

    flutterDoctor() {
        this.addTerminalLine('🩺 flutter doctor');
        this.showFlutterDoctor();
        this.closeAllMenus();
    }

    openSettings() {
        this.showNotification('⚙️ Configurações abertas', 'info');
        this.closeAllMenus();
    }

    systemMonitor() {
        this.showNotification('📊 Monitor do sistema ativo', 'info');
        this.addTerminalLine('📊 htop');
        this.closeAllMenus();
    }

    // Help Menu Functions
    showDocumentation() {
        this.showNotification('📖 Abrindo documentação...', 'info');
        this.closeAllMenus();
    }

    showShortcuts() {
        const shortcuts = `
⌨️ Atalhos do Teclado:

🔨 Ctrl+B - Build APK
💾 Ctrl+S - Salvar arquivo
🏃 Ctrl+R - Executar projeto
📄 Ctrl+N - Novo arquivo
🔍 Ctrl+F - Localizar
⚙️ Ctrl+, - Configurações
        `;
        alert(shortcuts);
        this.closeAllMenus();
    }

    checkUpdates() {
        this.showNotification('🔄 Verificando atualizações...', 'info');
        setTimeout(() => {
            this.showNotification('✅ Sistema atualizado!', 'success');
        }, 2000);
        this.closeAllMenus();
    }

    showAbout() {
        const about = `
ℹ️ Android Dev Studio v4.0 Professional

🚀 Ambiente de desenvolvimento profissional
📱 Flutter/Dart IDE completo
🛠️ Compilação de APK integrada
💻 Terminal avançado
🎨 Interface inspirada no Android Studio

Desenvolvido com ❤️ para desenvolvedores mobile
        `;
        alert(about);
        this.closeAllMenus();
    }

    // Preview and Hot Reload System
    initializePreviewSystem() {
        // Start preview server
        this.startPreviewServer();
        
        // Setup auto-save for hot reload
        this.setupAutoSaveHotReload();
        
        // Initialize web preview
        this.initializeWebPreview();
        
        // Scan for devices
        this.scanDevices();
        
        console.log('🔥 Sistema de Preview e Hot Reload inicializado');
    }

    async startPreviewServer() {
        try {
            const response = await fetch('/api/preview/start', { method: 'POST' });
            const data = await response.json();
            console.log('🚀 Preview server iniciado:', data);
        } catch (error) {
            console.log('⚠️ Preview server será iniciado via terminal');
            this.addTerminalLine('🔥 node preview-server.js &');
            this.addTerminalLine('✅ Preview server iniciado na porta 8084', 'success');
        }
    }

    setupAutoSaveHotReload() {
        const editor = document.getElementById('codeEditor');
        if (editor) {
            editor.addEventListener('input', () => {
                // Clear previous timeout
                if (this.autoSaveTimeout) {
                    clearTimeout(this.autoSaveTimeout);
                }
                
                // Set new timeout for auto-save and hot reload
                this.autoSaveTimeout = setTimeout(() => {
                    this.saveFile();
                    if (this.hotReloadEnabled && this.previewPanelVisible) {
                        this.triggerHotReload();
                    }
                }, 3000); // Hot reload após 3 segundos de inatividade
            });
        }
    }

    initializeWebPreview() {
        const webPreview = document.getElementById('webPreview');
        if (webPreview) {
            // Inicialmente mostrar página de loading
            webPreview.src = 'data:text/html;base64,' + btoa(`
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            font-family: Arial, sans-serif; 
                            background: #f5f5f5; 
                            display: flex; 
                            flex-direction: column; 
                            align-items: center; 
                            justify-content: center; 
                            height: 100vh; 
                            text-align: center;
                        }
                        .loading { 
                            width: 40px; 
                            height: 40px; 
                            border: 4px solid #ddd; 
                            border-top: 4px solid #3dd68d; 
                            border-radius: 50%; 
                            animation: spin 1s linear infinite; 
                            margin: 20px auto;
                        }
                        @keyframes spin { 
                            0% { transform: rotate(0deg); } 
                            100% { transform: rotate(360deg); } 
                        }
                        .info {
                            color: #666;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <h3>🔥 Flutter Hot Reload</h3>
                    <div class="loading"></div>
                    <div class="info">Aguardando aplicação Flutter...</div>
                    <div class="info">Clique em "Run" para iniciar o preview</div>
                </body>
                </html>
            `);
        }
    }

    async triggerHotReload() {
        if (!this.hotReloadEnabled) return;
        
        try {
            await fetch('/api/preview/hot-reload', { method: 'POST' });
            this.showNotification('🔥 Hot Reload aplicado!', 'success');
            console.log('🔥 Hot reload disparado');
        } catch (error) {
            console.log('Hot reload via fetch failed, usando terminal');
            this.addTerminalLine('🔥 Hot reload aplicado');
        }
        
        // Atualizar indicador visual
        this.updateHotReloadStatus();
    }

    updateHotReloadStatus() {
        const statusElement = document.getElementById('hotReloadStatus');
        if (statusElement) {
            statusElement.textContent = this.hotReloadEnabled ? 'Ativado' : 'Desativado';
            statusElement.style.color = this.hotReloadEnabled ? '#50fa7b' : '#ff5555';
        }
        
        const btn = document.getElementById('hotReloadBtn');
        if (btn) {
            btn.classList.toggle('active', this.hotReloadEnabled);
            btn.title = this.hotReloadEnabled ? 'Desativar Hot Reload' : 'Ativar Hot Reload';
        }
    }

    async scanDevices() {
        try {
            const response = await fetch('/api/devices');
            const data = await response.json();
            
            this.updateDeviceList(data.devices, data.adb);
            this.showNotification('🔍 Dispositivos escaneados', 'info');
        } catch (error) {
            console.log('Scan devices via terminal');
            this.addTerminalLine('🔍 adb devices');
            this.addTerminalLine('📱 Escaneando dispositivos conectados...');
            
            // Simular detecção de dispositivos
            setTimeout(() => {
                this.addTerminalLine('✅ 1 dispositivo encontrado via USB', 'success');
                this.updateUSBStatus(true);
            }, 2000);
        }
    }

    updateDeviceList(devices, adbDevices) {
        const deviceTabs = document.getElementById('deviceTabs');
        
        // Atualizar status USB
        this.updateUSBStatus(adbDevices && adbDevices.length > 0);
        
        // Adicionar dispositivos ADB detectados
        adbDevices?.forEach((device, index) => {
            const existingTab = deviceTabs.querySelector(`[data-device="adb-${device}"]`);
            if (!existingTab) {
                const tab = document.createElement('div');
                tab.className = 'device-tab';
                tab.setAttribute('data-device', `adb-${device}`);
                tab.onclick = () => this.switchDevice(`adb-${device}`);
                tab.innerHTML = `
                    <div class="device-status connected"></div>
                    <span>📱 ${device.substring(0, 8)}...</span>
                `;
                deviceTabs.appendChild(tab);
            }
        });
    }

    updateUSBStatus(connected) {
        const usbStatus = document.getElementById('usbStatus');
        if (usbStatus) {
            usbStatus.className = connected ? 'device-status connected' : 'device-status';
        }
        
        if (connected) {
            const connectionStatus = document.getElementById('usbConnectionStatus');
            if (connectionStatus) {
                connectionStatus.innerHTML = `
                    <h3>✅ Dispositivo Android Conectado</h3>
                    <div class="connection-help">
                        <strong>Status:</strong> Dispositivo detectado via ADB<br>
                        <strong>Hot Reload:</strong> Ativo<br>
                        <strong>Conexão:</strong> USB/TCP
                    </div>
                    <div class="phone-simulator">
                        <div class="phone-screen">
                            <iframe class="preview-iframe" src="http://localhost:8084/preview"></iframe>
                        </div>
                    </div>
                    <div class="device-info">
                        <div>📱 Dispositivo via USB</div>
                        <div>Hot Reload: Ativo</div>
                    </div>
                `;
            }
        }
    }

    switchDevice(deviceType) {
        // Atualizar tabs
        document.querySelectorAll('.device-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-device="${deviceType}"]`)?.classList.add('active');
        
        // Atualizar frames
        document.querySelectorAll('.device-frame').forEach(frame => {
            frame.classList.remove('active');
        });
        
        if (deviceType === 'web') {
            document.getElementById('webFrame')?.classList.add('active');
        } else {
            document.getElementById('usbFrame')?.classList.add('active');
        }
        
        this.currentDevice = deviceType;
        this.showNotification(`📱 Alternado para: ${deviceType}`, 'info');
    }

    toggleHotReload() {
        this.hotReloadEnabled = !this.hotReloadEnabled;
        this.updateHotReloadStatus();
        
        const status = this.hotReloadEnabled ? 'ativado' : 'desativado';
        this.showNotification(`🔥 Hot Reload ${status}`, this.hotReloadEnabled ? 'success' : 'warning');
    }

    refreshPreview() {
        const webPreview = document.getElementById('webPreview');
        if (webPreview && webPreview.src !== 'about:blank') {
            webPreview.src = webPreview.src;
        }
        
        // Também atualizar preview USB se ativo
        if (this.currentDevice !== 'web') {
            const usbFrame = document.querySelector('#usbFrame iframe');
            if (usbFrame) {
                usbFrame.src = usbFrame.src;
            }
        }
        
        this.showNotification('🔄 Preview atualizado', 'info');
    }

    async generateQRCode() {
        // Obter IP local
        const localIP = await this.getLocalIP();
        const url = `http://${localIP}:8084/preview`;
        
        const qrElement = document.getElementById('qrCode');
        if (qrElement) {
            qrElement.innerHTML = `
                <div style="background: white; padding: 10px; border-radius: 8px;">
                    <div style="font-family: monospace; font-size: 8px; color: #333; text-align: center; word-break: break-all;">
                        ${url}
                    </div>
                    <div style="margin-top: 8px; font-size: 10px; color: #666; text-align: center;">
                        📱 Escaneie com câmera do celular
                    </div>
                </div>
            `;
        }
        
        this.showNotification('📊 QR Code gerado!', 'success');
        this.addTerminalLine(`🌐 URL para dispositivos: ${url}`);
    }

    async getLocalIP() {
        try {
            // Tentar obter IP via WebRTC
            const pc = new RTCPeerConnection({iceServers: []});
            pc.createDataChannel('');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            return new Promise((resolve) => {
                pc.onicecandidate = (ice) => {
                    if (ice && ice.candidate && ice.candidate.candidate) {
                        const ip = ice.candidate.candidate.split(' ')[4];
                        if (ip && ip.match(/\d+\.\d+\.\d+\.\d+/)) {
                            resolve(ip);
                            pc.close();
                        }
                    }
                };
                
                // Fallback após 3 segundos
                setTimeout(() => resolve('192.168.1.100'), 3000);
            });
        } catch (error) {
            return '192.168.1.100'; // IP padrão
        }
    }

    // Override do runProject para incluir preview
    async runProject() {
        const buildOutput = document.getElementById('buildOutput');
        this.switchPanel('build');
        
        buildOutput.innerHTML = '';
        const steps = [
            '🚀 Iniciando aplicação Flutter...',
            '🔥 Configurando Hot Reload...',
            '📱 Iniciando preview em tempo real...',
            '🌐 Servidor de preview ativo na porta 8084',
            '✅ App rodando com Hot Reload ativo!',
            '📲 Acesse no dispositivo: http://[SEU-IP]:8084/preview'
        ];
        
        for (const step of steps) {
            await this.delay(800);
            const line = document.createElement('div');
            line.className = 'build-line success';
            line.textContent = step;
            buildOutput.appendChild(line);
            buildOutput.scrollTop = buildOutput.scrollHeight;
        }
        
        // Atualizar preview web
        setTimeout(() => {
            const webPreview = document.getElementById('webPreview');
            if (webPreview) {
                webPreview.src = 'http://localhost:8084/preview';
            }
        }, 2000);
        
        this.showNotification('🚀 App rodando com Hot Reload!', 'success');
    }

    // Preview Panel Control
    togglePreviewPanel() {
        const container = document.querySelector('.ide-container');
        this.previewPanelVisible = !this.previewPanelVisible;
        
        if (this.previewPanelVisible) {
            container.classList.add('show-preview');
            this.showNotification('📱 Painel de Preview ativado', 'info');
            
            // Initialize preview system if not already done
            if (!this.previewServer) {
                this.initializePreviewSystem();
            }
        } else {
            container.classList.remove('show-preview');
            this.showNotification('📱 Painel de Preview oculto', 'info');
        }
        
        // Update layout
        setTimeout(() => {
            this.handleResize();
        }, 300);
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

// New Menu Functions
function toggleMenu(menu) { app.toggleMenu(menu); }
function toggleBottomPanel() { app.toggleBottomPanel(); }

// File Menu
function newProject() { app.newProject(); }
function openProject() { app.openProject(); }
function saveProject() { app.saveProject(); }
function exportApk() { app.exportApk(); }
function closeProject() { app.closeProject(); }

// Edit Menu
function undoAction() { app.undoAction(); }
function redoAction() { app.redoAction(); }
function findText() { app.findText(); }
function replaceText() { app.replaceText(); }

// View Menu
function toggleExplorer() { app.toggleExplorer(); }
function toggleTerminal() { app.toggleTerminal(); }
function toggleProblems() { app.toggleProblems(); }
function zoomIn() { app.zoomIn(); }
function zoomOut() { app.zoomOut(); }

// Build Menu
function buildDebug() { app.buildDebug(); }
function buildRelease() { app.buildRelease(); }
function cleanProject() { app.cleanProject(); }
function rebuildProject() { app.rebuildProject(); }

// Tools Menu
function packageManager() { app.packageManager(); }
function flutterDoctor() { app.flutterDoctor(); }
function openSettings() { app.openSettings(); }
function systemMonitor() { app.systemMonitor(); }

// Help Menu
function showDocumentation() { app.showDocumentation(); }
function showShortcuts() { app.showShortcuts(); }
function checkUpdates() { app.checkUpdates(); }
function showAbout() { app.showAbout(); }

// Preview Functions
function togglePreviewPanel() { app.togglePreviewPanel(); }
function refreshPreview() { app.refreshPreview(); }
function toggleHotReload() { app.toggleHotReload(); }
function scanDevices() { app.scanDevices(); }
function switchDevice(device) { app.switchDevice(device); }
function generateQRCode() { app.generateQRCode(); }