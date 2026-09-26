// Design tokens: the single source of design values for both clients.
// Mobile reads them directly (mobile/src/theme.ts); web's
// web/src/styles/_variables.scss is generated from them with `npm run tokens`.
// Sizes are in px (React Native units); the SCSS output converts them to rem.
// Self-contained on purpose (no imports) so Node can run the generator directly.

export const tokens = {
  palette: {
    bg: '#12151c',
    surface: '#1c202b',
    // Raised "board tray" panels, chips, latest attempt row.
    surfaceRaised: '#242938',
    // Sunken peg holes and wells carved into the board.
    surfaceSunken: '#0d1016',
    border: '#2c3140',
    borderStrong: '#3b4254',
    text: '#f4f5f7',
    textMuted: '#9aa1b1',
    accent: '#0091ff',
    // Text on accent fills (5.6:1).
    onAccent: '#12151c',
    danger: '#e5484d',
    success: '#30a46c',
  },
  spacing: { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 12, lg: 18, pill: 999 },
  fontSize: { caption: 12, small: 14, body: 16, title: 20, display: 32 },
  size: {
    // Apple HIG / WCAG 2.5.8 minimum touch target.
    touchMin: 44,
    // Slots and swatches flex between touchMin and this size.
    pegMax: 56,
    historyPeg: 28,
    keyPeg: 10,
  },
  depth: {
    // Raised panels cast a soft shadow onto the table (CSS and RN `boxShadow`).
    shadowRaised: '0px 6px 16px rgba(0, 0, 0, 0.45)',
    // Color of the pressable "lip" under swatches and buttons.
    shadowLip: 'rgba(0, 0, 0, 0.35)',
  },
  motion: { durationFastMs: 120 },
} as const;

export type Tokens = typeof tokens;

const PX_PER_REM = 16;

function rem(px: number): string {
  return `${px / PX_PER_REM}rem`;
}

function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function group(prefix: string, values: Record<string, number>, format: (value: number) => string): string[] {
  return Object.entries(values).map(([name, value]) => `$${prefix}-${kebab(name)}: ${format(value)};`);
}

/** Renders the tokens as the SCSS variables used by web/src/styles. */
export function toScssVariables(source: Tokens): string {
  const { pill, ...radii } = source.radius;
  const lines = [
    '// GENERATED from packages/core/src/tokens.ts by `npm run tokens`. Do not edit by hand.',
    '',
    '// Palette',
    ...Object.entries(source.palette).map(([name, value]) => `$color-${kebab(name)}: ${value};`),
    '',
    '// Spacing',
    ...group('space', source.spacing, rem),
    '',
    '// Radius (the pill stays in px so it is always fully rounded)',
    ...group('radius', radii, rem),
    `$radius-pill: ${pill}px;`,
    '',
    '// Type scale',
    ...group('font', source.fontSize, rem),
    '',
    '// Sizes',
    `$touch-min: ${rem(source.size.touchMin)};`,
    `$peg-max: ${rem(source.size.pegMax)};`,
    `$history-peg: ${rem(source.size.historyPeg)};`,
    `$key-peg: ${rem(source.size.keyPeg)};`,
    '',
    '// Depth and motion',
    `$shadow-raised: ${source.depth.shadowRaised};`,
    `$shadow-lip: ${source.depth.shadowLip};`,
    `$duration-fast: ${source.motion.durationFastMs}ms;`,
  ];
  return `${lines.join('\n')}\n`;
}
