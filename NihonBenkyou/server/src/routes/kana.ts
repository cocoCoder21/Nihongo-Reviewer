import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { cache, TTL_STATIC } from '../lib/cache.js';

const router = Router();

// GET /kana/hiragana
router.get('/hiragana', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const cacheKey = `hiragana:${type ?? ''}`;
    const cached = cache.get<object[]>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.json(cached);
      return;
    }

    const where: Record<string, unknown> = {};
    if (type) where.type = type as string;

    const hiragana = await prisma.hiragana.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const result = hiragana.map((h) => ({
      id: h.id,
      character: h.character,
      romaji: h.romaji,
      row: h.row,
      type: h.type,
      strokeCount: h.strokeCount,
      mnemonic: h.mnemonic || undefined,
      exampleWord: h.exampleWord || undefined,
      exampleReading: h.exampleReading || undefined,
      exampleMeaning: h.exampleMeaning || undefined,
    }));

    cache.set(cacheKey, result, TTL_STATIC);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.json(result);
  } catch (err) {
    console.error('Get hiragana error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /kana/katakana
router.get('/katakana', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const cacheKey = `katakana:${type ?? ''}`;
    const cached = cache.get<object[]>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.json(cached);
      return;
    }

    const where: Record<string, unknown> = {};
    if (type) where.type = type as string;

    const katakana = await prisma.katakana.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const result = katakana.map((k) => ({
      id: k.id,
      character: k.character,
      romaji: k.romaji,
      row: k.row,
      type: k.type,
      strokeCount: k.strokeCount,
      mnemonic: k.mnemonic || undefined,
      exampleWord: k.exampleWord || undefined,
      exampleReading: k.exampleReading || undefined,
      exampleMeaning: k.exampleMeaning || undefined,
    }));

    cache.set(cacheKey, result, TTL_STATIC);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.json(result);
  } catch (err) {
    console.error('Get katakana error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
