const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const ordiniAcquistoController = require('../controllers/ordiniAcquistoController');

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
    ordiniAcquistoController.create
);

// PATCH /api/v1/ordini-acquisto/:id
router.patch(
    '/:id',
    auth,
    requirePermesso('acquisti:write'),
    ordiniAcquistoController.update
);

// PATCH /api/v1/ordini-acquisto/:id/stato
router.patch(
    '/:id/stato',
    auth,
    requirePermesso('acquisti:approve'),
    ordiniAcquistoController.updateStato
);

// POST /api/v1/ordini-acquisto/:id/righe
router.post(
    '/:id/righe',
    auth,
    requirePermesso('acquisti:write'),
    ordiniAcquistoController.addRiga
);

// POST /api/v1/ordini-acquisto/ricezioni
router.post(
    '/ricezioni',
    auth,
    requirePermesso('acquisti:approve'),
    ordiniAcquistoController.createRicezione
);

// GET /api/v1/ordini-acquisto/:id/ricezioni
router.get(
    '/:id/ricezioni',
    auth,
    requirePermesso('acquisti:read'),
    ordiniAcquistoController.listRicezioni
);

module.exports = { router };
