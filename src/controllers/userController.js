const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const db = require('../config/dbConfig');


const saltRounds = 10;

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
                    let isAdmin = user.admin === 1; // Verificăm dacă utilizatorul este admin

                    const tokenPayload = {
                        id: user.id,
                        username: user.username,
                        isAdmin: isAdmin // Adăugăm isAdmin în payload-ul token-ului JWT
                    };

                    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ token, isAdmin: isAdmin }));
                    // Trimitem token-ul și statutul de isAdmin către client
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

const bodyParser = (req, callback) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert to string and append
    });
    req.on('end', () => {
        try {
            req.body = JSON.parse(body); // parse the string to JSON
            callback();
        } catch (e) {
            callback(e);
        }
    });
};

const updateUser = (userId, username, password, callback) => {
    // Generați un hash pentru parola furnizată
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return callback(err);
        }
        // Aici ar urma logica pentru actualizarea utilizatorului în baza de date
        // În loc să folosiți parola direct, folosiți hash-ul generat
        const query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
        db.query(query, [username, hash, userId], (err, result) => {
            if (err) return callback(err);
            callback(null, result); // Nu a fost întâmpinată nicio eroare, continuați cu callback-ul
        });
    });
};


const deleteUser = async (req, res, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Șterge preferințele alimentare ale utilizatorului
        const deleteUserFoodsQuery = 'DELETE FROM user_foods WHERE user_id = ?';
        await connection.query(deleteUserFoodsQuery, [userId]);

        // Șterge elementele de listă asociate cu listele utilizatorului
        const deleteListItemsQuery = `
            DELETE list_items FROM list_items
            JOIN user_lists ON list_items.list_id = user_lists.id
            WHERE user_lists.user_id = ?
        `;
        await connection.query(deleteListItemsQuery, [userId]);

        // Șterge listele utilizatorului
        const deleteUserListsQuery = 'DELETE FROM user_lists WHERE user_id = ?';
        await connection.query(deleteUserListsQuery, [userId]);

        // Șterge utilizatorul
        const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
        const [result] = await connection.query(deleteUserQuery, [userId]);

        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }

        await connection.commit();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User deleted successfully' }));
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting user:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error deleting user' }));
    } finally {
        connection.release();
    }
};

module.exports = {
    createUser,
    loginUser,
    uploadProfileImage,
    refreshToken,
    bodyParser,
    updateUser,
    deleteUser
};
