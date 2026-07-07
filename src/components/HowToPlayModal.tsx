import Modal from './Modal';
import { MAX_GUESSES } from '../constants';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEGEND = [
  { classes: 'bg-green-500', symbol: '✓', label: 'Right spot — this event is exactly where it belongs.' },
  { classes: 'bg-yellow-400', symbol: '~', label: 'Close — it belongs one spot up or down from here.' },
  { classes: 'bg-gray-500', symbol: '✕', label: 'Way off — it belongs two or more spots away.' },
];

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <Modal title="HOW TO PLAY" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-700">
        <p>
          Put <strong>5 historic sports moments</strong> in chronological order —{' '}
          <strong>earliest at the top</strong>, most recent at the bottom.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Drag the cards to rearrange them (or focus a card and use Space + arrow keys).</li>
          <li>
            Hit <strong>Submit</strong> — you get {MAX_GUESSES} guesses.
          </li>
          <li>Use the colors to zero in on the right timeline.</li>
        </ol>

        <div className="flex flex-col gap-2">
          {LEGEND.map(({ classes, symbol, label }) => (
            <div key={symbol} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded font-bold text-white ${classes}`}
                aria-hidden="true"
              >
                {symbol}
              </span>
              <p>{label}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <p className="mb-1">
            <strong className="text-neutral-700">📅 Daily</strong> — one shared puzzle per day.
            Win daily to build your 🔥 streak, and share your result grid.
          </p>
          <p>
            <strong className="text-neutral-700">🎯 Free Play</strong> — unlimited random
            puzzles. Earn <strong>500 / 400 / 300 / 200 / 100 points</strong> for wins in 1–5
            guesses and chase your best run.
          </p>
        </div>
      </div>
    </Modal>
  );
}
