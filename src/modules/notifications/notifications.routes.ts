import { Hono } from 'hono';
import * as controller from './notifications.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = new Hono();

router.get('/', auth, controller.getNotifications);
router.get('/:id', auth, controller.getNotificationById);
router.post('/', auth, controller.createNotification);
router.put('/:id/read', auth, controller.markAsRead);
router.delete('/:id', auth, controller.deleteNotification);

export default router;