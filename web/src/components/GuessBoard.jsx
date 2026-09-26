import React from 'react';
import PegSlot from './PegSlot.jsx';

export default function GuessBoard({ guess, activeSlot, onSlotSelect, isDisabled = false }) {
  return (
    <div className="guess-board" role="group" aria-label="Current guess">
      {guess.map((letter, position) => (
        <PegSlot
          key={position}
          position={position}
          letter={letter}
          isActive={position === activeSlot && !isDisabled}
          isDisabled={isDisabled}
          onSelect={onSlotSelect}
        />
      ))}
    </div>
  );
}
