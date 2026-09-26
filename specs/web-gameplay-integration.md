# Spec: Web Gameplay Integration

**Status**: active
**Owner**: Laura Ortuño
**Last updated**: 2026-09-26

## Summary

Connects the [[web-guess-picker]] picker UI to real Mastermind gameplay: the
player chooses a difficulty, submits guesses, and sees genuine white
(right color, right position) / black (right color, wrong position)
feedback per attempt, an ordered attempt log, and a win/loss outcome after
the difficulty's max attempts — all scored server-side by the existing
`App\Model\*` classes that already power the Console. A new
`GameApiController` exposes that logic over a small JSON API; no scoring,
validation, or difficulty rules are reimplemented in JavaScript.

## Requirements

1. WHEN the page loads AND no game is in progress THEN the player sees a
   difficulty selection screen listing every difficulty (name, board
   width, max attempts) as reported by `GET /api.php?action=difficulties`.
2. WHEN the player selects a difficulty THEN the frontend calls
   `POST /api.php?action=start` with that level, the backend starts a new
   `Game` with the matching `Difficulty`, and the frontend renders an
   empty guess board sized to that difficulty's width (3, 4, or 5).
3. WHEN the player submits a complete guess THEN the frontend calls
   `POST /api.php?action=guess`, the backend scores it via the existing
   `Game`/`Result` classes, and the response's black and white counts are
   appended to a visible, ordered attempt log (most recent last).
4. WHEN the backend rejects a guess as structurally invalid (wrong length
   or an unrecognized color letter) THEN the request does not count as an
   attempt — no history entry is added and the attempt counter does not
   increase — and the frontend shows the rejection message as a visible
   failure notice.
5. WHEN the player's guess exactly matches the secret combination THEN the
   game is marked won, the secret combination is revealed in the
   response, and further guess submission is disabled.
6. WHEN the player exhausts the difficulty's max attempts without an exact
   match THEN the game is marked lost, the secret combination is revealed,
   and further guess submission is disabled.
7. WHEN the game is won or lost THEN the player can start a new game,
   returning to difficulty selection.
8. WHEN the browser reloads while a game is in progress or just finished
   THEN `GET /api.php?action=state` restores it (board width, attempt log,
   win/loss state) from the server-side session instead of losing
   progress.
9. All scoring, win/loss determination, attempt counting, and difficulty
   parameters are computed exclusively by the existing `App\Model\*`
   classes (`Game`, `Result`, `Difficulty`, `Combination` family, `Type`);
   none of that logic is duplicated in JavaScript.

## Non-Goals

- No accounts or persistence beyond the PHP session — closing the browser
  session loses the game, matching the console's single-run model.
- No changes to `Views/Console/*`, `GameConsoleController`, or the console
  gameplay flow.
- No new difficulty levels or custom board widths beyond the existing
  Easy/Medium/Hard.
- No auth, rate limiting, or CSRF token on the API — single-player,
  same-origin, session-scoped only, consistent with the project's current
  (pre-existing) security posture. Revisit if the game ever grows
  multi-user or public-facing.
