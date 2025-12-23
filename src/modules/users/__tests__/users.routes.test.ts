import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import usersRouter from '../users.routes.js';
import * as controller from '../users.controller.js';

// Mock the controller
vi.mock('../users.controller.js', () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock middleware
vi.mock('../../../middleware/auth.middleware.js', () => ({
  auth: vi.fn((c, next) => next()),
}));

vi.mock('../../../middleware/role.middleware.js', () => ({
  requireRole: vi.fn(() => (c: any, next: any) => next()),
}));

describe('Users Routes', () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/users', usersRouter);
  });

  describe('GET /users', () => {
    it('should call getUsers controller', async () => {
      (controller.getUsers as any).mockResolvedValue(new Response(JSON.stringify({ data: [] })));

      const res = await app.request('/users', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      });

      expect(controller.getUsers).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('should call getUserById controller', async () => {
      (controller.getUserById as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/users/1', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      });

      expect(controller.getUserById).toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    it('should call updateUser controller', async () => {
      (controller.updateUser as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/users/1', {
        method: 'PUT',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Test', email: 'test@example.com' }),
      });

      expect(controller.updateUser).toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should call deleteUser controller', async () => {
      (controller.deleteUser as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/users/1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token' },
      });

      expect(controller.deleteUser).toHaveBeenCalled();
    });
  });
});