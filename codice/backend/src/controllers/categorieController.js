const categorieService = require('../services/categorieService');

const getAll = async (req, res, next) => {
    try {
        const categorie = await categorieService.getAll();
        return res.status(200).json({ status: 'success', data: categorie });
    } catch (err) {
        return next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const categoria = await categorieService.getById(id);
        return res.status(200).json({ status: 'success', data: categoria });
    } catch (err) {
        return next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const { nome, categoria_padre_id } = req.body;
        const categoria = await categorieService.create({ nome, categoria_padre_id });
        return res.status(201).json({ status: 'success', data: categoria });
    } catch (err) {
        return next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const id     = parseInt(req.params.id, 10);
        const { nome, categoria_padre_id } = req.body;

        const fields = {};
        if (nome              !== undefined) fields.nome              = nome;
        if ('categoria_padre_id' in req.body) fields.categoria_padre_id = categoria_padre_id;

        const categoria = await categorieService.update(id, fields);
        return res.status(200).json({ status: 'success', data: categoria });
    } catch (err) {
        return next(err);
    }
};

const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        await categorieService.deleteCategoria(id);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = { getAll, getById, create, update, elimina };
