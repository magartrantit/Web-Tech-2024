const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cupo',
    password: 'web',
    port: 5432,
});

module.exports = pool;