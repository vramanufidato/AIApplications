import subprocess
import tempfile
from pathlib import Path
import os

def capture_photo() -> bytes:
    """Capture a still via libcamera and return JPEG bytes."""
    # Added fallback for Windows/Mac local testing without libcamera
    if os.name == 'nt' or not subprocess.run(["which", "libcamera-still"], capture_output=True).stdout:
        # Fallback to returning None so app.py handles it, or raise warning
        raise NotImplementedError("libcamera-still not found. Use file upload for local testing on Windows.")
        
    tmp = Path(tempfile.mktemp(suffix=".jpg"))
    subprocess.run(
        ["libcamera-still", "-o", str(tmp), "-t", "2000",
         "--width", "1920", "--height", "1080", "--autofocus-mode", "auto"],
        check=True, capture_output=True,
    )
    data = tmp.read_bytes()
    tmp.unlink()
    return data
