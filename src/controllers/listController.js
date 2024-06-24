const pool = require('../config/dbConfig');
const db = require('../config/dbConfig');


const addFoodList = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const { listId, foodCode } = JSON.parse(body);
            console.log(`Adding food to list: ${listId}, food: ${foodCode}`);

            // Check if the item already exists in the list
            const [existingItem] = await pool.query(
                'SELECT * FROM list_items WHERE list_id = ? AND food_code = ?',
                [listId, foodCode]
            );

            if (existingItem.length > 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Food already exists in the list' }));
                return;
            }

            // Add the new item to the list
            await pool.query('INSERT INTO list_items (list_id, food_code) VALUES (?, ?)', [listId, foodCode]);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Food added to list successfully' }));
        } catch (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
    });
};

const createUserList = (req, res) => {
    const { userId, listName } = req.body;
    if (!userId || !listName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UserId and ListName are required.' }));
        return;
    }

    const query = 'INSERT INTO user_lists (user_id, list_name) VALUES (?, ?)';
    db.query(query, [userId, listName], (err, result) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error inserting list into database' }));
            return;
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'List added successfully', id: result.insertId, userId, listName }));
    });
};

const getUserLists = async (req, res) => {
    const userId = req.params.userId;
    console.log(`Fetching lists for user: ${userId}`);

    try {
        const [results] = await db.query('SELECT * FROM user_lists WHERE user_id = ?', [userId]);
        console.log(`Found ${results.length} lists for user: ${userId}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error fetching lists from database' }));
    }
};


const getListItems = async (req, res, listId) => {
    try {
        const query = `
            SELECT food.*, list_items.list_id, IFNULL(food.price, 0) as price FROM food
            JOIN list_items ON food.code = list_items.food_code
            WHERE list_items.list_id = ?
        `;
        const [items] = await pool.query(query, [listId]);

        // Calculează statisticile
        const numProducts = items.length;
        const totalPrice = items.reduce((sum, item) => sum + (item.price ? parseFloat(item.price) : 0), 0);
        const allergens = [...new Set(items.map(item => item.allergens).filter(allergen => allergen && allergen !== 'None'))].join(', ');
        const additives = [...new Set(items.map(item => item.additives_en).filter(additive => additive && additive !== 'None'))].join(', ');

        console.log("Items fetched from database:", items); // Adaugă acest log

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ items, numProducts, totalPrice, allergens, additives }));
    } catch (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
    }
};

module.exports = {
    addFoodList,
    createUserList,
    getUserLists,
    getListItems
};