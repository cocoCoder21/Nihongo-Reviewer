import { useState, useEffect, useRef, useCallback } from 'react';
import { X, CheckCircle2, Play, Pause, RefreshCw, Settings2, Clock, Plus, Trash2, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { usePlannerStore, type TimerMode } from '../store/usePlannerStore';
import { progressService } from '../services/progress.service';

export const Planner = () => {
  const {
    mode, phase, timeLeft, totalTime, isRunning, sessionsCompleted, pomodoroSettings,
    tasks,
    setMode, startTimer, pauseTimer, resetTimer, tick, skipToBreak, updateSettings,
    addTask, deleteTask, toggleTask,
    syncFromApi,
  } = usePlannerStore();

  const [focusMode, setFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newDuration, setNewDuration] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync from API on mount
  useEffect(() => {
    syncFromApi();
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const completed = tick();
        if (completed) {
          playNotification();
          // Log pomodoro session
          if (phase === 'work') {
            progressService.logStudySession({
              type: 'LESSON',
              xpEarned: 5,
              itemsStudied: 0,
            }).catch(() => {});
          }
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, tick, phase]);

  const playNotification = useCallback(() => {
    try {
      // Use Web Audio API for a simple beep
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      // Second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 400);
    } catch {
      // Audio not available
    }
  }, []);

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle, scheduledAt: newTime, duration: newDuration });
    setNewTitle('');
    setNewDuration(15);
    setShowAddForm(false);
  };

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-900 flex flex-col items-center justify-center text-white">
        <button 
          onClick={() => setFocusMode(false)}
          className="absolute top-8 right-8 text-brand-300 hover:text-white"
        >
          <X className="w-8 h-8" />
        </button>
        <p className="text-brand-300 text-sm font-bold uppercase tracking-widest mb-4">
          {phase === 'work' ? 'Focus Time' : 'Break Time'}
        </p>
        <div className="text-[12rem] font-black font-mono tracking-tighter tabular-nums leading-none">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="flex items-center space-x-4 mt-12">
          <button 
            onClick={isRunning ? pauseTimer : startTimer}
            className="w-24 h-24 rounded-full bg-white text-brand-900 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            {isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Plan Your Study</h1>
          <p className="text-slate-500 font-medium mt-1">
            {sessionsCompleted > 0 ? `${sessionsCompleted} session${sessionsCompleted > 1 ? 's' : ''} completed today` : 'Focus on what matters.'}
          </p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-white text-slate-400 hover:text-brand-700 rounded-full shadow-sm border border-brand-200/50 transition-colors"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-2xl p-6 border border-brand-200/50 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">Timer Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Micro Work (min)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-xl text-sm" 
                value={pomodoroSettings.microWork / 60} 
                onChange={(e) => updateSettings({ microWork: Number(e.target.value) * 60 })} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Micro Break (min)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-xl text-sm" 
                value={pomodoroSettings.microBreak / 60} 
                onChange={(e) => updateSettings({ microBreak: Number(e.target.value) * 60 })} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Deep Work (min)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-xl text-sm" 
                value={pomodoroSettings.deepWork / 60} 
                onChange={(e) => updateSettings({ deepWork: Number(e.target.value) * 60 })} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Deep Break (min)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-xl text-sm" 
                value={pomodoroSettings.deepBreak / 60} 
                onChange={(e) => updateSettings({ deepBreak: Number(e.target.value) * 60 })} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="bg-white p-1.5 rounded-2xl flex border border-brand-200/50 shadow-sm">
        <button 
          onClick={() => handleModeSwitch('micro')}
          className={twMerge(clsx("flex-1 py-3 text-sm font-bold rounded-xl transition-all", mode === 'micro' ? "bg-brand-100 text-brand-700 shadow-sm" : "text-slate-400 hover:text-slate-600"))}
        >
          Professional (Micro)
        </button>
        <button 
          onClick={() => handleModeSwitch('deep')}
          className={twMerge(clsx("flex-1 py-3 text-sm font-bold rounded-xl transition-all", mode === 'deep' ? "bg-brand-100 text-brand-700 shadow-sm" : "text-slate-400 hover:text-slate-600"))}
        >
          Student (Deep)
        </button>
      </div>

      {/* Pomodoro Widget */}
      <div className="bg-brand-700 rounded-3xl p-8 shadow-lg text-white flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-800">
          <div className="h-full bg-brand-200 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
        </div>
        
        <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest mb-6">
          {phase === 'work' ? 'Pomodoro Timer' : '☕ Break Time'}
        </p>
        
        <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter tabular-nums mb-8 drop-shadow-sm">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-800 flex items-center justify-center transition-colors shadow-inner"
            title="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={isRunning ? pauseTimer : startTimer}
            className="w-20 h-20 rounded-full bg-white text-brand-700 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1.5" />}
          </button>

          <button 
            onClick={skipToBreak}
            className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-800 flex items-center justify-center transition-colors shadow-inner"
            title={phase === 'work' ? 'Skip to Break' : 'Skip to Work'}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => setFocusMode(true)}
          className="mt-4 text-brand-300 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
        >
          Enter Focus Mode
        </button>
      </div>

      {/* Schedule */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Today's Schedule</h2>
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={twMerge(clsx(
                  "bg-white p-4 rounded-2xl border flex items-center shadow-sm transition-all",
                  task.completed ? "border-brand-200/50 opacity-60 bg-brand-50/50" : "border-brand-200/50 hover:border-brand-300"
                ))}
              >
                <div className="mr-4 cursor-pointer" onClick={() => toggleTask(task.id)}>
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-brand-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
                  )}
                </div>
                
                <div className="flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                  <h3 className={twMerge(clsx("font-bold text-slate-800", task.completed && "line-through text-slate-500"))}>{task.title}</h3>
                  <p className="text-sm font-medium text-slate-400 flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {task.scheduledAt}
                  </p>
                </div>
                
                <div className="text-sm font-bold text-brand-700 bg-brand-100 px-3 py-1 rounded-lg mr-2">
                  {task.duration} min
                </div>

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add Form */}
          {showAddForm ? (
            <div className="bg-white p-4 rounded-2xl border border-brand-200/50 shadow-sm space-y-3">
              <input
                type="text"
                placeholder="Study block title..."
                className="w-full px-3 py-2 border rounded-xl text-sm"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                autoFocus
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Time (e.g. 08:00 AM)"
                  className="flex-1 px-3 py-2 border rounded-xl text-sm"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Min"
                  className="w-20 px-3 py-2 border rounded-xl text-sm"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAddTask}
                  className="flex-1 py-2 bg-brand-700 text-white font-bold rounded-xl text-sm hover:bg-brand-800 transition-colors"
                >
                  Add
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-400 font-bold rounded-xl text-sm hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 mt-4 rounded-2xl border-2 border-dashed border-brand-200 text-slate-400 font-bold hover:text-brand-700 hover:border-brand-300 transition-colors hover:bg-white flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Study Block</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};