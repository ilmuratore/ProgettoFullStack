const pool = require('../config/db');

const findAll = () =>
    pool.query(
        'SELECT id, nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id FROM dipendenti ORDER BY id'
    );


const findById = (id) =>
    pool.query(
        'SELECT id, nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id FROM dipendenti WHERE id = $1',
        [id]
    );

const findByCodiceFiscale = (codice_fiscale) =>
    pool.query('SELECT * FROM dipendenti WHERE codice_fiscale = $1', [codice_fiscale]);


const create = ({ nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) =>
    pool.query(
        `INSERT INTO dipendenti (nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id`,
        [nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id]
    );

const update = (id, { nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) =>
    pool.query(
        `UPDATE dipendenti
     SET nome = COALESCE($1, nome),
         cognome = COALESCE($2, cognome),
         codice_fiscale = COALESCE($3, codice_fiscale),
         ruolo_operativo = COALESCE($4, ruolo_operativo),
         data_assunzione = COALESCE($5, data_assunzione),
         utente_id = COALESCE($6, utente_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING id, nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id`,
        [nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id, id]
    );


const remove = (id) =>
    pool.query('DELETE FROM dipendenti WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByCodiceFiscale,
    create, update, remove
};
