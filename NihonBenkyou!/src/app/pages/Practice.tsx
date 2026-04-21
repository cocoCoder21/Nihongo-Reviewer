import { useEffect, useState } from 'react';
import { Flashcard } from '../components/Flashcard';
import { X, BarChart, Flame } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useFlashcardStore, type CategoryFilter } from '../store/useFlashcardStore';
import { useAppStore } from '../store/useAppStore';

const filterOptions: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'kana', label: 'Kana' },
  { value: 'vocabulary', label: 'Vocab' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'kanji', label: 'Kanji' },
];

export const Practice = () => {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const { categoryFilter, setCategoryFilter, startApiReview, startReview, sessionStats } = useFlashcardStore();
  const { user, stats, fetchStats } = useAppStore();

  useEffect(() => {
    // Sync historical reviewsDue / cardsMastered / streak from backend on mount
    fetchStats().catch(() => {});
    // Load due cards immediately so Practice isn't empty until a filter is clicked.
    startApiReview().catch(() => startReview(user.level));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStats]);

  const handleFilterChange = (filter: CategoryFilter) => {
    setCategoryFilter(filter);
    startApiReview().catch(() => startReview(user.level));
  };

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

        <div className="flex-1 px-4 flex justify-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                categoryFilter === opt.value
                  ? 'bg-brand-700 text-white'
                  : 'bg-brand-200 text-brand-700 hover:bg-brand-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowStats(!showStats)}
          className="p-2 text-brand-700 bg-brand-100 rounded-full shadow-sm active:scale-95 transition-all"
        >
          <BarChart className="w-5 h-5" />
        </button>
      </header>

      {/* Stats Panel */}
      {showStats && (
        <div className="mx-4 md:mx-8 mb-4 bg-white rounded-2xl p-4 shadow-sm border border-brand-200/50">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Session Stats</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div><p className="text-lg font-black text-slate-600">{sessionStats.again}</p><p className="text-[10px] font-bold text-slate-400">Again</p></div>
            <div><p className="text-lg font-black text-orange-600">{sessionStats.hard}</p><p className="text-[10px] font-bold text-orange-400">Hard</p></div>
            <div><p className="text-lg font-black text-emerald-600">{sessionStats.good}</p><p className="text-[10px] font-bold text-emerald-400">Good</p></div>
            <div><p className="text-lg font-black text-blue-600">{sessionStats.easy}</p><p className="text-[10px] font-bold text-blue-400">Easy</p></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm font-black text-slate-600">{stats.reviewsDue}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviews Due</p>
            </div>
            <div>
              <p className="text-sm font-black text-slate-600">{stats.cardsMastered}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastered</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
                <p className="text-sm font-black text-slate-600">{stats.streak}</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 flex flex-col items-center justify-center pb-32">
        <Flashcard />
      </div>

    </div>
  );
};