const express = require('express');
const notificheController = require('../controllers/notificheController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');

const router = express.Router();

router.use(auth, requirePermesso('notifiche:read'));
router.get('/', notificheController.getAll);
router.get('/non-lette', notificheController.getNonLette);
router.get('/count', notificheController.countNonLette);
router.get('/:id', notificheController.getById);
router.patch('/letta-tutto', notificheController.markAllAsRead);
router.patch('/:id/letta', notificheController.markAsRead);

module.exports = router;
