const express = require('express');
const categorieController = require('../controllers/categorieController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const {validate} = require('../middleware/validate');

const router = express.Router();
const createBlueprint = {
    nome: { required: true, type: 'string', minLength: 1 },
    categoria_padre_id: { required: false, type: 'number', integer: true, min: 1 },
};

const updateBlueprint = {
    nome: { required: false, type: 'string', minLength: 1 },
    categoria_padre_id: { required: false, type: 'number', integer: true, min: 1 },
};

router.get('/', auth, requirePermesso('prodotti:read'), categorieController.getAll);
router.post('/', auth, requirePermesso('prodotti:write'), validate(createBlueprint), categorieController.create);
router.get('/:id', auth, requirePermesso('prodotti:read'), categorieController.getById);
router.patch('/:id', auth, requirePermesso('prodotti:write'), validate(updateBlueprint), categorieController.update);
router.delete('/:id', auth, requirePermesso('prodotti:delete'), categorieController.elimina);

module.exports = router;
