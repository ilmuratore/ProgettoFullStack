const pool = require('../config/db');

const findAll = (client = pool) =>
    client.query(
        `
    SELECT 
      rp.id,
      rp.ordine_acquisto_id,
      rp.prodotto_id,
      p.sku,
      p.nome AS prodotto,
      rp.quantita_ordinata,
      rp.quantita_ricevuta,
      rp.prezzo_unitario,
      (rp.quantita_ordinata * rp.prezzo_unitario) AS totale_riga,
      rp.created_at,
      rp.updated_at
    FROM righe_po rp
    JOIN prodotti p ON p.id = rp.prodotto_id
    ORDER BY rp.id
    `
    );

const findById = (id, client = pool) =>
    client.query(
        `
    SELECT 
      rp.id,
      rp.ordine_acquisto_id,
      rp.prodotto_id,
      p.sku,
      p.nome AS prodotto,
      rp.quantita_ordinata,
      rp.quantita_ricevuta,
      rp.prezzo_unitario,
      (rp.quantita_ordinata * rp.prezzo_unitario) AS totale_riga,
      rp.created_at,
      rp.updated_at
    FROM righe_po rp
    JOIN prodotti p ON p.id = rp.prodotto_id
    WHERE rp.id = $1
    `,
        [id]
    );


const findByOrdineAcquistoId = (ordine_acquisto_id, client = pool) =>
    client.query(
        `
    SELECT 
      rp.id,
      rp.ordine_acquisto_id,
      rp.prodotto_id,
      p.sku,
      p.nome AS prodotto,
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
        [ordine_acquisto_id]
    );


const findByProdottoId = (prodotto_id, client = pool) =>
    client.query(
        `
    SELECT 
      id, ordine_acquisto_id, prodotto_id,
      quantita_ordinata, quantita_ricevuta, prezzo_unitario,
      (quantita_ordinata * prezzo_unitario) AS totale_riga,
      created_at, updated_at
    FROM righe_po
    WHERE prodotto_id = $1
    ORDER BY id
    `,
        [prodotto_id]
    );


const create = ({ ordine_acquisto_id, prodotto_id, quantita_ordinata, prezzo_unitario }, client = pool) =>
    client.query(
        `
    INSERT INTO righe_po 
      (ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario)
    VALUES ($1, $2, $3, 0, $4)
    RETURNING *
    `,
        [ordine_acquisto_id, prodotto_id, quantita_ordinata, prezzo_unitario]
    );


const update = (id, { quantita_ordinata, prezzo_unitario }, client = pool) =>
    client.query(
        `
    UPDATE righe_po
    SET 
      quantita_ordinata = COALESCE($1, quantita_ordinata),
      prezzo_unitario = COALESCE($2, prezzo_unitario),
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
    `,
        [quantita_ordinata, prezzo_unitario, id]
    );


const updateQuantitaRicevuta = (id, incremento, client = pool) =>
    client.query(
        `
    UPDATE righe_po
    SET 
      quantita_ricevuta = quantita_ricevuta + $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING id, quantita_ricevuta, updated_at
    `,
        [incremento, id]
    );

/* ============================================================================
 *  RESET QUANTITÀ RICEVUTA (solo per rollback)
 * ==========================================================================*/
const resetQuantitaRicevuta = (id, client = pool) =>
    client.query(
        `
    UPDATE righe_po
    SET quantita_ricevuta = 0,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, quantita_ricevuta
    `,
        [id]
    );


const remove = (id, client = pool) =>
    client.query(
        `
    DELETE FROM righe_po 
    WHERE id = $1 
    RETURNING id
    `,
        [id]
    );

module.exports = {
    findAll,
    findById,
    findByOrdineAcquistoId,
    findByProdottoId,
    create,
    update,
    updateQuantitaRicevuta,
    resetQuantitaRicevuta,
    remove,
};
