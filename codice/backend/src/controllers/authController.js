const authService = require('../services/authService');


// POST /api/v1/auth/login
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


// POST /api/v1/auth/register
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


// GET /api/v1/auth/me
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


module.exports = {
    login,
    register,
    getMe
};
