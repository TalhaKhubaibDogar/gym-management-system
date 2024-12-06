
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from typing import List
from app.auth.utils import (
    verify_superuser,
    verify_membership_exists
)
from app.dependencies import DatabaseDepends, CurrentUser
from app.models.models import (
    AdminUserList,
    AdminUpdateUserStatus,
    AdminUpdateUserResponse,
    SetProfile,
    MembershipCreateRequest,
    MembershipUpdateRequest,
    MembershipResponse,
    UserSubscriptionRequest,
    UserSubscriptionResponse
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

@router.get("/users/{user_id}", response_model=dict)
async def get_user_details(
    user_id: str,
    db: DatabaseDepends,
    current_user: CurrentUser
) -> dict:
    """
    Admin-only API to fetch details of a specific user, including their profile and any active subscription.
    """
    try:
        # Verify if the current user has superuser privileges
        await verify_superuser(db, current_user)

        # Fetch the user's details from the database
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Fetch the subscription details if available
        subscription = await db.subscriptions.find_one({"user_id": ObjectId(user_id)})
        subscription_details = None
        if subscription:
            membership = await db.memberships.find_one({"_id": subscription["membership_id"]})
            if membership:
                subscription_details = {
                    "membership_name": membership["name"],
                    "membership_description": membership["description"],
                    "price": membership["price"],
                    "start_date": subscription["start_date"],
                    "end_date": subscription["end_date"]
                }

        # Build the response
        response = {
            "profile": user.get("profile", {}),
            "is_active": user.get("is_active", False),
            "subscription": subscription_details
        }

        return response

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching user details: {str(e)}"
        )

@router.post("/memberships", response_model=MembershipResponse)
async def create_membership(
    membership_data: MembershipCreateRequest,
    db: DatabaseDepends,
    current_user: CurrentUser
):
    """
    Admin-only API to create a new membership plan.
    """
    try:
        await verify_superuser(db, current_user)

        membership_dict = membership_data.dict()
        result = await db.memberships.insert_one(membership_dict)

        return MembershipResponse(
            id=str(result.inserted_id),
            **membership_dict
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the membership: {str(e)}"
        )

@router.put("/memberships/{membership_id}", response_model=MembershipResponse)
async def update_membership(
    membership_id: str,
    update_data: MembershipUpdateRequest,
    db: DatabaseDepends,
    current_user: CurrentUser
):
    """
    Admin-only API to update an existing membership plan.
    """
    try:
        await verify_superuser(db, current_user)

        existing_membership = await verify_membership_exists(db, membership_id)

        updated_data = {k: v for k, v in update_data.dict().items() if v is not None}
        await db.memberships.update_one(
            {"_id": ObjectId(membership_id)},
            {"$set": updated_data}
        )

        updated_membership = {**existing_membership, **updated_data}
        return MembershipResponse(
            id=str(membership_id),
            **updated_membership
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the membership: {str(e)}"
        )

@router.delete("/memberships/{membership_id}")
async def delete_membership(
    membership_id: str,
    db: DatabaseDepends,
    current_user: CurrentUser
):
    """
    Admin-only API to delete a membership plan.
    """
    try:
        await verify_superuser(db, current_user)
        await verify_membership_exists(db, membership_id)

        await db.memberships.delete_one({"_id": ObjectId(membership_id)})

        return {"message": "Membership plan deleted successfully."}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting the membership: {str(e)}"
        )

@router.delete("/memberships/{membership_id}")
async def delete_membership(
    membership_id: str,
    db: DatabaseDepends,
    current_user: CurrentUser
):
    """
    Admin-only API to delete a membership plan.
    """
    try:
        await verify_superuser(db, current_user)
        await verify_membership_exists(db, membership_id)

        await db.memberships.delete_one({"_id": ObjectId(membership_id)})

        return {"message": "Membership plan deleted successfully."}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting the membership: {str(e)}"
        )


@router.get("/memberships", response_model=list[MembershipResponse])
async def list_memberships(
    db: DatabaseDepends,
    current_user: CurrentUser
):
    """
    Admin-only API to fetch all membership plans.
    """
    try:
        await verify_superuser(db, current_user)

        memberships = await db.memberships.find().to_list(None)
        return [
            MembershipResponse(
                id=str(membership["_id"]),
                **membership
            ) for membership in memberships
        ]

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while listing memberships: {str(e)}"
        )



@router.post("/users/{user_id}/subscribe", response_model=UserSubscriptionResponse)
async def subscribe_user_to_membership(
    user_id: str,
    subscription_data: UserSubscriptionRequest,
    db: DatabaseDepends,
    current_user: CurrentUser
):
    """
    Admin-only API to subscribe a user to a membership plan.
    """
    try:
        await verify_superuser(db, current_user)

        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        membership = await verify_membership_exists(db, subscription_data.membership_id)

        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=membership["duration_months"] * 30)

        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "membership": {
                    "membership_id": subscription_data.membership_id,
                    "start_date": start_date,
                    "end_date": end_date,
                }
            }}
        )

        return UserSubscriptionResponse(
            user_id=user_id,
            membership_id=subscription_data.membership_id,
            start_date=start_date,
            end_date=end_date
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while subscribing user: {str(e)}"
        )