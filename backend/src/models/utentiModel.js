const pool = require('../config/db');

const CREATE_TABLE = `
    CREATE TABLE IF NOT EXISTS utenti (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nome          TEXT    NOT NULL,
    cognome       TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    ruolo_id      INT NOT NULL,
    attivo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_utenti_ruolo
        FOREIGN KEY (ruolo_id) REFERENCES ruoli(id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);
`;

const init = () => pool.query(CREATE_TABLE);

const findAll = () =>
    pool.query(
        'SELECT id, nome, cognome, email, ruolo_id, attivo FROM utenti ORDER BY id'
    );


const findById = (id) =>
    pool.query(
        'SELECT id, nome, cognome, email, ruolo_id, FROM utenti WHERE id = $1',
        [id]
    );

const findByEmail = (email) =>
    pool.query('SELECT * FROM utenti WHERE email = $1', [email]);


const create = ({ nome, cognome, email, password, ruolo = 'utente' }) =>
    pool.query(
        `INSERT INTO utenti (nome, cognome, email, password, ruolo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nome, cognome, email, ruolo`,
        [nome, cognome, email, password, ruolo]
    );

const update = (id, { nome, cognome, email, ruolo }) =>
    pool.query(
        `UPDATE utenti
     SET nome    = COALESCE($1, nome),
         cognome = COALESCE($2, cognome),
         email   = COALESCE($3, email),
         ruolo   = COALESCE($4, ruolo),
         token_version = token_version + 1
     WHERE id = $5
     RETURNING id, nome, cognome, email, ruolo`,
        [nome, cognome, email, ruolo, id]
    );


const updatePassword = (id, hashedPassword) =>
    pool.query(
        `UPDATE utenti
     SET password      = $1,
         token_version = token_version + 1
     WHERE id = $2
     RETURNING id`,
        [hashedPassword, id]
    );

const remove = (id) =>
    pool.query('DELETE FROM utenti WHERE id = $1 RETURNING id', [id]);


module.exports = {
    init, findAll, findById, findByEmail,
    create, update, updatePassword, remove
};