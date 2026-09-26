import React from 'react';
import { COLORS } from '../constants/colors.js';

function findColor(letter) {
  return COLORS.find((color) => color.letter === letter) ?? null;
}

export default function GameStatusBanner({ isWinner, secretCombination, onPlayAgain }) {
  return (
    <div className={`status-banner${isWinner ? ' status-banner--win' : ' status-banner--loss'}`} role="status">
      <p className="status-banner__message">
        {isWinner ? 'You win!' : 'You lose.'}
      </p>
      <p className="status-banner__secret-label">The secret combination was:</p>
      <div className="status-banner__secret">
        {secretCombination.map((letter, position) => {
          const color = findColor(letter);
          return (
            <span
              key={position}
              className="status-banner__peg"
              style={{ backgroundColor: color?.hex }}
              aria-label={color?.name}
            >
              {letter}
            </span>
          );
        })}
      </div>
      <button type="button" className="button button--primary" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  );
}
