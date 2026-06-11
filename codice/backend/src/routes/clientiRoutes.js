const express = require('express');
const clientiController = require('../controllers/clientiController');
const destinazioniController = require('../controllers/destinazioniController');

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

const destinazioneBlueprint = {
    etichetta: { required: false, type: 'string' },
    indirizzo: { required: false, type: 'string' },
    cap: { required: false, type: 'string' },
    citta: { required: false, type: 'string' },
    provincia: { required: false, type: 'string' },
    paese: { required: false, type: 'string' },
    predefinita: { required: false, type: 'boolean' }
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

// ----- Destinazioni (sub-risorsa del cliente) -----

router.get(
    '/:id/destinazioni',
    auth,
    requirePermesso('clienti:read'),
    destinazioniController.getByCliente
);

router.post(
    '/:id/destinazioni',
    auth,
    requirePermesso('clienti:write'),
    validate(destinazioneBlueprint),
    destinazioniController.create
);

router.get(
    '/:id/destinazioni/:destId',
    auth,
    requirePermesso('clienti:read'),
    destinazioniController.getById
);

router.patch(
    '/:id/destinazioni/:destId',
    auth,
    requirePermesso('clienti:write'),
    validate(destinazioneBlueprint),
    destinazioniController.update
);

router.delete(
    '/:id/destinazioni/:destId',
    auth,
    requirePermesso('clienti:delete'),
    destinazioniController.remove
);

module.exports = router;
