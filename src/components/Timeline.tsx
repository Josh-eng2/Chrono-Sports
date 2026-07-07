import { useMemo } from 'react';
import { formatDisplayDate } from '../utils/date';
import type { SportEvent } from '../types/game';

/** The chronological answer, revealed at the end of a round. */
export default function Timeline({ events }: { events: SportEvent[] }) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events]);

  return (
    <ol className="flex flex-col">
      {sorted.map((event, i) => (
        <li key={event.id} className="relative flex gap-3 pb-3 last:pb-0">
          {i < sorted.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[13px] top-7 h-full w-0.5 bg-neutral-200"
            />
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
  );
}
