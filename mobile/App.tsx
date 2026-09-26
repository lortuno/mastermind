import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { resolveApiBaseUrl } from './src/api/config';
import { createGameApi, type GameApi } from './src/api/gameApi';
import ErrorNotice from './src/components/ErrorNotice';
import GameScreen from './src/screens/GameScreen';
import { palette, spacing } from './src/theme';

type ApiResult = { api: GameApi; error: null } | { api: null; error: string };

function buildApi(): ApiResult {
  try {
    // Must be read as a literal `process.env.EXPO_PUBLIC_*` so Metro can inline it.
    return { api: createGameApi(resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_URL)), error: null };
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
