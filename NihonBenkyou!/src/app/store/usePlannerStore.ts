import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { plannerService } from '../services/planner.service';

export type TimerPhase = 'work' | 'break';

interface PlannerTask {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number; // minutes
  completed: boolean;
  serverId?: number; // DB id if synced
}

export interface PomodoroSettings {
  workTime: number;  // seconds
  breakTime: number; // seconds
}

interface PlannerState {
  // Timer
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
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => boolean; // returns true if timer phase completed
  skipPhase: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;

  // Task actions
  addTask: (task: Omit<PlannerTask, 'id' | 'completed'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<PlannerTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Sync
  syncFromApi: (date?: string) => Promise<void>;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const DEFAULT_WORK = 25 * 60;
const DEFAULT_BREAK = 5 * 60;

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      phase: 'work',
      timeLeft: DEFAULT_WORK,
      totalTime: DEFAULT_WORK,
      isRunning: false,
      sessionsCompleted: 0,
      pomodoroSettings: { workTime: DEFAULT_WORK, breakTime: DEFAULT_BREAK },
      tasks: [],
      lastSyncDate: null,

      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),

      resetTimer: () => {
        const { pomodoroSettings } = get();
        set({
          phase: 'work',
          timeLeft: pomodoroSettings.workTime,
          totalTime: pomodoroSettings.workTime,
          isRunning: false,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning || state.timeLeft <= 0) return false;

        const newTime = state.timeLeft - 1;
        if (newTime <= 0) {
          if (state.phase === 'work') {
            const breakTime = state.pomodoroSettings.breakTime;
            set({
              phase: 'break',
              timeLeft: breakTime,
              totalTime: breakTime,
              isRunning: false,
              sessionsCompleted: state.sessionsCompleted + 1,
            });
          } else {
            const workTime = state.pomodoroSettings.workTime;
            set({
              phase: 'work',
              timeLeft: workTime,
              totalTime: workTime,
              isRunning: false,
            });
          }
          return true;
        }
        set({ timeLeft: newTime });
        return false;
      },

      skipPhase: () => {
        const { phase, pomodoroSettings } = get();
        if (phase === 'work') {
          set({
            phase: 'break',
            timeLeft: pomodoroSettings.breakTime,
            totalTime: pomodoroSettings.breakTime,
            isRunning: false,
            sessionsCompleted: get().sessionsCompleted + 1,
          });
        } else {
          set({
            phase: 'work',
            timeLeft: pomodoroSettings.workTime,
            totalTime: pomodoroSettings.workTime,
            isRunning: false,
          });
        }
      },

      updateSettings: (partial) => {
        const newSettings = { ...get().pomodoroSettings, ...partial };
        const { phase } = get();
        const time = phase === 'work' ? newSettings.workTime : newSettings.breakTime;
        set({
          pomodoroSettings: newSettings,
          timeLeft: time,
          totalTime: time,
          isRunning: false,
        });
      },

      addTask: async (taskData) => {
        // Optimistically add with a local id
        const localId = generateId();
        const task: PlannerTask = { id: localId, ...taskData, completed: false };
        set((state) => ({ tasks: [...state.tasks, task] }));
        // Persist to DB and replace local id with server id
        try {
          const block = await plannerService.createBlock({
            title: task.title,
            scheduledAt: task.scheduledAt,
            duration: task.duration,
          });
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === localId ? { ...t, serverId: block.id, id: `srv-${block.id}` } : t
            ),
          }));
        } catch {
          // Keep local task if API is unavailable
        }
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        const task = get().tasks.find((t) => t.id === id);
        if (task?.serverId) {
          plannerService.updateBlock(task.serverId, updates).catch(() => {});
        }
      },

      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        if (task?.serverId) {
          plannerService.deleteBlock(task.serverId).catch(() => {});
        }
      },

      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const completed = !task.completed;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed } : t)),
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
    }),
    {
      name: 'nihon-benkyou-planner',
      partialize: (state) => ({
        tasks: state.tasks,
        pomodoroSettings: state.pomodoroSettings,
        sessionsCompleted: state.sessionsCompleted,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);

