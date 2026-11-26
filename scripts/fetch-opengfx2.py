#!/usr/bin/env python3
"""Retrieve a pinned official base graphics tar; verify before staging."""
import hashlib
from pathlib import Path
import sys
import tarfile
import urllib.request
import io

URL = "https://github.com/OpenTTD/OpenGFX2/releases/download/0.8.1/OpenGFX2_Classic-0.8.1.tar"
SHA = "2f4d0d8cd82b9b15d7c5a742581bfd11a08d4fd54fc0743f1f8a1032e3b5eeaf"
out = Path(sys.argv[1])
with urllib.request.urlopen(URL, timeout=120) as response:
    data = response.read(80 * 1024 * 1024 + 1)
if len(data) > 80 * 1024 * 1024 or hashlib.sha256(data).hexdigest() != SHA:
    raise RuntimeError("OpenGFX2 release size or SHA256 mismatch")
with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as archive:
    members = archive.getmembers()
    if not any(m.isfile() and m.name.lower().endswith(".obg") for m in members):
        raise RuntimeError("Missing base graphics descriptor")
    if not any(m.isfile() and m.name.lower().endswith(".grf") for m in members):
        raise RuntimeError("Missing graphics payload")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(data)
print("Verified OpenGFX2 Classic 0.8.1", SHA)
