import { describe, it, expect } from 'vitest';
import app from '../src/app.js';

// Note: This integration test assumes a test database is set up.
// To run with test DB, set DATABASE_URL to a test database and run:
// pnpm tsx scripts/init-db.ts && pnpm tsx scripts/seed.ts
// before running this test.

describe('Integration Smoke Tests', () => {
  describe('Health Check', () => {
    it('should return OK status', async () => {
      const res = await app.request('/health');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ status: 'OK' });
    });
  });

  // Note: Login and user list tests would require test database setup
  // For now, this serves as a placeholder for integration testing
  describe('Auth Endpoints', () => {
    it('should have auth routes available', async () => {
      // This is a smoke test to ensure routes are registered
      const res = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });
      // Expect 401 for invalid credentials
      expect(res.status).toBe(401);
    });
  });

  describe('Users Endpoints', () => {
    it('should have users routes available', async () => {
      const res = await app.request('/api/users', {
        headers: { Authorization: 'Bearer invalid' },
      });
      // Expect 401 or 403 since auth fails
      expect([401, 403]).toContain(res.status);
    });
  });
});