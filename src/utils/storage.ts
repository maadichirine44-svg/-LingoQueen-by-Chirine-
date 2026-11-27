import {
  EvaluationBand,
  EvaluationResult,
  FinalExamResult,
  LanguageId,
  LanguageMeta,
  LanguageProgress,
  LessonResult,
  PlacementCEFR,
  UserProfile,
} from '../types';

export const LANGUAGES: LanguageMeta[] = [
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    arabicName: 'الفرنسية',
    landmark: 'Eiffel Tower',
    landmarkArabic: 'برج إيفل',
    city: 'Paris',
    speechLang: 'fr-FR',
    accentColor: '#db2777',
    gradientFrom: '#ec4899',
    gradientTo: '#a855f7',
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    arabicName: 'الإنجليزية',
    landmark: 'Big Ben',
    landmarkArabic: 'ساعة بيغ بن',
    city: 'London',
    speechLang: 'en-GB',
    accentColor: '#9333ea',
    gradientFrom: '#a855f7',
    gradientTo: '#ec4899',
  },
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    arabicName: 'الإسبانية',
    landmark: 'Sagrada Família',
    landmarkArabic: 'ساغرادا فاميليا',
    city: 'Barcelona',
    speechLang: 'es-ES',
    accentColor: '#e11d48',
    gradientFrom: '#f43f5e',
    gradientTo: '#9333ea',
  },
  {
    id: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    arabicName: 'الإيطالية',
    landmark: 'Colosseum',
    landmarkArabic: 'الكولوسيوم',
    city: 'Rome',
    speechLang: 'it-IT',
    accentColor: '#7e22ce',
    gradientFrom: '#c026d3',
    gradientTo: '#7e22ce',
  },
  {
    id: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    arabicName: 'الصينية',
    landmark: 'Great Wall',
    landmarkArabic: 'سور الصين العظيم',
    city: 'Beijing',
    speechLang: 'zh-CN',
    accentColor: '#be185d',
    gradientFrom: '#db2777',
    gradientTo: '#6b21a8',
  },
  {
    id: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    arabicName: 'الألمانية',
    landmark: 'Brandenburg Gate',
    landmarkArabic: 'بوابة براندنبورغ',
    city: 'Berlin',
    speechLang: 'de-DE',
    accentColor: '#6d28d9',
    gradientFrom: '#9333ea',
    gradientTo: '#db2777',
  },
];

export const BADGE_THRESHOLDS = [
  { id: 'badge_500', xp: 500, title: 'Rose Quartz Scholar', titleAr: 'باحثة الكوارتز الوردي' },
  { id: 'badge_1500', xp: 1500, title: 'Amethyst Polyglot', titleAr: 'متعددة اللغات بالجمشت' },
  { id: 'badge_3000', xp: 3000, title: 'Royal Velvet Sovereign', titleAr: 'سيدة المخمل الملكي' },
  { id: 'badge_6000', xp: 6000, title: 'Grand Empress of Tongues', titleAr: 'إمبراطورة اللغات العظمى' },
];

const USERS_INDEX_KEY = 'lingoqueen_users_index_v1';
const ACTIVE_USER_KEY = 'lingoqueen_active_user_v1';
const PROFILE_PREFIX = 'lingoqueen_profile_v1_';

function createEmptyLanguageProgress(): LanguageProgress {
  return {
    completedLessons: [],
    lessonResults: {},
    evaluations: {},
    unlockedTier: 1,
    xp: 0,
  };
}

export function createEmptyProfile(name: string): UserProfile {
  const today = getTodayISO();
  return {
    name: name.trim(),
    photoDataUrl: undefined,
    createdAt: new Date().toISOString(),
    streak: 1,
    lastActiveDate: today,
    dailyChallengeDates: {},
    languages: {
      fr: createEmptyLanguageProgress(),
      en: createEmptyLanguageProgress(),
      es: createEmptyLanguageProgress(),
      it: createEmptyLanguageProgress(),
      zh: createEmptyLanguageProgress(),
      de: createEmptyLanguageProgress(),
    },
    hotelTrack: {
      completedLessons: [],
      scores: {},
      xp: 0,
    },
    earnedBadges: [],
    completedStories: [],
    gamesXp: 0,
    gamesPlayed: 0,
  };
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeUserKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
}

