import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveAudioPath(filePathFromDb: string): string {
  // Some older rows may include a leading slash (e.g. "/Audio/..."), which
  // would force path.resolve to ignore the intended base directory.
  const normalizedRelative = filePathFromDb.replace(/^[\\/]+/, '');
  return path.resolve(__dirname, '..', '..', '..', '..', normalizedRelative);
}

// ─── GET /audio/by-book — list tracks by bookId + lessonNumber ────
// Query params: bookId, lesson (number)
router.get('/by-book', async (req: Request, res: Response) => {
  try {
    const { bookId, lesson } = req.query;
    if (!bookId || !lesson) {
      res.status(400).json({ message: 'bookId and lesson are required' });
      return;
    }
    const lessonNumber = parseInt(lesson as string, 10);
    if (isNaN(lessonNumber)) {
      res.status(400).json({ message: 'lesson must be a number' });
      return;
    }

    // bookId param is the book name (e.g. "shokyu_1"); resolve to UUID
    const book = await prisma.book.findUnique({ where: { name: bookId as string } });
    if (!book) {
      res.json([]);
      return;
    }

    const tracks = await prisma.audioTrack.findMany({
      where: { bookId: book.id, lessonNumber },
      orderBy: { trackNumber: 'asc' },
    });

    res.json(tracks.map((t) => ({
      id: t.id,
      bookId: t.bookId,
      lessonNumber: t.lessonNumber,
      trackNumber: t.trackNumber,
      filePath: t.filePath,
      fileName: t.fileName,
      trackType: t.trackType,
      sectionLabel: t.sectionLabel,
      description: t.description,
      scenarioContext: t.scenarioContext,
    })));
  } catch (err) {
    console.error('Get tracks by-book error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── GET /audio/stream/:bookId/:lesson/:track — stream by book coords ─
router.get('/stream/:bookId/:lesson/:track', async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId as string;
    const lessonNumber = parseInt(req.params.lesson as string, 10);
    const trackNumber = parseInt(req.params.track as string, 10);

    if (isNaN(lessonNumber) || isNaN(trackNumber)) {
      res.status(400).json({ message: 'Invalid lesson or track number' });
      return;
    }

    // bookId param is the book name (e.g. "shokyu_1"); resolve to UUID
    const book = await prisma.book.findUnique({ where: { name: bookId } });
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const audioTrack = await prisma.audioTrack.findUnique({
      where: {
        bookId_lessonNumber_trackNumber: { bookId: book.id, lessonNumber, trackNumber },
      },
    });

    if (!audioTrack) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    const audioPath = resolveAudioPath(audioTrack.filePath);

    if (!existsSync(audioPath)) {
      res.status(404).json({ message: 'Audio file not found' });
      return;
    }

    res.sendFile(audioPath);
  } catch (err) {
    console.error('Stream audio by-book error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/:lessonId', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.lessonId as string, 10);
    if (isNaN(lessonId)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }

    // Determine which lesson type and get bookId + lessonNumber
    const shokyuLesson = await prisma.shokyuLesson.findUnique({
      where: { id: lessonId },
      select: { bookId: true, lessonNumber: true },
    });

    const chukyuLesson = !shokyuLesson
      ? await prisma.chukyuLesson.findUnique({
          where: { id: lessonId },
          select: { bookId: true, lessonNumber: true },
        })
      : null;

    const lesson = shokyuLesson || chukyuLesson;
    if (!lesson) {
      res.json([]);
      return;
    }

    const tracks = await prisma.audioTrack.findMany({
      where: {
        bookId: lesson.bookId,
        lessonNumber: lesson.lessonNumber,
      },
      orderBy: { trackNumber: 'asc' },
    });

    const result = tracks.map((t) => ({
      id: t.id,
      bookId: t.bookId,
      lessonNumber: t.lessonNumber,
      trackNumber: t.trackNumber,
      filePath: t.filePath,
      fileName: t.fileName,
      trackType: t.trackType,
      sectionLabel: t.sectionLabel,
      description: t.description,
      scenarioContext: t.scenarioContext,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get audio tracks error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /audio/:lessonId/:track — stream/serve an audio file
router.get('/:lessonId/:track', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.lessonId as string, 10);
    const trackNumber = parseInt(req.params.track as string, 10);

    if (isNaN(lessonId) || isNaN(trackNumber)) {
      res.status(400).json({ message: 'Invalid parameters' });
      return;
    }

    const shokyuLesson = await prisma.shokyuLesson.findUnique({
      where: { id: lessonId },
      select: { bookId: true, lessonNumber: true },
    });

    const chukyuLesson = !shokyuLesson
      ? await prisma.chukyuLesson.findUnique({
          where: { id: lessonId },
          select: { bookId: true, lessonNumber: true },
        })
      : null;

    const lesson = shokyuLesson || chukyuLesson;
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    const track = await prisma.audioTrack.findUnique({
      where: {
        bookId_lessonNumber_trackNumber: {
          bookId: lesson.bookId,
          lessonNumber: lesson.lessonNumber,
          trackNumber,
        },
      },
    });

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Send the file — filePath is relative to project root
    const audioPath = resolveAudioPath(track.filePath);

    if (!existsSync(audioPath)) {
      res.status(404).json({ message: 'Audio file not found' });
      return;
    }

    res.sendFile(audioPath);
  } catch (err) {
    console.error('Stream audio error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
