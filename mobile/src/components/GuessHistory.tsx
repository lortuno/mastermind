import { describeCombination, type Attempt } from '@mastermind/core';
import { StyleSheet, Text, View } from 'react-native';
import { HISTORY_PEG_SIZE, RAISED_SHADOW, fontSize, palette, radius, spacing } from '../theme';
import KeyPegs from './KeyPegs';
import Peg from './Peg';

type Props = {
  // Oldest first, as returned by the API.
  history: Attempt[];
};

type RowProps = {
  entry: Attempt;
  isLatest: boolean;
};

function AttemptRow({ entry, isLatest }: RowProps) {
  const letters = entry.combination.split('');

  return (
    <View style={[styles.row, isLatest && styles.latestRow]}>
      <View style={styles.meta}>
        <Text style={[styles.attempt, isLatest && styles.latestAttempt]}>#{entry.attempt}</Text>
        {isLatest && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Latest</Text>
          </View>
        )}
      </View>
      <View style={styles.board}>
        <View
          accessible
          accessibilityLabel={`Attempt ${entry.attempt}: ${describeCombination(entry.combination)}`}
          style={styles.pegs}
        >
          {letters.map((letter, position) => (
            <Peg key={position} letter={letter} size={HISTORY_PEG_SIZE} />
          ))}
        </View>
        <KeyPegs white={entry.white} black={entry.black} holes={letters.length} />
      </View>
      <View style={styles.score}>
        <Text style={styles.scoreText}>{entry.white} right position</Text>
        <Text style={styles.scoreText}>{entry.black} right color, wrong position</Text>
      </View>
    </View>
  );
}

export default function GuessHistory({ history }: Props) {
  if (history.length === 0) {
    return <Text style={styles.empty}>No guesses submitted yet.</Text>;
  }

  // Newest first for display only; the copy leaves the server-ordered prop untouched.
  const newestFirst = [...history].reverse();

  return (
    // role="list" rather than `accessible`: grouping would hide every row from VoiceOver.
    <View accessibilityRole="list" accessibilityLabel="Submitted guesses" style={styles.list}>
      {newestFirst.map((entry, index) => (
        <AttemptRow key={entry.attempt} entry={entry} isLatest={index === 0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: palette.textMuted,
    fontSize: fontSize.small,
    paddingVertical: spacing.lg,
    textAlign: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.border,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  latestRow: {
    borderWidth: 2,
    borderColor: palette.accent,
    backgroundColor: palette.surfaceRaised,
    boxShadow: RAISED_SHADOW,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attempt: {
    color: palette.textMuted,
    fontSize: fontSize.small,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  latestAttempt: {
    color: palette.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
  },
  badgeText: {
    color: palette.onAccent,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  // Guess pegs on the left, the scoring grid on the right, like a physical board row.
  board: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pegs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  score: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
  },
  scoreText: {
    color: palette.textMuted,
    fontSize: fontSize.caption,
  },
});
