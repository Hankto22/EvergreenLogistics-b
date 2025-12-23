import { Hono } from 'hono';
import * as controller from './uploads.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = new Hono();

router.post('/', auth, controller.uploadMedia);

export default router;