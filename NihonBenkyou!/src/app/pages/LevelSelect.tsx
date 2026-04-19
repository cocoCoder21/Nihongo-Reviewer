import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { type JLPTLevel, levelInfo } from '../data/levels';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const levelColors: Record<JLPTLevel, { bg: string; border: string; text: string; badge: string }> = {
  N5: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-500' },
  N4: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-500' },
  N3: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-500' },
  N2: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-500' },
  N1: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-500' },
};

export const LevelSelect = () => {
  const navigate = useNavigate();
  const { user, setLevel } = useAppStore();
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const handleSelect = (level: JLPTLevel) => {
    setLevel(level);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white text-slate-400 hover:text-brand-700 rounded-full shadow-sm border border-brand-200/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Choose Your Level</h1>
          <p className="text-slate-500 font-medium mt-1">Select a JLPT level to study</p>
        </div>
      </div>

      <div className="space-y-4">
        {levels.map((level, index) => {
          const info = levelInfo[level];
          const colors = levelColors[level];
          const isActive = user.level === level;

          return (
            <motion.button
              key={level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => handleSelect(level)}
              className={twMerge(clsx(
                "w-full text-left p-6 rounded-3xl border-2 transition-all shadow-sm",
                isActive
                  ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-brand-500`
                  : `bg-white border-brand-200/50 hover:${colors.bg} hover:${colors.border}`
              ))}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={twMerge(clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl",
                    colors.badge
                  ))}>
                    {level}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{level} — {info.label}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">{info.description}</p>
                  </div>
                </div>
                {isActive && (
                  <CheckCircle2 className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                )}
              </div>

              <div className="mt-4 flex space-x-4 text-xs font-bold">
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">{info.vocabCount} Vocab</span>
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">{info.grammarCount} Grammar</span>
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full">{info.kanjiCount} Kanji</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
