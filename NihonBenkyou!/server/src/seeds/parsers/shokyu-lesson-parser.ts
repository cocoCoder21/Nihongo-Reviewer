import { readFileSync } from 'fs';

export interface ParsedVocab {
  word: string;
  reading: string;
  meaning: string;
  sortOrder: number;
  category: string;
}

export interface ParsedGrammar {
  pattern: string;
  meaning: string;
  formation: string;
  rule: string;
  examples: { japanese: string; english: string }[];
  sortOrder: number;
}

export interface ParsedShokyuLesson {
  lessonNumber: number;
  title: string;
  vocabulary: ParsedVocab[];
  grammar: ParsedGrammar[];
}

/**
 * Parse a shokyu lesson markdown file into structured data.
 */
export function parseShokyuLesson(filePath: string): ParsedShokyuLesson {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Extract lesson number and title from first heading
  const titleMatch = lines[0]?.match(/^#\s+Lesson\s+(\d+)\s*[—–-]\s*(.+)/);
  if (!titleMatch) throw new Error(`Could not parse title from ${filePath}`);

  const lessonNumber = parseInt(titleMatch[1], 10);
  const title = titleMatch[2].trim();

  const vocabulary = parseVocabTables(lines);
  const grammar = parseGrammarSections(lines);

  return { lessonNumber, title, vocabulary, grammar };
}

/**
 * Parse all vocabulary tables from lines, including sub-section tables (e.g. "Countries").
 */
function parseVocabTables(lines: string[]): ParsedVocab[] {
  const vocab: ParsedVocab[] = [];
  let inVocabSection = false;
  let currentCategory = '';
  let sortOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect main Vocabulary section
    if (/^##\s+Vocabulary/i.test(line)) {
      inVocabSection = true;
      currentCategory = '';
      continue;
    }

    // Detect Grammar section — stop parsing vocab
    if (/^##\s+Grammar/i.test(line)) {
      inVocabSection = false;
      continue;
    }

    if (!inVocabSection) continue;

    // Sub-section headings like "### Countries"
    if (/^###\s+(.+)/.test(line)) {
      const match = line.match(/^###\s+(.+)/);
      if (match) currentCategory = match[1].trim();
      continue;
    }

    // Parse table rows: | # | Word | Reading | Meaning | or | Word | Reading | Meaning |
    if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('word')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);

      if (cells.length >= 3) {
        // Determine if first cell is a number (numbered table) or the word itself
        const firstIsNumber = /^\d+$/.test(cells[0]);
        const word = firstIsNumber ? cells[1] : cells[0];
        const reading = firstIsNumber ? cells[2] : cells[1];
        const meaning = firstIsNumber ? cells[3] : cells[2];

        if (word && reading && meaning) {
          vocab.push({
            word,
            reading,
            meaning,
            sortOrder: sortOrder++,
            category: currentCategory,
          });
        }
      }
    }
  }

  return vocab;
}

/**
 * Parse grammar sections from lesson markdown.
 */
function parseGrammarSections(lines: string[]): ParsedGrammar[] {
  const grammar: ParsedGrammar[] = [];
  let inGrammarSection = false;
  let currentGrammar: Partial<ParsedGrammar> | null = null;
  let sortOrder = 0;
  let collectingExamples = false;
  let collectingRule = false;
  let ruleLines: string[] = [];

  const flushCurrent = () => {
    if (currentGrammar?.pattern) {
      grammar.push({
        pattern: currentGrammar.pattern || '',
        meaning: currentGrammar.meaning || '',
        formation: currentGrammar.formation || '',
        rule: (currentGrammar.rule || ruleLines.join('\n')).trim(),
        examples: currentGrammar.examples || [],
        sortOrder: sortOrder++,
      });
    }
    currentGrammar = null;
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

    // Stop at Mini Quiz or Answers section
    if (/^##\s+(Mini Quiz|Answers|Practice)/i.test(line)) {
      flushCurrent();
      inGrammarSection = false;
      continue;
    }

    if (!inGrammarSection) continue;

    // New grammar point: ### N. Pattern
    const gpMatch = line.match(/^###\s+\d+\.\s+(.+)/);
    if (gpMatch) {
      flushCurrent();
      currentGrammar = {
        pattern: gpMatch[1].trim(),
        meaning: '',
        formation: '',
        rule: '',
        examples: [],
      };
      collectingRule = true;
      continue;
    }

    if (!currentGrammar) continue;

    // Meaning line (blockquote)
    if (line.startsWith('>')) {
      const meaning = line.replace(/^>\s*/, '').replace(/\*\*/g, '').replace(/"/g, '').trim();
      if (meaning && !currentGrammar.meaning) {
        currentGrammar.meaning = meaning;
      }
      continue;
    }

    // Formation line
    if (line.toLowerCase().startsWith('**formation:**') || line.toLowerCase().startsWith('formation:')) {
      currentGrammar.formation = line.replace(/\*\*/g, '').replace(/^formation:\s*/i, '').trim();
      collectingRule = false;
      continue;
    }

    // Examples header
    if (/^\*\*Examples?:?\*\*/i.test(line) || /^Examples?:/i.test(line)) {
      collectingExamples = true;
      collectingRule = false;
      continue;
    }

    // Answering header (treat as more examples)
    if (/^\*\*Answering:?\*\*/i.test(line)) {
      collectingExamples = true;
      collectingRule = false;
      continue;
    }

    // Example bullets
    if (collectingExamples && line.startsWith('-')) {
      const exLine = line.replace(/^-\s*/, '').trim();
      // Pattern: Japanese — English
      const dashMatch = exLine.match(/^(.+?)\s*[—–-]{1,2}\s*(.+)$/);
      if (dashMatch) {
        currentGrammar.examples!.push({
          japanese: dashMatch[1].replace(/\*\*/g, '').trim(),
          english: dashMatch[2].replace(/\*\*/g, '').trim(),
        });
      }
      continue;
    }

    // Section divider resets example collection
    if (line === '---') {
      collectingExamples = false;
      collectingRule = false;
      continue;
    }

    // Collect rule text
    if (collectingRule && line && !line.startsWith('|')) {
      const cleanLine = line.replace(/\*\*/g, '').trim();
      if (cleanLine) ruleLines.push(cleanLine);
    }
  }

  flushCurrent();
  return grammar;
}
