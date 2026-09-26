# Spec: Mobile Gameplay

**Status**: draft
**Owner**: Laura Ortuño
**Last updated**: 2026-09-26

## Summary

A React Native mobile client for iOS and Android that plays the same
Mastermind game as the web surface ([[web-gameplay-integration]]): the
player picks a difficulty, builds guesses by tapping color swatches into
peg slots, submits them, and sees the server's white/black feedback, an
ordered attempt log, and the win/loss outcome with the revealed secret.
It is a third *View* over the existing PHP game — it talks to the same
`/index.php?action=...` JSON API and reimplements none of the scoring,
validation, or difficulty rules.

## Requirements

1. WHEN the app launches THEN it calls `GET /index.php?action=difficulties`
   and `GET /index.php?action=state` in parallel; while they are pending a
   loading indicator is shown.
2. WHEN launch completes AND the server has no game in progress THEN the
   player sees one button per difficulty showing its name, board width,
   and max attempts, exactly as reported by the server.
3. WHEN launch completes AND the server session holds a game (in progress
   or finished) THEN the app resumes it (board width, attempt log, and
   win/loss state) instead of showing difficulty selection.
4. WHEN the player taps a difficulty THEN the app calls
   `POST /index.php?action=start` with that level and renders an empty
   board with as many slots as the returned `width`.
5. WHEN no slot has been tapped THEN the first empty slot is active; WHEN
   the player taps a slot THEN it becomes active whether filled or not.
6. WHEN the player taps a palette color THEN the active slot is filled
   with that color, shown as both fill and letter (`R`, `G`, `B`, `P`,
   `Y`); the active slot then advances to the next empty slot to its
   right, or stays put when there is none (no wraparound).
7. WHEN the player taps "Clear" THEN every slot empties and the first
   slot becomes active.
8. WHEN any slot is empty, a request is in flight, or the game is finished
   THEN "Submit guess" is disabled; WHEN a request is in flight or the
   game is finished THEN the slots, palette, and "Clear" are disabled too,
   so no input is silently discarded when the response resets the board.
9. WHEN the player submits a complete guess THEN the app calls
   `POST /index.php?action=guess`, adds the returned attempt (pegs,
   white = right position, black = right color/wrong position) to the
   attempt log, resets the board, and updates the "Attempt N of M"
   counter from the response.
