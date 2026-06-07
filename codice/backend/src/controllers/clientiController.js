const clientiService = require('../services/clientiService');

// GET /api/v1/clienti
const getAll = async (req, res, next) => {
    try {
        const clienti = await clientiService.getAll();

        return res.status(200).json({
            status: 'success',
            data: clienti
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/clienti/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const cliente = await clientiService.getById(id);

        return res.status(200).json({
            status: 'success',
            data: cliente
        });
    } catch (err) {
        return next(err);
    }
};


// POST /api/v1/clienti
const create = async (req, res, next) => {
    try {
        const { ragione_sociale, piva_cf, email, telefono } = req.body;

        const cliente = await clientiService.create({
            ragione_sociale,
            piva_cf,
            email,
            telefono
        });

        return res.status(201).json({
            status: 'success',
            data: cliente
        });
    } catch (err) {
        return next(err);
    }
};


// PATCH /api/v1/clienti/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        const { ragione_sociale, piva_cf, email, telefono } = req.body;
        const fields = {};
        if (ragione_sociale !== undefined) fields.ragione_sociale = ragione_sociale;
        if (piva_cf          !== undefined) fields.piva_cf         = piva_cf;
        if (email            !== undefined) fields.email           = email;
        if (telefono         !== undefined) fields.telefono        = telefono;

        const cliente = await clientiService.update(id, fields);

        return res.status(200).json({
            status: 'success',
            data: cliente
        });
    } catch (err) {
        return next(err);
    }
};


// DELETE /api/v1/clienti/:id
const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        await clientiService.deleteCliente(id);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    elimina
};
