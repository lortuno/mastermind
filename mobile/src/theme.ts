// Design tokens. MUST stay in sync with web/src/styles/_variables.scss:
// same values in both clients (the web file uses rem, where 1rem = 16px here).
export const palette = {
  bg: '#12151c',
  surface: '#1c202b',
  // Raised "board tray" panels and chips.
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
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  title: 20,
  display: 32,
} as const;

// Apple HIG / WCAG 2.5.8 minimum touch target.
export const MIN_TOUCH_TARGET = 44;
// Slots and swatches flex between MIN_TOUCH_TARGET and this size.
export const PEG_MAX_SIZE = 56;
export const HISTORY_PEG_SIZE = 28;
export const KEY_PEG_SIZE = 10;

// Depth: raised panels cast a soft shadow onto the table (New Architecture `boxShadow`).
export const RAISED_SHADOW = '0px 6px 16px rgba(0, 0, 0, 0.45)';
