// Se importă modulul mysql2 pentru a gestiona conexiunile la baza de date MySQL
const mysql = require('mysql2/promise');

// Se creează un nou pool de conexiuni cu detaliile necesare pentru a se conecta la baza de date
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // numele de utilizator pentru baza de date
    password: '500delei', // parola pentru utilizatorul bazei de date
    database: 'cupo', // numele bazei de date la care se face conexiunea
});

// Se exportă pool-ul pentru a putea fi folosit în alte module
module.exports = pool;
