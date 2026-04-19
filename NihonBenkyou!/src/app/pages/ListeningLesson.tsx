import { useState } from 'react';
import { X, Play, Pause, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { levelContent } from '../data/levels';

export const ListeningLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson, user } = useAppStore();

  const listeningItems = levelContent[user.level].listening;
  const [itemIndex, setItemIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentItem = listeningItems[itemIndex];
  const options = currentItem?.options ?? [];

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 2500);
    }
  };

  const handleContinue = () => {
    if (!isSubmitted && selected) {
      setIsSubmitted(true);
    } else if (isSubmitted) {
      if (itemIndex < listeningItems.length - 1) {
        setItemIndex(i => i + 1);
        setSelected(null);
        setIsSubmitted(false);
      } else {
        addXp(15);
        completeLesson();
        navigate('/learn');
      }
    }
  };

  if (!currentItem) return null;

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button onClick={() => navigate('/learn')} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 flex flex-col items-center">
        
        <div className="flex justify-center mb-6 mt-8">
          <div className="bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="tracking-wide uppercase text-xs">Listening</span>
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-slate-800 mb-8">What did you hear?</h2>

        <div className="mb-12 relative flex justify-center">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={toggleAudio}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-colors ${isPlaying ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' : 'bg-brand-700 text-white'}`}
          >
            {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
          </motion.button>
          
          {/* Animated sound waves */}
          <AnimatePresence>
            {isPlaying && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1.5 }}
                 exit={{ opacity: 0, scale: 2 }}
                 transition={{ duration: 1, repeat: Infinity }}
                 className="absolute inset-0 border-4 border-emerald-300 rounded-full pointer-events-none"
               />
            )}
          </AnimatePresence>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {options.map((option) => {
            const isCorrect = option.correct;
            const isSelected = selected === option.id;
            
            let btnClass = "bg-white border-2 border-brand-200/50 text-slate-700 hover:border-brand-300 hover:bg-brand-50";
            
            if (isSelected && !isSubmitted) {
              btnClass = "bg-brand-100 border-2 border-brand-500 text-brand-800";
            } else if (isSubmitted) {
              if (isCorrect) {
                btnClass = "bg-emerald-100 border-2 border-emerald-500 text-emerald-800";
              } else if (isSelected && !isCorrect) {
                btnClass = "bg-red-100 border-2 border-red-500 text-red-800 opacity-70";
              } else {
                btnClass = "bg-white border-2 border-slate-200 text-slate-400 opacity-50";
              }
            }

            return (
              <button 
                key={option.id}
                disabled={isSubmitted}
                onClick={() => setSelected(option.id)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-left transition-all ${btnClass} flex justify-between items-center`}
              >
                <span>{option.text}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-emerald-50 p-4 rounded-2xl border border-emerald-200 w-full max-w-sm"
            >
              <p className="text-emerald-800 font-bold mb-1">{currentItem.sentence} ({currentItem.romaji})</p>
              <p className="text-emerald-600 font-medium text-sm">{currentItem.meaning}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <button 
          disabled={!selected}
          onClick={handleContinue}
          className={`w-full max-w-lg mx-auto block font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg ${
            !selected ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
            isSubmitted ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-brand-700 hover:bg-brand-800 text-white'
          }`}
        >
          {isSubmitted ? 'Continue' : 'Check'}
        </button>
      </div>

    </div>
  );
};