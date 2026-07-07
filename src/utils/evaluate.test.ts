import { describe, expect, it } from 'vitest';
import { arraysEqual, evaluateGuess, isWinningFeedback } from './evaluate';

const CORRECT = ['a', 'b', 'c', 'd', 'e'];

describe('evaluateGuess', () => {
  it('marks a perfect guess all correct', () => {
    expect(evaluateGuess(CORRECT, CORRECT)).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct',
    ]);
  });

  it('marks everything wrong when every event is 2+ slots away', () => {
    // a→3, b→4, c→0, d→1, e→2: every distance is >= 2
    expect(evaluateGuess(['c', 'd', 'e', 'a', 'b'], CORRECT)).toEqual([
      'wrong',
      'wrong',
      'wrong',
      'wrong',
      'wrong',
    ]);
  });

  it('marks an adjacent swap as two closes', () => {
    expect(evaluateGuess(['b', 'a', 'c', 'd', 'e'], CORRECT)).toEqual([
      'close',
      'close',
      'correct',
      'correct',
      'correct',
    ]);
  });

  it('handles off-by-one at the list boundaries', () => {
    // e (last) placed first is 4 away → wrong; a shifts to index 1 → close
    const feedback = evaluateGuess(['e', 'a', 'b', 'c', 'd'], CORRECT);
    expect(feedback[0]).toBe('wrong');
    expect(feedback[1]).toBe('close');
    expect(feedback[4]).toBe('close');
  });

  it('mixes colors correctly', () => {
    // a correct(0), c at 1 (off by 1 → close), b at 2 (off by 1 → close),
    // e at 3 (off by 1 → close), d at 4 (off by 1 → close)
    expect(evaluateGuess(['a', 'c', 'b', 'e', 'd'], CORRECT)).toEqual([
      'correct',
      'close',
      'close',
      'close',
      'close',
    ]);
  });
});

describe('isWinningFeedback', () => {
  it('is true only when every card is correct', () => {
    expect(isWinningFeedback(['correct', 'correct', 'correct', 'correct', 'correct'])).toBe(true);
    expect(isWinningFeedback(['correct', 'close', 'correct', 'correct', 'correct'])).toBe(false);
    expect(isWinningFeedback([])).toBe(false);
  });
});

describe('arraysEqual', () => {
  it('compares element-wise', () => {
    expect(arraysEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(arraysEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(arraysEqual(['a'], ['a', 'b'])).toBe(false);
  });
});
