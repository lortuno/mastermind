import { StyleSheet, Text, View } from 'react-native';
import { useIosAnnouncement } from '../hooks/useIosAnnouncement';
import { fontSize, palette, radius, spacing } from '../theme';

type Props = {
  message: string;
};

export default function ErrorNotice({ message }: Props) {
  useIosAnnouncement(message);

  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.notice}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: palette.border,
    borderLeftColor: palette.danger,
    backgroundColor: palette.surfaceRaised,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: {
    color: palette.text,
    fontSize: fontSize.small,
    lineHeight: 20,
  },
});
