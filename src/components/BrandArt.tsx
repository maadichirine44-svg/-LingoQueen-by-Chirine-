import React from 'react';
import { LanguageId } from '../types';

export const LingoQueenLogo: React.FC<{ size?: number; compact?: boolean }> = ({
  size = 160,
  compact = false,
}) => {
  if (compact) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LingoQueen Logo"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="lqCompactBubble" x1="6" y1="16" x2="58" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EC4899" />
            <stop offset="1" stopColor="#7E22CE" />
          </linearGradient>
          <linearGradient id="lqCompactCrown" x1="20" y1="4" x2="44" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#FACC15" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
        </defs>
        <path
          d="M21 19L24 9L32 15L40 9L43 19H21Z"
          fill="url(#lqCompactCrown)"
          stroke="#A16207"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <rect x="20.5" y="19" width="23" height="3.2" rx="1.6" fill="#CA8A04" />
        <circle cx="24" cy="7.8" r="1.7" fill="#FACC15" />
        <circle cx="32" cy="13.6" r="1.7" fill="#FACC15" />
        <circle cx="40" cy="7.8" r="1.7" fill="#FACC15" />
        <path
          d="M14 23H50C53.866 23 57 26.134 57 30V45C57 48.866 53.866 52 50 52H28L18 59L20.5 52H14C10.134 52 7 48.866 7 45V30C7 26.134 10.134 23 14 23Z"
          fill="url(#lqCompactBubble)"
        />
        {/* 6 mini landmark dots inside compact bubble */}
        <circle cx="21" cy="33" r="3.4" fill="#FDF2F8" />
        <circle cx="32" cy="33" r="3.4" fill="#FDF2F8" />
        <circle cx="43" cy="33" r="3.4" fill="#FDF2F8" />
        <circle cx="21" cy="43" r="3.4" fill="#FDF2F8" />
        <circle cx="32" cy="43" r="3.4" fill="#FDF2F8" />
        <circle cx="43" cy="43" r="3.4" fill="#FDF2F8" />
      </svg>
    );
  }

  const height = Math.round(size * 0.92);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 240 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LingoQueen by Chirine Logo with 6 Landmarks"
      className="shrink-0 drop-shadow-sm"
    >
      <defs>
        <linearGradient id="lqHeroBubble" x1="20" y1="54" x2="220" y2="194" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="55%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="lqHeroCrown" x1="76" y1="8" x2="164" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>

      {/* Golden Crown perched on top of the speech bubble */}
      <path
        d="M78 48L86 18L106 34L120 12L134 34L154 18L162 48H78Z"
        fill="url(#lqHeroCrown)"
        stroke="#A16207"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="76" y="48" width="88" height="8.5" rx="4.25" fill="#CA8A04" />
      <circle cx="86" cy="15" r="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      <circle cx="120" cy="9" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      <circle cx="154" cy="15" r="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      <circle cx="120" cy="40" r="3" fill="#EC4899" />

      {/* Pink/Purple Speech Bubble */}
      <path
        d="M42 60H198C212.359 60 224 71.641 224 86V158C224 172.359 212.359 184 198 184H92L56 212L66 184H42C27.641 184 16 172.359 16 158V86C16 71.641 27.641 60 42 60Z"
        fill="url(#lqHeroBubble)"
      />
      <path
        d="M42 63.5H198C210.426 63.5 220.5 73.574 220.5 86V158C220.5 170.426 210.426 180.5 198 180.5H90.8L62.2 202.7L69.5 182.3L70.1 180.5H42C29.574 180.5 19.5 170.426 19.5 158V86C19.5 73.574 29.574 63.5 42 63.5Z"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
        strokeWidth="2"
      />

      {/* 6 Small Circles Inside the Speech Bubble */}
      {/* Row 1: Eiffel Tower (FR), Big Ben (EN), Sagrada Familia (ES) */}
      {/* 1. Eiffel Tower */}
      <g transform="translate(64, 96)">
        <circle cx="0" cy="0" r="21" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
        <g stroke="#7E22CE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -13V-9" stroke="#DB2777" />
          <path d="M-1.5 -9L-4 2L-9 12H-4.5C-3.8 8.5 -2 6.5 0 6.5C2 6.5 3.8 8.5 4.5 12H9L4 2L1.5 -9H-1.5Z" />
          <path d="M-5 2H5" stroke="#DB2777" />
          <path d="M-6.5 6H6.5" stroke="#DB2777" />
          <path d="M-10 12H10" />
        </g>
      </g>

      {/* 2. Big Ben */}
      <g transform="translate(120, 96)">
        <circle cx="0" cy="0" r="21" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
        <g stroke="#7E22CE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -13L-3.5 -6H3.5L0 -13Z" fill="#FACC15" stroke="#CA8A04" />
          <rect x="-5" y="-6" width="10" height="9" rx="1" />
          <circle cx="0" cy="-1.5" r="2.8" stroke="#DB2777" />
          <path d="M0 -3V-1.5L1.2 -0.8" stroke="#DB2777" />
          <rect x="-4" y="3" width="8" height="10" />
          <path d="M-8 13H8" />
        </g>
      </g>

      {/* 3. Sagrada Familia */}
      <g transform="translate(176, 96)">
        <circle cx="0" cy="0" r="21" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
        <g stroke="#DB2777" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-8 12V-4L-6.5 -9L-5 -4V12" />
          <path d="M-2 12V-7L0 -12L2 -7V12" stroke="#7E22CE" />
          <path d="M5 12V-4L6.5 -9L8 -4V12" />
          <path d="M-10 12H10" stroke="#7E22CE" />
          <circle cx="0" cy="-1" r="1.6" fill="#FACC15" stroke="#CA8A04" />
        </g>
      </g>

      {/* Row 2: Colosseum (IT), Great Wall (ZH), Brandenburg Gate (DE) */}
      {/* 4. Colosseum */}
      <g transform="translate(64, 148)">
        <circle cx="0" cy="0" r="21" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
        <g stroke="#7E22CE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-11 10V-4C-7 -7 -1 -8 4 -7L7 -3H11V10H-11Z" />
          <path d="M-11 1H11" stroke="#DB2777" />
          <path d="M-11 5.5H11" stroke="#DB2777" />
          <path d="M-7 10V7.5M-2.5 10V7.5M2 10V7.5M6.5 10V7.5" />
        </g>
      </g>

      {/* 5. Great Wall */}
      <g transform="translate(120, 148)">
        <circle cx="0" cy="0" r="21" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
        <g stroke="#BE185D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-11 8L-4 0L4 -3L11 -8" />
          <path d="M-11 12L-3 4L5 1L11 -4" stroke="#7E22CE" />
          <rect x="-5" y="-5" width="5" height="5" fill="#FDF2F8" stroke="#7E22CE" />
          <rect x="6" y="-11" width="5" height="5" fill="#FDF2F8" stroke="#BE185D" />
        </g>
      </g>

      {/* 6. Brandenburg Gate */}
      <g transform="translate(176, 148)">
        <circle cx="0" cy="0" r="21" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="2" />
        <g stroke="#6D28D9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -11L-3 -7H3L0 -11Z" fill="#FACC15" stroke="#CA8A04" />
          <rect x="-10" y="-7" width="20" height="3.5" rx="0.8" stroke="#DB2777" />
          <path d="M-8 -3.5V10M-4 -3.5V10M0 -3.5V10M4 -3.5V10M8 -3.5V10" />
          <path d="M-11 10H11" stroke="#DB2777" />
        </g>
      </g>
    </svg>
  );
};

