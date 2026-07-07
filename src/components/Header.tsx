interface HeaderProps {
  onHowTo: () => void;
  onStats: () => void;
  streak: number;
}

export default function Header({ onHowTo, onStats, streak }: HeaderProps) {
  return (
    <header className="mb-3 w-full border-b border-neutral-300 pb-2">
      <div className="flex items-center justify-between">
        <button
          onClick={onHowTo}
          aria-label="How to play"
          className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="font-display text-4xl leading-none tracking-wider text-neutral-900">
            CHRONO-SORT
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-blue-700">
            Sports Edition
          </p>
        </div>

        <div className="flex items-center gap-1">
          {streak > 0 && (
            <span
              className="flex items-center gap-0.5 text-sm font-bold text-orange-600"
              title={`${streak}-day streak`}
              aria-label={`${streak}-day streak`}
            >
              🔥{streak}
            </span>
          )}
          <button
            onClick={onStats}
            aria-label="Statistics"
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="20" x2="6" y2="14" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="18" y1="20" x2="18" y2="10" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
