// ============================================================
// dipendentiRoutes.js — M05: Anagrafiche Dipendenti
//
// Endpoint:
//   GET    /api/v1/dipendenti        dipendenti:read
//   POST   /api/v1/dipendenti        dipendenti:write  + validate
//   GET    /api/v1/dipendenti/:id    dipendenti:read
//   PATCH  /api/v1/dipendenti/:id    dipendenti:write  + validate
//   DELETE /api/v1/dipendenti/:id    dipendenti:delete
//
// Registrare in server.js:
//   app.use('/api/v1/dipendenti', require('./src/routes/dipendentiRoutes'));
// ============================================================

const express               = require('express');
const dipendentiController  = require('../controllers/dipendentiController');
const auth                  = require('../middleware/auth');
const { requirePermesso }   = require('../middleware/rbac');
const validate              = require('../middleware/validate');

const router = express.Router();

// nome, cognome obbligatori.
// codice_fiscale: UNIQUE NOT NULL → obbligatorio.
// ruolo_operativo: mansione operativa (es. "Magazziniere") — opzionale.
// data_assunzione: formato ISO date string (es. "2024-03-15") — opzionale.
// utente_id: collegamento a utente di sistema — opzionale.
const createBlueprint = {
    nome:            { required: true,  type: 'string' },
    cognome:         { required: true,  type: 'string' },
    codice_fiscale:  { required: true,  type: 'string' },
    ruolo_operativo: { required: false, type: 'string' },
    data_assunzione: { required: false, type: 'string' },
    utente_id:       { required: false, type: 'number' }
};

// PATCH parziale: tutti opzionali. Il service controlla che almeno uno sia presente.
const updateBlueprint = {
    nome:            { required: false, type: 'string' },
    cognome:         { required: false, type: 'string' },
    codice_fiscale:  { required: false, type: 'string' },
    ruolo_operativo: { required: false, type: 'string' },
    data_assunzione: { required: false, type: 'string' },
    utente_id:       { required: false, type: 'number' }
};

router.get(   '/',    auth, requirePermesso('dipendenti:read'),   dipendentiController.getAll);
router.post(  '/',    auth, requirePermesso('dipendenti:write'),  validate(createBlueprint), dipendentiController.create);
router.get(   '/:id', auth, requirePermesso('dipendenti:read'),   dipendentiController.getById);
router.patch( '/:id', auth, requirePermesso('dipendenti:write'),  validate(updateBlueprint), dipendentiController.update);
router.delete('/:id', auth, requirePermesso('dipendenti:delete'), dipendentiController.elimina);

module.exports = router;
