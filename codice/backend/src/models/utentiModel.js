const pool = require('../config/db');

const findAll = () =>
    pool.query(
        `SELECT utenti.id,
                utenti.nome,
                utenti.cognome,
                utenti.email,
                utenti.ruolo_id,
                ruoli.nome AS ruolo,
                utenti.attivo,
                utenti.created_at,
                utenti.updated_at
     FROM utenti
     JOIN ruoli ON utenti.ruolo_id = ruoli.id
     ORDER BY utenti.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT utenti.id,
                utenti.nome,
                utenti.cognome,
                utenti.email,
                utenti.ruolo_id,
                ruoli.nome AS ruolo,
                utenti.attivo,
                utenti.created_at,
                utenti.updated_at
     FROM utenti
     JOIN ruoli ON utenti.ruolo_id = ruoli.id
     WHERE utenti.id = $1`,
        [id]
    );

const findByEmail = (email) =>
    pool.query(
        `SELECT utenti.*, ruoli.nome AS ruolo
     FROM utenti
     JOIN ruoli ON utenti.ruolo_id = ruoli.id
     WHERE utenti.email = $1`,
        [email]
    );

const findPasswordHash = (id) =>
    pool.query(
        `SELECT id, password_hash, attivo FROM utenti WHERE id = $1`,
        [id]
    );


const create = ({ nome, cognome, email, password_hash, ruolo_id, attivo = true }) =>
    pool.query(
        `INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, cognome, email, ruolo_id, attivo, created_at, updated_at`,
        [nome, cognome, email, password_hash, ruolo_id, attivo]
    );

const update = (id, { nome, cognome, email, ruolo_id, attivo }) =>
    pool.query(
        `UPDATE utenti
     SET nome    = COALESCE($1, nome),
         cognome = COALESCE($2, cognome),
         email   = COALESCE($3, email),
         ruolo_id = COALESCE($4, ruolo_id),
         attivo  = COALESCE($5, attivo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, nome, cognome, email, ruolo_id, attivo, created_at, updated_at`,
        [nome, cognome, email, ruolo_id, attivo, id]
    );


const updatePassword = (id, hashedPassword) =>
    pool.query(
        `UPDATE utenti
     SET password_hash = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, updated_at`,
        [hashedPassword, id]
    );

const remove = (id) =>
    pool.query(
        `UPDATE utenti
     SET attivo = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, attivo, updated_at`,
        [id]
    );


module.exports = {
    findAll, findById, findByEmail, findPasswordHash,
    create, update, updatePassword, remove
};
