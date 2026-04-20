import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { resolve, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import { parseShokyuLesson, extractParticles } from './parsers/shokyu-lesson-parser.js';
import { parseChukyuLesson } from './parsers/chukyu-lesson-parser.js';
import { parseKanjiFile } from './parsers/kanji-parser.js';
import { parseRadicalsFile } from './parsers/radical-parser.js';
import { seedKana } from './seed-kana.js';
import { seedExamples } from './seed-examples.js';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// ─── Path helpers ─────────────────────────────────────────────────
// Data root is 2 levels up from server/ (i.e. minna-no-nihongo-reviewer/)
const DATA_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');

const PATHS = {
  shokyu1Lessons: join(DATA_ROOT, 'shokyu', 'nihongo_1_lessons'),
  shokyu2Lessons: join(DATA_ROOT, 'shokyu', 'nihongo_2_lessons'),
  chukyu1Lessons: join(DATA_ROOT, 'chukyu', 'chukyu_1_lessons'),
  chukyu2Lessons: join(DATA_ROOT, 'chukyu', 'chukyu_2_lessons'),
  kanjiN5: join(DATA_ROOT, 'Kanji', 'kanji_n5.md'),
  kanjiN4: join(DATA_ROOT, 'Kanji', 'kanji_n4.md'),
  kanjiN3: join(DATA_ROOT, 'Kanji', 'kanji_n3.md'),
  kanjiN2: join(DATA_ROOT, 'Kanji', 'kanji_n2.md'),
  kanjiN1: join(DATA_ROOT, 'Kanji', 'kanji_n1.md'),
  radicals: join(DATA_ROOT, 'Kanji', 'radicals.md'),
};

// ─── Helpers ──────────────────────────────────────────────────────

function getLessonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => join(dir, f));
}

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

async function runSubScript(relPath: string) {
  const { spawnSync } = await import('child_process');
  const scriptPath = resolve(import.meta.dirname, relPath);
  const result = spawnSync('npx', ['tsx', scriptPath], {
    stdio: 'inherit',
    shell: true,
    cwd: resolve(import.meta.dirname, '..', '..'),
  });
  if (result.status !== 0) {
    throw new Error(`Sub-seed script failed: ${relPath} (exit ${result.status})`);
  }
}

// ─── JLPT Levels ─────────────────────────────────────────────────

async function seedJlptLevels() {
  log('Seeding JLPT levels...');
  const levels = [
    { id: 'N5', label: 'JLPT N5 — Beginner', description: 'Basic Japanese: greetings, numbers, simple sentences', order: 5 },
    { id: 'N4', label: 'JLPT N4 — Upper Beginner', description: 'Basic conversational Japanese, daily life situations', order: 4 },
    { id: 'N3', label: 'JLPT N3 — Intermediate', description: 'Everyday Japanese, read simple articles and follow conversations', order: 3 },
    { id: 'N2', label: 'JLPT N2 — Upper Intermediate', description: 'Read newspapers, understand complex discussions', order: 2 },
    { id: 'N1', label: 'JLPT N1 — Advanced', description: 'Near-native comprehension of complex texts and speech', order: 1 },
  ];

  for (const level of levels) {
    await prisma.jlptLevel.upsert({
      where: { id: level.id },
      update: level,
      create: level,
    });
  }
  log(`  ✓ ${levels.length} JLPT levels`);
}

// ─── Books ────────────────────────────────────────────────────────

async function seedBooks() {
  log('Seeding books...');
  const books = [
    { name: 'shokyu_1', displayName: 'Minna no Nihongo Shokyu I', jlptLevelId: 'N5', totalLessons: 25 },
    { name: 'shokyu_2', displayName: 'Minna no Nihongo Shokyu II', jlptLevelId: 'N4', totalLessons: 25 },
    { name: 'chukyu_1', displayName: 'Minna no Nihongo Chukyu I', jlptLevelId: 'N3', totalLessons: 12 },
    { name: 'chukyu_2', displayName: 'Minna no Nihongo Chukyu II', jlptLevelId: 'N2', totalLessons: 12 },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { name: book.name },
      update: book,
      create: book,
    });
  }
  log(`  ✓ ${books.length} books`);
}

// ─── Shokyu Lessons ──────────────────────────────────────────────

