/**
 * Seed AudioTrack records from the Audio folder on disk.
 *
 * Run with:
 *   npx tsx prisma/seed-audio.ts
 *
 * Audio folder structure expected:
 *   Audio/shokyu/shokyu_1/lesson_01/track_1.mp3
 *   Audio/shokyu/shokyu_2/lesson_26/track_1.mp3
 *   Audio/chukyu/chukyu_1/lesson_01/track_1.mp3
 *   Audio/chukyu/chukyu_2/lesson_13/track_1.mp3
 */

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env BEFORE importing prisma so DATABASE_URL is set when PrismaPg adapter initializes
config({ path: path.join(__dirname, '../.env') });

// Dynamic import ensures prisma is initialized AFTER env is loaded
const { default: prisma } = await import('../src/lib/prisma.js');

interface BookConfig {
  id: string;
  /** Relative path from the Audio/ root */
  folder: string;
  lessonNumbers: number[];
}

const AUDIO_ROOT = path.resolve(__dirname, '..', '..', '..', 'Audio');

const BOOKS: BookConfig[] = [
  {
    id: 'shokyu_1',
    folder: 'shokyu/shokyu_1',
    lessonNumbers: Array.from({ length: 25 }, (_, i) => i + 1),
  },
  {
    id: 'shokyu_2',
    folder: 'shokyu/shokyu_2',
    lessonNumbers: Array.from({ length: 25 }, (_, i) => i + 26),
  },
  {
    id: 'chukyu_1',
    folder: 'chukyu/chukyu_1',
    lessonNumbers: Array.from({ length: 12 }, (_, i) => i + 1),
  },
  {
    id: 'chukyu_2',
    folder: 'chukyu/chukyu_2',
    lessonNumbers: Array.from({ length: 12 }, (_, i) => i + 13),
  },
];

async function main() {
  let total = 0;
  let created = 0;

  for (const book of BOOKS) {
    // Check the book exists in DB before seeding (look up by name, not id)
    const bookRecord = await prisma.book.findUnique({ where: { name: book.id } });
    if (!bookRecord) {
      console.warn(`[SKIP] Book "${book.id}" not found in DB — skipping`);
      continue;
    }
    const bookUuid = bookRecord.id; // the actual UUID primary key

    for (const lessonNumber of book.lessonNumbers) {
      const paddedLesson = String(lessonNumber).padStart(2, '0');
      const lessonFolder = path.join(AUDIO_ROOT, book.folder, `lesson_${paddedLesson}`);

      if (!fs.existsSync(lessonFolder)) {
        continue;
      }

      const files = fs
        .readdirSync(lessonFolder)
        .filter((f) => f.toLowerCase().endsWith('.mp3'))
        .sort();

      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const trackNumber = i + 1;
        // filePath relative to project root (minna-no-nihongo-reviewer/)
        const filePath = `Audio/${book.folder}/lesson_${paddedLesson}/${fileName}`;

        total++;
        await prisma.audioTrack.upsert({
          where: {
            bookId_lessonNumber_trackNumber: {
              bookId: bookUuid,
              lessonNumber,
              trackNumber,
            },
          },
          update: { filePath, fileName },
          create: {
            bookId: bookUuid,
            lessonNumber,
            trackNumber,
            filePath,
            fileName,
          },
        });
        created++;
        console.log(`  ✓ ${book.id} lesson ${lessonNumber} track ${trackNumber} — ${fileName}`);
      }
    }
  }

  console.log(`\nDone. ${created}/${total} audio tracks seeded.`);
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
