import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export interface JwtPayload {
  userId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

export function setTokenCookies(res: Response, access: string, refresh: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'none' : 'lax';

  res.cookie('access_token', access, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refresh_token', refresh, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearTokenCookies(res: Response): void {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
