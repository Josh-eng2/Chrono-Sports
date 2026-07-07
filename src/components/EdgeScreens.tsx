import { formatDisplayDate, toDateKey } from '../utils/date';
import { getLaunchDate } from '../utils/puzzle';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-100 px-6 text-center">
      <h1 className="font-display text-5xl tracking-wider text-neutral-900">CHRONO-SORT</h1>
      <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-blue-700">
        Sports Edition
      </p>
      {children}
    </div>
  );
}

export function PreLaunchScreen() {
  return (
    <Shell>
      <p className="max-w-sm text-neutral-600">
        The starting gun hasn't fired yet — Puzzle #1 drops on{' '}
        <strong>{formatDisplayDate(toDateKey(getLaunchDate()))}</strong>. See you at kickoff! ⏱️
      </p>
    </Shell>
  );
}

export function NoPuzzleScreen({ puzzleNumber }: { puzzleNumber: number }) {
  return (
    <Shell>
      <p className="max-w-sm text-neutral-600">
        You've reached the end of the archive — puzzle #{puzzleNumber} hasn't been written yet.
        New puzzles are on the way, so check back soon! 🏟️
      </p>
    </Shell>
  );
}
