import Modal from './Modal';
import { MAX_GUESSES } from '../constants';
import type { ArcadeStats, LifetimeStats } from '../types/game';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: LifetimeStats;
  arcadeStats: ArcadeStats;
  displayStreak: number;
  /** Attempts used for a win recorded today — its bar gets highlighted */
  highlightAttempts: number | null;
}

export default function StatsModal({
  isOpen,
  onClose,
  stats,
  arcadeStats,
  displayStreak,
  highlightAttempts,
}: StatsModalProps) {
  const winPct =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const maxBar = Math.max(...stats.winDistribution, 1);

  const tiles = [
    { value: stats.gamesPlayed, label: 'Played' },
    { value: `${winPct}%`, label: 'Win rate' },
    { value: displayStreak, label: 'Streak' },
    { value: stats.maxStreak, label: 'Best streak' },
  ];

  const arcadeWinPct =
    arcadeStats.gamesPlayed > 0
      ? Math.round((arcadeStats.gamesWon / arcadeStats.gamesPlayed) * 100)
      : 0;
  const arcadeTiles = [
    { value: arcadeStats.totalPoints.toLocaleString('en-US'), label: 'Points won' },
    { value: arcadeStats.gamesPlayed, label: 'Rounds' },
    { value: `${arcadeWinPct}%`, label: 'Win rate' },
    { value: arcadeStats.bestRun, label: 'Best run' },
  ];

  return (
    <Modal title="STATISTICS" isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
        📅 Daily
      </h3>
      <div className="mb-5 grid grid-cols-4 gap-2 text-center">
        {tiles.map(({ value, label }) => (
          <div key={label} className="rounded-lg bg-neutral-100 px-1 py-3">
            <p className="font-display text-3xl leading-none text-neutral-900">{value}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
        Guess distribution
      </h3>
      <div className="flex flex-col gap-1.5">
        {stats.winDistribution.map((count, i) => {
          const highlighted = highlightAttempts === i + 1;
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-3 shrink-0 font-bold text-neutral-600">{i + 1}</span>
              <div className="flex-1">
                <div
                  className={[
                    'flex min-w-6 items-center justify-end rounded px-2 py-0.5 text-xs font-bold text-white',
                    highlighted ? 'bg-green-500' : count > 0 ? 'bg-neutral-500' : 'bg-neutral-300',
                  ].join(' ')}
                  style={{ width: `${Math.max((count / maxBar) * 100, 9)}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-neutral-400">
        Wins by number of guesses (out of {MAX_GUESSES}).
      </p>

      <h3 className="mb-2 mt-5 border-t border-neutral-200 pt-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
        🎯 Free Play
      </h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        {arcadeTiles.map(({ value, label }) => (
          <div key={label} className="rounded-lg bg-neutral-100 px-1 py-3">
            <p className="font-display text-3xl leading-none text-neutral-900">{value}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {label}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
