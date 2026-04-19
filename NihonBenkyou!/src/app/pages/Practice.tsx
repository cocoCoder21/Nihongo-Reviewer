import { Flashcard } from '../components/Flashcard';
import { X, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Practice = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      
      {/* Header */}
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/')}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 px-8 flex justify-center">
          <div className="bg-brand-200 text-brand-700 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span>Spaced Repetition</span>
          </div>
        </div>

        <button className="p-2 text-brand-700 bg-brand-100 rounded-full shadow-sm active:scale-95 transition-all">
          <BarChart className="w-5 h-5" />
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 flex flex-col items-center justify-center pb-32">
        <Flashcard />
      </div>

    </div>
  );
};