from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from app.models.user import UserLevel

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('username')
    def validate_username(cls, v):
        if not v or len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username must contain only alphanumeric characters and underscores')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

class UserAdminUpdate(UserUpdate):
    level: Optional[UserLevel] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    
    @validator('level', pre=True, always=False)
    def validate_level(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return UserLevel[v]
            except KeyError:
                raise ValueError(f'Invalid level: {v}')
        return v

class UserInDB(UserBase):
    id: int
    level: UserLevel
    is_verified: bool
    is_active: bool
    is_superuser: bool
    reputation_score: int
    contributions_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDB):
    pass

class UserPublic(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    website: Optional[str]
    level: UserLevel
    reputation_score: int
    contributions_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True
