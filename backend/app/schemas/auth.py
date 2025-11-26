from pydantic import BaseModel, EmailStr
from typing import Optional

from app.schemas.user import User

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: User
