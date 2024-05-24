const { createUser, loginUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

const userRoutes = (req, res) => {
    if (req.method === 'POST' && req.url === '/api/users') {
        createUser(req, res);
    } else if (req.method === 'POST' && req.url === '/api/login') {
        loginUser(req, res);
    } else if (req.method === 'GET' && req.url === '/api/protected') {
        authenticateToken(req, res, () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Protected route accessed', user: req.user }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

module.exports = userRoutes;