export function getSavedUserNames(): string[] {
  try {
    const raw = localStorage.getItem(USERS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getActiveUserName(): string | null {
  try {
    return localStorage.getItem(ACTIVE_USER_KEY);
  } catch {
    return null;
  }
}

export function setActiveUserName(name: string | null) {
  try {
    if (!name) {
      localStorage.removeItem(ACTIVE_USER_KEY);
    } else {
      localStorage.setItem(ACTIVE_USER_KEY, name.trim());
    }
  } catch {
    // ignore storage quota errors
  }
}

export function loadOrCreateUserProfile(name: string): UserProfile {
  const cleanName = name.trim();
  const key = PROFILE_PREFIX + normalizeUserKey(cleanName);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const profile = JSON.parse(raw) as UserProfile;
      // Update streak if new day
      const today = getTodayISO();
      if (profile.lastActiveDate !== today) {
        const last = new Date(profile.lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          profile.streak = (profile.streak || 0) + 1;
        } else if (diffDays > 1) {
          profile.streak = 1;
        }
        profile.lastActiveDate = today;
        saveUserProfile(profile);
      }
      return profile;
    }
  } catch {
    // fall through to create
  }

  const fresh = createEmptyProfile(cleanName);
  saveUserProfile(fresh);
  const existingNames = getSavedUserNames();
  if (!existingNames.some((n) => normalizeUserKey(n) === normalizeUserKey(cleanName))) {
    try {
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify([...existingNames, cleanName]));
    } catch {
      // ignore
    }
  }
  return fresh;
}

