import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Mic,
  Play,
  Send,
  Square,
  Star,
  Volume2,
} from 'lucide-react';
import {
  ALGERIA_ESTABLISHMENT_TYPES,
  ALGERIA_HOTEL_CLASSIFICATIONS,
  HOTEL_LESSONS,
  INTERVIEW_QUESTIONS,
  getLocalizedHotelContent,
} from '../data/hotelTrack';
import { HotelLesson, LanguageId, UILanguage } from '../types';
import { LANGUAGES } from '../utils/storage';
import { speakDialogueLines, speakText, stopSpeech } from '../utils/speech';
import { launchRoyalConfetti } from '../utils/confetti';

interface HotelTrackViewProps {
  completedLessons: number[];
  scores: Record<number, number>;
  savedCvDraft?: Record<string, string>;
  cvScore?: number;
  interviewScore?: number;
  userName: string;
  uiLang: UILanguage;
  onCompleteHotelLesson: (
    lessonId: number,
    score: number,
    extras?: { cvDraft?: Record<string, string>; cvScore?: number; interviewScore?: number }
  ) => void;
}

const CATEGORIES: Array<{ id: string; ar: string }> = [
  { id: 'All', ar: 'الكل' },
  { id: 'Check-in', ar: '1. تسجيل الوصول' },
  { id: 'Room Service', ar: '2. خدمة الغرف' },
  { id: 'Breakfast', ar: '3. الإفطار' },
  { id: 'Check-out', ar: '4. تسجيل المغادرة' },
  { id: 'Booking', ar: 'الحجز' },
  { id: 'Angry Customer', ar: 'شكاوى الضيوف' },
  { id: 'Phone', ar: 'الهاتف' },
  { id: 'Email', ar: 'البريد الإلكتروني' },
  { id: 'Tourism', ar: 'السياحة' },
  { id: 'CV Builder', ar: 'السيرة الذاتية' },
  { id: 'Job Interview', ar: 'مقابلة العمل' },
];

