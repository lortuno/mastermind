import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, type ColorLetter } from '@mastermind/core';
import { MIN_TOUCH_TARGET, PEG_MAX_SIZE, fontSize, radius, spacing } from '../theme';

type Props = {
  onPick: (letter: ColorLetter) => void;
  isDisabled: boolean;
};

export default function ColorPalette({ onPick, isDisabled }: Props) {
  return (
    <View style={styles.palette}>
      {COLORS.map((color) => (
        <Pressable
          key={color.letter}
          accessibilityRole="button"
          accessibilityLabel={color.name}
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={() => onPick(color.letter)}
          style={({ pressed }) => [
            styles.swatch,
            { backgroundColor: color.hex },
            pressed && styles.pressed,
            isDisabled && styles.disabled,
          ]}
        >
          <Text style={[styles.letter, { color: color.textHex }]}>{color.letter}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  palette: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  // Swatches share the row and stay square: 44pt on a 320pt screen, up to 56pt.
  swatch: {
    flex: 1,
    aspectRatio: 1,
    minWidth: MIN_TOUCH_TARGET,
    maxWidth: PEG_MAX_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Keycap lip: the swatch visibly sinks when pressed.
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0, 0, 0, 0.35)',
  },
  pressed: {
    borderBottomWidth: 1,
    transform: [{ translateY: 3 }],
  },
  disabled: {
    opacity: 0.35,
    borderBottomWidth: 0,
  },
  letter: {
    fontSize: fontSize.title,
    fontWeight: '800',
  },
});
