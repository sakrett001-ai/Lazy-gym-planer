"""Compatibility entry point; no Playwright or fixed machine paths."""
import subprocess
import sys
from pathlib import Path

if __name__ == "__main__":
    script = Path(__file__).resolve().with_name("biomechanics-audit.js")
    sys.exit(subprocess.run(["node", str(script)] + ["--only", "side"] + sys.argv[1:]).returncode)
