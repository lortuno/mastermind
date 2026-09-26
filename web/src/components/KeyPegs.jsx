import React from 'react';

function toKinds(white, black, holes) {
  const empty = Math.max(holes - white - black, 0);
  return [
    ...Array(white).fill('white'),
    ...Array(black).fill('black'),
    ...Array(empty).fill('empty'),
  ];
}

// Classic Mastermind scoring pegs in a two-column grid. Purely decorative:
// the attempt row states both counts as text.
export default function KeyPegs({ white, black, holes }) {
  return (
    <span className="key-pegs" aria-hidden="true">
      {toKinds(white, black, holes).map((kind, index) => (
        <span key={index} className={`key-pegs__peg key-pegs__peg--${kind}`} />
      ))}
    </span>
  );
}
