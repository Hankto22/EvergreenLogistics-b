import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { limiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import shipmentsRoutes from './modules/shipments/shipments.routes.js';
import galleryRoutes from './modules/gallery/gallery.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import uploadsRoutes from './modules/uploads/uploads.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const app = new Hono();

// Global Middlewares
app.use('*', cors());
app.use('*', logger());
// app.use('*', limiter);

// Error handler
app.onError((error, c) => {
  console.error('Error:', error);
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return c.json({ message: (error as any).message }, (error as any).statusCode);
  }
  return c.json({ message: 'Internal Server Error' }, 500);
});

// Routes
app.route('/api', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/shipments', shipmentsRoutes);
app.route('/api/gallery', galleryRoutes);
app.route('/api/notifications', notificationsRoutes);
app.route('/api/uploads', uploadsRoutes);
app.route('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'OK' }));

export default app;