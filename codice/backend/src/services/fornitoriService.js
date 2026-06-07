const fornitoriModel = require("../models/fornitoriModel");
const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};
const getAll = async () => {
    const result = await fornitoriModel.findAttivi();
    return result.rows;
};

const getById = async (id) => {
    const result = await fornitoriModel.findById(id);

    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Fornitore non trovato");
    }

    return result.rows[0];
};

const create = async ({ ragione_sociale, piva, indirizzo, email, telefono, sito_web, descrizione_aziendale }) => {
    const result = await fornitoriModel.create({
        ragione_sociale,
        piva,
        indirizzo,
        email,
        telefono,
        sito_web,
        descrizione_aziendale,
        source: "manual"
    });

    return result.rows[0];
};

const update = async (id, fields) => {
    const existing = await fornitoriModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Fornitore non trovato");
    }

    if (existing.rows[0].source === "ecosystem") {
        throwError("ACCESS_DENIED", "Fornitore ecosistema non modificabile");
    }

    delete fields.source;

    if (Object.keys(fields).length === 0) {
        throwError("VALIDATION_ERROR", "Nessun campo valido da aggiornare");
    }

    const result = await fornitoriModel.update(id, fields);
    return result.rows[0];
};

const deleteFornitore = async (id) => {
    const existing = await fornitoriModel.findById(id);
    if (existing.rowCount === 0 || existing.rows[0].attivo === false) {
        throwError("RESOURCE_NOT_FOUND", "Fornitore non trovato");
    }

    await fornitoriModel.remove(id);
    return;
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteFornitore
};
