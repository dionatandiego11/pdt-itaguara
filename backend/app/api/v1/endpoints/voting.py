from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.proposal import Proposal as ProposalModel
from app.models.vote import Vote, VotingSession, VotingStatus
from app.schemas.voting import ActiveVotingSession, UserVotingState, VotingStats

router = APIRouter()
logger = get_logger("voting")


@router.get("/sessions/active", response_model=List[ActiveVotingSession])
def list_active_voting_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    now = datetime.utcnow()
    sessions = (
        db.query(VotingSession)
        .join(ProposalModel)
        .filter(
            VotingSession.status == VotingStatus.ACTIVE,
            VotingSession.starts_at <= now,
            VotingSession.ends_at >= now,
        )
        .order_by(VotingSession.ends_at.asc())
        .all()
    )

    session_ids = [session.id for session in sessions]
    vote_map = {}
    if session_ids:
        votes = (
            db.query(Vote)
            .filter(
                Vote.session_id.in_(session_ids),
                Vote.user_id == current_user.id,
            )
            .all()
        )
        vote_map = {vote.session_id: vote for vote in votes}

    def _compute_stats(session: VotingSession) -> VotingStats:
        total_yes = 0
        total_no = 0
        total_abstain = 0
        for vote in session.votes:
            value = (vote.vote_data or {}).get("value")
            if value == "yes":
                total_yes += 1
            elif value == "no":
                total_no += 1
            elif value == "abstain":
                total_abstain += 1
        total_votes = session.total_votes or len(session.votes or [])
        return VotingStats(
            total_votes=total_votes,
            yes_votes=total_yes,
            no_votes=total_no,
            abstain_votes=total_abstain,
        )

    payload: List[ActiveVotingSession] = []
    for session in sessions:
        proposal = session.proposal
        user_vote = vote_map.get(session.id)
        payload.append(
            ActiveVotingSession(
                proposal_id=proposal.id,
                repository_id=proposal.repository_id,
                session_id=session.id,
                title=proposal.title,
                summary=proposal.summary,
                starts_at=session.starts_at,
                ends_at=session.ends_at,
                stats=_compute_stats(session),
                user_state=UserVotingState(
                    has_voted=user_vote is not None,
                    choice=(user_vote.vote_data or {}).get("value") if user_vote else None,
                ),
            )
        )

    return payload
