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
  readonly status: number | null;

  // A plain field instead of a parameter property keeps this file runnable by
  // Node's built-in type stripping (no TypeScript-only emit).
  constructor(message: string, status: number | null) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function errorMessageFrom(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }
  return 'Unexpected error.';
}

export type GameApiOptions = {
  fetchImpl?: typeof fetch;
  // Appended to network/timeout errors, e.g. where to fix the server address.
  connectionHint?: string;
};

/**
 * @param baseUrl Server origin such as "http://192.168.1.20", or "" for
 *   same-origin requests (the web client served by the PHP app).
 */
export function createGameApi(
  baseUrl: string,
  { fetchImpl = fetch, connectionHint = 'Check your connection.' }: GameApiOptions = {},
): GameApi {
  const serverName = baseUrl ? `the game server at ${baseUrl}` : 'the game server';

  async function request<T>(action: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
    // A host that silently drops packets (e.g. a firewall) would otherwise hang
    // for the OS default (~60 s on iOS) with only a spinner on screen.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}/index.php?action=${action}`, {
        method,
        // Sends PHPSESSID: the browser cookie jar on web, native cookie
        // stores (NSHTTPCookieStorage / OkHttp) on mobile.
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch {
      // Naming the URL lets the player tell a wrong server address from a blocked port.
      const reason = controller.signal.aborted
        ? `${capitalize(serverName)} did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`
        : `Could not reach ${serverName}.`;
      throw new ApiError(`${reason} ${connectionHint}`, null);
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
