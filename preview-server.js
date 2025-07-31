// Android Dev Studio v4.0 - Preview Server
// Hot Reload e Preview em Tempo Real

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { exec } = require('child_process');

class PreviewServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = 8084;
        this.connectedDevices = new Map();
        this.hotReloadEnabled = true;
        this.watchedFiles = new Set();
        this.flutterProcess = null;
        
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupFileWatcher();
        this.setupADBMonitoring();
    }

    setupRoutes() {
        // Servir arquivos estáticos
        this.app.use(express.static('.'));
        this.app.use(express.json());

        // Rota principal do preview
        this.app.get('/preview', (req, res) => {
            res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📱 Flutter Preview - Android Dev Studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #1a1a1a; 
            color: white; 
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        .preview-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .status-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #3dd68d;
            color: white;
            padding: 8px 16px;
            font-size: 12px;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .app-frame {
            width: 100%;
            height: calc(100vh - 32px);
            margin-top: 32px;
            border: none;
            background: white;
        }
        .connection-info {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            max-width: 300px;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #3dd68d;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .hot-reload-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #3dd68d;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 11px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .hot-reload-indicator.show {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="status-bar">
        <div>🔥 Flutter Hot Reload - <span id="deviceName">Dispositivo Conectado</span></div>
        <div id="connectionStatus">🟢 Conectado</div>
    </div>
    
    <div class="preview-container">
        <div class="connection-info" id="connectionInfo">
            <h3>📱 Conectando ao Flutter...</h3>
            <div class="loading" style="margin: 20px auto;"></div>
            <p>Aguarde enquanto estabelecemos conexão</p>
        </div>
        <iframe class="app-frame" id="appFrame" style="display: none;"></iframe>
    </div>
    
    <div class="hot-reload-indicator" id="hotReloadIndicator">
        🔥 Hot Reload Aplicado
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const appFrame = document.getElementById('appFrame');
        const connectionInfo = document.getElementById('connectionInfo');
        const hotReloadIndicator = document.getElementById('hotReloadIndicator');
        const connectionStatus = document.getElementById('connectionStatus');
        const deviceName = document.getElementById('deviceName');

        let isConnected = false;
        let flutterUrl = null;

        socket.on('connect', () => {
            console.log('Conectado ao servidor de preview');
            socket.emit('device-connected', {
                type: 'web',
                userAgent: navigator.userAgent,
                screen: { width: window.innerWidth, height: window.innerHeight }
            });
        });

        socket.on('flutter-url', (url) => {
            console.log('Flutter URL recebida:', url);
            flutterUrl = url;
            showAppPreview(url);
        });

        socket.on('hot-reload', () => {
            console.log('Hot reload detectado');
            showHotReloadIndicator();
            if (flutterUrl) {
                // Recarregar iframe
                appFrame.src = appFrame.src;
            }
        });

        socket.on('file-changed', (data) => {
            console.log('Arquivo alterado:', data.file);
            showHotReloadIndicator();
        });

        function showAppPreview(url) {
            connectionInfo.style.display = 'none';
            appFrame.style.display = 'block';
            appFrame.src = url;
            isConnected = true;
            connectionStatus.textContent = '🟢 App Carregado';
        }

        function showHotReloadIndicator() {
            hotReloadIndicator.classList.add('show');
            setTimeout(() => {
                hotReloadIndicator.classList.remove('show');
            }, 2000);
        }

        // Detectar tipo de dispositivo
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            deviceName.textContent = 'Dispositivo Móvel';
        } else {
            deviceName.textContent = 'Web Browser';
        }

        // Reconectar automaticamente
        socket.on('disconnect', () => {
            connectionStatus.textContent = '🔴 Desconectado';
            setTimeout(() => {
                if (!socket.connected) {
                    socket.connect();
                }
            }, 3000);
        });

        // Lidar com mudanças de orientação
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (appFrame.src) {
                    appFrame.src = appFrame.src;
                }
            }, 500);
        });
    </script>
