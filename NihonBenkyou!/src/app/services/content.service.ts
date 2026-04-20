import { api } from './api';
import type {
  JLPTLevel,
  LevelInfo,
  Lesson,
  VocabItem,
  GrammarItem,
  KanjiItem,
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
  async getKanji(level: JLPTLevel): Promise<KanjiItem[]> {
    return api.get<KanjiItem[]>(`/levels/${level}/kanji`);
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

  getAudioUrl(lessonId: number, track: number): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/audio/${lessonId}/${track}`;
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
      listening: [], // TODO: populate from audio + quiz data
    };
  },
};
