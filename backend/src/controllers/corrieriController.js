// ============================================================
// corrieriController.js — M05: Anagrafiche Corrieri
// Estrae parametri, chiama il service, costruisce la response.
// Nessuna business logic — tutto nel service.
// ============================================================

const corrieriService = require('../services/corrieriService');

// GET /api/v1/corrieri
const getAll = async (req, res, next) => {
    try {
        const corrieri = await corrieriService.getAll();
        return res.status(200).json({ status: 'success', data: corrieri });
    } catch (err) {
        return next(err);
    }
};

// GET /api/v1/corrieri/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const corriere = await corrieriService.getById(id);
        return res.status(200).json({ status: 'success', data: corriere });
    } catch (err) {
        return next(err);
    }
};

// POST /api/v1/corrieri
const create = async (req, res, next) => {
    try {
        const { codice, nome, telefono, email } = req.body;
        const corriere = await corrieriService.create({ codice, nome, telefono, email });
        return res.status(201).json({ status: 'success', data: corriere });
    } catch (err) {
        return next(err);
    }
};

// PATCH /api/v1/corrieri/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { codice, nome, telefono, email } = req.body;

        // PATCH parziale: solo i campi presenti nel body
        const fields = {};
        if (codice   !== undefined) fields.codice   = codice;
        if (nome     !== undefined) fields.nome     = nome;
        if (telefono !== undefined) fields.telefono = telefono;
        if (email    !== undefined) fields.email    = email;

        const corriere = await corrieriService.update(id, fields);
        return res.status(200).json({ status: 'success', data: corriere });
    } catch (err) {
        return next(err);
    }
};

// DELETE /api/v1/corrieri/:id
const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        await corrieriService.deleteCorriere(id);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = { getAll, getById, create, update, elimina };
