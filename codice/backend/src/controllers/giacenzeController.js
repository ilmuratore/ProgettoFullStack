const giacenzeService = require('../services/giacenzeService');

const getByProdottoId = async (req, res, next) => {
    try {
        const prodotto_id = parseInt(req.params.prodotto_id, 10);
        const giacenze = await giacenzeService.getByProdottoId(prodotto_id);
        return res.status(200).json({ status: 'success', data: giacenze });
    } catch (err) {
        return next(err);
    }
};

module.exports = { getByProdottoId };
