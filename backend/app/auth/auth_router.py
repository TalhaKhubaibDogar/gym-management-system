
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
    get_user_from_token
)
from app.dependencies import DatabaseDepends, CurrentUser
from app.models.models import (
    RegisterUser,
    RegisterUserResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    OTP,
    PasswordResetRequest,
    PasswordResetResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    LoginRequest,
    LoginResponse,
    SetProfile,
    SetProfileResponse,
    RefreshTokenRequest,
    RefreshTokenResponse
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
            status_code=status.HTTP_400_BAD_REQUEST,
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
            status_code=status.HTTP_400_BAD_REQUEST,
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
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user found with this email."
            )
        if not user["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
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
                status_code=status.HTTP_400_BAD_REQUEST,
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
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process password reset request: {e}"
        )

@router.post("/set-password", response_model=ResetPasswordResponse)
async def reset_password(
    reset_password_data: ResetPasswordRequest,
    db: DatabaseDepends
) -> ResetPasswordResponse:
    try:
        user =  await db.users.find_one({
        "email": reset_password_data.email
        })
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user found with this email."
            )
        if not user["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not verified."
            )
        
        otp_entry = await db.otps.find_one(
            {"user_id": str(user["_id"]), "otp": reset_password_data.otp, "type": "ForgetPassword"},
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

        hashed_password = get_password_hash(reset_password_data.new_password)
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"hashed_password": hashed_password}}
        )

        await db.otps.delete_one({"_id": otp_entry["_id"]})

        return ResetPasswordResponse(
            message="Password successfully reset."
        )
    
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password."
        )


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: DatabaseDepends
) -> LoginResponse:
    try:
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        access_token = create_token(
            subject=str(user["_id"]),
            expires_delta=access_token_expires,
            token_type="access_token",
            email=user["email"]
        )
        refresh_token = create_token(
            subject=str(user["_id"]),
            expires_delta=refresh_token_expires,
            token_type="refresh_token",
            email=user["email"]
        )
        await db.tokens.insert_one({
            "user_id": user["_id"],
            "token": refresh_token,
            "token_type": "refresh_token",
            "expires": datetime.utcnow() + refresh_token_expires,
            "created_at": datetime.utcnow(),
            "is_blacklisted": False
        })

        await db.tokens.insert_one({
            "user_id": user["_id"],
            "token": access_token,
            "token_type": "access_token",
            "expires": datetime.utcnow() + access_token_expires,
            "created_at": datetime.utcnow(),
            "is_blacklisted": False
        })
        if user.get("is_new", True):
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"is_new": False}}
            )

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            is_superuser=user.get("is_superuser", None),
            is_new=user.get("is_new", None),
            first_name=user.get("first_name", None),
            last_name=user.get("last_name", None)
        )

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login {str(e)}"
        )
    

@router.put("/profile", response_model=SetProfileResponse)
async def set_profile(
    profile_data: SetProfile,
    db: DatabaseDepends,
    current_user: CurrentUser
) -> SetProfileResponse:
    try:
        user_id = str(current_user["_id"])
        
        profile_dict = profile_data.model_dump()
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"profile": profile_dict}}
        )

        return SetProfileResponse(
            message="Profile updated successfully",
            profile=profile_data
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the profile: {str(e)}"
        )

@router.get("/profile", response_model=SetProfileResponse)
async def set_profile(
    profile_data: SetProfile,
    db: DatabaseDepends,
    current_user: CurrentUser
) -> SetProfileResponse:
    try:
        user_id = str(current_user["_id"])
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        user_profile = user.get("profile", {})
        return SetProfileResponse(
            message="Profile Retrived",
            profile=user_profile
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retriving the profile: {str(e)}"
        )

@router.post("/refresh-token", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_token_data: RefreshTokenRequest,
    db: DatabaseDepends
) -> RefreshTokenResponse:
    try:
        user = await validate_refresh_token(db, refresh_token_data.refresh_token)
        
        await db.tokens.update_one(
            {"token": refresh_token_data.refresh_token},
            {"$set": {"is_blacklisted": True}}
        )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        
        new_access_token = create_token(
            subject=str(user["_id"]),
            expires_delta=access_token_expires,
            token_type="access_token",
            email=user["email"]
        )
        
        new_refresh_token = create_token(
            subject=str(user["_id"]),
            expires_delta=refresh_token_expires,
            token_type="refresh_token",
            email=user["email"]
        )
        
        await db.tokens.insert_one({
            "user_id": user["_id"],
            "token": new_refresh_token,
            "token_type": "refresh_token",
            "expires": datetime.utcnow() + refresh_token_expires,
            "created_at": datetime.utcnow(),
            "is_blacklisted": False
        })
        
        await db.tokens.insert_one({
            "user_id": user["_id"],
            "token": new_access_token,
            "token_type": "access_token",
            "expires": datetime.utcnow() + access_token_expires,
            "created_at": datetime.utcnow(),
            "is_blacklisted": False
        })
        
        return RefreshTokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during token refresh: {str(e)}"
        )