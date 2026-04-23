import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /lessons/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }

    // Try shokyu first
    const shokyuLesson = await prisma.shokyuLesson.findUnique({
      where: { id },
      include: {
        book: true,
        vocabulary: { orderBy: { sortOrder: 'asc' } },
        grammar: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (shokyuLesson) {
      res.json({
        id: shokyuLesson.id,
        bookId: shokyuLesson.book.id,
        lessonNumber: shokyuLesson.lessonNumber,
        title: shokyuLesson.title,
        contentType: 'shokyu',
        vocabularyCount: shokyuLesson.vocabulary.length,
        grammarCount: shokyuLesson.grammar.length,
        vocabulary: shokyuLesson.vocabulary.map((v) => ({
          id: String(v.id),
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          example: v.example,
          exampleMeaning: v.exampleMeaning,
          category: v.category || undefined,
          lessonNumber: shokyuLesson.lessonNumber,
          sourceBook: shokyuLesson.book.name,
        })),
        grammar: shokyuLesson.grammar.map((g) => {
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
            lessonNumber: shokyuLesson.lessonNumber,
            sourceBook: shokyuLesson.book.name,
          };
        }),
      });
      return;
    }

    // Try chukyu
    const chukyuLesson = await prisma.chukyuLesson.findUnique({
      where: { id },
      include: {
        book: true,
        vocabulary: { orderBy: { sortOrder: 'asc' } },
        grammar: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (chukyuLesson) {
      res.json({
        id: chukyuLesson.id,
        bookId: chukyuLesson.book.id,
        lessonNumber: chukyuLesson.lessonNumber,
        title: chukyuLesson.title,
        contentType: 'chukyu',
        vocabularyCount: chukyuLesson.vocabulary.length,
        grammarCount: chukyuLesson.grammar.length,
        vocabulary: chukyuLesson.vocabulary.map((v) => ({
          id: String(v.id),
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          example: v.example,
          exampleMeaning: v.exampleMeaning,
          category: v.category || undefined,
          lessonNumber: chukyuLesson.lessonNumber,
          sourceBook: chukyuLesson.book.name,
        })),
        grammar: chukyuLesson.grammar.map((g) => {
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
            crossReference: g.crossReference || null,
            lessonNumber: chukyuLesson.lessonNumber,
            sourceBook: chukyuLesson.book.name,
          };
        }),
      });
      return;
    }

    res.status(404).json({ message: 'Lesson not found' });
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
