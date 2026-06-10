const express = require('express');
const clientiController = require('../controllers/clientiController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    ragione_sociale: { required: true, type: 'string' },
    piva_cf: { required: true, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};
const updateBlueprint = {
    ragione_sociale: { required: false, type: 'string' },
    piva_cf: { required: false, type: 'string' },
    email: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' }
};

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


module.exports = router;
