// Wire shapes of the PHP JSON API (see specs/web-gameplay-integration.md).

export type Difficulty = {
  level: number;
  name: string;
  width: number;
  maxAttempts: number;
};

export type Attempt = {
  attempt: number;
  combination: string;
  // Right color, wrong position.
  black: number;
  // Right color, right position.
  white: number;
};

export type GameState = {
  attemptNumber: number;
  maxAttempts: number;
  width: number;
  difficultyName: string;
  isFinished: boolean;
  isWinner: boolean;
  isLoser: boolean;
  history: Attempt[];
  secretCombination?: string[];
};
