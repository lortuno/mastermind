import React from 'react';
import { describeCombination } from '../constants/colors.js';
import Peg from './Peg.jsx';

export default function GameStatusBanner({ isWinner, secretCombination, onPlayAgain }) {
  const outcome = isWinner ? 'You win!' : 'You lose.';
  const tagline = isWinner ? 'Code cracked' : 'Out of attempts';

  return (
    <div className={`status-banner${isWinner ? ' status-banner--win' : ' status-banner--loss'}`} role="status">
      <p className="status-banner__tagline">{tagline}</p>
      <p className="status-banner__message">{outcome}</p>
      <p className="status-banner__secret-label">The secret combination was:</p>
      {/* The revealed code sits in a sunken shield, like the hidden row of a real board. */}
      <div
        className="status-banner__secret"
        role="img"
        aria-label={`Secret combination: ${describeCombination(secretCombination)}`}
      >
        {secretCombination.map((letter, position) => (
          <Peg key={position} letter={letter} size="lg" />
        ))}
      </div>
      <button type="button" className="button button--primary status-banner__action" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  );
}
