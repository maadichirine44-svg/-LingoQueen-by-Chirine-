import React, { useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Camera,
  Check,
  Crown,
  Edit3,
  Flame,
  Gamepad2,
  Sparkles,
  Trash2,
  Trophy,
  User,
} from 'lucide-react';
import {
  FinalExamResult,
  LanguageMeta,
  UILanguage,
  UserProfile,
} from '../types';
import {
  BADGE_THRESHOLDS,
  LANGUAGES,
  computeLanguageProgressPercent,
  getTotalXP,
  getUserOverallLevel,
} from '../utils/storage';
import { LandmarkCircle } from './BrandArt';

interface ProfileViewProps {
  profile: UserProfile;
  uiLang: UILanguage;
  onUpdateProfile: (changes: { name?: string; photoDataUrl?: string | null }) => void;
  onOpenLevelTest: () => void;
  onOpenCertificate: (lang: LanguageMeta, result: FinalExamResult) => void;
}

const PRESET_AVATARS = [
  { id: 'crown', label: 'Royal Crown', bg: 'from-pink-600 to-purple-700', emoji: '👑' },
  { id: 'star', label: 'Golden Star', bg: 'from-amber-500 to-pink-600', emoji: '🌟' },
  { id: 'book', label: 'Polyglot', bg: 'from-purple-600 to-indigo-700', emoji: '📚' },
  { id: 'flower', label: 'Rose Queen', bg: 'from-rose-500 to-fuchsia-600', emoji: '🌸' },
];

