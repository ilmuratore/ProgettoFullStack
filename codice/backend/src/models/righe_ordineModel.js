const pool = require('../config/db');

const create = (data) => {
    const {
        ordine_id,
        prodotto_id,
        quantita,
        prezzo_unitario
    } = data;

    return pool.query(
        `
        INSERT INTO righe_ordine
        (ordine_id, prodotto_id, quantita, prezzo_unitario)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [ordine_id, prodotto_id, quantita, prezzo_unitario]
    );
};

const findByOrdine = (ordine_id) => {
    return pool.query(
        `
        SELECT *
        FROM righe_ordine
        WHERE ordine_id = $1
        ORDER BY id;
        `,
        [ordine_id]
    );
};

const findById = (id) => {
    return pool.query(
        `SELECT * FROM righe_ordine WHERE id = $1;`,
        [id]
    );
};

const update = (id, data) => {
    const { quantita, prezzo_unitario } = data;

    return pool.query(
        `
        UPDATE righe_ordine
        SET quantita = $1,
            prezzo_unitario = $2
        WHERE id = $3
        RETURNING *;
        `,
        [quantita, prezzo_unitario, id]
    );
};

const remove = (id) => {
    return pool.query(
        `
        DELETE FROM righe_ordine
        WHERE id = $1
        RETURNING id;
        `,
        [id]
    );
};

module.exports = {
    create,
    findByOrdine,
    findById,
    update,
    remove
};
