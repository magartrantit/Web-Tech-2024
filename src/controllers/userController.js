const User = require('../models/user');

const users = [];

const createUser = (req, res) => {
    const { email, username, password } = req.body;
    const newUser = new User(Date.now(), email, username, password);
    users.push(newUser);
    res.status(201).json(newUser);
};

const getUsers = (req, res) => {
    res.status(200).json(users);
};

module.exports = { createUser, getUsers };
