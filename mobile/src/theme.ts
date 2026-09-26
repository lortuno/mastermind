// React Native view of the shared design tokens (packages/core/src/tokens.ts).
// Change values there, never here — web's _variables.scss is generated from the same source.
import { tokens } from '@mastermind/core';

export const { palette, spacing, radius, fontSize } = tokens;

export const MIN_TOUCH_TARGET = tokens.size.touchMin;
export const PEG_MAX_SIZE = tokens.size.pegMax;
export const HISTORY_PEG_SIZE = tokens.size.historyPeg;
export const KEY_PEG_SIZE = tokens.size.keyPeg;

// Depth: raised panels cast a soft shadow onto the table (New Architecture `boxShadow`).
export const RAISED_SHADOW = tokens.depth.shadowRaised;
