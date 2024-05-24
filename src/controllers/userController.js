const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key pentru semnarea JWT-ului
const secretKey = 'mySecretKey';

const createUser = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { email, username, password } = JSON.parse(body);
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await pool.query(
                'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *',
                [email, username, hashedPassword]
            );
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser.rows[0]));
        } catch (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};

const loginUser = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { username, password } = JSON.parse(body);

        try {
            const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            if (user.rows.length > 0) {
                const validPassword = await bcrypt.compare(password, user.rows[0].password);
                if (validPassword) {
                    // Generăm JWT
                    const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, secretKey, { expiresIn: '5m' });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ token }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid credentials' }));
                }
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }
        } catch (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};

module.exports = { createUser, loginUser };
