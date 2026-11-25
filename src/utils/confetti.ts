import confetti from 'canvas-confetti';

export function launchRoyalConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#9333ea', '#facc15', '#f472b6', '#c084fc'],
    });
  } catch {
    // ignore in headless/non-canvas environments
  }
}
