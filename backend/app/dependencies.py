from datetime import datetime
from typing import Annotated, Optional

from bson import ObjectId
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models.models import TokenPayload
from app.utils import decode_token

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.MONGO_DATABASE]

async def get_db():
    try:
        yield db
    finally:

        pass

def get_client_ip(request: Request) -> str:
    return request.client.host

DatabaseDepends = Annotated[AsyncIOMotorClient, Depends(get_db)]
TokenDepends = Annotated[str, Depends(reusable_oauth2)]

async def verify_token_blacklist(db: DatabaseDepends, token: str) -> bool:
    blacklisted = await db.tokens.find_one({
        "token": token,
        "is_valid": True
    })
    return bool(blacklisted)

async def get_current_user(
    db: DatabaseDepends,
    token: TokenDepends,
):
    try:
        payload = decode_token(token)
        token_data = TokenPayload(**payload)

        is_valid = await verify_token_blacklist(db, token)
        if is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )

        user = await db.users.find_one({"_id": ObjectId(token_data.sub)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        user["token"] = token
        user["token_data"] = token_data

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials"
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error str {(e)}"
        )

CurrentUser = Annotated[dict, Depends(get_current_user)]
