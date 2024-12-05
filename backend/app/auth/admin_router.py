
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from typing import List
from app.auth.utils import (
    verify_superuser
)
from app.dependencies import DatabaseDepends, CurrentUser
from app.models.models import (
    AdminUserList,
)
from datetime import datetime, timedelta
from app.utils import (
    get_password_hash,
    create_token,
    verify_password,
    validate_refresh_token,
    decode_token
)
from bson import ObjectId

router = APIRouter()

@router.get("/users", response_model=List[AdminUserList])
async def get_user_list(
    db: DatabaseDepends,
    current_user: CurrentUser 
) -> AdminUserList:
    """
    Get the list of all users, restricted to superusers.
    """
    try:
        await verify_superuser(db, current_user)

        users = await db.users.find(
        {"_id": {"$ne": ObjectId(current_user["_id"])}}).to_list(100)
        user_list = [
            {
                "_id": str(user["_id"]),
                "first_name": user.get("profile").get("first_name"),
                "last_name": user.get("profile").get("last_name"),
                "is_active": user.get("is_active"),
                "email": user.get("email", ""),
                "is_superuser": user.get("is_superuser", False),
                "profile": user.get("profile")
            }
            for user in users
        ]

        return user_list
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error"
        )
