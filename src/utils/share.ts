import { FEEDBACK_EMOJI, GAME_TITLE, MAX_GUESSES, SHARE_URL } from '../constants';
import type { GuessRecord } from '../types/game';

/**
 * Spoiler-free share card, e.g.
 *
 *   Chrono-Sort: Sports #12
 *   ⏱️ 3/5 · 🔥4
 *   🟨🟩⬛⬛🟨
 *   🟩🟩🟨🟨⬛
 *   🟩🟩🟩🟩🟩
 *   https://chrono-sort-sports.com
 */
function emojiRows(guesses: GuessRecord[]): string {
  return guesses.map((g) => g.feedback.map((f) => FEEDBACK_EMOJI[f]).join('')).join('\n');
}

export function buildShareText(
  puzzleNumber: number,
  guesses: GuessRecord[],
  won: boolean,
  streak = 0,
): string {
  const attempts = won ? String(guesses.length) : 'X';
  const streakBadge = won && streak > 1 ? ` · 🔥${streak}` : '';
  return `${GAME_TITLE} #${puzzleNumber}\n⏱️ ${attempts}/${MAX_GUESSES}${streakBadge}\n${emojiRows(guesses)}\n${SHARE_URL}`;
}

/**
 * Free Play share card, e.g.
 *
 *   Chrono-Sort: Sports — Free Play
 *   🎯 +400 pts (2/5) · Total 3,750
 *   🟨🟩⬛⬛🟨
 *   🟩🟩🟩🟩🟩
 *   https://josh-eng2.github.io/Chrono-Sports/
 */
export function buildArcadeShareText(
  pointsEarned: number,
  guesses: GuessRecord[],
  won: boolean,
  totalPoints: number,
): string {
  const attempts = won ? String(guesses.length) : 'X';
  const total = totalPoints.toLocaleString('en-US');
  return `${GAME_TITLE} — Free Play\n🎯 +${pointsEarned} pts (${attempts}/${MAX_GUESSES}) · Total ${total}\n${emojiRows(guesses)}\n${SHARE_URL}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'failed';

function isProbablyMobile(): boolean {
  return typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Native share sheet on mobile (the viral path), clipboard everywhere else. */
export async function shareResults(text: string): Promise<ShareOutcome> {
  if (isProbablyMobile() && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'shared'; // user closed the sheet
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return legacyCopy(text) ? 'copied' : 'failed';
  }
}
