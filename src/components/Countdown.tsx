import { useEffect, useState } from 'react';
import { msUntilNextMidnight } from '../utils/date';

/** Live HH:MM:SS until the next local midnight — i.e. the next puzzle. */
export default function Countdown() {
  const [remaining, setRemaining] = useState(msUntilNextMidnight);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(msUntilNextMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = pad(Math.floor(totalSeconds / 3600));
  const m = pad(Math.floor((totalSeconds % 3600) / 60));
  const s = pad(totalSeconds % 60);

  return (
    <div className="text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        Next puzzle in
      </p>
      <p className="font-display text-3xl tabular-nums leading-none text-neutral-900">
        {h}:{m}:{s}
      </p>
    </div>
  );
}
