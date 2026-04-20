import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { plannerService, type StudyBlock } from '../services/planner.service';

export type TimerMode = 'micro' | 'deep';
export type TimerPhase = 'work' | 'break';

interface PlannerTask {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number; // minutes
  completed: boolean;
  serverId?: number; // DB id if synced
}

interface PomodoroSettings {
  microWork: number;   // seconds
  microBreak: number;
  deepWork: number;
  deepBreak: number;
}

interface PlannerState {
  // Timer
  mode: TimerMode;
  phase: TimerPhase;
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  sessionsCompleted: number;
  pomodoroSettings: PomodoroSettings;

  // Tasks
  tasks: PlannerTask[];
  lastSyncDate: string | null;

  // Timer actions
  setMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => boolean; // returns true if timer completed
  skipToBreak: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;

  // Task actions
  addTask: (task: Omit<PlannerTask, 'id' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<PlannerTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Sync
  syncFromApi: (date?: string) => Promise<void>;
  syncTaskToApi: (task: PlannerTask) => Promise<void>;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getWorkTime(mode: TimerMode, settings: PomodoroSettings) {
  return mode === 'micro' ? settings.microWork : settings.deepWork;
}

function getBreakTime(mode: TimerMode, settings: PomodoroSettings) {
  return mode === 'micro' ? settings.microBreak : settings.deepBreak;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => {
      const defaultSettings: PomodoroSettings = {
        microWork: 15 * 60,
        microBreak: 3 * 60,
        deepWork: 50 * 60,
        deepBreak: 10 * 60,
      };

      return {
        mode: 'micro',
        phase: 'work',
        timeLeft: defaultSettings.microWork,
        totalTime: defaultSettings.microWork,
        isRunning: false,
        sessionsCompleted: 0,
        pomodoroSettings: defaultSettings,
        tasks: [],
        lastSyncDate: null,

        setMode: (mode) => {
          const settings = get().pomodoroSettings;
          const time = getWorkTime(mode, settings);
          set({
            mode,
            phase: 'work',
            timeLeft: time,
            totalTime: time,
            isRunning: false,
          });
        },

        startTimer: () => set({ isRunning: true }),
        pauseTimer: () => set({ isRunning: false }),

        resetTimer: () => {
          const { mode, pomodoroSettings } = get();
          const time = getWorkTime(mode, pomodoroSettings);
          set({
            phase: 'work',
            timeLeft: time,
            totalTime: time,
            isRunning: false,
          });
        },

        tick: () => {
          const state = get();
          if (!state.isRunning || state.timeLeft <= 0) return false;

          const newTime = state.timeLeft - 1;
          if (newTime <= 0) {
            // Phase completed
            if (state.phase === 'work') {
              // Switch to break
              const breakTime = getBreakTime(state.mode, state.pomodoroSettings);
              set({
                phase: 'break',
                timeLeft: breakTime,
                totalTime: breakTime,
                isRunning: false,
                sessionsCompleted: state.sessionsCompleted + 1,
              });
              return true; // signal completion
            } else {
              // Break done, switch back to work
              const workTime = getWorkTime(state.mode, state.pomodoroSettings);
              set({
                phase: 'work',
                timeLeft: workTime,
                totalTime: workTime,
                isRunning: false,
              });
              return true;
            }
          }
          set({ timeLeft: newTime });
          return false;
        },

        skipToBreak: () => {
          const { mode, pomodoroSettings, phase } = get();
          if (phase === 'work') {
            const breakTime = getBreakTime(mode, pomodoroSettings);
            set({
              phase: 'break',
              timeLeft: breakTime,
              totalTime: breakTime,
              isRunning: false,
              sessionsCompleted: get().sessionsCompleted + 1,
            });
          } else {
            const workTime = getWorkTime(mode, pomodoroSettings);
            set({
              phase: 'work',
              timeLeft: workTime,
              totalTime: workTime,
              isRunning: false,
            });
          }
        },

        updateSettings: (partial) => {
          const newSettings = { ...get().pomodoroSettings, ...partial };
          const { mode, phase } = get();
          const time = phase === 'work'
            ? getWorkTime(mode, newSettings)
            : getBreakTime(mode, newSettings);
          set({
            pomodoroSettings: newSettings,
            timeLeft: time,
            totalTime: time,
            isRunning: false,
          });
        },

        addTask: (taskData) => {
          const task: PlannerTask = {
            id: generateId(),
            ...taskData,
            completed: false,
          };
          set((state) => ({ tasks: [...state.tasks, task] }));
          // Fire and forget API sync
          get().syncTaskToApi(task).catch(() => {});
        },

        updateTask: (id, updates) => {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          }));
          const task = get().tasks.find((t) => t.id === id);
          if (task?.serverId) {
            plannerService.updateBlock(task.serverId, updates).catch(() => {});
          }
        },

        deleteTask: (id) => {
          const task = get().tasks.find((t) => t.id === id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          }));
          if (task?.serverId) {
            plannerService.deleteBlock(task.serverId).catch(() => {});
          }
        },

        toggleTask: (id) => {
          const task = get().tasks.find((t) => t.id === id);
          if (!task) return;
          const completed = !task.completed;
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, completed } : t
            ),
          }));
          if (task.serverId) {
            plannerService.updateBlock(task.serverId, { completed }).catch(() => {});
          }
        },

        syncFromApi: async (date) => {
          try {
            const dateStr = date || new Date().toISOString().split('T')[0];
            const blocks = await plannerService.getBlocks(dateStr);
            const tasks: PlannerTask[] = blocks.map((b) => ({
              id: `srv-${b.id}`,
              title: b.title,
              scheduledAt: b.scheduledAt,
              duration: b.duration,
              completed: b.completed,
              serverId: b.id,
            }));
            set({ tasks, lastSyncDate: dateStr });
          } catch {
            // API unavailable — keep local tasks
          }
        },

        syncTaskToApi: async (task) => {
          try {
            const block = await plannerService.createBlock({
              title: task.title,
              scheduledAt: task.scheduledAt,
              duration: task.duration,
            });
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === task.id ? { ...t, serverId: block.id } : t
              ),
            }));
          } catch {
            // API unavailable — task stays local only
          }
        },
      };
    },
    {
      name: 'nihon-benkyou-planner',
      partialize: (state) => ({
        tasks: state.tasks,
        mode: state.mode,
        pomodoroSettings: state.pomodoroSettings,
        sessionsCompleted: state.sessionsCompleted,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);
