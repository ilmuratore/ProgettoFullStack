const pool = require('../config/db');
const ricezioniModel = require('../models/ricezioniModel');
const righeRicezioneModel = require('../models/righeRicezioneModel');
const movimentiStockService = require('./movimenti_stockService');

const getAll = () => ricezioniModel.getAll();

const getById = (id) => ricezioniModel.getById(id);

const getRighe = (id) => righeRicezioneModel.getByRicezioneId(id);

const create = async (data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ricezione = await ricezioniModel.create(data, client);

        await client.query('COMMIT');
        return ricezione;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const addRiga = async (ricezione_id, data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const riga = await righeRicezioneModel.create(ricezione_id, data, client);

        await movimentiStockService.create({
            prodotto_id: data.prodotto_id,
            quantita: data.quantita,
            tipo: 'IN',
            ubicazione_id: data.ubicazione_id,
            riferimento: `RICEZIONE_${ricezione_id}`
        }, client);

        await client.query('COMMIT');
        return riga;
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
    addRiga
};
