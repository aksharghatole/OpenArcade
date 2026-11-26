#!/usr/bin/env python3
# Fetch only the official freely redistributable release; fail closed on checksum mismatch.
from pathlib import Path
import hashlib, re, sys, urllib.request, zipfile, shutil
base = "https://github.com/freedoom/freedoom/releases/download/v0.13.0/"
name = "freedoom-0.13.0.zip"
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
def get(url):
    with urllib.request.urlopen(url, timeout=120) as response:
        return response.read()
archive = get(base + name)
if len(archive) != 24143781:
    raise RuntimeError("Release size changed")
checks = get(base + "freedoom-0.13.0-CHECKSUM").decode()
# Accept standard sha256sum or BSD SHA256(filename) = digest format.
expected = []
for line in checks.splitlines():
    if name in line:
        expected.extend(re.findall(r"(?i)(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])", line))
if hashlib.sha256(archive).hexdigest() not in [x.lower() for x in expected]:
    raise RuntimeError("Missing or mismatched published SHA256")
(out / name).write_bytes(archive)
notices = out / "notices"; notices.mkdir(exist_ok=True)
with zipfile.ZipFile(out / name) as z:
    for filename in ("freedoom1.wad", "freedoom2.wad"):
        matches = [n for n in z.namelist() if Path(n).name.lower() == filename]
        if len(matches) != 1: raise RuntimeError("Unexpected WAD archive layout")
        with z.open(matches[0]) as f, (out / filename).open("wb") as dst:
            shutil.copyfileobj(f, dst)
        with (out / filename).open("rb") as f:
            if f.read(4) != b"IWAD": raise RuntimeError("Invalid IWAD")
    for n in z.namelist():
        leaf = Path(n).name
        if leaf.upper().startswith(("COPYING", "CREDITS", "LICENSE", "README")) and not n.endswith("/"):
            (notices / ("FREEDOOM-" + leaf)).write_bytes(z.read(n))
if not any(p.name.startswith(("FREEDOOM-COPYING","FREEDOOM-LICENSE")) for p in notices.iterdir()):
    raise RuntimeError("Release license missing")
(notices / "FREEDOOM-SHA256.txt").write_text(hashlib.sha256(archive).hexdigest() + "  " + name + "\n")
