import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Crown,
  Flame,
  Gamepad2,
  Globe,
  Home,
  Lock,
  LogOut,
  Sparkles,
  Trophy,
  User,
  Volume2,
} from 'lucide-react';
import {
  EvaluationResult,
  FinalExamResult,
  LanguageId,
  LanguageMeta,
  LegalPageId,
  Lesson,
  LessonResult,
  PlacementCEFR,
  UILanguage,
  UserProfile,
} from './types';
import { TRANSLATIONS } from './data/i18n';
import {
  LANGUAGES,
  computeLanguageProgressPercent,
  getActiveUserName,
  getPathStats,
  getSavedUserNames,
  getTodayISO,
  getTotalXP,
  getUserOverallLevel,
  loadOrCreateUserProfile,
  recordEvaluationResult,
  recordFinalExamResult,
  recordGameXP,
  recordLessonCompletion,
  recordPlacementResult,
  recordStoryCompletion,
  saveUserProfile,
  evaluateMilestoneBadges,
  setActiveUserName,
  updateUserProfileDetails,
} from './utils/storage';
import {
  getDailyChallengeForDate,
  getEvaluationExamQuestions,
  getFinalExamQuestions,
  getLessonsForLanguage,
} from './data/curriculum';
import { getWordOfTheDay } from './data/wordOfTheDay';
import { speakText } from './utils/speech';
import { LandmarkCircle, LingoQueenLogo } from './components/BrandArt';
import { LessonPlayer } from './components/LessonPlayer';
import { ExamModal } from './components/ExamModal';
import { CertificateModal } from './components/CertificateModal';
import { HotelTrackView } from './components/HotelTrackView';
import { LunaTutorView } from './components/LunaTutorView';
import { PlacementTestModal } from './components/PlacementTestModal';
import { LunaChatBox } from './components/LunaChatBox';
import { StoriesView } from './components/StoriesView';
import { GamesView } from './components/GamesView';
import { ProfileView } from './components/ProfileView';
import { AdSpace } from './components/AdSpace';
import { LegalPagesView } from './components/LegalPagesView';
import {
  OfflineIndicator,
  PWAInstallButton,
} from './components/PWAInstallControls';
import { launchRoyalConfetti } from './utils/confetti';

type AppTab =
  | 'home'
  | 'academy'
  | 'stories'
  | 'games'
  | 'hotel'
  | 'profile'
  | 'luna'
  | 'legal';

interface PathStageDef {
  stage: number;
  tier: number;
  level: PlacementCEFR;
  labelEn: string;
  labelAr: string;
  start: number;
  end: number;
  checkpoint: number;
}

const PATH_STAGES: PathStageDef[] = [
  { stage: 1, tier: 1, level: 'A1', labelEn: 'A1 · Beginner', labelAr: 'A1 · مبتدئ', start: 1, end: 10, checkpoint: 10 },
  { stage: 2, tier: 2, level: 'A2', labelEn: 'A2 · Elementary', labelAr: 'A2 · أساسي', start: 11, end: 20, checkpoint: 20 },
  { stage: 3, tier: 3, level: 'B1', labelEn: 'B1 · Intermediate', labelAr: 'B1 · متوسط', start: 21, end: 30, checkpoint: 30 },
  { stage: 4, tier: 4, level: 'B2', labelEn: 'B2 · Upper Intermediate', labelAr: 'B2 · فوق المتوسط', start: 31, end: 40, checkpoint: 40 },
  { stage: 5, tier: 5, level: 'C1', labelEn: 'C1 · Advanced', labelAr: 'C1 · متقدم', start: 41, end: 45, checkpoint: 50 },
  { stage: 6, tier: 5, level: 'C2', labelEn: 'C2 · Mastery', labelAr: 'C2 · إتقان', start: 46, end: 50, checkpoint: 50 },
];

