import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { UILanguage } from '../types';
import { LingoQueenLogo } from './BrandArt';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return { isInstallable: !!deferredPrompt, isInstalled, isIOS, install };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return isOnline;
}

export const PWAInstallButton: React.FC<{ label: string; uiLang?: UILanguage }> = ({
  label,
  uiLang = 'en',
}) => {
  const isAr = uiLang === 'ar';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 px-3.5 py-2 text-xs font-bold text-purple-950 hover:from-pink-100 hover:to-purple-100 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <LingoQueenLogo size={24} compact />
        <span>{label}</span>
        <Download className="w-3.5 h-3.5 text-pink-600" />
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-pink-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <LingoQueenLogo size={32} compact />
                <h3 className="text-lg font-bold text-purple-950">
                  {isAr ? 'تحميل تطبيق LingoQueen' : 'Download LingoQueen App (PWA)'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-pink-50/70 border border-pink-100 p-4 text-sm text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-950">
                <Smartphone className="w-4 h-4 text-pink-600" />
                <span>
                  {isIOS
                    ? isAr
                      ? 'التثبيت على أجهزة آيفون وآيباد (Safari)'
                      : 'Install on iPhone & iPad (Safari)'
                    : isAr
                    ? 'التثبيت على أندرويد والحاسوب'
                    : 'Install on Android & Desktop'}
                </span>
              </div>
              {isIOS ? (
                <p>
                  {isAr ? (
                    <>
                      1. اضغطي على أيقونة <strong>المشاركة (Share)</strong> في شريط متصفح سفاري.
                      <br />
                      2. اختاري <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> لتثبيت التطبيق بشعار LingoQueen والعمل دون إنترنت.
                    </>
                  ) : (
                    <>
                      1. Tap the <strong>Share</strong> icon in Safari’s toolbar.
                      <br />
                      2. Scroll down and tap <strong>Add to Home Screen</strong> to install LingoQueen with its crown icon for offline use.
                    </>
                  )}
                </p>
              ) : (
                <p>
                  {isAr ? (
                    <>
                      1. افتحي قائمة المتصفح (النقاط الثلاث أعلى الشاشة) في Chrome أو Edge.
                      <br />
                      2. اختاري <strong>تثبيت التطبيق (Install App)</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong>.
                    </>
                  ) : (
                    <>
                      1. Click the browser menu icon or the install icon in the address bar (Chrome / Edge).
                      <br />
                      2. Choose <strong>Install LingoQueen</strong> to save the app with the LingoQueen logo and offline study access.
                    </>
                  )}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              {isAr ? 'حسناً، فهمت' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<{ message: string }> = ({ message }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-purple-900 px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-pink-400/30">
      <WifiOff className="w-3.5 h-3.5 text-pink-300" />
      <span>{message}</span>
    </div>
  );
};
