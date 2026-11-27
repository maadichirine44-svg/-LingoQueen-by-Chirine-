import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Send, Sparkles, Volume2, X } from 'lucide-react';
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

interface LunaChatBoxProps {
  defaultLang?: LanguageId;
}

const DARIJA_PATTERNS =
  /\b(labas|kidayr|kidayra|bzaf|bzzaf|wakha|safi|chokran|shukran|mzyan|mezyan|fin|shnu|chno|hanya|daba|ghda|nchaalah|smhli|3afak|afak|slama)\b/i;

export const LunaChatBox: React.FC<LunaChatBoxProps> = ({ defaultLang = 'en' }) => {
  const [open, setOpen] = useState(false);
  const [targetLang, setTargetLang] = useState<LanguageId>(defaultLang);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [lastPendingPrompt, setLastPendingPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Hello, Queen! Write anything to me—I’ll reply, catch any mistake right away, and explain it simply!',
      languageUsed: 'English',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTargetLang(defaultLang);
  }, [defaultLang]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const langMeta = LANGUAGES.find((l) => l.id === targetLang) || LANGUAGES[1];

  const sendToLuna = async (trimmed: string, appendUser: boolean) => {
    if (!trimmed || loading) return;

    let nextHistory = messages;
    if (appendUser) {
      const userMsg: ChatMessage = { role: 'user', text: trimmed };
      nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput('');
    }

    setIsResting(false);
    setLastPendingPrompt(trimmed);
    setLoading(true);

    if (!navigator.onLine) {
      const offlineReply = DARIJA_PATTERNS.test(trimmed)
        ? `I speak only French, English, Spanish, Italian, Chinese, and German—never Darija. Let us keep practicing in ${langMeta.name}!`
        : `You are offline right now. Connect to the internet for Luna's instant chat replies and corrections in ${langMeta.name}!`;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    void sendToLuna(trimmed, true);
  };

  return (
    <div className="no-print fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-[48px] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-700 px-5 py-3 text-sm font-bold text-white shadow-lg hover:opacity-95 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Chat with Luna</span>
          <MessageCircle className="w-4 h-4" />
        </button>
      ) : (
        <div className="w-[330px] sm:w-[380px] rounded-2xl bg-white border border-pink-200 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 px-4 py-3 text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">Luna Chat</div>
                <div className="text-[11px] text-pink-100">
                  Instant reply & simple correction
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
              aria-label="Close Luna Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="px-3 py-2 bg-pink-50/70 border-b border-pink-100 flex items-center gap-1 overflow-x-auto">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setTargetLang(l.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                  targetLang === l.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                    : 'bg-white text-purple-900 border border-pink-200 hover:bg-pink-100'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="h-[300px] overflow-y-auto p-3.5 space-y-3 bg-[#fdf8fc]"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                      : 'bg-white border border-pink-100 text-slate-900 shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.role === 'model' && (
                    <button
                      type="button"
                      onClick={() => speakText(m.text, langMeta.speechLang)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>

                {m.hasCorrection && m.correctedSentence && (
                  <div className="mt-1.5 max-w-[88%] rounded-xl border border-pink-200 bg-pink-50 p-2.5 text-xs space-y-1">
                    <div className="font-bold text-pink-700">
                      Luna’s Instant Correction
                    </div>
                    <div className="font-semibold text-purple-950">
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
                Luna is typing in {langMeta.name}...
              </div>
            )}

            {isResting && (
              <div className="rounded-xl bg-pink-50 border border-pink-200 p-2.5 flex items-center justify-between gap-2 text-xs">
                <span className="text-purple-950">Luna is resting right now.</span>
                <button
                  type="button"
                  onClick={() => lastPendingPrompt && void sendToLuna(lastPendingPrompt, false)}
                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-pink-600 to-purple-700 px-2.5 py-1 text-white font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t border-pink-100 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Write in ${langMeta.name}...`}
              className="flex-1 min-h-[40px] rounded-xl border border-pink-200 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-white disabled:opacity-50 cursor-pointer"
              aria-label="Send message to Luna"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
