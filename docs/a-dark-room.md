# A Dark Room integration

Original MPL-2.0 game source is bundled under games/a-dark-room. See UPSTREAM.md there for licensing and limitations. Serve the repo with `python -m http.server 8000`. The game is an independent silent English edition and first-visit offline cache. It uses an isolated localStorage namespace and nested worker, so resetting the adventure does not clear other OpenArcade game saves. The mobile layout keeps the upstream board and supports horizontal scrolling and touch movement. Browser CI checks actual opening gameplay, reload and offline restoration.
