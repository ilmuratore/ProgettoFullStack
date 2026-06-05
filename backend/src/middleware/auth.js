const jwt = require('jsonwebtoken');
const utentiModel = require('../models/utentiModel');

module.exports = async (req, res, next) => {
    const header = req.headers['authorization'];

    // Nessun header → 401
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            code: 'AUTH_REQUIRED',
            message: 'Token mancante o non valido'
        });
    }

    const token = header.split(' ')[1];

    // 1) Verifica firma/scadenza del token
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

    // 2) Rilettura utente dal DB: ruolo sempre fresco + check stato attuale
    try {
        const result = await utentiModel.findById(decoded.id);
        const utente = result.rows[0];

        // L'utente non esiste più (eliminato dopo l'emissione del token)
        if (!utente) {
            return res.status(401).json({
                status: 'error',
                code: 'AUTH_REQUIRED',
                message: 'Utente non più valido'
            });
        }

        // Disabilitato dopo l'emissione del token → sessione non più valida
        if (!utente.attivo) {
            return res.status(401).json({
                status: 'error',
                code: 'UTENTE_DISABILITATO',
                message: 'Utente disabilitato'
            });
        }

        // req.user con stato AGGIORNATO dal DB (ruolo_id fresco anche se cambiato dopo il login)
        req.user = {
            id: utente.id,
            email: utente.email,
            ruolo_id: utente.ruolo_id,
            ruolo: utente.ruolo
        };

        return next();

    } catch (err) {
        // Errore DB reale → 500, non mascherarlo da 401
        return res.status(500).json({
            status: 'error',
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Errore interno'
        });
    }
};