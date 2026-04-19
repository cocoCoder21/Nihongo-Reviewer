import { create } from 'zustand';

interface AppState {
  user: {
    name: string;
    level: string;
    joined: string;
  };
  stats: {
    streak: number;
    xp: number;
    xpGoal: number;
    reviewsDue: number;
    totalStudyHours: number;
    cardsMastered: number;
  };
  progress: {
    vocabulary: { current: number; max: number };
    grammar: { current: number; max: number };
    kanji: { current: number; max: number };
  };
  addXp: (amount: number) => void;
  completeReview: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    name: 'Alex',
    level: 'N5',
    joined: 'April 19, 2026',
  },
  stats: {
    streak: 14,
    xp: 30,
    xpGoal: 50,
    reviewsDue: 45,
    totalStudyHours: 42,
    cardsMastered: 843,
  },
  progress: {
    vocabulary: { current: 300, max: 500 },
    grammar: { current: 45, max: 100 },
    kanji: { current: 85, max: 100 },
  },
  addXp: (amount) => set((state) => ({ 
    stats: { ...state.stats, xp: Math.min(state.stats.xp + amount, state.stats.xpGoal) } 
  })),
  completeReview: () => set((state) => ({ 
    stats: { ...state.stats, reviewsDue: Math.max(0, state.stats.reviewsDue - 1) } 
  })),
}));