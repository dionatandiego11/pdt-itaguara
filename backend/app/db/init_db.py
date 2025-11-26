#!/usr/bin/env python3
"""
Inicializa o banco do CivicGit com dados essenciais.
"""

import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.core.logging import get_logger
from app.core.security import hash_password
from app.models.repository import Repository, RepositoryType, RepositoryOwner, RepositoryVisibility
from app.models.user import User, UserLevel
from app.models.issue import Issue, IssuePriority, IssueStatus, IssueType

logger = get_logger("init_db")


def init_db():
    """Cria tabelas (se necessário) e popula dados básicos."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.create_all(bind=engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        admin_email = "coordenacao@pdtitaguara.org"
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                email=admin_email,
                username="admin",
                hashed_password=hash_password("admin123"),
                full_name="Coordenacao PDT Itaguara",
                level=UserLevel.SPECIAL,
                is_verified=True,  # compat: mapeia para filiado
                is_superuser=True,
            )
            db.add(admin)
            db.commit()
            logger.info("Default admin user created (admin/admin123)")
        elif admin.email != admin_email:
            admin.email = admin_email
            db.commit()
            logger.info("Default admin email updated to coordenacao@pdtitaguara.org")

        # Usuario filiado para testes
        filiado_user = db.query(User).filter(User.username == "filiado").first()
        if not filiado_user:
            filiado_user = User(
                email="filiado@pdtitaguara.org",
                username="filiado",
                hashed_password=hash_password("filiado123"),
                full_name="Filiado PDT Itaguara",
                level=UserLevel.FILIADO,
                is_verified=True,
                is_active=True,
            )
            db.add(filiado_user)
            db.commit()
            logger.info("Sample filiado user created (filiado/filiado123)")

        # Usuario registrado (simpatizante) para testes
        registrado_user = db.query(User).filter(User.username == "registrado").first()
        if not registrado_user:
            registrado_user = User(
                email="registrado@pdtitaguara.org",
                username="registrado",
                hashed_password=hash_password("registrado123"),
                full_name="Simpatizante PDT Itaguara",
                level=UserLevel.REGISTERED,
                is_verified=False,
                is_active=True,
            )
            db.add(registrado_user)
            db.commit()
            logger.info("Sample registered user created (registrado/registrado123)")

        # Repositório interno (apenas filiados)
        repo1 = db.query(Repository).filter(Repository.slug == "plano-partidario-itaguara").first()
        if not repo1:
            repo1 = Repository(
                name="Plano Partidario PDT Itaguara 2025-2028",
                slug="plano-partidario-itaguara",
                description="Agenda estrategica do PDT Itaguara para o ciclo 2025-2028.",
                type=RepositoryType.POLICY_AREA,
                jurisdiction_name="PDT Itaguara",
                jurisdiction_type="Municipal",
                visibility=RepositoryVisibility.AFFILIATES_ONLY,
                allow_public_proposals=False,
                allow_public_voting=False,
                require_verification_for_voting=True,
            )
            repo1.owner_record = RepositoryOwner(user_id=admin.id)
            db.add(repo1)
        elif not repo1.owner_record:
            repo1.owner_record = RepositoryOwner(user_id=admin.id)

        # Repositório público para participação popular
        repo2 = db.query(Repository).filter(Repository.slug == "pauta-publica-itaguara").first()
        if not repo2:
            repo2 = Repository(
                name="Pauta Pública PDT Itaguara",
                slug="pauta-publica-itaguara",
                description="Espaco publico para propostas e demandas da comunidade de Itaguara.",
                type=RepositoryType.JURISDICTION,
                jurisdiction_name="PDT Itaguara",
                jurisdiction_type="Municipal",
                visibility=RepositoryVisibility.PUBLIC,
                allow_public_proposals=True,
                allow_public_voting=True,
                require_verification_for_voting=False,
            )
            repo2.owner_record = RepositoryOwner(user_id=admin.id)
            db.add(repo2)
        elif not repo2.owner_record:
            repo2.owner_record = RepositoryOwner(user_id=admin.id)

        db.commit()

        # Garantir exemplos de demandas
        def ensure_issue(slug: str, repository: Repository, number: int, **kwargs):
            issue = db.query(Issue).filter(Issue.slug == slug).first()
            if issue:
                return
            issue = Issue(
                slug=slug,
                number=number,
                repository_id=repository.id,
                author_id=admin.id,
                **kwargs,
            )
            db.add(issue)
            repository.issues_count = (repository.issues_count or 0) + 1

        if repo1:
            ensure_issue(
                slug="formacao-de-nucleos",
                repository=repo1,
                number=1,
                title="Formacao de nucleos de base",
                description="Organizar nucleos por bairro para fortalecer a atuacao do PDT Itaguara.",
                priority=IssuePriority.MEDIUM,
                status=IssueStatus.OPEN,
                type=IssueType.IMPROVEMENT,
                tags="organizacao,filiados",
            )

        if repo2:
            ensure_issue(
                slug="pavimentacao-bairro-industrial",
                repository=repo2,
                number=1,
                title="Pavimentação no Bairro Industrial",
                description="Moradores solicitam priorização da pavimentação das ruas principais.",
                priority=IssuePriority.HIGH,
                status=IssueStatus.OPEN,
                type=IssueType.INFRASTRUCTURE,
                tags="pavimentacao,infraestrutura",
            )

        db.commit()
        db.close()
        logger.info("Example repositories ensured")
    except Exception as exc:
        logger.error(f"Error initializing database: {exc}")
        raise


def drop_db():
    """Remove todas as tabelas do banco."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as exc:
        logger.error(f"Error dropping database: {exc}")
        raise


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "init":
            init_db()
        elif sys.argv[1] == "drop":
            drop_db()
        elif sys.argv[1] == "reset":
            drop_db()
            init_db()
        else:
            print("Usage: python init_db.py [init|drop|reset]")
    else:
        init_db()
