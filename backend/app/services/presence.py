"""In-memory presence tracker for near real-time online counts.

Works on a single API process (e.g. one Render free instance).
Visitors expire after TTL seconds without a heartbeat.
"""
from __future__ import annotations

import threading
import time
import uuid
from typing import Any, Dict, Optional

# Seconds without heartbeat before a visitor is considered offline
PRESENCE_TTL_SECONDS = 90

_lock = threading.Lock()
# visitor_id -> { last_seen: float, user_id: optional int, path: str }
_presence: Dict[str, Dict[str, Any]] = {}


def _purge_locked(now: float) -> None:
    expired = [
        vid
        for vid, meta in _presence.items()
        if now - float(meta.get("last_seen", 0)) > PRESENCE_TTL_SECONDS
    ]
    for vid in expired:
        _presence.pop(vid, None)


def heartbeat(
    visitor_id: Optional[str],
    *,
    user_id: Optional[int] = None,
    path: Optional[str] = None,
) -> str:
    """Record a heartbeat; returns the visitor_id (creates one if missing)."""
    now = time.time()
    vid = (visitor_id or "").strip() or str(uuid.uuid4())
    with _lock:
        _purge_locked(now)
        prev = _presence.get(vid) or {}
        _presence[vid] = {
            "last_seen": now,
            "user_id": user_id if user_id is not None else prev.get("user_id"),
            "path": (path or prev.get("path") or "/")[:200],
        }
        return vid


def snapshot() -> Dict[str, Any]:
    """Admin-facing online counts."""
    now = time.time()
    with _lock:
        _purge_locked(now)
        total = len(_presence)
        logged_in_ids = {
            meta["user_id"]
            for meta in _presence.values()
            if meta.get("user_id") is not None
        }
        guests = sum(1 for meta in _presence.values() if meta.get("user_id") is None)
        recent = sorted(
            (
                {
                    "visitor_id": vid[:8] + "…",
                    "user_id": meta.get("user_id"),
                    "path": meta.get("path"),
                    "seconds_ago": int(now - float(meta["last_seen"])),
                }
                for vid, meta in _presence.items()
            ),
            key=lambda row: row["seconds_ago"],
        )[:20]
        return {
            "online_total": total,
            "online_logged_in": len(logged_in_ids),
            "online_guests": guests,
            "ttl_seconds": PRESENCE_TTL_SECONDS,
            "recent": recent,
        }
