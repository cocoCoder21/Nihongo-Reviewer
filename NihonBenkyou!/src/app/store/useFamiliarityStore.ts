import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { progressService } from '../services/progress.service';

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

      toggleFamiliar: (contentType, contentId) => {
        const current = get().familiar[contentType] || [];
        const wasFamiliar = current.includes(contentId);

        // Update local state immediately for instant UI feedback
        set((state) => ({
          familiar: {
            ...state.familiar,
            [contentType]: wasFamiliar
              ? current.filter((id) => id !== contentId)
              : [...current, contentId],
          },
        }));

        // Sync to backend — creates/removes ContentFamiliarity and upserts SrsCard on toggle ON
        progressService.toggleFamiliarity(contentType, Number(contentId)).then(() => {
          // Refresh dashboard stats so reviewsDue / srsBreakdown update live.
          // Import lazily to avoid circular dependency.
          import('./useAppStore').then(({ useAppStore }) => {
            useAppStore.getState().fetchStats();
          });
        }).catch(() => {
          // Silently fail — local state already updated; SRS sync will retry next session
        });
      },

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
