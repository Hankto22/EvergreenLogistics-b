import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as uploadsService from './uploads.service.js';
import { ValidationError } from '../../errors/customErrors.js';

export const uploadMedia = async (c: Context) => {
  const userId = c.get('userId');
  const formData = await c.req.formData();

  const file = formData.get('file') as File;
  const mediaType = formData.get('mediaType') as string;

  if (!file) {
    throw new ValidationError('File is required');
  }

  if (!mediaType || !['image', 'video', 'document'].includes(mediaType)) {
    throw new ValidationError('Valid mediaType is required (image, video, document)');
  }

  // Convert file to buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;

  const result = await uploadsService.uploadMediaService(fileBuffer, fileName, mediaType, userId);

  return successResponse(c, result, 'Media uploaded successfully', 201);
};