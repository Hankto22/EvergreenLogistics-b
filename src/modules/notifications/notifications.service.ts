import prisma from '../../config/prisma.js';
import type { Notification, CreateNotificationRequest } from './notifications.types.js';
import { NotFoundError, InternalServerError, BadRequestError } from '../../errors/customErrors.js';
import { validateUUID } from '../../utils/uuid.js';

export const getNotificationsService = async (userId: string): Promise<Notification[]> => {
  validateUUID(userId);
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));
};

export const getNotificationByIdService = async (id: string, userId: string): Promise<Notification | null> => {
  validateUUID(id);
  validateUUID(userId);
  try {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return {
      id: notification.id,
      userId: notification.userId,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  } catch (error: any) {
    console.log('Error in getNotificationByIdService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('Notification not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to retrieve notification');
  }
};

export const createNotificationService = async (data: CreateNotificationRequest): Promise<Notification> => {
  validateUUID(data.userId);
  const notification = await prisma.notification.create({
    data: { userId: data.userId, message: data.message },
  });
  return {
    id: notification.id,
    userId: notification.userId,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
};

export const markAsReadService = async (id: string, userId: string): Promise<boolean> => {
  validateUUID(id);
  validateUUID(userId);
  try {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    if (result.count === 0) {
      throw new NotFoundError('Notification not found');
    }
    return true;
  } catch (error: any) {
    console.log('Error in markAsReadService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('Notification not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to mark notification as read');
  }
};

export const deleteNotificationService = async (id: string, userId: string): Promise<boolean> => {
  validateUUID(id);
  validateUUID(userId);
  try {
    const result = await prisma.notification.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      throw new NotFoundError('Notification not found');
    }
    return true;
  } catch (error: any) {
    console.log('Error in deleteNotificationService:', error);
    if (error.code === 'P2025') {
      throw new NotFoundError('Notification not found');
    }
    if (error.code === 'P2023') {
      throw new BadRequestError('Invalid UUID format');
    }
    throw new InternalServerError('Failed to delete notification');
  }
};