import { describe, expect, it } from 'vitest';
import { COLORS, describeCombination, findColor } from './colors';

describe('COLORS', () => {
  it('matches the valid color letters of App\\Model\\Type', () => {
    expect(COLORS.map((color) => color.letter).sort()).toEqual(['B', 'G', 'P', 'R', 'Y']);
  });
});

describe('findColor', () => {
  it('resolves a letter to its color', () => {
    expect(findColor('P')).toMatchObject({ name: 'Purple', hex: '#8e4ec6' });
  });

  it('returns null for an empty slot or unknown letter', () => {
    expect(findColor(null)).toBeNull();
    expect(findColor('X')).toBeNull();
  });
});

describe('describeCombination', () => {
  it('names each color of a combination string', () => {
    expect(describeCombination('RGB')).toBe('Red, Green, Blue');
  });

  it('accepts an array of letters and keeps unknown letters as-is', () => {
    expect(describeCombination(['Y', 'X'])).toBe('Yellow, X');
  });
});
