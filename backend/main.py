"""Entry point for hosts that run `uvicorn main:app` from the backend/ directory (e.g. Render)."""
from app.main import app

__all__ = ["app"]
