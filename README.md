# OpenArcade

A static browser game library for integrated games, open-source browser editions and legally acquired local game data.

[Launch OpenArcade](https://aksharghatole.github.io/OpenArcade/)

## Run locally

Open `index.html`, or run `python -m http.server 8000` from this directory. Starfall and the catalogue need no third-party dependencies. Service worker offline caching requires localhost or HTTPS.

## Deployment

In Settings → Pages, select Deploy from a branch, `main`, `/ (root)`. The offline worker caches the catalogue and Starfall shell after the first online visit.

## Integrated games

### Starfall

A complete original five-sector arcade brick-breaker is hosted in `games/starfall/`. It runs without external requests, includes keyboard, pointer, touchscreen and standard Gamepad API controls, and stores best score, sector reach, and a resumable checkpoint in the browser's local storage. The root service worker caches the catalogue and game files for offline play. Code and CSS graphics are original and licensed under MIT (see `LICENSE`). There are no bundled third-party game assets.

## External editions

Other catalogue cards currently link to third-party/community browser editions. Those are launch links, not bundled integrations; their controls, saves, availability and legal terms belong to their respective hosts. No commercial ROMs or copyrighted game data are included.

## Integration policy

For every bundled third-party game, pin the upstream version and check engine, asset, music and dependency licenses separately. Retain required notices and provide corresponding source/build instructions. Never bundle commercial ROMs or copyrighted game data without authorization. Imported user game files should stay on-device. Verify hosting limits, cross-origin headers, controls and saves before claiming support.

## Roadmap

- Integrate a verified full open-source game or WebAssembly port. The open issue tracks Neverball licensing/build verification and an alternative if needed.
- Add local import adapters for compatible games and emulators using legally redistributable test data.
- Expand save export, accessibility and offline library management.
