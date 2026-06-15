const express = require('express');
const router = express.Router({ mergeParams: true });

const contattiController = require('../controllers/contattiFornitoriController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const {validate} = require('../middleware/validate');

const createBlueprint = {
    nome: { required: true, type: 'string', minLength: 1 },
    ruolo: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};

const updateBlueprint = {
    nome: { required: false, type: 'string', minLength: 1 },
    ruolo: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};

router.get(
    '/',
    auth,
    requirePermesso('fornitori:read'),
    contattiController.getByFornitoreId
);

router.get(
    '/:contattoId',
    auth,
    requirePermesso('fornitori:read'),
    contattiController.getById
);

router.post(
    '/',
    auth,
    requirePermesso('fornitori:write'),
    validate(createBlueprint),
    contattiController.create
);

router.patch(
    '/:contattoId',
    auth,
    requirePermesso('fornitori:write'),
    validate(updateBlueprint),
    contattiController.update
);

module.exports = router;
