// ─── JLPT & Level Types ───────────────────────────────────────────

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type BookId = 'shokyu_1' | 'shokyu_2' | 'chukyu_1' | 'chukyu_2';

export type ContentType = 'shokyu' | 'chukyu';

export interface LevelInfo {
  id: JLPTLevel;
  label: string;
  description: string;
  vocabCount: number;
  kanjiCount: number;
  grammarCount: number;
  order: number;
}

export interface Book {
  id: string;
  name: BookId;
  displayName: string;
  jlptLevelId: JLPTLevel;
  totalLessons: number;
}

// ─── Lesson Types ─────────────────────────────────────────────────

export interface Lesson {
  id: number;
  bookId: string;
  lessonNumber: number;
  title: string;
  contentType: ContentType;
  vocabularyCount: number;
  grammarCount: number;
}

// ─── Vocabulary Types ─────────────────────────────────────────────

export interface VocabItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  category?: string;
  lessonNumber?: number;
  sourceBook?: BookId;
}

// ─── Grammar Types ────────────────────────────────────────────────

export interface GrammarItem {
  id: string;
  title: string;
  pattern?: string;
  meaning?: string;
  formation?: string;
  rule: string;
  examples: { japanese: string; english: string }[];
  example: string;
  exampleConverted: string;
  exampleRomaji: string;
  exampleMeaning: string;
  sentence: string;
  sentenceRomaji: string;
  sentenceMeaning: string;
  crossReference?: string | null;
  lessonNumber?: number;
  sourceBook?: BookId;
  particles?: string[];
}

// ─── Kanji Types ──────────────────────────────────────────────────

export interface KanjiItem {
  id: string;
  kanji: string;
  reading: string;
  onyomi?: string;
  kunyomi?: string;
  meaning: string;
  strokeCount: number;
  mnemonic?: string;
  radicalId?: number | null;
  category?: string;
  examples: string[];
  vocabulary?: { word: string; reading: string; meaning: string }[];
  exampleSentences?: { japanese: string; english: string }[];
}

export interface KanjiCategory {
  name: string;
  count: number;
}

// ─── Radical Types ────────────────────────────────────────────────

export type RadicalPosition = 'HEN' | 'TSUKURI' | 'KANMURI' | 'ASHI' | 'TARE' | 'NYOU' | 'KAMAE';

export interface Radical {
  id: number;
  character: string;
  name: string;
  meaning: string;
  position: RadicalPosition;
  commonKanji: string[];
  semanticCategory: string;
}

// ─── Kana Types ───────────────────────────────────────────────────

export type KanaRow = 'A' | 'KA' | 'SA' | 'TA' | 'NA' | 'HA' | 'MA' | 'YA' | 'RA' | 'WA' | 'N';

export type HiraganaType = 'SEION' | 'DAKUON' | 'HANDAKUON' | 'YOUON';
export type KatakanaType = 'SEION' | 'DAKUON' | 'HANDAKUON' | 'YOUON' | 'GAIRAIGO';

export interface KanaChar {
  id: number;
  character: string;
  romaji: string;
  row: KanaRow;
  type: HiraganaType | KatakanaType;
  strokeCount: number;
  mnemonic?: string;
  exampleWord?: string;
  exampleReading?: string;
  exampleMeaning?: string;
}

// ─── Audio Types ──────────────────────────────────────────────────

export type AudioTrackType = 'BUNKEI' | 'REIBUN' | 'KOTOBA' | 'KAIWA' | 'RENSHU_C' | 'MONDAI' | 'YOMIMONO' | 'CHOUKAI';

export interface AudioTrack {
  id: number;
  bookId: string;
  lessonNumber: number;
  trackNumber: number;
  filePath: string;
  fileName: string;
  trackType: AudioTrackType;
  sectionLabel: string;
  description?: string;
  scenarioContext?: string;
}

// ─── Quiz Types ───────────────────────────────────────────────────

export type QuizType = 'vocab-meaning' | 'grammar-fill' | 'kanji-reading' | 'translation';
export type QuizCategory = 'vocabulary' | 'grammar' | 'kanji';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options: string[];
  correctIndex: number;
  category: QuizCategory;
  explanation: string;
}

// ─── User & Auth Types ────────────────────────────────────────────

export type UserType = 'STUDENT' | 'PROFESSIONAL';

export interface User {
  id: number;
  email: string;
  displayName: string;
  currentJlptLevel: JLPTLevel;
  userType: UserType;
  dailyGoalMinutes: number;
  createdAt: string;
}

export interface UserSettings {
  showRomaji: boolean;
  preferredStudyTime?: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  currentJlptLevel?: JLPTLevel;
  userType?: UserType;
}

export interface AuthResponse {
  user: User;
  message: string;
}

// ─── Progress Types ───────────────────────────────────────────────

export interface UserProgress {
  jlptLevelId: JLPTLevel;
  overallMastery: number;
  lessonsCompleted: number;
  totalLessons: number;
  vocabMastered: number;
  grammarMastered: number;
  kanjiMastered: number;
}

export interface LessonProgress {
  lessonId: number;
  contentType: ContentType;
  completed: boolean;
  score: number;
  completedAt?: string;
  attempts: number;
}

export interface ItemProgress {
  correct: number;
  incorrect: number;
  lastReviewed?: string;
  mastered: boolean;
}

// ─── SRS Types ────────────────────────────────────────────────────

export type SrsContentType = 'VOCABULARY' | 'GRAMMAR' | 'KANJI' | 'HIRAGANA' | 'KATAKANA';
export type SrsStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
export type Difficulty = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCard {
  id: number;
  contentType: SrsContentType;
  contentId: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
  status: SrsStatus;
  // Populated from content
  front?: string;
  reading?: string;
  meaning?: string;
  category?: string;
}

export interface SrsReviewRequest {
  cardId: number;
  difficulty: Difficulty;
}

// ─── Stats Types ──────────────────────────────────────────────────

export interface DashboardStats {
  streak: number;
  xp: number;
  xpGoal: number;
  reviewsDue: number;
  totalStudyHours: number;
  cardsMastered: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  todayLessonsCompleted: number;
  todayReviewsCompleted: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string;
  totalStudyDays: number;
}

export interface DailyActivity {
  date: string;
  xpEarned: number;
  minutesStudied: number;
  lessonsCompleted: number;
  reviewsCompleted: number;
  quizzesCompleted: number;
}

export interface WeaknessItem {
  id: number;
  type: 'vocabulary' | 'grammar' | 'kanji';
  content: string;
  reading?: string;
  meaning: string;
  accuracy: number;
  totalAttempts: number;
}

export interface StudySessionRequest {
  type: 'LESSON' | 'REVIEW' | 'QUIZ' | 'FLASHCARD';
  xpEarned: number;
  itemsStudied: number;
}

// ─── Level Content (for backward compat with existing pages) ─────

export interface LevelContent {
  vocabulary: VocabItem[];
  grammar: GrammarItem[];
  kanji: KanjiItem[];
}

// ─── API Response Wrappers ────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
