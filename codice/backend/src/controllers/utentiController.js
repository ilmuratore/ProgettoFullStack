const utentiService = require('../services/utentiService');

const getAll = async (_req, res, next) => {
    try {
        const utenti = await utentiService.getAll();
        return res.status(200).json({ status: 'success', data: utenti });
    } catch (err) {
        return next(err);
    }
};

const getRuoli = async (_req, res, next) => {
    try {
        const ruoli = await utentiService.getRuoli();
        return res.status(200).json({ status: 'success', data: ruoli });
    } catch (err) {
        return next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const utente = await utentiService.getById(id);
        return res.status(200).json({ status: 'success', data: utente });
    } catch (err) {
        return next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const utente = await utentiService.update(id, req.body, req.user);
        return res.status(200).json({ status: 'success', data: utente });
    } catch (err) {
        return next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { password_nuova } = req.body;
        await utentiService.resetPassword(id, password_nuova);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const elimina = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        await utentiService.deleteUtente(id, req.user);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getAll,
    getRuoli,
    getById,
    update,
    resetPassword,
    elimina,
};
