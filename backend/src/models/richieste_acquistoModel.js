// ============================================================
// richieste_acquistoModel.js  —  V2  [NUOVO]
// M16: Richieste di Acquisto Ecosistema
//
// State machine: BOZZA → INVIATA → IN_VALUTAZIONE → ACCETTATA | RIFIUTATA
//
// Nota architetturale:
//   Le transizioni di stato sono enforce nel layer service.
//   Il model espone solo le query SQL; la validazione della transizione
//   (es. non puoi passare da BOZZA a ACCETTATA) avviene nel service.
// ============================================================

const pool = require('../config/db');

// -----------------------------------------------------------------
// Costanti state machine (allineate all'enum richiesta_acquisto_state)
// -----------------------------------------------------------------
const STATI = Object.freeze({
    BOZZA:          'BOZZA',
    INVIATA:        'INVIATA',
    IN_VALUTAZIONE: 'IN_VALUTAZIONE',
    ACCETTATA:      'ACCETTATA',
    RIFIUTATA:      'RIFIUTATA'
});

/** Transizioni ammesse: da → [a] */
const TRANSIZIONI_AMMESSE = Object.freeze({
    BOZZA:          ['INVIATA'],
    INVIATA:        ['IN_VALUTAZIONE'],
    IN_VALUTAZIONE: ['ACCETTATA', 'RIFIUTATA'],
    ACCETTATA:      [],
    RIFIUTATA:      []
});

const BASE_COLS = `
    ra.id,
    ra.fornitore_id,
    f.ragione_sociale AS fornitore_nome,
    ra.stato,
    ra.data_richiesta,
    ra.note,
    ra.utente_id,
    ra.created_at,
    ra.updated_at
`;

// -----------------------------------------------------------------
// READ
// -----------------------------------------------------------------

/** Lista richieste dell'utente (più recenti prima). */
const findByUtenteId = (utente_id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   richieste_acquisto ra
         JOIN   fornitori f ON f.id = ra.fornitore_id
         WHERE  ra.utente_id = $1
         ORDER  BY ra.data_richiesta DESC`,
        [utente_id]
    );

/** Lista richieste verso un fornitore specifico. */
const findByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   richieste_acquisto ra
         JOIN   fornitori f ON f.id = ra.fornitore_id
         WHERE  ra.fornitore_id = $1
         ORDER  BY ra.data_richiesta DESC`,
        [fornitore_id]
    );

/** Lista richieste filtrate per stato. */
const findByStato = (stato) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   richieste_acquisto ra
         JOIN   fornitori f ON f.id = ra.fornitore_id
         WHERE  ra.stato = $1
         ORDER  BY ra.data_richiesta DESC`,
        [stato]
    );

/**
 * Dettaglio richiesta con le righe (prodotti richiesti).
 * Restituisce un unico record con righe come array JSON.
 */
const findById = (id) =>
    pool.query(
        `SELECT
             ra.id,
             ra.fornitore_id,
             f.ragione_sociale       AS fornitore_nome,
             f.email                 AS fornitore_email,
             f.telefono              AS fornitore_telefono,
             ra.stato,
             ra.data_richiesta,
             ra.note,
             ra.utente_id,
             ra.created_at,
             ra.updated_at,
             -- Righe come array JSON
             COALESCE(
                 json_agg(
                     jsonb_build_object(
                         'id',                  rr.id,
                         'prodotto_id',         rr.prodotto_id,
                         'prodotto_sku',        p.sku,
                         'prodotto_nome',       p.nome,
                         'quantita_richiesta',  rr.quantita_richiesta
                     )
                     ORDER BY rr.id
                 ) FILTER (WHERE rr.id IS NOT NULL),
                 '[]'::json
             ) AS righe
         FROM  richieste_acquisto ra
         JOIN  fornitori f         ON f.id  = ra.fornitore_id
         LEFT JOIN righe_richiesta rr ON rr.richiesta_id = ra.id
         LEFT JOIN prodotti p         ON p.id = rr.prodotto_id
         WHERE ra.id = $1
         GROUP BY ra.id, f.id`,
        [id]
    );

// -----------------------------------------------------------------
// WRITE
// -----------------------------------------------------------------

/**
 * Crea nuova richiesta in stato BOZZA.
 * Le righe vengono inserite separatamente tramite richieste_righeModel.
 */
const create = ({ fornitore_id, note, utente_id }) =>
    pool.query(
        `INSERT INTO richieste_acquisto (fornitore_id, stato, note, utente_id)
         VALUES ($1, 'BOZZA', $2, $3)
         RETURNING id, fornitore_id, stato, data_richiesta, note, utente_id, created_at`,
        [fornitore_id, note, utente_id]
    );

/**
 * Aggiorna stato della richiesta (state machine).
 * L'enforcement della transizione avviene nel service.
 * Restituisce la richiesta aggiornata.
 */
const updateStato = (id, stato) =>
    pool.query(
        `UPDATE richieste_acquisto
         SET stato      = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, fornitore_id, stato, utente_id, updated_at`,
        [stato, id]
    );

/** Aggiorna note (solo mentre in BOZZA — validato nel service). */
const updateNote = (id, note) =>
    pool.query(
        `UPDATE richieste_acquisto
         SET note       = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, stato, note`,
        [note, id]
    );

/**
 * Elimina richiesta in BOZZA.
 * CASCADE in DB rimuove automaticamente le righe_richiesta associate.
 * Solo le bozze sono eliminabili (validato nel service).
 */
const remove = (id) =>
    pool.query(
        `DELETE FROM richieste_acquisto
         WHERE id = $1
         RETURNING id`,
        [id]
    );

// -----------------------------------------------------------------

module.exports = {
    STATI,
    TRANSIZIONI_AMMESSE,
    // Read
    findByUtenteId,
    findByFornitoreId,
    findByStato,
    findById,
    // Write
    create,
    updateStato,
    updateNote,
    remove
};
