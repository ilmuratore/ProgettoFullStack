const express = require('express');
const aziendaSettingsController = require('../controllers/aziendaSettingsController');

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const{ validate  }= require('../middleware/validate');

const router = express.Router();

const updateBlueprint = {
    ragione_sociale: { required: false, type: 'string', minLength: 1, maxLength: 180 },
    piva: { required: false, type: 'string', maxLength: 32 },
    codice_fiscale: { required: false, type: 'string', maxLength: 32 },
    indirizzo: { required: false, type: 'string', maxLength: 255 },
    citta: { required: false, type: 'string', maxLength: 120 },
    provincia: { required: false, type: 'string', maxLength: 10 },
    cap: { required: false, type: 'string', maxLength: 10 },
    nazione: { required: false, type: 'string', maxLength: 80 },
    email: { required: false, type: 'string', maxLength: 180 },
    pec: { required: false, type: 'string', maxLength: 180 },
    telefono: { required: false, type: 'string', maxLength: 50 },
    sito_web: { required: false, type: 'string', maxLength: 180 },
    iban: { required: false, type: 'string', maxLength: 64 },
    sdi: { required: false, type: 'string', maxLength: 16 },
    logo_url: { required: false, type: 'string' },
};

router.get('/', auth, requirePermesso('utenti:read'), aziendaSettingsController.get);
router.patch('/', auth, requirePermesso('utenti:write'), validate(updateBlueprint), aziendaSettingsController.update);

module.exports = router;
