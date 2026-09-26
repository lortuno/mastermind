import React from 'react';

export default function DifficultySelect({ difficulties, onSelect, isSubmitting }) {
  return (
    <div className="difficulty-select" role="group" aria-label="Choose difficulty">
      {difficulties.map((difficulty) => (
        <button
          key={difficulty.level}
          type="button"
          className="difficulty-select__option"
          disabled={isSubmitting}
          onClick={() => onSelect(difficulty.level)}
        >
          <span className="difficulty-select__name">{difficulty.name}</span>
          <span className="difficulty-select__meta">
            {difficulty.width} positions · {difficulty.maxAttempts} attempts
          </span>
        </button>
      ))}
    </div>
  );
}
