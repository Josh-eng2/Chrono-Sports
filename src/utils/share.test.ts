import { describe, expect, it } from 'vitest';
import { buildShareText } from './share';
import type { GuessRecord } from '../types/game';

const WIN_GUESSES: GuessRecord[] = [
  { order: [], feedback: ['close', 'correct', 'wrong', 'wrong', 'close'] },
  { order: [], feedback: ['correct', 'correct', 'close', 'close', 'wrong'] },
  { order: [], feedback: ['correct', 'correct', 'correct', 'correct', 'correct'] },
];

describe('buildShareText', () => {
  it('formats a win with header, attempts, emoji rows and URL', () => {
    const text = buildShareText(1, WIN_GUESSES, true);
    expect(text.split('\n')).toEqual([
      'Chrono-Sort: Sports #1',
      '⏱️ 3/5',
      '🟨🟩⬛⬛🟨',
      '🟩🟩🟨🟨⬛',
      '🟩🟩🟩🟩🟩',
      'https://josh-eng2.github.io/Chrono-Sports/',
    ]);
  });

  it('shows X/5 on a loss', () => {
    const lossGuesses = Array(5).fill(WIN_GUESSES[0]);
    const text = buildShareText(7, lossGuesses, false);
    expect(text).toContain('⏱️ X/5');
    expect(text.split('\n')).toHaveLength(2 + 5 + 1);
  });

  it('brags about streaks of 2+ on wins only', () => {
    expect(buildShareText(1, WIN_GUESSES, true, 4)).toContain('⏱️ 3/5 · 🔥4');
    expect(buildShareText(1, WIN_GUESSES, true, 1)).not.toContain('🔥');
    const lossGuesses = Array(5).fill(WIN_GUESSES[0]);
    expect(buildShareText(1, lossGuesses, false, 4)).not.toContain('🔥');
  });
});
