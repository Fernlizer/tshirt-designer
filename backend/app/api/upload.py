from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel
from app.services.image_service import image_service
from app.services.background_removal_service import background_removal_service
from app.core.config import settings
from app.core.editor_security import check_background_removal_limit, register_upload, require_editor_session, require_owned_upload, verify_turnstile

router = APIRouter(prefix="/api", tags=["images"])


@router.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    """Upload an image file for use in designs."""
    session_id = require_editor_session(request)
    result = await image_service.save_upload(file)
    register_upload(session_id, result["filename"])
    return result


class BackgroundRemovalRequest(BaseModel):
    filename: str
    turnstile_token: str | None = None


@router.post("/images/remove-background")
async def remove_image_background(body: BackgroundRemovalRequest, request: Request):
    session_id = require_editor_session(request)
    require_owned_upload(session_id, body.filename)
    if settings.require_turnstile:
        if not body.turnstile_token:
            raise HTTPException(status_code=403, detail="Bot protection token is required")
        await verify_turnstile(body.turnstile_token, request.client.host if request.client else None)
    check_background_removal_limit(session_id, request.client.host if request.client else "unknown")
    result = background_removal_service.remove_background(body.filename)
    register_upload(session_id, result["filename"])
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
