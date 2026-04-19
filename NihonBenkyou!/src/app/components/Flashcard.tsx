import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useFlashcardStore, CardCategory } from '../store/useFlashcardStore';
import { useAppStore } from '../store/useAppStore';
import { RotateCw, Check, X, BrainCircuit, FastForward, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const categoryColors: Record<CardCategory, { bg: string, text: string, label: string }> = {
  grammar: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Grammar' },
  vocabulary: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Vocabulary' },
  kanji: { bg: 'bg-red-100', text: 'text-red-800', label: 'Kanji' },
  particle: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Particle' },
};

export const Flashcard = () => {
  const { sessionCards, currentIndex, isFlipped, isSessionComplete, sessionStats, flipCard, answerCard, startReview, resetSession } = useFlashcardStore();
  const { user, addXp, completeReview } = useAppStore();
  const navigate = useNavigate();
  const currentCard = sessionCards[currentIndex];

  useEffect(() => {
    if (sessionCards.length === 0) {
      startReview(user.level);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped) flipCard();
      } else if (isFlipped) {
        if (e.key === '1') { answerCard('again'); completeReview(); }
        if (e.key === '2') { answerCard('hard'); completeReview(); }
        if (e.key === '3') { answerCard('good'); completeReview(); }
        if (e.key === '4') { answerCard('easy'); completeReview(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, flipCard, answerCard, completeReview]);

  const handleAnswer = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    answerCard(difficulty);
    completeReview();
    if (difficulty !== 'again') {
      addXp(difficulty === 'easy' ? 3 : difficulty === 'good' ? 2 : 1);
    }
  };

  // Session complete screen
  if (isSessionComplete) {
    const percentage = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 md:p-8 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto",
            percentage >= 80 ? "bg-emerald-100 text-emerald-500" : "bg-yellow-100 text-yellow-500"
          )}>
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2">Session Complete!</h2>
          <p className="text-slate-500 font-medium mb-8">
            {sessionStats.correct}/{sessionStats.total} correct ({percentage}%)
          </p>

          <div className="grid grid-cols-4 gap-3 mb-8 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xl font-black text-slate-600">{sessionStats.again}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Again</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-xl font-black text-orange-600">{sessionStats.hard}</p>
              <p className="text-[10px] font-bold text-orange-400 uppercase">Hard</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xl font-black text-emerald-600">{sessionStats.good}</p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase">Good</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xl font-black text-blue-600">{sessionStats.easy}</p>
              <p className="text-[10px] font-bold text-blue-400 uppercase">Easy</p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => startReview(user.level)}
              className="w-full py-4 px-6 bg-white text-brand-700 font-bold rounded-2xl border border-brand-200 hover:bg-brand-50 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Review Again</span>
            </button>
            <button 
              onClick={() => { resetSession(); navigate('/'); }}
              className="w-full py-4 px-6 bg-brand-700 text-white font-bold rounded-2xl hover:bg-brand-800 transition-all flex items-center justify-center space-x-2"
            >
              <span>Done</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) return <div className="p-8 text-center text-slate-500">No cards to review. Check back later!</div>;

  const colorProfile = categoryColors[currentCard.category];

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 md:p-8 relative">
      <div className="w-full flex justify-between items-center mb-8 text-sm text-slate-500 font-medium">
        <span>Cards remaining: {sessionCards.length - currentIndex}</span>
        <div className="flex space-x-1.5">
          {sessionCards.map((_, idx) => (
            <div 
              key={idx} 
              className={cn("h-2 w-8 rounded-full transition-all", idx < currentIndex ? "bg-brand-500" : idx === currentIndex ? "bg-brand-200 w-10" : "bg-slate-200")} 
            />
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-[4/3]" style={{ perspective: '1000px' }}>
        <motion.div
          className="w-full h-full relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          onClick={() => !isFlipped && flipCard()}
        >
          {/* FRONT */}
          <div className="absolute inset-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
            <span className={cn("absolute top-6 left-6 px-3 py-1 rounded-full text-xs font-semibold tracking-wide", colorProfile.bg, colorProfile.text)}>
              {colorProfile.label}
            </span>
            <h2 className="text-6xl md:text-8xl font-black text-slate-800 tracking-tight leading-tight">{currentCard.front}</h2>
            
            <div className="absolute bottom-6 flex items-center space-x-2 text-slate-400 text-sm font-medium">
              <RotateCw className="w-4 h-4" />
              <span>Tap or Space to reveal</span>
            </div>
          </div>

          {/* BACK */}
          <div 
            className="absolute inset-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: "rotateY(180deg)" }}
          >
             <span className={cn("absolute top-6 left-6 px-3 py-1 rounded-full text-xs font-semibold tracking-wide", colorProfile.bg, colorProfile.text)}>
              {colorProfile.label}
            </span>

            <div className="flex flex-col items-center justify-center flex-1 w-full mt-4">
              <h3 className="text-2xl md:text-3xl font-medium text-slate-500 mb-4">{currentCard.reading}</h3>
              <div className="w-12 h-1 bg-slate-100 rounded-full mb-6" />
              <p className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">{currentCard.meaning}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 w-full min-h-[100px] flex items-center">
        {!isFlipped ? (
          <div className="flex w-full justify-center">
             <button 
                onClick={flipCard}
                className="w-full max-w-sm bg-brand-700 hover:bg-brand-800 active:bg-brand-800 text-white font-semibold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Show Answer</span>
             </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 w-full gap-3 md:gap-4"
          >
            <AnswerButton 
              label="Again" 
              time="1m" 
              shortcut="1" 
              color="bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              icon={<X className="w-5 h-5 mb-1 text-slate-500" />}
              onClick={() => handleAnswer('again')} 
            />
            <AnswerButton 
              label="Hard" 
              time="10m" 
              shortcut="2" 
              color="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
              icon={<BrainCircuit className="w-5 h-5 mb-1 text-orange-500" />}
              onClick={() => handleAnswer('hard')} 
            />
            <AnswerButton 
              label="Good" 
              time="1d" 
              shortcut="3" 
              color="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
              icon={<Check className="w-5 h-5 mb-1 text-emerald-500" />}
              onClick={() => handleAnswer('good')} 
            />
            <AnswerButton 
              label="Easy" 
              time="4d" 
              shortcut="4" 
              color="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              icon={<FastForward className="w-5 h-5 mb-1 text-blue-500" />}
              onClick={() => handleAnswer('easy')} 
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AnswerButton = ({ label, time, shortcut, color, icon, onClick }: { label: string, time: string, shortcut: string, color: string, icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn("relative flex-1 flex flex-col items-center justify-center py-4 rounded-2xl transition-all active:scale-95 border", color)}
  >
    {icon}
    <span className="font-semibold">{label}</span>
    <span className="text-xs opacity-70 mt-1">{time}</span>
    <span className="hidden md:flex absolute top-3 right-3 text-[10px] w-5 h-5 font-bold rounded items-center justify-center bg-black/5 opacity-50">{shortcut}</span>
  </button>
);