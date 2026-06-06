// ============================================================
// corrieriQueries.js — M05: Anagrafiche Corrieri
//
// Schema DB effettivo (migration 094_create_corrieri.js):
//   id, codice TEXT UNIQUE NOT NULL, nome TEXT NOT NULL,
//   telefono TEXT, email TEXT, attivo BOOLEAN DEFAULT true,
//   created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
//
// NOTA: la tabella corrieri rappresenta le aziende corriere
// (es. BRT, DHL, GLS). Non ha cognome né campi personali.
// spedizioni.corriere_id → dipendenti (non corrieri): nessun
// FK da spedizioni a questa tabella → soft delete senza check FK.
// ============================================================

const pool = require('../config/db');

const COLS = `id, codice, nome, telefono, email, attivo, created_at, updated_at`;

// -----------------------------------------------------------------
// READ
// -----------------------------------------------------------------

/**
 * Lista corrieri attivi, ordinati per nome.
 * Non espone i record con attivo = false (soft-deleted).
 */
const findAll = () =>
    pool.query(
        `SELECT ${COLS}
         FROM   corrieri
         WHERE  attivo = true
         ORDER  BY nome ASC`
    );

/**
 * Dettaglio corriere per id — senza filtro attivo.
 * Il service verifica il flag e restituisce RESOURCE_NOT_FOUND se disabilitato.
 */
const findById = (id) =>
    pool.query(
        `SELECT ${COLS}
         FROM   corrieri
         WHERE  id = $1`,
        [id]
    );

// -----------------------------------------------------------------
// WRITE
// -----------------------------------------------------------------

/**
 * Crea nuovo corriere.
 * codice: identificativo univoco (es. 'BRT', 'DHL-IT') — UNIQUE constraint su DB.
 */
const create = ({ codice, nome, telefono, email }) =>
    pool.query(
        `INSERT INTO corrieri (codice, nome, telefono, email)
         VALUES ($1, $2, $3, $4)
         RETURNING ${COLS}`,
        [codice, nome, telefono, email]
    );

/**
 * Aggiornamento parziale tramite COALESCE.
 * Riceve solo i campi presenti nel body — il service filtra prima di chiamare.
 */
const update = (id, { codice, nome, telefono, email }) =>
    pool.query(
        `UPDATE corrieri
         SET codice     = COALESCE($1, codice),
             nome       = COALESCE($2, nome),
             telefono   = COALESCE($3, telefono),
             email      = COALESCE($4, email),
             updated_at = NOW()
         WHERE id = $5
           AND attivo = true
         RETURNING ${COLS}`,
        [codice, nome, telefono, email, id]
    );

/**
 * Soft delete — imposta attivo = false.
 * Il corriere non compare più nelle liste operative ma i dati storici restano.
 */
const softDelete = (id) =>
    pool.query(
        `UPDATE corrieri
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
           AND attivo = true
         RETURNING id`,
        [id]
    );

// -----------------------------------------------------------------

module.exports = {
    findAll,
    findById,
    create,
    update,
    softDelete
};
