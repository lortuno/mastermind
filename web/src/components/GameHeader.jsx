import React from 'react';

// Status chips plus a segmented "rows left on the board" bar. The chips carry
// the numbers as text; the bar repeats them for assistive tech as a progressbar.
export default function GameHeader({ difficultyName, attemptNumber, maxAttempts }) {
  const remaining = Math.max(maxAttempts - attemptNumber, 0);
  const segments = Array.from({ length: maxAttempts }, (_, index) => index < remaining);

  return (
    <div className="game-header">
      <div className="game-header__chips">
        <span className="chip chip--accent">{difficultyName}</span>
        <span className="chip">
          Attempt {attemptNumber} of {maxAttempts}
        </span>
      </div>
      <div
        className="game-header__bar"
        role="progressbar"
        aria-label="Attempts remaining"
        aria-valuemin={0}
        aria-valuemax={maxAttempts}
        aria-valuenow={remaining}
        aria-valuetext={`${remaining} of ${maxAttempts} left`}
      >
        {segments.map((isRemaining, index) => (
          <span
            key={index}
            className={`game-header__segment${isRemaining ? ' game-header__segment--remaining' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
