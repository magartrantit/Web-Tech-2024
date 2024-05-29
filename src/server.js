// Importăm modulele necesare
const http = require('http');
const path = require('path');
const fs = require('fs');
// Importăm funcția pentru gestionarea rutelor de utilizatori
const userRoutes = require('./routes/userRoutes');

// Asigură-te că directorul 'uploads' există
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Creăm serverul
const server = http.createServer((req, res) => {
    // Definim calea către directorul public
    const publicPath = path.join(__dirname, '../public');

    // Funcție pentru determinarea tipului de conținut în funcție de extensia fișierului
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

    // Funcție pentru servirea fișierelor
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

    // Dacă URL-ul cererii începe cu '/api', apelăm funcția pentru gestionarea rutelor de utilizatori
    if (req.url.startsWith('/api')) {
        userRoutes(req, res);
    } else {
        // Altfel, determinăm calea către fișierul care trebuie servit
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
        }else if (req.url.startsWith('/uploads')) {
            filePath = path.join(uploadDir, req.url.replace('/uploads', ''));
            const extname = path.extname(filePath);
            const contentType = getContentType(extname);
            serveFile(filePath, contentType);
            return; // Stop the execution of the function
        } else {
            filePath = path.join(publicPath, req.url);
        }

        // Determinăm tipul de conținut și servim fișierul
        const extname = path.extname(filePath);
        const contentType = getContentType(extname);
        serveFile(filePath, contentType);
    }
});

// Definim portul pe care va asculta serverul
const PORT = 3000;
// Pornim serverul
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});