import { describe, expect, it } from 'vitest';
import { EVENT_COUNT, MAX_PREPLACED } from '../constants';
import {
  countFixedPoints,
  eventPool,
  getCorrectOrder,
  getPuzzleById,
  getPuzzleNumber,
  getShuffledOrder,
  puzzles,
  sampleArcadeEvents,
  shuffleAvoidingSolved,
} from './puzzle';

describe('getPuzzleNumber', () => {
  it('is 1 on launch day and increments daily', () => {
    expect(getPuzzleNumber(new Date(2026, 6, 7))).toBe(1);
    expect(getPuzzleNumber(new Date(2026, 6, 8))).toBe(2);
    expect(getPuzzleNumber(new Date(2026, 7, 7))).toBe(32);
  });

  it('returns the pre-launch sentinel before launch', () => {
    expect(getPuzzleNumber(new Date(2026, 6, 6))).toBe(0);
    expect(getPuzzleNumber(new Date(2025, 0, 1))).toBe(0);
  });

  it('is 1 at any time of day on launch day', () => {
    expect(getPuzzleNumber(new Date(2026, 6, 7, 23, 59, 59))).toBe(1);
  });
});

describe('getCorrectOrder', () => {
  it('sorts events oldest first', () => {
    const puzzle = getPuzzleById(1)!;
    expect(getCorrectOrder(puzzle.events)).toEqual([
      'rumble-in-the-jungle',
      'miracle-on-ice',
      'tiger-first-masters',
      'kobe-81',
      'leicester-title',
    ]);
  });
});

describe('getShuffledOrder', () => {
  it('is deterministic for the same seed', () => {
    const puzzle = getPuzzleById(1)!;
    expect(getShuffledOrder(puzzle, 1)).toEqual(getShuffledOrder(puzzle, 1));
  });

  it('differs across seeds (spot check)', () => {
    const puzzle = getPuzzleById(1)!;
    const deals = new Set(
      Array.from({ length: 10 }, (_, s) => getShuffledOrder(puzzle, s + 1).join(',')),
    );
    expect(deals.size).toBeGreaterThan(1);
  });

  it('never deals a solved or nearly-solved board for any real puzzle', () => {
    for (const puzzle of puzzles) {
      const correct = getCorrectOrder(puzzle.events);
      const dealt = getShuffledOrder(puzzle, puzzle.id);
      expect(dealt).not.toEqual(correct);
      expect(countFixedPoints(dealt, correct)).toBeLessThanOrEqual(MAX_PREPLACED);
      expect([...dealt].sort()).toEqual([...correct].sort()); // same multiset
    }
  });
});

describe('sampleArcadeEvents (Free Play)', () => {
  it('always deals 5 pool events with distinct ids and distinct dates', () => {
    for (let run = 0; run < 50; run++) {
      const events = sampleArcadeEvents();
      expect(events).toHaveLength(EVENT_COUNT);
      expect(new Set(events.map((e) => e.id)).size).toBe(EVENT_COUNT);
      expect(new Set(events.map((e) => e.date)).size).toBe(EVENT_COUNT);
      for (const e of events) expect(eventPool).toContain(e);
    }
  });

  it('is deterministic under an injected random source', () => {
    const makeRand = () => {
      let s = 42;
      return () => {
        s = (s * 1103515245 + 12345) % 2147483648;
        return s / 2147483648;
      };
    };
    const a = sampleArcadeEvents(makeRand()).map((e) => e.id);
    const b = sampleArcadeEvents(makeRand()).map((e) => e.id);
    expect(a).toEqual(b);
  });
});

describe('shuffleAvoidingSolved', () => {
  it('never deals a solved or nearly-solved board for random Free Play deals', () => {
    for (let run = 0; run < 50; run++) {
      const correct = getCorrectOrder(sampleArcadeEvents());
      const dealt = shuffleAvoidingSolved(correct, Math.random);
      expect(dealt).not.toEqual(correct);
      expect(countFixedPoints(dealt, correct)).toBeLessThanOrEqual(MAX_PREPLACED);
      expect([...dealt].sort()).toEqual([...correct].sort());
    }
  });
});

describe('puzzles dataset', () => {
  it('has contiguous ids starting at 1', () => {
    const ids = puzzles.map((p) => p.id).sort((a, b) => a - b);
    ids.forEach((id, i) => expect(id).toBe(i + 1));
    expect(puzzles.length).toBeGreaterThanOrEqual(30);
  });

  it(`every puzzle has exactly ${EVENT_COUNT} events with valid, distinct dates`, () => {
    for (const puzzle of puzzles) {
      expect(puzzle.events).toHaveLength(EVENT_COUNT);
      const dates = puzzle.events.map((e) => e.date);
      expect(new Set(dates).size).toBe(EVENT_COUNT); // ties would make ordering ambiguous
      for (const date of dates) {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const [y, m, d] = date.split('-').map(Number);
        const parsed = new Date(y, m - 1, d);
        expect(parsed.getFullYear()).toBe(y);
        expect(parsed.getMonth()).toBe(m - 1);
        expect(parsed.getDate()).toBe(d);
      }
    }
  });

  it('never reuses an event id across the dataset', () => {
    const allIds = puzzles.flatMap((p) => p.events.map((e) => e.id));
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
