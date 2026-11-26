# OpenArcade

A browser game library for full open-source games and legally acquired local game data.

[Launch OpenArcade (once Pages is enabled)](https://aksharghatole.github.io/OpenArcade/)

## Run locally

Open `index.html` or run `python -m http.server 8000` from this directory. No API keys or dependencies.

## Deployment

In Settings → Pages, select Deploy from a branch, `main`, `/ (root)`. GitHub Pages serves the static portal without a backend.

## Current status

Six external launchers, search, genre filtering and browser-local favourites. The linked games are not bundled or gameplay-tested. Some links point to community port listings. No game binaries, commercial assets, emulator or offline runtime is distributed yet.

## Integration policy

For each bundled game record the pinned upstream version, code and asset licenses separately, retain notices, and provide corresponding source/build instructions when required. Never bundle commercial ROMs or copyrighted game data without authorization. Imported user game files should stay on-device. Verify hosting limits, cross-origin headers, controls and saves before claiming support.

## Roadmap

1. Integrate a self-hosted 3D WebAssembly title.
2. Add local import and emulator adapters with legally redistributable test data.
3. Add controller/touch controls and save export.
4. Add optional offline caching and graphics options.
