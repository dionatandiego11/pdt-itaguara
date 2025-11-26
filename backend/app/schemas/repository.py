from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.models.repository import RepositoryType, RepositoryVisibility

class UserOwner(BaseModel):
    """Informações básicas do usuário proprietário do repositório"""
    id: int
    username: str
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class RepositoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: RepositoryType
    jurisdiction_name: Optional[str] = None
    jurisdiction_type: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v) < 3:
            raise ValueError('Repository name must be at least 3 characters long')
        return v

class RepositoryCreate(RepositoryBase):
    visibility: RepositoryVisibility = RepositoryVisibility.PUBLIC
    allow_public_proposals: bool = True
    allow_public_voting: bool = True
    require_verification_for_voting: bool = True
    quorum_percentage: int = 10
    voting_period_days: int = 7
    min_signatures_for_voting: int = 500

    @validator("visibility", pre=True)
    def normalize_visibility(cls, v):
        if v is None:
            return RepositoryVisibility.PUBLIC
        if isinstance(v, RepositoryVisibility):
            return v
        return RepositoryVisibility(str(v).lower())


class RepositoryForkRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[RepositoryVisibility] = None
    jurisdiction_name: Optional[str] = None
    jurisdiction_type: Optional[str] = None

    @validator("visibility", pre=True, always=False)
    def normalize_visibility(cls, v):
        if v is None:
            return None
        if isinstance(v, RepositoryVisibility):
            return v
        return RepositoryVisibility(str(v).lower())

class RepositoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[RepositoryVisibility] = None
    allow_public_proposals: Optional[bool] = None
    allow_public_voting: Optional[bool] = None
    require_verification_for_voting: Optional[bool] = None
    quorum_percentage: Optional[int] = None
    voting_period_days: Optional[int] = None
    min_signatures_for_voting: Optional[int] = None

    @validator("visibility", pre=True, always=False)
    def normalize_visibility(cls, v):
        if v is None:
            return None
        if isinstance(v, RepositoryVisibility):
            return v
        return RepositoryVisibility(str(v).lower())

class RepositoryInDB(RepositoryBase):
    id: int
    slug: str
    visibility: RepositoryVisibility
    is_active: bool
    is_archived: bool
    proposals_count: int
    issues_count: int
    contributors_count: int
    owner_id: Optional[int] = None
    owner: Optional[UserOwner] = None
    is_fork: bool
    forked_from_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Repository(RepositoryInDB):
    pass

class RepositoryPublic(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    type: RepositoryType
    jurisdiction_name: Optional[str]
    jurisdiction_type: Optional[str]
    visibility: RepositoryVisibility
    proposals_count: int
    issues_count: int
    contributors_count: int
    owner_id: Optional[int] = None
    owner: Optional[UserOwner] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
