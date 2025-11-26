from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.proposal import Proposal as ProposalModel, ProposalStatus
from app.models.repository import Repository as RepositoryModel, RepositoryVisibility
from app.schemas.proposal import Proposal as ProposalSchema, ProposalUpdate
from app.models.user import User as UserModel

router = APIRouter()
logger = get_logger("proposals")


@router.get("/", response_model=List[ProposalSchema])
def list_proposals(
    status: Optional[str] = Query(None, description="Filtro por status"),
    repository_id: Optional[int] = Query(None, description="Filtrar por repositório"),
    search: Optional[str] = Query(None, description="Busca por título ou resumo"),
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(deps.get_current_user_optional),
):
    """Retorna propostas com filtros opcionais respeitando a visibilidade do repositório."""
    query = db.query(ProposalModel).join(
        RepositoryModel, ProposalModel.repository_id == RepositoryModel.id
    )

    if status:
        try:
            status_value = ProposalStatus(status)
            query = query.filter(ProposalModel.status == status_value)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid status value",
            ) from None

    if repository_id:
        query = query.filter(ProposalModel.repository_id == repository_id)

    if search:
        search_value = f"%{search}%"
        query = query.filter(
            or_(
                ProposalModel.title.ilike(search_value),
                ProposalModel.summary.ilike(search_value),
            )
        )

    if not current_user or (not current_user.is_affiliate and not current_user.is_superuser):
        query = query.filter(RepositoryModel.visibility == RepositoryVisibility.PUBLIC)

    proposals = query.order_by(ProposalModel.created_at.desc()).all()
    return proposals


@router.get("/{proposal_id}", response_model=ProposalSchema)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(deps.get_current_user_optional),
):
    """Retorna detalhes de uma proposta específica."""
    proposal = db.query(ProposalModel).filter(ProposalModel.id == proposal_id).first()

    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )

    repository = (
        db.query(RepositoryModel).filter(RepositoryModel.id == proposal.repository_id).first()
    )
    if not repository or not deps.check_can_view_repository(current_user, repository):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para visualizar esta proposta.",
        )

    return proposal


@router.delete("/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    """Remove uma proposta (autor ou administrador)."""
    proposal = (
        db.query(ProposalModel)
        .filter(ProposalModel.id == proposal_id)
        .first()
    )

    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )

    repository = db.query(RepositoryModel).filter(RepositoryModel.id == proposal.repository_id).first()
    if not repository or not deps.check_can_view_repository(current_user, repository):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir esta proposta.",
        )

    if proposal.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this proposal",
        )

    db.delete(proposal)
    if repository and repository.proposals_count and repository.proposals_count > 0:
        repository.proposals_count -= 1
        db.add(repository)
    db.commit()


@router.put("/{proposal_id}", response_model=ProposalSchema)
def update_proposal(
    proposal_id: int,
    payload: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    proposal = db.query(ProposalModel).filter(ProposalModel.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    repository = db.query(RepositoryModel).filter(RepositoryModel.id == proposal.repository_id).first()
    if not repository:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found for this proposal")

    deps.check_can_participate_repository(current_user, repository)

    if repository.visibility == RepositoryVisibility.PUBLIC:
        if not repository.allow_public_proposals and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Repositório não aceita propostas públicas",
            )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proposal, field, value)

    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal
