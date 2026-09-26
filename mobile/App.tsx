import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createGameApi, type GameApi } from '@mastermind/core';
import { resolveApiBaseUrl } from './src/api/config';
import ErrorNotice from './src/components/ErrorNotice';
import GameScreen from './src/screens/GameScreen';
import { palette, spacing } from './src/theme';

// On a phone the usual culprits are the configured address and the host firewall.
const CONNECTION_HINT = 'Check your connection, firewall and EXPO_PUBLIC_API_URL.';

type ApiResult = { api: GameApi; error: null } | { api: null; error: string };

function buildApi(): ApiResult {
  try {
    // Must be read as a literal `process.env.EXPO_PUBLIC_*` so Metro can inline it.
    const baseUrl = resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);
    return { api: createGameApi(baseUrl, { connectionHint: CONNECTION_HINT }), error: null };
  } catch (err) {
    return { api: null, error: err instanceof Error ? err.message : 'Invalid API configuration.' };
  }
}

export default function App() {
  const [{ api, error }] = useState(buildApi);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {api ? (
        <GameScreen api={api} />
      ) : (
        <View style={styles.configError}>
          <ErrorNotice message={error} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  configError: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: palette.bg,
  },
});
