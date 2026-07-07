import Modal from './Modal';
import Timeline from './Timeline';
import { MAX_GUESSES } from '../constants';
import type { ArcadeStats, GuessRecord, SportEvent } from '../types/game';

interface ArcadeEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  pointsEarned: number;
  stats: ArcadeStats;
  events: SportEvent[];
  guesses: GuessRecord[];
  onNextRound: () => void;
  onShare: () => void;
}

export default function ArcadeEndModal({
  isOpen,
  onClose,
  won,
  pointsEarned,
  stats,
  events,
  guesses,
  onNextRound,
  onShare,
}: ArcadeEndModalProps) {
  const headline = won ? `+${pointsEarned} POINTS!` : 'NO POINTS THIS TIME';
  const subline = won
    ? stats.currentRun > 1
      ? `Solved in ${guesses.length}/${MAX_GUESSES} — that's ${stats.currentRun} wins in a row! 🎯`
      : `Solved in ${guesses.length}/${MAX_GUESSES}. Keep the run going!`
    : "The timeline got away — here's how it really went. Free puzzles never run out!";

  const tiles = [
    { value: stats.totalPoints.toLocaleString('en-US'), label: 'Total points won' },
    { value: stats.gamesPlayed, label: 'Rounds' },
    { value: stats.bestRun, label: 'Best run' },
  ];

  return (
    <Modal title={headline} isOpen={isOpen} onClose={onClose}>
      <p className="mb-4 text-sm font-medium text-neutral-600">{subline}</p>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {tiles.map(({ value, label }) => (
          <div key={label} className="rounded-lg bg-neutral-100 px-1 py-2.5">
            <p className="font-display text-2xl leading-none text-neutral-900">{value}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
        The correct timeline
      </h3>
      <div className="mb-5">
        <Timeline events={events} />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
        <button
          onClick={onShare}
          className="rounded-lg bg-green-600 py-3 font-display text-xl tracking-wider text-white transition hover:bg-green-700"
        >
          SHARE
        </button>
        <button
          onClick={onNextRound}
          className="rounded-lg bg-blue-600 py-3 font-display text-xl tracking-wider text-white transition hover:bg-blue-700"
        >
          NEXT PUZZLE
        </button>
      </div>
    </Modal>
  );
}
