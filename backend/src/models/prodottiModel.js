// ============================================================
// prodottiModel.js  —  V2
// M02: Anagrafiche "I nostri Prodotti" / Listino Prezzi Aziendale
//
// Modifiche V2:
//   + prezzo NUMERIC(12,2) — prezzo listino aziendale
//   + data_agg_prezzo TIMESTAMPTZ — aggiornato ad ogni modifica prezzo
//   + findListino() — vista semplificata per il Listino Prezzi (M02)
//   + updatePrezzo() — aggiorna solo il prezzo e registra data_agg_prezzo
//   ~ create() — ora richiede prezzo (obbligatorio, > 0)
//   ~ update() — gestisce data_agg_prezzo automaticamente quando cambia prezzo
// ============================================================

const pool = require('../config/db');

// Colonne di base restituite nelle query (senza password/dati sensibili)
const BASE_COLS = `
    p.id,
    p.sku,
    p.nome,
    p.descrizione,
    p.categoria_id,
    c.nome          AS categoria,
    p.unita_misura,
    p.peso_kg,
    p.scorta_minima,
    p.prezzo,
    p.data_agg_prezzo,
    p.attivo,
    p.created_at,
    p.updated_at
`;

// -----------------------------------------------------------------
// READ
// -----------------------------------------------------------------

/** Tutti i prodotti (inclusi non attivi). Usato da moduli interni. */
const findAll = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         ORDER  BY p.nome ASC`
    );

/** Solo prodotti attivi — uso tipico in drop-down e moduli operativi. */
const findAttivi = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.attivo = true
         ORDER  BY p.nome ASC`
    );

/**
 * Vista Listino Prezzi Aziendale (M02).
 * Colonne: Nome, SKU, Prezzo, Data aggiornamento.
 * Restituisce solo prodotti attivi, ordinati per nome.
 */
const findListino = () =>
    pool.query(
        `SELECT
             p.id,
             p.sku,
             p.nome,
             p.prezzo,
             p.data_agg_prezzo
         FROM   prodotti p
         WHERE  p.attivo = true
         ORDER  BY p.nome ASC`
    );

/** Dettaglio singolo prodotto per ID. */
const findById = (id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.id = $1`,
        [id]
    );

/** Ricerca per SKU (univoco). */
const findBySku = (sku) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.sku = $1`,
        [sku]
    );

/** Prodotti per categoria (usato da M06 e acquisti). */
const findByCategoriaId = (categoria_id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.categoria_id = $1
         ORDER  BY p.nome ASC`,
        [categoria_id]
    );

/**
 * Ricerca full-text per nome o SKU — alimenta M13 Ricerca Globale.
 * Usa ILIKE per ricerca case-insensitive.
 */
const search = (q) =>
    pool.query(
        `SELECT
             p.id,
             p.sku,
             p.nome,
             p.prezzo,
             p.attivo
         FROM   prodotti p
         WHERE  p.attivo = true
           AND  (p.nome ILIKE $1 OR p.sku ILIKE $1)
         ORDER  BY p.nome ASC
         LIMIT  20`,
        [`%${q}%`]
    );

// -----------------------------------------------------------------
// WRITE
// -----------------------------------------------------------------

/**
 * Crea nuovo prodotto nel listino.
 * V2: prezzo obbligatorio (validato a livello service/controller: > 0).
 */
const create = ({ sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima = 0, prezzo, attivo = true }) =>
    pool.query(
        `INSERT INTO prodotti
             (sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, data_agg_prezzo, attivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
         RETURNING id, sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, data_agg_prezzo, attivo`,
        [sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo]
    );

/**
 * Aggiornamento generico prodotto.
 * Se prezzo viene modificato, data_agg_prezzo viene aggiornato automaticamente.
 * Usa COALESCE: i campi non passati mantengono il valore corrente.
 */
const update = (id, { sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo }) =>
    pool.query(
        `UPDATE prodotti
         SET sku           = COALESCE($1,  sku),
             nome          = COALESCE($2,  nome),
             descrizione   = COALESCE($3,  descrizione),
             categoria_id  = COALESCE($4,  categoria_id),
             unita_misura  = COALESCE($5,  unita_misura),
             peso_kg       = COALESCE($6,  peso_kg),
             scorta_minima = COALESCE($7,  scorta_minima),
             prezzo        = COALESCE($8,  prezzo),
             -- Aggiorna data_agg_prezzo solo se il prezzo è effettivamente cambiato
             data_agg_prezzo = CASE
                                 WHEN $8 IS NOT NULL AND $8 <> prezzo THEN NOW()
                                 ELSE data_agg_prezzo
                               END,
             attivo        = COALESCE($9,  attivo),
             updated_at    = NOW()
         WHERE id = $10
         RETURNING id, sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, data_agg_prezzo, attivo`,
        [sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo, id]
    );

/**
 * Aggiornamento esclusivo del prezzo (shortcut per il Listino Prezzi).
 * Aggiorna sempre data_agg_prezzo.
 */
const updatePrezzo = (id, prezzo) =>
    pool.query(
        `UPDATE prodotti
         SET prezzo        = $1,
             data_agg_prezzo = NOW(),
             updated_at    = NOW()
         WHERE id = $2
         RETURNING id, sku, nome, prezzo, data_agg_prezzo`,
        [prezzo, id]
    );

/**
 * Soft delete — non rimuove fisicamente il record.
 * Il prodotto sparisce dal listino ma resta referenziabile in ordini/movimenti storici.
 */
const softDelete = (id) => {
    return pool.query(
        `
        UPDATE prodotti
        SET attivo = false
        WHERE id = $1 AND attivo = true
        RETURNING id;
        `,
        [id]
    );
};

/*Remove
*/
const remove = (id) =>
    pool.query(
        `UPDATE prodotti
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );

// -----------------------------------------------------------------

module.exports = {
    // Read
    findAll,
    findAttivi,
    findListino,
    findById,
    findBySku,
    findByCategoriaId,
    search,
    // Write
    create,
    update,
    updatePrezzo,
    softDelete,
    remove
};
