const { createUser, loginUser, uploadProfileImage, getAllFoods, getProductDetails, addUserFoodPreference, getUserFoodPreferences, getCategories, getFoodsByCategory, refreshToken } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const db = require('../config/dbConfig');

const userRoutes = async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/users') {
        createUser(req, res);
    } else if (req.method === 'POST' && req.url === '/api/login') {
        loginUser(req, res);
    } else if (req.method === 'POST' && req.url === '/api/uploadProfileImage') {
        uploadProfileImage(req, res);
    } else if (req.method === 'GET' && req.url === '/api/protected') {
        authenticateToken(req, res, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Protected route accessed', user: req.user }));
        });
    } else if (req.method === 'GET' && req.url === '/api/foods') {
        getAllFoods(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/category/')) {
        const category = decodeURIComponent(req.url.split('/').pop());
        req.params = { category };
        getFoodsByCategory(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/')) {
        const productId = req.url.split('/').pop();
        req.params = { id: productId };
        getProductDetails(req, res);
    } 
    else if (req.method === 'POST' && req.url === '/api/user/food-preferences') {
        authenticateToken(req, res, () => {
            addUserFoodPreference(req, res);
        });
    } 
    else if (req.method === 'GET' && req.url.startsWith('/api/user/food-preferences/')) {
        const userId = req.url.split('/').pop();
        req.params = { userId };
        authenticateToken(req, res, () => {
            getUserFoodPreferences(req, res);
        });
    }
    else if (req.method === 'POST' && req.url === '/api/refreshToken') {
        refreshToken(req, res);
    } else if (req.method === 'POST' && req.url === '/api/products') {
        authenticateToken(req, res, async () => {
            const form = new formidable.IncomingForm();
            form.parse(req, async (err, fields) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error parsing form data' }));
                    return;
                }

                const productData = {
                    code: fields.code,
                    url: fields.image_url,
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
                    "energy-kcal_100g": fields.energy_kcal_100g,
                    fat_100g: fields.fat_100g,
                    "saturated-fat_100g": fields.saturated_fat_100g,
                    carbohydrates_100g: fields.carbohydrates_100g,
                    sugars_100g: fields.sugars_100g,
                    fiber_100g: fields.fiber_100g,
                    proteins_100g: fields.proteins_100g,
                    salt_100g: fields.salt_100g,
                    sodium_100g: fields.sodium_100g,
                };

                const query = 'INSERT INTO products SET ?';
                try {
                    await db.query(query, productData);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Product added successfully' }));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error inserting product into database' }));
                }
            });
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/api/users/')) {
        const userId = req.url.split('/').pop();
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error deleting user' }));
                return;
            }
            if (results.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User deleted successfully' }));
        });
    } else if (req.method === 'GET' && req.url === '/api/users') {
        const query = 'SELECT id, username FROM users';
        try {
            const [results] = await db.query(query);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Error fetching users' }));
        }
    } else if (req.method === 'GET' && req.url === '/api/categories') {
        getCategories(req, res);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

module.exports = userRoutes;
