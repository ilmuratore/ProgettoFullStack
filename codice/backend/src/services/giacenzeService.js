const giacenzeModel = require('../models/giacenzeModel');
const prodottiModel = require('../models/prodottiModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getByProdottoId = async (prodotto_id) => {
    const prodottoResult = await prodottiModel.findById(prodotto_id);
    if (prodottoResult.rowCount === 0 || prodottoResult.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const result = await giacenzeModel.findByProdottoId(prodotto_id);
    return result.rows;
};

module.exports = { getByProdottoId };
