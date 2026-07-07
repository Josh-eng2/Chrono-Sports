import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import HistoryGrid from './components/HistoryGrid';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import HowToPlayModal from './components/HowToPlayModal';
import StatsModal from './components/StatsModal';
import EndGameModal from './components/EndGameModal';
import Toast from './components/Toast';
import { NoPuzzleScreen, PreLaunchScreen } from './components/EdgeScreens';
import { useGame } from './hooks/useGame';
import { buildShareText, shareResults } from './utils/share';
import { hasSeenHowTo, markHowToSeen } from './utils/storage';

type ActiveModal = 'howto' | 'stats' | 'end' | null;

export default function App() {
  const game = useGame();
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

  // Pop the results modal when the game just finished (delayed so the card
  // flip reveal plays out). A restored finished game does NOT auto-open.
  const prevStatus = useRef(game.status);
  useEffect(() => {
    const was = prevStatus.current;
    prevStatus.current = game.status;
    if (was === 'playing' && (game.status === 'won' || game.status === 'lost')) {
      const t = window.setTimeout(() => setActiveModal('end'), 1400);
      return () => window.clearTimeout(t);
    }
  }, [game.status]);

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

  if (game.screen === 'pre-launch') return <PreLaunchScreen />;
  if (game.screen === 'no-puzzle') return <NoPuzzleScreen puzzleNumber={game.puzzleNumber} />;

  const gameOver = game.status !== 'playing';
  const wonToday = game.status === 'won';

  return (
    <div className="min-h-dvh bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col gap-4 px-4 py-4">
        <Header
          onHowTo={() => setActiveModal('howto')}
          onStats={() => setActiveModal('stats')}
          streak={game.displayStreak}
        />

        <p className="-mt-2 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Puzzle #{game.puzzleNumber}
          {game.puzzle?.theme ? ` · ${game.puzzle.theme}` : ''}
        </p>

        <HistoryGrid guesses={game.guesses} />

        <main className="flex flex-col gap-4">
          <GameBoard
            order={game.currentOrder}
            eventsById={game.eventsById}
            liveFeedback={game.liveFeedback}
            disabled={gameOver}
            showDates={gameOver}
            onReorder={game.reorder}
          />
          <Controls
            guessesRemaining={game.guessesRemaining}
            canSubmit={game.canSubmit}
            status={game.status}
            alreadyTried={game.alreadyTried && game.guesses.length > 0}
            onSubmit={game.submitGuess}
            onShowResults={() => setActiveModal('end')}
          />
        </main>
      </div>

      <HowToPlayModal isOpen={activeModal === 'howto'} onClose={() => setActiveModal(null)} />
      <StatsModal
        isOpen={activeModal === 'stats'}
        onClose={() => setActiveModal(null)}
        stats={game.stats}
        displayStreak={game.displayStreak}
        highlightAttempts={wonToday ? game.guesses.length : null}
      />
      {gameOver && game.puzzle && (
        <EndGameModal
          isOpen={activeModal === 'end'}
          onClose={() => setActiveModal(null)}
          won={wonToday}
          puzzleNumber={game.puzzleNumber}
          events={game.puzzle.events}
          guesses={game.guesses}
          displayStreak={game.displayStreak}
          onShare={handleShare}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
