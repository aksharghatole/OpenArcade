#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$(realpath "$1")"
gfx="$(realpath "$2")"
out="$(realpath -m "$3")"
test "$(git -C "$src" rev-parse HEAD)" = 14ec60f248547d4d062a1160f0fc26d742319888
test "$(git -C "$gfx" rev-parse HEAD)" = 013cbc9e700c796af001a381a2d93592d49146ac
cd "$src"
cp os/emscripten/ports/liblzma.py /emsdk/upstream/emscripten/tools/ports/contrib/
cmake -S . -B build-host -DOPTION_TOOLS_ONLY=ON
cmake --build build-host -j2 --target tools
emcmake cmake -S . -B build -DHOST_BINARY_DIR="$src/build-host" -DCMAKE_BUILD_TYPE=Release -DOPTION_USE_ASSERTS=OFF
mkdir -p build/baseset
python3 "$root/scripts/fetch-opengfx2.py" build/baseset/opengfx2-classic.tar
emmake cmake --build build -j2 --target openttd
dest="$out/games/openttd"
mkdir -p "$dest/source"
for f in openttd.html openttd.js openttd.wasm openttd.data; do
  test -s "build/$f"
  cp "build/$f" "$dest/"
done
git archive --format=zip --prefix=openttd-source/ HEAD > "$dest/source/openttd-source.zip"
git -C "$gfx" archive --format=zip --prefix=opengfx2-source/ HEAD > "$dest/source/opengfx2-source.zip"
cp COPYING.md "$dest/source/OPENTTD-COPYING.md"
cp CREDITS.md "$dest/source/OPENTTD-CREDITS.md"
cp "$gfx/LICENSE" "$dest/source/OPENGFX2-LICENSE.txt"
cp "$gfx/credits.md" "$dest/source/OPENGFX2-CREDITS.md"
cp "$root/docs/openttd.md" "$root/scripts/build-openttd.sh" "$root/scripts/fetch-opengfx2.py" "$dest/source/"
cp "$root/games/openttd-candidate/index.html" "$dest/index.html"
cp "$root/index.html" "$root/sw.js" "$out/"
cp -R "$root/games/starfall" "$out/games/"
cp "$root/LICENSE" "$out/"
python3 - "$out" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1]) / 'index.html'
s = p.read_text()
assert "play:'https://openwebports.org/ports/openttd/'" in s
s = s.replace("play:'https://openwebports.org/ports/openttd/'", "play:'./games/openttd/'")
s = s.replace("host:'Community port'},\n{id:'freedoom'", "host:'Integrated WebAssembly candidate'},\n{id:'freedoom'")
s = s.replace("if(g.id==='starfall')", "if(g.id==='starfall'||g.id==='openttd')")
p.write_text(s)
PY
du -sh "$dest"
