import { useMemo } from 'react';
import Modal from './Modal';
import Countdown from './Countdown';
import { formatDisplayDate } from '../utils/date';
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

const WIN_HEADLINES = ['LEGENDARY!', 'WORLD CLASS!', 'ALL-STAR!', 'SOLID PLAY!', 'PHOTO FINISH!'];

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
  const timeline = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  const headline = won ? WIN_HEADLINES[Math.min(guesses.length, 5) - 1] : 'TIME EXPIRED!';
  const subline = won
    ? `You nailed puzzle #${puzzleNumber} in ${guesses.length}/${5}${displayStreak > 1 ? ` — that's a ${displayStreak}-day streak 🔥` : '!'}`
    : `Puzzle #${puzzleNumber} got away — here's the real timeline.`;

  return (
    <Modal title={headline} isOpen={isOpen} onClose={onClose}>
      <p className="mb-4 text-sm font-medium text-neutral-600">{subline}</p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
        The correct timeline
      </h3>
      <ol className="mb-5 flex flex-col">
        {timeline.map((event, i) => (
          <li key={event.id} className="relative flex gap-3 pb-3 last:pb-0">
            {i < timeline.length - 1 && (
              <span aria-hidden="true" className="absolute left-[13px] top-7 h-full w-0.5 bg-neutral-200" />
            )}
            <span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug text-neutral-900">{event.text}</p>
              <p className="text-xs font-bold tabular-nums text-blue-700">
                {formatDisplayDate(event.date)}
              </p>
            </div>
          </li>
        ))}
      </ol>

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
