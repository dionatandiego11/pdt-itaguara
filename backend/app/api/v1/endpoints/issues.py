from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.issue import Issue as IssueModel, IssuePriority, IssueStatus, IssueType
from app.models.repository import Repository as RepositoryModel, RepositoryVisibility
from app.schemas.issue import Issue as IssueSchema, IssueCreate, IssueUpdate
from app.models.user import User as UserModel

router = APIRouter()
logger = get_logger("issues")


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
    return normalized or "issue"


def _next_issue_number(repository_id: int, db: Session) -> int:
    last_number = (
        db.query(func.max(IssueModel.number))
        .filter(IssueModel.repository_id == repository_id)
        .scalar()
    )
    return (last_number or 0) + 1


def _parse_enum(enum_cls, value):
    if value is None:
        return None
    if isinstance(value, enum_cls):
        return value
    try:
        return enum_cls(value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {enum_cls.__name__} value",
        ) from None


@router.get("/", response_model=List[IssueSchema])
def list_issues(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    repository_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(deps.get_current_user_optional),
):
    """Lista demandas respeitando visibilidade dos repositórios."""
    query = db.query(IssueModel).join(
        RepositoryModel, IssueModel.repository_id == RepositoryModel.id
    )

    status_enum = _parse_enum(IssueStatus, status)
    priority_enum = _parse_enum(IssuePriority, priority)

    if status_enum:
        query = query.filter(IssueModel.status == status_enum)
    if priority_enum:
        query = query.filter(IssueModel.priority == priority_enum)
    if repository_id:
        query = query.filter(IssueModel.repository_id == repository_id)
    if search:
        ilike_value = f"%{search}%"
        query = query.filter(
            or_(
                IssueModel.title.ilike(ilike_value),
                IssueModel.description.ilike(ilike_value),
            )
        )

    if not current_user or (not current_user.is_affiliate and not current_user.is_superuser):
        query = query.filter(RepositoryModel.visibility == RepositoryVisibility.PUBLIC)

    issues = query.order_by(IssueModel.created_at.desc()).all()
    return issues


@router.get("/{issue_id}", response_model=IssueSchema)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(deps.get_current_user_optional),
):
    issue = db.query(IssueModel).filter(IssueModel.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    repository = db.query(RepositoryModel).filter(RepositoryModel.id == issue.repository_id).first()
    if not repository or not deps.check_can_view_repository(current_user, repository):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para visualizar esta demanda.",
        )
    return issue


@router.post("/", response_model=IssueSchema, status_code=status.HTTP_201_CREATED)
def create_issue(
    payload: IssueCreate,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    repository = (
        db.query(RepositoryModel)
        .filter(RepositoryModel.id == payload.repository_id, RepositoryModel.is_active.is_(True))
        .first()
    )
    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    deps.check_can_participate_repository(current_user, repository)

    issue_type = _parse_enum(IssueType, payload.type) or IssueType.BUG
    issue_priority = _parse_enum(IssuePriority, payload.priority) or IssuePriority.MEDIUM
    issue_status = _parse_enum(IssueStatus, payload.status) or IssueStatus.OPEN

    issue_number = _next_issue_number(repository.id, db)
    slug = _slugify(f"{repository.slug}-{issue_number}-{payload.title}")

    issue = IssueModel(
        number=issue_number,
        slug=slug,
        title=payload.title,
        description=payload.description,
        type=issue_type or IssueType.BUG,
        priority=issue_priority or IssuePriority.MEDIUM,
        status=issue_status,
        repository_id=repository.id,
        author_id=current_user.id,
        location=payload.location,
        estimated_cost=payload.estimated_cost,
        budget_category=payload.budget_category,
        tags=",".join(payload.tags) if payload.tags else None,
    )

    db.add(issue)
    repository.issues_count = (repository.issues_count or 0) + 1
    db.commit()
    db.refresh(issue)

    logger.info(
        "Issue '%s' criada no repositório %s por %s",
        issue.slug,
        repository.slug,
        current_user.username,
    )

    return issue


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    """Remove uma demanda."""
    issue = db.query(IssueModel).filter(IssueModel.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found",
        )

    repository = db.query(RepositoryModel).filter(RepositoryModel.id == issue.repository_id).first()
    if not repository or not deps.check_can_view_repository(current_user, repository):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir esta demanda.",
        )

    if issue.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this issue",
        )

    db.delete(issue)
    if repository and repository.issues_count and repository.issues_count > 0:
        repository.issues_count -= 1
        db.add(repository)
    db.commit()


@router.put("/{issue_id}", response_model=IssueSchema)
def update_issue(
    issue_id: int,
    payload: IssueUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_active_user),
):
    issue = db.query(IssueModel).filter(IssueModel.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    repository = db.query(RepositoryModel).filter(RepositoryModel.id == issue.repository_id).first()
    if not repository:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found for this issue")

    deps.check_can_participate_repository(current_user, repository)

    if issue.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this issue",
        )

    data = payload.model_dump(exclude_unset=True)
    tags = data.pop("tags", None)

    for field, value in data.items():
        setattr(issue, field, value)

    if tags is not None:
        issue.tags = ",".join(tags)

    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue
