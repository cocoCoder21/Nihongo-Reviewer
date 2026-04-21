import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type JLPTLevel, levelContent } from '../data/levels';
import { progressService } from '../services/progress.service';

export type CardCategory = 'vocabulary' | 'grammar' | 'kanji' | 'particle' | 'hiragana' | 'katakana';
export type CategoryFilter = CardCategory | 'all' | 'kana';
export type Difficulty = 'again' | 'hard' | 'good' | 'easy';

export interface Card {
  id: string;
  front: string;
  reading: string;
  meaning: string;
  category: CardCategory;
  interval: number;   // days until next review
  ease: number;        // ease factor (default 2.5)
  repetitions: number; // number of successful reviews
  nextReview: number;  // timestamp
  level: JLPTLevel;
}

interface SessionStats {
  total: number;
  correct: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface FlashcardStore {
  allCards: Card[];
  sessionCards: Card[];
  currentIndex: number;
  isFlipped: boolean;
  sessionStats: SessionStats;
  isSessionComplete: boolean;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (filter: CategoryFilter) => void;
  loadDeck: (level: JLPTLevel) => void;
  startReview: (level: JLPTLevel) => void;
  startApiReview: () => Promise<void>;
  flipCard: () => void;
  resetCard: () => void;
  answerCard: (difficulty: Difficulty) => void;
  resetSession: () => void;
}

function buildCardsForLevel(level: JLPTLevel): Card[] {
  const content = levelContent[level];
  const now = Date.now();
  const cards: Card[] = [];

  for (const v of content.vocabulary) {
    cards.push({
      id: `${level}-v-${v.id}`,
      front: v.word,
      reading: v.reading,
      meaning: v.meaning,
      category: 'vocabulary',
      interval: 0,
      ease: 2.5,
      repetitions: 0,
      nextReview: now,
      level,
    });
  }

  for (const g of content.grammar) {
    cards.push({
      id: `${level}-g-${g.id}`,
      front: g.title,
      reading: g.exampleRomaji,
      meaning: g.rule,
      category: 'grammar',
      interval: 0,
      ease: 2.5,
      repetitions: 0,
      nextReview: now,
      level,
    });
  }

  for (const k of content.kanji) {
    cards.push({
      id: `${level}-k-${k.id}`,
      front: k.kanji,
      reading: k.reading,
      meaning: k.meaning,
      category: 'kanji',
      interval: 0,
      ease: 2.5,
      repetitions: 0,
      nextReview: now,
      level,
    });
  }

  return cards;
}

// SM-2 algorithm implementation
function calculateSRS(card: Card, difficulty: Difficulty): Partial<Card> {
  let { ease, interval, repetitions } = card;

  const qualityMap: Record<Difficulty, number> = {
    again: 0,
    hard: 2,
    good: 3,
    easy: 5,
  };
  const quality = qualityMap[difficulty];

  if (quality < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 0;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * ease);
    }
    repetitions += 1;
  }

  // Update ease factor (minimum 1.3)
  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

  return { ease, interval, repetitions, nextReview };
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      allCards: [],
      sessionCards: [],
      currentIndex: 0,
      isFlipped: false,
      isSessionComplete: false,
      sessionStats: { total: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 },
      categoryFilter: 'all' as CategoryFilter,

      setCategoryFilter: (filter) => set({ categoryFilter: filter }),

      loadDeck: (level) => {
        const existing = get().allCards.filter(c => c.level === level);
        if (existing.length > 0) return;
        const newCards = buildCardsForLevel(level);
        set((state) => ({
          allCards: [...state.allCards, ...newCards],
        }));
      },

      startReview: (level) => {
        const state = get();
        // Ensure deck is loaded
        let allCards = state.allCards;
        const hasLevel = allCards.some(c => c.level === level);
        if (!hasLevel) {
          const newCards = buildCardsForLevel(level);
          allCards = [...allCards, ...newCards];
        }

        const now = Date.now();
        const dueCards = allCards
          .filter(c => c.level === level && c.nextReview <= now)
          .sort(() => Math.random() - 0.5)
          .slice(0, 20); // max 20 cards per session

        set({
          allCards,
          sessionCards: dueCards.length > 0 ? dueCards : allCards.filter(c => c.level === level).slice(0, 10),
          currentIndex: 0,
          isFlipped: false,
          isSessionComplete: false,
          sessionStats: { total: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 },
        });
      },

      flipCard: () => set({ isFlipped: true }),
      resetCard: () => set({ isFlipped: false }),

      answerCard: (difficulty) => set((state) => {
        const currentCard = state.sessionCards[state.currentIndex];
        if (!currentCard) return state;

        const srsUpdate = calculateSRS(currentCard, difficulty);
        const updatedCard = { ...currentCard, ...srsUpdate };

        // Update in allCards
        const allCards = state.allCards.map(c =>
          c.id === updatedCard.id ? updatedCard : c
        );

        // Update session stats
        const sessionStats = {
          ...state.sessionStats,
          total: state.sessionStats.total + 1,
          correct: difficulty !== 'again' ? state.sessionStats.correct + 1 : state.sessionStats.correct,
          [difficulty]: state.sessionStats[difficulty] + 1,
        };

        const nextIndex = state.currentIndex + 1;
        const isComplete = nextIndex >= state.sessionCards.length;

        return {
          allCards,
          isFlipped: false,
          currentIndex: isComplete ? state.currentIndex : nextIndex,
          isSessionComplete: isComplete,
          sessionStats,
        };
      }),

      resetSession: () => set({
        sessionCards: [],
        currentIndex: 0,
        isFlipped: false,
        isSessionComplete: false,
        sessionStats: { total: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 },
      }),

      startApiReview: async () => {
        try {
          const dueCards = await progressService.getDueCards();
          const filter = get().categoryFilter;
          const contentTypeMap: Record<string, CardCategory> = {
            VOCABULARY: 'vocabulary',
            GRAMMAR: 'grammar',
            KANJI: 'kanji',
            HIRAGANA: 'hiragana',
            KATAKANA: 'katakana',
          };
          let cards: Card[] = dueCards.map(c => ({
            id: String(c.id),
            front: c.front || '',
            reading: c.reading || '',
            meaning: c.meaning || '',
            category: contentTypeMap[c.contentType] || 'vocabulary',
            interval: c.interval,
            ease: c.easeFactor,
            repetitions: c.repetitions,
            nextReview: new Date(c.nextReview).getTime(),
            level: 'N5' as JLPTLevel, // level not critical for review
          }));
          if (filter === 'kana') {
            cards = cards.filter(c => c.category === 'hiragana' || c.category === 'katakana');
          } else if (filter !== 'all') {
            cards = cards.filter(c => c.category === filter);
          }
          set({
            sessionCards: cards.slice(0, 20),
            currentIndex: 0,
            isFlipped: false,
            isSessionComplete: false,
            sessionStats: { total: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 },
          });
        } catch {
          // Fallback: API unavailable, keep local review
        }
      },
    }),
    {
      name: 'nihon-benkyou-flashcards',
      partialize: (state) => ({
        allCards: state.allCards,
      }),
    }
  )
);