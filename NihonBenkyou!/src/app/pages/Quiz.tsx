import { useEffect } from 'react';
import { X, CheckCircle2, XCircle, Trophy, RotateCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { useQuizStore } from '../store/useQuizStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const categoryColors: Record<string, string> = {
  vocabulary: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  grammar: 'bg-blue-100 text-blue-800 border-blue-200',
  kanji: 'bg-red-100 text-red-800 border-red-200',
};

export const Quiz = () => {
  const navigate = useNavigate();
  const { user, addXp, completeQuiz } = useAppStore();
  const {
    questions, currentIndex, selectedAnswer, isSubmitted,
    score, isComplete, startQuiz, selectAnswer, submitAnswer,
    nextQuestion, resetQuiz,
  } = useQuizStore();

  useEffect(() => {
    if (questions.length === 0) {
      startQuiz(user.level, 10);
    }
  }, []);

  const handleFinish = () => {
    const xpEarned = score * 5;
    addXp(xpEarned);
    completeQuiz();
    navigate('/');
  };

  const handleRetry = () => {
    startQuiz(user.level, 10);
  };

  // Completion screen
  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const xpEarned = score * 5;
    return (
      <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
        <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
          <button onClick={() => { resetQuiz(); navigate('/'); }} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 pb-32">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex flex-col items-center text-center"
          >
            <div className={twMerge(clsx(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6",
              percentage >= 80 ? "bg-emerald-100 text-emerald-500" : percentage >= 50 ? "bg-yellow-100 text-yellow-500" : "bg-red-100 text-red-500"
            ))}>
              <Trophy className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2">
              {percentage >= 80 ? 'Excellent!' : percentage >= 50 ? 'Good job!' : 'Keep practicing!'}
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              You scored {score}/{questions.length} ({percentage}%)
            </p>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-500">{score}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-red-500">{questions.length - score}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Wrong</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-brand-500">+{xpEarned}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">XP</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full max-w-sm">
              <button 
                onClick={handleRetry}
                className="flex-1 py-4 px-6 bg-white text-brand-700 font-bold rounded-2xl border border-brand-200 hover:bg-brand-50 transition-all flex items-center justify-center space-x-2"
              >
                <RotateCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button 
                onClick={handleFinish}
                className="flex-1 py-4 px-6 bg-brand-700 text-white font-bold rounded-2xl hover:bg-brand-800 transition-all flex items-center justify-center space-x-2"
              >
                <span>Finish</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button 
          onClick={() => { resetQuiz(); navigate('/'); }}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              className="h-full bg-brand-500 rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-brand-700 bg-brand-100 px-3 py-1 rounded-full">
            {score}/{currentIndex + (isSubmitted ? 1 : 0)}
          </span>
          <span className="text-sm font-bold text-slate-400">{currentIndex + 1}/{questions.length}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 flex flex-col items-center">
        
        <div className="flex justify-center mb-6 mt-8">
          <div className={twMerge(clsx(
            "font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border",
            categoryColors[question.category]
          ))}>
            <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
            <span className="tracking-wide uppercase text-xs">{question.category}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            <h2 className="text-2xl font-black text-center text-slate-800 mb-8 leading-relaxed">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isCorrect = idx === question.correctIndex;
                const isSelected = selectedAnswer === idx;

                let btnClass = "bg-white border-2 border-brand-200/50 text-slate-700 hover:border-brand-300 hover:bg-brand-50";

                if (isSelected && !isSubmitted) {
                  btnClass = "bg-brand-100 border-2 border-brand-500 text-brand-800";
                } else if (isSubmitted) {
                  if (isCorrect) {
                    btnClass = "bg-emerald-100 border-2 border-emerald-500 text-emerald-800";
                  } else if (isSelected && !isCorrect) {
                    btnClass = "bg-red-100 border-2 border-red-500 text-red-800";
                  } else {
                    btnClass = "bg-white border-2 border-slate-200 text-slate-400 opacity-50";
                  }
                }

                return (
                  <button 
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => selectAnswer(idx)}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-left transition-all ${btnClass} flex justify-between items-center`}
                  >
                    <span>{option}</span>
                    {isSubmitted && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={twMerge(clsx(
                    "mt-6 p-4 rounded-2xl border",
                    selectedAnswer === question.correctIndex
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  ))}
                >
                  <p className={twMerge(clsx(
                    "font-bold mb-1",
                    selectedAnswer === question.correctIndex ? "text-emerald-800" : "text-red-800"
                  ))}>
                    {selectedAnswer === question.correctIndex ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-slate-600 text-sm">{question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <button 
          disabled={selectedAnswer === null && !isSubmitted}
          onClick={isSubmitted ? nextQuestion : submitAnswer}
          className={twMerge(clsx(
            "w-full max-w-lg mx-auto block font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg",
            selectedAnswer === null && !isSubmitted
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSubmitted
                ? "bg-brand-700 hover:bg-brand-800 text-white"
                : "bg-brand-700 hover:bg-brand-800 text-white"
          ))}
        >
          {isSubmitted ? (currentIndex < questions.length - 1 ? 'Next Question' : 'See Results') : 'Check'}
        </button>
      </div>
    </div>
  );
};
