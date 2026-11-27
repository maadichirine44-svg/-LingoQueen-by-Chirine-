export type LanguageId = 'fr' | 'en' | 'es' | 'it' | 'zh' | 'de';

export type UILanguage = 'en' | 'ar';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1-C2';

export type PlacementCEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LegalPageId = 'about' | 'privacy' | 'contact' | 'terms';

export interface LanguageMeta {
  id: LanguageId;
  name: string;
  nativeName: string;
  arabicName: string;
  landmark: string;
  landmarkArabic: string;
  city: string;
  speechLang: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface VocabItem {
  word: string;
  phonetic: string;
  english: string;
  arabic: string;
  example: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  english: string;
  arabic: string;
}

export interface Dialogue {
  title: string;
  context: string;
  lines: DialogueLine[];
}

export interface LessonExercise {
  id: string;
  type: 'fill-blank' | 'match' | 'sentence-order';
  instruction: string;
  prompt: string;
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  tokens?: string[];
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: number; // 1..50
  languageId: LanguageId;
  level: CEFRLevel;
  title: string;
  topic: string;
  vocab: VocabItem[]; // 10 items
  grammar: {
    title: string;
    explanation: string;
    formula: string;
    examples: Array<{ target: string; english: string; arabic: string }>;
    sentenceFormation: {
      prompt: string;
      targetSentence: string;
      scrambledWords: string[];
      english: string;
    };
  };
  speaking: {
    phrase: string;
    phonetic: string;
    english: string;
    arabic: string;
    tip: string;
  };
  dialogues: [Dialogue, Dialogue];
  writingPrompt: {
    prompt: string;
    minSentences: number;
    maxSentences: number;
    suggestedWords: string[];
  };
  voicePrompt: {
    targetPhrase: string;
    phonetic: string;
    english: string;
    arabic: string;
  };
  exercises: [LessonExercise, LessonExercise, LessonExercise];
  quiz: QuizQuestion[]; // 10 questions
}

export interface LessonResult {
  lessonId: number;
  score: number; // /100
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  writingScore?: number;
  pronunciationScore?: number;
  completedAt: string;
}

export type EvaluationBand = 'Repeat' | 'Good' | 'Very Good' | 'Excellent';

export interface EvaluationResult {
  checkpoint: number; // 10, 20, 30, 40, 50
  score: number; // /100
  correctAnswers: number;
  totalQuestions: number;
  band: EvaluationBand;
  passed: boolean; // >= 60
  completedAt: string;
}

export interface FinalExamResult {
  score: number; // /100
  correctAnswers: number;
  totalQuestions: number; // 20
  timeUsedSeconds: number;
  passed: boolean; // >= 70
  xpAwarded: number; // 500 if passed
  certificateId?: string;
  completedAt: string;
}

export interface LanguageProgress {
  completedLessons: number[]; // unique 1..50
  lessonResults: Record<number, LessonResult>;
  evaluations: Record<number, EvaluationResult>; // key: 10 | 20 | 30 | 40 | 50
  unlockedTier: number; // 1 (1-10), 2 (11-20), 3 (21-30), 4 (31-40), 5 (41-50)
  finalExam?: FinalExamResult;
  xp: number;
  placementLevel?: PlacementCEFR;
  pathStartLesson?: number;
}

export interface HotelLesson {
  id: number;
  category:
    | 'Check-in'
    | 'Room Service'
    | 'Breakfast'
    | 'Check-out'
    | 'Booking'
    | 'Angry Customer'
    | 'Phone'
    | 'Email'
    | 'Tourism'
    | 'CV Builder'
    | 'Job Interview';
  title: string;
  titleAr?: string;
  scenario: string;
  scenarioAr?: string;
  isCV?: boolean;
  isInterview?: boolean;
  phrases: Array<{ target: string; english: string; arabic: string }>;
  dialogue: DialogueLine[];
  quiz: QuizQuestion[];
}

export interface UserProfile {
  name: string;
  photoDataUrl?: string;
  createdAt: string;
  streak: number;
  lastActiveDate: string;
  dailyChallengeDates: Record<string, boolean>;
  languages: Record<LanguageId, LanguageProgress>;
  hotelTrack: {
    completedLessons: number[];
    scores: Record<number, number>;
    cvScore?: number;
    cvDraft?: Record<string, string>;
    interviewScore?: number;
    xp: number;
  };
  earnedBadges: string[];
  completedStories?: string[];
  gamesXp?: number;
  gamesPlayed?: number;
  placementCompleted?: boolean;
  placementLanguage?: LanguageId;
  placementLevel?: PlacementCEFR;
  placementScore?: number;
}
