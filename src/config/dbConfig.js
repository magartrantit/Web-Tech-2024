// Se importă obiectul Pool din biblioteca 'pg' pentru a gestiona conexiunile la baza de date PostgreSQL
const { Pool } = require('pg');

// Se creează un nou pool de conexiuni cu detaliile necesare pentru a se conecta la baza de date
const pool = new Pool({
    user: 'postgres', // numele de utilizator pentru baza de date
    host: 'localhost', // adresa gazdei unde rulează baza de date
    database: 'cupo', // numele bazei de date la care se face conexiunea
    password: 'web', // parola pentru utilizatorul bazei de date
    port: 5432, // portul pe care rulează baza de date
});

// Se exportă pool-ul pentru a putea fi folosit în alte module
module.exports = pool;