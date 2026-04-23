-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "RadicalPosition" AS ENUM ('HEN', 'TSUKURI', 'KANMURI', 'ASHI', 'TARE', 'NYOU', 'KAMAE');

-- CreateEnum
CREATE TYPE "KanaRow" AS ENUM ('A', 'KA', 'SA', 'TA', 'NA', 'HA', 'MA', 'YA', 'RA', 'WA', 'N');

-- CreateEnum
CREATE TYPE "HiraganaType" AS ENUM ('SEION', 'DAKUON', 'HANDAKUON', 'YOUON');

-- CreateEnum
CREATE TYPE "KatakanaType" AS ENUM ('SEION', 'DAKUON', 'HANDAKUON', 'YOUON', 'GAIRAIGO');

-- CreateEnum
CREATE TYPE "ContentTypeEnum" AS ENUM ('SHOKYU', 'CHUKYU');

-- CreateEnum
CREATE TYPE "QuizContentType" AS ENUM ('VOCAB_MEANING', 'GRAMMAR_FILL', 'KANJI_READING', 'TRANSLATION');

-- CreateEnum
CREATE TYPE "SrsContentType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'KANJI', 'HIRAGANA', 'KATAKANA', 'RADICAL');

-- CreateEnum
CREATE TYPE "AudioTrackType" AS ENUM ('BUNKEI', 'REIBUN', 'KOTOBA', 'KAIWA', 'RENSHU_C', 'MONDAI', 'YOMIMONO', 'CHOUKAI');

-- CreateEnum
CREATE TYPE "SrsStatus" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'MASTERED');

-- CreateEnum
CREATE TYPE "StudySessionType" AS ENUM ('LESSON', 'REVIEW', 'QUIZ', 'FLASHCARD', 'POMODORO');

