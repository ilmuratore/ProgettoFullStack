const express              = require('express');
const corrieriController   = require('../controllers/corrieriController');
const auth                 = require('../middleware/auth');
const { requirePermesso }  = require('../middleware/rbac');
const validate             = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    codice:   { required: true,  type: 'string' },
    nome:     { required: true,  type: 'string' },
    telefono: { required: false, type: 'string' },
    email:    { required: false, type: 'string' }
};

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