export function saveUserProfile(profile: UserProfile): void {
  const key = PROFILE_PREFIX + normalizeUserKey(profile.name);
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function updateUserProfileDetails(
  profile: UserProfile,
  changes: { name?: string; photoDataUrl?: string | null }
): UserProfile {
  const oldKey = PROFILE_PREFIX + normalizeUserKey(profile.name);
  const nextName = changes.name !== undefined && changes.name.trim() ? changes.name.trim() : profile.name;
  const nextPhoto =
    changes.photoDataUrl === null
      ? undefined
      : changes.photoDataUrl !== undefined
      ? changes.photoDataUrl
      : profile.photoDataUrl;

  const updated: UserProfile = {
    ...profile,
    name: nextName,
    photoDataUrl: nextPhoto,
  };

  const newKey = PROFILE_PREFIX + normalizeUserKey(nextName);
  try {
    if (oldKey !== newKey) {
      localStorage.removeItem(oldKey);
      const existingNames = getSavedUserNames().filter(
        (n) => normalizeUserKey(n) !== normalizeUserKey(profile.name)
      );
      if (!existingNames.some((n) => normalizeUserKey(n) === normalizeUserKey(nextName))) {
        existingNames.push(nextName);
      }
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(existingNames));
      setActiveUserName(nextName);
    }
    localStorage.setItem(newKey, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function getTotalXP(profile: UserProfile): number {
  const langXp = Object.values(profile.languages).reduce((sum, l) => sum + (l.xp || 0), 0);
  const dailyXp = Object.values(profile.dailyChallengeDates || {}).filter(Boolean).length * 100;
  const storiesXp = (profile.completedStories?.length || 0) * 40;
  const gamesXp = profile.gamesXp || 0;
  return langXp + (profile.hotelTrack?.xp || 0) + dailyXp + storiesXp + gamesXp;
}

export function getUserOverallLevel(profile: UserProfile): PlacementCEFR {
  const xp = getTotalXP(profile);
  const placed = profile.placementLevel;
  if (xp >= 4500 || placed === 'C2') return 'C2';
  if (xp >= 3000 || placed === 'C1') return 'C1';
  if (xp >= 1800 || placed === 'B2') return 'B2';
  if (xp >= 900 || placed === 'B1') return 'B1';
  if (xp >= 300 || placed === 'A2') return 'A2';
  return 'A1';
}

export function getPathRangeForLevel(level?: PlacementCEFR): {
  startLesson: number;
  unlockedTier: number;
} {
  switch (level) {
    case 'A2':
      return { startLesson: 11, unlockedTier: 2 };
    case 'B1':
      return { startLesson: 21, unlockedTier: 3 };
    case 'B2':
      return { startLesson: 31, unlockedTier: 4 };
    case 'C1':
      return { startLesson: 41, unlockedTier: 5 };
    case 'C2':
      return { startLesson: 46, unlockedTier: 5 };
    case 'A1':
    default:
      return { startLesson: 1, unlockedTier: 1 };
  }
}

export function getPathStats(langProgress: LanguageProgress): {
  completedInPath: number;
  totalInPath: number;
  startLesson: number;
} {
  const startLesson = langProgress.pathStartLesson || 1;
  const totalInPath = Math.max(1, 50 - startLesson + 1);
  const completedSet = new Set(
    (langProgress.completedLessons || []).filter((id) => id >= startLesson && id <= 50)
  );
  return {
    completedInPath: completedSet.size,
    totalInPath,
    startLesson,
  };
}

export function computeLanguageProgressPercent(langProgress: LanguageProgress): number {
  // Strictly starts at 0%, moves ONLY with completed lessons along user's path up to 100%
  const { completedInPath, totalInPath } = getPathStats(langProgress);
  return Math.min(100, Math.round((completedInPath / totalInPath) * 100));
}

export function recordPlacementResult(
  profile: UserProfile,
  langId: LanguageId,
  level: PlacementCEFR,
  score: number
): UserProfile {
  const { startLesson, unlockedTier } = getPathRangeForLevel(level);
  const prevLang = profile.languages[langId];
  const updated: UserProfile = {
    ...profile,
    placementCompleted: true,
    placementLanguage: langId,
    placementLevel: level,
    placementScore: score,
    languages: {
      ...profile.languages,
      [langId]: {
        ...prevLang,
        placementLevel: level,
        pathStartLesson: startLesson,
        unlockedTier: Math.max(prevLang.unlockedTier || 1, unlockedTier),
      },
    },
  };
  saveUserProfile(updated);
  return updated;
}

export function evaluateMilestoneBadges(profile: UserProfile): {
  updated: UserProfile;
  newlyEarned: string[];
} {
  const total = getTotalXP(profile);
  const newlyEarned: string[] = [];
  const nextBadges = new Set(profile.earnedBadges || []);

  for (const b of BADGE_THRESHOLDS) {
    if (total >= b.xp && !nextBadges.has(b.id)) {
      nextBadges.add(b.id);
      newlyEarned.push(b.id);
    }
  }

  const updated: UserProfile = {
    ...profile,
    earnedBadges: Array.from(nextBadges),
  };
  return { updated, newlyEarned };
}

export function recordLessonCompletion(
  profile: UserProfile,
  langId: LanguageId,
  result: LessonResult
): { updated: UserProfile; newlyEarnedBadges: string[] } {
  const prevLang = profile.languages[langId];
  const prevCompleted = new Set(prevLang.completedLessons);
  prevCompleted.add(result.lessonId);

  const prevBest = prevLang.lessonResults[result.lessonId];
  const xpDelta = prevBest ? Math.max(0, result.xpEarned - prevBest.xpEarned) : result.xpEarned;

  const updatedLang: LanguageProgress = {
    ...prevLang,
    completedLessons: Array.from(prevCompleted).sort((a, b) => a - b),
    lessonResults: {
      ...prevLang.lessonResults,
      [result.lessonId]:
        prevBest && prevBest.score > result.score ? prevBest : result,
    },
    xp: prevLang.xp + xpDelta,
  };

  const draft: UserProfile = {
    ...profile,
    languages: {
      ...profile.languages,
      [langId]: updatedLang,
    },
  };

  const { updated, newlyEarned } = evaluateMilestoneBadges(draft);
  saveUserProfile(updated);
  return { updated, newlyEarnedBadges: newlyEarned };
}

export function getEvaluationBand(score: number): EvaluationBand {
  if (score <= 30) return 'Repeat';
  if (score <= 60) return 'Good';
  if (score <= 80) return 'Very Good';
  return 'Excellent';
}

export function recordEvaluationResult(
  profile: UserProfile,
  langId: LanguageId,
  result: EvaluationResult
): { updated: UserProfile; newlyEarnedBadges: string[] } {
  const prevLang = profile.languages[langId];
  const checkpointTier = Math.round(result.checkpoint / 10);
  const nextUnlockedTier =
    result.passed && prevLang.unlockedTier <= checkpointTier
      ? Math.min(5, checkpointTier + 1)
      : prevLang.unlockedTier;

  const xpBonus = result.passed && !prevLang.evaluations[result.checkpoint]?.passed ? 150 : 25;

  const updatedLang: LanguageProgress = {
    ...prevLang,
    evaluations: {
      ...prevLang.evaluations,
      [result.checkpoint]: result,
    },
    unlockedTier: nextUnlockedTier,
    xp: prevLang.xp + xpBonus,
  };

  const draft: UserProfile = {
    ...profile,
    languages: {
      ...profile.languages,
      [langId]: updatedLang,
    },
  };

  const { updated, newlyEarned } = evaluateMilestoneBadges(draft);
  saveUserProfile(updated);
  return { updated, newlyEarnedBadges: newlyEarned };
}

export function recordFinalExamResult(
  profile: UserProfile,
  langId: LanguageId,
  result: FinalExamResult
): { updated: UserProfile; newlyEarnedBadges: string[] } {
  const prevLang = profile.languages[langId];
  const alreadyPassed = prevLang.finalExam?.passed;
  const xpAward = result.passed && !alreadyPassed ? 500 : 0;

  const updatedLang: LanguageProgress = {
    ...prevLang,
    finalExam: alreadyPassed && !result.passed ? prevLang.finalExam : result,
    xp: prevLang.xp + xpAward,
  };

  const nextBadges = new Set(profile.earnedBadges || []);
  const goldenBadgeId = `golden_${langId}`;
  const newlyEarnedGolden: string[] = [];
  if (result.passed && !nextBadges.has(goldenBadgeId)) {
    nextBadges.add(goldenBadgeId);
    newlyEarnedGolden.push(goldenBadgeId);
  }

  const draft: UserProfile = {
    ...profile,
    languages: {
      ...profile.languages,
      [langId]: updatedLang,
    },
    earnedBadges: Array.from(nextBadges),
  };

  const { updated, newlyEarned } = evaluateMilestoneBadges(draft);
  saveUserProfile(updated);
  return { updated, newlyEarnedBadges: [...newlyEarnedGolden, ...newlyEarned] };
}

export function recordStoryCompletion(
  profile: UserProfile,
  storyId: string
): { updated: UserProfile; newlyEarnedBadges: string[] } {
  const prev = new Set(profile.completedStories || []);
  prev.add(storyId);
  const draft: UserProfile = {
    ...profile,
    completedStories: Array.from(prev),
  };
  const { updated, newlyEarned } = evaluateMilestoneBadges(draft);
  saveUserProfile(updated);
  return { updated, newlyEarnedBadges: newlyEarned };
}

export function recordGameXP(
  profile: UserProfile,
  earnedXp: number
): { updated: UserProfile; newlyEarnedBadges: string[] } {
  const draft: UserProfile = {
    ...profile,
    gamesXp: (profile.gamesXp || 0) + Math.max(0, earnedXp),
    gamesPlayed: (profile.gamesPlayed || 0) + 1,
  };
  const { updated, newlyEarned } = evaluateMilestoneBadges(draft);
  saveUserProfile(updated);
  return { updated, newlyEarnedBadges: newlyEarned };
}
