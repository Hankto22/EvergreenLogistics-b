import prisma from '../../config/prisma.js';
import { NotFoundError, InternalServerError, BadRequestError } from '../../errors/customErrors.js';
import { validateUUID } from '../../utils/uuid.js';

interface GalleryItemResponse {
    id: string;
    title: string;
    category: string;
    description: string | null;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    createdByUserId: string;
    createdAt: Date;
}

// Get all gallery items
export const getAllGalleryItemsService = async (): Promise<GalleryItemResponse[]> => {
    const result = await prisma.galleryItem.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return result;
}

// Get gallery item by ID
export const getGalleryItemByIdService = async (id: string): Promise<GalleryItemResponse | null> => {
    validateUUID(id);
    try {
        const result = await prisma.galleryItem.findUnique({
            where: { id },
        });
        if (!result) {
            throw new NotFoundError('Gallery item not found');
        }
        return result;
    } catch (error: any) {
        console.log('Error in getGalleryItemByIdService:', error);
        if (error.code === 'P2025') {
            throw new NotFoundError('Gallery item not found');
        }
        if (error.code === 'P2023') {
            throw new BadRequestError('Invalid UUID format');
        }
        throw new InternalServerError('Failed to retrieve gallery item');
    }
}

// Create gallery item
export const createGalleryItemService = async (itemData: {
    title: string;
    category: string;
    description?: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    createdByUserId: string;
}): Promise<GalleryItemResponse | null> => {
    validateUUID(itemData.createdByUserId);
    const result = await prisma.galleryItem.create({
        data: {
            title: itemData.title,
            category: itemData.category,
            description: itemData.description,
            mediaType: itemData.mediaType,
            mediaUrl: itemData.mediaUrl,
            thumbnailUrl: itemData.thumbnailUrl,
            createdByUserId: itemData.createdByUserId,
        },
    });
    return result;
}

// Update gallery item
export const updateGalleryItemService = async (id: string, itemData: Partial<{
    title: string;
    category: string;
    description: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string;
}>): Promise<GalleryItemResponse | null> => {
    validateUUID(id);
    try {
        const result = await prisma.galleryItem.update({
            where: { id },
            data: itemData,
        });
        return result;
    } catch (error: any) {
        console.log('Error in updateGalleryItemService:', error);
        if (error.code === 'P2025') {
            throw new NotFoundError('Gallery item not found');
        }
        if (error.code === 'P2023') {
            throw new BadRequestError('Invalid UUID format');
        }
        throw new InternalServerError('Failed to update gallery item');
    }
}

// Delete gallery item
export const deleteGalleryItemService = async (id: string): Promise<string> => {
    validateUUID(id);
    try {
        await prisma.galleryItem.delete({
            where: { id },
        });
        return "Gallery item deleted successfully";
    } catch (error: any) {
        console.log('Error in deleteGalleryItemService:', error);
        if (error.code === 'P2025') {
            throw new NotFoundError('Gallery item not found');
        }
        if (error.code === 'P2023') {
            throw new BadRequestError('Invalid UUID format');
        }
        throw new InternalServerError('Failed to delete gallery item');
    }
}