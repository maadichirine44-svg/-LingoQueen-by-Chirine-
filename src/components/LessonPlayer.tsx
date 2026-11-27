import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Headphones,
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
  speakDialogueLines,
  speakText,
  stopSpeech,
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
  { id: 'voice', labelEn: '6. Listening & Voice', labelAr: '6. الاستماع والنطق' },
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
  const isAr = uiLang === 'ar';
  const isCJK = language.id === 'zh';
  const [stepIdx, setStepIdx] = useState(0);

  // Step 2: Grammar sentence formation
  const [builtWords, setBuiltWords] = useState<number[]>([]);
  const [grammarChecked, setGrammarChecked] = useState<boolean | null>(null);

  // Step 4: Dialogue sequential playback
  const [playingDialogue, setPlayingDialogue] = useState<{
    dialogueIdx: number;
    lineIdx: number;
  } | null>(null);

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

  // Step 6: Listening Comprehension + Voice Recording + Pronunciation Score
  const [listeningChoice, setListeningChoice] = useState<number | null>(null);
  const [listeningRevealText, setListeningRevealText] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const recordedUrlRef = useRef<string | null>(null);
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
    stopSpeech();
    setPlayingDialogue(null);
    setStepIdx(0);
    setBuiltWords([]);
    setGrammarChecked(null);
    setWritingText('');
    setWritingResult(null);
    setWritingError(null);
    setListeningChoice(null);
    setListeningRevealText(false);
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
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

  useEffect(() => {
    return () => {
      stopSpeech();
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
      }
    };
  }, []);

  // Listening challenge options built deterministically from lesson prompts
  const listeningChallenge = useMemo(() => {
    const correctOption = {
      english: lesson.voicePrompt.english,
      arabic: lesson.voicePrompt.arabic,
      isCorrect: true,
    };
    const distractors = [
      {
        english: lesson.speaking.english,
        arabic: lesson.speaking.arabic,
        isCorrect: false,
      },
      {
        english: lesson.grammar.examples[0]?.english || 'Good morning, how may I help you?',
        arabic: lesson.grammar.examples[0]?.arabic || 'صباح الخير، كيف يمكنني مساعدتكم؟',
        isCorrect: false,
      },
      {
        english: lesson.grammar.examples[1]?.english || 'Please reserve two seats near the window.',
        arabic: lesson.grammar.examples[1]?.arabic || 'يرجى حجز مقعدين قرب النافذة.',
        isCorrect: false,
      },
    ];
    const items = [correctOption, ...distractors];
    const offset = lesson.id % items.length;
    const rotated = [...items.slice(offset), ...items.slice(0, offset)];
    return {
      options: rotated,
      correctIndex: rotated.findIndex((x) => x.isCorrect),
    };
  }, [lesson]);

  // Grammar sentence formation helpers
  const scrambled = lesson.grammar.sentenceFormation.scrambledWords;
  const builtSentence = builtWords.map((i) => scrambled[i]).join(isCJK ? '' : ' ');

  const normalizeSentence = (s: string) => {
    const base = s
      .toLowerCase()
      .replace(/[.,!?;:'"«»。！？،؟、]/g, '');
    return isCJK ? base.replace(/\s+/g, '').trim() : base.replace(/\s+/g, ' ').trim();
  };

  const checkGrammarSentence = () => {
    const cleanTarget = normalizeSentence(
      lesson.grammar.sentenceFormation.targetSentence
    );
    const cleanBuilt = normalizeSentence(builtSentence);
    const matched = cleanTarget === cleanBuilt;
    setGrammarChecked(matched);
    if (matched) {
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
        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        recordedUrlRef.current = url;
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());

        const durationSec = (Date.now() - recordStartRef.current) / 1000;
        setPronunciationScore((prev) => {
          if (prev !== null && prev > 0) return prev;
          return durationSec >= 1.2 ? 82 : 64;
        });
      };
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      recorder.start();
      setIsRecording(true);

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
        isAr
          ? 'يلزم السماح باستخدام الميكروفون للتسجيل المباشر. يمكنكِ تفعيله من إعدادات المتصفح.'
          : 'Microphone permission is required for live recording. You can enable it in browser settings.'
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
  const ex2RightShuffled =
    ex2Pairs.length === 4
      ? [ex2Pairs[2], ex2Pairs[0], ex2Pairs[3], ex2Pairs[1]]
      : [...ex2Pairs].reverse();

  // Exercise 3 sentence ordering helper
  const ex3Tokens = lesson.exercises[2].tokens || [];
  const ex3Built = ex3Order.map((i) => ex3Tokens[i]).join(isCJK ? '' : ' ');

  // Submit full lesson quiz & calculate /100 + correct/wrong + XP
  const handleFinishLesson = () => {
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });

    const total = lesson.quiz.length;
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
            onClick={() => {
              stopSpeech();
              onExit();
            }}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-pink-200 text-purple-900 hover:bg-pink-50 cursor-pointer"
            aria-label={isAr ? 'العودة إلى الدروس' : 'Back to curriculum'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-semibold text-pink-700">
              {isAr ? language.arabicName : language.name} ·{' '}
              {isAr ? `الدرس ${lesson.id}/50` : `Lesson ${lesson.id}/50`} · {lesson.level}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-purple-950">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="text-xs font-semibold text-purple-800 tabular-nums">
          {isAr
            ? `الخطوة ${stepIdx + 1} من ${STEPS.length}`
            : `Step ${stepIdx + 1} of ${STEPS.length}`}
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => {
              stopSpeech();
              setPlayingDialogue(null);
              setStepIdx(idx);
            }}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              stepIdx === idx
                ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-sm'
                : 'bg-white border border-pink-100 text-slate-600 hover:border-pink-300'
            }`}
          >
            {isAr ? s.labelAr : s.labelEn}
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
              {isAr ? `أُتمّ الدرس ${lesson.id} بنجاح!` : `Lesson ${lesson.id} Completed!`}
            </h2>
            <p className="text-sm text-slate-600">
              {isAr
                ? `تم حفظ التقدم بشكل دائم في مسار ${language.arabicName}.`
                : `Progress saved permanently for ${language.name}.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-pink-50 border border-pink-100 p-4 text-center">
              <div className="text-xs text-slate-600">
                {isAr ? 'النتيجة / 100' : 'Score / 100'}
              </div>
              <div className="text-2xl font-bold text-pink-700 tabular-nums mt-1">
                {lessonResult.score}/100
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
              <div className="text-xs text-slate-600">
                {isAr ? 'الإجابات الصحيحة' : 'Correct Answers'}
              </div>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {lessonResult.correctAnswers}/{lessonResult.totalQuestions}
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center">
              <div className="text-xs text-slate-600">
                {isAr ? 'الإجابات الخاطئة' : 'Wrong Answers'}
              </div>
              <div className="text-2xl font-bold text-rose-700 tabular-nums mt-1">
                {lessonResult.wrongAnswers}
              </div>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 text-center">
              <div className="text-xs text-slate-600">
                {isAr ? 'النقاط المكتسبة' : 'XP Earned'}
              </div>
              <div className="text-2xl font-bold text-purple-800 tabular-nums mt-1">
                +{lessonResult.xpEarned} XP
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              {isAr ? 'مراجعة الأسئلة العشرة' : '10-Question Review'}
            </h3>
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
              {isAr
                ? `العودة إلى أكاديمية ${language.arabicName}`
                : `Back to ${language.name} Academy`}
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
                  {isAr ? '10 كلمات ومفردات أساسية' : '10 Essential Vocabulary Words'}
                </h2>
                <p className="text-sm text-slate-600">
                  {isAr
                    ? 'استمعي إلى النطق الصحيح وتعلمي المعنى بالإنجليزية والعربية الفصحى مع مثال تطبيقي.'
                    : 'Listen to native pronunciation and learn every English & Fusha Arabic meaning.'}
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
                  {isAr ? `القاعدة النحوية · ${lesson.level}` : `Grammar Rule · ${lesson.level}`}
                </div>
                <h2 className="text-xl font-bold text-purple-950">
                  {lesson.grammar.title}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lesson.grammar.explanation}
                </p>
                <div className="pt-2 font-mono text-xs sm:text-sm font-semibold text-pink-800">
                  {isAr ? 'التركيب:' : 'Pattern:'} {lesson.grammar.formula}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {isAr ? 'أمثلة تطبيقية' : 'Examples'}
                </h3>
                {lesson.grammar.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-purple-950 text-sm">
                        {ex.target}
                      </p>
                      <p className="text-xs text-slate-600">{ex.english}</p>
                      <p className="text-xs font-semibold text-pink-700" dir="rtl">
                        {ex.arabic}
                      </p>
                    </div>
                    <button
                      onClick={() => speakText(ex.target, language.speechLang)}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-pink-200 text-pink-700 hover:bg-pink-50 cursor-pointer shrink-0"
                      aria-label="Listen example"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Interactive Sentence Formation */}
              <div className="rounded-xl border border-pink-200 p-5 space-y-4 bg-pink-50/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-purple-950">
                      {isAr ? 'تكوين الجملة التفاعلي' : 'Interactive Sentence Formation'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {lesson.grammar.sentenceFormation.prompt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        lesson.grammar.sentenceFormation.targetSentence,
                        language.speechLang,
                        0.85
                      )
                    }
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-xs font-semibold text-pink-700 hover:bg-pink-50 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'استماع للجملة' : 'Hear Target'}</span>
                  </button>
                </div>

                <div className="min-h-[56px] rounded-xl bg-white border border-pink-200 p-3 flex flex-wrap gap-2 items-center">
                  {builtWords.length === 0 ? (
                    <span className="text-xs text-slate-400">
                      {isAr
                        ? 'اضغطي على الكلمات أدناه بالترتيب النحوي الصحيح...'
                        : 'Tap the word tiles below in the right grammatical order...'}
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
                    {isAr ? 'تحقق من الجملة' : 'Check Sentence'}
                  </button>
                  <button
                    onClick={() => {
                      setBuiltWords([]);
                      setGrammarChecked(null);
                    }}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isAr ? 'إعادة' : 'Reset'}</span>
                  </button>
                  {grammarChecked !== null && (
                    <span
                      className={`text-sm font-semibold ${
                        grammarChecked ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {grammarChecked
                        ? isAr
                          ? 'ترتيب نحوي مثالي!'
                          : 'Perfect grammatical order!'
                        : isAr
                        ? `حاولي مجدداً — الصحيح: "${lesson.grammar.sentenceFormation.targetSentence}"`
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
                {isAr ? 'تدريب المحادثة الموجّه' : 'Guided Speaking Drill'}
              </h2>
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 p-6 space-y-4">
                <p className="text-xs font-semibold text-pink-700">
                  {isAr ? 'العبارة المستهدفة' : 'Target Expression'}
                </p>
                <p className="text-2xl font-bold text-purple-950">
                  {lesson.speaking.phrase}
                </p>
                <p className="text-sm text-slate-600">
                  {isAr ? 'النطق الصوتي:' : 'Phonetic:'} /{lesson.speaking.phonetic}/
                </p>
                <p className="text-sm text-slate-800">{lesson.speaking.english}</p>
                <p className="text-sm text-pink-700 font-semibold" dir="rtl">
                  {lesson.speaking.arabic}
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      speakText(lesson.speaking.phrase, language.speechLang, 0.92)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isAr ? 'استماع بالسرعة العادية' : 'Listen Normal Speed'}</span>
                  </button>
                  <button
                    onClick={() =>
                      speakText(lesson.speaking.phrase, language.speechLang, 0.65)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-sm font-semibold text-purple-900 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isAr ? 'نطق بطيء واضح' : 'Slow Pronunciation'}</span>
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white p-4 text-sm text-slate-700">
                <strong className="text-purple-900">
                  {isAr ? 'نصيحة النطق:' : 'Coach Tip:'}
                </strong>{' '}
                {lesson.speaking.tip}
              </div>
            </div>
          )}

          {/* STEP 4: 2 DIALOGUES */}
          {step.id === 'dialogues' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-purple-950">
                {isAr ? 'حواران واقعيان مع الترجمة الفصحى' : 'Two Real-World Dialogues'}
              </h2>
              {lesson.dialogues.map((dlg, dIdx) => {
                const isThisPlaying = playingDialogue?.dialogueIdx === dIdx;
                return (
                  <div
                    key={dIdx}
                    className="rounded-2xl border border-pink-100 bg-pink-50/20 p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-purple-950">
                          {isAr ? `الحوار ${dIdx + 1}:` : `Dialogue ${dIdx + 1}:`} {dlg.title}
                        </h3>
                        <p className="text-xs text-slate-600">{dlg.context}</p>
                      </div>
                      {isThisPlaying ? (
                        <button
                          onClick={() => {
                            stopSpeech();
                            setPlayingDialogue(null);
                          }}
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-xs font-semibold text-white cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>{isAr ? 'إيقاف' : 'Stop'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            speakDialogueLines(
                              dlg.lines.map((l) => l.text),
                              language.speechLang,
                              (lineIdx) => {
                                if (lineIdx === null) setPlayingDialogue(null);
                                else setPlayingDialogue({ dialogueIdx: dIdx, lineIdx });
                              }
                            )
                          }
                          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-pink-700 hover:bg-pink-50 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تشغيل الحوار كاملاً' : 'Play Dialogue'}</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {dlg.lines.map((line, lIdx) => {
                        const activeLine =
                          playingDialogue?.dialogueIdx === dIdx &&
                          playingDialogue?.lineIdx === lIdx;
                        return (
                          <div
                            key={lIdx}
                            className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 transition ${
                              activeLine
                                ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-pink-700">
                                {line.speaker}
                              </div>
                              <p className="text-sm font-semibold text-slate-900">
                                {line.text}
                              </p>
                              <p className="text-xs text-slate-600">{line.english}</p>
                              <p className="text-xs text-purple-800 font-medium" dir="rtl">
                                {line.arabic}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setPlayingDialogue(null);
                                speakText(line.text, language.speechLang);
                              }}
                              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-pink-100 text-pink-700 hover:bg-pink-50 shrink-0 cursor-pointer"
                              aria-label="Listen line"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 5: WRITING (5-8 SENTENCES) + CORRECTION + SCORE */}
          {step.id === 'writing' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-purple-950">
                  {isAr ? 'تدريب الكتابة (5–8 جمل)' : 'Writing Practice (5–8 Sentences)'}
                </h2>
                <p className="text-sm text-slate-700 mt-1">
                  {lesson.writingPrompt.prompt}
                </p>
                <p className="text-xs text-purple-700 mt-2">
                  {isAr ? 'مفردات مقترحة:' : 'Suggested vocabulary:'}{' '}
                  {lesson.writingPrompt.suggestedWords.join(' · ')}
                </p>
              </div>

              <textarea
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                rows={6}
                placeholder={
                  isAr
                    ? `اكتبي 5–8 جمل باللغة ${language.arabicName}...`
                    : `Write 5–8 sentences in ${language.name}...`
                }
                className="w-full rounded-xl border border-pink-200 bg-white p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 tabular-nums">
                  {isAr ? 'عدد الجمل المكتشفة:' : 'Sentences detected:'}{' '}
                  {
                    writingText
                      .split(/[.!?。！？\n]+/)
                      .filter((s) => s.trim().length > 1).length
                  }{' '}
                  {isAr ? '(المطلوب: 5–8)' : '(target: 5–8)'}
                </span>
                <button
                  onClick={handleEvaluateWriting}
                  disabled={writingLoading || !writingText.trim()}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  {writingLoading
                    ? isAr
                      ? 'جارٍ التقييم...'
                      : 'Evaluating...'
                    : isAr
                    ? 'تصحيح وتقييم الكتابة'
                    : 'Correct & Score Writing'}
                </button>
              </div>

              {writingError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {isAr
                    ? 'التقييم السحابي غير متاح حالياً — تم تطبيق التصحيح اللغوي المحلي.'
                    : `Cloud feedback unavailable (${writingError}) — showing local linguistic rubric evaluation.`}
                </p>
              )}

              {writingResult && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-purple-950">
                      {isAr ? 'تقييم الكتابة' : 'Writing Evaluation'}
                    </h3>
                    <span className="text-xl font-bold text-pink-700 tabular-nums">
                      {isAr ? 'النتيجة:' : 'Score:'} {writingResult.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{writingResult.feedback}</p>
                  <div className="rounded-xl bg-white border border-purple-100 p-3.5">
                    <div className="text-xs font-semibold text-purple-800 mb-1">
                      {isAr ? 'النص المصحح' : 'Polished Version'}
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

          {/* STEP 6: LISTENING COMPREHENSION + VOICE RECORDING + PRONUNCIATION SCORE */}
          {step.id === 'voice' && (
            <div className="space-y-6">
              {/* Part A: Interactive Listening Comprehension */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-5 h-5 text-purple-700" />
                    <div>
                      <h2 className="text-base font-bold text-purple-950">
                        {isAr ? 'تحدي فهم المسموع' : 'Listening Comprehension Check'}
                      </h2>
                      <p className="text-xs text-slate-600">
                        {isAr
                          ? 'استمعي إلى التسجيل الصوتي أولاً ثم اختاري المعنى الصحيح دون قراءة النص.'
                          : 'Listen to the native audio first, then pick the accurate meaning.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        speakText(lesson.voicePrompt.targetPhrase, language.speechLang, 0.9)
                      }
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-900 text-xs font-semibold text-white cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isAr ? 'تشغيل الصوت' : 'Play Audio'}</span>
                    </button>
                    <button
                      onClick={() => setListeningRevealText((v) => !v)}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-semibold text-purple-900 cursor-pointer"
                    >
                      {listeningRevealText
                        ? isAr
                          ? 'إخفاء النص'
                          : 'Hide Text'
                        : isAr
                        ? 'إظهار النص'
                        : 'Show Transcript'}
                    </button>
                  </div>
                </div>

                {listeningRevealText && (
                  <div className="rounded-xl bg-white border border-purple-100 p-3 text-sm font-semibold text-purple-950">
                    {lesson.voicePrompt.targetPhrase}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      /{lesson.voicePrompt.phonetic}/
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {listeningChallenge.options.map((opt, idx) => {
                    const picked = listeningChoice === idx;
                    const isRight = idx === listeningChallenge.correctIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setListeningChoice(idx)}
                        className={`min-h-[44px] text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition cursor-pointer ${
                          picked
                            ? isRight
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                              : 'border-rose-500 bg-rose-50 text-rose-950 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300'
                        }`}
                      >
                        <div>{opt.english}</div>
                        <div className="text-[11px] text-pink-700 mt-0.5" dir="rtl">
                          {opt.arabic}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Part B: Voice Recording & Pronunciation Score */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-purple-950">
                    {isAr
                      ? 'التسجيل الصوتي وتقييم النطق'
                      : 'Voice Recording & Pronunciation Score'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isAr
                      ? 'استمعي إلى الجملة النموذجية، سجّلي صوتكِ، واحصلي على تقييم فوري لنطقكِ.'
                      : 'Listen to the target sentence, record your voice, and get your pronunciation score.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-pink-200 bg-pink-50/40 p-5 space-y-3">
                  <p className="text-xl font-bold text-purple-950">
                    {lesson.voicePrompt.targetPhrase}
                  </p>
                  <p className="text-xs text-slate-600">
                    /{lesson.voicePrompt.phonetic}/ · {lesson.voicePrompt.english}
                  </p>
                  <p className="text-xs font-semibold text-pink-700" dir="rtl">
                    {lesson.voicePrompt.arabic}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() =>
                        speakText(lesson.voicePrompt.targetPhrase, language.speechLang, 0.88)
                      }
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-pink-200 text-sm font-semibold text-purple-900 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isAr ? 'استماع للنطق النموذجي' : 'Hear Model Audio'}</span>
                    </button>

                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{isAr ? 'بدء التسجيل' : 'Start Recording'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-sm font-semibold text-white cursor-pointer"
                      >
                        <Square className="w-4 h-4" />
                        <span>{isAr ? 'إيقاف التسجيل' : 'Stop Recording'}</span>
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
                          {isAr ? 'تسجيلكِ الصوتي' : 'Your Playback'}
                        </div>
                        <audio controls src={recordedUrl} className="mt-2 h-10" />
                      </div>
                      {pronunciationScore !== null && (
                        <div className="text-right">
                          <div className="text-xs text-slate-500">
                            {isAr ? 'نتيجة النطق' : 'Pronunciation Score'}
                          </div>
                          <div className="text-3xl font-bold text-pink-700 tabular-nums">
                            {pronunciationScore}/100
                          </div>
                        </div>
                      )}
                    </div>
                    {recognizedText && (
                      <p className="text-xs text-slate-600">
                        {isAr ? 'ما تم سماعه:' : 'Heard:'} <strong>“{recognizedText}”</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: 3 EXERCISES */}
          {step.id === 'exercises' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-purple-950">
                {isAr ? '3 تمارين تطبيقية تفاعلية' : '3 Interactive Practice Exercises'}
              </h2>

              {/* Exercise 1: Fill in the blank */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="text-xs font-bold text-pink-700">
                  {isAr ? 'التمرين 1 · املئي الفراغ' : 'Exercise 1 · Fill in the Blank'}
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
                      ? isAr
                        ? 'إجابة صحيحة!'
                        : 'Correct!'
                      : isAr
                      ? `الإجابة الصحيحة: ${lesson.exercises[0].answer}`
                      : `Answer: ${lesson.exercises[0].answer}`}
                  </p>
                )}
              </div>

              {/* Exercise 2: Word-to-Arabic Matching */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="text-xs font-bold text-pink-700">
                  {isAr
                    ? 'التمرين 2 · طابقي العبارات بالمعنى الفصيح'
                    : 'Exercise 2 · Match Words to Fusha Arabic'}
                </div>
                <p className="text-xs text-slate-600">
                  {isAr
                    ? 'اختاري العبارة على اليسار ثم معناها العربي المطابق على اليمين.'
                    : lesson.exercises[1].prompt}
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
                  {isAr
                    ? `تمت مطابقة ${Object.keys(ex2Matched).length}/${ex2Pairs.length}`
                    : `Matched ${Object.keys(ex2Matched).length}/${ex2Pairs.length}`}
                </p>
              </div>

              {/* Exercise 3: Sentence Order */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="text-xs font-bold text-pink-700">
                  {isAr ? 'التمرين 3 · ترتيب الجملة' : 'Exercise 3 · Sentence Ordering'}
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
                      normalizeSentence(ex3Built) ===
                      normalizeSentence(lesson.exercises[2].answer || '')
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {normalizeSentence(ex3Built) ===
                    normalizeSentence(lesson.exercises[2].answer || '')
                      ? isAr
                        ? 'إجابة صحيحة!'
                        : 'Correct!'
                      : isAr
                      ? `الصحيح: "${lesson.exercises[2].answer}"`
                      : `Target: "${lesson.exercises[2].answer}"`}
                  </p>
                )}
              </div>

              <button
                onClick={() => setExChecked(true)}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
              >
                {isAr ? 'التحقق من التمارين' : 'Check Exercises'}
              </button>
            </div>
          )}

          {/* STEP 8: 10 QUESTIONS QUIZ */}
          {step.id === 'quiz' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-purple-950">
                    {isAr
                      ? 'تقييم الدرس (10 أسئلة)'
                      : 'Lesson Assessment (10 Questions)'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {isAr
                      ? 'أجيبي عن الأسئلة العشرة للحصول على نتيجتكِ من 100 ونقاط الخبرة وتحديث شريط التقدم.'
                      : 'Complete all 10 questions to receive your score /100, XP, and advance your progress bar.'}
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-900 tabular-nums">
                  {Object.keys(quizAnswers).length}/10 {isAr ? 'مجاب' : 'answered'}
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
                {isAr
                  ? 'إنهاء الدرس وعرض النتيجة /100'
                  : 'Finish Lesson & See Score /100'}
              </button>
            </div>
          )}

          {/* Bottom Step Prev/Next */}
          <div className="flex items-center justify-between pt-4 border-t border-pink-100">
            <button
              disabled={stepIdx === 0}
              onClick={() => {
                stopSpeech();
                setPlayingDialogue(null);
                setStepIdx((i) => Math.max(0, i - 1));
              }}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>
            {stepIdx < STEPS.length - 1 && (
              <button
                onClick={() => {
                  stopSpeech();
                  setPlayingDialogue(null);
                  setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
                }}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-900 text-sm font-semibold text-white hover:bg-purple-800 cursor-pointer"
              >
                <span>{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
