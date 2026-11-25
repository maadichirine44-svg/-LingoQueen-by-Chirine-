import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Clock, RotateCcw, Trophy, X, XCircle } from 'lucide-react';
import {
  EvaluationResult,
  FinalExamResult,
  LanguageMeta,
  QuizQuestion,
} from '../types';
import { getEvaluationBand } from '../utils/storage';
import { launchRoyalConfetti } from '../utils/confetti';

interface ExamModalProps {
  mode: 'evaluation' | 'final';
  checkpoint?: number; // 10, 20, 30, 40, 50
  language: LanguageMeta;
  questions: QuizQuestion[];
  onCompleteEvaluation?: (result: EvaluationResult) => void;
  onCompleteFinal?: (result: FinalExamResult) => void;
  onOpenCertificate?: (result: FinalExamResult) => void;
  onClose: () => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  mode,
  checkpoint = 10,
  language,
  questions,
  onCompleteEvaluation,
  onCompleteFinal,
  onOpenCertificate,
  onClose,
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(mode === 'final' ? 90 : 0);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [finalResult, setFinalResult] = useState<FinalExamResult | null>(null);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);

    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
    });

    const total = questions.length;
    const score = Math.round((correct / Math.max(1, total)) * 100);

    if (mode === 'evaluation') {
      const band = getEvaluationBand(score);
      const passed = score >= 60;
      const result: EvaluationResult = {
        checkpoint,
        score,
        correctAnswers: correct,
        totalQuestions: total,
        band,
        passed,
        completedAt: new Date().toISOString(),
      };
      setEvalResult(result);
      if (passed) launchRoyalConfetti();
      onCompleteEvaluation?.(result);
    } else {
      const passed = score >= 70;
      const timeUsedSeconds = 90 - secondsLeft;
      const result: FinalExamResult = {
        score,
        correctAnswers: correct,
        totalQuestions: total,
        timeUsedSeconds,
        passed,
        xpAwarded: passed ? 500 : 0,
        certificateId: passed
          ? `LQ-${language.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
          : undefined,
        completedAt: new Date().toISOString(),
      };
      setFinalResult(result);
      if (passed) launchRoyalConfetti();
      onCompleteFinal?.(result);
    }
  };

  useEffect(() => {
    if (mode !== 'final' || submitted) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, submitted, secondsLeft]);

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setEvalResult(null);
    setFinalResult(null);
    setSecondsLeft(mode === 'final' ? 90 : 0);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-pink-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <div>
            <p className="text-xs font-semibold text-pink-700">
              {language.name} ({language.nativeName}) ·{' '}
              {mode === 'evaluation'
                ? `Checkpoint Lessons ${checkpoint - 9}–${checkpoint}`
                : 'Final Mastery Exam (A1–C2)'}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-purple-950">
              {mode === 'evaluation'
                ? `Level Evaluation (${questions.length} Questions · /100)`
                : `Final Exam (${questions.length} Questions · 90 Seconds)`}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {mode === 'final' && !submitted && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold tabular-nums border ${
                  secondsLeft <= 20
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-purple-100 text-purple-900 border-purple-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{secondsLeft}s</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Close exam"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!submitted ? (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span>
                  {mode === 'evaluation'
                    ? 'Score 60/100 or higher to unlock the next level tier.'
                    : 'Score 70% or higher within 90 seconds to earn +500 XP, Golden Badge & Certificate.'}
                </span>
                <span className="font-semibold text-purple-900 tabular-nums">
                  {answeredCount}/{questions.length} answered
                </span>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const selected = answers[idx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [idx]: optIdx }))
                          }
                          className={`min-h-[44px] text-left px-3.5 py-2.5 rounded-lg border text-sm transition cursor-pointer ${
                            selected
                              ? 'border-pink-600 bg-pink-50 text-purple-950 font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-6">
              {/* Result Summary Card */}
              {evalResult && (
                <div
                  className={`rounded-2xl p-6 border text-center ${
                    evalResult.passed
                      ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-3">
                    {evalResult.passed ? (
                      <Trophy className="w-7 h-7 text-amber-500" />
                    ) : (
                      <RotateCcw className="w-7 h-7 text-rose-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-purple-950 tabular-nums">
                    {evalResult.score} / 100 · {evalResult.band}
                  </h3>
                  <p className="mt-1 text-sm text-slate-700 tabular-nums">
                    {evalResult.correctAnswers} correct ·{' '}
                    {evalResult.totalQuestions - evalResult.correctAnswers} wrong out of{' '}
                    {evalResult.totalQuestions}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-purple-900">
                    {evalResult.passed
                      ? 'Congratulations, Queen! Next level tier is now unlocked.'
                      : 'Keep practicing! Score 60+ to unlock the next level tier.'}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                    <span>0–30: Repeat</span>
                    <span>·</span>
                    <span>31–60: Good (60+ unlocks)</span>
                    <span>·</span>
                    <span>61–80: Very Good</span>
                    <span>·</span>
                    <span>81–100: Excellent</span>
                  </div>
                </div>
              )}

              {finalResult && (
                <div
                  className={`rounded-2xl p-6 border text-center ${
                    finalResult.passed
                      ? 'bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 border-amber-300'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-3">
                    <Award
                      className={`w-7 h-7 ${
                        finalResult.passed ? 'text-amber-500' : 'text-rose-500'
                      }`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-950 tabular-nums">
                    {finalResult.score}% ({finalResult.correctAnswers}/{finalResult.totalQuestions})
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 tabular-nums">
                    Completed in {finalResult.timeUsedSeconds}s · Wrong answers:{' '}
                    {finalResult.totalQuestions - finalResult.correctAnswers}
                  </p>
                  {finalResult.passed ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-bold text-purple-900">
                        Royal Mastery Achieved! +500 XP & Golden Badge awarded.
                      </p>
                      <button
                        onClick={() => onOpenCertificate?.(finalResult)}
                        className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Royal Certificate</span>
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-rose-700">
                      70% or higher is required to earn the +500 XP, Golden Badge & Certificate.
                    </p>
                  )}
                </div>
              )}

              {/* Answer Review */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Answer Breakdown</h4>
                {questions.map((q, idx) => {
                  const picked = answers[idx];
                  const isCorrect = picked === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 p-3.5 text-sm bg-white"
                    >
                      <div className="flex items-start gap-2.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {idx + 1}. {q.question}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Correct: <strong>{q.options[q.correctIndex]}</strong> —{' '}
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-pink-100 bg-slate-50">
          {!submitted ? (
            <>
              <button
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white shadow-sm hover:opacity-95 cursor-pointer"
              >
                Submit Exam
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetry}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-pink-200 bg-white text-sm font-semibold text-purple-900 hover:bg-pink-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Exam</span>
              </button>
              <button
                onClick={onClose}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-purple-900 text-sm font-semibold text-white hover:bg-purple-800 cursor-pointer"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
