const express = require('express');
const utentiController = require('../controllers/utentiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const resetPasswordBlueprint = {
    password_nuova: { required: true, type: 'string', minLength: 6 }
};

router.get('/', auth, requirePermesso('utenti:read'), (_req, _res, next) => {
    const err = new Error('Endpoint non implementato: il modulo utenti espone solo il reset password admin');
    err.code = 'RESOURCE_NOT_FOUND';
    err.status = 404;
    next(err);
});

router.patch('/:id/password', auth, requirePermesso('utenti:write'), validate(resetPasswordBlueprint), utentiController.resetPassword);

module.exports = router;
