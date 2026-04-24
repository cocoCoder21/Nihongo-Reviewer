import { api, apiUrl } from './api';
import type {
  JLPTLevel,
  LevelInfo,
  Lesson,
  VocabItem,
  GrammarItem,
  KanjiItem,
  KanjiCategory,
  Radical,
  KanaChar,
  AudioTrack,
  QuizQuestion,
  LevelContent,
} from '../types';

export const contentService = {
  // ─── Levels ─────────────────────────────────────────────────────
  async getLevels(): Promise<LevelInfo[]> {
    return api.get<LevelInfo[]>('/levels');
  },

  async getLevelLessons(level: JLPTLevel): Promise<Lesson[]> {
    return api.get<Lesson[]>(`/levels/${level}/lessons`);
  },

  // ─── Lessons ────────────────────────────────────────────────────
  async getLesson(id: number): Promise<Lesson & { vocabulary: VocabItem[]; grammar: GrammarItem[] }> {
    return api.get(`/lessons/${id}`);
  },

  // ─── Vocabulary ─────────────────────────────────────────────────
  async getVocabulary(level: JLPTLevel, params?: { lesson?: string }): Promise<VocabItem[]> {
    return api.get<VocabItem[]>(`/levels/${level}/vocabulary`, params);
  },

  // ─── Grammar ────────────────────────────────────────────────────
  async getGrammar(level: JLPTLevel, params?: { lesson?: string }): Promise<GrammarItem[]> {
    return api.get<GrammarItem[]>(`/levels/${level}/grammar`, params);
  },

  // ─── Kanji ──────────────────────────────────────────────────────
  async getKanji(level: JLPTLevel, params?: { category?: string }): Promise<KanjiItem[]> {
    return api.get<KanjiItem[]>(`/levels/${level}/kanji`, params);
  },

  async getKanjiCategories(level: JLPTLevel): Promise<KanjiCategory[]> {
    return api.get<KanjiCategory[]>(`/levels/${level}/kanji/categories`);
  },

  // ─── Radicals ───────────────────────────────────────────────────
  async getRadicals(params?: { category?: string; position?: string }): Promise<Radical[]> {
    return api.get<Radical[]>('/radicals', params);
  },

  // ─── Kana ───────────────────────────────────────────────────────
  async getHiragana(params?: { type?: string }): Promise<KanaChar[]> {
    return api.get<KanaChar[]>('/kana/hiragana', params);
  },

  async getKatakana(params?: { type?: string }): Promise<KanaChar[]> {
    return api.get<KanaChar[]>('/kana/katakana', params);
  },

  // ─── Audio ──────────────────────────────────────────────────────
  async getAudioTracks(lessonId: number): Promise<AudioTrack[]> {
    return api.get<AudioTrack[]>(`/audio/${lessonId}`);
  },

  async getAudioTracksByBook(bookId: string, lessonNumber: number): Promise<AudioTrack[]> {
    return api.get<AudioTrack[]>('/audio/by-book', { bookId, lesson: String(lessonNumber) });
  },

  getAudioUrl(lessonId: number, track: number): string {
    return apiUrl(`/audio/${lessonId}/${track}`);
  },

  getAudioStreamUrl(bookId: string, lessonNumber: number, trackNumber: number): string {
    return apiUrl(`/audio/stream/${bookId}/${lessonNumber}/${trackNumber}`);
  },

  // ─── Quiz ───────────────────────────────────────────────────────
  async getQuiz(lessonId: number, count?: number): Promise<QuizQuestion[]> {
    const params: Record<string, string> = {};
    if (count) params.count = String(count);
    return api.get<QuizQuestion[]>(`/quiz/${lessonId}`, params);
  },

  // ─── Level Content (aggregated for backward compat) ─────────────
  async getLevelContent(level: JLPTLevel): Promise<LevelContent> {
    const [vocabulary, grammar, kanji] = await Promise.all([
      this.getVocabulary(level),
      this.getGrammar(level),
      this.getKanji(level),
    ]);
    return {
      vocabulary,
      grammar,
      kanji,
    };
  },
};
