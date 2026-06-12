const spedizioniService = require('../services/spedizioniService');

const getAll = async (_req, res, next) => {
    try {
        const data = await spedizioniService.getAll();
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const data = await spedizioniService.getById(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const data = await spedizioniService.create(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAll,
    getById,
    create
};
