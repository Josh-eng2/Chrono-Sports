# Chrono-Sort: Sports Edition ⏱️

A Wordle-style daily web puzzle: drag **5 historic sports moments** into chronological
order (oldest at the top) in **5 guesses or fewer**. Green = right spot, yellow = one
spot away, gray = two or more away. New puzzle every day at local midnight.

**Status:** v1 complete — playable, tested, ready to deploy.

- **Launch date:** July 7, 2026 (Puzzle #1)
- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS v4 + dnd-kit
- **Plan & design review:** [PLAN.md](./PLAN.md)

## Quick start

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # 39 unit tests (Vitest)
npm run build      # type-check + production bundle in dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
├── main.tsx                  # React entry point
├── App.tsx                   # Layout + modal orchestration (no game logic)
├── index.css                 # Tailwind v4 + flip/pop animations
├── constants.ts              # Launch date, guess limits, colors, share URL
├── types/game.ts             # SportEvent, Puzzle, DayState, LifetimeStats…
├── data/puzzles.json         # 30 puzzles × 5 verified events (add more here!)
├── utils/
│   ├── date.ts               # Local-timezone date keys, day math, countdown
│   ├── puzzle.ts             # Daily puzzle number + seeded (fair) shuffle
│   ├── evaluate.ts           # Wordle-style positional feedback
│   ├── share.ts              # Emoji share card + native share / clipboard
│   └── storage.ts            # localStorage persistence, streaks, stats
├── hooks/useGame.ts          # The game state machine (single source of truth)
└── components/
    ├── Header.tsx            # Title, how-to & stats buttons, 🔥 streak badge
    ├── GameBoard.tsx         # DndContext + SortableContext (pointer + keyboard)
    ├── EventCard.tsx         # Draggable card with feedback colors + ✓/~/✕
    ├── HistoryGrid.tsx       # Wordle-style rows of past guesses
    ├── Controls.tsx          # Guess dots + submit / see-results button
    ├── Modal.tsx             # Shared dialog shell (Escape, backdrop close)
    ├── HowToPlayModal.tsx
    ├── StatsModal.tsx        # Stat tiles + guess-distribution chart
    ├── EndGameModal.tsx      # Correct timeline, countdown, share button
    ├── Countdown.tsx         # HH:MM:SS to the next local midnight
    ├── Toast.tsx
    └── EdgeScreens.tsx       # Pre-launch and end-of-archive screens
```

## Adding puzzles

Append entries to `src/data/puzzles.json` — no code changes needed:

```json
{
  "id": 31,
  "theme": "Optional Theme Name",
  "events": [
    { "id": "unique-slug", "text": "What happened", "date": "YYYY-MM-DD" }
  ]
}
```

Rules (enforced by the test suite): exactly 5 events, all dates valid and distinct
within a puzzle, event ids unique across the whole dataset. Puzzle `id` N is served
on launch day + (N − 1).

## Deploying

Any static host works. On Vercel/Netlify: build command `npm run build`, output
directory `dist`. HTTPS is required in production for the clipboard share button.
