import { StyleSheet, Text, View } from 'react-native';
import type { Attempt } from '../api/types';
import { findColor } from '../game/colors';
import { palette, radius, spacing } from '../theme';
import Peg from './Peg';

type Props = {
  history: Attempt[];
};

function describeCombination(combination: string): string {
  return combination
    .split('')
    .map((letter) => findColor(letter)?.name ?? letter)
    .join(', ');
}

export default function GuessHistory({ history }: Props) {
  if (history.length === 0) {
    return <Text style={styles.empty}>No guesses submitted yet.</Text>;
  }

  return (
    // role="list" rather than `accessible`: grouping would hide every row from VoiceOver.
    <View accessibilityRole="list" accessibilityLabel="Submitted guesses" style={styles.list}>
      {history.map((entry) => (
        <View key={entry.attempt} style={styles.row}>
          <Text style={styles.attempt}>#{entry.attempt}</Text>
          <View
            accessible
            accessibilityLabel={`Attempt ${entry.attempt}: ${describeCombination(entry.combination)}`}
            style={styles.pegs}
          >
            {entry.combination.split('').map((letter, position) => (
              <Peg key={position} letter={letter} size={28} />
            ))}
          </View>
          <View style={styles.score}>
            <View style={styles.scoreItem}>
              <View style={[styles.dot, styles.dotWhite]} />
              <Text style={styles.scoreText}>{entry.white} right position</Text>
            </View>
            <View style={styles.scoreItem}>
              <View style={[styles.dot, styles.dotBlack]} />
              <Text style={styles.scoreText}>{entry.black} right color, wrong position</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: palette.textMuted,
    fontSize: 15,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius,
    backgroundColor: palette.surface,
  },
  attempt: {
    color: palette.textMuted,
    fontVariant: ['tabular-nums'],
    width: 28,
  },
  pegs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  score: {
    gap: 2,
    flexShrink: 1,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // Same contrast treatment as the web client: solid light "white", dark ringed "black".
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  dotWhite: {
    backgroundColor: palette.text,
    borderColor: palette.bg,
  },
  dotBlack: {
    backgroundColor: palette.bg,
    borderColor: palette.textMuted,
  },
  scoreText: {
    color: palette.text,
    fontSize: 13,
  },
});
