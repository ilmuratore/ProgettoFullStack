const pool = require('../config/db');


const findAll = () =>
    pool.query(
        `SELECT prodotti.id,
                prodotti.sku,
                prodotti.nome,
                prodotti.descrizione,
                prodotti.categoria_id,
                categorie.nome AS categoria,
                prodotti.unita_misura,
                prodotti.peso_kg,
                prodotti.scorta_minima,
                prodotti.attivo
     FROM prodotti
     LEFT JOIN categorie ON prodotti.categoria_id = categorie.id
     ORDER BY prodotti.id`
    );


const findById = (id) =>
    pool.query(
        `SELECT prodotti.id,
                prodotti.sku,
                prodotti.nome,
                prodotti.descrizione,
                prodotti.categoria_id,
                categorie.nome AS categoria,
                prodotti.unita_misura,
                prodotti.peso_kg,
                prodotti.scorta_minima,
                prodotti.attivo
     FROM prodotti
     LEFT JOIN categorie ON prodotti.categoria_id = categorie.id
     WHERE prodotti.id = $1`,
        [id]
    );

const findBySku = (sku) =>
    pool.query(
        `SELECT prodotti.id,
                prodotti.sku,
                prodotti.nome,
                prodotti.descrizione,
                prodotti.categoria_id,
                categorie.nome AS categoria,
                prodotti.unita_misura,
                prodotti.peso_kg,
                prodotti.scorta_minima,
                prodotti.attivo
     FROM prodotti
     LEFT JOIN categorie ON prodotti.categoria_id = categorie.id
     WHERE prodotti.sku = $1`,
        [sku]
    );

const findByCategoriaId = (categoria_id) =>
    pool.query(
        `SELECT prodotti.id,
                prodotti.sku,
                prodotti.nome,
                prodotti.descrizione,
                prodotti.categoria_id,
                categorie.nome AS categoria,
                prodotti.unita_misura,
                prodotti.peso_kg,
                prodotti.scorta_minima,
                prodotti.attivo
     FROM prodotti
     LEFT JOIN categorie ON prodotti.categoria_id = categorie.id
     WHERE prodotti.categoria_id = $1
     ORDER BY prodotti.nome`,
        [categoria_id]
    );


const create = ({ sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima = 0, attivo = true }) =>
    pool.query(
        `INSERT INTO prodotti (sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, attivo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, attivo`,
        [sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, attivo]
    );

const update = (id, { sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, attivo }) =>
    pool.query(
        `UPDATE prodotti
     SET sku = COALESCE($1, sku),
         nome = COALESCE($2, nome),
         descrizione = COALESCE($3, descrizione),
         categoria_id = COALESCE($4, categoria_id),
         unita_misura = COALESCE($5, unita_misura),
         peso_kg = COALESCE($6, peso_kg),
         scorta_minima = COALESCE($7, scorta_minima),
         attivo = COALESCE($8, attivo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING id, sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, attivo`,
        [sku, nome, descrizione, categoria_id, unita_misura, peso_kg, scorta_minima, attivo, id]
    );


const remove = (id) =>
    pool.query(
        `UPDATE prodotti
     SET attivo = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
        [id]
    );


module.exports = {
    findAll, findById, findBySku, findByCategoriaId,
    create, update, remove
};
