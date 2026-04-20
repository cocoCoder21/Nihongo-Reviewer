import { readFileSync } from 'fs';

export interface ParsedKanjiVocab {
  word: string;
  reading: string;
  meaning: string;
}

export interface ParsedKanji {
  character: string;
  onyomi: string;
  kunyomi: string;
  meanings: string;
  mnemonic: string;
  radicalName: string;
  category: string;
  vocabulary: ParsedKanjiVocab[];
  examples: { japanese: string; english: string }[];
}

/**
 * Parse a kanji markdown file (e.g. kanji_n5.md) into structured data.
 */
export function parseKanjiFile(filePath: string): ParsedKanji[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const kanjiList: ParsedKanji[] = [];
  let current: Partial<ParsedKanji> | null = null;
  let collectingVocab = false;
  let currentCategory = '';

  const flush = () => {
    if (current?.character) {
      kanjiList.push({
        character: current.character,
        onyomi: current.onyomi || '',
        kunyomi: current.kunyomi || '',
        meanings: current.meanings || '',
        mnemonic: current.mnemonic || '',
        radicalName: current.radicalName || '',
        category: current.category || '',
        vocabulary: current.vocabulary || [],
        examples: current.examples || [],
      });
    }
    current = null;
    collectingVocab = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Section heading: ## Section N: Category Name — Japanese (...)
    // e.g. "## Section 1: Numbers — 数字（すうじ）"
    const sectionMatch = line.match(/^##\s+Section\s+\d+:\s*(.+?)(?:\s*[—–-]\s*.+)?$/);
    if (sectionMatch) {
      currentCategory = sectionMatch[1].trim();
      continue;
    }

    // Kanji heading: ### 漢字 — Meaning
    const kanjiMatch = line.match(/^###\s+(\S)\s*[—–-]\s*(.+)/);
    if (kanjiMatch && kanjiMatch[1].length === 1) {
      flush();
      current = {
        character: kanjiMatch[1],
        meanings: kanjiMatch[2].trim(),
        category: currentCategory,
        onyomi: '',
        kunyomi: '',
        mnemonic: '',
        radicalName: '',
        vocabulary: [],
        examples: [],
      };
      collectingVocab = false;
      continue;
    }

    if (!current) continue;

    // Onyomi line
    if (line.startsWith('- **Onyomi:**')) {
      const parts = line.replace('- **Onyomi:**', '').trim();
      // May contain both onyomi and kunyomi separated by |
      const onyomiPart = parts.split('|')[0]?.replace(/\*\*Kunyomi:\*\*/i, '').trim();
      current.onyomi = onyomiPart || '';

      const kunyomiMatch = parts.match(/\*\*Kunyomi:\*\*\s*(.+)/);
      if (kunyomiMatch) {
        current.kunyomi = kunyomiMatch[1].trim();
      }
      continue;
    }

    // Standalone Kunyomi line (rare but possible)
    if (line.startsWith('- **Kunyomi:**')) {
      current.kunyomi = line.replace('- **Kunyomi:**', '').trim();
      continue;
    }

    // Radical line
    if (line.startsWith('- **Radical:**')) {
      current.radicalName = line.replace('- **Radical:**', '').trim();
      continue;
    }

    // Vocabulary section header
    if (line.startsWith('- **Vocabulary:**')) {
      collectingVocab = true;
      continue;
    }

    // Vocabulary items (indented list)
    if (collectingVocab && line.startsWith('-')) {
      // e.g. "  - 一つ（ひとつ）— one (thing)"
      const vocabMatch = line.replace(/^-\s*/, '').match(/^(.+?)（(.+?)）\s*[—–-]\s*(.+)$/);
      if (vocabMatch) {
        current.vocabulary!.push({
          word: vocabMatch[1].trim(),
          reading: vocabMatch[2].trim(),
          meaning: vocabMatch[3].trim(),
        });
        continue;
      }
      // If doesn't match vocab pattern, stop collecting vocab
      collectingVocab = false;
    }

    // Example sentence
    if (line.startsWith('- **Example:**')) {
      const exText = line.replace('- **Example:**', '').trim();
      const exMatch = exText.match(/^(.+?)\s*[—–-]{1,2}\s*(.+)$/);
      if (exMatch) {
        current.examples!.push({
          japanese: exMatch[1].trim(),
          english: exMatch[2].trim(),
        });
      }
      continue;
    }

    // Mnemonic
    if (line.startsWith('- **Mnemonic:**')) {
      current.mnemonic = line.replace('- **Mnemonic:**', '').trim();
      continue;
    }
  }

  flush();
  return kanjiList;
}
