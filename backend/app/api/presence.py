from typing import Annotated, Optional

from fastapi import APIRouter, Cookie, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.services import presence as presence_service

router = APIRouter(tags=["Presence"])


class HeartbeatRequest(BaseModel):
    visitor_id: Optional[str] = Field(None, max_length=64)
    path: Optional[str] = Field(None, max_length=200)


class HeartbeatResponse(BaseModel):
    visitor_id: str
    ok: bool = True


class PresenceSnapshot(BaseModel):
    online_total: int
    online_logged_in: int
    online_guests: int
    ttl_seconds: int
    recent: list


@router.post("/presence/heartbeat", response_model=HeartbeatResponse)
def presence_heartbeat(
    payload: HeartbeatRequest,
    db: Annotated[Session, Depends(get_db)],
    access_token: Annotated[str | None, Cookie(alias="access_token")] = None,
):
    """Public: browser pings while the site is open."""
    user_id = None
    if access_token:
        token = decode_token(access_token)
        if token and token.get("type") == "access" and token.get("sub"):
            try:
                uid = int(token["sub"])
                user = db.get(User, uid)
                if user and user.is_active:
                    user_id = user.id
            except (TypeError, ValueError):
                user_id = None

    vid = presence_service.heartbeat(
        payload.visitor_id,
        user_id=user_id,
        path=payload.path,
    )
    return HeartbeatResponse(visitor_id=vid)


@router.get("/admin/presence", response_model=PresenceSnapshot)
def admin_presence(
    _: Annotated[User, Depends(get_current_admin_user)],
):
    """Admin only: who is online right now (near real-time)."""
    return presence_service.snapshot()
