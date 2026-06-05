const prodottiService = require('../services/prodottiService');


// GET /api/v1/prodotti
const getAll = async (req, res, next) => {
    try {
        const prodotti = await prodottiService.getAll();

        return res.status(200).json({
            status: 'success',
            data: prodotti
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/prodotti/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const prodotto = await prodottiService.getById(id);

        return res.status(200).json({
            status: 'success',
            data: prodotto
        });
    } catch (err) {
        return next(err);
    }
};


// POST /api/v1/prodotti
const create = async (req, res, next) => {
    try {
        const { nome, sku, prezzo } = req.body;
        const prodotto = await prodottiService.create({ nome, sku, prezzo });

        return res.status(201).json({
            status: 'success',
            data: prodotto
        });
    } catch (err) {
        return next(err);
    }
};


// PATCH /api/v1/prodotti/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome, sku, prezzo } = req.body;
        const prodotto = await prodottiService.update(id, { nome, sku, prezzo });

        return res.status(200).json({
            status: 'success',
            data: prodotto
        });
    } catch (err) {
        return next(err);
    }
};


// DELETE /api/v1/prodotti/:id
const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        await prodottiService.delete(id);

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
