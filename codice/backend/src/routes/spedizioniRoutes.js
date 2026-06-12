const express = require('express');
const spedizioniController = require('../controllers/spedizioniController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');

const router = express.Router();

// GET /spedizioni
router.get(
    '/',
    auth,
    requirePermesso('spedizioni:read'),
    spedizioniController.getAll
);

// GET /spedizioni/:id
router.get(
    '/:id',
    auth,
    requirePermesso('spedizioni:read'),
    spedizioniController.getById
);

// POST /spedizioni
router.post(
    '/',
    auth,
    requirePermesso('spedizioni:write'),
    spedizioniController.create
);

module.exports = router;
