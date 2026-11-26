# OpenArcade integration, 2026-11-26. Engine code remains upstream.
from pathlib import Path
p = Path("wasm/shell.html")
s = p.read_text()
s = s.replace("<title>Dwasm</title>", "<title>Freedoom · OpenArcade</title>\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">")
anchor = 'arguments: window.location.search.length > 1 ? window.location.search.substr(1).split(\'&\') : []'
assert anchor in s
s = s.replace(anchor, """arguments: ['-iwad', new URLSearchParams(location.search).get('phase') === '1' ? 'freedoom1.wad' : 'freedoom2.wad']""")
# In-page campaign navigation and visible license/source links; no remote game dependencies.
toolbar = """
    <nav aria-label="Freedoom campaign selection" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;padding:12px;background:#121923">
      <a style="color:#a2f1c8" href="../../">← OpenArcade</a>
      <a style="color:#a2f1c8" href="?phase=1">Phase 1</a>
      <a style="color:#a2f1c8" href="?phase=2">Phase 2</a>
      <a style="color:#a2f1c8" href="source/freedoom.md">Licenses and source</a>
      <a style="color:#a2f1c8" href="source/dwasm-source.zip">Engine source</a>
      <span>Arrows: move · Ctrl: fire · Space: use · Esc: menu</span>
    </nav>
"""
assert "<body>" in s
s = s.replace("<body>", "<body>" + toolbar, 1)
# Avoid interpolating arbitrary runtime messages into HTML.
s = s.replace("statusElement.innerHTML = text;", "statusElement.textContent = text;")
p.write_text(s)
