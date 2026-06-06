// ============================================================
// magazziniService.js — M06: Gestione Magazzino
// ============================================================

const magazziniModel = require('../models/magazziniModel');

// ============================================================
// HELPER
// ============================================================

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const buildCodiceComposto = (magazzino_id, corsia, scaffale) =>
    `${magazzino_id}-${String(corsia).padStart(2, '0')}-${String(scaffale).padStart(2, '0')}`;

// ============================================================
// SERVICE
// ============================================================

// GET ALL — lista tutti i magazzini inclusi i disattivi (management view)
const getAll = async () => {
    const result = await magazziniModel.findAll();
    return result.rows;
};

// GET BY ID — dettaglio magazzino + albero ubicazioni con codice_composto calcolato
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

// CREATE — controlla unicità codice prima dell'INSERT; codice non modificabile dopo
const create = async ({ codice, nome, indirizzo }) => {
    const existing = await magazziniModel.findByCodice(codice);
    if (existing.rowCount > 0) {
        throwError('DUPLICATE_ENTRY', `Codice magazzino '${codice}' già esistente`);
    }

    const result = await magazziniModel.create({ codice, nome, indirizzo });
    return result.rows[0];
};

// UPDATE — PATCH parziale solo su nome e/o indirizzo; codice mai accettato
const update = async (id, body) => {
    const magResult = await magazziniModel.findById(id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }

    // codice escluso a prescindere — anche se presente nel body
    const fields = {};
    if (body.nome      !== undefined) fields.nome      = body.nome;
    if (body.indirizzo !== undefined) fields.indirizzo = body.indirizzo;

    if (Object.keys(fields).length === 0) {
        throwError('VALIDATION_ERROR', 'Nessun campo valido da aggiornare');
    }

    // Il model usa COALESCE: i campi assenti restano undefined → null → valore originale
    const result = await magazziniModel.update(id, fields);
    return result.rows[0];
};

// TOGGLE ATTIVO — inverte il flag senza accettare un valore dal body
const toggleAttivo = async (id) => {
    const magResult = await magazziniModel.findById(id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }

    const result = await magazziniModel.toggleAttivo(id);
    return result.rows[0];
};

// ============================================================

module.exports = {
    getAll,
    getById,
    create,
    update,
    toggleAttivo,
    buildCodiceComposto   // esportato per uso in ubicazioniService
};
