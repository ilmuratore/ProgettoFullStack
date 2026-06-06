// ============================================================
// corrieriRoutes.js — M05: Anagrafiche Corrieri
//
// Endpoint:
//   GET    /api/v1/corrieri        corrieri:read
//   POST   /api/v1/corrieri        corrieri:write  + validate
//   GET    /api/v1/corrieri/:id    corrieri:read
//   PATCH  /api/v1/corrieri/:id    corrieri:write  + validate
//   DELETE /api/v1/corrieri/:id    corrieri:delete
//
// Registrare in server.js:
//   app.use('/api/v1/corrieri', require('./src/routes/corrieriRoutes'));
// ============================================================

const express              = require('express');
const corrieriController   = require('../controllers/corrieriController');
const auth                 = require('../middleware/auth');
const { requirePermesso }  = require('../middleware/rbac');
const validate             = require('../middleware/validate');

const router = express.Router();

// codice e nome obbligatori — codice è l'identificativo univoco dell'azienda corriere
// (es. 'BRT', 'DHL-IT'). La UNIQUE constraint su DB gestisce i duplicati (→ 409 DUPLICATE_ENTRY).
const createBlueprint = {
    codice:   { required: true,  type: 'string' },
    nome:     { required: true,  type: 'string' },
    telefono: { required: false, type: 'string' },
    email:    { required: false, type: 'string' }
};

// PATCH parziale: tutti opzionali. Il service controlla che almeno uno sia presente.
const updateBlueprint = {
    codice:   { required: false, type: 'string' },
    nome:     { required: false, type: 'string' },
    telefono: { required: false, type: 'string' },
    email:    { required: false, type: 'string' }
};

router.get(   '/',    auth, requirePermesso('corrieri:read'),   corrieriController.getAll);
router.post(  '/',    auth, requirePermesso('corrieri:write'),  validate(createBlueprint), corrieriController.create);
router.get(   '/:id', auth, requirePermesso('corrieri:read'),   corrieriController.getById);
router.patch( '/:id', auth, requirePermesso('corrieri:write'),  validate(updateBlueprint), corrieriController.update);
router.delete('/:id', auth, requirePermesso('corrieri:delete'), corrieriController.elimina);

module.exports = router;
