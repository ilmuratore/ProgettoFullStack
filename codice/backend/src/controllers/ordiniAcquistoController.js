const ordiniAcquistoService = require('../services/ordiniAcquistoService');

const getAll = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoService.getAll(req.query);
        res.json({ status: 'success', data: result.rows || result });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoService.getOrdineAcquistoById(req.params.id);
        res.json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};


const getPdf = async (req, res, next) => {
    try {
        const { buffer, filename } = await ordiniAcquistoService.generaPdfOrdineAcquisto(
            req.params.id
        );

        const disposition = req.query.download === '1' ? 'attachment' : 'inline';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const data = { ...req.body, utente_id: req.user.id };

        const result = await ordiniAcquistoService.createOrdineAcquisto(data);
        res.status(201).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoService.updateOrdineAcquisto(
            req.params.id,
            req.body
        );
        res.json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};

const updateStato = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoService.updateStatoOrdineAcquisto(
            req.params.id,
            req.body.stato
        );
        res.json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};

const addRiga = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoService.addRigaOrdineAcquisto(
            req.params.id,
            req.body
        );
        res.status(201).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};

const createRicezione = async (req, res, next) => {
    try {
        const data = { ...req.body, utente_id: req.user.id };

        const result = await ordiniAcquistoService.createRicezione(data);
        res.status(201).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};


const listRicezioni = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoService.listRicezioniByOrdine(
            req.params.id
        );
        res.json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};


module.exports = {
    getAll,
    getById,
    getPdf,
    create,
    update,
    updateStato,
    addRiga,
    createRicezione,
    listRicezioni,
};
