from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, List, Optional
from jinja2 import Template
from app.config import settings
from fastapi import HTTPException, status
from jose import jwt, JWTError
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_token(
    subject: Union[str, Any],
    expires_delta: timedelta = None,
    token_type: str = "access_token",
    email: str = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": token_type,
        "email": email
    }

    if token_type == "access_token":
        secret_key = settings.ACCESS_TOKEN_KEY
    else:
        secret_key = settings.REFRESH_TOKEN_KEY

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def decode_token(token: str, token_type: str = "access_token") -> dict:
    if token_type == "access_token":
        secret_key = settings.ACCESS_TOKEN_KEY
    else:
        secret_key = settings.REFRESH_TOKEN_KEY

    decoded_token = jwt.decode(token, secret_key, algorithms=[settings.ALGORITHM])
    return decoded_token


def create_regex_in_condition(field: str, values: List[str]) -> dict:
    """Create a MongoDB $in condition with regex for a given field."""
    return {
        field: {
            '$in': [re.compile(f".*{re.escape(value)}.*", re.IGNORECASE) for value in values]
        }
    }


def parse_json_list(param: Optional[str]) -> Optional[List[str]]:
    if param:
        try:
            return json.loads(param)
        except json.JSONDecodeError:
            return None
    return None

@dataclass
class EmailData:
    html_content: str
    subject: str

def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "templates" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


async def validate_refresh_token(db, refresh_token: str):
    try:
        token_record = await db.tokens.find_one({
            "token": refresh_token,
            "token_type": "refresh_token",
            "is_blacklisted": False,
            "expires": {"$gt": datetime.utcnow()}
        })
        print("token", token_record)
        
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        payload = decode_token(refresh_token)
        print("payload", payload)
        user_id = payload.get('sub')
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials {str(e)}"
        )