const aziendaSettingsService = require('../services/aziendaSettingsService');

const get = async (req, res, next) => {
    try {
        const settings = await aziendaSettingsService.get();
        return res.status(200).json({ status: 'success', data: settings });
    } catch (err) {
        return next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const settings = await aziendaSettingsService.update(req.body);
        return res.status(200).json({ status: 'success', data: settings });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    get,
    update,
};
