const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT corrieri.id,
                corrieri.nome,
                corrieri.codice,
                corrieri.email_operativa,
                corrieri.telefono,
                corrieri.utente_responsabile_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente_responsabile,
                corrieri.note,
                corrieri.created_at,
                corrieri.updated_at
     FROM corrieri
     LEFT JOIN utenti ON corrieri.utente_responsabile_id = utenti.id
     ORDER BY corrieri.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT corrieri.id,
                corrieri.nome,
                corrieri.codice,
                corrieri.email_operativa,
                corrieri.telefono,
                corrieri.utente_responsabile_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente_responsabile,
                corrieri.note,
                corrieri.created_at,
                corrieri.updated_at
     FROM corrieri
     LEFT JOIN utenti ON corrieri.utente_responsabile_id = utenti.id
     WHERE corrieri.id = $1`,
        [id]
    );

const findByCodice = (codice) =>
    pool.query(
        `SELECT id, nome, codice, email_operativa, telefono, utente_responsabile_id, note, created_at, updated_at
     FROM corrieri
     WHERE codice = $1`,
        [codice]
    );

const findByNome = (nome) =>
    pool.query(
        `SELECT id, nome, codice, email_operativa, telefono, utente_responsabile_id, note, created_at, updated_at
     FROM corrieri
     WHERE nome = $1`,
        [nome]
    );

const findByUtenteResponsabileId = (utente_responsabile_id) =>
    pool.query(
        `SELECT id, nome, codice, email_operativa, telefono, utente_responsabile_id, note, created_at, updated_at
     FROM corrieri
     WHERE utente_responsabile_id = $1
     ORDER BY id`,
        [utente_responsabile_id]
    );


const create = ({ nome, codice, email_operativa, telefono, utente_responsabile_id, note }) =>
    pool.query(
        `INSERT INTO corrieri (nome, codice, email_operativa, telefono, utente_responsabile_id, note)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, codice, email_operativa, telefono, utente_responsabile_id, note, created_at, updated_at`,
        [nome, codice, email_operativa, telefono, utente_responsabile_id, note]
    );

const update = (id, { nome, codice, email_operativa, telefono, utente_responsabile_id, note }) =>
    pool.query(
        `UPDATE corrieri
     SET nome = COALESCE($1, nome),
         codice = COALESCE($2, codice),
         email_operativa = COALESCE($3, email_operativa),
         telefono = COALESCE($4, telefono),
         utente_responsabile_id = COALESCE($5, utente_responsabile_id),
         note = COALESCE($6, note),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING id, nome, codice, email_operativa, telefono, utente_responsabile_id, note, created_at, updated_at`,
        [nome, codice, email_operativa, telefono, utente_responsabile_id, note, id]
    );


const remove = (id) =>
    pool.query(
        `DELETE FROM corrieri
     WHERE id = $1
     RETURNING id, nome, codice, email_operativa, telefono, utente_responsabile_id, note, created_at, updated_at`,
        [id]
    );


module.exports = {
    findAll, findById, findByCodice, findByNome, findByUtenteResponsabileId,
    create, update, remove
};
