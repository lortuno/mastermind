import { Pressable, StyleSheet, Text } from 'react-native';
import { MIN_TOUCH_TARGET, fontSize, palette, radius, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  isDisabled?: boolean;
};

export default function Button({ label, onPress, variant = 'primary', isDisabled = false }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        isDisabled && (isPrimary ? styles.primaryDisabled : styles.secondaryDisabled),
      ]}
    >
      <Text style={[styles.label, isPrimary && styles.primaryLabel, isDisabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET + spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Physical "lip" that compresses on press.
    borderBottomWidth: 3,
  },
  primary: {
    backgroundColor: palette.accent,
    borderBottomColor: 'rgba(0, 0, 0, 0.35)',
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: palette.borderStrong,
  },
  pressed: {
    borderBottomWidth: 1,
    transform: [{ translateY: 2 }],
  },
  // Disabled buttons drop the lip and fill instead of fading text below 4.5:1.
  primaryDisabled: {
    backgroundColor: palette.border,
    borderBottomWidth: 0,
  },
  secondaryDisabled: {
    borderColor: palette.border,
    borderBottomWidth: 1,
  },
  label: {
    color: palette.text,
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  primaryLabel: {
    color: palette.onAccent,
  },
  disabledLabel: {
    color: palette.textMuted,
  },
});
