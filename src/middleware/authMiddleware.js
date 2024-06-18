// Importăm modulul 'jsonwebtoken' pentru a lucra cu JWT (JSON Web Tokens)
const jwt = require('jsonwebtoken');
// Importăm configurarea bazei de date
const pool = require('../config/dbConfig');

// Definim cheia secretă folosită pentru semnarea și verificarea token-urilor JWT
const secretKey = 'mySecretKey';

// Definim un middleware pentru autentificarea token-urilor JWT
const authenticateToken = async (req, res, next) => {
    // Extragem header-ul 'Authorization' din cererea primită
    const authHeader = req.headers['authorization'];
    // Extragem token-ul din header. Acesta ar trebui să fie în formatul 'Bearer token'
    const token = authHeader && authHeader.split(' ')[1];
    
    // Dacă nu a fost furnizat niciun token, trimitem un răspuns cu codul de stare 401 (Neautorizat)
    if (!token) {
        return res.writeHead(401, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Token not provided' }));
    }

    try {
        // Verificăm token-ul folosind cheia secretă
        const decoded = jwt.verify(token, secretKey);
        // Căutăm utilizatorul în baza de date folosind id-ul extras din token
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        // Dacă utilizatorul nu există, trimitem un răspuns cu codul de stare 401 (Neautorizat)
        if (users.length === 0) {
            return res.writeHead(401, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'User not found' }));
        }
        // Adăugăm utilizatorul în obiectul cererii pentru a putea fi folosit în middleware-urile următoare
        req.user = users[0];
        // Apelăm următorul middleware din lanț
        next();
    } catch (err) {
        // Dacă verificarea token-ului eșuează, înregistrăm eroarea și trimitem un răspuns cu codul de stare 401 (Neautorizat)
        console.error('JWT verification error:', err);
        return res.writeHead(401, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Invalid token' }));
    }
};

// Exportăm middleware-ul pentru a putea fi folosit în alte module
module.exports = authenticateToken;


