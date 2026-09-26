import React, { useEffect, useState } from 'react';
import GuessBoard from './components/GuessBoard.jsx';
import ColorPalette from './components/ColorPalette.jsx';
import GuessHistory from './components/GuessHistory.jsx';
import DifficultySelect from './components/DifficultySelect.jsx';
import GameStatusBanner from './components/GameStatusBanner.jsx';
import { fetchDifficulties, fetchState, startGame, submitGuess } from './api/gameApi.js';

function emptyGuess(width) {
  return Array(width).fill(null);
}

function nextEmptySlot(guess, fromPosition) {
  for (let position = fromPosition + 1; position < guess.length; position += 1) {
    if (guess[position] === null) {
      return position;
    }
  }
  return -1;
}

export default function App() {
  const [phase, setPhase] = useState('loading'); // loading | difficulty | playing | finished
  const [difficulties, setDifficulties] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [guess, setGuess] = useState([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const [difficultiesResult, stateResult] = await Promise.allSettled([
        fetchDifficulties(),
        fetchState(),
      ]);

      if (difficultiesResult.status === 'fulfilled') {
        setDifficulties(difficultiesResult.value.difficulties);
      }

      if (stateResult.status === 'fulfilled') {
        applyState(stateResult.value);
      } else {
        setPhase('difficulty');
      }
    }

    bootstrap();
  }, []);

  function applyState(state) {
    setGameState(state);
    setGuess(emptyGuess(state.width));
    setActiveSlot(0);
    setPhase(state.isFinished ? 'finished' : 'playing');
  }

  async function handleSelectDifficulty(level) {
    setError(null);
    setIsSubmitting(true);
    try {
      applyState(await startGame(level));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePickColor(letter) {
    const updatedGuess = guess.slice();
    updatedGuess[activeSlot] = letter;
    setGuess(updatedGuess);

    const following = nextEmptySlot(updatedGuess, activeSlot);
    if (following !== -1) {
      setActiveSlot(following);
    }
  }

  function handleClear() {
    setGuess(emptyGuess(gameState.width));
    setActiveSlot(0);
  }

  async function handleSubmitGuess() {
    if (guess.some((letter) => letter === null)) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const state = await submitGuess(guess.join(''));
      setGameState(state);
      setGuess(emptyGuess(state.width));
      setActiveSlot(0);
      if (state.isFinished) {
        setPhase('finished');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePlayAgain() {
    setPhase('difficulty');
    setGameState(null);
    setError(null);
  }

  const canSubmit = guess.length > 0 && guess.every((letter) => letter !== null);

  return (
    <main className="mastermind">
      <h1>Mastermind</h1>

      {error && (
        <p className="mastermind__error" role="alert">
          {error}
        </p>
      )}

      {phase === 'loading' && <p className="mastermind__hint">Loading…</p>}

      {phase === 'difficulty' && (
        <>
          <p className="mastermind__hint">Choose a difficulty to start a new game.</p>
          <DifficultySelect
            difficulties={difficulties}
            onSelect={handleSelectDifficulty}
            isSubmitting={isSubmitting}
          />
        </>
      )}

      {(phase === 'playing' || phase === 'finished') && gameState && (
        <>
          <p className="mastermind__hint">
            {gameState.difficultyName} · Attempt {gameState.attemptNumber} of {gameState.maxAttempts}
          </p>

          <GuessBoard
            guess={guess}
            activeSlot={activeSlot}
            onSlotSelect={setActiveSlot}
          />

          <ColorPalette onPick={handlePickColor} />

          <div className="mastermind__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={handleClear}
              disabled={phase === 'finished'}
            >
              Clear
            </button>
            <button
              type="button"
              className="button button--primary"
              disabled={!canSubmit || phase === 'finished' || isSubmitting}
              onClick={handleSubmitGuess}
            >
              Submit Guess
            </button>
          </div>

          {phase === 'finished' && (
            <GameStatusBanner
              isWinner={gameState.isWinner}
              secretCombination={gameState.secretCombination}
              onPlayAgain={handlePlayAgain}
            />
          )}

          <section className="mastermind__history">
            <h2>Attempts</h2>
            <GuessHistory history={gameState.history} />
          </section>
        </>
      )}
    </main>
  );
}
