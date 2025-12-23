export interface MediaUpload {
  id: string;
  uploadedBy: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  cloudinaryPublicId: string | null;
  createdAt: Date;
}

export interface UploadRequest {
  file: File;
  mediaType: 'image' | 'video' | 'document';
}