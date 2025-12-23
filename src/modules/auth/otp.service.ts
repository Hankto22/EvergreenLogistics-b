import prisma from '../../config/prisma.js';
import { sendNotificationEmail } from '../../mailer/mailer.js';
import { getUserByEmailService } from '../users/users.service.js';

export const generateOtp = async (userId: string): Promise<string> => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
    data: {
      userId,
      otpCode,
      expiresAt,
    },
  });

  return otpCode;
};

export const verifyOtp = async (email: string, otpCode: string): Promise<boolean> => {
  const user = await getUserByEmailService(email);
  if (!user) {
    return false;
  }

  const otp = await prisma.otp.findFirst({
    where: {
      userId: user.Id,
      otpCode,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otp) {
    return false;
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  return true;
};

export const sendOtpEmail = async (email: string, otpCode: string): Promise<string> => {
  const user = await getUserByEmailService(email);
  if (!user) {
    return 'User not found';
  }

  const subject = 'Your OTP Code';
  const message = `Your OTP code is: ${otpCode}. It will expire in 10 minutes.`;

  return await sendNotificationEmail(email, user.FullName, subject, message);
};

export const requestOtp = async (email: string): Promise<string> => {
  const user = await getUserByEmailService(email);
  if (!user) {
    return 'User not found';
  }

  const otpCode = await generateOtp(user.Id);

  const emailResult = await sendOtpEmail(email, otpCode);

  return emailResult === 'Notification email sent successfully' ? 'OTP sent successfully' : 'Failed to send OTP';
};