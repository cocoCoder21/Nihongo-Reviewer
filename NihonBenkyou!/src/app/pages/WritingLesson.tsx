import { useState, useRef, useEffect } from 'react';
import { X, Eraser, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../store/useAppStore';
import { levelContent } from '../data/levels';

export const WritingLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson, user } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [kanjiIndex, setKanjiIndex] = useState(0);

  const kanjiList = levelContent[user.level].kanji;
  const currentKanji = kanjiList[kanjiIndex];

  useEffect(() => {
    resetCanvas();
  }, [kanjiIndex]);

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
    resetCanvas();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isSubmitted) return;
    setIsDrawing(true);
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

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    resetCanvas();
  };

  const handleSubmit = () => {
    if (!isSubmitted) {
      setIsSubmitted(true);
    } else {
      // Move to next kanji or finish
      if (kanjiIndex < kanjiList.length - 1) {
        setKanjiIndex(i => i + 1);
        setIsSubmitted(false);
      } else {
        addXp(15);
        completeLesson();
        navigate('/learn');
      }
    }
  };

  if (!currentKanji) return null;

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative overscroll-none touch-none">
      
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button onClick={() => navigate('/learn')} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${((kanjiIndex + 1) / kanjiList.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 md:px-8 pb-32 flex flex-col items-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 text-red-800 font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="tracking-wide uppercase text-xs">Writing</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Draw the Kanji for "{currentKanji.meaning}"</h2>
        <p className="text-slate-500 font-medium mb-8">{currentKanji.reading}</p>

        <div className="relative w-full max-w-sm aspect-square bg-white rounded-3xl shadow-sm border-2 border-brand-200/50 overflow-hidden">
          
          {/* Guide Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between">
            <div className="w-full h-px bg-slate-400 absolute top-1/2 -translate-y-1/2 border-dashed border-t"></div>
            <div className="h-full w-px bg-slate-400 absolute left-1/2 -translate-x-1/2 border-dashed border-l"></div>
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

          {isSubmitted && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black text-slate-800">Perfect!</h3>
               <p className="text-slate-600 font-medium mt-1 text-8xl font-serif text-slate-300 pointer-events-none absolute -z-10">{currentKanji.kanji}</p>
             </div>
          )}

        </div>

        <div className="flex justify-center w-full max-w-sm mt-6">
          {!isSubmitted && (
            <button onClick={clearCanvas} className="flex items-center text-slate-500 font-bold hover:text-brand-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-brand-200/50">
              <Eraser className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <button 
          onClick={handleSubmit}
          className={`w-full max-w-lg mx-auto block font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg ${
            isSubmitted ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-brand-700 hover:bg-brand-800 text-white'
          }`}
        >
          {isSubmitted ? 'Continue' : 'Check'}
        </button>
      </div>

    </div>
  );
};