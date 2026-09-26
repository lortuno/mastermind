import { StyleSheet, Text, View } from 'react-native';
import { fontSize, palette, radius, spacing } from '../theme';

type Props = {
  difficultyName: string;
  attemptNumber: number;
  maxAttempts: number;
};

// Status chips plus a segmented "rows left on the board" bar. The chips carry
// the numbers as text; the bar repeats them for assistive tech as a progressbar.
export default function GameHeader({ difficultyName, attemptNumber, maxAttempts }: Props) {
  const remaining = Math.max(maxAttempts - attemptNumber, 0);
  const segments = Array.from({ length: maxAttempts }, (_, index) => index < remaining);

  return (
    <View style={styles.header}>
      <View style={styles.chips}>
        <View style={[styles.chip, styles.difficultyChip]}>
          <Text style={styles.chipText}>{difficultyName}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            Attempt {attemptNumber} of {maxAttempts}
          </Text>
        </View>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Attempts remaining"
        accessibilityValue={{ min: 0, max: maxAttempts, now: remaining, text: `${remaining} of ${maxAttempts} left` }}
        style={styles.bar}
      >
        {segments.map((isRemaining, index) => (
          <View key={index} style={[styles.segment, isRemaining && styles.segmentRemaining]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surfaceRaised,
  },
  difficultyChip: {
    borderColor: palette.accent,
  },
  chipText: {
    color: palette.text,
    fontSize: fontSize.small,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
  },
  segmentRemaining: {
    backgroundColor: palette.accent,
  },
});
