const clientiModel = require('../models/clientiModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await clientiModel.findAttivi();
    return result.rows;
};


const getById = async (id) => {
    const result = await clientiModel.findById(id);

    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    return result.rows[0];
};
const create = async ({ ragione_sociale, piva_cf, email, telefono }) => {
    const result = await clientiModel.create({
        ragione_sociale,
        piva_cf,
        email,
        telefono,
        source: 'manual'  
    });

    return result.rows[0];
};

const update = async (id, fields) => {
    const existing = await clientiModel.findById(id);

    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    if (existing.rows[0].source === 'ecosystem') {
        throwError('ACCESS_DENIED', 'Cliente ecosistema non modificabile');
    }

    delete fields.source;

    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    const result = await clientiModel.update(id, fields);
    return result.rows[0];
};

const deleteCliente = async (id) => {
    const existing = await clientiModel.findById(id);

    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    await clientiModel.remove(id);
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteCliente
};
