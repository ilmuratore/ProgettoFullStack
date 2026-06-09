const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const validate = require('../middleware/validate');

const router = express.Router();


const loginBlueprint = {
    email:    { required: true, type: 'string' },
    password: { required: true, type: 'string', minLength: 6 }
};

const registerBlueprint = {
    nome:     { required: true,  type: 'string' },
    cognome:  { required: true,  type: 'string' },
    email:    { required: true,  type: 'string' },
    password: { required: true,  type: 'string', minLength: 6 },
    ruolo_id: { required: true,  type: 'number' }
};

const changePasswordBlueprint = {
    password_attuale: { required: true, type: 'string', minLength: 6 },
    password_nuova:   { required: true, type: 'string', minLength: 6 }
};


router.post('/login',    validate(loginBlueprint),    authController.login);
router.post('/register', auth, requirePermesso('utenti:write'), validate(registerBlueprint), authController.register);
router.get( '/me',       auth, authController.getMe);
router.patch('/password', auth, validate(changePasswordBlueprint), authController.changePassword);

module.exports = router;
