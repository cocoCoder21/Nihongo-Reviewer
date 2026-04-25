/**
 * setup-audio-volume.mjs
 *
 * One-time script to populate the Railway Volume with organized audio files.
 * Downloads the official free MP3 ZIPs from 3A Corporation, extracts them,
 * and renames/moves each file to match the DB paths:
 *   Audio/shokyu/shokyu_1/lesson_01/track_1.mp3
 *
 * Usage (inside Railway shell or via `railway run`):
 *   node scripts/setup-audio-volume.mjs
 *
 * Env vars:
 *   AUDIO_BASE_PATH  — volume mount path (default: /audio)
 *   SKIP_EXISTING    — set to "true" to skip books that already have files
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const AUDIO_BASE = process.env.AUDIO_BASE_PATH ?? '/audio';

// 3A Corporation free download URLs (no login required)
const BOOKS = [
  {
    name: 'shokyu_1',
    zipUrl: 'https://www.3anet.co.jp/np/en/secure/0-0001-01-230020/0-0001-01-230020-0.zip',
    outputFolder: 'Audio/shokyu/shokyu_1',
    // Number of tracks per lesson (lessons 01–25)
    tracksPerLesson: [4, 4, 3, 5, 4, 3, 4, 4, 3, 4, 4, 3, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 3],
    lessonStart: 1,
  },
  {
    name: 'shokyu_2',
    zipUrl: 'https://www.3anet.co.jp/np/en/secure/0-0001-01-240020/0-0001-01-240020-0.zip',
    outputFolder: 'Audio/shokyu/shokyu_2',
    // All 25 lessons (26–50) have 3 tracks each
    tracksPerLesson: Array(25).fill(3),
    lessonStart: 26,
  },
  {
    name: 'chukyu_1',
    zipUrl: 'https://www.3anet.co.jp/np/en/secure/0-0001-01-280020/0-0001-01-280020-0.zip',
    outputFolder: 'Audio/chukyu/chukyu_1',
    tracksPerLesson: [3, 4, 3, 3, 4, 3, 3, 3, 3, 4, 4, 4],
    lessonStart: 1,
  },
  {
    name: 'chukyu_2',
    zipUrl: 'https://www.3anet.co.jp/np/en/secure/0-0001-01-290020/0-0001-01-290020-0.zip',
    outputFolder: 'Audio/chukyu/chukyu_2',
    tracksPerLesson: [2, 2, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2],
    lessonStart: 13,
  },
];

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

async function processBook(book) {
  const outRoot = path.join(AUDIO_BASE, book.outputFolder);

  if (process.env.SKIP_EXISTING === 'true' && fs.existsSync(outRoot)) {
    const existing = fs.readdirSync(outRoot);
    if (existing.length > 0) {
      console.log(`[SKIP] ${book.name} already has files in ${outRoot}`);
      return;
    }
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `audio-${book.name}-`));
  const zipPath = path.join(tmpDir, 'audio.zip');
  const extractDir = path.join(tmpDir, 'extracted');

  console.log(`\n━━━ ${book.name} ━━━`);
  console.log(`  Downloading ${book.zipUrl} …`);

  try {
    // Download
    run(`curl -fL --retry 3 -o "${zipPath}" "${book.zipUrl}"`);

    // Extract
    fs.mkdirSync(extractDir, { recursive: true });
    run(`unzip -q "${zipPath}" -d "${extractDir}"`);

    // Collect all MP3s, sorted by filename (natural sort = track order)
    const allMp3s = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir).sort()) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (entry.toLowerCase().endsWith('.mp3')) {
          allMp3s.push(full);
        }
      }
    }
    walk(extractDir);

    const totalExpected = book.tracksPerLesson.reduce((a, b) => a + b, 0);
    console.log(`  Extracted ${allMp3s.length} MP3s (expected ${totalExpected})`);

    if (allMp3s.length !== totalExpected) {
      console.warn(`  ⚠ Count mismatch! Extracted: ${allMp3s.length}, expected: ${totalExpected}`);
      console.warn('  Listing extracted files for inspection:');
      allMp3s.forEach((f, i) => console.warn(`    [${i + 1}] ${path.basename(f)}`));
      console.warn('  Continuing anyway — check the output carefully.');
    }

    // Distribute tracks into lesson folders
    let trackIdx = 0;
    for (let lessonOffset = 0; lessonOffset < book.tracksPerLesson.length; lessonOffset++) {
      const lessonNum = book.lessonStart + lessonOffset;
      const lessonPadded = String(lessonNum).padStart(2, '0');
      const lessonDir = path.join(outRoot, `lesson_${lessonPadded}`);
      fs.mkdirSync(lessonDir, { recursive: true });

      const count = book.tracksPerLesson[lessonOffset];
      for (let t = 1; t <= count; t++) {
        if (trackIdx >= allMp3s.length) {
          console.error(`  ERROR: ran out of MP3s at lesson ${lessonNum} track ${t}`);
          break;
        }
        const src = allMp3s[trackIdx++];
        const dest = path.join(lessonDir, `track_${t}.mp3`);
        fs.copyFileSync(src, dest);
      }
      console.log(`  lesson_${lessonPadded}: ${count} tracks → ${lessonDir}`);
    }

    console.log(`  ✓ ${book.name} done`);
  } finally {
    // Clean up temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log(`Audio volume setup — target: ${AUDIO_BASE}`);
console.log('Checking for curl and unzip…');
try {
  runCapture('curl --version');
  runCapture('unzip -v');
} catch {
  console.error('curl or unzip not found. This script must run inside the Railway container (or Linux).');
  process.exit(1);
}

for (const book of BOOKS) {
  await processBook(book);
}

console.log('\n✓ All books processed. Verify with:');
console.log(`  find ${AUDIO_BASE}/Audio -name "*.mp3" | wc -l`);
console.log('  (expected: 230 total MP3 files)');
