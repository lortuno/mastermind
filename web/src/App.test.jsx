import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@mastermind/core';
import { describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

const DIFFICULTIES = [
  { level: 1, name: 'Easy', width: 3, maxAttempts: 10 },
  { level: 2, name: 'Medium', width: 4, maxAttempts: 8 },
];

function gameState(overrides = {}) {
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

function createFakeApi(overrides = {}) {
  return {
    fetchDifficulties: vi.fn().mockResolvedValue({ difficulties: DIFFICULTIES }),
    fetchState: vi.fn().mockRejectedValue(new ApiError('No game in progress.', 400)),
    startGame: vi.fn().mockResolvedValue(gameState()),
    submitGuess: vi.fn(),
    ...overrides,
  };
}

async function startMediumGame(user, api) {
  render(<App api={api} />);
  await user.click(await screen.findByRole('button', { name: /Medium/ }));
  await screen.findByRole('button', { name: 'Position 1, empty' });
}

async function pickColors(user, names) {
  for (const name of names) {
    await user.click(screen.getByRole('button', { name }));
  }
}

describe('App', () => {
  it('starts a game on the chosen difficulty through the shared game hook', async () => {
    const user = userEvent.setup();
    const api = createFakeApi();

    await startMediumGame(user, api);

    expect(api.startGame).toHaveBeenCalledWith(2);
    expect(screen.getAllByRole('button', { name: /^Position \d, empty$/ })).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Submit guess' })).toBeDisabled();
  });

  it('locks the board while a guess is being submitted', async () => {
    const user = userEvent.setup();
    let resolveGuess = () => {};
    const api = createFakeApi({
      submitGuess: vi.fn(() => new Promise((resolve) => { resolveGuess = resolve; })),
    });
    await startMediumGame(user, api);
    await pickColors(user, ['Red', 'Green', 'Blue', 'Yellow']);

    await user.click(screen.getByRole('button', { name: 'Submit guess' }));

    expect(api.submitGuess).toHaveBeenCalledWith('RGBY');
    expect(screen.getByRole('button', { name: 'Red' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Position 1, Red' })).toBeDisabled();

    resolveGuess(gameState({ attemptNumber: 1, history: [{ attempt: 1, combination: 'RGBY', black: 1, white: 2 }] }));
    expect(await screen.findByText('2 right position')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Red' })).toBeEnabled();
  });

  it('shows a rejected guess as an alert and keeps the board', async () => {
    const user = userEvent.setup();
    const api = createFakeApi({ submitGuess: vi.fn().mockRejectedValue(new ApiError('Invalid combination.', 400)) });
    await startMediumGame(user, api);
    await pickColors(user, ['Red', 'Green', 'Blue', 'Yellow']);

    await user.click(screen.getByRole('button', { name: 'Submit guess' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid combination.');
    expect(screen.getByRole('button', { name: 'Position 4, Yellow' })).toBeInTheDocument();
  });

  it('surfaces an unreachable server and recovers with Retry', async () => {
    const user = userEvent.setup();
    const api = createFakeApi({
      fetchDifficulties: vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Could not reach the game server. Check your connection.', null))
        .mockResolvedValueOnce({ difficulties: DIFFICULTIES }),
    });
    render(<App api={api} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the game server.');
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('button', { name: /Easy/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reveals the secret and returns to difficulty selection after the game ends', async () => {
    const user = userEvent.setup();
    const api = createFakeApi({
      fetchState: vi.fn().mockResolvedValue(
        gameState({ attemptNumber: 8, isFinished: true, isLoser: true, secretCombination: ['P', 'P', 'G', 'R'] }),
      ),
    });
    render(<App api={api} />);

    expect(await screen.findByText('You lose.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit guess' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Play again' }));
    expect(await screen.findByRole('button', { name: /Easy/ })).toBeInTheDocument();
  });
});
