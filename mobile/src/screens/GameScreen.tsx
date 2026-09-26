import { useMastermindGame, type GameApi } from '@mastermind/core';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import ColorPalette from '../components/ColorPalette';
import DifficultySelect from '../components/DifficultySelect';
import ErrorNotice from '../components/ErrorNotice';
import GameHeader from '../components/GameHeader';
import GameStatusBanner from '../components/GameStatusBanner';
import GuessBoard from '../components/GuessBoard';
import GuessHistory from '../components/GuessHistory';
import { RAISED_SHADOW, fontSize, palette, radius, spacing } from '../theme';

type Props = {
  api: GameApi;
};

export default function GameScreen({ api }: Props) {
  const game = useMastermindGame(api);
  const { phase, gameState } = game;
  const isFinished = phase === 'finished';
  const isBoardVisible = (phase === 'playing' || isFinished) && gameState !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          Mastermind
        </Text>

        {game.error && <ErrorNotice message={game.error} />}

        {phase === 'loading' && <ActivityIndicator accessibilityLabel="Loading" color={palette.accent} size="large" />}

        {phase === 'difficulty' && (
          <>
            <Text style={styles.hint}>Choose a difficulty to start a new game.</Text>
            <DifficultySelect
              difficulties={game.difficulties}
              onSelect={game.selectDifficulty}
              isSubmitting={game.isSubmitting}
            />
            {game.canRetryLoad && (
              <View style={styles.actions}>
                <Button label="Retry" onPress={game.retryLoad} />
              </View>
            )}
          </>
        )}

        {isBoardVisible && (
          <>
            <GameHeader
              difficultyName={gameState.difficultyName}
              attemptNumber={gameState.attemptNumber}
              maxAttempts={gameState.maxAttempts}
            />

            <View style={styles.tray}>
              <Text style={styles.overline}>Your guess</Text>
              <GuessBoard
                guess={game.board.guess}
                activeSlot={game.board.activeSlot}
                onSlotSelect={game.selectSlot}
                isDisabled={game.isBoardLocked}
              />
              <ColorPalette onPick={game.pickColor} isDisabled={game.isBoardLocked} />
              <View style={styles.actions}>
                <Button label="Clear" variant="secondary" onPress={game.clearGuess} isDisabled={game.isBoardLocked} />
                <Button label="Submit guess" onPress={game.submitGuess} isDisabled={!game.canSubmit} />
              </View>
            </View>

            {isFinished && (
              <GameStatusBanner
                isWinner={gameState.isWinner}
                secretCombination={gameState.secretCombination ?? []}
                onPlayAgain={game.playAgain}
              />
            )}

            <View style={styles.history}>
              <View style={styles.sectionHeader}>
                <Text accessibilityRole="header" style={styles.subtitle}>
                  Attempts
                </Text>
                <Text style={styles.sectionHint}>Newest first</Text>
              </View>
              <GuessHistory history={gameState.history} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    gap: spacing.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: palette.text,
    fontSize: fontSize.display,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    color: palette.textMuted,
    fontSize: fontSize.body,
  },
  // The raised board tray: slots, palette, and actions form one physical panel.
  // Padding is `md` so five 44pt slots still fit on a 320pt-wide screen.
  tray: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surfaceRaised,
    boxShadow: RAISED_SHADOW,
  },
  overline: {
    color: palette.textMuted,
    fontSize: fontSize.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: -spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  history: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  subtitle: {
    color: palette.text,
    fontSize: fontSize.title,
    fontWeight: '800',
  },
  sectionHint: {
    color: palette.textMuted,
    fontSize: fontSize.caption,
  },
});
