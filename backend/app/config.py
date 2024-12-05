import os
import secrets
from typing import Annotated, Any

from dotenv import load_dotenv
from pydantic import (
    AnyUrl,
    BeforeValidator,
    computed_field,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    DATABASE_URL: str
    MONGO_DATABASE: str

    CLIENT_ORIGIN: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=True
    )

    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_KEY: str = secrets.token_urlsafe(32)
    REFRESH_TOKEN_KEY: str = secrets.token_urlsafe(32)

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 60

    HOST: str = os.getenv("DOMAIN")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT")

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int | None = int(os.getenv("SMTP_PORT", 0)) or None
    SMTP_HOST: str | None = os.getenv("SMTP_HOST")
    SMTP_USER: str | None = os.getenv("SMTP_USER")
    SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD")

    EMAILS_FROM_EMAIL: str | None = os.getenv("EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: str | None = os.getenv("EMAILS_FROM_EMAIL")

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 1

    @computed_field
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)

    ALGORITHM: str = "HS384"


settings = Settings()
