const express              = require('express');
const ubicazioniController = require('../controllers/ubicazioniController');
const auth                 = require('../middleware/auth');
const { requirePermesso }  = require('../middleware/rbac');
const validate             = require('../middleware/validate');

const router = express.Router();

const updateUbicazioneBlueprint = {
    temperatura_controllata: { required: true, type: 'boolean' }
};

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
