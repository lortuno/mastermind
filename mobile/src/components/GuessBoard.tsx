import { Pressable, StyleSheet, Text, View } from 'react-native';
import { findColor } from '../game/colors';
import type { Guess } from '../game/guess';
import { PEG_SIZE, palette, spacing } from '../theme';

type Props = {
  guess: Guess;
  activeSlot: number;
  onSlotSelect: (position: number) => void;
  isDisabled: boolean;
};

export default function GuessBoard({ guess, activeSlot, onSlotSelect, isDisabled }: Props) {
  return (
    <View style={styles.board}>
      {guess.map((letter, position) => {
        const color = findColor(letter);
        const isActive = position === activeSlot && !isDisabled;
        return (
          <Pressable
            key={position}
            accessibilityRole="button"
            accessibilityLabel={`Position ${position + 1}, ${color ? color.name : 'empty'}`}
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={() => onSlotSelect(position)}
            style={[
              styles.slot,
              color && { backgroundColor: color.hex, borderStyle: 'solid', borderColor: color.hex },
              isActive && styles.active,
            ]}
          >
            {color && <Text style={[styles.letter, { color: color.textHex }]}>{color.letter}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  slot: {
    width: PEG_SIZE,
    height: PEG_SIZE,
    borderRadius: PEG_SIZE / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    borderColor: palette.text,
    borderStyle: 'solid',
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  letter: {
    fontSize: 20,
    fontWeight: '700',
  },
});
