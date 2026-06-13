
const pool = require('../config/db');

const BASE_COLS = `
    p.id,
    p.sku,
    p.nome,
    p.descrizione,
    p.categoria_id,
    c.nome          AS categoria,
    p.unita_misura,
    p.peso_kg,
    p.scorta_minima,
    p.prezzo,
    p.data_agg_prezzo,
    p.attivo,
    p.created_at,
    p.updated_at
`;



const findAll = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         ORDER  BY p.nome ASC`
    );

const findAttivi = () =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.attivo = true
         ORDER  BY p.nome ASC`
    );


const findListino = () =>
    pool.query(
        `SELECT
             p.id,
             p.sku,
             p.nome,
             c.nome AS categoria,
             p.prezzo,
             p.data_agg_prezzo,
             p.attivo,
             p.created_at
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         ORDER  BY p.nome ASC`
    );

const findById = (id, client = pool) =>
    client.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.id = $1`,
        [id]
    );

const findBySku = (sku, client = pool) =>
    client.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.sku = $1`,
        [sku]
    );

const findByCategoriaId = (categoria_id) =>
    pool.query(
        `SELECT ${BASE_COLS}
         FROM   prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE  p.categoria_id = $1
         ORDER  BY p.nome ASC`,
        [categoria_id]
    );


const search = (q) =>
    pool.query(
        `SELECT
             p.id,
             p.sku,
             p.nome,
             p.prezzo,
             p.attivo
         FROM   prodotti p
         WHERE  p.attivo = true
           AND  (p.nome ILIKE $1 OR p.sku ILIKE $1)
         ORDER  BY p.nome ASC
         LIMIT  20`,
        [`%${q}%`]
    );

const create = ({ sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima = 0, prezzo, attivo = true }, client = pool) =>
    client.query(
        `INSERT INTO prodotti
             (sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, data_agg_prezzo, attivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
         RETURNING id, sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, data_agg_prezzo, attivo, created_at, updated_at`,
        [sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo]
    );

const update = (id, { sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo }, client = pool) =>
    client.query(
        `UPDATE prodotti
         SET sku           = COALESCE($1,  sku),
             nome          = COALESCE($2,  nome),
             descrizione   = COALESCE($3,  descrizione),
             categoria_id  = COALESCE($4,  categoria_id),
             unita_misura  = COALESCE($5,  unita_misura),
             peso_kg       = COALESCE($6,  peso_kg),
             scorta_minima = COALESCE($7,  scorta_minima),
             prezzo        = COALESCE($8,  prezzo),
             -- Aggiorna data_agg_prezzo solo se il prezzo è effettivamente cambiato
             data_agg_prezzo = CASE
                                 WHEN $8 IS NOT NULL AND $8 <> prezzo THEN NOW()
                                 ELSE data_agg_prezzo
                               END,
             attivo        = COALESCE($9,  attivo),
             updated_at    = NOW()
         WHERE id = $10
         RETURNING id, sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, data_agg_prezzo, attivo, created_at, updated_at`,
        [sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, prezzo, attivo, id]
    );


const updatePrezzo = (id, prezzo) =>
    pool.query(
        `UPDATE prodotti
         SET prezzo        = $1,
             data_agg_prezzo = NOW(),
             updated_at    = NOW()
         WHERE id = $2
         RETURNING id, sku, nome, prezzo, data_agg_prezzo`,
        [prezzo, id]
    );


const softDelete = (id) => {
    return pool.query(
        `
        UPDATE prodotti
        SET attivo = false
        WHERE id = $1 AND attivo = true
        RETURNING id;
        `,
        [id]
    );
};

const remove = (id) =>
    pool.query(
        `UPDATE prodotti
         SET attivo     = false,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );


module.exports = {
    findAll,
    findAttivi,
    findListino,
    findById,
    findBySku,
    findByCategoriaId,
    search,
    create,
    update,
    updatePrezzo,
    softDelete,
    remove
};
