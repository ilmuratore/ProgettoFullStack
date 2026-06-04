// ============================================================
// fornitoriModel.js  —  V2
// M03: Anagrafiche "I nostri Fornitori"
// M14: Scheda Fornitore Ecosistema
//
// Modifiche V2:
//   + source TEXT ('manual'|'ecosystem') — regola visibilità azione Modifica
//   + sito_web TEXT
//   + descrizione_aziendale TEXT
//   + findBySource(source) — filtra per source
//   + findEcosistema() — solo fornitori ecosistema (scheda M14)
//   + findConCatalogo(id) — scheda fornitore con prodotti associati
//   ~ create() — include source (default 'manual')
//   ~ update() — solo per source=manual (enforcement nel service/controller)
//   ~ remove() — soft delete; NON rimuove dall'ecosistema globale
// ============================================================

const pool = require('../config/db');

const BASE_COLS = `
    f.id,
    f.ragione_sociale,
    f.piva,
    f.indirizzo,
    f.email,
    f.telefono,
    f.lead_time_giorni,
    f.source,
    f.sito_web,
    f.descrizione_aziendale,
    f.attivo,
    f.created_at,
    f.updated_at
`;

// -----------------------------------------------------------------
// READ
// -----------------------------------------------------------------

/** Tutti i fornitori (attivi e non) — uso amministrativo. */
const findAll = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         ORDER  BY f.ragione_sociale ASC`
    );

/** Solo fornitori attivi — lista "I nostri Fornitori" (M03). */
const findAttivi = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.attivo = true
         ORDER  BY f.ragione_sociale ASC`
    );

/** Filtra per source ('manual' | 'ecosystem'). */
const findBySource = (source) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.source = $1
           AND  f.attivo = true
         ORDER  BY f.ragione_sociale ASC`,
        [source]
    );

/** Solo fornitori ecosistema attivi — usato in M14 e nelle dropdown acquisti. */
const findEcosistema = () => findBySource('ecosystem');

/** Solo fornitori creati manualmente — usati nelle form di modifica. */
const findManuali = () => findBySource('manual');

/** Dettaglio singolo fornitore per ID. */
const findById = (id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.id = $1`,
        [id]
    );

