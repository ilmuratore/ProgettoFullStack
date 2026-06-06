// ============================================================
// ubicazioniService.js — M06: Gestione Ubicazioni
// ============================================================

const ubicazioniModel             = require('../models/ubicazioniModel');
const magazziniModel              = require('../models/magazziniModel');
const { buildCodiceComposto }     = require('./magazziniService');

// ============================================================
// HELPER
// ============================================================

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

// Arricchisce l'oggetto ubicazione con codice_composto calcolato
const withCodice = (ubicazione) => ({
    ...ubicazione,
    codice_composto: buildCodiceComposto(
        ubicazione.magazzino_id,
        ubicazione.corsia,
        ubicazione.scaffale
    )
});

// ============================================================
// SERVICE
// ============================================================

// GET BY ID — dettaglio ubicazione con codice_composto calcolato
const getById = async (id) => {
    const result = await ubicazioniModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }
    return withCodice(result.rows[0]);
};

// CREATE — verifica magazzino, verifica unicità slot, poi INSERT
// Il campo DB "codice" (NOT NULL legacy) viene popolato con il codice_composto calcolato
const create = async (magazzino_id, { corsia, scaffale, temperatura_controllata }) => {
    // 1) Magazzino deve esistere
    const magResult = await magazziniModel.findById(magazzino_id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }

    // 2) Slot (magazzino_id, corsia, scaffale) deve essere libero
    const slotResult = await ubicazioniModel.findByMagazzinoIdAndSlot(
        magazzino_id, corsia, scaffale
    );
    if (slotResult.rowCount > 0) {
        throwError('DUPLICATE_ENTRY', `Slot corsia=${corsia} scaffale=${scaffale} già occupato in questo magazzino`);
    }

    // 3) Calcola codice_composto — usato anche per popolare il campo DB "codice" NOT NULL
    const codiceComposto = buildCodiceComposto(magazzino_id, corsia, scaffale);
    const tempCtrl       = temperatura_controllata ?? false;

    const result = await ubicazioniModel.create({
        magazzino_id,
        corsia,
        scaffale,
        codice: codiceComposto,
        temperatura_controllata: tempCtrl
    });
    return withCodice(result.rows[0]);
};

// UPDATE TEMPERATURA — modifica solo temperatura_controllata
const updateTemperatura = async (id, temperatura_controllata) => {
    const existing = await ubicazioniModel.findById(id);
    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await ubicazioniModel.updateTemperatura(id, temperatura_controllata);
    return withCodice(result.rows[0]);
};

// TOGGLE ATTIVO — inverte il flag senza accettare un valore dal body
const toggleAttivo = async (id) => {
    const existing = await ubicazioniModel.findById(id);
    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await ubicazioniModel.toggleAttivo(id);
    return withCodice(result.rows[0]);
};

// ============================================================

module.exports = {
    getById,
    create,
    updateTemperatura,
    toggleAttivo
};
