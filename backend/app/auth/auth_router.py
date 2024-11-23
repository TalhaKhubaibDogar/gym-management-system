
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.auth.utils import (
    register_user,
    get_user_by_email,
    generate_registration_email,
    send_email,
    generate_otp,
    save_otp,
    get_un_verfied_user_by_email,
    generate_reset_password_email,
)
from app.dependencies import DatabaseDepends
from app.models.models import (
    RegisterUser,
    RegisterUserResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    OTP,
    PasswordResetRequest,
    PasswordResetResponse,
)
from datetime import datetime, timedelta

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
                first_name = register.first_name,
                otp = otp
            )

            send_email(
                email_to=register.email,
                subject=email.subject,
                html_content=email.html_content
            )

        return RegisterUserResponse()
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration Failed: {str(e)}"
        )

@router.post("/verify-otp", response_model=VerifyOtpResponse)
async def verify_otp(
    verify_otp_data: VerifyOtpRequest,
    db: DatabaseDepends
) -> VerifyOtpResponse:
    try:
        user = await get_un_verfied_user_by_email(db, verify_otp_data.email)

        user_id = user["_id"]
        otp_entry = await db.otps.find_one(
            {"user_id": str(user_id), "otp": verify_otp_data.otp, "type": "Register"},
            sort=[("created_at", -1)]
        )

        if not otp_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP."
            )
        if otp_entry["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has already been verified."
            )
        if otp_entry["expires_at"] < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired."
            )
        await db.otps.update_one(
            {"_id": otp_entry["_id"]},
            {"$set": {"is_verified": True}}
        )
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {"is_verified": True, "is_active": True}}
        )

        return VerifyOtpResponse(
            message="OTP successfully verified.",
            user_id=str(user_id)
        )
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP."
        )


@router.post("/request/password-reset", response_model=PasswordResetResponse)
async def password_reset_request(
    request: PasswordResetRequest,
    db: DatabaseDepends
) -> PasswordResetResponse:
    try:
        user =  await db.users.find_one({
        "email": request.email
        })
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with this email."
            )
        if not user["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not verified."
            )

        otp = generate_otp(length=6)
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        otp_data = OTP(
            user_id=str(user["_id"]),
            otp=otp,
            type="ForgetPassword",
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            is_verified=False
        )

        result = await db.otps.insert_one(otp_data.dict(by_alias=True))
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error saving OTP."
            )

        if settings.emails_enabled:
            email_content = generate_reset_password_email(
                email_to=request.email,
                otp=otp
            )
            send_email(
                email_to=request.email,
                subject=email_content.subject,
                html_content=email_content.html_content
            )

        return PasswordResetResponse(message="Password reset OTP sent to your email.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process password reset request: {e}"
        )