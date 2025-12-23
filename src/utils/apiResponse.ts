import type { Context } from 'hono';

export const successResponse = (c: Context, data: any, message: string = 'Success', status: number = 200) => {
  return c.json({
    success: true,
    message,
    data,
  }, status as any);
};

export const errorResponse = (c: Context, message: string = 'Error', status: number = 400) => {
  return c.json({
    success: false,
    message,
  }, status as any);
};