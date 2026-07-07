import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  formatDisplayDate,
  getYesterdayDateKey,
  msUntilNextMidnight,
  parseDateKey,
  toDateKey,
} from './date';

describe('toDateKey / parseDateKey', () => {
  it('round-trips a local date', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(parseDateKey('2026-07-07'))).toBe('2026-07-07');
  });

  it('uses local date parts, not UTC', () => {
    // 11pm local on Dec 31 must stay Dec 31 regardless of timezone
    expect(toDateKey(new Date(2026, 11, 31, 23, 0, 0))).toBe('2026-12-31');
  });
});

describe('daysBetween', () => {
  it('counts whole days across month boundaries', () => {
    expect(daysBetween(new Date(2026, 0, 31), new Date(2026, 1, 1))).toBe(1);
    expect(daysBetween(new Date(2026, 6, 7), new Date(2026, 6, 7))).toBe(0);
    expect(daysBetween(new Date(2026, 6, 7), new Date(2026, 7, 7))).toBe(31);
  });

  it('ignores time-of-day', () => {
    expect(daysBetween(new Date(2026, 6, 7, 23, 59), new Date(2026, 6, 8, 0, 1))).toBe(1);
  });

  it('survives DST transitions (23/25-hour days)', () => {
    // 2026-03-08 is the US spring-forward date; the elapsed time is 47h, not 48h
    expect(daysBetween(new Date(2026, 2, 7), new Date(2026, 2, 9))).toBe(2);
  });
});

describe('getYesterdayDateKey', () => {
  it('crosses month and year boundaries', () => {
    expect(getYesterdayDateKey('2026-03-01')).toBe('2026-02-28');
    expect(getYesterdayDateKey('2026-01-01')).toBe('2025-12-31');
    expect(getYesterdayDateKey('2026-07-07')).toBe('2026-07-06');
  });
});

describe('msUntilNextMidnight', () => {
  it('returns the gap to the next local midnight', () => {
    const now = new Date(2026, 6, 7, 23, 0, 0);
    expect(msUntilNextMidnight(now)).toBe(60 * 60 * 1000);
  });
});

describe('formatDisplayDate', () => {
  it('renders a friendly date', () => {
    expect(formatDisplayDate('1974-10-30')).toBe('Oct 30, 1974');
  });
});
