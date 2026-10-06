"""Both elbows in body coordinates; no build or browser needed."""
import subprocess
import sys
from pathlib import Path

if __name__ == "__main__":
    script = Path(__file__).resolve().with_name("biomechanics-audit.js")
    sys.exit(subprocess.run(["node", str(script)] + ["--elbows"] + sys.argv[1:]).returncode)
