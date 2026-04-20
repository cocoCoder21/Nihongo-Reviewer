import { readFileSync } from 'fs';
import type { RadicalPosition } from '@prisma/client';

export interface ParsedRadical {
  character: string;
  name: string;
  meaning: string;
  position: RadicalPosition;
  commonKanji: string[];
  semanticCategory: string;
  sortOrder: number;
}

const POSITION_MAP: Record<string, RadicalPosition> = {
  left: 'HEN',
  'left / various': 'HEN',
  'left / bottom': 'HEN',
  'left / top': 'HEN',
  right: 'TSUKURI',
  'right / various': 'TSUKURI',
  top: 'KANMURI',
  'top / various': 'KANMURI',
  bottom: 'ASHI',
  'bottom / left': 'ASHI',
  'top-left hanging': 'TARE',
  'bottom-left wrap': 'NYOU',
  enclosure: 'KAMAE',
  'full enclosure': 'KAMAE',
  'top-right wrap': 'KAMAE',
  'left-open enclosure': 'KAMAE',
  'top enclosure': 'KAMAE',
  'bottom enclosure': 'KAMAE',
  various: 'HEN',
  '—': 'HEN',
};

/**
 * Parse the radicals.md file into structured data.
 */
export function parseRadicalsFile(filePath: string): ParsedRadical[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const radicals: ParsedRadical[] = [];
  let currentCategory = '';
  let sortOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Section headings like "## 1. Nature & Elements"
    const sectionMatch = line.match(/^##\s+\d+\.\s+(.+)/);
    if (sectionMatch) {
      currentCategory = sectionMatch[1].trim();
      continue;
    }

    // Table rows: | # | Radical | Name | Meaning | Position | Common Kanji |
    if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('radical')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 6 && /^\d+$/.test(cells[0])) {
        const rawChar = cells[1];
        const name = cells[2];
        const meaning = cells[3];
        const positionStr = cells[4].toLowerCase().trim();
        const commonKanjiStr = cells[5];

        // Take the first character from the radical column (may have alternates like "水 / 氵")
        const character = rawChar.split('/')[0].trim().charAt(0);
        if (!character) continue;

        const commonKanji = commonKanjiStr
          .split('、')
          .map(k => k.trim())
          .filter(Boolean);

        const position = POSITION_MAP[positionStr] || 'HEN';

        radicals.push({
          character,
          name,
          meaning,
          position,
          commonKanji,
          semanticCategory: currentCategory,
          sortOrder: sortOrder++,
        });
      }
    }
  }

  return radicals;
}
