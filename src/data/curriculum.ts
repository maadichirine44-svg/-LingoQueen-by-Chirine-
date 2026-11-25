import { LanguageId, Lesson, QuizQuestion } from '../types';
import { FRENCH_LESSONS } from './languages/fr';
import { ENGLISH_LESSONS } from './languages/en';
import { SPANISH_LESSONS } from './languages/es';
import { ITALIAN_LESSONS } from './languages/it';
import { CHINESE_LESSONS } from './languages/zh';
import { GERMAN_LESSONS } from './languages/de';

export const CURRICULUM: Record<LanguageId, Lesson[]> = {
  fr: FRENCH_LESSONS,
  en: ENGLISH_LESSONS,
  es: SPANISH_LESSONS,
  it: ITALIAN_LESSONS,
  zh: CHINESE_LESSONS,
  de: GERMAN_LESSONS,
};

export function getLessonsForLanguage(langId: LanguageId): Lesson[] {
  return CURRICULUM[langId] || [];
}

export function getLesson(langId: LanguageId, lessonId: number): Lesson | undefined {
  return CURRICULUM[langId]?.find((l) => l.id === lessonId);
}

export function getEvaluationExamQuestions(
  langId: LanguageId,
  checkpoint: number // 10, 20, 30, 40, 50
): QuizQuestion[] {
  const lessons = getLessonsForLanguage(langId);
  const startId = checkpoint - 9;
  const block = lessons.filter((l) => l.id >= startId && l.id <= checkpoint);
  // Pick 1 distinct question from each of the 10 lessons in the block (total = 10 questions)
  return block.map((lesson, idx) => {
    const q = lesson.quiz[idx % lesson.quiz.length];
    return {
      ...q,
      id: `eval-${langId}-${checkpoint}-q${idx + 1}`,
      question: `[Lesson ${lesson.id}] ${q.question}`,
    };
  });
}

export function getFinalExamQuestions(langId: LanguageId): QuizQuestion[] {
  const lessons = getLessonsForLanguage(langId);
  // 20 questions spanning A1 (4), A2 (4), B1 (4), B2 (4), C1-C2 (4)
  const indices = [
    0, 2, 5, 8,
    10, 13, 16, 19,
    20, 23, 26, 29,
    30, 33, 36, 39,
    40, 43, 46, 49,
  ];
  return indices.map((lessonIdx, qIdx) => {
    const lesson = lessons[lessonIdx] || lessons[qIdx % lessons.length];
    const q = lesson.quiz[(qIdx * 3) % lesson.quiz.length];
    return {
      ...q,
      id: `final-${langId}-q${qIdx + 1}`,
      question: `[${lesson.level} · L${lesson.id}] ${q.question}`,
    };
  });
}

export interface DailyChallengeItem {
  id: string;
  languageId: LanguageId;
  question: QuizQuestion;
  bonusPhrase: string;
  bonusArabic: string;
}

export function getDailyChallengeForDate(dateISO: string): DailyChallengeItem {
  const langIds: LanguageId[] = ['fr', 'en', 'es', 'it', 'zh', 'de'];
  const dayNum = dateISO.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const langId = langIds[dayNum % langIds.length];
  const lessons = getLessonsForLanguage(langId);
  const lesson = lessons[(dayNum * 7) % lessons.length];
  const question = lesson.quiz[dayNum % lesson.quiz.length];
  const v = lesson.vocab[dayNum % lesson.vocab.length];
  return {
    id: `daily-${dateISO}`,
    languageId: langId,
    question,
    bonusPhrase: `${v.word} (${v.phonetic}) — ${v.english}`,
    bonusArabic: v.arabic,
  };
}
