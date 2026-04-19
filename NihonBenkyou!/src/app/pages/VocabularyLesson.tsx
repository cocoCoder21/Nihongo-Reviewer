import { useState } from 'react';
import { X, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { levelContent } from '../data/levels';

export const VocabularyLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson, user } = useAppStore();
  const [step, setStep] = useState(0);

  const vocab = levelContent[user.level].vocabulary;

  const handleContinue = () => {
    if (step < vocab.length - 1) {
      setStep(s => s + 1);
    } else {
      addXp(15);
      completeLesson();
      navigate('/learn');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const current = vocab[step];
  if (!current) return null;

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
              animate={{ width: `${((step + 1) / vocab.length) * 100}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        <span className="text-sm font-bold text-slate-400">{step + 1}/{vocab.length}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="tracking-wide uppercase text-xs">Vocabulary</span>
              </div>
            </div>

            {/* Word Display */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-200/50 mb-6 text-center">
              <h2 className="text-5xl md:text-6xl font-black text-slate-800 mb-4">{current.word}</h2>
              <p className="text-lg font-medium text-slate-400 mb-2">{current.reading}</p>
              <div className="w-12 h-1 bg-brand-200 rounded-full mx-auto mb-4" />
              <p className="text-2xl font-bold text-brand-700">{current.meaning}</p>
            </div>

            {/* Example Sentence */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-200/50 flex items-start space-x-4">
              <button className="flex-shrink-0 w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all">
                <Volume2 className="w-5 h-5 fill-current" />
              </button>
              <div>
                <p className="text-xl font-bold text-slate-800 mb-2">{current.example}</p>
                <p className="text-base text-slate-500">{current.exampleMeaning}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <div className="max-w-lg mx-auto flex space-x-3">
          {step > 0 && (
            <button 
              onClick={handleBack}
              className="p-4 bg-brand-100 text-brand-700 rounded-2xl hover:bg-brand-200 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleContinue}
            className="flex-1 bg-brand-700 hover:bg-brand-800 active:bg-brand-800 text-white font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg flex items-center justify-center space-x-2"
          >
            <span>{step < vocab.length - 1 ? 'Next Word' : 'Complete'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