9a. The attempt log is ordered newest first: the latest attempt is always
    the first row, directly below the board, and is visually marked as the
    latest (not by color alone, e.g. a "Latest" label). Attempt numbers
    keep their server value (#1 is always the first guess played).
10. WHEN any API call fails (HTTP 4xx/5xx with `{error}`, or a network
    failure) THEN the message is shown in a visible error notice that is
    announced to screen readers (TalkBack and VoiceOver), and the
    board/attempt log are left unchanged. The one exception: HTTP 400
    from `state` at launch means "no game in the session" and just shows
    difficulty selection. A network failure message names the base URL
    that was tried. WHEN the launch requests failed and there are no
    difficulties to show THEN a "Retry" button re-runs them.
11. WHEN the response reports `isFinished` THEN the board is locked, a
    banner shows "You win!" or "You lose." with the revealed secret
    combination (also announced to screen readers), and a "Play again"
    button returns to difficulty selection.
12. The game session survives app restarts for as long as the server-side
    PHP session lives: the session cookie is kept by the platform's
    native cookie store.
13. Every interactive element (slots, swatches, Clear, Submit, difficulty
    buttons, Play again) has an accessibility role and label (e.g.
    "Position 2, Red", "Red"), meets a 44×44pt minimum touch target, and
    color is never the sole carrier of meaning.
14. The API base URL is configurable per build via `EXPO_PUBLIC_API_URL`;
    no hostnames or secrets are hardcoded in source.
15. All scoring, win/loss determination, attempt counting, and difficulty
    parameters come from the server; none of that logic lives in the app.

## Non-Goals

- No backend changes: the existing API contract of
  [[web-gameplay-integration]] is consumed as-is.
- No offline play, local scoring, accounts, or push notifications.
- No app-store release pipeline (EAS Build/Submit, signing, icons beyond
  Expo defaults) — the app runs in Expo Go or a local dev build.
- No web target for the Expo project (the React web app in `web/`
  already covers browsers); running it on web would additionally need
  CORS on the PHP API.
- No shared visual components with `web/`: logic, the game-flow hook and
  design tokens come from [[shared-client-core]]; the React Native UI is
  mobile-only.

## Design Notes

- **Stack**: Expo SDK 57 (managed workflow), React Native, TypeScript
  (strict). Lives in `mobile/`, an npm workspace next to `web/` and
  `packages/core` (install from the repository root); Expo's monorepo
  support lets Metro compile `@mastermind/core` from source.
- **Why Expo**: the React Native docs recommend a framework; Expo gives
  one codebase for iOS and Android, runs on physical devices via Expo Go
  without Xcode/Android Studio, and needs no native code for this app.
- **Structure**:
  - From `@mastermind/core` ([[shared-client-core]]): `createGameApi` /
    `ApiError` (four actions, session cookie, 10 s timeout, errors that
    name the URL), wire types, `COLORS` / `findColor` /
    `describeCombination`, guess helpers, the `useMastermindGame` phase
    state machine (`loading → difficulty → playing → finished`), and the
    design `tokens`.
  - `App.tsx` — builds the API from `EXPO_PUBLIC_API_URL` with a
    mobile-specific `connectionHint` ("Check your connection, firewall
    and EXPO_PUBLIC_API_URL."), then `SafeAreaProvider` + `GameScreen`.
  - `src/api/config.ts` — resolves the base URL from
    `EXPO_PUBLIC_API_URL`, stripping a trailing slash. Android emulators
    reach the host machine at `http://10.0.2.2`, the iOS simulator at
    `http://localhost`, physical devices at the host's LAN IP.
  - `src/screens/GameScreen.tsx` — composes the components from the hook.
  - `src/components/*` — presentational components: `DifficultySelect`,
    `GameHeader`, `GuessBoard`, `ColorPalette`, `GuessHistory`, `KeyPegs`,
    `Peg`, `GameStatusBanner`, `ErrorNotice`, `Button`.
  - `src/theme.ts` — React Native view of the shared `tokens` (no values
    of its own).
  - `src/hooks/useIosAnnouncement.ts` — VoiceOver announcements.
- **Visual design** (shared with [[web-gameplay-integration]]): a dark
  "tabletop board". Tokens, identical in both clients: palette `bg`
  `#12151c`, `surface` `#1c202b`, `surfaceRaised` `#242938`,
  `surfaceSunken` `#0d1016`, `border` `#2c3140`, `borderStrong` `#3b4254`,
  `text` `#f4f5f7`, `textMuted` `#9aa1b1`, `accent` `#0091ff` (text on it
  `#12151c`), `danger`/`success` = the red/green peg hexes; spacing 2/4/8/
  12/16/24/32; radius 6/12/18/pill; type 12/14/16/20/32.
  - Layout: title → error → header (difficulty and "Attempt N of M" chips
    plus a segmented bar, one segment per attempt, accent = remaining;
    `accessibilityRole="progressbar"`, label "Attempts remaining") → raised
    board tray (slots in a sunken well, palette, Clear/Submit) → win/loss
    banner → "Attempts" log (newest first).
  - Slots and swatches flex between 44pt and 56pt so a 5-wide board fits a
    320pt screen. The active slot gets an accent ring, slight scale, and a
    bar under it (shape, not only color). Swatches and buttons have a dark
    bottom "lip" that compresses on press; no animations.
  - Attempt rows: guess pegs on the left, `KeyPegs` on the right — a
    two-column grid with one hole per position: solid light dots =
    `white` (right position), dark dots with a light ring = `black` (right
    color, wrong position), the rest empty holes. The grid is hidden from
    screen readers; "N right position" / "N right color, wrong position"
    stay as visible caption text.
  - Latest row: 2pt accent border, raised surface and shadow, and an
    uppercase "Latest" badge. `GuessHistory` renders
    `[...history].reverse()`; rows keyed by `attempt`.
  - Peg letters use each color's `textHex` (>= 4.5:1); disabled buttons
    switch to muted text on `border` instead of fading.
- **Screen-reader announcements**: `accessibilityLiveRegion` only works
  on Android, so `useIosAnnouncement` calls
  `AccessibilityInfo.announceForAccessibility` on iOS only (calling it on
  Android as well would announce twice). The attempt log uses
  `accessibilityRole="list"` rather than `accessible`, because grouping it
  would hide every row from VoiceOver.
- **Session cookie**: React Native's `fetch` uses `NSHTTPCookieStorage`
  on iOS and OkHttp's cookie jar on Android, so `PHPSESSID` persists
  natively — no manual cookie handling (Requirement 12).
- **Cleartext HTTP in dev**: the dev backend is plain HTTP. `app.json`
  enables `usesCleartextTraffic` on Android and
  `NSAllowsLocalNetworking` on iOS via `expo-build-properties`; a
  production backend should be HTTPS.
- **Running on a device**: physical iOS/Android phones run the app in
  the Expo Go app (App Store / Google Play) by scanning the QR code from
  `npx expo start`; phone and computer share a Wi-Fi network and
  `EXPO_PUBLIC_API_URL` is the computer's LAN IP. Step-by-step guide and
  troubleshooting live in the root `README.md` ("Testing on a real phone").
- **Tests**: `jest-expo` + `@testing-library/react-native`. `config.ts`
  unit tests (API client, guess rules and hook are tested in
  [[shared-client-core]]); an integration test that renders `GameScreen`
  with a mocked API and walks the
  difficulty → guess → finish flow, including newest-first order and the
  single "Latest" marker after resume and after a submit.

## Open Questions

- Should production builds point at a hosted HTTPS backend, and if so,
  should the PHP session cookie be marked `Secure`/`SameSite`?

## Change Log

- 2026-09-26: Initial draft — Expo/React Native mobile View for iOS and
  Android over the existing JSON API. Verified with 37 Jest tests (~98%
  line coverage), `tsc`, ESLint, `expo-doctor`, production iOS/Android
  bundle export, and a live contract run of `gameApi.ts` against the
  dockerized backend (session resume, a rejected invalid guess costing no
  attempt, loss with the secret revealed). Review fixes: the board locks
  while a request is in flight; `state` failures other than 400 are now
  surfaced; VoiceOver announcements added on iOS. Real-phone guide added
  to the README.
- 2026-09-26: While debugging "Could not reach the game server" on a
  physical phone (the error didn't say which URL was baked into the build,
  and the difficulty screen was a dead end): network errors now include
  the base URL, and a "Retry" button re-runs the launch requests.
- 2026-09-26: Endless launch spinner on iOS: requests had no timeout, so
  a host that silently drops packets (Windows Firewall) kept the app in
  `loading` for the OS default (~60 s per request). Every request now
  aborts after `REQUEST_TIMEOUT_MS` (10 s) with a "did not respond" error
  naming the URL, which leads to the error notice and the Retry button.
- 2026-09-26: Attempt log reversed to newest first, with the latest attempt
  marked (Requirement 9a); visual redesign shared with the web client
  (see [[web-gameplay-integration]]). The API still returns history oldest
  first; each client reverses it for display.
- 2026-09-26: API client, wire types, colors, guess rules, the
  `useMastermindGame` hook and design tokens moved to
  [[shared-client-core]] (`@mastermind/core`, npm workspaces); `theme.ts`
  now reads the shared tokens. No behavior change; the network-error hint
  is passed in from `App.tsx`. Verified: 22 mobile tests (the moved tests
  now run in core), `tsc`, ESLint, `expo-doctor`, iOS/Android export, and
  a live run of the shared client against the dockerized backend.
