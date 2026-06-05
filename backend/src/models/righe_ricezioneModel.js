const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT righe_ricezione.id,
                righe_ricezione.ricezione_id,
                righe_ricezione.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                righe_ricezione.quantita_ricevuta,
                righe_ricezione.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                magazzini.nome AS magazzino,
                righe_ricezione.created_at,
                righe_ricezione.updated_at
     FROM righe_ricezione
     JOIN prodotti ON righe_ricezione.prodotto_id = prodotti.id
     JOIN ubicazioni ON righe_ricezione.ubicazione_id = ubicazioni.id
     JOIN magazzini ON ubicazioni.magazzino_id = magazzini.id
     ORDER BY righe_ricezione.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT righe_ricezione.id,
                righe_ricezione.ricezione_id,
                righe_ricezione.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                righe_ricezione.quantita_ricevuta,
                righe_ricezione.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                magazzini.nome AS magazzino,
                righe_ricezione.created_at,
                righe_ricezione.updated_at
     FROM righe_ricezione
     JOIN prodotti ON righe_ricezione.prodotto_id = prodotti.id
     JOIN ubicazioni ON righe_ricezione.ubicazione_id = ubicazioni.id
     JOIN magazzini ON ubicazioni.magazzino_id = magazzini.id
     WHERE righe_ricezione.id = $1`,
        [id]
    );

const findByRicezioneId = (ricezione_id) =>
    pool.query(
        `SELECT righe_ricezione.id,
                righe_ricezione.ricezione_id,
                righe_ricezione.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                righe_ricezione.quantita_ricevuta,
                righe_ricezione.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                magazzini.nome AS magazzino,
                righe_ricezione.created_at,
                righe_ricezione.updated_at
     FROM righe_ricezione
     JOIN prodotti ON righe_ricezione.prodotto_id = prodotti.id
     JOIN ubicazioni ON righe_ricezione.ubicazione_id = ubicazioni.id
     JOIN magazzini ON ubicazioni.magazzino_id = magazzini.id
     WHERE righe_ricezione.ricezione_id = $1
     ORDER BY righe_ricezione.id`,
        [ricezione_id]
    );

const findByProdottoId = (prodotto_id) =>
    pool.query(
        `SELECT id, ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id, created_at, updated_at
     FROM righe_ricezione
     WHERE prodotto_id = $1
     ORDER BY id`,
        [prodotto_id]
    );


const create = ({ ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id }) =>
    pool.query(
        `INSERT INTO righe_ricezione (ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id, created_at, updated_at`,
        [ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id]
    );

const update = (id, { ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id }) =>
    pool.query(
        `UPDATE righe_ricezione
     SET ricezione_id = COALESCE($1, ricezione_id),
         prodotto_id = COALESCE($2, prodotto_id),
         quantita_ricevuta = COALESCE($3, quantita_ricevuta),
         ubicazione_id = COALESCE($4, ubicazione_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id, created_at, updated_at`,
        [ricezione_id, prodotto_id, quantita_ricevuta, ubicazione_id, id]
    );


const remove = (id) =>
    pool.query('DELETE FROM righe_ricezione WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByRicezioneId, findByProdottoId,
    create, update, remove
};
