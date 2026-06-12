const ecosystemModel = require('../models/ecosystemModel');

const throwError = (code, message, status = 400) => {
    const err = new Error(message);
    err.code = code;
    err.status = status;
    throw err;
};

const search = async (q) => {
    if (!q || q.trim().length < 2) throwError('VALIDATION_ERROR', 'Parametro q minimo 2 caratteri');
    return ecosystemModel.search(q.trim());
};

const getSchedaFornitore = async (fornitore_id) => {
    const r = await ecosystemModel.getSchedaFornitore(fornitore_id);
    if (r.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Fornitore non trovato', 404);
    return r.rows[0];
};

const getCatalogoFornitore = async (fornitore_id) => {
    const r = await ecosystemModel.getCatalogoFornitore(fornitore_id);
    return r.rows;
};

const getSchedaProdotto = async (prodotto_id) => {
    const r = await ecosystemModel.getSchedaProdotto(prodotto_id);
    if (r.rowCount === 0) throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato', 404);
    return r.rows[0];
};

const getDisponibilitaProdotto = async (prodotto_id) => {
    const r = await ecosystemModel.getDisponibilitaProdotto(prodotto_id);
    return r.rows;
};

module.exports = { search, getSchedaFornitore, getCatalogoFornitore, getSchedaProdotto, getDisponibilitaProdotto };
