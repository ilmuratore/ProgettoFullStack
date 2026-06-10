const pool = require('../config/db');

const findAll = () =>
    pool.query(
        `
    SELECT 
      o.id,
      o.fornitore_id,
      f.ragione_sociale AS fornitore,
      o.stato,
      o.data_prevista,
      o.importo_totale,
      o.note,
      o.utente_id,
      CONCAT(u.nome, ' ', u.cognome) AS utente,
      o.created_at,
      o.updated_at,

      -- Totale calcolato dalle righe
      COALESCE(SUM(rp.quantita_ordinata * rp.prezzo_unitario), 0) AS totale_calcolato,

      -- Numero righe ordine
      COUNT(rp.id) AS numero_righe,

      -- Totale ricevuto (somma quantita_ricevuta)
      COALESCE(SUM(rp.quantita_ricevuta), 0) AS totale_ricevuto

    FROM ordini_acquisto o
    JOIN fornitori f ON f.id = o.fornitore_id
    LEFT JOIN utenti u ON u.id = o.utente_id
    LEFT JOIN righe_po rp ON rp.ordine_acquisto_id = o.id

    GROUP BY 
      o.id, f.ragione_sociale, u.nome, u.cognome

    ORDER BY o.created_at DESC
    `
    );

const findById = (id) =>
    pool.query(
        `
    SELECT 
      o.id,
      o.fornitore_id,
      f.ragione_sociale AS fornitore,
      o.stato,
      o.data_prevista,
      o.importo_totale,
      o.note,
      o.utente_id,
      CONCAT(u.nome, ' ', u.cognome) AS utente,
      o.created_at,
      o.updated_at
    FROM ordini_acquisto o
    JOIN fornitori f ON f.id = o.fornitore_id
    LEFT JOIN utenti u ON u.id = o.utente_id
    WHERE o.id = $1
    `,
        [id]
    );

const findDettaglioCompleto = async (id) => {
    const ordine = await findById(id);

    const righe = await pool.query(
        `
    SELECT 
  rp.id,
  rp.prodotto_id,
  p.sku,
  p.nome AS prodotto,
  p.unita_misura,
  rp.quantita_ordinata,
  rp.quantita_ricevuta,
  rp.prezzo_unitario,
  (rp.quantita_ordinata * rp.prezzo_unitario) AS totale_riga,
  rp.created_at,
  rp.updated_at
FROM righe_po rp
JOIN prodotti p ON p.id = rp.prodotto_id
WHERE rp.ordine_acquisto_id = $1
ORDER BY rp.id
    `,
        [id]
    );

    const ricezioni = await pool.query(
        `
    SELECT 
      r.id,
      r.data_ricezione,
      r.note,
      r.utente_id,
      CONCAT(u.nome, ' ', u.cognome) AS utente,
      r.created_at,
      r.updated_at
    FROM ricezioni r
    LEFT JOIN utenti u ON u.id = r.utente_id
    WHERE r.ordine_acquisto_id = $1
    ORDER BY r.id DESC
    `,
        [id]
    );

    return {
        ordine: ordine.rows[0],
        righe: righe.rows,
        ricezioni: ricezioni.rows,
    };
};

const findByFornitoreId = (fornitore_id) =>
    pool.query(
        `
    SELECT *
    FROM ordini_acquisto
    WHERE fornitore_id = $1
    ORDER BY created_at DESC
    `,
        [fornitore_id]
    );

const findByStato = (stato) =>
    pool.query(
        `
    SELECT *
    FROM ordini_acquisto
    WHERE stato = $1::purchase_order_state
    ORDER BY created_at DESC
    `,
        [stato]
    );

const findInRitardo = () =>
    pool.query(
        `
    SELECT *
    FROM ordini_acquisto
    WHERE data_prevista < CURRENT_DATE
      AND stato NOT IN ('COMPLETATO', 'ANNULLATO')
    ORDER BY data_prevista ASC
    `
    );

const create = ({ fornitore_id, data_prevista, importo_totale, note, utente_id }) =>
    pool.query(
        `
    INSERT INTO ordini_acquisto 
      (fornitore_id, data_prevista, importo_totale, note, utente_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
        [fornitore_id, data_prevista, importo_totale, note, utente_id]
    );

const update = (id, { fornitore_id, data_prevista, importo_totale, note, utente_id }) =>
    pool.query(
        `
    UPDATE ordini_acquisto
    SET 
      fornitore_id = COALESCE($1, fornitore_id),
      data_prevista = COALESCE($2, data_prevista),
      importo_totale = COALESCE($3, importo_totale),
      note = COALESCE($4, note),
      utente_id = COALESCE($5, utente_id),
      updated_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
        [fornitore_id, data_prevista, importo_totale, note, utente_id, id]
    );

const updateStato = (id, stato) =>
    pool.query(
        `
    UPDATE ordini_acquisto
    SET stato = $1::purchase_order_state,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, stato, updated_at
    `,
        [stato, id]
    );

const remove = (id) =>
    pool.query(
        `
    UPDATE ordini_acquisto
    SET stato = 'ANNULLATO',
        updated_at = NOW()
    WHERE id = $1
    RETURNING id
    `,
        [id]
    );

module.exports = {
    findAll,
    findById,
    findDettaglioCompleto,
    findByFornitoreId,
    findByStato,
    findInRitardo,
    create,
    update,
    updateStato,
    remove,
};
