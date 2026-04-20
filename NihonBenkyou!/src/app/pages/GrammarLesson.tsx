import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { contentService } from '../services/content.service';
import { levelContent } from '../data/levels';
import { FamiliarityButton } from '../components/FamiliarityButton';
import { cn } from '../components/ui/utils';
import type { GrammarItem, JLPTLevel } from '../types';

// ─── Level color map ──────────────────────────────────────────────
const levelColors: Record<JLPTLevel, { badge: string; bg: string; text: string; border: string; particleBg: string; particleText: string }> = {
  N5: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', particleBg: 'bg-emerald-200', particleText: 'text-emerald-900' },
  N4: { badge: 'bg-sky-100 text-sky-700 border-sky-200', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', particleBg: 'bg-sky-200', particleText: 'text-sky-900' },
  N3: { badge: 'bg-violet-100 text-violet-700 border-violet-200', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', particleBg: 'bg-violet-200', particleText: 'text-violet-900' },
  N2: { badge: 'bg-amber-100 text-amber-700 border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', particleBg: 'bg-[#FFD400]/30', particleText: 'text-amber-900' },
  N1: { badge: 'bg-rose-100 text-rose-700 border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', particleBg: 'bg-[#FFD400]/30', particleText: 'text-amber-900' },
};

// ─── Highlight particles in text with level-specific colors ───────
function highlightParticles(text: string, particles: string[], colors: { particleBg: string; particleText: string }): React.ReactNode {
  if (!particles.length || !text) return text;
  // Sort particles by length desc so longer matches are found first
  const sorted = [...particles].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    sorted.includes(part)
      ? <span key={i} className={cn('font-bold px-1 rounded', colors.particleBg, colors.particleText)}>{part}</span>
      : part
  );
}

// ─── Highlight arrows in text ─────────────────────────────────────
function highlightArrow(text: string): React.ReactNode {
  if (!text.includes('→')) return text;
  const parts = text.split(/(→)/g);
  return parts.map((part, i) =>
    part === '→'
      ? <span key={i} className="text-brand-500 font-bold mx-1">→</span>
      : part
  );
}

// ─── Parse rule text into structured blocks ───────────────────────
type RuleBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'arrow'; left: string; right: string }
  | { type: 'bullet'; text: string }
  | { type: 'exception'; text: string };

function parseRule(rule: string): RuleBlock[] {
  if (!rule) return [];
  const lines = rule.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: RuleBlock[] = [];

  for (const line of lines) {
    // Group headings like "Group 1 (五段 — u-verbs):" or "Group 2 (一段 — ru-verbs):"
    if (/^Group\s+\d/i.test(line) || /^(Irregular|Exception)/i.test(line)) {
      blocks.push({ type: 'heading', text: line.replace(/:$/, '') });
    }
    // Arrow patterns like "食べます → 食べて" 
    else if (line.includes('→')) {
      const arrowParts = line.replace(/^[-•*]\s*/, '').split('→').map(s => s.trim());
      if (arrowParts.length === 2 && arrowParts[0] && arrowParts[1]) {
        blocks.push({ type: 'arrow', left: arrowParts[0], right: arrowParts[1] });
      } else {
        blocks.push({ type: 'text', text: line });
      }
    }
    // Exception lines
    else if (/^exception/i.test(line)) {
      blocks.push({ type: 'exception', text: line.replace(/^exception:\s*/i, '') });
    }
    // Bullet points
    else if (/^[-•*]\s+/.test(line)) {
      blocks.push({ type: 'bullet', text: line.replace(/^[-•*]\s+/, '') });
    }
    // Regular text
    else {
      blocks.push({ type: 'text', text: line });
    }
  }

  return blocks;
}

