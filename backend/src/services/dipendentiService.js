// ============================================================
// dipendentiService.js — M05: Anagrafiche Dipendenti
// Business logic. Nessun SQL diretto — tutto delegato al model.
// ============================================================

const dipendentiModel = require('../models/dipendentiModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const getAll = async () => {
    const result = await dipendentiModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const result = await dipendentiModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Dipendente non trovato');
    }
    return result.rows[0];
};

/** codice_fiscale UNIQUE: 23505 → DUPLICATE_ENTRY nell'errorHandler. */
const create = async ({ nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id }) => {
    const result = await dipendentiModel.create({
        nome, cognome, codice_fiscale, ruolo_operativo, data_assunzione, utente_id
    });
    return result.rows[0];
};

const update = async (id, fields) => {
    await getById(id);
    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }
    const result = await dipendentiModel.update(id, {
        nome:            fields.nome,
        cognome:         fields.cognome,
        codice_fiscale:  fields.codice_fiscale,
        ruolo_operativo: fields.ruolo_operativo,
        data_assunzione: fields.data_assunzione,
        utente_id:       fields.utente_id
    });
    return result.rows[0];
};

/**
 * DELETE — hard delete fisico.
 * Safe: spedizioni.corriere_id → ON DELETE SET NULL, nessun blocco FK.
 */
const deleteDipendente = async (id) => {
    await getById(id);
    await dipendentiModel.remove(id);
};

module.exports = { getAll, getById, create, update, deleteDipendente };
