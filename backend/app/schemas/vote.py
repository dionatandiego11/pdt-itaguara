from datetime import datetime

from pydantic import BaseModel


class VoteRequest(BaseModel):
    option: str


class VoteResponse(BaseModel):
    proposal_id: int
    session_id: int
    selected_option_id: int
    selected_option_value: str
    total_votes: int
    message: str
    voted_at: datetime

    class Config:
        from_attributes = True
