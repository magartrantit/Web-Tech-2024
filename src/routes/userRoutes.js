// Importăm funcțiile pentru crearea și autentificarea utilizatorilor din controller-ul de utilizatori
const { createUser, loginUser, uploadProfileImage } = require('../controllers/userController');
// Importăm funcția middleware pentru autentificarea token-urilor
const authenticateToken = require('../middleware/authMiddleware');

// Funcția pentru gestionarea rutelor de utilizatori
const userRoutes = (req, res) => {
    // Dacă metoda cererii este POST și URL-ul este '/api/users', apelăm funcția pentru crearea unui utilizator
    if (req.method === 'POST' && req.url === '/api/users') {
        createUser(req, res);
    } 
    // Dacă metoda cererii este POST și URL-ul este '/api/login', apelăm funcția pentru autentificarea unui utilizator
    else if (req.method === 'POST' && req.url === '/api/login') {
        loginUser(req, res);
    } 
    // Dacă metoda cererii este POST și URL-ul este '/api/uploadProfileImage', apelăm funcția pentru încărcarea imaginii de profil
    else if (req.method === 'POST' && req.url === '/api/uploadProfileImage') {
        uploadProfileImage(req, res);
    }
    // Dacă metoda cererii este GET și URL-ul este '/api/protected', apelăm funcția middleware pentru autentificarea token-ului
    // și apoi trimitem un răspuns cu un mesaj și datele utilizatorului
    else if (req.method === 'GET' && req.url === '/api/protected') {
        authenticateToken(req, res, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Protected route accessed', user: req.user }));
        });
    } 
    // Dacă niciuna dintre condițiile de mai sus nu este îndeplinită, trimitem un răspuns cu statusul 404 (Not Found)
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

// Exportăm funcția pentru gestionarea rutelor de utilizatori pentru a putea fi folosită în alte module
module.exports = userRoutes;
