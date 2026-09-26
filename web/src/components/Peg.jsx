import React from 'react';
import { findColor } from '../constants/colors.js';

// Read-only peg used in the attempt log and the secret reveal; the parent
// group supplies the accessible description.
export default function Peg({ letter, size = 'md' }) {
  const color = findColor(letter);
  const style = color ? { backgroundColor: color.hex, color: color.textHex } : undefined;

  return (
    <span className={`peg peg--${size}`} style={style} aria-hidden="true">
      {letter}
    </span>
  );
}
