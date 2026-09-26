import React from 'react';
import { COLORS } from '../constants/colors.js';

export default function ColorPalette({ onPick }) {
  return (
    <div className="color-palette" role="group" aria-label="Color options">
      {COLORS.map((color) => (
        <button
          key={color.letter}
          type="button"
          className="color-swatch"
          style={{ backgroundColor: color.hex }}
          aria-label={color.name}
          onClick={() => onPick(color.letter)}
        >
          {color.letter}
        </button>
      ))}
    </div>
  );
}
