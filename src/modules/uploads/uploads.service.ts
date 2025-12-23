import prisma from '../../config/prisma.js';
import cloudinary from '../../config/cloudinary.js';
import type { MediaUpload } from './uploads.types.js';

export const uploadMediaService = async (
  fileBuffer: Buffer,
  fileName: string,
  mediaType: string,
  uploadedBy: string
): Promise<MediaUpload> => {
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Upload to Cloudinary with timeout
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: mediaType === 'video' ? 'video' : 'image',
            public_id: `${Date.now()}-${fileName}`,
            folder: 'evergreen-uploads',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(fileBuffer);
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);

      // Save to database
      const record = await prisma.mediaUpload.create({
        data: {
          uploadedBy,
          mediaUrl: uploadResult.secure_url,
          mediaType,
          cloudinaryPublicId: uploadResult.public_id,
        },
      });

      return {
        id: record.id,
        uploadedBy: record.uploadedBy,
        mediaUrl: record.mediaUrl,
        mediaType: record.mediaType,
        cloudinaryPublicId: record.cloudinaryPublicId,
        createdAt: record.createdAt,
      };
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error('Failed to upload media');
      }
    }
  }
  throw new Error('Failed to upload media');
};