export const HotelTrackView: React.FC<HotelTrackViewProps> = ({
  completedLessons,
  scores,
  savedCvDraft,
  cvScore,
  interviewScore,
  userName,
  uiLang,
  onCompleteHotelLesson,
}) => {
  const isAr = uiLang === 'ar';
  const [selectedLang, setSelectedLang] = useState<LanguageId>('en');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeLesson, setActiveLesson] = useState<HotelLesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeDialogueLine, setActiveDialogueLine] = useState<number | null>(null);
  const [showClassificationPanel, setShowClassificationPanel] = useState(true);

  // CV Builder state (Lesson 39)
  const [cvData, setCvData] = useState<Record<string, string>>(
    savedCvDraft || {
      fullName: userName,
      targetRole: 'Front Desk & Guest Relations Specialist',
      summary: '',
      experience: '',
      languages: 'Arabic (Fusha Native), French (Fluent), English (Professional)',
      skills: 'Opera PMS, Check-in & Check-out, Guest Care, Room Service Coordination',
      education: 'Diploma in Hospitality & Tourism Management',
    }
  );
  const [cvLoading, setCvLoading] = useState(false);
  const [cvFeedback, setCvFeedback] = useState<{
    score: number;
    polishedSummary: string;
    corrections: string[];
    overallFeedback: string;
  } | null>(null);

  // Job Interview Role-Play state (Lesson 40)
  const [interviewRole, setInterviewRole] = useState('Front Desk Receptionist');
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewLog, setInterviewLog] = useState<
    Array<{
      question: string;
      answer: string;
      score: number;
      feedback: string;
      polishedAnswer: string;
      reaction: string;
    }>
  >([]);

  const langMeta = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[1];

  const filteredLessons =
    categoryFilter === 'All'
      ? HOTEL_LESSONS
      : HOTEL_LESSONS.filter((l) => l.category === categoryFilter);

  const handleEvaluateCV = async () => {
    setCvLoading(true);
    try {
      if (navigator.onLine) {
        const res = await fetch('/api/gemini/evaluate-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvData, targetLanguage: langMeta.name }),
        });
        if (res.ok) {
          const data = await res.json();
          setCvFeedback(data);
          onCompleteHotelLesson(39, data.score, {
            cvDraft: cvData,
            cvScore: data.score,
          });
          launchRoyalConfetti();
          setCvLoading(false);
          return;
        }
      }
    } catch {
      // fall through to deterministic hospitality CV rubric
    }

    const filledFields = Object.values(cvData).filter((v) => v.trim().length > 10).length;
    const hasMetrics = /\d+|%|guest|vip|hotel|service/i.test(
      `${cvData.summary} ${cvData.experience}`
    );
    const computedScore = Math.min(
      96,
      Math.max(45, 42 + filledFields * 7 + (hasMetrics ? 12 : 0))
    );
    const corrections: string[] = [];
    if (cvData.summary.trim().length < 40) {
      corrections.push(
        'Expand your Professional Summary to 2–3 impactful sentences highlighting guest satisfaction and languages.'
      );
    }
    if (cvData.experience.trim().length < 40) {
      corrections.push(
        'Add measurable hospitality achievements (e.g., "Managed 60+ daily check-ins with 98% guest satisfaction").'
      );
    }
    if (corrections.length === 0) {
      corrections.push(
        'Strong luxury hospitality framing! Quantify one additional achievement for extra impact.'
      );
    }

    const result = {
      score: computedScore,
      polishedSummary: `Polished multilingual ${cvData.targetRole} skilled in 5-star guest relations, reservation management, and calm complaint resolution.`,
      corrections,
      overallFeedback:
        'Your hospitality CV is clear, structured, and well-aligned with international hotel hiring standards.',
    };
    setCvFeedback(result);
    onCompleteHotelLesson(39, computedScore, {
      cvDraft: cvData,
      cvScore: computedScore,
    });
    launchRoyalConfetti();
    setCvLoading(false);
  };

  const questionsForInterview = INTERVIEW_QUESTIONS[selectedLang];

  const handleSubmitInterviewAnswer = async () => {
    if (!interviewAnswer.trim()) return;
    const currentQ = questionsForInterview[interviewStep];
    setInterviewLoading(true);

    let stepData = {
      score: 82,
      feedback: 'Warm, structured hospitality answer with clear guest empathy.',
      polishedAnswer: interviewAnswer,
      interviewerReaction: 'Thank you for that thoughtful response.',
    };

    try {
      if (navigator.onLine) {
        const res = await fetch('/api/gemini/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answer: interviewAnswer,
            question: currentQ,
            step: interviewStep + 1,
            totalSteps: questionsForInterview.length,
            targetLanguage: langMeta.name,
            role: interviewRole,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          stepData = {
            score: data.score,
            feedback: data.feedback,
            polishedAnswer: data.polishedAnswer,
            interviewerReaction: data.interviewerReaction,
          };
        }
      } else {
        const words = interviewAnswer.trim().split(/\s+/).length;
        stepData.score = Math.min(95, Math.max(55, 52 + words * 2));
      }
    } catch {
      const words = interviewAnswer.trim().split(/\s+/).length;
      stepData.score = Math.min(95, Math.max(55, 52 + words * 2));
    }

    const nextLog = [
      ...interviewLog,
      {
        question: currentQ,
        answer: interviewAnswer,
        score: stepData.score,
        feedback: stepData.feedback,
        polishedAnswer: stepData.polishedAnswer,
        reaction: stepData.interviewerReaction,
      },
    ];
    setInterviewLog(nextLog);
    setInterviewAnswer('');
    setInterviewLoading(false);

    if (interviewStep < questionsForInterview.length - 1) {
      setInterviewStep((s) => s + 1);
    } else {
      const avg = Math.round(
        nextLog.reduce((sum, item) => sum + item.score, 0) / nextLog.length
      );
      onCompleteHotelLesson(40, avg, { interviewScore: avg });
      launchRoyalConfetti();
    }
  };

  if (activeLesson) {
    const localized = getLocalizedHotelContent(activeLesson.id, selectedLang);
    const displayPhrases = localized ? localized.phrases : activeLesson.phrases;
    const displayDialogue = localized ? localized.dialogue : activeLesson.dialogue;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopSpeech();
                setActiveDialogueLine(null);
                setActiveLesson(null);
                setQuizSubmitted(false);
                setQuizAnswers({});
              }}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-pink-200 text-purple-900 hover:bg-pink-50 cursor-pointer"
              aria-label="Back to Hotel Track"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-semibold text-pink-700">
                {isAr
                  ? `مسار الفندقة · الدرس ${activeLesson.id}/40 · ${activeLesson.category}`
                  : `Hotel Track · Lesson ${activeLesson.id}/40 · ${activeLesson.category}`}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-950">
                {activeLesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">
              {isAr ? 'التدرب باللغة:' : 'Practice in:'}
            </label>
            <select
              value={selectedLang}
              onChange={(e) => {
                stopSpeech();
                setActiveDialogueLine(null);
                setSelectedLang(e.target.value as LanguageId);
              }}
              className="min-h-[40px] rounded-xl border border-pink-200 bg-pink-50/50 px-3 text-xs font-semibold text-purple-950"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {isAr ? l.arabicName : l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LESSON 39: CV BUILDER */}
        {activeLesson.isCV ? (
          <div className="rounded-2xl bg-white border border-pink-100 p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-pink-600" />
              <div>
                <h3 className="text-lg font-bold text-purple-950">
                  {isAr
                    ? 'السيرة الذاتية الفندقية + التصحيح والتقييم'
                    : 'Fillable Hospitality CV + Correction & Score'}
                </h3>
                <p className="text-sm text-slate-600">
                  {isAr
                    ? 'املئي حقول السيرة الذاتية للحصول على تصحيح فوري ودرجة من 100.'
                    : 'Fill in your hotel CV fields and receive instant correction & score /100.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  value={cvData.fullName}
                  onChange={(e) =>
                    setCvData({ ...cvData, fullName: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-pink-200 px-3.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'الوظيفة الفندقية المستهدفة' : 'Target Hospitality Role'}
                </label>
                <input
                  value={cvData.targetRole}
                  onChange={(e) =>
                    setCvData({ ...cvData, targetRole: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-pink-200 px-3.5 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'الملخص المهني' : 'Professional Summary'}
                </label>
                <textarea
                  rows={3}
                  value={cvData.summary}
                  onChange={(e) =>
                    setCvData({ ...cvData, summary: e.target.value })
                  }
                  placeholder="Describe your hospitality experience, language skills, and guest-first mindset..."
                  className="w-full rounded-xl border border-pink-200 p-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'الخبرة الفندقية والإنجازات' : 'Hotel Work Experience & Achievements'}
                </label>
                <textarea
                  rows={3}
                  value={cvData.experience}
                  onChange={(e) =>
                    setCvData({ ...cvData, experience: e.target.value })
                  }
                  placeholder="e.g., Front Desk Agent at 5-Star Hotel in Algiers (2023-2025) — managed VIP check-ins and room upgrades..."
                  className="w-full rounded-xl border border-pink-200 p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'اللغات المتقنة' : 'Languages Spoken'}
                </label>
                <input
                  value={cvData.languages}
                  onChange={(e) =>
                    setCvData({ ...cvData, languages: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-pink-200 px-3.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'المهارات الفندقية الأساسية' : 'Key Hospitality Skills'}
                </label>
                <input
                  value={cvData.skills}
                  onChange={(e) =>
                    setCvData({ ...cvData, skills: e.target.value })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-pink-200 px-3.5 text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleEvaluateCV}
              disabled={cvLoading}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
            >
              {cvLoading
                ? isAr
                  ? 'جارٍ مراجعة السيرة الذاتية...'
                  : 'Reviewing CV...'
                : isAr
                ? 'تصحيح وتقييم السيرة الذاتية (/100)'
                : 'Correct & Score My CV (/100)'}
            </button>

            {cvFeedback && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-purple-950">HR Director CV Review</h4>
                  <span className="text-2xl font-bold text-pink-700 tabular-nums">
                    {cvFeedback.score}/100
                  </span>
                </div>
                <p className="text-sm text-slate-700">{cvFeedback.overallFeedback}</p>
                <div className="rounded-xl bg-white border border-purple-100 p-3.5">
                  <div className="text-xs font-semibold text-purple-800 mb-1">
                    Polished Professional Summary
                  </div>
                  <p className="text-sm text-slate-900">{cvFeedback.polishedSummary}</p>
                </div>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {cvFeedback.corrections.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : activeLesson.isInterview ? (
          /* LESSON 40: REAL JOB INTERVIEW ROLE-PLAY */
          <div className="rounded-2xl bg-white border border-pink-100 p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-purple-700" />
                <div>
                  <h3 className="text-lg font-bold text-purple-950">
                    {isAr
                      ? `مقابلة عمل فندقية حقيقية (${langMeta.arabicName})`
                      : `Real Hotel Job Interview Role-Play (${langMeta.name})`}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'أجيبي عن 5 أسئلة مباشرة من المدير العام للفندق.'
                      : 'Answer 5 live questions from the Hotel General Manager.'}
                  </p>
                </div>
              </div>
              <select
                value={interviewRole}
                onChange={(e) => setInterviewRole(e.target.value)}
                className="min-h-[40px] rounded-xl border border-pink-200 px-3 text-xs font-semibold text-purple-90"
              >
                <option>Front Desk Receptionist</option>
                <option>VIP Concierge</option>
                <option>Guest Relations Manager</option>
                <option>Room Service Supervisor</option>
              </select>
            </div>

            {interviewLog.map((entry, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800">
                    Question {idx + 1}: {entry.question}
                  </span>
                  <span className="text-sm font-bold text-pink-700 tabular-nums">
                    {entry.score}/100
                  </span>
                </div>
                <p className="text-sm text-slate-800">
                  <strong>Your Answer:</strong> {entry.answer}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>HR Feedback:</strong> {entry.feedback}
                </p>
                <p className="text-xs text-purple-900">
                  <strong>Polished Phrasing:</strong> {entry.polishedAnswer}
                </p>
              </div>
            ))}

            {interviewLog.length < questionsForInterview.length ? (
              <div className="rounded-2xl border border-pink-200 bg-pink-50/40 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-pink-700">
                      Question {interviewStep + 1} of {questionsForInterview.length}
                    </div>
                    <p className="text-base font-bold text-purple-950 mt-1">
                      {questionsForInterview[interviewStep]}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      speakText(questionsForInterview[interviewStep], langMeta.speechLang)
                    }
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-700 shrink-0 cursor-pointer"
                    aria-label="Hear interview question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={interviewAnswer}
                  onChange={(e) => setInterviewAnswer(e.target.value)}
                  placeholder={`Type your interview answer in ${langMeta.name}...`}
                  className="w-full rounded-xl border border-pink-200 bg-white p-3.5 text-sm"
                />

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const SpeechRec =
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).SpeechRecognition ||
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).webkitSpeechRecognition;
                      if (!SpeechRec) return;
                      const rec = new SpeechRec();
                      rec.lang = langMeta.speechLang;
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      rec.onresult = (e: any) => {
                        const txt = e.results?.[0]?.[0]?.transcript || '';
                        setInterviewAnswer((prev) => (prev ? `${prev} ${txt}` : txt));
                      };
                      rec.start();
                    }}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-pink-200 bg-white text-xs font-semibold text-purple-900 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isAr ? 'إملاء الإجابة صوتياً' : 'Dictate Answer'}</span>
                  </button>

                  <button
                    onClick={handleSubmitInterviewAnswer}
                    disabled={interviewLoading || !interviewAnswer.trim()}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {interviewLoading
                        ? isAr
                          ? 'جارٍ التقييم...'
                          : 'Evaluating...'
                        : isAr
                        ? 'إرسال الإجابة'
                        : 'Submit Answer'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2">
                <h4 className="text-xl font-bold text-emerald-950">
                  {isAr ? 'اكتملت المقابلة! النتيجة النهائية:' : 'Interview Completed! Final Hiring Score:'}{' '}
                  <span className="tabular-nums">
                    {Math.round(
                      interviewLog.reduce((s, x) => s + x.score, 0) /
                        interviewLog.length
                    )}
                    /100
                  </span>
                </h4>
                <p className="text-sm text-emerald-800">
                  {isAr
                    ? 'أداء فندقي متميز! أنتِ مستعدة لمقابلات العمل في الفنادق الراقية.'
                    : 'Outstanding hospitality poise! You are ready for 5-star international interviews.'}
                </p>
                <button
                  onClick={() => {
                    setInterviewLog([]);
                    setInterviewStep(0);
                  }}
                  className="mt-2 min-h-[40px] px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-900 cursor-pointer"
                >
                  {isAr ? 'إعادة التدريب على المقابلة' : 'Practice Interview Again'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* REGULAR HOTEL LESSONS 1-38 */
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-4">
              <p className="text-sm text-slate-700">
                {isAr && activeLesson.scenarioAr ? activeLesson.scenarioAr : activeLesson.scenario}
              </p>
              <h3 className="text-base font-bold text-purple-950">
                {isAr
                  ? `العبارات الفندقية الأساسية (${langMeta.arabicName})`
                  : `Key Hospitality Phrases (${langMeta.name})`}
              </h3>
              <div className="space-y-3">
                {displayPhrases.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-pink-100 bg-pink-50/30 p-4 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-purple-950">{p.target}</p>
                      <p className="text-xs text-slate-600">{p.english}</p>
                      <p className="text-xs font-semibold text-pink-700" dir="rtl">
                        {p.arabic}
                      </p>
                    </div>
                    <button
                      onClick={() => speakText(p.target, langMeta.speechLang)}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-700 shrink-0 cursor-pointer"
                      aria-label="Listen phrase"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dialogue with Sequential Playback */}
            <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-pink-50">
                <h3 className="text-base font-bold text-purple-950">
                  {isAr ? `الحوار الفندقي (${activeLesson.category})` : `Hotel Dialogue · ${activeLesson.category}`}
                </h3>
                {activeDialogueLine !== null ? (
                  <button
                    onClick={() => {
                      stopSpeech();
                      setActiveDialogueLine(null);
                    }}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-xs font-semibold text-white cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إيقاف' : 'Stop'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      speakDialogueLines(
                        displayDialogue.map((d) => d.text),
                        langMeta.speechLang,
                        setActiveDialogueLine
                      )
                    }
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-xs font-semibold text-pink-700 hover:bg-pink-100 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تشغيل الحوار كاملاً' : 'Play Full Dialogue'}</span>
                  </button>
                )}
              </div>

              {displayDialogue.map((line, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 transition ${
                    activeDialogueLine === idx
                      ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-pink-700">
                      {line.speaker}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {line.text}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{line.english}</p>
                    <p className="text-xs text-purple-800 mt-0.5 font-medium" dir="rtl">
                      {line.arabic}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveDialogueLine(null);
                      speakText(line.text, langMeta.speechLang);
                    }}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-pink-100 text-pink-700 shrink-0 cursor-pointer"
                    aria-label="Listen line"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Scenario Quiz */}
            <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-purple-950">
                {isAr ? 'اختبار الموقف الفندقي' : 'Hospitality Scenario Check'}
              </h3>
              {activeLesson.quiz.map((q, qIdx) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() =>
                          setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                        }
                        className={`min-h-[44px] text-left px-3.5 py-2 rounded-xl border text-sm cursor-pointer ${
                          quizAnswers[qIdx] === oIdx
                            ? 'border-pink-600 bg-pink-50 font-semibold text-purple-950'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {quizSubmitted && (
                    <p className="text-xs text-purple-900 bg-purple-50 rounded-lg p-2.5">
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              <button
                onClick={() => {
                  let correct = 0;
                  activeLesson.quiz.forEach((q, idx) => {
                    if (quizAnswers[idx] === q.correctIndex) correct++;
                  });
                  const score = Math.round(
                    (correct / Math.max(1, activeLesson.quiz.length)) * 100
                  );
                  setQuizSubmitted(true);
                  onCompleteHotelLesson(activeLesson.id, score);
                  launchRoyalConfetti();
                }}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white cursor-pointer"
              >
                {isAr ? 'إنهاء الدرس وحفظ النتيجة' : 'Complete Lesson & Save Score'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-pink-100">
              {isAr
                ? '40 درساً متخصصاً في الفندقة · تصنيف الجزائر'
                : '40 Specialized Hospitality Lessons · Algeria Classification'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {isAr ? 'مسار الفندقة والضيافة المهني' : 'Hotel & Hospitality Career Track'}
            </h1>
            <p className="text-sm text-pink-100 mt-1 max-w-2xl">
              {isAr
                ? 'حوارات الفندقة المرتبة: تسجيل الوصول، خدمة الغرف، الإفطار، تسجيل المغادرة، إضافةً إلى تصنيف الفنادق في الجزائر، السيرة الذاتية ومقابلة العمل.'
                : 'Ordered core hotel dialogues: Check-in, Room Service, Breakfast, Check-out, plus Hotel Classification in Algeria, Fillable CV & Live Job Interview.'}
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-right">
            <div className="text-xs text-pink-100">
              {isAr ? 'الدروس المكتملة' : 'Completed'}
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {completedLessons.length}/40
            </div>
          </div>
        </div>
      </div>

      {/* Algeria Hotel Classification & Establishment Types */}
      <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-950">
                {isAr
                  ? 'تصنيف الفنادق وأنواع مؤسسات الإيواء في الجزائر'
                  : 'Hotel Classification in Algeria & Establishment Types'}
              </h2>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'التصنيف الرسمي المعتمد في الجزائر بالنجوم وأنواع المؤسسات الفندقية باللغة العربية الفصحى.'
                  : 'Official Algerian star classification (1 to 5 stars) and hospitality establishment types in Fusha Arabic.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowClassificationPanel((v) => !v)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-pink-200 text-xs font-semibold text-purple-900 hover:bg-pink-50 cursor-pointer"
          >
            {showClassificationPanel
              ? isAr
                ? 'إخفاء التصنيف'
                : 'Hide Guide'
              : isAr
              ? 'عرض التصنيف'
              : 'Show Guide'}
          </button>
        </div>

        {showClassificationPanel && (
          <div className="space-y-5">
            {/* 5-star down to 1-star Algeria classification */}
            <div>
              <h3 className="text-sm font-bold text-purple-950 mb-3">
                {isAr
                  ? 'تصنيف الفنادق في الجزائر (5 نجوم إلى نجمة واحدة)'
                  : 'Hotel Star Classification in Algeria (5 Stars → 1 Star)'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {ALGERIA_HOTEL_CLASSIFICATIONS.map((item) => (
                  <div
                    key={item.stars}
                    className="rounded-xl border border-pink-100 bg-pink-50/30 p-3.5 space-y-2"
                  >
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: item.stars }).map((_, sIdx) => (
                        <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <div className="text-sm font-bold text-purple-950">
                      {item.labelEn}
                    </div>
                    <div className="text-xs font-bold text-pink-700" dir="rtl">
                      {item.labelAr}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isAr ? item.descriptionAr : item.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Exact Establishment Types */}
            <div>
              <h3 className="text-sm font-bold text-purple-950 mb-3">
                {isAr
                  ? 'أنواع مؤسسات الإيواء الفندقي في الجزائر'
                  : 'Types of Hotel & Lodging Establishments in Algeria'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {ALGERIA_ESTABLISHMENT_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className="rounded-xl border border-purple-100 bg-purple-50/40 p-3.5 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-purple-950">
                          {type.term}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakText(
                              type.term,
                              type.term.includes('é') || type.term.includes('Touristique')
                                ? 'fr-FR'
                                : 'en-GB'
                            )
                          }
                          className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer"
                          aria-label={`Listen ${type.term}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-base font-extrabold text-pink-700 mt-1" dir="rtl">
                        {type.arabic}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isAr ? type.descriptionAr : type.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Special Spotlight Cards for CV & Interview + Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveLesson(HOTEL_LESSONS[38])}
          className="text-left rounded-2xl bg-white border border-pink-200 p-5 hover:border-pink-400 transition shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-700">
              {isAr ? 'الدرس 39 · المسار المهني' : 'Lesson 39 · Career'}
            </span>
            {cvScore !== undefined && (
              <span className="text-xs font-bold text-purple-900 tabular-nums">
                {isAr ? `آخر نتيجة: ${cvScore}/100` : `Last Score: ${cvScore}/100`}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-purple-950 mt-1">
            {isAr
              ? 'السيرة الذاتية الفندقية القابلة للتعبئة + التصحيح'
              : 'Fillable Hospitality CV + Correction'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {isAr
              ? 'صمّمي سيرتكِ الذاتية الفندقية واحصلي على تصحيح لغوي وتقييم من 100.'
              : 'Draft your hotel CV and get grammar polish + score /100.'}
          </p>
        </button>

        <button
          onClick={() => setActiveLesson(HOTEL_LESSONS[39])}
          className="text-left rounded-2xl bg-white border border-purple-200 p-5 hover:border-purple-400 transition shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">
              {isAr ? 'الدرس 40 · مقابلة العمل' : 'Lesson 40 · Interview'}
            </span>
            {interviewScore !== undefined && (
              <span className="text-xs font-bold text-pink-700 tabular-nums">
                {isAr ? `آخر نتيجة: ${interviewScore}/100` : `Last Score: ${interviewScore}/100`}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-purple-950 mt-1">
            {isAr
              ? 'محاكاة مقابلة عمل فندقية حقيقية + التقييم'
              : 'Real Job Interview Role-Play + Score'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {isAr
              ? 'محاكاة من 5 أسئلة مع المدير العام للفندق ودرجة من 100.'
              : '5-question simulation with the General Manager & hiring score /100.'}
          </p>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-purple-900 text-white'
                : 'bg-white border border-pink-100 text-slate-700 hover:border-pink-300'
            }`}
          >
            {isAr ? cat.ar : cat.id}
          </button>
        ))}
      </div>

      {/* 40 Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const done = completedLessons.includes(lesson.id);
          const sc = scores[lesson.id];
          return (
            <button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className="text-left rounded-2xl bg-white border border-pink-100 p-5 hover:border-pink-400 transition shadow-sm flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-pink-700">
                    {isAr ? `الدرس ${lesson.id}` : `Lesson ${lesson.id}`} · {lesson.category}
                  </span>
                  {done && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {sc !== undefined ? `${sc}/100` : isAr ? 'مكتمل' : 'Done'}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-purple-950 mt-1.5">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {isAr && lesson.scenarioAr ? lesson.scenarioAr : lesson.scenario}
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-800">
                {isAr ? 'فتح الدرس ←' : 'Open Lesson →'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
