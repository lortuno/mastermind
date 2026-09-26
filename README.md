# MASTERMIND

Mastermind is a game with n position (default 4) of several colors, and you have to guess the secret combination
in less than 10 attempts (depending on difficulty).
In this project at the moment the valid colors are:
- R
- P
- G
- B
- Y

To start project without docker:
``
php -S localhost:8000 -t public 
``

To start project with docker:
``
docker compose up -d --build
``

Then install composer:
````
composer install
docker compose exec php-fpm composer install
````

To access the docker container:
``
docker compose exec php-fpm sh
``
Note: There is a combination of use statements and include to show php native can work with the code. 

You can browse to http://localhost:80 to see the web view, or run the console version from terminal.
If you include an alias in `/etc/hosts` you can use that to access the web view.

The web view (`public/index.php`) is a React + Sass single-page app. Its
source lives in `web/`; the docroot (`public/`) only serves the compiled
output plus the front controller — build it once before browsing:
```
cd web
npm install
npm run build
```
This writes `public/assets/mastermind-web.{js,css}`, gitignored, rebuild
after any change under `web/src/`. `npm --prefix web run dev` runs a
standalone Vite dev server for iterating on the UI in isolation.

The mobile view (iOS and Android) is a React Native app built with Expo.
Its source lives in `mobile/` and it talks to the same PHP JSON API, so
start the backend first (`docker compose up -d`). Then:
```
cd mobile
npm install
cp .env.example .env.local   # set EXPO_PUBLIC_API_URL for your device
npx expo start
```
The backend URL depends on where the app runs: `http://10.0.2.2` (Android
emulator), `http://localhost` (iOS simulator), or your computer's LAN IP
(physical phone). Checks: `npm test`, `npm run typecheck`, `npm run lint`.
See `specs/mobile-gameplay.md` for the feature spec.

### Testing on a real phone (iOS or Android)

No Xcode, Android Studio or Mac is needed — the app runs inside **Expo Go**.

1. **Install Expo Go on the phone** (free):
   - iPhone: [App Store → "Expo Go"](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play → "Expo Go"](https://play.google.com/store/apps/details?id=host.exp.exponent)

   Keep it up to date — Expo Go only runs the SDK version this project uses
   (Expo SDK 57). If it says the project is incompatible, update Expo Go.
2. **Put the phone and the computer on the same Wi-Fi network.**
3. DO npx expo login if you haven't logged in yet (Expo account is free). This is required
   for LAN connections to work.
4. **Find the computer's LAN IP**: on Windows run `ipconfig` and take the
   "IPv4 Address" of the Wi-Fi adapter (e.g. `192.168.1.20`); on macOS/Linux
   use `ipconfig getifaddr en0` / `hostname -I`.
5. **Start the backend** from the project root: `docker compose up -d`.
   Check it from the phone's browser: `http://192.168.1.20/` should load
   the web game. If it doesn't, allow inbound port **80** in the computer's
   firewall (Windows: Defender Firewall → allow Docker Desktop on Private
   networks).
5. **Point the app at the backend**: in `mobile/.env.local` set
   `EXPO_PUBLIC_API_URL=http://192.168.1.20` (your IP, no trailing slash).
6. **Start Expo**: `cd mobile && npx expo start` (restart it after any
   `.env.local` change). Allow Node.js through the firewall when prompted —
   Expo's dev server uses port **8081**.
7. **Open the app**:
   - iPhone: scan the QR code in the terminal with the **Camera** app and
     tap the banner to open it in Expo Go.
   - Android: open **Expo Go** and tap "Scan QR code".

Troubleshooting:
- *"Could not reach the game server"* in the app → the phone can't reach
  the backend: re-check steps 3–5 (the browser test in step 4 is the
  quickest check).
- QR code loads forever → the phone can't reach port 8081. Check the
  firewall, or run `npx expo start --tunnel` (this tunnels only the app
  bundle; the backend must still be reachable on the LAN IP).
- The game session is kept by the phone's cookie store, so closing and
  reopening Expo Go resumes the current game.

Emulators instead of a phone: press `a` in the Expo terminal for an Android
emulator (requires Android Studio) or `i` for the iOS simulator (macOS with
Xcode only).

First approach is with Console views called from terminal.

To execute (add prefix for docker-compose when not inside the container):
```
php -f src/index.php
docker compose exec php-fpm php -f src/index.php
```

To trigger tests:

1- Trigger the command
```
vendor/bin/phpunit
docker compose exec php-fpm vendor/bin/phpunit
```
or filter just one file
```
vendor/bin/phpunit --filter ResultTest
docker-compose exec php-fpm vendor/bin/phpunit --filter ResultTest
```

2- To generate the Coverage report: 
```
 vendor/bin/phpunit --coverage-html tests/report
 docker-compose exec php-fpm  vendor/bin/phpunit --coverage-html tests/report
```

__About the container:__

See php.ini file
````
docker-compose exec php-fpm php --ini
````
or php version
``
docker-compose exec php-fpm php --version  
``

To stop it: 
``
docker compose down
``

To remove all containers:
``
docker system prune -a
``