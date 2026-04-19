import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type JLPTLevel, levelInfo } from '../data/levels';

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
  progress: {
    vocabulary: { current: number; max: number };
    grammar: { current: number; max: number };
    kanji: { current: number; max: number };
  };
  settings: Settings;
  dailyQuests: DailyQuest[];
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
  { day: 'Mon', xp: 45 },
  { day: 'Tue', xp: 50 },
  { day: 'Wed', xp: 30 },
  { day: 'Thu', xp: 60 },
  { day: 'Fri', xp: 40 },
  { day: 'Sat', xp: 0 },
  { day: 'Sun', xp: 0 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        name: 'Alex',
        level: 'N5' as JLPTLevel,
        joined: 'April 19, 2026',
      },
      stats: {
        streak: 14,
        xp: 30,
        xpGoal: 50,
        reviewsDue: 45,
        totalStudyHours: 42,
        cardsMastered: 843,
        lessonsCompleted: 0,
        quizzesCompleted: 0,
      },
      progress: {
        vocabulary: { current: 300, max: 800 },
        grammar: { current: 45, max: 80 },
        kanji: { current: 85, max: 100 },
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
      weeklyActivity: defaultWeekly,

      setLevel: (level) => set((state) => ({
        user: { ...state.user, level },
        progress: getProgressForLevel(level),
        stats: { ...state.stats, reviewsDue: Math.floor(Math.random() * 30) + 15 },
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
        progress: getProgressForLevel(state.user.level),
        dailyQuests: defaultQuests,
      })),
    }),
    {
      name: 'nihon-benkyou-app',
      partialize: (state) => ({
        user: state.user,
        stats: state.stats,
        progress: state.progress,
        settings: state.settings,
      }),
    }
  )
);