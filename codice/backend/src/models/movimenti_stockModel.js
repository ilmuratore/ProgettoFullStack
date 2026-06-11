const pool = require('../config/db');


const findAll = (client = pool) =>
    client.query(
        `SELECT movimenti_stock.id,
                movimenti_stock.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                movimenti_stock.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                movimenti_stock.quantita,
                movimenti_stock.tipo,
                movimenti_stock.riferimento,
                movimenti_stock.note,
                movimenti_stock.created_at
     FROM movimenti_stock
     JOIN prodotti ON movimenti_stock.prodotto_id = prodotti.id
     JOIN ubicazioni ON movimenti_stock.ubicazione_id = ubicazioni.id
     ORDER BY movimenti_stock.created_at DESC`
    );


const findById = (id, client = pool) =>
    client.query(
        `SELECT movimenti_stock.id,
                movimenti_stock.prodotto_id,
                prodotti.sku,
                prodotti.nome AS prodotto,
                movimenti_stock.ubicazione_id,
                ubicazioni.codice AS ubicazione,
                movimenti_stock.quantita,
                movimenti_stock.tipo,
                movimenti_stock.riferimento,
                movimenti_stock.note,
                movimenti_stock.created_at
     FROM movimenti_stock
     JOIN prodotti ON movimenti_stock.prodotto_id = prodotti.id
     JOIN ubicazioni ON movimenti_stock.ubicazione_id = ubicazioni.id
     WHERE movimenti_stock.id = $1`,
        [id]
    );

const findByProdottoId = (prodotto_id, client = pool) =>
    client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, riferimento, note, created_at
     FROM movimenti_stock
     WHERE prodotto_id = $1
     ORDER BY created_at DESC`,
        [prodotto_id]
    );

const findByUbicazioneId = (ubicazione_id, client = pool) =>
    client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, riferimento, note, created_at
     FROM movimenti_stock
     WHERE ubicazione_id = $1
     ORDER BY created_at DESC`,
        [ubicazione_id]
    );

const findByTipo = (movimento_tipo, client = pool) =>
    client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, riferimento, note, created_at
     FROM movimenti_stock
     WHERE tipo = $1
     ORDER BY created_at DESC`,
        [movimento_tipo]
    );

const findByRiferimento = (riferimento, client = pool) =>
    client.query(
        `SELECT id, prodotto_id, ubicazione_id, quantita,
                tipo, riferimento, note, created_at
     FROM movimenti_stock
     WHERE riferimento = $1
     ORDER BY created_at DESC`,
        [riferimento]
    );


const create = ({ prodotto_id, ubicazione_id, quantita, movimento_tipo, riferimento, note }, client = pool) =>
    client.query(
        `INSERT INTO movimenti_stock (prodotto_id, ubicazione_id, quantita, tipo, riferimento, note)
     VALUES ($1, $2, $3, $4::movimento_tipo, $5, $6)
     RETURNING id, prodotto_id, ubicazione_id, quantita, tipo, riferimento, note, created_at`,
        [prodotto_id, ubicazione_id, quantita, movimento_tipo, riferimento, note]
    );


module.exports = {
    findAll, findById, findByProdottoId, findByUbicazioneId, findByTipo, findByRiferimento,
    create
};
