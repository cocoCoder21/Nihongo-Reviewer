import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type JLPTLevel, levelInfo } from '../data/levels';
import { progressService } from '../services/progress.service';

export type UserType = 'student' | 'professional';

interface Settings {
  autoPlayAudio: boolean;
  showRomaji: boolean;
  darkMode: boolean;
  dailyGoal: number; // XP
  srsStrictness: 'relaxed' | 'normal' | 'strict';
  userType: UserType;
}

interface DailyQuest {
  id: string;
  title: string;
  current: number;
  max: number;
  reward: number;
  icon: 'xp' | 'kanji' | 'lesson' | 'review';
}

interface WeeklyActivity {
  day: string;
  xp: number;
}

interface SrsBreakdown {
  kanjiDue: number;
  vocabDue: number;
  grammarDue: number;
}

interface AppState {
  user: {
    name: string;
    level: JLPTLevel;
    joined: string;
  };
  stats: {
    streak: number;
    xp: number;
    xpGoal: number;
    reviewsDue: number;
    totalStudyHours: number;
    cardsMastered: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
  };
  srsBreakdown: SrsBreakdown;
  progress: {
    vocabulary: { current: number; max: number };
    grammar: { current: number; max: number };
    kanji: { current: number; max: number };
  };
  settings: Settings;
  dailyQuests: DailyQuest[];
  questResetDate: string; // ISO date string (YYYY-MM-DD)
  weeklyActivity: WeeklyActivity[];
  setLevel: (level: JLPTLevel) => void;
  setUserName: (name: string) => void;
  addXp: (amount: number) => void;
  completeReview: () => void;
  completeLesson: () => void;
  completeQuiz: () => void;
  updateQuestProgress: (questId: string, amount: number) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  resetProgress: () => void;
  checkDailyReset: () => void;
  fetchStats: () => Promise<void>;
  syncProgress: () => Promise<void>;
}

const getProgressForLevel = (level: JLPTLevel) => {
  const info = levelInfo[level];
  return {
    vocabulary: { current: 0, max: info.vocabCount },
    grammar: { current: 0, max: info.grammarCount },
    kanji: { current: 0, max: info.kanjiCount },
  };
};

const defaultQuests: DailyQuest[] = [
  { id: 'xp', title: 'Earn 50 XP', current: 0, max: 50, reward: 10, icon: 'xp' },
  { id: 'kanji', title: 'Learn 5 New Kanji', current: 0, max: 5, reward: 15, icon: 'kanji' },
  { id: 'lesson', title: 'Complete a Lesson', current: 0, max: 1, reward: 20, icon: 'lesson' },
  { id: 'review', title: 'Finish 10 Reviews', current: 0, max: 10, reward: 15, icon: 'review' },
];

