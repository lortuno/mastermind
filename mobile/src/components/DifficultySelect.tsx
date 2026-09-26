import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Difficulty } from '../api/types';
import { MIN_TOUCH_TARGET, palette, radius, spacing } from '../theme';

type Props = {
  difficulties: Difficulty[];
  onSelect: (level: number) => void;
  isSubmitting: boolean;
};

export default function DifficultySelect({ difficulties, onSelect, isSubmitting }: Props) {
  return (
    <View style={styles.list}>
      {difficulties.map((difficulty) => {
        const meta = `${difficulty.width} positions, ${difficulty.maxAttempts} attempts`;
        return (
          <Pressable
            key={difficulty.level}
            accessibilityRole="button"
            accessibilityLabel={`${difficulty.name}, ${meta}`}
            accessibilityState={{ disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={() => onSelect(difficulty.level)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed, isSubmitting && styles.disabled]}
          >
            <Text style={styles.name}>{difficulty.name}</Text>
            <Text style={styles.meta}>
              {difficulty.width} positions · {difficulty.maxAttempts} attempts
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  option: {
    minHeight: MIN_TOUCH_TARGET,
    padding: spacing.lg,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  pressed: {
    borderColor: palette.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  name: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
