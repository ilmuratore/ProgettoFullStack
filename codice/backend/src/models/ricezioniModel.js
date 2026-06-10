const pool = require('../config/db');

const findAll = () =>
    pool.query(
        `
    SELECT 
      r.id,
      r.ordine_acquisto_id,
      o.stato AS stato_ordine,
      o.fornitore_id,
      f.ragione_sociale AS fornitore,
      r.data_ricezione,
      r.note,
      r.utente_id,
      CONCAT(u.nome, ' ', u.cognome) AS utente,
      r.created_at,
      r.updated_at
    FROM ricezioni r
    JOIN ordini_acquisto o ON o.id = r.ordine_acquisto_id
    JOIN fornitori f ON f.id = o.fornitore_id
    LEFT JOIN utenti u ON u.id = r.utente_id
    ORDER BY r.id DESC
    `
    );

const findById = (id) =>
    pool.query(
        `
    SELECT 
      r.id,
      r.ordine_acquisto_id,
      o.stato AS stato_ordine,
      o.fornitore_id,
      f.ragione_sociale AS fornitore,
      r.data_ricezione,
      r.note,
      r.utente_id,
      CONCAT(u.nome, ' ', u.cognome) AS utente,
      r.created_at,
      r.updated_at
    FROM ricezioni r
    JOIN ordini_acquisto o ON o.id = r.ordine_acquisto_id
    JOIN fornitori f ON f.id = o.fornitore_id
    LEFT JOIN utenti u ON u.id = r.utente_id
    WHERE r.id = $1
    `,
        [id]
    );

const findByOrdineAcquistoId = (ordine_acquisto_id) =>
    pool.query(
        `
    SELECT 
      id, ordine_acquisto_id, data_ricezione, note, utente_id, created_at, updated_at
    FROM ricezioni
    WHERE ordine_acquisto_id = $1
    ORDER BY id DESC
    `,
        [ordine_acquisto_id]
    );

const findByUtenteId = (utente_id) =>
    pool.query(
        `
    SELECT 
      id, ordine_acquisto_id, data_ricezione, note, utente_id, created_at, updated_at
    FROM ricezioni
    WHERE utente_id = $1
    ORDER BY data_ricezione DESC
    `,
        [utente_id]
    );

const create = ({ ordine_acquisto_id, data_ricezione, note, utente_id }) =>
    pool.query(
        `
    INSERT INTO ricezioni 
      (ordine_acquisto_id, data_ricezione, note, utente_id)
    VALUES ($1, COALESCE($2, NOW()), $3, $4)
    RETURNING *
    `,
        [ordine_acquisto_id, data_ricezione, note, utente_id]
    );

/* 
 * UPDATE limitato: non si può cambiare ordine, utente, data_ricezione.
 * Solo note è modificabile.
 */
const update = (id, { note }) =>
    pool.query(
        `
    UPDATE ricezioni
    SET 
      note = COALESCE($1, note),
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
        [note, id]
    );

const remove = (id) =>
    pool.query(
        `
    DELETE FROM ricezioni 
    WHERE id = $1 
    RETURNING id
    `,
        [id]
    );

const removeByOrdineAcquistoId = (ordine_acquisto_id) =>
    pool.query(
        `
    DELETE FROM ricezioni
    WHERE ordine_acquisto_id = $1
    RETURNING id
    `,
        [ordine_acquisto_id]
    );

/* 
 * DETTAGLIO COMPLETO: ricezione + righe_ricezione
 */
const findDettaglioCompleto = async (id) => {
    const ricezione = await findById(id);

    const righe = await pool.query(
        `
    SELECT 
      rr.id,
      rr.ricezione_id,
      rr.prodotto_id,
      p.sku,
      p.nome AS prodotto,
      rr.quantita_ricevuta,
      rr.ubicazione_id,
      u.codice AS ubicazione,
      rr.created_at,
      rr.updated_at
    FROM righe_ricezione rr
    JOIN prodotti p ON p.id = rr.prodotto_id
    JOIN ubicazioni u ON u.id = rr.ubicazione_id
    WHERE rr.ricezione_id = $1
    ORDER BY rr.id
    `,
        [id]
    );

    return {
        ricezione: ricezione.rows[0],
        righe: righe.rows,
    };
};

module.exports = {
    findAll,
    findById,
    findByOrdineAcquistoId,
    findByUtenteId,
    findDettaglioCompleto,
    create,
    update,
    remove,
    removeByOrdineAcquistoId,
};
