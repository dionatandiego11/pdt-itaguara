from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from app.models.issue import IssuePriority, IssueStatus, IssueType


def _ensure_tags(value) -> List[str]:
    if isinstance(value, list):
        return [tag for tag in value if tag]
    if isinstance(value, str):
        return [tag.strip() for tag in value.split(",") if tag.strip()]
    return []


class IssueBase(BaseModel):
    title: str
    description: str
    type: IssueType = IssueType.BUG
    priority: IssuePriority = IssuePriority.MEDIUM
    status: IssueStatus = IssueStatus.OPEN
    tags: List[str] = Field(default_factory=list)
    location: Optional[str] = None

    _normalize_tags = validator("tags", allow_reuse=True, pre=True)(_ensure_tags)


class IssueCreate(IssueBase):
    repository_id: int
    priority: IssuePriority = IssuePriority.MEDIUM
    status: IssueStatus = IssueStatus.OPEN
    estimated_cost: Optional[int] = None
    budget_category: Optional[str] = None


class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[IssueType] = None
    priority: Optional[IssuePriority] = None
    status: Optional[IssueStatus] = None
    tags: Optional[List[str]] = None
    location: Optional[str] = None
    estimated_cost: Optional[int] = None
    budget_category: Optional[str] = None


class Issue(IssueBase):
    id: int
    number: int
    slug: str
    repository_id: int
    author_id: int
    assigned_to_id: Optional[int] = None
    comments_count: int
    reactions_count: int
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
