const spedizioniService = require('../services/spedizioniService');

const getAll = async (_req, res, next) => {
    try {
        const data = await spedizioniService.list();
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

const updateStato = async (req, res, next) => {
    try {
        const data = await spedizioniService.updateStato(req.params.id, req.body.stato);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAll,
    getById,
    updateStato
};
