const express = require('express');
const prodottiController = require('../controllers/prodottiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    nome: { required: true, type: 'string' },
    sku: { required: true, type: 'string' },
    descrizione: { required: false, type: 'string' },
    prezzo: { required: true, type: 'number', min: 0.01 },
    categoria_id: { required: false, type: 'number', integer: true, min: 1 },
    unita_misura: { required: false, type: 'string' },
    peso_kg: { required: false, type: 'number', min: 0 },
    scorta_minima: { required: false, type: 'number', integer: true, min: 0 },
    attivo: { required: false, type: 'boolean' },
};

const updateBlueprint = {
    nome: { required: false, type: 'string' },
    sku: { required: false, type: 'string' },
    descrizione: { required: false, type: 'string' },
    prezzo: { required: false, type: 'number', min: 0.01 },
    categoria_id: { required: false, type: 'number', integer: true, min: 1 },
    unita_misura: { required: false, type: 'string' },
    peso_kg: { required: false, type: 'number', min: 0 },
    scorta_minima: { required: false, type: 'number', integer: true, min: 0 },
    attivo: { required: false, type: 'boolean' },
};

router.get('/', auth, requirePermesso('prodotti:read'), prodottiController.getAll);
router.post('/', auth, requirePermesso('prodotti:write'), validate(createBlueprint), prodottiController.create);
router.get('/:id', auth, requirePermesso('prodotti:read'), prodottiController.getById);
router.patch('/:id', auth, requirePermesso('prodotti:write'), validate(updateBlueprint), prodottiController.update);
router.delete('/:id', auth, requirePermesso('prodotti:delete'), prodottiController.elimina);

module.exports = router;
