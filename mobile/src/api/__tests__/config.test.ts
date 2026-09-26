import { resolveApiBaseUrl } from '../config';

describe('resolveApiBaseUrl', () => {
  it('returns the configured URL', () => {
    expect(resolveApiBaseUrl('http://10.0.2.2')).toBe('http://10.0.2.2');
  });

  it('strips trailing slashes', () => {
    expect(resolveApiBaseUrl('http://192.168.1.20:8080//')).toBe('http://192.168.1.20:8080');
  });

  it('trims surrounding whitespace', () => {
    expect(resolveApiBaseUrl('  http://localhost  ')).toBe('http://localhost');
  });

  it('throws a descriptive error when the URL is missing', () => {
    expect(() => resolveApiBaseUrl(undefined)).toThrow(/EXPO_PUBLIC_API_URL/);
    expect(() => resolveApiBaseUrl('   ')).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it('rejects URLs that are not http(s)', () => {
    expect(() => resolveApiBaseUrl('ftp://example.com')).toThrow(/http/);
  });
});
