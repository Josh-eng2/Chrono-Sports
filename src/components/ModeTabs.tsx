import type { Mode } from '../types/game';

interface ModeTabsProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const TABS: { id: Mode; label: string }[] = [
  { id: 'daily', label: '📅 Daily' },
  { id: 'arcade', label: '🎯 Free Play' },
];

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="mx-auto flex rounded-full bg-neutral-200 p-1" role="group" aria-label="Game mode">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={mode === id}
          className={[
            'rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition',
            mode === id
              ? 'bg-white text-neutral-900 shadow'
              : 'text-neutral-500 hover:text-neutral-700',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
