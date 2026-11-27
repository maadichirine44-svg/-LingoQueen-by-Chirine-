import {
  CEFRLevel,
  Dialogue,
  DialogueLine,
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

export interface SectionSentence {
  target: string;
  phonetic: string;
  english: string;
  arabic: string;
}

export interface LessonBlueprint {
  id: number;
  title: string;
  topic: string;
  grammarTitle: string;
  grammarExplanation: string;
  grammarFormula: string;
  grammarExamples: [
    { target: string; english: string; arabic: string },
    { target: string; english: string; arabic: string }
  ];
  sentenceTarget: string; // Grammar sentence-building
  sentenceEnglish: string;
  speaking: SectionSentence; // Step 3: Speaking (new words/sentence)
  voice: SectionSentence; // Step 6: Listening / Voice Rec (new words/sentence)
  dialogue1Title: string;
  dialogue1Context: string;
  dialogue1Lines: DialogueLine[]; // Natural conversation 1
  dialogue2Title: string;
  dialogue2Context: string;
  dialogue2Lines: DialogueLine[]; // Natural conversation 2
  speakers: [string, string, string, string];
  writingPrompt: string;
  writingReviewWords?: string[]; // max 3 review words
  speakingTip: string;
  fillBlank: {
    sentence: string; // new sentence with _____
    answer: string;
    english: string;
    arabic: string;
    distractors: [string, string, string];
  };
  matchPairs: Array<{ left: string; right: string }>; // 4 distinct items
  exerciseSentenceTarget: string; // NEW sentence for Step 7 Sentence Building
  exerciseSentenceEnglish: string;
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
  blueprints: LessonBlueprint[]
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

    // Step 2: Grammar Sentence Formation (distinct from grammarExamples & exercise3)
    const grammarWords = bp.sentenceTarget.split(/\s+/).filter(Boolean);
    const grammarScrambled =
      grammarWords.length > 1
        ? deterministicShuffle(grammarWords, bp.id * 97 + bpIdx)
        : Array.from(bp.sentenceTarget);

    // Step 4: Two Natural Dialogues
    const dialogue1: Dialogue = {
      title: bp.dialogue1Title,
      context: bp.dialogue1Context,
      lines: bp.dialogue1Lines,
    };

    const dialogue2: Dialogue = {
      title: bp.dialogue2Title,
      context: bp.dialogue2Context,
      lines: bp.dialogue2Lines,
    };

    // Step 7: 3 Distinct Exercises
    const ex1Options = deterministicShuffle(
      [bp.fillBlank.answer, ...bp.fillBlank.distractors],
      bp.id * 17 + 3
    );

    const exercise1: LessonExercise = {
      id: `${languageId}-${bp.id}-ex1`,
      type: 'fill-blank',
      instruction: 'Choose the best word to complete this new sentence:',
      prompt: `${bp.fillBlank.sentence} (${bp.fillBlank.english} / ${bp.fillBlank.arabic})`,
      options: ex1Options,
      answer: bp.fillBlank.answer,
    };

    const exercise2: LessonExercise = {
      id: `${languageId}-${bp.id}-ex2`,
      type: 'match',
      instruction: 'Match each expression with its Arabic meaning:',
      prompt: 'Tap an expression on the left, then its Arabic match on the right.',
      pairs: bp.matchPairs,
      answer: 'matched',
    };

    const ex3Words = bp.exerciseSentenceTarget.split(/\s+/).filter(Boolean);
    const ex3Scrambled =
      ex3Words.length > 1
        ? deterministicShuffle(ex3Words, bp.id * 131 + bpIdx + 7)
        : Array.from(bp.exerciseSentenceTarget);

    const exercise3: LessonExercise = {
      id: `${languageId}-${bp.id}-ex3`,
      type: 'sentence-order',
      instruction: 'Build a brand-new sentence using the lesson vocabulary:',
      prompt: bp.exerciseSentenceEnglish,
      tokens: ex3Scrambled,
      answer: bp.exerciseSentenceTarget,
    };

    // Step 8: 10 Varied Quiz Questions (different formats, no repetition)
    const distractorPool = allVocabPool.filter(
      (item) => !bp.vocab.some((bv) => bv[0] === item[0])
    );
    const quiz: QuizQuestion[] = [];

    // Q1-Q2: Meaning in context
    for (let i = 0; i < 2; i++) {
      const item = vocab[i];
      const others = deterministicShuffle(distractorPool, bp.id * 101 + i * 13).slice(0, 3);
      const opts = deterministicShuffle([item.english, ...others.map((o) => o[2])], bp.id * 19 + i);
      quiz.push({
        id: `${languageId}-${bp.id}-q${i + 1}`,
        question: `In "${item.example}", what does "${item.word}" mean?`,
        options: opts,
        correctIndex: opts.indexOf(item.english),
        explanation: `"${item.word}" (${item.phonetic}) means "${item.english}" (${item.arabic}).`,
      });
    }

    // Q3-Q4: Choose natural expression for English prompt
    for (let i = 2; i < 4; i++) {
      const item = vocab[i];
      const others = deterministicShuffle(
        vocab.filter((v) => v.word !== item.word),
        bp.id * 43 + i
      ).slice(0, 3);
      const opts = deterministicShuffle([item.word, ...others.map((o) => o.word)], bp.id * 23 + i);
      quiz.push({
        id: `${languageId}-${bp.id}-q${i + 1}`,
        question: `How do you express "${item.english}"?`,
        options: opts,
        correctIndex: opts.indexOf(item.word),
        explanation: `"${item.english}" is expressed as "${item.word}" (${item.arabic}).`,
      });
    }

    // Q5-Q6: Arabic -> Target expression
    for (let i = 4; i < 6; i++) {
      const item = vocab[i];
      const others = deterministicShuffle(
        vocab.filter((v) => v.word !== item.word),
        bp.id * 53 + i
      ).slice(0, 3);
      const opts = deterministicShuffle([item.word, ...others.map((o) => o.word)], bp.id * 29 + i);
      quiz.push({
        id: `${languageId}-${bp.id}-q${i + 1}`,
        question: `Which expression matches "${item.arabic}"?`,
        options: opts,
        correctIndex: opts.indexOf(item.word),
        explanation: `"${item.arabic}" translates to "${item.word}" (${item.english}).`,
      });
    }

    // Q7: Distinct vocabulary recognition in a fresh context (no repetition with Exercise 1)
    const item7 = vocab[7];
    const q7Others = deterministicShuffle(distractorPool, bp.id * 79).slice(0, 3);
    const q7Opts = deterministicShuffle(
      [item7.english, ...q7Others.map((o) => o[2])],
      bp.id * 31
    );
    quiz.push({
      id: `${languageId}-${bp.id}-q7`,
      question: `In "${item7.example}", what does "${item7.word}" mean?`,
      options: q7Opts,
      correctIndex: q7Opts.indexOf(item7.english),
      explanation: `"${item7.word}" (${item7.phonetic}) means "${item7.english}" (${item7.arabic}).`,
    });

    // Q8: Speaking phrase comprehension
    const speakingOthers = deterministicShuffle(distractorPool, bp.id * 71).slice(0, 3);
    const q8Opts = deterministicShuffle(
      [bp.speaking.english, ...speakingOthers.map((o) => o[2])],
      bp.id * 37
    );
    quiz.push({
      id: `${languageId}-${bp.id}-q8`,
      question: `What does "${bp.speaking.target}" mean in English?`,
      options: q8Opts,
      correctIndex: q8Opts.indexOf(bp.speaking.english),
      explanation: `"${bp.speaking.target}" means "${bp.speaking.english}".`,
    });

    // Q9: Grammar structure check using grammarExamples[0] vs invalid forms
    const q9Target = bp.grammarExamples[0].target;
    const q9Wrongs = [
      `${vocab[7].word} ${vocab[9].word} ${vocab[1].word}`,
      `${vocab[8].word} — ${vocab[3].word}`,
      `${vocab[5].word} ${vocab[2].word}`,
    ];
    const q9Opts = deterministicShuffle([q9Target, ...q9Wrongs], bp.id * 41);
    quiz.push({
      id: `${languageId}-${bp.id}-q9`,
      question: `Which sentence correctly follows "${bp.grammarTitle}" (${bp.grammarFormula})?`,
      options: q9Opts,
      correctIndex: q9Opts.indexOf(q9Target),
      explanation: `Correct example: "${q9Target}" (${bp.grammarExamples[0].english}).`,
    });

    // Q10: Listening/Voice sentence comprehension
    const voiceOthers = deterministicShuffle(distractorPool, bp.id * 89).slice(0, 3);
    const q10Opts = deterministicShuffle(
      [bp.voice.english, ...voiceOthers.map((o) => o[2])],
      bp.id * 67
    );
    quiz.push({
      id: `${languageId}-${bp.id}-q10`,
      question: `Choose the right meaning for "${bp.voice.target}":`,
      options: q10Opts,
      correctIndex: q10Opts.indexOf(bp.voice.english),
      explanation: `"${bp.voice.target}" means "${bp.voice.english}" (${bp.voice.arabic}).`,
    });

    // Max 3 review words for writing prompt
    const reviewWords =
      bp.writingReviewWords && bp.writingReviewWords.length > 0
        ? bp.writingReviewWords.slice(0, 3)
        : [vocab[2].word, vocab[5].word, vocab[8].word];

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
        examples: bp.grammarExamples,
        sentenceFormation: {
          prompt: `Build the ${level} sentence: "${bp.sentenceEnglish}"`,
          targetSentence: bp.sentenceTarget,
          scrambledWords: grammarScrambled,
          english: bp.sentenceEnglish,
        },
      },
      speaking: {
        phrase: bp.speaking.target,
        phonetic: bp.speaking.phonetic,
        english: bp.speaking.english,
        arabic: bp.speaking.arabic,
        tip: bp.speakingTip,
      },
      dialogues: [dialogue1, dialogue2],
      writingPrompt: {
        prompt: bp.writingPrompt,
        minSentences: 5,
        maxSentences: 8,
        suggestedWords: reviewWords,
      },
      voicePrompt: {
        targetPhrase: bp.voice.target,
        phonetic: bp.voice.phonetic,
        english: bp.voice.english,
        arabic: bp.voice.arabic,
      },
      exercises: [exercise1, exercise2, exercise3],
      quiz,
    };
  });
}
