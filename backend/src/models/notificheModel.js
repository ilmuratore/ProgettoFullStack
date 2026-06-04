const pool = require('../config/db');

const findAll = () =>
    pool.query(
        'SELECT id, utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id FROM notifiche ORDER BY id'
    );


const findById = (id) =>
    pool.query(
        'SELECT id, utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id FROM notifiche WHERE id = $1',
        [id]
    );

const findByUtenteId = (utente_id) =>
    pool.query(
        'SELECT id, utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id FROM notifiche WHERE utente_id = $1 ORDER BY created_at DESC',
        [utente_id]
    );


const create = ({ utente_id, tipo, messaggio, letto = false, riferimento_tipo, riferimento_id }) =>
    pool.query(
        `INSERT INTO notifiche (utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id`,
        [utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id]
    );

const update = (id, { tipo, messaggio, letto, riferimento_tipo, riferimento_id }) =>
    pool.query(
        `UPDATE notifiche
     SET tipo = COALESCE($1, tipo),
         messaggio = COALESCE($2, messaggio),
         letto = COALESCE($3, letto),
         riferimento_tipo = COALESCE($4, riferimento_tipo),
         riferimento_id = COALESCE($5, riferimento_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id`,
        [tipo, messaggio, letto, riferimento_tipo, riferimento_id, id]
    );

const markAsRead = (id) =>
    pool.query(
        `UPDATE notifiche
     SET letto = true,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
        [id]
    );


const remove = (id) =>
    pool.query('DELETE FROM notifiche WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByUtenteId,
    create, update, markAsRead, remove
};
