const magazziniModel = require('../models/magazziniModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const buildCodiceComposto = (magazzino_id, corsia, scaffale) =>
    `${magazzino_id}-${String(corsia).padStart(2, '0')}-${String(scaffale).padStart(2, '0')}`;

const getAll = async () => {
    const result = await magazziniModel.findAll();
    return result.rows;
};

const getById = async (id) => {
    const magResult = await magazziniModel.findById(id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }

    const magazzino  = magResult.rows[0];
    const ubResult   = await magazziniModel.findUbicazioniByMagazzino(id);

    const ubicazioni = ubResult.rows.map((u) => ({
        ...u,
        codice_composto: buildCodiceComposto(u.magazzino_id, u.corsia, u.scaffale)
    }));

    return { ...magazzino, ubicazioni };
};

const create = async ({ codice, nome, indirizzo, cap, citta, provincia, paese }) => {
    const existing = await magazziniModel.findByCodice(codice);
    if (existing.rowCount > 0) {
        throwError('DUPLICATE_ENTRY', `Codice magazzino '${codice}' già esistente`);
    }

// fix — passati cap, citta, provincia, paese al model (prima venivano ignorati)
    const result = await magazziniModel.create({ codice, nome, indirizzo, cap, citta, provincia, paese });
    return result.rows[0];
};

const update = async (id, body) => {
    const magResult = await magazziniModel.findById(id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }
    
// fix — aggiunti campi indirizzo strutturato all'oggetto fields
    const fields = {};
    if (body.nome      !== undefined) fields.nome      = body.nome;
    if (body.indirizzo !== undefined) fields.indirizzo = body.indirizzo;
    if (body.cap       !== undefined) fields.cap       = body.cap;
    if (body.citta     !== undefined) fields.citta     = body.citta;
    if (body.provincia !== undefined) fields.provincia = body.provincia;
    if (body.paese     !== undefined) fields.paese     = body.paese;

    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    const result = await magazziniModel.update(id, fields);
    return result.rows[0];
};

const toggleAttivo = async (id) => {
    const magResult = await magazziniModel.findById(id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }

    const result = await magazziniModel.toggleAttivo(id);
    return result.rows[0];
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    toggleAttivo,
    buildCodiceComposto   }

    