import { EVENT_COUNT, MAX_GUESSES } from '../constants';
import type { GuessRecord } from '../types/game';

const SQUARE_CLASSES = {
  correct: 'bg-green-500',
  close: 'bg-yellow-400',
  wrong: 'bg-gray-500',
} as const;

interface HistoryGridProps {
  guesses: GuessRecord[];
}

/** Wordle-style at-a-glance record of every guess, plus empty rows for the budget left. */
export default function HistoryGrid({ guesses }: HistoryGridProps) {
  return (
    <div className="flex flex-col items-center gap-1" aria-label="Guess history">
      {Array.from({ length: MAX_GUESSES }, (_, row) => {
        const guess = guesses[row];
        return (
          <div
            key={row}
            className="flex gap-1"
            aria-label={
              guess ? `Guess ${row + 1}: ${guess.feedback.join(', ')}` : `Guess ${row + 1}: unused`
            }
          >
            {Array.from({ length: EVENT_COUNT }, (_, col) => (
              <span
                key={col}
                className={[
                  'h-4 w-4 rounded-sm',
                  guess ? SQUARE_CLASSES[guess.feedback[col]] : 'border border-neutral-300',
                ].join(' ')}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
