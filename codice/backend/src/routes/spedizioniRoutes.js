const express = require('express');
const router = express.Router();
const spedizioniController = require('../controllers/spedizioniController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const createBlueprint = {
    ordine_id:       { required: true,  type: 'number', integer: true, min: 1 },
    cliente_id:      { required: true,  type: 'number', integer: true, min: 1 },
    destinazione_id: { required: true,  type: 'number', integer: true, min: 1 },
    corriere_id:     { required: false, type: 'number', integer: true, min: 1 },
    tracking_number: { required: false, type: 'string' }
};

const statoBlueprint = {
    stato: { required: true, type: 'string', enum: ['IN_PREPARAZIONE', 'SPEDITA', 'CONSEGNATA', 'PROBLEMA'] }
};

const trackingBlueprint = {
    tracking_number: { required: true, type: 'string' }
};

const ddtCreateBlueprint = {
    data_ddt:      { required: false, type: 'string' },
    trasportatore: { required: false, type: 'string' },
    note:          { required: false, type: 'string' }
};

const ddtUpdateBlueprint = {
    data_ddt:      { required: false, type: 'string' },
    trasportatore: { required: false, type: 'string' },
    note:          { required: false, type: 'string' }
};

router.get('/',    auth, requirePermesso('spedizioni:read'),  spedizioniController.getAll);
router.get('/:id', auth, requirePermesso('spedizioni:read'),  spedizioniController.getById);
router.post('/',   auth, requirePermesso('spedizioni:write'), validate(createBlueprint),  spedizioniController.create);
router.patch('/:id/stato',    auth, requirePermesso('spedizioni:write'), validate(statoBlueprint),    spedizioniController.updateStato);
router.patch('/:id/tracking', auth, requirePermesso('spedizioni:write'), validate(trackingBlueprint), spedizioniController.updateTracking);
router.get('/:id/ddt',     auth, requirePermesso('spedizioni:read'),  spedizioniController.getDdt);
router.post('/:id/ddt',    auth, requirePermesso('spedizioni:write'), validate(ddtCreateBlueprint), spedizioniController.createDdt);
router.patch('/:id/ddt',   auth, requirePermesso('spedizioni:write'), validate(ddtUpdateBlueprint), spedizioniController.updateDdt);
router.get('/:id/ddt/pdf', auth, requirePermesso('spedizioni:read'),  spedizioniController.getPdfDdt);

module.exports = router;
