from pathlib import Path
import json

p = Path("js/service-worker.in.js")
s = p.read_text()
# Use the registration scope rather than the domain root, and avoid deleting unrelated caches.
assert "const urls = [" in s and "if (key === cacheName)" in s
s = s.replace("const cacheName = 'neverball-", "const cacheName = 'openarcade-neverball-")
s = s.replace("const urls = [", "const scope = new URL(self.registration.scope);\nconst urls = [", 1)
s = s.replace("];", "].map(path => new URL(path.replace(/^\\//, ''), scope).pathname);", 1)
s = s.replace("if (key === cacheName)", "if (key === cacheName || !key.startsWith('openarcade-neverball-'))")
p.write_text(s)
p = Path("js/neverball.webmanifest")
manifest = json.loads(p.read_text())
manifest["start_url"] = "./"
manifest["scope"] = "./"
p.write_text(json.dumps(manifest, indent=2) + "\n")
