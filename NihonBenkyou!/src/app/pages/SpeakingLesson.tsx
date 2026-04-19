import { useState } from 'react';
import { X, Mic, Play, Pause, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

export const SpeakingLesson = () => {
  const navigate = useNavigate();
  const { addXp } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const toggleNativeAudio = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) setTimeout(() => setIsPlaying(false), 2000);
  };

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setScore(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    // Simulate analyzing speech
    setTimeout(() => {
      setScore(92);
    }, 1500);
  };

  const handleContinue = () => {
    if (score !== null) {
      addXp(20);
      navigate('/learn');
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button onClick={() => navigate('/learn')} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 flex flex-col items-center">
        
        <div className="flex justify-center mb-6 mt-8">
          <div className="bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-2xl flex items-center space-x-2 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="tracking-wide uppercase text-xs">Speaking</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-slate-800 mb-8">Repeat after the native speaker.</h2>

        {/* Sentence Block */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-200/50 flex flex-col items-center text-center space-y-4 w-full max-w-md">
          <button 
            onClick={toggleNativeAudio}
            className="flex-shrink-0 w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-100 active:scale-95 transition-all mb-4"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Volume2 className="w-6 h-6 fill-current" />}
          </button>
          
          <p className="text-3xl font-black text-slate-800 tracking-tight">ありがとうございます</p>
          <p className="text-lg font-medium text-slate-400">Arigatou gozaimasu</p>
          <p className="text-base font-medium text-slate-500">Thank you very much</p>
        </div>

        {/* Recording Block */}
        <div className="flex flex-col items-center mt-12 w-full max-w-md">
          
          <div className="h-24 w-full flex items-center justify-center mb-6 overflow-hidden">
             {isRecording ? (
                <div className="flex space-x-1 items-end h-full">
                  {[1,2,3,4,5,6,7,8,9].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 10 }}
                      animate={{ height: Math.random() * 80 + 10 }}
                      transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
                      className="w-2 bg-purple-500 rounded-full"
                    />
                  ))}
                </div>
             ) : score === null && hasRecorded ? (
                <div className="flex space-x-2 text-purple-500 font-bold items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300"></div>
                  <span className="ml-2">Analyzing...</span>
                </div>
             ) : score !== null ? (
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                 <p className="text-5xl font-black text-emerald-500 tracking-tighter">{score}%</p>
                 <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Excellent!</p>
               </motion.div>
             ) : (
               <p className="text-slate-400 font-bold text-lg">Hold to record</p>
             )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={isRecording ? stopRecording : undefined}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all border-4 ${
              isRecording ? 'bg-red-500 border-red-200 shadow-red-500/30' : 'bg-brand-700 border-brand-200 text-white shadow-brand-700/20'
            }`}
          >
            <Mic className={`w-12 h-12 ${isRecording ? 'text-white' : 'text-white'}`} />
          </motion.button>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <button 
          disabled={score === null}
          onClick={handleContinue}
          className={`w-full max-w-lg mx-auto block font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-lg ${
             score !== null ? 'bg-brand-700 hover:bg-brand-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

    </div>
  );
};