const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const db = require('../config/dbConfig');
const { get } = require('http');
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

// Funcția pentru obținerea tuturor alimentelor din baza de date
const getAllFoods = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM food');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result[0]));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getProductDetails = async (req, res) => {
    const productId = req.params.id;
    try {
        const [result] = await pool.query('SELECT * FROM food WHERE code = ?', [productId]);
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

// Funcția pentru adăugarea unui aliment în preferințele utilizatorului
const addUserFoodPreference = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const { userId, foodCode } = JSON.parse(body);
            console.log(`Adding food preference for user: ${userId}, food: ${foodCode}`);

            // Check if the preference already exists
            const [existingPreference] = await pool.query(
                'SELECT * FROM user_foods WHERE user_id = ? AND food_code = ?',
                [userId, foodCode]
            );

            if (existingPreference.length > 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Food preference already exists' }));
                return;
            }

            // Add the new preference
            await pool.query('INSERT INTO user_foods (user_id, food_code) VALUES (?, ?)', [userId, foodCode]);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Food preference added successfully' }));
        } catch (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};

// Funcția pentru obținerea preferințelor culinare ale utilizatorului
const getUserFoodPreferences = async (req, res) => {
    const userId = req.params.userId;
    console.log(`Fetching food preferences for user: ${userId}`);

    try {
        const [result] = await pool.query(
            'SELECT food.* FROM food JOIN user_foods ON food.code = user_foods.food_code WHERE user_foods.user_id = ?',
            [userId]
        );
        console.log(`Found ${result.length} food preferences for user: ${userId}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

// Funcția pentru obținerea categoriilor distincte
const getCategories = async (req, res) => {
    try {
        const [result] = await pool.query('SELECT DISTINCT categories_en FROM food');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

// Funcția pentru obținerea alimentelor după categorie
const getFoodsByCategory = async (req, res) => {
    const category = req.params.category;
    console.log(`Received request for category: ${category}`); // Debug

    try {
        const [result] = await pool.query('SELECT * FROM food WHERE categories_en LIKE ?', [`%${category}%`]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getCountries = async (req, res) => {
    try {
        const [results] = await pool.query('SELECT DISTINCT countries_en FROM food');
        const countriesSet = new Set();

        results.forEach(row => {
            if (row.countries_en) {
                row.countries_en.split(/[\s,]+/).forEach(country => {
                    countriesSet.add(country.trim());
                });
            }
        });

        const countries = Array.from(countriesSet).sort();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(countries));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getFoodsByCountry = async (req, res) => {
    const country = req.params.country;
    console.log(`Received request for country: ${country}`); // Debug

    try {
        const [result] = await pool.query('SELECT * FROM food WHERE countries_en LIKE ?', [`%${country}%`]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getRestaurants = async (req, res) => {
    try {
        const [results] = await pool.query('SELECT DISTINCT restaurants FROM food');
        const restaurantsSet = new Set();

        results.forEach(row => {
            if (row.restaurants) {
                row.restaurants.split(/[\s,]+/).forEach(restaurant => {
                    restaurantsSet.add(restaurant.trim());
                });
            }
        });

        const restaurants = Array.from(restaurantsSet).sort();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(restaurants));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const searchFoods = async (req, res) => {
    const searchQuery = req.params.searchQuery;
    console.log(`Received search query: ${searchQuery}`); // Debug

    try {
        const [result] = await pool.query('SELECT * FROM food WHERE product_name LIKE ?', [`%${searchQuery}%`]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getFoodsByRestaurant = async (req, res) => {
    const restaurant = req.params.restaurant;
    console.log(`Received request for restaurant: ${restaurant}`); // Debug

    try {
        const [result] = await pool.query('SELECT * FROM food WHERE restaurants LIKE ?', [`%${restaurant}%`]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const getFoodsByPrice = async (req, res) => {
    const { minPrice, maxPrice } = req.params;
    console.log(`Received request for price range: ${minPrice} - ${maxPrice}`); // Debug

    try {
        const query = 'SELECT * FROM food WHERE price BETWEEN ? AND ?';
        const [result] = await pool.query(query, [minPrice, maxPrice]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No products found in this price range' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};



const getFoodsByCalories = async (req, res) => {
    const { minCal, maxCal } = req.params;
    console.log(`Received request for calory range: ${minCal} - ${maxCal}`); // Debug

    try {
        const query = 'SELECT * FROM food WHERE energy_kcal_100g BETWEEN ? AND ?';
        const [result] = await pool.query(query, [minCal, maxCal]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No products found in this price range' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

const filterFoods = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        const parsedBody = JSON.parse(body);
        const filters = parsedBody.filters;

        console.log('Filters received on server:', filters);  // Adăugați acest log pentru a vedea filtrele primite

        let query = 'SELECT * FROM food WHERE 1=1';

        if (filters.includes('additives')) {
            query += ' AND additives_en = "None"';
        }
        if (filters.includes('allergens')) {
            query += ' AND allergens = "None"';
        }

        console.log('SQL Query:', query);  // Adăugați acest log pentru a vedea interogarea SQL

        try {
            const [results] = await db.query(query);
            console.log('SQL Results:', results);  // Adăugați acest log pentru a vedea rezultatele interogării
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error filtering products' }));
        }
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

module.exports = {
    createUser,
    loginUser,
    uploadProfileImage,
    getAllFoods,
    getProductDetails,
    addUserFoodPreference,
    getUserFoodPreferences,
    getCategories,
    getFoodsByCategory,
    getCountries,
    getFoodsByCountry,
    refreshToken,
    getRestaurants,
    getFoodsByRestaurant,
    getFoodsByPrice,
    searchFoods,
    getFoodsByCalories,
    filterFoods,
    bodyParser,
    updateUser
};
