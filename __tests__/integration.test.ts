import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/app.js';
import { seed } from '../scripts/seed.js';

// Note: This integration test assumes a test database is set up.
// To run with test DB, set DATABASE_URL to a test database and run:
// pnpm tsx scripts/init-db.ts
// before running this test.
// The seed is now handled in beforeAll.

describe('Integration Smoke Tests', () => {
  let authToken: string;
  let clientId: string;

  beforeAll(async () => {
    // Seed the database with test users
    await seed();
  });
  describe('Health Check', () => {
    it('should return OK status', async () => {
      const res = await app.request('/health');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ status: 'OK' });
    });
  });

  describe('Auth Endpoints', () => {
    it('should login successfully with seeded admin user', async () => {
      const res = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@evergreen.com', password: 'password123' }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('user');
      expect(data.data).toHaveProperty('token');
      expect(data.data.user).toHaveProperty('id');
      expect(data.data.user.email).toBe('admin@evergreen.com');
      expect(data.data.user.role).toBe('SUPER_ADMIN');
      authToken = data.data.token;
      clientId = data.data.user.id; // Use admin as client for now, or we can login as client later
    });

    it('should return consistent error payload for invalid credentials', async () => {
      const res = await app.request('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid@example.com', password: 'wrong' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toHaveProperty('code', 'AUTHENTICATION_ERROR');
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Invalid credentials');
    });

    it('should get current user details', async () => {
      const res = await app.request('/api/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id');
      expect(data.data.email).toBe('admin@evergreen.com');
    });
  });

  describe('Users Endpoints', () => {
    it('should get users list with valid token', async () => {
      const res = await app.request('/api/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      // Should include the seeded users
      expect(data.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should return consistent error payload for unauthorized access', async () => {
      const res = await app.request('/api/users', {
        headers: { Authorization: 'Bearer invalid' },
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toHaveProperty('message', 'Invalid token');
    });
  });

  describe('Shipments Endpoints', () => {
    let shipmentId: string;
    let evgCode: string;

    it('should create a shipment with real client ID', async () => {
      const shipmentData = {
        shipmentCode: 'TEST001',
        clientId: clientId,
        description: 'Integration test shipment',
        originCity: 'Nairobi',
        destinationCity: 'Mombasa',
        status: 'PROCESSING'
      };
      const res = await app.request('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(shipmentData),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('Id');
      expect(data.data).toHaveProperty('EVGCode');
      shipmentId = data.data.Id;
      evgCode = data.data.EVGCode;
    });

    it('should get shipment by ID using real UUID', async () => {
      const res = await app.request(`/api/shipments/${shipmentId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data.Id).toBe(shipmentId);
      expect(data.data.ShipmentCode).toBe('TEST001');
    });

    it('should get shipment by EVG code', async () => {
      const res = await app.request(`/api/shipments/evg/${evgCode}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data.EVGCode).toBe(evgCode);
    });

    it('should return consistent error payload for not found shipment', async () => {
      const fakeId = '11111111-1111-1111-8111-111111111111'; // Valid UUID format but doesn't exist
      const res = await app.request(`/api/shipments/${fakeId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toHaveProperty('code', 'NOT_FOUND_ERROR');
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('not found');
    });
  });
});