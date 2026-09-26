import type { ColorLetter } from './colors';

export type Guess = readonly (ColorLetter | null)[];

export type GuessBoardState = {
  guess: Guess;
  activeSlot: number;
};

export function emptyGuess(width: number): Guess {
  return Array<ColorLetter | null>(width).fill(null);
}

function nextEmptySlot(guess: Guess, fromPosition: number): number {
  for (let position = fromPosition + 1; position < guess.length; position += 1) {
    if (guess[position] === null) {
      return position;
    }
  }
  return -1;
}

export function placeColor({ guess, activeSlot }: GuessBoardState, letter: ColorLetter): GuessBoardState {
  const updatedGuess = guess.map((current, position) => (position === activeSlot ? letter : current));
  const following = nextEmptySlot(updatedGuess, activeSlot);

  return {
    guess: updatedGuess,
    activeSlot: following === -1 ? activeSlot : following,
  };
}

export function isGuessComplete(guess: Guess): boolean {
  return guess.length > 0 && guess.every((letter) => letter !== null);
}
