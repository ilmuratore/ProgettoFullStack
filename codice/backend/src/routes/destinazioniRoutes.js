const express = require('express');
const router = express.Router({ mergeParams: true });

const destinazioniController = require('../controllers/destinazioniController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

// -----------------------------
// BLUEPRINT VALIDAZIONE
// -----------------------------

// CREATE
const createBlueprint = {
    etichetta: { required: true, type: 'string', minLength: 1 },
    indirizzo: { required: true, type: 'string', minLength: 1 },
    cap: { required: true, type: 'string', minLength: 1 },
    citta: { required: true, type: 'string', minLength: 1 },
    provincia: { required: true, type: 'string', minLength: 1 },
    paese: { required: false, type: 'string', minLength: 1 },
    predefinita: { required: false, type: 'boolean' }
};

// UPDATE
const updateBlueprint = {
    etichetta: { required: false, type: 'string', minLength: 1 },
    indirizzo: { required: false, type: 'string', minLength: 1 },
    cap: { required: false, type: 'string', minLength: 1 },
    citta: { required: false, type: 'string', minLength: 1 },
    provincia: { required: false, type: 'string', minLength: 1 },
    paese: { required: false, type: 'string', minLength: 1 },
    predefinita: { required: false, type: 'boolean' }
};

// -----------------------------
// ROUTES DESTINAZIONI
// -----------------------------

// GET /clienti/:id/destinazioni
router.get(
    '/',
    auth,
    requirePermesso('clienti:read'),
    destinazioniController.getByCliente
);

// GET /clienti/:id/destinazioni/:destId
router.get(
    '/:destId',
    auth,
    requirePermesso('clienti:read'),
    destinazioniController.getById
);

// POST /clienti/:id/destinazioni
router.post(
    '/',
    auth,
    requirePermesso('clienti:write'),
    validate(createBlueprint),
    destinazioniController.create
);

// PATCH /clienti/:id/destinazioni/:destId
router.patch(
    '/:destId',
    auth,
    requirePermesso('clienti:write'),
    validate(updateBlueprint),
    destinazioniController.update
);

// DELETE /clienti/:id/destinazioni/:destId
router.delete(
    '/:destId',
    auth,
    requirePermesso('clienti:delete'),
    destinazioniController.remove
);

module.exports = router;
