# Hextris integration

The complete upstream GPL browser game is bundled in games/hextris. See games/hextris/UPSTREAM.md for pinned source, attribution, licensing and modifications. Run using a static server. Unlike the root catalogue cache, the game uses a dedicated scoped offline worker installed on its first visit; it does not depend on the Neverball or 2048 changes.

Browser tests: run `npm install --no-save --no-package-lock playwright@1.51.1`, `npx playwright install chromium`, start `python -m http.server 8000`, then `node tests/hextris-browser.cjs`. Physical Android/controller and full-session verification remain separate from automated Chromium tests.
