const authService = require('../services/authService');


const errorMessages = {
    VALIDATION_ERROR: 'Dati richiesta non validi',
    AUTH_REQUIRED: 'Autenticazione richiesta',
    CREDENZIALI_NON_VALIDE: 'Credenziali non valide',
    UTENTE_DISABILITATO: 'Utente disabilitato',
    ACCESS_DENIED: 'Accesso negato',
    EMAIL_GIA_ESISTENTE: 'Email già esistente',
    RUOLO_NON_VALIDO: 'Ruolo non valido',
    UTENTE_NON_TROVATO: 'Utente non trovato'
};

const errorStatusCodes = {
    VALIDATION_ERROR: 400,
    AUTH_REQUIRED: 401,
    CREDENZIALI_NON_VALIDE: 401,
    UTENTE_DISABILITATO: 401,
    ACCESS_DENIED: 403,
    EMAIL_GIA_ESISTENTE: 409,
    RUOLO_NON_VALIDO: 422,
    UTENTE_NON_TROVATO: 404
};

const sendErrorResponse = (res, err) => {
    const code = err.code || err.message || 'INTERNAL_SERVER_ERROR';
    const statusCode = err.statusCode || errorStatusCodes[code] || 500;
    const message = errorMessages[code] || err.message || 'Errore interno del server';

    const payload = {
        status: 'error',
        code,
        message
    };

    if (code === 'VALIDATION_ERROR' && err.details) {
        payload.details = err.details;
    }

    return res.status(statusCode).json(payload);
};


// POST /api/v1/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        return res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (err) {
        return sendErrorResponse(res, err);
    }
};


// POST /api/v1/auth/register
const register = async (req, res) => {
    try {
        const utente = await authService.register(req.body);

        return res.status(201).json({
            status: 'success',
            data: utente
        });
    } catch (err) {
        return sendErrorResponse(res, err);
    }
};


// GET /api/v1/auth/me
const getMe = async (req, res) => {
    try {
        const utente = await authService.getMe(req.user.id);

        return res.status(200).json({
            status: 'success',
            data: utente
        });
    } catch (err) {
        return sendErrorResponse(res, err);
    }
};


module.exports = {
    login,
    register,
    getMe
};
