const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT id,
                ragione_sociale,
                piva,
                indirizzo,
                email,
                telefono,
                lead_time_giorni,
                attivo
     FROM fornitori
     ORDER BY id`
    );


const findById = (id) =>
    pool.query(
        `SELECT id,
                ragione_sociale,
                piva,
                indirizzo,
                email,
                telefono,
                lead_time_giorni,
                attivo
     FROM fornitori
     WHERE id = $1`,
        [id]
    );

const findByPiva = (piva) =>
    pool.query(
        `SELECT id,
                ragione_sociale,
                piva,
                indirizzo,
                email,
                telefono,
                lead_time_giorni,
                attivo
     FROM fornitori
     WHERE piva = $1`,
        [piva]
    );

const findAttivi = () =>
    pool.query(
        `SELECT id,
                ragione_sociale,
                piva,
                indirizzo,
                email,
                telefono,
                lead_time_giorni,
                attivo
     FROM fornitori
     WHERE attivo = true
     ORDER BY ragione_sociale`
    );


const create = ({ ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo = true }) =>
    pool.query(
        `INSERT INTO fornitori (ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo`,
        [ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo]
    );

const update = (id, { ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo }) =>
    pool.query(
        `UPDATE fornitori
     SET ragione_sociale = COALESCE($1, ragione_sociale),
         piva = COALESCE($2, piva),
         indirizzo = COALESCE($3, indirizzo),
         email = COALESCE($4, email),
         telefono = COALESCE($5, telefono),
         lead_time_giorni = COALESCE($6, lead_time_giorni),
         attivo = COALESCE($7, attivo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING id, ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo`,
        [ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni, attivo, id]
    );


const findContattiByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT id, fornitore_id, nome, ruolo, email, telefono
     FROM contatti_fornitori
     WHERE fornitore_id = $1
     ORDER BY id`,
        [fornitore_id]
    );

const createContatto = ({ fornitore_id, nome, ruolo, email, telefono }) =>
    pool.query(
        `INSERT INTO contatti_fornitori (fornitore_id, nome, ruolo, email, telefono)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, fornitore_id, nome, ruolo, email, telefono`,
        [fornitore_id, nome, ruolo, email, telefono]
    );

const updateContatto = (id, { nome, ruolo, email, telefono }) =>
    pool.query(
        `UPDATE contatti_fornitori
     SET nome = COALESCE($1, nome),
         ruolo = COALESCE($2, ruolo),
         email = COALESCE($3, email),
         telefono = COALESCE($4, telefono),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, fornitore_id, nome, ruolo, email, telefono`,
        [nome, ruolo, email, telefono, id]
    );

const removeContatto = (id) =>
    pool.query('DELETE FROM contatti_fornitori WHERE id = $1 RETURNING id', [id]);


const remove = (id) =>
    pool.query(
        `UPDATE fornitori
     SET attivo = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
        [id]
    );


module.exports = {
    findAll, findById, findByPiva, findAttivi,
    create, update, remove,
    findContattiByFornitoreId, createContatto, updateContatto, removeContatto
};
