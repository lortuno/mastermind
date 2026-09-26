const ALLOWED_PROTOCOLS = /^https?:\/\//i;

/**
 * Normalizes the backend base URL configured through EXPO_PUBLIC_API_URL.
 * Android emulator → http://10.0.2.2, iOS simulator → http://localhost,
 * physical device → http://<host LAN IP>.
 */
export function resolveApiBaseUrl(rawUrl: string | undefined): string {
  const url = rawUrl?.trim() ?? '';

  if (url === '') {
    throw new Error(
      'The game server address is not configured. Set EXPO_PUBLIC_API_URL (e.g. in mobile/.env.local.local) and restart Expo.',
    );
  }
  if (!ALLOWED_PROTOCOLS.test(url)) {
    throw new Error('EXPO_PUBLIC_API_URL must start with http:// or https://.');
  }

  return url.replace(/\/+$/, '');
}
