export interface Notification {
  id: string;
  userId: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  message: string;
}