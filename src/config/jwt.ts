import jwt from 'jsonwebtoken';
import { env } from './env.js';

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};