from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.image_service import image_service

router = APIRouter(prefix="/api", tags=["images"])


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file for use in designs."""
    result = await image_service.save_upload(file)
    return result


@router.get("/images")
async def list_images():
    """List all uploaded images."""
    return image_service.list_uploads()


@router.delete("/images/{filename}")
async def delete_image(filename: str):
    """Delete an uploaded image."""
    if not image_service.delete_upload(filename):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"ok": True}
