import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as usersService from './users.service.js';
import { NotFoundError, ValidationError, InternalServerError } from '../../errors/customErrors.js';

export const getUsers = async (c: Context) => {
  const users = await usersService.getAllUsersService();
  return successResponse(c, users, 'Users retrieved successfully');
};

export const getUserById = async (c: Context) => {
  const id = c.req.param('id');
  const user = await usersService.getUserByIdService(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return successResponse(c, user, 'User retrieved successfully');
};

export const updateUser = async (c: Context) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { fullName, email } = body;

  if (!fullName || !email) {
    throw new ValidationError('Full name and email are required');
  }

  const user = await usersService.updateUserService(id, fullName, email);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return successResponse(c, user, 'User updated successfully');
};

export const deleteUser = async (c: Context) => {
  const id = c.req.param('id');
  const result = await usersService.deleteUserService(id);
  return successResponse(c, { message: result }, 'User deleted successfully');
};