const spedizioniModel = require('../models/spedizioniModel');

const throwError = (code, message, status) => {
    const err = new Error(message);
    err.code = code;
    if (status) err.status = status;
    throw err;
};

const list = async () => {
    const result = await spedizioniModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await spedizioniModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Spedizione non trovata', 404);
    }
    return result.rows[0];
};

module.exports = {
    list,
    getById
};
