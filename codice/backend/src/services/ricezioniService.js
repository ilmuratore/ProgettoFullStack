const pool = require('../config/db');
const ricezioniModel = require('../models/ricezioniModel');
const righeRicezioneModel = require('../models/righe_ricezioneModel');
const movimentiStockService = require('./movimenti_stockService');

const getAll = async () => {
    const res = await ricezioniModel.findAll();
    return res.rows;
};

const getById = async (id) => {
    const res = await ricezioniModel.findById(id);
    if (res.rowCount === 0) {
        const err = new Error('Ricezione non trovata');
        err.code = 'RESOURCE_NOT_FOUND';
        throw err;
    }
    return res.rows[0];
};

const getRighe = async (id) => {
    const res = await righeRicezioneModel.findByRicezioneId(id);
    return res.rows;
};

const create = async (data) => {
    const res = await ricezioniModel.create(data);
    return res.rows[0];
};

const addRiga = async (ricezione_id, data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const rigaRes = await righeRicezioneModel.create({
            ricezione_id,
            prodotto_id: data.prodotto_id,
            quantita_ricevuta: data.quantita,
            ubicazione_id: data.ubicazione_id,
        });

        await movimentiStockService.create({
            prodotto_id: data.prodotto_id,
            ubicazione_id: data.ubicazione_id,
            quantita: data.quantita,
            movimento_tipo: 'CARICO_ACQUISTO',
            riferimento: `ricezione:${ricezione_id}`,
        }, client);

        await client.query('COMMIT');
        return rigaRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    getAll,
    getById,
    getRighe,
    create,
    addRiga,
};