export { ApiError, createGameApi, REQUEST_TIMEOUT_MS, type GameApi, type GameApiOptions } from './api/gameApi';
export type { Attempt, Difficulty, GameState } from './api/types';
export { COLORS, describeCombination, findColor, type ColorLetter, type PegColor } from './game/colors';
export { emptyGuess, isGuessComplete, placeColor, type Guess, type GuessBoardState } from './game/guess';
export { useMastermindGame, type Phase } from './hooks/useMastermindGame';
export { tokens, toScssVariables, type Tokens } from './tokens';
