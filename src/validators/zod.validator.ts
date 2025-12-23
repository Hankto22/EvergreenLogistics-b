import { z } from "zod";

export const UserRegistrationSchema = z.object({
  first_name: z.string().min(2, "First name must have at least 2 characters"),
  last_name: z.string().min(2, "Last name must have at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone_number: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Request password reset - user provides email
export const RequestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Reset password - user provides otp and new password
export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*#?&]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const RequestOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});