// ─── Render parsed rule blocks ────────────────────────────────────
function RuleDisplay({ rule, particles, pColors }: { rule: string; particles: string[]; pColors: { particleBg: string; particleText: string } }) {
  const blocks = useMemo(() => parseRule(rule), [rule]);

  if (blocks.length === 0) return null;

  const hl = (text: string) => highlightParticles(text, particles, pColors);

  // If it's a simple one-liner, render inline
  if (blocks.length === 1 && blocks[0].type === 'text') {
    return (
      <p className="text-slate-600 font-medium leading-relaxed">
        {hl(blocks[0].text)}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 mt-2 first:mt-0">
                <h4 className="text-sm font-bold text-blue-800 tracking-wide">
                  {block.text}
                </h4>
              </div>
            );
          case 'arrow':
            return (
              <div key={i} className="flex items-center gap-3 pl-4">
                <span className="text-slate-700 font-semibold">{hl(block.left)}</span>
                <span className="text-brand-500 font-bold text-lg">→</span>
                <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-lg text-sm">
                  {hl(block.right)}
                </span>
              </div>
            );
          case 'bullet':
            return (
              <div key={i} className="flex items-start gap-2 pl-4">
                <span className="text-brand-500 mt-1.5 text-xs">●</span>
                <span className="text-slate-600 font-medium leading-relaxed">
                  {block.text.includes('→') ? highlightArrow(block.text) : hl(block.text)}
                </span>
              </div>
            );
          case 'exception':
            return (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-start gap-2">
                <span className="text-amber-500 font-bold text-xs mt-0.5">⚠</span>
                <span className="text-amber-800 font-medium text-sm">
                  {block.text.includes('→') ? highlightArrow(block.text) : hl(block.text)}
                </span>
              </div>
            );
          case 'text':
          default:
            return (
              <p key={i} className="text-slate-600 font-medium leading-relaxed">
                {block.text.includes('→') ? highlightArrow(block.text) : hl(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

// ─── Examples display ─────────────────────────────────────────────
function ExamplesDisplay({ item, particles, pColors }: { item: GrammarItem; particles: string[]; pColors: { particleBg: string; particleText: string } }) {
  const hasExamplesArray = item.examples && item.examples.length > 0;
  const hasConversion = item.example && item.exampleConverted && item.example !== item.exampleConverted;

  if (!hasExamplesArray && !hasConversion) return null;

  const hl = (text: string) => highlightParticles(text, particles, pColors);

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Examples</p>

      {hasConversion && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-lg font-bold text-slate-700">{hl(item.example)}</span>
          <span className="text-brand-500 font-bold text-lg">→</span>
          <span className="bg-blue-100 px-4 py-2 rounded-xl text-blue-800 font-bold text-xl">
            {hl(item.exampleConverted)}
          </span>
          {item.exampleMeaning && (
            <span className="text-slate-400 text-sm w-full text-center">({item.exampleMeaning})</span>
          )}
        </div>
      )}

      {hasExamplesArray && (
        <div className="space-y-3">
          {item.examples.map((ex, i) => (
            <div key={i} className="bg-white rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-slate-800 font-semibold">{hl(ex.japanese)}</p>
              <p className="text-slate-500 text-sm mt-1">{ex.english}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
export const GrammarLesson = () => {
  const navigate = useNavigate();
  const { addXp, completeLesson, user } = useAppStore();
  const [step, setStep] = useState(0);
  const [lessons, setLessons] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = levelColors[user.level] || levelColors.N5;

  useEffect(() => {
    contentService.getGrammar(user.level)
      .then((data) => {
        if (data.length > 0) setLessons(data);
        else setLessons(levelContent[user.level].grammar as unknown as GrammarItem[]);
      })
      .catch(() => {
        setLessons(levelContent[user.level].grammar as unknown as GrammarItem[]);
      })
      .finally(() => setLoading(false));
  }, [user.level]);

  const handleContinue = () => {
    if (step < lessons.length - 1) {
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

  const currentLesson = lessons[step];
  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-slate-500 font-medium">Loading grammar...</p></div>;
  if (!currentLesson) return null;

  const particles = currentLesson.particles ?? [];
  const hasParticles = particles.length > 0;
  const pColors = { particleBg: colors.particleBg, particleText: colors.particleText };

  return (
    <div className="flex flex-col h-full bg-brand-100 max-w-2xl mx-auto md:border-x border-brand-200/50 shadow-sm relative">
      <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 z-20 bg-brand-100/90 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/learn')}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 px-8">
          <div className="h-2.5 w-full bg-brand-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / lessons.length) * 100}%` }}
              className="h-full bg-brand-500 rounded-full"
            />
          </div>
        </div>

        <div className="text-brand-500 font-bold px-3 py-1 rounded-full bg-brand-50 text-sm border border-brand-200">
          {step + 1}/{lessons.length}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg mx-auto py-6"
          >
            {currentLesson.lessonNumber ? (
              <h1 className="text-2xl font-black text-center text-slate-800 mb-3">
                Lesson {currentLesson.lessonNumber} Grammar Points
              </h1>
            ) : null}

            {/* Badge row: level + type */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              <div className={cn('font-bold px-3 py-1.5 rounded-2xl flex items-center space-x-2 border text-xs', colors.badge)}>
                <span className="tracking-wide uppercase">{user.level}</span>
              </div>
              <div className={cn(
                'font-bold px-3 py-1.5 rounded-2xl flex items-center space-x-2 border text-xs',
                hasParticles
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200'
              )}>
                <span className={cn('w-2 h-2 rounded-full', hasParticles ? 'bg-yellow-500' : 'bg-blue-500')} />
                <span className="tracking-wide uppercase">{hasParticles ? 'Particle' : 'Grammar'}</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-800 mb-8">
              {highlightParticles(currentLesson.title, particles, pColors)}
            </h2>

            {/* Rule card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-200/50 mb-6">
              {/* Header row with familiarity button */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  {currentLesson.meaning && (
                    <p className="text-slate-400 text-sm font-semibold italic mb-1">
                      {currentLesson.meaning}
                    </p>
                  )}
                  {currentLesson.formation && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 mb-3">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Formation</p>
                      <p className="text-indigo-800 font-semibold text-sm">{currentLesson.formation}</p>
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <FamiliarityButton contentType="grammar" contentId={String(currentLesson.id)} />
                </div>
              </div>

              {/* Parsed rule content */}
              <RuleDisplay rule={currentLesson.rule} particles={particles} pColors={pColors} />

              {/* Examples section */}
              <div className="mt-5">
                <ExamplesDisplay item={currentLesson} particles={particles} pColors={pColors} />
              </div>
            </div>

            {/* Sentence card */}
            {currentLesson.sentence && currentLesson.sentence !== currentLesson.example && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-200/50">
                <p className="text-xl font-bold text-slate-800 mb-1">
                  {highlightParticles(currentLesson.sentence, particles, pColors)}
                </p>
                {currentLesson.sentenceRomaji && (
                  <p className="text-sm font-medium text-slate-400 mb-2">{currentLesson.sentenceRomaji}</p>
                )}
                {currentLesson.sentenceMeaning && (
                  <p className="text-base text-slate-600">{currentLesson.sentenceMeaning}</p>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-white border-t border-brand-200/50 pb-safe">
        <div className="max-w-lg mx-auto flex space-x-3">
          {step > 0 && (
            <button
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
            <span>{step < lessons.length - 1 ? 'Continue' : 'Complete'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};