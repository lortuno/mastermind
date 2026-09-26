import React from 'react';
import { describeCombination } from '@mastermind/core';
import KeyPegs from './KeyPegs.jsx';
import Peg from './Peg.jsx';

function AttemptRow({ entry, isLatest }) {
  const letters = entry.combination.split('');

  return (
    <li className={`guess-history__row${isLatest ? ' guess-history__row--latest' : ''}`}>
      <span className="guess-history__meta">
        <span className="guess-history__attempt">#{entry.attempt}</span>
        {isLatest && <span className="guess-history__badge">Latest</span>}
      </span>
      <span className="guess-history__board">
        <span
          className="guess-history__pegs"
          role="img"
          aria-label={`Attempt ${entry.attempt}: ${describeCombination(letters)}`}
        >
          {letters.map((letter, position) => (
            <Peg key={position} letter={letter} size="sm" />
          ))}
        </span>
        <KeyPegs white={entry.white} black={entry.black} holes={letters.length} />
      </span>
      <span className="guess-history__score">
        <span>{entry.white} right position</span>
        <span>{entry.black} right color, wrong position</span>
      </span>
    </li>
  );
}

// `history` arrives oldest first from the API.
export default function GuessHistory({ history }) {
  if (history.length === 0) {
    return <p className="guess-history__empty">No guesses submitted yet.</p>;
  }

  // Newest first for display only; the copy leaves the server-ordered prop untouched.
  const newestFirst = [...history].reverse();

  return (
    <ol className="guess-history" aria-label="Submitted guesses">
      {newestFirst.map((entry, index) => (
        <AttemptRow key={entry.attempt} entry={entry} isLatest={index === 0} />
      ))}
    </ol>
  );
}
