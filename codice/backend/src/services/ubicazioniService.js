const ubicazioniModel         = require('../models/ubicazioniModel');
const magazziniModel          = require('../models/magazziniModel');
const { buildCodiceComposto } = require('./magazziniService');


const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const withCodice = (ubicazione) => ({
    ...ubicazione,
    codice_composto: buildCodiceComposto(
        ubicazione.magazzino_id,
        ubicazione.corsia,
        ubicazione.scaffale
    )
});

const getAll = async () => {
    const result = await ubicazioniModel.findAttive();
    return result.rows.map(withCodice);
};

const getById = async (id) => {
    const result = await ubicazioniModel.findById(id);
    if (result.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }
    return withCodice(result.rows[0]);
};

const create = async (magazzino_id, { corsia, scaffale, temperatura_controllata }) => {
    const magResult = await magazziniModel.findById(magazzino_id);
    if (magResult.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Magazzino non trovato');
    }

    const slotResult = await ubicazioniModel.findByMagazzinoIdAndSlot(
        magazzino_id, corsia, scaffale
    );
    if (slotResult.rowCount > 0) {
        throwError('DUPLICATE_ENTRY', `Slot corsia=${corsia} scaffale=${scaffale} già occupato in questo magazzino`);
    }

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

const updateTemperatura = async (id, temperatura_controllata) => {
    const existing = await ubicazioniModel.findById(id);
    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await ubicazioniModel.updateTemperatura(id, temperatura_controllata);
    return withCodice(result.rows[0]);
};

const toggleAttivo = async (id) => {
    const existing = await ubicazioniModel.findById(id);
    if (existing.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ubicazione non trovata');
    }

    const result = await ubicazioniModel.toggleAttivo(id);
    return withCodice(result.rows[0]);
};


module.exports = {
    getAll,
    getById,
    create,
    updateTemperatura,
    toggleAttivo,
};