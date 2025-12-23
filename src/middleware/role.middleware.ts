import type { MiddlewareHandler } from 'hono';

export type UserRole = 'SUPER_ADMIN' | 'STAFF' | 'CLIENT';

export const requireRole = (roles: UserRole[]): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ message: 'Forbidden' }, 403);
    }
    await next();
  };
};