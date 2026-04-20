import { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, MessageSquareQuote } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { contentService } from '../services/content.service';
import { FamiliarityButton } from '../components/FamiliarityButton';
import type { KanaChar, KanaRow } from '../types';

type KanaTab = 'hiragana' | 'katakana';
type KanaFilter = 'SEION' | 'DAKUON' | 'HANDAKUON' | 'YOUON';
type KanaRowFilter = KanaRow;

const FILTER_LABELS: Record<KanaFilter, string> = {
  SEION: 'Basic',
  DAKUON: 'Dakuten',
  HANDAKUON: 'Handakuten',
  YOUON: 'Yōon',
};

const ROW_LABELS: Record<KanaRowFilter, string> = {
  A: 'A',
  KA: 'Ka',
  SA: 'Sa',
  TA: 'Ta',
  NA: 'Na',
  HA: 'Ha',
  MA: 'Ma',
  YA: 'Ya',
  RA: 'Ra',
  WA: 'Wa',
  N: 'N',
};

export const KanaLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson } = useAppStore();
  const [tab, setTab] = useState<KanaTab>('hiragana');
  const [filter, setFilter] = useState<KanaFilter>('SEION');
  const [row, setRow] = useState<KanaRowFilter>('A');
  const [step, setStep] = useState(0);
  const [allKana, setAllKana] = useState<KanaChar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setRow('A');
    setFilter('SEION');
    setStep(0);

    const fetcher = tab === 'hiragana'
      ? contentService.getHiragana()
      : contentService.getKatakana();

    fetcher
      .then((data) => setAllKana(data))
      .catch(() => setAllKana([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const kana = useMemo(() => {
    return allKana.filter(k => k.row === row && k.type === filter);
  }, [allKana, row, filter]);

  const availableTypes = useMemo(() => {
    return new Set(allKana.filter(k => k.row === row).map(k => k.type));
  }, [allKana, row]);

  const availableRows = useMemo(() => {
    return new Set(allKana.filter(k => k.type === filter).map(k => k.row));
  }, [allKana, filter]);

  const handleRowChange = (newRow: KanaRowFilter) => {
    const rowData = allKana.filter(k => k.row === newRow);
    if (!rowData.some(k => k.type === filter)) {
      const firstAvailable = (Object.keys(FILTER_LABELS) as KanaFilter[]).find(
        f => rowData.some(k => k.type === f)
      );
      if (firstAvailable) setFilter(firstAvailable);
    }
    setRow(newRow);
    setStep(0);
  };

  const handleFilterChange = (newFilter: KanaFilter) => {
    const typeData = allKana.filter(k => k.type === newFilter);
    if (!typeData.some(k => k.row === row)) {
      const firstAvailable = (Object.keys(ROW_LABELS) as KanaRowFilter[]).find(
        r => typeData.some(k => k.row === r)
      );
      if (firstAvailable) setRow(firstAvailable);
    }
    setFilter(newFilter);
    setStep(0);
  };

  const handleContinue = () => {
    if (step < kana.length - 1) {
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

  const current = kana[step];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 font-medium">Loading kana...</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-slate-500 font-medium">No kana data available yet.</p>
        <button
          onClick={() => navigate('/learn')}
          className="text-brand-600 font-bold hover:underline"
        >
          Back to Learn Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      {/* Header */}
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button
          aria-label="Close lesson"
          onClick={() => navigate('/learn')}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / kana.length) * 100}%` }}
              className="h-full bg-purple-500 rounded-full"
            />
          </div>
        </div>

        <span className="text-sm font-bold text-slate-400">{step + 1}/{kana.length}</span>
      </header>

      {/* Tab & Filter Bar */}
      <div className="px-4 md:px-8 pb-4 space-y-3">
        {/* Hiragana / Katakana tabs */}
        <div className="flex gap-2">
          {(['hiragana', 'katakana'] as KanaTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-2xl text-sm font-bold transition-all ${
                tab === t
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-purple-50 border border-brand-200'
              }`}
            >
              {t === 'hiragana' ? 'ひらがな Hiragana' : 'カタカナ Katakana'}
            </button>
          ))}
        </div>

        {/* Row filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(ROW_LABELS) as KanaRowFilter[]).map((r) => {
            const isDisabled = !availableRows.has(r);
            return (
              <button
                key={r}
                onClick={() => handleRowChange(r)}
                disabled={isDisabled}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isDisabled
                    ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                    : row === r
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-white text-slate-400 border border-brand-200 hover:bg-purple-50'
                }`}
              >
                {ROW_LABELS[r]}
              </button>
            );
          })}
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(FILTER_LABELS) as KanaFilter[]).map((f) => {
            const isDisabled = !availableTypes.has(f);
            return (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                disabled={isDisabled}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isDisabled
                    ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                    : filter === f
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-white text-slate-400 border border-brand-200 hover:bg-purple-50'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kana Card */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${tab}-${row}-${filter}-${step}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg"
          >
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="tracking-wide uppercase text-xs">
                  {tab === 'hiragana' ? 'Hiragana' : 'Katakana'}
                </span>
              </div>
            </div>

            {/* Character Display */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-200/50 mb-6 text-center relative">
              <div className="absolute top-4 right-4">
                <FamiliarityButton contentType={tab} contentId={String(current.id)} />
              </div>
              <h2 className="text-7xl md:text-8xl font-black text-slate-800 mb-4">{current.character}</h2>
              <p className="text-2xl font-bold text-purple-600 mb-2">{current.romaji}</p>
              <div className="w-12 h-1 bg-brand-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400 font-medium">
                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  Row: {current.row}
                </span>
                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  {current.type}
                </span>
                {current.strokeCount > 0 && (
                  <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {current.strokeCount} strokes
                  </span>
                )}
              </div>
            </div>

            {/* Mnemonic */}
            {current.mnemonic && (
              <div className="bg-purple-50 p-5 rounded-3xl border border-purple-100 mb-6">
                <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">Mnemonic</p>
                <p className="text-slate-700 font-medium leading-relaxed">{current.mnemonic}</p>
              </div>
            )}

            {/* Example Word */}
            {current.exampleWord && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-200/50">
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquareQuote className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Example Word</span>
                </div>
                <p className="text-xl font-bold text-slate-800 mb-1">{current.exampleWord}</p>
                {current.exampleReading && (
                  <p className="text-sm font-medium text-slate-400 mb-1">{current.exampleReading}</p>
                )}
                {current.exampleMeaning && (
                  <p className="text-base text-slate-600">{current.exampleMeaning}</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <div className="max-w-lg mx-auto flex space-x-3">
          {step > 0 && (
            <button
              aria-label="Previous character"
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
            <span>{step < kana.length - 1 ? 'Next Character' : 'Complete'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
