import { MAX_GUESSES } from '../constants';
import type { GameStatus, Mode } from '../types/game';

interface ControlsProps {
  guessesRemaining: number;
  canSubmit: boolean;
  status: GameStatus;
  alreadyTried: boolean;
  mode: Mode;
  onSubmit: () => void;
  onShowResults: () => void;
  /** Free Play only: deal the next random puzzle */
  onNextRound?: () => void;
}

export default function Controls({
  guessesRemaining,
  canSubmit,
  status,
  alreadyTried,
  mode,
  onSubmit,
  onShowResults,
  onNextRound,
}: ControlsProps) {
  if (status !== 'playing') {
    return (
      <div className="flex flex-col gap-2">
        {mode === 'arcade' && onNextRound && (
          <button
            onClick={onNextRound}
            className="w-full rounded-lg bg-blue-600 py-3 font-display text-xl tracking-wider text-white transition hover:bg-blue-700"
          >
            NEXT PUZZLE
          </button>
        )}
        <button
          onClick={onShowResults}
          className="w-full rounded-lg bg-neutral-800 py-3 font-display text-xl tracking-wider text-white transition hover:bg-neutral-700"
        >
          SEE RESULTS
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-1.5" aria-label={`${guessesRemaining} guesses remaining`}>
        {Array.from({ length: MAX_GUESSES }, (_, i) => (
          <span
            key={i}
            className={[
              'h-2.5 w-2.5 rounded-full',
              i < guessesRemaining ? 'bg-blue-600' : 'bg-neutral-300',
            ].join(' ')}
          />
        ))}
        <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {guessesRemaining} {guessesRemaining === 1 ? 'guess' : 'guesses'} left
        </span>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full rounded-lg bg-blue-600 py-3 font-display text-xl tracking-wider text-white transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        SUBMIT GUESS
      </button>

    </div>
  );
}
