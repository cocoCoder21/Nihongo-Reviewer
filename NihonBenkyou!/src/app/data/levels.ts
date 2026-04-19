export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface VocabItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export interface GrammarItem {
  id: string;
  title: string;
  rule: string;
  example: string;
  exampleConverted: string;
  exampleRomaji: string;
  exampleMeaning: string;
  sentence: string;
  sentenceRomaji: string;
  sentenceMeaning: string;
}

export interface KanjiItem {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  strokeCount: number;
  examples: string[];
}

export interface ListeningItem {
  id: string;
  sentence: string;
  romaji: string;
  meaning: string;
  options: { id: string; text: string; correct: boolean }[];
}

export interface LevelContent {
  vocabulary: VocabItem[];
  grammar: GrammarItem[];
  kanji: KanjiItem[];
  listening: ListeningItem[];
}

export const levelInfo: Record<JLPTLevel, { label: string; description: string; vocabCount: number; kanjiCount: number; grammarCount: number }> = {
  N5: { label: 'Beginner', description: 'Basic greetings, numbers, and simple sentences', vocabCount: 800, kanjiCount: 100, grammarCount: 80 },
  N4: { label: 'Elementary', description: 'Daily conversation and basic reading', vocabCount: 1500, kanjiCount: 300, grammarCount: 165 },
  N3: { label: 'Intermediate', description: 'Everyday situations and general topics', vocabCount: 3750, kanjiCount: 600, grammarCount: 250 },
  N2: { label: 'Upper Intermediate', description: 'News, articles, and natural conversation', vocabCount: 6000, kanjiCount: 1000, grammarCount: 350 },
  N1: { label: 'Advanced', description: 'Complex texts, nuance, and native-level comprehension', vocabCount: 10000, kanjiCount: 2000, grammarCount: 450 },
};

