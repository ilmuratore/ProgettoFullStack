const express = require('express');
const utentiController = require('../controllers/utentiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const resetPasswordBlueprint = {
    password_nuova: { required: true, type: 'string', minLength: 6 }
};

const updateBlueprint = {
    nome: { required: false, type: 'string', minLength: 1 },
    cognome: { required: false, type: 'string', minLength: 1 },
    email: { required: false, type: 'string', minLength: 3 },
    ruolo_id: { required: false, type: 'number', integer: true, min: 1 },
    attivo: { required: false, type: 'boolean' },
    dipendente_id: { required: false, type: 'number', integer: true, min: 1 },
};

router.get('/', auth, requirePermesso('utenti:read'), utentiController.getAll);
router.get('/ruoli', auth, requirePermesso('utenti:read'), utentiController.getRuoli);
router.get('/:id', auth, requirePermesso('utenti:read'), utentiController.getById);
router.patch('/:id', auth, requirePermesso('utenti:write'), validate(updateBlueprint), utentiController.update);
router.patch('/:id/password', auth, requirePermesso('utenti:write'), validate(resetPasswordBlueprint), utentiController.resetPassword);
router.delete('/:id', auth, requirePermesso('utenti:delete'), utentiController.elimina);

module.exports = router;
