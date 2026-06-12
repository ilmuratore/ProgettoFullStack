const pool = require('../config/db');

const TIPI = Object.freeze({
    SOTTO_SCORTA:             'SOTTO_SCORTA',
    PO_IN_RITARDO:            'PO_IN_RITARDO',
    RICEZIONE_PARZIALE:       'RICEZIONE_PARZIALE',
    CAMBIO_STATO_SPEDIZIONE:  'CAMBIO_STATO_SPEDIZIONE',
    RICHIESTA_ACCETTATA:      'RICHIESTA_ACCETTATA',
    RICHIESTA_RIFIUTATA:      'RICHIESTA_RIFIUTATA',
    MESSAGGIO_FORNITORE:      'MESSAGGIO_FORNITORE',
    ALTRO:                    'ALTRO'
});

const SELECT_COLS = `
    id,
    utente_id,
    tipo,
    messaggio,
    letto,
    riferimento_tipo,
    riferimento_id,
    created_at
`;
const findByUtenteId = (utente_id) =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         WHERE  utente_id = $1
         ORDER  BY created_at DESC`,
        [utente_id]
    );

const findNonLette = (utente_id) =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         WHERE  utente_id = $1
           AND  letto      = false
         ORDER  BY created_at DESC`,
        [utente_id]
    );

const countNonLette = (utente_id) =>
    pool.query(
        `SELECT COUNT(*) AS count
         FROM   notifiche
         WHERE  utente_id = $1
           AND  letto      = false`,
        [utente_id]
    );

const findById = (id) =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         WHERE  id = $1`,
        [id]
    );

const findAll = () =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         ORDER  BY created_at DESC`
    );

const create = ({ utente_id, tipo, messaggio, riferimento_tipo, riferimento_id, letto = false }, client) =>
    (client || pool).query(
        `INSERT INTO notifiche (utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${SELECT_COLS}`,
        [utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id]
    );

const markAsRead = (id) =>
    pool.query(
        `UPDATE notifiche
         SET letto      = true,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );

const markAllAsRead = (utente_id) =>
    pool.query(
        `UPDATE notifiche
         SET letto      = true,
             updated_at = NOW()
         WHERE utente_id = $1
           AND letto      = false
         RETURNING id`,
        [utente_id]
    );

const update = (id, { tipo, messaggio, letto, riferimento_tipo, riferimento_id }) =>
    pool.query(
        `UPDATE notifiche
         SET tipo             = COALESCE($1, tipo),
             messaggio        = COALESCE($2, messaggio),
             letto            = COALESCE($3, letto),
             riferimento_tipo = COALESCE($4, riferimento_tipo),
             riferimento_id   = COALESCE($5, riferimento_id),
             updated_at       = NOW()
         WHERE id = $6
         RETURNING ${SELECT_COLS}`,
        [tipo, messaggio, letto, riferimento_tipo, riferimento_id, id]
    );

const remove = (id) =>
    pool.query('DELETE FROM notifiche WHERE id = $1 RETURNING id', [id]);


module.exports = {
    TIPI,
    findAll,
    findById,
    findByUtenteId,
    findNonLette,
    countNonLette,
    create,
    update,
    markAsRead,
    markAllAsRead,
    remove
};
