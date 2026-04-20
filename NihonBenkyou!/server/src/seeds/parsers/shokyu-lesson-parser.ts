import { readFileSync } from 'fs';

export interface ParsedVocab {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  sortOrder: number;
  category: string;
}

export interface ParsedGrammar {
  pattern: string;
  meaning: string;
  formation: string;
  rule: string;
  examples: { japanese: string; english: string }[];
  particles: string[];
  sortOrder: number;
}

// ─── Highlight extraction ─────────────────────────────────────────
// Extracts the KEY grammar elements being taught from a grammar point
// title/pattern. Strips placeholder tokens (N1, V, etc.) and punctuation.
// What remains = the Japanese text that should be highlighted in the UI.
//
// Scaffolding filter: は and です are common sentence scaffolding and
// only survive if they are the ONLY extracted content (i.e., the grammar
// point IS about は/です). Similarly, ます is treated as scaffolding
// unless the card is a conjugation lesson (multiple ます-family forms).

/** Known multi-word grammar compounds that should stay as a single highlight unit.
 *  Sorted by length DESC so longer compounds match first. */
const COMPOUNDS = [
  'そうじゃ ありません',
  'なければ なりません', 'なくても いいです',
  'ては いけません', 'ないで ください',
  'たことが あります',
  'じゃ ありません', 'では ありません',
  'て ください',
];

/** Placeholder tokens that represent variable parts, not grammar being taught. */
const PLACEHOLDERS = [
  'い-adjective', 'な-adjective', 'い-adj', 'な-adj',
  'Plain form', 'plain form', 'Dictionary Form',
  'ます-stem',
  'Transportation', 'Person', 'Place', 'Time', 'Degree',
  'Common', 'Counter', 'Words', 'Summary', 'Table',
  'Complex', 'Noun', 'Modification', 'Family', 'Terms',
  'Humble', 'Polite', 'Sequential', 'actions',
  'Connecting', 'descriptions', 'Describing', 'attributes',
  'Formation', 'Overview', 'Conversion', 'Casual', 'Speech',
  'listing', 'examples', 'Duration',
  'Past', 'tense', 'of', 'adjectives',
  'Directions', 'Pattern', 'Using', 'Giving',
  'Conditional', 'Concessive', 'Emphasizing',
  'N1', 'N2', 'N3', 'V1', 'V2', 'V3',
  'Adj', 'Na', 'Adv',
  'number',
];

/** Basic sentence scaffolding — removed when stronger content exists. */
const BASIC_SCAFFOLD = new Set(['は', 'です']);

/** Verb conjugation family — if 2+ appear, it's a conjugation lesson (keep all). */
const VERB_FAMILY = ['ます', 'ません', 'ました', 'ませんでした', 'ましょう', 'ませんか'];

/** Regex matching at least one CJK / hiragana / katakana character. */
const HAS_JAPANESE = /[\u3000-\u9FFF\uF900-\uFAFF]/;

export function extractHighlights(pattern: string): string[] {
  let text = pattern;

  // 1. Remove English descriptions in parentheses
  text = text.replace(/\([^)]*\)/g, '');
  text = text.replace(/（[^）]*）/g, '');

  // 2. Replace tilde placeholders (～ marks variable slots like ～時, ～さい)
  text = text.replace(/[～~]/g, '§');

  // 3. Replace named/numbered placeholders with § delimiter
  for (const ph of PLACEHOLDERS) {
    text = text.split(ph).join('§');
  }
  // Standalone single-letter placeholders: N, V, A
  text = text.replace(/(?<=^|[\s\u3000§／/,、])([NVA])(?=$|[\s\u3000§／/,、])/g, '§');

  // 4. Replace alternative separators ／ / with §
  text = text.replace(/[／/]/g, '§');

  // 5. Remove "-form" suffix (e.g. ない-form → ない)
  text = text.replace(/-form/gi, '');

  // 6. Remove punctuation and symbols
  text = text.replace(/[。、…・＋+＝=「」『』【】《》〈〉→←↔？！?!,.;:\-─—–#*_>`"'&]/g, ' ');

  // 7. Split on § to get phrase-level chunks
  const chunks = text.split('§').map(c => c.trim()).filter(c => c.length > 0);

  // 8. For each chunk: extract known compounds, then split remainder on spaces
  const tokens: string[] = [];
  for (const chunk of chunks) {
    let remaining = chunk;
    for (const compound of COMPOUNDS) {
      if (remaining.includes(compound)) {
        tokens.push(compound);
        remaining = remaining.replace(compound, '').trim();
      }
    }
    if (remaining.length > 0) {
      tokens.push(...remaining.split(/[\s\u3000]+/).filter(w => w.length > 0));
    }
  }

  // 9. Keep only tokens containing Japanese characters
  const japanese = tokens.filter(t => HAS_JAPANESE.test(t));

  // 10. Deduplicate while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const t of japanese) {
    if (!seen.has(t)) {
      seen.add(t);
      unique.push(t);
    }
  }

  // 11. Scaffolding filter
  const verbFamilyCount = unique.filter(t => VERB_FAMILY.includes(t)).length;
  const isConjugationLesson = verbFamilyCount >= 2;

  const scaffold = new Set(BASIC_SCAFFOLD);
  if (!isConjugationLesson) {
    scaffold.add('ます');
  }

  const nonScaffold = unique.filter(t => !scaffold.has(t));
  return nonScaffold.length > 0 ? nonScaffold : unique;
}

// Backward-compatible alias
export const extractParticles = extractHighlights;

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
        const example = firstIsNumber ? (cells[4] || '') : (cells[3] || '');
        const exampleMeaning = firstIsNumber ? (cells[5] || '') : (cells[4] || '');

        if (word && reading && meaning) {
          vocab.push({
            word,
            reading,
            meaning,
            example,
            exampleMeaning,
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
      const pat = currentGrammar.pattern || '';
      grammar.push({
        pattern: pat,
        meaning: currentGrammar.meaning || '',
        formation: currentGrammar.formation || '',
        rule: (currentGrammar.rule || ruleLines.join('\n')).trim(),
        examples: currentGrammar.examples || [],
        particles: extractParticles(pat),
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
