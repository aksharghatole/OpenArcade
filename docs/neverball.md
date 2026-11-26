# Neverball integration candidate

This is a reproducible build candidate, not an advertised production integration.
Upstream: https://github.com/Neverball/neverball/tree/7f32a34065f946cc84d619a001cc5d5b829a0671
Build based on the upstream web-deploy workflow, with Emscripten 3.1.65 and gl4es c9895df34cd466c23bc60c2bd3db3d87e98fcbe7.

The build includes the upstream base game, seven official level sets and Neverputt course. It does not fetch third-party addon packs or optional ball skins (including Octocat). The package URL is local, and the game worker is scoped below /games/neverball/. Source archives, the exact patch and integration scripts are included in the candidate.

License review: upstream LICENSE.md states GPL-2.0-or-later, with GPLv3 easing code, MIT miniz, font and dependency exceptions; see upstream doc/legal. Treat the candidate as GPLv3-compatible, separate from the MIT portal. Before public production release, review every bundled asset and dependency notice, including gl4es and Emscripten ports, source availability and upstream media. Do not infer permission for external addon content. Verify source/build reproducibility and any license obligations independently.

The workflow builds a candidate artifact, not a Pages deployment. It runs a real Chromium load/start check on a simulated nested Pages path. This is not a complete playthrough or physical Android/controller test. After a green build and licensing review, validate an actual level, inputs, persistence and offline behavior, and then deploy the generated site via Pages Actions. Do not replace the live catalogue link until these gates pass.

Local reproduction: use emscripten/emsdk:3.1.65, install the apt packages listed in the workflow, clone the pinned upstream commit into a clean directory, and run scripts/build-neverball.sh UPSTREAM_DIR OUTPUT_DIR from this repository. The script modifies the upstream checkout, so use a disposable clone.
