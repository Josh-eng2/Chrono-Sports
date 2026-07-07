import type { FeedbackColor } from './types/game';

/** Puzzle #1 goes live this local calendar day (month is 0-indexed: 6 = July) */
export const LAUNCH_DATE = { year: 2026, month: 6, day: 7 };

export const MAX_GUESSES = 5;
export const EVENT_COUNT = 5;

export const GAME_TITLE = 'Chrono-Sort: Sports';
export const SHARE_URL = 'https://josh-eng2.github.io/Chrono-Sports/';
export const STORAGE_PREFIX = 'chrono-sort';

/** Seeded shuffle re-rolls if more than this many cards start in the right slot */
export const MAX_PREPLACED = 2;

/** Free Play: points for a win in 1, 2, 3, 4, 5 guesses (loss = 0) */
export const ARCADE_POINTS = [500, 400, 300, 200, 100] as const;

export const FEEDBACK_CLASSES: Record<FeedbackColor, string> = {
  correct: 'bg-green-500 border-green-600 text-white',
  close: 'bg-yellow-400 border-yellow-500 text-neutral-900',
  wrong: 'bg-gray-500 border-gray-600 text-white',
};

/** Colorblind-friendly companion symbols shown in the slot badge after a guess */
export const FEEDBACK_SYMBOLS: Record<FeedbackColor, string> = {
  correct: '✓',
  close: '~',
  wrong: '✕',
};

export const FEEDBACK_EMOJI: Record<FeedbackColor, string> = {
  correct: '🟩',
  close: '🟨',
  wrong: '⬛',
};
