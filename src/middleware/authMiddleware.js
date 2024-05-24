const jwt = require('jsonwebtoken');
const secretKey = 'mySecretKey';

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token == null) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Forbidden' }));
            return;
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
