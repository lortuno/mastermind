import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, type ColorLetter } from '../game/colors';
import { PEG_SIZE, spacing } from '../theme';

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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  swatch: {
    width: PEG_SIZE,
    height: PEG_SIZE,
    borderRadius: PEG_SIZE / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  disabled: {
    opacity: 0.35,
  },
  letter: {
    fontSize: 18,
    fontWeight: '700',
  },
});
