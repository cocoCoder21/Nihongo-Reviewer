import { PrismaClient } from '@prisma/client';

/**
 * Seeds the Hiragana and Katakana tables with all standard characters.
 * Idempotent — safe to re-run.
 */
export async function seedKana(prisma: PrismaClient) {
  console.log('[seed] Seeding Kana (Hiragana & Katakana)...');

  // ─── HIRAGANA ────────────────────────────────────────────────
  const hiraganaBasic = [
    // A-row
    { character: 'あ', romaji: 'a', row: 'A', type: 'SEION', strokeCount: 3, sortOrder: 1, exampleWord: 'あさ', exampleReading: 'asa', exampleMeaning: 'morning' },
    { character: 'い', romaji: 'i', row: 'A', type: 'SEION', strokeCount: 2, sortOrder: 2, exampleWord: 'いぬ', exampleReading: 'inu', exampleMeaning: 'dog' },
    { character: 'う', romaji: 'u', row: 'A', type: 'SEION', strokeCount: 2, sortOrder: 3, exampleWord: 'うみ', exampleReading: 'umi', exampleMeaning: 'sea' },
    { character: 'え', romaji: 'e', row: 'A', type: 'SEION', strokeCount: 2, sortOrder: 4, exampleWord: 'えき', exampleReading: 'eki', exampleMeaning: 'station' },
    { character: 'お', romaji: 'o', row: 'A', type: 'SEION', strokeCount: 3, sortOrder: 5, exampleWord: 'おかね', exampleReading: 'okane', exampleMeaning: 'money' },
    // KA-row
    { character: 'か', romaji: 'ka', row: 'KA', type: 'SEION', strokeCount: 3, sortOrder: 6, exampleWord: 'かさ', exampleReading: 'kasa', exampleMeaning: 'umbrella' },
    { character: 'き', romaji: 'ki', row: 'KA', type: 'SEION', strokeCount: 4, sortOrder: 7, exampleWord: 'きって', exampleReading: 'kitte', exampleMeaning: 'stamp' },
    { character: 'く', romaji: 'ku', row: 'KA', type: 'SEION', strokeCount: 1, sortOrder: 8, exampleWord: 'くるま', exampleReading: 'kuruma', exampleMeaning: 'car' },
    { character: 'け', romaji: 'ke', row: 'KA', type: 'SEION', strokeCount: 3, sortOrder: 9, exampleWord: 'けしゴム', exampleReading: 'keshigomu', exampleMeaning: 'eraser' },
    { character: 'こ', romaji: 'ko', row: 'KA', type: 'SEION', strokeCount: 2, sortOrder: 10, exampleWord: 'こども', exampleReading: 'kodomo', exampleMeaning: 'child' },
    // SA-row
    { character: 'さ', romaji: 'sa', row: 'SA', type: 'SEION', strokeCount: 3, sortOrder: 11, exampleWord: 'さかな', exampleReading: 'sakana', exampleMeaning: 'fish' },
    { character: 'し', romaji: 'shi', row: 'SA', type: 'SEION', strokeCount: 1, sortOrder: 12, exampleWord: 'しんぶん', exampleReading: 'shinbun', exampleMeaning: 'newspaper' },
    { character: 'す', romaji: 'su', row: 'SA', type: 'SEION', strokeCount: 2, sortOrder: 13, exampleWord: 'すし', exampleReading: 'sushi', exampleMeaning: 'sushi' },
    { character: 'せ', romaji: 'se', row: 'SA', type: 'SEION', strokeCount: 3, sortOrder: 14, exampleWord: 'せんせい', exampleReading: 'sensei', exampleMeaning: 'teacher' },
    { character: 'そ', romaji: 'so', row: 'SA', type: 'SEION', strokeCount: 1, sortOrder: 15, exampleWord: 'そら', exampleReading: 'sora', exampleMeaning: 'sky' },
    // TA-row
    { character: 'た', romaji: 'ta', row: 'TA', type: 'SEION', strokeCount: 4, sortOrder: 16, exampleWord: 'たまご', exampleReading: 'tamago', exampleMeaning: 'egg' },
    { character: 'ち', romaji: 'chi', row: 'TA', type: 'SEION', strokeCount: 2, sortOrder: 17, exampleWord: 'ちず', exampleReading: 'chizu', exampleMeaning: 'map' },
    { character: 'つ', romaji: 'tsu', row: 'TA', type: 'SEION', strokeCount: 1, sortOrder: 18, exampleWord: 'つくえ', exampleReading: 'tsukue', exampleMeaning: 'desk' },
    { character: 'て', romaji: 'te', row: 'TA', type: 'SEION', strokeCount: 1, sortOrder: 19, exampleWord: 'てがみ', exampleReading: 'tegami', exampleMeaning: 'letter' },
    { character: 'と', romaji: 'to', row: 'TA', type: 'SEION', strokeCount: 2, sortOrder: 20, exampleWord: 'とけい', exampleReading: 'tokei', exampleMeaning: 'clock' },
    // NA-row
    { character: 'な', romaji: 'na', row: 'NA', type: 'SEION', strokeCount: 4, sortOrder: 21, exampleWord: 'なつ', exampleReading: 'natsu', exampleMeaning: 'summer' },
    { character: 'に', romaji: 'ni', row: 'NA', type: 'SEION', strokeCount: 3, sortOrder: 22, exampleWord: 'にほん', exampleReading: 'nihon', exampleMeaning: 'Japan' },
    { character: 'ぬ', romaji: 'nu', row: 'NA', type: 'SEION', strokeCount: 2, sortOrder: 23, exampleWord: 'ぬの', exampleReading: 'nuno', exampleMeaning: 'cloth' },
    { character: 'ね', romaji: 'ne', row: 'NA', type: 'SEION', strokeCount: 2, sortOrder: 24, exampleWord: 'ねこ', exampleReading: 'neko', exampleMeaning: 'cat' },
    { character: 'の', romaji: 'no', row: 'NA', type: 'SEION', strokeCount: 1, sortOrder: 25, exampleWord: 'のみもの', exampleReading: 'nomimono', exampleMeaning: 'drink' },
    // HA-row
    { character: 'は', romaji: 'ha', row: 'HA', type: 'SEION', strokeCount: 3, sortOrder: 26, exampleWord: 'はな', exampleReading: 'hana', exampleMeaning: 'flower' },
    { character: 'ひ', romaji: 'hi', row: 'HA', type: 'SEION', strokeCount: 1, sortOrder: 27, exampleWord: 'ひと', exampleReading: 'hito', exampleMeaning: 'person' },
    { character: 'ふ', romaji: 'fu', row: 'HA', type: 'SEION', strokeCount: 4, sortOrder: 28, exampleWord: 'ふゆ', exampleReading: 'fuyu', exampleMeaning: 'winter' },
    { character: 'へ', romaji: 'he', row: 'HA', type: 'SEION', strokeCount: 1, sortOrder: 29, exampleWord: 'へや', exampleReading: 'heya', exampleMeaning: 'room' },
    { character: 'ほ', romaji: 'ho', row: 'HA', type: 'SEION', strokeCount: 4, sortOrder: 30, exampleWord: 'ほん', exampleReading: 'hon', exampleMeaning: 'book' },
    // MA-row
    { character: 'ま', romaji: 'ma', row: 'MA', type: 'SEION', strokeCount: 3, sortOrder: 31, exampleWord: 'まど', exampleReading: 'mado', exampleMeaning: 'window' },
    { character: 'み', romaji: 'mi', row: 'MA', type: 'SEION', strokeCount: 2, sortOrder: 32, exampleWord: 'みず', exampleReading: 'mizu', exampleMeaning: 'water' },
    { character: 'む', romaji: 'mu', row: 'MA', type: 'SEION', strokeCount: 3, sortOrder: 33, exampleWord: 'むし', exampleReading: 'mushi', exampleMeaning: 'insect' },
    { character: 'め', romaji: 'me', row: 'MA', type: 'SEION', strokeCount: 2, sortOrder: 34, exampleWord: 'めがね', exampleReading: 'megane', exampleMeaning: 'glasses' },
    { character: 'も', romaji: 'mo', row: 'MA', type: 'SEION', strokeCount: 3, sortOrder: 35, exampleWord: 'もの', exampleReading: 'mono', exampleMeaning: 'thing' },
    // YA-row
    { character: 'や', romaji: 'ya', row: 'YA', type: 'SEION', strokeCount: 3, sortOrder: 36, exampleWord: 'やま', exampleReading: 'yama', exampleMeaning: 'mountain' },
    { character: 'ゆ', romaji: 'yu', row: 'YA', type: 'SEION', strokeCount: 2, sortOrder: 37, exampleWord: 'ゆき', exampleReading: 'yuki', exampleMeaning: 'snow' },
    { character: 'よ', romaji: 'yo', row: 'YA', type: 'SEION', strokeCount: 2, sortOrder: 38, exampleWord: 'よる', exampleReading: 'yoru', exampleMeaning: 'night' },
    // RA-row
    { character: 'ら', romaji: 'ra', row: 'RA', type: 'SEION', strokeCount: 2, sortOrder: 39, exampleWord: 'らいねん', exampleReading: 'rainen', exampleMeaning: 'next year' },
    { character: 'り', romaji: 'ri', row: 'RA', type: 'SEION', strokeCount: 2, sortOrder: 40, exampleWord: 'りんご', exampleReading: 'ringo', exampleMeaning: 'apple' },
    { character: 'る', romaji: 'ru', row: 'RA', type: 'SEION', strokeCount: 1, sortOrder: 41, exampleWord: 'るす', exampleReading: 'rusu', exampleMeaning: 'absence' },
    { character: 'れ', romaji: 're', row: 'RA', type: 'SEION', strokeCount: 2, sortOrder: 42, exampleWord: 'れきし', exampleReading: 'rekishi', exampleMeaning: 'history' },
    { character: 'ろ', romaji: 'ro', row: 'RA', type: 'SEION', strokeCount: 1, sortOrder: 43, exampleWord: 'ろく', exampleReading: 'roku', exampleMeaning: 'six' },
    // WA-row
    { character: 'わ', romaji: 'wa', row: 'WA', type: 'SEION', strokeCount: 2, sortOrder: 44, exampleWord: 'わたし', exampleReading: 'watashi', exampleMeaning: 'I / me' },
    { character: 'を', romaji: 'wo', row: 'WA', type: 'SEION', strokeCount: 3, sortOrder: 45, exampleWord: 'みずをのむ', exampleReading: 'mizu wo nomu', exampleMeaning: 'drink water' },
    // N
    { character: 'ん', romaji: 'n', row: 'N', type: 'SEION', strokeCount: 1, sortOrder: 46, exampleWord: 'にほん', exampleReading: 'nihon', exampleMeaning: 'Japan' },
  ] as const;

  // Dakuon (voiced)
  const hiraganaDakuon = [
    { character: 'が', romaji: 'ga', row: 'KA', type: 'DAKUON', strokeCount: 4, sortOrder: 47, base: 'か', exampleWord: 'がっこう', exampleReading: 'gakkou', exampleMeaning: 'school' },
    { character: 'ぎ', romaji: 'gi', row: 'KA', type: 'DAKUON', strokeCount: 5, sortOrder: 48, base: 'き', exampleWord: 'ぎんこう', exampleReading: 'ginkou', exampleMeaning: 'bank' },
    { character: 'ぐ', romaji: 'gu', row: 'KA', type: 'DAKUON', strokeCount: 2, sortOrder: 49, base: 'く', exampleWord: 'ぐあい', exampleReading: 'guai', exampleMeaning: 'condition' },
    { character: 'げ', romaji: 'ge', row: 'KA', type: 'DAKUON', strokeCount: 4, sortOrder: 50, base: 'け', exampleWord: 'げんき', exampleReading: 'genki', exampleMeaning: 'healthy' },
    { character: 'ご', romaji: 'go', row: 'KA', type: 'DAKUON', strokeCount: 3, sortOrder: 51, base: 'こ', exampleWord: 'ごご', exampleReading: 'gogo', exampleMeaning: 'afternoon' },
    { character: 'ざ', romaji: 'za', row: 'SA', type: 'DAKUON', strokeCount: 4, sortOrder: 52, base: 'さ', exampleWord: 'ざっし', exampleReading: 'zasshi', exampleMeaning: 'magazine' },
    { character: 'じ', romaji: 'ji', row: 'SA', type: 'DAKUON', strokeCount: 2, sortOrder: 53, base: 'し', exampleWord: 'じかん', exampleReading: 'jikan', exampleMeaning: 'time' },
    { character: 'ず', romaji: 'zu', row: 'SA', type: 'DAKUON', strokeCount: 3, sortOrder: 54, base: 'す', exampleWord: 'かず', exampleReading: 'kazu', exampleMeaning: 'number' },
    { character: 'ぜ', romaji: 'ze', row: 'SA', type: 'DAKUON', strokeCount: 4, sortOrder: 55, base: 'せ', exampleWord: 'ぜんぶ', exampleReading: 'zenbu', exampleMeaning: 'all' },
    { character: 'ぞ', romaji: 'zo', row: 'SA', type: 'DAKUON', strokeCount: 2, sortOrder: 56, base: 'そ', exampleWord: 'ぞう', exampleReading: 'zou', exampleMeaning: 'elephant' },
    { character: 'だ', romaji: 'da', row: 'TA', type: 'DAKUON', strokeCount: 5, sortOrder: 57, base: 'た', exampleWord: 'だいがく', exampleReading: 'daigaku', exampleMeaning: 'university' },
    { character: 'ぢ', romaji: 'ji', row: 'TA', type: 'DAKUON', strokeCount: 3, sortOrder: 58, base: 'ち', exampleWord: 'はなぢ', exampleReading: 'hanaji', exampleMeaning: 'nosebleed' },
    { character: 'づ', romaji: 'zu', row: 'TA', type: 'DAKUON', strokeCount: 2, sortOrder: 59, base: 'つ', exampleWord: 'つづく', exampleReading: 'tsuzuku', exampleMeaning: 'to continue' },
    { character: 'で', romaji: 'de', row: 'TA', type: 'DAKUON', strokeCount: 2, sortOrder: 60, base: 'て', exampleWord: 'でんわ', exampleReading: 'denwa', exampleMeaning: 'telephone' },
    { character: 'ど', romaji: 'do', row: 'TA', type: 'DAKUON', strokeCount: 3, sortOrder: 61, base: 'と', exampleWord: 'どうぞ', exampleReading: 'douzo', exampleMeaning: 'please' },
    { character: 'ば', romaji: 'ba', row: 'HA', type: 'DAKUON', strokeCount: 4, sortOrder: 62, base: 'は', exampleWord: 'ばんごはん', exampleReading: 'bangohan', exampleMeaning: 'dinner' },
    { character: 'び', romaji: 'bi', row: 'HA', type: 'DAKUON', strokeCount: 2, sortOrder: 63, base: 'ひ', exampleWord: 'びょういん', exampleReading: 'byouin', exampleMeaning: 'hospital' },
    { character: 'ぶ', romaji: 'bu', row: 'HA', type: 'DAKUON', strokeCount: 5, sortOrder: 64, base: 'ふ', exampleWord: 'ぶんか', exampleReading: 'bunka', exampleMeaning: 'culture' },
    { character: 'べ', romaji: 'be', row: 'HA', type: 'DAKUON', strokeCount: 2, sortOrder: 65, base: 'へ', exampleWord: 'べんきょう', exampleReading: 'benkyou', exampleMeaning: 'study' },
    { character: 'ぼ', romaji: 'bo', row: 'HA', type: 'DAKUON', strokeCount: 5, sortOrder: 66, base: 'ほ', exampleWord: 'ぼうし', exampleReading: 'boushi', exampleMeaning: 'hat' },
  ] as const;

  // Handakuon (p-sounds)
  const hiraganaHandakuon = [
    { character: 'ぱ', romaji: 'pa', row: 'HA', type: 'HANDAKUON', strokeCount: 4, sortOrder: 67, base: 'は', exampleWord: 'ぱん', exampleReading: 'pan', exampleMeaning: 'bread' },
    { character: 'ぴ', romaji: 'pi', row: 'HA', type: 'HANDAKUON', strokeCount: 2, sortOrder: 68, base: 'ひ', exampleWord: 'ぴあの', exampleReading: 'piano', exampleMeaning: 'piano' },
    { character: 'ぷ', romaji: 'pu', row: 'HA', type: 'HANDAKUON', strokeCount: 5, sortOrder: 69, base: 'ふ', exampleWord: 'てんぷら', exampleReading: 'tenpura', exampleMeaning: 'tempura' },
    { character: 'ぺ', romaji: 'pe', row: 'HA', type: 'HANDAKUON', strokeCount: 2, sortOrder: 70, base: 'へ', exampleWord: 'ぺん', exampleReading: 'pen', exampleMeaning: 'pen' },
    { character: 'ぽ', romaji: 'po', row: 'HA', type: 'HANDAKUON', strokeCount: 5, sortOrder: 71, base: 'ほ', exampleWord: 'たんぽぽ', exampleReading: 'tanpopo', exampleMeaning: 'dandelion' },
  ] as const;

  // Youon (combination characters)
  const hiraganaYouon = [
    { character: 'きゃ', romaji: 'kya', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 72, base: 'き', exampleWord: 'きゃく', exampleReading: 'kyaku', exampleMeaning: 'guest' },
    { character: 'きゅ', romaji: 'kyu', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 73, base: 'き', exampleWord: 'きゅう', exampleReading: 'kyuu', exampleMeaning: 'nine' },
    { character: 'きょ', romaji: 'kyo', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 74, base: 'き', exampleWord: 'きょう', exampleReading: 'kyou', exampleMeaning: 'today' },
    { character: 'しゃ', romaji: 'sha', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 75, base: 'し', exampleWord: 'しゃしん', exampleReading: 'shashin', exampleMeaning: 'photograph' },
    { character: 'しゅ', romaji: 'shu', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 76, base: 'し', exampleWord: 'しゅくだい', exampleReading: 'shukudai', exampleMeaning: 'homework' },
    { character: 'しょ', romaji: 'sho', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 77, base: 'し', exampleWord: 'しょくじ', exampleReading: 'shokuji', exampleMeaning: 'meal' },
    { character: 'ちゃ', romaji: 'cha', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 78, base: 'ち', exampleWord: 'おちゃ', exampleReading: 'ocha', exampleMeaning: 'tea' },
    { character: 'ちゅ', romaji: 'chu', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 79, base: 'ち', exampleWord: 'ちゅうい', exampleReading: 'chuui', exampleMeaning: 'attention' },
    { character: 'ちょ', romaji: 'cho', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 80, base: 'ち', exampleWord: 'ちょっと', exampleReading: 'chotto', exampleMeaning: 'a little' },
    { character: 'にゃ', romaji: 'nya', row: 'NA', type: 'YOUON', strokeCount: 0, sortOrder: 81, base: 'に', exampleWord: 'にゃー', exampleReading: 'nyaa', exampleMeaning: 'meow' },
    { character: 'にゅ', romaji: 'nyu', row: 'NA', type: 'YOUON', strokeCount: 0, sortOrder: 82, base: 'に', exampleWord: 'にゅういん', exampleReading: 'nyuuin', exampleMeaning: 'hospitalization' },
    { character: 'にょ', romaji: 'nyo', row: 'NA', type: 'YOUON', strokeCount: 0, sortOrder: 83, base: 'に', exampleWord: 'にょうぼう', exampleReading: 'nyoubou', exampleMeaning: 'wife' },
    { character: 'ひゃ', romaji: 'hya', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 84, base: 'ひ', exampleWord: 'ひゃく', exampleReading: 'hyaku', exampleMeaning: 'hundred' },
    { character: 'ひゅ', romaji: 'hyu', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 85, base: 'ひ', exampleWord: 'ひゅう', exampleReading: 'hyuu', exampleMeaning: 'whoosh' },
    { character: 'ひょ', romaji: 'hyo', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 86, base: 'ひ', exampleWord: 'ひょう', exampleReading: 'hyou', exampleMeaning: 'hail' },
    { character: 'みゃ', romaji: 'mya', row: 'MA', type: 'YOUON', strokeCount: 0, sortOrder: 87, base: 'み', exampleWord: 'みゃく', exampleReading: 'myaku', exampleMeaning: 'pulse' },
    { character: 'みゅ', romaji: 'myu', row: 'MA', type: 'YOUON', strokeCount: 0, sortOrder: 88, base: 'み', exampleWord: 'みゅーじかる', exampleReading: 'myuujikaru', exampleMeaning: 'musical' },
    { character: 'みょ', romaji: 'myo', row: 'MA', type: 'YOUON', strokeCount: 0, sortOrder: 89, base: 'み', exampleWord: 'みょうじ', exampleReading: 'myouji', exampleMeaning: 'surname' },
    { character: 'りゃ', romaji: 'rya', row: 'RA', type: 'YOUON', strokeCount: 0, sortOrder: 90, base: 'り', exampleWord: 'りゃくご', exampleReading: 'ryakugo', exampleMeaning: 'abbreviation' },
    { character: 'りゅ', romaji: 'ryu', row: 'RA', type: 'YOUON', strokeCount: 0, sortOrder: 91, base: 'り', exampleWord: 'りゅうがく', exampleReading: 'ryuugaku', exampleMeaning: 'study abroad' },
    { character: 'りょ', romaji: 'ryo', row: 'RA', type: 'YOUON', strokeCount: 0, sortOrder: 92, base: 'り', exampleWord: 'りょこう', exampleReading: 'ryokou', exampleMeaning: 'travel' },
    // Voiced youon
    { character: 'ぎゃ', romaji: 'gya', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 93, base: 'ぎ', exampleWord: 'ぎゃく', exampleReading: 'gyaku', exampleMeaning: 'reverse' },
    { character: 'ぎゅ', romaji: 'gyu', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 94, base: 'ぎ', exampleWord: 'ぎゅうにく', exampleReading: 'gyuuniku', exampleMeaning: 'beef' },
    { character: 'ぎょ', romaji: 'gyo', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 95, base: 'ぎ', exampleWord: 'ぎょうざ', exampleReading: 'gyouza', exampleMeaning: 'gyoza' },
    { character: 'じゃ', romaji: 'ja', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 96, base: 'じ', exampleWord: 'じゃない', exampleReading: 'janai', exampleMeaning: 'is not' },
    { character: 'じゅ', romaji: 'ju', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 97, base: 'じ', exampleWord: 'じゅうしょ', exampleReading: 'juusho', exampleMeaning: 'address' },
    { character: 'じょ', romaji: 'jo', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 98, base: 'じ', exampleWord: 'じょうず', exampleReading: 'jouzu', exampleMeaning: 'skilled' },
    { character: 'ぢゃ', romaji: 'ja', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 99, base: 'ぢ', exampleWord: 'ぢゃない', exampleReading: 'janai', exampleMeaning: 'is not (variant)' },
    { character: 'ぢゅ', romaji: 'ju', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 100, base: 'ぢ', exampleWord: 'ぢゅう', exampleReading: 'juu', exampleMeaning: 'ten (variant)' },
    { character: 'ぢょ', romaji: 'jo', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 101, base: 'ぢ', exampleWord: 'ぢょうず', exampleReading: 'jouzu', exampleMeaning: 'skilled (variant)' },
    { character: 'びゃ', romaji: 'bya', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 102, base: 'び', exampleWord: 'さんびゃく', exampleReading: 'sanbyaku', exampleMeaning: 'three hundred' },
    { character: 'びゅ', romaji: 'byu', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 103, base: 'び', exampleWord: 'びゅう', exampleReading: 'byuu', exampleMeaning: 'wind gust' },
    { character: 'びょ', romaji: 'byo', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 104, base: 'び', exampleWord: 'びょういん', exampleReading: 'byouin', exampleMeaning: 'hospital' },
    { character: 'ぴゃ', romaji: 'pya', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 105, base: 'ぴ', exampleWord: 'ろっぴゃく', exampleReading: 'roppyaku', exampleMeaning: 'six hundred' },
    { character: 'ぴゅ', romaji: 'pyu', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 106, base: 'ぴ', exampleWord: 'ぴゅう', exampleReading: 'pyuu', exampleMeaning: 'whistling wind' },
    { character: 'ぴょ', romaji: 'pyo', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 107, base: 'ぴ', exampleWord: 'ぴょん', exampleReading: 'pyon', exampleMeaning: 'hop' },
  ] as const;

  // ─── Clear existing Hiragana for a clean re-seed ─────────────
  // Delete variants first (they reference base chars via baseCharacterId FK)
  await prisma.hiragana.deleteMany({ where: { baseCharacterId: { not: null } } });
  await prisma.hiragana.deleteMany({ where: { baseCharacterId: null } });

  // ─── Insert Hiragana basic ────────────────────────────────────
  const hiraganaIdMap = new Map<string, number>();

  for (const h of hiraganaBasic) {
    const record = await prisma.hiragana.upsert({
      where: { character: h.character },
      update: { romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
      create: { character: h.character, romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
    });
    hiraganaIdMap.set(h.character, record.id);
  }

  // ─── Insert Hiragana dakuon with base reference ───────────────
  for (const h of hiraganaDakuon) {
    const baseId = hiraganaIdMap.get(h.base);
    const record = await prisma.hiragana.upsert({
      where: { character: h.character },
      update: { romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, baseCharacterId: baseId, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
      create: { character: h.character, romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, baseCharacterId: baseId, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
    });
    hiraganaIdMap.set(h.character, record.id);
  }

  // ─── Insert Hiragana handakuon ────────────────────────────────
  for (const h of hiraganaHandakuon) {
    const baseId = hiraganaIdMap.get(h.base);
    const record = await prisma.hiragana.upsert({
      where: { character: h.character },
      update: { romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, baseCharacterId: baseId, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
      create: { character: h.character, romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, baseCharacterId: baseId, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
    });
    hiraganaIdMap.set(h.character, record.id);
  }

  // ─── Insert Hiragana youon ────────────────────────────────────
  for (const h of hiraganaYouon) {
    const baseId = hiraganaIdMap.get(h.base);
    await prisma.hiragana.upsert({
      where: { character: h.character },
      update: { romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, baseCharacterId: baseId, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
      create: { character: h.character, romaji: h.romaji, row: h.row, type: h.type, strokeCount: h.strokeCount, sortOrder: h.sortOrder, baseCharacterId: baseId, exampleWord: h.exampleWord, exampleReading: h.exampleReading, exampleMeaning: h.exampleMeaning },
    });
  }

  const hiraganaCount = await prisma.hiragana.count();
  console.log(`  ✓ ${hiraganaCount} hiragana characters`);

  // ─── KATAKANA ────────────────────────────────────────────────
  const katakanaBasic = [
    { character: 'ア', romaji: 'a', row: 'A', type: 'SEION', strokeCount: 2, sortOrder: 1, exampleWord: 'アメリカ', exampleReading: 'amerika', exampleMeaning: 'America' },
    { character: 'イ', romaji: 'i', row: 'A', type: 'SEION', strokeCount: 2, sortOrder: 2, exampleWord: 'インド', exampleReading: 'indo', exampleMeaning: 'India' },
    { character: 'ウ', romaji: 'u', row: 'A', type: 'SEION', strokeCount: 3, sortOrder: 3, exampleWord: 'ウール', exampleReading: 'uuru', exampleMeaning: 'wool' },
    { character: 'エ', romaji: 'e', row: 'A', type: 'SEION', strokeCount: 3, sortOrder: 4, exampleWord: 'エレベーター', exampleReading: 'erebeetaa', exampleMeaning: 'elevator' },
    { character: 'オ', romaji: 'o', row: 'A', type: 'SEION', strokeCount: 3, sortOrder: 5, exampleWord: 'オレンジ', exampleReading: 'orenji', exampleMeaning: 'orange' },
    { character: 'カ', romaji: 'ka', row: 'KA', type: 'SEION', strokeCount: 2, sortOrder: 6, exampleWord: 'カメラ', exampleReading: 'kamera', exampleMeaning: 'camera' },
    { character: 'キ', romaji: 'ki', row: 'KA', type: 'SEION', strokeCount: 3, sortOrder: 7, exampleWord: 'キロ', exampleReading: 'kiro', exampleMeaning: 'kilogram' },
    { character: 'ク', romaji: 'ku', row: 'KA', type: 'SEION', strokeCount: 2, sortOrder: 8, exampleWord: 'クラス', exampleReading: 'kurasu', exampleMeaning: 'class' },
    { character: 'ケ', romaji: 'ke', row: 'KA', type: 'SEION', strokeCount: 3, sortOrder: 9, exampleWord: 'ケーキ', exampleReading: 'keeki', exampleMeaning: 'cake' },
    { character: 'コ', romaji: 'ko', row: 'KA', type: 'SEION', strokeCount: 2, sortOrder: 10, exampleWord: 'コーヒー', exampleReading: 'koohii', exampleMeaning: 'coffee' },
    { character: 'サ', romaji: 'sa', row: 'SA', type: 'SEION', strokeCount: 3, sortOrder: 11, exampleWord: 'サラダ', exampleReading: 'sarada', exampleMeaning: 'salad' },
    { character: 'シ', romaji: 'shi', row: 'SA', type: 'SEION', strokeCount: 3, sortOrder: 12, exampleWord: 'シャツ', exampleReading: 'shatsu', exampleMeaning: 'shirt' },
    { character: 'ス', romaji: 'su', row: 'SA', type: 'SEION', strokeCount: 2, sortOrder: 13, exampleWord: 'スーパー', exampleReading: 'suupaa', exampleMeaning: 'supermarket' },
    { character: 'セ', romaji: 'se', row: 'SA', type: 'SEION', strokeCount: 2, sortOrder: 14, exampleWord: 'セーター', exampleReading: 'seetaa', exampleMeaning: 'sweater' },
    { character: 'ソ', romaji: 'so', row: 'SA', type: 'SEION', strokeCount: 2, sortOrder: 15, exampleWord: 'ソファー', exampleReading: 'sofaa', exampleMeaning: 'sofa' },
    { character: 'タ', romaji: 'ta', row: 'TA', type: 'SEION', strokeCount: 3, sortOrder: 16, exampleWord: 'タクシー', exampleReading: 'takushii', exampleMeaning: 'taxi' },
    { character: 'チ', romaji: 'chi', row: 'TA', type: 'SEION', strokeCount: 3, sortOrder: 17, exampleWord: 'チーズ', exampleReading: 'chiizu', exampleMeaning: 'cheese' },
    { character: 'ツ', romaji: 'tsu', row: 'TA', type: 'SEION', strokeCount: 3, sortOrder: 18, exampleWord: 'ツアー', exampleReading: 'tsuaa', exampleMeaning: 'tour' },
    { character: 'テ', romaji: 'te', row: 'TA', type: 'SEION', strokeCount: 3, sortOrder: 19, exampleWord: 'テレビ', exampleReading: 'terebi', exampleMeaning: 'television' },
    { character: 'ト', romaji: 'to', row: 'TA', type: 'SEION', strokeCount: 2, sortOrder: 20, exampleWord: 'トイレ', exampleReading: 'toire', exampleMeaning: 'toilet' },
    { character: 'ナ', romaji: 'na', row: 'NA', type: 'SEION', strokeCount: 2, sortOrder: 21, exampleWord: 'ナイフ', exampleReading: 'naifu', exampleMeaning: 'knife' },
    { character: 'ニ', romaji: 'ni', row: 'NA', type: 'SEION', strokeCount: 2, sortOrder: 22, exampleWord: 'ニュース', exampleReading: 'nyuusu', exampleMeaning: 'news' },
    { character: 'ヌ', romaji: 'nu', row: 'NA', type: 'SEION', strokeCount: 2, sortOrder: 23, exampleWord: 'カヌー', exampleReading: 'kanuu', exampleMeaning: 'canoe' },
    { character: 'ネ', romaji: 'ne', row: 'NA', type: 'SEION', strokeCount: 4, sortOrder: 24, exampleWord: 'ネクタイ', exampleReading: 'nekutai', exampleMeaning: 'necktie' },
    { character: 'ノ', romaji: 'no', row: 'NA', type: 'SEION', strokeCount: 1, sortOrder: 25, exampleWord: 'ノート', exampleReading: 'nooto', exampleMeaning: 'notebook' },
    { character: 'ハ', romaji: 'ha', row: 'HA', type: 'SEION', strokeCount: 2, sortOrder: 26, exampleWord: 'ハンバーガー', exampleReading: 'hanbaagaa', exampleMeaning: 'hamburger' },
    { character: 'ヒ', romaji: 'hi', row: 'HA', type: 'SEION', strokeCount: 2, sortOrder: 27, exampleWord: 'ヒーター', exampleReading: 'hiitaa', exampleMeaning: 'heater' },
    { character: 'フ', romaji: 'fu', row: 'HA', type: 'SEION', strokeCount: 1, sortOrder: 28, exampleWord: 'フランス', exampleReading: 'furansu', exampleMeaning: 'France' },
    { character: 'ヘ', romaji: 'he', row: 'HA', type: 'SEION', strokeCount: 1, sortOrder: 29, exampleWord: 'ヘリコプター', exampleReading: 'herikopuutaa', exampleMeaning: 'helicopter' },
    { character: 'ホ', romaji: 'ho', row: 'HA', type: 'SEION', strokeCount: 4, sortOrder: 30, exampleWord: 'ホテル', exampleReading: 'hoteru', exampleMeaning: 'hotel' },
    { character: 'マ', romaji: 'ma', row: 'MA', type: 'SEION', strokeCount: 2, sortOrder: 31, exampleWord: 'マンション', exampleReading: 'manshon', exampleMeaning: 'apartment' },
    { character: 'ミ', romaji: 'mi', row: 'MA', type: 'SEION', strokeCount: 3, sortOrder: 32, exampleWord: 'ミルク', exampleReading: 'miruku', exampleMeaning: 'milk' },
    { character: 'ム', romaji: 'mu', row: 'MA', type: 'SEION', strokeCount: 2, sortOrder: 33, exampleWord: 'ムード', exampleReading: 'muudo', exampleMeaning: 'mood' },
    { character: 'メ', romaji: 'me', row: 'MA', type: 'SEION', strokeCount: 2, sortOrder: 34, exampleWord: 'メニュー', exampleReading: 'menyuu', exampleMeaning: 'menu' },
    { character: 'モ', romaji: 'mo', row: 'MA', type: 'SEION', strokeCount: 3, sortOrder: 35, exampleWord: 'モデル', exampleReading: 'moderu', exampleMeaning: 'model' },
    { character: 'ヤ', romaji: 'ya', row: 'YA', type: 'SEION', strokeCount: 2, sortOrder: 36, exampleWord: 'ヤクルト', exampleReading: 'yakuruto', exampleMeaning: 'Yakult' },
    { character: 'ユ', romaji: 'yu', row: 'YA', type: 'SEION', strokeCount: 2, sortOrder: 37, exampleWord: 'ユニフォーム', exampleReading: 'yunifoomu', exampleMeaning: 'uniform' },
    { character: 'ヨ', romaji: 'yo', row: 'YA', type: 'SEION', strokeCount: 3, sortOrder: 38, exampleWord: 'ヨーロッパ', exampleReading: 'yooroppa', exampleMeaning: 'Europe' },
    { character: 'ラ', romaji: 'ra', row: 'RA', type: 'SEION', strokeCount: 2, sortOrder: 39, exampleWord: 'ラーメン', exampleReading: 'raamen', exampleMeaning: 'ramen' },
    { character: 'リ', romaji: 'ri', row: 'RA', type: 'SEION', strokeCount: 2, sortOrder: 40, exampleWord: 'リモコン', exampleReading: 'rimokon', exampleMeaning: 'remote control' },
    { character: 'ル', romaji: 'ru', row: 'RA', type: 'SEION', strokeCount: 2, sortOrder: 41, exampleWord: 'ルール', exampleReading: 'ruuru', exampleMeaning: 'rule' },
    { character: 'レ', romaji: 're', row: 'RA', type: 'SEION', strokeCount: 1, sortOrder: 42, exampleWord: 'レストラン', exampleReading: 'resutoran', exampleMeaning: 'restaurant' },
    { character: 'ロ', romaji: 'ro', row: 'RA', type: 'SEION', strokeCount: 3, sortOrder: 43, exampleWord: 'ロシア', exampleReading: 'roshia', exampleMeaning: 'Russia' },
    { character: 'ワ', romaji: 'wa', row: 'WA', type: 'SEION', strokeCount: 2, sortOrder: 44, exampleWord: 'ワイン', exampleReading: 'wain', exampleMeaning: 'wine' },
    { character: 'ヲ', romaji: 'wo', row: 'WA', type: 'SEION', strokeCount: 3, sortOrder: 45, exampleWord: 'ヲタク', exampleReading: 'wotaku', exampleMeaning: 'otaku' },
    { character: 'ン', romaji: 'n', row: 'N', type: 'SEION', strokeCount: 2, sortOrder: 46, exampleWord: 'パン', exampleReading: 'pan', exampleMeaning: 'bread' },
  ] as const;

  const katakanaDakuon = [
    { character: 'ガ', romaji: 'ga', row: 'KA', type: 'DAKUON', strokeCount: 3, sortOrder: 47, base: 'カ', exampleWord: 'ガス', exampleReading: 'gasu', exampleMeaning: 'gas' },
    { character: 'ギ', romaji: 'gi', row: 'KA', type: 'DAKUON', strokeCount: 4, sortOrder: 48, base: 'キ', exampleWord: 'ギター', exampleReading: 'gitaa', exampleMeaning: 'guitar' },
    { character: 'グ', romaji: 'gu', row: 'KA', type: 'DAKUON', strokeCount: 3, sortOrder: 49, base: 'ク', exampleWord: 'グラス', exampleReading: 'gurasu', exampleMeaning: 'glass' },
    { character: 'ゲ', romaji: 'ge', row: 'KA', type: 'DAKUON', strokeCount: 4, sortOrder: 50, base: 'ケ', exampleWord: 'ゲーム', exampleReading: 'geemu', exampleMeaning: 'game' },
    { character: 'ゴ', romaji: 'go', row: 'KA', type: 'DAKUON', strokeCount: 3, sortOrder: 51, base: 'コ', exampleWord: 'ゴルフ', exampleReading: 'gorufu', exampleMeaning: 'golf' },
    { character: 'ザ', romaji: 'za', row: 'SA', type: 'DAKUON', strokeCount: 4, sortOrder: 52, base: 'サ', exampleWord: 'ザック', exampleReading: 'zakku', exampleMeaning: 'backpack' },
    { character: 'ジ', romaji: 'ji', row: 'SA', type: 'DAKUON', strokeCount: 4, sortOrder: 53, base: 'シ', exampleWord: 'ジュース', exampleReading: 'juusu', exampleMeaning: 'juice' },
    { character: 'ズ', romaji: 'zu', row: 'SA', type: 'DAKUON', strokeCount: 3, sortOrder: 54, base: 'ス', exampleWord: 'チーズ', exampleReading: 'chiizu', exampleMeaning: 'cheese' },
    { character: 'ゼ', romaji: 'ze', row: 'SA', type: 'DAKUON', strokeCount: 3, sortOrder: 55, base: 'セ', exampleWord: 'ゼロ', exampleReading: 'zero', exampleMeaning: 'zero' },
    { character: 'ゾ', romaji: 'zo', row: 'SA', type: 'DAKUON', strokeCount: 3, sortOrder: 56, base: 'ソ', exampleWord: 'ゾーン', exampleReading: 'zoon', exampleMeaning: 'zone' },
    { character: 'ダ', romaji: 'da', row: 'TA', type: 'DAKUON', strokeCount: 4, sortOrder: 57, base: 'タ', exampleWord: 'ダンス', exampleReading: 'dansu', exampleMeaning: 'dance' },
    { character: 'ヂ', romaji: 'ji', row: 'TA', type: 'DAKUON', strokeCount: 4, sortOrder: 58, base: 'チ', exampleWord: 'ハナヂ', exampleReading: 'hanaji', exampleMeaning: 'nosebleed' },
    { character: 'ヅ', romaji: 'zu', row: 'TA', type: 'DAKUON', strokeCount: 4, sortOrder: 59, base: 'ツ', exampleWord: 'ミカヅキ', exampleReading: 'mikazuki', exampleMeaning: 'crescent moon' },
    { character: 'デ', romaji: 'de', row: 'TA', type: 'DAKUON', strokeCount: 4, sortOrder: 60, base: 'テ', exampleWord: 'デパート', exampleReading: 'depaato', exampleMeaning: 'department store' },
    { character: 'ド', romaji: 'do', row: 'TA', type: 'DAKUON', strokeCount: 3, sortOrder: 61, base: 'ト', exampleWord: 'ドア', exampleReading: 'doa', exampleMeaning: 'door' },
    { character: 'バ', romaji: 'ba', row: 'HA', type: 'DAKUON', strokeCount: 3, sortOrder: 62, base: 'ハ', exampleWord: 'バス', exampleReading: 'basu', exampleMeaning: 'bus' },
    { character: 'ビ', romaji: 'bi', row: 'HA', type: 'DAKUON', strokeCount: 3, sortOrder: 63, base: 'ヒ', exampleWord: 'ビール', exampleReading: 'biiru', exampleMeaning: 'beer' },
    { character: 'ブ', romaji: 'bu', row: 'HA', type: 'DAKUON', strokeCount: 2, sortOrder: 64, base: 'フ', exampleWord: 'ブラジル', exampleReading: 'burajiru', exampleMeaning: 'Brazil' },
    { character: 'ベ', romaji: 'be', row: 'HA', type: 'DAKUON', strokeCount: 2, sortOrder: 65, base: 'ヘ', exampleWord: 'ベッド', exampleReading: 'beddo', exampleMeaning: 'bed' },
    { character: 'ボ', romaji: 'bo', row: 'HA', type: 'DAKUON', strokeCount: 5, sortOrder: 66, base: 'ホ', exampleWord: 'ボール', exampleReading: 'booru', exampleMeaning: 'ball' },
  ] as const;

  const katakanaHandakuon = [
    { character: 'パ', romaji: 'pa', row: 'HA', type: 'HANDAKUON', strokeCount: 3, sortOrder: 67, base: 'ハ', exampleWord: 'パン', exampleReading: 'pan', exampleMeaning: 'bread' },
    { character: 'ピ', romaji: 'pi', row: 'HA', type: 'HANDAKUON', strokeCount: 3, sortOrder: 68, base: 'ヒ', exampleWord: 'ピアノ', exampleReading: 'piano', exampleMeaning: 'piano' },
    { character: 'プ', romaji: 'pu', row: 'HA', type: 'HANDAKUON', strokeCount: 2, sortOrder: 69, base: 'フ', exampleWord: 'プール', exampleReading: 'puuru', exampleMeaning: 'pool' },
    { character: 'ペ', romaji: 'pe', row: 'HA', type: 'HANDAKUON', strokeCount: 2, sortOrder: 70, base: 'ヘ', exampleWord: 'ペン', exampleReading: 'pen', exampleMeaning: 'pen' },
    { character: 'ポ', romaji: 'po', row: 'HA', type: 'HANDAKUON', strokeCount: 5, sortOrder: 71, base: 'ホ', exampleWord: 'ポスト', exampleReading: 'posuto', exampleMeaning: 'mailbox' },
  ] as const;

  const katakanaYouon = [
    { character: 'キャ', romaji: 'kya', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 72, base: 'キ', exampleWord: 'キャンプ', exampleReading: 'kyanpu', exampleMeaning: 'camp' },
    { character: 'キュ', romaji: 'kyu', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 73, base: 'キ', exampleWord: 'キュート', exampleReading: 'kyuuto', exampleMeaning: 'cute' },
    { character: 'キョ', romaji: 'kyo', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 74, base: 'キ', exampleWord: 'キョウト', exampleReading: 'kyouto', exampleMeaning: 'Kyoto' },
    { character: 'シャ', romaji: 'sha', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 75, base: 'シ', exampleWord: 'シャワー', exampleReading: 'shawaa', exampleMeaning: 'shower' },
    { character: 'シュ', romaji: 'shu', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 76, base: 'シ', exampleWord: 'シュート', exampleReading: 'shuuto', exampleMeaning: 'shoot' },
    { character: 'ショ', romaji: 'sho', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 77, base: 'シ', exampleWord: 'ショッピング', exampleReading: 'shoppingu', exampleMeaning: 'shopping' },
    { character: 'チャ', romaji: 'cha', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 78, base: 'チ', exampleWord: 'チャンス', exampleReading: 'chansu', exampleMeaning: 'chance' },
    { character: 'チュ', romaji: 'chu', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 79, base: 'チ', exampleWord: 'チューリップ', exampleReading: 'chuurippu', exampleMeaning: 'tulip' },
    { character: 'チョ', romaji: 'cho', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 80, base: 'チ', exampleWord: 'チョコレート', exampleReading: 'chokoreeto', exampleMeaning: 'chocolate' },
    { character: 'ニャ', romaji: 'nya', row: 'NA', type: 'YOUON', strokeCount: 0, sortOrder: 81, base: 'ニ', exampleWord: 'ニャー', exampleReading: 'nyaa', exampleMeaning: 'meow' },
    { character: 'ニュ', romaji: 'nyu', row: 'NA', type: 'YOUON', strokeCount: 0, sortOrder: 82, base: 'ニ', exampleWord: 'ニュース', exampleReading: 'nyuusu', exampleMeaning: 'news' },
    { character: 'ニョ', romaji: 'nyo', row: 'NA', type: 'YOUON', strokeCount: 0, sortOrder: 83, base: 'ニ', exampleWord: 'ニョッキ', exampleReading: 'nyokki', exampleMeaning: 'gnocchi' },
    { character: 'ヒャ', romaji: 'hya', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 84, base: 'ヒ', exampleWord: 'ヒャク', exampleReading: 'hyaku', exampleMeaning: 'hundred' },
    { character: 'ヒュ', romaji: 'hyu', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 85, base: 'ヒ', exampleWord: 'ヒューズ', exampleReading: 'hyuuzu', exampleMeaning: 'fuse' },
    { character: 'ヒョ', romaji: 'hyo', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 86, base: 'ヒ', exampleWord: 'ヒョウ', exampleReading: 'hyou', exampleMeaning: 'leopard' },
    { character: 'ミャ', romaji: 'mya', row: 'MA', type: 'YOUON', strokeCount: 0, sortOrder: 87, base: 'ミ', exampleWord: 'ミャンマー', exampleReading: 'myanmaa', exampleMeaning: 'Myanmar' },
    { character: 'ミュ', romaji: 'myu', row: 'MA', type: 'YOUON', strokeCount: 0, sortOrder: 88, base: 'ミ', exampleWord: 'ミュージック', exampleReading: 'myuujikku', exampleMeaning: 'music' },
    { character: 'ミョ', romaji: 'myo', row: 'MA', type: 'YOUON', strokeCount: 0, sortOrder: 89, base: 'ミ', exampleWord: 'ミョウジ', exampleReading: 'myouji', exampleMeaning: 'surname' },
    { character: 'リャ', romaji: 'rya', row: 'RA', type: 'YOUON', strokeCount: 0, sortOrder: 90, base: 'リ', exampleWord: 'リャク', exampleReading: 'ryaku', exampleMeaning: 'abbreviation' },
    { character: 'リュ', romaji: 'ryu', row: 'RA', type: 'YOUON', strokeCount: 0, sortOrder: 91, base: 'リ', exampleWord: 'リュック', exampleReading: 'ryukku', exampleMeaning: 'backpack' },
    { character: 'リョ', romaji: 'ryo', row: 'RA', type: 'YOUON', strokeCount: 0, sortOrder: 92, base: 'リ', exampleWord: 'リョカン', exampleReading: 'ryokan', exampleMeaning: 'Japanese inn' },
    // Voiced youon
    { character: 'ギャ', romaji: 'gya', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 93, base: 'ギ', exampleWord: 'ギャップ', exampleReading: 'gyappu', exampleMeaning: 'gap' },
    { character: 'ギュ', romaji: 'gyu', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 94, base: 'ギ', exampleWord: 'ギュウニュウ', exampleReading: 'gyuunyuu', exampleMeaning: 'milk' },
    { character: 'ギョ', romaji: 'gyo', row: 'KA', type: 'YOUON', strokeCount: 0, sortOrder: 95, base: 'ギ', exampleWord: 'ギョウザ', exampleReading: 'gyouza', exampleMeaning: 'gyoza' },
    { character: 'ジャ', romaji: 'ja', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 96, base: 'ジ', exampleWord: 'ジャケット', exampleReading: 'jaketto', exampleMeaning: 'jacket' },
    { character: 'ジュ', romaji: 'ju', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 97, base: 'ジ', exampleWord: 'ジュース', exampleReading: 'juusu', exampleMeaning: 'juice' },
    { character: 'ジョ', romaji: 'jo', row: 'SA', type: 'YOUON', strokeCount: 0, sortOrder: 98, base: 'ジ', exampleWord: 'ジョギング', exampleReading: 'jogingu', exampleMeaning: 'jogging' },
    { character: 'ヂャ', romaji: 'ja', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 99, base: 'ヂ', exampleWord: 'ヂャナイ', exampleReading: 'janai', exampleMeaning: 'is not (variant)' },
    { character: 'ヂュ', romaji: 'ju', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 100, base: 'ヂ', exampleWord: 'ヂュウ', exampleReading: 'juu', exampleMeaning: 'ten (variant)' },
    { character: 'ヂョ', romaji: 'jo', row: 'TA', type: 'YOUON', strokeCount: 0, sortOrder: 101, base: 'ヂ', exampleWord: 'ヂョウズ', exampleReading: 'jouzu', exampleMeaning: 'skilled (variant)' },
    { character: 'ビャ', romaji: 'bya', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 102, base: 'ビ', exampleWord: 'サンビャク', exampleReading: 'sanbyaku', exampleMeaning: 'three hundred' },
    { character: 'ビュ', romaji: 'byu', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 103, base: 'ビ', exampleWord: 'ビュッフェ', exampleReading: 'byuffe', exampleMeaning: 'buffet' },
    { character: 'ビョ', romaji: 'byo', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 104, base: 'ビ', exampleWord: 'ビョウイン', exampleReading: 'byouin', exampleMeaning: 'hospital' },
    { character: 'ピャ', romaji: 'pya', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 105, base: 'ピ', exampleWord: 'ロッピャク', exampleReading: 'roppyaku', exampleMeaning: 'six hundred' },
    { character: 'ピュ', romaji: 'pyu', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 106, base: 'ピ', exampleWord: 'ピュア', exampleReading: 'pyua', exampleMeaning: 'pure' },
    { character: 'ピョ', romaji: 'pyo', row: 'HA', type: 'YOUON', strokeCount: 0, sortOrder: 107, base: 'ピ', exampleWord: 'ピョン', exampleReading: 'pyon', exampleMeaning: 'hop' },
  ] as const;

  // ─── Clear existing Katakana for a clean re-seed ─────────────
  // Delete variants first (they reference base chars via baseCharacterId FK)
  await prisma.katakana.deleteMany({ where: { baseCharacterId: { not: null } } });
  await prisma.katakana.deleteMany({ where: { baseCharacterId: null } });

  // ─── Insert Katakana basic ────────────────────────────────────
  const katakanaIdMap = new Map<string, number>();

  for (const k of katakanaBasic) {
    const record = await prisma.katakana.upsert({
      where: { character: k.character },
      update: { romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
      create: { character: k.character, romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
    });
    katakanaIdMap.set(k.character, record.id);
  }

  for (const k of katakanaDakuon) {
    const baseId = katakanaIdMap.get(k.base);
    const record = await prisma.katakana.upsert({
      where: { character: k.character },
      update: { romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, baseCharacterId: baseId, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
      create: { character: k.character, romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, baseCharacterId: baseId, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
    });
    katakanaIdMap.set(k.character, record.id);
  }

  for (const k of katakanaHandakuon) {
    const baseId = katakanaIdMap.get(k.base);
    const record = await prisma.katakana.upsert({
      where: { character: k.character },
      update: { romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, baseCharacterId: baseId, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
      create: { character: k.character, romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, baseCharacterId: baseId, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
    });
    katakanaIdMap.set(k.character, record.id);
  }

  for (const k of katakanaYouon) {
    const baseId = katakanaIdMap.get(k.base);
    await prisma.katakana.upsert({
      where: { character: k.character },
      update: { romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, baseCharacterId: baseId, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
      create: { character: k.character, romaji: k.romaji, row: k.row, type: k.type, strokeCount: k.strokeCount, sortOrder: k.sortOrder, baseCharacterId: baseId, exampleWord: k.exampleWord, exampleReading: k.exampleReading, exampleMeaning: k.exampleMeaning },
    });
  }

  const katakanaCount = await prisma.katakana.count();
  console.log(`  ✓ ${katakanaCount} katakana characters`);
}
