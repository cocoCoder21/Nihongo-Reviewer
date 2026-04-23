import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, Volume2, Loader2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { contentService } from '../services/content.service';
import type { AudioTrack } from '../types';

// Map JLPT level to book + lesson range
const LEVEL_BOOK_MAP: Record<string, { bookId: string; startLesson: number; endLesson: number; bookTitle: string }> = {
  N5: { bookId: 'shokyu_1', startLesson: 1, endLesson: 25, bookTitle: 'Minna no Nihongo Shokyu I' },
  N4: { bookId: 'shokyu_2', startLesson: 26, endLesson: 50, bookTitle: 'Minna no Nihongo Shokyu II' },
  N3: { bookId: 'chukyu_1', startLesson: 1, endLesson: 12, bookTitle: 'Minna no Nihongo Chukyu I' },
  N2: { bookId: 'chukyu_2', startLesson: 13, endLesson: 24, bookTitle: 'Minna no Nihongo Chukyu II' },
  N1: { bookId: 'chukyu_2', startLesson: 13, endLesson: 24, bookTitle: 'Minna no Nihongo Chukyu II' },
};

// Track section labels based on typical Minna no Nihongo audio structure
const TRACK_SECTION_LABELS: Record<string, string[]> = {
  '4': ['ぶんけい・れいぶん', 'かいわ', 'れんしゅうC', 'もんだい'],
  '3': ['かいわ', 'れんしゅうC', 'もんだい'],
  '5': ['ぶんけい', 'れいぶん', 'かいわ', 'れんしゅうC', 'もんだい'],
};

function getTrackLabel(track: AudioTrack, totalTracks: number): string {
  if (track.sectionLabel) return track.sectionLabel;
  const labels = TRACK_SECTION_LABELS[String(totalTracks)];
  if (labels && track.trackNumber <= labels.length) {
    return labels[track.trackNumber - 1];
  }
  return `Track ${track.trackNumber}`;
}

export const ListeningLesson = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const authUser = useAuthStore((s) => s.user);
  const level = authUser?.currentJlptLevel ?? user.level;

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessonNumber, setLessonNumber] = useState(0);
  const [showLessonPicker, setShowLessonPicker] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const bookConfig = LEVEL_BOOK_MAP[level] ?? LEVEL_BOOK_MAP['N5'];

  const lessonNumbers = Array.from(
    { length: bookConfig.endLesson - bookConfig.startLesson + 1 },
    (_, i) => bookConfig.startLesson + i,
  );

  const loadLesson = useCallback(async (lesson: number) => {
    setLessonNumber(lesson);
    setLoading(true);
    setError('');
    setPlayingTrackId(null);
    if (audioRef.current) audioRef.current.pause();
    try {
      const data = await contentService.getAudioTracksByBook(bookConfig.bookId, lesson);
      if (data.length === 0) {
        setError('No audio tracks found for this lesson.');
      }
      setTracks(data);
    } catch {
      setError('Could not load audio tracks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [bookConfig.bookId]);

  useEffect(() => {
    loadLesson(bookConfig.startLesson);
  }, [level]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowLessonPicker(false);
      }
    };
    if (showLessonPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLessonPicker]);

  const playTrack = (track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingTrackId === track.id) {
      audio.pause();
      setPlayingTrackId(null);
      return;
    }

    const url = contentService.getAudioStreamUrl(bookConfig.bookId, track.lessonNumber, track.trackNumber);
    audio.src = url;
    audio.load();
    audio.play()
      .then(() => setPlayingTrackId(track.id))
      .catch(() => setPlayingTrackId(null));
  };

  const goToPrevLesson = () => {
    if (lessonNumber > bookConfig.startLesson) loadLesson(lessonNumber - 1);
  };
  const goToNextLesson = () => {
    if (lessonNumber < bookConfig.endLesson) loadLesson(lessonNumber + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading audio tracks...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">

      <audio
        ref={audioRef}
        onEnded={() => setPlayingTrackId(null)}
        onError={() => setPlayingTrackId(null)}
      />

      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button onClick={() => navigate('/learn')} title="Back to Learn" className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Listening Practice</h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">

        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            title="Previous lesson"
            disabled={lessonNumber <= bookConfig.startLesson}
            onClick={goToPrevLesson}
            className="p-2 rounded-full bg-white border border-brand-200/50 text-slate-500 hover:text-brand-700 hover:border-brand-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div ref={pickerRef} className="relative">
            <button
              onClick={() => setShowLessonPicker((v) => !v)}
              className="flex items-center gap-1.5 bg-white border border-brand-200/50 rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 hover:border-brand-300 transition-colors shadow-sm"
            >
              <span>Lesson {lessonNumber}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLessonPicker ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showLessonPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-brand-200 rounded-2xl shadow-lg z-30 max-h-60 overflow-y-auto w-36"
                >
                  {lessonNumbers.map((ln) => (
                    <button
                      key={ln}
                      onClick={() => { loadLesson(ln); setShowLessonPicker(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                        ln === lessonNumber
                          ? 'bg-brand-100 text-brand-800 font-bold'
                          : 'text-slate-600 hover:bg-brand-50'
                      }`}
                    >
                      Lesson {ln}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            title="Next lesson"
            disabled={lessonNumber >= bookConfig.endLesson}
            onClick={goToNextLesson}
            className="p-2 rounded-full bg-white border border-brand-200/50 text-slate-500 hover:text-brand-700 hover:border-brand-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {bookConfig.bookTitle} — Lesson {lessonNumber}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Play each track and follow along in your textbook. Use the もんだい section in the book for comprehension exercises.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <AlertCircle className="w-10 h-10 text-amber-500" />
            <p className="text-slate-600 font-semibold text-center">{error}</p>
            <button onClick={() => navigate('/learn')} className="mt-4 px-6 py-3 bg-brand-700 text-white rounded-2xl font-bold hover:bg-brand-800 transition-colors">
              Back to Learn
            </button>
          </div>
        )}

        {!error && (
          <div className="space-y-3">
            {tracks.map((track) => {
              const isPlaying = playingTrackId === track.id;
              const label = getTrackLabel(track, tracks.length);

              return (
                <motion.button
                  key={track.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => playTrack(track)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all shadow-sm text-left ${
                    isPlaying
                      ? 'bg-emerald-50 border-emerald-300 shadow-emerald-100'
                      : 'bg-white border-brand-200/50 hover:border-brand-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isPlaying ? 'bg-emerald-500 text-white' : 'bg-brand-100 text-brand-700'
                  }`}>
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        CD{String(track.trackNumber).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-bold text-slate-800 truncate">{label}</span>
                    </div>
                    {track.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{track.description}</p>
                    )}
                  </div>

                  <Volume2 className={`w-4 h-4 shrink-0 ${isPlaying ? 'text-emerald-500' : 'text-slate-300'}`} />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
