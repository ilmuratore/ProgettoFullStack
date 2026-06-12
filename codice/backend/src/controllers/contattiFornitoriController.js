const contattiService = require('../services/contattiFornitoriService');

// GET /fornitori/:id/contatti
const getByFornitoreId = async (req, res, next) => {
    try {
        const data = await contattiService.getByFornitoreId(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// GET /fornitori/:id/contatti/:contattoId
const getById = async (req, res, next) => {
    try {
        const data = await contattiService.getById(req.params.id, req.params.contattoId);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// POST /fornitori/:id/contatti
const create = async (req, res, next) => {
    try {
        const data = await contattiService.create(req.params.id, req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// PATCH /fornitori/:id/contatti/:contattoId
const update = async (req, res, next) => {
    try {
        const data = await contattiService.update(req.params.id, req.params.contattoId, req.body);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getByFornitoreId,
    getById,
    create,
    update
};
