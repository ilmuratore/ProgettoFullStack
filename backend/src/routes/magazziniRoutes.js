// ============================================================
// magazziniRoutes.js — M06: Gestione Magazzino
//
// Endpoint esposti:
//   GET    /api/v1/magazzini                        → lista tutti
//   POST   /api/v1/magazzini                        → crea magazzino
//   GET    /api/v1/magazzini/:id                    → dettaglio + albero ubicazioni
//   PATCH  /api/v1/magazzini/:id                    → modifica nome/indirizzo
//   PATCH  /api/v1/magazzini/:id/toggle             → toggle attivo
//   POST   /api/v1/magazzini/:magId/ubicazioni      → crea ubicazione (nested)
// ============================================================

const express             = require('express');
const magazziniController = require('../controllers/magazziniController');
const ubicazioniController = require('../controllers/ubicazioniController');
const auth                = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const validate            = require('../middleware/validate');

const router = express.Router();

// ---------------------------------------------------------------
// Blueprint validazione
// ---------------------------------------------------------------

// POST /magazzini — codice e nome obbligatori
const createMagazzinoBlueprint = {
    codice:    { required: true,  type: 'string' },
    nome:      { required: true,  type: 'string' },
    indirizzo: { required: false, type: 'string' }
};

// PATCH /magazzini/:id — tutti opzionali; codice non incluso → mai accettato
const updateMagazzinoBlueprint = {
    nome:      { required: false, type: 'string' },
    indirizzo: { required: false, type: 'string' }
};

// POST /magazzini/:magId/ubicazioni
const createUbicazioneBlueprint = {
    corsia:                  { required: true,  type: 'number', integer: true, min: 1 },
    scaffale:                { required: true,  type: 'number', integer: true, min: 1 },
    temperatura_controllata: { required: false, type: 'boolean' }
};

// ---------------------------------------------------------------
// Routes magazzini
// ---------------------------------------------------------------

router.get(
    '/',
    auth, requirePermesso('magazzino:read'),
    magazziniController.getAll
);

router.post(
    '/',
    auth, requirePermesso('magazzino:write'), validate(createMagazzinoBlueprint),
    magazziniController.create
);

router.get(
    '/:id',
    auth, requirePermesso('magazzino:read'),
    magazziniController.getById
);

router.patch(
    '/:id',
    auth, requirePermesso('magazzino:write'), validate(updateMagazzinoBlueprint),
    magazziniController.update
);

router.patch(
    '/:id/toggle',
    auth, requirePermesso('magazzino:write'),
    magazziniController.toggleAttivo
);

// ---------------------------------------------------------------
// Rotta nested ubicazioni — POST crea ubicazione sotto un magazzino
// ---------------------------------------------------------------

router.post(
    '/:magId/ubicazioni',
    auth, requirePermesso('magazzino:write'), validate(createUbicazioneBlueprint),
    ubicazioniController.create
);

module.exports = router;
