// Mirrors App\Model\Type::$validValues (src/Model/Type.php).
// Keep in sync if the valid color set ever changes on the PHP side.
export type ColorLetter = 'R' | 'G' | 'B' | 'P' | 'Y';

export type PegColor = {
  letter: ColorLetter;
  name: string;
  hex: string;
  // Letter color that keeps contrast >= 4.5:1 on the fill.
  textHex: string;
};

export const COLORS: readonly PegColor[] = [
  { letter: 'R', name: 'Red', hex: '#e5484d', textHex: '#12151c' },
  { letter: 'G', name: 'Green', hex: '#30a46c', textHex: '#12151c' },
  { letter: 'B', name: 'Blue', hex: '#0091ff', textHex: '#12151c' },
  { letter: 'P', name: 'Purple', hex: '#8e4ec6', textHex: '#ffffff' },
  { letter: 'Y', name: 'Yellow', hex: '#ffc53d', textHex: '#12151c' },
];

export function findColor(letter: string | null): PegColor | null {
  return COLORS.find((color) => color.letter === letter) ?? null;
}

/** "RGB" or ['R', 'G', 'B'] → "Red, Green, Blue" (unknown letters kept as-is). */
export function describeCombination(letters: string | readonly string[]): string {
  const list = typeof letters === 'string' ? letters.split('') : letters;
  return list.map((letter) => findColor(letter)?.name ?? letter).join(', ');
}
