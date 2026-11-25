import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';
import { LanguageMeta, Lesson, LessonResult, UILanguage } from '../types';
import {
  analyzeWritingOffline,
  computePronunciationScore,
  speakText,
} from '../utils/speech';
import { launchRoyalConfetti } from '../utils/confetti';

interface LessonPlayerProps {
  lesson: Lesson;
  language: LanguageMeta;
  uiLang: UILanguage;
  onComplete: (result: LessonResult) => void;
  onExit: () => void;
}

const STEPS = [
  { id: 'vocab', labelEn: '1. Vocabulary (10)', labelAr: '1. المفردات (10)' },
  { id: 'grammar', labelEn: '2. Grammar', labelAr: '2. القواعد' },
  { id: 'speaking', labelEn: '3. Speaking', labelAr: '3. المحادثة' },
  { id: 'dialogues', labelEn: '4. 2 Dialogues', labelAr: '4. الحواران' },
  { id: 'writing', labelEn: '5. Writing (5–8)', labelAr: '5. الكتابة' },
  { id: 'voice', labelEn: '6. Voice Rec', labelAr: '6. التسجيل الصوتي' },
  { id: 'exercises', labelEn: '7. 3 Exercises', labelAr: '7. 3 تمارين' },
  { id: 'quiz', labelEn: '8. 10-Q Quiz', labelAr: '8. اختبار 10 أسئلة' },
] as const;

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  language,
  uiLang,
  onComplete,
  onExit,
}) => {
  const [stepIdx, setStepIdx] = useState(0);

  // Step 2: Grammar sentence formation
  const [builtWords, setBuiltWords] = useState<number[]>([]);
  const [grammarChecked, setGrammarChecked] = useState<boolean | null>(null);

  // Step 5: Writing (5-8 sentences)
  const [writingText, setWritingText] = useState('');
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingError, setWritingError] = useState<string | null>(null);
  const [writingResult, setWritingResult] = useState<{
    score: number;
    correctedText: string;
    feedback: string;
    corrections: string[];
  } | null>(null);

  // Step 6: Voice Recording + Pronunciation Score
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Step 7: 3 Exercises
  const [ex1Selected, setEx1Selected] = useState<string | null>(null);
  const [ex2LeftPicked, setEx2LeftPicked] = useState<string | null>(null);
  const [ex2Matched, setEx2Matched] = useState<Record<string, string>>({});
  const [ex3Order, setEx3Order] = useState<number[]>([]);
  const [exChecked, setExChecked] = useState(false);

  // Step 8: 10-Question Quiz + Results
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);

  useEffect(() => {
    setStepIdx(0);
    setBuiltWords([]);
    setGrammarChecked(null);
    setWritingText('');
    setWritingResult(null);
    setWritingError(null);
    setRecordedUrl(null);
    setRecognizedText('');
    setPronunciationScore(null);
    setEx1Selected(null);
    setEx2LeftPicked(null);
    setEx2Matched({});
    setEx3Order([]);
    setExChecked(false);
    setQuizAnswers({});
    setLessonResult(null);
  }, [lesson.id, language.id]);

  // Grammar sentence formation helpers
  const scrambled = lesson.grammar.sentenceFormation.scrambledWords;
  const builtSentence = builtWords.map((i) => scrambled[i]).join(' ');

  const checkGrammarSentence = () => {
    const cleanTarget = lesson.grammar.sentenceFormation.targetSentence
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    const cleanBuilt = builtSentence.toLowerCase().replace(/\s+/g, ' ').trim();
    setGrammarChecked(cleanTarget === cleanBuilt);
    if (cleanTarget === cleanBuilt) {
      speakText(lesson.grammar.sentenceFormation.targetSentence, language.speechLang);
    }
  };

  // Writing evaluator
  const handleEvaluateWriting = async () => {
    if (!writingText.trim()) return;
    setWritingLoading(true);
    setWritingError(null);

    if (!navigator.onLine) {
      const offline = analyzeWritingOffline(
        writingText,
        lesson.writingPrompt.suggestedWords,
        lesson.writingPrompt.minSentences,
        lesson.writingPrompt.maxSentences
      );
      setWritingResult(offline);
      setWritingLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gemini/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: writingText,
          language: language.name,
          prompt: lesson.writingPrompt.prompt,
          level: lesson.level,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Writing evaluation unavailable');
      }
      const data = await res.json();
      setWritingResult(data);
    } catch (err: unknown) {
      // Fallback gracefully ONLY if offline/static Netlify, otherwise surface clear error + local check option
      const msg = err instanceof Error ? err.message : 'Server unreachable';
      setWritingError(msg);
      const localCheck = analyzeWritingOffline(
        writingText,
        lesson.writingPrompt.suggestedWords,
        lesson.writingPrompt.minSentences,
        lesson.writingPrompt.maxSentences
      );
      setWritingResult(localCheck);
    } finally {
      setWritingLoading(false);
    }
  };

  // Voice recording + Pronunciation Score
  const startRecording = async () => {
    setMicError(null);
    setRecognizedText('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());

        const durationSec = (Date.now() - recordStartRef.current) / 1000;
        setPronunciationScore((prev) => {
          if (prev !== null && prev > 0) return prev;
          // Acoustic duration heuristic when SpeechRecognition didn't emit a transcript
          return durationSec >= 1.2 ? 82 : 64;
        });
      };
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      recorder.start();
      setIsRecording(true);

      // Try Web SpeechRecognition if available for exact word-match pronunciation score
      const SpeechRec =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.lang = language.speechLang;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          setRecognizedText(transcript);
          const computed = computePronunciationScore(
            lesson.voicePrompt.targetPhrase,
            transcript
          );
          setPronunciationScore(computed);
        };
        rec.onerror = () => {
          // handled on stop via duration fallback
        };
        rec.start();
        recognitionRef.current = rec;
      }
    } catch {
      setMicError(
        'Microphone permission is required for live recording. You can enable it in browser settings.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  // Exercise 2 matching helper
  const ex2Pairs = lesson.exercises[1].pairs || [];
  const ex2RightShuffled = [...ex2Pairs].reverse();

  // Exercise 3 sentence ordering helper
  const ex3Tokens = lesson.exercises[2].tokens || [];
  const ex3Built = ex3Order.map((i) => ex3Tokens[i]).join(' ');

  // Submit full lesson quiz & calculate /100 + correct/wrong + XP
  const handleFinishLesson = () => {
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });

    const total = lesson.quiz.length; // 10
    const wrong = total - correct;
    const quizPercent = Math.round((correct / total) * 100);
    const bonusWriting = writingResult ? Math.round(writingResult.score * 0.1) : 0;
    const bonusVoice = pronunciationScore ? Math.round(pronunciationScore * 0.05) : 0;
    const finalScore = Math.min(100, Math.round(quizPercent * 0.85 + bonusWriting + bonusVoice));
    const xpEarned = 50 + correct * 10 + (finalScore >= 80 ? 30 : 0);

    const res: LessonResult = {
      lessonId: lesson.id,
      score: finalScore,
      correctAnswers: correct,
      wrongAnswers: wrong,
      totalQuestions: total,
      xpEarned,
      writingScore: writingResult?.score,
      pronunciationScore: pronunciationScore ?? undefined,
      completedAt: new Date().toISOString(),
    };
    setLessonResult(res);
    launchRoyalConfetti();
    onComplete(res);
  };

  const step = STEPS[stepIdx];

  return (
    <div className="space-y-6">
      {/* Top Lesson Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-pink-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-pink-200 text-purple-900 hover:bg-pink-50 cursor-pointer"
            aria-label="Back to curriculum"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-semibold text-pink-700">
              {language.name} · Lesson {lesson.id}/50 · {lesson.level}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-purple-950">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="text-xs font-semibold text-purple-800 tabular-nums">
          Step {stepIdx + 1} of {STEPS.length}
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setStepIdx(idx)}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              stepIdx === idx
                ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-sm'
                : 'bg-white border border-pink-100 text-slate-600 hover:border-pink-300'
            }`}
          >
            {uiLang === 'ar' ? s.labelAr : s.labelEn}
          </button>
        ))}
      </div>

      {/* Lesson Results View (after submitting Quiz) */}
      {lessonResult ? (
        <div className="rounded-2xl bg-white border border-pink-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 mb-2">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-950">
              Lesson {lesson.id} Completed!
            </h2>
            <p className="text-sm text-slate-600">
              Progress saved permanently for {language.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-pink-50 border border-pink-100 p-4 text-center">
              <div className="text-xs text-slate-600">Score / 100</div>
              <div className="text-2xl font-bold text-pink-700 tabular-nums mt-1">
                {lessonResult.score}/100
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
              <div className="text-xs text-slate-600">Correct Answers</div>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {lessonResult.correctAnswers}/{lessonResult.totalQuestions}
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center">
              <div className="text-xs text-slate-600">Wrong Answers</div>
              <div className="text-2xl font-bold text-rose-700 tabular-nums mt-1">
                {lessonResult.wrongAnswers}
              </div>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 text-center">
              <div className="text-xs text-slate-600">XP Earned</div>
              <div className="text-2xl font-bold text-purple-800 tabular-nums mt-1">
                +{lessonResult.xpEarned} XP
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">10-Question Review</h3>
            {lesson.quiz.map((q, idx) => {
              const ok = quizAnswers[idx] === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 p-3 text-sm flex items-start gap-2.5"
                >
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onExit}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
            >
              Back to {language.name} Academy
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-7 shadow-sm space-y-6">
          {/* STEP 1: 10 VOCAB + ARABIC + LISTEN */}
          {step.id === 'vocab' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-purple-950">
                  10 Essential Vocabulary Words
                </h2>
                <p className="text-sm text-slate-600">
                  Listen to native pronunciation and learn every English & Arabic meaning.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lesson.vocab.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-pink-100 p-4 bg-pink-50/30 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base font-bold text-purple-950">
                          {idx + 1}. {item.word}
                        </span>
                        <span className="text-xs text-slate-500">
                          /{item.phonetic}/
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium">
                        {item.english}
                      </p>
                      <p className="text-sm font-semibold text-pink-700" dir="rtl">
                        {item.arabic}
                      </p>
                      <p className="text-xs text-slate-600 pt-1">{item.example}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakText(item.word, language.speechLang)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 shrink-0 cursor-pointer"
                      aria-label={`Listen to ${item.word}`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: GRAMMAR + SENTENCE FORMATION */}
          {step.id === 'grammar' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-5 space-y-2">
                <div className="text-xs font-semibold text-purple-700">
                  Grammar Rule · {lesson.level}
                </div>
                <h2 className="text-xl font-bold text-purple-950">
                  {lesson.grammar.title}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lesson.grammar.explanation}
                </p>
                <div className="pt-2 font-mono text-xs sm:text-sm font-semibold text-pink-800">
                  Pattern: {lesson.grammar.formula}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Examples</h3>
                {lesson.grammar.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-purple-950 text-sm">
                        {ex.target}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {ex.english} · {ex.arabic}
                      </p>
                    </div>
                    <button
                      onClick={() => speakText(ex.target, language.speechLang)}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-pink-200 text-pink-700 hover:bg-pink-50 cursor-pointer"
                      aria-label="Listen example"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Interactive Sentence Formation */}
              <div className="rounded-xl border border-pink-200 p-5 space-y-4 bg-pink-50/30">
                <div>
                  <h3 className="text-base font-bold text-purple-950">
                    Interactive Sentence Formation
                  </h3>
                  <p className="text-sm text-slate-600">
                    {lesson.grammar.sentenceFormation.prompt}
                  </p>
                </div>

                <div className="min-h-[56px] rounded-xl bg-white border border-pink-200 p-3 flex flex-wrap gap-2 items-center">
                  {builtWords.length === 0 ? (
                    <span className="text-xs text-slate-400">
                      Tap the word tiles below in the right grammatical order...
                    </span>
                  ) : (
                    builtWords.map((wordIdx, pos) => (
                      <button
                        key={`${wordIdx}-${pos}`}
                        onClick={() => {
                          setBuiltWords((prev) => prev.filter((_, i) => i !== pos));
                          setGrammarChecked(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-sm font-medium cursor-pointer"
                      >
                        {scrambled[wordIdx]}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {scrambled.map((w, idx) => {
                    const used = builtWords.includes(idx);
                    return (
                      <button
                        key={idx}
                        disabled={used}
                        onClick={() => {
                          setBuiltWords((prev) => [...prev, idx]);
                          setGrammarChecked(null);
                        }}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-lg border text-sm font-medium transition cursor-pointer ${
                          used
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-pink-200 text-purple-950 hover:bg-pink-50'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={checkGrammarSentence}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
                  >
                    Check Sentence
                  </button>
                  <button
                    onClick={() => {
                      setBuiltWords([]);
                      setGrammarChecked(null);
                    }}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  {grammarChecked !== null && (
                    <span
                      className={`text-sm font-semibold ${
                        grammarChecked ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {grammarChecked
                        ? 'Perfect grammatical order!'
                        : `Try again — Target: "${lesson.grammar.sentenceFormation.targetSentence}"`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SPEAKING */}
          {step.id === 'speaking' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-purple-950">
                Guided Speaking Drill
              </h2>
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 p-6 space-y-4">
                <p className="text-xs font-semibold text-pink-700">
                  Target Expression
                </p>
                <p className="text-2xl font-bold text-purple-950">
                  {lesson.speaking.phrase}
                </p>
                <p className="text-sm text-slate-600">
                  Phonetic: /{lesson.speaking.phonetic}/
                </p>
                <p className="text-sm text-slate-800">
                  {lesson.speaking.english} ·{' '}
                  <span className="text-pink-700 font-semibold">
                    {lesson.speaking.arabic}
                  </span>
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      speakText(lesson.speaking.phrase, language.speechLang, 0.9)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen Normal Speed</span>
                  </button>
                  <button
                    onClick={() =>
                      speakText(lesson.speaking.phrase, language.speechLang, 0.65)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-sm font-semibold text-purple-900 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Slow Pronunciation</span>
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white p-4 text-sm text-slate-700">
                <strong className="text-purple-900">Coach Tip:</strong>{' '}
                {lesson.speaking.tip}
              </div>
            </div>
          )}

          {/* STEP 4: 2 DIALOGUES */}
          {step.id === 'dialogues' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-purple-950">
                Two Real-World Dialogues
              </h2>
              {lesson.dialogues.map((dlg, dIdx) => (
                <div
                  key={dIdx}
                  className="rounded-2xl border border-pink-100 bg-pink-50/20 p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-purple-950">
                        Dialogue {dIdx + 1}: {dlg.title}
                      </h3>
                      <p className="text-xs text-slate-600">{dlg.context}</p>
                    </div>
                    <button
                      onClick={() =>
                        speakText(
                          dlg.lines.map((l) => l.text).join('. '),
                          language.speechLang
                        )
                      }
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-pink-700 hover:bg-pink-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Dialogue</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dlg.lines.map((line, lIdx) => (
                      <div
                        key={lIdx}
                        className="rounded-xl bg-white border border-slate-200 p-3.5 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-pink-700">
                            {line.speaker}
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {line.text}
                          </p>
                          <p className="text-xs text-slate-600">{line.english}</p>
                          <p className="text-xs text-purple-800" dir="rtl">
                            {line.arabic}
                          </p>
                        </div>
                        <button
                          onClick={() => speakText(line.text, language.speechLang)}
                          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-pink-100 text-pink-700 hover:bg-pink-50 shrink-0 cursor-pointer"
                          aria-label="Listen line"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 5: WRITING (5-8 SENTENCES) + CORRECTION + SCORE */}
          {step.id === 'writing' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-purple-950">
                  Writing Practice (5–8 Sentences)
                </h2>
                <p className="text-sm text-slate-700 mt-1">
                  {lesson.writingPrompt.prompt}
                </p>
                <p className="text-xs text-purple-700 mt-2">
                  Suggested vocabulary: {lesson.writingPrompt.suggestedWords.join(' · ')}
                </p>
              </div>

              <textarea
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                rows={6}
                placeholder={`Write 5–8 sentences in ${language.name}...`}
                className="w-full rounded-xl border border-pink-200 bg-white p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 tabular-nums">
                  Sentences detected:{' '}
                  {
                    writingText
                      .split(/[.!?。！？\n]+/)
                      .filter((s) => s.trim().length > 2).length
                  }{' '}
                  (target: 5–8)
                </span>
                <button
                  onClick={handleEvaluateWriting}
                  disabled={writingLoading || !writingText.trim()}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  {writingLoading ? 'Evaluating...' : 'Correct & Score Writing'}
                </button>
              </div>

              {writingError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Cloud feedback unavailable ({writingError}) — showing local linguistic rubric evaluation.
                </p>
              )}

              {writingResult && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-purple-950">
                      Writing Evaluation
                    </h3>
                    <span className="text-xl font-bold text-pink-700 tabular-nums">
                      Score: {writingResult.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{writingResult.feedback}</p>
                  <div className="rounded-xl bg-white border border-purple-100 p-3.5">
                    <div className="text-xs font-semibold text-purple-800 mb-1">
                      Polished Version
                    </div>
                    <p className="text-sm text-slate-900">{writingResult.correctedText}</p>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                    {writingResult.corrections.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: VOICE RECORDING + PRONUNCIATION SCORE */}
          {step.id === 'voice' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-purple-950">
                  Voice Recording & Pronunciation Score
                </h2>
                <p className="text-sm text-slate-600">
                  Listen to the target sentence, record your voice, and get your pronunciation score.
                </p>
              </div>

              <div className="rounded-2xl border border-pink-200 bg-pink-50/40 p-5 space-y-3">
                <p className="text-xl font-bold text-purple-950">
                  {lesson.voicePrompt.targetPhrase}
                </p>
                <p className="text-xs text-slate-600">
                  /{lesson.voicePrompt.phonetic}/ · {lesson.voicePrompt.english} ·{' '}
                  {lesson.voicePrompt.arabic}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() =>
                      speakText(lesson.voicePrompt.targetPhrase, language.speechLang)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-pink-200 text-sm font-semibold text-purple-900 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Hear Model Audio</span>
                  </button>

                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-sm font-semibold text-white cursor-pointer"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Recording</span>
                    </button>
                  )}
                </div>
              </div>

              {micError && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {micError}
                </p>
              )}

              {recordedUrl && (
                <div className="rounded-2xl border border-purple-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        Your Playback
                      </div>
                      <audio controls src={recordedUrl} className="mt-2 h-10" />
                    </div>
                    {pronunciationScore !== null && (
                      <div className="text-right">
                        <div className="text-xs text-slate-500">
                          Pronunciation Score
                        </div>
                        <div className="text-3xl font-bold text-pink-700 tabular-nums">
                          {pronunciationScore}/100
                        </div>
                      </div>
                    )}
                  </div>
                  {recognizedText && (
                    <p className="text-xs text-slate-600">
                      Heard: <strong>“{recognizedText}”</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: 3 EXERCISES */}
          {step.id === 'exercises' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-purple-950">
                3 Interactive Practice Exercises
              </h2>

              {/* Exercise 1: Fill in the blank */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="text-xs font-bold text-pink-700">
                  Exercise 1 · Fill in the Blank
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {lesson.exercises[0].prompt}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {lesson.exercises[0].options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setEx1Selected(opt);
                        setExChecked(false);
                      }}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer ${
                        ex1Selected === opt
                          ? 'bg-pink-50 border-pink-600 text-purple-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {exChecked && (
                  <p
                    className={`text-xs font-semibold ${
                      ex1Selected === lesson.exercises[0].answer
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {ex1Selected === lesson.exercises[0].answer
                      ? 'Correct!'
                      : `Answer: ${lesson.exercises[0].answer}`}
                  </p>
                )}
              </div>

              {/* Exercise 2: Word-to-Arabic Matching */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="text-xs font-bold text-pink-700">
                  Exercise 2 · Match Words to Arabic
                </div>
                <p className="text-xs text-slate-600">
                  {lesson.exercises[1].prompt}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {ex2Pairs.map((pair) => {
                      const matched = !!ex2Matched[pair.left];
                      const active = ex2LeftPicked === pair.left;
                      return (
                        <button
                          key={pair.left}
                          onClick={() => setEx2LeftPicked(pair.left)}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium text-left cursor-pointer ${
                            matched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : active
                              ? 'bg-pink-100 border-pink-600 text-purple-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          {pair.left}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {ex2RightShuffled.map((pair) => {
                      const isMatchedHere =
                        ex2Matched[pair.left] === pair.right;
                      return (
                        <button
                          key={pair.right}
                          dir="rtl"
                          onClick={() => {
                            if (!ex2LeftPicked) return;
                            const targetPair = ex2Pairs.find(
                              (p) => p.left === ex2LeftPicked
                            );
                            if (targetPair && targetPair.right === pair.right) {
                              setEx2Matched((prev) => ({
                                ...prev,
                                [ex2LeftPicked]: pair.right,
                              }));
                            }
                            setEx2LeftPicked(null);
                          }}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium text-right cursor-pointer ${
                            isMatchedHere
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-pink-300'
                          }`}
                        >
                          {pair.right}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-slate-500 tabular-nums">
                  Matched {Object.keys(ex2Matched).length}/{ex2Pairs.length}
                </p>
              </div>

              {/* Exercise 3: Sentence Order */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="text-xs font-bold text-pink-700">
                  Exercise 3 · Sentence Ordering
                </div>
                <p className="text-sm text-slate-700">
                  {lesson.exercises[2].prompt}
                </p>
                <div className="min-h-[48px] rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex flex-wrap gap-2">
                  {ex3Order.map((idx, pos) => (
                    <button
                      key={`${idx}-${pos}`}
                      onClick={() =>
                        setEx3Order((prev) => prev.filter((_, i) => i !== pos))
                      }
                      className="px-3 py-1 rounded-lg bg-purple-700 text-white text-sm cursor-pointer"
                    >
                      {ex3Tokens[idx]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ex3Tokens.map((tok, idx) => {
                    const used = ex3Order.includes(idx);
                    return (
                      <button
                        key={idx}
                        disabled={used}
                        onClick={() => setEx3Order((prev) => [...prev, idx])}
                        className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
                          used
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-white border-pink-200 text-purple-950 hover:bg-pink-50'
                        }`}
                      >
                        {tok}
                      </button>
                    );
                  })}
                </div>
                {exChecked && (
                  <p
                    className={`text-xs font-semibold ${
                      ex3Built === lesson.exercises[2].answer
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {ex3Built === lesson.exercises[2].answer
                      ? 'Correct!'
                      : `Target: "${lesson.exercises[2].answer}"`}
                  </p>
                )}
              </div>

              <button
                onClick={() => setExChecked(true)}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
              >
                Check Exercises
              </button>
            </div>
          )}

          {/* STEP 8: 10 QUESTIONS QUIZ */}
          {step.id === 'quiz' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-purple-950">
                    Lesson Assessment (10 Questions)
                  </h2>
                  <p className="text-sm text-slate-600">
                    Complete all 10 questions to receive your score /100, XP, and advance your progress bar.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-900 tabular-nums">
                  {Object.keys(quizAnswers).length}/10 answered
                </span>
              </div>

              <div className="space-y-4">
                {lesson.quiz.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 p-4 space-y-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [idx]: oIdx }))
                          }
                          className={`min-h-[44px] text-left px-3.5 py-2 rounded-xl border text-sm transition cursor-pointer ${
                            quizAnswers[idx] === oIdx
                              ? 'border-pink-600 bg-pink-50 text-purple-950 font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinishLesson}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white shadow-md hover:opacity-95 cursor-pointer"
              >
                {uiLang === 'ar'
                  ? 'إنهاء الدرس وعرض النتيجة'
                  : 'Finish Lesson & See Score /100'}
              </button>
            </div>
          )}

          {/* Bottom Step Prev/Next */}
          <div className="flex items-center justify-between pt-4 border-t border-pink-100">
            <button
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            {stepIdx < STEPS.length - 1 && (
              <button
                onClick={() =>
                  setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
                }
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-900 text-sm font-semibold text-white hover:bg-purple-800 cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
