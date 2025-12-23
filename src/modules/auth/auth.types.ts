import type { UserRole } from '../../middleware/role.middleware.js';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface UserPayload {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: "admin" | "customer" | "restaurant_owner";
}

export interface RequestOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}