// Mirrors web/src/styles/_variables.scss so both clients share one look.
export const palette = {
  bg: '#12151c',
  surface: '#1c202b',
  border: '#2c3140',
  text: '#f4f5f7',
  textMuted: '#9aa1b1',
  accent: '#0091ff',
  danger: '#e5484d',
  success: '#30a46c',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
} as const;

export const radius = 12;

// Apple HIG / WCAG 2.5.8 minimum touch target.
export const MIN_TOUCH_TARGET = 44;
export const PEG_SIZE = 52;
