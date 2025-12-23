import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMe } from '../auth.controller.js';
import * as usersService from '../../users/users.service.js';

// Mock the users service
vi.mock('../../users/users.service.js', () => ({
  getUserByIdService: vi.fn(),
}));

// Mock Hono Context
const mockContext = {
  json: vi.fn(),
  get: vi.fn(),
};

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return user info successfully when authenticated', async () => {
      const mockUser = {
        Id: '1',
        Email: 'test@example.com',
        Role: 'CLIENT',
        FullName: 'Test User',
      };
      const userPayload = { id: '1', email: 'test@example.com', role: 'CLIENT' };

      (usersService.getUserByIdService as any).mockResolvedValue(mockUser);
      mockContext.get.mockReturnValue(userPayload);

      const result = await getMe(mockContext as any);

      expect(usersService.getUserByIdService).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'User info retrieved successfully',
        data: {
          id: '1',
          role: 'CLIENT',
          fullName: 'Test User',
          email: 'test@example.com',
        }
      }, 200);
    });

    it('should throw error when user not found', async () => {
      const userPayload = { id: '1', email: 'test@example.com', role: 'CLIENT' };

      (usersService.getUserByIdService as any).mockRejectedValue(new Error('User not found'));
      mockContext.get.mockReturnValue(userPayload);

      await expect(getMe(mockContext as any)).rejects.toThrow('User not found');
    });
  });
});