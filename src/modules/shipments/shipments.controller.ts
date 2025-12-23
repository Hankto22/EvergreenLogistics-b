import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as shipmentsService from './shipments.service.js';
import { NotFoundError, ValidationError } from '../../errors/customErrors.js';

export const getShipments = async (c: Context) => {
  const shipments = await shipmentsService.getAllShipmentsService();
  return successResponse(c, shipments, 'Shipments retrieved successfully');
};

export const getShipmentById = async (c: Context) => {
  const id = c.req.param('id');
  const shipment = await shipmentsService.getShipmentByIdService(id);
  if (!shipment) {
    throw new NotFoundError('Shipment not found');
  }
  return successResponse(c, shipment, 'Shipment retrieved successfully');
};

export const getShipmentByEvgCode = async (c: Context) => {
  const evgCode = c.req.param('evgCode');
  const shipment = await shipmentsService.getShipmentByEvgCodeService(evgCode);
  return successResponse(c, shipment, 'Shipment retrieved successfully');
};

export const createShipment = async (c: Context) => {
   const body = await c.req.json();
   const {
     shipmentCode,
     evgCode,
     billOfLading,
     containerNumber,
     clientId,
     assignedStaffId,
     description,
     originCity,
     originCountry,
     destinationCity,
     destinationCountry,
     transportMode,
     status,
     progressPercent,
     estimatedDeliveryDate
   } = body;

   if (!shipmentCode || !clientId) {
     throw new ValidationError('Shipment code and client ID are required');
   }

  const shipment = await shipmentsService.createShipmentService({
    shipmentCode,
    evgCode,
    billOfLading,
    containerNumber,
    clientId,
    assignedStaffId,
    description,
    originCity,
    originCountry,
    destinationCity,
    destinationCountry,
    transportMode,
    status,
    progressPercent,
    estimatedDeliveryDate
  });

  return successResponse(c, shipment, 'Shipment created successfully', 201);
};

export const updateShipment = async (c: Context) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const shipment = await shipmentsService.updateShipmentService(id, body);
  if (!shipment) {
    throw new NotFoundError('Shipment not found');
  }
  return successResponse(c, shipment, 'Shipment updated successfully');
};

export const deleteShipment = async (c: Context) => {
  const id = c.req.param('id');
  const result = await shipmentsService.deleteShipmentService(id);
  return successResponse(c, { message: result }, 'Shipment deleted successfully');
};