const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
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

        // Verifica token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Payload obbligatorio
        // { id, email, ruolo_id, ruolo }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            ruolo_id: decoded.ruolo_id,
            ruolo: decoded.ruolo
        };

        return next();

    } catch (err) {
        return res.status(401).json({
            status: 'error',
            code: 'AUTH_REQUIRED',
            message: 'Autenticazione richiesta'
        });
    }
};
