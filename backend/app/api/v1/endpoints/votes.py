from datetime import datetime
import hashlib
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.proposal import Proposal as ProposalModel, ProposalStatus
from app.models.vote import Vote, VotingMethod, VotingOption, VotingSession, VotingStatus
from app.schemas.vote import VoteRequest, VoteResponse

router = APIRouter()
logger = get_logger("votes")

DEFAULT_SIMPLE_OPTIONS = {
    "yes": "A favor",
    "no": "Contra",
    "abstain": "Abstenção",
}


def _get_active_session(db: Session, proposal_id: int) -> Optional[VotingSession]:
    return (
        db.query(VotingSession)
        .filter(
            VotingSession.proposal_id == proposal_id,
            VotingSession.status == VotingStatus.ACTIVE,
        )
        .order_by(VotingSession.created_at.desc())
        .first()
    )


def _require_open_session(db: Session, proposal: ProposalModel) -> VotingSession:
    session = _get_active_session(db, proposal.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A votacao para esta proposta nao esta aberta.",
        )

    now = datetime.utcnow()
    if session.starts_at and session.starts_at > now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A votacao ainda nao comecou.",
        )

    if session.ends_at and session.ends_at < now:
        session.status = VotingStatus.COMPLETED
        db.add(session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta votacao ja foi encerrada.",
        )

    if session.method == VotingMethod.SIMPLE and not session.options:
        for order, (value, title) in enumerate(DEFAULT_SIMPLE_OPTIONS.items()):
            db.add(
                VotingOption(
                    session_id=session.id,
                    title=title,
                    description=f"Voto {title.lower()}",
                    order=order,
                    value=value,
                )
            )
        db.flush()
        db.refresh(session)

    return session


def _pick_option(session: VotingSession, option_value: str) -> VotingOption:
    normalized = option_value.lower()
    for option in session.options:
        if option.value and option.value.lower() == normalized:
            return option
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Opcao de voto invalida para esta sessao.",
    )


def _generate_vote_hash(user_id: int, session_id: int) -> str:
    payload = f"{user_id}:{session_id}:{datetime.utcnow().isoformat()}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@router.post("/proposals/{proposal_id}/vote", response_model=VoteResponse)
def cast_vote(
    proposal_id: int,
    payload: VoteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    proposal = db.query(ProposalModel).filter(ProposalModel.id == proposal_id).first()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Proposta nao encontrada."
        )

    if proposal.status != ProposalStatus.VOTING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta proposta nao esta em votacao.",
        )

    if not current_user.can_vote:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seu nivel de acesso nao permite votar.",
        )

    session = _require_open_session(db, proposal)

    existing_vote = (
        db.query(Vote)
        .filter(
            Vote.session_id == session.id,
            Vote.user_id == current_user.id,
        )
        .first()
    )
    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voce ja registrou seu voto nesta proposta.",
        )

    option = _pick_option(session, payload.option)
    vote_payload = {
        "option_id": option.id,
        "value": option.value or option.title,
        "title": option.title,
    }

    vote = Vote(
        session_id=session.id,
        proposal_id=proposal.id,
        user_id=current_user.id,
        choice=vote_payload["value"],
        vote_data=vote_payload,
        vote_hash=_generate_vote_hash(current_user.id, session.id),
    )
    db.add(vote)

    session.total_votes = (session.total_votes or 0) + 1
    proposal.votes_count = (proposal.votes_count or 0) + 1

    db.add(proposal)
    db.add(session)
    db.commit()
    db.refresh(vote)
    db.refresh(session)

    logger.info(
        "Vote registered",
        extra={
            "proposal_id": proposal.id,
            "user_id": current_user.id,
            "choice": vote_payload["value"],
            "session_id": session.id,
        },
    )

    return VoteResponse(
        proposal_id=proposal.id,
        session_id=session.id,
        selected_option_id=option.id,
        selected_option_value=vote_payload["value"],
        total_votes=session.total_votes or 0,
        message="Voto registrado com sucesso.",
        voted_at=vote.voted_at,
    )
