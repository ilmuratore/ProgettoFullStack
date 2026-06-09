const ubicazioniService = require('../services/ubicazioniService');

const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const ubicazione = await ubicazioniService.getById(id);
        return res.status(200).json({ status: 'success', data: ubicazione });
    } catch (err) {
        return next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const magazzino_id = parseInt(req.params.magId, 10);
        const ubicazione = await ubicazioniService.create(magazzino_id, req.body);
        return res.status(201).json({ status: 'success', data: ubicazione });
    } catch (err) {
        return next(err);
    }
};

const updateTemperatura = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const ubicazione = await ubicazioniService.updateTemperatura(
            id, req.body.temperatura_controllata
        );
        return res.status(200).json({ status: 'success', data: ubicazione });
    } catch (err) {
        return next(err);
    }
};

const toggleAttivo = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const ubicazione = await ubicazioniService.toggleAttivo(id);
        return res.status(200).json({ status: 'success', data: ubicazione });
    } catch (err) {
        return next(err);
    }
};

module.exports = { getById, create, updateTemperatura, toggleAttivo };
