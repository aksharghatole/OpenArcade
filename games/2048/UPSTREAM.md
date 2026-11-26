# 2048 — OpenArcade edition

Original game: Gabriele Cirulli, 2014. Source: https://github.com/gabrielecirulli/2048

Pinned revision: `478b6ec346e3787f589e4af751378d06ded4cbbc`.

License: MIT; the complete upstream copyright and license are retained in LICENSE.txt. The original JavaScript engine, grid, tile, actuator and browser polyfills are included as readable source. No commercial game data, external runtime services, music, font binaries, icons, screenshots or third-party asset packs are distributed. The CSS tile artwork is part of the upstream MIT-licensed source. System fonts replace Clear Sans. Upstream SCSS/build tooling is unnecessary for the checked-in, ready-to-run CSS.

Local adaptation: navigation and attribution, system fonts, focusable touch buttons, controller adapter, isolated localStorage keys, invalid JSON fallback and saving the keep-playing choice immediately. No external network request is necessary to play.

Run the repository with `python -m http.server 8000`, then open `http://localhost:8000/games/2048/`. HTTPS or localhost is required for offline service worker support. Progress resumes on reload unless local storage is blocked or the game has ended; clearing browser data removes saves. The controller uses the standard browser Gamepad API.
