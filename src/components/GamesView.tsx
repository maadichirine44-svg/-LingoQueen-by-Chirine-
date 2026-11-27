import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Gamepad2,
  Puzzle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import { LanguageId, UILanguage } from '../types';
import { LANGUAGES } from '../utils/storage';
import { getLessonsForLanguage } from '../data/curriculum';
import { speakText } from '../utils/speech';
import { launchRoyalConfetti } from '../utils/confetti';

interface GamesViewProps {
  uiLang: UILanguage;
  gamesXp: number;
  gamesPlayed: number;
  onAwardGameXP: (xp: number) => void;
}

type GameMode = 'memory' | 'blitz' | 'scramble';

interface MemoryCard {
  uid: string;
  pairId: number;
  label: string;
  kind: 'word' | 'arabic';
}

export const GamesView: React.FC<GamesViewProps> = ({
  uiLang,
  gamesXp,
  gamesPlayed,
  onAwardGameXP,
}) => {
  const isAr = uiLang === 'ar';
  const [selectedLang, setSelectedLang] = useState<LanguageId>('fr');
  const [gameMode, setGameMode] = useState<GameMode>('memory');
  const [roundSeed, setRoundSeed] = useState(1);

  const langMeta = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[0];
  const lessons = useMemo(() => getLessonsForLanguage(selectedLang), [selectedLang]);

  // Flatten curated vocab & sentences from first 25 lessons for fun playable variety
  const vocabPool = useMemo(() => {
    const seen = new Set<string>();
    const items: Array<{ word: string; english: string; arabic: string }> = [];
    for (const lesson of lessons.slice(0, 25)) {
      for (const v of lesson.vocab) {
        if (!seen.has(v.word)) {
          seen.add(v.word);
          items.push({ word: v.word, english: v.english, arabic: v.arabic });
        }
      }
    }
    return items;
  }, [lessons]);

  // 1. MEMORY MATCH STATE
  const memoryCards: MemoryCard[] = useMemo(() => {
    const start = (roundSeed * 6) % Math.max(1, vocabPool.length - 6);
    const chosen = vocabPool.slice(start, start + 6);
    const raw: MemoryCard[] = [];
    chosen.forEach((item, idx) => {
      raw.push({ uid: `w-${idx}`, pairId: idx, label: item.word, kind: 'word' });
      raw.push({ uid: `a-${idx}`, pairId: idx, label: item.arabic, kind: 'arabic' });
    });
    // Deterministic Fisher-Yates shuffle
    const copy = [...raw];
    let s = roundSeed * 97 + selectedLang.charCodeAt(0);
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const j = s % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [vocabPool, roundSeed, selectedLang]);

  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryRewarded, setMemoryRewarded] = useState(false);

  const resetMemory = (nextSeed = roundSeed + 1) => {
    setRoundSeed(nextSeed);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMemoryMoves(0);
    setMemoryRewarded(false);
  };

  const handleFlipCard = (idx: number) => {
    if (flippedIndices.length >= 2) return;
    if (flippedIndices.includes(idx)) return;
    const card = memoryCards[idx];
    if (matchedPairIds.includes(card.pairId)) return;

    if (card.kind === 'word') {
      speakText(card.label, langMeta.speechLang);
    }

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const first = memoryCards[nextFlipped[0]];
      const second = memoryCards[nextFlipped[1]];
      if (first.pairId === second.pairId && first.kind !== second.kind) {
        const nextMatched = [...matchedPairIds, first.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedIndices([]);
        if (nextMatched.length === 6 && !memoryRewarded) {
          setMemoryRewarded(true);
          onAwardGameXP(35);
          launchRoyalConfetti();
        }
      } else {
        window.setTimeout(() => {
          setFlippedIndices([]);
        }, 700);
      }
    }
  };

  // 2. SPEED QUIZ BLITZ STATE
  const [blitzActive, setBlitzActive] = useState(false);
  const [blitzSeconds, setBlitzSeconds] = useState(45);
  const [blitzIdx, setBlitzIdx] = useState(0);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzFinished, setBlitzFinished] = useState(false);

  const blitzQuestions = useMemo(() => {
    const qs: Array<{
      word: string;
      english: string;
      arabic: string;
      options: Array<{ arabic: string; english: string }>;
      correctIndex: number;
    }> = [];
    for (let i = 0; i < Math.min(20, vocabPool.length); i++) {
      const target = vocabPool[(i * 7 + roundSeed) % vocabPool.length];
      const distractors = [
        vocabPool[(i * 7 + 3 + roundSeed) % vocabPool.length],
        vocabPool[(i * 7 + 9 + roundSeed) % vocabPool.length],
        vocabPool[(i * 7 + 15 + roundSeed) % vocabPool.length],
      ];
      const opts = [target, ...distractors];
      const rot = (i + roundSeed) % 4;
      const rotated = [...opts.slice(rot), ...opts.slice(0, rot)];
      qs.push({
        word: target.word,
        english: target.english,
        arabic: target.arabic,
        options: rotated.map((o) => ({ arabic: o.arabic, english: o.english })),
        correctIndex: rotated.findIndex((o) => o.word === target.word),
      });
    }
    return qs;
  }, [vocabPool, roundSeed]);

  useEffect(() => {
    if (!blitzActive || blitzFinished) return;
    if (blitzSeconds <= 0) {
      setBlitzActive(false);
      setBlitzFinished(true);
      const earned = Math.max(15, blitzScore * 10);
      onAwardGameXP(earned);
      launchRoyalConfetti();
      return;
    }
    const t = window.setInterval(() => setBlitzSeconds((s) => s - 1), 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blitzActive, blitzSeconds, blitzFinished]);

  const startBlitz = () => {
    setRoundSeed((s) => s + 1);
    setBlitzSeconds(45);
    setBlitzIdx(0);
    setBlitzScore(0);
    setBlitzFinished(false);
    setBlitzActive(true);
  };

  // 3. SENTENCE SCRAMBLE STATE
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [pickedWordIndices, setPickedWordIndices] = useState<number[]>([]);
  const [scrambleChecked, setScrambleChecked] = useState<boolean | null>(null);

  const currentScrambleLesson = lessons[scrambleIdx % lessons.length];
  const scrambleTokens = currentScrambleLesson.grammar.sentenceFormation.scrambledWords;
  const scrambleTarget = currentScrambleLesson.grammar.sentenceFormation.targetSentence;
  const scrambleEnglish = currentScrambleLesson.grammar.sentenceFormation.english;
  const isCJK = selectedLang === 'zh';

  const normalizeForScramble = (s: string) => {
    const clean = s
      .toLowerCase()
      .replace(/[.,!?;:'"«»。！？،؟、]/g, '');
    return isCJK ? clean.replace(/\s+/g, '').trim() : clean.replace(/\s+/g, ' ').trim();
  };

  const handleCheckScramble = () => {
    const built = pickedWordIndices.map((i) => scrambleTokens[i]).join(isCJK ? '' : ' ');
    const ok = normalizeForScramble(built) === normalizeForScramble(scrambleTarget);
    setScrambleChecked(ok);
    if (ok) {
      speakText(scrambleTarget, langMeta.speechLang);
      onAwardGameXP(25);
      launchRoyalConfetti();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-100">
              <Gamepad2 className="w-4 h-4 text-amber-300" />
              <span>
                {isAr
                  ? '3 ألعاب لغوية تفاعلية مع ترجمة فصحى'
                  : '3 Interactive Language Games with Fusha Translations'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {isAr ? 'ألعاب اللغات والمفردات' : 'Language Games Arena'}
            </h1>
            <p className="text-sm text-pink-100 mt-1 max-w-2xl">
              {isAr
                ? 'تحدّي ذاكرتكِ وسرعتكِ في تكوين الجمل واجمعي نقاط خبرة إضافية عبر اللغات الست.'
                : 'Train memory, speed recall, and sentence construction across all 6 languages while earning bonus XP.'}
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-right">
            <div className="text-xs text-pink-100">
              {isAr ? 'نقاط الألعاب' : 'Games XP'}
            </div>
            <div className="text-2xl font-bold tabular-nums">{gamesXp} XP</div>
            <div className="text-[11px] text-pink-100 tabular-nums">
              {gamesPlayed} {isAr ? 'جولات مكتملة' : 'rounds played'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Language Selector & Game Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-pink-100 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setSelectedLang(l.id);
                setFlippedIndices([]);
                setMatchedPairIds([]);
                setMemoryMoves(0);
                setMemoryRewarded(false);
                setBlitzActive(false);
                setBlitzFinished(false);
                setPickedWordIndices([]);
                setScrambleChecked(null);
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                selectedLang === l.id
                  ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white'
                  : 'bg-pink-50 text-purple-900 hover:bg-pink-100'
              }`}
            >
              {isAr ? l.arabicName : l.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGameMode('memory')}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              gameMode === 'memory'
                ? 'bg-purple-900 text-white'
                : 'border border-pink-200 bg-white text-purple-950'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>{isAr ? 'مطابقة الذاكرة' : 'Memory Match'}</span>
          </button>
          <button
            onClick={() => setGameMode('blitz')}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              gameMode === 'blitz'
                ? 'bg-purple-900 text-white'
                : 'border border-pink-200 bg-white text-purple-950'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحدي السرعة (45ث)' : 'Speed Quiz (45s)'}</span>
          </button>
          <button
            onClick={() => setGameMode('scramble')}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
              gameMode === 'scramble'
                ? 'bg-purple-900 text-white'
                : 'border border-pink-200 bg-white text-purple-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'ترتيب الجمل' : 'Sentence Scramble'}</span>
          </button>
        </div>
      </div>

      {/* GAME 1: MEMORY MATCH */}
      {gameMode === 'memory' && (
        <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-purple-950">
                {isAr
                  ? `لعبة مطابقة الذاكرة · ${langMeta.arabicName}`
                  : `Memory Match · ${langMeta.name} ↔ Fusha Arabic`}
              </h2>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'اقلبي البطاقات لمطابقة كل كلمة مع معناها بالعربية الفصحى واكسبي +35 نقطة.'
                  : 'Flip cards to pair every word with its Fusha Arabic meaning (+35 XP).'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-900 tabular-nums">
                {isAr ? `المحاولات: ${memoryMoves}` : `Moves: ${memoryMoves}`} ·{' '}
                {matchedPairIds.length}/6
              </span>
              <button
                onClick={() => resetMemory()}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-pink-200 text-xs font-semibold text-purple-900 hover:bg-pink-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'جولة جديدة' : 'New Board'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {memoryCards.map((card, idx) => {
              const isMatched = matchedPairIds.includes(card.pairId);
              const isRevealed = isMatched || flippedIndices.includes(idx);
              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleFlipCard(idx)}
                  dir={card.kind === 'arabic' ? 'rtl' : 'ltr'}
                  className={`min-h-[86px] rounded-2xl border p-3 text-center flex flex-col items-center justify-center transition cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : isRevealed
                      ? 'bg-pink-50 border-pink-500 text-purple-950 font-bold shadow-xs'
                      : 'bg-gradient-to-br from-purple-900 to-pink-700 border-purple-800 text-white hover:opacity-95'
                  }`}
                >
                  {isRevealed ? (
                    <span className="text-sm leading-snug">{card.label}</span>
                  ) : (
                    <Sparkles className="w-5 h-5 text-pink-200" />
                  )}
                </button>
              );
            })}
          </div>

          {matchedPairIds.length === 6 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>
                  {isAr
                    ? `رائع! أنهيتِ المطابقة في ${memoryMoves} محاولة (+35 نقطة)!`
                    : `Bravo! Board cleared in ${memoryMoves} moves (+35 XP awarded)!`}
                </span>
              </div>
              <button
                onClick={() => resetMemory()}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white cursor-pointer"
              >
                {isAr ? 'العب مرة أخرى' : 'Play Next Set'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* GAME 2: SPEED QUIZ BLITZ */}
      {gameMode === 'blitz' && (
        <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-purple-950">
                {isAr ? `سباق المفردات السريع · ${langMeta.arabicName}` : `Speed Quiz Blitz · ${langMeta.name}`}
              </h2>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'أجيبي عن أكبر عدد من الكلمات خلال 45 ثانية (+10 نقاط لكل إجابة صحيحة).'
                  : 'Match as many words as you can in 45 seconds (+10 XP per correct match).'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-xs font-bold text-purple-950 tabular-nums">
                <Clock className="w-4 h-4 text-pink-600" />
                <span>{blitzSeconds}s</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-950 tabular-nums">
                {isAr ? `النتيجة: ${blitzScore}` : `Score: ${blitzScore}`}
              </div>
            </div>
          </div>

          {!blitzActive && !blitzFinished ? (
            <div className="rounded-2xl bg-pink-50/50 border border-pink-100 p-8 text-center space-y-4">
              <Zap className="w-10 h-10 text-pink-600 mx-auto" />
              <h3 className="text-xl font-bold text-purple-950">
                {isAr ? 'هل أنتِ مستعدة لتحدي الـ 45 ثانية؟' : 'Ready for a 45-Second Blitz?'}
              </h3>
              <button
                onClick={startBlitz}
                className="min-h-[46px] px-7 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white shadow-sm cursor-pointer"
              >
                {isAr ? 'ابدئي التحدي الآن' : 'Start 45s Blitz'}
              </button>
            </div>
          ) : blitzFinished ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-2xl font-bold text-emerald-950 tabular-nums">
                {isAr
                  ? `انتهى الوقت! ${blitzScore} إجابة صحيحة (+${Math.max(15, blitzScore * 10)} نقطة)`
                  : `Time’s Up! ${blitzScore} Correct (+${Math.max(15, blitzScore * 10)} XP)`}
              </h3>
              <button
                onClick={startBlitz}
                className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white cursor-pointer"
              >
                {isAr ? 'جولة جديدة' : 'Play Again'}
              </button>
            </div>
          ) : (
            (() => {
              const currentQ = blitzQuestions[blitzIdx % blitzQuestions.length];
              return (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-purple-50/70 border border-purple-100 p-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-pink-700">
                        {isAr ? 'اختر الترجمة المطابقة لـ:' : 'Pick the matching meaning for:'}
                      </div>
                      <div className="text-2xl font-extrabold text-purple-950 mt-1">
                        {currentQ.word}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakText(currentQ.word, langMeta.speechLang)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-700 cursor-pointer"
                      aria-label="Hear word"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          if (oIdx === currentQ.correctIndex) {
                            setBlitzScore((s) => s + 1);
                          }
                          setBlitzIdx((i) => i + 1);
                        }}
                        className="min-h-[52px] text-left px-4 py-3 rounded-xl border border-pink-200 bg-white hover:bg-pink-50 transition cursor-pointer"
                      >
                        <div className="text-sm font-bold text-pink-700" dir="rtl">
                          {opt.arabic}
                        </div>
                        <div className="text-xs text-slate-600">{opt.english}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </section>
      )}

      {/* GAME 3: SENTENCE SCRAMBLE */}
      {gameMode === 'scramble' && (
        <section className="rounded-2xl bg-white border border-pink-100 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-purple-950">
                {isAr
                  ? `لعبة ترتيب الجمل · ${langMeta.arabicName}`
                  : `Sentence Scramble · ${langMeta.name}`}
              </h2>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'رتّبي الكلمات المبعثرة لتكوين الجملة الصحيحة واكسبي +25 نقطة.'
                  : 'Arrange the scrambled tiles into a natural sentence (+25 XP per sentence).'}
              </p>
            </div>
            <button
              onClick={() => {
                setScrambleIdx((i) => i + 1);
                setPickedWordIndices([]);
                setScrambleChecked(null);
              }}
              className="min-h-[38px] px-4 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-purple-900 hover:bg-pink-50 cursor-pointer"
            >
              {isAr ? 'جملة أخرى ←' : 'Next Sentence →'}
            </button>
          </div>

          <div className="rounded-xl bg-pink-50/50 border border-pink-100 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-pink-700">
                {isAr ? `الدرس ${currentScrambleLesson.id}` : `Lesson ${currentScrambleLesson.id}`} ·{' '}
                {currentScrambleLesson.level}
              </div>
              <p className="text-sm font-bold text-purple-950 mt-0.5">{scrambleEnglish}</p>
            </div>
            <button
              type="button"
              onClick={() => speakText(scrambleTarget, langMeta.speechLang, 0.85)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-pink-700 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAr ? 'استماع' : 'Hear Target'}</span>
            </button>
          </div>

          <div className="min-h-[58px] rounded-xl bg-slate-50 border border-pink-200 p-3 flex flex-wrap gap-2 items-center">
            {pickedWordIndices.length === 0 ? (
              <span className="text-xs text-slate-400">
                {isAr ? 'اضغطي على الكلمات أدناه بالترتيب الصحيح...' : 'Tap the word tiles below in order...'}
              </span>
            ) : (
              pickedWordIndices.map((wIdx, pos) => (
                <button
                  key={`${wIdx}-${pos}`}
                  onClick={() => {
                    setPickedWordIndices((prev) => prev.filter((_, i) => i !== pos));
                    setScrambleChecked(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-sm font-semibold cursor-pointer"
                >
                  {scrambleTokens[wIdx]}
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {scrambleTokens.map((tok, idx) => {
              const used = pickedWordIndices.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={used}
                  onClick={() => {
                    setPickedWordIndices((prev) => [...prev, idx]);
                    setScrambleChecked(null);
                  }}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg border text-sm font-medium cursor-pointer ${
                    used
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white border-pink-200 text-purple-950 hover:bg-pink-50'
                  }`}
                >
                  {tok}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCheckScramble}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white cursor-pointer"
            >
              {isAr ? 'تحقق (+25 نقطة)' : 'Check Sentence (+25 XP)'}
            </button>
            <button
              onClick={() => {
                setPickedWordIndices([]);
                setScrambleChecked(null);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 cursor-pointer"
            >
              {isAr ? 'إعادة' : 'Reset'}
            </button>
            {scrambleChecked !== null && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                  scrambleChecked ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {scrambleChecked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAr ? 'ممتاز! +25 نقطة' : 'Perfect! +25 XP earned.'}</span>
                  </>
                ) : (
                  <span>
                    {isAr ? `الصحيح: "${scrambleTarget}"` : `Target: "${scrambleTarget}"`}
                  </span>
                )}
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
