#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$(realpath "$1")"
assets="$(realpath "$2")"
out="$(realpath -m "$3")"
pin=ddf0347a4fc115b11ffb1c5710768b7c47c46698
test "$(git -C "$src" rev-parse HEAD)" = "$pin"
test -z "$(git -C "$src" status --porcelain)"
test -s "$assets/freedoom1.wad"
test -s "$assets/freedoom2.wad"
# The engine's own WAD is built from source, not downloaded from a commercial game.
cd "$src"
cmake -S . -B build_native -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=/usr/bin/gcc -DCMAKE_CXX_COMPILER=/usr/bin/g++ -DBUILD_GL=OFF
cmake --build build_native --target prboomwad -j2
test -s build_native/prboomx.wad
mkdir -p wasm/fs
cp build_native/prboomx.wad "$assets/freedoom1.wad" "$assets/freedoom2.wad" wasm/fs/
python3 "$root/scripts/patch-freedoom.py"
emcmake cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_GL=OFF
cmake --build build -j2
dest="$out/games/freedoom"
mkdir -p "$dest/source"
for f in index.html index.js index.data index.wasm; do
  test -s "build/$f"
  cp "build/$f" "$dest/"
done
git archive --prefix=dwasm-source/ --format=zip HEAD > "$dest/source/dwasm-source.zip"
git diff --binary > "$dest/source/openarcade.patch"
cp COPYING "$dest/source/DWASM-COPYING.txt"
cp -R "$assets/notices/." "$dest/source/"
cp "$root/scripts/build-freedoom.sh" "$root/scripts/patch-freedoom.py" "$root/docs/freedoom.md" "$dest/source/"
cp "$root/index.html" "$root/sw.js" "$out/"
cp -R "$root/games/starfall" "$out/games/"
cp "$root/LICENSE" "$out/"
python3 - "$out" <<'PY'
from pathlib import Path
import sys
root = Path(sys.argv[1])
p = root / 'index.html'
s = p.read_text()
assert "play:'https://decompgames.com/games/freedoom/'" in s
s = s.replace("play:'https://decompgames.com/games/freedoom/'", "play:'./games/freedoom/'")
s = s.replace("host:'Community port listing'", "host:'Integrated WebAssembly candidate'")
s = s.replace("if(g.id==='starfall')", "if(g.id==='starfall'||g.id==='freedoom')")
p.write_text(s)
PY
du -sh "$dest"
