// Importăm funcțiile pentru crearea și autentificarea utilizatorilor din controller-ul de utilizatori
const { createUser, loginUser, uploadProfileImage, getAllFoods, getProductDetails } = require('../controllers/userController');
// Importăm funcția middleware pentru autentificarea token-urilor
const authenticateToken = require('../middleware/authMiddleware');
const { refreshToken } = require('../controllers/userController');
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
    // Dacă metoda cererii este GET și URL-ul este '/api/foods', apelăm funcția pentru obținerea tuturor alimentelor din baza de date
    else if (req.method === 'GET' && req.url === '/api/foods') {
        getAllFoods(req, res);
    }
    // Dacă metoda cererii este GET și URL-ul începe cu '/api/foods/', apelăm funcția pentru obținerea detaliilor unui produs
    else if (req.method === 'GET' && req.url.startsWith('/api/foods/')) {
        const productId = req.url.split('/').pop();
        req.params = { id: productId }; // Adăugăm parametrii în obiectul req
        getProductDetails(req, res);
    }
    else if (req.method === 'POST' && req.url === '/api/refreshToken') {
        refreshToken(req, res);
    }
    else if (req.method === 'POST' && req.url === '/api/products') {
        authenticateToken(req, res, () => {
            const form = new formidable.IncomingForm();
            form.parse(req, (err, fields) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error parsing form data' }));
                    return;
                }

                const productData = {
                    url: fields.image_url,
                    product_name: fields.product_name,
                    // alte câmpuri...
                };

                const query = 'INSERT INTO products SET ?';
                db.query(query, productData, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error inserting product into database' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Product added successfully' }));
                });
            });
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
