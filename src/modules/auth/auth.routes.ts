import { Hono } from 'hono';
import * as controller from './auth.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = new Hono();

router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/create-user', controller.createUser);
router.post('/request-otp', controller.requestOtp);
router.post('/verify-otp', controller.verifyOtp);
router.get('/me', auth, controller.getMe);

export default router;