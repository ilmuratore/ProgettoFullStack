const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT ricezioni.id,
                ricezioni.ordine_acquisto_id,
                ordini_acquisto.stato AS stato_ordine,
                ordini_acquisto.fornitore_id,
                fornitori.ragione_sociale AS fornitore,
                ricezioni.data_ricezione,
                ricezioni.note,
                ricezioni.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                ricezioni.created_at,
                ricezioni.updated_at
     FROM ricezioni
     JOIN ordini_acquisto ON ricezioni.ordine_acquisto_id = ordini_acquisto.id
     JOIN fornitori ON ordini_acquisto.fornitore_id = fornitori.id
     LEFT JOIN utenti ON ricezioni.utente_id = utenti.id
     ORDER BY ricezioni.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT ricezioni.id,
                ricezioni.ordine_acquisto_id,
                ordini_acquisto.stato AS stato_ordine,
                ordini_acquisto.fornitore_id,
                fornitori.ragione_sociale AS fornitore,
                ricezioni.data_ricezione,
                ricezioni.note,
                ricezioni.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                ricezioni.created_at,
                ricezioni.updated_at
     FROM ricezioni
     JOIN ordini_acquisto ON ricezioni.ordine_acquisto_id = ordini_acquisto.id
     JOIN fornitori ON ordini_acquisto.fornitore_id = fornitori.id
     LEFT JOIN utenti ON ricezioni.utente_id = utenti.id
     WHERE ricezioni.id = $1`,
        [id]
    );

const findByOrdineAcquistoId = (ordine_acquisto_id) =>
    pool.query(
        `SELECT id, ordine_acquisto_id, data_ricezione, note, utente_id, created_at, updated_at
     FROM ricezioni
     WHERE ordine_acquisto_id = $1
     ORDER BY id`,
        [ordine_acquisto_id]
    );

const findByUtenteId = (utente_id) =>
    pool.query(
        `SELECT id, ordine_acquisto_id, data_ricezione, note, utente_id, created_at, updated_at
     FROM ricezioni
     WHERE utente_id = $1
     ORDER BY data_ricezione DESC`,
        [utente_id]
    );


const create = ({ ordine_acquisto_id, data_ricezione, note, utente_id }) =>
    pool.query(
        `INSERT INTO ricezioni (ordine_acquisto_id, data_ricezione, note, utente_id)
     VALUES ($1, COALESCE($2, CURRENT_TIMESTAMP), $3, $4)
     RETURNING id, ordine_acquisto_id, data_ricezione, note, utente_id, created_at, updated_at`,
        [ordine_acquisto_id, data_ricezione, note, utente_id]
    );

const update = (id, { ordine_acquisto_id, data_ricezione, note, utente_id }) =>
    pool.query(
        `UPDATE ricezioni
     SET ordine_acquisto_id = COALESCE($1, ordine_acquisto_id),
         data_ricezione = COALESCE($2, data_ricezione),
         note = COALESCE($3, note),
         utente_id = COALESCE($4, utente_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, ordine_acquisto_id, data_ricezione, note, utente_id, created_at, updated_at`,
        [ordine_acquisto_id, data_ricezione, note, utente_id, id]
    );


const remove = (id) =>
    pool.query('DELETE FROM ricezioni WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByOrdineAcquistoId, findByUtenteId,
    create, update, remove
};