export default function App() {
  const [uiLang, setUiLang] = useState<UILanguage>('en');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [legalPage, setLegalPage] = useState<LegalPageId>('about');
  const [loginLegalPage, setLoginLegalPage] = useState<LegalPageId | null>(null);
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

  // 5-Minute Placement Test & Personal Path Stage selection
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [selectedStageOverride, setSelectedStageOverride] = useState<
    Partial<Record<LanguageId, number>>
  >({});

  const t = TRANSLATIONS[uiLang];
  const isAr = uiLang === 'ar';

  useEffect(() => {
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  useEffect(() => {
    setSavedNames(getSavedUserNames());
    const lastUser = getActiveUserName();
    if (lastUser) {
      const loaded = loadOrCreateUserProfile(lastUser);
      setProfile(loaded);
      if (loaded.placementLanguage) {
        setSelectedLangId(loaded.placementLanguage);
      }
      if (!loaded.placementCompleted) {
        setShowPlacementModal(true);
      }
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
    setLoginLegalPage(null);
    setActiveTab('home');
    setActiveLesson(null);
    if (loaded.placementLanguage) {
      setSelectedLangId(loaded.placementLanguage);
    }
    if (!loaded.placementCompleted) {
      setShowPlacementModal(true);
    }
  };

  const handleLogout = () => {
    setActiveUserName(null);
    setProfile(null);
    setActiveLesson(null);
    setShowPlacementModal(false);
    setActiveTab('home');
  };

  const toggleTranslate = () => {
    setUiLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const openLegal = (page: LegalPageId) => {
    if (!profile) {
      setLoginLegalPage(page);
      return;
    }
    setLegalPage(page);
    setActiveLesson(null);
    setActiveTab('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Screen
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-[#fdf8fc] to-purple-50 flex flex-col justify-between p-4 sm:p-8">
        {loginLegalPage ? (
          <div className="max-w-4xl w-full mx-auto my-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setLoginLegalPage(null)}
                className="min-h-[40px] rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-bold text-purple-900 hover:bg-pink-50 cursor-pointer"
              >
                {isAr ? 'العودة إلى تسجيل الدخول' : '← Back to Login'}
              </button>
              <button
                onClick={toggleTranslate}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-pink-200 bg-pink-50 px-3.5 py-2 text-xs font-bold text-purple-900 hover:bg-pink-100 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-pink-600" />
                <span>{t.translateBtn}</span>
              </button>
            </div>
            <LegalPagesView
              activePage={loginLegalPage}
              uiLang={uiLang}
              onSelectPage={setLoginLegalPage}
            />
          </div>
        ) : (
          <div className="max-w-3xl w-full mx-auto my-auto bg-white rounded-3xl border border-pink-200 shadow-xl p-6 sm:p-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PWAInstallButton label={t.installApp} uiLang={uiLang} />
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
                    {isAr ? lang.arabicName : lang.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isAr ? lang.landmarkArabic : lang.landmark}
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
        )}

        <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-600 pt-6 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-purple-900">
            <button type="button" onClick={() => openLegal('about')} className="hover:text-pink-700 cursor-pointer">
              {t.aboutUs}
            </button>
            <button type="button" onClick={() => openLegal('privacy')} className="hover:text-pink-700 cursor-pointer">
              {t.privacyPolicy}
            </button>
            <button type="button" onClick={() => openLegal('contact')} className="hover:text-pink-700 cursor-pointer">
              {t.contactUs}
            </button>
            <button type="button" onClick={() => openLegal('terms')} className="hover:text-pink-700 cursor-pointer">
              {t.terms}
            </button>
          </div>
          <p className="text-slate-500">
            {isAr
              ? 'LingoQueen من تصميم شيرين · 300 درس · 6 لغات · القصص والألعاب · الفندقة في الجزائر · تطبيق PWA'
              : 'LingoQueen by Chirine · 300 Lessons · Stories & Games · Hospitality Track · Offline PWA'}
          </p>
        </footer>
        <OfflineIndicator message={t.offlineNotice} />
      </div>
    );
  }

  const totalXP = getTotalXP(profile);
  const overallLevel = getUserOverallLevel(profile);
  const todayISO = getTodayISO();
  const dailyDone = !!profile.dailyChallengeDates?.[todayISO];
  const dailyItem = getDailyChallengeForDate(todayISO);
  const wordOfTheDay = getWordOfTheDay(todayISO);
  const wotdLang =
    LANGUAGES.find((l) => l.id === wordOfTheDay.languageId) || LANGUAGES[0];
  const selectedLangMeta =
    LANGUAGES.find((l) => l.id === selectedLangId) || LANGUAGES[0];
  const selectedLangProgress = profile.languages[selectedLangId];
  const selectedLangLessons = getLessonsForLanguage(selectedLangId);

  const handlePlacementComplete = (
    langId: LanguageId,
    level: PlacementCEFR,
    score: number
  ) => {
    const updated = recordPlacementResult(profile, langId, level, score);
    setProfile(updated);
    setSelectedLangId(langId);
    setSelectedStageOverride((prev) => {
      const next = { ...prev };
      delete next[langId];
      return next;
    });
    setShowPlacementModal(false);
    setActiveTab('academy');
    setActiveLesson(null);
  };

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

  const handleStoryComplete = (storyId: string) => {
    const { updated, newlyEarnedBadges } = recordStoryCompletion(profile, storyId);
    setProfile(updated);
    if (newlyEarnedBadges.length > 0) {
      launchRoyalConfetti();
    }
  };

  const handleAwardGameXP = (earnedXp: number) => {
    const { updated, newlyEarnedBadges } = recordGameXP(profile, earnedXp);
    setProfile(updated);
    if (newlyEarnedBadges.length > 0) {
      launchRoyalConfetti();
    }
  };

  const handleUpdateProfile = (changes: { name?: string; photoDataUrl?: string | null }) => {
    const updated = updateUserProfileDetails(profile, changes);
    setProfile(updated);
    setSavedNames(getSavedUserNames());
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
      setDailyFeedback(
        isAr
          ? 'صحيح! تم منحكِ +100 نقطة لليوم.'
          : 'Correct! +100 XP awarded for today.'
      );
    } else {
      setDailyFeedback(
        isAr
          ? `ليست الإجابة الصحيحة — الصواب هو: "${dailyItem.question.options[dailyItem.question.correctIndex]}". حاولي مجدداً!`
          : `Not quite — Correct answer: "${dailyItem.question.options[dailyItem.question.correctIndex]}". Try again!`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8fc] text-slate-900 pb-20 md:pb-8 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="no-print sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
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
                setActiveTab('stories');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'stories'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.storiesNav}
            </button>
            <button
              onClick={() => {
                setActiveTab('games');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'games'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.gamesNav}
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
                setActiveTab('profile');
                setActiveLesson(null);
              }}
              className={`whitespace-nowrap shrink-0 hover:text-pink-700 transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'text-pink-700 font-bold underline underline-offset-8'
                  : ''
              }`}
            >
              {t.profileNav}
            </button>
          </nav>

          {/* Zone 3: Primary Action (TRANSLATE English <-> Fusha Arabic) */}
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
          /* HOME SCREEN */
          <div className="space-y-7">
            {/* Hero Welcome & User Profile Chip + PWA Download */}
            <section className="rounded-3xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-start gap-5">
                  <LingoQueenLogo size={156} />
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
                  {/* Profile Avatar Quick Link */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="min-h-[44px] inline-flex items-center gap-2.5 rounded-xl border border-pink-200 bg-pink-50/70 px-3.5 py-1.5 hover:bg-pink-100 transition cursor-pointer"
                  >
                    {profile.photoDataUrl ? (
                      <img
                        src={profile.photoDataUrl}
                        alt={profile.name}
                        className="w-8 h-8 rounded-full object-cover border border-pink-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 text-white flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="text-start leading-tight">
                      <div className="text-xs font-bold text-purple-950">{profile.name}</div>
                      <div className="text-[11px] font-semibold text-pink-700 tabular-nums">
                        {overallLevel} · {totalXP} XP
                      </div>
                    </div>
                  </button>

                  <PWAInstallButton label={t.installApp} uiLang={uiLang} />

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
                      {profile.streak} {isAr ? 'يوم' : 'Days'}
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
                  className="text-start rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 p-4 text-white flex items-center justify-between hover:opacity-95 transition cursor-pointer"
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

            {/* Word of the Day + Quick Action Strip (Level Test, Stories/Games, Luna AI) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Word of the Day Card */}
              <div className="lg:col-span-7 rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-pink-700">
                      {t.wordOfTheDay} · {isAr ? wotdLang.arabicName : wotdLang.name}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2.5 mt-1">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                        {wordOfTheDay.word}
                      </h2>
                      <span className="text-xs text-slate-500">/{wordOfTheDay.phonetic}/</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakText(wordOfTheDay.word, wotdLang.speechLang, 0.85)}
                    className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-pink-50 border border-pink-200 px-3.5 py-2 text-xs font-bold text-pink-700 hover:bg-pink-100 cursor-pointer shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{t.listen}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-pink-50/50 border border-pink-100 p-3.5">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {isAr ? 'المعنى بالعربية الفصحى' : 'Fusha Arabic Meaning'}
                    </div>
                    <div className="text-sm font-bold text-purple-950 mt-0.5" dir="rtl">
                      {wordOfTheDay.arabicFusha}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {isAr ? 'المعنى بالإنجليزية' : 'English Meaning'}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">
                      {wordOfTheDay.english}
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 pt-1 border-t border-pink-50">
                  <div className="space-y-0.5 text-xs">
                    <p className="font-semibold text-purple-950">“{wordOfTheDay.example}”</p>
                    <p className="text-pink-700 font-medium" dir="rtl">
                      {wordOfTheDay.exampleArabic}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakText(wordOfTheDay.example, wotdLang.speechLang, 0.86)}
                    className="p-2 rounded-lg border border-pink-200 text-pink-700 hover:bg-pink-50 cursor-pointer shrink-0"
                    aria-label="Listen example sentence"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Level Test + Stories & Games + Luna AI */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-3">
                <div className="rounded-2xl bg-gradient-to-r from-purple-900 to-pink-700 p-5 text-white shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <Compass className="w-4 h-4" />
                      <span>{t.levelTestTitle}</span>
                    </div>
                    <p className="text-xs text-pink-100 leading-relaxed">{t.levelTestDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPlacementModal(true)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-white text-xs font-bold text-purple-950 hover:bg-pink-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {t.takeLevelTest}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('stories')}
                    className="text-start rounded-2xl bg-white border border-pink-100 p-4 hover:border-pink-400 transition shadow-xs space-y-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-5 h-5 text-pink-600" />
                    <div className="text-sm font-bold text-purple-950">{t.storiesNav}</div>
                    <div className="text-[11px] text-slate-600">
                      {isAr ? 'قصص ممتعة بالفصحى' : 'Fusha translated stories'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('games')}
                    className="text-start rounded-2xl bg-white border border-pink-100 p-4 hover:border-pink-400 transition shadow-xs space-y-1.5 cursor-pointer"
                  >
                    <Gamepad2 className="w-5 h-5 text-purple-700" />
                    <div className="text-sm font-bold text-purple-950">{t.gamesNav}</div>
                    <div className="text-[11px] text-slate-600">
                      {isAr ? 'ألعاب الذاكرة والسرعة' : 'Memory, Blitz & Scramble'}
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('luna')}
                  className="text-start rounded-2xl bg-pink-50/70 border border-pink-200 p-4 hover:border-pink-400 transition flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-purple-950">{t.lunaTitle}</div>
                      <div className="text-[11px] text-slate-600">
                        {isAr ? 'تصحيح فوري وإجابات بالعربية الفصحى' : 'Instant grammar & Fusha translations'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-700 shrink-0">
                    {isAr ? 'فتح ←' : 'Open →'}
                  </span>
                </button>
              </div>
            </section>

            {/* 6 Language Cards with Circular Landmarks & 0%->100% Progress Bars */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {LANGUAGES.map((lang) => {
                const lp = profile.languages[lang.id];
                const percent = computeLanguageProgressPercent(lp);
                const { completedInPath, totalInPath } = getPathStats(lp);
                const startLbl = lp.placementLevel || 'A1';

                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLangId(lang.id);
                      setActiveTab('academy');
                    }}
                    className="text-start rounded-2xl bg-white border border-pink-100 p-6 hover:border-pink-400 hover:shadow-md transition flex flex-col justify-between gap-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <LandmarkCircle languageId={lang.id} size={60} />
                        <div>
                          <h2 className="text-xl font-bold text-purple-950">
                            {isAr ? lang.arabicName : lang.name}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {lang.nativeName} ·{' '}
                            {isAr ? lang.landmarkArabic : lang.landmark}
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
                          {t.progressLabel} ({completedInPath}/{totalInPath} {t.lessonsCompleted})
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
                        {isAr
                          ? `المسار ${startLbl} ← C2 · ${totalInPath} درساً`
                          : `Path ${startLbl}→C2 · ${totalInPath} Lessons`}
                      </span>
                      <span className="text-pink-700">
                        {completedInPath > 0 ? t.continueLearning : t.startLearning} →
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>

            {/* Ad Space on Home Page */}
            <AdSpace
              placement="home"
              uiLang={uiLang}
              onActionClick={() => openLegal('contact')}
            />
          </div>
        ) : activeTab === 'academy' ? (
          /* LANGUAGE ACADEMY VIEW: Personal Path A->C showing ONLY current level lessons */
          (() => {
            const pathStats = getPathStats(selectedLangProgress);
            const pathPercent = computeLanguageProgressPercent(selectedLangProgress);
            const startStageIdx = PATH_STAGES.findIndex(
              (s) => pathStats.startLesson >= s.start && pathStats.startLesson <= s.end
            );
            const effectiveStartIdx = startStageIdx >= 0 ? startStageIdx : 0;

            const isStageUnlocked = (s: PathStageDef): boolean => {
              if (s.end < pathStats.startLesson) return false;
              if (s.stage === 6) {
                if (pathStats.startLesson >= 46) return true;
                const c1DoneCount = [41, 42, 43, 44, 45].filter((id) =>
                  selectedLangProgress.completedLessons.includes(id)
                ).length;
                return selectedLangProgress.unlockedTier >= 5 && c1DoneCount >= 5;
              }
              return selectedLangProgress.unlockedTier >= s.tier;
            };

            const unlockedStages = PATH_STAGES.filter(isStageUnlocked);
            const highestUnlockedStage =
              unlockedStages[unlockedStages.length - 1] || PATH_STAGES[effectiveStartIdx];

            const overrideStageNum = selectedStageOverride[selectedLangId];
            const activeStage =
              PATH_STAGES.find((s) => s.stage === overrideStageNum && isStageUnlocked(s)) ||
              highestUnlockedStage;

            const activeLevelLessons = selectedLangLessons.filter(
              (l) => l.id >= activeStage.start && l.id <= activeStage.end
            );
            const evalResult =
              selectedLangProgress.evaluations[activeStage.checkpoint];

            return (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <LandmarkCircle languageId={selectedLangId} size={56} />
                      <div>
                        <div className="text-xs font-semibold text-pink-700">
                          {isAr ? selectedLangMeta.landmarkArabic : selectedLangMeta.landmark} ·{' '}
                          {selectedLangMeta.city}
                        </div>
                        <h1 className="text-2xl font-bold text-purple-950">
                          {isAr ? selectedLangMeta.arabicName : selectedLangMeta.name} (
                          {selectedLangMeta.nativeName})
                        </h1>
                        <p className="text-xs text-slate-600 tabular-nums mt-0.5">
                          {isAr
                            ? `التقدم: ${pathPercent}% · ${pathStats.completedInPath}/${pathStats.totalInPath} درساً في مساركِ (${selectedLangProgress.placementLevel || 'A1'}←C2) · ${selectedLangProgress.xp} نقطة`
                            : `Progress: ${pathPercent}% · ${pathStats.completedInPath}/${pathStats.totalInPath} lessons on your ${selectedLangProgress.placementLevel || 'A1'}→C2 path · ${selectedLangProgress.xp} XP`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPlacementModal(true)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-pink-300 bg-white text-xs font-bold text-pink-700 hover:bg-pink-50 cursor-pointer"
                      >
                        {t.takeLevelTest}
                      </button>
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
                          {isAr ? l.arabicName : l.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal Path Progress Bar 0% -> 100% */}
                  <div className="space-y-1.5 pt-2 border-t border-pink-50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-900">
                        {isAr
                          ? `المسار الشخصي (${selectedLangProgress.placementLevel || 'A1'} ← C2)`
                          : `Personal Path (${selectedLangProgress.placementLevel || 'A1'} → C2)`}
                      </span>
                      <span className="font-bold text-pink-700 tabular-nums">
                        {pathPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-pink-100 overflow-hidden">
                      <div
                        style={{ width: `${pathPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-700 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* A1 -> C2 Personal Path Selector */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {PATH_STAGES.map((st) => {
                      const testedOut = st.end < pathStats.startLesson;
                      const unlocked = isStageUnlocked(st);
                      const isActive = st.stage === activeStage.stage;
                      const stageDone = selectedLangLessons
                        .filter((l) => l.id >= st.start && l.id <= st.end)
                        .every((l) =>
                          selectedLangProgress.completedLessons.includes(l.id)
                        );

                      return (
                        <button
                          key={st.level}
                          type="button"
                          disabled={!unlocked}
                          onClick={() =>
                            setSelectedStageOverride((prev) => ({
                              ...prev,
                              [selectedLangId]: st.stage,
                            }))
                          }
                          className={`rounded-xl border px-3 py-2 text-center transition ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white border-pink-600 shadow-sm cursor-pointer'
                              : testedOut
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-default'
                              : unlocked
                              ? 'bg-pink-50/60 border-pink-200 text-purple-950 hover:bg-pink-100 cursor-pointer'
                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-xs font-extrabold flex items-center justify-center gap-1">
                            <span>{st.level}</span>
                            {!unlocked && !testedOut && (
                              <Lock className="w-3 h-3" />
                            )}
                            {stageDone && unlocked && !isActive && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            )}
                          </div>
                          <div className="text-[10px] mt-0.5 opacity-90">
                            {testedOut
                              ? isAr
                                ? 'مُجتاز'
                                : 'Tested Out'
                              : isActive
                              ? isAr
                                ? 'مستواكِ'
                                : 'Your Level'
                              : unlocked
                              ? `L${st.start}–${st.end}`
                              : isAr
                              ? 'مغلق'
                              : 'Locked'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Level ONLY Lessons */}
                <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-50 pb-4">
                    <div>
                      <div className="text-xs font-bold text-pink-700">
                        {t.lessonsRange} {activeStage.start}–{activeStage.end} ·{' '}
                        {isAr ? 'المستوى النشط في مساركِ' : 'Active Level on Your Path'}
                      </div>
                      <h2 className="text-lg font-bold text-purple-950 flex items-center gap-2">
                        <span>
                          {isAr ? activeStage.labelAr : activeStage.labelEn}
                        </span>
                      </h2>
                    </div>

                    <button
                      onClick={() =>
                        setExamConfig({
                          mode: 'evaluation',
                          checkpoint: activeStage.checkpoint,
                          lang: selectedLangMeta,
                        })
                      }
                      className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-purple-900 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-800 cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-amber-300" />
                      <span>
                        {t.takeEvaluation}
                        {evalResult ? ` · ${evalResult.score}/100 (${evalResult.band})` : ''}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {activeLevelLessons.map((lesson) => {
                      const done = selectedLangProgress.completedLessons.includes(
                        lesson.id
                      );
                      const res = selectedLangProgress.lessonResults[lesson.id];

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`text-start rounded-xl border p-3.5 transition flex flex-col justify-between gap-2 min-h-[104px] cursor-pointer ${
                            done
                              ? 'bg-pink-50/40 border-pink-300 hover:border-pink-500'
                              : 'bg-white border-pink-100 hover:border-pink-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-900 tabular-nums">
                              L{lesson.id} · {activeStage.level}
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
                              {isAr ? `النتيجة: ${res.score}/100` : `Score: ${res.score}/100`}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500">
                              {isAr ? 'ابدئي الدرس ←' : 'Start Lesson →'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Final Mastery Exam Banner */}
                <section className="rounded-2xl bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <Crown className="w-4 h-4" />
                      <span>{isAr ? 'الامتحان النهائي · إتقان C2' : 'Final Exam · C2 Crown Mastery'}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{t.takeFinalExam}</h2>
                    <p className="text-sm text-pink-100 max-w-xl">
                      {isAr
                        ? 'احصلي على 70% فأكثر خلال 90 ثانية عبر 20 سؤالاً شاملاً لنيل +500 نقطة ووسام التاج الذهبي وشهادتكِ الملكية.'
                        : 'Score 70% or higher within 90 seconds across 20 comprehensive questions to earn +500 XP, your Golden Crown Badge, and your Royal Certificate.'}
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
                        <span>{isAr ? 'عرض الشهادة' : 'View Certificate'}</span>
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
                      {isAr ? 'بدء الامتحان النهائي (90ث)' : 'Start Final Exam (90s)'}
                    </button>
                  </div>
                </section>
              </div>
            );
          })()
        ) : activeTab === 'stories' ? (
          <StoriesView
            completedStories={profile.completedStories || []}
            uiLang={uiLang}
            onCompleteStory={handleStoryComplete}
            onOpenContact={() => openLegal('contact')}
          />
        ) : activeTab === 'games' ? (
          <GamesView
            uiLang={uiLang}
            gamesXp={profile.gamesXp || 0}
            gamesPlayed={profile.gamesPlayed || 0}
            onAwardGameXP={handleAwardGameXP}
          />
        ) : activeTab === 'hotel' ? (
          <HotelTrackView
            completedLessons={profile.hotelTrack.completedLessons}
            scores={profile.hotelTrack.scores}
            savedCvDraft={profile.hotelTrack.cvDraft}
            cvScore={profile.hotelTrack.cvScore}
            interviewScore={profile.hotelTrack.interviewScore}
            userName={profile.name}
            uiLang={uiLang}
            onCompleteHotelLesson={handleHotelLessonComplete}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView
            profile={profile}
            uiLang={uiLang}
            onUpdateProfile={handleUpdateProfile}
            onOpenLevelTest={() => setShowPlacementModal(true)}
            onOpenCertificate={(lang, result) => setCertificateData({ lang, result })}
          />
        ) : activeTab === 'luna' ? (
          <LunaTutorView defaultLang={selectedLangId} />
        ) : (
          <LegalPagesView
            activePage={legalPage}
            uiLang={uiLang}
            onSelectPage={setLegalPage}
          />
        )}
      </main>

      {/* Footer with About Us, Privacy Policy, Contact Us, Terms */}
      <footer className="no-print border-t border-pink-100 bg-white/80 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-purple-950">
            <LingoQueenLogo size={24} compact />
            <span>
              {isAr
                ? 'LingoQueen من تصميم شيرين · جميع الترجمات بالعربية الفصحى'
                : 'LingoQueen by Chirine · All Translations in Fusha Arabic'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-purple-900">
            <button
              type="button"
              onClick={() => openLegal('about')}
              className={`hover:text-pink-700 cursor-pointer ${
                activeTab === 'legal' && legalPage === 'about' ? 'text-pink-700 underline' : ''
              }`}
            >
              {t.aboutUs}
            </button>
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className={`hover:text-pink-700 cursor-pointer ${
                activeTab === 'legal' && legalPage === 'privacy' ? 'text-pink-700 underline' : ''
              }`}
            >
              {t.privacyPolicy}
            </button>
            <button
              type="button"
              onClick={() => openLegal('contact')}
              className={`hover:text-pink-700 cursor-pointer ${
                activeTab === 'legal' && legalPage === 'contact' ? 'text-pink-700 underline' : ''
              }`}
            >
              {t.contactUs}
            </button>
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className={`hover:text-pink-700 cursor-pointer ${
                activeTab === 'legal' && legalPage === 'terms' ? 'text-pink-700 underline' : ''
              }`}
            >
              {t.terms}
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
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
            setActiveTab('stories');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'stories' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{t.storiesNav}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('games');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'games' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>{t.gamesNav}</span>
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
            setActiveTab('profile');
            setActiveLesson(null);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'profile' ? 'text-pink-700' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{t.profileNav}</span>
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
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-3 text-xs text-purple-900">
              {isAr ? 'عبارة اليوم:' : 'Phrase of the day:'}{' '}
              <strong>{dailyItem.bonusPhrase}</strong> ·{' '}
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
                  className={`min-h-[44px] text-start px-3.5 py-2 rounded-xl border text-sm cursor-pointer ${
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
              {isAr ? 'إرسال التحدي اليومي' : 'Submit Daily Challenge'}
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
          uiLang={uiLang}
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

      {/* 5-Minute Level Assessment Modal */}
      {showPlacementModal && (
        <PlacementTestModal
          initialLangId={selectedLangId}
          userName={profile.name}
          uiLang={uiLang}
          allowClose={!!profile.placementCompleted}
          onComplete={handlePlacementComplete}
          onClose={() => setShowPlacementModal(false)}
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

      {/* Persistent Floating Pink Luna Chat Box */}
      {activeTab !== 'luna' &&
        !examConfig &&
        !certificateData &&
        !showPlacementModal && <LunaChatBox defaultLang={selectedLangId} />}

      <OfflineIndicator message={t.offlineNotice} />
    </div>
  );
}
