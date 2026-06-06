// ============================================================
// corrieriService.js — M05: Anagrafiche Corrieri
// Business logic. Nessun SQL diretto — tutto delegato al model.
// ============================================================

const corrieriModel = require('../models/corrieriModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await corrieriModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await corrieriModel.findById(id);
    if (result.rowCount === 0 || result.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Corriere non trovato');
    }
    return result.rows[0];
};

/**
 * CREATE — codice UNIQUE gestito a livello DB.
 * PG_SQLSTATE 23505 → DUPLICATE_ENTRY nell'errorHandler.
 */
const create = async ({ codice, nome, telefono, email }) => {
    const result = await corrieriModel.create({ codice, nome, telefono, email });
    return result.rows[0];
};

const update = async (id, fields) => {
    await getById(id);
    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }
    const result = await corrieriModel.update(id, {
        codice:   fields.codice,
        nome:     fields.nome,
        telefono: fields.telefono,
        email:    fields.email
    });
    return result.rows[0];
};

/**
 * DELETE — soft delete (attivo = false).
 * Nessun check FK: spedizioni referisce dipendenti, non corrieri.
 */
const deleteCorriere = async (id) => {
    await getById(id);
    await corrieriModel.remove(id);
};

module.exports = { getAll, getById, create, update, deleteCorriere };
