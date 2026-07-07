export type FeedbackColor = 'correct' | 'close' | 'wrong';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface SportEvent {
  id: string;
  text: string;
  /** ISO date "YYYY-MM-DD" — never shown until the game is over */
  date: string;
}

export interface Puzzle {
  id: number;
  /** Optional flavor label shown under the header, e.g. "Boxing's Biggest Nights" */
  theme?: string;
  events: SportEvent[];
}

export interface GuessRecord {
  /** Event ids top→bottom as the player submitted them */
  order: string[];
  feedback: FeedbackColor[];
}

export interface DayState {
  puzzleId: number;
  currentOrder: string[];
  guesses: GuessRecord[];
  status: GameStatus;
  /** Local calendar day "YYYY-MM-DD" this state belongs to */
  dateKey: string;
}

export interface LifetimeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  /** winDistribution[n-1] = number of wins that took n guesses */
  winDistribution: number[];
}

export type Mode = 'daily' | 'arcade';

export interface ArcadeStats {
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  /** Consecutive Free Play wins right now (resets on a loss) */
  currentRun: number;
  bestRun: number;
}

/** Serialized in-progress Free Play round (events stored by id) */
export interface ArcadeRoundSave {
  eventIds: string[];
  currentOrder: string[];
  guesses: GuessRecord[];
  status: GameStatus;
}
