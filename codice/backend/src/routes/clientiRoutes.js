const express = require('express');
const router = express.Router();

const clientiController = require('../controllers/clientiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const  {validate} = require('../middleware/validate');

// Blueprint CREATE cliente
const createBlueprint = {
    ragione_sociale: { required: true, type: 'string' },
    piva_cf: { required: true, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};

// Blueprint UPDATE cliente
const updateBlueprint = {
    ragione_sociale: { required: false, type: 'string' },
    piva_cf: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' },
    attivo: { required: false, type: 'boolean' }
};

// -----------------------------
// ROUTES CLIENTI
// -----------------------------

router.get(
    '/',
    auth,
    requirePermesso('clienti:read'),
    clientiController.getAll
);

router.post(
    '/',
    auth,
    requirePermesso('clienti:write'),
    validate(createBlueprint),
    clientiController.create
);

router.get(
    '/:id',
    auth,
    requirePermesso('clienti:read'),
    clientiController.getById
);

router.patch(
    '/:id',
    auth,
    requirePermesso('clienti:write'),
    validate(updateBlueprint),
    clientiController.update
);

router.delete(
    '/:id',
    auth,
    requirePermesso('clienti:delete'),
    clientiController.elimina
);

// -----------------------------
// SUB-ROUTES: DESTINAZIONI
// -----------------------------

const destinazioniRoutes = require('./destinazioniRoutes');
router.use('/:id/destinazioni', destinazioniRoutes);

module.exports = router;
