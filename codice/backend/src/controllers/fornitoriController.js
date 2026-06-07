const fornitoriService = require("../services/fornitoriService");


// GET /api/v1/fornitori
const getAll = async (req, res, next) => {
    try {
        const fornitori = await fornitoriService.getAll();

        return res.status(200).json({
            status: "success",
            data: fornitori
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/fornitori/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const fornitore = await fornitoriService.getById(id);

        return res.status(200).json({
            status: "success",
            data: fornitore
        });
    } catch (err) {
        return next(err);
    }
};


// POST /api/v1/fornitori
const create = async (req, res, next) => {
    try {
        const { ragione_sociale, piva, indirizzo, email, telefono, sito_web, descrizione_aziendale } = req.body;

        const fornitore = await fornitoriService.create({
            ragione_sociale,
            piva,
            indirizzo,
            email,
            telefono,
            sito_web,
            descrizione_aziendale
        });

        return res.status(201).json({
            status: "success",
            data: fornitore
        });
    } catch (err) {
        return next(err);
    }
};


// PATCH /api/v1/fornitori/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { ragione_sociale, piva, indirizzo, email, telefono, sito_web, descrizione_aziendale } = req.body;
        const fields = {};
        if (ragione_sociale !== undefined) fields.ragione_sociale = ragione_sociale;
        if (piva !== undefined) fields.piva = piva;
        if (indirizzo !== undefined) fields.indirizzo = indirizzo;
        if (email !== undefined) fields.email = email;
        if (telefono !== undefined) fields.telefono = telefono;
        if (sito_web !== undefined) fields.sito_web = sito_web;
        if (descrizione_aziendale !== undefined) fields.descrizione_aziendale = descrizione_aziendale;

        const fornitore = await fornitoriService.update(id, fields);

        return res.status(200).json({
            status: "success",
            data: fornitore
        });
    } catch (err) {
        return next(err);
    }
};


// DELETE /api/v1/fornitori/:id
const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        await fornitoriService.deleteFornitore(id);

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
