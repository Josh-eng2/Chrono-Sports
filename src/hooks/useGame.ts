import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAX_GUESSES } from '../constants';
import type {
  DayState,
  FeedbackColor,
  GameStatus,
  GuessRecord,
  LifetimeStats,
  Puzzle,
  SportEvent,
} from '../types/game';
import { getTodayDateKey, parseDateKey } from '../utils/date';
import { evaluateGuess, isWinningFeedback } from '../utils/evaluate';
import {
  getCorrectOrder,
  getEventMap,
  getPuzzleById,
  getPuzzleNumber,
  getShuffledOrder,
} from '../utils/puzzle';
import {
  getDisplayStreak,
  loadDayState,
  loadStats,
  recordGameResult,
  saveDayState,
} from '../utils/storage';

export type Screen = 'pre-launch' | 'no-puzzle' | 'playing';

export interface UseGameReturn {
  screen: Screen;
  puzzle: Puzzle | null;
  puzzleNumber: number;
  eventsById: Record<string, SportEvent>;
  currentOrder: string[];
  guesses: GuessRecord[];
  /** Per-slot feedback from the most recent guess (follows each event when reordered) */
  liveFeedback: FeedbackColor[] | null;
  guessesRemaining: number;
  status: GameStatus;
  stats: LifetimeStats;
  displayStreak: number;
  correctOrder: string[];
  /** Duplicate-order guard disabled so players can submit turns immediately */
  alreadyTried: boolean;
  canSubmit: boolean;
  reorder: (newOrder: string[]) => void;
  submitGuess: () => void;
}

function initDayState(todayKey: string, puzzle: Puzzle | null, puzzleNumber: number): DayState | null {
  if (!puzzle) return null;
  const saved = loadDayState(todayKey);
  if (saved && saved.puzzleId === puzzleNumber && saved.currentOrder.length === puzzle.events.length) {
    return saved;
  }
  return {
    puzzleId: puzzleNumber,
    currentOrder: getShuffledOrder(puzzle, puzzleNumber),
    guesses: [],
    status: 'playing',
    dateKey: todayKey,
  };
}

export function useGame(): UseGameReturn {
  const [todayKey, setTodayKey] = useState(getTodayDateKey);

  // Catch the calendar rolling over while the tab stays open (midnight, laptop
  // resume, tab restored days later) so the player is moved to the new puzzle.
  useEffect(() => {
    const check = () =>
      setTodayKey((prev) => {
        const now = getTodayDateKey();
        return now === prev ? prev : now;
      });
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    const id = window.setInterval(check, 60_000);
    return () => {
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
      window.clearInterval(id);
    };
  }, []);

  const puzzleNumber = useMemo(() => getPuzzleNumber(parseDateKey(todayKey)), [todayKey]);
  const puzzle = useMemo(() => (puzzleNumber > 0 ? getPuzzleById(puzzleNumber) : null), [puzzleNumber]);
  const correctOrder = useMemo(() => (puzzle ? getCorrectOrder(puzzle.events) : []), [puzzle]);
  const eventsById = useMemo(() => (puzzle ? getEventMap(puzzle.events) : {}), [puzzle]);

  const [day, setDay] = useState<DayState | null>(() => initDayState(todayKey, puzzle, puzzleNumber));
  const [stats, setStats] = useState<LifetimeStats>(loadStats);

  // New calendar day → fresh board for the new puzzle.
  const dayRef = useRef(day);
  dayRef.current = day;
  useEffect(() => {
    if (dayRef.current?.dateKey !== todayKey) {
      setDay(initDayState(todayKey, puzzle, puzzleNumber));
    }
  }, [todayKey, puzzle, puzzleNumber]);

  useEffect(() => {
    if (day) saveDayState(day);
  }, [day]);

  const screen: Screen = puzzleNumber === 0 ? 'pre-launch' : !puzzle ? 'no-puzzle' : 'playing';

  const guesses = day?.guesses ?? [];
  const currentOrder = day?.currentOrder ?? [];
  const status = day?.status ?? 'playing';

  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;
  // Keep each card's last-guess color while the player rearranges for the next attempt.
  const liveFeedback = useMemo((): FeedbackColor[] | null => {
    if (!lastGuess) return null;
    const byEventId = Object.fromEntries(
      lastGuess.order.map((id, i) => [id, lastGuess.feedback[i]]),
    ) as Record<string, FeedbackColor>;
    return currentOrder.map((id) => byEventId[id]);
  }, [lastGuess, currentOrder]);
  const alreadyTried = false;
  const canSubmit = status === 'playing' && currentOrder.length > 0;

  const reorder = useCallback((newOrder: string[]) => {
    setDay((prev) =>
      prev && prev.status === 'playing' ? { ...prev, currentOrder: newOrder } : prev,
    );
  }, []);

  const submitGuess = useCallback(() => {
    if (!day || day.status !== 'playing' || day.guesses.length >= MAX_GUESSES) return;
    const feedback = evaluateGuess(day.currentOrder, correctOrder);
    const nextGuesses: GuessRecord[] = [...day.guesses, { order: [...day.currentOrder], feedback }];
    const won = isWinningFeedback(feedback);
    const lost = !won && nextGuesses.length >= MAX_GUESSES;

    setDay({ ...day, guesses: nextGuesses, status: won ? 'won' : lost ? 'lost' : 'playing' });
    if (won || lost) setStats(recordGameResult(won, nextGuesses.length, todayKey));
  }, [day, correctOrder, todayKey]);

  return {
    screen,
    puzzle,
    puzzleNumber,
    eventsById,
    currentOrder,
    guesses,
    liveFeedback,
    guessesRemaining: MAX_GUESSES - guesses.length,
    status,
    stats,
    displayStreak: getDisplayStreak(stats, todayKey),
    correctOrder,
    alreadyTried,
    canSubmit,
    reorder,
    submitGuess,
  };
}
