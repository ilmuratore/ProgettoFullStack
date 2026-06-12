const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { validateRighe } = require('../middleware/validateRighe');

const ordiniAcquistoController = require('../controllers/ordiniAcquistoController.js');

const STATI = ['BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE', 'COMPLETATO', 'ANNULLATO'];

const createBlueprint = {
    fornitore_id: { required: true, type: 'number', integer: true, min: 1 },
    data_prevista: { required: true, type: 'string' },
    note: { required: false, type: 'string' },
    // utente_id rimosso (issue31)
};

const updateBlueprint = {
    fornitore_id: { required: false, type: 'number', integer: true, min: 1 },
    data_prevista: { required: false, type: 'string' },
    note: { required: false, type: 'string' },
    // utente_id rimosso (issue31)
};

const updateStatoBlueprint = {
    stato: { required: true, type: 'string', enum: STATI },
};

const addRigaBlueprint = {
    prodotto_id: { required: true, type: 'number', integer: true, min: 1 },
    quantita_ordinata: { required: true, type: 'number', min: 0.01 },
    prezzo_unitario: { required: true, type: 'number', min: 0 },
};

const createRicezioneBlueprint = {
    ordine_acquisto_id: { required: true, type: 'number', integer: true, min: 1 },
    data_ricezione: { required: false, type: 'string' },
    note: { required: false, type: 'string' },
    // utente_id rimosso (issue31)
};


// GET /api/v1/ordini-acquisto/:id/pdf
router.get(
    '/:id/pdf',
    auth,
    requirePermesso('acquisti:read'),
    ordiniAcquistoController.getPdf
);

// GET /api/v1/ordini-acquisto
router.get(
    '/',
    auth,
    requirePermesso('acquisti:read'),
    ordiniAcquistoController.getAll
);

// GET /api/v1/ordini-acquisto/:id
router.get(
    '/:id',
    auth,
    requirePermesso('acquisti:read'),
    ordiniAcquistoController.getById
);

// POST /api/v1/ordini-acquisto
router.post(
    '/',
    auth,
    requirePermesso('acquisti:write'),
    validate(createBlueprint),
    validateRighe,
    ordiniAcquistoController.create
);

// PATCH /api/v1/ordini-acquisto/:id
router.patch(
    '/:id',
    auth,
    requirePermesso('acquisti:write'),
    validate(updateBlueprint),
    ordiniAcquistoController.update
);

// PATCH /api/v1/ordini-acquisto/:id/stato
router.patch(
    '/:id/stato',
    auth,
    requirePermesso('acquisti:approve'),
    validate(updateStatoBlueprint),
    ordiniAcquistoController.updateStato
);

// POST /api/v1/ordini-acquisto/:id/righe
router.post(
    '/:id/righe',
    auth,
    requirePermesso('acquisti:write'),
    validate(addRigaBlueprint),
    ordiniAcquistoController.addRiga
);

// POST /api/v1/ordini-acquisto/ricezioni
router.post(
    '/ricezioni',
    auth,
    requirePermesso('acquisti:approve'),
    validate(createRicezioneBlueprint),
    validateRighe,
    ordiniAcquistoController.createRicezione
);

// GET /api/v1/ordini-acquisto/:id/ricezioni
router.get(
    '/:id/ricezioni',
    auth,
    requirePermesso('acquisti:read'),
    ordiniAcquistoController.listRicezioni
);

module.exports = router;
