import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /planner/blocks?date=YYYY-MM-DD
router.get('/blocks', async (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr + 'T00:00:00.000Z');

    const blocks = await prisma.studyBlock.findMany({
      where: { userId: req.user!.userId, date },
      orderBy: { sortOrder: 'asc' },
    });

    res.json(blocks);
  } catch (err) {
    console.error('GET /planner/blocks error:', err);
    res.status(500).json({ message: 'Failed to fetch study blocks' });
  }
});

// POST /planner/blocks
router.post('/blocks', async (req: Request, res: Response) => {
  try {
    const { title, scheduledAt, duration, date } = req.body;
    if (!title || !scheduledAt || !duration) {
      res.status(400).json({ message: 'title, scheduledAt, and duration are required' });
      return;
    }

    const dateValue = new Date((date || new Date().toISOString().split('T')[0]) + 'T00:00:00.000Z');

    const count = await prisma.studyBlock.count({
      where: { userId: req.user!.userId, date: dateValue },
    });

    const block = await prisma.studyBlock.create({
      data: {
        userId: req.user!.userId,
        title,
        scheduledAt,
        duration: Number(duration),
        date: dateValue,
        sortOrder: count,
      },
    });

    res.status(201).json(block);
  } catch (err) {
    console.error('POST /planner/blocks error:', err);
    res.status(500).json({ message: 'Failed to create study block' });
  }
});

// PATCH /planner/blocks/:id
router.patch('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { title, scheduledAt, duration, completed } = req.body;

    const block = await prisma.studyBlock.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!block) {
      res.status(404).json({ message: 'Study block not found' });
      return;
    }

    const updated = await prisma.studyBlock.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(scheduledAt !== undefined && { scheduledAt }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(completed !== undefined && { completed }),
      },
    });

    // When completion status changes, update DailyActivity.minutesStudied
    if (completed !== undefined && completed !== block.completed) {
      const blockDate = new Date(block.date);
      blockDate.setHours(0, 0, 0, 0);
      const blockDuration = duration !== undefined ? Number(duration) : block.duration;
      const minutesDelta = completed ? blockDuration : -blockDuration;

      await prisma.dailyActivity.upsert({
        where: { userId_date: { userId: req.user!.userId, date: blockDate } },
        update: { minutesStudied: { increment: minutesDelta } },
        create: {
          userId: req.user!.userId,
          date: blockDate,
          minutesStudied: Math.max(0, minutesDelta),
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('PATCH /planner/blocks/:id error:', err);
    res.status(500).json({ message: 'Failed to update study block' });
  }
});

// DELETE /planner/blocks/:id
router.delete('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const block = await prisma.studyBlock.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!block) {
      res.status(404).json({ message: 'Study block not found' });
      return;
    }

    await prisma.studyBlock.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /planner/blocks/:id error:', err);
    res.status(500).json({ message: 'Failed to delete study block' });
  }
});

export default router;
