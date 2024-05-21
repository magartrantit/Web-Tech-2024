const { createUser, loginUser } = require('../controllers/userController');

const userRoutes = (req, res) => {
    if (req.method === 'POST' && req.url === '/api/users') {
        createUser(req, res);
    } else if (req.method === 'POST' && req.url === '/api/login') {
        loginUser(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

module.exports = userRoutes;
