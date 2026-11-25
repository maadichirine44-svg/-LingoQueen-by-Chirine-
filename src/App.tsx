import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Crown,
  Flame,
  Globe,
  Home,
  Lock,
  LogOut,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import {
  EvaluationResult,
  FinalExamResult,
  LanguageId,
  LanguageMeta,
  Lesson,
  LessonResult,
  UILanguage,
  UserProfile,
} from './types';
import { TRANSLATIONS } from './data/i18n';
import {
  BADGE_THRESHOLDS,
  LANGUAGES,
  computeLanguageProgressPercent,
  evaluateMilestoneBadges,
  getActiveUserName,
  getSavedUserNames,
  getTodayISO,
  getTotalXP,
  loadOrCreateUserProfile,
  recordEvaluationResult,
  recordFinalExamResult,
  recordLessonCompletion,
  saveUserProfile,
  setActiveUserName,
} from './utils/storage';
import {
  getDailyChallengeForDate,
  getEvaluationExamQuestions,
  getFinalExamQuestions,
  getLessonsForLanguage,
} from './data/curriculum';
import { LandmarkCircle, LingoQueenLogo } from './components/BrandArt';
import { LessonPlayer } from './components/LessonPlayer';
import { ExamModal } from './components/ExamModal';
import { CertificateModal } from './components/CertificateModal';
import { HotelTrackView } from './components/HotelTrackView';
import { LunaTutorView } from './components/LunaTutorView';
import {
  OfflineIndicator,
  PWAInstallButton,
} from './components/PWAInstallControls';
import { launchRoyalConfetti } from './utils/confetti';

type AppTab = 'home' | 'academy' | 'hotel' | 'luna' | 'results' | 'badges';

const TIER_DEFINITIONS = [
  { tier: 1, level: 'A1', labelKey: 'levelA1', start: 1, end: 10 },
  { tier: 2, level: 'A2', labelKey: 'levelA2', start: 11, end: 20 },
  { tier: 3, level: 'B1', labelKey: 'levelB1', start: 21, end: 30 },
  { tier: 4, level: 'B2', labelKey: 'levelB2', start: 31, end: 40 },
  { tier: 5, level: 'C1-C2', labelKey: 'levelC1C2', start: 41, end: 50 },
];

