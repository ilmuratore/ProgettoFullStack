const movimentiStockModel = require('../models/movimenti_stockModel');
const giacenzeModel = require('../models/giacenzeModel');
const prodottiModel = require('../models/prodottiModel');
const ubicazioniModel = require('../models/ubicazioniModel');


const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await movimentiStockModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await movimentiStockModel.findById(id);

    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Movimento stock non trovato');
    }

    return result.rows[0];
};

const getByProdottoId = async (prodotto_id) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);

    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const result = await movimentiStockModel.findByProdottoId(prodotto_id);
    return result.rows;
};

const getByUbicazioneId = async (ubicazione_id) => {
    const ubicazioneResult = await ubicazioniModel.findById(ubicazione_id);

    if (ubicazioneResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await movimentiStockModel.findByUbicazioneId(ubicazione_id);
    return result.rows;
};

const getByTipo = async (movimento_tipo) => {
    const result = await movimentiStockModel.findByTipo(movimento_tipo);
    return result.rows;
};

const getByRiferimento = async (riferimento) => {
    const result = await movimentiStockModel.findByRiferimento(riferimento);
    return result.rows;
};

const create = async ({ prodotto_id, ubicazione_id, quantita, movimento_tipo, riferimento, note }) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);
    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const ubicazioneResult = await ubicazioniModel.findById(ubicazione_id);
    if (ubicazioneResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const giacenzaResult = await giacenzeModel.incrementaQuantita(prodotto_id, ubicazione_id, quantita);
    if (giacenzaResult.rowCount === 0) {
        throwError('INSUFFICIENT_STOCK', 'Giacenza insufficiente per completare il movimento');
    }

    const result = await movimentiStockModel.create({
        prodotto_id,
        ubicazione_id,
        quantita,
        movimento_tipo,
        riferimento,
        note
    });

    return result.rows[0];
};


module.exports = {
    getAll,
    getById,
    getByProdottoId,
    getByUbicazioneId,
    getByTipo,
    getByRiferimento,
    create
};