const n5Content: LevelContent = {
  vocabulary: [
    { id: 'v1', word: '食べる', reading: 'たべる (taberu)', meaning: 'to eat', example: '朝ごはんを食べる。', exampleMeaning: 'I eat breakfast.' },
    { id: 'v2', word: '飲む', reading: 'のむ (nomu)', meaning: 'to drink', example: '水を飲む。', exampleMeaning: 'I drink water.' },
    { id: 'v3', word: '行く', reading: 'いく (iku)', meaning: 'to go', example: '学校に行く。', exampleMeaning: 'I go to school.' },
    { id: 'v4', word: '来る', reading: 'くる (kuru)', meaning: 'to come', example: '友達が来る。', exampleMeaning: 'A friend comes.' },
    { id: 'v5', word: '見る', reading: 'みる (miru)', meaning: 'to see / to watch', example: 'テレビを見る。', exampleMeaning: 'I watch TV.' },
    { id: 'v6', word: '聞く', reading: 'きく (kiku)', meaning: 'to listen / to ask', example: '音楽を聞く。', exampleMeaning: 'I listen to music.' },
    { id: 'v7', word: '読む', reading: 'よむ (yomu)', meaning: 'to read', example: '本を読む。', exampleMeaning: 'I read a book.' },
    { id: 'v8', word: '書く', reading: 'かく (kaku)', meaning: 'to write', example: '手紙を書く。', exampleMeaning: 'I write a letter.' },
    { id: 'v9', word: '話す', reading: 'はなす (hanasu)', meaning: 'to speak', example: '日本語を話す。', exampleMeaning: 'I speak Japanese.' },
    { id: 'v10', word: '買う', reading: 'かう (kau)', meaning: 'to buy', example: 'パンを買う。', exampleMeaning: 'I buy bread.' },
    { id: 'v11', word: '大きい', reading: 'おおきい (ookii)', meaning: 'big', example: '大きい犬がいる。', exampleMeaning: 'There is a big dog.' },
    { id: 'v12', word: '小さい', reading: 'ちいさい (chiisai)', meaning: 'small', example: '小さい猫です。', exampleMeaning: 'It is a small cat.' },
  ],
  grammar: [
    {
      id: 'g1', title: 'て-form (Te-form)',
      rule: 'For verbs ending in う, つ, or る (u, tsu, ru), drop the ending and add って (tte).',
      example: '買う (kau)', exampleConverted: '買って', exampleRomaji: 'katte', exampleMeaning: 'to buy',
      sentence: '私は本を買って、読みました。', sentenceRomaji: 'Watashi wa hon o katte, yomimashita.', sentenceMeaning: 'I bought a book and read it.',
    },
    {
      id: 'g2', title: '〜ます form (Polite)',
      rule: 'Add ます to the verb stem for polite present/future tense.',
      example: '食べる (taberu)', exampleConverted: '食べます', exampleRomaji: 'tabemasu', exampleMeaning: 'to eat',
      sentence: '毎日ごはんを食べます。', sentenceRomaji: 'Mainichi gohan o tabemasu.', sentenceMeaning: 'I eat rice every day.',
    },
    {
      id: 'g3', title: '〜ない form (Negative)',
      rule: 'Change the verb ending to the あ-column and add ない.',
      example: '飲む (nomu)', exampleConverted: '飲まない', exampleRomaji: 'nomanai', exampleMeaning: 'to drink',
      sentence: 'お酒を飲まない。', sentenceRomaji: 'Osake o nomanai.', sentenceMeaning: 'I don\'t drink alcohol.',
    },
    {
      id: 'g4', title: 'Particle は (wa) - Topic',
      rule: 'は marks the topic of the sentence — "as for X..."',
      example: '私は (watashi wa)', exampleConverted: '私は学生です', exampleRomaji: 'watashi wa gakusei desu', exampleMeaning: 'I',
      sentence: '私は学生です。', sentenceRomaji: 'Watashi wa gakusei desu.', sentenceMeaning: 'I am a student.',
    },
    {
      id: 'g5', title: 'Particle を (wo) - Object',
      rule: 'を marks the direct object of a verb.',
      example: '水を (mizu wo)', exampleConverted: '水を飲む', exampleRomaji: 'mizu wo nomu', exampleMeaning: 'water',
      sentence: '水を飲みます。', sentenceRomaji: 'Mizu wo nomimasu.', sentenceMeaning: 'I drink water.',
    },
  ],
  kanji: [
    { id: 'k1', kanji: '水', reading: 'みず (mizu)', meaning: 'water', strokeCount: 4, examples: ['水曜日', 'お水'] },
    { id: 'k2', kanji: '火', reading: 'ひ (hi)', meaning: 'fire', strokeCount: 4, examples: ['火曜日', '花火'] },
    { id: 'k3', kanji: '山', reading: 'やま (yama)', meaning: 'mountain', strokeCount: 3, examples: ['富士山', '山道'] },
    { id: 'k4', kanji: '日', reading: 'ひ/にち (hi/nichi)', meaning: 'day / sun', strokeCount: 4, examples: ['日本', '毎日'] },
    { id: 'k5', kanji: '月', reading: 'つき/げつ (tsuki/getsu)', meaning: 'moon / month', strokeCount: 4, examples: ['月曜日', '一月'] },
    { id: 'k6', kanji: '人', reading: 'ひと/じん (hito/jin)', meaning: 'person', strokeCount: 2, examples: ['日本人', '人々'] },
    { id: 'k7', kanji: '大', reading: 'おお (oo)', meaning: 'big', strokeCount: 3, examples: ['大きい', '大学'] },
    { id: 'k8', kanji: '小', reading: 'ちい (chii)', meaning: 'small', strokeCount: 3, examples: ['小さい', '小学校'] },
  ],
  listening: [
    {
      id: 'l1', sentence: '犬が好きです。', romaji: 'Inu ga suki desu.', meaning: 'I like dogs.',
      options: [
        { id: '1', text: 'I drink water', correct: false },
        { id: '2', text: 'I eat sushi', correct: false },
        { id: '3', text: 'I like dogs', correct: true },
        { id: '4', text: 'I like cats', correct: false },
      ],
    },
    {
      id: 'l2', sentence: '学校に行きます。', romaji: 'Gakkou ni ikimasu.', meaning: 'I go to school.',
      options: [
        { id: '1', text: 'I go to school', correct: true },
        { id: '2', text: 'I come from school', correct: false },
        { id: '3', text: 'I like school', correct: false },
        { id: '4', text: 'I study at home', correct: false },
      ],
    },
    {
      id: 'l3', sentence: '毎朝コーヒーを飲みます。', romaji: 'Maiasa koohii o nomimasu.', meaning: 'I drink coffee every morning.',
      options: [
        { id: '1', text: 'I eat breakfast every morning', correct: false },
        { id: '2', text: 'I drink coffee every morning', correct: true },
        { id: '3', text: 'I go to work every morning', correct: false },
        { id: '4', text: 'I drink tea every evening', correct: false },
      ],
    },
  ],
};

