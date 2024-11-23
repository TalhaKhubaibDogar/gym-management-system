
from fastapi import APIRouter, HTTPException, status

from app.auth.utils import (
    register_user,
    get_user_by_email
)
from app.dependencies import DatabaseDepends
from app.models.user_models import (
    RegisterAccount,
    RegisterAccountResponse
)

router = APIRouter()

@router.post("/register", response_model=RegisterAccount)
async def setup_account(
    register_body: RegisterAccount,
    db: DatabaseDep
) -> RegisterAccountResponse:
    try:

        await get_user_by_email(db, register_body["email"])
        await     register_user(db, register_body.dict())

        return RegisterAccountResponse()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in account setup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error setting up account"
        )