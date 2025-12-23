import prisma from '../../config/prisma.js';
import { NotFoundError, InternalServerError, BadRequestError } from '../../errors/customErrors.js';
import { validateUUID } from '../../utils/uuid.js';

// Generate unique EVG code
const generateUniqueEvgCode = async (): Promise<string> => {
    let evgCode: string;
    let attempts = 0;
    const maxAttempts = 10;
    do {
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        evgCode = `EVG${randomNum}`;
        attempts++;
        if (attempts > maxAttempts) {
            throw new InternalServerError('Failed to generate unique EVG code');
        }
    } while (await prisma.shipment.findUnique({ where: { evgCode } }));
    return evgCode;
};

interface ShipmentResponse {
    Id: string;
    ShipmentCode: string;
    EVGCode: string;
    BillOfLading?: string;
    ContainerNumber?: string;
    ClientId: string;
    AssignedStaffId?: string;
    Description?: string;
    OriginCity?: string;
    OriginCountry?: string;
    DestinationCity?: string;
    DestinationCountry?: string;
    TransportMode?: string;
    Status: string;
    ProgressPercent: number;
    EstimatedDeliveryDate?: Date;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}

// Get all shipments
export const getAllShipmentsService = async (): Promise<ShipmentResponse[]> => {
    const shipments = await prisma.shipment.findMany();
    return shipments.map(shipment => ({
        Id: shipment.id,
        ShipmentCode: shipment.shipmentCode,
        EVGCode: shipment.evgCode,
        BillOfLading: shipment.billOfLading || undefined,
        ContainerNumber: shipment.containerNumber || undefined,
        ClientId: shipment.clientId,
        AssignedStaffId: shipment.assignedStaffId || undefined,
        Description: shipment.description || undefined,
        OriginCity: shipment.originCity || undefined,
        OriginCountry: shipment.originCountry || undefined,
        DestinationCity: shipment.destinationCity || undefined,
        DestinationCountry: shipment.destinationCountry || undefined,
        TransportMode: shipment.transportMode || undefined,
        Status: shipment.status,
        ProgressPercent: shipment.progressPercent,
        EstimatedDeliveryDate: shipment.estimatedDeliveryDate || undefined,
        CreatedAt: shipment.createdAt,
        UpdatedAt: shipment.updatedAt || undefined,
    }));
}

// Get shipment by ID
export const getShipmentByIdService = async (id: string): Promise<ShipmentResponse> => {
  validateUUID(id);
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
    });
    if (!shipment) {
      throw new NotFoundError('Shipment not found');
    }
    return {
      Id: shipment.id,
      ShipmentCode: shipment.shipmentCode,
      EVGCode: shipment.evgCode,
      BillOfLading: shipment.billOfLading || undefined,
      ContainerNumber: shipment.containerNumber || undefined,
      ClientId: shipment.clientId,
      AssignedStaffId: shipment.assignedStaffId || undefined,
      Description: shipment.description || undefined,
      OriginCity: shipment.originCity || undefined,
      OriginCountry: shipment.originCountry || undefined,
      DestinationCity: shipment.destinationCity || undefined,
      DestinationCountry: shipment.destinationCountry || undefined,
      TransportMode: shipment.transportMode || undefined,
      Status: shipment.status,
      ProgressPercent: shipment.progressPercent,
      EstimatedDeliveryDate: shipment.estimatedDeliveryDate || undefined,
      CreatedAt: shipment.createdAt,
      UpdatedAt: shipment.updatedAt || undefined,
    };
  } catch (error: any) {
    console.log('Error in getShipmentByIdService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('Shipment not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to retrieve shipment');
  }
}

