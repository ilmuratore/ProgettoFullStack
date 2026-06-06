// ============================================================
// dipendentiQueries.js — M05: Anagrafiche Dipendenti
//
// Schema DB effettivo (migration 014_create_dipendenti.js):
//   id, nome TEXT NOT NULL, cognome TEXT NOT NULL,
//   codice_fiscale TEXT UNIQUE NOT NULL, ruolo_operativo TEXT,
//   data_assunzione DATE, utente_id INTEGER FK→utenti SET NULL,
//   created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
//
// NOTA: la tabella NON ha il campo `attivo`.
// spedizioni.corriere_id → dipendenti con ON DELETE SET NULL:
// il DELETE fisico non è bloccato da FK (il DB annulla il riferimento).
// DELETE è quindi hard delete — nessuna migration richiesta.
//
// Il campo `ruolo_operativo` è la mansione operativa (es. "Magazziniere"),
// DISTINTO dal ruolo RBAC di sistema (tabella ruoli).
// ============================================================

const pool = require('../config/db');

const COLS = `
    id, nome, cognome, codice_fiscale,
    ruolo_operativo, data_assunzione, utente_id,
    created_at, updated_at
`;

// -----------------------------------------------------------------
// READ
// -----------------------------------------------------------------

/**
 * Lista tutti i dipendenti, ordinati per cognome e nome.
 * Nessun filtro attivo (campo non presente nello schema).
 */
const findAll = () =>
    pool.query(
        `SELECT ${COLS}
         FROM   dipendenti
         ORDER  BY cognome ASC, nome ASC`
    );

/**
 * Dettaglio dipendente per id.
 */
const findById = (id) =>
    pool.query(
        `SELECT ${COLS}
         FROM   dipendenti
         WHERE  id = $1`,
        [id]
    );

// -----------------------------------------------------------------
// WRITE
// -----------------------------------------------------------------

/**
 * Crea nuovo dipendente.
 * codice_fiscale: UNIQUE NOT NULL — 23505 mappato a DUPLICATE_ENTRY nell'errorHandler.
 * utente_id: opzionale — collega il dipendente a un utente di sistema se esiste.
 */
const create = ({ nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) =>
    pool.query(
        `INSERT INTO dipendenti
             (nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${COLS}`,
        [nome, cognome, codice_fiscale, ruolo_operativo ?? null, data_assunzione ?? null, utente_id ?? null]
    );

/**
 * Aggiornamento parziale tramite COALESCE.
 * codice_fiscale aggiornabile (es. correzione errore di digitazione).
 */
const update = (id, { nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) =>
    pool.query(
        `UPDATE dipendenti
         SET nome             = COALESCE($1, nome),
             cognome          = COALESCE($2, cognome),
             codice_fiscale   = COALESCE($3, codice_fiscale),
             ruolo_operativo  = COALESCE($4, ruolo_operativo),
             data_assunzione  = COALESCE($5, data_assunzione),
             utente_id        = COALESCE($6, utente_id),
             updated_at       = NOW()
         WHERE id = $7
         RETURNING ${COLS}`,
        [nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id, id]
    );

/**
 * Hard delete fisico.
 * Safe: spedizioni.corriere_id usa ON DELETE SET NULL → nessun blocco FK.
 * Il dipendente eliminato non apparirà più nelle spedizioni (corriere_id = NULL).
 */
const hardDelete = (id) =>
    pool.query(
        `DELETE FROM dipendenti
         WHERE id = $1
         RETURNING id`,
        [id]
    );

// -----------------------------------------------------------------

module.exports = {
    findAll,
    findById,
    create,
    update,
    hardDelete
};
