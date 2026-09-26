import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { ApiError, type GameApi } from '../../api/gameApi';
import type { Difficulty, GameState } from '../../api/types';
import GameScreen from '../GameScreen';

const DIFFICULTIES: Difficulty[] = [
  { level: 1, name: 'Easy', width: 3, maxAttempts: 10 },
  { level: 2, name: 'Medium', width: 4, maxAttempts: 8 },
];

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

function createFakeApi(overrides: Partial<GameApi> = {}): jest.Mocked<GameApi> {
  return {
    fetchDifficulties: jest.fn().mockResolvedValue({ difficulties: DIFFICULTIES }),
    fetchState: jest.fn().mockRejectedValue(new ApiError('No game in progress.', 400)),
    startGame: jest.fn().mockResolvedValue(gameState()),
    submitGuess: jest.fn(),
    ...overrides,
  } as jest.Mocked<GameApi>;
}

const THREE_ATTEMPTS = [
  { attempt: 1, combination: 'RRGG', black: 0, white: 1 },
  { attempt: 2, combination: 'BBYY', black: 1, white: 0 },
  { attempt: 3, combination: 'PPRG', black: 2, white: 1 },
];

// Attempt numbers and "Latest" badges in on-screen order, e.g. ['#3', 'Latest', '#2', '#1'].
function attemptLogMarkers(): string[] {
  const log = screen.getByLabelText('Submitted guesses');
  return within(log)
    .getAllByText(/^(#\d+|Latest)$/)
    .map((node) => [node.props.children].flat().join(''));
}

async function pickColors(names: string[]) {
  for (const name of names) {
    await fireEvent.press(screen.getByRole('button', { name }));
  }
}

async function startMediumGame(api: GameApi) {
  await render(<GameScreen api={api} />);
  await fireEvent.press(await screen.findByRole('button', { name: /^Medium/ }));
  await screen.findByRole('button', { name: 'Position 1, empty' });
}

describe('GameScreen', () => {
  it('shows every server difficulty when no game is in progress', async () => {
    const api = createFakeApi();

    await render(<GameScreen api={api} />);

    expect(await screen.findByRole('button', { name: 'Easy, 3 positions, 10 attempts' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Medium, 4 positions, 8 attempts' })).toBeOnTheScreen();
  });

  it('resumes a game held in the server session instead of asking for a difficulty', async () => {
    const api = createFakeApi({
      fetchState: jest.fn().mockResolvedValue(
        gameState({ attemptNumber: 1, history: [{ attempt: 1, combination: 'RGBY', black: 1, white: 2 }] }),
      ),
    });

    await render(<GameScreen api={api} />);

    expect(await screen.findByText('Attempt 1 of 8')).toBeOnTheScreen();
    expect(screen.getByText('Medium')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /^Easy/ })).toBeNull();
    expect(screen.getByText('2 right position')).toBeOnTheScreen();
  });

  it('starts a game on the chosen difficulty with one slot per position', async () => {
    const api = createFakeApi();

    await startMediumGame(api);

    expect(api.startGame).toHaveBeenCalledWith(2);
    expect(screen.getAllByRole('button', { name: /^Position \d, empty$/ })).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Submit guess' })).toBeDisabled();
  });

  it('fills slots left to right, lets the player re-select a slot, and clears the board', async () => {
    const api = createFakeApi();
    await startMediumGame(api);

    await pickColors(['Red', 'Green']);
    expect(screen.getByRole('button', { name: 'Position 1, Red' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Position 2, Green' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Position 1, Red' }));
    await pickColors(['Blue']);
    expect(screen.getByRole('button', { name: 'Position 1, Blue' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getAllByRole('button', { name: /^Position \d, empty$/ })).toHaveLength(4);
  });

  it('submits a complete guess and appends the scored attempt to the log', async () => {
    const api = createFakeApi({
      submitGuess: jest.fn().mockResolvedValue(
        gameState({ attemptNumber: 1, history: [{ attempt: 1, combination: 'RGBY', black: 1, white: 2 }] }),
      ),
    });
    await startMediumGame(api);

    await pickColors(['Red', 'Green', 'Blue', 'Yellow']);
    const submit = screen.getByRole('button', { name: 'Submit guess' });
    expect(submit).toBeEnabled();
    await fireEvent.press(submit);

    expect(api.submitGuess).toHaveBeenCalledWith('RGBY');
    expect(await screen.findByText('Attempt 1 of 8')).toBeOnTheScreen();
    const log = screen.getByLabelText('Submitted guesses');
    expect(within(log).getByText('2 right position')).toBeOnTheScreen();
    expect(within(log).getByText('1 right color, wrong position')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: /^Position \d, empty$/ })).toHaveLength(4);
  });

  it('shows the server rejection as an alert and keeps the board and log unchanged', async () => {
    const api = createFakeApi({
      submitGuess: jest.fn().mockRejectedValue(new ApiError('Invalid combination.', 400)),
    });
    await startMediumGame(api);

    await pickColors(['Red', 'Green', 'Blue', 'Yellow']);
    await fireEvent.press(screen.getByRole('button', { name: 'Submit guess' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid combination.');
    expect(screen.getByRole('button', { name: 'Position 4, Yellow' })).toBeOnTheScreen();
    expect(screen.getByText('No guesses submitted yet.')).toBeOnTheScreen();
  });

  it('locks the board and reveals the secret when the game is won, then returns to difficulty selection', async () => {
    const api = createFakeApi({
      submitGuess: jest.fn().mockResolvedValue(
        gameState({
          attemptNumber: 1,
          isFinished: true,
          isWinner: true,
          secretCombination: ['R', 'G', 'B', 'Y'],
          history: [{ attempt: 1, combination: 'RGBY', black: 0, white: 4 }],
        }),
      ),
    });
    await startMediumGame(api);

    await pickColors(['Red', 'Green', 'Blue', 'Yellow']);
    await fireEvent.press(screen.getByRole('button', { name: 'Submit guess' }));

    expect(await screen.findByText('You win!')).toBeOnTheScreen();
    expect(screen.getByLabelText('Secret combination: Red, Green, Blue, Yellow')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Submit guess' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Red' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Play again' }));
    expect(await screen.findByRole('button', { name: /^Easy/ })).toBeOnTheScreen();
  });

  it('shows a loss banner when attempts run out', async () => {
    const api = createFakeApi({
      fetchState: jest.fn().mockResolvedValue(
        gameState({ attemptNumber: 8, isFinished: true, isLoser: true, secretCombination: ['P', 'P', 'G', 'R'] }),
      ),
    });

    await render(<GameScreen api={api} />);

    expect(await screen.findByText('You lose.')).toBeOnTheScreen();
  });

  it('surfaces a state failure that is not "no game" (e.g. network or 5xx) instead of hiding it', async () => {
    const api = createFakeApi({
      fetchState: jest.fn().mockRejectedValue(new ApiError('Could not reach the game server.', null)),
    });

    await render(<GameScreen api={api} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the game server.');
    expect(screen.getByRole('button', { name: /^Easy/ })).toBeOnTheScreen();
  });

  it('locks the board while a guess is being submitted so no input is silently discarded', async () => {
    let resolveGuess: (state: GameState) => void = () => {};
    const api = createFakeApi({
      submitGuess: jest.fn(() => new Promise<GameState>((resolve) => { resolveGuess = resolve; })),
    });
    await startMediumGame(api);

    await pickColors(['Red', 'Green', 'Blue', 'Yellow']);
    // Not awaited: the press handler's promise stays pending until resolveGuess() below.
    const pendingPress = fireEvent.press(screen.getByRole('button', { name: 'Submit guess' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Red' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Position 1, Red' })).toBeDisabled();

    resolveGuess(gameState({ attemptNumber: 1 }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Red' })).toBeEnabled());
    await pendingPress;
  });

  it('announces errors and the game outcome to screen readers on iOS', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const api = createFakeApi({
      submitGuess: jest
        .fn()
        .mockRejectedValueOnce(new ApiError('Invalid combination.', 400))
        .mockResolvedValueOnce(gameState({ isFinished: true, isWinner: true, secretCombination: ['R', 'G', 'B', 'Y'] })),
    });
    await startMediumGame(api);
    await pickColors(['Red', 'Green', 'Blue', 'Yellow']);

    await fireEvent.press(screen.getByRole('button', { name: 'Submit guess' }));
    await screen.findByRole('alert');
    await fireEvent.press(screen.getByRole('button', { name: 'Submit guess' }));
    await screen.findByText('You win!');

    expect(announce).toHaveBeenCalledWith('Invalid combination.');
    expect(announce).toHaveBeenCalledWith('You win! The secret combination was Red, Green, Blue, Yellow.');
    announce.mockRestore();
  });

  it('lets the player retry loading after the server was unreachable', async () => {
    const api = createFakeApi({
      fetchDifficulties: jest
        .fn()
        .mockRejectedValueOnce(new ApiError('Could not reach the game server.', null))
        .mockResolvedValueOnce({ difficulties: DIFFICULTIES }),
    });
    await render(<GameScreen api={api} />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('button', { name: /^Easy/ })).toBeOnTheScreen();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(api.fetchState).toHaveBeenCalledTimes(2);
  });

  it('shows an alert when the difficulties cannot be loaded', async () => {
    const api = createFakeApi({
      fetchDifficulties: jest.fn().mockRejectedValue(new ApiError('Could not reach the game server.', null)),
    });

    await render(<GameScreen api={api} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the game server.');
  });

  describe('attempt log order', () => {
    it('lists attempts newest first and marks only the newest one as latest', async () => {
      const history = [...THREE_ATTEMPTS];
      const api = createFakeApi({
        fetchState: jest.fn().mockResolvedValue(gameState({ attemptNumber: 3, history })),
      });

      await render(<GameScreen api={api} />);
      await screen.findByText('Attempt 3 of 8');

      expect(attemptLogMarkers()).toEqual(['#3', 'Latest', '#2', '#1']);
      expect(screen.getAllByText('Latest')).toHaveLength(1);
      // Display-only reversal: the server's oldest-first array is not mutated.
      expect(history.map((entry) => entry.attempt)).toEqual([1, 2, 3]);
    });

    it('puts a newly submitted attempt at the top of the log', async () => {
      const api = createFakeApi({
        fetchState: jest.fn().mockResolvedValue(gameState({ attemptNumber: 2, history: THREE_ATTEMPTS.slice(0, 2) })),
        submitGuess: jest.fn().mockResolvedValue(gameState({ attemptNumber: 3, history: THREE_ATTEMPTS })),
      });
      await render(<GameScreen api={api} />);
      await screen.findByText('Attempt 2 of 8');
      expect(attemptLogMarkers()).toEqual(['#2', 'Latest', '#1']);

      await pickColors(['Purple', 'Purple', 'Red', 'Green']);
      await fireEvent.press(screen.getByRole('button', { name: 'Submit guess' }));

      await screen.findByText('Attempt 3 of 8');
      expect(attemptLogMarkers()).toEqual(['#3', 'Latest', '#2', '#1']);
    });
  });
});
