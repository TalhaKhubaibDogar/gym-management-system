import re
from datetime import datetime
from typing import Any, List, Optional

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_validator
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
    created_at: datetime
    expires_at: datetime
    is_verified: bool = False

class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str
    email: str