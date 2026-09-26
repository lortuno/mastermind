import { StyleSheet, Text, View } from 'react-native';
import { useIosAnnouncement } from '../hooks/useIosAnnouncement';
import { palette, radius, spacing } from '../theme';

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
    borderLeftWidth: 4,
    borderLeftColor: palette.danger,
    backgroundColor: palette.surface,
    borderRadius: radius,
    padding: spacing.md,
  },
  text: {
    color: palette.text,
    fontSize: 15,
  },
});