// Create shipment
export const createShipmentService = async (shipmentData: {
    shipmentCode: string;
    evgCode?: string;
    billOfLading?: string;
    containerNumber?: string;
    clientId: string;
    assignedStaffId?: string;
    description?: string;
    originCity?: string;
    originCountry?: string;
    destinationCity?: string;
    destinationCountry?: string;
    transportMode?: string;
    status?: string;
    progressPercent?: number;
    estimatedDeliveryDate?: string | Date;
}): Promise<ShipmentResponse | null> => {
    validateUUID(shipmentData.clientId);
    if (shipmentData.assignedStaffId) {
        validateUUID(shipmentData.assignedStaffId);
    }
    let evgCode = shipmentData.evgCode;
    if (!evgCode) {
        evgCode = await generateUniqueEvgCode();
    } else {
        // Check if provided evgCode already exists
        const existingShipment = await prisma.shipment.findUnique({
            where: { evgCode },
        });
        if (existingShipment) {
            throw new BadRequestError('EVG Code already exists');
        }
    }
    console.log('Creating shipment with evgCode:', evgCode);
    const parsedDate = shipmentData.estimatedDeliveryDate ? new Date(shipmentData.estimatedDeliveryDate) : undefined;
    const shipment = await prisma.shipment.create({
        data: {
            shipmentCode: shipmentData.shipmentCode,
            evgCode,
            billOfLading: shipmentData.billOfLading,
            containerNumber: shipmentData.containerNumber,
            clientId: shipmentData.clientId,
            assignedStaffId: shipmentData.assignedStaffId,
            description: shipmentData.description,
            originCity: shipmentData.originCity,
            originCountry: shipmentData.originCountry,
            destinationCity: shipmentData.destinationCity,
            destinationCountry: shipmentData.destinationCountry,
            transportMode: shipmentData.transportMode || 'OCEAN',
            status: shipmentData.status || 'PROCESSING',
            progressPercent: shipmentData.progressPercent || 0,
            estimatedDeliveryDate: parsedDate,
        },
    });
    return {
        Id: shipment.id,
        ShipmentCode: shipment.shipmentCode,
        EVGCode: shipment.evgCode,
        BillOfLading: shipment.billOfLading || undefined,
        ContainerNumber: shipment.containerNumber || undefined,
        ClientId: shipment.clientId,
        AssignedStaffId: shipment.assignedStaffId || undefined,
        Description: shipment.description || undefined,
        OriginCity: shipment.originCity || undefined,
        OriginCountry: shipment.originCountry || undefined,
        DestinationCity: shipment.destinationCity || undefined,
        DestinationCountry: shipment.destinationCountry || undefined,
        TransportMode: shipment.transportMode || undefined,
        Status: shipment.status,
        ProgressPercent: shipment.progressPercent,
        EstimatedDeliveryDate: shipment.estimatedDeliveryDate || undefined,
        CreatedAt: shipment.createdAt,
        UpdatedAt: shipment.updatedAt || undefined,
    };
}

// Update shipment
export const updateShipmentService = async (id: string, shipmentData: Partial<{
  shipmentCode: string;
  evgCode: string;
  billOfLading: string;
  containerNumber: string;
  assignedStaffId: string;
  description: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  transportMode: string;
  status: string;
  progressPercent: number;
  estimatedDeliveryDate: string | Date;
}>): Promise<ShipmentResponse> => {
  validateUUID(id);
  if (shipmentData.assignedStaffId) {
    validateUUID(shipmentData.assignedStaffId);
  }
  const parsedDate = shipmentData.estimatedDeliveryDate ? new Date(shipmentData.estimatedDeliveryDate) : undefined;
  try {
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        shipmentCode: shipmentData.shipmentCode,
        evgCode: shipmentData.evgCode,
        billOfLading: shipmentData.billOfLading,
        containerNumber: shipmentData.containerNumber,
        assignedStaffId: shipmentData.assignedStaffId,
        description: shipmentData.description,
        originCity: shipmentData.originCity,
        originCountry: shipmentData.originCountry,
        destinationCity: shipmentData.destinationCity,
        destinationCountry: shipmentData.destinationCountry,
        transportMode: shipmentData.transportMode,
        status: shipmentData.status,
        progressPercent: shipmentData.progressPercent,
        estimatedDeliveryDate: parsedDate,
        updatedAt: new Date(),
      },
    });
    return {
      Id: updatedShipment.id,
      ShipmentCode: updatedShipment.shipmentCode,
      EVGCode: updatedShipment.evgCode,
      BillOfLading: updatedShipment.billOfLading || undefined,
      ContainerNumber: updatedShipment.containerNumber || undefined,
      ClientId: updatedShipment.clientId,
      AssignedStaffId: updatedShipment.assignedStaffId || undefined,
      Description: updatedShipment.description || undefined,
      OriginCity: updatedShipment.originCity || undefined,
      OriginCountry: updatedShipment.originCountry || undefined,
      DestinationCity: updatedShipment.destinationCity || undefined,
      DestinationCountry: updatedShipment.destinationCountry || undefined,
      TransportMode: updatedShipment.transportMode || undefined,
      Status: updatedShipment.status,
      ProgressPercent: updatedShipment.progressPercent,
      EstimatedDeliveryDate: updatedShipment.estimatedDeliveryDate || undefined,
      CreatedAt: updatedShipment.createdAt,
      UpdatedAt: updatedShipment.updatedAt || undefined,
    };
  } catch (error: any) {
    console.log('Error in updateShipmentService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('Shipment not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to update shipment');
  }
}

// Delete shipment
export const deleteShipmentService = async (id: string): Promise<void> => {
  validateUUID(id);
  try {
    await prisma.shipment.delete({
      where: { id },
    });
  } catch (error: any) {
    console.log('Error in deleteShipmentService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('Shipment not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to delete shipment');
  }
}