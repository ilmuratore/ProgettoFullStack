const express = require('express');
const router = express.Router({ mergeParams: true });

const contattiController = require('../controllers/contattiFornitoriController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

// -----------------------------
// BLUEPRINT VALIDAZIONE
// -----------------------------

// CREATE
const createBlueprint = {
    nome: { required: true, type: 'string', minLength: 1 },
    ruolo: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};

// UPDATE
const updateBlueprint = {
    nome: { required: false, type: 'string', minLength: 1 },
    ruolo: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};

// -----------------------------
// ROUTES CONTATTI FORNITORI
// -----------------------------

// GET /fornitori/:id/contatti
router.get(
    '/',
    auth,
    requirePermesso('fornitori:read'),
    contattiController.getByFornitoreId
);

// GET /fornitori/:id/contatti/:contattoId
router.get(
    '/:contattoId',
    auth,
    requirePermesso('fornitori:read'),
    contattiController.getById
);

// POST /fornitori/:id/contatti
router.post(
    '/',
    auth,
    requirePermesso('fornitori:write'),
    validate(createBlueprint),
    contattiController.create
);

// PATCH /fornitori/:id/contatti/:contattoId
router.patch(
    '/:contattoId',
    auth,
    requirePermesso('fornitori:write'),
    validate(updateBlueprint),
    contattiController.update
);

module.exports = router;
