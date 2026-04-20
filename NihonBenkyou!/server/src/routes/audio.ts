import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /audio/:lessonId — list audio tracks for a lesson
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
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const audioPath = path.resolve(__dirname, '..', '..', '..', '..', track.filePath);

    res.sendFile(audioPath);
  } catch (err) {
    console.error('Stream audio error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
