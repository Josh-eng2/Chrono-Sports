import Modal from './Modal';
import Countdown from './Countdown';
import Timeline from './Timeline';
import { MAX_GUESSES } from '../constants';
import type { GuessRecord, SportEvent } from '../types/game';

interface EndGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  puzzleNumber: number;
  events: SportEvent[];
  guesses: GuessRecord[];
  displayStreak: number;
  onShare: () => void;
}

const WIN_HEADLINES = ['LEGENDARY!', 'WORLD CLASS!', 'PHOTO FINISH!'];

export default function EndGameModal({
  isOpen,
  onClose,
  won,
  puzzleNumber,
  events,
  guesses,
  displayStreak,
  onShare,
}: EndGameModalProps) {
  const headline = won ? WIN_HEADLINES[Math.min(guesses.length, MAX_GUESSES) - 1] : 'TIME EXPIRED!';
  const subline = won
    ? `You nailed puzzle #${puzzleNumber} in ${guesses.length}/${MAX_GUESSES}${displayStreak > 1 ? ` — that's a ${displayStreak}-day streak 🔥` : '!'}`
    : `Puzzle #${puzzleNumber} got away — here's the real timeline.`;

  return (
    <Modal title={headline} isOpen={isOpen} onClose={onClose}>
      <p className="mb-4 text-sm font-medium text-neutral-600">{subline}</p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
        The correct timeline
      </h3>
      <div className="mb-5">
        <Timeline events={events} />
      </div>

      <div className="grid grid-cols-2 items-center gap-3 border-t border-neutral-200 pt-4">
        <Countdown />
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-display text-xl tracking-wider text-white transition hover:bg-green-700"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          SHARE
        </button>
      </div>
    </Modal>
  );
}
