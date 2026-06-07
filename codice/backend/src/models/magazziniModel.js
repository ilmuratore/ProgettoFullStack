const pool = require('../config/db');

const COLS = `id, codice, nome, indirizzo, cap, citta, provincia, paese, attivo`;

const findAll = () =>
    pool.query(
        `SELECT ${COLS}
         FROM magazzini
         ORDER BY id`
    );

const findById = (id) =>
    pool.query(
        `SELECT ${COLS}
         FROM magazzini
         WHERE id = $1`,
        [id]
    );

const findByCodice = (codice) =>
    pool.query(
        `SELECT ${COLS}
         FROM magazzini
         WHERE codice = $1`,
        [codice]
    );

const findAttivi = () =>
    pool.query(
        `SELECT ${COLS}
         FROM magazzini
         WHERE attivo = true
         ORDER BY nome`
    );

const findUbicazioniByMagazzino = (magazzino_id) =>
    pool.query(
        `SELECT u.id,
                u.magazzino_id,
                u.corsia,
                u.scaffale,
                u.attivo,
                u.temperatura_controllata,
                COALESCE(SUM(g.quantita), 0)::integer AS totale_giacenza
         FROM   ubicazioni u
         LEFT JOIN giacenze g ON g.ubicazione_id = u.id
         WHERE  u.magazzino_id = $1
         GROUP  BY u.id
         ORDER  BY u.corsia ASC, u.scaffale ASC`,
        [magazzino_id]
    );

const create = ({ codice, nome, indirizzo, cap, citta, provincia, paese, attivo = true }) =>
    pool.query(
        `INSERT INTO magazzini (codice, nome, indirizzo, cap, citta, provincia, paese, attivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${COLS}`,
        [codice, nome, indirizzo, cap, citta, provincia, paese, attivo]
    );

const update = (id, { codice, nome, indirizzo, cap, citta, provincia, paese, attivo }) =>
    pool.query(
        `UPDATE magazzini
         SET codice    = COALESCE($1, codice),
             nome      = COALESCE($2, nome),
             indirizzo = COALESCE($3, indirizzo),
             cap       = COALESCE($4, cap),
             citta     = COALESCE($5, citta),
             provincia = COALESCE($6, provincia),
             paese     = COALESCE($7, paese),
             attivo    = COALESCE($8, attivo),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING ${COLS}`,
        [codice, nome, indirizzo, cap, citta, provincia, paese, attivo, id]
    );

const toggleAttivo = (id) =>
    pool.query(
        `UPDATE magazzini
         SET attivo     = NOT attivo,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING ${COLS}`,
        [id]
    );

const remove = (id) =>
    pool.query(
        `UPDATE magazzini
         SET attivo     = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id`,
        [id]
    );

module.exports = {
    findAll, findById, findByCodice, findAttivi, findUbicazioniByMagazzino,
    create, update, toggleAttivo, remove
};