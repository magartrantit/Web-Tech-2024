// Importăm modulele necesare
const http = require('http');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const mysql = require('mysql');
const db = require('./config/dbConfig');
// Importăm funcția pentru gestionarea rutelor de utilizatori
const userRoutes = require('./routes/userRoutes');

// Asigură-te că directorul 'uploads' există
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// test
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
            case '.jpeg': return 'image/jpeg';
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
        if (req.method === 'POST' && req.url === '/api/products') {
            const form = new formidable.IncomingForm();
            form.uploadDir = uploadDir;
            form.keepExtensions = true;
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Error parsing form data:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error parsing form data' }));
                    return;
                }

                const imageFile = files.image;
                if (!imageFile) {
                    console.error('No image file uploaded');
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No image file uploaded' }));
                    return;
                }
                const imageUrl = `/uploads/${path.basename(imageFile.path)}`;

                const productData = {
                    
                    product_name: fields.product_name,
                    brands: fields.brands,
                    categories_en: fields.categories_en,
                    countries_en: fields.countries_en,
                    ingredients_text: fields.ingredients_text,
                    allergens: fields.allergens,
                    additives_en: fields.additives_en,
                    food_groups_en: fields.food_groups_en,
                    main_category_en: fields.main_category_en,
                    image_url: fields.image_url,
                    image_ingredients_url: fields.image_ingredients_url,
                    image_nutrition_url: fields.image_nutrition_url,
                    energy_kcal_100g: fields['energy-kcal_100g'],
                    fat_100g: fields.fat_100g,
                    saturated_fat_100g: fields['saturated-fat_100g'],
                    carbohydrates_100g: fields.carbohydrates_100g,
                    sugars_100g: fields.sugars_100g,
                    fiber_100g: fields.fiber_100g,
                    proteins_100g: fields.proteins_100g,
                    salt_100g: fields.salt_100g,
                    sodium_100g: fields.sodium_100g
                };

                console.log('Product data:', productData);

                const query = 'INSERT INTO products SET ?';
                db.query(query, productData, (err, result) => {
                    if (err) {
                        console.error('Error inserting product into database:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error inserting product into database' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Product added successfully' }));
                });
            });
        } else {
            userRoutes(req, res);
        }
    } else if (req.url.startsWith('/uploads')) {
        // Servim fișierele din directorul 'uploads'
        const filePath = path.join(uploadDir, path.basename(req.url));
        const extname = path.extname(filePath);
        const contentType = getContentType(extname);
        serveFile(filePath, contentType);
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
