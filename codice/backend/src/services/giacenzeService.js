const giacenzeModel = require('../models/giacenzeModel');
const prodottiModel = require('../models/prodottiModel');
const ubicazioniModel = require('../models/ubicazioniModel');


const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await giacenzeModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await giacenzeModel.findById(id);

    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Giacenza non trovata');
    }

    return result.rows[0];
};

const getByProdottoId = async (prodotto_id) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);

    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const result = await giacenzeModel.findByProdottoId(prodotto_id);
    return result.rows;
};

const getByUbicazioneId = async (ubicazione_id) => {
    const ubicazioneResult = await ubicazioniModel.findById(ubicazione_id);

    if (ubicazioneResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await giacenzeModel.findByUbicazioneId(ubicazione_id);
    return result.rows;
};

const create = async ({ prodotto_id, ubicazione_id, quantita }) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);
    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const ubicazioneResult = await ubicazioniModel.findById(ubicazione_id);
    if (ubicazioneResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const existing = await giacenzeModel.findByProdottoIdAndUbicazioneId(prodotto_id, ubicazione_id);
    if (existing.rowCount > 0) {
        throwError('DUPLICATE_ENTRY', 'Giacenza gia esistente per prodotto e ubicazione');
    }

    if (quantita !== undefined && quantita < 0) {
        throwError('VALIDATION_ERROR', 'La quantita non puo essere negativa');
    }

    const result = await giacenzeModel.create({ prodotto_id, ubicazione_id, quantita });

    if (result.rowCount === 0) {
        throwError('VALIDATION_ERROR', 'La quantita non puo essere negativa');
    }

    return result.rows[0];
};

const update = async (id, fields) => {
    const existing = await giacenzeModel.findById(id);

    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Giacenza non trovata');
    }

    if (fields.prodotto_id !== undefined) {
        const prodottoResult = await prodottiModel.findById(fields.prodotto_id);

        if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
            throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
        }
    }

    if (fields.ubicazione_id !== undefined) {
        const ubicazioneResult = await ubicazioniModel.findById(fields.ubicazione_id);

        if (ubicazioneResult.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
        }
    }

    if (fields.quantita !== undefined && fields.quantita < 0) {
        throwError('VALIDATION_ERROR', 'La quantita non puo essere negativa');
    }

    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    const nextProdottoId = fields.prodotto_id ?? existing.rows[0].prodotto_id;
    const nextUbicazioneId = fields.ubicazione_id ?? existing.rows[0].ubicazione_id;

    const duplicate = await giacenzeModel.findByProdottoIdAndUbicazioneId(nextProdottoId, nextUbicazioneId);
    if (duplicate.rowCount > 0 && duplicate.rows[0].id !== Number(id)) {
        throwError('DUPLICATE_ENTRY', 'Esiste gia una giacenza per prodotto e ubicazione');
    }

    const result = await giacenzeModel.update(id, fields);

    if (result.rowCount === 0) {
        throwError('VALIDATION_ERROR', 'La quantita non puo essere negativa');
    }

    return result.rows[0];
};

const remove = async (id) => {
    const existing = await giacenzeModel.findById(id);

    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Giacenza non trovata');
    }

    await giacenzeModel.remove(id);
};


module.exports = {
    getAll,
    getById,
    getByProdottoId,
    getByUbicazioneId,
    create,
    update,
    remove
};
