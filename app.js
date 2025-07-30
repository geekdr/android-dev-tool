// Android Dev Tool v2.0 - Main Application Logic

class AndroidDevTool {
    constructor() {
        this.projectPath = '/data/data/com.termux/files/home/gestao-financeira';
        this.serverProcess = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.loadProjectInfo();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.log('🚀 Android Dev Tool v2.0 initialized');
    }

    // Theme Management
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        this.showNotification(`Theme changed to ${this.currentTheme}`, 'success');
    }

    // Project Management
    async loadProjectInfo() {
        try {
            const response = await this.executeCommand('ls -la package.json');
            if (response.success) {
                this.updateProjectStatus('success', 'Ready');
                await this.analyzeProject();
            } else {
                this.updateProjectStatus('error', 'Not Found');
            }
        } catch (error) {
            this.log(`❌ Error loading project: ${error.message}`);
            this.updateProjectStatus('error', 'Error');
        }
    }

    updateProjectStatus(type, status) {
        const statusEl = document.getElementById('project-status');
        if (statusEl) {
            statusEl.className = `status ${type}`;
            statusEl.textContent = status;
        }
    }

    // Command Execution
    async executeCommand(command, showProgress = true) {
        if (showProgress) this.updateProgress(0);
        
        this.log(`$ ${command}`);
        
        try {
            // Simulate command execution for demo
            // In real implementation, this would call the backend API
            await this.sleep(1000);
            
            const mockResponses = {
                'npm install': { success: true, output: '✅ Dependencies installed successfully!' },
                'npm run build': { success: true, output: '✅ Build completed successfully!' },
                'npm run dev': { success: true, output: '🚀 Dev server started on http://localhost:8080' },
                'npm test': { success: true, output: '🧪 All tests passed!' },
                'npm run lint': { success: true, output: '🧹 Code is clean!' },
                'ls -la package.json': { success: true, output: 'package.json found' }
            };

            const response = mockResponses[command] || { success: true, output: 'Command executed' };
            
            if (showProgress) this.updateProgress(100);
            this.log(response.output);
            
            return response;
        } catch (error) {
            if (showProgress) this.updateProgress(0);
            this.log(`❌ Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    updateProgress(percent) {
        const progressFill = document.getElementById('action-progress');
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }

    // Development Actions
    async installDeps() {
        this.showNotification('Installing dependencies...', 'warning');
        const result = await this.executeCommand('npm install');
        if (result.success) {
            this.showNotification('Dependencies installed!', 'success');
            await this.analyzeProject();
        } else {
            this.showNotification('Failed to install dependencies', 'error');
        }
    }

    async startDev() {
        this.showNotification('Starting development server...', 'warning');
        const result = await this.executeCommand('npm run dev');
        if (result.success) {
            this.updateServerStatus('Running', '8080', 'http://127.0.0.1:8080');
            this.showNotification('Dev server started!', 'success');
        } else {
            this.showNotification('Failed to start dev server', 'error');
        }
    }

    async buildProject() {
        this.showNotification('Building project...', 'warning');
        const result = await this.executeCommand('npm run build');
        if (result.success) {
            this.showNotification('Build completed!', 'success');
            document.getElementById('last-build').textContent = new Date().toLocaleString();
            await this.analyzeBundleSize();
        } else {
            this.showNotification('Build failed', 'error');
        }
    }

    async runTests() {
        this.showNotification('Running tests...', 'warning');
        const result = await this.executeCommand('npm test');
        if (result.success) {
            this.showNotification('Tests passed!', 'success');
            document.getElementById('test-coverage').textContent = '85%';
        } else {
            this.showNotification('Tests failed', 'error');
        }
    }

    // Server Management
    updateServerStatus(status, port, url) {
        document.getElementById('server-status').textContent = status;
        document.getElementById('server-port').textContent = port;
        const urlEl = document.getElementById('server-url');
        urlEl.textContent = url;
        urlEl.href = url;
    }

    openBrowser() {
        const url = document.getElementById('server-url').href;
        if (url && url !== '#') {
            window.open(url, '_blank');
            this.showNotification('Opening browser...', 'success');
        } else {
            this.showNotification('Server not running', 'warning');
        }
    }

    stopServer() {
        this.updateServerStatus('Stopped', '--', '--');
        this.showNotification('Server stopped', 'success');
        this.log('⏹️ Development server stopped');
    }

    // Project Analysis
    async analyzeProject() {
        this.log('🔍 Analyzing project...');
        
        // Simulate analysis
        await this.sleep(1500);
        
        // Update metrics
        document.getElementById('dependencies-count').textContent = '24';
        document.getElementById('total-files').textContent = '156';
        document.getElementById('lines-of-code').textContent = '3,247';
        document.getElementById('deps-analysis').textContent = '2 outdated';
        document.getElementById('vulnerabilities').textContent = '0 high';
        
        this.log('✅ Project analysis completed');
    }

    async analyzeBundleSize() {
        this.log('📊 Analyzing bundle size...');
        await this.sleep(1000);
        
        document.getElementById('bundle-size').textContent = '245.6 KB';
        document.getElementById('build-time').textContent = '12.3s';
        document.getElementById('lighthouse-score').textContent = '94/100';
        
        this.log('✅ Bundle analysis completed');
    }

    async runAnalysis() {
        this.showNotification('Running detailed analysis...', 'warning');
        await this.analyzeProject();
        await this.analyzeBundleSize();
        this.showNotification('Analysis completed!', 'success');
    }

    // Code Editor
    async openFile(filename) {
        this.log(`📝 Opening ${filename}`);
        const editor = document.getElementById('editor');
        
        // Mock file content
        const mockFiles = {
            'package.json': `{
  "name": "gestao-financeira",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}`,
            'src/App.tsx': `import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <h1>Financial Management</h1>
      <p>Welcome to your financial dashboard!</p>
    </div>
  )
}

export default App`,
            'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
            'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080
  }
})`
        };

        const content = mockFiles[filename] || '// File not found';
        editor.innerHTML = `<pre style="padding: 1rem; margin: 0; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.875rem;">${content}</pre>`;
        
        this.showNotification(`Opened ${filename}`, 'success');
    }

    // Deploy Functions
    async deployTo(platform) {
        this.log(`🚀 Deploying to ${platform}...`);
        this.showNotification(`Deploying to ${platform}...`, 'warning');
        
        await this.sleep(3000);
        
        const deployUrls = {
            'vercel': 'https://your-app.vercel.app',
            'netlify': 'https://your-app.netlify.app',
            'github-pages': 'https://username.github.io/repo',
            'firebase': 'https://your-app.web.app'
        };
        
        const url = deployUrls[platform];
        this.log(`✅ Deployed successfully to ${url}`);
        this.showNotification(`Deployed to ${platform}!`, 'success');
        
        if (confirm(`Open ${url}?`)) {
            window.open(url, '_blank');
        }
    }

    // Framework Management
    createProject() {
        const selectedFramework = document.querySelector('.framework-card.selected');
        const framework = selectedFramework?.dataset.framework || 'react';
        
        this.log(`🛠️ Creating new ${framework} project...`);
        this.showNotification(`Creating ${framework} project...`, 'warning');
        
        setTimeout(() => {
            this.showNotification(`${framework} project created!`, 'success');
            this.log(`✅ New ${framework} project ready`);
        }, 2000);
    }

    // UI Utilities
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        event.target.classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
    }

    log(message) {
        const logOutput = document.getElementById('log-output');
        if (logOutput) {
            const timestamp = new Date().toLocaleTimeString();
            const logLine = document.createElement('div');
            logLine.textContent = `[${timestamp}] ${message}`;
            logOutput.appendChild(logLine);
            logOutput.scrollTop = logOutput.scrollHeight;
        }
    }

    clearLogs() {
        const logOutput = document.getElementById('log-output');
        if (logOutput) {
            logOutput.innerHTML = '<div>🔧 Logs cleared</div>';
        }
    }

    exportLogs() {
        const logOutput = document.getElementById('log-output');
        if (logOutput) {
            const logs = logOutput.textContent;
            const blob = new Blob([logs], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `android-dev-tool-logs-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Logs exported!', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Event Listeners
    setupEventListeners() {
        // Framework selector
        document.querySelectorAll('.framework-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.framework-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        this.buildProject();
                        break;
                    case 's':
                        e.preventDefault();
                        this.startDev();
                        break;
                    case 't':
                        e.preventDefault();
                        this.runTests();
                        break;
                }
            }
        });
    }

    // PWA Setup
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    this.log('✅ Service Worker registered');
                })
                .catch(error => {
                    this.log(`❌ Service Worker registration failed: ${error}`);
                });
        }
    }

    // Utility Functions
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    openSettings() {
        this.showNotification('Settings panel coming soon!', 'warning');
    }

    showHelp() {
        const helpText = `
🔧 Android Dev Tool v2.0 Help

Keyboard Shortcuts:
• Ctrl+B: Build project
• Ctrl+S: Start dev server  
• Ctrl+T: Run tests

Features:
• 📊 Real-time project monitoring
• 🚀 One-click deployments
• 📝 Integrated code editor
• 🛠️ Multi-framework support
• 📱 PWA support
        `;
        alert(helpText);
    }
}

// Global functions for HTML onclick handlers
let app;

window.addEventListener('DOMContentLoaded', () => {
    app = new AndroidDevTool();
});

function toggleTheme() {
    app.toggleTheme();
}

function installDeps() {
    app.installDeps();
}

function startDev() {
    app.startDev();
}

function buildProject() {
    app.buildProject();
}

function runTests() {
    app.runTests();
}

function openBrowser() {
    app.openBrowser();
}

function stopServer() {
    app.stopServer();
}

function switchTab(tabName) {
    app.switchTab(tabName);
}

function clearLogs() {
    app.clearLogs();
}

function exportLogs() {
    app.exportLogs();
}

function openFile(filename) {
    app.openFile(filename);
}

function deployTo(platform) {
    app.deployTo(platform);
}

function createProject() {
    app.createProject();
}

function runAnalysis() {
    app.runAnalysis();
}

function openSettings() {
    app.openSettings();
}

function showHelp() {
    app.showHelp();
}