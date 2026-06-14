const express = require('express');
const corrieriController = require('../controllers/corrieriController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    codice: { required: true, type: 'string' },
    utente_id: { required: false, type: 'number', integer: true, min: 1 },
    nome: { required: true, type: 'string' },
    telefono: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
};

const updateBlueprint = {
    codice: { required: false, type: 'string' },
    utente_id: { required: false, type: 'number', integer: true, min: 1 },
    nome: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
};

router.get('/', auth, requirePermesso('magazzino:read'), corrieriController.getAll);
router.post('/', auth, requirePermesso('magazzino:write'), validate(createBlueprint), corrieriController.create);
router.get('/:id', auth, requirePermesso('magazzino:read'), corrieriController.getById);
router.patch('/:id', auth, requirePermesso('magazzino:write'), validate(updateBlueprint), corrieriController.update);
router.delete('/:id', auth, requirePermesso('magazzino:write'), corrieriController.elimina);

module.exports = router;