-- CreateTable
CREATE TABLE "JlptLevel" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "JlptLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "jlptLevelId" TEXT NOT NULL,
    "totalLessons" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShokyuLesson" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ShokyuLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShokyuVocabulary" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT NOT NULL DEFAULT '',
    "exampleMeaning" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShokyuVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShokyuGrammar" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "pattern" TEXT NOT NULL,
    "meaning" TEXT NOT NULL DEFAULT '',
    "formation" TEXT NOT NULL DEFAULT '',
    "rule" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "particles" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShokyuGrammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChukyuLesson" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ChukyuLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChukyuVocabulary" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT NOT NULL DEFAULT '',
    "exampleMeaning" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "usefulExpressions" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChukyuVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChukyuGrammar" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "pattern" TEXT NOT NULL,
    "meaning" TEXT NOT NULL DEFAULT '',
    "formation" TEXT NOT NULL DEFAULT '',
    "rule" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "particles" JSONB NOT NULL DEFAULT '[]',
    "crossReference" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChukyuGrammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kanji" (
    "id" SERIAL NOT NULL,
    "jlptLevelId" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "onyomi" TEXT NOT NULL DEFAULT '',
    "kunyomi" TEXT NOT NULL DEFAULT '',
    "meanings" TEXT NOT NULL,
    "strokeCount" INTEGER NOT NULL DEFAULT 0,
    "mnemonic" TEXT NOT NULL DEFAULT '',
    "radicalId" INTEGER,
    "radicalGroup" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiVocabulary" (
    "id" SERIAL NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "KanjiVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiExample" (
    "id" SERIAL NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "japanese" TEXT NOT NULL,
    "english" TEXT NOT NULL,

    CONSTRAINT "KanjiExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Radical" (
    "id" SERIAL NOT NULL,
    "character" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "position" "RadicalPosition" NOT NULL,
    "commonKanji" JSONB NOT NULL DEFAULT '[]',
    "semanticCategory" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Radical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hiragana" (
    "id" SERIAL NOT NULL,
    "character" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "row" "KanaRow" NOT NULL,
    "type" "HiraganaType" NOT NULL,
    "baseCharacterId" INTEGER,
    "strokeCount" INTEGER NOT NULL DEFAULT 0,
    "mnemonic" TEXT NOT NULL DEFAULT '',
    "exampleWord" TEXT NOT NULL DEFAULT '',
    "exampleReading" TEXT NOT NULL DEFAULT '',
    "exampleMeaning" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Hiragana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Katakana" (
    "id" SERIAL NOT NULL,
    "character" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "row" "KanaRow" NOT NULL,
    "type" "KatakanaType" NOT NULL,
    "baseCharacterId" INTEGER,
    "strokeCount" INTEGER NOT NULL DEFAULT 0,
    "mnemonic" TEXT NOT NULL DEFAULT '',
    "exampleWord" TEXT NOT NULL DEFAULT '',
    "exampleReading" TEXT NOT NULL DEFAULT '',
    "exampleMeaning" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Katakana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grammar" (
    "id" SERIAL NOT NULL,
    "jlptLevelId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "meaning" TEXT NOT NULL DEFAULT '',
    "formation" TEXT NOT NULL DEFAULT '',
    "rule" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "particles" JSONB NOT NULL DEFAULT '[]',
    "sourceBook" TEXT NOT NULL DEFAULT '',
    "sourceLessonNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Grammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" SERIAL NOT NULL,
    "jlptLevelId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT NOT NULL DEFAULT '',
    "exampleMeaning" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "sourceBook" TEXT NOT NULL DEFAULT '',
    "sourceLessonNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "trackNumber" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "trackType" "AudioTrackType" NOT NULL DEFAULT 'MONDAI',
    "sectionLabel" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "scenarioContext" TEXT,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "jlptLevelId" TEXT NOT NULL,
    "lessonNumber" INTEGER,
    "type" "QuizContentType" NOT NULL,
    "contentType" "ContentTypeEnum",
    "contentId" INTEGER,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "currentJlptLevel" TEXT NOT NULL DEFAULT 'N5',
    "userType" "UserType" NOT NULL DEFAULT 'STUDENT',
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "showRomaji" BOOLEAN NOT NULL DEFAULT false,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "preferredStudyTime" TEXT,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jlptLevelId" TEXT NOT NULL,
    "overallMastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "vocabMastered" INTEGER NOT NULL DEFAULT 0,
    "grammarMastered" INTEGER NOT NULL DEFAULT 0,
    "kanjiMastered" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentType" "ContentTypeEnum" NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "vocabularyId" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "mastered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VocabularyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "grammarId" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "mastered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GrammarProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "writingPracticed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KanjiProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SrsCard" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentType" "SrsContentType" NOT NULL,
    "contentId" INTEGER NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReview" TIMESTAMP(3),
    "status" "SrsStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "SrsCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "type" "StudySessionType" NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "itemsStudied" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "totalStudyDays" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "minutesStudied" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "reviewsCompleted" INTEGER NOT NULL DEFAULT 0,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyBlock" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "date" DATE NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFamiliarity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentFamiliarity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JlptLevel_order_key" ON "JlptLevel"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");

-- CreateIndex
CREATE INDEX "Book_jlptLevelId_idx" ON "Book"("jlptLevelId");

-- CreateIndex
CREATE INDEX "ShokyuLesson_bookId_idx" ON "ShokyuLesson"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ShokyuLesson_bookId_lessonNumber_key" ON "ShokyuLesson"("bookId", "lessonNumber");

-- CreateIndex
CREATE INDEX "ShokyuVocabulary_lessonId_idx" ON "ShokyuVocabulary"("lessonId");

-- CreateIndex
CREATE INDEX "ShokyuGrammar_lessonId_idx" ON "ShokyuGrammar"("lessonId");

-- CreateIndex
CREATE INDEX "ChukyuLesson_bookId_idx" ON "ChukyuLesson"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ChukyuLesson_bookId_lessonNumber_key" ON "ChukyuLesson"("bookId", "lessonNumber");

-- CreateIndex
CREATE INDEX "ChukyuVocabulary_lessonId_idx" ON "ChukyuVocabulary"("lessonId");

-- CreateIndex
CREATE INDEX "ChukyuGrammar_lessonId_idx" ON "ChukyuGrammar"("lessonId");

-- CreateIndex
CREATE INDEX "Kanji_jlptLevelId_idx" ON "Kanji"("jlptLevelId");

-- CreateIndex
CREATE INDEX "Kanji_radicalId_idx" ON "Kanji"("radicalId");

-- CreateIndex
CREATE INDEX "Kanji_jlptLevelId_category_idx" ON "Kanji"("jlptLevelId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Kanji_jlptLevelId_character_key" ON "Kanji"("jlptLevelId", "character");

-- CreateIndex
CREATE INDEX "KanjiVocabulary_kanjiId_idx" ON "KanjiVocabulary"("kanjiId");

-- CreateIndex
CREATE INDEX "KanjiExample_kanjiId_idx" ON "KanjiExample"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "Radical_character_key" ON "Radical"("character");

-- CreateIndex
CREATE UNIQUE INDEX "Hiragana_character_key" ON "Hiragana"("character");

-- CreateIndex
CREATE UNIQUE INDEX "Katakana_character_key" ON "Katakana"("character");

-- CreateIndex
CREATE INDEX "Grammar_jlptLevelId_idx" ON "Grammar"("jlptLevelId");

-- CreateIndex
CREATE INDEX "Grammar_sourceBook_sourceLessonNumber_idx" ON "Grammar"("sourceBook", "sourceLessonNumber");

-- CreateIndex
CREATE INDEX "Vocabulary_jlptLevelId_idx" ON "Vocabulary"("jlptLevelId");

-- CreateIndex
CREATE INDEX "Vocabulary_sourceBook_sourceLessonNumber_idx" ON "Vocabulary"("sourceBook", "sourceLessonNumber");

-- CreateIndex
CREATE INDEX "AudioTrack_bookId_lessonNumber_idx" ON "AudioTrack"("bookId", "lessonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AudioTrack_bookId_lessonNumber_trackNumber_key" ON "AudioTrack"("bookId", "lessonNumber", "trackNumber");

-- CreateIndex
CREATE INDEX "QuizQuestion_jlptLevelId_idx" ON "QuizQuestion"("jlptLevelId");

-- CreateIndex
CREATE INDEX "QuizQuestion_jlptLevelId_lessonNumber_idx" ON "QuizQuestion"("jlptLevelId", "lessonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserProgress_userId_idx" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_jlptLevelId_key" ON "UserProgress"("userId", "jlptLevelId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_contentType_lessonId_key" ON "LessonProgress"("userId", "contentType", "lessonId");

-- CreateIndex
CREATE INDEX "VocabularyProgress_userId_idx" ON "VocabularyProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyProgress_userId_vocabularyId_key" ON "VocabularyProgress"("userId", "vocabularyId");

-- CreateIndex
CREATE INDEX "GrammarProgress_userId_idx" ON "GrammarProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarProgress_userId_grammarId_key" ON "GrammarProgress"("userId", "grammarId");

-- CreateIndex
CREATE INDEX "KanjiProgress_userId_idx" ON "KanjiProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiProgress_userId_kanjiId_key" ON "KanjiProgress"("userId", "kanjiId");

-- CreateIndex
CREATE INDEX "SrsCard_userId_nextReview_idx" ON "SrsCard"("userId", "nextReview");

-- CreateIndex
CREATE INDEX "SrsCard_userId_status_idx" ON "SrsCard"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SrsCard_userId_contentType_contentId_key" ON "SrsCard"("userId", "contentType", "contentId");

-- CreateIndex
CREATE INDEX "StudySession_userId_idx" ON "StudySession"("userId");

-- CreateIndex
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");

-- CreateIndex
CREATE INDEX "DailyActivity_userId_idx" ON "DailyActivity"("userId");

-- CreateIndex
CREATE INDEX "DailyActivity_userId_date_idx" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "StudyBlock_userId_date_idx" ON "StudyBlock"("userId", "date");

-- CreateIndex
CREATE INDEX "ContentFamiliarity_userId_contentType_idx" ON "ContentFamiliarity"("userId", "contentType");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFamiliarity_userId_contentType_contentId_key" ON "ContentFamiliarity"("userId", "contentType", "contentId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_jlptLevelId_fkey" FOREIGN KEY ("jlptLevelId") REFERENCES "JlptLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShokyuLesson" ADD CONSTRAINT "ShokyuLesson_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShokyuVocabulary" ADD CONSTRAINT "ShokyuVocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ShokyuLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShokyuGrammar" ADD CONSTRAINT "ShokyuGrammar_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ShokyuLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChukyuLesson" ADD CONSTRAINT "ChukyuLesson_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChukyuVocabulary" ADD CONSTRAINT "ChukyuVocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ChukyuLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChukyuGrammar" ADD CONSTRAINT "ChukyuGrammar_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ChukyuLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kanji" ADD CONSTRAINT "Kanji_jlptLevelId_fkey" FOREIGN KEY ("jlptLevelId") REFERENCES "JlptLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kanji" ADD CONSTRAINT "Kanji_radicalId_fkey" FOREIGN KEY ("radicalId") REFERENCES "Radical"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiVocabulary" ADD CONSTRAINT "KanjiVocabulary_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiExample" ADD CONSTRAINT "KanjiExample_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hiragana" ADD CONSTRAINT "Hiragana_baseCharacterId_fkey" FOREIGN KEY ("baseCharacterId") REFERENCES "Hiragana"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Katakana" ADD CONSTRAINT "Katakana_baseCharacterId_fkey" FOREIGN KEY ("baseCharacterId") REFERENCES "Katakana"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grammar" ADD CONSTRAINT "Grammar_jlptLevelId_fkey" FOREIGN KEY ("jlptLevelId") REFERENCES "JlptLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_jlptLevelId_fkey" FOREIGN KEY ("jlptLevelId") REFERENCES "JlptLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioTrack" ADD CONSTRAINT "AudioTrack_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_jlptLevelId_fkey" FOREIGN KEY ("jlptLevelId") REFERENCES "JlptLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_jlptLevelId_fkey" FOREIGN KEY ("jlptLevelId") REFERENCES "JlptLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyProgress" ADD CONSTRAINT "VocabularyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyProgress" ADD CONSTRAINT "VocabularyProgress_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarProgress" ADD CONSTRAINT "GrammarProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarProgress" ADD CONSTRAINT "GrammarProgress_grammarId_fkey" FOREIGN KEY ("grammarId") REFERENCES "Grammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiProgress" ADD CONSTRAINT "KanjiProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiProgress" ADD CONSTRAINT "KanjiProgress_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SrsCard" ADD CONSTRAINT "SrsCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyBlock" ADD CONSTRAINT "StudyBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFamiliarity" ADD CONSTRAINT "ContentFamiliarity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
