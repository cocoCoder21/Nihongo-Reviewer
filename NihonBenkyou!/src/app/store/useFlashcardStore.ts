import { create } from 'zustand';

export type CardCategory = 'vocabulary' | 'grammar' | 'kanji' | 'particle';

export interface Card {
  id: string;
  front: string;
  reading: string;
  meaning: string;
  category: CardCategory;
  interval: number;
  ease: number;
}

interface FlashcardStore {
  cards: Card[];
  currentIndex: number;
  isFlipped: boolean;
  flipCard: () => void;
  resetCard: () => void;
  answerCard: (difficulty: 'again' | 'hard' | 'good' | 'easy') => void;
}

const initialCards: Card[] = [
  { id: '1', front: '食べる', reading: 'たべる (taberu)', meaning: 'to eat', category: 'vocabulary', interval: 1, ease: 2.5 },
  { id: '2', front: 'から', reading: 'kara', meaning: 'because / from', category: 'particle', interval: 1, ease: 2.5 },
  { id: '3', front: '水', reading: 'みず (mizu)', meaning: 'water', category: 'kanji', interval: 1, ease: 2.5 },
  { id: '4', front: '〜なければならない', reading: '~nakereba naranai', meaning: 'must do / have to do', category: 'grammar', interval: 1, ease: 2.5 },
];

export const useFlashcardStore = create<FlashcardStore>((set) => ({
  cards: initialCards,
  currentIndex: 0,
  isFlipped: false,
  flipCard: () => set({ isFlipped: true }),
  resetCard: () => set({ isFlipped: false }),
  answerCard: (difficulty) => set((state) => {
    const nextIndex = state.currentIndex + 1;
    // Real SRS interval calculations would happen here.
    return {
      isFlipped: false,
      currentIndex: nextIndex < state.cards.length ? nextIndex : 0,
    };
  }),
}));