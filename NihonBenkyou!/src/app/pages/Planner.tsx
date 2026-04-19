import { useState, useEffect } from 'react';
import { X, CheckCircle2, Play, Pause, RefreshCw, Settings2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Task = { id: string; time: string; title: string; duration: string; completed: boolean; }

export const Planner = () => {
  const [mode, setMode] = useState<'micro' | 'deep'>('micro');
  const [timeLeft, setTimeLeft] = useState(mode === 'micro' ? 15 * 60 : 50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', time: '08:00 AM', title: 'Morning Reviews (SRS)', duration: '15 min', completed: false },
    { id: '2', time: '12:30 PM', title: 'N5 Grammar Lesson', duration: '20 min', completed: false },
    { id: '3', time: '08:00 PM', title: 'Reading Practice', duration: '25 min', completed: false },
  ]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'micro' ? 15 * 60 : 50 * 60);
  };

  const handleModeSwitch = (newMode: 'micro' | 'deep') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'micro' ? 15 * 60 : 50 * 60);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Note: Actual interval logic would need useEffect, but keeping simple for UI focus
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
        <div className="text-[12rem] font-black font-mono tracking-tighter tabular-nums leading-none">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <button 
          onClick={toggleTimer}
          className="mt-12 w-24 h-24 rounded-full bg-white text-brand-900 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          {isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Plan Your Study</h1>
          <p className="text-slate-500 font-medium mt-1">Focus on what matters.</p>
        </div>
        <button className="p-3 bg-white text-slate-400 hover:text-brand-700 rounded-full shadow-sm border border-brand-200/50 transition-colors">
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

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
          <div className="h-full bg-brand-200" style={{ width: '40%' }}></div>
        </div>
        
        <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest mb-6">Pomodoro Timer</p>
        
        <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter tabular-nums mb-8 drop-shadow-sm">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-800 flex items-center justify-center transition-colors shadow-inner"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-white text-brand-700 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1.5" />}
          </button>

          <button 
            onClick={() => setFocusMode(true)}
            className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-800 flex items-center justify-center transition-colors shadow-inner"
            title="Focus Mode"
          >
            <div className="w-5 h-5 border-2 border-current rounded-sm"></div>
          </button>
        </div>
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
                  "bg-white p-4 rounded-2xl border flex items-center shadow-sm cursor-pointer transition-all",
                  task.completed ? "border-brand-200/50 opacity-60 bg-brand-50/50" : "border-brand-200/50 hover:border-brand-300"
                ))}
                onClick={() => toggleTask(task.id)}
              >
                <div className="mr-4">
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-brand-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={twMerge(clsx("font-bold text-slate-800", task.completed && "line-through text-slate-500"))}>{task.title}</h3>
                  <p className="text-sm font-medium text-slate-400 flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {task.time}
                  </p>
                </div>
                
                <div className="text-sm font-bold text-brand-700 bg-brand-100 px-3 py-1 rounded-lg">
                  {task.duration}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button className="w-full py-4 mt-4 rounded-2xl border-2 border-dashed border-brand-200 text-slate-400 font-bold hover:text-brand-700 hover:border-brand-300 transition-colors hover:bg-white">
            + Add Study Block
          </button>
        </div>
      </div>

    </div>
  );
};