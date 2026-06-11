const destinazioniService = require('../services/destinazioniService');

const getByCliente = async (req, res, next) => {
    try {
        const data = await destinazioniService.getByCliente(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const data = await destinazioniService.getById(req.params.id, req.params.destId);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const data = await destinazioniService.create(req.params.id, req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const data = await destinazioniService.update(req.params.id, req.params.destId, req.body);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await destinazioniService.remove(req.params.id, req.params.destId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getByCliente,
    getById,
    create,
    update,
    remove
};
