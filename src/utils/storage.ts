import { MAX_GUESSES, STORAGE_PREFIX } from '../constants';
import type { DayState, LifetimeStats } from '../types/game';
import { daysBetween, getTodayDateKey, getYesterdayDateKey, parseDateKey } from './date';

const DAY_KEY_PREFIX = `${STORAGE_PREFIX}-day-`;
const STATS_KEY = `${STORAGE_PREFIX}-stats`;
const HOWTO_KEY = `${STORAGE_PREFIX}-howto-seen`;

const dayKey = (dateKey: string) => `${DAY_KEY_PREFIX}${dateKey}`;

/* localStorage can throw (private mode, disabled, quota) — the game must never crash for it. */
function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* play on without persistence */
  }
}

export function loadDayState(dateKey: string): DayState | null {
  const raw = safeRead(dayKey(dateKey));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DayState;
    return parsed.dateKey === dateKey ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDayState(state: DayState): void {
  safeWrite(dayKey(state.dateKey), JSON.stringify(state));
  pruneOldDayStates(state.dateKey);
}

/** Day states are one key per day; drop anything older than a week. */
export function pruneOldDayStates(todayKey: string, keepDays = 7): void {
  try {
    const today = parseDateKey(todayKey);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(DAY_KEY_PREFIX)) continue;
      const age = daysBetween(parseDateKey(key.slice(DAY_KEY_PREFIX.length)), today);
      if (Number.isFinite(age) && age > keepDays) localStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable */
  }
}

export function defaultStats(): LifetimeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    winDistribution: Array(MAX_GUESSES).fill(0),
  };
}

export function loadStats(): LifetimeStats {
  const raw = safeRead(STATS_KEY);
  if (!raw) return defaultStats();
  try {
    const parsed = JSON.parse(raw) as Partial<LifetimeStats>;
    const dist =
      Array.isArray(parsed.winDistribution) && parsed.winDistribution.length === MAX_GUESSES
        ? parsed.winDistribution
        : Array(MAX_GUESSES).fill(0);
    return { ...defaultStats(), ...parsed, winDistribution: dist };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: LifetimeStats): void {
  safeWrite(STATS_KEY, JSON.stringify(stats));
}

/**
 * Record today's result exactly once. The early return makes this idempotent —
 * a re-fired effect or double-tap can never double-count a day.
 */
export function recordGameResult(
  won: boolean,
  attemptsUsed: number,
  todayKey = getTodayDateKey(),
): LifetimeStats {
  const stats = loadStats();
  if (stats.lastPlayedDate === todayKey) return stats;

  stats.gamesPlayed += 1;
  if (won) {
    stats.gamesWon += 1;
    stats.winDistribution[Math.min(Math.max(attemptsUsed, 1), MAX_GUESSES) - 1] += 1;
    stats.currentStreak =
      stats.lastPlayedDate === getYesterdayDateKey(todayKey) ? stats.currentStreak + 1 : 1;
  } else {
    stats.currentStreak = 0;
  }
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayedDate = todayKey;
  saveStats(stats);
  return stats;
}

/**
 * The streak to DISPLAY. Stored currentStreak only resets when a game is
 * recorded, so a player returning after skipping days would otherwise still
 * see their old streak until they finish a game.
 */
export function getDisplayStreak(stats: LifetimeStats, todayKey = getTodayDateKey()): number {
  if (!stats.lastPlayedDate) return 0;
  if (stats.lastPlayedDate === todayKey || stats.lastPlayedDate === getYesterdayDateKey(todayKey)) {
    return stats.currentStreak;
  }
  return 0;
}

export function hasSeenHowTo(): boolean {
  return safeRead(HOWTO_KEY) === '1';
}

export function markHowToSeen(): void {
  safeWrite(HOWTO_KEY, '1');
}
