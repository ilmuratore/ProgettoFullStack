const movimentiStockService = require('../services/movimenti_stockService');


// GET /api/v1/movimenti-stock
const getAll = async (req, res, next) => {
    try {
        const movimenti = await movimentiStockService.getAll();

        return res.status(200).json({
            status: 'success',
            data: movimenti
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/movimenti-stock/:id
const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const movimento = await movimentiStockService.getById(id);

        return res.status(200).json({
            status: 'success',
            data: movimento
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/movimenti-stock/prodotto/:prodotto_id
const getByProdottoId = async (req, res, next) => {
    try {
        const prodotto_id = parseInt(req.params.prodotto_id, 10);
        const movimenti = await movimentiStockService.getByProdottoId(prodotto_id);

        return res.status(200).json({
            status: 'success',
            data: movimenti
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/movimenti-stock/ubicazione/:ubicazione_id
const getByUbicazioneId = async (req, res, next) => {
    try {
        const ubicazione_id = parseInt(req.params.ubicazione_id, 10);
        const movimenti = await movimentiStockService.getByUbicazioneId(ubicazione_id);

        return res.status(200).json({
            status: 'success',
            data: movimenti
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/movimenti-stock/tipo/:movimento_tipo
const getByTipo = async (req, res, next) => {
    try {
        const { movimento_tipo } = req.params;
        const movimenti = await movimentiStockService.getByTipo(movimento_tipo);

        return res.status(200).json({
            status: 'success',
            data: movimenti
        });
    } catch (err) {
        return next(err);
    }
};


// GET /api/v1/movimenti-stock/riferimento/:riferimento
const getByRiferimento = async (req, res, next) => {
    try {
        const { riferimento } = req.params;
        const movimenti = await movimentiStockService.getByRiferimento(riferimento);

        return res.status(200).json({
            status: 'success',
            data: movimenti
        });
    } catch (err) {
        return next(err);
    }
};


// POST /api/v1/movimenti-stock
const create = async (req, res, next) => {
    try {
        const { prodotto_id, ubicazione_id, ubicazione_da_id, ubicazione_a_id, quantita, movimento_tipo, riferimento, note } = req.body;

        const movimenti = await movimentiStockService.create({
            prodotto_id,
            ubicazione_id,
            ubicazione_da_id,
            ubicazione_a_id,
            quantita,
            movimento_tipo,
            riferimento,
            note
        });

        return res.status(201).json({
            status: 'success',
            data: movimenti
        });
    } catch (err) {
        return next(err);
    }
};


module.exports = {
    getAll,
    getById,
    getByProdottoId,
    getByUbicazioneId,
    getByTipo,
    getByRiferimento,
    create
};
