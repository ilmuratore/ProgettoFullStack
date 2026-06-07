const rbacService = require('../services/rbacService');

const requirePermesso = (codice_permesso) => {
    return async (req, res, next) => {
        try {
            const ruolo_id = req.user?.ruolo_id;

            if (!ruolo_id) {
                return res.status(403).json({
                    status: 'error',
                    code: 'ACCESS_DENIED',
                    message: 'Accesso negato'
                });
            }

            const allowed = await rbacService.checkPermesso(ruolo_id, codice_permesso);

            if (!allowed) {
                return res.status(403).json({
                    status: 'error',
                    code: 'ACCESS_DENIED',
                    message: 'Accesso negato'
                });
            }

            return next();

        } catch (err) {
            return res.status(403).json({
                status: 'error',
                code: 'ACCESS_DENIED',
                message: 'Accesso negato'
            });
        }
    };
};

module.exports = { requirePermesso };
