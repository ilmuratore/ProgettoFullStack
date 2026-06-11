const pool = require('../config/db');

const create = ({ ordine_id, prodotto_id, quantita, prezzo_unitario }, client) =>
    (client || pool).query(
        `
        INSERT INTO righe_ordine
        (ordine_id, prodotto_id, quantita, prezzo_unitario)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [ordine_id, prodotto_id, quantita, prezzo_unitario]
    );

const findByOrdine = (ordine_id, client) =>
    (client || pool).query(
        `
        SELECT righe_ordine.*,
               prodotti.sku,
               prodotti.nome AS prodotto
        FROM righe_ordine
        JOIN prodotti ON righe_ordine.prodotto_id = prodotti.id
        WHERE righe_ordine.ordine_id = $1
        ORDER BY righe_ordine.id;
        `,
        [ordine_id]
    );

const findById = (id, client) =>
    (client || pool).query(
        `SELECT * FROM righe_ordine WHERE id = $1;`,
        [id]
    );

const update = (id, { quantita, prezzo_unitario }, client) =>
    (client || pool).query(
        `
        UPDATE righe_ordine
        SET quantita        = COALESCE($1, quantita),
            prezzo_unitario = COALESCE($2, prezzo_unitario),
            updated_at      = NOW()
        WHERE id = $3
        RETURNING *;
        `,
        [quantita, prezzo_unitario, id]
    );

const remove = (id, client) =>
    (client || pool).query(
        `DELETE FROM righe_ordine WHERE id = $1 RETURNING id;`,
        [id]
    );

module.exports = {
    create,
    findByOrdine,
    findById,
    update,
    remove
};
