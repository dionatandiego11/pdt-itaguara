from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.repository import Repository as RepositoryModel, RepositoryOwner, RepositoryVisibility
from app.models.proposal import (
    Proposal as ProposalModel,
    ProposalType,
    ProposalStatus,
)
from app.models.vote import VotingMethod, VotingOption, VotingSession, VotingStatus
from app.models.user import User as UserModel
from app.schemas.repository import (
    Repository as RepositorySchema,
    RepositoryCreate,
    RepositoryPublic,
    RepositoryUpdate,
    RepositoryForkRequest,
)
from app.schemas.proposal import (
    Proposal as ProposalSchema,
    ProposalCreate,
)

router = APIRouter()
logger = get_logger("repositories")
DEFAULT_VOTING_WINDOW_DAYS = 15
DEFAULT_SIMPLE_OPTIONS = [
    {
        "value": "yes",
        "title": "A favor",
        "description": "Concordo com a proposta e voto pela aprovação.",
    },
    {
        "value": "no",
        "title": "Contra",
        "description": "Não concordo com a proposta e voto contra.",
    },
    {
        "value": "abstain",
        "title": "Abstenção",
        "description": "Prefiro não me posicionar nesta votação.",
    },
]


def _create_voting_session(proposal: ProposalModel) -> VotingSession:
    start_at = proposal.voting_started_at or datetime.utcnow()
    end_at = proposal.voting_ended_at or (
        start_at + timedelta(days=DEFAULT_VOTING_WINDOW_DAYS)
    )

    proposal.voting_started_at = start_at
    proposal.voting_ended_at = end_at

    session = VotingSession(
        proposal_id=proposal.id,
        repository_id=proposal.repository_id,
        title=f"Votação da proposta {proposal.title}",
        description=proposal.summary,
        method=VotingMethod.SIMPLE,
        quorum_required=proposal.quorum_required or 0,
        starts_at=start_at,
        ends_at=end_at,
        status=VotingStatus.ACTIVE,
    )
    session.options = [
        VotingOption(
            title=option["title"],
            description=option["description"],
            order=index,
            value=option["value"],
        )
        for index, option in enumerate(DEFAULT_SIMPLE_OPTIONS)
    ]
    return session


def _slugify(value: str) -> str:
    import re
    import unicodedata

    normalized = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return normalized or "repositorio"


def _generate_unique_slug(name: str, db: Session) -> str:
    base_slug = _slugify(name)
    slug = base_slug
    suffix = 2

    while db.query(RepositoryModel).filter(RepositoryModel.slug == slug).first():
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    return slug


def _generate_proposal_number(db: Session) -> str:
    """Gera um identificador humano legível para propostas."""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    suffix = uuid4().hex[:6].upper()
    number = f"PR-{timestamp}-{suffix}"

    while db.query(ProposalModel).filter(ProposalModel.number == number).first():
        suffix = uuid4().hex[:6].upper()
        number = f"PR-{timestamp}-{suffix}"

    return number


def _generate_proposal_slug(title: str, db: Session) -> str:
    """Slug exclusivo baseado no título da proposta."""
    base_slug = _slugify(title)
    slug = base_slug
    suffix = 2

    while db.query(ProposalModel).filter(ProposalModel.slug == slug).first():
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    return slug


@router.get("/", response_model=List[RepositoryPublic])
def list_repositories(
    search: Optional[str] = Query(
        None,
        description="Filtro por nome ou descrição",
    ),
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(deps.get_current_user_optional),
):
    """Lista repositórios ativos com filtro opcional e visibilidade por papel."""
    query = db.query(RepositoryModel).filter(RepositoryModel.is_active.is_(True))

    if search:
        ilike_value = f"%{search}%"
        query = query.filter(
            or_(
                RepositoryModel.name.ilike(ilike_value),
                RepositoryModel.description.ilike(ilike_value),
            )
        )

    if not current_user or (not current_user.is_affiliate and not current_user.is_superuser):
        query = query.filter(RepositoryModel.visibility == RepositoryVisibility.PUBLIC.value)
    else:
        query = query.filter(
            or_(
                RepositoryModel.visibility == RepositoryVisibility.PUBLIC.value,
                RepositoryModel.visibility == RepositoryVisibility.AFFILIATES_ONLY.value,
            )
        )

    repositories = query.order_by(RepositoryModel.created_at.desc()).all()
    return repositories


@router.get("/{repository_id}", response_model=RepositorySchema)
def get_repository(
    repository_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(deps.get_current_user_optional),
):
    """Retorna detalhes de um repositório específico."""
    repository = (
        db.query(RepositoryModel)
        .filter(RepositoryModel.id == repository_id)
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    if not deps.check_can_view_repository(current_user, repository):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para visualizar este repositório.",
        )

    return repository


