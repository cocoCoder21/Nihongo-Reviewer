import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /radicals
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, position } = req.query;

    const where: Record<string, unknown> = {};
    if (category) where.semanticCategory = category as string;
    if (position) where.position = position as string;

    const radicals = await prisma.radical.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const result = radicals.map((r) => ({
      id: r.id,
      character: r.character,
      name: r.name,
      meaning: r.meaning,
      position: r.position,
      commonKanji: r.commonKanji as string[],
      semanticCategory: r.semanticCategory,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get radicals error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