</body>
</html>
            `);
        });

        // API para controle do preview
        this.app.post('/api/preview/start', (req, res) => {
            this.startFlutterPreview();
            res.json({ status: 'started' });
        });

        this.app.post('/api/preview/stop', (req, res) => {
            this.stopFlutterPreview();
            res.json({ status: 'stopped' });
        });

        this.app.post('/api/preview/hot-reload', (req, res) => {
            this.triggerHotReload();
            res.json({ status: 'hot-reload-triggered' });
        });

        this.app.get('/api/devices', (req, res) => {
            res.json({
                devices: Array.from(this.connectedDevices.values()),
                adb: this.getADBDevices()
            });
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('🔌 Dispositivo conectado:', socket.id);

            socket.on('device-connected', (deviceInfo) => {
                const device = {
                    id: socket.id,
                    type: deviceInfo.type || 'web',
                    userAgent: deviceInfo.userAgent,
                    screen: deviceInfo.screen,
                    connectedAt: new Date()
                };
                
                this.connectedDevices.set(socket.id, device);
                console.log('📱 Dispositivo registrado:', device);
                
                // Enviar URL do Flutter se disponível
                if (this.flutterUrl) {
                    socket.emit('flutter-url', this.flutterUrl);
                }
            });

            socket.on('disconnect', () => {
                console.log('📱 Dispositivo desconectado:', socket.id);
                this.connectedDevices.delete(socket.id);
            });
        });
    }

    setupFileWatcher() {
        // Monitorar arquivos Dart
        const watcher = chokidar.watch(['lib/**/*.dart', 'pubspec.yaml'], {
            ignored: /node_modules/,
            persistent: true,
            ignoreInitial: true
        });

        watcher.on('change', (filePath) => {
            if (this.hotReloadEnabled) {
                console.log('📝 Arquivo alterado:', filePath);
                this.triggerHotReload(filePath);
            }
        });

        watcher.on('add', (filePath) => {
            console.log('📄 Novo arquivo:', filePath);
        });

        console.log('👁️ Monitoramento de arquivos ativado');
    }

    setupADBMonitoring() {
        // Verificar dispositivos ADB periodicamente
        setInterval(() => {
            this.checkADBDevices();
        }, 5000);
    }

    async startFlutterPreview() {
        try {
            // Parar processo anterior se existir
            this.stopFlutterPreview();

            console.log('🚀 Iniciando Flutter preview...');
            
            // Iniciar Flutter em modo web
            this.flutterProcess = exec('flutter run -d web-server --web-port=8085 --web-hostname=0.0.0.0', {
                cwd: process.cwd()
            });

            this.flutterProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('Flutter:', output);
                
                // Detectar URL do Flutter
                const urlMatch = output.match(/http:\/\/[^\s]+/);
                if (urlMatch) {
                    this.flutterUrl = urlMatch[0];
                    console.log('🌐 Flutter URL:', this.flutterUrl);
                    
                    // Notificar todos os dispositivos conectados
                    this.io.emit('flutter-url', this.flutterUrl);
                }
            });

            this.flutterProcess.stderr.on('data', (data) => {
                console.error('Flutter Error:', data.toString());
            });

            this.flutterProcess.on('close', (code) => {
                console.log('Flutter process fechado com código:', code);
                this.flutterProcess = null;
                this.flutterUrl = null;
            });

        } catch (error) {
            console.error('Erro ao iniciar Flutter preview:', error);
        }
    }

    stopFlutterPreview() {
        if (this.flutterProcess) {
            console.log('🛑 Parando Flutter preview...');
            this.flutterProcess.kill();
            this.flutterProcess = null;
            this.flutterUrl = null;
        }
    }

    triggerHotReload(changedFile = null) {
        if (this.flutterProcess) {
            // Enviar comando 'r' para hot reload
            this.flutterProcess.stdin.write('r\n');
            console.log('🔥 Hot reload disparado');
        }

        // Notificar dispositivos conectados
        this.io.emit('hot-reload', { file: changedFile });
        this.io.emit('file-changed', { file: changedFile, timestamp: Date.now() });
    }

    checkADBDevices() {
        exec('adb devices', (error, stdout, stderr) => {
            if (error) return;
            
            const devices = stdout.split('\n')
                .filter(line => line.includes('\tdevice'))
                .map(line => line.split('\t')[0]);
                
            // Atualizar lista de dispositivos ADB
            this.adbDevices = devices;
        });
    }

    getADBDevices() {
        return this.adbDevices || [];
    }

    start() {
        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`🔥 Preview Server rodando na porta ${this.port}`);
            console.log(`📱 URL para dispositivos: http://localhost:${this.port}/preview`);
            console.log(`🌐 Acesso via rede: http://[SEU-IP]:${this.port}/preview`);
        });
    }
}

// Inicializar servidor se executado diretamente
if (require.main === module) {
    const server = new PreviewServer();
    server.start();
}

module.exports = PreviewServer;