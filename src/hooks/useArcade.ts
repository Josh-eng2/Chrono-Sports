import { useCallback, useEffect, useMemo, useState } from 'react';
import { ARCADE_POINTS, MAX_GUESSES } from '../constants';
import type {
  ArcadeStats,
  FeedbackColor,
  GameStatus,
  GuessRecord,
  SportEvent,
} from '../types/game';
import { arraysEqual, evaluateGuess, isWinningFeedback } from '../utils/evaluate';
import {
  getAllEventsById,
  getCorrectOrder,
  getEventMap,
  sampleArcadeEvents,
  shuffleAvoidingSolved,
} from '../utils/puzzle';
import {
  loadArcadeRound,
  loadArcadeStats,
  recordArcadeResult,
  saveArcadeRound,
} from '../utils/storage';

interface ArcadeRound {
  events: SportEvent[];
  currentOrder: string[];
  guesses: GuessRecord[];
  status: GameStatus;
}

export interface UseArcadeReturn {
  events: SportEvent[];
  eventsById: Record<string, SportEvent>;
  currentOrder: string[];
  guesses: GuessRecord[];
  liveFeedback: FeedbackColor[] | null;
  guessesRemaining: number;
  status: GameStatus;
  stats: ArcadeStats;
  /** Points the just-finished round was worth (0 while playing or after a loss) */
  pointsEarned: number;
  alreadyTried: boolean;
  canSubmit: boolean;
  reorder: (newOrder: string[]) => void;
  submitGuess: () => void;
  startNewRound: () => void;
}

function freshRound(): ArcadeRound {
  const events = sampleArcadeEvents();
  return {
    events,
    currentOrder: shuffleAvoidingSolved(getCorrectOrder(events), Math.random),
    guesses: [],
    status: 'playing',
  };
}

/** Rebuild a saved round from event ids; any mismatch falls back to a fresh deal. */
function restoreRound(): ArcadeRound | null {
  const saved = loadArcadeRound();
  if (!saved) return null;
  const byId = getAllEventsById();
  const events = saved.eventIds.map((id) => byId[id]).filter(Boolean);
  if (events.length === 0 || events.length !== saved.eventIds.length) return null;
  if (saved.currentOrder.length !== events.length) return null;
  return {
    events,
    currentOrder: saved.currentOrder,
    guesses: saved.guesses,
    status: saved.status,
  };
}

export function useArcade(): UseArcadeReturn {
  const [stats, setStats] = useState<ArcadeStats>(loadArcadeStats);
  const [round, setRound] = useState<ArcadeRound>(() => restoreRound() ?? freshRound());

  useEffect(() => {
    saveArcadeRound({
      eventIds: round.events.map((e) => e.id),
      currentOrder: round.currentOrder,
      guesses: round.guesses,
      status: round.status,
    });
  }, [round]);

  const correctOrder = useMemo(() => getCorrectOrder(round.events), [round.events]);
  const eventsById = useMemo(() => getEventMap(round.events), [round.events]);

  const lastGuess = round.guesses.length > 0 ? round.guesses[round.guesses.length - 1] : null;
  const liveFeedback =
    lastGuess && arraysEqual(round.currentOrder, lastGuess.order) ? lastGuess.feedback : null;
  const alreadyTried =
    round.status === 'playing' &&
    round.guesses.some((g) => arraysEqual(g.order, round.currentOrder));
  const canSubmit = round.status === 'playing' && !alreadyTried;

  const reorder = useCallback((newOrder: string[]) => {
    setRound((prev) =>
      prev.status === 'playing' ? { ...prev, currentOrder: newOrder } : prev,
    );
  }, []);

  const submitGuess = useCallback(() => {
    if (round.status !== 'playing' || round.guesses.length >= MAX_GUESSES) return;
    if (round.guesses.some((g) => arraysEqual(g.order, round.currentOrder))) return;

    const feedback = evaluateGuess(round.currentOrder, correctOrder);
    const nextGuesses: GuessRecord[] = [
      ...round.guesses,
      { order: [...round.currentOrder], feedback },
    ];
    const won = isWinningFeedback(feedback);
    const lost = !won && nextGuesses.length >= MAX_GUESSES;

    setRound({ ...round, guesses: nextGuesses, status: won ? 'won' : lost ? 'lost' : 'playing' });
    if (won || lost) setStats(recordArcadeResult(won, nextGuesses.length).stats);
  }, [round, correctOrder]);

  const startNewRound = useCallback(() => setRound(freshRound()), []);

  const pointsEarned =
    round.status === 'won' ? ARCADE_POINTS[Math.min(round.guesses.length, MAX_GUESSES) - 1] : 0;

  return {
    events: round.events,
    eventsById,
    currentOrder: round.currentOrder,
    guesses: round.guesses,
    liveFeedback,
    guessesRemaining: MAX_GUESSES - round.guesses.length,
    status: round.status,
    stats,
    pointsEarned,
    alreadyTried,
    canSubmit,
    reorder,
    submitGuess,
    startNewRound,
  };
}
