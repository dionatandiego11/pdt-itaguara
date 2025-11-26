from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core import security
from app.core.database import get_db
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """Resolve o usuário autenticado a partir do token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = security.verify_token(token, token_type="access")
    if not payload:
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_exception

    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[User]:
    """Resolve o usuário autenticado, permitindo anônimo quando não há token."""
    if not token:
        return None
    try:
        return get_current_user(db=db, token=token)
    except HTTPException:
        return None


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Garante que o usuário autenticado está ativo."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Restringe o acesso a usuários superusuários (diretório/coordenação)."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges",
        )
    return current_user


def check_can_create_repository(user: User) -> bool:
    """Verifica se o usuário pode criar repositórios (apenas Filiados ou coordenação)."""
    if not user.is_affiliate and not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas filiados podem criar pastas temáticas do PDT Itaguara.",
        )
    return True


def check_can_view_repository(user: User, repository) -> bool:
    """Verifica se o usuário pode visualizar o repositório."""
    from app.models.repository import RepositoryVisibility
    
    if repository.visibility == RepositoryVisibility.PUBLIC:
        return True
        
    if repository.visibility == RepositoryVisibility.AFFILIATES_ONLY:
        if user and (user.is_affiliate or user.is_superuser):
            return True
            
    return False


def check_can_participate_repository(user: User, repository) -> bool:
    """
    Verifica se o usuário pode interagir (criar proposta/demanda) no repositório.
    - Repositórios público: requer usuário registrado.
    - Repositórios apenas filiados: requer filiado ou superusuário.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    if not repository or not repository.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found",
        )

    if not check_can_view_repository(user, repository):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar este repositório.",
        )

    from app.models.repository import RepositoryVisibility

    if repository.visibility == RepositoryVisibility.AFFILIATES_ONLY:
        if not (user.is_affiliate or user.is_superuser):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas filiados podem interagir com este repositório.",
            )

    if not user.is_registered:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas usuários registrados podem interagir com repositórios públicos.",
        )

    return True