const n4Content: LevelContent = {
  vocabulary: [
    { id: 'v1', word: '届ける', reading: 'とどける (todokeru)', meaning: 'to deliver', example: '荷物を届ける。', exampleMeaning: 'I deliver a package.' },
    { id: 'v2', word: '決める', reading: 'きめる (kimeru)', meaning: 'to decide', example: '旅行先を決める。', exampleMeaning: 'I decide on a travel destination.' },
    { id: 'v3', word: '集める', reading: 'あつめる (atsumeru)', meaning: 'to collect', example: '切手を集める。', exampleMeaning: 'I collect stamps.' },
    { id: 'v4', word: '伝える', reading: 'つたえる (tsutaeru)', meaning: 'to convey', example: '気持ちを伝える。', exampleMeaning: 'I convey my feelings.' },
    { id: 'v5', word: '準備する', reading: 'じゅんびする (junbi suru)', meaning: 'to prepare', example: 'パーティーの準備をする。', exampleMeaning: 'I prepare for the party.' },
    { id: 'v6', word: '紹介する', reading: 'しょうかいする (shoukai suru)', meaning: 'to introduce', example: '友達を紹介する。', exampleMeaning: 'I introduce my friend.' },
    { id: 'v7', word: '経験', reading: 'けいけん (keiken)', meaning: 'experience', example: 'いい経験になった。', exampleMeaning: 'It became a good experience.' },
    { id: 'v8', word: '関係', reading: 'かんけい (kankei)', meaning: 'relationship / connection', example: '仕事の関係で引っ越した。', exampleMeaning: 'I moved because of work.' },
  ],
  grammar: [
    {
      id: 'g1', title: '〜たら (Conditional)',
      rule: 'Attach たら to the past tense form to express "if/when".',
      example: '行く (iku)', exampleConverted: '行ったら', exampleRomaji: 'ittara', exampleMeaning: 'to go',
      sentence: '駅に着いたら、電話してください。', sentenceRomaji: 'Eki ni tsuitara, denwa shite kudasai.', sentenceMeaning: 'When you arrive at the station, please call me.',
    },
    {
      id: 'g2', title: '〜ても (Even if)',
      rule: 'Attach ても to the te-form to mean "even if".',
      example: '雨が降る (ame ga furu)', exampleConverted: '雨が降っても', exampleRomaji: 'ame ga futtemo', exampleMeaning: 'to rain',
      sentence: '雨が降っても、サッカーをします。', sentenceRomaji: 'Ame ga futtemo, sakkaa o shimasu.', sentenceMeaning: 'Even if it rains, I will play soccer.',
    },
    {
      id: 'g3', title: '〜なければならない (Must)',
      rule: 'Change ない to なければならない to express obligation.',
      example: '勉強する (benkyou suru)', exampleConverted: '勉強しなければならない', exampleRomaji: 'benkyou shinakereba naranai', exampleMeaning: 'to study',
      sentence: '明日テストがあるので勉強しなければならない。', sentenceRomaji: 'Ashita tesuto ga aru node benkyou shinakereba naranai.', sentenceMeaning: 'I must study because there is a test tomorrow.',
    },
  ],
  kanji: [
    { id: 'k1', kanji: '会', reading: 'かい/あ (kai/a)', meaning: 'meet / association', strokeCount: 6, examples: ['会社', '会議'] },
    { id: 'k2', kanji: '社', reading: 'しゃ (sha)', meaning: 'company / society', strokeCount: 7, examples: ['会社', '社会'] },
    { id: 'k3', kanji: '教', reading: 'おし/きょう (oshi/kyou)', meaning: 'teach', strokeCount: 11, examples: ['教える', '教室'] },
    { id: 'k4', kanji: '思', reading: 'おも/し (omo/shi)', meaning: 'think', strokeCount: 9, examples: ['思う', '思い出'] },
    { id: 'k5', kanji: '知', reading: 'し/ち (shi/chi)', meaning: 'know', strokeCount: 8, examples: ['知る', '知識'] },
    { id: 'k6', kanji: '言', reading: 'い/げん (i/gen)', meaning: 'say / word', strokeCount: 7, examples: ['言う', '言葉'] },
  ],
  listening: [
    {
      id: 'l1', sentence: '明日は雨が降るそうです。', romaji: 'Ashita wa ame ga furu sou desu.', meaning: 'I heard it will rain tomorrow.',
      options: [
        { id: '1', text: 'Tomorrow will be sunny', correct: false },
        { id: '2', text: 'I heard it will rain tomorrow', correct: true },
        { id: '3', text: 'It rained yesterday', correct: false },
        { id: '4', text: 'I like rainy days', correct: false },
      ],
    },
  ],
};

