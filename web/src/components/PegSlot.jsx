import React from 'react';
import { findColor } from '@mastermind/core';

export default function PegSlot({ position, letter, isActive, isDisabled = false, onSelect }) {
  const color = findColor(letter);
  const label = color
    ? `Position ${position + 1}, ${color.name}`
    : `Position ${position + 1}, empty`;
  const className = `peg-slot${isActive ? ' peg-slot--active' : ''}${color ? ' peg-slot--filled' : ''}`;

  return (
    <span className="guess-board__column">
      <button
        type="button"
        className={className}
        style={color ? { backgroundColor: color.hex, color: color.textHex } : undefined}
        aria-label={label}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={() => onSelect(position)}
      >
        {color ? color.letter : ''}
      </button>
      {/* Shape cue under the active slot, so "active" is not carried by the ring color alone. */}
      <span
        className={`guess-board__marker${isActive ? ' guess-board__marker--active' : ''}`}
        aria-hidden="true"
      />
    </span>
  );
}
