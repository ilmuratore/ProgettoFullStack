const express             = require('express');
const magazziniController = require('../controllers/magazziniController');
const ubicazioniController = require('../controllers/ubicazioniController');
const auth                = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const validate            = require('../middleware/validate');

const router = express.Router();
const createMagazzinoBlueprint = {
    codice:    { required: true,  type: 'string' },
    nome:      { required: true,  type: 'string' },
    indirizzo: { required: false, type: 'string' }
};

const updateMagazzinoBlueprint = {
    nome:      { required: false, type: 'string' },
    indirizzo: { required: false, type: 'string' }
};

const createUbicazioneBlueprint = {
    corsia:                  { required: true,  type: 'number', integer: true, min: 1 },
    scaffale:                { required: true,  type: 'number', integer: true, min: 1 },
    temperatura_controllata: { required: false, type: 'boolean' }
};

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

router.post(
    '/:magId/ubicazioni',
    auth, requirePermesso('magazzino:write'), validate(createUbicazioneBlueprint),
    ubicazioniController.create
);

module.exports = router;
