const destinazioniModel = require('../models/destinazioneclientiModel');
const clientiModel = require('../models/clientiModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const assertCliente = async (cliente_id) => {
    const res = await clientiModel.findById(cliente_id);
    if (res.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }
    return res.rows[0];
};

const getByCliente = async (cliente_id) => {
    await assertCliente(cliente_id);
    const res = await destinazioniModel.findByCliente(cliente_id);
    return res.rows;
};

const getById = async (cliente_id, id) => {
    await assertCliente(cliente_id);
    const res = await destinazioniModel.findById(id);
    if (res.rowCount === 0 || res.rows[0].cliente_id !== Number(cliente_id)) {
        throwError('RESOURCE_NOT_FOUND', 'Destinazione non trovata');
    }
    return res.rows[0];
};

const create = async (cliente_id, data) => {
    await assertCliente(cliente_id);
    const res = await destinazioniModel.create({
        cliente_id: Number(cliente_id),
        etichetta: data.etichetta ?? null,
        indirizzo: data.indirizzo ?? null,
        cap: data.cap ?? null,
        citta: data.citta ?? null,
        provincia: data.provincia ?? null,
        paese: data.paese ?? 'Italia',
        predefinita: data.predefinita === true
    });
    return res.rows[0];
};

const update = async (cliente_id, id, data) => {
    const existing = await getById(cliente_id, id);
    const res = await destinazioniModel.update(id, {
        etichetta: data.etichetta ?? existing.etichetta,
        indirizzo: data.indirizzo ?? existing.indirizzo,
        cap: data.cap ?? existing.cap,
        citta: data.citta ?? existing.citta,
        provincia: data.provincia ?? existing.provincia,
        paese: data.paese ?? existing.paese,
        predefinita: data.predefinita === undefined ? existing.predefinita : data.predefinita === true
    });
    return res.rows[0];
};

const remove = async (cliente_id, id) => {
    await getById(cliente_id, id);
    const res = await destinazioniModel.remove(id);
    return res.rows[0];
};

module.exports = {
    getByCliente,
    getById,
    create,
    update,
    remove
};
