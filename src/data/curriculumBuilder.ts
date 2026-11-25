import {
  CEFRLevel,
  Dialogue,
  LanguageId,
  Lesson,
  LessonExercise,
  QuizQuestion,
  VocabItem,
} from '../types';

export type VocabTuple = [
  word: string,
  phonetic: string,
  english: string,
  arabic: string,
  example: string
];

export interface LessonBlueprint {
  id: number;
  title: string;
  topic: string;
  grammarTitle: string;
  grammarExplanation: string;
  grammarFormula: string;
  sentenceTarget: string;
  sentenceEnglish: string;
  dialogue1Title: string;
  dialogue1Context: string;
  dialogue2Title: string;
  dialogue2Context: string;
  speakers: [string, string, string, string]; // 2 fictional pairs
  writingPrompt: string;
  speakingTip: string;
  vocab: VocabTuple[]; // 10 unique items
}

export function getLevelForLesson(lessonId: number): CEFRLevel {
  if (lessonId <= 10) return 'A1';
  if (lessonId <= 20) return 'A2';
  if (lessonId <= 30) return 'B1';
  if (lessonId <= 40) return 'B2';
  return 'C1-C2';
}

function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildLessonsForLanguage(
  languageId: LanguageId,
  blueprints: LessonBlueprint[],
  templates: {
    askHow: (w: string) => string;
    answerUse: (w: string, ex: string) => string;
    greetingA: string;
    greetingAEn: string;
    greetingAAr: string;
    replyB: string;
    replyBEn: string;
    replyBAr: string;
    closingA: string;
    closingAEn: string;
    closingAAr: string;
  }
): Lesson[] {
  const allVocabPool = blueprints.flatMap((b) => b.vocab);

  return blueprints.map((bp, bpIdx) => {
    const level = getLevelForLesson(bp.id);
    const vocab: VocabItem[] = bp.vocab.map(([word, phonetic, english, arabic, example]) => ({
      word,
      phonetic,
      english,
      arabic,
      example,
    }));

    const words = bp.sentenceTarget.split(/\s+/).filter(Boolean);
    const scrambledWords =
      words.length > 1
        ? deterministicShuffle(words, bp.id * 97 + bpIdx)
        : Array.from(bp.sentenceTarget);

    const v0 = vocab[0];
    const v1 = vocab[1];
    const v2 = vocab[2];
    const v3 = vocab[3];
    const v4 = vocab[4];
    const v5 = vocab[5];

    const dialogue1: Dialogue = {
      title: bp.dialogue1Title,
      context: bp.dialogue1Context,
      lines: [
        {
          speaker: bp.speakers[0],
          text: `${templates.greetingA} ${v0.example}`,
          english: `${templates.greetingAEn} (${v0.english})`,
          arabic: `${templates.greetingAAr} (${v0.arabic})`,
        },
        {
          speaker: bp.speakers[1],
          text: `${templates.replyB} ${v1.example}`,
          english: `${templates.replyBEn} (${v1.english})`,
          arabic: `${templates.replyBAr} (${v1.arabic})`,
        },
        {
          speaker: bp.speakers[0],
          text: templates.askHow(v2.word),
          english: `Do we also need "${v2.english}" here?`,
          arabic: `هل نحتاج أيضاً إلى "${v2.arabic}" هنا؟`,
        },
        {
          speaker: bp.speakers[1],
          text: `${templates.answerUse(v2.word, v3.example)} ${templates.closingA}`,
          english: `Yes, especially "${v2.english}" and "${v3.english}". ${templates.closingAEn}`,
          arabic: `نعم، خصوصاً "${v2.arabic}" و"${v3.arabic}". ${templates.closingAAr}`,
        },
      ],
    };

    const dialogue2: Dialogue = {
      title: bp.dialogue2Title,
      context: bp.dialogue2Context,
      lines: [
        {
          speaker: bp.speakers[2],
          text: v4.example,
          english: `Focus phrase: ${v4.english}`,
          arabic: `العبارة الأساسية: ${v4.arabic}`,
        },
        {
          speaker: bp.speakers[3],
          text: v5.example,
          english: `Response: ${v5.english}`,
          arabic: `الرد: ${v5.arabic}`,
        },
        {
          speaker: bp.speakers[2],
          text: bp.sentenceTarget,
          english: bp.sentenceEnglish,
          arabic: `تركيز القواعد: ${bp.grammarTitle}`,
        },
        {
          speaker: bp.speakers[3],
          text: `${templates.replyB} ${templates.closingA}`,
          english: `${templates.replyBEn} ${templates.closingAEn}`,
          arabic: `${templates.replyBAr} ${templates.closingAAr}`,
        },
      ],
    };

    // 3 Interactive Exercises
    const ex1Target = v0.example.includes(v0.word)
      ? v0.example.replace(v0.word, '_____')
      : `${v0.example} — [_____]`;
    const distractorPool = allVocabPool.filter(
      (item) => !bp.vocab.some((bv) => bv[0] === item[0])
    );

    const ex1Distractors = deterministicShuffle(distractorPool, bp.id * 31).slice(0, 3);
    const ex1Options = deterministicShuffle(
      [v0.word, ...ex1Distractors.map((d) => d[0])],
      bp.id * 17
    );

    const exercise1: LessonExercise = {
      id: `${languageId}-${bp.id}-ex1`,
      type: 'fill-blank',
      instruction: 'Choose the correct word to complete the sentence:',
      prompt: `${ex1Target} (${v0.english} / ${v0.arabic})`,
      options: ex1Options,
      answer: v0.word,
    };

    const exercise2: LessonExercise = {
      id: `${languageId}-${bp.id}-ex2`,
      type: 'match',
      instruction: 'Match each target word with its Arabic meaning:',
      prompt: 'Tap a word on the left, then its Arabic match on the right.',
      pairs: [v1, v2, v3, v4].map((v) => ({ left: v.word, right: v.arabic })),
      answer: 'matched',
    };

    const exercise3: LessonExercise = {
      id: `${languageId}-${bp.id}-ex3`,
      type: 'sentence-order',
      instruction: 'Arrange the tiles to form the correct grammatical sentence:',
      prompt: bp.sentenceEnglish,
      tokens: scrambledWords,
      answer: bp.sentenceTarget,
    };

    // 10 Unique Quiz Questions
    const quiz: QuizQuestion[] = [];
    // Q1-Q5: Target word -> English meaning
    for (let i = 0; i < 5; i++) {
      const item = vocab[i];
      const others = deterministicShuffle(
        distractorPool,
        bp.id * 101 + i * 13
      ).slice(0, 3);
      const rawOpts = [item.english, ...others.map((o) => o[2])];
      const shuffledOpts = deterministicShuffle(rawOpts, bp.id * 19 + i);
      quiz.push({
        id: `${languageId}-${bp.id}-q${i + 1}`,
        question: `What is the English meaning of "${item.word}" (${item.phonetic})?`,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(item.english),
        explanation: `"${item.word}" means "${item.english}" (${item.arabic}).`,
      });
    }

    // Q6-Q8: Arabic meaning -> Target word
    for (let i = 5; i < 8; i++) {
      const item = vocab[i];
      const others = deterministicShuffle(
        vocab.filter((v) => v.word !== item.word),
        bp.id * 53 + i
      ).slice(0, 3);
      const rawOpts = [item.word, ...others.map((o) => o.word)];
      const shuffledOpts = deterministicShuffle(rawOpts, bp.id * 29 + i);
      quiz.push({
        id: `${languageId}-${bp.id}-q${i + 1}`,
        question: `Select the correct expression for "${item.arabic}" (${item.english}):`,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(item.word),
        explanation: `"${item.arabic}" translates to "${item.word}".`,
      });
    }

    // Q9: Grammar pattern question
    const wrongSentences = [
      `${vocab[8].word} ${vocab[9].word}`,
      `${vocab[7].word} — ${vocab[6].word}`,
      `${vocab[4].word} ${vocab[1].word}`,
    ];
    const q9Opts = deterministicShuffle([bp.sentenceTarget, ...wrongSentences], bp.id * 41);
    quiz.push({
      id: `${languageId}-${bp.id}-q9`,
      question: `Which sentence correctly applies "${bp.grammarTitle}" (${bp.grammarFormula})?`,
      options: q9Opts,
      correctIndex: q9Opts.indexOf(bp.sentenceTarget),
      explanation: `Correct structure: "${bp.sentenceTarget}" (${bp.sentenceEnglish}).`,
    });

    // Q10: Dialogue / context comprehension
    const q10Opts = deterministicShuffle(
      [vocab[9].english, vocab[0].english, vocab[2].english, vocab[5].english],
      bp.id * 67
    );
    quiz.push({
      id: `${languageId}-${bp.id}-q10`,
      question: `In "${bp.title}", what does "${vocab[9].word}" mean in context?`,
      options: q10Opts,
      correctIndex: q10Opts.indexOf(vocab[9].english),
      explanation: `"${vocab[9].word}" means "${vocab[9].english}" (${vocab[9].arabic}).`,
    });

    return {
      id: bp.id,
      languageId,
      level,
      title: bp.title,
      topic: bp.topic,
      vocab,
      grammar: {
        title: bp.grammarTitle,
        explanation: bp.grammarExplanation,
        formula: bp.grammarFormula,
        examples: [
          { target: v0.example, english: v0.english, arabic: v0.arabic },
          { target: bp.sentenceTarget, english: bp.sentenceEnglish, arabic: bp.grammarTitle },
        ],
        sentenceFormation: {
          prompt: `Build the ${level} sentence: "${bp.sentenceEnglish}"`,
          targetSentence: bp.sentenceTarget,
          scrambledWords,
          english: bp.sentenceEnglish,
        },
      },
      speaking: {
        phrase: bp.sentenceTarget,
        phonetic: v0.phonetic,
        english: bp.sentenceEnglish,
        arabic: v0.arabic,
        tip: bp.speakingTip,
      },
      dialogues: [dialogue1, dialogue2],
      writingPrompt: {
        prompt: bp.writingPrompt,
        minSentences: 5,
        maxSentences: 8,
        suggestedWords: [v0.word, v1.word, v2.word, v3.word, v4.word],
      },
      voicePrompt: {
        targetPhrase: bp.sentenceTarget,
        phonetic: v0.phonetic,
        english: bp.sentenceEnglish,
        arabic: v0.arabic,
      },
      exercises: [exercise1, exercise2, exercise3],
      quiz,
    };
  });
}
