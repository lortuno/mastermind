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
   `POST /index.php?action=guess`, appends the returned attempt (pegs,
   white = right position, black = right color/wrong position) to the
   attempt log (most recent last), resets the board, and updates the
   "Attempt N of M" counter from the response.
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
- No shared code package between `web/` and `mobile/` — the two clients
  are small and duplicate only the color table and a few helpers.

## Design Notes

- **Stack**: Expo SDK 57 (managed workflow), React Native, TypeScript
  (strict). Lives in `mobile/`, a sibling of `web/`, with its own
  `package.json`; the PHP PSR-4 root and `web/` are untouched.
- **Why Expo**: the React Native docs recommend a framework; Expo gives
  one codebase for iOS and Android, runs on physical devices via Expo Go
  without Xcode/Android Studio, and needs no native code for this app.
- **Structure**:
  - `src/api/gameApi.ts` — typed wrapper over the four actions
    (`fetchDifficulties`, `fetchState`, `startGame`, `submitGuess`);
    throws `ApiError(message, status)` — `body.error` plus the HTTP status
    on non-2xx, `status: null` on network failures — so callers can tell
    "no active game" (400 from `state`) apart from real outages. `credentials: 'include'` so the PHP session
    cookie is sent.
  - `src/api/config.ts` — resolves the base URL from
    `EXPO_PUBLIC_API_URL`, stripping a trailing slash. Android emulators
    reach the host machine at `http://10.0.2.2`, the iOS simulator at
    `http://localhost`, physical devices at the host's LAN IP.
  - `src/game/guess.ts` — pure, immutable helpers (`emptyGuess`,
    `placeColor`, `isGuessComplete`) mirroring the web picker rules.
  - `src/game/colors.ts` — mirrors `App\Model\Type::$validValues`, same
    hex values as `web/src/constants/colors.js`.
  - `src/hooks/useMastermindGame.ts` — the phase state machine
    (`loading → difficulty → playing → finished`) and all API calls.
  - `src/components/*` — presentational components: `DifficultySelect`,
    `GuessBoard`, `PegSlot`, `ColorPalette`, `GuessHistory`,
    `GameStatusBanner`, `ErrorNotice`.
  - `App.tsx` — `SafeAreaProvider` + a `ScrollView` screen composing the
    above from the hook.
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
- **Tests**: `jest-expo` + `@testing-library/react-native`. Unit tests
  for `guess.ts`, `config.ts`, and `gameApi.ts` (mocked `fetch`); an
  integration test that renders `App` with a mocked API and walks the
  difficulty → guess → finish flow.

## Open Questions

- Should the mobile and web clients share the color table / guess helpers
  through a workspace package once they diverge less trivially?
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
