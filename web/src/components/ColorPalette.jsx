import React from 'react';
import { COLORS } from '@mastermind/core';

export default function ColorPalette({ onPick, isDisabled = false }) {
  return (
    <div className="color-palette" role="group" aria-label="Color options">
      {COLORS.map((color) => (
        <button
          key={color.letter}
          type="button"
          className="color-swatch"
          style={{ backgroundColor: color.hex, color: color.textHex }}
          aria-label={color.name}
          disabled={isDisabled}
          onClick={() => onPick(color.letter)}
        >
          {color.letter}
        </button>
      ))}
    </div>
  );
}
