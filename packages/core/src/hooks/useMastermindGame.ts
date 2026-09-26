import { useEffect, useState } from 'react';
import { ApiError, type GameApi } from '../api/gameApi';
import type { Difficulty, GameState } from '../api/types';
import type { ColorLetter } from '../game/colors';
import { emptyGuess, isGuessComplete, placeColor, type GuessBoardState } from '../game/guess';

export type Phase = 'loading' | 'difficulty' | 'playing' | 'finished';

const EMPTY_BOARD: GuessBoardState = { guess: [], activeSlot: 0 };

function freshBoard(width: number): GuessBoardState {
  return { guess: emptyGuess(width), activeSlot: 0 };
}

const HTTP_BAD_REQUEST = 400;

function isNoActiveGame(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_BAD_REQUEST;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error.';
}

export function useMastermindGame(api: GameApi) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [board, setBoard] = useState<GuessBoardState>(EMPTY_BOARD);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  function applyState(state: GameState) {
    setGameState(state);
    setBoard(freshBoard(state.width));
    setPhase(state.isFinished ? 'finished' : 'playing');
  }

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      const [difficultiesResult, stateResult] = await Promise.allSettled([
        api.fetchDifficulties(),
        api.fetchState(),
      ]);
      if (!isActive) {
        return;
      }

      if (difficultiesResult.status === 'fulfilled') {
        setDifficulties(difficultiesResult.value.difficulties);
      } else {
        setError(messageOf(difficultiesResult.reason));
      }

      if (stateResult.status === 'fulfilled') {
        applyState(stateResult.value);
        return;
      }
      // HTTP 400 from `state` means "no game in the session" — expected, not an error.
      // Anything else (network failure, 5xx) is surfaced.
      if (!isNoActiveGame(stateResult.reason)) {
        setError(messageOf(stateResult.reason));
      }
      setPhase('difficulty');
    }

    bootstrap();
    return () => {
      isActive = false;
    };
  }, [api, loadAttempt]);

  // Re-runs the launch requests, e.g. after the server was unreachable.
  function retryLoad() {
    setError(null);
    setPhase('loading');
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function runRequest(action: () => Promise<GameState>) {
    setError(null);
    setIsSubmitting(true);
    try {
      applyState(await action());
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectDifficulty(level: number) {
    return runRequest(() => api.startGame(level));
  }

  function submitGuess() {
    if (!isGuessComplete(board.guess)) {
      return Promise.resolve();
    }
    return runRequest(() => api.submitGuess(board.guess.join('')));
  }

  function pickColor(letter: ColorLetter) {
    setBoard((current) => placeColor(current, letter));
  }

  function selectSlot(position: number) {
    setBoard((current) => ({ ...current, activeSlot: position }));
  }

  function clearGuess() {
    setBoard((current) => freshBoard(current.guess.length));
  }

  function playAgain() {
    setGameState(null);
    setBoard(EMPTY_BOARD);
    setError(null);
    setPhase('difficulty');
  }

  const isFinished = phase === 'finished';

  return {
    // Locked while a request is in flight so edits are not wiped by the response.
    isBoardLocked: isFinished || isSubmitting,
    phase,
    difficulties,
    gameState,
    board,
    error,
    isSubmitting,
    canSubmit: isGuessComplete(board.guess) && !isFinished && !isSubmitting,
    // Nothing to pick from: the launch requests failed, so offer a retry.
    canRetryLoad: phase === 'difficulty' && difficulties.length === 0,
    retryLoad,
    selectDifficulty,
    submitGuess,
    pickColor,
    selectSlot,
    clearGuess,
    playAgain,
  };
}
