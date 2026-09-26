import { describe, expect, it } from 'vitest';
import { emptyGuess, isGuessComplete, placeColor } from './guess';

describe('emptyGuess', () => {
  it('creates one empty slot per board position', () => {
    expect(emptyGuess(4)).toEqual([null, null, null, null]);
  });
});

describe('placeColor', () => {
  it('fills the active slot and advances to the next empty slot', () => {
    const result = placeColor({ guess: [null, null, null], activeSlot: 0 }, 'R');

    expect(result).toEqual({ guess: ['R', null, null], activeSlot: 1 });
  });

  it('skips already filled slots when advancing', () => {
    const result = placeColor({ guess: [null, 'G', null], activeSlot: 0 }, 'R');

    expect(result.activeSlot).toBe(2);
  });

  it('stays on the active slot when no later slot is empty (no wraparound)', () => {
    const result = placeColor({ guess: [null, 'G', 'B'], activeSlot: 2 }, 'Y');

    expect(result).toEqual({ guess: [null, 'G', 'Y'], activeSlot: 2 });
  });

  it('overwrites a filled slot the player re-selected', () => {
    const result = placeColor({ guess: ['R', 'G', null], activeSlot: 0 }, 'P');

    expect(result).toEqual({ guess: ['P', 'G', null], activeSlot: 2 });
  });

  it('does not mutate the input guess', () => {
    const guess = [null, null];
    placeColor({ guess, activeSlot: 0 }, 'R');

    expect(guess).toEqual([null, null]);
  });
});

describe('isGuessComplete', () => {
  it('is false while any slot is empty', () => {
    expect(isGuessComplete(['R', null])).toBe(false);
  });

  it('is true when every slot is filled', () => {
    expect(isGuessComplete(['R', 'G'])).toBe(true);
  });

  it('is false for a board with no slots', () => {
    expect(isGuessComplete([])).toBe(false);
  });
});
