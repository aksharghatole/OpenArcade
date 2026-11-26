# OpenTTD candidate

Full OpenTTD 15.3, pinned to 14ec60f248547d4d062a1160f0fc26d742319888. Official Emscripten 3.1.57 build, matching upstream CI. OpenGFX2 Classic 0.8.1 from the official release, SHA256 pinned and source commit 013cbc9e700c796af001a381a2d93592d49146ac. Only the Classic graphics set is included; no original Transport Tycoon Deluxe assets or commercial data.

Upstream links:
- https://github.com/OpenTTD/OpenTTD/tree/14ec60f248547d4d062a1160f0fc26d742319888
- https://github.com/OpenTTD/OpenGFX2/releases/tag/0.8.1

The game engine is GPLv2 with third-party exceptions; the graphics repository supplies GPLv2 terms. Both exact upstream source archives, credits, licenses and integration build scripts accompany the candidate. Review per-file asset and dependency notices, Emscripten ports and corresponding source obligations before public deployment. The independent OpenArcade launcher remains under its own MIT license.

The upstream build preloads the build/baseset directory, so the official graphics TAR is staged there before linking. No original proprietary graphics required. Upstream pre.js requests null music and sound drivers, so this first candidate is silent. Upstream IndexedDB persistence is retained, not yet verified. Online multiplayer and additional content downloads are outside this candidate's scope; first launch is tested with external requests blocked.

Reproduce in emscripten/emsdk:3.1.57 with GCC/G++ 12 configured as in the official CI. Clone both exact commits and run bash scripts/build-openttd.sh ENGINE_DIR GRAPHICS_SOURCE_DIR OUTPUT_DIR. This modifies a disposable engine checkout and the container's Emscripten ports.

The workflow creates a preview artifact and runs a browser startup check. It does not deploy GitHub Pages. Before release verify actual map creation, track building, save/load, graphics rendering and Android usability; complete the license review. No offline, sound, touch or multiplayer support is claimed.
