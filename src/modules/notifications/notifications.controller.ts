import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as notificationsService from './notifications.service.js';
import type { CreateNotificationRequest } from './notifications.types.js';
import { NotFoundError } from '../../errors/customErrors.js';

export const getNotifications = async (c: Context) => {
  const userId = c.get('userId');
  const notifications = await notificationsService.getNotificationsService(userId);
  return successResponse(c, notifications, 'Notifications retrieved successfully');
};

export const getNotificationById = async (c: Context) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const notification = await notificationsService.getNotificationByIdService(id, userId);
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  return successResponse(c, notification, 'Notification retrieved successfully');
};

export const createNotification = async (c: Context) => {
  const body: CreateNotificationRequest = await c.req.json();
  const notification = await notificationsService.createNotificationService(body);
  return successResponse(c, notification, 'Notification created successfully', 201);
};

export const markAsRead = async (c: Context) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const success = await notificationsService.markAsReadService(id, userId);
  if (!success) {
    throw new NotFoundError('Notification not found');
  }
  return successResponse(c, null, 'Notification marked as read');
};

export const deleteNotification = async (c: Context) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const success = await notificationsService.deleteNotificationService(id, userId);
  if (!success) {
    throw new NotFoundError('Notification not found');
  }
  return successResponse(c, null, 'Notification deleted successfully');
};