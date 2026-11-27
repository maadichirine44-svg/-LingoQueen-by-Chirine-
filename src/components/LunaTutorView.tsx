import React, { useState } from 'react';
import { Mic, RotateCcw, Send, Sparkles, Volume2 } from 'lucide-react';
import { LanguageId } from '../types';
import { LANGUAGES } from '../utils/storage';
import { speakText } from '../utils/speech';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  languageUsed?: string;
  hasCorrection?: boolean;
  correctedSentence?: string;
  grammarNote?: string;
}

interface LunaTutorViewProps {
  defaultLang?: LanguageId;
}

// Detect common Darija tokens client-side for offline enforcement as well
const DARIJA_PATTERNS =
  /\b(labas|kidayr|kidayra|bzaf|bzzaf|wakha|safi|chokran|shukran|mzyan|mezyan|fin|shnu|chno|hanya|daba|ghda|nchaalah|smhli|3afak|afak|slama)\b/i;

export const LunaTutorView: React.FC<LunaTutorViewProps> = ({
  defaultLang = 'fr',
}) => {
  const [targetLang, setTargetLang] = useState<LanguageId>(defaultLang);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [lastPendingPrompt, setLastPendingPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Hello, Queen! I am Luna. Choose any of our 6 royal languages—French, English, Spanish, Italian, Chinese, or German—ask me any question, or write a sentence for instant grammar correction.',
      languageUsed: 'English',
    },
  ]);

  const langMeta = LANGUAGES.find((l) => l.id === targetLang) || LANGUAGES[0];

  const sendMessageToLuna = async (trimmed: string, appendUserMessage: boolean) => {
    if (!trimmed || loading) return;

    let nextHistory = messages;
    if (appendUserMessage) {
      const userMsg: ChatMessage = { role: 'user', text: trimmed };
      nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput('');
    }

    setIsResting(false);
    setLastPendingPrompt(trimmed);
    setLoading(true);

    // Offline PWA enforcement if disconnected
    if (!navigator.onLine) {
      let offlineReply = '';
      if (DARIJA_PATTERNS.test(trimmed)) {
        offlineReply = `I speak only French, English, Spanish, Italian, Chinese, and German—never Darija. Let us continue practicing in ${langMeta.name}!`;
      } else {
        offlineReply = `You are currently offline. Connect to the internet for Luna's full AI answers in ${langMeta.name}, or practice our 300 offline lessons anytime!`;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: offlineReply, languageUsed: 'English' },
      ]);
      setLastPendingPrompt(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gemini/luna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          targetLanguage: langMeta.name,
          history: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data.reply !== 'string') {
        setIsResting(true);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.reply,
          languageUsed: data.languageUsed || langMeta.name,
          hasCorrection: Boolean(data.hasCorrection),
          correctedSentence:
            typeof data.correctedSentence === 'string'
              ? data.correctedSentence
              : undefined,
          grammarNote:
            typeof data.grammarNote === 'string' ? data.grammarNote : undefined,
        },
      ]);
      setLastPendingPrompt(null);
    } catch {
      setIsResting(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    void sendMessageToLuna(trimmed, true);
  };

  const handleRetry = () => {
    if (!lastPendingPrompt || loading) return;
    void sendMessageToLuna(lastPendingPrompt, false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-purple-950">
              Luna · Multilingual Tutor
            </h1>
            <p className="text-xs text-slate-600">
              Speaks ONLY French, English, Spanish, Italian, Chinese & German · Never Darija · Corrects grammar automatically.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => setTargetLang(l.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                targetLang === l.id
                  ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                  : 'bg-pink-50 text-purple-900 hover:bg-pink-100'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Stream */}
      <div className="rounded-2xl bg-white border border-pink-100 p-4 sm:p-6 shadow-sm flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                    : 'bg-pink-50/70 border border-pink-100 text-slate-900'
                }`}
              >
                <p>{m.text}</p>

                {m.role === 'model' && (
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => speakText(m.text, langMeta.speechLang)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-pink-700 hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                    {m.languageUsed && (
                      <span className="text-xs text-slate-500">
                        · {m.languageUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {m.hasCorrection && m.correctedSentence && (
                <div className="mt-2 max-w-[85%] rounded-xl border border-pink-200 bg-pink-50 p-3 text-xs space-y-1">
                  <div className="font-bold text-pink-700">
                    Luna’s Instant Correction
                  </div>
                  <div className="text-purple-950 font-semibold">
                    “{m.correctedSentence}”
                  </div>
                  {m.grammarNote && (
                    <div className="text-slate-700">{m.grammarNote}</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-xs text-purple-700 font-medium">
              Luna is thinking in {langMeta.name}...
            </div>
          )}
        </div>

        {isResting && (
          <div className="mt-3 rounded-xl bg-purple-50 border border-pink-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm font-medium text-purple-950">
              <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
              <span>Luna is resting, try again in a few minutes</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              disabled={loading || !lastPendingPrompt}
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 pt-3 border-t border-pink-100">
          <button
            type="button"
            onClick={() => {
              const SpeechRec =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).SpeechRecognition ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).webkitSpeechRecognition;
              if (!SpeechRec) return;
              const rec = new SpeechRec();
              rec.lang = langMeta.speechLang;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rec.onresult = (e: any) => {
                const txt = e.results?.[0]?.[0]?.transcript || '';
                setInput((prev) => (prev ? `${prev} ${txt}` : txt));
              };
              rec.start();
            }}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 shrink-0 cursor-pointer"
            aria-label="Speak to Luna"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Luna anything or practice a ${langMeta.name} sentence...`}
            className="flex-1 min-h-[44px] rounded-xl border border-pink-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-semibold text-white disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
