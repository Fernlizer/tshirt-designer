from fastapi import APIRouter, Request, Response

from app.core.config import settings
from app.core.editor_security import create_session

router = APIRouter(prefix="/api/security", tags=["security"])


@router.post("/editor-session")
async def start_editor_session(request: Request, response: Response):
    session_id, csrf_token = create_session(request)
    response.set_cookie(
        key="editor_session",
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=not settings.debug,
        max_age=settings.editor_session_ttl_seconds,
        path="/api",
    )
    return {
        "csrf_token": csrf_token,
        "expires_in_seconds": settings.editor_session_ttl_seconds,
        "turnstile_site_key": settings.turnstile_site_key,
    }
