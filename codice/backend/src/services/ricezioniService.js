const ricezioniModel = require('../models/ricezioniModel');
const righeRicezioneModel = require('../models/righe_ricezioneModel');

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
    const err = new Error('Endpoint deprecato. Usare POST /api/v1/ordini-acquisto/ricezioni');
    err.code = 'ENDPOINT_DEPRECATED';
    throw err;
};

const { buildRicezioniPdf } = require('../pdf/ricezioniPdf');

const generaPdfRicezione = async (id) => {
    const ricezione = await getById(id);
    const righeRes = await righeRicezioneModel.findByRicezioneId(id);
    return buildRicezioniPdf({ ricezione, righe: righeRes.rows });
};

module.exports = {
    getAll,
    getById,
    getRighe,
    create,
    addRiga,
    generaPdfRicezione
};
