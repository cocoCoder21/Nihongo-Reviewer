import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ─── Levels ───────────────────────────────────────────────────────

// GET /levels
router.get('/', async (_req: Request, res: Response) => {
  try {
    const levels = await prisma.jlptLevel.findMany({
      orderBy: { order: 'desc' },
      include: {
        _count: {
          select: {
            kanji: true,
            grammar: true,
            vocabulary: true,
          },
        },
      },
    });

    const result = levels.map((l) => ({
      id: l.id,
      label: l.label,
      description: l.description,
      vocabCount: l._count.vocabulary,
      kanjiCount: l._count.kanji,
      grammarCount: l._count.grammar,
      order: l.order,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get levels error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /levels/:level/lessons
router.get('/:level/lessons', async (req: Request, res: Response) => {
  try {
    const level = req.params.level as string;

    const books = await prisma.book.findMany({
      where: { jlptLevelId: level },
      include: {
        shokyuLessons: {
          orderBy: { lessonNumber: 'asc' },
          include: {
            _count: { select: { vocabulary: true, grammar: true } },
          },
        },
        chukyuLessons: {
          orderBy: { lessonNumber: 'asc' },
          include: {
            _count: { select: { vocabulary: true, grammar: true } },
          },
        },
      },
    });

    type LessonWithCount = { id: number; lessonNumber: number; title: string; _count: { vocabulary: number; grammar: number } };

    const lessons = books.flatMap((book) => {
      const isShokyu = book.name.startsWith('shokyu');
      const rawLessons: LessonWithCount[] = isShokyu ? book.shokyuLessons : book.chukyuLessons;

      return rawLessons.map((l) => ({
        id: l.id,
        bookId: book.id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        contentType: isShokyu ? 'shokyu' : 'chukyu',
        vocabularyCount: l._count.vocabulary,
        grammarCount: l._count.grammar,
      }));
    });

    res.json(lessons);
  } catch (err) {
    console.error('Get lessons error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /levels/:level/vocabulary
router.get('/:level/vocabulary', async (req: Request, res: Response) => {
  try {
    const level = req.params.level as string;
    const { lesson } = req.query;

    const where: Record<string, unknown> = { jlptLevelId: level };
    if (lesson) {
      where.sourceLessonNumber = parseInt(lesson as string, 10);
    }

    const vocabulary = await prisma.vocabulary.findMany({
      where,
      orderBy: [{ sourceBook: 'asc' }, { sourceLessonNumber: 'asc' }, { id: 'asc' }],
    });

    const result = vocabulary.map((v) => ({
      id: String(v.id),
      word: v.word,
      reading: v.reading,
      meaning: v.meaning,
      example: v.example,
      exampleMeaning: v.exampleMeaning,
      category: v.category || undefined,
      lessonNumber: v.sourceLessonNumber || undefined,
      sourceBook: v.sourceBook || undefined,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get vocabulary error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /levels/:level/grammar
router.get('/:level/grammar', async (req: Request, res: Response) => {
  try {
    const level = req.params.level as string;
    const { lesson } = req.query;

    const where: Record<string, unknown> = { jlptLevelId: level };
    if (lesson) {
      where.sourceLessonNumber = parseInt(lesson as string, 10);
    }

    const grammar = await prisma.grammar.findMany({
      where,
      orderBy: [{ sourceBook: 'asc' }, { sourceLessonNumber: 'asc' }, { id: 'asc' }],
    });

    const result = grammar.map((g) => {
      const examples = (g.examples as { japanese: string; english: string }[]) || [];
      const firstExample = examples[0];
      return {
        id: String(g.id),
        title: g.pattern,
        pattern: g.pattern,
        meaning: g.meaning || undefined,
        formation: g.formation || undefined,
        rule: g.rule,
        examples,
        example: firstExample?.japanese || '',
        exampleConverted: firstExample?.japanese || '',
        exampleRomaji: '',
        exampleMeaning: firstExample?.english || '',
        sentence: firstExample?.japanese || '',
        sentenceRomaji: '',
        sentenceMeaning: firstExample?.english || '',
        crossReference: null,
        lessonNumber: g.sourceLessonNumber || undefined,
        sourceBook: g.sourceBook || undefined,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Get grammar error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /levels/:level/kanji
router.get('/:level/kanji', async (req: Request, res: Response) => {
  try {
    const level = req.params.level as string;

    const kanji = await prisma.kanji.findMany({
      where: { jlptLevelId: level },
      include: {
        vocabulary: true,
        examples: true,
      },
      orderBy: { id: 'asc' },
    });

    const result = kanji.map((k) => ({
      id: String(k.id),
      kanji: k.character,
      reading: `${k.onyomi}${k.kunyomi ? ' / ' + k.kunyomi : ''}`,
      onyomi: k.onyomi || undefined,
      kunyomi: k.kunyomi || undefined,
      meaning: k.meanings,
      strokeCount: k.strokeCount,
      mnemonic: k.mnemonic || undefined,
      radicalId: k.radicalId,
      examples: k.vocabulary.map((v: { word: string }) => v.word),
      vocabulary: k.vocabulary.map((v: { word: string; reading: string; meaning: string }) => ({
        word: v.word,
        reading: v.reading,
        meaning: v.meaning,
      })),
      exampleSentences: k.examples.map((e: { japanese: string; english: string }) => ({
        japanese: e.japanese,
        english: e.english,
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error('Get kanji error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
