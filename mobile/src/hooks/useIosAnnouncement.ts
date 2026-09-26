import { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Announces `message` to VoiceOver whenever it changes. Android/TalkBack is
 * covered by `accessibilityLiveRegion` on the rendering view; iOS has no
 * live-region equivalent, so announcing there too would only double up on Android.
 */
export function useIosAnnouncement(message: string) {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);
}
