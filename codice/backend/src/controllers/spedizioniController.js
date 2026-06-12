const spedizioniService = require('../services/spedizioniService');

const getAll = async (_req, res, next) => {
    try {
        const data = await spedizioniService.list();
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
    try {
        const data = await spedizioniService.getById(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const data = await spedizioniService.create(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
};

const updateStato = async (req, res, next) => {
    try {
        const data = await spedizioniService.updateStato(req.params.id, req.body.stato);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const updateTracking = async (req, res, next) => {
    try {
        const data = await spedizioniService.updateTracking(req.params.id, req.body.tracking_number);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getDdt = async (req, res, next) => {
    try {
        const data = await spedizioniService.getDdt(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const createDdt = async (req, res, next) => {
    try {
        const data = await spedizioniService.createDdt(req.params.id, req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
};

const updateDdt = async (req, res, next) => {
    try {
        const data = await spedizioniService.updateDdt(req.params.id, req.body);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getPdfDdt = async (req, res, next) => {
    try {
        const result = await spedizioniService.generaPdfDdt(req.params.id);
        const disposition = req.query.download === '1' ? 'attachment' : 'inline';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="${result.filename}"`);
        res.setHeader('Content-Length', result.buffer.length);
        res.end(result.buffer);
    } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStato, updateTracking, getDdt, createDdt, updateDdt, getPdfDdt };