/** Ricerca per P.IVA (univoca). */
const findByPiva = (piva) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   fornitori f
         WHERE  f.piva = $1`,
        [piva]
    );

/**
 * Scheda Fornitore Ecosistema (M14).
 * Restituisce il fornitore con i prodotti del suo catalogo
 * (join su righe_po per ricavare i prodotti ordinati in passato,
 *  oppure potrai estenderlo con una tabella catalogo_fornitore in V3).
 *
 * Attualmente: recupera i prodotti distinti ordinati tramite PO a questo fornitore.
 */
const findSchedaEcosistema = (id) =>
    pool.query(
        `SELECT
             f.id,
             f.ragione_sociale,
             f.piva,
             f.indirizzo,
             f.email,
             f.telefono,
             f.sito_web,
             f.descrizione_aziendale,
             f.lead_time_giorni,
             f.source,
             -- Prodotti del catalogo (distinti, tramite ordini_acquisto)
             COALESCE(
                 json_agg(
                     DISTINCT jsonb_build_object(
                         'id',           p.id,
                         'sku',          p.sku,
                         'nome',         p.nome,
                         'prezzo',       p.prezzo,
                         'attivo',       p.attivo
                     )
                 ) FILTER (WHERE p.id IS NOT NULL),
                 '[]'::json
             ) AS catalogo_prodotti
         FROM  fornitori f
         LEFT JOIN ordini_acquisto oa ON oa.fornitore_id = f.id
         LEFT JOIN righe_po rp       ON rp.ordine_acquisto_id = oa.id
         LEFT JOIN prodotti p        ON p.id = rp.prodotto_id AND p.attivo = true
         WHERE f.id = $1
         GROUP BY f.id`,
        [id]
    );

/**
 * Ricerca full-text su ragione_sociale e piva — alimenta M13 Ricerca Globale.
 */
const search = (q) =>
    pool.query(
        `SELECT
             f.id,
             f.ragione_sociale,
             f.piva,
             f.source,
             f.attivo
         FROM   fornitori f
         WHERE  f.attivo = true
           AND  (f.ragione_sociale ILIKE $1 OR f.piva ILIKE $1)
         ORDER  BY f.ragione_sociale ASC
         LIMIT  20`,
        [`%${q}%`]
    );

// Contatti
const findContattiByFornitoreId = (fornitore_id) =>
    pool.query(
        `SELECT id, fornitore_id, nome, ruolo, email, telefono
         FROM   contatti_fornitori
         WHERE  fornitore_id = $1
         ORDER  BY id`,
        [fornitore_id]
    );

// -----------------------------------------------------------------
// WRITE
// -----------------------------------------------------------------

/**
 * Crea fornitore.
 * source: default 'manual'. Per inserimenti dall'ecosistema usare source='ecosystem'.
 */
const create = ({ ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
                  source = 'manual', sito_web, descrizione_aziendale, attivo = true }) =>
    pool.query(
        `INSERT INTO fornitori
             (ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
              source, sito_web, descrizione_aziendale, attivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, ragione_sociale, piva, indirizzo, email, telefono,
                   lead_time_giorni, source, sito_web, descrizione_aziendale, attivo`,
        [ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
         source, sito_web, descrizione_aziendale, attivo]
    );

/**
 * Aggiorna fornitore.
 * ATTENZIONE: il service deve verificare source='manual' prima di chiamare questa funzione.
 * I fornitori ecosystem non sono modificabili (403 ACCESS_DENIED nel service).
 */
const update = (id, { ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
                      sito_web, descrizione_aziendale, attivo }) =>
    pool.query(
        `UPDATE fornitori
         SET ragione_sociale      = COALESCE($1,  ragione_sociale),
             piva                 = COALESCE($2,  piva),
             indirizzo            = COALESCE($3,  indirizzo),
             email                = COALESCE($4,  email),
             telefono             = COALESCE($5,  telefono),
             lead_time_giorni     = COALESCE($6,  lead_time_giorni),
             sito_web             = COALESCE($7,  sito_web),
             descrizione_aziendale= COALESCE($8,  descrizione_aziendale),
             attivo               = COALESCE($9,  attivo),
             updated_at           = NOW()
         WHERE id = $10
         RETURNING id, ragione_sociale, piva, indirizzo, email, telefono,
                   lead_time_giorni, source, sito_web, descrizione_aziendale, attivo`,
        [ragione_sociale, piva, indirizzo, email, telefono, lead_time_giorni,
         sito_web, descrizione_aziendale, attivo, id]
    );

/**
 * Soft delete — rimuove dalla lista "I nostri Fornitori".
 * NON elimina dall'ecosistema globale (il record rimane con attivo=false).
 */
const remove = (id) =>
    pool.query(
        `UPDATE fornitori
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );

// Contatti
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
         SET nome       = COALESCE($1, nome),
             ruolo      = COALESCE($2, ruolo),
             email      = COALESCE($3, email),
             telefono   = COALESCE($4, telefono),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, fornitore_id, nome, ruolo, email, telefono`,
        [nome, ruolo, email, telefono, id]
    );

const removeContatto = (id) =>
    pool.query('DELETE FROM contatti_fornitori WHERE id = $1 RETURNING id', [id]);

// -----------------------------------------------------------------

module.exports = {
    // Read
    findAll,
    findAttivi,
    findBySource,
    findEcosistema,
    findManuali,
    findById,
    findByPiva,
    findSchedaEcosistema,
    search,
    findContattiByFornitoreId,
    // Write
    create,
    update,
    remove,
    createContatto,
    updateContatto,
    removeContatto
};