const n3Content: LevelContent = {
  vocabulary: [
    { id: 'v1', word: '影響', reading: 'えいきょう (eikyou)', meaning: 'influence', example: '環境に影響を与える。', exampleMeaning: 'It influences the environment.' },
    { id: 'v2', word: '努力', reading: 'どりょく (doryoku)', meaning: 'effort', example: '努力が大切だ。', exampleMeaning: 'Effort is important.' },
    { id: 'v3', word: '成功', reading: 'せいこう (seikou)', meaning: 'success', example: '成功を祈る。', exampleMeaning: 'I pray for success.' },
    { id: 'v4', word: '増える', reading: 'ふえる (fueru)', meaning: 'to increase', example: '人口が増える。', exampleMeaning: 'The population increases.' },
    { id: 'v5', word: '減る', reading: 'へる (heru)', meaning: 'to decrease', example: '売上が減る。', exampleMeaning: 'Sales decrease.' },
    { id: 'v6', word: '比べる', reading: 'くらべる (kuraberu)', meaning: 'to compare', example: '二つの商品を比べる。', exampleMeaning: 'I compare two products.' },
  ],
  grammar: [
    {
      id: 'g1', title: '〜ようにする (Try to)',
      rule: 'Attach ようにする to dictionary form to express trying to make a habit.',
      example: '早く寝る (hayaku neru)', exampleConverted: '早く寝るようにする', exampleRomaji: 'hayaku neru you ni suru', exampleMeaning: 'to sleep early',
      sentence: '健康のために早く寝るようにしています。', sentenceRomaji: 'Kenkou no tame ni hayaku neru you ni shite imasu.', sentenceMeaning: 'I try to sleep early for my health.',
    },
    {
      id: 'g2', title: '〜ことにする (Decide to)',
      rule: 'Attach ことにする to dictionary/ない form to express a decision.',
      example: '日本に行く (nihon ni iku)', exampleConverted: '日本に行くことにした', exampleRomaji: 'nihon ni iku koto ni shita', exampleMeaning: 'to go to Japan',
      sentence: '来年日本に行くことにしました。', sentenceRomaji: 'Rainen nihon ni iku koto ni shimashita.', sentenceMeaning: 'I decided to go to Japan next year.',
    },
  ],
  kanji: [
    { id: 'k1', kanji: '業', reading: 'ぎょう/ごう (gyou/gou)', meaning: 'business / industry', strokeCount: 13, examples: ['工業', '授業'] },
    { id: 'k2', kanji: '産', reading: 'さん (san)', meaning: 'produce / birth', strokeCount: 11, examples: ['産業', '出産'] },
    { id: 'k3', kanji: '政', reading: 'せい (sei)', meaning: 'politics', strokeCount: 9, examples: ['政治', '政府'] },
    { id: 'k4', kanji: '経', reading: 'けい (kei)', meaning: 'pass through / manage', strokeCount: 11, examples: ['経済', '経験'] },
  ],
  listening: [
    {
      id: 'l1', sentence: '最近、運動するようにしています。', romaji: 'Saikin, undou suru you ni shiteimasu.', meaning: 'Recently, I have been trying to exercise.',
      options: [
        { id: '1', text: 'I started a new diet recently', correct: false },
        { id: '2', text: 'I have been trying to exercise recently', correct: true },
        { id: '3', text: 'I stopped exercising recently', correct: false },
        { id: '4', text: 'I want to start exercising soon', correct: false },
      ],
    },
  ],
};

