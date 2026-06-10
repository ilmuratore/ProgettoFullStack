const jwt = require('jsonwebtoken');
const utentiModel = require('../models/utentiModel');

const auth = async (req, res, next) => {
    try {
        const header = req.headers['authorization'];

        if (!header || !header.startsWith('Bearer ')) {
            const err = new Error('Token mancante o non valido');
            err.code = 'AUTH_REQUIRED';
            err.status = 401;
            throw err;
        }

        const token = header.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            const err = new Error('Token non valido o scaduto');
            err.code = 'AUTH_REQUIRED';
            err.status = 401;
            throw err;
        }

        const result = await utentiModel.findById(decoded.id);
        const utente = result.rows[0];

        if (!utente) {
            const err = new Error('Utente non più valido');
            err.code = 'AUTH_REQUIRED';
            err.status = 401;
            throw err;
        }

        if (!utente.attivo) {
            const err = new Error('Utente disabilitato');
            err.code = 'UTENTE_DISABILITATO';
            err.status = 401;
            throw err;
        }

        req.user = {
            id: utente.id,
            email: utente.email,
            ruolo_id: utente.ruolo_id,
            ruolo: utente.ruolo
        };

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { auth };
