const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/richiesteAcquistoController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const STATI = ['BOZZA', 'INVIATA', 'IN_VALUTAZIONE', 'ACCETTATA', 'RIFIUTATA'];

const createBlueprint  = { fornitore_id: { required: true, type: 'number', integer: true, min: 1 }, note: { required: false, type: 'string' } };
const statoBlueprint   = { stato: { required: true, type: 'string', enum: STATI } };
const noteBlueprint    = { note: { required: true, type: 'string' } };
const addRigaBP        = { prodotto_id: { required: true, type: 'number', integer: true, min: 1 }, quantita_richiesta: { required: true, type: 'number', integer: true, min: 1 } };
const updateRigaBP     = { quantita_richiesta: { required: true, type: 'number', integer: true, min: 1 } };

router.get('/',    auth, requirePermesso('acquisti:read'),    ctrl.getAll);
router.get('/:id', auth, requirePermesso('acquisti:read'),    ctrl.getById);
router.post('/',   auth, requirePermesso('acquisti:write'),   validate(createBlueprint), ctrl.create);
router.patch('/:id/stato', auth, requirePermesso('acquisti:approve'), validate(statoBlueprint), ctrl.updateStato);
router.patch('/:id/note',  auth, requirePermesso('acquisti:write'),   validate(noteBlueprint),  ctrl.updateNote);
router.delete('/:id',      auth, requirePermesso('acquisti:write'),   ctrl.remove);
router.post('/:id/righe',            auth, requirePermesso('acquisti:write'), validate(addRigaBP),    ctrl.addRiga);
router.patch('/:id/righe/:riga_id',  auth, requirePermesso('acquisti:write'), validate(updateRigaBP), ctrl.updateRiga);
router.delete('/:id/righe/:riga_id', auth, requirePermesso('acquisti:write'), ctrl.removeRiga);

module.exports = router;
