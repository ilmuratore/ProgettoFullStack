const express = require('express');
const dipendentiController = require('../controllers/dipendentiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();
const createBlueprint = {
    nome: { required: true, type: 'string' },
    cognome: { required: true, type: 'string' },
    codice_fiscale: { required: true, type: 'string' },
    ruolo_operativo: { required: false, type: 'string' },
    data_assunzione: { required: false, type: 'string' },
    utente_id: { required: false, type: 'number' }
};

const updateBlueprint = {
    nome: { required: false, type: 'string' },
    cognome: { required: false, type: 'string' },
    codice_fiscale: { required: false, type: 'string' },
    ruolo_operativo: { required: false, type: 'string' },
    data_assunzione: { required: false, type: 'string' },
    utente_id: { required: false, type: 'number' }
};

router.get('/', auth, requirePermesso('dipendenti:read'), dipendentiController.getAll);
router.post('/', auth, requirePermesso('dipendenti:write'), validate(createBlueprint), dipendentiController.create);
router.get('/:id', auth, requirePermesso('dipendenti:read'), dipendentiController.getById);
router.patch('/:id', auth, requirePermesso('dipendenti:write'), validate(updateBlueprint), dipendentiController.update);
router.delete('/:id', auth, requirePermesso('dipendenti:delete'), dipendentiController.elimina);

module.exports = router;
