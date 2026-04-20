import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FamiliarityContentType = 'vocabulary' | 'grammar' | 'kanji' | 'hiragana' | 'katakana';

interface FamiliarityState {
  familiar: Record<string, string[]>;
  toggleFamiliar: (contentType: FamiliarityContentType, contentId: string) => void;
  isFamiliar: (contentType: FamiliarityContentType, contentId: string) => boolean;
  getCount: (contentType: FamiliarityContentType) => number;
}

export const useFamiliarityStore = create<FamiliarityState>()(
  persist(
    (set, get) => ({
      familiar: {},

      toggleFamiliar: (contentType, contentId) =>
        set((state) => {
          const current = state.familiar[contentType] || [];
          const exists = current.includes(contentId);
          return {
            familiar: {
              ...state.familiar,
              [contentType]: exists
                ? current.filter((id) => id !== contentId)
                : [...current, contentId],
            },
          };
        }),

      isFamiliar: (contentType, contentId) => {
        return (get().familiar[contentType] || []).includes(contentId);
      },

      getCount: (contentType) => {
        return (get().familiar[contentType] || []).length;
      },
    }),
    { name: 'nb-familiarity' }
  )
);
