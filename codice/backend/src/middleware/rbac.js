const rbacService = require('../services/rbacService');

const requirePermesso = (codice_permesso) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.ruolo_id) {
                const err = new Error('Accesso negato');
                err.code = 'ACCESS_DENIED';
                err.status = 403;
                throw err;
            }

            const allowed = await rbacService.checkPermesso(req.user.ruolo_id, codice_permesso);

            if (!allowed) {
                const err = new Error('Accesso negato');
                err.code = 'ACCESS_DENIED';
                err.status = 403;
                throw err;
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = { requirePermesso };
