import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import EventCard from './EventCard';
import type { FeedbackColor, SportEvent } from '../types/game';

interface GameBoardProps {
  order: string[];
  eventsById: Record<string, SportEvent>;
  liveFeedback: FeedbackColor[] | null;
  disabled: boolean;
  showDates: boolean;
  onReorder: (newOrder: string[]) => void;
}

export default function GameBoard({
  order,
  eventsById,
  liveFeedback,
  disabled,
  showDates,
  onReorder,
}: GameBoardProps) {
  const sensors = useSensors(
    // 8px activation distance: a touch can still scroll the page, a click still clicks
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <section aria-label="Sports events — drag to put them in chronological order">
      <p className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
        ▲ Earliest
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy} disabled={disabled}>
          <ol className="flex flex-col gap-2">
            {order.map((id, i) => (
              <EventCard
                key={id}
                event={eventsById[id]}
                index={i}
                feedback={liveFeedback ? liveFeedback[i] : null}
                disabled={disabled}
                showDate={showDates}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p className="mt-1.5 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
        ▼ Most recent
      </p>
    </section>
  );
}
