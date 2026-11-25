export function speakText(text: string, langCode: string, rate = 0.92): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode;
    utter.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()));
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore speech synthesis errors on unsupported environments
  }
}

export function computePronunciationScore(target: string, spoken: string): number {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim();

  const a = clean(target);
  const b = clean(spoken);
  if (!b) return 0;
  if (a === b) return 98;

  const wordsA = a.split(/\s+/).filter(Boolean);
  const wordsB = b.split(/\s+/).filter(Boolean);

  // Character overlap for CJK or single words
  if (wordsA.length <= 1) {
    const charsA = Array.from(a.replace(/\s+/g, ''));
    const charsB = Array.from(b.replace(/\s+/g, ''));
    const matched = charsA.filter((c) => charsB.includes(c)).length;
    return Math.min(97, Math.max(45, Math.round((matched / Math.max(1, charsA.length)) * 96)));
  }

  let hits = 0;
  for (const w of wordsA) {
    if (wordsB.includes(w)) hits++;
  }
  const ratio = hits / Math.max(1, wordsA.length);
  return Math.min(98, Math.max(40, Math.round(40 + ratio * 58)));
}

export function analyzeWritingOffline(
  text: string,
  suggestedWords: string[],
  minSentences = 5,
  maxSentences = 8
): {
  score: number;
  correctedText: string;
  feedback: string;
  corrections: string[];
} {
  const trimmed = text.trim();
  const rawSentences = trimmed
    .split(/[.!?。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const count = rawSentences.length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const lower = trimmed.toLowerCase();
  const matchedVocab = suggestedWords.filter((w) =>
    lower.includes(w.toLowerCase().split(' ')[0])
  );

  let score = 55;
  if (count >= minSentences && count <= maxSentences) score += 20;
  else if (count >= 3) score += 10;

  if (wordCount >= 28) score += 10;
  score += Math.min(15, matchedVocab.length * 4);
  score = Math.min(96, Math.max(35, score));

  const corrections: string[] = [];
  if (count < minSentences) {
    corrections.push(
      `Aim for ${minSentences}–${maxSentences} complete sentences (detected ${count}).`
    );
  }
  const missingCapital = rawSentences.filter((s) => /^[a-z]/.test(s));
  if (missingCapital.length > 0) {
    corrections.push('Capitalize the first letter of each sentence.');
  }
  if (!/[.!?。！？]$/.test(trimmed)) {
    corrections.push('End your final sentence with proper punctuation (. ! ?).');
  }
  if (matchedVocab.length < 2 && suggestedWords.length > 0) {
    corrections.push(
      `Try incorporating lesson vocabulary such as: ${suggestedWords.slice(0, 3).join(', ')}.`
    );
  }
  if (corrections.length === 0) {
    corrections.push('Excellent sentence structure, punctuation, and lesson vocabulary usage.');
  }

  const correctedText = rawSentences
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('. ') + (rawSentences.length ? '.' : '');

  const feedback =
    score >= 80
      ? 'Strong writing! Your paragraph meets the target sentence count and uses key lesson phrases clearly.'
      : 'Good start! Expand your sentences and weave in more of the lesson vocabulary to boost fluency.';

  return { score, correctedText, feedback, corrections };
}
