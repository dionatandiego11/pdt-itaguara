from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.proposal import ProposalStatus, ProposalType


class ProposalBase(BaseModel):
    title: str
    summary: str
    justification: str
    full_text: str
    type: ProposalType = Field(default=ProposalType.AMENDMENT)
    branch_name: str = Field(default="feature/nova-proposta")
    target_branch: str = Field(default="main")


class ProposalCreate(ProposalBase):
    pass


class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    justification: Optional[str] = None
    full_text: Optional[str] = None
    type: Optional[ProposalType] = None
    status: Optional[ProposalStatus] = None
    branch_name: Optional[str] = None
    target_branch: Optional[str] = None


class Proposal(ProposalBase):
    id: int
    number: str
    slug: str
    status: ProposalStatus
    repository_id: int
    author_id: int
    signatures_count: int
    comments_count: int
    votes_count: int
    quorum_required: Optional[int] = None
    threshold_percentage: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