const defaultWeekly: WeeklyActivity[] = [
  { day: 'Mon', xp: 0 },
  { day: 'Tue', xp: 0 },
  { day: 'Wed', xp: 0 },
  { day: 'Thu', xp: 0 },
  { day: 'Fri', xp: 0 },
  { day: 'Sat', xp: 0 },
  { day: 'Sun', xp: 0 },
];

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        name: 'Alex',
        level: 'N5' as JLPTLevel,
        joined: 'April 19, 2026',
      },
      stats: {
        streak: 0,
        xp: 0,
        xpGoal: 50,
        reviewsDue: 0,
        totalStudyHours: 0,
        cardsMastered: 0,
        lessonsCompleted: 0,
        quizzesCompleted: 0,
      },
      srsBreakdown: { kanjiDue: 0, vocabDue: 0, grammarDue: 0 },
      progress: {
        vocabulary: { current: 0, max: 800 },
        grammar: { current: 0, max: 80 },
        kanji: { current: 0, max: 100 },
      },
      settings: {
        autoPlayAudio: true,
        showRomaji: false,
        darkMode: false,
        dailyGoal: 50,
        srsStrictness: 'normal',
        userType: 'student',
      },
      dailyQuests: defaultQuests,
      questResetDate: todayDateStr(),
      weeklyActivity: defaultWeekly,

      setLevel: (level) => set((state) => ({
        user: { ...state.user, level },
        progress: getProgressForLevel(level),
      })),

      setUserName: (name) => set((state) => ({
        user: { ...state.user, name },
      })),

      addXp: (amount) => set((state) => {
        const newXp = Math.min(state.stats.xp + amount, state.stats.xpGoal);
        const quests = state.dailyQuests.map(q =>
          q.id === 'xp' ? { ...q, current: Math.min(q.current + amount, q.max) } : q
        );
        // Update today's weekly activity
        const today = new Date().getDay(); // 0=Sun, 1=Mon, ...
        const dayIndex = today === 0 ? 6 : today - 1;
        const weekly = [...state.weeklyActivity];
        weekly[dayIndex] = { ...weekly[dayIndex], xp: weekly[dayIndex].xp + amount };
        return {
          stats: { ...state.stats, xp: newXp },
          dailyQuests: quests,
          weeklyActivity: weekly,
        };
      }),

      completeReview: () => set((state) => {
        const quests = state.dailyQuests.map(q =>
          q.id === 'review' ? { ...q, current: Math.min(q.current + 1, q.max) } : q
        );
        return {
          stats: { ...state.stats, reviewsDue: Math.max(0, state.stats.reviewsDue - 1) },
          dailyQuests: quests,
        };
      }),

      completeLesson: () => set((state) => {
        const quests = state.dailyQuests.map(q =>
          q.id === 'lesson' ? { ...q, current: Math.min(q.current + 1, q.max) } : q
        );
        return {
          stats: { ...state.stats, lessonsCompleted: state.stats.lessonsCompleted + 1 },
          dailyQuests: quests,
        };
      }),

      completeQuiz: () => set((state) => ({
        stats: { ...state.stats, quizzesCompleted: state.stats.quizzesCompleted + 1 },
      })),

      updateQuestProgress: (questId, amount) => set((state) => ({
        dailyQuests: state.dailyQuests.map(q =>
          q.id === questId ? { ...q, current: Math.min(q.current + amount, q.max) } : q
        ),
      })),

      updateSettings: (partial) => set((state) => ({
        settings: { ...state.settings, ...partial },
      })),

      resetProgress: () => set((state) => ({
        stats: {
          streak: 0,
          xp: 0,
          xpGoal: state.settings.dailyGoal,
          reviewsDue: 0,
          totalStudyHours: 0,
          cardsMastered: 0,
          lessonsCompleted: 0,
          quizzesCompleted: 0,
        },
        srsBreakdown: { kanjiDue: 0, vocabDue: 0, grammarDue: 0 },
        progress: getProgressForLevel(state.user.level),
        dailyQuests: defaultQuests,
        questResetDate: todayDateStr(),
      })),

      checkDailyReset: () => {
        const today = todayDateStr();
        const state = get();
        if (state.questResetDate !== today) {
          set({
            dailyQuests: defaultQuests,
            questResetDate: today,
            stats: { ...state.stats, xp: 0 },
          });
        }
      },

      fetchStats: async () => {
        try {
          const [stats, streak, activity, dueCards] = await Promise.all([
            progressService.getStats(),
            progressService.getStreak(),
            progressService.getActivity('7d'),
            progressService.getDueCards(),
          ]);

          // Compute SRS breakdown from due cards
          const breakdown: SrsBreakdown = { kanjiDue: 0, vocabDue: 0, grammarDue: 0 };
          for (const card of dueCards) {
            const ct = (card.contentType || '').toUpperCase();
            if (ct === 'KANJI') breakdown.kanjiDue++;
            else if (ct === 'VOCABULARY') breakdown.vocabDue++;
            else if (ct === 'GRAMMAR') breakdown.grammarDue++;
          }

          // Map weekly activity — API returns {date, xpEarned, ...}
          const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const weeklyMap = dayLabels.map(d => ({ day: d, xp: 0 }));
          for (const a of activity) {
            const dow = new Date(a.date).getDay(); // 0=Sun
            const idx = dow === 0 ? 6 : dow - 1;
            weeklyMap[idx] = { day: dayLabels[idx], xp: a.xpEarned };
          }

          set((state) => ({
            stats: {
              ...state.stats,
              streak: streak.currentStreak,
              totalStudyHours: stats.totalStudyHours,
              cardsMastered: stats.cardsMastered,
              lessonsCompleted: stats.lessonsCompleted,
              quizzesCompleted: stats.quizzesCompleted,
              reviewsDue: stats.reviewsDue,
              xpGoal: state.settings.dailyGoal,
            },
            srsBreakdown: breakdown,
            weeklyActivity: weeklyMap,
          }));
        } catch {
          // Silently fail — local data remains as fallback
        }
      },

      syncProgress: async () => {
        try {
          const allProgress = await progressService.getProgress();
          const state = get();
          const levelProgress = allProgress.find(
            (p) => p.jlptLevelId === state.user.level
          );
          if (levelProgress) {
            set({
              progress: {
                vocabulary: { current: levelProgress.vocabMastered, max: state.progress.vocabulary.max },
                grammar: { current: levelProgress.grammarMastered, max: state.progress.grammar.max },
                kanji: { current: levelProgress.kanjiMastered, max: state.progress.kanji.max },
              },
            });
          }
        } catch {
          // Silently fail — local data remains as fallback
        }
      },
    }),
    {
      name: 'nihon-benkyou-app',
      partialize: (state) => ({
        user: state.user,
        stats: state.stats,
        srsBreakdown: state.srsBreakdown,
        progress: state.progress,
        settings: state.settings,
        dailyQuests: state.dailyQuests,
        questResetDate: state.questResetDate,
        weeklyActivity: state.weeklyActivity,
      }),
    }
  )
);