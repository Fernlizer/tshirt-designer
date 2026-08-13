import uuid
import shutil
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import settings


class ImageService:
    """Handle image upload, validation, and processing."""

    @staticmethod
    def validate_file(file: UploadFile) -> None:
        ext = Path(file.filename or "").suffix.lower()
        if ext not in settings.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type '{ext}' not allowed. Allowed: {', '.join(settings.allowed_extensions)}",
            )

    @staticmethod
    async def save_upload(file: UploadFile) -> dict:
        """Save uploaded image and return metadata."""
        ImageService.validate_file(file)

        ext = Path(file.filename or "").suffix.lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        save_path = settings.upload_dir / filename

        settings.upload_dir.mkdir(parents=True, exist_ok=True)

        with open(save_path, "wb") as f:
            content = await file.read()

            if len(content) > settings.max_upload_size_mb * 1024 * 1024:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {settings.max_upload_size_mb}MB",
                )
            f.write(content)

        # Get image dimensions
        width, height = 0, 0
        try:
            with Image.open(save_path) as img:
                width, height = img.size
        except Exception:
            pass

        return {
            "filename": filename,
            "original_name": file.filename,
            "url": f"/api/uploads/{filename}",
            "width": width,
            "height": height,
            "size_bytes": len(content),
        }

    @staticmethod
    def list_uploads() -> list[dict]:
        """List all uploaded images."""
        settings.upload_dir.mkdir(parents=True, exist_ok=True)
        files = []
        for f in sorted(settings.upload_dir.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
            if f.suffix.lower() in settings.allowed_extensions:
                files.append({
                    "filename": f.name,
                    "url": f"/api/uploads/{f.name}",
                    "size_bytes": f.stat().st_size,
                })
        return files

    @staticmethod
    def delete_upload(filename: str) -> bool:
        path = settings.upload_dir / filename
        if path.exists():
            path.unlink()
            return True
        return False


image_service = ImageService()
