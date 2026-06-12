const ricezioniService = require('../services/ricezioniService');

const getAll = async (req, res, next) => {
    try {
        const data = await ricezioniService.getAll();
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const data = await ricezioniService.getById(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getRighe = async (req, res, next) => {
    try {
        const data = await ricezioniService.getRighe(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const data = await ricezioniService.create(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const addRiga = async (req, res, next) => {
    try {
        const data = await ricezioniService.addRiga(req.params.id, req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getPdf = async (req, res, next) => {
    try {
        const result = await ricezioniService.generaPdfRicezione(req.params.id);
        const disposition = req.query.download === '1' ? 'attachment' : 'inline';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="${result.filename}"`);
        res.setHeader('Content-Length', result.buffer.length);
        res.end(result.buffer);
    } catch (err) { next(err); }
};

module.exports = {
    getAll,
    getById,
    getRighe,
    getPdf,
    create,
    addRiga
};
