#!/usr/bin/env python3
"""Stage the official Warzone 2100 web release for local candidate testing only."""
import hashlib
import shutil
import stat
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

VERSION = "4.7.0"
URL = f"https://github.com/Warzone2100/warzone2100/releases/download/{VERSION}/warzone2100_web_wasm32_archive.zip"
SHA256 = "f729df690038511e0dee662554475a9a9a7c8a9488a268d647b93e7953820ee3"
LIMIT = 512 * 1024 * 1024
ROOT = Path(__file__).resolve().parents[1]

def extract_verified(archive, target, expected=SHA256):
    with archive.open("rb") as stream:
        if hashlib.file_digest(stream, "sha256").hexdigest() != expected:
            raise ValueError("Warzone archive SHA256 mismatch")
    with zipfile.ZipFile(archive) as z:
        seen = set()
        total = 0
        for entry in z.infolist():
            p = PurePosixPath(entry.filename)
            if (p.is_absolute() or not p.parts or ".." in p.parts or
                    "\\" in entry.filename or ":" in entry.filename or
                    stat.S_ISLNK(entry.external_attr >> 16)):
                raise ValueError("Unsafe archive member: " + entry.filename)
            if p in seen:
                raise ValueError("Duplicate archive member")
            seen.add(p)
            total += entry.file_size
            if total > LIMIT:
                raise ValueError("Expanded archive exceeds size budget")
        z.extractall(target)
    pages = [p for p in target.rglob("index.html")
             if any(p.parent.rglob("*.wasm"))]
    if len(pages) != 1:
        raise ValueError("Expected exactly one web entry with a WASM payload")
    return pages[0].parent

def stage(archive, out):
    if out.exists():
        raise ValueError("Use a fresh preview output directory")
    with tempfile.TemporaryDirectory() as temp:
        webroot = extract_verified(archive, Path(temp))
        out.mkdir(parents=True)
        shutil.copytree(ROOT / "games", out / "games")
        game = out / "games" / "warzone2100"
        shutil.copytree(webroot, game)
        shutil.copy2(ROOT / "docs" / "warzone2100.md", game / "OPENARCADE-CANDIDATE.md")
        index = (ROOT / "index.html").read_text()
        anchor = "const $=id=>"
        if index.count(anchor) != 1 or "id:'warzone2100'" in index:
            raise ValueError("Catalogue changed; review integration")
        card = "games.push({id:'warzone2100',name:'Warzone 2100',genre:'Strategy',mode:'3D',mark:'WZ',tone:'#535c38',desc:'Official WebAssembly RTS candidate; desktop keyboard and mouse recommended.',play:'./games/warzone2100/',source:'https://github.com/Warzone2100/warzone2100/tree/4.7.0',host:'Local preview · Unverified'});\n"
        (out / "index.html").write_text(index.replace(anchor, card + anchor))
        worker = (ROOT / "sw.js").read_text()
        anchor = "if(url.origin!==self.location.origin)return;"
        if worker.count(anchor) != 1:
            raise ValueError("Root worker changed; review isolation")
        (out / "sw.js").write_text(worker.replace(anchor, anchor +
            "if(url.pathname.startsWith(new URL('games/warzone2100/',base).pathname))return;"))
        print("Candidate staged at", game)

def main():
    out = Path(sys.argv[1]).resolve()
    with tempfile.TemporaryDirectory() as temp:
        archive = Path(temp) / "warzone.zip"
        with urllib.request.urlopen(URL, timeout=120) as response, archive.open("wb") as dest:
            size = 0
            while chunk := response.read(1024 * 1024):
                size += len(chunk)
                if size > LIMIT:
                    raise ValueError("Download exceeds size budget")
                dest.write(chunk)
        stage(archive, out)

if __name__ == "__main__":
    main()
