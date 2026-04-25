import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import prisma from './lib/prisma.js';

// Route imports
import authRouter from './routes/auth.js';
import levelsRouter from './routes/levels.js';
import lessonsRouter from './routes/lessons.js';
import radicalsRouter from './routes/radicals.js';
import kanaRouter from './routes/kana.js';
import audioRouter from './routes/audio.js';
import quizRouter from './routes/quiz.js';
import userRouter from './routes/user.js';
import plannerRouter from './routes/planner.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://nihongo-reviewer-eight.vercel.app',
  'https://angeliephl.dev',
];

const allowedOrigins = new Set(
  [
    ...defaultAllowedOrigins,
    ...(process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(normalizeOrigin)
      : []),
  ].filter(Boolean),
);

// ─── Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, health checks) with no Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedRequestOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedRequestOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later' },
});

// ─── Health checks ────────────────────────────────────────────────
// Railway should only verify that the HTTP process is alive.
// Do not block this route on database connectivity or it can cause
// restart loops that surface as 502s for every request.
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Separate DB diagnostics from the platform liveness probe.
app.get('/api/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(200).json({ status: 'ok', database: 'disconnected' });
  }
});

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/levels', levelsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/radicals', radicalsRouter);
app.use('/api/kana', kanaRouter);
app.use('/api/audio', audioRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/user', userRouter);
app.use('/api/planner', plannerRouter);

// ─── Error handler ────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;

