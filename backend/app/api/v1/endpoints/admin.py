from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models.repository import Repository
from app.models.proposal import Proposal
from app.models.issue import Issue
from app.models.user import User
from app.schemas.repository import Repository as RepositorySchema, RepositoryUpdate
from app.schemas.proposal import Proposal as ProposalSchema, ProposalUpdate
from app.schemas.issue import Issue as IssueSchema, IssueUpdate

router = APIRouter()


@router.get("/metrics")
def get_admin_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Retorna metricas basicas para o painel administrativo."""
    return {
        "repositories": db.query(Repository).count(),
        "proposals": db.query(Proposal).count(),
        "issues": db.query(Issue).count(),
        "users": db.query(User).count(),
    }


@router.get("/repositories", response_model=List[RepositorySchema])
def admin_list_repositories(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Lista todos os repositorios para o administrador."""
    return db.query(Repository).order_by(Repository.created_at.desc()).all()


@router.put("/repositories/{repository_id}", response_model=RepositorySchema)
def admin_update_repository(
    repository_id: int,
    payload: RepositoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Atualiza os dados de um repositorio sem restricao de autoria."""
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(repository, field, value)

    db.add(repository)
    db.commit()
    db.refresh(repository)
    return repository


@router.get("/proposals", response_model=List[ProposalSchema])
def admin_list_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Lista todas as propostas para o administrador."""
    return db.query(Proposal).order_by(Proposal.created_at.desc()).all()


@router.put("/proposals/{proposal_id}", response_model=ProposalSchema)
def admin_update_proposal(
    proposal_id: int,
    payload: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Atualiza os dados de uma proposta sem restricao de autoria."""
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proposal, field, value)

    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/issues", response_model=List[IssueSchema])
def admin_list_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Lista todas as demandas (issues) para o administrador."""
    return db.query(Issue).order_by(Issue.created_at.desc()).all()


@router.put("/issues/{issue_id}", response_model=IssueSchema)
def admin_update_issue(
    issue_id: int,
    payload: IssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Atualiza os dados de uma demanda sem restricao de autoria."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(issue, field, value)

    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@router.get("/activity")
def get_admin_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_superuser),
):
    """Retorna informa��es resumidas de atividade recente para o painel."""
    week_ago = datetime.utcnow() - timedelta(days=7)

    last_admin_login = (
        db.query(func.max(User.last_login))
        .filter(User.is_superuser.is_(True))
        .scalar()
    )
    new_users_week = db.query(User).filter(User.created_at >= week_ago).count()
    new_repositories_week = (
        db.query(Repository).filter(Repository.created_at >= week_ago).count()
    )

    return {
        "last_admin_login": last_admin_login.isoformat() if last_admin_login else None,
        "new_users_week": new_users_week,
        "new_repositories_week": new_repositories_week,
    }
