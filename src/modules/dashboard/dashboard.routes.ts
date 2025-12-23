import { Hono } from 'hono';
import * as controller from './dashboard.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = new Hono();

router.get('/admin', auth, requireRole(['SUPER_ADMIN']), controller.getAdminDashboard);
router.get('/user', auth, controller.getUserDashboard);
router.get('/recent-orders', auth, requireRole(['SUPER_ADMIN']), controller.getRecentOrders);

export default router;