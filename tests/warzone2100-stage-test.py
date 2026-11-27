import hashlib
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("stage", Path(__file__).resolve().parents[1] / "scripts" / "stage-warzone2100.py")
stage = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stage)

class ArchiveTests(unittest.TestCase):
    def run_archive(self, members, expected=None):
        with tempfile.TemporaryDirectory() as temp:
            base = Path(temp)
            archive = base / "archive.zip"
            with zipfile.ZipFile(archive, "w") as z:
                for name, contents in members:
                    z.writestr(name, contents)
            digest = hashlib.sha256(archive.read_bytes()).hexdigest()
            return stage.extract_verified(archive, base / "out", expected or digest).name

    def test_nested_web_entry(self):
        self.assertEqual(self.run_archive([("web/index.html", "html"), ("web/game.wasm", "wasm")]), "web")

    def test_hash_mismatch(self):
        with self.assertRaisesRegex(ValueError, "SHA256"):
            self.run_archive([("index.html", "html")], "0" * 64)

    def test_path_traversal(self):
        with self.assertRaisesRegex(ValueError, "Unsafe"):
            self.run_archive([("../escape", "bad")])

    def test_missing_wasm(self):
        with self.assertRaisesRegex(ValueError, "web entry"):
            self.run_archive([("index.html", "html")])

if __name__ == "__main__":
    unittest.main()
