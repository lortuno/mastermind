import { describe, expect, it } from 'vitest';
import { tokens, toScssVariables } from './tokens';

describe('toScssVariables', () => {
  const scss = toScssVariables(tokens);

  it('emits palette colors verbatim', () => {
    expect(scss).toContain(`$color-bg: ${tokens.palette.bg};`);
    expect(scss).toContain(`$color-on-accent: ${tokens.palette.onAccent};`);
  });

  it('converts pixel sizes to rem (16px = 1rem)', () => {
    expect(scss).toContain('$space-lg: 1rem;');
    expect(scss).toContain('$touch-min: 2.75rem;');
    expect(scss).toContain('$font-display: 2rem;');
  });

  it('keeps the pill radius in px so it stays fully rounded', () => {
    expect(scss).toContain('$radius-pill: 999px;');
  });

  it('emits depth and motion values', () => {
    expect(scss).toContain(`$shadow-raised: ${tokens.depth.shadowRaised};`);
    expect(scss).toContain('$duration-fast: 120ms;');
  });

  it('marks the output as generated', () => {
    expect(scss.split('\n')[0]).toMatch(/GENERATED/);
  });
});