async function seedShokyuLessons() {
  log('Seeding Shokyu lessons...');
  const bookPairs: [string, string][] = [
    ['shokyu_1', PATHS.shokyu1Lessons],
    ['shokyu_2', PATHS.shokyu2Lessons],
  ];

  let totalLessons = 0;
  let totalVocab = 0;
  let totalGrammar = 0;

  for (const [bookName, dir] of bookPairs) {
    const book = await prisma.book.findUnique({ where: { name: bookName } });
    if (!book) { log(`  ⚠ Book ${bookName} not found, skipping`); continue; }

    const files = getLessonFiles(dir);
    for (const file of files) {
      try {
        const parsed = parseShokyuLesson(file);

        const lesson = await prisma.shokyuLesson.upsert({
          where: { bookId_lessonNumber: { bookId: book.id, lessonNumber: parsed.lessonNumber } },
          update: { title: parsed.title },
          create: {
            bookId: book.id,
            lessonNumber: parsed.lessonNumber,
            title: parsed.title,
          },
        });

        // Delete existing vocab & grammar for clean re-seed
        await prisma.shokyuVocabulary.deleteMany({ where: { lessonId: lesson.id } });
        await prisma.shokyuGrammar.deleteMany({ where: { lessonId: lesson.id } });

        // Insert vocabulary
        if (parsed.vocabulary.length > 0) {
          await prisma.shokyuVocabulary.createMany({
            data: parsed.vocabulary.map(v => ({
              lessonId: lesson.id,
              word: v.word,
              reading: v.reading,
              meaning: v.meaning,
              example: v.example,
              exampleMeaning: v.exampleMeaning,
              category: v.category,
              sortOrder: v.sortOrder,
            })),
          });
          totalVocab += parsed.vocabulary.length;
        }

        // Insert grammar
        if (parsed.grammar.length > 0) {
          await prisma.shokyuGrammar.createMany({
            data: parsed.grammar.map(g => ({
              lessonId: lesson.id,
              pattern: g.pattern,
              meaning: g.meaning,
              formation: g.formation,
              rule: g.rule,
              examples: g.examples,
              particles: g.particles,
              sortOrder: g.sortOrder,
            })),
          });
          totalGrammar += parsed.grammar.length;
        }

        totalLessons++;
      } catch (e) {
        log(`  ⚠ Error parsing ${file}: ${(e as Error).message}`);
      }
    }
  }
  log(`  ✓ ${totalLessons} lessons, ${totalVocab} vocab, ${totalGrammar} grammar points`);
}

// ─── Chukyu Lessons ──────────────────────────────────────────────

async function seedChukyuLessons() {
  log('Seeding Chukyu lessons...');
  const bookPairs: [string, string][] = [
    ['chukyu_1', PATHS.chukyu1Lessons],
    ['chukyu_2', PATHS.chukyu2Lessons],
  ];

  let totalLessons = 0;
  let totalVocab = 0;
  let totalGrammar = 0;

  for (const [bookName, dir] of bookPairs) {
    const book = await prisma.book.findUnique({ where: { name: bookName } });
    if (!book) { log(`  ⚠ Book ${bookName} not found, skipping`); continue; }

    const files = getLessonFiles(dir);
    for (const file of files) {
      try {
        const parsed = parseChukyuLesson(file);

        const lesson = await prisma.chukyuLesson.upsert({
          where: { bookId_lessonNumber: { bookId: book.id, lessonNumber: parsed.lessonNumber } },
          update: { title: parsed.title },
          create: {
            bookId: book.id,
            lessonNumber: parsed.lessonNumber,
            title: parsed.title,
          },
        });

        await prisma.chukyuVocabulary.deleteMany({ where: { lessonId: lesson.id } });
        await prisma.chukyuGrammar.deleteMany({ where: { lessonId: lesson.id } });

        if (parsed.vocabulary.length > 0) {
          await prisma.chukyuVocabulary.createMany({
            data: parsed.vocabulary.map(v => ({
              lessonId: lesson.id,
              word: v.word,
              reading: v.reading,
              meaning: v.meaning,
              category: v.category,
              usefulExpressions: v.usefulExpressions,
              sortOrder: v.sortOrder,
            })),
          });
          totalVocab += parsed.vocabulary.length;
        }

        if (parsed.grammar.length > 0) {
          await prisma.chukyuGrammar.createMany({
            data: parsed.grammar.map(g => ({
              lessonId: lesson.id,
              pattern: g.pattern,
              meaning: g.meaning,
              formation: g.formation,
              rule: g.rule,
              examples: g.examples,
              crossReference: g.crossReference || null,
              particles: g.particles,
              sortOrder: g.sortOrder,
            })),
          });
          totalGrammar += parsed.grammar.length;
        }

        totalLessons++;
      } catch (e) {
        log(`  ⚠ Error parsing ${file}: ${(e as Error).message}`);
      }
    }
  }
  log(`  ✓ ${totalLessons} lessons, ${totalVocab} vocab, ${totalGrammar} grammar points`);
}

