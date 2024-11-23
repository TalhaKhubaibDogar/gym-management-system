
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.auth.utils import (
    register_user,
    get_user_by_email,
    generate_registration_email,
    send_email,
    generate_otp,
    save_otp
)
from app.dependencies import DatabaseDepends
from app.models.models import (
    RegisterUser,
    RegisterUserResponse
)

router = APIRouter()

@router.post("/register", response_model=RegisterUserResponse)
async def register(
    register: RegisterUser,
    db: DatabaseDepends
) -> RegisterUserResponse:
    try:

        await get_user_by_email(db, register.email)
        user_data = await register_user(db, register.dict())
        otp = generate_otp(length=6)
        await save_otp(db, user_data["_id"], otp)
        if settings.emails_enabled:
            email = generate_registration_email(
                email_to=register.email,
                otp = otp
            )

            send_email(
                email_to=register.email,
                subject=email.subject,
                html_content=email.html_content
            )

        return RegisterUserResponse()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration Failed: {e}"
        )