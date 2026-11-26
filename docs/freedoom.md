# Freedoom candidate

Freedoom Phase 1 and Phase 2, official version 0.13.0, with Dwasm (PrBoom+/PrBoomX), pinned to ddf0347a4fc115b11ffb1c5710768b7c47c46698. Dwasm explicitly lists both campaigns as compatible. No proprietary Doom WADs, shareware, soundfonts or commercial assets are fetched.

- Engine source: https://github.com/GMH-Code/Dwasm/tree/ddf0347a4fc115b11ffb1c5710768b7c47c46698 (GPL v2; see COPYING and per-file notices).
- Game data: https://github.com/freedoom/freedoom/releases/tag/v0.13.0 (BSD 3-Clause; see release notices).
- Dwasm's upstream OPL synthesis and software renderer are used; no GL4ES or optional soundfonts.
- Both full IWADs are preloaded; Phase 2 defaults, Phase 1 selectable via query.
- Upstream browser persistence and gamepad handling are retained, not yet verified. Dedicated mobile touch controls are not yet added.

This is a candidate artifact, NOT a Pages deployment. Before production distribution, independently review the full dependency notices and corresponding-source obligations, including Emscripten ports; run the browser tests and real levels, saves, input and audio; review offline storage. Source archive, patch, build instructions, upstream GPL text and Freedoom release notices accompany the candidate. The MIT OpenArcade portal is separate; upstream engine and shell remain GPL. Do not merge as a claim of production readiness.

Build using emscripten/emsdk:4.0.10 with dependencies from the workflow. Run scripts/fetch-freedoom.py ASSET_DIR, then bash scripts/build-freedoom.sh CLEAN_PINNED_DWASM_DIR ASSET_DIR OUTPUT_DIR. A disposable checkout is required.