// ─── Radicals ─────────────────────────────────────────────────────

async function seedRadicals() {
  log('Seeding radicals...');
  if (!existsSync(PATHS.radicals)) { log('  ⚠ radicals.md not found, skipping'); return; }

  const parsed = parseRadicalsFile(PATHS.radicals);

  // Clear and re-seed (radicals have no FK dependencies from kanji yet at this point)
  for (const r of parsed) {
    await prisma.radical.upsert({
      where: { character: r.character },
      update: {
        name: r.name,
        meaning: r.meaning,
        position: r.position,
        commonKanji: r.commonKanji,
        semanticCategory: r.semanticCategory,
        sortOrder: r.sortOrder,
      },
      create: {
        character: r.character,
        name: r.name,
        meaning: r.meaning,
        position: r.position,
        commonKanji: r.commonKanji,
        semanticCategory: r.semanticCategory,
        sortOrder: r.sortOrder,
      },
    });
  }
  log(`  ✓ ${parsed.length} radicals`);
}

// ─── Kanji ────────────────────────────────────────────────────────

async function seedKanji() {
  log('Seeding kanji...');
  const kanjiFiles: [string, string][] = [
    ['N5', PATHS.kanjiN5],
    ['N4', PATHS.kanjiN4],
    ['N3', PATHS.kanjiN3],
    ['N2', PATHS.kanjiN2],
    ['N1', PATHS.kanjiN1],
  ];

  let totalKanji = 0;
  let totalKanjiVocab = 0;
  let totalKanjiExamples = 0;

  for (const [levelId, filePath] of kanjiFiles) {
    if (!existsSync(filePath)) {
      log(`  ⚠ ${filePath} not found, skipping`);
      continue;
    }

    const parsed = parseKanjiFile(filePath);
    for (const k of parsed) {
      // Try to find a matching radical
      let radicalId: number | null = null;
      if (k.radicalName) {
        const radicalChar = k.radicalName.split('(')[0].trim().charAt(0);
        if (radicalChar) {
          const radical = await prisma.radical.findUnique({ where: { character: radicalChar } });
          if (radical) radicalId = radical.id;
        }
      }

      const kanji = await prisma.kanji.upsert({
        where: { jlptLevelId_character: { jlptLevelId: levelId, character: k.character } },
        update: {
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          meanings: k.meanings,
          mnemonic: k.mnemonic,
          radicalId,
          radicalGroup: k.radicalName,
          category: k.category,
        },
        create: {
          jlptLevelId: levelId,
          character: k.character,
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          meanings: k.meanings,
          mnemonic: k.mnemonic,
          radicalId,
          radicalGroup: k.radicalName,
          category: k.category,
        },
      });

      // Clear and re-seed vocab + examples
      await prisma.kanjiVocabulary.deleteMany({ where: { kanjiId: kanji.id } });
      await prisma.kanjiExample.deleteMany({ where: { kanjiId: kanji.id } });

      if (k.vocabulary.length > 0) {
        await prisma.kanjiVocabulary.createMany({
          data: k.vocabulary.map(v => ({
            kanjiId: kanji.id,
            word: v.word,
            reading: v.reading,
            meaning: v.meaning,
          })),
        });
        totalKanjiVocab += k.vocabulary.length;
      }

      if (k.examples.length > 0) {
        await prisma.kanjiExample.createMany({
          data: k.examples.map(ex => ({
            kanjiId: kanji.id,
            japanese: ex.japanese,
            english: ex.english,
          })),
        });
        totalKanjiExamples += k.examples.length;
      }

      totalKanji++;
    }
  }
  log(`  ✓ ${totalKanji} kanji, ${totalKanjiVocab} vocab entries, ${totalKanjiExamples} examples`);
}

// ─── Unified Grammar & Vocabulary (cross-level) ──────────────────

