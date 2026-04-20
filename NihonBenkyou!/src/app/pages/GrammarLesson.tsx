import { useState, useEffect } from 'react';
import { X, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { contentService } from '../services/content.service';
import { levelContent } from '../data/levels';
import type { GrammarItem } from '../types';

export const GrammarLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson, user } = useAppStore();
  const [step, setStep] = useState(0);
  const [lessons, setLessons] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentService.getGrammar(user.level)
      .then((data) => {
        if (data.length > 0) setLessons(data);
        else setLessons(levelContent[user.level].grammar as unknown as GrammarItem[]);
      })
      .catch(() => {
        setLessons(levelContent[user.level].grammar as unknown as GrammarItem[]);
      })
      .finally(() => setLoading(false));
  }, [user.level]);

  const handleContinue = () => {
    if (step < lessons.length - 1) {
      setStep(s => s + 1);
    } else {
      addXp(15);
      completeLesson();
      navigate('/learn');
    }
  };

  const currentLesson = lessons[step];
  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-slate-500 font-medium">Loading grammar...</p></div>;
  if (!currentLesson) return null;

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/learn')}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / lessons.length) * 100}%` }}
              className="h-full bg-brand-500 rounded-full"
            />
          </div>
        </div>

        <div className="text-brand-500 font-bold px-3 py-1 rounded-full bg-brand-50 text-sm border border-brand-200">
          {step + 1}/{lessons.length}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="tracking-wide uppercase text-xs">Grammar</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-800 mb-8">{currentLesson.title}</h2>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-200/50 mb-6 relative overflow-hidden">
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                {currentLesson.rule}
              </p>

              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-sm font-semibold mb-2">Example:</p>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-slate-700">{currentLesson.example}</span>
                  <span className="text-brand-300">→</span>
                  <div className="bg-blue-100 px-4 py-2 rounded-xl text-blue-800 font-bold text-2xl">
                    {currentLesson.exampleConverted}
                  </div>
                </div>
                <span className="text-slate-400 mt-3 text-sm">({currentLesson.exampleMeaning})</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-200/50 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-100 active:scale-95 transition-all">
                <Volume2 className="w-5 h-5 fill-current" />
              </button>
              <div>
                <p className="text-xl font-bold text-slate-800 mb-1">
                  {currentLesson.sentence}
                </p>
                <p className="text-sm font-medium text-slate-400 mb-2">{currentLesson.sentenceRomaji}</p>
                <p className="text-base text-slate-600">{currentLesson.sentenceMeaning}</p>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <button 
          onClick={handleContinue}
          className="w-full max-w-lg mx-auto block bg-brand-700 hover:bg-brand-800 active:bg-brand-800 text-white font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};