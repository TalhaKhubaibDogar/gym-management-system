
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from typing import List
from app.auth.utils import (
    verify_superuser
)
from app.dependencies import DatabaseDepends, CurrentUser
from app.models.models import (
    AdminUserList,
    AdminUpdateUserStatus,
    AdminUpdateUserResponse,
    SetProfile
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

@router.put("/users/{user_id}", response_model=AdminUpdateUserResponse)
async def admin_update_user(
    db: DatabaseDepends,
    current_user: CurrentUser,
    user_id: str,
    update_data: AdminUpdateUserStatus
) -> AdminUpdateUserResponse:
    """
    Admin-only API to update a user's `is_active` status.
    """
    try:
        print(f"Received user_id: {user_id}")
        print(f"Update data: {update_data}")
        await verify_superuser(db, current_user)
        user_object_id = ObjectId(user_id)

        user = await db.users.find_one({"_id": user_object_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": update_data.is_active}}
        )

        return AdminUpdateUserResponse(
            user_id=user_id,
            is_active=update_data.is_active
        )
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    
# API Endpoint
@router.get("/users/{user_id}", response_model=SetProfile)
async def get_user_details(
    user_id: str,
    db: DatabaseDepends,
    current_user: CurrentUser
) -> SetProfile:
    """
    Admin-only API to fetch details of a specific user.
    """
    try:
        await verify_superuser(db, current_user)

        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        response = SetProfile(
            profile=user.get("profile", {})
        )
        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching user details: {str(e)}"
        )
