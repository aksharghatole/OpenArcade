# Warzone 2100 4.7.0 — local WebAssembly candidate

This milestone stages the official full Web Edition into a separate local OpenArcade preview, not the production catalogue. The official release is pinned by version and published SHA256 (https://wz2100.net/download/). No upstream binaries or game data are committed to this repository or uploaded by the workflow.

## Provenance and release gates

- Engine, original game data, videos and soundtrack: GPL-2.0-or-later with the linking exception in https://github.com/Warzone2100/warzone2100/blob/4.7.0/COPYING.README (Pumpkin Studios, Eidos and contributors).
- Exceptions and attribution: https://github.com/Warzone2100/warzone2100/blob/4.7.0/COPYING.NONGPL lists CC BY-SA, CC0, OFL, MIT, BSD, ISC, MPL, Boost and other terms for specific assets and dependencies. Preserve all notices; verify the exact linked dependency versions and music packaging before redistribution.
- Corresponding source: official full source/data archive https://github.com/Warzone2100/warzone2100/releases/download/4.7.0/warzone2100_src.tar.xz and official Emscripten build instructions https://github.com/Warzone2100/warzone2100/blob/4.7.0/platforms/emscripten/README-build.md. Upstream workflow pins Emscripten 4.0.10. Before redistribution verify source digest, complete linked dependency sources and per-file notices, and provide full corresponding source alongside the release.
- No original commercial disc files, additional media or mods are imported. The integration script is MIT; upstream terms remain separate.

## Run the candidate

Run Python 3.11+ from the repository root: `python scripts/stage-warzone2100.py preview/OpenArcade`, then `python -m http.server 8765 --directory preview`. Visit http://localhost:8765/OpenArcade/ and select Warzone 2100. The staging script verifies the archive digest, rejects unsafe paths and large expansion, and isolates the game from the root cache. It does not change the live catalogue.

Upstream recommends WebGL2, 4–8 GiB RAM, desktop keyboard/mouse, and a 1024x768 display. The upstream web port documents campaign, skirmish, challenges and IndexedDB saves; videos may stream on demand. Touch, gamepad, offline, save/restore, skirmish and rendering are unverified. Do not deploy or claim playable until runtime and licensing gates pass.

Tests: `python tests/warzone2100-stage-test.py`. CI also attempts to stage the pinned release and checks the nested catalogue and entry over HTTP; no binary artifact is uploaded.
