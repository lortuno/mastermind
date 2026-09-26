// @vitest-environment node
// (reads the file from disk; jsdom would give import.meta.url a non-file scheme)
import { readFileSync } from 'node:fs';
import { tokens, toScssVariables } from '@mastermind/core';
import { describe, expect, it } from 'vitest';

describe('_variables.scss', () => {
  it('matches the shared design tokens (run `npm run tokens` after changing packages/core/src/tokens.ts)', () => {
    const committed = readFileSync(new URL('./_variables.scss', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

    expect(committed).toBe(toScssVariables(tokens));
  });
});
