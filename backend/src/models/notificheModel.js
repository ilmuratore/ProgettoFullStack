// ============================================================
// notificheModel.js  —  V2
// M11: Notifiche & Alert Operativi (Esteso)
//
// Modifiche V2:
//   + TIPI costanti esportate (inclusi 3 nuovi valori ecosistema)
//   + findNonLette(utente_id) — solo notifiche non lette (polling 30s)
//   + countNonLette(utente_id) — contatore badge topbar
//   + markAllAsRead(utente_id) — segna tutte come lette
// ============================================================

const pool = require('../config/db');

// -----------------------------------------------------------------
// Costanti enum notification_type (allineate al DB V2)
// -----------------------------------------------------------------
const TIPI = Object.freeze({
    // V1 — operativi
    SOTTO_SCORTA:             'SOTTO_SCORTA',
    PO_IN_RITARDO:            'PO_IN_RITARDO',
    RICEZIONE_PARZIALE:       'RICEZIONE_PARZIALE',
    CAMBIO_STATO_SPEDIZIONE:  'CAMBIO_STATO_SPEDIZIONE',
    // V2 — ecosistema
    RICHIESTA_ACCETTATA:      'RICHIESTA_ACCETTATA',
    RICHIESTA_RIFIUTATA:      'RICHIESTA_RIFIUTATA',
    MESSAGGIO_FORNITORE:      'MESSAGGIO_FORNITORE',
    // Generico
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

// -----------------------------------------------------------------
// READ
// -----------------------------------------------------------------

/** Tutte le notifiche di un utente, dalla più recente. */
const findByUtenteId = (utente_id) =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         WHERE  utente_id = $1
         ORDER  BY created_at DESC`,
        [utente_id]
    );

/** Solo notifiche non lette — usato dal polling frontend (30s). */
const findNonLette = (utente_id) =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         WHERE  utente_id = $1
           AND  letto      = false
         ORDER  BY created_at DESC`,
        [utente_id]
    );

/** Contatore badge topbar — restituisce { count: N }. */
const countNonLette = (utente_id) =>
    pool.query(
        `SELECT COUNT(*) AS count
         FROM   notifiche
         WHERE  utente_id = $1
           AND  letto      = false`,
        [utente_id]
    );

/** Dettaglio singola notifica. */
const findById = (id) =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         WHERE  id = $1`,
        [id]
    );

/** Tutte le notifiche (admin). */
const findAll = () =>
    pool.query(
        `SELECT ${SELECT_COLS}
         FROM   notifiche
         ORDER  BY created_at DESC`
    );

// -----------------------------------------------------------------
// WRITE
// -----------------------------------------------------------------

/** Crea notifica. Usa le costanti TIPI per il campo tipo. */
const create = ({ utente_id, tipo, messaggio, riferimento_tipo, riferimento_id, letto = false }) =>
    pool.query(
        `INSERT INTO notifiche (utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${SELECT_COLS}`,
        [utente_id, tipo, messaggio, letto, riferimento_tipo, riferimento_id]
    );

/** Segna una singola notifica come letta. */
const markAsRead = (id) =>
    pool.query(
        `UPDATE notifiche
         SET letto      = true,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );

/** Segna tutte le notifiche di un utente come lette (click "segna tutte"). */
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

/** Aggiornamento generico (raramente usato — preferire markAsRead). */
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

/** Elimina notifica (admin/pulizia). */
const remove = (id) =>
    pool.query('DELETE FROM notifiche WHERE id = $1 RETURNING id', [id]);

// -----------------------------------------------------------------

module.exports = {
    TIPI,
    // Read
    findAll,
    findById,
    findByUtenteId,
    findNonLette,
    countNonLette,
    // Write
    create,
    update,
    markAsRead,
    markAllAsRead,
    remove
};