export const LandmarkCircle: React.FC<{ languageId: LanguageId; size?: number }> = ({
  languageId,
  size = 56,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-100 border border-pink-200 flex items-center justify-center shrink-0 shadow-sm"
    >
      <svg
        width={size * 0.68}
        height={size * 0.68}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {languageId === 'fr' && (
          <g stroke="#9333EA" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 4V9" stroke="#DB2777" />
            <path d="M22 9L19 24L13 42H19C19.8 37.5 21.6 35 24 35C26.4 35 28.2 37.5 29 42H35L29 24L26 9H22Z" />
            <path d="M17.5 24H30.5" stroke="#DB2777" />
            <path d="M15.5 31H32.5" stroke="#DB2777" />
            <path d="M11 42H37" />
          </g>
        )}

        {languageId === 'en' && (
          <g stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 4L20 12H28L24 4Z" fill="#FACC15" stroke="#CA8A04" />
            <rect x="18" y="12" width="12" height="12" rx="1" />
            <circle cx="24" cy="18" r="3.8" stroke="#DB2777" />
            <path d="M24 16V18L25.5 19" stroke="#DB2777" />
            <rect x="19" y="24" width="10" height="18" />
            <path d="M22 28V39M26 28V39" stroke="#C084FC" />
            <path d="M15 42H33" />
          </g>
        )}

        {languageId === 'es' && (
          <g stroke="#DB2777" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 41V16L16 9L18 16V41" />
            <path d="M21.5 41V12L24 5L26.5 12V41" stroke="#7E22CE" />
            <path d="M30 41V16L32 9L34 16V41" />
            <path d="M11 41H37" stroke="#7E22CE" />
            <path d="M18 28H30M18 33H30" />
            <circle cx="24" cy="21" r="2" fill="#FACC15" stroke="#CA8A04" />
          </g>
        )}

        {languageId === 'it' && (
          <g stroke="#7E22CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 40V18C14 14 21 13 27 14L31 19H39V40H9Z" />
            <path d="M9 26H39" stroke="#DB2777" />
            <path d="M9 33H39" stroke="#DB2777" />
            <path d="M14 40V35C14 33.8 15.5 33.8 15.5 35V40" />
            <path d="M20 40V35C20 33.8 21.5 33.8 21.5 35V40" />
            <path d="M26 40V35C26 33.8 27.5 33.8 27.5 35V40" />
            <path d="M32 40V35C32 33.8 33.5 33.8 33.5 35V40" />
            <path d="M14 26V21M20 26V21M26 26V21" />
          </g>
        )}

        {languageId === 'zh' && (
          <g stroke="#BE185D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 38L16 26L28 22L40 13" />
            <path d="M7 42L17 31L29 27L41 18" stroke="#7E22CE" />
            <rect x="14" y="19" width="7" height="7" fill="#FDF2F8" stroke="#7E22CE" />
            <rect x="33" y="9" width="7" height="7" fill="#FDF2F8" stroke="#BE185D" />
            <path d="M15 19V17M17.5 19V17M20 19V17" />
            <path d="M34 9V7M36.5 9V7M39 9V7" />
          </g>
        )}

        {languageId === 'de' && (
          <g stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 7L20 13H28L24 7Z" fill="#FACC15" stroke="#CA8A04" />
            <rect x="10" y="13" width="28" height="4.5" rx="1" stroke="#DB2777" />
            <path d="M13 18V40M18.5 18V40M24 18V40M29.5 18V40M35 18V40" />
            <path d="M8 40H40" stroke="#DB2777" />
          </g>
        )}
      </svg>
    </div>
  );
};
