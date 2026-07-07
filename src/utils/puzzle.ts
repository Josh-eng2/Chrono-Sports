import { EVENT_COUNT, LAUNCH_DATE, MAX_PREPLACED } from '../constants';
import { daysBetween } from './date';
import type { Puzzle, SportEvent } from '../types/game';
import puzzlesJson from '../data/puzzles.json';

export const puzzles: Puzzle[] = puzzlesJson;

/** Every event across every puzzle — the Free Play sampling pool. */
export const eventPool: SportEvent[] = puzzles.flatMap((p) => p.events);

const eventPoolById: Record<string, SportEvent> = Object.fromEntries(
  eventPool.map((e) => [e.id, e]),
);

export function getAllEventsById(): Record<string, SportEvent> {
  return eventPoolById;
}

export function getLaunchDate(): Date {
  return new Date(LAUNCH_DATE.year, LAUNCH_DATE.month, LAUNCH_DATE.day);
}

/** Puzzle #1 on launch day, #2 the next day, … 0 = pre-launch sentinel. */
export function getPuzzleNumber(today = new Date()): number {
  const launch = getLaunchDate();
  if (today < launch) return 0;
  return daysBetween(launch, today) + 1;
}

export function getPuzzleById(id: number): Puzzle | null {
  return puzzles.find((p) => p.id === id) ?? null;
}

/** Event ids sorted oldest → newest. Index 0 is the top slot. */
export function getCorrectOrder(events: SportEvent[]): string[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date)).map((e) => e.id);
}

export function getEventMap(events: SportEvent[]): Record<string, SportEvent> {
  return Object.fromEntries(events.map((e) => [e.id, e]));
}

/** Mulberry32 — tiny deterministic PRNG so every player sees the same deal. */
function seededRandom(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fisherYates(ids: string[], rand: () => number): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function countFixedPoints(order: string[], correct: string[]): number {
  return order.filter((id, i) => correct[i] === id).length;
}

/**
 * Shuffle that never deals a solved (or nearly solved) board: re-rolls from
 * the same random stream while more than MAX_PREPLACED cards would start in
 * their correct slot. Used seeded for Daily and unseeded for Free Play.
 */
export function shuffleAvoidingSolved(correct: string[], rand: () => number): string[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const order = fisherYates(correct, rand);
    if (countFixedPoints(order, correct) <= MAX_PREPLACED) return order;
  }
  // Statistically unreachable; a rotation by 2 has zero fixed points.
  return [...correct.slice(2), ...correct.slice(0, 2)];
}

/** Deterministic per-day deal so every player sees the same Daily board. */
export function getShuffledOrder(puzzle: Puzzle, seed: number): string[] {
  return shuffleAvoidingSolved(getCorrectOrder(puzzle.events), seededRandom(seed));
}

/**
 * Free Play deal: 5 random events from the whole pool with pairwise-distinct
 * dates (a shared date would make the correct order ambiguous). With 150
 * events this yields hundreds of millions of combinations — effectively
 * endless, and never a copy of a specific Daily puzzle.
 */
export function sampleArcadeEvents(rand: () => number = Math.random): SportEvent[] {
  for (let tries = 0; tries < 100; tries++) {
    const picked: SportEvent[] = [];
    const usedIndexes = new Set<number>();
    const usedDates = new Set<string>();
    while (picked.length < EVENT_COUNT && usedIndexes.size < eventPool.length) {
      const i = Math.floor(rand() * eventPool.length);
      if (usedIndexes.has(i)) continue;
      usedIndexes.add(i);
      const event = eventPool[i];
      if (usedDates.has(event.date)) continue;
      usedDates.add(event.date);
      picked.push(event);
    }
    if (picked.length === EVENT_COUNT) return picked;
  }
  return puzzles[0].events; // unreachable with a sane dataset
}
