const {
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
    searchFoods,
    getFoodsByPrice, 
    getFoodsByCalories, 
    filterFoods,
    bodyParser,
    updateUser,
    createUserList, // Importă funcția pentru crearea unei liste
    getUserLists, // Importă funcția pentru obținerea listelor unui utilizator
    addFoodList,
    getListItems
} = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const db = require('../config/dbConfig');

const userRoutes = async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/users') {
        createUser(req, res);
    } else if (req.method === 'PUT' && req.url.startsWith('/api/users/')) {
        const userId = req.url.split('/').pop();
    
        bodyParser(req, (err) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad request, invalid JSON' }));
                return;
            }
    
            const { username, password } = req.body; // presupunem că acestea sunt datele pe care dorim să le actualizăm
    
            // Actualizăm datele utilizatorului în baza de date
            updateUser(userId, username, password, (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error updating user' }));
                    return;
                }
            });
    
            // După actualizare, trimiteți un răspuns corespunzător
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: 'User updated successfully' }));
        });
    } else if (req.method === 'POST' && req.url === '/api/login') {
        loginUser(req, res);
    } else if (req.method === 'POST' && req.url === '/api/uploadProfileImage') {
        uploadProfileImage(req, res);
    } else if (req.method === 'GET' && req.url === '/api/protected' ) {
        authenticateToken(req, res, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Protected route accessed', user: req.user }));
        });
    }
     else if (req.method === 'GET' && req.url.startsWith('/api/foods/search/')) {
        const searchQuery = decodeURIComponent(req.url.split('/api/foods/search/')[1]);
        req.params = { searchQuery };
        searchFoods(req, res);
    } else if (req.method === 'POST' && req.url === '/api/foods/filter') {
        filterFoods(req, res);
    } else if (req.method === 'GET' && req.url === '/api/foods') {
        getAllFoods(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/category/')) {
        const category = decodeURIComponent(req.url.split('/').pop());
        req.params = { category };
        getFoodsByCategory(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/country/')) {
        const country = decodeURIComponent(req.url.split('/').pop());
        req.params = { country };
        getFoodsByCountry(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/restaurant/')) {
        const restaurant = decodeURIComponent(req.url.split('/').pop());
        req.params = { restaurant };
        getFoodsByRestaurant(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/price')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const minPrice = parseFloat(urlParams.get('min'));
        const maxPrice = parseFloat(urlParams.get('max'));
        req.params = { minPrice, maxPrice };
        getFoodsByPrice(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/calories')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const minCal = parseFloat(urlParams.get('min'));
        const maxCal = parseFloat(urlParams.get('max'));
        req.params = { minCal, maxCal };
        getFoodsByCalories(req, res);
    } else if (req.method === 'GET' && req.url.startsWith('/api/foods/')) {
        const productId = req.url.split('/').pop();
        req.params = { id: productId };
        getProductDetails(req, res);
    } else if (req.method === 'POST' && req.url === '/api/user/food-preferences') {
        authenticateToken(req, res, () => {
            addUserFoodPreference(req, res);
        });
    } else if (req.method === 'GET' && req.url.startsWith('/api/user/food-preferences/')) {
        const userId = req.url.split('/').pop();
        req.params = { userId };
        authenticateToken(req, res, () => {
            getUserFoodPreferences(req, res);
        });
    }else  if (req.method === 'POST' && req.url === '/api/user-lists') {
        authenticateToken(req, res, () => {
            addFoodList(req, res);
        });
    }
    else if (req.method === 'GET' && req.url.startsWith('/api/list/items/')) {
        authenticateToken(req, res, () => {
            const listId = req.url.split('/').pop();
            req.params = { listId };
            getListItems(req, res);
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
                    "energy-kcal_100g": fields["energy-kcal_100g"],
                    fat_100g: fields.fat_100g,
                    "saturated-fat_100g": fields["saturated-fat_100g"],
                    carbohydrates_100g: fields.carbohydrates_100g,
                    sugars_100g: fields.sugars_100g,
                    fiber_100g: fields.fiber_100g,
                    proteins_100g: fields.proteins_100g,
                    salt_100g: fields.salt_100g,
                    sodium_100g: fields.sodium_100g,
                    restaurants: fields.restaurants,
                    price: fields.price,
                };

                const query = 'INSERT INTO food SET ?';
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
        const query = 'SELECT id, username FROM users where admin = 0';
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
    } else if (req.method === 'GET' && req.url === '/api/countries') {
        getCountries(req, res);
    } else if (req.method === 'GET' && req.url === '/api/restaurants') {
        getRestaurants(req, res);
    } else if (req.method === 'GET' && req.url === '/api/lists') {
        authenticateToken(req, res, () => {
            const userId = req.user.id;
            req.params = { userId };
            getUserLists(req, res);
        });
    } else if (req.method === 'POST' && req.url === '/api/lists') {
        authenticateToken(req, res, () => {
            bodyParser(req, (err) => {
                if (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Bad request, invalid JSON' }));
                    return;
                }
                req.body.userId = req.user.id;
                createUserList(req, res);
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

module.exports = userRoutes;
