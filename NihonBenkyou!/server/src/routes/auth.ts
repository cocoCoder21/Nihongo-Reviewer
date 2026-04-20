import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  requireAuth,
} from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, currentJlptLevel, userType } = req.body;

    if (!email || !password || !displayName) {
      res.status(400).json({ message: 'Email, password, and display name are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        currentJlptLevel: currentJlptLevel || 'N5',
        userType: userType || 'STUDENT',
        settings: { create: {} },
        streak: { create: {} },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        currentJlptLevel: true,
        userType: true,
        dailyGoalMinutes: true,
        createdAt: true,
      },
    });

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user,
      message: 'Registration successful',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        currentJlptLevel: user.currentJlptLevel,
        userType: user.userType,
        dailyGoalMinutes: user.dailyGoalMinutes,
        createdAt: user.createdAt,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  clearTokenCookies(res);
  res.status(204).send();
});

// POST /auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401).json({ message: 'No refresh token' });
      return;
    }

    const payload = verifyRefreshToken(token);
    const accessToken = generateAccessToken({ userId: payload.userId, email: payload.email });
    const refreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ message: 'Token refreshed' });
  } catch {
    clearTokenCookies(res);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        currentJlptLevel: true,
        userType: true,
        dailyGoalMinutes: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /auth/password
router.patch('/password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /auth/profile
router.patch('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 1) {
      res.status(400).json({ message: 'Display name is required' });
      return;
    }

    if (displayName.trim().length > 50) {
      res.status(400).json({ message: 'Display name must be 50 characters or less' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { displayName: displayName.trim() },
      select: { id: true, email: true, displayName: true, currentJlptLevel: true, userType: true, dailyGoalMinutes: true, createdAt: true },
    });

    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
