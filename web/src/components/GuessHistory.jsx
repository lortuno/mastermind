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
      {history.map((entry) => (
        <li key={entry.attempt} className="guess-history__row">
          <span className="guess-history__attempt">#{entry.attempt}</span>
          <span className="guess-history__pegs">
            {entry.combination.split('').map((letter, position) => {
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
          </span>
          <span className="guess-history__score">
            <span className="guess-history__score-item guess-history__score-item--white">
              {entry.white} right position
            </span>
            <span className="guess-history__score-item guess-history__score-item--black">
              {entry.black} right color, wrong position
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
