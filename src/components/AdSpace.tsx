import React from 'react';
import { Megaphone, Sparkles } from 'lucide-react';
import { UILanguage } from '../types';

interface AdSpaceProps {
  placement: 'home' | 'stories';
  uiLang: UILanguage;
  onActionClick?: () => void;
}

export const AdSpace: React.FC<AdSpaceProps> = ({
  placement,
  uiLang,
  onActionClick,
}) => {
  const isAr = uiLang === 'ar';

  return (
    <aside
      aria-label={isAr ? 'مساحة إعلانية' : 'Ad Space'}
      className="rounded-2xl border border-dashed border-pink-300 bg-gradient-to-r from-pink-50/80 via-white to-purple-50/80 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-600 to-purple-700 text-white flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-pink-700">
              {isAr ? 'مساحة إعلانية · شريك أكاديمي' : 'Ad Space · Sponsored Slot'}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-purple-950 mt-0.5">
              {placement === 'home'
                ? isAr
                  ? 'مساحة إعلانية مخصصة للصفحة الرئيسية — اعرضي مبادرتكِ التعليمية هنا'
                  : 'Home Featured Partner Space — Reach Multilingual Learners & Hospitality Talent'
                : isAr
                ? 'مساحة إعلانية مخصصة لصفحة القصص — ادعمي القراءة باللغات الست'
                : 'Stories Reader Partner Space — Promote Books, Travel & Cultural Experiences'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isAr
                ? 'مساحة نظيفة متوافقة مع تجربة القراءة والتعلم في LingoQueen.'
                : 'Clean, non-intrusive placement designed for educational, book, and hospitality partners.'}
            </p>
          </div>
        </div>

        {onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-bold text-purple-900 hover:bg-pink-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>{isAr ? 'أعلني معنا' : 'Partner With Us'}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
