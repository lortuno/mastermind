import { createGameApi, REQUEST_TIMEOUT_MS } from '../gameApi';

const BASE_URL = 'http://api.test';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('createGameApi', () => {
  const fetchMock = jest.fn();
  const api = createGameApi(BASE_URL, fetchMock as unknown as typeof fetch);

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

  it('reports network failures without an HTTP status', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(api.fetchState()).rejects.toMatchObject({ name: 'ApiError', status: null });
  });

  it('throws a generic message when an error response has no message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, {}));

    await expect(api.fetchState()).rejects.toThrow('Unexpected error.');
  });

  it('throws a connectivity message when the network request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(api.fetchDifficulties()).rejects.toThrow(`Could not reach the game server at ${BASE_URL}.`);
  });

  it('gives up after the timeout when the server never answers (e.g. a firewall silently dropping packets)', async () => {
    jest.useFakeTimers();
    try {
      fetchMock.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
          }),
      );

      const pending = api.fetchDifficulties();
      jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);

      await expect(pending).rejects.toMatchObject({
        name: 'ApiError',
        status: null,
        message: expect.stringContaining(`${BASE_URL} did not respond`),
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('throws a generic message when the body is not JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    } as Response);

    await expect(api.fetchState()).rejects.toThrow('Unexpected response from the game server.');
  });
});
