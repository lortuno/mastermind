import React, { useState } from 'react';
import GuessBoard from './components/GuessBoard.jsx';
import ColorPalette from './components/ColorPalette.jsx';
import GuessHistory from './components/GuessHistory.jsx';
import { BOARD_WIDTH } from './constants/colors.js';

function emptyGuess() {
  return Array(BOARD_WIDTH).fill(null);
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
  const [guess, setGuess] = useState(emptyGuess);
  const [activeSlot, setActiveSlot] = useState(0);
  const [history, setHistory] = useState([]);

  const canSubmit = guess.every((letter) => letter !== null);

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
    setGuess(emptyGuess());
    setActiveSlot(0);
  }

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setHistory((previous) => [...previous, guess]);
    setGuess(emptyGuess());
    setActiveSlot(0);
  }

  return (
    <main className="mastermind">
      <h1>Mastermind</h1>
      <p className="mastermind__hint">
        Pick a position, then choose a color for it.
      </p>

      <GuessBoard
        guess={guess}
        activeSlot={activeSlot}
        onSlotSelect={setActiveSlot}
      />

      <ColorPalette onPick={handlePickColor} />

      <div className="mastermind__actions">
        <button type="button" className="button button--secondary" onClick={handleClear}>
          Clear
        </button>
        <button
          type="button"
          className="button button--primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Submit Guess
        </button>
      </div>

      <section className="mastermind__history">
        <h2>Guesses</h2>
        <GuessHistory history={history} />
      </section>
    </main>
  );
}
