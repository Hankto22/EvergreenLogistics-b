import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment
} from '../shipments.controller.js';
import * as shipmentsService from '../shipments.service.js';

// Mock the shipments service
vi.mock('../shipments.service.js', () => ({
  getAllShipmentsService: vi.fn(),
  getShipmentByIdService: vi.fn(),
  createShipmentService: vi.fn(),
  updateShipmentService: vi.fn(),
  deleteShipmentService: vi.fn(),
}));

// Mock Hono Context
const mockContext = {
  json: vi.fn(),
  req: {
    param: vi.fn(),
    json: vi.fn(),
  },
};

describe('Shipments Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getShipments', () => {
    it('should return shipments successfully', async () => {
      const mockShipments = [{ id: '1', shipmentCode: 'SHP001' }];
      (shipmentsService.getAllShipmentsService as any).mockResolvedValue(mockShipments);

      const result = await getShipments(mockContext as any);

      expect(shipmentsService.getAllShipmentsService).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'Shipments retrieved successfully', data: mockShipments }, 200);
    });
  });

  describe('getShipmentById', () => {
    it('should return shipment successfully', async () => {
      const mockShipment = { id: '1', shipmentCode: 'SHP001' };
      (shipmentsService.getShipmentByIdService as any).mockResolvedValue(mockShipment);
      mockContext.req.param.mockReturnValue('1');

      const result = await getShipmentById(mockContext as any);

      expect(shipmentsService.getShipmentByIdService).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'Shipment retrieved successfully', data: mockShipment }, 200);
    });

    it('should throw NotFoundError when shipment not found', async () => {
      (shipmentsService.getShipmentByIdService as any).mockResolvedValue(null);
      mockContext.req.param.mockReturnValue('1');

      await expect(getShipmentById(mockContext as any)).rejects.toThrow('Shipment not found');
    });
  });

  describe('createShipment', () => {
    it('should create shipment successfully', async () => {
      const body = {
        shipmentCode: 'SHP001',
        clientId: 'client1',
        description: 'Test shipment',
      };
      const mockShipment = { id: '1', evgCode: 'EVG123456', ...body };
      (shipmentsService.createShipmentService as any).mockResolvedValue(mockShipment);
      mockContext.req.json.mockResolvedValue(body);

      const result = await createShipment(mockContext as any);

      expect(shipmentsService.createShipmentService).toHaveBeenCalledWith(body);
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'Shipment created successfully', data: mockShipment }, 201);
    });

    it('should throw ValidationError when required fields missing', async () => {
      const body = { description: 'Test' };
      mockContext.req.json.mockResolvedValue(body);

      await expect(createShipment(mockContext as any)).rejects.toThrow('Shipment code and client ID are required');
    });
  });

  describe('updateShipment', () => {
    it('should update shipment successfully', async () => {
      const body = { status: 'IN_TRANSIT' };
      const mockShipment = { id: '1', shipmentCode: 'SHP001', status: 'IN_TRANSIT' };
      (shipmentsService.updateShipmentService as any).mockResolvedValue(mockShipment);
      mockContext.req.param.mockReturnValue('1');
      mockContext.req.json.mockResolvedValue(body);

      const result = await updateShipment(mockContext as any);

      expect(shipmentsService.updateShipmentService).toHaveBeenCalledWith('1', body);
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'Shipment updated successfully', data: mockShipment }, 200);
    });

    it('should throw NotFoundError when shipment not found', async () => {
      const body = { status: 'DELIVERED' };
      (shipmentsService.updateShipmentService as any).mockResolvedValue(null);
      mockContext.req.param.mockReturnValue('1');
      mockContext.req.json.mockResolvedValue(body);

      await expect(updateShipment(mockContext as any)).rejects.toThrow('Shipment not found');
    });
  });

  describe('deleteShipment', () => {
    it('should delete shipment successfully', async () => {
      (shipmentsService.deleteShipmentService as any).mockResolvedValue('Shipment deleted');
      mockContext.req.param.mockReturnValue('1');

      const result = await deleteShipment(mockContext as any);

      expect(shipmentsService.deleteShipmentService).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'Shipment deleted successfully', data: { message: 'Shipment deleted' } }, 200);
    });
  });
});