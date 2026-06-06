// ============================================================
// ubicazioniRoutes.js — M06: Gestione Ubicazioni
//
// Rotte dirette su singola ubicazione (CRUD senza nested):
//   GET    /api/v1/ubicazioni/:id           → dettaglio con codice_composto
//   PATCH  /api/v1/ubicazioni/:id           → modifica temperatura_controllata
//   PATCH  /api/v1/ubicazioni/:id/toggle    → toggle attivo
//
// La rotta POST (creazione) è nested su magazziniRoutes.js:
//   POST   /api/v1/magazzini/:magId/ubicazioni
// ============================================================

const express              = require('express');
const ubicazioniController = require('../controllers/ubicazioniController');
const auth                 = require('../middleware/auth');
const { requirePermesso }  = require('../middleware/rbac');
const validate             = require('../middleware/validate');

const router = express.Router();

// ---------------------------------------------------------------
// Blueprint validazione
// ---------------------------------------------------------------

// PATCH /ubicazioni/:id — temperatura_controllata obbligatorio
const updateUbicazioneBlueprint = {
    temperatura_controllata: { required: true, type: 'boolean' }
};

// ---------------------------------------------------------------
// Routes ubicazioni
// ---------------------------------------------------------------

router.get(
    '/:id',
    auth, requirePermesso('magazzino:read'),
    ubicazioniController.getById
);

router.patch(
    '/:id',
    auth, requirePermesso('magazzino:write'), validate(updateUbicazioneBlueprint),
    ubicazioniController.updateTemperatura
);

router.patch(
    '/:id/toggle',
    auth, requirePermesso('magazzino:write'),
    ubicazioniController.toggleAttivo
);

module.exports = router;
