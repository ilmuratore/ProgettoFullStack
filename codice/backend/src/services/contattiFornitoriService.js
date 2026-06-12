const contattiModel = require('../models/contatti_fornitoriModel');
const fornitoriModel = require('../models/fornitoriModel');

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};


const assertFornitore = async (fornitore_id) => {
    const res = await fornitoriModel.findById(fornitore_id);
    if (res.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Fornitore non trovato');
    }
    return res.rows[0];
};

// GET /fornitori/:id/contatti
const getByFornitoreId = async (fornitore_id) => {
    await assertFornitore(fornitore_id);
    const res = await contattiModel.findByFornitoreId(fornitore_id);
    return res.rows;
};

// GET /fornitori/:id/contatti/:contattoId
const getById = async (fornitore_id, id) => {
    await assertFornitore(fornitore_id);

    const res = await contattiModel.findById(id);

    if (res.rowCount === 0 || res.rows[0].fornitore_id !== Number(fornitore_id)) {
        throwError('RESOURCE_NOT_FOUND', 'Contatto non trovato');
    }

    return res.rows[0];
};

// POST /fornitori/:id/contatti
const create = async (fornitore_id, data) => {
    await assertFornitore(fornitore_id);

    const res = await contattiModel.create({
        fornitore_id: Number(fornitore_id),
        nome: data.nome,
        ruolo: data.ruolo ?? null,
        email: data.email ?? null,
        telefono: data.telefono ?? null
    });

    return res.rows[0];
};

// PATCH /fornitori/:id/contatti/:contattoId
const update = async (fornitore_id, id, data) => {
    const existing = await getById(fornitore_id, id);

    const res = await contattiModel.update(id, {
        nome: data.nome ?? existing.nome,
        ruolo: data.ruolo ?? existing.ruolo,
        email: data.email ?? existing.email,
        telefono: data.telefono ?? existing.telefono
    });

    return res.rows[0];
};


module.exports = {
    getByFornitoreId,
    getById,
    create,
    update
};
