# Hextris — OpenArcade edition

Original game by Logan Engstrom, Garrett Finucane, Noah Moroze and Michael Yang. Copyright (C) 2018 Logan Engstrom. GPL-3.0-or-later, see [LICENSE.md](LICENSE.md).

Pinned upstream source: https://github.com/Hextris/hextris/tree/3f4847dc8fd7dab3d1c87e6324b9159d92fbd396. All modified game JavaScript and stylesheets are distributed here in source form under GPL-3.0-or-later. These are separate from the surrounding MIT-licensed OpenArcade catalogue. No proprietary game data is included.

Dependency: jQuery 3.7.1 (MIT), from https://github.com/jquery/jquery-dist/tree/3.7.1, corresponding readable source: https://github.com/jquery/jquery/tree/3.7.1. See vendor/JQUERY-LICENSE.txt. No other upstream vendor libraries, font binaries, promotional artwork, app-store logos, analytics, advertising, or external score servers are bundled. SVG control icons are newly created for this port.

OpenArcade modifications: local HTML shell, system fonts, removal of analytics and remote scripts, replacement of deprecated input libraries with native input and gamepad polling, namespaced data-only checkpoint format (no eval), pagehide/periodic saving, isolated service worker, mobile touch buttons. Upstream gameplay classes, wave generation, scoring, and rendering are retained. Save data from the original external site is intentionally not imported.

Keyboard: arrows/A/D rotate, down/S accelerate, P/Space pause, Enter start/resume. Touch: left/right half of board or buttons, hold down button to accelerate. Controller: D-pad/stick, A start/resume, Start pause. Save is automatic during active play. First online visit must finish caching before offline play.
