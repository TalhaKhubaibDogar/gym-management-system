import re
from datetime import datetime
from typing import Any, List, Optional
from enum import Enum
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_validator, validator, conlist
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


class WorkoutFrequencyEnum(str, Enum):
    RARELY = "Rarely (1-2 times/week)"
    MODERATE = "Moderate (3-4 times/week)"
    FREQUENT = "Frequent (5-6 times/week)"
    DAILY = "Daily (7 times/week)"

    @classmethod
    def _missing_(cls, value: str):
        # Map simplified inputs to full values
        mapping = {
            "Rarely": cls.RARELY,
            "Moderate": cls.MODERATE,
            "Frequent": cls.FREQUENT,
            "Daily": cls.DAILY
        }
        return mapping.get(value)

class ExperienceLevelEnum(str, Enum):
    BEGINNER = "Beginner (0-1 years of training)"
    INTERMEDIATE = "Intermediate (1-3 years of training)"
    ADVANCED = "Advanced (3+ years of training)"

    @classmethod
    def _missing_(cls, value: str):
        mapping = {
            "Beginner": cls.BEGINNER,
            "Intermediate": cls.INTERMEDIATE,
            "Advanced": cls.ADVANCED
        }
        return mapping.get(value)

class WorkoutTypeEnum(str, Enum):
    STRENGTH = "Strength Training (weights and resistance)"
    HIIT = "HIIT (High Intensity Interval Training)"
    CARDIO = "Cardio (endurance focused)"
    CROSSFIT = "CrossFit (varied functional movements)"
    YOGA = "Yoga (flexibility and mindfulness)"
    CALISTHENICS = "Calisthenics (bodyweight exercises)"

    @classmethod
    def _missing_(cls, value: str):
        mapping = {
            "Strength Training": cls.STRENGTH,
            "HIIT": cls.HIIT,
            "Cardio": cls.CARDIO,
            "CrossFit": cls.CROSSFIT,
            "Yoga": cls.YOGA,
            "Calisthenics": cls.CALISTHENICS
        }
        return mapping.get(value)

class FitnessGoalsEnum(str, Enum):
    WEIGHT_LOSS = "Weight Loss (fat reduction)"
    MUSCLE_GAIN = "Muscle Gain (hypertrophy)"
    STRENGTH = "Strength Training (power and force)"
    ENDURANCE = "Endurance (stamina improvement)"
    FLEXIBILITY = "Flexibility (mobility and range)"
    GENERAL = "General Fitness (overall health)"

    @classmethod
    def _missing_(cls, value: str):
        mapping = {
            "Weight Loss": cls.WEIGHT_LOSS,
            "Muscle Gain": cls.MUSCLE_GAIN,
            "Strength Training": cls.STRENGTH,
            "Endurance": cls.ENDURANCE,
            "Flexibility": cls.FLEXIBILITY,
            "General Fitness": cls.GENERAL
        }
        return mapping.get(value)

class InjuryStatus(BaseModel):
    has_injury: bool
    injury_description: Optional[str] = None

class WorkoutAvailability(BaseModel):
    preferred_time: str
    available_days: List[str]
    session_duration: int = Field(..., ge=30, le=240)

class SetProfile(BaseModel):
    first_name: str = Field(..., max_length=50, pattern=r"^[A-Za-z\s]+$")
    last_name: str = Field(..., max_length=50, pattern=r"^[A-Za-z\s]+$")
    age: int = Field(..., ge=16, le=120)
    gender: Optional[str] = Field(None, pattern=r"^(Male|Female|Other)$")
    height: float = Field(..., ge=50.0, le=250.0)
    weight: float = Field(..., ge=20.0, le=300.0)
    target_weight: Optional[float] = Field(None, ge=20.0, le=300.0)
    gym_experience_level: ExperienceLevelEnum
    workout_frequency: WorkoutFrequencyEnum
    fitness_goals: List[FitnessGoalsEnum] = Field(..., max_items=3)
    preferred_workout_types: List[WorkoutTypeEnum] = Field(..., max_items=4)
    medical_conditions: Optional[List[str]] = Field(default=["None"])
    dietary_restrictions: Optional[List[str]] = Field(default=["None"])
    injury_status: InjuryStatus
    workout_availability: WorkoutAvailability
    preferred_training_split: Optional[str] = Field(None, max_length=100)
    bench_press_max: Optional[float] = Field(None, ge=0, le=500)
    squat_max: Optional[float] = Field(None, ge=0, le=500)
    deadlift_max: Optional[float] = Field(None, ge=0, le=500)

    class Config:
        use_enum_values = True

class SetProfileResponse(BaseModel):
    message: str
    profile: SetProfile


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token to obtain new access token")

class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str = None


class AdminUserList(BaseModel):
    id: str = Field(..., alias="_id") 
    first_name: str
    last_name: str
    email: str
    is_active: bool
    profile: Optional[dict] = None

    class Config:
        populate_by_name = True 

class AdminUpdateUserStatus(BaseModel):
    is_active: bool

class AdminUpdateUserResponse(BaseModel):
    user_id: str
    is_active: bool


class MembershipPlanEnum(str, Enum):
    GOLD = "Gold"
    SILVER = "Silver"
    PLATINUM = "Platinum"

class MembershipCreateRequest(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    price: float = Field(..., ge=0.0)
    duration_months: int = Field(..., ge=1, le=36)
    benefits: Optional[list[str]] = Field(default=[])

class MembershipUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    price: Optional[float] = Field(None, ge=0.0)
    duration_months: Optional[int] = Field(None, ge=1, le=36)
    benefits: Optional[list[str]] = Field(default=[])

class MembershipResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    duration_months: int
    benefits: list[str]

class UserSubscriptionRequest(BaseModel):
    membership_id: str

class UserSubscriptionResponse(BaseModel):
    user_id: str
    membership_id: str
    start_date: datetime
    end_date: datetime