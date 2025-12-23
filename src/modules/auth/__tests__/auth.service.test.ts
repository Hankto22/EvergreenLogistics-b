import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import prisma from '../../../config/prisma.js';
import { generateToken } from '../../../config/jwt.js';
import { createUserService } from '../../users/users.service.js';
import { login, register, createUser } from '../auth.service.js';

// Mock dependencies
vi.mock('../../../config/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../../../config/jwt.js', () => ({
  generateToken: vi.fn(),
}));

vi.mock('../../users/users.service.js', () => ({
  createUserService: vi.fn(),
}));

describe('Auth Service - Hash/Verify Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password correctly in register', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'CLIENT',
        fullName: 'Test User',
        isActive: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue('token');

      const result = await register({
        email: 'test@example.com',
        password: 'password123',
        role: 'CLIENT',
        fullName: 'Test User',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: expect.any(String),
          role: 'CLIENT',
          fullName: 'Test User',
        },
      });

      // Verify the passwordHash is a bcrypt hash
      const hashedPassword = (prisma.user.create as any).mock.calls[0][0].data.passwordHash;
      const isValid = await bcrypt.compare('password123', hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should hash password correctly in createUser', async () => {
      (createUserService as any).mockResolvedValue({});

      await createUser('John', 'Doe', 'john@example.com', '1234567890', 'password123', 'CLIENT');

      expect(createUserService).toHaveBeenCalledWith(
        'John',
        'Doe',
        'john@example.com',
        '1234567890',
        expect.any(String),
        'CLIENT'
      );

      const hashedPassword = (createUserService as any).mock.calls[0][4];
      const isValid = await bcrypt.compare('password123', hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password in login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'CLIENT',
        fullName: 'Test User',
        isActive: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue('token');

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'CLIENT',
          fullName: 'Test User',
          isActive: true,
        },
        token: 'token',
      });
    });

    it('should reject incorrect password in login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'CLIENT',
        fullName: 'Test User',
        isActive: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject empty password', async () => {
      const hashedPassword = await bcrypt.hash('', 10);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'user',
        fullName: 'Test User',
        isActive: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        login({
          email: 'test@example.com',
          password: '',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle very long password', async () => {
      const longPassword = 'a'.repeat(1000);
      const hashedPassword = await bcrypt.hash(longPassword, 10);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'user',
        fullName: 'Test User',
        isActive: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue('token');

      const result = await login({
        email: 'test@example.com',
        password: longPassword,
      });

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('Login Function', () => {
    it('should throw error when user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when user is inactive', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        email: 'inactive@example.com',
        passwordHash: hashedPassword,
        role: 'CLIENT',
        fullName: 'Inactive User',
        isActive: false,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(
        login({
          email: 'inactive@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Account is deactivated');
    });
  });

  describe('Register Function', () => {
    it('should throw error when user already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'existing@example.com',
        passwordHash: 'hashed',
        role: 'CLIENT',
        fullName: 'Existing User',
        isActive: true,
      };

      (prisma.user.findUnique as any).mockResolvedValue(existingUser);

      await expect(
        register({
          email: 'existing@example.com',
          password: 'password123',
          role: 'CLIENT',
          fullName: 'New User',
        })
      ).rejects.toThrow('User already exists');
    });
  });
});