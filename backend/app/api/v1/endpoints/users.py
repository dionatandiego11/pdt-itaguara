from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.api import deps
from app.core.database import get_db
from app.core.logging import get_logger
from app.schemas.user import User as UserSchema, UserUpdate, UserAdminUpdate, UserCreate
from app.models.user import User as UserModel

router = APIRouter()
logger = get_logger("users")

# Password hashing context - reusing from elsewhere or creating new
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/", response_model=List[UserSchema])
def list_users(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_superuser),
):
    """Lista todos os usuários (apenas administradores)."""
    return db.query(UserModel).order_by(UserModel.created_at.desc()).all()


@router.get("/me", response_model=UserSchema)
def get_current_profile(
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Retorna o perfil do usuário autenticado."""
    return current_user


@router.put("/me", response_model=UserSchema)
def update_current_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Atualiza dados básicos do perfil."""
    updated = False

    for field in ["full_name", "bio", "location", "website"]:
        value = getattr(payload, field)
        if value is not None:
            setattr(current_user, field, value)
            updated = True

    if updated:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        logger.info("Perfil atualizado para o usuário %s", current_user.username)

    return current_user


@router.put("/{user_id}", response_model=UserSchema)
def update_user_admin(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_superuser),
):
    """Permite atualização de dados sensíveis (administradores)."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    try:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Perfil administrativo atualizado para o usuário %s", user.username)
        return user
    except Exception as e:
        db.rollback()
        logger.error("Erro ao atualizar usuário %s: %s", user.username, str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating user: {str(e)}",
        )


@router.post("/", response_model=UserSchema)
def create_user_admin(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_superuser),
):
    """Cria um novo usuário (apenas administradores)."""
    # Check for duplicate username
    if db.query(UserModel).filter(UserModel.username == payload.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Check for duplicate email
    if db.query(UserModel).filter(UserModel.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    hashed_password = pwd_context.hash(payload.password)
    new_user = UserModel(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed_password,
        full_name=payload.full_name or payload.username,
        is_active=True,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("Novo usuário criado pelo admin: %s", payload.username)
    return new_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_superuser),
):
    """Deleta um usuário (apenas administradores)."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    db.delete(user)
    db.commit()
    logger.info("Usuário deletado pelo admin: %s", user.username)
