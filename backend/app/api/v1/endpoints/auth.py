from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings  # noqa: F401  (usado se precisar em breve)
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.user import User as UserModel, UserLevel
from app.schemas.auth import AuthResponse, Token, RefreshTokenRequest
from app.schemas.user import User as UserSchema, UserCreate

logger = get_logger("auth")
router = APIRouter()


def _build_auth_response(
    user: UserModel,
    access_token: str,
    refresh_token: str,
) -> AuthResponse:
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserSchema.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Endpoint de login com username e senha."""
    user = (
        db.query(UserModel)
        .filter(
            or_(
                UserModel.username == form_data.username,
                UserModel.email == form_data.username,
            )
        )
        .first()
    )

    if not user:
        logger.warning(
            "Login attempt failed - user not found: %s",
            form_data.username,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        logger.warning(
            "Login attempt failed - inactive user: %s",
            user.username,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    if not security.verify_password(form_data.password, user.hashed_password):
        logger.warning(
            "Login attempt failed - incorrect password: %s",
            user.username,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Atualizar último login
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Criar tokens
    access_token = security.create_access_token(data={"sub": str(user.id)})
    refresh_token = security.create_refresh_token(data={"sub": str(user.id)})

    logger.info("User logged in successfully: %s", user.username)

    return _build_auth_response(user, access_token, refresh_token)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(UserModel)
        .filter(
            or_(
                UserModel.username == payload.username,
                UserModel.email == payload.email,
            )
        )
        .first()
    )

    if existing_user:
        logger.warning(
            "Registration attempt failed - user already exists: %s",
            payload.username,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    hashed_password = security.hash_password(payload.password)
    user = UserModel(
        email=payload.email,
        username=payload.username,
        hashed_password=hashed_password,
        full_name=payload.full_name,
        level=UserLevel.REGISTERED,
        is_verified=False,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = security.create_access_token(data={"sub": str(user.id)})
    refresh_token = security.create_refresh_token(data={"sub": str(user.id)})

    logger.info("User registered successfully: %s", user.username)

    return _build_auth_response(user, access_token, refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Endpoint para refresh do token de acesso."""
    token_payload = security.verify_token(
        payload.refresh_token,
        token_type="refresh",
    )

    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(token_payload.get("sub"))
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Criar novo access token
    access_token = security.create_access_token(data={"sub": str(user.id)})

    logger.info("Token refreshed for user: %s", user.username)

    return {
        "access_token": access_token,
        "refresh_token": payload.refresh_token,  # Retorna o mesmo refresh token
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserSchema)
async def get_current_user(
    current_user: UserModel = Depends(deps.get_current_user),
):
    """Obtém informações do usuário autenticado."""
    return current_user


@router.post("/logout")
async def logout(
    current_user: UserModel = Depends(deps.get_current_user),
):
    """Endpoint de logout (invalida tokens no client)."""
    logger.info("User logged out: %s", current_user.username)
    return {"message": "Successfully logged out"}


@router.get("/callback")
async def gov_br_callback(
    code: str,
    state: Optional[str] = None,
    db: Session = Depends(get_db),  # noqa: ARG001 (usado futuramente)
):
    """Callback para autenticação Gov.br (OAuth2)."""
    # TODO: Implementar integração real com Gov.br
    # Por agora, retorna uma resposta mock
    return {
        "message": "Gov.br authentication callback",
        "code": code,
        "state": state,
        "note": "Integration with Gov.br OAuth2 pending implementation",
    }


# OAuth2 scheme legado para compatibilidade com referências antigas
oauth2_scheme = deps.oauth2_scheme
