const pool = require('../config/db');

const findByRichiestaId = (richiesta_id) =>
    pool.query(
        `SELECT
             rr.id,
             rr.richiesta_id,
             rr.prodotto_id,
             p.sku              AS prodotto_sku,
             p.nome             AS prodotto_nome,
             p.prezzo           AS prodotto_prezzo,
             rr.quantita_richiesta,
             rr.created_at
         FROM  righe_richiesta rr
         JOIN  prodotti p ON p.id = rr.prodotto_id
         WHERE rr.richiesta_id = $1
         ORDER BY rr.id`,
        [richiesta_id]
    );

const findById = (id) =>
    pool.query(
        `SELECT
             rr.id,
             rr.richiesta_id,
             rr.prodotto_id,
             p.sku              AS prodotto_sku,
             p.nome             AS prodotto_nome,
             p.prezzo           AS prodotto_prezzo,
             rr.quantita_richiesta,
             rr.created_at
         FROM  righe_richiesta rr
         JOIN  prodotti p ON p.id = rr.prodotto_id
         WHERE rr.id = $1`,
        [id]
    );

const create = ({ richiesta_id, prodotto_id, quantita_richiesta }) =>
    pool.query(
        `INSERT INTO righe_richiesta (richiesta_id, prodotto_id, quantita_richiesta)
         VALUES ($1, $2, $3)
         RETURNING id, richiesta_id, prodotto_id, quantita_richiesta, created_at`,
        [richiesta_id, prodotto_id, quantita_richiesta]
    );

const createBulk = async (richiesta_id, rows) => {
    if (!rows || rows.length === 0) return { rows: [] };

    const values = rows.map((r, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(', ');
    const params = [richiesta_id];
    rows.forEach(r => params.push(r.prodotto_id, r.quantita_richiesta));

    return pool.query(
        `INSERT INTO righe_richiesta (richiesta_id, prodotto_id, quantita_richiesta)
         VALUES ${values}
         RETURNING id, richiesta_id, prodotto_id, quantita_richiesta, created_at`,
        params
    );
};

const updateQuantita = (id, quantita_richiesta) =>
    pool.query(
        `UPDATE righe_richiesta
         SET quantita_richiesta = $1
         WHERE id = $2
         RETURNING id, richiesta_id, prodotto_id, quantita_richiesta`,
        [quantita_richiesta, id]
    );

const remove = (id) =>
    pool.query(
        `DELETE FROM righe_richiesta
         WHERE id = $1
         RETURNING id`,
        [id]
    );

const removeByRichiestaId = (richiesta_id) =>
    pool.query(
        `DELETE FROM righe_richiesta
         WHERE richiesta_id = $1
         RETURNING id`,
        [richiesta_id]
    );


module.exports = {
    findByRichiestaId,
    findById,
    create,
    createBulk,
    updateQuantita,
    remove,
    removeByRichiestaId
};
