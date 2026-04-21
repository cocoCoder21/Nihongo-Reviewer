import { useState, useRef, useEffect } from 'react';
import { X, Eraser, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, Loader2, BookOpen, Pencil, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { contentService } from '../services/content.service';
import { FamiliarityButton } from '../components/FamiliarityButton';
import type { KanjiItem, KanjiCategory } from '../types';

type Phase = 'categories' | 'detail' | 'writing';
type CheckResult = null | 'perfect' | 'good' | 'retry' | 'empty';

// ─── Canvas analysis helpers ──────────────────────────────────────

/** Check if the canvas has enough drawn pixels to count as an attempt */
function getCanvasInkCoverage(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let inked = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 30) inked++;
  }
  return inked / (width * height);
}

/** Render a character on an offscreen canvas and return the canvas */
function renderReferenceChar(char: string, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Try common Japanese fonts, fall back to serif
  ctx.font = `bold ${Math.floor(size * 0.7)}px "Noto Sans JP", "Yu Gothic", "Hiragino Sans", "MS Gothic", serif`;
  ctx.fillText(char, size / 2, size / 2);
  return canvas;
}

/** Compare the drawn canvas with a reference character, returns 0–1 similarity */
function compareWithReference(drawnCanvas: HTMLCanvasElement, char: string): number {
  const size = 64; // normalize both to a small grid for comparison

  // 1. Downscale drawn canvas
  const drawnSmall = document.createElement('canvas');
  drawnSmall.width = size;
  drawnSmall.height = size;
  const dCtx = drawnSmall.getContext('2d')!;
  dCtx.drawImage(drawnCanvas, 0, 0, size, size);
  const drawnData = dCtx.getImageData(0, 0, size, size).data;

  // 2. Render reference
  const refCanvas = renderReferenceChar(char, size);
  const refData = refCanvas.getContext('2d')!.getImageData(0, 0, size, size).data;

  // 3. Build binary masks (alpha > threshold)
  const threshold = 30;
  const drawnMask: boolean[] = [];
  const refMask: boolean[] = [];
  for (let i = 3; i < drawnData.length; i += 4) {
    drawnMask.push(drawnData[i] > threshold);
    refMask.push(refData[i] > threshold);
  }

  // 4. Calculate overlap metrics
  let drawnCount = 0;
  let refCount = 0;
  let overlap = 0;
  for (let i = 0; i < drawnMask.length; i++) {
    if (drawnMask[i]) drawnCount++;
    if (refMask[i]) refCount++;
    if (drawnMask[i] && refMask[i]) overlap++;
  }

  if (refCount === 0 || drawnCount === 0) return 0;

  // Dice coefficient: 2*|A∩B| / (|A| + |B|)
  const dice = (2 * overlap) / (drawnCount + refCount);

  // Also penalize if drawn area is wildly different from reference
  const sizeRatio = Math.min(drawnCount, refCount) / Math.max(drawnCount, refCount);
  
  return dice * 0.7 + sizeRatio * 0.3;
}