const n2Content: LevelContent = {
  vocabulary: [
    { id: 'v1', word: '把握する', reading: 'はあくする (haaku suru)', meaning: 'to grasp / understand', example: '状況を把握する。', exampleMeaning: 'I grasp the situation.' },
    { id: 'v2', word: '対応する', reading: 'たいおうする (taiou suru)', meaning: 'to deal with', example: '問題に対応する。', exampleMeaning: 'I deal with the problem.' },
    { id: 'v3', word: '検討する', reading: 'けんとうする (kentou suru)', meaning: 'to examine / consider', example: '提案を検討する。', exampleMeaning: 'I examine the proposal.' },
    { id: 'v4', word: '実現する', reading: 'じつげんする (jitsugen suru)', meaning: 'to realize / achieve', example: '夢を実現する。', exampleMeaning: 'I achieve my dream.' },
  ],
  grammar: [
    {
      id: 'g1', title: '〜わけにはいかない (Cannot)',
      rule: 'Attach わけにはいかない to dictionary form to express inability due to social/moral reasons.',
      example: 'あきらめる (akirameru)', exampleConverted: 'あきらめるわけにはいかない', exampleRomaji: 'akirameru wake ni wa ikanai', exampleMeaning: 'to give up',
      sentence: 'ここであきらめるわけにはいかない。', sentenceRomaji: 'Koko de akirameru wake ni wa ikanai.', sentenceMeaning: 'I cannot give up here.',
    },
  ],
  kanji: [
    { id: 'k1', kanji: '論', reading: 'ろん (ron)', meaning: 'theory / argument', strokeCount: 15, examples: ['理論', '論文'] },
    { id: 'k2', kanji: '際', reading: 'さい (sai)', meaning: 'occasion / edge', strokeCount: 14, examples: ['国際', '実際'] },
    { id: 'k3', kanji: '制', reading: 'せい (sei)', meaning: 'system / control', strokeCount: 8, examples: ['制度', '規制'] },
  ],
  listening: [
    {
      id: 'l1', sentence: 'この問題について検討しなければなりません。', romaji: 'Kono mondai ni tsuite kentou shinakereba narimasen.', meaning: 'We must examine this problem.',
      options: [
        { id: '1', text: 'We must examine this problem', correct: true },
        { id: '2', text: 'We solved this problem', correct: false },
        { id: '3', text: 'This problem is not important', correct: false },
        { id: '4', text: 'There is no problem here', correct: false },
      ],
    },
  ],
};

