import random
import smtplib
import string
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import Optional

from fastapi import HTTPException, status

from app.config import settings
from app.models.user_models import PyObjectId
from app.utils import create_token, get_password_hash, verify_password
from app.utils import EmailData, render_email_template



async def register_user(db, invite: dict, setup_data: dict) -> dict:
    try:
        user_data = {
            "email": invite["email"],
            "hashed_password": get_password_hash(setup_data["password"]),
            "profile": {
                "first_name": setup_data["full_name"],
                "last_name": setup_data["full_name"],
                "gender": setup_data["gender"]
            },
            "is_active": True,
            "is_superuser": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.users.insert_one(user_data)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user account"
            )

        await db.invites.update_one(
            {"_id": invite["_id"]},
            {
                "$set": {
                    "is_valid": False,
                    "used_at": datetime.utcnow(),
                    "user_id": result.inserted_id
                }
            }
        )
        return user_data
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account"
        )
