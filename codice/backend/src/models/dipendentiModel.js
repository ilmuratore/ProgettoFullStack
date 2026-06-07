
const pool = require('../config/db');

const COLS = `
    id, nome, cognome, codice_fiscale,
    ruolo_operativo, data_assunzione, utente_id,
    created_at, updated_at
`;

const findAll = () =>
    pool.query(
        `SELECT ${COLS}
         FROM   dipendenti
         ORDER  BY cognome ASC, nome ASC`
    );

const findById = (id) =>
    pool.query(
        `SELECT ${COLS}
         FROM   dipendenti
         WHERE  id = $1`,
        [id]
    );


const create = ({ nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) =>
    pool.query(
        `INSERT INTO dipendenti
             (nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${COLS}`,
        [nome, cognome, codice_fiscale, ruolo_operativo ?? null, data_assunzione ?? null, utente_id ?? null]
    );


const update = (id, { nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) =>
    pool.query(
        `UPDATE dipendenti
         SET nome             = COALESCE($1, nome),
             cognome          = COALESCE($2, cognome),
             codice_fiscale   = COALESCE($3, codice_fiscale),
             ruolo_operativo  = COALESCE($4, ruolo_operativo),
             data_assunzione  = COALESCE($5, data_assunzione),
             utente_id        = COALESCE($6, utente_id),
             updated_at       = NOW()
         WHERE id = $7
         RETURNING ${COLS}`,
        [nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id, id]
    );


const remove = (id) =>
    pool.query(
        `DELETE FROM dipendenti
         WHERE id = $1
         RETURNING id`,
        [id]
    );



module.exports = { findAll, findById, create, update, remove };
