"""Load project env values into Python from server/.env."""

from pathlib import Path
import os

try:
    from dotenv import load_dotenv
except ImportError as exc:
    raise SystemExit(
        "python-dotenv is required. Install it with: pip install python-dotenv"
    ) from exc

ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / "server" / ".env"

if not ENV_PATH.exists():
    raise SystemExit(f"Env file not found: {ENV_PATH}")

load_dotenv(ENV_PATH)

# Example reads; replace with your own variables.
print("Loaded env from:", ENV_PATH)
print("DATABASE_URL:", os.getenv("DATABASE_URL", "<missing>"))
print("PORT:", os.getenv("PORT", "<missing>"))
