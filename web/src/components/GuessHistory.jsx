import React from 'react';
import { COLORS } from '../constants/colors.js';

function findColor(letter) {
  return COLORS.find((color) => color.letter === letter) ?? null;
}

export default function GuessHistory({ history }) {
  if (history.length === 0) {
    return <p className="guess-history__empty">No guesses submitted yet.</p>;
  }

  return (
    <ol className="guess-history" aria-label="Submitted guesses">
      {history.map((guess, attemptIndex) => (
        <li key={attemptIndex} className="guess-history__row">
          <span className="guess-history__attempt">#{attemptIndex + 1}</span>
          {guess.map((letter, position) => {
            const color = findColor(letter);
            return (
              <span
                key={position}
                className="guess-history__peg"
                style={{ backgroundColor: color?.hex }}
                aria-label={color?.name}
              >
                {letter}
              </span>
            );
          })}
        </li>
      ))}
    </ol>
  );
}
