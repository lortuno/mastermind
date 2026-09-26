import { StyleSheet, View } from 'react-native';
import { KEY_PEG_SIZE, palette, spacing } from '../theme';

type Props = {
  white: number;
  black: number;
  // Number of holes: the board width.
  holes: number;
};

type KeyPegKind = 'white' | 'black' | 'empty';

function toKinds(white: number, black: number, holes: number): KeyPegKind[] {
  const empty = Math.max(holes - white - black, 0);
  return [
    ...Array<KeyPegKind>(white).fill('white'),
    ...Array<KeyPegKind>(black).fill('black'),
    ...Array<KeyPegKind>(empty).fill('empty'),
  ];
}

// Classic Mastermind scoring pegs in a two-column grid. Purely decorative:
// the attempt row states both counts as text for screen readers and for
// anyone who cannot tell the pegs apart.
export default function KeyPegs({ white, black, holes }: Props) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.grid}>
      {toKinds(white, black, holes).map((kind, index) => (
        <View key={index} style={[styles.peg, styles[kind]]} />
      ))}
    </View>
  );
}

const GRID_COLUMNS = 2;

const styles = StyleSheet.create({
  grid: {
    width: KEY_PEG_SIZE * GRID_COLUMNS + spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  peg: {
    width: KEY_PEG_SIZE,
    height: KEY_PEG_SIZE,
    borderRadius: KEY_PEG_SIZE / 2,
    borderWidth: 1,
  },
  // Right color, right position: solid light peg.
  white: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  // Right color, wrong position: dark peg with a light ring so it reads on the dark board.
  black: {
    backgroundColor: palette.bg,
    borderColor: palette.textMuted,
  },
  // Unscored hole.
  empty: {
    backgroundColor: palette.surfaceSunken,
    borderColor: palette.border,
  },
});