function createEmojiAvatarDataUrl(emoji: string, fromHex: string, toHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${fromHex}"/><stop offset="100%" stop-color="${toHex}"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(#g)"/><text x="100" y="122" font-size="88" text-anchor="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  uiLang,
  onUpdateProfile,
  onOpenLevelTest,
  onOpenCertificate,
}) => {
  const isAr = uiLang === 'ar';
  const [subTab, setSubTab] = useState<'overview' | 'results' | 'badges'>('overview');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalXP = getTotalXP(profile);
  const overallLevel = getUserOverallLevel(profile);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onUpdateProfile({ photoDataUrl: dataUrl });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveName = () => {
    const clean = draftName.trim();
    if (clean) {
      onUpdateProfile({ name: clean });
    } else {
      setDraftName(profile.name);
    }
    setEditingName(false);
  };

  return (
    <div className="space-y-6">
      {/* My Profile Header Card: Photo, Name, Level, Points */}
      <section className="rounded-3xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-start">
            {/* Profile Photo */}
            <div className="relative group shrink-0">
              {profile.photoDataUrl ? (
                <img
                  src={profile.photoDataUrl}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 text-white flex items-center justify-center border-4 border-pink-200 shadow-md">
                  <User className="w-10 h-10" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white border border-pink-300 text-pink-700 shadow-sm flex items-center justify-center hover:bg-pink-50 cursor-pointer"
                aria-label={isAr ? 'تغيير الصورة الشخصية' : 'Upload profile photo'}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Name + Level + Photo Quick Options */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-pink-700">
                {isAr ? 'ملفي الشخصي · LingoQueen' : 'My Profile · LingoQueen'}
              </div>

              {editingName ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="min-h-[40px] rounded-xl border border-pink-300 px-3 text-base font-bold text-purple-950"
                  />
                  <button
                    type="button"
                    onClick={saveName}
                    className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white cursor-pointer"
                    aria-label="Save name"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                    {profile.name}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftName(profile.name);
                      setEditingName(true);
                    }}
                    className="p-1.5 rounded-lg border border-pink-100 text-slate-500 hover:text-pink-700 hover:bg-pink-50 cursor-pointer"
                    aria-label="Edit name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold">
                <span className="text-purple-900">
                  {isAr ? `المستوى: ${overallLevel}` : `Level: ${overallLevel}`}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-pink-700 tabular-nums">
                  {totalXP} {isAr ? 'نقطة (XP)' : 'Points (XP)'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 tabular-nums">
                  {profile.streak} {isAr ? 'أيام تتابع' : 'Day Streak'}
                </span>
              </div>

              {/* Preset Royal Avatars */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {PRESET_AVATARS.map((av, idx) => {
                  const pairs: Array<[string, string]> = [
                    ['#db2777', '#7e22ce'],
                    ['#f59e0b', '#db2777'],
                    ['#9333ea', '#4338ca'],
                    ['#f43f5e', '#c026d3'],
                  ];
                  const [c1, c2] = pairs[idx];
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() =>
                        onUpdateProfile({
                          photoDataUrl: createEmojiAvatarDataUrl(av.emoji, c1, c2),
                        })
                      }
                      className="w-8 h-8 rounded-full border border-pink-200 bg-pink-50 hover:scale-105 transition flex items-center justify-center text-sm cursor-pointer"
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  );
                })}
                {profile.photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdateProfile({ photoDataUrl: null })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isAr ? 'إزالة الصورة' : 'Clear Photo'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLevelTest}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isAr ? 'تحديث اختبار المستوى' : 'Take / Retake Level Test'}</span>
          </button>
        </div>

        {/* Key Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-pink-100">
          <div className="rounded-2xl bg-pink-50/70 border border-pink-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-600">
                {isAr ? 'مجموع النقاط' : 'Total Points'}
              </div>
              <div className="text-2xl font-extrabold text-purple-950 tabular-nums mt-0.5">
                {totalXP} XP
              </div>
            </div>
            <Crown className="w-6 h-6 text-amber-500" />
          </div>

          <div className="rounded-2xl bg-purple-50/70 border border-purple-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-600">
                {isAr ? 'المستوى العام' : 'Current Level'}
              </div>
              <div className="text-2xl font-extrabold text-purple-950 mt-0.5">
                {overallLevel}
              </div>
            </div>
            <Trophy className="w-6 h-6 text-purple-700" />
          </div>

          <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-600">
                {isAr ? 'القصص المكتملة' : 'Stories Read'}
              </div>
              <div className="text-2xl font-extrabold text-purple-950 tabular-nums mt-0.5">
                {profile.completedStories?.length || 0}
              </div>
            </div>
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>

          <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-600">
                {isAr ? 'نقاط الألعاب والتتابع' : 'Games XP & Streak'}
              </div>
              <div className="text-xl font-extrabold text-purple-950 tabular-nums mt-0.5">
                {profile.gamesXp || 0} XP · {profile.streak}d
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Gamepad2 className="w-5 h-5 text-pink-600" />
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Profile Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab('overview')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer ${
            subTab === 'overview'
              ? 'bg-purple-900 text-white'
              : 'bg-white border border-pink-100 text-purple-950 hover:border-pink-300'
          }`}
        >
          {isAr ? 'نظرة عامة والمستويات' : 'Levels Overview'}
        </button>
        <button
          onClick={() => setSubTab('results')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer ${
            subTab === 'results'
              ? 'bg-purple-900 text-white'
              : 'bg-white border border-pink-100 text-purple-950 hover:border-pink-300'
          }`}
        >
          {isAr ? 'النتائج والشهادات' : 'Saved Results & Certificates'}
        </button>
        <button
          onClick={() => setSubTab('badges')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer ${
            subTab === 'badges'
              ? 'bg-purple-900 text-white'
              : 'bg-white border border-pink-100 text-purple-950 hover:border-pink-300'
          }`}
        >
          {isAr ? 'الأوسمة الملكية' : 'Royal Badges'}
        </button>
      </div>

      {subTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const lp = profile.languages[lang.id];
            const percent = computeLanguageProgressPercent(lp);
            return (
              <div
                key={lang.id}
                className="rounded-2xl bg-white border border-pink-100 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LandmarkCircle languageId={lang.id} size={44} />
                    <div>
                      <h3 className="font-bold text-purple-950">
                        {isAr ? lang.arabicName : lang.name}
                      </h3>
                      <div className="text-xs text-slate-500">
                        {isAr ? `المستوى: ${lp.placementLevel || 'A1'}` : `Level: ${lp.placementLevel || 'A1'}`}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-700 tabular-nums">
                    {lp.xp} XP
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-700"
                  />
                </div>
                <div className="text-xs text-slate-600 tabular-nums flex justify-between">
                  <span>
                    {lp.completedLessons.length}/50 {isAr ? 'درساً' : 'lessons'}
                  </span>
                  <span className="font-bold text-purple-900">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'results' && (
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
                      <h2 className="font-bold text-purple-950">
                        {isAr ? lang.arabicName : lang.name}
                      </h2>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {computeLanguageProgressPercent(lp)}% · {lp.xp} XP
                      </p>
                    </div>
                  </div>
                  {lp.finalExam?.passed && (
                    <button
                      onClick={() => onOpenCertificate(lang, lp.finalExam!)}
                      className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 cursor-pointer"
                    >
                      {isAr ? 'الشهادة' : 'Certificate'} ({lp.finalExam.score}%)
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    {isAr ? 'تقييمات المستوى (10 أسئلة)' : 'Level Evaluations (10 Q /100)'}
                  </div>
                  {evalEntries.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      {isAr ? 'لا توجد تقييمات بعد.' : 'No evaluations taken yet.'}
                    </p>
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
                    {isAr ? `الدروس المكتملة (${lessonEntries.length})` : `Completed Lessons (${lessonEntries.length})`}
                  </div>
                  {lessonEntries.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      {isAr ? 'لم تكتمل أي دروس بعد.' : 'No lessons completed yet.'}
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {lessonEntries.map((lr) => (
                        <div
                          key={lr.lessonId}
                          className="flex items-center justify-between text-xs border border-slate-100 rounded-lg px-3 py-1.5 tabular-nums"
                        >
                          <span>
                            {isAr ? `الدرس ${lr.lessonId}` : `Lesson ${lr.lessonId}`}
                          </span>
                          <span>
                            <strong>{lr.score}/100</strong> ({lr.correctAnswers}/
                            {lr.totalQuestions} · +{lr.xpEarned} XP)
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
      )}

      {subTab === 'badges' && (
        <div className="space-y-5">
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
                    {b.xp} XP
                  </div>
                  <h3 className="text-base font-bold text-purple-950">
                    {isAr ? b.titleAr : b.title}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {earned
                      ? isAr
                        ? 'مفتوح!'
                        : 'Unlocked!'
                      : isAr
                      ? `متبقي ${Math.max(0, b.xp - totalXP)} نقطة`
                      : `${Math.max(0, b.xp - totalXP)} XP to unlock`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white border border-pink-100 p-6 space-y-4">
            <h2 className="text-lg font-bold text-purple-950">
              {isAr
                ? 'أوسمة التاج الذهبي للامتحان النهائي (+70%)'
                : 'Golden Final Exam Badges (70%+ Score)'}
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
                      {isAr ? lang.arabicName : lang.name}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {passed
                        ? isAr
                          ? 'التاج الذهبي'
                          : 'Golden Crown'
                        : isAr
                        ? 'اجتازي الامتحان النهائي'
                        : 'Pass Final Exam'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
