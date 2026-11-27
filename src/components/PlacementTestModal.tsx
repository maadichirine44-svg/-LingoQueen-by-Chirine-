import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Crown, Sparkles } from 'lucide-react';
import { LanguageId, PlacementCEFR, UILanguage } from '../types';
import { LANGUAGES } from '../utils/storage';
import { evaluatePlacementLevel, PLACEMENT_QUESTIONS } from '../data/placementTest';
import { launchRoyalConfetti } from '../utils/confetti';

interface PlacementTestModalProps {
  initialLangId?: LanguageId;
  userName: string;
  uiLang?: UILanguage;
  allowClose?: boolean;
  onComplete: (langId: LanguageId, level: PlacementCEFR, score: number) => void;
  onClose?: () => void;
}

const PATH_STEPS: PlacementCEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  initialLangId = 'en',
  userName,
  uiLang = 'en',
  allowClose = false,
  onComplete,
  onClose,
}) => {
  const isAr = uiLang === 'ar';
  const [selectedLang, setSelectedLang] = useState<LanguageId>(initialLangId);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [result, setResult] = useState<{
    level: PlacementCEFR;
    correct: number;
    total: number;
    score: number;
  } | null>(null);

  const questions = PLACEMENT_QUESTIONS[selectedLang];
  const langMeta = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[1];

  const handleSubmit = () => {
    if (result) return;
    const evaluated = evaluatePlacementLevel(questions, answers);
    setResult(evaluated);
    launchRoyalConfetti();
  };

  useEffect(() => {
    if (result) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-pink-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>
                {isAr
                  ? `اختبار تحديد المستوى (5 دقائق) · مرحباً ${userName}!`
                  : `5-Minute Level Test · Welcome, ${userName}!`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-purple-950 mt-0.5">
              {isAr
                ? 'حدّدي مستواكِ (A1 إلى C2) ومساركِ التعليمي الشخصي'
                : 'Find Your CEFR Level (A1 to C2) & Personal Path'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!result && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold tabular-nums border ${
                  secondsLeft <= 45
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-white text-purple-900 border-pink-200'
                }`}
              >
                <Clock className="w-4 h-4 text-pink-600" />
                <span>{formattedTime}</span>
              </div>
            )}
            {allowClose && onClose && (
              <button
                onClick={onClose}
                className="min-h-[38px] px-3 rounded-xl border border-pink-200 bg-white text-xs font-semibold text-slate-600 hover:bg-pink-50 cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {!result ? (
            <>
              <div className="rounded-2xl bg-pink-50/60 border border-pink-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-purple-950">
                  {isAr
                    ? 'اختاري اللغة التي تودين اختبار مستواكِ فيها، ثم أجيبي عن 12 سؤالاً سريعاً لتحديد مساركِ من A1 إلى C2:'
                    : 'Choose the language you want to assess, then answer these 12 quick questions (5 minutes) so we can build your personal A1–C2 path:'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedLang(l.id);
                        setAnswers({});
                      }}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedLang === l.id
                          ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-sm'
                          : 'bg-white border border-pink-200 text-purple-900 hover:bg-pink-100'
                      }`}
                    >
                      {isAr ? l.arabicName : l.name} ({l.nativeName})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-pink-100 p-4 sm:p-5 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-pink-700">
                        {isAr
                          ? `السؤال ${idx + 1} من ${questions.length}`
                          : `Question ${idx + 1} of ${questions.length}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-semibold">
                        {isAr ? `المستوى ${q.level}` : `Level ${q.level}`}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const picked = answers[idx] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [idx]: oIdx }))
                            }
                            className={`min-h-[44px] text-left px-3.5 py-2 rounded-xl border text-sm transition cursor-pointer ${
                              picked
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
              </div>
            </>
          ) : (
            <div className="space-y-6 py-2">
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 text-white shadow-md">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-pink-700 uppercase tracking-wider">
                  {isAr ? `نتيجة تحديد مستوى ${langMeta.arabicName}` : `${langMeta.name} Level Test Result`}
                </div>
                <h3 className="text-3xl font-extrabold text-purple-950">
                  {isAr ? `مستواكِ: ${result.level}` : `Your Level: ${result.level}`}
                </h3>
                <p className="text-sm text-slate-700">
                  {isAr ? (
                    <>
                      أجبتِ عن <strong>{result.correct}/{result.total}</strong> إجابة صحيحة ({result.score}%). يبدأ مساركِ الشخصي مباشرة من المستوى <strong>{result.level}</strong>!
                    </>
                  ) : (
                    <>
                      You answered <strong>{result.correct}/{result.total}</strong> correctly ({result.score}%). Your personal path starts directly at <strong>{result.level}</strong>!
                    </>
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-white p-5 space-y-3">
                <h4 className="text-sm font-bold text-purple-950">
                  {isAr
                    ? `مساركِ الشخصي من ${result.level} إلى C2`
                    : `Your Personal Path from ${result.level} to C2`}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PATH_STEPS.map((lvl) => {
                    const placedIdx = PATH_STEPS.indexOf(result.level);
                    const lvlIdx = PATH_STEPS.indexOf(lvl);
                    const isPlaced = lvlIdx === placedIdx;
                    const isSkipped = lvlIdx < placedIdx;
                    return (
                      <div
                        key={lvl}
                        className={`rounded-xl border p-2.5 text-center text-xs ${
                          isPlaced
                            ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white border-pink-600 font-bold shadow-sm'
                            : isSkipped
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-pink-50/50 border-pink-200 text-purple-900 font-semibold'
                        }`}
                      >
                        <div>{lvl}</div>
                        <div className="text-[10px] mt-0.5 opacity-90">
                          {isPlaced
                            ? isAr
                              ? 'نقطة البداية'
                              : 'Start Here'
                            : isSkipped
                            ? isAr
                              ? 'تم تجاوزه'
                              : 'Tested Out'
                            : isAr
                            ? 'المرحلة التالية'
                            : 'Next Step'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-pink-100 bg-slate-50">
          {!result ? (
            <>
              <span className="text-xs font-semibold text-slate-600 tabular-nums">
                {Object.keys(answers).length}/{questions.length}{' '}
                {isAr ? 'مجاب' : 'answered'}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white shadow-sm hover:opacity-95 cursor-pointer"
              >
                {isAr
                  ? 'إنهاء الاختبار واكتشاف مستواي'
                  : 'Finish Level Test & Find My Level'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(selectedLang, result.level, result.score)}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white shadow-md hover:opacity-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isAr
                  ? `ابدئي مسار ${result.level} الخاص بكِ (0% ← 100%)`
                  : `Start My ${result.level} Personal Path (0% → 100%)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
