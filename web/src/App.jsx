import React from 'react';
import { useMastermindGame } from '@mastermind/core';
import GuessBoard from './components/GuessBoard.jsx';
import ColorPalette from './components/ColorPalette.jsx';
import GuessHistory from './components/GuessHistory.jsx';
import DifficultySelect from './components/DifficultySelect.jsx';
import GameStatusBanner from './components/GameStatusBanner.jsx';
import GameHeader from './components/GameHeader.jsx';

/** @param {{ api: import('@mastermind/core').GameApi }} props */
export default function App({ api }) {
  const game = useMastermindGame(api);
  const { phase, gameState } = game;
  const isFinished = phase === 'finished';
  const isBoardVisible = (phase === 'playing' || isFinished) && gameState !== null;

  return (
    <main className="mastermind">
      <h1>Mastermind</h1>

      {game.error && (
        <p className="mastermind__error" role="alert">
          {game.error}
        </p>
      )}

      {phase === 'loading' && <p className="mastermind__hint">Loading…</p>}

      {phase === 'difficulty' && (
        <>
          <p className="mastermind__hint">Choose a difficulty to start a new game.</p>
          <DifficultySelect
            difficulties={game.difficulties}
            onSelect={game.selectDifficulty}
            isSubmitting={game.isSubmitting}
          />
          {game.canRetryLoad && (
            <div className="mastermind__actions">
              <button type="button" className="button button--primary" onClick={game.retryLoad}>
                Retry
              </button>
            </div>
          )}
        </>
      )}

      {isBoardVisible && (
        <>
          <GameHeader
            difficultyName={gameState.difficultyName}
            attemptNumber={gameState.attemptNumber}
            maxAttempts={gameState.maxAttempts}
          />

          <div className="board-tray">
            <p className="board-tray__overline">Your guess</p>
            <GuessBoard
              guess={game.board.guess}
              activeSlot={game.board.activeSlot}
              onSlotSelect={game.selectSlot}
              isDisabled={game.isBoardLocked}
            />

            <ColorPalette onPick={game.pickColor} isDisabled={game.isBoardLocked} />

            <div className="mastermind__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={game.clearGuess}
                disabled={game.isBoardLocked}
              >
                Clear
              </button>
              <button
                type="button"
                className="button button--primary"
                disabled={!game.canSubmit}
                onClick={game.submitGuess}
              >
                Submit guess
              </button>
            </div>
          </div>

          {isFinished && (
            <GameStatusBanner
              isWinner={gameState.isWinner}
              secretCombination={gameState.secretCombination ?? []}
              onPlayAgain={game.playAgain}
            />
          )}

          <section className="mastermind__history">
            <div className="mastermind__section-header">
              <h2>Attempts</h2>
              <span className="mastermind__section-hint">Newest first</span>
            </div>
            <GuessHistory history={gameState.history} />
          </section>
        </>
      )}
    </main>
  );
}
