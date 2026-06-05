const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT righe_po.id,
                righe_po.ordine_acquisto_id,
                righe_po.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                righe_po.quantita_ordinata,
                righe_po.quantita_ricevuta,
                righe_po.prezzo_unitario,
                righe_po.created_at,
                righe_po.updated_at
     FROM righe_po
     JOIN prodotti ON righe_po.prodotto_id = prodotti.id
     ORDER BY righe_po.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT righe_po.id,
                righe_po.ordine_acquisto_id,
                righe_po.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                righe_po.quantita_ordinata,
                righe_po.quantita_ricevuta,
                righe_po.prezzo_unitario,
                righe_po.created_at,
                righe_po.updated_at
     FROM righe_po
     JOIN prodotti ON righe_po.prodotto_id = prodotti.id
     WHERE righe_po.id = $1`,
        [id]
    );

const findByOrdineAcquistoId = (ordine_acquisto_id) =>
    pool.query(
        `SELECT righe_po.id,
                righe_po.ordine_acquisto_id,
                righe_po.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                righe_po.quantita_ordinata,
                righe_po.quantita_ricevuta,
                righe_po.prezzo_unitario,
                righe_po.created_at,
                righe_po.updated_at
     FROM righe_po
     JOIN prodotti ON righe_po.prodotto_id = prodotti.id
     WHERE righe_po.ordine_acquisto_id = $1
     ORDER BY righe_po.id`,
        [ordine_acquisto_id]
    );

const findByProdottoId = (prodotto_id) =>
    pool.query(
        `SELECT id, ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario, created_at, updated_at
     FROM righe_po
     WHERE prodotto_id = $1
     ORDER BY id`,
        [prodotto_id]
    );


const create = ({ ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta = 0, prezzo_unitario }) =>
    pool.query(
        `INSERT INTO righe_po (ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario, created_at, updated_at`,
        [ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario]
    );

const update = (id, { ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario }) =>
    pool.query(
        `UPDATE righe_po
     SET ordine_acquisto_id = COALESCE($1, ordine_acquisto_id),
         prodotto_id = COALESCE($2, prodotto_id),
         quantita_ordinata = COALESCE($3, quantita_ordinata),
         quantita_ricevuta = COALESCE($4, quantita_ricevuta),
         prezzo_unitario = COALESCE($5, prezzo_unitario),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario, created_at, updated_at`,
        [ordine_acquisto_id, prodotto_id, quantita_ordinata, quantita_ricevuta, prezzo_unitario, id]
    );


const updateQuantitaRicevuta = (id, quantita_ricevuta) =>
    pool.query(
        `UPDATE righe_po
     SET quantita_ricevuta = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, quantita_ricevuta, updated_at`,
        [quantita_ricevuta, id]
    );

const remove = (id) =>
    pool.query('DELETE FROM righe_po WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByOrdineAcquistoId, findByProdottoId,
    create, update, updateQuantitaRicevuta, remove
};
