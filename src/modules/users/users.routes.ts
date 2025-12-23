import { Hono } from 'hono';
import * as controller from './users.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = new Hono();

router.get('/', auth, requireRole(['SUPER_ADMIN']), controller.getUsers);
router.get('/:id', auth, requireRole(['SUPER_ADMIN']), controller.getUserById);
router.put('/:id', auth, requireRole(['SUPER_ADMIN']), controller.updateUser);
router.delete('/:id', auth, requireRole(['SUPER_ADMIN']), controller.deleteUser);

export default router;