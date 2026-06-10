const utentiService = require('../services/utentiService');

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

module.exports = { resetPassword };
