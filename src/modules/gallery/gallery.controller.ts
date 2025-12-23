import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as galleryService from './gallery.service.js';
import { NotFoundError, ValidationError } from '../../errors/customErrors.js';

export const getGalleryItems = async (c: Context) => {
  const items = await galleryService.getAllGalleryItemsService();
  return successResponse(c, items, 'Gallery items retrieved successfully');
};

export const getGalleryItemById = async (c: Context) => {
  const id = c.req.param('id');
  const item = await galleryService.getGalleryItemByIdService(id);
  if (!item) {
    throw new NotFoundError('Gallery item not found');
  }
  return successResponse(c, item, 'Gallery item retrieved successfully');
};

export const createGalleryItem = async (c: Context) => {
  const body = await c.req.json();
  const {
    title,
    category,
    description,
    mediaType,
    mediaUrl,
    thumbnailUrl,
    createdByUserId
  } = body;

  if (!title || !category || !mediaType || !mediaUrl || !createdByUserId) {
    throw new ValidationError('Title, category, mediaType, mediaUrl, and createdByUserId are required');
  }

  const item = await galleryService.createGalleryItemService({
    title,
    category,
    description,
    mediaType,
    mediaUrl,
    thumbnailUrl,
    createdByUserId
  });

  return successResponse(c, item, 'Gallery item created successfully', 201);
};

export const updateGalleryItem = async (c: Context) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const item = await galleryService.updateGalleryItemService(id, body);
  if (!item) {
    throw new NotFoundError('Gallery item not found');
  }
  return successResponse(c, item, 'Gallery item updated successfully');
};

export const deleteGalleryItem = async (c: Context) => {
  const id = c.req.param('id');
  const result = await galleryService.deleteGalleryItemService(id);
  return successResponse(c, { message: result }, 'Gallery item deleted successfully');
};