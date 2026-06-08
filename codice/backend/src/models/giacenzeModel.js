const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT giacenze.id,
                giacenze.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                giacenze.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                magazzini.nome AS magazzino,
                giacenze.quantita
     FROM giacenze
     JOIN prodotti ON giacenze.prodotto_id = prodotti.id
     JOIN ubicazioni ON giacenze.ubicazione_id = ubicazioni.id
     JOIN magazzini ON ubicazioni.magazzino_id = magazzini.id
     ORDER BY giacenze.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT giacenze.id,
                giacenze.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                giacenze.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                magazzini.nome AS magazzino,
                giacenze.quantita
     FROM giacenze
     JOIN prodotti ON giacenze.prodotto_id = prodotti.id
     JOIN ubicazioni ON giacenze.ubicazione_id = ubicazioni.id
     JOIN magazzini ON ubicazioni.magazzino_id = magazzini.id
     WHERE giacenze.id = $1`,
        [id]
    );

const findByProdottoId = (prodotto_id) =>
    pool.query(
        `SELECT giacenze.id,
                giacenze.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                giacenze.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                magazzini.nome AS magazzino,
                giacenze.quantita
     FROM giacenze
     JOIN prodotti ON giacenze.prodotto_id = prodotti.id
     JOIN ubicazioni ON giacenze.ubicazione_id = ubicazioni.id
     JOIN magazzini ON ubicazioni.magazzino_id = magazzini.id
     WHERE giacenze.prodotto_id = $1
     ORDER BY ubicazioni.codice`,
        [prodotto_id]
    );

const findByUbicazioneId = (ubicazione_id) =>
    pool.query(
        `SELECT giacenze.id,
                giacenze.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                giacenze.ubicazione_id,
                giacenze.quantita
     FROM giacenze
     JOIN prodotti ON giacenze.prodotto_id = prodotti.id
     WHERE giacenze.ubicazione_id = $1
     ORDER BY prodotti.nome`,
        [ubicazione_id]
    );

const findByProdottoIdAndUbicazioneId = (prodotto_id, ubicazione_id, db = pool) =>
    db.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita
     FROM giacenze
     WHERE prodotto_id = $1
       AND ubicazione_id = $2`,
        [prodotto_id, ubicazione_id]
    );

const lockByProdottoIdAndUbicazioneId = (prodotto_id, ubicazione_id, db = pool) =>
    db.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita
     FROM giacenze
     WHERE prodotto_id = $1
       AND ubicazione_id = $2
     FOR UPDATE`,
        [prodotto_id, ubicazione_id]
    );


const create = ({ prodotto_id, ubicazione_id, quantita = 0 }) =>
    pool.query(
        `INSERT INTO giacenze (prodotto_id, ubicazione_id, quantita)
     SELECT $1, $2, $3
     WHERE $3 >= 0
     RETURNING id, prodotto_id, ubicazione_id, quantita`,
        [prodotto_id, ubicazione_id, quantita]
    );

const update = (id, { prodotto_id, ubicazione_id, quantita }) =>
    pool.query(
        `UPDATE giacenze
     SET prodotto_id = COALESCE($1, prodotto_id),
         ubicazione_id = COALESCE($2, ubicazione_id),
         quantita = COALESCE($3, quantita),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
       AND COALESCE($3, quantita) >= 0
     RETURNING id, prodotto_id, ubicazione_id, quantita`,
        [prodotto_id, ubicazione_id, quantita, id]
    );


const incrementaQuantita = (prodotto_id, ubicazione_id, quantita, db = pool) =>
    db.query(
        `INSERT INTO giacenze (prodotto_id, ubicazione_id, quantita)
     SELECT $1, $2, $3
     WHERE $3 >= 0
        OR EXISTS (
            SELECT 1
            FROM giacenze
            WHERE prodotto_id = $1
              AND ubicazione_id = $2
        )
     ON CONFLICT (prodotto_id, ubicazione_id)
     DO UPDATE SET quantita = giacenze.quantita + $3,
                   updated_at = CURRENT_TIMESTAMP
     WHERE giacenze.quantita + $3 >= 0
     RETURNING id, prodotto_id, ubicazione_id, quantita`,
        [prodotto_id, ubicazione_id, quantita]
    );

const remove = (id) =>
    pool.query('DELETE FROM giacenze WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll, findById, findByProdottoId, findByUbicazioneId, findByProdottoIdAndUbicazioneId,
    lockByProdottoIdAndUbicazioneId, create, update, incrementaQuantita, remove
};
