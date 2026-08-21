"""Short-lived browser sessions for compute-heavy editor actions.

This is defense in depth, not proof that a human is using the UI. Enable
Turnstile in production to reject scripted browsers that can load the UI.
"""
from __future__ import annotations

import secrets
import time
from collections import defaultdict, deque
from dataclasses import dataclass

import httpx
from fastapi import HTTPException, Request

from app.core.config import settings


@dataclass
class EditorSession:
    csrf_token: str
    expires_at: float


_sessions: dict[str, EditorSession] = {}
_uploads_by_session: dict[str, set[str]] = defaultdict(set)
_removal_attempts: dict[str, deque[float]] = defaultdict(deque)
_removal_attempts_by_ip: dict[str, deque[float]] = defaultdict(deque)


def _is_allowed_origin(origin: str | None) -> bool:
    return bool(origin and origin.rstrip("/") in {item.rstrip("/") for item in settings.cors_origins})


def create_session(request: Request) -> tuple[str, str]:
    if not _is_allowed_origin(request.headers.get("origin")):
        raise HTTPException(status_code=403, detail="Editor session must be created by an allowed frontend origin")
    now = time.time()
    for key, session in list(_sessions.items()):
        if session.expires_at <= now:
            _sessions.pop(key, None)
            _uploads_by_session.pop(key, None)
            _removal_attempts.pop(key, None)
    session_id = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    _sessions[session_id] = EditorSession(csrf_token=csrf_token, expires_at=now + settings.editor_session_ttl_seconds)
    return session_id, csrf_token


def require_editor_session(request: Request) -> str:
    if not _is_allowed_origin(request.headers.get("origin")):
        raise HTTPException(status_code=403, detail="Request origin is not allowed")
    if request.headers.get("sec-fetch-mode") not in {"cors", "same-origin"}:
        raise HTTPException(status_code=403, detail="Browser fetch metadata is required")
    session_id = request.cookies.get("editor_session")
    session = _sessions.get(session_id or "")
    if not session or session.expires_at <= time.time():
        if session_id:
            _sessions.pop(session_id, None)
        raise HTTPException(status_code=401, detail="Editor session has expired")
    if not secrets.compare_digest(request.headers.get("x-editor-csrf", ""), session.csrf_token):
        raise HTTPException(status_code=403, detail="Invalid editor CSRF token")
    return session_id


def register_upload(session_id: str, filename: str) -> None:
    _uploads_by_session[session_id].add(filename)


def require_owned_upload(session_id: str, filename: str) -> None:
    if filename not in _uploads_by_session.get(session_id, set()):
        raise HTTPException(status_code=403, detail="Only images uploaded in this editor session can be processed")


def _consume_rate_limit(attempts: deque[float], limit: int, now: float) -> bool:
    cutoff = now - settings.background_removal_window_seconds
    while attempts and attempts[0] <= cutoff:
        attempts.popleft()
    if len(attempts) >= limit:
        return False
    attempts.append(now)
    return True


def check_background_removal_limit(session_id: str, client_ip: str) -> None:
    now = time.time()
    if not _consume_rate_limit(_removal_attempts[session_id], settings.background_removal_limit, now):
        raise HTTPException(status_code=429, detail="Free background-removal limit reached. Please try again later.")
    if not _consume_rate_limit(_removal_attempts_by_ip[client_ip], settings.background_removal_ip_limit, now):
        _removal_attempts[session_id].pop()
        raise HTTPException(status_code=429, detail="Too many free background-removal requests from this network. Please try again later.")


async def verify_turnstile(token: str, remote_ip: str | None) -> None:
    if not settings.turnstile_secret:
        raise HTTPException(status_code=503, detail="Bot protection is not configured")
    payload = {"secret": settings.turnstile_secret, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=payload)
            verified = response.json().get("success") is True
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(status_code=503, detail="Bot protection could not be verified") from error
    if not verified:
        raise HTTPException(status_code=403, detail="Bot protection verification failed")
