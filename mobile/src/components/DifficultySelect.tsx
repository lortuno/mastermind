import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Difficulty } from '@mastermind/core';
import { MIN_TOUCH_TARGET, RAISED_SHADOW, fontSize, palette, radius, spacing } from '../theme';

type Props = {
  difficulties: Difficulty[];
  onSelect: (level: number) => void;
  isSubmitting: boolean;
};

const PREVIEW_HOLE_SIZE = 14;

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
            <View style={styles.text}>
              <Text style={styles.name}>{difficulty.name}</Text>
              <Text style={styles.meta}>
                {difficulty.width} positions · {difficulty.maxAttempts} attempts
              </Text>
            </View>
            {/* Decorative preview of the board row this level plays on. */}
            <View style={styles.preview}>
              {Array.from({ length: difficulty.width }, (_, index) => (
                <View key={index} style={styles.hole} />
              ))}
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: palette.borderStrong,
    borderBottomColor: palette.surfaceSunken,
    backgroundColor: palette.surfaceRaised,
    boxShadow: RAISED_SHADOW,
  },
  pressed: {
    borderColor: palette.accent,
    borderBottomWidth: 1,
    transform: [{ translateY: 3 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: palette.text,
    fontSize: fontSize.title,
    fontWeight: '800',
  },
  meta: {
    color: palette.textMuted,
    fontSize: fontSize.small,
  },
  preview: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceSunken,
  },
  hole: {
    width: PREVIEW_HOLE_SIZE,
    height: PREVIEW_HOLE_SIZE,
    borderRadius: PREVIEW_HOLE_SIZE / 2,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
});
