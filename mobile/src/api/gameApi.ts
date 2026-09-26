import type { Difficulty, GameState } from './types';

export type GameApi = {
  fetchDifficulties: () => Promise<{ difficulties: Difficulty[] }>;
  fetchState: () => Promise<GameState>;
  startGame: (difficultyLevel: number) => Promise<GameState>;
  submitGuess: (combination: string) => Promise<GameState>;
};

export const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  readonly name = 'ApiError';

  // HTTP status of the failed response; null when the server was never reached.
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
};

function errorMessageFrom(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }
  return 'Unexpected error.';
}

export function createGameApi(baseUrl: string, fetchImpl: typeof fetch = fetch): GameApi {
  async function request<T>(action: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
    // A host that silently drops packets (e.g. a firewall) would otherwise hang
    // for the OS default (~60 s on iOS) with only a spinner on screen.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}/index.php?action=${action}`, {
        method,
        // Native cookie stores (NSHTTPCookieStorage / OkHttp) keep PHPSESSID.
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch {
      // Naming the URL lets the player tell a wrong EXPO_PUBLIC_API_URL from a blocked port.
      const reason = controller.signal.aborted
        ? `The game server at ${baseUrl} did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`
        : `Could not reach the game server at ${baseUrl}.`;
      throw new ApiError(`${reason} Check your connection, firewall and EXPO_PUBLIC_API_URL.`, null);
    } finally {
      clearTimeout(timeoutId);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiError('Unexpected response from the game server.', response.status);
    }

    if (!response.ok) {
      throw new ApiError(errorMessageFrom(data), response.status);
    }
    return data as T;
  }

  return {
    fetchDifficulties: () => request('difficulties'),
    fetchState: () => request('state'),
    startGame: (difficultyLevel) => request('start', { method: 'POST', body: { difficulty: difficultyLevel } }),
    submitGuess: (combination) => request('guess', { method: 'POST', body: { combination } }),
  };
}
