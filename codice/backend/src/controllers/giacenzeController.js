const giacenzeService = require('../services/giacenzeService');


// GET /api/v1/giacenze
const getAll = async (req, res, next) => {
    try {
        const giacenze = await giacenzeService.getAll();

        return res.status(200).json({
            status: 'success',
            data: giacenze
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/giacenze/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const giacenza = await giacenzeService.getById(id);

        return res.status(200).json({
            status: 'success',
            data: giacenza
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/giacenze/prodotto/:prodotto_id
const getByProdottoId = async (req, res, next) => {
    try {
        const prodotto_id = parseInt(req.params.prodotto_id, 10);
        const giacenze = await giacenzeService.getByProdottoId(prodotto_id);

        return res.status(200).json({
            status: 'success',
            data: giacenze
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/giacenze/ubicazione/:ubicazione_id
const getByUbicazioneId = async (req, res, next) => {
    try {
        const ubicazione_id = parseInt(req.params.ubicazione_id, 10);
        const giacenze = await giacenzeService.getByUbicazioneId(ubicazione_id);

        return res.status(200).json({
            status: 'success',
            data: giacenze
        });
    } catch (err) {
        return next(err);
    }
};


// POST /api/v1/giacenze
const create = async (req, res, next) => {
    try {
        const { prodotto_id, ubicazione_id, quantita } = req.body;

        const giacenza = await giacenzeService.create({
            prodotto_id,
            ubicazione_id,
            quantita
        });

        return res.status(201).json({
            status: 'success',
            data: giacenza
        });
    } catch (err) {
        return next(err);
    }
};


// PATCH /api/v1/giacenze/:id
const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { prodotto_id, ubicazione_id, quantita } = req.body;

        const fields = {};
        if (prodotto_id !== undefined) fields.prodotto_id = prodotto_id;
        if (ubicazione_id !== undefined) fields.ubicazione_id = ubicazione_id;
        if (quantita !== undefined) fields.quantita = quantita;

        const giacenza = await giacenzeService.update(id, fields);

        return res.status(200).json({
            status: 'success',
            data: giacenza
        });
    } catch (err) {
        return next(err);
    }
};


// DELETE /api/v1/giacenze/:id
const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        await giacenzeService.remove(id);

        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};


module.exports = {
    getAll,
    getById,
    getByProdottoId,
    getByUbicazioneId,
    create,
    update,
    elimina
};
