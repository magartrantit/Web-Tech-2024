const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const pool = require('../config/dbConfig');
const db = require('../config/dbConfig');

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

// Funcția pentru adăugarea unui aliment în preferințele utilizatorului
const addUserFoodPreference = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const { userId, productCode } = JSON.parse(body);
            console.log(`Adding food preference for user: ${userId}, food: ${productCode}`);

            // Check if the preference already exists
            const [existingPreference] = await pool.query(
                'SELECT * FROM user_foods WHERE user_id = ? AND food_code = ?',
                [userId, productCode]
            );

            if (existingPreference.length > 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Food preference already exists' }));
                return;
            }

            // Add the new preference
            await pool.query('INSERT INTO user_foods (user_id, food_code) VALUES (?, ?)', [userId, productCode]);
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
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([])); // Trimitem un array gol
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
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const minPrice = parseFloat(urlParams.get('min'));
    const maxPrice = parseFloat(urlParams.get('max'));

    console.log(`Received request for price range: ${minPrice} - ${maxPrice}`); // Debug

    try {
        const query = 'SELECT * FROM food WHERE price BETWEEN ? AND ?';
        const [result] = await pool.query(query, [minPrice, maxPrice]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([])); // Trimitem un array gol
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
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const minCal = parseFloat(urlParams.get('min'));
    const maxCal = parseFloat(urlParams.get('max'));

    console.log(`Received request for calory range: ${minCal} - ${maxCal}`); // Debug

    try {
        const query = 'SELECT * FROM food WHERE energy_kcal_100g BETWEEN ? AND ?';
        const [result] = await pool.query(query, [minCal, maxCal]);
        console.log(`Database query result: ${JSON.stringify(result)}`); // Debug

        if (result.length === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([])); // Trimitem un array gol
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

const exportCulinaryPreferencesToCSV = async (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT f.code, f.product_name, f.brands, f.categories_en, f.ingredients_text, f.allergens, f.additives_en, f.price
        FROM food f
        JOIN user_foods uf ON f.code = uf.food_code
        WHERE uf.user_id = ?
    `;

    try {
        const [results] = await db.query(query, [userId]);
        if (results.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No culinary preferences found for this user' }));
            return;
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(results);

        res.setHeader('Content-Disposition', 'attachment; filename=culinary_preferences.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.writeHead(200);
        res.end(csv);
    } catch (error) {
        console.error('Error exporting culinary preferences to CSV:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to export culinary preferences' }));
    }
};

const exportCulinaryPreferencesToPDF = async (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT f.code, f.product_name, f.brands, f.categories_en, f.ingredients_text, f.allergens, f.additives_en, f.price
        FROM food f
        JOIN user_foods uf ON f.code = uf.food_code
        WHERE uf.user_id = ?
    `;

    try {
        const [results] = await db.query(query, [userId]);
        if (results.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No culinary preferences found for this user' }));
            return;
        }

        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Disposition', 'attachment; filename=culinary_preferences.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.writeHead(200);
            res.end(pdfData);
        });

        doc.fontSize(16).text('Culinary Preferences', { align: 'center' });
        doc.moveDown();

        results.forEach(item => {
            doc.fontSize(12).text(`Product Name: ${item.product_name}`);
            doc.text(`Brand: ${item.brands}`);
            doc.text(`Category: ${item.categories_en}`);
            doc.text(`Ingredients: ${item.ingredients_text}`);
            doc.text(`Allergens: ${item.allergens}`);
            doc.text(`Additives: ${item.additives_en}`);
            doc.text(`Price: ${item.price}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting culinary preferences to PDF:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to export culinary preferences' }));
    }
};

module.exports = {
    getAllFoods,
    getProductDetails,
    addUserFoodPreference,
    getUserFoodPreferences,
    getCategories,
    getFoodsByCategory,
    getCountries,
    getFoodsByCountry,
    getRestaurants,
    searchFoods,
    getFoodsByRestaurant,
    getFoodsByPrice,
    getFoodsByCalories,
    filterFoods,
    exportCulinaryPreferencesToCSV,
    exportCulinaryPreferencesToPDF
};