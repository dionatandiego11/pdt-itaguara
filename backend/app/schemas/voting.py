from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VotingStats(BaseModel):
    total_votes: int
    yes_votes: int
    no_votes: int
    abstain_votes: int


class UserVotingState(BaseModel):
    has_voted: bool
    choice: Optional[str] = None


class ActiveVotingSession(BaseModel):
    proposal_id: int
    repository_id: int
    session_id: int
    title: str
    summary: str
    starts_at: datetime
    ends_at: datetime
    stats: VotingStats
    user_state: UserVotingState

    class Config:
        from_attributes = True
