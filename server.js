require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const port = 8080;

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
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[extname] || 'application/octet-stream';
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Rota para proxy da API da Twitch
    if (pathname.startsWith('/twitch-api/')) {
        const twitchEndpoint = pathname.replace('/twitch-api/', '');
        const queryString = new URLSearchParams(query).toString();
        const twitchUrl = `https://api.twitch.tv/helix/${twitchEndpoint}${queryString ? '?' + queryString : ''}`;

        const clientId = process.env.CLIENT_ID || 'gp762nuuoqcoxypju8c569th9wz7q5';
        const token = process.env.TOKEN;

        if (!token) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Token não fornecido no .env');
            return;
        }

        const options = {
            method: 'GET',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            }
        };

        https.get(twitchUrl, options, (twitchRes) => {
            let data = '';
            twitchRes.on('data', (chunk) => {
                data += chunk;
            });
            twitchRes.on('end', () => {
                res.writeHead(twitchRes.statusCode, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erro ao acessar a API da Twitch: ' + err.message);
        });
        return;
    }

    const urlPath = pathname === '/' ? '/index.html' : pathname;
    if (urlPath.startsWith('/assets/')) {
        const filePath = path.join(__dirname, urlPath);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
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

server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});