import React from 'react';
import { Award, Printer, X } from 'lucide-react';
import { LanguageMeta, FinalExamResult } from '../types';
import { LingoQueenLogo } from './BrandArt';

interface CertificateModalProps {
  userName: string;
  language: LanguageMeta;
  result: FinalExamResult;
  onClose: () => void;
  titleLabel: string;
  printLabel: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  userName,
  language,
  result,
  onClose,
  titleLabel,
  printLabel,
}) => {
  const formattedDate = new Date(result.completedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-pink-200 overflow-hidden">
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-pink-50/50">
          <div className="flex items-center gap-2 text-purple-900 font-semibold text-sm">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{titleLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="min-h-[40px] inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-700 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{printLabel}</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Close certificate"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-gradient-to-br from-pink-50/70 via-white to-purple-50/70">
          <div className="border-2 border-amber-400/70 rounded-xl p-6 sm:p-10 text-center bg-white shadow-inner relative">
            <div className="flex justify-center mb-4">
              <LingoQueenLogo size={108} />
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase text-pink-700">
              LingoQueen Academy · by Chirine
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-royal text-purple-950">
              Certificate of Language Mastery
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              This royal honor is proudly awarded to
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700">
              {userName}
            </p>
            <p className="mt-4 text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
              For successfully passing the 20-question Final Mastery Examination in{' '}
              <strong className="text-purple-900">
                {language.name} ({language.nativeName})
              </strong>{' '}
              across CEFR Levels A1–C2.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-b border-pink-100 py-4 text-center">
              <div>
                <div className="text-xs text-slate-500">Final Score</div>
                <div className="text-xl font-bold text-purple-900 tabular-nums">
                  {result.score}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Award</div>
                <div className="text-sm font-bold text-amber-600 mt-1">
                  Golden Crown Badge
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Date Issued</div>
                <div className="text-sm font-semibold text-slate-800 mt-1 tabular-nums">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
              <span>Credential ID: {result.certificateId || 'LQ-ROYAL-2026'}</span>
              <span className="font-royal italic text-base text-purple-900">
                Chirine · LingoQueen Founder
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
