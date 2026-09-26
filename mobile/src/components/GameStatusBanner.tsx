import { StyleSheet, Text, View } from 'react-native';
import { findColor } from '../game/colors';
import { useIosAnnouncement } from '../hooks/useIosAnnouncement';
import { palette, radius, spacing } from '../theme';
import Button from './Button';
import Peg from './Peg';

type Props = {
  isWinner: boolean;
  secretCombination: string[];
  onPlayAgain: () => void;
};

export default function GameStatusBanner({ isWinner, secretCombination, onPlayAgain }: Props) {
  const secretLabel = secretCombination.map((letter) => findColor(letter)?.name ?? letter).join(', ');
  const outcome = isWinner ? 'You win!' : 'You lose.';
  useIosAnnouncement(`${outcome} The secret combination was ${secretLabel}.`);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { borderColor: isWinner ? palette.success : palette.danger }]}
    >
      <Text accessibilityRole="header" style={styles.message}>
        {outcome}
      </Text>
      <Text style={styles.label}>The secret combination was:</Text>
      <View accessible accessibilityLabel={`Secret combination: ${secretLabel}`} style={styles.secret}>
        {secretCombination.map((letter, position) => (
          <Peg key={position} letter={letter} size={40} />
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
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius,
    borderWidth: 2,
    backgroundColor: palette.surface,
  },
  message: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '800',
  },
  label: {
    color: palette.textMuted,
  },
  secret: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
});
