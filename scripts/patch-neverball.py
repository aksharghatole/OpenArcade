from pathlib import Path
import json

p = Path("js/service-worker.in.js")
s = p.read_text()
# Use the registration scope rather than the domain root, and avoid deleting unrelated caches.
assert "const urls = [" in s and "if (key === cacheName)" in s
s = s.replace("const cacheName = 'neverball-", "const cacheName = 'neverball-openarcade-")
s = s.replace("const urls = [", "const scope = new URL(self.registration.scope);\nconst urls = [", 1)
s = s.replace("];", "].map(path => new URL(path.replace(/^\\//, ''), scope).pathname);", 1)
s = s.replace("if (key === cacheName)", "if (key === cacheName || !key.startsWith('neverball-openarcade-'))")
p.write_text(s)
p = Path("js/neverball.webmanifest")
manifest = json.loads(p.read_text())
manifest["start_url"] = "./"
manifest["scope"] = "./"
p.write_text(json.dumps(manifest, indent=2) + "\n")

# Put modified-source and dependency notices next to the original source link.
p = Path("js/index.html")
s = p.read_text()
anchor = 'download="neverball-source.zip">neverball-source.zip</a>'
assert anchor in s
s = s.replace(anchor, anchor + ' · <a href="./source/openarcade.patch">Integration patch</a> · <a href="./source/neverball.md">Build instructions and license notes</a> · <a href="./source/gl4es-source.zip">gl4es source</a>')
p.write_text(s)
