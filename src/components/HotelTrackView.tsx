import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  Mic,
  Send,
  Volume2,
} from 'lucide-react';
import { HOTEL_LESSONS, INTERVIEW_QUESTIONS, getLocalizedHotelContent } from '../data/hotelTrack';
import { HotelLesson, LanguageId } from '../types';
import { LANGUAGES } from '../utils/storage';
import { speakText } from '../utils/speech';
import { launchRoyalConfetti } from '../utils/confetti';

interface HotelTrackViewProps {
  completedLessons: number[];
  scores: Record<number, number>;
  savedCvDraft?: Record<string, string>;
  cvScore?: number;
  interviewScore?: number;
  userName: string;
  onCompleteHotelLesson: (
    lessonId: number,
    score: number,
    extras?: { cvDraft?: Record<string, string>; cvScore?: number; interviewScore?: number }
  ) => void;
}

const CATEGORIES = [
  'All',
  'Check-in',
  'Check-out',
  'Booking',
  'Room Service',
  'Angry Customer',
  'Phone',
  'Email',
  'Tourism',
  'CV Builder',
  'Job Interview',
] as const;

export const HotelTrackView: React.FC<HotelTrackViewProps> = ({
  completedLessons,
  scores,
  savedCvDraft,
  cvScore,
  interviewScore,
  userName,
  onCompleteHotelLesson,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageId>('en');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeLesson, setActiveLesson] = useState<HotelLesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // CV Builder state (Lesson 39)
  const [cvData, setCvData] = useState<Record<string, string>>(
    savedCvDraft || {
      fullName: userName,
      targetRole: 'Front Desk & VIP Guest Relations Specialist',
      summary: '',
      experience: '',
      languages: 'Arabic (Native), French (Fluent), English (Professional)',
      skills: 'Opera PMS, Guest Check-in/Check-out, Conflict De-escalation, Concierge',
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

    // Deterministic offline CV rubric
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
                Hotel Track · Lesson {activeLesson.id}/40 · {activeLesson.category}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-950">
                {activeLesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Practice in:</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as LanguageId)}
              className="min-h-[40px] rounded-xl border border-pink-200 bg-pink-50/50 px-3 text-xs font-semibold text-purple-950"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.nativeName})
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
                  Fillable Hospitality CV + Correction & Score
                </h3>
                <p className="text-sm text-slate-600">
                  Fill in your hotel CV fields and receive instant correction & score /100.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
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
                  Target Hospitality Role
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
                  Professional Summary
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
                  Hotel Work Experience & Achievements
                </label>
                <textarea
                  rows={3}
                  value={cvData.experience}
                  onChange={(e) =>
                    setCvData({ ...cvData, experience: e.target.value })
                  }
                  placeholder="e.g., Front Desk Agent at Royal Hotel (2023-2025) — managed VIP check-ins and room upgrades..."
                  className="w-full rounded-xl border border-pink-200 p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Languages Spoken
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
                  Key Hospitality Skills
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
              {cvLoading ? 'Reviewing CV...' : 'Correct & Score My CV (/100)'}
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
                    Real Hotel Job Interview Role-Play ({langMeta.name})
                  </h3>
                  <p className="text-xs text-slate-600">
                    Answer 5 live questions from the Hotel General Manager.
                  </p>
                </div>
              </div>
              <select
                value={interviewRole}
                onChange={(e) => setInterviewRole(e.target.value)}
                className="min-h-[40px] rounded-xl border border-pink-200 px-3 text-xs font-semibold text-purple-900"
              >
                <option>Front Desk Receptionist</option>
                <option>VIP Concierge</option>
                <option>Guest Relations Manager</option>
                <option>Room Service Supervisor</option>
              </select>
            </div>

            {/* Completed log */}
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
                    <span>Dictate Answer</span>
                  </button>

                  <button
                    onClick={handleSubmitInterviewAnswer}
                    disabled={interviewLoading || !interviewAnswer.trim()}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {interviewLoading ? 'Evaluating...' : 'Submit Answer'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2">
                <h4 className="text-xl font-bold text-emerald-950">
                  Interview Completed! Final Hiring Score:{' '}
                  <span className="tabular-nums">
                    {Math.round(
                      interviewLog.reduce((s, x) => s + x.score, 0) /
                        interviewLog.length
                    )}
                    /100
                  </span>
                </h4>
                <p className="text-sm text-emerald-800">
                  Outstanding hospitality poise! You are ready for 5-star international interviews.
                </p>
                <button
                  onClick={() => {
                    setInterviewLog([]);
                    setInterviewStep(0);
                  }}
                  className="mt-2 min-h-[40px] px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-900 cursor-pointer"
                >
                  Practice Interview Again
                </button>
              </div>
            )}
          </div>
        ) : (
          /* REGULAR HOTEL LESSONS 1-38 */
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-4">
              <p className="text-sm text-slate-700">{activeLesson.scenario}</p>
              <h3 className="text-base font-bold text-purple-950">
                Key Hospitality Phrases ({langMeta.name})
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

            {/* Dialogue */}
            <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-3">
              <h3 className="text-base font-bold text-purple-950">
                5-Star Frontline Dialogue
              </h3>
              {displayDialogue.map((line, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-pink-700">
                      {line.speaker}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {line.text}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{line.english}</p>
                    <p className="text-xs text-purple-800 mt-0.5" dir="rtl">
                      {line.arabic}
                    </p>
                  </div>
                  <button
                    onClick={() => speakText(line.text, langMeta.speechLang)}
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
                Hospitality Scenario Check
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
                Complete Lesson & Save Score
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
              40 Specialized Hospitality Lessons
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Hotel & Hospitality Career Track
            </h1>
            <p className="text-sm text-pink-100 mt-1 max-w-2xl">
              Master Check-in, Check-out, Booking, Room Service, Angry Guests, Phone, Emails, Tourism, Fillable CV + Correction, and Live Job Interview Role-Play.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-right">
            <div className="text-xs text-pink-100">Completed</div>
            <div className="text-2xl font-bold tabular-nums">
              {completedLessons.length}/40
            </div>
          </div>
        </div>
      </div>

      {/* Special Spotlight Cards for CV & Interview + Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveLesson(HOTEL_LESSONS[38])}
          className="text-left rounded-2xl bg-white border border-pink-200 p-5 hover:border-pink-400 transition shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-700">Lesson 39 · Career</span>
            {cvScore !== undefined && (
              <span className="text-xs font-bold text-purple-900 tabular-nums">
                Last Score: {cvScore}/100
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-purple-950 mt-1">
            Fillable Hospitality CV + Correction
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Draft your luxury hotel CV and get grammar polish + score /100.
          </p>
        </button>

        <button
          onClick={() => setActiveLesson(HOTEL_LESSONS[39])}
          className="text-left rounded-2xl bg-white border border-purple-200 p-5 hover:border-purple-400 transition shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">Lesson 40 · Interview</span>
            {interviewScore !== undefined && (
              <span className="text-xs font-bold text-pink-700 tabular-nums">
                Last Score: {interviewScore}/100
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-purple-950 mt-1">
            Real Job Interview Role-Play + Score
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            5-question simulation with the General Manager & hiring score /100.
          </p>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              categoryFilter === cat
                ? 'bg-purple-900 text-white'
                : 'bg-white border border-pink-100 text-slate-700 hover:border-pink-300'
            }`}
          >
            {cat}
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
                    Lesson {lesson.id} · {lesson.category}
                  </span>
                  {done && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {sc !== undefined ? `${sc}/100` : 'Done'}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-purple-950 mt-1.5">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {lesson.scenario}
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-800">
                Open Lesson →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
