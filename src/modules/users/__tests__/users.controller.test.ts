import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers, getUserById, updateUser, deleteUser } from '../users.controller.js';
import * as usersService from '../users.service.js';

// Mock the users service
vi.mock('../users.service.js', () => ({
  getAllUsersService: vi.fn(),
  getUserByIdService: vi.fn(),
  updateUserService: vi.fn(),
  deleteUserService: vi.fn(),
}));

// Mock Hono Context
const mockContext = {
  json: vi.fn(),
  req: {
    param: vi.fn(),
    json: vi.fn(),
  },
};

describe('Users Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users successfully', async () => {
      const mockUsers = [
        { Id: '1', FullName: 'John Doe', Email: 'john@example.com', Role: 'CLIENT', IsActive: true },
      ];
      (usersService.getAllUsersService as any).mockResolvedValue(mockUsers);

      const result = await getUsers(mockContext as any);

      expect(usersService.getAllUsersService).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'Users retrieved successfully', data: mockUsers }, 200);
    });
  });

  describe('getUserById', () => {
    it('should return user successfully', async () => {
      const mockUser = { Id: '1', FullName: 'John Doe', Email: 'john@example.com', Role: 'CLIENT', IsActive: true };
      (usersService.getUserByIdService as any).mockResolvedValue(mockUser);
      mockContext.req.param.mockReturnValue('1');

      const result = await getUserById(mockContext as any);

      expect(usersService.getUserByIdService).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'User retrieved successfully', data: mockUser }, 200);
    });

    it('should throw NotFoundError when user not found', async () => {
      (usersService.getUserByIdService as any).mockResolvedValue(null);
      mockContext.req.param.mockReturnValue('1');

      await expect(getUserById(mockContext as any)).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = { Id: '1', FullName: 'Jane Doe', Email: 'jane@example.com', Role: 'CLIENT', IsActive: true };
      const body = { fullName: 'Jane Doe', email: 'jane@example.com' };
      (usersService.updateUserService as any).mockResolvedValue(mockUser);
      mockContext.req.param.mockReturnValue('1');
      mockContext.req.json.mockResolvedValue(body);

      const result = await updateUser(mockContext as any);

      expect(usersService.updateUserService).toHaveBeenCalledWith('1', 'Jane Doe', 'jane@example.com');
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'User updated successfully', data: mockUser }, 200);
    });

    it('should throw ValidationError when fullName or email missing', async () => {
      const body = { fullName: 'Jane Doe' };
      mockContext.req.param.mockReturnValue('1');
      mockContext.req.json.mockResolvedValue(body);

      await expect(updateUser(mockContext as any)).rejects.toThrow('Full name and email are required');
    });

    it('should throw NotFoundError when user not found', async () => {
      const body = { fullName: 'Jane Doe', email: 'jane@example.com' };
      (usersService.updateUserService as any).mockResolvedValue(null);
      mockContext.req.param.mockReturnValue('1');
      mockContext.req.json.mockResolvedValue(body);

      await expect(updateUser(mockContext as any)).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (usersService.deleteUserService as any).mockResolvedValue(undefined);
      mockContext.req.param.mockReturnValue('1');

      const result = await deleteUser(mockContext as any);

      expect(usersService.deleteUserService).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith({ success: true, message: 'User deleted successfully', data: { message: undefined } }, 200);
    });
  });
});