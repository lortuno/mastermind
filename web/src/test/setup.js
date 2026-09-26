import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without injected globals, so RTL's automatic cleanup must be wired up here.
afterEach(() => {
  cleanup();
});
