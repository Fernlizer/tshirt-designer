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

    class Config:
        env_prefix = "TSHIRT_"


settings = Settings()
