import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import ModeTabs from './components/ModeTabs';
import HistoryGrid from './components/HistoryGrid';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import HowToPlayModal from './components/HowToPlayModal';
import StatsModal from './components/StatsModal';
import EndGameModal from './components/EndGameModal';
import ArcadeEndModal from './components/ArcadeEndModal';
import Toast from './components/Toast';
import { DailyUnavailable } from './components/EdgeScreens';
import { useGame } from './hooks/useGame';
import { useArcade } from './hooks/useArcade';
import { buildArcadeShareText, buildShareText, shareResults } from './utils/share';
import { hasSeenHowTo, markHowToSeen } from './utils/storage';
import type { Mode } from './types/game';

type ActiveModal = 'howto' | 'stats' | 'end' | 'arcade-end' | null;

export default function App() {
  const game = useGame();
  const arcade = useArcade();
  const [mode, setMode] = useState<Mode>('daily');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  // First-ever visit: teach the rules before the clock starts.
  useEffect(() => {
    if (!hasSeenHowTo()) {
      setActiveModal('howto');
      markHowToSeen();
    }
  }, []);

  // Pop the results modal when a game just finished (delayed so the card
  // flip reveal plays out). A restored finished game does NOT auto-open.
  const prevDaily = useRef(game.status);
  useEffect(() => {
    const was = prevDaily.current;
    prevDaily.current = game.status;
    if (was === 'playing' && (game.status === 'won' || game.status === 'lost')) {
      const t = window.setTimeout(() => setActiveModal('end'), 1400);
      return () => window.clearTimeout(t);
    }
  }, [game.status]);

  const prevArcade = useRef(arcade.status);
  useEffect(() => {
    const was = prevArcade.current;
    prevArcade.current = arcade.status;
    if (was === 'playing' && (arcade.status === 'won' || arcade.status === 'lost')) {
      const t = window.setTimeout(() => setActiveModal('arcade-end'), 1400);
      return () => window.clearTimeout(t);
    }
  }, [arcade.status]);

  const handleShare = useCallback(async () => {
    const text = buildShareText(
      game.puzzleNumber,
      game.guesses,
      game.status === 'won',
      game.stats.currentStreak,
    );
    const outcome = await shareResults(text);
    if (outcome === 'copied') showToast('Results copied to clipboard!');
    else if (outcome === 'failed') showToast('Could not copy — please try again.');
  }, [game.puzzleNumber, game.guesses, game.status, game.stats.currentStreak, showToast]);

  const handleArcadeShare = useCallback(async () => {
    const text = buildArcadeShareText(
      arcade.pointsEarned,
      arcade.guesses,
      arcade.status === 'won',
      arcade.stats.totalPoints,
    );
    const outcome = await shareResults(text);
    if (outcome === 'copied') showToast('Results copied to clipboard!');
    else if (outcome === 'failed') showToast('Could not copy — please try again.');
  }, [arcade.pointsEarned, arcade.guesses, arcade.status, arcade.stats.totalPoints, showToast]);

  const startNextRound = useCallback(() => {
    setActiveModal(null);
    arcade.startNewRound();
  }, [arcade]);

  const dailyOver = game.status !== 'playing';
  const arcadeOver = arcade.status !== 'playing';
  const wonDailyToday = game.status === 'won';

  return (
    <div className="min-h-dvh bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col gap-4 px-4 py-4">
        <Header
          onHowTo={() => setActiveModal('howto')}
          onStats={() => setActiveModal('stats')}
          streak={game.displayStreak}
        />

        <div className="-mt-1">
          <ModeTabs mode={mode} onChange={setMode} />
        </div>

        {mode === 'daily' ? (
          game.screen !== 'playing' ? (
            <DailyUnavailable
              screen={game.screen}
              puzzleNumber={game.puzzleNumber}
              onFreePlay={() => setMode('arcade')}
            />
          ) : (
            <>
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Puzzle #{game.puzzleNumber}
                {game.puzzle?.theme ? ` · ${game.puzzle.theme}` : ''}
              </p>
              <HistoryGrid guesses={game.guesses} />
              <main className="flex flex-col gap-4">
                <GameBoard
                  order={game.currentOrder}
                  eventsById={game.eventsById}
                  liveFeedback={game.liveFeedback}
                  disabled={dailyOver}
                  showDates={dailyOver}
                  onReorder={game.reorder}
                />
                <Controls
                  guessesRemaining={game.guessesRemaining}
                  canSubmit={game.canSubmit}
                  status={game.status}
                  alreadyTried={game.alreadyTried && game.guesses.length > 0}
                  mode="daily"
                  onSubmit={game.submitGuess}
                  onShowResults={() => setActiveModal('end')}
                />
              </main>
            </>
          )
        ) : (
          <>
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Free Play · Round {arcade.stats.gamesPlayed + (arcadeOver ? 0 : 1)} · 🎯{' '}
              {arcade.stats.totalPoints.toLocaleString('en-US')} pts
            </p>
            <HistoryGrid guesses={arcade.guesses} />
            <main className="flex flex-col gap-4">
              <GameBoard
                order={arcade.currentOrder}
                eventsById={arcade.eventsById}
                liveFeedback={arcade.liveFeedback}
                disabled={arcadeOver}
                showDates={arcadeOver}
                onReorder={arcade.reorder}
              />
              <Controls
                guessesRemaining={arcade.guessesRemaining}
                canSubmit={arcade.canSubmit}
                status={arcade.status}
                alreadyTried={arcade.alreadyTried && arcade.guesses.length > 0}
                mode="arcade"
                onSubmit={arcade.submitGuess}
                onShowResults={() => setActiveModal('arcade-end')}
                onNextRound={startNextRound}
              />
            </main>
          </>
        )}
      </div>

      <HowToPlayModal isOpen={activeModal === 'howto'} onClose={() => setActiveModal(null)} />
      <StatsModal
        isOpen={activeModal === 'stats'}
        onClose={() => setActiveModal(null)}
        stats={game.stats}
        arcadeStats={arcade.stats}
        displayStreak={game.displayStreak}
        highlightAttempts={wonDailyToday ? game.guesses.length : null}
      />
      {dailyOver && game.puzzle && (
        <EndGameModal
          isOpen={activeModal === 'end'}
          onClose={() => setActiveModal(null)}
          won={wonDailyToday}
          puzzleNumber={game.puzzleNumber}
          events={game.puzzle.events}
          guesses={game.guesses}
          displayStreak={game.displayStreak}
          onShare={handleShare}
        />
      )}
      {arcadeOver && (
        <ArcadeEndModal
          isOpen={activeModal === 'arcade-end'}
          onClose={() => setActiveModal(null)}
          won={arcade.status === 'won'}
          pointsEarned={arcade.pointsEarned}
          stats={arcade.stats}
          events={arcade.events}
          guesses={arcade.guesses}
          onNextRound={startNextRound}
          onShare={handleArcadeShare}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
