const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url);
    let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
    const fullPath = path.join(__dirname, filePath.substring(1));
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        
        const ext = path.extname(fullPath);
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(data);
    });
});

const PORT = process.env.PORT || 8083;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Android Dev Studio v3.0 running on http://127.0.0.1:${PORT}`);
    console.log('📱 Complete development environment ready!');
    console.log('✨ Features: Flutter/Dart IDE, APK Builder, Terminal, Package Manager');
});