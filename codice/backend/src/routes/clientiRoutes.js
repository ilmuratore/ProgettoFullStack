// ============================================================
// clientiRoutes.js  —  V2
// M04: Anagrafiche "I nostri Clienti"
//
// Permessi (definiti in M01 seed):
//   clienti:read   → Admin
//   clienti:write  → Admin
//   clienti:delete → Admin
//
// NOTA: Responsabile Acquisti, Responsabile Magazzino, Operatore e Corriere
//       non hanno alcun permesso su clienti in V2. Valutare clienti:read
//       per Operatore quando verrà implementato M09 (Sales Orders).
//
// 'source' è assente da entrambi i blueprint:
//   non viene mai accettato dal body utente in nessuna operazione.
// ============================================================

const express                 = require('express');
const clientiController       = require('../controllers/clientiController');
const auth                    = require('../middleware/auth');
const { requirePermesso }     = require('../middleware/rbac');
const validate                = require('../middleware/validate');

const router = express.Router();


// ────────────────────────────────────────────────────────────
// BLUEPRINT VALIDAZIONE
// ────────────────────────────────────────────────────────────

// ragione_sociale e piva_cf obbligatori; email e telefono opzionali.
// 'source' NON è presente: non viene mai accettato dal body utente.
const createBlueprint = {
    ragione_sociale: { required: true,  type: 'string' },
    piva_cf:         { required: true,  type: 'string' },
    email:           { required: false, type: 'string' },
    telefono:        { required: false, type: 'string' }
};

// PATCH parziale: tutti opzionali. Almeno un campo presente → controllo nel service.
// 'source' NON è presente: non viene mai accettato dal body utente.
const updateBlueprint = {
    ragione_sociale: { required: false, type: 'string' },
    piva_cf:         { required: false, type: 'string' },
    email:           { required: false, type: 'string' },
    telefono:        { required: false, type: 'string' }
};


// ────────────────────────────────────────────────────────────
// ENDPOINT
// Ordine middleware: auth → requirePermesso → [validate] → controller
// ────────────────────────────────────────────────────────────

// GET /api/v1/clienti — lista clienti attivi
router.get(
    '/',
    auth,
    requirePermesso('clienti:read'),
    clientiController.getAll
);

// POST /api/v1/clienti — crea nuovo cliente
router.post(
    '/',
    auth,
    requirePermesso('clienti:write'),
    validate(createBlueprint),
    clientiController.create
);

// GET /api/v1/clienti/:id — dettaglio cliente
router.get(
    '/:id',
    auth,
    requirePermesso('clienti:read'),
    clientiController.getById
);

// PATCH /api/v1/clienti/:id — modifica parziale (solo source=manual)
router.patch(
    '/:id',
    auth,
    requirePermesso('clienti:write'),
    validate(updateBlueprint),
    clientiController.update
);

// DELETE /api/v1/clienti/:id — soft delete (consentito per entrambi i source)
router.delete(
    '/:id',
    auth,
    requirePermesso('clienti:delete'),
    clientiController.elimina
);


module.exports = router;
