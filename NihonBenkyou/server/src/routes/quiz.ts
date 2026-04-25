import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { cache, TTL_LONG } from '../lib/cache.js';

const router = Router();

// GET /quiz/:lessonId
router.get('/:lessonId', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.lessonId as string, 10);
    const count = parseInt(req.query.count as string, 10) || 10;

    if (isNaN(lessonId)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }

    const cacheKey = `quiz:${lessonId}:${count}`;
    const cached = cache.get<object[]>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.json(cached);
      return;
    }

    // Fetch shokyu and chukyu in parallel — avoids a sequential round-trip.
    const [shokyuLesson, chukyuLesson] = await Promise.all([
      prisma.shokyuLesson.findUnique({
        where: { id: lessonId },
        include: { book: { select: { jlptLevelId: true } } },
      }),
      prisma.chukyuLesson.findUnique({
        where: { id: lessonId },
        include: { book: { select: { jlptLevelId: true } } },
      }),
    ]);

    const lesson = shokyuLesson || chukyuLesson;
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    const questions = await prisma.quizQuestion.findMany({
      where: {
        jlptLevelId: lesson.book.jlptLevelId,
        lessonNumber: lesson.lessonNumber,
      },
      take: count,
    });

    // Map quiz type enums to frontend string types
    const typeMap: Record<string, string> = {
      VOCAB_MEANING: 'vocab-meaning',
      GRAMMAR_FILL: 'grammar-fill',
      KANJI_READING: 'kanji-reading',
      TRANSLATION: 'translation',
    };

    const categoryMap: Record<string, string> = {
      VOCAB_MEANING: 'vocabulary',
      GRAMMAR_FILL: 'grammar',
      KANJI_READING: 'kanji',
      TRANSLATION: 'grammar',
    };

    const result = questions.map((q) => ({
      id: String(q.id),
      type: typeMap[q.type] || q.type,
      question: q.question,
      options: q.options as string[],
      correctIndex: q.correctAnswer,
      category: categoryMap[q.type] || 'vocabulary',
      explanation: q.explanation,
    }));

    cache.set(cacheKey, result, TTL_LONG);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.json(result);
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

