const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

// Cheia secretă folosită pentru semnarea token-urilor JWT
const secretKey = 'mySecretKey';

// Funcția pentru crearea unui nou utilizator
const createUser = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { email, username, password } = JSON.parse(body);
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const [result] = await pool.query(
                'INSERT INTO users (email, username, password) VALUES (?, ?, ?)', 
                [email, username, hashedPassword]
            );
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, email, username }));
        } catch (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};

// Funcția pentru autentificarea unui utilizator
const loginUser = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { username, password } = JSON.parse(body);

        try {
            const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            if (users.length > 0) {
                const user = users[0];
                const validPassword = await bcrypt.compare(password, user.password);
                if (validPassword) {
                    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
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

// Funcția pentru încărcarea imaginii de profil
const uploadProfileImage = (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads');
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing the files', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error parsing the files' }));
            return;
        }

        if (!files.profileImage || !files.profileImage[0]) {
            console.log('No profile image received'); 
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No profile image received' }));
            return;
        }

        const userId = fields.userId[0];
        const profileImage = files.profileImage[0];
        const profileImagePath = profileImage.filepath;
        const profileImageExt = path.extname(profileImage.originalFilename);

        try {
            if (!profileImagePath || !profileImageExt) {
                throw new Error('Invalid profile image path or extension');
            }

            const profileImageUrl = path.basename(profileImagePath) + profileImageExt;
            const newProfileImagePath = profileImagePath + profileImageExt;
            fs.renameSync(profileImagePath, newProfileImagePath);

            await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [profileImageUrl, userId]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Profile image uploaded successfully', profileImage: profileImageUrl }));
        } catch (err) {
            console.error('Error handling the profile image', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error handling the profile image' }));
        }
    });
};

// Funcția pentru obținerea tuturor alimentelor din baza de date
const getAllFoods = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM foods');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result[0])); // mysql2 returns result set as an array
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getProductDetails = async (req, res) => {
    const productId = req.params.id;
    try {
        const [result] = await pool.query('SELECT * FROM foods WHERE code = ?', [productId]);
        if (result.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result[0]));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }

    jwt.verify(token, 'your_refresh_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        const newToken = jwt.sign({ id: user.id }, 'your_access_secret_key', { expiresIn: '15m' });
        res.json({ token: newToken });
    });
};


// Exportăm funcțiile pentru a putea fi folosite în alte module
module.exports = { createUser, loginUser, uploadProfileImage, getAllFoods, getProductDetails, refreshToken };
