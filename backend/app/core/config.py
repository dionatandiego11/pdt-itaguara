from typing import List, Optional
import os

from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CivicGit"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL", 
            "sqlite:///./civicgit_dev.db"
        )
    )
    TEST_DATABASE_URL: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Security
    SECRET_KEY: str = Field("dev-secret-key-change-me", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OAuth2
    GOV_BR_CLIENT_ID: Optional[str] = None
    GOV_BR_CLIENT_SECRET: Optional[str] = None
    GOV_BR_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    
    # CORS
    CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    ]
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    
    # Voting Configuration
    QUORUM_PERCENTAGE: int = 10
    VOTING_PERIOD_DAYS: int = 7
    MIN_SIGNATURES_FOR_VOTING: int = 500
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
