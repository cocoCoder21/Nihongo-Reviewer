import { readFileSync } from 'fs';
import { extractParticles } from './shokyu-lesson-parser.js';

export interface ParsedChukyuVocab {
  word: string;
  reading: string;
  meaning: string;
  category: string;
  sortOrder: number;
  usefulExpressions: { expression: string; meaning: string }[];
}

export interface ParsedChukyuGrammar {
  pattern: string;
  meaning: string;
  formation: string;
  rule: string;
  examples: { japanese: string; english: string }[];
  crossReference: string;
  particles: string[];
  sortOrder: number;
}

export interface ParsedChukyuLesson {
  lessonNumber: number;
  title: string;
  vocabulary: ParsedChukyuVocab[];
  grammar: ParsedChukyuGrammar[];
}

/**
 * Parse a chukyu lesson markdown file into structured data.
 */
export function parseChukyuLesson(filePath: string): ParsedChukyuLesson {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Extract lesson number and title
  const titleMatch = lines[0]?.match(/^#\s+Lesson\s+(\d+)\s*[—–-]\s*(.+)/);
  if (!titleMatch) throw new Error(`Could not parse title from ${filePath}`);

  const lessonNumber = parseInt(titleMatch[1], 10);
  const title = titleMatch[2].trim();

  const vocabulary = parseChukyuVocab(lines);
  const grammar = parseChukyuGrammar(lines);

  return { lessonNumber, title, vocabulary, grammar };
}

function parseChukyuVocab(lines: string[]): ParsedChukyuVocab[] {
  const vocab: ParsedChukyuVocab[] = [];
  let inVocabSection = false;
  let inUsefulExpressions = false;
  let sortOrder = 0;
  const usefulExpressions: { expression: string; meaning: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (/^##\s+Vocabulary/i.test(line)) {
      inVocabSection = true;
      inUsefulExpressions = false;
      continue;
    }

    if (/^##\s+Grammar/i.test(line)) {
      inVocabSection = false;
      break;
    }

    if (!inVocabSection) continue;

    // Detect "Useful Expressions" section
    if (/\*\*Useful Expressions:?\*\*/i.test(line) || /^###?\s*Useful Expressions/i.test(line)) {
      inUsefulExpressions = true;
      continue;
    }

    // Parse useful expressions table
    if (inUsefulExpressions && line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('expression')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        usefulExpressions.push({
          expression: cells[0],
          meaning: cells[1],
        });
      }
      continue;
    }

    // Regular vocab table rows
    if (!inUsefulExpressions && line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('word')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        const firstIsNumber = /^\d+$/.test(cells[0]);
        const word = firstIsNumber ? cells[1] : cells[0];
        const reading = firstIsNumber ? cells[2] : cells[1];
        const meaning = firstIsNumber ? cells[3] : cells[2];

        if (word && reading && meaning) {
          vocab.push({
            word,
            reading,
            meaning,
            category: '',
            sortOrder: sortOrder++,
            usefulExpressions: [],
          });
        }
      }
    }
  }

  // Attach useful expressions to all vocab items of this lesson
  if (usefulExpressions.length > 0 && vocab.length > 0) {
    vocab[0].usefulExpressions = usefulExpressions;
  }

  return vocab;
}

function parseChukyuGrammar(lines: string[]): ParsedChukyuGrammar[] {
  const grammar: ParsedChukyuGrammar[] = [];
  let inGrammarSection = false;
  let current: Partial<ParsedChukyuGrammar> | null = null;
  let sortOrder = 0;
  let collectingExamples = false;
  let collectingRule = false;
  let ruleLines: string[] = [];

  const flush = () => {
    if (current?.pattern) {
      const pat = current.pattern || '';
      grammar.push({
        pattern: pat,
        meaning: current.meaning || '',
        formation: current.formation || '',
        rule: (current.rule || ruleLines.join('\n')).trim(),
        examples: current.examples || [],
        crossReference: current.crossReference || '',
        particles: extractParticles(pat),
        sortOrder: sortOrder++,
      });
    }
    current = null;
    ruleLines = [];
    collectingExamples = false;
    collectingRule = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (/^##\s+Grammar/i.test(line)) {
      inGrammarSection = true;
      continue;
    }

    if (/^##\s+(Mini Quiz|Answers|Practice)/i.test(line)) {
      flush();
      inGrammarSection = false;
      continue;
    }

    if (!inGrammarSection) continue;

    // New grammar point
    const gpMatch = line.match(/^###\s+\d+\.\s+(.+)/);
    if (gpMatch) {
      flush();
      current = {
        pattern: gpMatch[1].trim(),
        meaning: '',
        formation: '',
        rule: '',
        examples: [],
        crossReference: '',
      };
      collectingRule = true;
      continue;
    }

    if (!current) continue;

    // Meaning (blockquote or after **Meaning:**)
    if (line.startsWith('>')) {
      const meaning = line.replace(/^>\s*/, '').replace(/\*\*/g, '').trim();
      if (meaning && !current.meaning) current.meaning = meaning;
      continue;
    }

    if (/^\*\*Meaning:?\*\*/i.test(line)) {
      const meaning = line.replace(/\*\*Meaning:?\*\*/i, '').trim();
      if (meaning) current.meaning = meaning;
      collectingRule = false;
      continue;
    }

    // Formation
    if (/^\*\*Formation:?\*\*/i.test(line)) {
      current.formation = line.replace(/\*\*Formation:?\*\*/i, '').trim();
      collectingRule = false;
      continue;
    }

    // Cross-reference to shokyu
    if (/review from shokyu/i.test(line) || /shokyu l\d+/i.test(line)) {
      current.crossReference = line.replace(/\*\*/g, '').trim();
      continue;
    }

    // Examples header
    if (/^\*\*Examples?:?\*\*/i.test(line)) {
      collectingExamples = true;
      collectingRule = false;
      continue;
    }

    // Example lines
    if (collectingExamples && line.startsWith('-')) {
      const exLine = line.replace(/^-\s*/, '').replace(/\*\*/g, '').trim();
      const dashMatch = exLine.match(/^(.+?)\s*[—–-]{1,2}\s*(.+)$/);
      if (dashMatch) {
        current.examples!.push({
          japanese: dashMatch[1].trim(),
          english: dashMatch[2].trim(),
        });
      }
      continue;
    }

    if (line === '---') {
      collectingExamples = false;
      collectingRule = false;
      continue;
    }

    if (collectingRule && line && !line.startsWith('|')) {
      const cleanLine = line.replace(/\*\*/g, '').trim();
      if (cleanLine) ruleLines.push(cleanLine);
    }
  }

  flush();
  return grammar;
}
