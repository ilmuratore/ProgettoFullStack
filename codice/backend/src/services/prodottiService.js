const prodottiModel = require('../models/prodottiModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await prodottiModel.findListino();
    return result.rows;
};

const getById = async (id) => {
    const result = await prodottiModel.findById(id);
    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }
    return result.rows[0];
};

const create = async (data) => {
    const { sku, prezzo } = data;

    const existing = await prodottiModel.findBySku(sku);
    if (existing.rowCount > 0 && existing.rows[0].attivo === true) {
        throwError('DUPLICATE_ENTRY', 'SKU già esistente');
    }
    if (prezzo <= 0) {
        throwError('VALIDATION_ERROR', 'Il prezzo deve essere maggiore di zero');
    }

    // categoria_id: se presente nel data, viene passata al model (già in firma)
    const result = await prodottiModel.create(data);
    return result.rows[0];
};

const update = async (id, fields) => {
    const existing = await prodottiModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    if (fields.sku) {
        const skuCheck = await prodottiModel.findBySku(fields.sku);
        if (
            skuCheck.rowCount > 0 &&
            skuCheck.rows[0].id !== Number(id) &&
            skuCheck.rows[0].attivo === true
        ) {
            throwError('DUPLICATE_ENTRY', 'SKU già utilizzato da un altro prodotto');
        }
    }

    if (fields.prezzo !== undefined && fields.prezzo <= 0) {
        throwError('VALIDATION_ERROR', 'Il prezzo deve essere maggiore di zero');
    }

    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    // categoria_id è già inclusa in fields se presente nel body (gestita dal controller)
    const result = await prodottiModel.update(id, fields);
    return result.rows[0];
};

const deleteProdotto = async (id) => {
    const existing = await prodottiModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }
    await prodottiModel.softDelete(id);
};

module.exports = { getAll, getById, create, update, deleteProdotto };
