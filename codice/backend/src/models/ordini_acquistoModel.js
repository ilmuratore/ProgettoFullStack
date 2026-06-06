const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT ordini_acquisto.id,
                ordini_acquisto.fornitore_id,
                fornitori.ragione_sociale AS fornitore,
                ordini_acquisto.stato,
                ordini_acquisto.data_prevista,
                ordini_acquisto.importo_totale,
                ordini_acquisto.note,
                ordini_acquisto.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                ordini_acquisto.created_at,
                ordini_acquisto.updated_at
     FROM ordini_acquisto
     JOIN fornitori ON ordini_acquisto.fornitore_id = fornitori.id
     LEFT JOIN utenti ON ordini_acquisto.utente_id = utenti.id
     ORDER BY ordini_acquisto.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT ordini_acquisto.id,
                ordini_acquisto.fornitore_id,
                fornitori.ragione_sociale AS fornitore,
                ordini_acquisto.stato,
                ordini_acquisto.data_prevista,
                ordini_acquisto.importo_totale,
                ordini_acquisto.note,
                ordini_acquisto.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                ordini_acquisto.created_at,
                ordini_acquisto.updated_at
     FROM ordini_acquisto
     JOIN fornitori ON ordini_acquisto.fornitore_id = fornitori.id
     LEFT JOIN utenti ON ordini_acquisto.utente_id = utenti.id
     WHERE ordini_acquisto.id = $1`,
        [id]
    );

const findByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT id, fornitore_id, stato, data_prevista, importo_totale, note, utente_id, created_at, updated_at
     FROM ordini_acquisto
     WHERE fornitore_id = $1
     ORDER BY id`,
        [fornitore_id]
    );

const findByStato = (stato) =>
    pool.query(
        `SELECT ordini_acquisto.id,
                ordini_acquisto.fornitore_id,
                fornitori.ragione_sociale AS fornitore,
                ordini_acquisto.stato,
                ordini_acquisto.data_prevista,
                ordini_acquisto.importo_totale,
                ordini_acquisto.note,
                ordini_acquisto.utente_id,
                CONCAT(utenti.nome, ' ', utenti.cognome) AS utente,
                ordini_acquisto.created_at,
                ordini_acquisto.updated_at
     FROM ordini_acquisto
     JOIN fornitori ON ordini_acquisto.fornitore_id = fornitori.id
     LEFT JOIN utenti ON ordini_acquisto.utente_id = utenti.id
     WHERE ordini_acquisto.stato = $1
     ORDER BY ordini_acquisto.id`,
        [stato]
    );


const create = ({ fornitore_id, stato = 'BOZZA', data_prevista, importo_totale, note, utente_id }) =>
    pool.query(
        `INSERT INTO ordini_acquisto (fornitore_id, stato, data_prevista, importo_totale, note, utente_id)
     VALUES ($1, $2::purchase_order_state, $3, $4, $5, $6)
     RETURNING id, fornitore_id, stato, data_prevista, importo_totale, note, utente_id, created_at, updated_at`,
        [fornitore_id, stato, data_prevista, importo_totale, note, utente_id]
    );

const update = (id, { fornitore_id, stato, data_prevista, importo_totale, note, utente_id }) =>
    pool.query(
        `UPDATE ordini_acquisto
     SET fornitore_id = COALESCE($1, fornitore_id),
         stato = COALESCE($2::purchase_order_state, stato),
         data_prevista = COALESCE($3, data_prevista),
         importo_totale = COALESCE($4, importo_totale),
         note = COALESCE($5, note),
         utente_id = COALESCE($6, utente_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING id, fornitore_id, stato, data_prevista, importo_totale, note, utente_id, created_at, updated_at`,
        [fornitore_id, stato, data_prevista, importo_totale, note, utente_id, id]
    );


const updateStato = (id, stato) =>
    pool.query(
        `UPDATE ordini_acquisto
     SET stato = $1::purchase_order_state,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, stato, updated_at`,
        [stato, id]
    );

const remove = (id) =>
    pool.query(
        `UPDATE ordini_acquisto
     SET stato = 'ANNULLATO',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
        [id]
    );


module.exports = {
    findAll, findById, findByFornitoreId, findByStato,
    create, update, updateStato, remove
};
