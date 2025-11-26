from typing import List

from app.schemas.auth import LoginRequest, Token, TokenData
from app.schemas.repository import Repository, RepositoryCreate, RepositoryUpdate, RepositoryForkRequest
from app.schemas.proposal import Proposal, ProposalCreate, ProposalUpdate
from app.schemas.issue import Issue, IssueCreate, IssueUpdate
from app.schemas.user import User, UserCreate, UserInDB, UserUpdate, UserAdminUpdate
from app.schemas.vote import VoteRequest, VoteResponse
from app.schemas.voting import ActiveVotingSession, UserVotingState, VotingStats

__all__: List[str] = [
    "User",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserAdminUpdate",
    "Repository",
    "RepositoryCreate",
    "RepositoryUpdate",
    "RepositoryForkRequest",
    "Token",
    "TokenData",
    "LoginRequest",
    "Proposal",
    "ProposalCreate",
    "Issue",
    "IssueCreate",
    "IssueUpdate",
    "ProposalUpdate",
    "VoteRequest",
    "VoteResponse",
    "ActiveVotingSession",
    "UserVotingState",
    "VotingStats",
]
