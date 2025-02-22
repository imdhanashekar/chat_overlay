const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;

// Função para determinar o tipo de conteúdo baseado na extensão
const getContentType = (filePath) => {
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',       // Adicionado SVG
        '.woff': 'font/woff',          // Fontes
        '.woff2': 'font/woff2',        // Fontes
        '.ttf': 'font/ttf',           // Fontes
        '.eot': 'application/vnd.ms-fontobject', // Fontes
        '.ico': 'image/x-icon'        // Favicon
    };
    return mimeTypes[extname] || 'application/octet-stream';
};

// Criar o servidor
const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    
    // Verificar se é um arquivo em /assets
    if (url.startsWith('/assets/')) {
        const filePath = path.join(__dirname, url);
        
        // Verificar se o arquivo existe
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }

            // Ler e servir o arquivo
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('500 Internal Server Error');
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': getContentType(filePath) });
                res.end(content);
            });
        });
    } else {
        // Para todas as outras rotas, servir o index.html
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    }
});

// Iniciar o servidor
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});