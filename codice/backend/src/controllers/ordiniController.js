const ordiniService = require('../services/ordiniService');
const { buildOrdiniVenditaExcel } = require('../excel/ordiniVenditaExcel');

const getAll = async (req, res, next) => {
    try {
        const data = await ordiniService.getAll(req.query);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const data = await ordiniService.getById(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getDisponibilita = async (req, res, next) => {
    try {
        const data = await ordiniService.getDisponibilita(req.params.prodotto_id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const exportExcel = async (req, res, next) => {
    try {
        const { buffer, filename } = await buildOrdiniVenditaExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const data = await ordiniService.create({ ...req.body, utente_id: req.user.id });
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const data = await ordiniService.update(req.params.id, req.body);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const updateStato = async (req, res, next) => {
    try {
        const data = await ordiniService.updateStato(req.params.id, req.body.stato);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const updateStatoPicking = async (req, res, next) => {
    try {
        const data = await ordiniService.updateStatoPicking(
            req.params.id,
            req.body.stato_picking,
            req.body.prelievi
        );
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const getPdf = async (req, res, next) => {
    try {
        const result = await ordiniService.generaPdfOrdineVendita(req.params.id);
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
    getDisponibilita,
    getPdf,
    exportExcel,
    create,
    update,
    updateStato,
    updateStatoPicking
};
