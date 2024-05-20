const { createUser, getUsers } = require('../controllers/userController');

const userRoutes = (req, res) => {
    if (req.method === 'POST' && req.url === '/api/users') {
        createUser(req, res);
    } else if (req.method === 'GET' && req.url === '/api/users') {
        getUsers(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

module.exports = userRoutes;
