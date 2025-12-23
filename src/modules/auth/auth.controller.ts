import type { Context } from 'hono';
import { successResponse } from '../../utils/apiResponse.js';
import * as authService from './auth.service.js';
import type { LoginRequest, RegisterRequest, CreateUserRequest, UserPayload, RequestOtpRequest, VerifyOtpRequest } from './auth.types.js';
import { getUserByEmailService, getUserByIdService } from '../users/users.service.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { sendNotificationEmail } from '../../mailer/mailer.js';
import bcrypt from 'bcryptjs';
import { UserRegistrationSchema, LoginSchema, ResetPasswordSchema, RequestOtpSchema, VerifyOtpSchema } from '../../validators/zod.validator.js';
import * as otpService from './otp.service.js';
import { generateToken } from '../../config/jwt.js';
import { NotFoundError, ValidationError, ConflictError, AuthenticationError, InternalServerError } from '../../errors/customErrors.js';

export const login = async (c: Context) => {
  const body = await c.req.json();
  const validation = LoginSchema.safeParse(body);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new ValidationError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`);
  }
  const result = await authService.login(body as LoginRequest);
  return successResponse(c, result, 'Login successful');
};

export const register = async (c: Context) => {
  const body: RegisterRequest = await c.req.json();
  const result = await authService.register(body);
  return successResponse(c, result, 'Registration successful', 201);
};

// Register new user with additional fields
export const createUser = async (c: Context) => {
  const body = await c.req.json();

  const validation = UserRegistrationSchema.safeParse(body);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new ValidationError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`);
  }

  try {
    await getUserByEmailService(body.email);
    throw new ConflictError("Email already exists, log in");
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }

  const result = await authService.createUser(
    body.first_name,
    body.last_name,
    body.email,
    body.phone_number,
    body.password,
    "CLIENT"
  );

  try {
    await sendNotificationEmail(
      body.email,
      body.first_name,
      "User Registration Successful 🎊",
      "Welcome! Your account has been created successfully. Please proceed to login."
    );
  } catch (mailError) {
    console.warn("Email not sent:", mailError);
  }

  return successResponse(c, { message: "User registered successfully", result }, 'User registered successfully', 201);
};

export const requestOtp = async (c: Context) => {
  const body = await c.req.json();
  const validation = RequestOtpSchema.safeParse(body);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new ValidationError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`);
  }
  const result = await otpService.requestOtp(body.email);
  return successResponse(c, { message: result }, 'OTP request processed');
};

export const verifyOtp = async (c: Context) => {
  const body = await c.req.json();

  const validation = VerifyOtpSchema.safeParse(body);

  if (!validation.success) {
    const errorMessages = validation.error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new ValidationError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`);
  }

  const isValid = await otpService.verifyOtp(body.email, body.otp);

  if (!isValid) {
    throw new AuthenticationError('Invalid OTP');
  }

  // Get user details
  let user;
  try {
    user = await getUserByEmailService(body.email);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new AuthenticationError('User not found or inactive');
    }
    throw error;
  }

  if (!user.IsActive) {
    throw new AuthenticationError('User not found or inactive');
  }

  // Generate token
  const token = generateToken({ id: user.Id, email: user.Email, role: user.Role });

  return successResponse(c, {
    user: {
      id: user.Id,
      email: user.Email,
      role: user.Role,
      fullName: user.FullName,
      isActive: user.IsActive,
    },
    token,
  }, 'OTP verified and login successful');
};

export const getMe = async (c: Context) => {
  const userPayload = c.get('user');
  const user = await getUserByIdService(userPayload.id);
  return successResponse(c, {
    id: user.Id,
    role: user.Role,
    fullName: user.FullName,
    email: user.Email,
  }, 'User info retrieved successfully');
};
