from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "T-Shirt Design Studio"
    debug: bool = True

    # Storage paths (inside container)
    upload_dir: Path = Path("/app/uploads")
    mockup_dir: Path = Path("/app/mockups")
    template_dir: Path = Path("/app/templates")
    db_path: Path = Path("/app/data/tshirt.db")

    # Upload limits
    max_upload_size_mb: int = 10
    allowed_extensions: set[str] = {".png", ".jpg", ".jpeg", ".svg", ".webp"}

    # CORS
    cors_origins: list[str] = ["http://localhost:9005", "http://localhost:5173"]

    editor_session_ttl_seconds: int = 60 * 30
    background_removal_limit: int = 5
    background_removal_ip_limit: int = 20
    max_background_removal_pixels: int = 25_000_000
    background_removal_window_seconds: int = 60 * 60
    require_turnstile: bool = False
    turnstile_secret: str | None = None
    turnstile_site_key: str | None = None

    class Config:
        env_prefix = "TSHIRT_"


settings = Settings()
