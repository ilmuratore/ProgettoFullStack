const pool = require('../config/db');

const findAll = (client = pool) =>
    client.query(
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
      m.nome AS magazzino,
      rr.created_at,
      rr.updated_at
    FROM righe_ricezione rr
    JOIN prodotti p ON p.id = rr.prodotto_id
    JOIN ubicazioni u ON u.id = rr.ubicazione_id
    JOIN magazzini m ON m.id = u.magazzino_id
    ORDER BY rr.id
    `
    );

const findById = (id, client = pool) =>
    client.query(
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
      m.nome AS magazzino,
      rr.created_at,
      rr.updated_at
    FROM righe_ricezione rr
    JOIN prodotti p ON p.id = rr.prodotto_id
    JOIN ubicazioni u ON u.id = rr.ubicazione_id
    JOIN magazzini m ON m.id = u.magazzino_id
    WHERE rr.id = $1
    `,
        [id]
    );

const findByRicezioneId = (ricezione_id, client = pool) =>
    client.query(
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
      m.nome AS magazzino,
      rr.created_at,
      rr.updated_at
    FROM righe_ricezione rr
    JOIN prodotti p ON p.id = rr.prodotto_id
    JOIN ubicazioni u ON u.id = rr.ubicazione_id
    JOIN magazzini m ON m.id = u.magazzino_id
    WHERE rr.ricezione_id = $1
    ORDER BY rr.id
    `,
        [ricezione_id]
    );

const findByProdottoId = (prodotto_id, client = pool) =>
    client.query(
        `
    SELECT 
      rr.id,
      rr.ricezione_id,
      rr.prodotto_id,
      rr.quantita_ricevuta,
      rr.ubicazione_id,
      u.codice AS ubicazione,
      m.nome AS magazzino,
      rr.created_at,
      rr.updated_at
    FROM righe_ricezione rr
    JOIN ubicazioni u ON u.id = rr.ubicazione_id
    JOIN magazzini m ON m.id = u.magazzino_id
    WHERE rr.prodotto_id = $1
    ORDER BY rr.id
    `,
        [prodotto_id]
    );

const create = ({ ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id }, client = pool) =>
    client.query(
        `
    INSERT INTO righe_ricezione 
      (ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id]
    );

/* 
 * UPDATE limitato: non si può cambiare ricezione, prodotto, ubicazione.
 * Solo quantita_ricevuta può essere modificata (rollback).
 */
const update = (id, { quantita_ricevuta }, client = pool) =>
    client.query(
        `
    UPDATE righe_ricezione
    SET 
      quantita_ricevuta = COALESCE($1, quantita_ricevuta),
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
        [quantita_ricevuta, id]
    );

/* 
 * UPDATE incrementale per ricezioni progressive
 */
const updateQuantitaRicevutaIncrementale = (id, incremento, client = pool) =>
    client.query(
        `
    UPDATE righe_ricezione
    SET 
      quantita_ricevuta = quantita_ricevuta + $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING id, quantita_ricevuta, updated_at
    `,
        [incremento, id]
    );

const resetQuantitaRicevuta = (id, client = pool) =>
    client.query(
        `
    UPDATE righe_ricezione
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
    DELETE FROM righe_ricezione 
    WHERE id = $1 
    RETURNING id
    `,
        [id]
    );

const removeByRicezioneId = (ricezione_id, client = pool) =>
    client.query(
        `
    DELETE FROM righe_ricezione
    WHERE ricezione_id = $1
    RETURNING id
    `,
        [ricezione_id]
    );

module.exports = {
    findAll,
    findById,
    findByRicezioneId,
    findByProdottoId,
    create,
    update,
    updateQuantitaRicevutaIncrementale,
    resetQuantitaRicevuta,
    remove,
    removeByRicezioneId,
};
