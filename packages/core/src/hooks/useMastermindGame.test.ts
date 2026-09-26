import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, type GameApi } from '../api/gameApi';
import type { GameState } from '../api/types';
import { useMastermindGame } from './useMastermindGame';

const DIFFICULTIES = [{ level: 2, name: 'Medium', width: 4, maxAttempts: 8 }];

function gameState(overrides: Partial<GameState> = {}): GameState {
  return {
    attemptNumber: 0,
    maxAttempts: 8,
    width: 4,
    difficultyName: 'Medium',
    isFinished: false,
    isWinner: false,
    isLoser: false,
    history: [],
    ...overrides,
  };
}

function createFakeApi(overrides: Partial<GameApi> = {}): GameApi {
  return {
    fetchDifficulties: vi.fn().mockResolvedValue({ difficulties: DIFFICULTIES }),
    fetchState: vi.fn().mockRejectedValue(new ApiError('No game in progress.', 400)),
    startGame: vi.fn().mockResolvedValue(gameState()),
    submitGuess: vi.fn().mockResolvedValue(gameState({ attemptNumber: 1 })),
    ...overrides,
  };
}

async function renderGame(api: GameApi) {
  const hook = renderHook(() => useMastermindGame(api));
  await waitFor(() => expect(hook.result.current.phase).not.toBe('loading'));
  return hook;
}

describe('useMastermindGame', () => {
  it('shows difficulty selection when the session has no game (HTTP 400 is not an error)', async () => {
    const { result } = await renderGame(createFakeApi());

    expect(result.current.phase).toBe('difficulty');
    expect(result.current.difficulties).toEqual(DIFFICULTIES);
    expect(result.current.error).toBeNull();
    expect(result.current.canRetryLoad).toBe(false);
  });

  it('resumes a game held in the session', async () => {
    const api = createFakeApi({ fetchState: vi.fn().mockResolvedValue(gameState({ attemptNumber: 3 })) });

    const { result } = await renderGame(api);

    expect(result.current.phase).toBe('playing');
    expect(result.current.board.guess).toEqual([null, null, null, null]);
  });

  it('surfaces a launch failure and recovers through retryLoad', async () => {
    const api = createFakeApi({
      fetchDifficulties: vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Could not reach the game server.', null))
        .mockResolvedValueOnce({ difficulties: DIFFICULTIES }),
      fetchState: vi.fn().mockRejectedValue(new ApiError('Server down.', 500)),
    });
    const { result } = await renderGame(api);

    expect(result.current.error).toBe('Server down.');
    expect(result.current.canRetryLoad).toBe(true);

    act(() => result.current.retryLoad());
    await waitFor(() => expect(result.current.difficulties).toEqual(DIFFICULTIES));
    expect(result.current.canRetryLoad).toBe(false);
  });

  it('builds a guess, locks the board while submitting, then resets it', async () => {
    let resolveGuess: (state: GameState) => void = () => {};
    const api = createFakeApi({
      submitGuess: vi.fn(() => new Promise<GameState>((resolve) => { resolveGuess = resolve; })),
    });
    const { result } = await renderGame(api);
    await act(() => result.current.selectDifficulty(2));

    act(() => {
      result.current.pickColor('R');
      result.current.pickColor('G');
      result.current.pickColor('B');
      result.current.pickColor('Y');
    });
    expect(result.current.canSubmit).toBe(true);

    let submitting: Promise<void> = Promise.resolve();
    act(() => { submitting = result.current.submitGuess(); });
    expect(api.submitGuess).toHaveBeenCalledWith('RGBY');
    expect(result.current.isBoardLocked).toBe(true);
    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      resolveGuess(gameState({ attemptNumber: 1 }));
      await submitting;
    });
    expect(result.current.isBoardLocked).toBe(false);
    expect(result.current.board.guess).toEqual([null, null, null, null]);
  });

  it('keeps the guess and reports the error when the server rejects it', async () => {
    const api = createFakeApi({ submitGuess: vi.fn().mockRejectedValue(new ApiError('Invalid combination.', 400)) });
    const { result } = await renderGame(api);
    await act(() => result.current.selectDifficulty(2));
    act(() => (['R', 'G', 'B', 'Y'] as const).forEach((letter) => result.current.pickColor(letter)));

    await act(() => result.current.submitGuess());

    expect(result.current.error).toBe('Invalid combination.');
    expect(result.current.board.guess).toEqual(['R', 'G', 'B', 'Y']);
  });

  it('does not submit an incomplete guess', async () => {
    const api = createFakeApi();
    const { result } = await renderGame(api);
    await act(() => result.current.selectDifficulty(2));

    await act(() => result.current.submitGuess());

    expect(api.submitGuess).not.toHaveBeenCalled();
  });

  it('locks the board when finished and returns to difficulty selection on playAgain', async () => {
    const api = createFakeApi({
      fetchState: vi.fn().mockResolvedValue(gameState({ isFinished: true, isWinner: true, secretCombination: ['R'] })),
    });
    const { result } = await renderGame(api);

    expect(result.current.phase).toBe('finished');
    expect(result.current.isBoardLocked).toBe(true);

    act(() => result.current.playAgain());
    expect(result.current.phase).toBe('difficulty');
    expect(result.current.gameState).toBeNull();
  });

  it('lets the player re-select a slot and clear the guess', async () => {
    const { result } = await renderGame(createFakeApi());
    await act(() => result.current.selectDifficulty(2));

    act(() => {
      result.current.pickColor('R');
      result.current.selectSlot(0);
      result.current.pickColor('P');
    });
    expect(result.current.board.guess).toEqual(['P', null, null, null]);

    act(() => result.current.clearGuess());
    expect(result.current.board).toEqual({ guess: [null, null, null, null], activeSlot: 0 });
  });
});
