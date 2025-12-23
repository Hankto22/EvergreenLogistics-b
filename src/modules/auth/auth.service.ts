import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { generateToken } from '../../config/jwt.js';
import type { User, LoginRequest, RegisterRequest } from './auth.types.js';
import type { UserRole } from '../../middleware/role.middleware.js';
import { createUserService } from '../users/users.service.js';
import { AuthenticationError, ConflictError } from '../../errors/customErrors.js';

export const login = async (data: LoginRequest): Promise<{ user: User; token: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated');
  }

  if (!data.password || typeof data.password !== 'string' || data.password.trim() === '') {
    throw new AuthenticationError('Invalid credentials');
  }
  if (!user.passwordHash || typeof user.passwordHash !== 'string') {
    console.error('User passwordHash is invalid for email:', data.email);
    throw new AuthenticationError('Invalid credentials');
  }
  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role as UserRole });
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
      isActive: user.isActive,
    },
    token,
  };
};

export const register = async (data: RegisterRequest): Promise<{ user: User; token: string }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new ConflictError('User already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
      fullName: data.fullName,
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role as UserRole });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
      isActive: user.isActive,
    },
    token,
  };
};

export const createUser = async (first_name: string, last_name: string, email: string, phone_number: string, password: string, user_type: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await createUserService(first_name, last_name, email, phone_number, hashedPassword, user_type);
};