export default function App() {
  const [uiLang, setUiLang] = useState<UILanguage>('en');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedLangId, setSelectedLangId] = useState<LanguageId>('fr');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Exam & Certificate modals
  const [examConfig, setExamConfig] = useState<{
    mode: 'evaluation' | 'final';
    checkpoint?: number;
    lang: LanguageMeta;
  } | null>(null);
  const [certificateData, setCertificateData] = useState<{
    lang: LanguageMeta;
    result: FinalExamResult;
  } | null>(null);

  // Daily Challenge modal
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyAnswer, setDailyAnswer] = useState<number | null>(null);
  const [dailyFeedback, setDailyFeedback] = useState<string | null>(null);

  const t = TRANSLATIONS[uiLang];

  useEffect(() => {
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  useEffect(() => {
    setSavedNames(getSavedUserNames());
    const lastUser = getActiveUserName();
    if (lastUser) {
      setProfile(loadOrCreateUserProfile(lastUser));
    }
  }, []);

  const handleLogin = (nameToLoad: string) => {
    const clean = nameToLoad.trim();
    if (!clean) return;
    const loaded = loadOrCreateUserProfile(clean);
    setActiveUserName(clean);
    setProfile(loaded);
    setSavedNames(getSavedUserNames());
    setLoginInput('');
    setActiveTab('home');
    setActiveLesson(null);
  };

  const handleLogout = () => {
    setActiveUserName(null);
    setProfile(null);
    setActiveLesson(null);
    setActiveTab('home');
  };

  const toggleTranslate = () => {
    setUiLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Login Screen
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-[#fdf8fc] to-purple-50 flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-3xl w-full mx-auto my-auto bg-white rounded-3xl border border-pink-200 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="flex justify-end">
            <button
              onClick={toggleTranslate}
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-pink-200 bg-pink-50 px-3.5 py-2 text-xs font-bold text-purple-900 hover:bg-pink-100 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-pink-600" />
              <span>{t.translateBtn}</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <LingoQueenLogo size={175} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700">
                LingoQueen
              </h1>
              <p className="text-sm font-semibold text-purple-800">{t.byChirine}</p>
            </div>
          </div>

          {/* 6 Circular Landmark Showcase */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 justify-items-center py-2">
            {LANGUAGES.map((lang) => (
              <div key={lang.id} className="flex flex-col items-center gap-1.5 text-center">
                <LandmarkCircle languageId={lang.id} size={56} />
                <span className="text-[11px] font-semibold text-purple-950">
                  {uiLang === 'ar' ? lang.arabicName : lang.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {uiLang === 'ar' ? lang.landmarkArabic : lang.landmark}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-purple-950">
                {t.loginTitle}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{t.loginSubtitle}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(loginInput);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder={t.loginPlaceholder}
                required
                className="flex-1 min-h-[48px] rounded-xl border border-pink-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white shadow-md hover:opacity-95 whitespace-nowrap cursor-pointer"
              >
                {t.loginButton}
              </button>
            </form>

            {savedNames.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-slate-500">
                  {t.savedProfiles}
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedNames.map((n) => (
                    <button
                      key={n}
                      onClick={() => handleLogin(n)}
                      className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50/50 px-3.5 py-2 text-xs font-semibold text-purple-950 hover:bg-pink-100 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-pink-600" />
                      <span>{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-xs text-slate-500 pt-6">
          LingoQueen by Chirine · 300 Lessons · 6 Languages · Hotel Track · Luna AI · Offline PWA
        </footer>
        <OfflineIndicator message={t.offlineNotice} />
      </div>
    );
  }

  const totalXP = getTotalXP(profile);
  const todayISO = getTodayISO();
  const dailyDone = !!profile.dailyChallengeDates?.[todayISO];
  const dailyItem = getDailyChallengeForDate(todayISO);
  const selectedLangMeta =
    LANGUAGES.find((l) => l.id === selectedLangId) || LANGUAGES[0];
  const selectedLangProgress = profile.languages[selectedLangId];
  const selectedLangLessons = getLessonsForLanguage(selectedLangId);

  const handleLessonComplete = (result: LessonResult) => {
    const { updated, newlyEarnedBadges } = recordLessonCompletion(
      profile,
      selectedLangId,
      result
    );
    setProfile(updated);
    if (newlyEarnedBadges.length > 0) {
      launchRoyalConfetti();
    }
  };

  const handleEvaluationComplete = (result: EvaluationResult) => {
    if (!examConfig) return;
    const { updated } = recordEvaluationResult(
      profile,
      examConfig.lang.id,
      result
    );
    setProfile(updated);
  };

  const handleFinalExamComplete = (result: FinalExamResult) => {
    if (!examConfig) return;
    const { updated } = recordFinalExamResult(
      profile,
      examConfig.lang.id,
      result
    );
    setProfile(updated);
  };

  const handleHotelLessonComplete = (
    lessonId: number,
    score: number,
    extras?: {
      cvDraft?: Record<string, string>;
      cvScore?: number;
      interviewScore?: number;
    }
  ) => {
    const prevSet = new Set(profile.hotelTrack.completedLessons);
    const wasNew = !prevSet.has(lessonId);
    prevSet.add(lessonId);
    const updatedProfile: UserProfile = {
      ...profile,
      hotelTrack: {
        ...profile.hotelTrack,
        completedLessons: Array.from(prevSet).sort((a, b) => a - b),
        scores: {
          ...profile.hotelTrack.scores,
          [lessonId]: Math.max(profile.hotelTrack.scores[lessonId] || 0, score),
        },
        cvDraft: extras?.cvDraft ?? profile.hotelTrack.cvDraft,
        cvScore: extras?.cvScore ?? profile.hotelTrack.cvScore,
        interviewScore:
          extras?.interviewScore ?? profile.hotelTrack.interviewScore,
        xp: profile.hotelTrack.xp + (wasNew ? 60 : 10),
      },
    };
    const { updated } = evaluateMilestoneBadges(updatedProfile);
    saveUserProfile(updated);
    setProfile(updated);
  };

  const handleDailySubmit = () => {
    if (dailyAnswer === null) return;
    if (dailyAnswer === dailyItem.question.correctIndex) {
      if (!dailyDone) {
        const next: UserProfile = {
          ...profile,
          dailyChallengeDates: {
            ...profile.dailyChallengeDates,
            [todayISO]: true,
          },
        };
        const { updated } = evaluateMilestoneBadges(next);
        saveUserProfile(updated);
        setProfile(updated);
        launchRoyalConfetti();
      }
      setDailyFeedback('Correct! +100 XP awarded for today.');
    } else {
      setDailyFeedback(
        `Not quite — Correct answer: "${dailyItem.question.options[dailyItem.question.correctIndex]}". Try again!`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8fc] text-slate-900 pb-20 md:pb-8 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="no-print sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              setActiveTab('home');
              setActiveLesson(null);
            }}
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-purple-950 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LingoQueenLogo size={36} compact />
            <span>LingoQueen</span>
          </button>

          {/* Zone 2: 5 Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                setActiveTab('home');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'home' || activeTab === 'academy'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.homeNav}
            </button>
            <button
              onClick={() => {
                setActiveTab('hotel');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'hotel'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.hotelNav}
            </button>
            <button
              onClick={() => {
                setActiveTab('luna');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'luna'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.lunaNav}
            </button>
            <button
              onClick={() => {
                setActiveTab('results');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'results'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.resultsNav}
            </button>
            <button
              onClick={() => {
                setActiveTab('badges');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'badges'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.badgesNav}
            </button>
          </nav>

          {/* Zone 3: Primary Action (TRANSLATE English <-> Arabic) */}
          <div className="shrink-0">
            <button
              onClick={toggleTranslate}
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.translateBtn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Active Lesson Player overrides academy view */}
        {activeLesson ? (
          <LessonPlayer
            lesson={activeLesson}
            language={selectedLangMeta}
            uiLang={uiLang}
            onComplete={handleLessonComplete}
            onExit={() => setActiveLesson(null)}
          />
        ) : activeTab === 'home' ? (
          /* HOME SCREEN: Hello, Queen! + 6 Language Cards + 0% Progress Bars */
          <div className="space-y-8">
            {/* Hero Welcome & User Stats */}
            <section className="rounded-3xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-start gap-5">
                  <LingoQueenLogo size={168} />
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-pink-700">
                      {t.appName} {t.byChirine} · {profile.name}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-950 text-balance">
                      {t.helloQueen}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                      {t.homeSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0">
                  <PWAInstallButton label={t.installApp} />
                  <button
                    onClick={handleLogout}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-purple-900 hover:bg-pink-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-pink-600" />
                    <span>{t.switchUser}</span>
                  </button>
                </div>
              </div>

              {/* Gamification Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-pink-100">
                <div className="rounded-2xl bg-pink-50/70 border border-pink-100 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-600">{t.totalXp}</div>
                    <div className="text-2xl font-extrabold text-purple-950 tabular-nums mt-0.5">
                      {totalXP} XP
                    </div>
                  </div>
                  <Crown className="w-7 h-7 text-amber-500" />
                </div>

                <div className="rounded-2xl bg-purple-50/70 border border-purple-100 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-600">{t.streakDays}</div>
                    <div className="text-2xl font-extrabold text-purple-950 tabular-nums mt-0.5">
                      {profile.streak} {uiLang === 'ar' ? 'يوم' : 'Days'}
                    </div>
                  </div>
                  <Flame className="w-7 h-7 text-pink-600" />
                </div>

                <button
                  onClick={() => {
                    setDailyAnswer(null);
                    setDailyFeedback(null);
                    setShowDailyModal(true);
                  }}
                  className="text-left rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 p-4 text-white flex items-center justify-between hover:opacity-95 transition cursor-pointer"
                >
                  <div>
                    <div className="text-xs text-pink-100">{t.dailyChallenge}</div>
                    <div className="text-sm font-bold mt-1">
                      {dailyDone ? t.dailyCompleted : t.claimDailyXp}
                    </div>
                  </div>
                  <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
                </button>
              </div>
            </section>

            {/* 6 Language Cards with Circular Landmarks & 0%->100% Progress Bars */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {LANGUAGES.map((lang) => {
                const lp = profile.languages[lang.id];
                const percent = computeLanguageProgressPercent(lp);
                const completedCount = new Set(lp.completedLessons).size;

                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLangId(lang.id);
                      setActiveTab('academy');
                    }}
                    className="text-left rounded-2xl bg-white border border-pink-100 p-6 hover:border-pink-400 hover:shadow-md transition flex flex-col justify-between gap-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <LandmarkCircle languageId={lang.id} size={60} />
                        <div>
                          <h2 className="text-xl font-bold text-purple-950">
                            {uiLang === 'ar' ? lang.arabicName : lang.name}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {lang.nativeName} ·{' '}
                            {uiLang === 'ar' ? lang.landmarkArabic : lang.landmark}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-800 tabular-nums">
                        {lp.xp} XP
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">
                          {t.progressLabel} ({completedCount}/50 {t.lessonsCompleted})
                        </span>
                        <span className="font-bold text-pink-700 tabular-nums">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-pink-100 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-700 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-purple-900 pt-1 border-t border-pink-50">
                      <span>
                        Tier A1–C2 · 50 {uiLang === 'ar' ? 'درساً' : 'Lessons'}
                      </span>
                      <span className="text-pink-700">
                        {completedCount > 0 ? t.continueLearning : t.startLearning} →
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>
          </div>
        ) : activeTab === 'academy' ? (
          /* LANGUAGE ACADEMY VIEW: 50 Lessons across A1-C2 + Evaluations + Final Exam */
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <LandmarkCircle languageId={selectedLangId} size={56} />
                <div>
                  <div className="text-xs font-semibold text-pink-700">
                    {selectedLangMeta.landmark} · {selectedLangMeta.city}
                  </div>
                  <h1 className="text-2xl font-bold text-purple-950">
                    {selectedLangMeta.name} ({selectedLangMeta.nativeName})
                  </h1>
                  <p className="text-xs text-slate-600 tabular-nums mt-0.5">
                    Progress: {computeLanguageProgressPercent(selectedLangProgress)}% ·{' '}
                    {selectedLangProgress.completedLessons.length}/50 lessons ·{' '}
                    {selectedLangProgress.xp} XP
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLangId(l.id)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      selectedLangId === l.id
                        ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                        : 'bg-pink-50 text-purple-900 hover:bg-pink-100'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 5 CEFR Level Tiers (10 lessons each + Evaluation Exam) */}
            {TIER_DEFINITIONS.map((tierDef) => {
              const isUnlocked = selectedLangProgress.unlockedTier >= tierDef.tier;
              const tierLessons = selectedLangLessons.filter(
                (l) => l.id >= tierDef.start && l.id <= tierDef.end
              );
              const checkpoint = tierDef.end; // 10, 20, 30, 40, 50
              const evalResult = selectedLangProgress.evaluations[checkpoint];

              return (
                <section
                  key={tierDef.tier}
                  className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-50 pb-4">
                    <div>
                      <div className="text-xs font-bold text-pink-700">
                        {t.lessonsRange} {tierDef.start}–{tierDef.end}
                      </div>
                      <h2 className="text-lg font-bold text-purple-950 flex items-center gap-2">
                        <span>{t[tierDef.labelKey]}</span>
                        {!isUnlocked && <Lock className="w-4 h-4 text-slate-400" />}
                      </h2>
                      {!isUnlocked && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.lockedTier}
                        </p>
                      )}
                    </div>

                    <button
                      disabled={!isUnlocked}
                      onClick={() =>
                        setExamConfig({
                          mode: 'evaluation',
                          checkpoint,
                          lang: selectedLangMeta,
                        })
                      }
                      className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-purple-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-purple-800 cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-amber-300" />
                      <span>
                        {t.takeEvaluation}
                        {evalResult ? ` · ${evalResult.score}/100 (${evalResult.band})` : ''}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {tierLessons.map((lesson) => {
                      const done = selectedLangProgress.completedLessons.includes(
                        lesson.id
                      );
                      const res = selectedLangProgress.lessonResults[lesson.id];

                      return (
                        <button
                          key={lesson.id}
                          disabled={!isUnlocked}
                          onClick={() => setActiveLesson(lesson)}
                          className={`text-left rounded-xl border p-3.5 transition flex flex-col justify-between gap-2 min-h-[104px] ${
                            !isUnlocked
                              ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                              : done
                              ? 'bg-pink-50/40 border-pink-300 hover:border-pink-500 cursor-pointer'
                              : 'bg-white border-pink-100 hover:border-pink-400 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-900 tabular-nums">
                              L{lesson.id} · {lesson.level}
                            </span>
                            {done && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                            {lesson.title}
                          </div>
                          {res ? (
                            <div className="text-[11px] font-bold text-pink-700 tabular-nums">
                              Score: {res.score}/100
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500">
                              Start Lesson →
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Final Mastery Exam Banner (After 50 Lessons) */}
            <section className="rounded-2xl bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Crown className="w-4 h-4" />
                  <span>Final Exam · After Lesson 50</span>
                </div>
                <h2 className="text-2xl font-bold">{t.takeFinalExam}</h2>
                <p className="text-sm text-pink-100 max-w-xl">
                  Score 70% or higher within 90 seconds across 20 comprehensive questions to earn +500 XP, your Golden Crown Badge, and your Royal Certificate.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                {selectedLangProgress.finalExam?.passed && (
                  <button
                    onClick={() =>
                      setCertificateData({
                        lang: selectedLangMeta,
                        result: selectedLangProgress.finalExam!,
                      })
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-purple-950 hover:bg-amber-300 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                )}
                <button
                  onClick={() =>
                    setExamConfig({
                      mode: 'final',
                      lang: selectedLangMeta,
                    })
                  }
                  className="min-h-[44px] rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-purple-950 hover:bg-pink-50 cursor-pointer"
                >
                  Start Final Exam (90s)
                </button>
              </div>
            </section>
          </div>
        ) : activeTab === 'hotel' ? (
          <HotelTrackView
            completedLessons={profile.hotelTrack.completedLessons}
            scores={profile.hotelTrack.scores}
            savedCvDraft={profile.hotelTrack.cvDraft}
            cvScore={profile.hotelTrack.cvScore}
            interviewScore={profile.hotelTrack.interviewScore}
            userName={profile.name}
            onCompleteHotelLesson={handleHotelLessonComplete}
          />
        ) : activeTab === 'luna' ? (
          <LunaTutorView defaultLang={selectedLangId} />
        ) : activeTab === 'results' ? (
          /* RESULTS & EXAMS LEDGER */
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-pink-100 p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-purple-950">
                Saved Results, Evaluations & Final Exams
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Permanent academic record for <strong>{profile.name}</strong> across all 6 languages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {LANGUAGES.map((lang) => {
                const lp = profile.languages[lang.id];
                const lessonEntries = Object.values(lp.lessonResults);
                const evalEntries = Object.values(lp.evaluations);

                return (
                  <div
                    key={lang.id}
                    className="rounded-2xl bg-white border border-pink-100 p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-pink-50 pb-3">
                      <div className="flex items-center gap-3">
                        <LandmarkCircle languageId={lang.id} size={44} />
                        <div>
                          <h2 className="font-bold text-purple-950">{lang.name}</h2>
                          <p className="text-xs text-slate-500 tabular-nums">
                            {computeLanguageProgressPercent(lp)}% complete · {lp.xp} XP
                          </p>
                        </div>
                      </div>
                      {lp.finalExam?.passed && (
                        <button
                          onClick={() =>
                            setCertificateData({ lang, result: lp.finalExam! })
                          }
                          className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 cursor-pointer"
                        >
                          Certificate ({lp.finalExam.score}%)
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">
                        Level Evaluations (10 Q /100)
                      </div>
                      {evalEntries.length === 0 ? (
                        <p className="text-xs text-slate-400">No evaluations taken yet.</p>
                      ) : (
                        evalEntries.map((ev) => (
                          <div
                            key={ev.checkpoint}
                            className="flex items-center justify-between text-xs bg-pink-50/50 rounded-lg px-3 py-2"
                          >
                            <span>Checkpoint L{ev.checkpoint}</span>
                            <span className="font-bold text-purple-900 tabular-nums">
                              {ev.score}/100 · {ev.band}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">
                        Completed Lessons ({lessonEntries.length})
                      </div>
                      {lessonEntries.length === 0 ? (
                        <p className="text-xs text-slate-400">No lessons completed yet.</p>
                      ) : (
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {lessonEntries.map((lr) => (
                            <div
                              key={lr.lessonId}
                              className="flex items-center justify-between text-xs border border-slate-100 rounded-lg px-3 py-1.5 tabular-nums"
                            >
                              <span>Lesson {lr.lessonId}</span>
                              <span>
                                <strong>{lr.score}/100</strong> ({lr.correctAnswers}/
                                {lr.totalQuestions} correct · +{lr.xpEarned} XP)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* BADGES & GAMIFICATION VIEW */
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-pink-100 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-purple-950">
                  Royal Badges & XP Milestones
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Earn milestone badges at 500, 1500, 3000, and 6000 XP plus Golden Crown Badges from Final Exams.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{t.totalXp}</div>
                <div className="text-3xl font-extrabold text-pink-700 tabular-nums">
                  {totalXP} XP
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BADGE_THRESHOLDS.map((b) => {
                const earned = profile.earnedBadges.includes(b.id) || totalXP >= b.xp;
                return (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-5 text-center space-y-2 ${
                      earned
                        ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-300 shadow-sm'
                        : 'bg-white border-slate-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
                        earned
                          ? 'bg-gradient-to-br from-pink-600 to-purple-700 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Crown className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-bold text-pink-700 tabular-nums">
                      {b.xp} XP Milestone
                    </div>
                    <h3 className="text-base font-bold text-purple-950">
                      {uiLang === 'ar' ? b.titleAr : b.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {earned ? 'Unlocked!' : `${Math.max(0, b.xp - totalXP)} XP to unlock`}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl bg-white border border-pink-100 p-6 space-y-4">
              <h2 className="text-lg font-bold text-purple-950">
                Golden Final Exam Badges (70%+ Score)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {LANGUAGES.map((lang) => {
                  const passed = !!profile.languages[lang.id].finalExam?.passed;
                  return (
                    <div
                      key={lang.id}
                      className={`rounded-xl border p-4 text-center space-y-2 ${
                        passed
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <Award
                        className={`w-8 h-8 mx-auto ${
                          passed ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      />
                      <div className="text-xs font-bold text-purple-950">
                        {lang.name}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {passed ? 'Golden Crown' : 'Pass Final Exam'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (compact <= 15% viewport height) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 grid grid-cols-5 h-16">
        <button
          onClick={() => {
            setActiveTab('home');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'home' || activeTab === 'academy'
              ? 'text-pink-700'
              : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t.homeNav}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('hotel');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'hotel' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>{t.hotelNav}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('luna');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'luna' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{t.lunaNav}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('results');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'results' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{t.resultsNav}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('badges');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'badges' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>{t.badgesNav}</span>
        </button>
      </nav>

      {/* Daily Challenge Modal (+100 XP) */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-pink-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-pink-700">
                {t.dailyChallenge} · +100 XP
              </div>
              <button
                onClick={() => setShowDailyModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-3 text-xs text-purple-900">
              Phrase of the day: <strong>{dailyItem.bonusPhrase}</strong> ·{' '}
              <span dir="rtl">{dailyItem.bonusArabic}</span>
            </div>
            <p className="text-sm font-bold text-purple-950">
              {dailyItem.question.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {dailyItem.question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setDailyAnswer(idx)}
                  className={`min-h-[44px] text-left px-3.5 py-2 rounded-xl border text-sm cursor-pointer ${
                    dailyAnswer === idx
                      ? 'border-pink-600 bg-pink-50 font-semibold text-purple-950'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {dailyFeedback && (
              <p className="text-xs font-semibold text-purple-900">
                {dailyFeedback}
              </p>
            )}
            <button
              onClick={handleDailySubmit}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white cursor-pointer"
            >
              Submit Daily Challenge
            </button>
          </div>
        </div>
      )}

      {/* Evaluation / Final Exam Modal */}
      {examConfig && (
        <ExamModal
          mode={examConfig.mode}
          checkpoint={examConfig.checkpoint}
          language={examConfig.lang}
          questions={
            examConfig.mode === 'evaluation'
              ? getEvaluationExamQuestions(
                  examConfig.lang.id,
                  examConfig.checkpoint || 10
                )
              : getFinalExamQuestions(examConfig.lang.id)
          }
          onCompleteEvaluation={handleEvaluationComplete}
          onCompleteFinal={handleFinalExamComplete}
          onOpenCertificate={(res) => {
            setExamConfig(null);
            setCertificateData({ lang: examConfig.lang, result: res });
          }}
          onClose={() => setExamConfig(null)}
        />
      )}

      {/* Certificate Modal */}
      {certificateData && (
        <CertificateModal
          userName={profile.name}
          language={certificateData.lang}
          result={certificateData.result}
          onClose={() => setCertificateData(null)}
          titleLabel={t.certificateTitle}
          printLabel={t.printCertificate}
        />
      )}

      <OfflineIndicator message={t.offlineNotice} />
    </div>
  );
}
