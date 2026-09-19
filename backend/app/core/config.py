"""Application settings, loaded from environment variables / .env."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application configuration.

    Values are loaded from environment variables (and an optional `.env`
    file in the working directory) via pydantic-settings.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENV: Literal["dev", "test", "prod"] = "dev"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/platform_core"

    # JWT / auth
    JWT_SECRET: str = "change-me-in-production"
    # `float`, not `int`: `timedelta(minutes=...)` accepts either, and this
    # lets an isolated test env override it to a sub-minute value to exercise
    # a real access-token expiry -> refresh -> retry chain in an E2E test
    # without waiting out the real default.
    JWT_ACCESS_TTL_MINUTES: float = 15
    JWT_REFRESH_TTL_DAYS: int = 30

    # Invite links: email delivery is out of scope here — the invite link is
    # returned directly in `POST /orgs/{org_id}/members/invite`'s response
    # body for the inviting admin to copy/share out-of-band. This is the base
    # URL that link is built against.
    APP_BASE_URL: str = "http://localhost:8000"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
