const express = require('express');
const utentiController = require('../controllers/utentiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const resetPasswordBlueprint = {
    password_nuova: { required: true, type: 'string', minLength: 6 }
};

router.patch('/:id/password', auth, requirePermesso('utenti:write'), validate(resetPasswordBlueprint), utentiController.resetPassword);

module.exports = router;
