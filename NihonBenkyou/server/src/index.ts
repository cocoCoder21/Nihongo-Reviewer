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

// ─── Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'],
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

// ─── Health check ─────────────────────────────────────────────────
// Always return 200 so Railway considers the deployment healthy.
// DB status is reported in the body — a disconnected DB should not
// take the server out of rotation (Railway would 502 all requests).
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.json({ status: 'ok', database: 'disconnected' });
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
