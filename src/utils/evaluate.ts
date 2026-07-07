import type { FeedbackColor } from '../types/game';

/**
 * Wordle-style positional feedback:
 *   correct — the event is in its exact chronological slot
 *   close   — the event is one slot away from where it belongs
 *   wrong   — the event is two or more slots away
 */
export function evaluateGuess(order: string[], correctOrder: string[]): FeedbackColor[] {
  return order.map((id, guessedIndex) => {
    const correctIndex = correctOrder.indexOf(id);
    if (guessedIndex === correctIndex) return 'correct';
    if (Math.abs(guessedIndex - correctIndex) === 1) return 'close';
    return 'wrong';
  });
}

export function isWinningFeedback(feedback: FeedbackColor[]): boolean {
  return feedback.length > 0 && feedback.every((f) => f === 'correct');
}

export function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
