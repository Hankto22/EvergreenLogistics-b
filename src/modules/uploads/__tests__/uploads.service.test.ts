import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadMediaService } from '../uploads.service.js';
import prisma from '../../../config/prisma.js';
import cloudinary from '../../../config/cloudinary.js';

// Mock dependencies
vi.mock('../../../config/prisma.js', () => ({
  default: {
    mediaUpload: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../../config/cloudinary.js', () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

describe('Uploads Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadMediaService', () => {
    it('should upload image successfully', async () => {
      const mockUploadResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: '123-image',
      };

      const mockRecord = {
        id: '1',
        uploadedBy: 'user1',
        mediaUrl: 'https://cloudinary.com/image.jpg',
        mediaType: 'image',
        cloudinaryPublicId: '123-image',
        createdAt: new Date(),
      };

      // Mock Cloudinary upload
      const mockStream = {
        end: vi.fn(),
      };
      (cloudinary.uploader.upload_stream as any).mockReturnValue(mockStream);
      mockStream.end.mockImplementation((buffer: Buffer) => {
        // Simulate async callback
        setTimeout(() => {
          const callback = (cloudinary.uploader.upload_stream as any).mock.calls[0][1];
          callback(null, mockUploadResult);
        }, 0);
      });

      (prisma.mediaUpload.create as any).mockResolvedValue(mockRecord);

      const result = await uploadMediaService(
        Buffer.from('fake image data'),
        'test.jpg',
        'image',
        'user1'
      );

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          resource_type: 'image',
          public_id: expect.stringContaining('test.jpg'),
          folder: 'evergreen-uploads',
        },
        expect.any(Function)
      );

      expect(prisma.mediaUpload.create).toHaveBeenCalledWith({
        data: {
          uploadedBy: 'user1',
          mediaUrl: 'https://cloudinary.com/image.jpg',
          mediaType: 'image',
          cloudinaryPublicId: '123-image',
        },
      });

      expect(result).toEqual({
        id: '1',
        uploadedBy: 'user1',
        mediaUrl: 'https://cloudinary.com/image.jpg',
        mediaType: 'image',
        cloudinaryPublicId: '123-image',
        createdAt: mockRecord.createdAt,
      });
    });

    it('should upload video successfully', async () => {
      const mockUploadResult = {
        secure_url: 'https://cloudinary.com/video.mp4',
        public_id: '123-video',
      };

      const mockRecord = {
        id: '2',
        uploadedBy: 'user2',
        mediaUrl: 'https://cloudinary.com/video.mp4',
        mediaType: 'video',
        cloudinaryPublicId: '123-video',
        createdAt: new Date(),
      };

      // Mock Cloudinary upload
      const mockStream = {
        end: vi.fn(),
      };
      (cloudinary.uploader.upload_stream as any).mockReturnValue(mockStream);
      mockStream.end.mockImplementation((buffer: Buffer) => {
        setTimeout(() => {
          const callback = (cloudinary.uploader.upload_stream as any).mock.calls[0][1];
          callback(null, mockUploadResult);
        }, 0);
      });

      (prisma.mediaUpload.create as any).mockResolvedValue(mockRecord);

      const result = await uploadMediaService(
        Buffer.from('fake video data'),
        'test.mp4',
        'video',
        'user2'
      );

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          resource_type: 'video',
          public_id: expect.stringContaining('test.mp4'),
          folder: 'evergreen-uploads',
        },
        expect.any(Function)
      );

      expect(result.mediaType).toBe('video');
    });

    it('should throw error on Cloudinary upload failure', async () => {
      const mockStream = {
        end: vi.fn(),
      };
      (cloudinary.uploader.upload_stream as any).mockReturnValue(mockStream);
      mockStream.end.mockImplementation((buffer: Buffer) => {
        setTimeout(() => {
          const callback = (cloudinary.uploader.upload_stream as any).mock.calls[0][1];
          callback(new Error('Upload failed'), null);
        }, 0);
      });

      await expect(
        uploadMediaService(
          Buffer.from('fake data'),
          'test.jpg',
          'image',
          'user1'
        )
      ).rejects.toThrow('Failed to upload media');
    });

    it('should throw error on database save failure', async () => {
      const mockUploadResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: '123-image',
      };

      const mockStream = {
        end: vi.fn(),
      };
      (cloudinary.uploader.upload_stream as any).mockReturnValue(mockStream);
      mockStream.end.mockImplementation((buffer: Buffer) => {
        setTimeout(() => {
          const callback = (cloudinary.uploader.upload_stream as any).mock.calls[0][1];
          callback(null, mockUploadResult);
        }, 0);
      });

      (prisma.mediaUpload.create as any).mockRejectedValue(new Error('DB error'));

      await expect(
        uploadMediaService(
          Buffer.from('fake data'),
          'test.jpg',
          'image',
          'user1'
        )
      ).rejects.toThrow('Failed to upload media');
    });
  });
});