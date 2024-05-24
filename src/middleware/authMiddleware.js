// Importăm modulul 'jsonwebtoken' pentru a verifica token-urile JWT
const jwt = require('jsonwebtoken');
// Cheia secretă folosită pentru semnarea și verificarea token-urilor JWT
const secretKey = 'mySecretKey';

// Funcția middleware pentru autentificarea token-urilor
const authenticateToken = (req, res, next) => {
    // Extragem token-ul din header-ul 'Authorization' al cererii
    const token = req.headers['authorization']?.split(' ')[1];
    // Dacă token-ul nu există, trimitem un răspuns cu statusul 401 (Unauthorized)
    if (token == null) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
    }

    // Verificăm token-ul
    jwt.verify(token, secretKey, (err, user) => {
        // Dacă token-ul nu este invalid, trimitem un răspuns cu statusul 403 (Forbidden)
        if (err) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Forbidden' }));
            return;
        }
        // Dacă token-ul este valid, adăugăm datele utilizatorului în obiectul cererii și apelăm următorul middleware
        req.user = user;
        next();
    });
};

// Exportăm funcția middleware pentru a putea fi folosită în alte module
module.exports = authenticateToken;