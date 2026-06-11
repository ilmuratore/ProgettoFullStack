const notificheService = require('../services/notificheService');

const getAll = async (req, res, next) => {
    try {
        const data = await notificheService.listByUtente(req.user.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const data = await notificheService.markAsRead(req.params.id, req.user.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const data = await notificheService.markAllAsRead(req.user.id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAll,
    markAsRead,
    markAllAsRead
};
