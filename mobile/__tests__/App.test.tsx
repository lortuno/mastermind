import { render, screen } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    jest.restoreAllMocks();
  });

  it('loads difficulties from the configured backend', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://10.0.2.2/';
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const isDifficulties = String(input).endsWith('action=difficulties');
      const body = isDifficulties
        ? { difficulties: [{ level: 1, name: 'Easy', width: 3, maxAttempts: 10 }] }
        : { error: 'No game in progress.' };
      return Promise.resolve({
        ok: isDifficulties,
        status: isDifficulties ? 200 : 400,
        json: () => Promise.resolve(body),
      } as Response);
    });

    await render(<App />);

    expect(await screen.findByRole('button', { name: 'Easy, 3 positions, 10 attempts' })).toBeOnTheScreen();
    expect(fetchSpy).toHaveBeenCalledWith('http://10.0.2.2/index.php?action=difficulties', expect.anything());
  });

  it('explains how to configure the backend when EXPO_PUBLIC_API_URL is missing', async () => {
    delete process.env.EXPO_PUBLIC_API_URL;

    await render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent(/EXPO_PUBLIC_API_URL/);
  });
});
