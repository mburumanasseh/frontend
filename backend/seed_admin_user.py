"""
Seed (or ensure) the first admin user.

Usage (from backend/ with venv active and DATABASE_URL set):

  export SEED_ADMIN_EMAIL=you@example.com
  export SEED_ADMIN_PASSWORD='your-secure-password'
  export SEED_ADMIN_NAME='Your Name'
  export SEED_ADMIN_PHONE='0700000000'   # optional
  python seed_admin_user.py

Creates the user if missing, sets is_admin=True, does not print the password.
Set SEED_ADMIN_RESET_PASSWORD=1 to also update the password on an existing user.
"""
from __future__ import annotations

import os
import sys

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User


def main() -> int:
    email = (os.getenv("SEED_ADMIN_EMAIL") or "").strip().lower()
    password = os.getenv("SEED_ADMIN_PASSWORD") or ""
    name = (os.getenv("SEED_ADMIN_NAME") or "Admin").strip()
    phone = (os.getenv("SEED_ADMIN_PHONE") or "").strip() or None

    if not email or not password:
        print("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD", file=sys.stderr)
        return 1
    if len(password) < 8:
        print("SEED_ADMIN_PASSWORD must be at least 8 characters", file=sys.stderr)
        return 1

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                name=name,
                email=email,
                phone=phone,
                hashed_password=get_password_hash(password),
                is_active=True,
                is_admin=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created admin user id={user.id} email={user.email}")
        else:
            user.is_admin = True
            user.is_active = True
            if name:
                user.name = name
            if phone is not None:
                user.phone = phone
            if os.getenv("SEED_ADMIN_RESET_PASSWORD") == "1":
                user.hashed_password = get_password_hash(password)
                print("Password updated")
            db.commit()
            db.refresh(user)
            print(
                f"Updated existing user id={user.id} email={user.email} is_admin={user.is_admin}"
            )
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
