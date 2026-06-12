const express = require('express');
const ricezioniController = require('../controllers/ricezioniController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    ordine_acquisto_id: { required: true, type: 'number', integer: true, min: 1 },
    data_ricezione: { required: true, type: 'string' },
    note: { required: false, type: 'string' }
};

// GET /api/v1/ricezioni
router.get(
    '/',
    auth,
    requirePermesso('acquisti:read'),
    ricezioniController.getAll
);

// GET /api/v1/ricezioni/:id
router.get(
    '/:id',
    auth,
    requirePermesso('acquisti:read'),
    ricezioniController.getById
);

// POST /api/v1/ricezioni
router.post(
    '/',
    auth,
    requirePermesso('acquisti:approve'),
    validate(createBlueprint),
    ricezioniController.create
);

// GET /api/v1/ricezioni/:id/righe
router.get(
    '/:id/righe',
    auth,
    requirePermesso('acquisti:read'),
    ricezioniController.getRighe
);

// POST /api/v1/ricezioni/:id/righe
router.post(
    '/:id/righe',
    auth,
    requirePermesso('acquisti:approve'),
    (_req, _res, next) => {
        const err = new Error('Endpoint deprecato. Usare POST /api/v1/ordini-acquisto/ricezioni');
        err.code = 'ENDPOINT_DEPRECATED';
        err.status = 410;
        next(err);
    }
);

// GET /api/v1/ricezioni/:id/pdf
router.get('/:id/pdf', auth, requirePermesso('acquisti:read'), ricezioniController.getPdf);

module.exports = router;
