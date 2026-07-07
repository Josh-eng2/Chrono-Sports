import { formatDisplayDate, toDateKey } from '../utils/date';
import { getLaunchDate } from '../utils/puzzle';
import type { Screen } from '../hooks/useGame';

interface DailyUnavailableProps {
  screen: Screen;
  puzzleNumber: number;
  onFreePlay: () => void;
}

/**
 * Inline notice shown in the Daily tab before launch or past the end of the
 * puzzle archive. Free Play never runs out, so we point players there.
 */
export function DailyUnavailable({ screen, puzzleNumber, onFreePlay }: DailyUnavailableProps) {
  const message =
    screen === 'pre-launch'
      ? `The starting gun hasn't fired yet — Puzzle #1 drops on ${formatDisplayDate(
          toDateKey(getLaunchDate()),
        )}.`
      : `You've reached the end of the archive — daily puzzle #${puzzleNumber} hasn't been written yet. New puzzles are on the way!`;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-10 text-center shadow-md">
      <span aria-hidden="true" className="text-4xl">
        ⏱️
      </span>
      <p className="max-w-sm text-sm text-neutral-600">{message}</p>
      <button
        onClick={onFreePlay}
        className="rounded-lg bg-blue-600 px-6 py-3 font-display text-xl tracking-wider text-white transition hover:bg-blue-700"
      >
        🎯 PLAY FREE MODE
      </button>
    </div>
  );
}
