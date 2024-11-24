import re
from datetime import datetime
from typing import Any, List, Optional

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_validator, validator
from pydantic_core import CoreSchema, core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: Any) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda obj: str(obj) if isinstance(obj, ObjectId) else obj,
                return_schema=core_schema.str_schema(),
            ),
        )

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)
    
class RegisterUser(BaseModel):
    email: str
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=8)

    @field_validator('password')
    def validate_password(cls, v):
        if not re.match(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)', v):
            raise ValueError(
                'Password must contain at least one uppercase letter, '
                'one lowercase letter, and one number'
            )
        return v

    @field_validator('first_name')
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError("first name cannot be empty or just whitespace")
        return v.strip()
    @field_validator('last_name')
    def validate_last_name(cls, v):
        if not v.strip():
            raise ValueError("last name cannot be empty or just whitespace")
        return v.strip()

class RegisterUserResponse(BaseModel):
    message: str = "Registration sucess! Otp sent to email"

class OTP(BaseModel):
    user_id: PyObjectId
    otp: str
    type: str
    created_at: datetime
    expires_at: datetime
    is_verified: bool = False

class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class VerifyOtpResponse(BaseModel):
    message: str
    user_id: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetResponse(BaseModel):
    message: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    message: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_superuser: bool
    is_new: bool
    first_name: str
    last_name: str

class SetProfile(BaseModel):
    first_name: str = Field(..., max_length=50, pattern=r"^[A-Za-z\s]+$")
    last_name: str = Field(..., max_length=50, pattern=r"^[A-Za-z\s]+$")
    age: Optional[int] = Field(None, ge=0, le=120, description="Age must be between 0 and 120.")
    height: Optional[float] = Field(None, ge=50.0, le=250.0, description="Height must be between 50 cm and 250 cm.")
    weight: Optional[float] = Field(None, ge=20.0, le=200.0, description="Weight must be between 20 kg and 200 kg.")
    gym_experience_level: Optional[str] = Field(
        None,
        description="Gym experience level must be one of: Beginner, Intermediate, Advanced."
    )
    goals: Optional[str] = Field(None, max_length=200, description="Goals must not exceed 200 characters.")

class SetProfileResponse(BaseModel):
    message: str