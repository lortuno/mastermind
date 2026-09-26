import { describeCombination } from '@mastermind/core';
import { StyleSheet, Text, View } from 'react-native';
import { useIosAnnouncement } from '../hooks/useIosAnnouncement';
import { RAISED_SHADOW, fontSize, palette, radius, spacing } from '../theme';
import Button from './Button';
import Peg from './Peg';

type Props = {
  isWinner: boolean;
  secretCombination: string[];
  onPlayAgain: () => void;
};

// Five of these plus gaps still fit the banner on a 320pt-wide screen.
const SECRET_PEG_SIZE = 36;

export default function GameStatusBanner({ isWinner, secretCombination, onPlayAgain }: Props) {
  const secretLabel = describeCombination(secretCombination);
  const outcome = isWinner ? 'You win!' : 'You lose.';
  const tagline = isWinner ? 'Code cracked' : 'Out of attempts';
  useIosAnnouncement(`${outcome} The secret combination was ${secretLabel}.`);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { borderColor: isWinner ? palette.success : palette.danger }]}
    >
      <Text style={styles.tagline}>{tagline}</Text>
      <Text accessibilityRole="header" style={styles.message}>
        {outcome}
      </Text>
      <Text style={styles.label}>The secret combination was:</Text>
      {/* The revealed code sits in a sunken shield, like the hidden row of a real board. */}
      <View accessible accessibilityLabel={`Secret combination: ${secretLabel}`} style={styles.secret}>
        {secretCombination.map((letter, position) => (
          <Peg key={position} letter={letter} size={SECRET_PEG_SIZE} />
        ))}
      </View>
      <View style={styles.action}>
        <Button label="Play again" onPress={onPlayAgain} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    backgroundColor: palette.surfaceRaised,
    boxShadow: RAISED_SHADOW,
  },
  tagline: {
    color: palette.textMuted,
    fontSize: fontSize.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  message: {
    color: palette.text,
    fontSize: fontSize.display,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    color: palette.textMuted,
    fontSize: fontSize.small,
    marginTop: spacing.sm,
  },
  secret: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceSunken,
    borderWidth: 1,
    borderColor: palette.border,
  },
  action: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
