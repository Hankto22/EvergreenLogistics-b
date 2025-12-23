import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as dashboardService from './dashboard.service.js';

export const getAdminDashboard = async (c: Context) => {
  const data = await dashboardService.getAdminDashboardData();
  return successResponse(c, data, 'Admin dashboard data retrieved successfully');
};

export const getUserDashboard = async (c: Context) => {
  const user = c.get('user'); // Assuming middleware sets user
  const userId = user.id || user.user_id; // Handle both possible formats
  const data = await dashboardService.getUserDashboardData(userId);
  return successResponse(c, data, 'User dashboard data retrieved successfully');
};

export const getRecentOrders = async (c: Context) => {
  const limit = parseInt(c.req.query('limit') || '5', 10);
  const data = await dashboardService.getRecentOrdersService(limit);
  return successResponse(c, data, 'Recent orders retrieved successfully');
};