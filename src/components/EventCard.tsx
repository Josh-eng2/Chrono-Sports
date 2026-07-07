import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FEEDBACK_CLASSES, FEEDBACK_SYMBOLS } from '../constants';
import { formatDisplayDate } from '../utils/date';
import type { FeedbackColor, SportEvent } from '../types/game';

interface EventCardProps {
  event: SportEvent;
  index: number;
  feedback: FeedbackColor | null;
  disabled: boolean;
  /** Reveal the real date once the game is over */
  showDate: boolean;
}

export default function EventCard({ event, index, feedback, disabled, showDate }: EventCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: feedback ? `${index * 120}ms` : undefined,
  };

  const surface = feedback
    ? FEEDBACK_CLASSES[feedback]
    : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid={`card-${event.id}`}
      className={[
        'flex min-h-14 select-none items-center gap-3 rounded-lg border px-3 py-2',
        disabled ? '' : 'cursor-grab touch-none active:cursor-grabbing',
        surface,
        feedback ? 'animate-flip-in' : '',
        isDragging ? 'z-10 scale-[1.02] shadow-xl' : 'shadow-md',
      ].join(' ')}
      {...attributes}
      {...listeners}
    >
      <span
        aria-hidden="true"
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          feedback ? 'bg-black/20' : 'bg-neutral-100 text-neutral-500',
        ].join(' ')}
      >
        {feedback ? FEEDBACK_SYMBOLS[feedback] : index + 1}
      </span>

      <p className="flex-1 text-sm font-medium leading-snug">{event.text}</p>

      {showDate ? (
        <span className="shrink-0 rounded bg-black/20 px-1.5 py-0.5 text-xs font-bold tabular-nums">
          {formatDisplayDate(event.date)}
        </span>
      ) : (
        !disabled && (
          <svg
            aria-hidden="true"
            className="hidden shrink-0 text-neutral-300 md:block"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="9" cy="5" r="1.7" />
            <circle cx="15" cy="5" r="1.7" />
            <circle cx="9" cy="12" r="1.7" />
            <circle cx="15" cy="12" r="1.7" />
            <circle cx="9" cy="19" r="1.7" />
            <circle cx="15" cy="19" r="1.7" />
          </svg>
        )
      )}
    </li>
  );
}
