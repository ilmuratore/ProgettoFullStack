const express = require('express');
const spedizioniController = require('../controllers/spedizioniController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const statoBlueprint = {
    stato: { required: true, type: 'string', enum: ['IN_PREPARAZIONE', 'SPEDITA', 'CONSEGNATA', 'PROBLEMA'] }
};

router.get('/', auth, requirePermesso('spedizioni:read'), spedizioniController.getAll);
router.get('/:id', auth, requirePermesso('spedizioni:read'), spedizioniController.getById);
router.patch('/:id/stato', auth, requirePermesso('spedizioni:write'), validate(statoBlueprint), spedizioniController.updateStato);

module.exports = router;
