// Mirrors App\Model\Type::$validValues (src/Model/Type.php) and
// mobile/src/game/colors.ts. Keep in sync if the valid color set ever changes.
// `textHex` is the letter color that keeps contrast >= 4.5:1 on the fill.
export const COLORS = [
  { letter: 'R', name: 'Red', hex: '#e5484d', textHex: '#12151c' },
  { letter: 'G', name: 'Green', hex: '#30a46c', textHex: '#12151c' },
  { letter: 'B', name: 'Blue', hex: '#0091ff', textHex: '#12151c' },
  { letter: 'P', name: 'Purple', hex: '#8e4ec6', textHex: '#ffffff' },
  { letter: 'Y', name: 'Yellow', hex: '#ffc53d', textHex: '#12151c' },
];

export function findColor(letter) {
  return COLORS.find((color) => color.letter === letter) ?? null;
}

export function describeCombination(letters) {
  return letters.map((letter) => findColor(letter)?.name ?? letter).join(', ');
}
