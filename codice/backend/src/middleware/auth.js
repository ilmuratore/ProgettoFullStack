const jwt = require('jsonwebtoken');
const utentiModel = require('../models/utentiModel');

module.exports = async (req, res, next) => {
    const header = req.headers['authorization'];

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            code: 'AUTH_REQUIRED',
            message: 'Token mancante o non valido'
        });
    }

    const token = header.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            code: 'AUTH_REQUIRED',
            message: 'Token non valido o scaduto'
        });
    }
    try {
        const result = await utentiModel.findById(decoded.id);
        const utente = result.rows[0];

        if (!utente) {
            return res.status(401).json({
                status: 'error',
                code: 'AUTH_REQUIRED',
                message: 'Utente non più valido'
            });
        }

        if (!utente.attivo) {
            return res.status(401).json({
                status: 'error',
                code: 'UTENTE_DISABILITATO',
                message: 'Utente disabilitato'
            });
        }
        req.user = {
            id: utente.id,
            email: utente.email,
            ruolo_id: utente.ruolo_id,
            ruolo: utente.ruolo
        };

        return next();

    } catch (err) {
        return res.status(500).json({
            status: 'error',
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Errore interno'
        });
    }
};