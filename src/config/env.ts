import { config } from 'dotenv';

config();

// Helper function to get required environment variable
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

// Helper function to get optional environment variable with default
const getOptionalEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

// Helper function to get optional number with default
const getOptionalEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const env = {
  // Server Configuration
  PORT: getOptionalEnvNumber('PORT', 4545),

  // Database Configuration (required for database connection)
  DB_USER: getRequiredEnv('DB_USER'),
  DB_PASSWORD: getRequiredEnv('DB_PASSWORD'),
  DB_SERVER: getOptionalEnv('DB_SERVER', 'localhost'),
  DB_PORT: getOptionalEnvNumber('DB_PORT', 1433),
  DB_DATABASE: getOptionalEnv('DB_DATABASE', 'EvergreenDB'),

  // Prisma Database URL (required)
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),

  // JWT Configuration (required for security)
  JWT_SECRET: getRequiredEnv('JWT_SECRET'),
  JWT_SECRET_KEY: getRequiredEnv('JWT_SECRET_KEY'), // for compatibility

  // Cloudinary Configuration (required if using uploads)
  CLOUDINARY_CLOUD_NAME: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getRequiredEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getRequiredEnv('CLOUDINARY_API_SECRET'),

  // Email Configuration (required for email functionality)
  EMAIL_HOST: getRequiredEnv('EMAIL_HOST'),
  EMAIL_PORT: getOptionalEnvNumber('EMAIL_PORT', 587),
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USERNAME: getRequiredEnv('EMAIL_USERNAME'),
  EMAIL_PASSWORD: getRequiredEnv('EMAIL_PASSWORD'),
  EMAIL_SENDER: getOptionalEnv('EMAIL_SENDER', getOptionalEnv('EMAIL_USERNAME', '')),
};