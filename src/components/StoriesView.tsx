import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  Play,
  Sparkles,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';
import { FUN_STORIES, FunStory } from '../data/stories';
import { LanguageId, UILanguage } from '../types';
import { LANGUAGES } from '../utils/storage';
import { speakDialogueLines, speakText, stopSpeech } from '../utils/speech';
import { launchRoyalConfetti } from '../utils/confetti';
import { AdSpace } from './AdSpace';

interface StoriesViewProps {
  completedStories: string[];
  uiLang: UILanguage;
  onCompleteStory: (storyId: string) => void;
  onOpenContact?: () => void;
}

export const StoriesView: React.FC<StoriesViewProps> = ({
  completedStories,
  uiLang,
  onCompleteStory,
  onOpenContact,
}) => {
  const isAr = uiLang === 'ar';
  const [langFilter, setLangFilter] = useState<'all' | LanguageId>('all');
  const [activeStory, setActiveStory] = useState<FunStory | null>(null);
  const [showFusha, setShowFusha] = useState(true);
  const [activeParaIdx, setActiveParaIdx] = useState<number | null>(null);
  const [pickedQuiz, setPickedQuiz] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);

  const visibleStories =
    langFilter === 'all'
      ? FUN_STORIES
      : FUN_STORIES.filter((s) => s.languageId === langFilter);

  if (activeStory) {
    const langMeta = LANGUAGES.find((l) => l.id === activeStory.languageId) || LANGUAGES[0];
    const alreadyDone = completedStories.includes(activeStory.id);
    const quizPassed = quizChecked && pickedQuiz === activeStory.quizCorrect;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopSpeech();
                setActiveParaIdx(null);
                setActiveStory(null);
                setPickedQuiz(null);
                setQuizChecked(false);
              }}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-pink-200 text-purple-900 hover:bg-pink-50 cursor-pointer"
              aria-label="Back to stories"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-semibold text-pink-700">
                {isAr ? langMeta.arabicName : langMeta.name} ({langMeta.nativeName}) ·{' '}
                {activeStory.level}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-purple-950">
                {activeStory.title}
              </h1>
              <p className="text-xs font-semibold text-purple-800" dir="rtl">
                {activeStory.titleAr}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFusha((v) => !v)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-pink-200 bg-pink-50/70 text-xs font-bold text-purple-950 hover:bg-pink-100 cursor-pointer"
            >
              {showFusha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>
                {showFusha
                  ? isAr
                    ? 'إخفاء الترجمة الفصحى'
                    : 'Hide Fusha Translation'
                  : isAr
                  ? 'إظهار الترجمة الفصحى'
                  : 'Show Fusha Translation'}
              </span>
            </button>

            {activeParaIdx !== null ? (
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setActiveParaIdx(null);
                }}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{isAr ? 'إيقاف القراءة' : 'Stop Audio'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  speakDialogueLines(
                    activeStory.paragraphs.map((p) => p.text),
                    langMeta.speechLang,
                    setActiveParaIdx,
                    0.88
                  )
                }
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-xs font-bold text-white cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isAr ? 'استماع للقصة كاملة' : 'Listen Full Story'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Story Paragraphs */}
        <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-7 shadow-sm space-y-4">
          {activeStory.paragraphs.map((para, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition flex items-start justify-between gap-3 ${
                activeParaIdx === idx
                  ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300'
                  : 'border-pink-100 bg-pink-50/20'
              }`}
            >
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-semibold text-purple-950 leading-relaxed">
                  {para.text}
                </p>
                {showFusha && (
                  <div className="space-y-1 pt-1 border-t border-pink-100/70">
                    <p className="text-sm font-semibold text-pink-700" dir="rtl">
                      {para.arabicFusha}
                    </p>
                    <p className="text-xs text-slate-600">{para.english}</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveParaIdx(null);
                  speakText(para.text, langMeta.speechLang, 0.88);
                }}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 shrink-0 cursor-pointer"
                aria-label="Listen paragraph"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {/* Key Vocabulary */}
        <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-purple-950">
            {isAr ? 'مفردات القصة باللغة العربية الفصحى' : 'Story Vocabulary (Fusha Arabic)'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeStory.vocab.map((v, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-purple-100 bg-purple-50/40 p-3.5 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="text-sm font-bold text-purple-950">{v.word}</div>
                  <div className="text-xs font-semibold text-pink-700 mt-0.5" dir="rtl">
                    {v.arabicFusha}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{v.english}</div>
                </div>
                <button
                  type="button"
                  onClick={() => speakText(v.word, langMeta.speechLang)}
                  className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 cursor-pointer shrink-0"
                  aria-label={`Listen ${v.word}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Story Comprehension Quiz (+40 XP) */}
        <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-purple-950">
              {isAr ? 'سؤال الفهم (+40 نقطة)' : 'Quick Story Check (+40 XP)'}
            </h2>
            {alreadyDone && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'مكتملة' : 'Completed'}</span>
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {isAr ? activeStory.quizQuestionAr : activeStory.quizQuestion}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeStory.quizOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPickedQuiz(idx);
                  setQuizChecked(false);
                }}
                className={`min-h-[44px] text-left px-4 py-2.5 rounded-xl border text-sm cursor-pointer ${
                  pickedQuiz === idx
                    ? 'border-pink-600 bg-pink-50 font-semibold text-purple-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-pink-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pickedQuiz === null}
              onClick={() => {
                setQuizChecked(true);
                if (pickedQuiz === activeStory.quizCorrect) {
                  onCompleteStory(activeStory.id);
                  launchRoyalConfetti();
                }
              }}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
            >
              {isAr ? 'تأكيد الإجابة' : 'Check Answer & Earn +40 XP'}
            </button>
            {quizChecked && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                  quizPassed ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {quizPassed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isAr ? 'أحسنتِ! تمت إضافة +40 نقطة.' : 'Wonderful! +40 XP awarded.'}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>
                      {isAr ? 'جرّبي خياراً آخر!' : 'Not quite—try another option!'}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
        </section>

        <AdSpace placement="stories" uiLang={uiLang} onActionClick={onOpenContact} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-100">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isAr
                  ? '12 قصة ممتعة باللغات الست مع الترجمة الفصحى'
                  : '12 Fun Stories Across All 6 Languages with Fusha Translation'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {isAr ? 'القصص الممتعة مع الترجمة الفصحى' : 'Fun Stories with Fusha Translation'}
            </h1>
            <p className="text-sm text-pink-100 mt-1 max-w-2xl">
              {isAr
                ? 'اقرئي واستمعي إلى قصص شيّقة مع ترجمة عربية فصحى دقيقة ومفردات مختارة، واحصلي على +40 نقطة عن كل قصة.'
                : 'Read and listen to engaging short stories with sentence-by-sentence audio, Modern Standard Arabic (Fusha) translations, and +40 XP per story.'}
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-right">
            <div className="text-xs text-pink-100">
              {isAr ? 'القصص المقروءة' : 'Stories Completed'}
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {completedStories.length}/{FUN_STORIES.length}
            </div>
          </div>
        </div>
      </div>

      {/* Ad Space on Stories Page */}
      <AdSpace placement="stories" uiLang={uiLang} onActionClick={onOpenContact} />

      {/* Language Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setLangFilter('all')}
          className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
            langFilter === 'all'
              ? 'bg-purple-900 text-white'
              : 'bg-white border border-pink-100 text-slate-700 hover:border-pink-300'
          }`}
        >
          {isAr ? 'جميع اللغات' : 'All Languages'}
        </button>
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLangFilter(l.id)}
            className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              langFilter === l.id
                ? 'bg-purple-900 text-white'
                : 'bg-white border border-pink-100 text-slate-700 hover:border-pink-300'
            }`}
          >
            {isAr ? l.arabicName : l.name} ({l.nativeName})
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleStories.map((story) => {
          const langMeta = LANGUAGES.find((l) => l.id === story.languageId) || LANGUAGES[0];
          const done = completedStories.includes(story.id);
          return (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="text-left rounded-2xl bg-white border border-pink-100 p-5 hover:border-pink-400 transition shadow-sm flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-pink-700">
                    {isAr ? langMeta.arabicName : langMeta.name} · {story.level}
                  </span>
                  {done && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>+40 XP</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-purple-950">{story.title}</h3>
                <p className="text-xs font-semibold text-pink-700" dir="rtl">
                  {story.titleAr}
                </p>
                <p className="text-xs text-slate-600 pt-1 line-clamp-2">
                  {isAr ? story.summaryAr : story.summary}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-purple-900 pt-2 border-t border-pink-50">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-pink-600" />
                  <span>{story.paragraphs.length} {isAr ? 'فقرات' : 'parts'}</span>
                </span>
                <span className="text-pink-700">
                  {isAr ? 'قراءة القصة ←' : 'Read & Listen →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
