# Spec: Shared Client Core

**Status**: draft
**Owner**: Laura Ortuño
**Last updated**: 2026-09-26

## Summary

`@mastermind/core` (`packages/core/`) is the single home of everything the
web ([[web-gameplay-integration]]) and mobile ([[mobile-gameplay]])
clients have in common and that does not render anything: API client and
wire types, color table, guess-building rules, the game-flow React hook,
and the design tokens. Each client keeps only its platform UI (HTML + Sass
on web, React Native components on mobile). A game-rule, API, color, or
token change is made once and reaches both clients.

## Requirements

1. The package renders nothing and imports nothing platform-specific (no
   `react-dom`, no `react-native`, no DOM or native APIs beyond `fetch`,
   `AbortController`, and timers), so it runs unchanged in browsers, iOS,
   Android, Node, and test runners.
2. `createGameApi(baseUrl, options?)` wraps the four API actions
   (`difficulties`, `state`, `start`, `guess`) on `{baseUrl}/index.php`,
   sends the session cookie (`credentials: 'include'`), and on failure
   throws `ApiError(message, status)`:
   - non-2xx → the server's `{error}` message (or "Unexpected error.")
     plus the HTTP status;
   - non-JSON body → "Unexpected response from the game server." plus
     the status;
   - network failure → a message that names `baseUrl` when it is not
     empty, `status: null`;
   - no response within `REQUEST_TIMEOUT_MS` (10 s) → the request is
     aborted, with a "did not respond" message, `status: null`.
   An optional `connectionHint` is appended to network/timeout messages
   (mobile uses it to point at `EXPO_PUBLIC_API_URL`).
3. `useMastermindGame(api)` owns the game flow for both clients:
   `loading → difficulty → playing → finished`, parallel launch requests,
   resume of a session game, HTTP 400 from `state` treated as "no game"
   (anything else surfaced as an error), board locked while a request is
   in flight or the game is finished, `canSubmit`, `canRetryLoad` +
   `retryLoad`, `playAgain`. It never mutates its inputs.
4. The guess helpers (`emptyGuess`, `placeColor`, `isGuessComplete`)
   implement the picker rules of [[mobile-gameplay]] Requirements 5–7:
   fill the active slot, advance to the next empty slot to the right, no
   wraparound, never mutate the input.
5. `COLORS` mirrors `App\Model\Type::$validValues` (R, G, B, P, Y) with
   fill `hex` and a letter `textHex` that keeps contrast ≥ 4.5:1;
   `findColor` and `describeCombination` resolve letters to names.
6. `tokens` (palette, spacing, radius, font sizes, sizes, depth, motion)
   are the only source of design values. Mobile's `theme.ts` reads them
   directly; web's `_variables.scss` is generated from them
   (`npm run tokens`) and a web test fails when the committed file drifts
   from the tokens.

## Non-Goals

- No shared visual components: web renders HTML + Sass, mobile renders
  React Native; they differ by platform (react-native-web was considered
  and deferred).
- No publishing to a registry — the package is consumed from source
  through npm workspaces.
- No behavior change to the PHP backend or the API contract.

## Design Notes

- **Workspace**: root `package.json` declares npm workspaces
  `packages/*`, `web`, `mobile`; one root `package-lock.json` and a hoisted
  `node_modules/`. Run `npm install` once at the repository root.
- **One React**: both clients pin `react` 19.2.3 (mobile: Expo SDK 57
  requirement; web moved from 18 to match) so the shared hook runs against
  a single hoisted React — two copies would break hooks.
- **Source consumption**: `main`/`types` point at `src/index.ts`; Vite
  (web) and Metro (mobile, Expo monorepo auto-config) compile the
  TypeScript directly, so there is no build step for the package.
- **Tests**: Vitest in the package (`npm test -w @mastermind/core`) —
  API client with a mocked `fetch`, guess rules, colors, SCSS token
  output, and the hook through `@testing-library/react`'s `renderHook`.

## Open Questions

- Revisit shared visual components (react-native-web) if keeping two UI
  layers in step becomes costly.

## Change Log

- 2026-09-26: Initial version — extracted from the duplicated web and
  mobile code (approach 1: share logic, hooks and tokens; keep
  platform UIs).
