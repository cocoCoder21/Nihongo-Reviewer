import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { progressService } from '../services/progress.service';

export type FamiliarityContentType = 'vocabulary' | 'grammar' | 'kanji' | 'hiragana' | 'katakana' | 'radical';

interface FamiliarityState {
  familiar: Record<string, string[]>;
  setFamiliar: (contentType: FamiliarityContentType, contentId: string) => void;
  isFamiliar: (contentType: FamiliarityContentType, contentId: string) => boolean;
  getCount: (contentType: FamiliarityContentType) => number;
  syncFromBackend: () => Promise<void>;
  clearLocal: () => void;
}

export const useFamiliarityStore = create<FamiliarityState>()(
  persist(
    (set, get) => ({
      familiar: {},

      // One-way: marks an item as familiar permanently. Idempotent — repeat
      // calls for the same item are no-ops both locally and on the server.
      setFamiliar: (contentType, contentId) => {
        const current = get().familiar[contentType] || [];
        if (current.includes(contentId)) {
          // Already familiar — nothing to do
          return;
        }

        // Update local state immediately for instant UI feedback
        set((state) => ({
          familiar: {
            ...state.familiar,
            [contentType]: [...current, contentId],
          },
        }));

        const numericId = Number(contentId);
        if (!Number.isFinite(numericId) || numericId <= 0) {
          // Invalid id — surface the problem instead of silently skipping the
          // API call (which would leave the UI looking familiar with nothing
          // queued in the Practice tab).
          console.warn(`[familiarity] Skipping API sync — invalid contentId for ${contentType}:`, contentId);
          return;
        }

        // Sync to backend — creates ContentFamiliarity and upserts SrsCard so
        // the item appears in the Practice tab review queue.
        progressService.markFamiliar(contentType, numericId).then(() => {
          // Refresh dashboard stats AND the Practice tab queue so newly
          // familiarized items appear immediately. Lazy imports avoid a
          // circular dependency between stores.
          import('./useAppStore').then(({ useAppStore }) => {
            useAppStore.getState().fetchStats().catch(() => {});
          });
          import('./useFlashcardStore').then(({ useFlashcardStore }) => {
            useFlashcardStore.getState().startApiReview().catch(() => {});
          });
        }).catch((err) => {
          // API failed — roll back local state so the user can retry.
          console.error('[familiarity] markFamiliar failed, rolling back:', err);
          set((state) => ({
            familiar: {
              ...state.familiar,
              [contentType]: (state.familiar[contentType] || []).filter((id) => id !== contentId),
            },
          }));
        });
      },

      isFamiliar: (contentType, contentId) => {
        return (get().familiar[contentType] || []).includes(contentId);
      },

      getCount: (contentType) => {
        return (get().familiar[contentType] || []).length;
      },

      syncFromBackend: async () => {
        try {
          const items = await progressService.getFamiliarity();
          const rebuilt: Record<string, string[]> = {};
          for (const item of items) {
            const type = item.contentType.toLowerCase();
            if (!rebuilt[type]) rebuilt[type] = [];
            rebuilt[type].push(String(item.contentId));
          }
          // Always overwrite — the backend is the source of truth. This wipes
          // any stale local-only entries (e.g. ids from a previous DB schema
          // or unsynced clicks) that would otherwise make FamiliarityButton
          // appear green even though no SrsCard exists in the DB.
          set({ familiar: rebuilt });
        } catch {
          // Silently fail — keep local state as fallback
        }
      },

      clearLocal: () => set({ familiar: {} }),
    }),
    { name: 'nb-familiarity' }
  )
);