export const WritingLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson, user } = useAppStore();
  const level = user.level;

  // ─── State ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('categories');
  const [categories, setCategories] = useState<KanjiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [kanjiIndex, setKanjiIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Writing canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  // ─── Load categories on mount ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, radicals] = await Promise.all([
          contentService.getKanjiCategories(level),
          contentService.getRadicals(),
        ]);
        const allCats = [...cats];
        if (radicals.length > 0) {
          allCats.unshift({ name: 'Radicals', count: radicals.length });
        }
        setCategories(allCats);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [level]);

  // ─── Load kanji when category selected ──────────────────────────
  const selectCategory = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setLoading(true);
    try {
      if (categoryName === 'Radicals') {
        const radicals = await contentService.getRadicals();
        const mapped: KanjiItem[] = radicals.map((r) => ({
          id: String(r.id),
          kanji: r.character,
          reading: r.name,
          meaning: r.meaning,
          strokeCount: 0,
          category: 'Radicals',
          examples: r.commonKanji,
          vocabulary: r.commonKanji.map((k) => ({ word: k, reading: '', meaning: '' })),
          exampleSentences: [],
        }));
        setKanjiList(mapped);
      } else {
        const kanji = await contentService.getKanji(level, { category: categoryName });
        setKanjiList(kanji);
      }
      setKanjiIndex(0);
      setPhase('detail');
    } catch {
      setKanjiList([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Canvas helpers ─────────────────────────────────────────────
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#1e293b';
      }
    }
  };

  useEffect(() => {
    if (phase === 'writing') resetCanvas();
  }, [phase, kanjiIndex]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isSubmitted) return;
    setIsDrawing(true);
    setHasStrokes(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  // ─── Navigation ─────────────────────────────────────────────────
  const goToWriting = () => {
    setIsSubmitted(false);
    setCheckResult(null);
    setHasStrokes(false);
    setPhase('writing');
  };

  const handleWritingSubmit = () => {
    if (!isSubmitted) {
      // ── Check the canvas ──
      const canvas = canvasRef.current;
      if (!canvas || !hasStrokes) {
        // Empty canvas — show empty warning
        setCheckResult('empty');
        setIsSubmitted(true);
        return;
      }

      const inkCoverage = getCanvasInkCoverage(canvas);
      if (inkCoverage < 0.005) {
        // Barely anything drawn
        setCheckResult('empty');
        setIsSubmitted(true);
        return;
      }

      // Compare with reference character
      const similarity = compareWithReference(canvas, currentKanji.kanji);
      if (similarity >= 0.25) {
        setCheckResult('perfect');
      } else if (similarity >= 0.12) {
        setCheckResult('good');
      } else {
        setCheckResult('retry');
      }
      setIsSubmitted(true);
    } else if (checkResult === 'empty' || checkResult === 'retry') {
      // Let them try again
      setIsSubmitted(false);
      setCheckResult(null);
      setHasStrokes(false);
      resetCanvas();
    } else if (kanjiIndex < kanjiList.length - 1) {
      setKanjiIndex((i) => i + 1);
      setIsSubmitted(false);
      setCheckResult(null);
      setHasStrokes(false);
      setPhase('detail');
    } else {
      addXp(15);
      completeLesson();
      navigate('/learn');
    }
  };

  const goBack = () => {
    if (phase === 'writing') {
      setIsSubmitted(false);
      setCheckResult(null);
      setHasStrokes(false);
      setPhase('detail');
    } else if (phase === 'detail') {
      if (kanjiIndex > 0) {
        setKanjiIndex((i) => i - 1);
      } else {
        setPhase('categories');
      }
    } else {
      navigate('/learn');
    }
  };

  const goBackKanji = () => {
    if (kanjiIndex > 0) {
      setKanjiIndex((i) => i - 1);
      setIsSubmitted(false);
      setCheckResult(null);
      setHasStrokes(false);
      setPhase('detail');
    }
  };

  const currentKanji = kanjiList[kanjiIndex];
  const progress = kanjiList.length > 0 ? ((kanjiIndex + 1) / kanjiList.length) * 100 : 0;

  // ─── PHASE 1: Category Picker ──────────────────────────────────
  if (phase === 'categories') {
    return (
      <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
        <header className="px-4 md:px-8 py-6 flex items-center space-x-4 sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
          <button onClick={() => navigate('/learn')} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-slate-800">Writing & Kanji</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          <p className="text-slate-500 font-medium mb-6">Choose a category to study — JLPT {level}</p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 font-medium">No kanji categories found for this level.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.name}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectCategory(cat.name)}
                  className="flex items-center justify-between bg-white p-4 rounded-2xl border border-brand-200/50 shadow-sm hover:border-red-300 hover:bg-red-50/50 transition-all text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 group-hover:text-red-800 truncate">{cat.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{cat.count} kanji</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-400 flex-shrink-0 ml-2" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentKanji) return null;

  // ─── PHASE 2: Kanji Detail View ────────────────────────────────
  if (phase === 'detail') {
    const onyomiExamples = (currentKanji.vocabulary || []).slice(0, 3);
    const kunyomiExamples = (currentKanji.vocabulary || []).slice(3, 6);
    const sentences = (currentKanji.exampleSentences || []).slice(0, 3);

    return (
      <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
        <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
          <button onClick={goBack} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 px-6">
            <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-red-500 rounded-full" />
            </div>
          </div>
          <span className="text-sm font-bold text-slate-400">{kanjiIndex + 1}/{kanjiList.length}</span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
          {/* Category badge */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 text-red-800 font-bold px-4 py-1.5 rounded-2xl flex items-center space-x-2 border border-red-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="tracking-wide uppercase text-xs">{selectedCategory}</span>
            </div>
          </div>

          {/* Main kanji display */}
          <div className="flex flex-col items-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <FamiliarityButton
                contentType={selectedCategory === 'Radicals' ? 'radical' : 'kanji'}
                contentId={String(currentKanji.id)}
              />
            </div>
            <motion.div
              key={currentKanji.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-9xl font-serif text-slate-800 mb-4 leading-none"
            >
              {currentKanji.kanji}
            </motion.div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">{currentKanji.meaning}</h2>
            <p className="text-slate-500 font-medium text-sm">
              {currentKanji.strokeCount} strokes
              {currentKanji.mnemonic && <span className="text-slate-400"> · {currentKanji.mnemonic}</span>}
            </p>
          </div>

          {/* Readings */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-brand-200/50">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">音読み On'yomi</p>
              <p className="text-lg font-bold text-slate-800">{currentKanji.onyomi || '—'}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-brand-200/50">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">訓読み Kun'yomi</p>
              <p className="text-lg font-bold text-slate-800">{currentKanji.kunyomi || '—'}</p>
            </div>
          </div>

          {/* Vocabulary examples */}
          {onyomiExamples.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2 px-1">On'yomi Examples</h3>
              <div className="space-y-2">
                {onyomiExamples.map((v, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-brand-200/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">{v.word}</span>
                      <span className="text-slate-400 ml-2 text-sm">{v.reading}</span>
                    </div>
                    <span className="text-slate-500 text-sm font-medium">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kunyomiExamples.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 px-1">Kun'yomi Examples</h3>
              <div className="space-y-2">
                {kunyomiExamples.map((v, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-brand-200/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">{v.word}</span>
                      <span className="text-slate-400 ml-2 text-sm">{v.reading}</span>
                    </div>
                    <span className="text-slate-500 text-sm font-medium">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example sentences */}
          {sentences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2 px-1">Example Sentences</h3>
              <div className="space-y-2">
                {sentences.map((s, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-brand-200/50">
                    <p className="font-bold text-slate-800">{s.japanese}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{s.english}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Practice Writing button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
          <div className="max-w-lg mx-auto flex space-x-3">
            {kanjiIndex > 0 && (
              <button
                onClick={goBack}
                className="p-4 bg-brand-100 text-brand-700 rounded-2xl hover:bg-brand-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={goToWriting}
              className="flex-1 flex items-center justify-center font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg bg-brand-700 hover:bg-brand-800 text-white"
            >
              <Pencil className="w-5 h-5 mr-2" />
              Practice Writing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 3: Writing Practice ─────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative overscroll-none touch-none">
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button onClick={goBack} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 px-6">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-red-500 rounded-full" />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-400">{kanjiIndex + 1}/{kanjiList.length}</span>
      </header>

      <div className="flex-1 px-4 md:px-8 pb-32 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-800 font-bold px-4 py-1.5 rounded-2xl flex items-center space-x-2 border border-red-200">
            <Pencil className="w-3.5 h-3.5" />
            <span className="tracking-wide uppercase text-xs">Writing</span>
            {selectedCategory && (
              <>
                <span className="text-red-300">·</span>
                <span className="text-xs">{selectedCategory}</span>
              </>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-slate-800 mb-1">Draw: {currentKanji.kanji}</h2>
        <p className="text-slate-500 font-medium mb-1">{currentKanji.meaning}</p>
        <p className="text-slate-400 text-sm mb-6">{currentKanji.reading}</p>

        <div className="relative w-full max-w-sm aspect-square bg-white rounded-3xl shadow-sm border-2 border-brand-200/50 overflow-hidden">
          {/* Guide lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-px bg-slate-400 absolute top-1/2 -translate-y-1/2 border-dashed border-t" />
            <div className="h-full w-px bg-slate-400 absolute left-1/2 -translate-x-1/2 border-dashed border-l" />
          </div>

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />

          <AnimatePresence>
            {isSubmitted && checkResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6"
              >
                {checkResult === 'perfect' && (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-700">Perfect!</h3>
                    <p className="text-slate-500 text-sm mt-1">Great match</p>
                  </>
                )}
                {checkResult === 'good' && (
                  <>
                    <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-amber-700">Good!</h3>
                    <p className="text-slate-500 text-sm mt-1">Close enough — keep practicing</p>
                  </>
                )}
                {checkResult === 'retry' && (
                  <>
                    <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-200">
                      <XCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-red-700">Try Again</h3>
                    <p className="text-slate-500 text-sm mt-1">Your drawing doesn't match <span className="font-bold text-slate-800">{currentKanji.kanji}</span></p>
                  </>
                )}
                {checkResult === 'empty' && (
                  <>
                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                      <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-600">Nothing Drawn</h3>
                    <p className="text-slate-500 text-sm mt-1">Draw the character first, then check</p>
                  </>
                )}
                <p className="text-8xl font-serif text-slate-300 pointer-events-none absolute -z-10">{currentKanji.kanji}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center w-full max-w-sm mt-6">
          {!isSubmitted && (
            <button onClick={() => resetCanvas()} className="flex items-center text-slate-500 font-bold hover:text-brand-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-brand-200/50">
              <Eraser className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <div className="max-w-lg mx-auto flex space-x-3">
          {kanjiIndex > 0 && !isSubmitted && (
            <button
              onClick={goBackKanji}
              className="p-4 bg-brand-100 text-brand-700 rounded-2xl hover:bg-brand-200 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        <button
          onClick={handleWritingSubmit}
          className={`flex-1 font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg ${
            !isSubmitted
              ? 'bg-brand-700 hover:bg-brand-800 text-white'
              : checkResult === 'empty' || checkResult === 'retry'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {!isSubmitted
            ? 'Check'
            : checkResult === 'empty' || checkResult === 'retry'
              ? 'Try Again'
              : kanjiIndex < kanjiList.length - 1
                ? 'Next Kanji'
                : 'Finish'}
        </button>
        </div>
      </div>
    </div>
  );
};