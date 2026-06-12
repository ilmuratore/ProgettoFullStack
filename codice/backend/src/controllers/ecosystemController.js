const ecosystemService = require('../services/ecosystemService');

const search = async (req, res, next) => {
    try {
        const data = await ecosystemService.search(req.query.q);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getSchedaFornitore = async (req, res, next) => {
    try {
        const data = await ecosystemService.getSchedaFornitore(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getCatalogoFornitore = async (req, res, next) => {
    try {
        const data = await ecosystemService.getCatalogoFornitore(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getSchedaProdotto = async (req, res, next) => {
    try {
        const data = await ecosystemService.getSchedaProdotto(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

const getDisponibilitaProdotto = async (req, res, next) => {
    try {
        const data = await ecosystemService.getDisponibilitaProdotto(req.params.id);
        res.json({ status: 'success', data });
    } catch (err) { next(err); }
};

module.exports = { search, getSchedaFornitore, getCatalogoFornitore, getSchedaProdotto, getDisponibilitaProdotto };
