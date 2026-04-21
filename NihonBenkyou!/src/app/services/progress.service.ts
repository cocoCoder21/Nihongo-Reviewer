import { api } from './api';
import type {
  JLPTLevel,
  UserProgress,
  DashboardStats,
  UserStreak,
  DailyActivity,
  WeaknessItem,
  SrsCard,
  SrsReviewRequest,
  StudySessionRequest,
  LessonProgress,
} from '../types';

export const progressService = {
  // ─── Progress ───────────────────────────────────────────────────
  async getProgress(): Promise<UserProgress[]> {
    return api.get<UserProgress[]>('/user/progress');
  },

  async getLevelProgress(level: JLPTLevel): Promise<UserProgress> {
    return api.get<UserProgress>(`/user/progress/${level}`);
  },

  async completLesson(lessonId: number, score: number, contentType: string): Promise<LessonProgress> {
    return api.post<LessonProgress>('/user/progress/lesson', { lessonId, score, contentType });
  },

  async updateVocabProgress(vocabularyId: number, correct: boolean): Promise<void> {
    return api.post('/user/progress/vocabulary', { vocabularyId, correct });
  },

  async updateGrammarProgress(grammarId: number, correct: boolean): Promise<void> {
    return api.post('/user/progress/grammar', { grammarId, correct });
  },

  async updateKanjiProgress(kanjiId: number, correct: boolean, writingPracticed?: boolean): Promise<void> {
    return api.post('/user/progress/kanji', { kanjiId, correct, writingPracticed });
  },

  // ─── SRS ────────────────────────────────────────────────────────
  async getDueCards(): Promise<SrsCard[]> {
    return api.get<SrsCard[]>('/user/srs/due');
  },

  async submitReview(review: SrsReviewRequest): Promise<SrsCard> {
    return api.post<SrsCard>('/user/srs/review', review);
  },

  // ─── Stats ──────────────────────────────────────────────────────
  async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/user/stats');
  },

  async getWeaknesses(): Promise<WeaknessItem[]> {
    return api.get<WeaknessItem[]>('/user/stats/weakness');
  },

  // ─── Streak ─────────────────────────────────────────────────────
  async getStreak(): Promise<UserStreak> {
    return api.get<UserStreak>('/user/streak');
  },

  // ─── Activity ───────────────────────────────────────────────────
  async getActivity(range: '7d' | '30d' = '7d'): Promise<DailyActivity[]> {
    return api.get<DailyActivity[]>('/user/activity', { range });
  },

  // ─── Study Sessions ────────────────────────────────────────────
  async logStudySession(session: StudySessionRequest): Promise<void> {
    return api.post('/user/study-session', session);
  },

  // ─── Familiarity ────────────────────────────────────────────────
  // One-way: marks an item as familiarized. Idempotent on the server —
  // calling it for an already-familiar item is a no-op.
  async markFamiliar(contentType: string, contentId: number): Promise<{ familiarized: boolean }> {
    return api.post('/user/familiarity', { contentType, contentId });
  },

  async getFamiliarity(contentType?: string): Promise<{ contentType: string; contentId: number }[]> {
    const params = contentType ? { contentType } : undefined;
    return api.get('/user/familiarity', params);
  },

  async getFamiliarityCounts(): Promise<Record<string, number>> {
    return api.get('/user/familiarity/counts');
  },
};
