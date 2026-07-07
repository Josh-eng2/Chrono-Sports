import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defaultStats,
  getDisplayStreak,
  loadDayState,
  loadStats,
  pruneOldDayStates,
  recordGameResult,
  saveDayState,
  saveStats,
} from './storage';
import type { DayState } from '../types/game';

/** Minimal in-memory localStorage so tests run in the plain node environment. */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

const day = (dateKey: string, status: DayState['status'] = 'playing'): DayState => ({
  puzzleId: 1,
  currentOrder: ['a', 'b', 'c', 'd', 'e'],
  guesses: [],
  status,
  dateKey,
});

describe('day state persistence', () => {
  it('round-trips and only restores the matching day', () => {
    saveDayState(day('2026-07-07'));
    expect(loadDayState('2026-07-07')?.puzzleId).toBe(1);
    expect(loadDayState('2026-07-08')).toBeNull();
  });

  it('prunes day states older than a week', () => {
    saveDayState(day('2026-06-01'));
    saveDayState(day('2026-07-06'));
    pruneOldDayStates('2026-07-07');
    expect(loadDayState('2026-06-01')).toBeNull();
    expect(loadDayState('2026-07-06')).not.toBeNull();
  });
});

describe('recordGameResult', () => {
  it('counts a first win and starts a streak', () => {
    const stats = recordGameResult(true, 3, '2026-07-07');
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
    expect(stats.winDistribution).toEqual([0, 0, 1, 0, 0]);
  });

  it('extends the streak on consecutive-day wins', () => {
    recordGameResult(true, 2, '2026-07-07');
    const stats = recordGameResult(true, 4, '2026-07-08');
    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(2);
    expect(stats.winDistribution).toEqual([0, 1, 0, 1, 0]);
  });

  it('resets the streak to 1 after a missed day', () => {
    recordGameResult(true, 2, '2026-07-07');
    const stats = recordGameResult(true, 2, '2026-07-10');
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
  });

  it('zeroes the streak on a loss', () => {
    recordGameResult(true, 2, '2026-07-07');
    const stats = recordGameResult(false, 5, '2026-07-08');
    expect(stats.currentStreak).toBe(0);
    expect(stats.gamesWon).toBe(1);
    expect(stats.gamesPlayed).toBe(2);
  });

  it('never double-counts the same day', () => {
    recordGameResult(true, 2, '2026-07-07');
    const stats = recordGameResult(true, 2, '2026-07-07');
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.currentStreak).toBe(1);
  });
});

describe('getDisplayStreak', () => {
  it('shows the stored streak when last played today or yesterday', () => {
    const stats = { ...defaultStats(), currentStreak: 5, lastPlayedDate: '2026-07-06' };
    expect(getDisplayStreak(stats, '2026-07-07')).toBe(5);
    expect(getDisplayStreak({ ...stats, lastPlayedDate: '2026-07-07' }, '2026-07-07')).toBe(5);
  });

  it('shows 0 when the streak has lapsed, even before a game is recorded', () => {
    const stats = { ...defaultStats(), currentStreak: 5, lastPlayedDate: '2026-07-01' };
    expect(getDisplayStreak(stats, '2026-07-07')).toBe(0);
  });
});

describe('loadStats', () => {
  it('returns defaults for missing or corrupt data', () => {
    expect(loadStats()).toEqual(defaultStats());
    localStorage.setItem('chrono-sort-stats', '{not json');
    expect(loadStats()).toEqual(defaultStats());
  });

  it('backfills winDistribution for stats saved by older versions', () => {
    saveStats({ ...defaultStats(), gamesPlayed: 3 });
    localStorage.setItem(
      'chrono-sort-stats',
      JSON.stringify({ gamesPlayed: 3, gamesWon: 2, currentStreak: 1, maxStreak: 2, lastPlayedDate: '2026-07-06' }),
    );
    const stats = loadStats();
    expect(stats.winDistribution).toEqual([0, 0, 0, 0, 0]);
    expect(stats.gamesPlayed).toBe(3);
  });
});