const n1Content: LevelContent = {
  vocabulary: [
    { id: 'v1', word: '顕著', reading: 'けんちょ (kencho)', meaning: 'remarkable / prominent', example: '顕著な成果を上げた。', exampleMeaning: 'Remarkable results were achieved.' },
    { id: 'v2', word: '妥当', reading: 'だとう (datou)', meaning: 'valid / reasonable', example: '妥当な判断だ。', exampleMeaning: 'It is a reasonable judgment.' },
    { id: 'v3', word: '網羅する', reading: 'もうらする (moura suru)', meaning: 'to cover comprehensively', example: '全分野を網羅する。', exampleMeaning: 'It covers all fields comprehensively.' },
  ],
  grammar: [
    {
      id: 'g1', title: '〜をもって (By means of)',
      rule: 'をもって indicates a method, deadline, or basis. Formal expression.',
      example: '本日 (honjitsu)', exampleConverted: '本日をもって', exampleRomaji: 'honjitsu o motte', exampleMeaning: 'today',
      sentence: '本日をもって、募集を締め切ります。', sentenceRomaji: 'Honjitsu o motte, boshuu o shimekiimasu.', sentenceMeaning: 'As of today, applications are closed.',
    },
  ],
  kanji: [
    { id: 'k1', kanji: '鬱', reading: 'うつ (utsu)', meaning: 'depression / melancholy', strokeCount: 29, examples: ['憂鬱', '鬱病'] },
    { id: 'k2', kanji: '璧', reading: 'へき (heki)', meaning: 'perfect gem', strokeCount: 18, examples: ['完璧'] },
  ],
  listening: [
    {
      id: 'l1', sentence: '本日をもって、この制度は廃止されます。', romaji: 'Honjitsu o motte, kono seido wa haishi saremasu.', meaning: 'As of today, this system will be abolished.',
      options: [
        { id: '1', text: 'The new system starts today', correct: false },
        { id: '2', text: 'This system will be abolished today', correct: true },
        { id: '3', text: 'The system was established today', correct: false },
        { id: '4', text: 'We are reviewing the system today', correct: false },
      ],
    },
  ],
};

export const levelContent: Record<JLPTLevel, LevelContent> = {
  N5: n5Content,
  N4: n4Content,
  N3: n3Content,
  N2: n2Content,
  N1: n1Content,
};

export interface QuizQuestion {
  id: string;
  type: 'vocab-meaning' | 'grammar-fill' | 'kanji-reading' | 'translation';
  question: string;
  options: string[];
  correctIndex: number;
  category: 'vocabulary' | 'grammar' | 'kanji';
  explanation: string;
}

export function generateQuiz(level: JLPTLevel, count: number = 10): QuizQuestion[] {
  const content = levelContent[level];
  const questions: QuizQuestion[] = [];

  // Vocab meaning questions
  for (const v of content.vocabulary) {
    questions.push({
      id: `q-${v.id}`,
      type: 'vocab-meaning',
      question: `What does "${v.word}" mean?`,
      options: shuffleWithCorrect(v.meaning, getDistractors(content.vocabulary.map(x => x.meaning), v.meaning, 3)),
      correctIndex: 0, // will be recalculated
      category: 'vocabulary',
      explanation: `${v.word} (${v.reading}) means "${v.meaning}"`,
    });
  }

  // Kanji reading questions
  for (const k of content.kanji) {
    questions.push({
      id: `q-${k.id}`,
      type: 'kanji-reading',
      question: `What is the reading of "${k.kanji}"?`,
      options: shuffleWithCorrect(k.reading, getDistractors(content.kanji.map(x => x.reading), k.reading, 3)),
      correctIndex: 0,
      category: 'kanji',
      explanation: `${k.kanji} is read as ${k.reading} and means "${k.meaning}"`,
    });
  }

  // Grammar translation questions
  for (const g of content.grammar) {
    questions.push({
      id: `q-${g.id}`,
      type: 'translation',
      question: `Translate: "${g.sentence}"`,
      options: shuffleWithCorrect(g.sentenceMeaning, getDistractors(content.grammar.map(x => x.sentenceMeaning), g.sentenceMeaning, 3)),
      correctIndex: 0,
      category: 'grammar',
      explanation: `${g.sentenceRomaji} — ${g.sentenceMeaning}`,
    });
  }

  // Shuffle and limit
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);

  // Fix correctIndex after shuffling options
  for (const q of shuffled) {
    const correct = q.options[0]; // before shuffle, correct is first
    const shuffledOpts = q.options.sort(() => Math.random() - 0.5);
    q.options = shuffledOpts;
    q.correctIndex = shuffledOpts.indexOf(correct);
  }

  return shuffled;
}

function getDistractors(pool: string[], correct: string, count: number): string[] {
  const others = pool.filter(x => x !== correct);
  const shuffled = others.sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, count);
  // Pad if not enough distractors
  while (result.length < count) {
    result.push(`Option ${result.length + 1}`);
  }
  return result;
}

function shuffleWithCorrect(correct: string, distractors: string[]): string[] {
  return [correct, ...distractors];
}
