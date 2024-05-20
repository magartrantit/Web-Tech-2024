const http = require('http');
const path = require('path');
const fs = require('fs');
const userRoutes = require('./routes/userRoutes');

const server = http.createServer((req, res) => {
    const publicPath = path.join(__dirname, '../public');

    const getContentType = (extname) => {
        switch (extname) {
            case '.html': return 'text/html';
            case '.css': return 'text/css';
            case '.js': return 'application/javascript';
            case '.jpg': return 'image/jpeg';
            case '.png': return 'image/png';
            case '.svg': return 'image/svg+xml';
            default: return 'text/plain';
        }
    };

    const serveFile = (filePath, contentType) => {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('500 Internal Server Error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    };

    if (req.url.startsWith('/api')) {
        userRoutes(req, res);
    } else {
        let filePath;
        if (req.url === '/') {
            filePath = path.join(publicPath, 'html', 'login.html');
        } else if (req.url === '/login') {
            filePath = path.join(publicPath, 'html', 'login.html');
        } else if (req.url === '/profil') {
            filePath = path.join(publicPath, 'html', 'profil.html');
        } else if (req.url === '/admin') {
            filePath = path.join(publicPath, 'html', 'admin.html');
        } else if (req.url === '/list') {
            filePath = path.join(publicPath, 'html', 'list.html');
        } else if (req.url === '/page1') {
            filePath = path.join(publicPath, 'html', 'page1.html');
        } else {
            filePath = path.join(publicPath, req.url);
        }

        const extname = path.extname(filePath);
        const contentType = getContentType(extname);
        serveFile(filePath, contentType);
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
