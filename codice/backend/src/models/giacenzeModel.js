const pool = require('../config/db');


const COLS_FULL = `
    giacenze.id,
    giacenze.prodotto_id,
    prodotti.sku,
    prodotti.nome        AS prodotto,
    prodotti.scorta_minima,
    (giacenze.quantita < prodotti.scorta_minima) AS sotto_scorta,
    categorie.nome       AS categoria,
    giacenze.ubicazione_id,
    ubicazioni.codice    AS ubicazione,
    magazzini.nome       AS magazzino,
    giacenze.quantita,
    (SELECT MAX(m.created_at)
     FROM movimenti_stock m
     WHERE m.prodotto_id   = giacenze.prodotto_id
       AND m.ubicazione_id = giacenze.ubicazione_id) AS ultimo_movimento
`;

const JOINS_FULL = `
    FROM giacenze
    JOIN prodotti   ON giacenze.prodotto_id   = prodotti.id
    JOIN ubicazioni ON giacenze.ubicazione_id = ubicazioni.id
    JOIN magazzini  ON ubicazioni.magazzino_id = magazzini.id
    LEFT JOIN categorie ON prodotti.categoria_id = categorie.id
`;


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


const findAllFiltered = ({ search, magazzino, scorta, ubicazione, q_min, q_max } = {}) => {
    const conditions = [];
    const values = [];
    let i = 1;

    if (search) {
        conditions.push(`(prodotti.sku ILIKE $${i} OR prodotti.nome ILIKE $${i})`);
        values.push(`%${search}%`);
        i++;
    }

    if (magazzino) {
        conditions.push(`magazzini.id = $${i}`);
        values.push(parseInt(magazzino, 10));
        i++;
    }

    if (scorta === 'sotto') {
        conditions.push(`giacenze.quantita < prodotti.scorta_minima`);
    }

    if (ubicazione) {
        conditions.push(`ubicazioni.codice ILIKE $${i}`);
        values.push(`%${ubicazione}%`);
        i++;
    }

    if (q_min !== undefined && q_min !== '') {
        conditions.push(`giacenze.quantita >= $${i}`);
        values.push(parseInt(q_min, 10));
        i++;
    }

    if (q_max !== undefined && q_max !== '') {
        conditions.push(`giacenze.quantita <= $${i}`);
        values.push(parseInt(q_max, 10));
        i++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return pool.query(
        `SELECT ${COLS_FULL}
         ${JOINS_FULL}
         ${where}
         ORDER BY magazzini.nome, ubicazioni.codice, prodotti.nome`,
        values
    );
};


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

const findByProdottoIdAndUbicazioneId = (prodotto_id, ubicazione_id, client) =>
    (client || pool).query(
        `SELECT id, prodotto_id, ubicazione_id, quantita
     FROM giacenze
     WHERE prodotto_id = $1
       AND ubicazione_id = $2`,
        [prodotto_id, ubicazione_id]
    );

const lockByProdottoIdAndUbicazioneId = (prodotto_id, ubicazione_id, client) =>
    (client || pool).query(
        `SELECT id FROM giacenze
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


const incrementaQuantita = (prodotto_id, ubicazione_id, quantita, client) =>
    (client || pool).query(
        `INSERT INTO giacenze (prodotto_id, ubicazione_id, quantita)
     SELECT $1, $2, GREATEST($3, 0)
     WHERE $3 >= 0
        OR EXISTS (
            SELECT 1 FROM giacenze
            WHERE prodotto_id  = $1
              AND ubicazione_id = $2
        )
     ON CONFLICT (prodotto_id, ubicazione_id)
     DO UPDATE SET quantita     = giacenze.quantita + $3,
                   updated_at   = CURRENT_TIMESTAMP
      WHERE ($3 >= 0)
         OR (giacenze.quantita + $3 >= 0)
     RETURNING id, prodotto_id, ubicazione_id, quantita`,
        [prodotto_id, ubicazione_id, quantita]
    );

const remove = (id) =>
    pool.query('DELETE FROM giacenze WHERE id = $1 RETURNING id', [id]);


module.exports = {
    findAll,
    findAllFiltered,
    findById,
    findByProdottoId,
    findByUbicazioneId,
    findByProdottoIdAndUbicazioneId,
    lockByProdottoIdAndUbicazioneId,
    create,
    update,
    incrementaQuantita,
    remove,
};