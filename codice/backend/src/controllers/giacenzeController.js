const giacenzeService = require('../services/giacenzeService');

const getAll = async (req, res, next) => {
    try {
        const giacenze = await giacenzeService.getAll(req.query);
        return res.status(200).json({ status: 'success', data: giacenze });
    } catch (err) {
        return next(err);
    }
};

const getByProdottoId = async (req, res, next) => {
    try {
        const prodotto_id = parseInt(req.params.prodotto_id, 10);
        const giacenze = await giacenzeService.getByProdottoId(prodotto_id);
        return res.status(200).json({ status: 'success', data: giacenze });
    } catch (err) {
        return next(err);
    }
};

module.exports = { getAll, getByProdottoId };