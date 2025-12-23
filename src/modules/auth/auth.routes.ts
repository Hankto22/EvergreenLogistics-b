import { Hono } from 'hono';
import * as controller from './auth.controller.js';

const router = new Hono();

router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/create-user', controller.createUser);
router.post('/request-otp', controller.requestOtp);
router.post('/verify-otp', controller.verifyOtp);

export default router;