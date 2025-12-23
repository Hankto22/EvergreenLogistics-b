import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../../../config/prisma.js';
import { getUserByEmailService } from '../../users/users.service.js';
import { sendNotificationEmail } from '../../../mailer/mailer.js';
import { generateOtp, verifyOtp, sendOtpEmail, requestOtp } from '../otp.service.js';

// Mock dependencies
vi.mock('../../../config/prisma.js', () => ({
  default: {
    otp: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../../users/users.service.js', () => ({
  getUserByEmailService: vi.fn(),
}));

vi.mock('../../../mailer/mailer.js', () => ({
  sendNotificationEmail: vi.fn(),
}));

describe('OTP Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP and store it in database', async () => {
      (prisma.otp.create as any).mockResolvedValue({});

      const otpCode = await generateOtp('user123');

      expect(otpCode).toMatch(/^\d{6}$/);
      expect(prisma.otp.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          otpCode,
          expiresAt: expect.any(Date),
        },
      });

      const expiresAt = (prisma.otp.create as any).mock.calls[0][0].data.expiresAt;
      const now = new Date();
      const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
      expect(expiresAt.getTime()).toBeLessThanOrEqual(tenMinutesLater.getTime());
    });

    it('should generate different OTPs on multiple calls', async () => {
      (prisma.otp.create as any).mockResolvedValue({});

      const otp1 = await generateOtp('user123');
      const otp2 = await generateOtp('user123');

      expect(otp1).not.toBe(otp2);
      expect(otp1).toMatch(/^\d{6}$/);
      expect(otp2).toMatch(/^\d{6}$/);
    });

    it('should handle OTP with leading zeros', async () => {
      // Mock Math.random to return 0, which should give 100000
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0);

      (prisma.otp.create as any).mockResolvedValue({});

      const otpCode = await generateOtp('user123');

      expect(otpCode).toBe('100000');

      Math.random = originalRandom;
    });
  });

  describe('verifyOtp', () => {
    it('should return true for valid OTP', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };
      const mockOtp = { id: 'otp123', isUsed: false, expiresAt: new Date(Date.now() + 10000) };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.findFirst as any).mockResolvedValue(mockOtp);
      (prisma.otp.update as any).mockResolvedValue({});

      const result = await verifyOtp('test@example.com', '123456');

      expect(result).toBe(true);
      expect(prisma.otp.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          otpCode: '123456',
          isUsed: false,
          expiresAt: {
            gt: expect.any(Date),
          },
        },
      });
      expect(prisma.otp.update).toHaveBeenCalledWith({
        where: { id: 'otp123' },
        data: { isUsed: true },
      });
    });

    it('should return false for non-existent user', async () => {
      (getUserByEmailService as any).mockResolvedValue(null);

      const result = await verifyOtp('nonexistent@example.com', '123456');

      expect(result).toBe(false);
      expect(prisma.otp.findFirst).not.toHaveBeenCalled();
    });

    it('should return false for invalid OTP', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.findFirst as any).mockResolvedValue(null);

      const result = await verifyOtp('test@example.com', '999999');

      expect(result).toBe(false);
    });

    it('should return false for expired OTP', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.findFirst as any).mockResolvedValue(null);

      const result = await verifyOtp('test@example.com', '123456');

      expect(result).toBe(false);
    });

    it('should return false for already used OTP', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.findFirst as any).mockResolvedValue(null);

      const result = await verifyOtp('test@example.com', '123456');

      expect(result).toBe(false);
    });

    it('should handle OTP with special characters (though unlikely)', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.findFirst as any).mockResolvedValue(null);

      const result = await verifyOtp('test@example.com', '12a456');

      expect(result).toBe(false);
    });

    it('should handle empty OTP', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.findFirst as any).mockResolvedValue(null);

      const result = await verifyOtp('test@example.com', '');

      expect(result).toBe(false);
    });
  });

  describe('sendOtpEmail', () => {
    it('should send OTP email successfully', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (sendNotificationEmail as any).mockResolvedValue('Notification email sent successfully');

      const result = await sendOtpEmail('test@example.com', '123456');

      expect(result).toBe('Notification email sent successfully');
      expect(sendNotificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        'Your OTP Code',
        'Your OTP code is: 123456. It will expire in 10 minutes.'
      );
    });

    it('should return error for non-existent user', async () => {
      (getUserByEmailService as any).mockResolvedValue(null);

      const result = await sendOtpEmail('nonexistent@example.com', '123456');

      expect(result).toBe('User not found');
      expect(sendNotificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('requestOtp', () => {
    it('should request OTP successfully', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.create as any).mockResolvedValue({});
      (sendNotificationEmail as any).mockResolvedValue('Notification email sent successfully');

      const result = await requestOtp('test@example.com');

      expect(result).toBe('OTP sent successfully');
    });

    it('should return error for non-existent user', async () => {
      (getUserByEmailService as any).mockResolvedValue(null);

      const result = await requestOtp('nonexistent@example.com');

      expect(result).toBe('User not found');
    });

    it('should return error when email sending fails', async () => {
      const mockUser = { Id: 'user123', FullName: 'Test User' };

      (getUserByEmailService as any).mockResolvedValue(mockUser);
      (prisma.otp.create as any).mockResolvedValue({});
      (sendNotificationEmail as any).mockResolvedValue('Failed to send email');

      const result = await requestOtp('test@example.com');

      expect(result).toBe('Failed to send OTP');
    });
  });
});