import React from 'react';
import { COLORS } from '../constants/colors.js';

function findColor(letter) {
  return COLORS.find((color) => color.letter === letter) ?? null;
}

export default function PegSlot({ position, letter, isActive, onSelect }) {
  const color = findColor(letter);
  const label = color
    ? `Position ${position + 1}, ${color.name}`
    : `Position ${position + 1}, empty`;

  return (
    <button
      type="button"
      className={`peg-slot${isActive ? ' peg-slot--active' : ''}${
        color ? ' peg-slot--filled' : ''
      }`}
      style={color ? { backgroundColor: color.hex } : undefined}
      aria-label={label}
      aria-pressed={isActive}
      onClick={() => onSelect(position)}
    >
      {color ? color.letter : ''}
    </button>
  );
}
