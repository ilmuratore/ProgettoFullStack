const magazziniService = require('../services/magazziniService');

// GET /api/v1/magazzini
const getAll = async (_req, res, next) => {
    try {
        const magazzini = await magazziniService.getAll();
        return res.status(200).json({ status: 'success', data: magazzini });
    } catch (err) {
        return next(err);
    }
};

// GET /api/v1/magazzini/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const magazzino = await magazziniService.getById(id);
        return res.status(200).json({ status: 'success', data: magazzino });
    } catch (err) {
        return next(err);
    }
};

// POST /api/v1/magazzini
const create = async (req, res, next) => {
    try {
        const magazzino = await magazziniService.create(req.body);
        return res.status(201).json({ status: 'success', data: magazzino });
    } catch (err) {
        return next(err);
    }
};

// PATCH /api/v1/magazzini/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const magazzino = await magazziniService.update(id, req.body);
        return res.status(200).json({ status: 'success', data: magazzino });
    } catch (err) {
        return next(err);
    }
};

// PATCH /api/v1/magazzini/:id/toggle
const toggleAttivo = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const magazzino = await magazziniService.toggleAttivo(id);
        return res.status(200).json({ status: 'success', data: magazzino });
    } catch (err) {
        return next(err);
    }
};

module.exports = { getAll, getById, create, update, toggleAttivo };
