import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameApi, REQUEST_TIMEOUT_MS } from './gameApi';

const BASE_URL = 'http://api.test';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

// Plain fakes for network failures: a vi.fn returning a rejected promise makes
// Vitest report the rejection as unhandled even though the client catches it.
function failingFetch(error: Error): typeof fetch {
  return (async () => {
    throw error;
  }) as unknown as typeof fetch;
}

function hangingFetch(): typeof fetch {
  return ((_url: string, init: RequestInit) =>
    new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
    })) as unknown as typeof fetch;
}

describe('createGameApi', () => {
  const fetchMock = vi.fn();
  const api = createGameApi(BASE_URL, { fetchImpl: fetchMock as unknown as typeof fetch });

  beforeEach(() => fetchMock.mockReset());

  it('GETs difficulties with the session cookie included', async () => {
    const body = { difficulties: [{ level: 1, name: 'Easy', width: 3, maxAttempts: 10 }] };
    fetchMock.mockResolvedValue(jsonResponse(200, body));

    await expect(api.fetchDifficulties()).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/index.php?action=difficulties`,
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('GETs the current state', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { width: 4 }));

    await api.fetchState();

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/index.php?action=state`);
  });

  it('uses a same-origin path when the base URL is empty (web)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { width: 4 }));

    await createGameApi('', { fetchImpl: fetchMock as unknown as typeof fetch }).fetchState();

    expect(fetchMock.mock.calls[0][0]).toBe('/index.php?action=state');
  });

  it('POSTs the chosen difficulty as JSON when starting', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { width: 4 }));

    await api.startGame(2);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/index.php?action=start`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 2 }),
      }),
    );
  });

  it('POSTs the combination when submitting a guess', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { width: 4 }));

    await api.submitGuess('RGBY');

    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ combination: 'RGBY' }));
  });

  it('throws the server error message and HTTP status on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: 'Invalid combination.' }));

    await expect(api.submitGuess('XX')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid combination.',
      status: 400,
    });
  });

  it('throws a generic message when an error response has no message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, {}));

    await expect(api.fetchState()).rejects.toMatchObject({ message: 'Unexpected error.', status: 500 });
  });

  it('names the base URL when the network request fails', async () => {
    const offlineApi = createGameApi(BASE_URL, { fetchImpl: failingFetch(new TypeError('Network request failed')) });

    await expect(offlineApi.fetchDifficulties()).rejects.toMatchObject({
      name: 'ApiError',
      status: null,
      message: `Could not reach the game server at ${BASE_URL}. Check your connection.`,
    });
  });

  it('omits the address for same-origin requests and appends the connection hint', async () => {
    const webApi = createGameApi('', {
      fetchImpl: failingFetch(new TypeError('Failed to fetch')),
      connectionHint: 'Is the server running?',
    });

    await expect(webApi.fetchState()).rejects.toThrow('Could not reach the game server. Is the server running?');
  });

  it('throws a generic message when the body is not JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    } as Response);

    await expect(api.fetchState()).rejects.toThrow('Unexpected response from the game server.');
  });

  describe('timeout', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('gives up when the server never answers (e.g. a firewall silently dropping packets)', async () => {
      const pending = createGameApi(BASE_URL, { fetchImpl: hangingFetch() }).fetchDifficulties();
      vi.advanceTimersByTime(REQUEST_TIMEOUT_MS);

      await expect(pending).rejects.toMatchObject({
        name: 'ApiError',
        status: null,
        message: `The game server at ${BASE_URL} did not respond within 10 seconds. Check your connection.`,
      });
    });
  });
});
