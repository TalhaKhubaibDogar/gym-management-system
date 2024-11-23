import random
import smtplib
import string
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import Optional

from fastapi import HTTPException, status
from bson import ObjectId
from app.config import settings
from app.models.models import PyObjectId, OTP
from app.utils import create_token, get_password_hash, verify_password
from app.utils import EmailData, render_email_template

async def get_user_by_email(db, email: str) -> Optional[dict]:
    user =  await db.users.find_one({"email": email})
    print("None",user)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    return None

def generate_otp(length: int = 6) -> str:
    otp = ''.join(random.choices(string.digits, k=length))
    return otp

async def save_otp(db, user_id: ObjectId, otp: str, expiration_minutes: int = 10) -> OTP:
    expires_at = datetime.utcnow() + timedelta(minutes=expiration_minutes)
    
    otp_data = OTP(
        user_id=user_id,
        otp=otp,
        created_at=datetime.utcnow(),
        expires_at=expires_at,
        is_verified=False
    )
    
    result = await db.otps.insert_one(otp_data.dict())
    if result.inserted_id:
        otp_data_dict = otp_data.dict()
        otp_data_dict["_id"] = result.inserted_id
        return otp_data_dict
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error saving OTP"
        )

async def register_user(db, user_payload: dict) -> dict:
    try:
        user_data = {
            "email": user_payload["email"],
            "hashed_password": get_password_hash(user_payload["password"]),  # Hash the password
            "profile": {
                "first_name": user_payload["first_name"],  # Fix field names
                "last_name": user_payload["last_name"]
            },
            "is_active": False,
            "is_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.users.insert_one(user_data)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating user account data"
            )
        # Add the inserted ID to user_data and return it
        user_data["_id"] = result.inserted_id
        return user_data
    except Exception as e:
        print("Error in register_user:", e)  # Log the error for debugging
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating user account"
        )


def generate_registration_email(email_to: str, otp: str, first_name: str) -> EmailData:
    subject = "HUFC - Registration"
    html_content = render_email_template(
        template_name="signup_template.html",
        context={
            "email": email_to,
            "first_name": first_name,
            "otp": otp
        },
    )
    return EmailData(html_content=html_content, subject=subject)

def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    html_message = MIMEText(html_content, "html")
    html_message["Subject"] = subject
    html_message["From"] = settings.EMAILS_FROM_EMAIL
    html_message["To"] = email_to
    with smtplib.SMTP_SSL(settings.SMTP_HOST, 465) as server:
        server.login(settings.EMAILS_FROM_EMAIL, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, html_message.as_string())