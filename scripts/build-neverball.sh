#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$(realpath "$1")"
out="$(realpath -m "$2")"
pin=7f32a34065f946cc84d619a001cc5d5b829a0671
test "$(git -C "$src" rev-parse HEAD)" = "$pin"
test -z "$(git -C "$src" status --porcelain)"
export GL4ES_COMMIT=c9895df34cd466c23bc60c2bd3db3d87e98fcbe7
export GL4ES_DIR=/opt/gl4es
cd "$src"
# Scope the upstream worker and manifest to this game's subdirectory.
python3 "$root/scripts/patch-neverball.py"
make -j2 sols
./emscripten/install-gl4es.sh
make -j2 -f emscripten/ball.mk BUILD=release PACKAGE_BASE_URL=packages/
# Build official campaigns and the required Neverputt course, without third-party addons or optional balls.
make -j2 -f mk/packages.mk OUTPUT_DIR="$src/js/packages" set-easy set-medium set-hard set-mym set-mym2 set-fwp set-tones course-putt
find js/packages -name '*.manifest.txt' -print0 | sort -z | xargs -0 cat > js/packages/available-packages.txt
# Preserve complete corresponding upstream sources plus our changes and build instructions.
mkdir -p js/source
git archive --prefix=neverball-source/ --format=zip HEAD > js/neverball-source.zip
git diff --binary > js/source/openarcade.patch
git -C "$GL4ES_DIR" archive --prefix=gl4es-source/ --format=zip "$GL4ES_COMMIT" > js/source/gl4es-source.zip
cp "$root/scripts/build-neverball.sh" "$root/scripts/patch-neverball.py" "$root/docs/neverball.md" js/source/
cp LICENSE.md js/source/NEVERBALL-LICENSE.md
cp -R doc/legal js/source/legal
mkdir -p "$out/games/neverball"
cp -R js/. "$out/games/neverball/"
cp "$root/index.html" "$root/sw.js" "$out/"
cp -R "$root/games/." "$out/games/"
cp "$root/LICENSE" "$out/"
python3 - "$out" <<'PY'
from pathlib import Path
import sys
root = Path(sys.argv[1])
p = root / 'index.html'
s = p.read_text()
assert "play:'https://play.neverball.org/'" in s
s = s.replace("play:'https://play.neverball.org/'", "play:'./games/neverball/'")
s = s.replace("host:'Web edition'},\n{id:'supertux'", "host:'Integrated WebAssembly candidate'},\n{id:'supertux'")
s = s.replace("if(g.id==='starfall')", "if(g.play.startsWith('./games/'))")
p.write_text(s)
p = root / 'sw.js'
s = p.read_text()
old = "if(url.origin!==self.location.origin)return;"
assert old in s
# Neverball owns its worker/cache; prevent the parent worker intercepting game requests.
p.write_text(s.replace(old, old + "if(url.pathname.startsWith(new URL('games/neverball/',base).pathname))return;"))
PY
for f in neverball.js neverball.wasm neverball.data index.html service-worker.js packages/available-packages.txt neverball-source.zip; do
  test -s "$out/games/neverball/$f"
done
grep -qx 'package set-easy' "$out/games/neverball/packages/available-packages.txt"
grep -qx 'package course-putt' "$out/games/neverball/packages/available-packages.txt"
du -sh "$out"