@router.post("/", response_model=RepositorySchema, status_code=status.HTTP_201_CREATED)
def create_repository(
    payload: RepositoryCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Cria um novo repositório (apenas filiados)."""
    deps.check_can_create_repository(current_user)
    slug = _generate_unique_slug(payload.name, db)

    repository = RepositoryModel(
        name=payload.name,
        slug=slug,
        description=payload.description,
        type=payload.type,
        visibility=payload.visibility,
        jurisdiction_name=payload.jurisdiction_name,
        jurisdiction_type=payload.jurisdiction_type,
        allow_public_proposals=payload.allow_public_proposals,
        allow_public_voting=payload.allow_public_voting,
        require_verification_for_voting=payload.require_verification_for_voting,
        quorum_percentage=payload.quorum_percentage,
        voting_period_days=payload.voting_period_days,
        min_signatures_for_voting=payload.min_signatures_for_voting,
    )

    repository.owner_record = RepositoryOwner(user_id=current_user.id)
    db.add(repository)
    db.commit()
    db.refresh(repository)

    logger.info(
        "Repository '%s' created by user %s",
        repository.slug,
        current_user.username,
    )

    return repository


@router.put("/{repository_id}", response_model=RepositorySchema)
def update_repository(
    repository_id: int,
    payload: RepositoryUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    repository = (
        db.query(RepositoryModel)
        .filter(
            RepositoryModel.id == repository_id,
            RepositoryModel.is_active.is_(True),
        )
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    if repository.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this repository",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(repository, field, value)

    db.add(repository)
    db.commit()
    db.refresh(repository)
    return repository


@router.post(
    "/{repository_id}/proposals",
    response_model=ProposalSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_proposal(
    repository_id: int,
    payload: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Cria uma nova proposta vinculada a um repositório."""
    repository = (
        db.query(RepositoryModel)
        .filter(
            RepositoryModel.id == repository_id,
            RepositoryModel.is_active.is_(True),
        )
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    deps.check_can_participate_repository(current_user, repository)

    # Repositórios internos (apenas filiados) sempre aceitam propostas de filiados.
    if repository.visibility == RepositoryVisibility.PUBLIC:
        if not repository.allow_public_proposals and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Repositório não aceita propostas públicas",
            )

    try:
        proposal_type = (
            payload.type
            if isinstance(payload.type, ProposalType)
            else ProposalType(payload.type)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid proposal type",
        ) from None

    proposal = ProposalModel(
        repository_id=repository.id,
        author_id=current_user.id,
        number=_generate_proposal_number(db),
        slug=_generate_proposal_slug(payload.title, db),
        title=payload.title,
        summary=payload.summary,
        justification=payload.justification,
        full_text=payload.full_text,
        type=proposal_type,
        status=ProposalStatus.VOTING,
        branch_name=payload.branch_name or "feature/nova-proposta",
        target_branch=payload.target_branch or "main",
        voting_started_at=datetime.utcnow(),
    )

    db.add(proposal)
    db.flush()

    voting_session = _create_voting_session(proposal)
    db.add(voting_session)

    repository.proposals_count = (repository.proposals_count or 0) + 1
    db.commit()
    db.refresh(proposal)
    db.refresh(voting_session)

    logger.info(
        "Proposal '%s' created in repository %s by user %s",
        proposal.slug,
        repository.slug,
        current_user.username,
    )

    return proposal


@router.post(
    "/{repository_id}/forks",
    response_model=RepositorySchema,
    status_code=status.HTTP_201_CREATED,
)
def fork_repository(
    repository_id: int,
    payload: RepositoryForkRequest = Body(default=None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    parent = (
        db.query(RepositoryModel)
        .filter(RepositoryModel.id == repository_id, RepositoryModel.is_active.is_(True))
        .first()
    )
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    fork_name = payload.name if payload and payload.name else f"{parent.name} (fork {current_user.username})"
    slug = _generate_unique_slug(fork_name, db)

    fork_repo = RepositoryModel(
        name=fork_name,
        slug=slug,
        description=(payload.description if payload and payload.description is not None else parent.description),
        type=parent.type,
        visibility=(payload.visibility or parent.visibility) if payload else parent.visibility,
        jurisdiction_name=(payload.jurisdiction_name or parent.jurisdiction_name) if payload else parent.jurisdiction_name,
        jurisdiction_type=(payload.jurisdiction_type or parent.jurisdiction_type) if payload else parent.jurisdiction_type,
        quorum_percentage=parent.quorum_percentage,
        voting_period_days=parent.voting_period_days,
        min_signatures_for_voting=parent.min_signatures_for_voting,
        allow_public_proposals=parent.allow_public_proposals,
        allow_public_voting=parent.allow_public_voting,
        require_verification_for_voting=parent.require_verification_for_voting,
        is_fork=True,
        forked_from_id=parent.id,
    )

    db.add(fork_repo)
    db.flush()
    fork_repo.owner_record = RepositoryOwner(user_id=current_user.id)
    db.add(fork_repo)
    db.commit()
    db.refresh(fork_repo)
    return fork_repo


@router.delete(
    "/{repository_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_repository(
    repository_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Remove (arquiva) um repositório."""
    repository = (
        db.query(RepositoryModel)
        .filter(RepositoryModel.id == repository_id)
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    is_owner = repository.owner_id == current_user.id

    if not (is_owner or current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this repository",
        )

    repository.is_active = False
    repository.is_archived = True
    db.add(repository)
    db.commit()
