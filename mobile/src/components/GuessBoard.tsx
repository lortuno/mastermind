import { Pressable, StyleSheet, Text, View } from 'react-native';
import { findColor, type Guess } from '@mastermind/core';
import { MIN_TOUCH_TARGET, PEG_MAX_SIZE, fontSize, palette, radius, spacing } from '../theme';

type Props = {
  guess: Guess;
  activeSlot: number;
  onSlotSelect: (position: number) => void;
  isDisabled: boolean;
};

export default function GuessBoard({ guess, activeSlot, onSlotSelect, isDisabled }: Props) {
  return (
    <View style={styles.well}>
      {guess.map((letter, position) => {
        const color = findColor(letter);
        const isActive = position === activeSlot && !isDisabled;
        return (
          <View key={position} style={styles.column}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Position ${position + 1}, ${color ? color.name : 'empty'}`}
              accessibilityState={{ selected: isActive, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => onSlotSelect(position)}
              style={({ pressed }) => [
                styles.slot,
                color && { backgroundColor: color.hex, borderColor: color.hex },
                isActive && styles.active,
                pressed && styles.pressed,
              ]}
            >
              {color && <Text style={[styles.letter, { color: color.textHex }]}>{color.letter}</Text>}
            </Pressable>
            {/* Shape cue under the active slot, so "active" is not carried by the ring color alone. */}
            <View style={[styles.marker, isActive && styles.markerActive]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // A groove carved into the tray that holds the guess pegs.
  well: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: palette.surfaceSunken,
    borderWidth: 1,
    borderColor: palette.border,
  },
  column: {
    flex: 1,
    minWidth: MIN_TOUCH_TARGET,
    maxWidth: PEG_MAX_SIZE,
    alignItems: 'center',
    gap: spacing.sm,
  },
  slot: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    borderColor: palette.accent,
    borderWidth: 3,
    transform: [{ scale: 1.06 }],
  },
  pressed: {
    opacity: 0.85,
  },
  marker: {
    width: '45%',
    height: 4,
    borderRadius: radius.pill,
  },
  markerActive: {
    backgroundColor: palette.accent,
  },
  letter: {
    fontSize: fontSize.title,
    fontWeight: '800',
  },
});
