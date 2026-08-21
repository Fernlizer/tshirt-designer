from pathlib import Path
import uuid

from fastapi import HTTPException
from PIL import Image
from rembg import remove

from app.core.config import settings


class BackgroundRemovalService:
    """Run the local open-source rembg model; no image is sent to a third party."""

    allowed_source_extensions = {".png", ".jpg", ".jpeg", ".webp"}

    @staticmethod
    def remove_background(filename: str) -> dict:
        source = settings.upload_dir / Path(filename).name
        if not source.exists():
            raise HTTPException(status_code=404, detail="Uploaded image not found")
        if source.suffix.lower() not in BackgroundRemovalService.allowed_source_extensions:
            raise HTTPException(status_code=400, detail="Background removal supports PNG, JPG, and WebP images")
        try:
            with Image.open(source) as image:
                width, height = image.size
            if width < 32 or height < 32:
                raise HTTPException(status_code=400, detail="Image must be at least 32 × 32 pixels")
            if width * height > settings.max_background_removal_pixels:
                raise HTTPException(status_code=400, detail="Image is too large for free background removal")
            output = remove(source.read_bytes())
        except HTTPException:
            raise
        except Exception as error:
            raise HTTPException(status_code=422, detail="Could not remove the background from this image") from error

        output_name = f"nobg_{uuid.uuid4().hex}.png"
        (settings.upload_dir / output_name).write_bytes(output)
        return {
            "filename": output_name,
            "original_name": f"background-removed-{source.stem}.png",
            "url": f"/api/uploads/{output_name}",
        }


background_removal_service = BackgroundRemovalService()
