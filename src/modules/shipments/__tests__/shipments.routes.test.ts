import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import shipmentsRouter from '../shipments.routes.js';
import * as controller from '../shipments.controller.js';

// Mock the controller
vi.mock('../shipments.controller.js', () => ({
  getShipments: vi.fn(),
  getShipmentById: vi.fn(),
  createShipment: vi.fn(),
  updateShipment: vi.fn(),
  deleteShipment: vi.fn(),
}));

// Mock middleware
vi.mock('../../../middleware/auth.middleware.js', () => ({
  auth: vi.fn((c: any, next: any) => next()),
}));

describe('Shipments Routes', () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/shipments', shipmentsRouter);
  });

  describe('GET /shipments', () => {
    it('should call getShipments controller', async () => {
      (controller.getShipments as any).mockResolvedValue(new Response(JSON.stringify({ data: [] })));

      const res = await app.request('/shipments', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      });

      expect(controller.getShipments).toHaveBeenCalled();
    });
  });

  describe('GET /shipments/:id', () => {
    it('should call getShipmentById controller', async () => {
      (controller.getShipmentById as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/shipments/1', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      });

      expect(controller.getShipmentById).toHaveBeenCalled();
    });
  });

  describe('POST /shipments', () => {
    it('should call createShipment controller', async () => {
      (controller.createShipment as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/shipments', {
        method: 'POST',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentCode: 'SHP001', evgCode: 'EVG001', clientId: 'client1' }),
      });

      expect(controller.createShipment).toHaveBeenCalled();
    });
  });

  describe('PUT /shipments/:id', () => {
    it('should call updateShipment controller', async () => {
      (controller.updateShipment as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/shipments/1', {
        method: 'PUT',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_TRANSIT' }),
      });

      expect(controller.updateShipment).toHaveBeenCalled();
    });
  });

  describe('DELETE /shipments/:id', () => {
    it('should call deleteShipment controller', async () => {
      (controller.deleteShipment as any).mockResolvedValue(new Response(JSON.stringify({ data: {} })));

      const res = await app.request('/shipments/1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token' },
      });

      expect(controller.deleteShipment).toHaveBeenCalled();
    });
  });
});