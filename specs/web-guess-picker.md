# Spec: Web Guess Picker

**Status**: active
**Owner**: Laura Ortuño
**Last updated**: 2026-09-26

## Summary

An interactive browser page, built with React and Sass, where the player
builds a Mastermind guess by choosing one color per board position from the
game's 5 valid colors (Blue, Red, Yellow, Purple, Green). This is the first
Web-surface feature for the project; it delivers the picking interaction
only. It does not replay this guess against the console/PHP scoring engine
(see Non-Goals) — that is intentionally deferred to a follow-up feature.

The Console experience (`GameConsoleController`, `Views/Console/*`) is
unaffected by this feature.

## Requirements

1. WHEN the page loads THEN the player sees a guess board of 4 empty
   position slots (matching the default `Medium` difficulty width) and a
   palette of exactly 5 color options: Blue (`B`), Red (`R`), Yellow (`Y`),
   Purple (`P`), Green (`G`).
2. WHEN no slot has been explicitly selected THEN the first empty slot is
   the active slot.
3. WHEN the player clicks (or activates via keyboard) a slot THEN that slot
   becomes the active slot, regardless of whether it is already filled.
4. WHEN the player picks a color from the palette THEN the active slot is
   filled with that color, shown as both a color fill and its letter (`B`,
   `R`, `Y`, `P`, `G`) so the choice is not conveyed by color alone.
5. WHEN a color is assigned to the active slot AND a later empty slot
   exists THEN the active slot automatically advances to the next empty
   slot.
6. WHEN a color is assigned to the active slot AND no later empty slot
   exists THEN the active slot stays put (no wraparound).
7. WHEN the player clicks "Clear" THEN all slots in the current guess are
   emptied and the active slot resets to position 1.
8. WHEN one or more slots are empty THEN the "Submit Guess" button is
   disabled.
9. WHEN all slots are filled AND the player clicks "Submit Guess" THEN the
   guess is appended (most recent last) to a visible guess history list
   below the board, rendered as its filled pegs, and the board resets to
   empty for the next guess.
10. WHEN the page is viewed at widths from 320px to desktop THEN the board,
    palette, and history remain usable without horizontal overflow.
11. All interactive elements (slots, palette swatches, Clear, Submit) are
    reachable and operable via keyboard, and expose accessible names via
    `aria-label` (e.g. "Position 2, empty", "Red").

## Non-Goals

- No scoring, win/loss detection, secret-combination generation, or
  attempt-limit enforcement. The guess history is a plain list of
  submitted attempts with no black/white peg feedback.
- No server round-trip for the guess itself — this feature is entirely
  client-side React state; nothing is persisted or sent to PHP.
- No difficulty selection UI — board width is fixed at 4 (the existing
  `Medium` default) for this iteration.
- No changes to `Views/Console/*`, `GameConsoleController`, or any
  `Controller/Model/*` gameplay classes.

## Design Notes

- **Stack**: React 18 (function components + hooks) and Sass, built with
  Vite. Source lives in `web/` at the project root (sibling to `src/`), kept
  separate from the PHP PSR-4 autoload root.
- **Build output**: `npm --prefix web run build` compiles to
  `public/assets/mastermind-web.{js,css}` with fixed (non-hashed) filenames
  so the PHP layout can reference them directly. `public/assets/` is
  gitignored; only source under `web/` is committed.
- **Public docroot**: `public/` is a new, dedicated docroot containing only
  `public/index.php` (the web front controller) and the compiled
  `assets/`. `docker/nginx/default.conf`'s `root` now points at
  `/var/www/html/public` instead of `/var/www/html/src`, so PHP source
  under `src/` (Controller/Model/Views) is no longer directly web-reachable
  — it's only loaded via explicit `include_once` from `public/index.php`.
  `php -S ... -t public` mirrors this for the non-docker path.
- **Entry points stay separate**: `src/index.php` (used only by
  `php -f src/index.php` / the console) is untouched from its committed
  state — no SAPI branching, no behavior change for the console.
  `public/index.php` is the new, web-only entry point; it wires up
  `GameWebView`/`GameWebController` and instantiates the latter.
- **PHP wiring**: `src/Views/Web/Layouts/play.html` now contains a
  `#mastermind-root` mount node plus a `<link>`/`<script>` pair pointing at
  `/assets/mastermind-web.{css,js}`. `GameWebController` and `GameWebView`
  are otherwise unchanged — they still just render `play.html`.
- **Color palette source of truth**: `web/src/constants/colors.js` mirrors
  `App\Controller\Model\Type::$validValues` (`R`, `G`, `B`, `P`, `Y`). If the
  valid color set changes in PHP, update this file to match.
- **Component shape**: `App` owns `guess` (array of 4 nullable letters),
  `activeSlot` (index), and `history` (array of completed guesses).
  `GuessBoard` renders `PegSlot`s; `ColorPalette` renders the 5 swatch
  buttons; `GuessHistory` renders past guesses.

## Open Questions

- Should a future iteration let the player pick difficulty (board width
  3/4/5), and if so, does that live in this same feature or a separate one?
- When the follow-up "real gameplay" feature is built, will it reuse the
  existing PHP `Game`/`Result` classes via a small JSON endpoint, or move
  scoring into JS? (Deferred — out of scope here.)

## Change Log

- 2026-09-26: Initial version — interactive color-picker guess board (no
  scoring/backend integration yet).
- 2026-09-26: Switched asset/docroot layout from `src/Views/Web/dist/` to a
  dedicated `public/` docroot (`public/index.php` + `public/assets/`) so
  PHP application source under `src/` is no longer directly web-exposed;
  `src/index.php` reverted to its original console-only form.