async function seedUnifiedContent() {
  log('Seeding unified grammar & vocabulary tables...');
  let vocabCount = 0;
  let grammarCount = 0;

  // Pull from shokyu lessons
  const shokyuLessons = await prisma.shokyuLesson.findMany({
    include: { book: true, vocabulary: true, grammar: true },
  });

  for (const lesson of shokyuLessons) {
    const jlptLevelId = lesson.book.jlptLevelId;

    for (const v of lesson.vocabulary) {
      await prisma.vocabulary.upsert({
        where: {
          id: await findVocabId(jlptLevelId, v.word, v.reading),
        },
        update: {
          example: v.example,
          exampleMeaning: v.exampleMeaning,
        },
        create: {
          jlptLevelId,
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          example: v.example,
          exampleMeaning: v.exampleMeaning,
          category: v.category,
          sourceBook: lesson.book.name,
          sourceLessonNumber: lesson.lessonNumber,
        },
      });
      vocabCount++;
    }

    for (const g of lesson.grammar) {
      await prisma.grammar.upsert({
        where: {
          id: await findGrammarId(jlptLevelId, g.pattern, lesson.book.name, lesson.lessonNumber),
        },
        update: { particles: (g.particles as any) || [] },
        create: {
          jlptLevelId,
          pattern: g.pattern,
          meaning: g.meaning,
          formation: g.formation,
          rule: g.rule,
          examples: g.examples as any,
          particles: (g.particles as any) || [],
          sourceBook: lesson.book.name,
          sourceLessonNumber: lesson.lessonNumber,
        },
      });
      grammarCount++;
    }
  }

  // Pull from chukyu lessons
  const chukyuLessons = await prisma.chukyuLesson.findMany({
    include: { book: true, vocabulary: true, grammar: true },
  });

  for (const lesson of chukyuLessons) {
    const jlptLevelId = lesson.book.jlptLevelId;

    for (const v of lesson.vocabulary) {
      await prisma.vocabulary.upsert({
        where: {
          id: await findVocabId(jlptLevelId, v.word, v.reading),
        },
        update: {
          example: v.example,
          exampleMeaning: v.exampleMeaning,
        },
        create: {
          jlptLevelId,
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          example: v.example,
          exampleMeaning: v.exampleMeaning,
          category: v.category,
          sourceBook: lesson.book.name,
          sourceLessonNumber: lesson.lessonNumber,
        },
      });
      vocabCount++;
    }

    for (const g of lesson.grammar) {
      await prisma.grammar.upsert({
        where: {
          id: await findGrammarId(jlptLevelId, g.pattern, lesson.book.name, lesson.lessonNumber),
        },
        update: { particles: (g.particles as any) || [] },
        create: {
          jlptLevelId,
          pattern: g.pattern,
          meaning: g.meaning,
          formation: g.formation,
          rule: g.rule,
          examples: g.examples as any,
          particles: (g.particles as any) || [],
          sourceBook: lesson.book.name,
          sourceLessonNumber: lesson.lessonNumber,
        },
      });
      grammarCount++;
    }
  }

  log(`  ✓ ${vocabCount} unified vocab, ${grammarCount} unified grammar`);
}

// Helper: find existing vocab ID or return 0 for create
async function findVocabId(jlptLevelId: string, word: string, reading: string): Promise<number> {
  const existing = await prisma.vocabulary.findFirst({
    where: { jlptLevelId, word, reading },
    select: { id: true },
  });
  return existing?.id ?? 0;
}

// Helper: find existing grammar ID or return 0 for create
async function findGrammarId(jlptLevelId: string, pattern: string, sourceBook: string, sourceLessonNumber: number): Promise<number> {
  const existing = await prisma.grammar.findFirst({
    where: { jlptLevelId, pattern, sourceBook, sourceLessonNumber },
    select: { id: true },
  });
  return existing?.id ?? 0;
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║      NihonBenkyou! — Database Seeder     ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`Data root: ${DATA_ROOT}\n`);

  const start = Date.now();

  await seedJlptLevels();
  await seedBooks();
  await seedRadicals();
  await seedShokyuLessons();
  await seedChukyuLessons();
  await seedKanji();
  await seedKana(prisma);
  await seedUnifiedContent();
  log('Seeding vocabulary example sentences...');
  await seedExamples(prisma);

  log('Seeding audio tracks...');
  await runSubScript('../../prisma/seed-audio.ts');

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Seed completed in ${elapsed}s`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
