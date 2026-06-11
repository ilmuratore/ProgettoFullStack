const express = require('express');
const notificheController = require('../controllers/notificheController');
const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');

const router = express.Router();

router.get('/', auth, requirePermesso('notifiche:read'), notificheController.getAll);
router.patch('/letta-tutto', auth, requirePermesso('notifiche:read'), notificheController.markAllAsRead);
router.patch('/:id/letta', auth, requirePermesso('notifiche:read'), notificheController.markAsRead);

module.exports = router;
