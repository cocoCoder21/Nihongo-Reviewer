import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ─── Progress ─────────────────────────────────────────────────────

// GET /user/progress
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.user!.userId },
      include: { jlptLevel: { select: { id: true } } },
    });

    const result = progress.map((p) => ({
      jlptLevelId: p.jlptLevelId,
      overallMastery: p.overallMastery,
      lessonsCompleted: p.lessonsCompleted,
      totalLessons: p.totalLessons,
      vocabMastered: p.vocabMastered,
      grammarMastered: p.grammarMastered,
      kanjiMastered: p.kanjiMastered,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /user/progress/:level
router.get('/progress/:level', async (req: Request, res: Response) => {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_jlptLevelId: {
          userId: req.user!.userId,
          jlptLevelId: req.params.level as string,
        },
      },
    });

    if (!progress) {
      // Return default empty progress
      res.json({
        jlptLevelId: req.params.level as string,
        overallMastery: 0,
        lessonsCompleted: 0,
        totalLessons: 0,
        vocabMastered: 0,
        grammarMastered: 0,
        kanjiMastered: 0,
      });
      return;
    }

    res.json({
      jlptLevelId: progress.jlptLevelId,
      overallMastery: progress.overallMastery,
      lessonsCompleted: progress.lessonsCompleted,
      totalLessons: progress.totalLessons,
      vocabMastered: progress.vocabMastered,
      grammarMastered: progress.grammarMastered,
      kanjiMastered: progress.kanjiMastered,
    });
  } catch (err) {
    console.error('Get level progress error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /user/progress/lesson
router.post('/progress/lesson', async (req: Request, res: Response) => {
  try {
    const { lessonId, score, contentType } = req.body;

    if (!lessonId || score === undefined || !contentType) {
      res.status(400).json({ message: 'lessonId, score, and contentType are required' });
      return;
    }

    const ctEnum = contentType.toUpperCase() === 'CHUKYU' ? 'CHUKYU' as const : 'SHOKYU' as const;

    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_contentType_lessonId: {
          userId: req.user!.userId,
          contentType: ctEnum,
          lessonId,
        },
      },
      update: {
        score: Math.max(score),
        completed: true,
        completedAt: new Date(),
        attempts: { increment: 1 },
      },
      create: {
        userId: req.user!.userId,
        contentType: ctEnum,
        lessonId,
        score,
        completed: true,
        completedAt: new Date(),
        attempts: 1,
      },
    });

    res.json({
      lessonId: lessonProgress.lessonId,
      contentType: lessonProgress.contentType.toLowerCase(),
      completed: lessonProgress.completed,
      score: lessonProgress.score,
      completedAt: lessonProgress.completedAt?.toISOString(),
      attempts: lessonProgress.attempts,
    });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /user/progress/vocabulary
router.post('/progress/vocabulary', async (req: Request, res: Response) => {
  try {
    const { vocabularyId, correct } = req.body;

    if (!vocabularyId || correct === undefined) {
      res.status(400).json({ message: 'vocabularyId and correct are required' });
      return;
    }

    await prisma.vocabularyProgress.upsert({
      where: {
        userId_vocabularyId: {
          userId: req.user!.userId,
          vocabularyId,
        },
      },
      update: {
        correct: correct ? { increment: 1 } : undefined,
        incorrect: !correct ? { increment: 1 } : undefined,
        lastReviewed: new Date(),
      },
      create: {
        userId: req.user!.userId,
        vocabularyId,
        correct: correct ? 1 : 0,
        incorrect: correct ? 0 : 1,
        lastReviewed: new Date(),
      },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Update vocab progress error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /user/progress/grammar
router.post('/progress/grammar', async (req: Request, res: Response) => {
  try {
    const { grammarId, correct } = req.body;

    if (!grammarId || correct === undefined) {
      res.status(400).json({ message: 'grammarId and correct are required' });
      return;
    }

    await prisma.grammarProgress.upsert({
      where: {
        userId_grammarId: {
          userId: req.user!.userId,
          grammarId,
        },
      },
      update: {
        correct: correct ? { increment: 1 } : undefined,
        incorrect: !correct ? { increment: 1 } : undefined,
        lastReviewed: new Date(),
      },
      create: {
        userId: req.user!.userId,
        grammarId,
        correct: correct ? 1 : 0,
        incorrect: correct ? 0 : 1,
        lastReviewed: new Date(),
      },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Update grammar progress error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /user/progress/kanji
router.post('/progress/kanji', async (req: Request, res: Response) => {
  try {
    const { kanjiId, correct, writingPracticed } = req.body;

    if (!kanjiId || correct === undefined) {
      res.status(400).json({ message: 'kanjiId and correct are required' });
      return;
    }

    await prisma.kanjiProgress.upsert({
      where: {
        userId_kanjiId: {
          userId: req.user!.userId,
          kanjiId,
        },
      },
      update: {
        correct: correct ? { increment: 1 } : undefined,
        incorrect: !correct ? { increment: 1 } : undefined,
        lastReviewed: new Date(),
        writingPracticed: writingPracticed ?? undefined,
      },
      create: {
        userId: req.user!.userId,
        kanjiId,
        correct: correct ? 1 : 0,
        incorrect: correct ? 0 : 1,
        lastReviewed: new Date(),
        writingPracticed: writingPracticed ?? false,
      },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Update kanji progress error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── SRS ──────────────────────────────────────────────────────────

// GET /user/srs/due
router.get('/srs/due', async (req: Request, res: Response) => {
  try {
    const cards = await prisma.srsCard.findMany({
      where: {
        userId: req.user!.userId,
        nextReview: { lte: new Date() },
        status: { not: 'MASTERED' },
      },
      orderBy: { nextReview: 'asc' },
      take: 50,
    });

    // Enrich cards with content info. If a card's content row is missing
    // (orphaned SrsCard pointing at a deleted/non-existent content row),
    // we delete the orphan so it never reaches the client as a blank card.
    const orphanIds: number[] = [];

    const enrichedRaw = await Promise.all(
      cards.map(async (card) => {
        let front = '';
        let reading = '';
        let meaning = '';
        let category = card.contentType.toLowerCase();
        let found = false;

        if (card.contentType === 'VOCABULARY') {
          const vocab = await prisma.vocabulary.findUnique({ where: { id: card.contentId } });
          if (vocab) {
            front = vocab.word;
            reading = vocab.reading;
            meaning = vocab.meaning;
            found = true;
          }
        } else if (card.contentType === 'GRAMMAR') {
          const grammar = await prisma.grammar.findUnique({ where: { id: card.contentId } });
          if (grammar) {
            front = grammar.pattern;
            reading = '';
            meaning = grammar.rule;
            found = true;
          }
        } else if (card.contentType === 'KANJI') {
          const kanji = await prisma.kanji.findUnique({ where: { id: card.contentId } });
          if (kanji && kanji.character) {
            front = kanji.character;
            reading = `${kanji.onyomi || ''}${kanji.kunyomi ? ' / ' + kanji.kunyomi : ''}`.trim();
            meaning = kanji.meanings || '';
            found = true;
          }
        } else if (card.contentType === 'HIRAGANA') {
          const kana = await prisma.hiragana.findUnique({ where: { id: card.contentId } });
          if (kana) {
            front = kana.character;
            reading = kana.romaji;
            meaning = kana.romaji;
            category = 'hiragana';
            found = true;
          }
        } else if (card.contentType === 'KATAKANA') {
          const kana = await prisma.katakana.findUnique({ where: { id: card.contentId } });
          if (kana) {
            front = kana.character;
            reading = kana.romaji;
            meaning = kana.romaji;
            category = 'katakana';
            found = true;
          }
        } else if (card.contentType === 'RADICAL') {
          const rad = await prisma.radical.findUnique({ where: { id: card.contentId } });
          if (rad) {
            front = rad.character;
            reading = rad.name;
            meaning = rad.meaning;
            category = 'radical';
            found = true;
          }
        }

        if (!found || !front) {
          console.warn(
            `[srs/due] Orphaned SrsCard id=${card.id} contentType=${card.contentType} contentId=${card.contentId} — removing.`
          );
          orphanIds.push(card.id);
          return null;
        }

        return {
          id: card.id,
          contentType: card.contentType,
          contentId: card.contentId,
          easeFactor: card.easeFactor,
          interval: card.interval,
          repetitions: card.repetitions,
          nextReview: card.nextReview.toISOString(),
          lastReview: card.lastReview?.toISOString(),
          status: card.status,
          front,
          reading,
          meaning,
          category,
        };
      })
    );

    if (orphanIds.length > 0) {
      await prisma.srsCard.deleteMany({ where: { id: { in: orphanIds } } });
    }

    const enriched = enrichedRaw.filter((c): c is NonNullable<typeof c> => c !== null);

    res.json(enriched);
  } catch (err) {
    console.error('Get due cards error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /user/srs/review
router.post('/srs/review', async (req: Request, res: Response) => {
  try {
    const { cardId, difficulty } = req.body;

    if (!cardId || !difficulty) {
      res.status(400).json({ message: 'cardId and difficulty are required' });
      return;
    }

    const card = await prisma.srsCard.findFirst({
      where: { id: cardId, userId: req.user!.userId },
    });

    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    // SM-2 algorithm
    const qualityMap: Record<string, number> = { again: 0, hard: 2, good: 3, easy: 5 };
    const quality = qualityMap[difficulty] ?? 3;

    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
      repetitions = 0;
      interval = 0;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 3;
      else interval = Math.round(interval * easeFactor);
      repetitions += 1;
    }

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
    let status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED' = card.status;

    if (interval === 0) status = 'LEARNING';
    else if (interval >= 21 && repetitions >= 5) status = 'MASTERED';
    else status = 'REVIEW';

    const updated = await prisma.srsCard.update({
      where: { id: cardId },
      data: {
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReview: new Date(),
        status,
      },
    });

    res.json({
      id: updated.id,
      contentType: updated.contentType,
      contentId: updated.contentId,
      easeFactor: updated.easeFactor,
      interval: updated.interval,
      repetitions: updated.repetitions,
      nextReview: updated.nextReview.toISOString(),
      lastReview: updated.lastReview?.toISOString(),
      status: updated.status,
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Stats ────────────────────────────────────────────────────────

// GET /user/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Today's date at midnight UTC for daily XP/activity queries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [streak, masteredCards, lessonsDone, totalMinutes, reviewsDue, todayActivity] = await Promise.all([
      prisma.userStreak.findUnique({ where: { userId } }),
      prisma.srsCard.count({ where: { userId, status: 'MASTERED' } }),
      prisma.lessonProgress.count({ where: { userId, completed: true } }),
      prisma.dailyActivity.aggregate({
        where: { userId },
        _sum: { minutesStudied: true },
      }),
      prisma.srsCard.count({
        where: {
          userId,
          nextReview: { lte: new Date() },
          status: { not: 'MASTERED' },
        },
      }),
      // Today's activity — used for daily XP, lessons, reviews, quizzes
      prisma.dailyActivity.findFirst({
        where: { userId, date: { gte: todayStart } },
      }),
    ]);

    const quizSessions = await prisma.studySession.count({
      where: { userId, type: 'QUIZ', startedAt: { gte: todayStart } },
    });

    res.json({
      streak: streak?.currentStreak ?? 0,
      xp: todayActivity?.xpEarned ?? 0,          // Today's XP only
      xpGoal: 50,
      reviewsDue,
      totalStudyHours: Math.round((totalMinutes._sum.minutesStudied ?? 0) / 60 * 10) / 10,
      cardsMastered: masteredCards,
      lessonsCompleted: lessonsDone,
      quizzesCompleted: quizSessions,
      // Today's activity counts for quest sync
      todayLessonsCompleted: todayActivity?.lessonsCompleted ?? 0,
      todayReviewsCompleted: todayActivity?.reviewsCompleted ?? 0,
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /user/stats/weakness
router.get('/stats/weakness', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find vocab items with low accuracy
    const weakVocab = await prisma.vocabularyProgress.findMany({
      where: {
        userId,
        incorrect: { gt: 0 },
      },
      include: { vocabulary: true },
      orderBy: { incorrect: 'desc' },
      take: 10,
    });

    // Find grammar items with low accuracy
    const weakGrammar = await prisma.grammarProgress.findMany({
      where: {
        userId,
        incorrect: { gt: 0 },
      },
      include: { grammar: true },
      orderBy: { incorrect: 'desc' },
      take: 5,
    });

    // Find kanji items with low accuracy
    const weakKanji = await prisma.kanjiProgress.findMany({
      where: {
        userId,
        incorrect: { gt: 0 },
      },
      include: { kanji: true },
      orderBy: { incorrect: 'desc' },
      take: 5,
    });

    const result = [
      ...weakVocab.map((wp) => {
        const total = wp.correct + wp.incorrect;
        return {
          id: wp.vocabularyId,
          type: 'vocabulary' as const,
          content: wp.vocabulary.word,
          reading: wp.vocabulary.reading,
          meaning: wp.vocabulary.meaning,
          accuracy: total > 0 ? Math.round((wp.correct / total) * 100) : 0,
          totalAttempts: total,
        };
      }),
      ...weakGrammar.map((gp) => {
        const total = gp.correct + gp.incorrect;
        return {
          id: gp.grammarId,
          type: 'grammar' as const,
          content: gp.grammar.pattern,
          meaning: gp.grammar.rule,
          accuracy: total > 0 ? Math.round((gp.correct / total) * 100) : 0,
          totalAttempts: total,
        };
      }),
      ...weakKanji.map((kp) => {
        const total = kp.correct + kp.incorrect;
        return {
          id: kp.kanjiId,
          type: 'kanji' as const,
          content: kp.kanji.character,
          reading: `${kp.kanji.onyomi} / ${kp.kanji.kunyomi}`,
          meaning: kp.kanji.meanings,
          accuracy: total > 0 ? Math.round((kp.correct / total) * 100) : 0,
          totalAttempts: total,
        };
      }),
    ].sort((a, b) => a.accuracy - b.accuracy);

    res.json(result);
  } catch (err) {
    console.error('Get weakness error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Streak ───────────────────────────────────────────────────────

// GET /user/streak
router.get('/streak', async (req: Request, res: Response) => {
  try {
    const streak = await prisma.userStreak.findUnique({
      where: { userId: req.user!.userId },
    });

    // Compute effective current streak — expire if last study wasn't today or yesterday
    let effectiveStreak = 0;
    if (streak?.lastStudyDate) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const lastStr = streak.lastStudyDate.toISOString().split('T')[0];
      if (lastStr === todayStr || lastStr === yesterdayStr) {
        effectiveStreak = streak.currentStreak;
      } else {
        // Streak broken — persist the reset so stats stay consistent
        await prisma.userStreak.update({
          where: { userId: req.user!.userId },
          data: { currentStreak: 0 },
        });
      }
    }

    res.json({
      currentStreak: effectiveStreak,
      longestStreak: streak?.longestStreak ?? 0,
      lastStudyDate: streak?.lastStudyDate?.toISOString(),
      totalStudyDays: streak?.totalStudyDays ?? 0,
    });
  } catch (err) {
    console.error('Get streak error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Activity ─────────────────────────────────────────────────────

// GET /user/activity
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const range = req.query.range === '30d' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - range);

    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId: req.user!.userId,
        date: { gte: since },
      },
      orderBy: { date: 'asc' },
    });

    const result = activities.map((a) => ({
      date: a.date.toISOString().split('T')[0],
      xpEarned: a.xpEarned,
      minutesStudied: a.minutesStudied,
      lessonsCompleted: a.lessonsCompleted,
      reviewsCompleted: a.reviewsCompleted,
      quizzesCompleted: a.quizzesCompleted,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Study Sessions ───────────────────────────────────────────────

// POST /user/study-session
router.post('/study-session', async (req: Request, res: Response) => {
  try {
    const { type, xpEarned, itemsStudied } = req.body;

    if (!type) {
      res.status(400).json({ message: 'type is required' });
      return;
    }

    const validTypes = ['LESSON', 'REVIEW', 'QUIZ', 'FLASHCARD'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: 'Invalid session type' });
      return;
    }

    const userId = req.user!.userId;

    // Create study session
    await prisma.studySession.create({
      data: {
        userId,
        type: type as 'LESSON' | 'REVIEW' | 'QUIZ' | 'FLASHCARD',
        xpEarned: xpEarned ?? 0,
        itemsStudied: itemsStudied ?? 0,
        endedAt: new Date(),
      },
    });

    // Update daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      update: {
        xpEarned: { increment: xpEarned ?? 0 },
        lessonsCompleted: type === 'LESSON' ? { increment: 1 } : undefined,
        reviewsCompleted: type === 'REVIEW' ? { increment: 1 } : undefined,
        quizzesCompleted: type === 'QUIZ' ? { increment: 1 } : undefined,
      },
      create: {
        userId,
        date: today,
        xpEarned: xpEarned ?? 0,
        lessonsCompleted: type === 'LESSON' ? 1 : 0,
        reviewsCompleted: type === 'REVIEW' ? 1 : 0,
        quizzesCompleted: type === 'QUIZ' ? 1 : 0,
      },
    });

    // Update streak
    const todayStr = today.toISOString().split('T')[0];
    const streak = await prisma.userStreak.findUnique({ where: { userId } });

    // Determine if today's study was already counted
    const lastStr = streak?.lastStudyDate?.toISOString().split('T')[0];
    if (lastStr !== todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = lastStr === yesterdayStr ? (streak?.currentStreak ?? 0) + 1 : 1;
      const newLongest = Math.max(streak?.longestStreak ?? 0, newStreak);

      await prisma.userStreak.upsert({
        where: { userId },
        update: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastStudyDate: today,
          totalStudyDays: { increment: 1 },
        },
        create: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today,
          totalStudyDays: 1,
        },
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Log study session error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Content Familiarity ──────────────────────────────────────────

const VALID_CONTENT_TYPES = ['vocabulary', 'grammar', 'kanji', 'hiragana', 'katakana', 'radical'];

// Map from lowercase contentType → SrsContentType enum value
const SRS_CONTENT_TYPE_MAP: Record<string, 'VOCABULARY' | 'GRAMMAR' | 'KANJI' | 'HIRAGANA' | 'KATAKANA' | 'RADICAL'> = {
  vocabulary: 'VOCABULARY',
  grammar: 'GRAMMAR',
  kanji: 'KANJI',
  hiragana: 'HIRAGANA',
  katakana: 'KATAKANA',
  radical: 'RADICAL',
};

// POST /user/familiarity — toggle familiarity for a content item
// When toggling ON, an SrsCard is also created (upserted) so the item
// immediately appears in the Practice tab review queue.
router.post('/familiarity', async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.body;

    if (!contentType || contentId === undefined) {
      res.status(400).json({ message: 'contentType and contentId are required' });
      return;
    }

    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      res.status(400).json({ message: 'Invalid contentType' });
      return;
    }

    const userId = req.user!.userId;
    const numericContentId = Number(contentId);

    if (!Number.isFinite(numericContentId) || numericContentId <= 0) {
      res.status(400).json({ message: 'contentId must be a positive integer' });
      return;
    }

    // Verify the referenced content row actually exists before creating any
    // familiarity / SrsCard records. This prevents orphaned cards that would
    // render as blank in the Practice tab.
    let contentExists = false;
    if (contentType === 'vocabulary') {
      contentExists = !!(await prisma.vocabulary.findUnique({ where: { id: numericContentId }, select: { id: true } }));
    } else if (contentType === 'grammar') {
      contentExists = !!(await prisma.grammar.findUnique({ where: { id: numericContentId }, select: { id: true } }));
    } else if (contentType === 'kanji') {
      contentExists = !!(await prisma.kanji.findUnique({ where: { id: numericContentId }, select: { id: true } }));
    } else if (contentType === 'hiragana') {
      contentExists = !!(await prisma.hiragana.findUnique({ where: { id: numericContentId }, select: { id: true } }));
    } else if (contentType === 'katakana') {
      contentExists = !!(await prisma.katakana.findUnique({ where: { id: numericContentId }, select: { id: true } }));
    } else if (contentType === 'radical') {
      contentExists = !!(await prisma.radical.findUnique({ where: { id: numericContentId }, select: { id: true } }));
    }

    if (!contentExists) {
      res.status(404).json({ message: `${contentType} with id ${numericContentId} not found` });
      return;
    }

    // Check if already familiarized
    const existing = await prisma.contentFamiliarity.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId: numericContentId,
        },
      },
    });

    if (existing) {
      // Toggle off — remove familiarity (SrsCard is kept so SRS progress isn't lost)
      await prisma.contentFamiliarity.delete({
        where: { id: existing.id },
      });
      res.json({ familiarized: false });
    } else {
      // Toggle on — create familiarity record AND enqueue an SRS card
      const srsContentType = SRS_CONTENT_TYPE_MAP[contentType];

      await Promise.all([
        prisma.contentFamiliarity.create({
          data: { userId, contentType, contentId: numericContentId },
        }),
        srsContentType
          ? prisma.srsCard.upsert({
              where: {
                userId_contentType_contentId: {
                  userId,
                  contentType: srsContentType,
                  contentId: numericContentId,
                },
              },
              // Do not reset an existing card's progress — leave it as-is
              update: {},
              create: {
                userId,
                contentType: srsContentType,
                contentId: numericContentId,
                // nextReview defaults to now() → immediately due
              },
            })
          : Promise.resolve(),
      ]);

      res.json({ familiarized: true });
    }
  } catch (err) {
    console.error('Toggle familiarity error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /user/familiarity?contentType=vocabulary — get familiarized item IDs
router.get('/familiarity', async (req: Request, res: Response) => {
  try {
    const contentType = req.query.contentType as string | undefined;
    const userId = req.user!.userId;

    const where: { userId: number; contentType?: string } = { userId };
    if (contentType && VALID_CONTENT_TYPES.includes(contentType)) {
      where.contentType = contentType;
    }

    const items = await prisma.contentFamiliarity.findMany({
      where,
      select: { contentType: true, contentId: true },
    });

    res.json(items);
  } catch (err) {
    console.error('Get familiarity error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /user/familiarity/counts — get counts per content type
router.get('/familiarity/counts', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const counts = await prisma.contentFamiliarity.groupBy({
      by: ['contentType'],
      where: { userId },
      _count: { contentType: true },
    });

    const result: Record<string, number> = {};
    for (const c of counts) {
      result[c.contentType] = c._count.contentType;
    }

    res.json(result);
  } catch (err) {
    console.error('Get familiarity counts error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
