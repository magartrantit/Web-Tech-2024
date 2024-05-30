// Importăm modulele necesare: pool pentru conexiunea la baza de date, bcrypt pentru hash-uirarea parolelor, jwt pentru generarea token-urilor JWT
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
    // Inițializăm corpul cererii ca un șir gol
    let body = '';
    // La primirea unui chunk de date, îl adăugăm la corpul cererii
    req.on('data', chunk => {
        body += chunk.toString();
    });
    // Când toate datele au fost primite
    req.on('end', async () => {
        // Extragem datele necesare din corpul cererii
        const { email, username, password } = JSON.parse(body);
        // Hash-uim parola
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // Încercăm să inserăm noul utilizator în baza de date
            const newUser = await pool.query(
                'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *',
                [email, username, hashedPassword]
            );
            // Dacă inserarea a reușit, trimitem răspunsul cu datele noului utilizator
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser.rows[0]));
        } catch (err) {
            // Dacă a apărut o eroare, o înregistrăm și trimitem un răspuns cu eroarea
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};

// Funcția pentru autentificarea unui utilizator
const loginUser = async (req, res) => {
    // Procesul de primire a datelor este similar cu cel de mai sus
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { username, password } = JSON.parse(body);

        try {
            // Încercăm să găsim utilizatorul în baza de date
            const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            // Dacă utilizatorul există
            if (user.rows.length > 0) {
                // Verificăm dacă parola este corectă
                const validPassword = await bcrypt.compare(password, user.rows[0].password);
                if (validPassword) {
                    // Dacă parola este corectă, generăm un token JWT și îl trimitem în răspuns
                    const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, secretKey, { expiresIn: '1h' });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ token }));
                } else {
                    // Dacă parola este greșită, trimitem un răspuns cu eroare
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid credentials' }));
                }
            } else {
                // Dacă utilizatorul nu există, trimitem un răspuns cu eroare
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }
        } catch (err) {
            // Dacă a apărut o eroare, o înregistrăm și trimitem un răspuns cu eroarea
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

    console.log('Upload directory:', form.uploadDir); 

    form.parse(req, async (err, fields, files) => {
        console.log('Error:', err); 
        console.log('Fields:', fields); 
        console.log('Files:', files); 

        if (err) {
            console.error('Error parsing the files', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error parsing the files' }));
            return;
        }

        if (!files.profileImage) {
            console.log('No profile image received'); 
        }

        let userId = fields.userId[0];
        let profileImage = files.profileImage[0];
        let profileImagePath = profileImage.filepath;
        let profileImageExt = path.extname(profileImage.originalFilename); 

        try {
            // Obținem numele fișierului imaginii de profil și adăugăm extensia corectă
            let profileImageUrl = path.basename(profileImagePath) + profileImageExt;
            let newProfileImagePath = profileImagePath + profileImageExt;

            // Renamim fișierul pentru a include extensia corectă
            fs.renameSync(profileImagePath, newProfileImagePath);

            // Actualizăm înregistrarea utilizatorului în baza de date cu noua imagine de profil
            await pool.query('UPDATE users SET profile_image = $1 WHERE id = $2', [profileImageUrl, userId]);
            // Trimitem un răspuns cu mesajul de succes și URL-ul imaginii de profil
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Profile image uploaded successfully', profileImage: profileImageUrl }));
        } catch (err) {
            // Dacă a apărut o eroare în timpul interogării bazei de date, o înregistrăm și trimitem un răspuns cu eroarea
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};



// Exportăm funcțiile pentru a putea fi folosite în alte module
module.exports = { createUser, loginUser, uploadProfileImage };