- No mid-game difficulty switch — starting a new difficulty always starts
  a fresh game (overwrites the session's in-progress game).

## Design Notes

- **New Controller**: `App\Controller\GameApiController`
  (`src/Controller/GameApiController.php`), constructed with `array
  &$session` (a reference to `$_SESSION` in production, a plain array in
  tests) so it never touches the `$_SESSION` superglobal directly —
  reused by the front controller for session persistence and by
  PHPUnit for the same logic without a real HTTP session. Exposes:
  - `difficulties(): array` — describes the 3 fixed levels by
    instantiating `Difficulty(1|2|3)` and reading
    `LevelInterface::getName()/getWidth()/getMaxAttempts()`. Read-only,
    no session writes.
  - `start(int $level): array` — `new Difficulty($level)` (its existing
    validation throws `InvalidCombinationError` on an out-of-range level),
    `new Game($difficulty->getDifficultyLevel())`, stores
    `serialize($game)` plus a fresh empty attempt-history array in the
    session, returns the initial state.
  - `guess(string $combination): array` — loads the serialized `Game`,
    calls the **unmodified** `$game->play($combination)`, reads
    `$game->getLastResult()->getBlack()/getWhite()`, appends
    `{attempt, combination, black, white}` to the session's history array,
    re-serializes the game, returns the updated state. If `play()` throws
    `InvalidCombinationError`, the exception propagates before any session
    write happens — the game/history stay exactly as they were (mirrors
    `Game::play()`'s own behavior of validating before mutating attempt
    count, which is what makes invalid guesses "free" in the Console too).
  - `state(): array` — rebuilds the current state from the session
    without mutating anything; throws `InvalidCombinationError` (reused
    rather than adding a new exception type) when no game is in the
    session.
  - Shared `buildState()` reads board width/max attempts/name from
    `$game->getSecretCombination()->getDifficulty()` (public on
    `Combination`) and only includes `secretCombination` in the response
    once `$game->isFinished()` is true — the secret is never exposed
    mid-game.
- **New front controller**: `public/api.php`. Calls `session_start()`,
  dispatches on `($_SERVER['REQUEST_METHOD'], $_GET['action'])` to the
  matching `GameApiController` method, JSON-decodes the request body for
  POSTs, and catches `InvalidCombinationError` to emit
  `HTTP 400 {"error": "..."}`. Lives under the existing `public/` docroot
  ([[web-guess-picker]] already made `public/` the nginx root), so no
  nginx/docker changes are needed — `api.php` matches the existing
  `location ~ \.php$` block.
- **API contract**:

  | Action | Method | Request body | Response (200) |
  |---|---|---|---|
  | `difficulties` | GET | – | `{difficulties: [{level, name, width, maxAttempts}, ...]}` |
  | `start` | POST | `{difficulty: number}` | initial state (see below) |
  | `guess` | POST | `{combination: string}` | updated state |
  | `state` | GET | – | current state |

  State shape: `{attemptNumber, maxAttempts, width, difficultyName,
  isFinished, isWinner, isLoser, history: [{attempt, combination, black,
  white}], secretCombination?: string[]}` (`secretCombination` present
  only when `isFinished`). Errors: any action can respond `HTTP 400
  {error: string}` (invalid input, invalid difficulty, or no active game).
- **Session-based persistence**: PHP's built-in session mechanism
  (file-backed by default) stores the serialized `Game` plus the parallel
  attempt-history array. `Game`/`Combination`/`Result` hold no resources,
  so default `serialize()`/`unserialize()` round-trips them without
  `__sleep`/`__wakeup`. The attempt history itself is **not** stored on
  `Game` (it only remembers `lastResult`) — it's assembled by the
  controller across requests, entirely additive and outside `Model/`.
- **Frontend**: `web/src/api/gameApi.js` wraps the four calls
  (`fetch` with same-origin credentials, JSON in/out). `App.jsx` becomes a
  small phase state machine (`loading -> difficulty -> playing ->
  finished`); on mount it calls both `difficulties` and `state` so a page
  reload mid-game resumes instead of restarting. Board width now comes
  from the server response instead of the fixed constant from
  [[web-guess-picker]] (which is removed). New components:
  `DifficultySelect` (one button per level, showing name/width/max
  attempts) and a finished-state banner (win/loss text, revealed secret,
  "Play again"). `GuessHistory` is extended to show each attempt's
  black/white counts, not just its pegs. Guess/API failures render in an
  `role="alert"` notice (Requirement 4).
- **Reuse discipline**: `src/Model/*` is not modified by this feature —
  every rule (color validity, combination length, scoring, win/loss,
  attempt limits) is read through existing public methods.

## Open Questions

- Should there be an explicit "abandon current game" action, or is
  starting a new difficulty (which silently overwrites the session) good
  enough? Currently the latter.
- Should the attempt history survive across sessions (e.g., a simple
  per-browser local history of past completed games)? Out of scope here.

## Change Log

- 2026-09-26: Initial version — difficulty selection, real scoring via a
  new `GameApiController` + `public/api.php`, attempt log with black/white
  feedback, win/loss + secret reveal, session-backed resume on reload.
  Verified with PHPUnit (8 new tests, full suite green) and live HTTP
  walkthroughs (session persistence, invalid guesses not consuming an
  attempt, win reveal via reflection-read secret, loss after max
  attempts). Fixed an initial mislabeling in `GuessHistory` where
  black/white were displayed swapped relative to `Result`'s actual
  semantics (white = right position, black = right color/wrong position).
