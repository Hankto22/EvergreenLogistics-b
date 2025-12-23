import type { MiddlewareHandler } from 'hono';
import { verifyToken } from '../config/jwt.js';

export const auth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  try {
    const decoded = verifyToken(token);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ message: 'Invalid token' }, 401);
  }
};