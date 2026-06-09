const authService = require('../services/authService');


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        return res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (err) {
        return next(err);
    }
};


const register = async (req, res, next) => {
    try {
        const utente = await authService.register(req.body);

        return res.status(201).json({
            status: 'success',
            data: utente
        });
    } catch (err) {
        return next(err);
    }
};


const getMe = async (req, res, next) => {
    try {
        const utente = await authService.getMe(req.user.id);

        return res.status(200).json({
            status: 'success',
            data: utente
        });
    } catch (err) {
        return next(err);
    }
};


const changePassword = async (req, res, next) => {
    try {
        const { password_attuale, password_nuova } = req.body;
        await authService.changePassword(req.user.id, password_attuale, password_nuova);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};


module.exports = {
    login,
    register,
    getMe,
    changePassword
};
